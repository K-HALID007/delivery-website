"use client";
import { useState, useEffect, useCallback } from 'react';
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
  AlertCircle
} from 'lucide-react';

export default function AdminAnalyticsWorking() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [dataSource, setDataSource] = useState('loading');
  const [error, setError] = useState(null);

  // Mock data functions
  const getMockAnalyticsData = () => {
    const today = new Date();
    const shipmentTrends = [];
    const userGrowth = [];
    
    // Generate last 30 days of shipment data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      shipmentTrends.push({
        _id: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10
      });
    }
    
    // Generate last 6 months of user growth
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      userGrowth.push({
        _id: date.toISOString().substring(0, 7),
        count: Math.floor(Math.random() * 100) + 20
      });
    }
    
    return {
      shipmentTrends,
      userGrowth,
      statusDistribution: [
        { _id: 'Delivered', count: 150 },
        { _id: 'In Transit', count: 75 },
        { _id: 'Processing', count: 45 },
        { _id: 'Out for Delivery', count: 30 },
        { _id: 'Pending', count: 20 }
      ],
      regionalData: [
        { _id: 'Mumbai', count: 120 },
        { _id: 'Delhi', count: 95 },
        { _id: 'Bangalore', count: 80 },
        { _id: 'Chennai', count: 65 },
        { _id: 'Kolkata', count: 50 },
        { _id: 'Hyderabad', count: 45 },
        { _id: 'Pune', count: 35 },
        { _id: 'Ahmedabad', count: 25 }
      ]
    };
  };

  const getMockRevenueData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyData = [12000, 15000, 18000, 22000, 25000, 28000];
    const dailyData = [];
    
    // Generate last 30 days of revenue
    for (let i = 0; i < 30; i++) {
      dailyData.push(Math.floor(Math.random() * 2000) + 500);
    }
    
    return {
      labels: monthNames,
      monthly: monthlyData,
      daily: dailyData,
      totalRevenue: 120000,
      averageOrderValue: 450.75,
      revenueByStatus: [
        { _id: 'Delivered', revenue: 85000, count: 150 },
        { _id: 'In Transit', revenue: 25000, count: 75 },
        { _id: 'Processing', revenue: 10000, count: 45 }
      ]
    };
  };

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('admin_token');
      
      console.log('🔍 Fetching analytics data...');
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.log('📊 No token found, using demo data...');
        setAnalyticsData(getMockAnalyticsData());
        setRevenueData(getMockRevenueData());
        setDataSource('demo');
        setLastUpdate(new Date());
        setLoading(false);
        return;
      }
      
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      try {
        console.log('📊 Attempting to fetch from API...');
        
        // Try to fetch real-time analytics
        const analyticsResponse = await fetch('http://localhost:5000/api/admin/analytics/realtime', { 
          method: 'GET',
          headers,
          timeout: 5000 // 5 second timeout
        });
        
        console.log('Analytics response status:', analyticsResponse.status);
        
        if (!analyticsResponse.ok) {
          throw new Error(`Analytics API failed: ${analyticsResponse.status}`);
        }
        
        const analytics = await analyticsResponse.json();
        console.log('✅ Analytics data received:', analytics);
        
        // Try to fetch revenue analytics
        const revenueResponse = await fetch('http://localhost:5000/api/admin/analytics/revenue', { 
          method: 'GET',
          headers,
          timeout: 5000
        });
        
        console.log('Revenue response status:', revenueResponse.status);
        
        if (!revenueResponse.ok) {
          throw new Error(`Revenue API failed: ${revenueResponse.status}`);
        }
        
        const revenue = await revenueResponse.json();
        console.log('✅ Revenue data received:', revenue);
        
        // Check if we have actual data or empty data
        if (analytics.shipmentTrends?.length > 0 || revenue.totalRevenue > 0) {
          setAnalyticsData(analytics);
          setRevenueData(revenue);
          setDataSource('api');
          console.log('✅ Using real API data');
        } else {
          console.log('📊 API returned empty data, using demo data...');
          setAnalyticsData(getMockAnalyticsData());
          setRevenueData(getMockRevenueData());
          setDataSource('demo');
        }
        
        setLastUpdate(new Date());
        
      } catch (apiError) {
        console.error('❌ API Error:', apiError);
        setError(`API Connection Failed: ${apiError.message}`);
        // Fallback to mock data if API fails
        setAnalyticsData(getMockAnalyticsData());
        setRevenueData(getMockRevenueData());
        setDataSource('demo');
        setLastUpdate(new Date());
      }
      
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      setError(`Error: ${error.message}`);
      // Use mock data as fallback
      setAnalyticsData(getMockAnalyticsData());
      setRevenueData(getMockRevenueData());
      setDataSource('demo');
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load demo data immediately on component mount
    console.log('🚀 Component mounted, loading demo data...');
    setAnalyticsData(getMockAnalyticsData());
    setRevenueData(getMockRevenueData());
    setDataSource('demo');
    setLastUpdate(new Date());
    setLoading(false);
    
    // Then try to fetch real data
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
          label: 'Monthly Revenue ($)',
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
          <p className="text-sm text-gray-500 mt-2">Fetching real-time data...</p>
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
          
          {/* Data Source Indicator */}
          <div className="mt-2 flex items-center space-x-2">
            {dataSource === 'api' && (
              <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live Data
              </div>
            )}
            {dataSource === 'demo' && (
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Demo Data
              </div>
            )}
            {error && (
              <div className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {error}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          
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
                ${revenueData?.totalRevenue?.toLocaleString() || '0'}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500" />
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
                ${revenueData?.averageOrderValue?.toFixed(2) || '0.00'}
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
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No revenue data available</p>
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
            {getRegionalChart() ? (
              <Pie data={getRegionalChart()} options={pieChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No regional data available</p>
                </div>
              </div>
            )}
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
            {revenueData?.revenueByStatus ? (
              <Doughnut 
                data={{
                  labels: revenueData.revenueByStatus.map(item => item._id),
                  datasets: [{
                    data: revenueData.revenueByStatus.map(item => item.revenue),
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
                    borderWidth: 2,
                    borderColor: '#fff',
                  }]
                }} 
                options={pieChartOptions} 
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No revenue status data available</p>
                </div>
              </div>
            )}
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
                    <td className="py-3 text-sm text-gray-900 text-right">${status.revenue.toLocaleString()}</td>
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