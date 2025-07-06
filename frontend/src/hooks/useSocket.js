"use client";
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../services/api.config.js';

export const useSocket = (serverPath = '${process.env.NEXT_PUBLIC_API_URL || 'https://delivery-backend100.vercel.app'}') => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(serverPath, {
      transports: ['websocket', 'polling']
    });

    // Join admin room
    socketRef.current.emit('join-admin');

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverPath]);

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return { on, off, emit, socket: socketRef.current };
};