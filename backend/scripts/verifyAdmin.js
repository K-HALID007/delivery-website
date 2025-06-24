import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function verifyAdmin() {
  try {
    console.log('Checking admin user...');
    
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (admin) {
      console.log('✅ Admin user found:');
      console.log('  Email:', admin.email);
      console.log('  Role:', admin.role);
      console.log('  IsActive:', admin.isActive);
      console.log('  Has phone:', !!admin.phone);
      console.log('  Has address:', !!admin.address);
      console.log('  Password hash exists:', !!admin.password);
      
      // Test password verification
      const isPasswordValid = await admin.comparePassword('admin123');
      console.log('  Password "admin123" is valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('❌ Password verification failed. Updating password...');
        admin.password = 'admin123';
        await admin.save();
        console.log('✅ Password updated successfully');
      }
      
    } else {
      console.log('❌ Admin user not found. Creating new admin...');
      
      const newAdmin = new User({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        phone: '1234567890',
        address: {
          street: 'Admin Street',
          city: 'Admin City',
          state: 'Admin State',
          postalCode: '12345',
          country: 'Admin Country'
        },
        role: 'admin',
        isActive: true
      });
      
      await newAdmin.save();
      console.log('✅ New admin user created successfully');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the verification
verifyAdmin();