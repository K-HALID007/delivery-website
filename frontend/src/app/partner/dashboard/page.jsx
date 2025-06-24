'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePartner } from '../../../contexts/PartnerContext.js';
import { useToast } from '../../../contexts/ToastContext.js';
import partnerService from '../../../services/partner.service.js';

export default function PartnerDashboard() {
  const { partner, stats, onlineStatus, toggleOnlineStatus, setStats } = usePartner();
  const { showSuccess, showInfo } = useToast();
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if partner is logged in
    if (!partnerService.isLoggedIn()) {
      router.push('/partner');
      return;
    }

    loadDashboardData();
  }, []);

  // Listen for partner online event to refresh dashboard
  useEffect(() => {
    const handlePartnerOnline = (event) => {
      console.log('🟢 Partner came online event received, refreshing dashboard...');
      showInfo('🔄 Checking for new deliveries...', 4000);
      loadDashboardData();
      
      // Show success message after data loads
      setTimeout(() => {
        showSuccess('✅ You\'re online! Ready to receive new deliveries.', 5000);
      }, 2000);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('partnerOnline', handlePartnerOnline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('partnerOnline', handlePartnerOnline);
      }
    };
  }, [showInfo, showSuccess]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardResponse = await partnerService.getDashboard();

      if (dashboardResponse.success) {
        setStats(dashboardResponse.stats);
        setActiveDeliveries(dashboardResponse.activeDeliveries || []);
      }
    } catch (error) {
      setError(error.message);
      if (error.message.includes('unauthorized') || error.message.includes('token')) {
        partnerService.logout();
        router.push('/partner');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    try {
      await toggleOnlineStatus();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto"></div>
          <p className="mt-6 text-lg text-white font-medium">Loading your dashboard...</p>
          <p className="mt-2 text-sm text-slate-300">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="text-center max-w-md">
          <div className="bg-red-900/20 border border-red-400/30 text-red-300 px-8 py-6 rounded-xl shadow-lg backdrop-blur-sm">
            <div className="w-16 h-16 bg-red-500/20 border border-red-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold text-lg mb-2 text-white">Error loading dashboard</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-800 px-6 py-2 rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-amber-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg border-b border-yellow-400/20">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                <span className="text-yellow-400">Partner</span> Dashboard
              </h1>
              <p className="text-slate-300 flex items-center">
                <span className="mr-2">👋</span>
                Welcome back, <span className="font-semibold ml-1 text-yellow-400">{partner?.name || 'Partner'}!</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Current Time */}
              <div className="text-right bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/20">
                <p className="text-sm text-yellow-400">Current Time</p>
                <p className="text-lg font-semibold text-white">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-6 pt-4">
          <div className="bg-red-900/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg shadow-sm backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Simplified Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's Deliveries Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-yellow-400">{stats?.todayDeliveries || 0}</span>
                <p className="text-slate-300 mt-1 text-sm">Today's Deliveries</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Completed Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-yellow-400">{stats?.completedDeliveries || 0}</span>
                <p className="text-slate-300 mt-1 text-sm">Total Completed</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Monthly Earnings Card */}
          <div className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-6 hover:from-yellow-400/25 hover:to-amber-500/25 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-yellow-400">₹{stats?.monthlyEarnings || 0}</span>
                <p className="text-white mt-1 text-sm font-medium">This Month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-400/20 p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/partner/deliveries')}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-800 px-6 py-4 rounded-lg font-medium hover:from-yellow-600 hover:to-amber-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>View Deliveries</span>
            </button>
            <button
              onClick={() => router.push('/partner/profile')}
              className="bg-white/20 backdrop-blur-sm border border-yellow-400/30 text-white px-6 py-4 rounded-lg font-medium hover:bg-white/30 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Update Profile</span>
            </button>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-400/20 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {onlineStatus ? 'You\'re Online!' : 'You\'re Offline'}
            </h3>
            <p className="text-slate-300 mb-6">
              {onlineStatus 
                ? 'Ready to receive new delivery assignments' 
                : 'Go online to start receiving deliveries'
              }
            </p>
            <button
              onClick={handleToggleOnline}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                onlineStatus
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-slate-800'
              }`}
            >
              {onlineStatus ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}