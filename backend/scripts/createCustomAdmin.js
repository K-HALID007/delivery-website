import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Create admin user with custom details
async function createCustomAdmin() {
  try {
    console.log('\n🔧 Admin User Creation Tool');
    console.log('============================\n');

    // Get admin details from user
    const name = await askQuestion('👤 Enter admin name: ');
    const email = await askQuestion('📧 Enter admin email: ');
    const password = await askQuestion('🔑 Enter admin password: ');
    const phone = await askQuestion('📱 Enter admin phone: ');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      const overwrite = await askQuestion(`⚠️  Admin with email ${email} already exists. Overwrite? (y/n): `);
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Admin creation cancelled');
        rl.close();
        await mongoose.connection.close();
        return;
      }
      await User.deleteOne({ email });
      console.log('🗑️  Existing admin deleted');
    }

    // Create admin data
    const adminData = {
      name: name || 'Admin',
      email: email || 'admin@example.com',
      password: password || 'admin123',
      phone: phone || '1234567890',
      address: {
        street: 'Admin Office',
        city: 'Admin City',
        state: 'Admin State',
        postalCode: '12345',
        country: 'India'
      },
      role: 'admin',
      isActive: true
    };

    // Create new admin user
    const admin = new User(adminData);
    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('====================================');
    console.log(`👤 Name: ${adminData.name}`);
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log(`📱 Phone: ${adminData.phone}`);
    console.log(`🎯 Role: ${adminData.role}`);
    console.log('\n💡 You can now login to admin panel with these credentials!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
createCustomAdmin();