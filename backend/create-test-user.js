import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';

// Load environment variables
dotenv.config();

async function createTestUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a test user
    const testUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'India'
      },
      role: 'user',
      isActive: true
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: testUserData.email });
    if (existingUser) {
      console.log('⚠️ Test user already exists');
      console.log('📧 Email:', testUserData.email);
      console.log('🔑 Password:', 'password123');
      return;
    }

    const testUser = new User(testUserData);
    await testUser.save();

    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', testUserData.email);
    console.log('🔑 Password:', 'password123');
    console.log('👤 Name:', testUserData.name);
    console.log('📱 Phone:', testUserData.phone);

    console.log('\n💡 You can now login with these credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createTestUser();