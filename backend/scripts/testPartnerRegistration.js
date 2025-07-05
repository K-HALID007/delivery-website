import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Partner from '../models/partner.model.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Test partner registration with minimal data
async function testPartnerRegistration() {
  try {
    console.log('🧪 Testing partner registration...\n');

    // Test data that might be coming from frontend
    const testData = {
      name: 'Test Partner',
      email: 'testpartner@example.com',
      password: 'password123',
      phone: '1234567890',
      address: '123 Test Street', // This might be the issue - model expects object
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'India',
      vehicleType: 'bike',
      vehicleNumber: 'TEST123',
      licenseNumber: 'DL123456',
      workingHours: 'flexible'
    };

    console.log('📝 Test data:', JSON.stringify(testData, null, 2));

    // Try to create partner exactly like the controller does
    const partner = new Partner({
      name: testData.name,
      email: testData.email,
      password: testData.password,
      phone: testData.phone,
      address: {
        street: testData.address, // Controller maps 'address' to 'address.street'
        city: testData.city,
        state: testData.state,
        postalCode: testData.postalCode,
        country: testData.country || 'India'
      },
      vehicleType: testData.vehicleType,
      vehicleNumber: testData.vehicleNumber.toUpperCase(),
      licenseNumber: testData.licenseNumber,
      workingHours: testData.workingHours,
      status: 'pending'
    });

    console.log('\n💾 Attempting to save partner...');
    await partner.save();
    
    console.log('✅ Partner registration successful!');
    console.log(`📧 Email: ${partner.email}`);
    console.log(`🆔 ID: ${partner._id}`);
    console.log(`📍 Status: ${partner.status}`);

  } catch (error) {
    console.error('❌ Partner registration failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.errors) {
      console.error('\n📋 Validation errors:');
      Object.keys(error.errors).forEach(field => {
        console.error(`  - ${field}: ${error.errors[field].message}`);
      });
    }
    
    if (error.code === 11000) {
      console.error('\n🔄 Duplicate key error - partner already exists');
      console.error('Duplicate field:', Object.keys(error.keyPattern));
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testPartnerRegistration();