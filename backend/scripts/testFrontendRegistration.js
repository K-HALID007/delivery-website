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

// Test with data that frontend might send
async function testFrontendRegistration() {
  try {
    console.log('🧪 Testing frontend registration data...\n');

    // This is what the frontend form sends (missing workingHours)
    const frontendData = {
      name: 'Test Partner',
      email: 'testpartner2@example.com',
      password: 'password123',
      phone: '1234567890',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      vehicleType: 'bike',
      vehicleNumber: 'TEST123',
      licenseNumber: 'DL123456',
      experience: '2', // Frontend sends as string number
      bankAccount: '1234567890',
      ifscCode: 'BANK0001234'
    };

    console.log('📝 Frontend data:', JSON.stringify(frontendData, null, 2));

    // Try to create partner exactly like the controller does
    const partner = new Partner({
      name: frontendData.name,
      email: frontendData.email,
      password: frontendData.password,
      phone: frontendData.phone,
      address: {
        street: frontendData.address,
        city: frontendData.city,
        state: frontendData.state,
        postalCode: frontendData.postalCode,
        country: 'India'
      },
      vehicleType: frontendData.vehicleType,
      vehicleNumber: frontendData.vehicleNumber.toUpperCase(),
      licenseNumber: frontendData.licenseNumber,
      experience: frontendData.experience,
      // workingHours is MISSING - this will cause the error!
      status: 'pending'
    });

    console.log('\n💾 Attempting to save partner...');
    await partner.save();
    
    console.log('✅ Partner registration successful!');

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
    
    console.log('\n🔧 SOLUTION: Add missing required fields to frontend form');
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testFrontendRegistration();