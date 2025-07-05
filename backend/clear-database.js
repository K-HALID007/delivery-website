import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import all models
import User from './models/user.model.js';
import Tracking from './models/tracking.model.js';

async function clearDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️ Clearing all collections...');

    // Clear Users collection
    const usersDeleted = await User.deleteMany({});
    console.log(`🧹 Deleted ${usersDeleted.deletedCount} users`);

    // Clear Tracking/Shipments collection
    const trackingDeleted = await Tracking.deleteMany({});
    console.log(`🧹 Deleted ${trackingDeleted.deletedCount} shipments/tracking records`);

    // Try to clear other collections that might exist
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\n📋 Found collections:', collections.map(c => c.name));

      for (const collection of collections) {
        if (!['users', 'trackings'].includes(collection.name)) {
          const result = await mongoose.connection.db.collection(collection.name).deleteMany({});
          console.log(`🧹 Deleted ${result.deletedCount} records from ${collection.name}`);
        }
      }
    } catch (error) {
      console.log('⚠️ Could not clear additional collections:', error.message);
    }

    console.log('\n✅ Database completely cleared!');
    console.log('🎉 All user data, shipments, and tracking records have been deleted');
    console.log('💡 You can now register fresh users and create new shipments');

    // Verify the cleanup
    const remainingUsers = await User.countDocuments();
    const remainingTracking = await Tracking.countDocuments();
    
    console.log('\n🔍 Verification:');
    console.log(`   Users remaining: ${remainingUsers}`);
    console.log(`   Shipments remaining: ${remainingTracking}`);

    if (remainingUsers === 0 && remainingTracking === 0) {
      console.log('✅ Database is completely clean!');
    } else {
      console.log('⚠️ Some data might still remain');
    }

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
console.log('🚨 DATABASE CLEANUP STARTING...');
console.log('⚠️ This will DELETE ALL DATA from your database!');
console.log('📊 Collections that will be cleared:');
console.log('   - Users (all registered users)');
console.log('   - Trackings (all shipments and tracking data)');
console.log('   - Any other collections found');

clearDatabase();