'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import partnerService from '../services/partner.service.js';

const PartnerContext = createContext();

export const usePartner = () => {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error('usePartner must be used within a PartnerProvider');
  }
  return context;
};

export const PartnerProvider = ({ children }) => {
  const [partner, setPartner] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Memoized load function to prevent infinite loops
  const loadPartnerData = useCallback(async () => {
    if (initialized) return; // Prevent multiple loads
    
    try {
      if (!partnerService.isLoggedIn()) {
        setLoading(false);
        setInitialized(true);
        return;
      }

      const storedPartner = partnerService.getStoredPartnerData();
      if (storedPartner) {
        setPartner(storedPartner);
      }

      // Get dashboard data to get online status and stats
      const dashboardResponse = await partnerService.getDashboard();
      if (dashboardResponse.success) {
        setOnlineStatus(dashboardResponse.stats.isOnline);
        setStats(dashboardResponse.stats);
      }

      // Get profile data only if we don't have stored partner data
      if (!storedPartner) {
        const profileResponse = await partnerService.getProfile();
        if (profileResponse.success) {
          setPartner(profileResponse.partner);
        }
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [initialized]);

  // Load partner data on mount - only once
  useEffect(() => {
    if (!initialized) {
      loadPartnerData();
    }
  }, [loadPartnerData, initialized]);

  const toggleOnlineStatus = async () => {
    try {
      const response = await partnerService.toggleOnlineStatus();
      if (response.success) {
        setOnlineStatus(response.isOnline);
        // Update stats to reflect new online status
        setStats(prev => ({ ...prev, isOnline: response.isOnline }));
        return response;
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
      throw error;
    }
  };

  const updateStats = (newStats) => {
    setStats(newStats);
  };

  const logout = () => {
    try {
      console.log('Logging out partner...');
      
      // Clear all state
      setPartner(null);
      setOnlineStatus(false);
      setStats(null);
      setInitialized(false);
      setLoading(false);
      
      // Clear localStorage
      partnerService.logout();
      
      console.log('Partner logged out successfully');
      
      // Force page reload to ensure clean state
      window.location.href = '/partner';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force reload anyway
      window.location.href = '/partner';
    }
  };

  // Refresh data function for manual refresh
  const refreshData = useCallback(async () => {
    setInitialized(false);
    setLoading(true);
    await loadPartnerData();
  }, [loadPartnerData]);

  const value = {
    partner,
    setPartner,
    onlineStatus,
    setOnlineStatus,
    stats,
    setStats: updateStats,
    loading,
    toggleOnlineStatus,
    loadPartnerData: refreshData,
    logout
  };

  return (
    <PartnerContext.Provider value={value}>
      {children}
    </PartnerContext.Provider>
  );
};

export default PartnerContext;