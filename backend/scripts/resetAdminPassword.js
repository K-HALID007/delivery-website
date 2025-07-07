import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model
    const User = (await import('../models/user.model.js')).default;

    // Find admin user
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      
      // Create admin user
      console.log('🔧 Creating new admin user...');
      const newAdmin = new User({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123', // This will be hashed by the pre-save middleware
        phone: '1234567890',
        address: {
          street: 'Admin Street',
          city: 'Admin City',
          state: 'Admin State',
          postalCode: '12345',
          country: 'India'
        },
        role: 'admin',
        isActive: true
      });

      await newAdmin.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@gmail.com');
      console.log('🔑 Password: admin123');
      
    } else {
      console.log('👤 Found admin user:', admin.name, '(' + admin.email + ')');
      
      // Reset password
      const newPassword = 'admin123';
      admin.password = newPassword; // This will be hashed by the pre-save middleware
      await admin.save();
      
      console.log('✅ Admin password reset successfully!');
      console.log('📧 Email: admin@gmail.com');
      console.log('🔑 New Password: admin123');
    }

    // Also reset the user password for ks0903525@gmail.com
    const user = await User.findOne({ email: 'ks0903525@gmail.com' });
    if (user) {
      console.log('\n👤 Found user:', user.name, '(' + user.email + ')');
      user.password = 'user123'; // This will be hashed by the pre-save middleware
      await user.save();
      console.log('✅ User password reset successfully!');
      console.log('📧 Email: ks0903525@gmail.com');
      console.log('🔑 New Password: user123');
    }

    // Test the passwords
    console.log('\n🧪 Testing new passwords...');
    
    // Test admin login
    const adminTest = await User.findOne({ email: 'admin@gmail.com' });
    const adminPasswordMatch = await adminTest.comparePassword('admin123');
    console.log('Admin password test:', adminPasswordMatch ? '✅ PASS' : '❌ FAIL');
    
    // Test user login
    if (user) {
      const userTest = await User.findOne({ email: 'ks0903525@gmail.com' });
      const userPasswordMatch = await userTest.comparePassword('user123');
      console.log('User password test:', userPasswordMatch ? '✅ PASS' : '❌ FAIL');
    }

    console.log('\n🎉 Password reset complete!');
    console.log('\nYou can now login with:');
    console.log('👑 Admin: admin@gmail.com / admin123');
    console.log('👤 User: ks0903525@gmail.com / user123');
    console.log('👤 Test User: test@example.com / password123');

  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Run the reset
resetAdminPassword();