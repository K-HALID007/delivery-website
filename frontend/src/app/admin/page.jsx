"use client";
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { API_URL } from '../services/api.config.js';
import { 
  BarChart3, 
  Users, 
  Package, 
  TrendingUp, 
  RefreshCw, 
  LogOut,
  Home,
  Settings,
  Bell
} from 'lucide-react';

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    totalShipments: 0,
    activeUsers: 0,
    revenue: 0,
    pendingDeliveries: 0
  });
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [user, setUser] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token');
      if (!token) return;

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Fetch summary data
      try {
        const summaryResponse = await fetch(`${API_URL}/admin/summary`, { headers });
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setSummary({
            totalShipments: summaryData.activeShipments || summaryData.totalShipments || 0,
            activeUsers: summaryData.totalUsers || summaryData.activeUsers || 0,
            revenue: summaryData.totalRevenue || summaryData.revenue || 0,
            pendingDeliveries: summaryData.pendingDeliveries || 0,
          });
        }
      } catch (err) {
        console.log('Summary API not available, using defaults');
      }

      // Fetch recent shipments
      try {
        const shipmentsResponse = await fetch(`${API_URL}/admin/shipments/recent`, { headers });
        if (shipmentsResponse.ok) {
          const shipmentsData = await shipmentsResponse.json();
          setRecentShipments(Array.isArray(shipmentsData) ? shipmentsData.slice(0, 5) : []);
        }
      } catch (err) {
        console.log('Shipments API not available');
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const initDashboard = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        
        await fetchDashboardData();
      } catch (error) {
        console.error('Dashboard initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-amber-500 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              <button
                onClick={fetchDashboardData}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-700">
                  {user?.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Welcome Message */}
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-6 border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-800 mb-2">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-amber-700">
              Here's what's happening with your courier service today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Shipments
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {summary.totalShipments}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {summary.activeUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Revenue
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ₹{summary.revenue.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Bell className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Deliveries
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {summary.pendingDeliveries}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Shipments */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Shipments
              </h3>
              
              {recentShipments.length > 0 ? (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tracking ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From → To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentShipments.map((shipment, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {shipment.trackingId || shipment.id || `#${index + 1}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {shipment.origin || 'N/A'} → {shipment.destination || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                              shipment.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {shipment.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent shipments</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Shipment data will appear here when available.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left"
            >
              <Home className="h-8 w-8 text-blue-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Go to Website</h3>
              <p className="text-sm text-gray-500">Visit the main website</p>
            </button>

            <button
              onClick={fetchDashboardData}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left"
            >
              <RefreshCw className="h-8 w-8 text-green-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Refresh Data</h3>
              <p className="text-sm text-gray-500">Update dashboard information</p>
            </button>

            <button
              onClick={handleLogout}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left"
            >
              <LogOut className="h-8 w-8 text-red-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Logout</h3>
              <p className="text-sm text-gray-500">Sign out of admin panel</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}