import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';

// Import the fixed admin controller
import { getDashboardStats, getRecentShipments, getAllUsers } from './controllers/admin.controller.js';

dotenv.config();

async function testFixedAdminController() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 TESTING FIXED ADMIN CONTROLLER');
    console.log('='.repeat(50));

    // Create mock request and response objects
    const mockReq = {};
    const mockRes = {
      json: (data) => {
        console.log('📊 Admin Controller Response:');
        console.log(JSON.stringify(data, null, 2));
        return data;
      },
      status: (code) => ({
        json: (data) => {
          console.log(`❌ Error Response (${code}):`, data);
          return data;
        }
      })
    };

    // Test 1: Dashboard Stats
    console.log('\n1️⃣ TESTING FIXED getDashboardStats:');
    try {
      await getDashboardStats(mockReq, mockRes);
    } catch (error) {
      console.error('❌ getDashboardStats error:', error.message);
    }

    // Test 2: Recent Shipments
    console.log('\n2️⃣ TESTING getRecentShipments:');
    try {
      await getRecentShipments(mockReq, mockRes);
    } catch (error) {
      console.error('❌ getRecentShipments error:', error.message);
    }

    // Test 3: All Users
    console.log('\n3️⃣ TESTING getAllUsers:');
    try {
      await getAllUsers(mockReq, mockRes);
    } catch (error) {
      console.error('❌ getAllUsers error:', error.message);
    }

    console.log('\n🎉 FIXED ADMIN CONTROLLER TEST COMPLETED!');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testFixedAdminController();