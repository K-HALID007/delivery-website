"use client";
import { useState, useEffect, useCallback } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartsRow from '@/components/admin/charts/ChartsRow';
import { useSocket } from '@/hooks/useSocket';
import { RefreshCw } from 'lucide-react';
import AdminDashboardSkeleton from '@/components/admin/AdminDashboardSkeleton';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [userGrowth, setUserGrowth] = useState(null);
  const [shipmentHeatmap, setShipmentHeatmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  // Initialize socket connection
  const { on, off } = useSocket();

  // Real-time data update handler
  const handleDashboardUpdate = useCallback((data) => {
    console.log('Real-time dashboard update received:', data);
    setSummary(prev => ({
      totalShipments: data.activeShipments || prev?.totalShipments || 0,
      activeUsers: data.totalUsers || prev?.activeUsers || 0,
      revenue: data.totalRevenue || prev?.revenue || 0,
      pendingDeliveries: data.pendingDeliveries || prev?.pendingDeliveries || 0,
    }));
    setLastUpdate(new Date());
    
    // Add notification for real-time update
    setNotifications(prev => [
      { id: Date.now(), message: 'Dashboard data updated in real-time', type: 'info' },
      ...prev.slice(0, 4) // Keep only last 5 notifications
    ]);
  }, []);

  // Real-time shipment update handler
  const handleShipmentUpdate = useCallback((data) => {
    console.log('Real-time shipment update received:', data);
    setNotifications(prev => [
      { 
        id: Date.now(), 
        message: `Shipment ${data.trackingId} status updated to ${data.status}`, 
        type: 'success' 
      },
      ...prev.slice(0, 4)
    ]);
    
    // Update recent shipments
    setRecentShipments(prev => {
      const updated = prev.map(shipment => 
        shipment.id === data.trackingId || shipment.trackingId === data.trackingId
          ? { ...shipment, status: data.status, currentLocation: data.currentLocation }
          : shipment
      );
      return updated;
    });
  }, []);

  // Real-time analytics update handler
  const handleAnalyticsUpdate = useCallback((data) => {
    console.log('Real-time analytics update received:', data);
    if (data) {
      setRealTimeData(data);
      setLastUpdate(new Date());
      
      // Update chart data if shipment trends are available
      if (data.shipmentTrends && data.shipmentTrends.length > 0) {
        setChartData({
          labels: data.shipmentTrends.map(item => {
            const date = new Date(item._id);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }),
          datasets: [
            {
              label: 'Daily Shipments',
              data: data.shipmentTrends.map(item => item.count),
              backgroundColor: 'rgba(251, 191, 36, 0.8)',
              borderColor: '#f59e0b',
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
              hoverBackgroundColor: 'rgba(251, 191, 36, 1)',
              hoverBorderColor: '#d97706',
              hoverBorderWidth: 3,
            },
          ],
        });
      }

      // Update regional heatmap
      if (data.regionalData && data.regionalData.length > 0) {
        setShipmentHeatmap({
          regions: data.regionalData.map(item => ({
            region: item._id,
            count: item.count
          }))
        });
      }
    }
  }, []);

  // Setup socket event listeners
  useEffect(() => {
    on('connect', () => {
      setConnectionStatus('Connected');
      console.log('Socket connected');
    });

    on('disconnect', () => {
      setConnectionStatus('Disconnected');
      console.log('Socket disconnected');
    });

    on('dashboard-update', handleDashboardUpdate);
    on('shipment-update', handleShipmentUpdate);
    on('analytics-update', handleAnalyticsUpdate);

    return () => {
      off('connect');
      off('disconnect');
      off('dashboard-update', handleDashboardUpdate);
      off('shipment-update', handleShipmentUpdate);
      off('analytics-update', handleAnalyticsUpdate);
    };
  }, [on, off, handleDashboardUpdate, handleShipmentUpdate, handleAnalyticsUpdate]);

  // Fetch real-time analytics data
  const fetchRealTimeAnalytics = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('http://localhost:5000/api/admin/analytics/realtime', { headers });
      const data = await response.json();
      console.log('Fetched real-time analytics data:', data);
      setRealTimeData(data);
      
      // Update charts with real data
      if (data.shipmentTrends && data.shipmentTrends.length > 0) {
        setChartData({
          labels: data.shipmentTrends.map(item => {
            const date = new Date(item._id);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }),
          datasets: [
            {
              label: 'Daily Shipments',
              data: data.shipmentTrends.map(item => item.count),
              backgroundColor: 'rgba(251, 191, 36, 0.8)',
              borderColor: '#f59e0b',
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
              hoverBackgroundColor: 'rgba(251, 191, 36, 1)',
              hoverBorderColor: '#d97706',
              hoverBorderWidth: 3,
            },
          ],
        });
      }

      if (data.userGrowth && data.userGrowth.length > 0) {
        setUserGrowth({
          labels: data.userGrowth.map(item => item._id),
          monthly: data.userGrowth.map(item => item.count)
        });
      }

      // Update regional heatmap
      if (data.regionalData && data.regionalData.length > 0) {
        setShipmentHeatmap({
          regions: data.regionalData.map(item => ({
            region: item._id,
            count: item.count
          }))
        });
      }
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
    }
  }, []);

  // Fetch revenue analytics
  const fetchRevenueAnalytics = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('http://localhost:5000/api/admin/analytics/revenue', { headers });
      const data = await response.json();
      
      console.log('Real revenue data received:', data);
      setRevenueAnalytics(data);
      
      // Update notifications with revenue info
      if (data.totalRevenue > 0) {
        setNotifications(prev => [
          { 
            id: Date.now(), 
            message: `Total Revenue: ${data.totalRevenue.toLocaleString()} | Avg Order: ${data.averageOrderValue?.toFixed(2) || '0'}`, 
            type: 'success' 
          },
          ...prev.slice(0, 4)
        ]);
      }
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      // Fallback to mock data
      setRevenueAnalytics({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        monthly: [12000, 15000, 18000, 22000, 25000, 28000],
        totalRevenue: 0,
        daily: [],
        revenueByStatus: []
      });
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = sessionStorage.getItem('admin_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Summary
        console.log('🔍 Fetching admin summary data...');
        const res = await fetch('http://localhost:5000/api/admin/summary', { headers });
        console.log('📡 Summary API Response:', res.status, res.statusText);
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('❌ Summary API Error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch summary');
        }
        
        const summaryData = await res.json();
        console.log('📊 Summary Data Received:', summaryData);
        
        setSummary({
          totalShipments: summaryData.activeShipments || 0,
          activeUsers: summaryData.totalUsers || 0,
          revenue: summaryData.totalRevenue || 0,
          pendingDeliveries: summaryData.pendingDeliveries || 0,
        });
        
        // Recent Shipments
        console.log('🔍 Fetching recent shipments...');
        const chartRes = await fetch('http://localhost:5000/api/admin/shipments/recent', { headers });
        console.log('📡 Shipments API Response:', chartRes.status, chartRes.statusText);
        
        if (chartRes.ok) {
          const chartJson = await chartRes.json();
          console.log('📦 Shipments Data Received:', chartJson.length, 'shipments');
          setRecentShipments(chartJson);
        } else {
          console.error('❌ Failed to fetch shipments');
          setRecentShipments([]);
        }
        
        // Users
        console.log('🔍 Fetching users data...');
        const usersRes = await fetch('http://localhost:5000/api/admin/users', { headers });
        console.log('📡 Users API Response:', usersRes.status, usersRes.statusText);
        
        if (usersRes.ok) {
          const usersJson = await usersRes.json();
          console.log('👥 Users Data Received:', usersJson.length, 'users');
          setUsers(usersJson);
        } else {
          console.error('❌ Failed to fetch users');
          setUsers([]);
        }
        
        // Initial notifications
        setNotifications([
          { id: 1, message: 'Real-time dashboard initialized', type: 'info' },
          { id: 2, message: `Connected to server - ${connectionStatus}`, type: 'success' },
        ]);

        // Fetch real-time analytics
        await fetchRealTimeAnalytics();
        await fetchRevenueAnalytics();
        
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
        setSummary({ totalShipments: 0, activeUsers: 0, revenue: 0, pendingDeliveries: 0 });
        setChartData({ labels: [], datasets: [] });
        setUsers([]);
        setRecentShipments([]);
        setNotifications([
          { id: 1, message: 'Error loading dashboard data', type: 'error' }
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    // Set up periodic refresh for real-time data
    const interval = setInterval(() => {
      fetchRealTimeAnalytics();
      fetchRevenueAnalytics();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchRealTimeAnalytics, fetchRevenueAnalytics, connectionStatus]);

  if (loading || !summary) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">Real-Time Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            connectionStatus === 'Connected' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {connectionStatus}
          </div>
          <div className="text-sm text-gray-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl shadow-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform">
          <span className="text-3xl font-bold text-amber-600">{summary.totalShipments}</span>
          <span className="text-gray-800 mt-2 font-medium">Active Shipments</span>
          <div className="w-full bg-amber-200 rounded-full h-2 mt-3">
            <div className="bg-amber-500 h-2 rounded-full" style={{width: '75%'}}></div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform">
          <span className="text-3xl font-bold text-blue-600">{summary.activeUsers}</span>
          <span className="text-gray-800 mt-2 font-medium">Active Users</span>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
            <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform">
          <span className="text-3xl font-bold text-green-600">${summary.revenue.toLocaleString()}</span>
          <span className="text-gray-800 mt-2 font-medium">Revenue</span>
          <div className="w-full bg-green-200 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl shadow-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform">
          <span className="text-3xl font-bold text-red-600">{summary.pendingDeliveries}</span>
          <span className="text-gray-800 mt-2 font-medium">Pending Deliveries</span>
          <div className="w-full bg-red-200 rounded-full h-2 mt-3">
            <div className="bg-red-500 h-2 rounded-full" style={{width: '30%'}}></div>
          </div>
        </div>
      </div>

      {/* Quick Analytics Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Quick Analytics Overview
          </h2>
          <a 
            href="/admin/analytics" 
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors text-sm font-medium"
          >
            View Full Analytics →
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today's Performance */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-600 mb-2">Today's Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New Shipments</span>
                <span className="text-sm font-semibold text-blue-800">
                  {chartData?.datasets?.[0]?.data?.slice(-1)[0] || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="text-sm font-semibold text-blue-800">
                  ${revenueAnalytics?.daily?.slice(-1)[0]?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>

          {/* This Week */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-600 mb-2">This Week</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Shipments</span>
                <span className="text-sm font-semibold text-green-800">
                  {chartData?.datasets?.[0]?.data?.slice(-7).reduce((a, b) => a + b, 0) || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Growth</span>
                <span className="text-sm font-semibold text-green-800">+12.5%</span>
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-600 mb-2">This Month</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="text-sm font-semibold text-purple-800">
                  ${revenueAnalytics?.monthly?.slice(-1)[0]?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Order</span>
                <span className="text-sm font-semibold text-purple-800">
                  ${revenueAnalytics?.averageOrderValue?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Current Status Overview */}
      {realTimeData && realTimeData.statusDistribution && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Current Status Overview
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchRealTimeAnalytics}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </button>
              <a 
                href="/admin/analytics" 
                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                View Detailed Charts →
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {realTimeData.statusDistribution.slice(0, 4).map((status, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl font-bold text-gray-800">{status.count}</div>
                <div className="text-sm text-gray-600">{status._id}</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-amber-500 h-1 rounded-full" 
                    style={{
                      width: `${Math.min((status.count / Math.max(...realTimeData.statusDistribution.map(s => s.count))) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Performance Indicators */}
      {revenueAnalytics && revenueAnalytics.totalRevenue > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Key Performance Indicators
            </h3>
            <a 
              href="/admin/analytics" 
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              View Revenue Analytics →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Revenue */}
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${revenueAnalytics.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Revenue</div>
              <div className="text-xs text-green-700 mt-1">All time</div>
            </div>

            {/* Average Order Value */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${revenueAnalytics.averageOrderValue?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600 mt-1">Average Order Value</div>
              <div className="text-xs text-blue-700 mt-1">Per shipment</div>
            </div>

            {/* Monthly Growth */}
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {revenueAnalytics.monthly && revenueAnalytics.monthly.length >= 2 
                  ? `${(((revenueAnalytics.monthly[revenueAnalytics.monthly.length - 1] - revenueAnalytics.monthly[revenueAnalytics.monthly.length - 2]) / (revenueAnalytics.monthly[revenueAnalytics.monthly.length - 2] || 1)) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
              <div className="text-sm text-gray-600 mt-1">Monthly Growth</div>
              <div className="text-xs text-purple-700 mt-1">vs last month</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Shipment Heatmap */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-black">Regional Distribution</h3>
        {shipmentHeatmap && shipmentHeatmap.regions && shipmentHeatmap.regions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shipmentHeatmap.regions.map((r, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">{r.region}</span>
                  <span className="text-lg font-bold text-amber-600">{r.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full" 
                    style={{width: `${Math.min((r.count / Math.max(...shipmentHeatmap.regions.map(reg => reg.count))) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">No regional data available.</div>
        )}
      </div>

      {/* Advanced Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-black flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentShipments.slice(0, 10).map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-800">{s.id || s.trackingId}</div>
                  <div className="text-sm text-gray-600">{s.origin} → {s.destination}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  s.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  s.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                  s.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Notifications */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-black flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Live Notifications
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.map(n => (
              <div key={n.id} className={`p-3 rounded-lg border-l-4 ${
                n.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' :
                n.type === 'info' ? 'bg-blue-50 border-blue-400 text-blue-800' :
                n.type === 'error' ? 'bg-red-50 border-red-400 text-red-800' :
                'bg-gray-50 border-gray-400 text-gray-800'
              }`}>
                <div className="text-sm">{n.message}</div>
                <div className="text-xs opacity-75 mt-1">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-10 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-black">User Management</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.slice(0, 10).map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}