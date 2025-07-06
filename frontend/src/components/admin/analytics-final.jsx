"use client";
import { useState, useEffect } from 'react';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Download,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import analyticsService from '../../services/analytics.service.js';
import AdminAnalyticsSkeleton from './AdminAnalyticsSkeleton';

export default function AdminAnalyticsClean() {
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isRealTime, setIsRealTime] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Fetch real analytics data from API
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await analyticsService.getComprehensiveAnalytics();
      
      if (result.success) {
        const data = result.data;
        
        setAnalyticsData({
          shipmentTrends: data.shipmentTrends,
          userGrowth: data.userGrowth,
          statusDistribution: data.statusDistribution,
          regionalData: data.regionalData
        });
        
        setRevenueData(data.revenueData);
        setDashboardStats(data.dashboardStats);
        setIsConnected(true);
        setLastUpdate(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
      setError(error.message);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    
    let cleanup = null;
    if (isRealTime) {
      cleanup = analyticsService.setupRealtimeUpdates((updatedData) => {
        setAnalyticsData({
          shipmentTrends: updatedData.shipmentTrends,
          userGrowth: updatedData.userGrowth,
          statusDistribution: updatedData.statusDistribution,
          regionalData: updatedData.regionalData
        });
        setRevenueData(updatedData.revenueData);
        setDashboardStats(updatedData.dashboardStats);
        setLastUpdate(new Date());
        setIsConnected(true);
      });
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [isRealTime]);

  const handleRefresh = async () => {
    await fetchAnalyticsData();
  };

  // Chart configurations
  const getShipmentTrendsChart = () => {
    return {
      labels: analyticsData.shipmentTrends.slice(-15).map(item => {
        const date = new Date(item._id);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Daily Shipments',
          data: analyticsData.shipmentTrends.slice(-15).map(item => item.count),
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
    if (!revenueData || !revenueData.labels || !revenueData.monthly) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Monthly Revenue ($)',
            data: [0, 0, 0, 0, 0, 0],
            borderColor: '#94a3b8',
            backgroundColor: 'rgba(148, 163, 184, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#94a3b8',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            borderDash: [5, 5],
          },
        ],
      };
    }

    const hasRealData = revenueData.monthly && revenueData.monthly.some(value => value > 0);
    
    return {
      labels: revenueData.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: hasRealData ? 'Monthly Revenue ($)' : 'Monthly Revenue ($ - No Data Yet)',
          data: revenueData.monthly || [0, 0, 0, 0, 0, 0],
          borderColor: hasRealData ? '#10b981' : '#94a3b8',
          backgroundColor: hasRealData ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: hasRealData ? '#10b981' : '#94a3b8',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          borderDash: hasRealData ? [] : [5, 5],
        },
      ],
    };
  };

  const getUserGrowthChart = () => {
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
    return {
      labels: analyticsData.statusDistribution.map(item => item._id),
      datasets: [
        {
          data: analyticsData.statusDistribution.map(item => item.count),
          backgroundColor: [
            '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444',
          ],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  };

  const getRegionalChart = () => {
    return {
      labels: analyticsData.regionalData.map(item => item._id),
      datasets: [
        {
          label: 'Shipments by Region',
          data: analyticsData.regionalData.map(item => item.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(249, 115, 22, 0.8)',
            'rgba(236, 72, 153, 0.8)', 'rgba(14, 165, 233, 0.8)',
          ],
          borderColor: '#fff',
          borderWidth: 2,
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

  if (loading || !analyticsData || !revenueData) {
    return <AdminAnalyticsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights and data visualization</p>
          
          <div className="mt-2 flex items-center space-x-2">
            <div className={`px-3 py-1 text-sm rounded-full flex items-center ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 mr-2" />
                  Real Data Connected
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-2" />
                  Connection Error
                </>
              )}
            </div>
            <div className={`px-3 py-1 text-sm rounded-full flex items-center ${
              isRealTime 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <Activity className="w-3 h-3 mr-1" />
              {isRealTime ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </div>
            {error && (
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                API Error
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button
            onClick={() => setIsRealTime(!isRealTime)}
            className={`px-4 py-2 rounded-md transition-colors flex items-center ${
              isRealTime 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            <Activity className="w-4 h-4 mr-2" />
            {isRealTime ? 'Disable Auto-Refresh' : 'Enable Auto-Refresh'}
          </button>
          
          <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Active Shipments</p>
              <p className="text-3xl font-bold text-blue-800">
                {dashboardStats ? dashboardStats.activeShipments.toLocaleString() : 
                 analyticsData.shipmentTrends.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 mt-1">Real-time data</p>
            </div>
            <Package className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-800">
                ₹{(dashboardStats ? dashboardStats.totalRevenue : revenueData.totalRevenue).toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">Real-time data</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-amber-800">
                {dashboardStats ? dashboardStats.totalUsers.toLocaleString() : 
                 analyticsData.userGrowth.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
              </p>
              <p className="text-xs text-amber-600 mt-1">Real-time data</p>
            </div>
            <Users className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Active Partners</p>
              <p className="text-3xl font-bold text-purple-800">
                {dashboardStats ? dashboardStats.activePartners.toLocaleString() : '0'}
              </p>
              <p className="text-xs text-purple-600 mt-1">Real-time data</p>
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
              Shipment Trends (Last 15 Days)
            </h3>
          </div>
          <div className="h-80">
            <Bar data={getShipmentTrendsChart()} options={chartOptions} />
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Revenue Trends (6 Months)
            </h3>
            {isConnected && revenueData && revenueData.monthly && !revenueData.monthly.some(value => value > 0) && (
              <div className="text-xs text-white bg-blue-500 px-2 py-1 rounded">
                Real Data (No Revenue Yet)
              </div>
            )}
            {isConnected && revenueData && revenueData.monthly && revenueData.monthly.some(value => value > 0) && (
              <div className="text-xs text-white bg-green-500 px-2 py-1 rounded">
                Real Revenue Data
              </div>
            )}
          </div>
          <div className="h-80">
            <Line data={getRevenueChart()} options={chartOptions} />
          </div>
          
          {/* Revenue Data Info */}
          {isConnected && revenueData && revenueData.monthly && !revenueData.monthly.some(value => value > 0) && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">No Revenue Data Found</h4>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>Connected to real data but shows zero revenue for the last 6 months.</p>
                    <p className="mt-1">To see revenue data:</p>
                    <ul className="mt-1 list-disc list-inside text-xs">
                      <li>Create shipments with payment amounts in the Tracking collection</li>
                      <li>Set shipment status to 'delivered' with payment.amount &gt; 0</li>
                      <li>Or add revenue field to existing tracking records</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center">
              <Users className="w-5 h-5 mr-2 text-amber-500" />
              User Growth (6 Months)
            </h3>
          </div>
          <div className="h-80">
            <Bar data={getUserGrowthChart()} options={chartOptions} />
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
            <Doughnut data={getStatusDistributionChart()} options={pieChartOptions} />
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
            <Pie data={getRegionalChart()} options={pieChartOptions} />
          </div>
        </div>

        {/* Revenue by Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Revenue by Status
            </h3>
          </div>
          <div className="h-80">
            <Doughnut 
              data={{
                labels: revenueData.revenueByStatus.map(item => item._id),
                datasets: [{
                  data: revenueData.revenueByStatus.map(item => item.revenue),
                  backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                  borderWidth: 2,
                  borderColor: '#fff',
                }]
              }} 
              options={pieChartOptions} 
            />
          </div>
        </div>
      </div>

      {/* Data Tables */}
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
                {analyticsData.regionalData.slice(0, 5).map((region, index) => {
                  const total = analyticsData.regionalData.reduce((sum, r) => sum + r.count, 0);
                  const percentage = ((region.count / total) * 100).toFixed(1);
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 text-sm text-gray-900 font-medium">{region._id}</td>
                      <td className="py-3 text-sm text-gray-900 text-right">{region.count.toLocaleString()}</td>
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
                {revenueData.revenueByStatus.map((status, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900 font-medium">{status._id}</td>
                    <td className="py-3 text-sm text-gray-900 text-right">${status.revenue.toLocaleString()}</td>
                    <td className="py-3 text-sm text-gray-900 text-right">{status.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-10 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-black mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <div className="text-sm text-gray-600">Delivery Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">2.3 days</div>
            <div className="text-sm text-gray-600">Average Delivery Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">4.8/5</div>
            <div className="text-sm text-gray-600">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
}