"use client";
import { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { RefreshCw, Wifi, WifiOff, Activity, TrendingUp } from 'lucide-react';
import AdminDashboardSkeleton from '@/components/admin/AdminDashboardSkeleton';
import { 
  useRealTimeDashboard, 
  useRealTimeShipments, 
  useRealTimeAnalytics, 
  useRealTimeNotifications 
} from '@/hooks/useRealTimeData';

export default function RealTimeAdminDashboard() {
  const [users, setUsers] = useState([]);

  // Real-time data hooks - yeh sab real-time data denge
  const {
    data: summary,
    loading: summaryLoading,
    isConnected: summaryConnected,
    lastUpdate: summaryUpdate,
    refresh: refreshSummary
  } = useRealTimeDashboard({
    onUpdate: (data) => {
      console.log('🔄 Real-time dashboard update:', data);
    }
  });

  const {
    data: recentShipments,
    loading: shipmentsLoading,
    isConnected: shipmentsConnected,
    lastUpdate: shipmentsUpdate,
    refresh: refreshShipments
  } = useRealTimeShipments({
    interval: 2000, // 2 seconds - bahut fast updates for shipments
    onUpdate: (data) => {
      console.log('🚚 Real-time shipments update:', data);
    }
  });

  const {
    data: analyticsData,
    loading: analyticsLoading,
    isConnected: analyticsConnected,
    lastUpdate: analyticsUpdate,
    refresh: refreshAnalytics
  } = useRealTimeAnalytics({
    interval: 5000, // 5 seconds for analytics
    onUpdate: (data) => {
      console.log('📊 Real-time analytics update:', data);
    }
  });

  const {
    data: notifications,
    loading: notificationsLoading,
    isConnected: notificationsConnected,
    lastUpdate: notificationsUpdate,
    refresh: refreshNotifications
  } = useRealTimeNotifications({
    interval: 1000, // 1 second - fastest for notifications
    onUpdate: (data) => {
      console.log('🔔 Real-time notifications update:', data);
    }
  });

  // Overall connection status
  const isConnected = summaryConnected || shipmentsConnected || analyticsConnected || notificationsConnected;
  const loading = summaryLoading && shipmentsLoading && analyticsLoading && notificationsLoading;
  
  const lastUpdate = new Date(Math.max(
    summaryUpdate?.getTime() || 0,
    shipmentsUpdate?.getTime() || 0,
    analyticsUpdate?.getTime() || 0,
    notificationsUpdate?.getTime() || 0
  ));

  // Chart data from analytics
  const chartData = analyticsData?.shipmentTrends ? {
    labels: analyticsData.shipmentTrends.map(item => {
      const date = new Date(item._id);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Daily Shipments',
        data: analyticsData.shipmentTrends.map(item => item.count),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: '#f59e0b',
        borderWidth: 2,
        borderRadius: 6,
        tension: 0.4,
      },
    ],
  } : null;

  // Load users (non-real-time data)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem('admin_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://delivery-backend100.vercel.app/api'}/admin/users`, { headers });
        if (response.ok) {
          const usersData = await response.json();
          setUsers(usersData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Manual refresh all data
  const refreshAll = () => {
    console.log('🔄 Manual refresh all real-time data');
    refreshSummary();
    refreshShipments();
    refreshAnalytics();
    refreshNotifications();
  };

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Real-time Status */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black flex items-center">
            <Activity className="w-8 h-8 mr-3 text-amber-500" />
            Real-Time Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Live delivery tracking and management</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
            {isConnected ? 'Live Updates Active' : 'Connection Lost'}
          </div>
          
          {/* Last Update Time */}
          <div className="text-sm text-gray-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          
          {/* Manual Refresh */}
          <button
            onClick={refreshAll}
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </button>
        </div>
      </div>

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl shadow-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform relative">
          {summaryConnected && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
          <span className="text-3xl font-bold text-amber-600">{summary?.totalShipments || 0}</span>
          <span className="text-gray-800 mt-2 font-medium">Active Shipments</span>
          <div className="w-full bg-amber-200 rounded-full h-2 mt-3">
            <div className="bg-amber-500 h-2 rounded-full" style={{width: '75%'}}></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform relative">
          {summaryConnected && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
          <span className="text-3xl font-bold text-blue-600">{summary?.totalUsers || 0}</span>
          <span className="text-gray-800 mt-2 font-medium">Active Users</span>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
            <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform relative">
          {summaryConnected && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
          <span className="text-3xl font-bold text-green-600">${(summary?.totalRevenue || 0).toLocaleString()}</span>
          <span className="text-gray-800 mt-2 font-medium">Revenue</span>
          <div className="w-full bg-green-200 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl shadow-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform relative">
          {summaryConnected && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
          <span className="text-3xl font-bold text-red-600">{summary?.pendingDeliveries || 0}</span>
          <span className="text-gray-800 mt-2 font-medium">Pending Deliveries</span>
          <div className="w-full bg-red-200 rounded-full h-2 mt-3">
            <div className="bg-red-500 h-2 rounded-full" style={{width: '30%'}}></div>
          </div>
        </div>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Shipment Trends Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative">
          {analyticsConnected && (
            <div className="absolute top-4 right-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Live Shipment Trends
          </h3>
          <div className="h-80">
            {chartData ? (
              <Bar data={chartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#000' } }
                },
                scales: {
                  x: { ticks: { color: '#000' } },
                  y: { ticks: { color: '#000', beginAtZero: true } }
                }
              }} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-500">Loading real-time data...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative">
          {analyticsConnected && (
            <div className="absolute top-4 right-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
          <h3 className="text-lg font-semibold text-black mb-4">Live Status Distribution</h3>
          <div className="h-80">
            {analyticsData?.statusDistribution ? (
              <Doughnut data={{
                labels: analyticsData.statusDistribution.map(item => item._id),
                datasets: [{
                  data: analyticsData.statusDistribution.map(item => item.count),
                  backgroundColor: [
                    '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'
                  ],
                  borderWidth: 2,
                  borderColor: '#fff',
                }]
              }} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#000' }, position: 'bottom' }
                }
              }} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-500">Loading status data...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Live Shipments */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative">
          {shipmentsConnected && (
            <div className="absolute top-4 right-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Live Shipment Activity
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentShipments && recentShipments.length > 0 ? (
              recentShipments.slice(0, 8).map((shipment, index) => (
                <div key={shipment.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-800">{shipment.trackingId || shipment.id}</div>
                    <div className="text-sm text-gray-600">{shipment.origin} → {shipment.destination}</div>
                    <div className="text-xs text-gray-500">{shipment.customer}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                      shipment.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {shipment.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(shipment.date || shipment.updatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                <p className="text-gray-500">Loading live shipments...</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Notifications */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative">
          {notificationsConnected && (
            <div className="absolute top-4 right-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-500" />
            Live Notifications
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 8).map((notification, index) => (
                <div key={notification.id || index} className={`p-3 rounded-lg border-l-4 ${
                  notification.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' :
                  notification.type === 'critical' ? 'bg-red-50 border-red-400 text-red-800' :
                  notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
                  notification.type === 'info' ? 'bg-blue-50 border-blue-400 text-blue-800' :
                  'bg-gray-50 border-gray-400 text-gray-800'
                }`}>
                  <div className="text-sm font-medium">{notification.title}</div>
                  <div className="text-sm mt-1">{notification.message}</div>
                  <div className="text-xs opacity-75 mt-2">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                <p className="text-gray-500">Loading live notifications...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regional Distribution */}
      {analyticsData?.regionalData && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-200 relative">
          {analyticsConnected && (
            <div className="absolute top-4 right-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
          <h3 className="text-lg font-semibold mb-4 text-black">Live Regional Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.regionalData.slice(0, 6).map((region, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">{region._id}</span>
                  <span className="text-lg font-bold text-amber-600">{region.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                    style={{
                      width: `${Math.min((region.count / Math.max(...analyticsData.regionalData.map(r => r.count))) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Status Footer */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className={`flex items-center ${summaryConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${summaryConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              Dashboard Data
            </div>
            <div className={`flex items-center ${shipmentsConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${shipmentsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              Shipments Feed
            </div>
            <div className={`flex items-center ${analyticsConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${analyticsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              Analytics
            </div>
            <div className={`flex items-center ${notificationsConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${notificationsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              Notifications
            </div>
          </div>
          <div className="text-gray-600">
            Real-time delivery tracking system active
          </div>
        </div>
      </div>
    </div>
  );
}