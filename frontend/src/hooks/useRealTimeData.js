"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL } from '../services/api.config.js';

// Real-time data hook for delivery tracking (Vercel compatible)
export const useRealTimeData = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  
  const intervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  const {
    interval = 5000, // 5 seconds for real-time feel
    retryInterval = 10000, // 10 seconds retry on error
    maxRetries = 5,
    onUpdate = null,
    onError = null,
    enabled = true
  } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const token = sessionStorage.getItem('admin_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      console.log(`🔄 Real-time fetch: ${endpoint}`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const newData = await response.json();
      
      // Check if data actually changed to avoid unnecessary updates
      const dataChanged = JSON.stringify(newData) !== JSON.stringify(data);
      
      if (dataChanged) {
        setData(newData);
        setLastUpdate(new Date());
        console.log(`✅ Real-time update: ${endpoint}`, newData);
        
        if (onUpdate) {
          onUpdate(newData);
        }
      }
      
      setError(null);
      setIsConnected(true);
      setLoading(false);
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log(`🔄 Request aborted: ${endpoint}`);
        return;
      }
      
      console.error(`❌ Real-time error: ${endpoint}`, err);
      setError(err.message);
      setIsConnected(false);
      
      if (onError) {
        onError(err);
      }
      
      // Don't set loading to false on error, keep trying
    }
  }, [endpoint, enabled, data, onUpdate, onError]);

  // Start real-time polling
  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    console.log(`🚀 Starting real-time polling for: ${endpoint} (${interval}ms interval)`);
    
    // Initial fetch
    fetchData();
    
    // Set up polling interval
    intervalRef.current = setInterval(fetchData, interval);
    
    return () => {
      console.log(`🛑 Stopping real-time polling for: ${endpoint}`);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      setIsConnected(false);
    };
  }, [endpoint, interval, enabled, fetchData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    console.log(`🔄 Manual refresh: ${endpoint}`);
    fetchData();
  }, [fetchData]);

  // Pause/resume functions
  const pause = useCallback(() => {
    console.log(`⏸️ Pausing real-time updates: ${endpoint}`);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
  }, [endpoint]);

  const resume = useCallback(() => {
    console.log(`▶️ Resuming real-time updates: ${endpoint}`);
    if (!intervalRef.current && enabled) {
      fetchData();
      intervalRef.current = setInterval(fetchData, interval);
      setIsConnected(true);
    }
  }, [endpoint, enabled, fetchData, interval]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    isConnected,
    refresh,
    pause,
    resume
  };
};

// Specialized hooks for different data types
export const useRealTimeShipments = (options = {}) => {
  return useRealTimeData('/admin/shipments/recent', {
    interval: 3000, // 3 seconds for shipment updates
    ...options
  });
};

export const useRealTimeDashboard = (options = {}) => {
  return useRealTimeData('/admin/summary', {
    interval: 5000, // 5 seconds for dashboard stats
    ...options
  });
};

export const useRealTimeAnalytics = (options = {}) => {
  return useRealTimeData('/admin/analytics/realtime', {
    interval: 10000, // 10 seconds for analytics
    ...options
  });
};

export const useRealTimeNotifications = (options = {}) => {
  return useRealTimeData('/admin/notifications', {
    interval: 2000, // 2 seconds for notifications (most critical)
    ...options
  });
};

export const useRealTimePartners = (options = {}) => {
  return useRealTimeData('/admin/partners', {
    interval: 8000, // 8 seconds for partner updates
    ...options
  });
};

// Multi-endpoint real-time hook
export const useMultiRealTime = (endpoints = [], options = {}) => {
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const hooks = endpoints.map(endpoint => 
    useRealTimeData(endpoint, {
      ...options,
      onUpdate: (data) => {
        setAllData(prev => ({
          ...prev,
          [endpoint]: data
        }));
        setLastUpdate(new Date());
      },
      onError: (error) => {
        setErrors(prev => ({
          ...prev,
          [endpoint]: error.message
        }));
      }
    })
  );

  useEffect(() => {
    const allLoaded = hooks.every(hook => !hook.loading);
    setLoading(!allLoaded);
  }, [hooks]);

  const refreshAll = useCallback(() => {
    hooks.forEach(hook => hook.refresh());
  }, [hooks]);

  const pauseAll = useCallback(() => {
    hooks.forEach(hook => hook.pause());
  }, [hooks]);

  const resumeAll = useCallback(() => {
    hooks.forEach(hook => hook.resume());
  }, [hooks]);

  return {
    data: allData,
    loading,
    errors,
    lastUpdate,
    isConnected: hooks.some(hook => hook.isConnected),
    refreshAll,
    pauseAll,
    resumeAll,
    hooks
  };
};