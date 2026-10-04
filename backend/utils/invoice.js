// backend/utils/invoice.js
import PDFDocument from 'pdfkit';

/**
 * Convert integer to words (Indian numbering system)
 */
const numberToWords = (num) => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.round(Number(num) || 0);
  if (n === 0) return 'Zero';

  const convert = (val) => {
    if (val < 20) return a[val];
    if (val < 100) return b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : '');
    if (val < 1000) return a[Math.floor(val / 100)] + ' Hundred' + (val % 100 !== 0 ? ' ' + convert(val % 100) : '');
    if (val < 100000) return convert(Math.floor(val / 1000)) + ' Thousand' + (val % 1000 !== 0 ? ' ' + convert(val % 1000) : '');
    if (val < 10000000) return convert(Math.floor(val / 100000)) + ' Lakh' + (val % 100000 !== 0 ? ' ' + convert(val % 100000) : '');
    return convert(Math.floor(val / 10000000)) + ' Crore' + (val % 10000000 !== 0 ? ' ' + convert(val % 10000000) : '');
  };

  return convert(n);
};

/**
 * Generate an official PDF Tax Invoice & Consignment Waybill
 * @param {Object} data Shipment and consignment data
 * @returns {Promise<Buffer>}
 */
export const generateInvoicePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 36,
        info: {
          Title: `Tax Invoice - ${data.trackingId || 'Consignment'}`,
          Author: 'Prime Dispatcher Logistics Ltd.',
          Subject: 'Tax Invoice & Door-to-Door Waybill',
          Keywords: 'invoice, waybill, prime dispatcher, logistics, shipping',
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const trackingId = data.trackingId || 'TRK-DEL-89210';
      const sender = data.sender || {};
      const receiver = data.receiver || {};
      const origin = data.origin || '';
      const destination = data.destination || '';
      const packageDetails = data.packageDetails || { type: 'standard', weight: 1 };
      const paymentMethod = (data.payment?.method || data.paymentMethod || 'COD').toUpperCase();
      const isCOD = paymentMethod === 'COD';
      
      const totalAmount = Math.round(Number(data.shippingCost || data.totalAmount || 49));
      // Base breakdown: Insurance is 20, GST is 18% included in total
      // Gross Total = Net + GST => Net = Total / 1.18
      const taxableValue = (totalAmount / 1.18).toFixed(2);
      const totalGst = (totalAmount - Number(taxableValue)).toFixed(2);
      const cgst = (Number(totalGst) / 2).toFixed(2);
      const sgst = (Number(totalGst) / 2).toFixed(2);
      const insuranceFee = 20.00;
      const baseFreight = Math.max(0, (Number(taxableValue) - insuranceFee)).toFixed(2);

      const invoiceNo = `INV-${new Date().getFullYear()}-${trackingId.replace(/\D/g, '').slice(-6) || '89210'}`;
      const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

      // ==========================================
      // 1. BRAND HEADER & INVOICE TITLE
      // ==========================================
      doc.rect(36, 36, 523, 76).fill('#0f172a');

      // Brand Title
      doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('PRIME ', 52, 50, { continued: true });
      doc.fillColor('#0d9488').text('DISPATCHER');

      doc.fillColor('#94a3b8').fontSize(8.5).font('Helvetica').text('GLOBAL EXPRESS & CARGO LOGISTICS NETWORK', 52, 74);
      doc.fillColor('#64748b').fontSize(7.5).text('BKC Express Cargo Hub, Bandra Kurla Complex, Mumbai, MH 400051 | GSTIN: 27AABCP8921M1Z5', 52, 88);

      // Invoice Tag in Header (Right Side)
      doc.rect(400, 48, 145, 52).fill('#1e293b');
      doc.fillColor('#5eead4').fontSize(8).font('Helvetica-Bold').text('TAX INVOICE / WAYBILL', 400, 56, { align: 'center', width: 145 });
      doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text(invoiceNo, 400, 70, { align: 'center', width: 145 });
      doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica').text(`Date: ${issueDate}`, 400, 86, { align: 'center', width: 145 });

      // ==========================================
      // 2. CONSIGNMENT KEY REFERENCE BAR
      // ==========================================
      const refY = 120;
      doc.rect(36, refY, 523, 40).fill('#f0fdfa').stroke('#99f6e4');

      doc.fillColor('#0f766e').fontSize(7.5).font('Helvetica-Bold').text('CONSIGNMENT WAYBILL NUMBER:', 48, refY + 8);
      doc.fillColor('#0f172a').fontSize(13).font('Courier-Bold').text(trackingId, 48, refY + 20);

      doc.fillColor('#0f766e').fontSize(7.5).font('Helvetica-Bold').text('PAYMENT STATUS:', 260, refY + 8);
      doc.fillColor(isCOD ? '#d97706' : '#0d9488').fontSize(10).font('Helvetica-Bold')
         .text(isCOD ? `COD - Pay at Doorstep: ₹${totalAmount}` : `Paid Online (Verified): ₹${totalAmount}`, 260, refY + 22);

      doc.fillColor('#0f766e').fontSize(7.5).font('Helvetica-Bold').text('SERVICE MODE:', 430, refY + 8);
      doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text((packageDetails.type || 'Standard').toUpperCase(), 430, refY + 22);

      // ==========================================
      // 3. SENDER (CONSIGNOR) & RECEIVER (CONSIGNEE)
      // ==========================================
      const partiesY = 170;
      const boxWidth = 256;
      const boxHeight = 100;

      // Sender Box (Billed From / Pickup)
      doc.rect(36, partiesY, boxWidth, boxHeight).fill('#ffffff').stroke('#cbd5e1');
      doc.rect(36, partiesY, boxWidth, 18).fill('#f8fafc').stroke('#cbd5e1');
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text('CONSIGNOR (PICKUP ORIGIN)', 44, partiesY + 5);

      doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(sender.name || 'Sender', 44, partiesY + 24);
      doc.fillColor('#475569').fontSize(8).font('Helvetica').text(`Phone: ${sender.phone || 'N/A'}`, 44, partiesY + 36);
      if (sender.email) doc.text(`Email: ${sender.email}`, 44, partiesY + 47);
      doc.fillColor('#64748b').fontSize(7.5).text(`Address: ${origin || 'Pickup Address'}`, 44, partiesY + 59, { width: boxWidth - 16, height: 35, ellipsis: true });

      // Receiver Box (Ship To / Destination)
      doc.rect(303, partiesY, boxWidth, boxHeight).fill('#ffffff').stroke('#cbd5e1');
      doc.rect(303, partiesY, boxWidth, 18).fill('#f8fafc').stroke('#cbd5e1');
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text('CONSIGNEE (DELIVERY DESTINATION)', 311, partiesY + 5);

      doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(receiver.name || 'Recipient', 311, partiesY + 24);
      doc.fillColor('#475569').fontSize(8).font('Helvetica').text(`Phone: ${receiver.phone || 'N/A'}`, 311, partiesY + 36);
      if (receiver.email) doc.text(`Email: ${receiver.email}`, 311, partiesY + 47);
      doc.fillColor('#64748b').fontSize(7.5).text(`Address: ${destination || 'Delivery Address'}`, 311, partiesY + 59, { width: boxWidth - 16, height: 35, ellipsis: true });

      // ==========================================
      // 4. ITEM & SERVICE CHARGES TABLE
      // ==========================================
      const tableY = 280;
      doc.rect(36, tableY, 523, 22).fill('#0f172a');

      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('S.No', 44, tableY + 7);
      doc.text('Description of Service / Consignment', 76, tableY + 7);
      doc.text('HSN / SAC', 290, tableY + 7);
      doc.text('Weight', 360, tableY + 7);
      doc.text('Taxable Rate', 430, tableY + 7);
      doc.text('Amount (INR)', 490, tableY + 7, { align: 'right', width: 60 });

      // Table Row 1: Freight
      const row1Y = tableY + 22;
      doc.rect(36, row1Y, 523, 28).fill('#ffffff').stroke('#e2e8f0');
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica');
      doc.text('01', 44, row1Y + 9);
      doc.font('Helvetica-Bold').text(`Doorstep Courier Freight (${packageDetails.type || 'Standard'} Mode)`, 76, row1Y + 5);
      doc.font('Helvetica').fontSize(7.5).fillColor('#64748b').text(packageDetails.description ? `Declared: "${packageDetails.description}"` : 'General Doorstep Consignment', 76, row1Y + 16);
      doc.fillColor('#0f172a').fontSize(8).text('996812', 290, row1Y + 9);
      doc.text(`${packageDetails.weight || 1} kg`, 360, row1Y + 9);
      doc.text(`₹${baseFreight}`, 430, row1Y + 9);
      doc.text(`₹${baseFreight}`, 490, row1Y + 9, { align: 'right', width: 60 });

      // Table Row 2: Handling & Insurance
      const row2Y = row1Y + 28;
      doc.rect(36, row2Y, 523, 24).fill('#f8fafc').stroke('#e2e8f0');
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica');
      doc.text('02', 44, row2Y + 8);
      doc.text('Handling & Tamper-Proof Insurance Cover', 76, row2Y + 8);
      doc.text('996812', 290, row2Y + 8);
      doc.text('1 Box', 360, row2Y + 8);
      doc.text(`₹${insuranceFee.toFixed(2)}`, 430, row2Y + 8);
      doc.text(`₹${insuranceFee.toFixed(2)}`, 490, row2Y + 8, { align: 'right', width: 60 });

      // ==========================================
      // 5. TAX BREAKDOWN & TOTALS (RIGHT SIDE)
      // ==========================================
      const totalsY = row2Y + 32;

      // Left Box: Amount in words & Bank/Legal Notice
      doc.rect(36, totalsY, 300, 96).fill('#f8fafc').stroke('#cbd5e1');
      doc.fillColor('#0f172a').fontSize(7.5).font('Helvetica-Bold').text('TOTAL INVOICE AMOUNT IN WORDS:', 44, totalsY + 8);
      doc.fillColor('#0d9488').fontSize(9).font('Helvetica-Bold').text(`Indian Rupees ${numberToWords(totalAmount)} Only`, 44, totalsY + 20, { width: 280 });

      doc.fillColor('#475569').fontSize(7.5).font('Helvetica').text('Declaration:', 44, totalsY + 46);
      doc.fillColor('#64748b').fontSize(7).text('We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct under Section 31 of CGST Act, 2017.', 44, totalsY + 58, { width: 280, lineGap: 1 });

      // Right Box: Financial Totals Table
      const summaryBoxX = 346;
      const summaryBoxWidth = 213;
      doc.rect(summaryBoxX, totalsY, summaryBoxWidth, 96).fill('#ffffff').stroke('#cbd5e1');

      let curY = totalsY + 8;
      const renderSummaryRow = (label, val, isBold = false, isHighlight = false) => {
        doc.fillColor(isHighlight ? '#0d9488' : isBold ? '#0f172a' : '#475569')
           .fontSize(isHighlight ? 10 : 8)
           .font(isBold || isHighlight ? 'Helvetica-Bold' : 'Helvetica')
           .text(label, summaryBoxX + 10, curY);
        doc.text(val, summaryBoxX + summaryBoxWidth - 70, curY, { align: 'right', width: 60 });
        curY += (isHighlight ? 18 : 14);
      };

      renderSummaryRow('Taxable Value:', `₹${taxableValue}`);
      renderSummaryRow('CGST (9.0%):', `₹${cgst}`);
      renderSummaryRow('SGST (9.0%):', `₹${sgst}`);
      doc.moveTo(summaryBoxX + 10, curY - 2).lineTo(summaryBoxX + summaryBoxWidth - 10, curY - 2).stroke('#cbd5e1');
      curY += 2;
      renderSummaryRow('TOTAL AMOUNT:', `₹${totalAmount}`, true, true);

      // ==========================================
      // 6. DISPATCH STAMP & SIGNATURE SECTION
      // ==========================================
      const signY = totalsY + 108;

      // Barcode simulation
      doc.rect(36, signY, 260, 48).fill('#f8fafc').stroke('#e2e8f0');
      doc.fillColor('#0f172a').fontSize(7).font('Helvetica-Bold').text('AUTOMATED WAYBILL SATELLITE BARCODE', 44, signY + 6);

      // Render barcode lines
      const bcX = 44;
      const bcY = signY + 18;
      const pattern = [2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 2, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 4, 1, 2, 3, 1];
      let offset = 0;
      pattern.forEach((w, i) => {
        if (i % 2 === 0) {
          doc.rect(bcX + offset, bcY, w, 16).fill('#0f172a');
        }
        offset += w + 1;
      });
      doc.fillColor('#64748b').fontSize(7).font('Courier').text(trackingId, bcX, bcY + 19);

      // Authorized Signatory
      doc.rect(346, signY, summaryBoxWidth, 48).fill('#f8fafc').stroke('#e2e8f0');
      doc.fillColor('#0f172a').fontSize(7.5).font('Helvetica-Bold').text('For PRIME DISPATCHER LOGISTICS LTD.', 354, signY + 6);
      doc.fillColor('#0d9488').fontSize(8).font('Helvetica-Bold').text('✓ DIGITALLY AUTHENTICATED', 354, signY + 22);
      doc.fillColor('#64748b').fontSize(7).font('Helvetica').text('Authorized Dispatch Signatory', 354, signY + 34);

      // ==========================================
      // 7. FOOTER TERMS
      // ==========================================
      const footerY = signY + 56;
      doc.moveTo(36, footerY).lineTo(559, footerY).stroke('#cbd5e1');

      doc.fillColor('#94a3b8').fontSize(6.5).font('Helvetica').text(
        'Terms & Conditions: 1. Subject to Mumbai Jurisdiction. 2. Transit liability is limited to Prime Dispatcher standard freight insurance conditions. 3. Inspect parcel upon delivery. Any damage or discrepancy must be reported within 48 hours via support@primedispatcher.com or 24/7 hotline +91 98765 43210.',
        36,
        footerY + 6,
        { width: 523, align: 'center', lineGap: 1.5 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
