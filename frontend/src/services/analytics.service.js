import { API_URL } from './api.config.js';

class AnalyticsService {
  constructor() {
    this.baseUrl = `${API_URL}/admin`;
    this.token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : null;
  }

  // Get headers with authentication
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : ''
    };
  }

  // Get real-time analytics data
  async getRealtimeAnalytics() {
    try {
      console.log('🔍 Fetching real-time analytics from API...');
      
      const response = await fetch(`${this.baseUrl}/analytics/realtime`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch real-time analytics');
      }

      const data = await response.json();
      console.log('✅ Real-time analytics data received:', data);
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('❌ Error fetching real-time analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get revenue analytics data
  async getRevenueAnalytics() {
    try {
      console.log('🔍 Fetching revenue analytics from API...');
      
      const response = await fetch(`${this.baseUrl}/analytics/revenue`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch revenue analytics');
      }

      const data = await response.json();
      console.log('✅ Revenue analytics data received:', data);
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('❌ Error fetching revenue analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      console.log('🔍 Fetching dashboard stats from API...');
      
      const response = await fetch(`${this.baseUrl}/summary`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard stats');
      }

      const data = await response.json();
      console.log('✅ Dashboard stats received:', data);
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get comprehensive analytics (combines all data)
  async getComprehensiveAnalytics() {
    try {
      console.log('🔍 Fetching comprehensive analytics...');
      
      // Fetch all analytics data in parallel
      const [realtimeResult, revenueResult, statsResult] = await Promise.all([
        this.getRealtimeAnalytics(),
        this.getRevenueAnalytics(),
        this.getDashboardStats()
      ]);

      // Check if any requests failed
      if (!realtimeResult.success || !revenueResult.success || !statsResult.success) {
        const errors = [
          !realtimeResult.success ? `Realtime: ${realtimeResult.error}` : null,
          !revenueResult.success ? `Revenue: ${revenueResult.error}` : null,
          !statsResult.success ? `Stats: ${statsResult.error}` : null
        ].filter(Boolean);
        
        throw new Error(`Failed to fetch some analytics data: ${errors.join(', ')}`);
      }

      const comprehensiveData = {
        // Real-time analytics data
        shipmentTrends: realtimeResult.data.shipmentTrends || [],
        userGrowth: realtimeResult.data.userGrowth || [],
        statusDistribution: realtimeResult.data.statusDistribution || [],
        regionalData: realtimeResult.data.regionalData || [],
        
        // Revenue analytics data
        revenueData: {
          labels: revenueResult.data.labels || [],
          monthly: revenueResult.data.monthly || [],
          daily: revenueResult.data.daily || [],
          totalRevenue: revenueResult.data.totalRevenue || 0,
          averageOrderValue: revenueResult.data.averageOrderValue || 0,
          revenueByStatus: revenueResult.data.revenueByStatus || []
        },
        
        // Dashboard stats
        dashboardStats: {
          totalUsers: statsResult.data.totalUsers || 0,
          totalPartners: statsResult.data.totalPartners || 0,
          activePartners: statsResult.data.activePartners || 0,
          pendingPartners: statsResult.data.pendingPartners || 0,
          activeShipments: statsResult.data.activeShipments || 0,
          pendingDeliveries: statsResult.data.pendingDeliveries || 0,
          totalRevenue: statsResult.data.totalRevenue || 0
        },
        
        // Metadata
        lastUpdated: new Date(),
        dataSource: 'real-api'
      };

      console.log('✅ Comprehensive analytics data compiled:', comprehensiveData);
      
      return {
        success: true,
        data: comprehensiveData
      };
    } catch (error) {
      console.error('❌ Error fetching comprehensive analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Setup real-time updates (WebSocket connection)
  setupRealtimeUpdates(callback) {
    try {
      // In a real implementation, you would connect to WebSocket here
      // For now, we'll use polling as a fallback
      const interval = setInterval(async () => {
        const result = await this.getComprehensiveAnalytics();
        if (result.success && callback) {
          callback(result.data);
        }
      }, 30000); // Update every 30 seconds

      console.log('✅ Real-time analytics updates setup');
      
      // Return cleanup function
      return () => {
        clearInterval(interval);
        console.log('🔄 Real-time analytics updates stopped');
      };
    } catch (error) {
      console.error('❌ Error setting up real-time updates:', error);
      return null;
    }
  }

  // Validate analytics data structure
  validateAnalyticsData(data) {
    const requiredFields = [
      'shipmentTrends',
      'userGrowth', 
      'statusDistribution',
      'regionalData',
      'revenueData'
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.warn('⚠️ Missing analytics data fields:', missingFields);
      return false;
    }

    return true;
  }

  // Format data for charts
  formatChartData(rawData, chartType) {
    try {
      switch (chartType) {
        case 'shipmentTrends':
          return {
            labels: rawData.map(item => {
              const date = new Date(item._id);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            datasets: [{
              label: 'Daily Shipments',
              data: rawData.map(item => item.count),
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderColor: '#3b82f6',
              borderWidth: 2,
              borderRadius: 6,
              tension: 0.4,
            }]
          };

        case 'statusDistribution':
          return {
            labels: rawData.map(item => item._id),
            datasets: [{
              data: rawData.map(item => item.count),
              backgroundColor: [
                '#10b981', // green for delivered
                '#3b82f6', // blue for in transit
                '#f59e0b', // amber for processing
                '#8b5cf6', // purple for out for delivery
                '#ef4444', // red for pending
              ],
              borderWidth: 2,
              borderColor: '#fff',
            }]
          };

        case 'regionalData':
          return {
            labels: rawData.map(item => item._id),
            datasets: [{
              label: 'Shipments by Region',
              data: rawData.map(item => item.count),
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
            }]
          };

        case 'userGrowth':
          return {
            labels: rawData.map(item => item._id),
            datasets: [{
              label: 'New Users',
              data: rawData.map(item => item.count),
              backgroundColor: 'rgba(251, 191, 36, 0.8)',
              borderColor: '#f59e0b',
              borderWidth: 2,
              borderRadius: 6,
            }]
          };

        default:
          console.warn('⚠️ Unknown chart type:', chartType);
          return null;
      }
    } catch (error) {
      console.error('❌ Error formatting chart data:', error);
      return null;
    }
  }
}

// Export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;