import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Test bcrypt functionality
async function testPasswordHashing() {
  try {
    console.log('🧪 Testing bcrypt password hashing...\n');

    const testPassword = 'password123';
    console.log('Original password:', testPassword);

    // Test bcrypt directly
    console.log('\n1. Testing bcrypt.genSalt...');
    const salt = await bcrypt.genSalt(10);
    console.log('Salt generated:', salt);

    console.log('\n2. Testing bcrypt.hash...');
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    console.log('Hashed password:', hashedPassword);

    console.log('\n3. Testing bcrypt.compare...');
    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    console.log('Password comparison result:', isValid);

    if (isValid) {
      console.log('✅ bcrypt is working correctly!');
    } else {
      console.log('❌ bcrypt comparison failed!');
    }

    // Test with Partner model schema
    console.log('\n4. Testing Partner model password hashing...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import Partner model
    const Partner = (await import('../models/partner.model.js')).default;

    // Create a test partner object (without saving)
    const testPartnerData = {
      name: 'Hash Test Partner',
      email: 'hashtest@example.com',
      password: testPassword,
      phone: '1234567890',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'India'
      },
      vehicleType: 'bike',
      vehicleNumber: 'HASH123',
      licenseNumber: 'DL123456',
      workingHours: 'flexible'
    };

    console.log('Creating Partner instance...');
    const partner = new Partner(testPartnerData);

    console.log('Testing password hashing middleware...');
    // This should trigger the pre-save middleware that hashes the password
    await partner.save();
    
    console.log('✅ Partner saved successfully!');
    console.log('Original password:', testPassword);
    console.log('Hashed password in DB:', partner.password);

    // Test the comparePassword method
    console.log('\n5. Testing Partner.comparePassword method...');
    const isPasswordValid = await partner.comparePassword(testPassword);
    console.log('comparePassword result:', isPasswordValid);

    if (isPasswordValid) {
      console.log('✅ Partner password hashing and comparison working!');
    } else {
      console.log('❌ Partner password comparison failed!');
    }

    // Clean up
    await Partner.deleteOne({ email: 'hashtest@example.com' });
    console.log('🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Password hashing test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.errors) {
      console.error('\nValidation errors:');
      Object.keys(error.errors).forEach(field => {
        console.error(`  - ${field}: ${error.errors[field].message}`);
      });
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Run the test
testPasswordHashing();