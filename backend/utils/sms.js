import dotenv from 'dotenv';
dotenv.config();
import twilio from 'twilio';

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const client = twilio(accountSid, authToken);

export const sendSMS = async (to, trackingId, status) => {
  try {
    const messageBody = `📦 Your order with Tracking ID ${trackingId} is now "${status}".`;
    const msg = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE,
      to: to
    });
    console.log("✅ SMS sent:", msg.sid);
  } catch (error) {
    console.error("❌ SMS failed:", error.message);
  }
};
