import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Partner from './models/partner.model.js';

dotenv.config();

async function fixPartnerStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check all partners
    const allPartners = await Partner.find({});
    console.log(`📊 Total partners: ${allPartners.length}`);
    
    console.log('\n📋 Current partner status:');
    allPartners.forEach(partner => {
      console.log(`👤 ${partner.name}:`);
      console.log(`   - Status: ${partner.status}`);
      console.log(`   - IsActive: ${partner.isActive}`);
      console.log(`   - IsOnline: ${partner.isOnline}`);
      console.log(`   - IsVerified: ${partner.isVerified}`);
    });

    // Fix partners that are approved but not active
    const partnersToFix = await Partner.find({
      status: 'approved',
      isActive: false
    });

    if (partnersToFix.length > 0) {
      console.log(`\n🔧 Found ${partnersToFix.length} approved partners that need to be activated`);
      
      for (const partner of partnersToFix) {
        partner.isActive = true;
        partner.isVerified = true; // Also set verified if not already
        await partner.save();
        
        console.log(`✅ Activated partner: ${partner.name}`);
      }
    } else {
      console.log('\n✅ All approved partners are already active');
    }

    // Show final status
    console.log('\n📋 Final partner status:');
    const updatedPartners = await Partner.find({});
    updatedPartners.forEach(partner => {
      console.log(`👤 ${partner.name}:`);
      console.log(`   - Status: ${partner.status}`);
      console.log(`   - IsActive: ${partner.isActive}`);
      console.log(`   - IsOnline: ${partner.isOnline}`);
      console.log(`   - IsVerified: ${partner.isVerified}`);
    });

  } catch (error) {
    console.error('❌ Fix error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixPartnerStatus();