import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { sendDeliveryEmail } from '../utils/email.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function testEmailSystem() {
  try {
    console.log('🧪 Testing email system...');
    console.log('📧 Environment variables:');
    console.log('  SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Not set');
    console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : '❌ Not set');
    
    // Test sending an email
    const testEmail = process.env.SMTP_USER; // Send to yourself
    const result = await sendDeliveryEmail(
      testEmail,
      'Test Email - System Check',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Email System Test</h2>
        <p>This is a test email to verify your email system is working correctly.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Sent at: ${new Date().toLocaleString()}</li>
            <li>From: Courier Tracker System</li>
            <li>Status: Email system operational ✅</li>
          </ul>
        </div>
        <p>If you received this email, your SMTP configuration is working correctly!</p>
      </div>
      `
    );
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📬 Check your email:', testEmail);
    } else {
      console.log('❌ Test email failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing email system:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testEmailSystem();