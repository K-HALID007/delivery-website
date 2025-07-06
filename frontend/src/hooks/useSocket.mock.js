"use client";
import { useEffect, useRef } from 'react';

// Mock socket hook for Vercel deployment (no WebSocket support)
export const useSocket = (serverPath) => {
  const mockSocketRef = useRef({
    connected: false,
    id: 'mock-socket-' + Math.random().toString(36).substr(2, 9)
  });

  useEffect(() => {
    console.log('🔌 Mock Socket: WebSocket disabled for Vercel deployment');
    console.log('📡 Using polling-based updates instead');
    
    // Simulate connection after a delay
    setTimeout(() => {
      mockSocketRef.current.connected = true;
      console.log('✅ Mock Socket: Simulated connection established');
    }, 1000);

    // Cleanup
    return () => {
      mockSocketRef.current.connected = false;
      console.log('🔌 Mock Socket: Disconnected');
    };
  }, [serverPath]);

  const on = (event, callback) => {
    console.log(`🔌 Mock Socket: Registered listener for '${event}'`);
    
    // Simulate some events for testing
    if (event === 'connect') {
      setTimeout(() => {
        console.log('🔌 Mock Socket: Simulating connect event');
        callback();
      }, 1000);
    }
    
    // For other events, we'll rely on polling instead of real-time updates
  };

  const off = (event, callback) => {
    console.log(`🔌 Mock Socket: Removed listener for '${event}'`);
  };

  const emit = (event, data) => {
    console.log(`🔌 Mock Socket: Emitting '${event}' with data:`, data);
    // In a real implementation, this would send data to server
    // For now, we'll just log it
  };

  return { 
    on, 
    off, 
    emit, 
    socket: mockSocketRef.current,
    isConnected: () => mockSocketRef.current.connected,
    isMock: true
  };
};