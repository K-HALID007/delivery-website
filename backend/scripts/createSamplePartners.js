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

// Sample partners data
const samplePartners = [
  {
    name: 'John Delivery',
    email: 'john@delivery.com',
    password: 'partner123',
    phone: '+1234567890',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'MH01AB1234',
    licenseNumber: 'DL123456789',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Mumbai coordinates
    },
    status: 'approved',
    isOnline: true,
    totalEarnings: 15000,
    completedDeliveries: 45,
    totalDeliveries: 50,
    rating: 4.8
  },
  {
    name: 'Sarah Express',
    email: 'sarah@express.com',
    password: 'partner123',
    phone: '+1234567891',
    vehicleType: 'Van',
    vehicleNumber: 'MH02CD5678',
    licenseNumber: 'DL987654321',
    address: {
      street: '456 Oak Avenue',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // Delhi coordinates
    },
    status: 'approved',
    isOnline: true,
    totalEarnings: 22000,
    completedDeliveries: 68,
    totalDeliveries: 72,
    rating: 4.9
  },
  {
    name: 'Mike Logistics',
    email: 'mike@logistics.com',
    password: 'partner123',
    phone: '+1234567892',
    vehicleType: 'Truck',
    vehicleNumber: 'KA03EF9012',
    licenseNumber: 'DL456789123',
    address: {
      street: '789 Pine Road',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // Bangalore coordinates
    },
    status: 'approved',
    isOnline: false,
    totalEarnings: 18500,
    completedDeliveries: 52,
    totalDeliveries: 58,
    rating: 4.6
  },
  {
    name: 'Lisa Quick',
    email: 'lisa@quick.com',
    password: 'partner123',
    phone: '+1234567893',
    vehicleType: 'Bicycle',
    vehicleNumber: 'BC001',
    licenseNumber: 'DL789123456',
    address: {
      street: '321 Cedar Lane',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600001',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827] // Chennai coordinates
    },
    status: 'pending',
    isOnline: false,
    totalEarnings: 8500,
    completedDeliveries: 28,
    totalDeliveries: 32,
    rating: 4.4
  },
  {
    name: 'David Fast',
    email: 'david@fast.com',
    password: 'partner123',
    phone: '+1234567894',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'GJ04GH3456',
    licenseNumber: 'DL321654987',
    address: {
      street: '654 Elm Street',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380001',
      country: 'India'
    },
    location: {
      type: 'Point',
      coordinates: [72.5714, 23.0225] // Ahmedabad coordinates
    },
    status: 'suspended',
    isOnline: false,
    totalEarnings: 5200,
    completedDeliveries: 15,
    totalDeliveries: 20,
    rating: 3.8
  }
];

// Create sample partners
async function createSamplePartners() {
  try {
    console.log('🚀 Creating sample partners...');

    // Clear existing partners (optional)
    const existingCount = await Partner.countDocuments();
    console.log(`📊 Found ${existingCount} existing partners`);

    if (existingCount === 0) {
      // Create new partners
      const createdPartners = await Partner.insertMany(samplePartners);
      console.log(`✅ Created ${createdPartners.length} sample partners successfully!`);
      
      console.log('\n📋 Sample Partners Created:');
      createdPartners.forEach((partner, index) => {
        console.log(`${index + 1}. ${partner.name} (${partner.email}) - Status: ${partner.status}`);
      });
    } else {
      console.log('⚠️ Partners already exist. Skipping creation.');
      console.log('💡 To recreate, delete existing partners first.');
    }

    console.log('\n🔑 Partner Login Credentials:');
    samplePartners.forEach((partner, index) => {
      console.log(`${index + 1}. Email: ${partner.email} | Password: partner123`);
    });

  } catch (error) {
    console.error('❌ Error creating sample partners:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
createSamplePartners();