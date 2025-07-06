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

// Test with absolute minimal required data
async function testMinimalRegistration() {
  try {
    console.log('🧪 Testing minimal partner registration...\n');

    // Minimal required data based on the model
    const minimalData = {
      name: 'Minimal Test Partner',
      email: 'minimal@test.com',
      password: 'password123',
      phone: '1234567890',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'India'
      },
      vehicleType: 'bike',
      vehicleNumber: 'MIN123',
      licenseNumber: 'DL123456',
      workingHours: 'flexible',
      status: 'pending'
    };

    console.log('📝 Minimal data:', JSON.stringify(minimalData, null, 2));

    // Delete any existing partner with same email/vehicle
    await Partner.deleteOne({ email: minimalData.email });
    await Partner.deleteOne({ vehicleNumber: minimalData.vehicleNumber });
    console.log('🧹 Cleaned up existing test data');

    const partner = new Partner(minimalData);

    console.log('\n💾 Attempting to save minimal partner...');
    await partner.save();
    
    console.log('✅ Minimal partner registration successful!');
    console.log(`📧 Email: ${partner.email}`);
    console.log(`🆔 ID: ${partner._id}`);

    // Now test with frontend-like data
    console.log('\n🧪 Testing frontend-like data...');
    
    const frontendLikeData = {
      name: 'Frontend Test Partner',
      email: 'frontend@test.com',
      password: 'password123',
      phone: '1234567891',
      address: '456 Frontend Street', // This is how frontend sends it
      city: 'Frontend City',
      state: 'Frontend State',
      postalCode: '54321',
      vehicleType: 'car',
      vehicleNumber: 'FRONT123',
      licenseNumber: 'DL654321',
      experience: '1-3',
      workingHours: 'morning'
    };

    console.log('📝 Frontend-like data:', JSON.stringify(frontendLikeData, null, 2));

    // Clean up
    await Partner.deleteOne({ email: frontendLikeData.email });
    await Partner.deleteOne({ vehicleNumber: frontendLikeData.vehicleNumber });

    // Create partner like the controller does
    const frontendPartner = new Partner({
      name: frontendLikeData.name,
      email: frontendLikeData.email,
      password: frontendLikeData.password,
      phone: frontendLikeData.phone,
      address: {
        street: frontendLikeData.address, // Controller maps address to address.street
        city: frontendLikeData.city,
        state: frontendLikeData.state,
        postalCode: frontendLikeData.postalCode,
        country: 'India'
      },
      vehicleType: frontendLikeData.vehicleType,
      vehicleNumber: frontendLikeData.vehicleNumber.toUpperCase(),
      licenseNumber: frontendLikeData.licenseNumber,
      experience: frontendLikeData.experience,
      workingHours: frontendLikeData.workingHours,
      status: 'pending'
    });

    console.log('\n💾 Attempting to save frontend-like partner...');
    await frontendPartner.save();
    
    console.log('✅ Frontend-like partner registration successful!');
    console.log(`📧 Email: ${frontendPartner.email}`);
    console.log(`🆔 ID: ${frontendPartner._id}`);

  } catch (error) {
    console.error('❌ Partner registration failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.errors) {
      console.error('\n📋 Validation errors:');
      Object.keys(error.errors).forEach(field => {
        console.error(`  - ${field}: ${error.errors[field].message}`);
        console.error(`    Value: ${error.errors[field].value}`);
        console.error(`    Kind: ${error.errors[field].kind}`);
      });
    }
    
    if (error.code === 11000) {
      console.error('\n🔄 Duplicate key error');
      console.error('Duplicate field:', Object.keys(error.keyPattern || {}));
      console.error('Duplicate value:', error.keyValue);
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testMinimalRegistration();