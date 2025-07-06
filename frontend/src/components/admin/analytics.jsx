"use client";
import { useState, useEffect, useCallback } from 'react';
import { Bar, Line, Doughnut, Pie, Radar } from 'react-chartjs-2';
import 'chart.js/auto';
import { 
  TrendingUp, 
  TrendingUp as RevenueIcon, 
  Package, 
  Users, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { API_URL } from '../../services/api.config.js';

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('admin_token');
      
      console.log('🔍 Fetching analytics data...');
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.error('❌ No admin token found');
        alert('Please login as admin first');
        window.location.href = '/admin/login';
        return;
      }
      
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('📊 Fetching realtime analytics...');
      // Fetch real-time analytics
      const analyticsResponse = await fetch(`${API_URL}/admin/analytics/realtime`, { 
        method: 'GET',
        headers 
      });
      
      console.log('Analytics response status:', analyticsResponse.status);
      
      if (!analyticsResponse.ok) {
        const errorText = await analyticsResponse.text();
        console.error('Analytics API error:', errorText);
        throw new Error(`Analytics API failed: ${analyticsResponse.status} - ${errorText}`);
      }
      
      const analytics = await analyticsResponse.json();
      console.log('✅ Analytics data received:', analytics);
      
      console.log('💰 Fetching revenue analytics...');
      // Fetch revenue analytics
      const revenueResponse = await fetch(`${API_URL}/admin/analytics/revenue`, { 
        method: 'GET',
        headers 
      });
      
      console.log('Revenue response status:', revenueResponse.status);
      
      if (!revenueResponse.ok) {
        const errorText = await revenueResponse.text();
        console.error('Revenue API error:', errorText);
        throw new Error(`Revenue API failed: ${revenueResponse.status} - ${errorText}`);
      }
      
      const revenue = await revenueResponse.json();
      console.log('✅ Revenue data received:', revenue);
      
      setAnalyticsData(analytics);
      setRevenueData(revenue);
      setLastUpdate(new Date());
      
      console.log('✅ Analytics data updated successfully');
      
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      alert(`Analytics loading failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchAnalyticsData, 120000);
    return () => clearInterval(interval);
  }, [fetchAnalyticsData]);

  // Chart configurations
  const getShipmentTrendsChart = () => {
    if (!analyticsData?.shipmentTrends) return null;
    
    return {
      labels: analyticsData.shipmentTrends.map(item => {
        const date = new Date(item._id);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Daily Shipments',
          data: analyticsData.shipmentTrends.map(item => item.count),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: '#3b82f6',
          borderWidth: 2,
          borderRadius: 6,
          tension: 0.4,
        },
      ],
    };
  };

  const getRevenueChart = () => {
    if (!revenueData?.labels) return null;
    
    return {
      labels: revenueData.labels,
      datasets: [
        {
          label: 'Monthly Revenue (₹)',
          data: revenueData.monthly,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    };
  };

  const getUserGrowthChart = () => {
    if (!analyticsData?.userGrowth) return null;
    
    return {
      labels: analyticsData.userGrowth.map(item => item._id),
      datasets: [
        {
          label: 'New Users',
          data: analyticsData.userGrowth.map(item => item.count),
          backgroundColor: 'rgba(251, 191, 36, 0.8)',
          borderColor: '#f59e0b',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };
  };

  const getStatusDistributionChart = () => {
    if (!analyticsData?.statusDistribution) return null;
    
    return {
      labels: analyticsData.statusDistribution.map(item => item._id),
      datasets: [
        {
          data: analyticsData.statusDistribution.map(item => item.count),
          backgroundColor: [
            '#f59e0b', // amber
            '#10b981', // green
            '#3b82f6', // blue
            '#ef4444', // red
            '#8b5cf6', // purple
            '#f97316', // orange
          ],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  };

  const getRegionalChart = () => {
    if (!analyticsData?.regionalData) return null;
    
    return {
      labels: analyticsData.regionalData.map(item => item._id),
      datasets: [
        {
          label: 'Shipments by Region',
          data: analyticsData.regionalData.map(item => item.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
          ],
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    };
  };

  const getRevenueByStatusChart = () => {
    if (!revenueData?.revenueByStatus) return null;
    
    return {
      labels: revenueData.revenueByStatus.map(item => item._id),
      datasets: [
        {
          data: revenueData.revenueByStatus.map(item => item.revenue),
          backgroundColor: [
            '#10b981', // green for delivered
            '#3b82f6', // blue for in transit
            '#f59e0b', // amber for processing
            '#ef4444', // red for cancelled
            '#8b5cf6', // purple for pending
          ],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#000' },
        position: 'top'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      x: {
        ticks: { color: '#000' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      },
      y: {
        ticks: { color: '#000', beginAtZero: true },
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#000' },
        position: 'bottom'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading Analytics...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  // Debug section - show if no data is loaded
  if (!analyticsData && !revenueData) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">Analytics Data Not Available</h2>
            <div className="space-y-2 text-sm text-red-700">
              <p>• Check browser console (F12) for detailed errors</p>
              <p>• Ensure you are logged in as admin</p>
              <p>• Verify backend server is running on port 5000</p>
              <p>• Check if MongoDB is running</p>
            </div>
            <div className="mt-4 space-x-4">
              <button
                onClick={fetchAnalyticsData}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry Loading
              </button>
              <button
                onClick={() => window.location.href = '/admin/login'}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Login as Admin
              </button>
            </div>
          </div>
          
          {/* Debug Info */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Debug Information:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Admin Token: {sessionStorage.getItem('admin_token') ? '✅ Present' : '❌ Missing'}</p>
              <p>Analytics Data: {analyticsData ? '✅ Loaded' : '❌ Not loaded'}</p>
              <p>Revenue Data: {revenueData ? '✅ Loaded' : '❌ Not loaded'}</p>
              <p>Last Update: {lastUpdate.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights and data visualization</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          
          <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Shipments</p>
              <p className="text-3xl font-bold text-blue-800">
                {analyticsData?.shipmentTrends?.reduce((sum, item) => sum + item.count, 0) || 0}
              </p>
            </div>
            <Package className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-800">
                ₹{revenueData?.totalRevenue?.toLocaleString() || '0'}
              </p>
            </div>
            <RevenueIcon className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-medium">New Users</p>
              <p className="text-3xl font-bold text-amber-800">
                {analyticsData?.userGrowth?.reduce((sum, item) => sum + item.count, 0) || 0}
              </p>
            </div>
            <Users className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Avg Order Value</p>
              <p className="text-3xl font-bold text-purple-800">
                ₹{revenueData?.averageOrderValue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Shipment Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Shipment Trends
            </h3>
          </div>
          <div className="h-80">
            {getShipmentTrendsChart() ? (
              <Bar data={getShipmentTrendsChart()} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded">
                <div className="text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No shipment data available</p>
                  <p className="text-sm text-gray-400">Data count: {analyticsData?.shipmentTrends?.length || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Revenue Trends
            </h3>
          </div>
          <div className="h-80">
            {getRevenueChart() ? (
              <Line data={getRevenueChart()} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded">
                <div className="text-center">
                  <RevenueIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No revenue data available</p>
                  <p className="text-sm text-gray-400">Revenue: ₹{revenueData?.totalRevenue || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center">
              <Users className="w-5 h-5 mr-2 text-amber-500" />
              User Growth
            </h3>
          </div>
          <div className="h-80">
            {getUserGrowthChart() ? (
              <Bar data={getUserGrowthChart()} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No user growth data available</p>
                  <p className="text-sm text-gray-400">Users: {analyticsData?.userGrowth?.length || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-purple-500" />
              Status Distribution
            </h3>
          </div>
          <div className="h-80">
            {getStatusDistributionChart() ? (
              <Doughnut data={getStatusDistributionChart()} options={pieChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No status data available</p>
                  <p className="text-sm text-gray-400">Statuses: {analyticsData?.statusDistribution?.length || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Regional Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-500" />
              Regional Distribution
            </h3>
          </div>
          <div className="h-80">
            {getRegionalChart() && (
              <Pie data={getRegionalChart()} options={pieChartOptions} />
            )}
          </div>
        </div>

        {/* Revenue by Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center">
              <RevenueIcon className="w-5 h-5 mr-2 text-green-500" />
              Revenue by Status
            </h3>
          </div>
          <div className="h-80">
            {getRevenueByStatusChart() && (
              <Doughnut data={getRevenueByStatusChart()} options={pieChartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Regions Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-black mb-4">Top Shipping Destinations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Region</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Shipments</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData?.regionalData?.slice(0, 5).map((region, index) => {
                  const total = analyticsData.regionalData.reduce((sum, r) => sum + r.count, 0);
                  const percentage = ((region.count / total) * 100).toFixed(1);
                  return (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-900">{region._id}</td>
                      <td className="py-3 text-sm text-gray-900 text-right">{region.count}</td>
                      <td className="py-3 text-sm text-gray-900 text-right">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Breakdown Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-black mb-4">Revenue Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Revenue</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Orders</th>
                </tr>
              </thead>
              <tbody>
                {revenueData?.revenueByStatus?.map((status, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-900">{status._id}</td>
                    <td className="py-3 text-sm text-gray-900 text-right">₹{status.revenue.toLocaleString()}</td>
                    <td className="py-3 text-sm text-gray-900 text-right">{status.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}