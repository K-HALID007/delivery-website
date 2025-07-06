"use client";
import { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  Settings,
  Filter,
  Search,
  Trash2,
  RefreshCw,
  Clock,
  User,
  Package,
  DollarSign,
  Shield
} from 'lucide-react';
import { API_URL } from '../../services/api.config.js';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    criticalAlerts: true,
    businessUpdates: true,
    systemMaintenance: true
  });

  const notificationTypes = [
    { id: 'all', label: 'All Notifications', count: 0 },
    { id: 'critical', label: 'Critical', count: 0, color: 'red' },
    { id: 'warning', label: 'Warnings', count: 0, color: 'yellow' },
    { id: 'info', label: 'Information', count: 0, color: 'blue' },
    { id: 'success', label: 'Success', count: 0, color: 'green' }
  ];

  useEffect(() => {
    loadNotifications();
    
    // Set up auto-refresh every 2 minutes
    const interval = setInterval(loadNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`${API_URL}/admin/notifications`, { headers });
      const data = await response.json();
      
      if (response.ok) {
        // Map backend data to frontend format
        const formattedNotifications = data.map(notif => ({
          ...notif,
          timestamp: new Date(notif.timestamp),
          icon: getNotificationIcon(notif.category, notif.type)
        }));
        
        setNotifications(formattedNotifications);
        console.log('Loaded real-time notifications:', formattedNotifications);
      } else {
        throw new Error(data.message || 'Failed to load notifications');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to empty array on error
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (category, type) => {
    switch (category) {
      case 'operations':
        return type === 'critical' ? AlertTriangle : Package;
      case 'business':
        return type === 'success' ? DollarSign : User;
      case 'security':
        return Shield;
      case 'system':
        return Settings;
      default:
        return Info;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'success': return 'text-green-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesFilter = filter === 'all' || notif.type === filter;
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2 flex items-center">
            <Bell className="w-8 h-8 mr-3 text-amber-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 px-2 py-1 bg-red-500 text-white text-sm rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600">Manage system alerts and business notifications</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </button>
          
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </button>
          
          <button
            onClick={loadNotifications}
            disabled={loading}
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Search */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6">
            <h3 className="font-semibold text-black mb-4">Filter by Type</h3>
            <div className="space-y-2">
              {notificationTypes.map(type => {
                const count = type.id === 'all' 
                  ? notifications.length 
                  : notifications.filter(n => n.type === type.id).length;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => setFilter(type.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                      filter === type.id 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{type.label}</span>
                    <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-black mb-4 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </h3>
            <div className="space-y-3">
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, [key]: !value }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      value ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'All caught up! No new notifications.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-xl shadow-lg border-l-4 p-6 transition-all duration-200 hover:shadow-xl ${
                      notification.read ? 'border-gray-300' : 'border-amber-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                          <Icon className={`w-5 h-5 ${getIconColor(notification.type)}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-black'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3">{notification.message}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {notification.timestamp.toLocaleString()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                                {notification.type.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {notification.actions.map((action, index) => (
                                <button
                                  key={index}
                                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                  {action}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}