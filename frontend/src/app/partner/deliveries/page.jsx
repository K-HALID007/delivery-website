'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../../../contexts/ToastContext.js';
import partnerService from '../../../services/partner.service.js';

export default function PartnerDeliveries() {
  const { showSuccess, showInfo } = useToast();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const requestIdRef = useRef(0);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
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

    const statusParam = searchParams.get('status') || '';
    const searchParam = searchParams.get('search') || '';
    setSearchInput(current => current === searchParam ? current : searchParam);
    setFilters(prev => prev.status === statusParam && prev.search === searchParam
      ? prev
      : { ...prev, status: statusParam, search: searchParam, page: 1 });
  }, [searchParams]);

  useEffect(() => {
    loadDeliveries();
  }, [filters]);

  // Auto-refresh deliveries every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing deliveries...');
      loadDeliveries(false);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [filters]);

  // Listen for partner online event to refresh deliveries
  useEffect(() => {
    const handlePartnerOnline = (event) => {
      console.log('🟢 Partner came online event received, refreshing deliveries...');
      showInfo('🔄 Refreshing deliveries...', 3000);
      loadDeliveries(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('partnerOnline', handlePartnerOnline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('partnerOnline', handlePartnerOnline);
      }
    };
  }, [showInfo, filters]);

  const loadDeliveries = async (showLoadingSpinner = true, showRefreshMessage = false) => {
    const requestId = ++requestIdRef.current;
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      }
      setError('');

      console.log('📦 Loading deliveries with filters:', filters);
      const response = await partnerService.getDeliveries(filters);
      if (requestId !== requestIdRef.current) return;

      if (response.success) {
        console.log('✅ Deliveries loaded successfully:', response.deliveries.length);
        setDeliveries(response.deliveries);
        setPagination(response.pagination);

        // Show success message for manual refresh
        if (showRefreshMessage) {
          showInfo(`🔄 Refreshed! Found ${response.deliveries.length} deliveries`, 3000);
        }
      } else {
        setError('Failed to load deliveries');
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error('❌ Error loading deliveries:', error);
      setError(error.message);
      if (error.message.includes('unauthorized') || error.message.includes('token')) {
        partnerService.logout();
        router.push('/partner');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    showInfo('🔄 Refreshing deliveries...', 2000);
    loadDeliveries(false, true); // Keep the list visible while refreshing
  };

  const handleStatusFilter = (status) => {
    const nextFilters = { ...filters, status, page: 1 };
    setFilters(nextFilters);
    updateUrl(nextFilters);
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const nextFilters = { ...filters, search: searchInput.trim(), page: 1 };
    setFilters(nextFilters);
    updateUrl(nextFilters);
  };

  const updateUrl = (nextFilters) => {
    const params = new URLSearchParams();
    if (nextFilters.status) params.set('status', nextFilters.status);
    if (nextFilters.search) params.set('search', nextFilters.search);
    const query = params.toString();
    window.history.pushState({}, '', query ? `/partner/deliveries?${query}` : '/partner/deliveries');
  };

  const handleClearSearch = () => {
    const nextFilters = { ...filters, search: '', page: 1 };
    setSearchInput('');
    setFilters(nextFilters);
    updateUrl(nextFilters);
  };

  const getStatusColor = (status) => {
    const colors = {
      'assigned': 'bg-slate-100 text-slate-700 border-slate-200',
      'picked_up': 'bg-teal-50 text-teal-800 border-teal-200',
      'in_transit': 'bg-teal-50 text-teal-800 border-teal-200',
      'out_for_delivery': 'bg-teal-50 text-teal-800 border-teal-200',
      'delivered': 'bg-emerald-50 text-emerald-800 border-emerald-200',
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
    { key: 'cancelled', label: 'Cancelled' },
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
    <div className="min-h-screen bg-slate-50 py-5 sm:py-7 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* ── Header ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Deliveries</h1>
            <p className="text-sm text-slate-500 mt-0.5">Find an order or update an active delivery.</p>
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
        <div className="w-full overflow-x-auto bg-white border border-slate-200 rounded-xl p-1.5">
          <div className="flex min-w-max gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.status === tab.key
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            type="search"
            enterKeyHint="search"
            placeholder="Tracking ID, sender or receiver"
            aria-label="Search by tracking ID, sender name, receiver name or phone"
            className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
          />
          <button type="submit" className="px-4 py-2.5 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800">Search</button>
          {(searchInput || filters.search) && <button type="button" onClick={handleClearSearch} className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50">Clear</button>}
        </form>

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
                {filters.search ? 'No deliveries match your search.' : filters.status ? `No ${filters.status.replace(/_/g, ' ')} deliveries` : 'No deliveries assigned yet'}
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
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">To</p>
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
                        className="px-4 py-2 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-800 transition"
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
