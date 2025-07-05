// Script to check existing users in the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// User schema (simplified version)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const checkUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\nFetching all users...');
    const users = await User.find({}).select('-password').limit(10);
    
    console.log(`Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Phone:', user.phone);
      console.log('Role:', user.role);
      console.log('Active:', user.isActive);
      console.log('Created:', user.createdAt);
      
      if (user.address) {
        console.log('Address:');
        console.log('  Street:', user.address.street);
        console.log('  City:', user.address.city);
        console.log('  State:', user.address.state);
        console.log('  Postal Code:', user.address.postalCode);
        console.log('  Country:', user.address.country);
      } else {
        console.log('❌ No address data found');
      }
    });

    if (users.length === 0) {
      console.log('No users found in the database.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

checkUsers();