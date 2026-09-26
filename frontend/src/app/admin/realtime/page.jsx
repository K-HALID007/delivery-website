"use client";
import { useState, useEffect } from 'react';
import { RefreshCw, Activity, Wifi, WifiOff } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { 
  useRealTimeDashboard, 
  useRealTimeShipments, 
  useRealTimeAnalytics, 
  useRealTimeNotifications 
} from '@/hooks/useRealTimeData';

export default function RealTimeAdminDashboard() {
  const [summary, setSummary] = useState({ totalShipments: 0, activeUsers: 0, revenue: 0, pendingDeliveries: 0 });
  const [recentShipments, setRecentShipments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [realTimeData, setRealTimeData] = useState(null);

  // Real-time dashboard data
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    lastUpdate: dashboardLastUpdate,
    isConnected: dashboardConnected,
    refresh: refreshDashboard
  } = useRealTimeDashboard({
    enabled: true,
    interval: 5000, // 5 seconds
    onUpdate: (data) => {
      console.log('📊 Real-time dashboard update:', data);
      setSummary({
        totalShipments: data.activeShipments || data.totalShipments || 0,
        activeUsers: data.totalUsers || data.activeUsers || 0,
        revenue: data.totalRevenue || data.revenue || 0,
        pendingDeliveries: data.pendingDeliveries || 0,
      });
    },
    onError: (error) => {
      console.error('Dashboard error:', error);
    }
  });

  // Real-time shipments data
  const {
    data: shipmentsData,
    loading: shipmentsLoading,
    error: shipmentsError,
    lastUpdate: shipmentsLastUpdate,
    isConnected: shipmentsConnected,
    refresh: refreshShipments
  } = useRealTimeShipments({
    enabled: true,
    interval: 3000, // 3 seconds
    onUpdate: (data) => {
      console.log('🚚 Real-time shipments update:', data);
      setRecentShipments(Array.isArray(data) ? data.slice(0, 10) : []);
    }
  });

  // Real-time analytics data
  const {
    data: analyticsData,
    loading: analyticsLoading,
    error: analyticsError,
    lastUpdate: analyticsLastUpdate,
    isConnected: analyticsConnected,
    refresh: refreshAnalytics
  } = useRealTimeAnalytics({
    enabled: true,
    interval: 10000, // 10 seconds
    onUpdate: (data) => {
      console.log('📈 Real-time analytics update:', data);
      setRealTimeData(data);
    }
  });

  // Real-time notifications
  const {
    data: notificationsData,
    loading: notificationsLoading,
    error: notificationsError,
    lastUpdate: notificationsLastUpdate,
    isConnected: notificationsConnected,
    refresh: refreshNotifications
  } = useRealTimeNotifications({
    enabled: true,
    interval: 2000, // 2 seconds
    onUpdate: (data) => {
      console.log('🔔 Real-time notifications update:', data);
      const newNotifications = Array.isArray(data) ? data : [];
      setNotifications([
        ...newNotifications.slice(0, 5),
        { 
          id: Date.now(), 
          message: `Real-time update: ${new Date().toLocaleTimeString()}`, 
          type: 'info' 
        }
      ]);
    }
  });

  // Overall connection status
  const isRealTimeConnected = dashboardConnected || shipmentsConnected || analyticsConnected || notificationsConnected;
  const anyLoading = dashboardLoading || shipmentsLoading || analyticsLoading || notificationsLoading;
  const anyError = dashboardError || shipmentsError || analyticsError || notificationsError;

  const lastUpdate = new Date(Math.max(
    dashboardLastUpdate?.getTime() || 0,
    shipmentsLastUpdate?.getTime() || 0,
    analyticsLastUpdate?.getTime() || 0,
    notificationsLastUpdate?.getTime() || 0
  ));

  // Manual refresh all
  const refreshAll = () => {
    console.log('🔄 Manual refresh all data...');
    refreshDashboard();
    refreshShipments();
    refreshAnalytics();
    refreshNotifications();
  };

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      window.location.href = '/admin/login';
    }
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Real-time Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isRealTimeConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isRealTimeConnected ? (
                <>
                  <Wifi className="w-4 h-4 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 mr-1" />
                  Disconnected
                </>
              )}
            </div>

            {/* Loading Indicator */}
            {anyLoading && (
              <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Activity className="w-4 h-4 mr-1 animate-spin" />
                Loading...
              </div>
            )}

            {/* Last Update */}
            <div className="text-sm text-gray-600">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>

            {/* Manual Refresh */}
            <button
              onClick={refreshAll}
              className="flex items-center px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {anyError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Connection Issues:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {dashboardError && <li>• Dashboard: {dashboardError}</li>}
              {shipmentsError && <li>• Shipments: {shipmentsError}</li>}
              {analyticsError && <li>• Analytics: {analyticsError}</li>}
              {notificationsError && <li>• Notifications: {notificationsError}</li>}
            </ul>
          </div>
        )}

        {/* Real-time Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl shadow-lg p-6 text-center transition-all duration-300 ${
            dashboardConnected ? 'bg-gradient-to-r from-green-50 to-green-100' : 'bg-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Dashboard</span>
              <div className={`w-3 h-3 rounded-full ${dashboardConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {dashboardLoading ? '...' : (dashboardConnected ? 'Live' : 'Offline')}
            </div>
          </div>

          <div className={`rounded-xl shadow-lg p-6 text-center transition-all duration-300 ${
            shipmentsConnected ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Shipments</span>
              <div className={`w-3 h-3 rounded-full ${shipmentsConnected ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {shipmentsLoading ? '...' : (shipmentsConnected ? 'Live' : 'Offline')}
            </div>
          </div>

          <div className={`rounded-xl shadow-lg p-6 text-center transition-all duration-300 ${
            analyticsConnected ? 'bg-gradient-to-r from-purple-50 to-purple-100' : 'bg-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Analytics</span>
              <div className={`w-3 h-3 rounded-full ${analyticsConnected ? 'bg-purple-500 animate-pulse' : 'bg-gray-400'}`}></div>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {analyticsLoading ? '...' : (analyticsConnected ? 'Live' : 'Offline')}
            </div>
          </div>

          <div className={`rounded-xl shadow-lg p-6 text-center transition-all duration-300 ${
            notificationsConnected ? 'bg-gradient-to-r from-amber-50 to-amber-100' : 'bg-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Notifications</span>
              <div className={`w-3 h-3 rounded-full ${notificationsConnected ? 'bg-amber-500 animate-pulse' : 'bg-gray-400'}`}></div>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {notificationsLoading ? '...' : (notificationsConnected ? 'Live' : 'Offline')}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-amber-600">{summary.totalShipments}</div>
            <div className="text-gray-800 mt-2 font-medium">Total Shipments</div>
            <div className="text-xs text-gray-600 mt-1">
              {dashboardConnected ? 'Real-time' : 'Last known'}
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{summary.activeUsers}</div>
            <div className="text-gray-800 mt-2 font-medium">Active Users</div>
            <div className="text-xs text-gray-600 mt-1">
              {dashboardConnected ? 'Real-time' : 'Last known'}
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">₹{summary.revenue.toLocaleString()}</div>
            <div className="text-gray-800 mt-2 font-medium">Revenue</div>
            <div className="text-xs text-gray-600 mt-1">
              {dashboardConnected ? 'Real-time' : 'Last known'}
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{summary.pendingDeliveries}</div>
            <div className="text-gray-800 mt-2 font-medium">Pending Deliveries</div>
            <div className="text-xs text-gray-600 mt-1">
              {dashboardConnected ? 'Real-time' : 'Last known'}
            </div>
          </div>
        </div>

        {/* Real-time Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Shipments */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Recent Shipments</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${shipmentsConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {shipmentsConnected ? 'Live updates' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentShipments.length > 0 ? (
                recentShipments.map((shipment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-800">{shipment.id || shipment.trackingId || `#${index + 1}`}</div>
                      <div className="text-sm text-gray-600">{shipment.origin || 'Unknown'} → {shipment.destination || 'Unknown'}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                      shipment.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {shipment.status || 'Unknown'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {shipmentsLoading ? 'Loading shipments...' : 'No recent shipments'}
                </div>
              )}
            </div>
          </div>

          {/* Live Notifications */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Live Notifications</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${notificationsConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {notificationsConnected ? 'Live updates' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div key={notification.id || index} className={`p-3 rounded-lg border-l-4 ${
                    notification.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' :
                    notification.type === 'info' ? 'bg-blue-50 border-blue-400 text-blue-800' :
                    notification.type === 'error' ? 'bg-red-50 border-red-400 text-red-800' :
                    notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
                    'bg-gray-50 border-gray-400 text-gray-800'
                  }`}>
                    <div className="text-sm">{notification.message}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {notificationsLoading ? 'Loading notifications...' : 'No notifications'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Data */}
        {realTimeData && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Real-time Analytics</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${analyticsConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {analyticsConnected ? 'Live data' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {realTimeData.statusDistribution && realTimeData.statusDistribution.map((status, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{status.count}</div>
                  <div className="text-sm text-gray-600">{status._id}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Back to Main Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/admin/simple'}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Simple Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}