"use client";
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { API_URL } from '../../services/api.config.js';
import { 
  BarChart3, 
  Users, 
  Package, 
  TrendingUp, 
  RefreshCw, 
  LogOut,
  Home,
  Settings,
  Bell,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    totalShipments: 0,
    activeUsers: 0,
    revenue: 0,
    pendingDeliveries: 0
  });
  const [recentShipments, setRecentShipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

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
          setRecentShipments(Array.isArray(shipmentsData) ? shipmentsData.slice(0, 10) : []);
        }
      } catch (err) {
        console.log('Shipments API not available');
      }

      // Fetch users
      try {
        const usersResponse = await fetch(`${API_URL}/admin/users`, { headers });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(Array.isArray(usersData) ? usersData.slice(0, 10) : []);
        }
      } catch (err) {
        console.log('Users API not available');
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
        
        // Set some notifications
        setNotifications([
          { id: 1, message: 'Dashboard loaded successfully', type: 'success', time: new Date() },
          { id: 2, message: 'Real-time updates active', type: 'info', time: new Date() },
        ]);
        
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
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'shipments', name: 'Shipments', icon: Package },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp },
              { id: 'settings', name: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              
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
                        <DollarSign className="h-6 w-6 text-green-400" />
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

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Shipments */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Recent Shipments
                    </h3>
                    
                    {recentShipments.length > 0 ? (
                      <div className="space-y-3">
                        {recentShipments.map((shipment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-semibold text-gray-800">
                                {shipment.trackingId || shipment.id || `#${index + 1}`}
                              </div>
                              <div className="text-sm text-gray-600">
                                {shipment.origin || 'Unknown'} → {shipment.destination || 'Unknown'}
                              </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                              shipment.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {shipment.status || 'Unknown'}
                            </span>
                          </div>
                        ))}
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

                {/* Notifications */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Recent Notifications
                    </h3>
                    
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${
                          notification.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' :
                          notification.type === 'info' ? 'bg-blue-50 border-blue-400 text-blue-800' :
                          notification.type === 'error' ? 'bg-red-50 border-red-400 text-red-800' :
                          'bg-gray-50 border-gray-400 text-gray-800'
                        }`}>
                          <div className="text-sm">{notification.message}</div>
                          <div className="text-xs opacity-75 mt-1">
                            {notification.time.toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Shipments Tab */}
          {activeTab === 'shipments' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    All Shipments
                  </h3>
                  <div className="flex space-x-2">
                    <button className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Shipment
                    </button>
                    <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>
                
                {recentShipments.length > 0 ? (
                  <div className="overflow-x-auto">
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="text-green-600 hover:text-green-900">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No shipments found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new shipment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    User Management
                  </h3>
                  <div className="flex space-x-2">
                    <button className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </button>
                  </div>
                </div>
                
                {users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.role}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="text-green-600 hover:text-green-900">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      User data will appear here when available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Analytics Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <div className="text-sm text-gray-600">Delivery Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">2.5 days</div>
                    <div className="text-sm text-gray-600">Average Delivery Time</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">4.8/5</div>
                    <div className="text-sm text-gray-600">Customer Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  System Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive email updates for important events</p>
                    </div>
                    <button className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600">
                      Configure
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">API Settings</h4>
                      <p className="text-sm text-gray-500">Manage API keys and integrations</p>
                    </div>
                    <button className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600">
                      Manage
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Backup & Restore</h4>
                      <p className="text-sm text-gray-500">Backup your data and restore from backups</p>
                    </div>
                    <button className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600">
                      Backup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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