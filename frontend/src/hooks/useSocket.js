"use client";
import { useEffect, useRef } from 'react';
import { API_URL } from '../services/api.config.js';

// Disabled WebSocket for Vercel deployment - using polling instead
export const useSocket = (serverPath = process.env.NEXT_PUBLIC_API_URL || 'https://delivery-backend100.vercel.app') => {
  const mockSocketRef = useRef({
    connected: false,
    id: 'polling-socket-' + Math.random().toString(36).substr(2, 9)
  });

  useEffect(() => {
    console.log('🔌 Socket: WebSocket disabled for Vercel deployment');
    console.log('📡 Using polling-based updates instead of real-time WebSocket');
    
    // Simulate connection for compatibility
    setTimeout(() => {
      mockSocketRef.current.connected = true;
      console.log('✅ Socket: Polling mode activated');
    }, 500);

    // Cleanup
    return () => {
      mockSocketRef.current.connected = false;
      console.log('🔌 Socket: Polling mode deactivated');
    };
  }, [serverPath]);

  const on = (event, callback) => {
    console.log(`🔌 Socket: Registered polling listener for '${event}'`);
    
    // Simulate connection event for compatibility
    if (event === 'connect') {
      setTimeout(() => {
        console.log('🔌 Socket: Simulating connect event');
        callback();
      }, 500);
    }
    
    if (event === 'disconnect') {
      // Handle disconnect simulation if needed
      console.log('🔌 Socket: Disconnect listener registered');
    }
    
    // For real-time events, we'll use periodic polling in the components instead
    // This prevents WebSocket connection errors while maintaining compatibility
  };

  const off = (event, callback) => {
    console.log(`🔌 Socket: Removed polling listener for '${event}'`);
    // Remove event listeners (no-op in polling mode)
  };

  const emit = (event, data) => {
    console.log(`🔌 Socket: Polling emit '${event}' (no-op in Vercel)`, data);
    // In Vercel, we can't emit to server via WebSocket
    // Components should use direct API calls instead
  };

  return { 
    on, 
    off, 
    emit, 
    socket: mockSocketRef.current,
    isConnected: () => mockSocketRef.current.connected,
    isPollingMode: true,
    isWebSocketDisabled: true
  };
};