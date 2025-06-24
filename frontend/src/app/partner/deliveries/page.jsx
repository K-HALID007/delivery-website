'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../../../contexts/ToastContext.js';
import partnerService from '../../../services/partner.service.js';

export default function PartnerDeliveries() {
  const { showSuccess, showInfo } = useToast();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!partnerService.isLoggedIn()) {
      router.push('/partner');
      return;
    }

    // Get status from URL params
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setFilters(prev => ({ ...prev, status: statusParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    loadDeliveries();
  }, [filters]);

  // Auto-refresh deliveries every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing deliveries...');
      loadDeliveries();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [filters]);

  // Listen for partner online event to refresh deliveries
  useEffect(() => {
    const handlePartnerOnline = (event) => {
      console.log('🟢 Partner came online event received, refreshing deliveries...');
      showInfo('🔄 Refreshing deliveries...', 3000);
      loadDeliveries();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('partnerOnline', handlePartnerOnline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('partnerOnline', handlePartnerOnline);
      }
    };
  }, [showInfo]);

  const loadDeliveries = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      }
      setError('');
      
      console.log('📦 Loading deliveries with filters:', filters);
      const response = await partnerService.getDeliveries(filters);
      
      if (response.success) {
        console.log('✅ Deliveries loaded successfully:', response.deliveries.length);
        setDeliveries(response.deliveries);
        setPagination(response.pagination);
        
        // Show success message for manual refresh
        if (!showLoadingSpinner) {
          showInfo(`🔄 Refreshed! Found ${response.deliveries.length} deliveries`, 3000);
        }
      } else {
        setError('Failed to load deliveries');
      }
    } catch (error) {
      console.error('❌ Error loading deliveries:', error);
      setError(error.message);
      if (error.message.includes('unauthorized') || error.message.includes('token')) {
        partnerService.logout();
        router.push('/partner');
      }
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  };

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    showInfo('🔄 Refreshing deliveries...', 2000);
    loadDeliveries(false); // Don't show loading spinner for manual refresh
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
    // Update URL without page reload
    const url = status ? `/partner/deliveries?status=${status}` : '/partner/deliveries';
    window.history.pushState({}, '', url);
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'assigned': 'bg-blue-100 text-blue-800 border-blue-200',
      'picked_up': 'bg-orange-100 text-orange-800 border-orange-200',
      'in_transit': 'bg-purple-100 text-purple-800 border-purple-200',
      'out_for_delivery': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg border-b border-yellow-400/20">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-slate-600 rounded-lg w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-slate-700 rounded w-64 animate-pulse"></div>
            </div>
            <div className="bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/20">
              <div className="h-4 bg-slate-600 rounded w-20 mb-1 animate-pulse"></div>
              <div className="h-6 bg-slate-600 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Filter Skeleton */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg mb-6 p-6 border border-yellow-400/20">
          <div className="h-6 bg-slate-600 rounded w-32 mb-4 animate-pulse"></div>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-slate-700 rounded-xl w-24 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Deliveries List Skeleton */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-400/20">
          <div className="px-6 py-4 border-b border-yellow-400/20">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-slate-600 rounded w-40 animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="h-4 bg-slate-600 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Skeleton Delivery Cards */}
          <div className="divide-y divide-yellow-400/20">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-6 bg-slate-600 rounded w-32 animate-pulse"></div>
                      <div className="h-6 bg-slate-700 rounded-full w-20 animate-pulse"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg p-4">
                        <div className="h-4 bg-slate-600 rounded w-20 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-slate-600 rounded w-32 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-slate-700 rounded w-28 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-slate-700 rounded w-40 animate-pulse"></div>
                      </div>
                      
                      <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4">
                        <div className="h-4 bg-slate-600 rounded w-20 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-slate-600 rounded w-32 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-slate-700 rounded w-28 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-slate-700 rounded w-40 animate-pulse"></div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="h-3 bg-slate-700 rounded w-40 animate-pulse"></div>
                      <div className="h-3 bg-slate-700 rounded w-40 animate-pulse"></div>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg p-4 mb-4">
                      <div className="h-3 bg-slate-600 rounded w-12 mb-1 animate-pulse"></div>
                      <div className="h-6 bg-slate-600 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-slate-700 rounded-lg w-28 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Show skeleton whenever loading is true
  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg border-b border-yellow-400/20">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                <span className="text-yellow-400">My</span> Deliveries
              </h1>
              <p className="text-slate-300">
                Manage and track your assigned deliveries
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/20">
                <p className="text-sm text-yellow-400">Total Orders</p>
                <p className="text-2xl font-bold text-white">{pagination.totalRecords || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg shadow-sm mb-6 backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg mb-6 p-6 border border-yellow-400/20">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Filter Deliveries</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                filters.status === '' 
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-800 shadow-lg shadow-yellow-400/25' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:shadow-md'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => handleStatusFilter('assigned')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                filters.status === 'assigned' 
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-800 shadow-lg shadow-yellow-400/25' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:shadow-md'
              }`}
            >
              Assigned
            </button>
            <button
              onClick={() => handleStatusFilter('picked_up')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                filters.status === 'picked_up' 
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-800 shadow-lg shadow-yellow-400/25' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:shadow-md'
              }`}
            >
              Picked Up
            </button>
            <button
              onClick={() => handleStatusFilter('in_transit')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                filters.status === 'in_transit' 
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-800 shadow-lg shadow-yellow-400/25' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:shadow-md'
              }`}
            >
              In Transit
            </button>
            <button
              onClick={() => handleStatusFilter('out_for_delivery')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                filters.status === 'out_for_delivery' 
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-800 shadow-lg shadow-yellow-400/25' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:shadow-md'
              }`}
            >
              Out for Delivery
            </button>
            <button
              onClick={() => handleStatusFilter('delivered')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                filters.status === 'delivered' 
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-800 shadow-lg shadow-yellow-400/25' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:shadow-md'
              }`}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Deliveries List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-400/20">
          <div className="px-6 py-4 border-b border-yellow-400/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Deliveries ({pagination.totalRecords || 0})
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleManualRefresh}
                  className="bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/30 text-yellow-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300">Auto-refresh: 30s</span>
                </div>
              </div>
            </div>
          </div>

          {deliveries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">No deliveries found</h4>
              <p className="text-slate-300 mb-4">
                {filters.status ? `No ${filters.status.replace('_', ' ')} deliveries` : 'No deliveries assigned yet'}
              </p>
              <button
                onClick={() => router.push('/partner/dashboard')}
                className="bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-800 px-6 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-amber-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="divide-y divide-yellow-400/20">
              {deliveries.map((delivery) => (
                <div key={delivery._id} className="p-6 hover:bg-white/5 transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-xl font-semibold text-white">
                          #{delivery.trackingId}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg p-4 backdrop-blur-sm">
                          <div className="flex items-center mb-2">
                            <svg className="w-4 h-4 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h5 className="text-sm font-semibold text-yellow-400">Pickup From</h5>
                          </div>
                          <p className="text-sm font-medium text-white">{delivery.sender?.name}</p>
                          <p className="text-sm text-slate-300">{delivery.sender?.phone}</p>
                          <p className="text-xs text-slate-400 mt-1">{delivery.sender?.address}</p>
                        </div>
                        
                        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 backdrop-blur-sm">
                          <div className="flex items-center mb-2">
                            <svg className="w-4 h-4 text-amber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                            </svg>
                            <h5 className="text-sm font-semibold text-amber-400">Deliver To</h5>
                          </div>
                          <p className="text-sm font-medium text-white">{delivery.receiver?.name}</p>
                          <p className="text-sm text-slate-300">{delivery.receiver?.phone}</p>
                          <p className="text-xs text-slate-400 mt-1">{delivery.receiver?.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-slate-400">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Created: {formatDate(delivery.createdAt)}
                        </div>
                        {delivery.updatedAt !== delivery.createdAt && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Updated: {formatDate(delivery.updatedAt)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg p-4 mb-4 backdrop-blur-sm">
                        <p className="text-xs text-yellow-400 font-medium">Earnings</p>
                        <p className="text-2xl font-bold text-white">₹{delivery.partnerEarnings || 0}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/partner/deliveries/${delivery.trackingId}`)}
                        className="bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-800 px-6 py-3 rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-amber-700 transition-all duration-200 shadow-md hover:shadow-lg w-full"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="px-6 py-4 border-t border-yellow-400/20 bg-slate-800/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-300">
                  Showing {((pagination.current - 1) * filters.limit) + 1} to{' '}
                  {Math.min(pagination.current * filters.limit, pagination.totalRecords)} of{' '}
                  {pagination.totalRecords} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current <= 1}
                    className="px-4 py-2 border border-yellow-400/30 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors text-slate-300"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.current - 2) + i;
                    if (pageNum > pagination.total) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                          pageNum === pagination.current
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-800 border-yellow-400 shadow-md'
                            : 'border-yellow-400/30 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current >= pagination.total}
                    className="px-4 py-2 border border-yellow-400/30 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors text-slate-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}