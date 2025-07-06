import mongoose from 'mongoose';
import Partner from '../models/partner.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fixPartnerActiveStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all approved partners with isActive: false
    const partnersToUpdate = await Partner.find({
      status: 'approved',
      isActive: { $ne: true }
    });

    console.log(`🔍 Found ${partnersToUpdate.length} approved partners with isActive: false`);

    if (partnersToUpdate.length > 0) {
      // Update all approved partners to set isActive: true
      const result = await Partner.updateMany(
        { 
          status: 'approved',
          isActive: { $ne: true }
        },
        { 
          $set: { 
            isActive: true,
            updatedAt: new Date()
          }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} partners`);
      
      // Show updated partners
      const updatedPartners = await Partner.find({
        status: 'approved',
        isActive: true
      }).select('name email status isActive');

      console.log('📋 Updated partners:');
      updatedPartners.forEach(partner => {
        console.log(`  - ${partner.name} (${partner.email}) - Status: ${partner.status}, Active: ${partner.isActive}`);
      });
    } else {
      console.log('✅ All approved partners already have isActive: true');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error fixing partner active status:', error);
    process.exit(1);
  }
}

// Run the script
fixPartnerActiveStatus();