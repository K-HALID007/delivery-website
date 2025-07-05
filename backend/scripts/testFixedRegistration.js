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

// Test with corrected frontend data
async function testFixedRegistration() {
  try {
    console.log('🧪 Testing FIXED frontend registration data...\n');

    // This is the corrected data that frontend will now send
    const fixedFrontendData = {
      name: 'Test Partner Fixed',
      email: 'testpartnerfixed@example.com',
      password: 'password123',
      phone: '1234567890',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      vehicleType: 'bike',
      vehicleNumber: 'TEST123',
      licenseNumber: 'DL123456',
      experience: '1-3', // Now using proper enum value
      workingHours: 'flexible', // Now included!
      bankAccount: '1234567890',
      ifscCode: 'BANK0001234'
    };

    console.log('📝 Fixed frontend data:', JSON.stringify(fixedFrontendData, null, 2));

    // Try to create partner exactly like the controller does
    const partner = new Partner({
      name: fixedFrontendData.name,
      email: fixedFrontendData.email,
      password: fixedFrontendData.password,
      phone: fixedFrontendData.phone,
      address: {
        street: fixedFrontendData.address,
        city: fixedFrontendData.city,
        state: fixedFrontendData.state,
        postalCode: fixedFrontendData.postalCode,
        country: 'India'
      },
      vehicleType: fixedFrontendData.vehicleType,
      vehicleNumber: fixedFrontendData.vehicleNumber.toUpperCase(),
      licenseNumber: fixedFrontendData.licenseNumber,
      experience: fixedFrontendData.experience,
      workingHours: fixedFrontendData.workingHours, // Now included!
      status: 'pending'
    });

    console.log('\n💾 Attempting to save partner...');
    await partner.save();
    
    console.log('✅ Partner registration successful!');
    console.log(`📧 Email: ${partner.email}`);
    console.log(`🆔 ID: ${partner._id}`);
    console.log(`📍 Status: ${partner.status}`);
    console.log(`⏰ Working Hours: ${partner.workingHours}`);
    console.log(`🎯 Experience: ${partner.experience}`);

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
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testFixedRegistration();