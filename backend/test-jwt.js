import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing JWT functionality...');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

// Test token generation and verification
const testPayload = {
  userId: '507f1f77bcf86cd799439011',
  role: 'user'
};

try {
  // Generate token
  const token = jwt.sign(testPayload, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
  console.log('Token generated successfully');
  console.log('Token length:', token.length);
  console.log('Token parts:', token.split('.').length);
  
  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  console.log('Token verified successfully');
  console.log('Decoded payload:', decoded);
  
  console.log('✅ JWT functionality is working correctly');
} catch (error) {
  console.error('❌ JWT test failed:', error.message);
}