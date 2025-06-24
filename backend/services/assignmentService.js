import Tracking from '../models/tracking.model.js';
import { autoAssignPartner } from '../utils/autoAssignPartner.js';
import mongoose from 'mongoose';

/**
 * Background service to assign unassigned deliveries to partners
 */
class AssignmentService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  /**
   * Start the assignment service
   * @param {number} intervalMinutes - How often to check for unassigned deliveries (in minutes)
   */
  start(intervalMinutes = 5) {
    if (this.isRunning) {
      console.log('⚠️ Assignment service is already running');
      return;
    }

    console.log(`🚀 Starting assignment service - checking every ${intervalMinutes} minutes`);
    this.isRunning = true;

    // Run immediately
    this.processUnassignedDeliveries();

    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.processUnassignedDeliveries();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop the assignment service
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Assignment service is not running');
      return;
    }

    console.log('🛑 Stopping assignment service');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Process all unassigned deliveries
   */
  async processUnassignedDeliveries() {
    try {
      console.log('🔍 Checking for unassigned deliveries...');

      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        console.log('⚠️ MongoDB not connected, skipping assignment check');
        return;
      }

      // Find deliveries that need assignment with timeout
      const unassignedDeliveries = await Tracking.find({
        $or: [
          { assignedPartner: { $exists: false } },
          { assignedPartner: null }
        ],
        status: { $in: ['Pending', 'Processing', 'Created', 'Confirmed', 'Ready for Pickup', 'pending', 'confirmed'] }
      })
      .limit(20) // Process max 20 at a time
      .maxTimeMS(15000); // 15 second timeout for the query

      console.log(`🔍 Query for unassigned deliveries:`, {
        $or: [
          { assignedPartner: { $exists: false } },
          { assignedPartner: null }
        ],
        status: { $in: ['Pending', 'Processing', 'Created', 'Confirmed', 'Ready for Pickup', 'pending', 'confirmed'] }
      });

      if (unassignedDeliveries.length === 0) {
        console.log('✅ No unassigned deliveries found');
        return;
      }

      console.log(`📦 Found ${unassignedDeliveries.length} unassigned deliveries`);

      let assignedCount = 0;
      let failedCount = 0;

      for (const delivery of unassignedDeliveries) {
        try {
          const assignedPartner = await autoAssignPartner(delivery);
          if (assignedPartner) {
            assignedCount++;
            console.log(`✅ Assigned ${delivery.trackingId} to ${assignedPartner.name}`);
          } else {
            failedCount++;
            console.log(`❌ Failed to assign ${delivery.trackingId} - no available partners`);
          }
        } catch (error) {
          failedCount++;
          console.error(`❌ Error assigning ${delivery.trackingId}:`, error.message);
        }

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`📊 Assignment summary: ${assignedCount} assigned, ${failedCount} failed`);

    } catch (error) {
      console.error('❌ Error in processUnassignedDeliveries:', error);
    }
  }

  /**
   * Manually trigger assignment process
   */
  async triggerAssignment() {
    console.log('🔄 Manually triggering assignment process...');
    await this.processUnassignedDeliveries();
  }

  /**
   * Process assignments when a partner comes online
   * @param {string} partnerId - The partner who just came online
   */
  async processPartnerOnline(partnerId) {
    try {
      console.log(`🟢 Partner ${partnerId} came online, checking for assignments...`);
      
      // Trigger immediate assignment check
      await this.processUnassignedDeliveries();
      
      console.log(`✅ Assignment check completed for partner ${partnerId}`);
    } catch (error) {
      console.error(`❌ Error processing partner online ${partnerId}:`, error);
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId !== null
    };
  }
}

// Create singleton instance
const assignmentService = new AssignmentService();

export default assignmentService;