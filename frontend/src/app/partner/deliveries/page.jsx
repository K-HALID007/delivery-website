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

  const STATUS_TABS = [
    { key: '', label: 'All' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Header ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Deliveries</h1>
            <p className="text-sm text-slate-500 mt-0.5">{pagination.totalRecords || 0} total orders assigned to you</p>
          </div>
          <button
            onClick={handleManualRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Error ─────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* ── Status tabs ───────────────────────── */}
        <div className="flex flex-wrap gap-1.5 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm w-fit">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.status === tab.key
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Deliveries list ───────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Deliveries ({pagination.totalRecords || 0})</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Auto-refresh 30s
            </div>
          </div>

          {deliveries.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700">No deliveries found</p>
              <p className="text-xs text-slate-400 mt-1">
                {filters.status ? `No ${filters.status.replace(/_/g, ' ')} deliveries` : 'No deliveries assigned yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {deliveries.map((delivery) => (
                <div key={delivery._id} className="px-5 py-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Tracking ID + Status */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-slate-900">#{delivery.trackingId}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Addresses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">From</p>
                          <p className="text-xs font-semibold text-slate-800">{delivery.sender?.name}</p>
                          <p className="text-xs text-slate-500">{delivery.sender?.phone}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{delivery.sender?.address}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">To</p>
                          <p className="text-xs font-semibold text-slate-800">{delivery.receiver?.name}</p>
                          <p className="text-xs text-slate-500">{delivery.receiver?.phone}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{delivery.receiver?.address}</p>
                        </div>
                      </div>

                      {/* Date */}
                      <p className="text-xs text-slate-400">Created {formatDate(delivery.createdAt)}</p>
                    </div>

                    {/* Earnings + CTA */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-500 font-medium mb-0.5">Earnings</p>
                      <p className="text-xl font-extrabold text-slate-900 mb-3">₹{delivery.partnerEarnings || 0}</p>
                      <button
                        onClick={() => router.push(`/partner/deliveries/${delivery.trackingId}`)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                      >
                        Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing {((pagination.current - 1) * filters.limit) + 1}–{Math.min(pagination.current * filters.limit, pagination.totalRecords)} of {pagination.totalRecords}
              </p>
              <div className="flex gap-1">
                <button onClick={() => handlePageChange(pagination.current - 1)} disabled={pagination.current <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Prev
                </button>
                {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
                  const p = Math.max(1, pagination.current - 2) + i;
                  if (p > pagination.total) return null;
                  return (
                    <button key={p} onClick={() => handlePageChange(p)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${p === pagination.current ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => handlePageChange(pagination.current + 1)} disabled={pagination.current >= pagination.total}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}