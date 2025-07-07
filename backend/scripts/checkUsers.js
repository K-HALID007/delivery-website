import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model
    const User = (await import('../models/user.model.js')).default;

    // Get all users
    const users = await User.find({}).select('name email role isActive createdAt');
    
    console.log(`\n📊 Found ${users.length} users in database:`);
    console.log('=' .repeat(80));
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('\n💡 You need to create users first. Try:');
      console.log('1. Register a new user via the frontend');
      console.log('2. Create an admin user via POST /api/auth/admin/first');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('-'.repeat(40));
    });

    // Test login for each user with common passwords
    console.log('\n🧪 Testing login with common passwords...');
    const commonPasswords = ['password', 'password123', '123456', 'admin', 'user'];
    
    for (const user of users) {
      console.log(`\nTesting login for: ${user.email}`);
      
      // Get the full user with password
      const fullUser = await User.findById(user._id);
      
      for (const testPassword of commonPasswords) {
        try {
          const isMatch = await fullUser.comparePassword(testPassword);
          if (isMatch) {
            console.log(`✅ Password found: "${testPassword}" for ${user.email}`);
            break;
          }
        } catch (error) {
          console.log(`❌ Error testing password "${testPassword}": ${error.message}`);
        }
      }
    }

    // Check admin users specifically
    const adminUsers = await User.find({ role: 'admin' }).select('name email isActive');
    console.log(`\n👑 Admin users (${adminUsers.length}):`);
    adminUsers.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email}) - Active: ${admin.isActive}`);
    });

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Run the check
checkUsers();