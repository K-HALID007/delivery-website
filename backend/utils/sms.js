import dotenv from 'dotenv';
dotenv.config();
import twilio from 'twilio';

let client = null;

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH;
  
  if (!accountSid || !authToken) {
    return null;
  }
  
  if (!client) {
    try {
      client = twilio(accountSid, authToken);
    } catch (err) {
      console.warn('⚠️ Twilio initialization failed:', err.message);
      return null;
    }
  }
  return client;
};

export const sendSMS = async (to, trackingId, status) => {
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient || !process.env.TWILIO_PHONE) {
      console.log(`ℹ️ [SMS Skipped - No Twilio Config] To: ${to}, TrackingId: ${trackingId}, Status: ${status}`);
      return;
    }

    const messageBody = `📦 Your order with Tracking ID ${trackingId} is now "${status}".`;
    const msg = await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE,
      to: to
    });
    console.log('✅ SMS sent successfully:', msg.sid);
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
  }
};

export default { sendSMS };
