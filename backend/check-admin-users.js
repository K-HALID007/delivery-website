import mongoose from 'mongoose';
import User from './models/user.model.js';
import bcrypt from 'bcryptjs';

async function checkAndCreateAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/courier-tracker');
    console.log('✅ Connected to MongoDB');

    // Check existing admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log('\n📋 Existing admin users:');
    adminUsers.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email}) - Active: ${admin.isActive}`);
    });

    // If no admin users exist, create one
    if (adminUsers.length === 0) {
      console.log('\n🔧 Creating default admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@courier.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isVerified: true
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
    } else {
      // Update existing admin to ensure it's active
      await User.updateMany(
        { role: 'admin' },
        { isActive: true, isVerified: true }
      );
      console.log('✅ Admin users updated to active status');
    }

    // Test login credentials
    console.log('\n🔐 Testing admin login credentials...');
    const testAdmin = await User.findOne({ email: 'admin@courier.com', role: 'admin' });
    
    if (testAdmin) {
      const isPasswordValid = await bcrypt.compare('admin123', testAdmin.password);
      console.log(`Password valid: ${isPasswordValid}`);
      console.log(`User active: ${testAdmin.isActive}`);
      console.log(`User verified: ${testAdmin.isVerified}`);
      
      if (!isPasswordValid) {
        console.log('🔧 Updating admin password...');
        const newHashedPassword = await bcrypt.hash('admin123', 10);
        testAdmin.password = newHashedPassword;
        await testAdmin.save();
        console.log('✅ Admin password updated!');
      }
    }

    console.log('\n✅ Admin setup completed!');
    console.log('📝 Admin credentials:');
    console.log('   Email: admin@courier.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkAndCreateAdmin();