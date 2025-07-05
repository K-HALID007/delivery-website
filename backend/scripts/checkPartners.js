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

// Check partners in database
async function checkPartners() {
  try {
    console.log('🔍 Checking partners in database...\n');

    // Get total count
    const totalPartners = await Partner.countDocuments();
    console.log(`📊 Total Partners: ${totalPartners}`);

    if (totalPartners === 0) {
      console.log('❌ No partners found in database!');
      console.log('💡 Run: node scripts/createSamplePartners.js to create sample partners');
      return;
    }

    // Get partners by status
    const approvedPartners = await Partner.countDocuments({ status: 'approved' });
    const pendingPartners = await Partner.countDocuments({ status: 'pending' });
    const suspendedPartners = await Partner.countDocuments({ status: 'suspended' });
    const onlinePartners = await Partner.countDocuments({ isOnline: true });

    console.log(`✅ Approved: ${approvedPartners}`);
    console.log(`⏳ Pending: ${pendingPartners}`);
    console.log(`🚫 Suspended: ${suspendedPartners}`);
    console.log(`🟢 Online: ${onlinePartners}`);

    // Get all partners details
    const partners = await Partner.find().select('name email status isOnline vehicleType totalDeliveries');
    
    console.log('\n📋 Partners List:');
    console.log('================');
    partners.forEach((partner, index) => {
      const statusIcon = partner.status === 'approved' ? '✅' : 
                        partner.status === 'pending' ? '⏳' : 
                        partner.status === 'suspended' ? '🚫' : '❓';
      const onlineIcon = partner.isOnline ? '🟢' : '🔴';
      
      console.log(`${index + 1}. ${statusIcon} ${partner.name}`);
      console.log(`   📧 ${partner.email}`);
      console.log(`   🚗 ${partner.vehicleType} | ${onlineIcon} ${partner.isOnline ? 'Online' : 'Offline'}`);
      console.log(`   📦 ${partner.totalDeliveries} deliveries`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking partners:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the check
checkPartners();