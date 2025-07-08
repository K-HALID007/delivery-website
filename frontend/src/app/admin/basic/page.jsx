"use client";
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

export default function BasicAdminDashboard() {
  const [summary, setSummary] = useState({
    totalShipments: 0,
    activeUsers: 0,
    revenue: 0,
    pendingDeliveries: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState('checking');

  useEffect(() => {
    async function initDashboard() {
      try {
        console.log('🚀 Basic Dashboard: Starting...');
        
        // Check authentication
        const isAuth = authService.isAuthenticated();
        const isAdmin = authService.isAdmin();
        const user = authService.getCurrentUser();
        
        console.log('🔐 Auth status:', { isAuth, isAdmin, user });
        
        if (!isAuth) {
          setAuthStatus('not_authenticated');
          setError('Not authenticated. Please login first.');
          setLoading(false);
          return;
        }
        
        if (!isAdmin) {
          setAuthStatus('not_admin');
          setError('Not authorized as admin. Please use admin account.');
          setLoading(false);
          return;
        }
        
        setAuthStatus('authenticated');
        
        // Set some default data
        setSummary({
          totalShipments: 150,
          activeUsers: 45,
          revenue: 25000,
          pendingDeliveries: 8
        });
        
        console.log('✅ Basic dashboard loaded successfully');
        
      } catch (err) {
        console.error('❌ Dashboard error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    initDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading basic dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Auth Status: {authStatus}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-amber-500 text-white py-2 px-4 rounded hover:bg-amber-600"
            >
              Reload Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Back to Home
            </button>
            <button
              onClick={() => window.location.href = '/admin/debug'}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Debug Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Basic Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✅ Working
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-sm"
            >
              Reload
            </button>
          </div>
        </div>

        {/* Auth Status */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Authentication Status</h3>
          <p className="text-green-700">✅ Successfully authenticated as admin</p>
          <p className="text-sm text-green-600 mt-1">User: {authService.getCurrentUser()?.name} ({authService.getCurrentUser()?.email})</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-amber-600">{summary.totalShipments}</div>
            <div className="text-gray-800 mt-2 font-medium">Total Shipments</div>
            <div className="text-xs text-gray-600 mt-1">Sample data</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{summary.activeUsers}</div>
            <div className="text-gray-800 mt-2 font-medium">Active Users</div>
            <div className="text-xs text-gray-600 mt-1">Sample data</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">₹{summary.revenue.toLocaleString()}</div>
            <div className="text-gray-800 mt-2 font-medium">Revenue</div>
            <div className="text-xs text-gray-600 mt-1">Sample data</div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{summary.pendingDeliveries}</div>
            <div className="text-gray-800 mt-2 font-medium">Pending Deliveries</div>
            <div className="text-xs text-gray-600 mt-1">Sample data</div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black">Dashboard Status</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Basic dashboard loaded successfully</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Authentication working properly</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Real-time features disabled for testing</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Using sample data for display</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-black">Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Full Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/admin/simple'}
              className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              Simple Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/admin/debug'}
              className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Debug Info
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gray-500 text-white p-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}