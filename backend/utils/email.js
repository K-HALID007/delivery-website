// backend/utils/email.js
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

// Create email transporter using .env settings
const createTransporter = async () => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ SMTP credentials not configured in .env file");
      return null;
    }
    
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    console.log("📧 Creating email transporter with config:");
    console.log(`📧 Host: ${smtpConfig.host}:${smtpConfig.port}`);
    console.log(`📧 User: ${smtpConfig.auth.user}`);

    const transporter = nodemailer.createTransport(smtpConfig);
    
    // Verify the configuration
    await transporter.verify();
    console.log("✅ Email transporter created and verified successfully");
    
    return transporter;
  } catch (error) {
    console.error("❌ Failed to create email transporter:", error.message);
    console.error("❌ Full error:", error);
    return null;
  }
};

// Cache the transporter to avoid recreating it every time
let cachedTransporter = null;

const getTransporter = async () => {
  if (!cachedTransporter) {
    cachedTransporter = await createTransporter();
  }
  return cachedTransporter;
};

// Send Email
export const sendDeliveryEmail = async (to, subject, html, attachments = []) => {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    
    const transporter = await getTransporter();
    if (!transporter) {
      console.warn("⚠️ Email not sent - transporter not configured");
      return { success: false, error: "Email transporter not configured" };
    }

    const fromEmail = process.env.SMTP_USER;
    const siteName = 'Prime Dispatcher';

    console.log(`📧 Sending from: ${fromEmail}`);

    const mailOptions = {
      from: `"${siteName}" <${fromEmail}>`,
      to,
      subject,
      html,
    };

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Sent to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:");
    console.error("❌ Error message:", error.message);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error response:", error.response);
    console.error("❌ Full error:", error);
    
    return { success: false, error: error.message };
  }
};

// Send SMS (simplified)
export const sendSMS = async (to, trackingId, status) => {
  try {
    console.log(`📱 SMS would be sent to: ${to} for tracking: ${trackingId} with status: ${status}`);
    // SMS functionality can be added later
    return { success: true };
  } catch (error) {
    console.error("❌ SMS failed:", error.message);
    return { success: false, error: error.message };
  }
};

// Test email configuration
export const testEmailConfig = async (testEmail) => {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      throw new Error("Email transporter not configured");
    }

    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Email System Test</h2>
        <p>This is a test email to verify your email system is working correctly.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>SMTP Host: ${process.env.SMTP_HOST}</li>
            <li>SMTP Port: ${process.env.SMTP_PORT}</li>
            <li>SMTP User: ${process.env.SMTP_USER}</li>
            <li>Timestamp: ${new Date().toLocaleString()}</li>
          </ul>
        </div>
        <p>If you received this email, your email configuration is working properly!</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Prime Dispatcher" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: `Prime Dispatcher - SMTP Configuration Test`,
      html: testHtml,
    });

    console.log("✅ Test email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Test email failed:", error);
    throw error;
  }
};

// Initialize email system on startup
const initializeEmailSystem = async () => {
  console.log("🔧 Initializing email system...");
  const transporter = await getTransporter();
  if (transporter) {
    console.log("✅ Email system initialized successfully");
  } else {
    console.log("⚠️ Email system not configured - check .env settings");
  }
};

// Initialize on module load
initializeEmailSystem();