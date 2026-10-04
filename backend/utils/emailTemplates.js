// backend/utils/emailTemplates.js

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Common HTML Email Wrapper with Prime Dispatcher Branding
 */
const wrapInEmailLayout = ({ title, preheader, content }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: 0 !important; }
      .mobile-stack { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .mobile-space { padding-bottom: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9;">
  <!-- Preheader Text for Email Inboxes -->
  <span style="display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">
    ${preheader || title}
  </span>

  <center>
    <table class="email-container" role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0;">
      
      <!-- Brand Header Bar -->
      <tr>
        <td style="background-color: #0f172a; padding: 24px 32px; border-bottom: 3px solid #0d9488;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-decoration: none;">
                  PRIME <span style="color: #0d9488;">DISPATCHER</span>
                </div>
                <div style="font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 3px; letter-spacing: 0.5px; text-transform: uppercase;">
                  Enterprise Logistics & Real-Time Telemetry
                </div>
              </td>
              <td align="right" style="vertical-align: middle;">
                <span style="display: inline-block; background-color: rgba(13, 148, 136, 0.15); border: 1px solid #0d9488; color: #5eead4; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Live Telemetry Active
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Main Body Content -->
      <tr>
        <td style="padding: 32px; background-color: #ffffff;">
          ${content}
        </td>
      </tr>

      <!-- PDF Invoice Notice -->
      <tr>
        <td style="padding: 0 32px 24px 32px; background-color: #ffffff;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0d9488; border-radius: 8px; padding: 14px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="28" style="vertical-align: middle;">
                  <span style="font-size: 18px;">📎</span>
                </td>
                <td style="vertical-align: middle;">
                  <span style="font-size: 12px; font-weight: 700; color: #0f172a; display: block;">Official Tax Invoice & Waybill Attached</span>
                  <span style="font-size: 11px; color: #64748b; line-height: 1.4;">A computer-generated PDF tax invoice is attached with full GSTIN breakdown and waybill manifest.</span>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>

      <!-- Official Footer -->
      <tr>
        <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align: center; padding-bottom: 12px;">
                <a href="${FRONTEND_URL}" style="color: #0d9488; font-size: 12px; font-weight: 600; text-decoration: none; margin: 0 10px;">Portal Home</a>
                <span style="color: #cbd5e1;">•</span>
                <a href="${FRONTEND_URL}/track-package" style="color: #0d9488; font-size: 12px; font-weight: 600; text-decoration: none; margin: 0 10px;">Live Tracking</a>
                <span style="color: #cbd5e1;">•</span>
                <a href="${FRONTEND_URL}/my-shipments" style="color: #0d9488; font-size: 12px; font-weight: 600; text-decoration: none; margin: 0 10px;">My Consignments</a>
              </td>
            </tr>
            <tr>
              <td style="font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
                <strong>Prime Dispatcher Logistics Ltd.</strong><br>
                BKC Express Cargo Hub, Bandra Kurla Complex, Mumbai, MH 400051<br>
                CIN: U63090MH2024PTC189201 | GSTIN: 27AABCP8921M1Z5<br>
                24/7 Dispatch Hotline: <a href="tel:+919876543210" style="color: #0f172a; font-weight: 600; text-decoration: none;">+91 98765 43210</a> | Email: <a href="mailto:support@primedispatcher.com" style="color: #0f172a; font-weight: 600; text-decoration: none;">support@primedispatcher.com</a>
              </td>
            </tr>
            <tr>
              <td style="font-size: 10px; color: #94a3b8; padding-top: 12px; text-align: center;">
                This is an automated dispatch notification sent to registered consignment parties. © ${new Date().getFullYear()} Prime Dispatcher. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>
  `;
};

/**
 * 1. Shipment Created - Sender Email Template
 */
export const getShipmentCreatedSenderEmail = ({
  trackingId,
  senderName,
  receiverName,
  origin,
  destination,
  packageDetails,
  paymentMethod,
  shippingCost,
}) => {
  const trackingUrl = `${FRONTEND_URL}/track-package?trackingId=${encodeURIComponent(trackingId)}`;
  const isCOD = String(paymentMethod).toUpperCase() === 'COD';

  const content = `
    <!-- Greeting & Status -->
    <div style="margin-bottom: 20px;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #0d9488; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
        Pickup Scheduled
      </span>
      <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; line-height: 1.25;">
        Booking Confirmed, ${senderName}!
      </h1>
      <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.5;">
        Your consignment has been successfully logged into our logistics network and allocated for doorstep pickup.
      </p>
    </div>

    <!-- Waybill / Tracking ID Box -->
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 6px;">
        Your Consignment Tracking ID
      </span>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 800; color: #0d9488; letter-spacing: 2px;">
        ${trackingId}
      </div>
      <div style="margin-top: 14px;">
        <a href="${trackingUrl}" style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 11px 24px; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 6px; box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);">
          Track Shipment Live →
        </a>
      </div>
    </div>

    <!-- Route Matrix -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td class="mobile-stack mobile-space" width="48%" style="vertical-align: top; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
          <span style="font-size: 10px; font-weight: 800; color: #0d9488; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
            ● Pickup (Origin)
          </span>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
            ${senderName}
          </div>
          <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
            ${origin}
          </div>
        </td>
        <td width="4%" class="mobile-stack">&nbsp;</td>
        <td class="mobile-stack" width="48%" style="vertical-align: top; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
          <span style="font-size: 10px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
            ■ Delivery (Destination)
          </span>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
            ${receiverName}
          </div>
          <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
            ${destination}
          </div>
        </td>
      </tr>
    </table>

    <!-- Consignment & Financial Manifest -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
      <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <th style="padding: 10px 14px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Manifest Specification</th>
        <th style="padding: 10px 14px; text-align: right; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Details</th>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 9px 14px; font-size: 12px; color: #475569;">Service Tier</td>
        <td style="padding: 9px 14px; font-size: 12px; font-weight: 700; color: #0f172a; text-align: right; text-transform: capitalize;">${packageDetails.type || 'Standard'} Mode</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 9px 14px; font-size: 12px; color: #475569;">Billable Consignment Weight</td>
        <td style="padding: 9px 14px; font-size: 12px; font-weight: 700; color: #0f172a; text-align: right;">${packageDetails.weight || 1} kg</td>
      </tr>
      ${packageDetails.description ? `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 9px 14px; font-size: 12px; color: #475569;">Declared Goods</td>
        <td style="padding: 9px 14px; font-size: 12px; font-weight: 500; color: #64748b; text-align: right; font-style: italic;">"${packageDetails.description}"</td>
      </tr>
      ` : ''}
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 9px 14px; font-size: 12px; color: #475569;">Payment Method</td>
        <td style="padding: 9px 14px; font-size: 12px; font-weight: 700; color: ${isCOD ? '#d97706' : '#0d9488'}; text-align: right;">
          ${isCOD ? 'Cash / UPI on Delivery (COD)' : 'Paid Online (Verified)'}
        </td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 12px 14px; font-size: 13px; font-weight: 800; color: #0f172a;">Total Invoice Value</td>
        <td style="padding: 12px 14px; font-size: 16px; font-weight: 800; color: #0d9488; text-align: right;">₹${shippingCost}</td>
      </tr>
    </table>

    <div style="font-size: 12px; color: #64748b; line-height: 1.5;">
      Our pickup courier agent will reach your premises within the scheduled time slot. Please have your package packaged securely and ready with the waybill number noted.
    </div>
  `;

  return wrapInEmailLayout({
    title: `Shipment Confirmed - Waybill #${trackingId}`,
    preheader: `Your shipment to ${receiverName} is confirmed. Tracking ID: ${trackingId}`,
    content,
  });
};

/**
 * 2. Shipment Created - Receiver Email Template
 */
export const getShipmentCreatedReceiverEmail = ({
  trackingId,
  senderName,
  receiverName,
  origin,
  destination,
  packageDetails,
  paymentMethod,
  shippingCost,
}) => {
  const trackingUrl = `${FRONTEND_URL}/track-package?trackingId=${encodeURIComponent(trackingId)}`;
  const isCOD = String(paymentMethod).toUpperCase() === 'COD';

  const content = `
    <!-- Greeting & Status -->
    <div style="margin-bottom: 20px;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #0d9488; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
        Incoming Delivery Alert
      </span>
      <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; line-height: 1.25;">
        A Consignment is on its Way, ${receiverName}!
      </h1>
      <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.5;">
        A package from <strong>${senderName}</strong> has been booked and scheduled for delivery to your address.
      </p>
    </div>

    <!-- Waybill / Tracking ID Box -->
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 6px;">
        Live Tracking Code
      </span>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 800; color: #0d9488; letter-spacing: 2px;">
        ${trackingId}
      </div>
      <div style="margin-top: 14px;">
        <a href="${trackingUrl}" style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 11px 24px; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 6px; box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);">
          Track Delivery Status →
        </a>
      </div>
    </div>

    <!-- Route Matrix -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td class="mobile-stack mobile-space" width="48%" style="vertical-align: top; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
          <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
            Sent From
          </span>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
            ${senderName}
          </div>
          <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
            ${origin}
          </div>
        </td>
        <td width="4%" class="mobile-stack">&nbsp;</td>
        <td class="mobile-stack" width="48%" style="vertical-align: top; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
          <span style="font-size: 10px; font-weight: 800; color: #0d9488; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
            Delivering To You
          </span>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
            ${receiverName}
          </div>
          <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
            ${destination}
          </div>
        </td>
      </tr>
    </table>

    <!-- Notice for COD if applicable -->
    ${isCOD ? `
    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
      <strong style="color: #b45309; font-size: 12px; display: block; margin-bottom: 2px;">💵 Cash / UPI on Delivery Notice:</strong>
      <span style="font-size: 12px; color: #92400e;">An amount of <strong>₹${shippingCost}</strong> is due upon parcel delivery. You can pay via Cash or scan the delivery agent's UPI QR code.</span>
    </div>
    ` : `
    <div style="background-color: #f0fdf4; border: 1px solid #dcfce7; border-left: 4px solid #10b981; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
      <strong style="color: #15803d; font-size: 12px; display: block; margin-bottom: 2px;">✓ Prepaid Consignment:</strong>
      <span style="font-size: 12px; color: #166534;">This parcel has been prepaid online. Zero payment is required at the time of delivery.</span>
    </div>
    `}
  `;

  return wrapInEmailLayout({
    title: `Incoming Delivery - Tracking ID: ${trackingId}`,
    preheader: `A parcel from ${senderName} is scheduled to arrive at your address. Tracking ID: ${trackingId}`,
    content,
  });
};

/**
 * 3. Status Update Email Template
 */
export const getShipmentStatusUpdateEmail = ({
  trackingId,
  recipientName,
  oldStatus,
  status,
  oldLocation,
  currentLocation,
}) => {
  const trackingUrl = `${FRONTEND_URL}/track-package?trackingId=${encodeURIComponent(trackingId)}`;

  const content = `
    <!-- Header -->
    <div style="margin-bottom: 20px;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #0d9488; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
        Dispatch Telemetry Update
      </span>
      <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; line-height: 1.25;">
        Milestone Recorded for #${trackingId}
      </h1>
      <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.5;">
        Hello ${recipientName || 'Valued Customer'}, your consignment status has been updated by our logistics hub.
      </p>
    </div>

    <!-- Status Highlight Box -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block;">Current Consignment Status</span>
            <span style="font-size: 18px; font-weight: 800; color: #0d9488; display: block; margin-top: 2px;">
              ${status || 'In Transit'}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 12px;">
            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block;">Current Physical Location / Hub</span>
            <span style="font-size: 14px; font-weight: 700; color: #0f172a; display: block; margin-top: 2px;">
              📍 ${currentLocation || 'In Transit Corridor'}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${trackingUrl}" style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 6px; box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);">
        View Detailed Checkpoint Timeline →
      </a>
    </div>
  `;

  return wrapInEmailLayout({
    title: `Status Update: ${status} - Tracking #${trackingId}`,
    preheader: `Consignment #${trackingId} status updated to: ${status}`,
    content,
  });
};
