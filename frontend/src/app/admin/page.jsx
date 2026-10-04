"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import 'chart.js/auto';
import ChartsRow from '@/components/admin/charts/ChartsRow';
import { 
  Package, 
  Users, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Search,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  MapPin,
  ChevronRight
} from 'lucide-react';
import AdminDashboardSkeleton from '@/components/admin/AdminDashboardSkeleton';
import { API_URL } from '../../services/api.config.js';
import { trackingService } from '@/services/tracking.service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [users, setUsers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [userGrowth, setUserGrowth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Fetch real-time analytics data
  const fetchRealTimeAnalytics = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const response = await fetch(`${API_URL}/admin/analytics/realtime`, { headers });
      if (!response.ok) return;
      const data = await response.json();
      setRealTimeData(data);
      
      if (data.shipmentTrends && data.shipmentTrends.length > 0) {
        setChartData({
          labels: data.shipmentTrends.map(item => {
            const date = new Date(item._id);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }),
          datasets: [
            {
              label: 'Daily Shipments',
              data: data.shipmentTrends.map(item => item.count),
              backgroundColor: 'rgba(13, 148, 136, 0.85)',
              borderColor: '#0d9488',
              borderWidth: 1.5,
              borderRadius: 6,
              borderSkipped: false,
              hoverBackgroundColor: '#0f766e',
            },
          ],
        });
      }

      if (data.userGrowth && data.userGrowth.length > 0) {
        setUserGrowth({
          labels: data.userGrowth.map(item => item._id),
          monthly: data.userGrowth.map(item => item.count)
        });
      }
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
    }
  }, []);

  // Fetch revenue analytics
  const fetchRevenueAnalytics = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const response = await fetch(`${API_URL}/admin/analytics/revenue`, { headers });
      if (!response.ok) return;
      const data = await response.json();
      setRevenueAnalytics(data);
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
    }
  }, []);

  // Fetch dashboard summary data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const [summaryRes, shipmentsRes, usersRes, partnersRes] = await Promise.allSettled([
        fetch(`${API_URL}/admin/summary`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/admin/shipments/recent`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/admin/users`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/admin/partners`, { headers }).then(r => r.json())
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setSummary(summaryRes.value);
      } else {
        setSummary({ totalShipments: 0, activeUsers: 0, revenue: 0, pendingDeliveries: 0 });
      }

      if (shipmentsRes.status === 'fulfilled' && shipmentsRes.value) {
        const list = Array.isArray(shipmentsRes.value) ? shipmentsRes.value : shipmentsRes.value.shipments || [];
        setRecentShipments(list);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value) {
        const uList = Array.isArray(usersRes.value) ? usersRes.value : usersRes.value.users || [];
        setUsers(uList);
      }

      if (partnersRes.status === 'fulfilled' && partnersRes.value) {
        const pList = Array.isArray(partnersRes.value) ? partnersRes.value : partnersRes.value.partners || [];
        setPartners(pList);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchRealTimeAnalytics();
    fetchRevenueAnalytics();

    const interval = setInterval(() => {
      fetchRealTimeAnalytics();
      fetchRevenueAnalytics();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData, fetchRealTimeAnalytics, fetchRevenueAnalytics]);

  // Handle global tracking search
  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/admin/shipments?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Pipeline funnel calculation
  const pipelineCounts = useMemo(() => {
    const counts = {
      pending: 0,
      inTransit: 0,
      outForDelivery: 0,
      delivered: 0,
      total: recentShipments.length
    };

    recentShipments.forEach(s => {
      const st = (s.status || '').toLowerCase();
      if (st.includes('deliver') && !st.includes('out')) {
        counts.delivered++;
      } else if (st.includes('out')) {
        counts.outForDelivery++;
      } else if (st.includes('transit') || st.includes('picked') || st.includes('hub')) {
        counts.inTransit++;
      } else {
        counts.pending++;
      }
    });

    return counts;
  }, [recentShipments]);

  // Filtered shipments list
  const filteredShipments = useMemo(() => {
    if (activeFilter === 'ALL') return recentShipments;
    return recentShipments.filter(s => {
      const st = (s.status || '').toLowerCase();
      if (activeFilter === 'IN_TRANSIT') return st.includes('transit') || st.includes('picked') || st.includes('hub');
      if (activeFilter === 'DELIVERED') return st.includes('deliver') && !st.includes('out');
      if (activeFilter === 'PENDING') return st.includes('pending') || st.includes('awaiting');
      return true;
    });
  }, [recentShipments, activeFilter]);

  if (loading && !summary) {
    return <AdminDashboardSkeleton />;
  }

  const totalRevenueAmount = summary?.revenue || revenueAnalytics?.totalRevenue || 0;

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Operations Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                Operations Command Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Logistics Dispatch Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live consignment pipeline, carrier fleet telemetry, and freight settlements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Global Waybill Quick Search */}
            <form onSubmit={handleQuickSearch} className="relative min-w-[240px] sm:min-w-[280px]">
              <input
                type="text"
                placeholder="Search Waybill / Tracking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            </form>

            <Link
              href="/admin/create-shipment"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Book Courier</span>
            </Link>

            <button
              onClick={() => {
                fetchDashboardData();
                fetchRealTimeAnalytics();
                fetchRevenueAnalytics();
              }}
              className="p-2 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs"
              title={`Refresh telemetry (Last sync: ${lastUpdate.toLocaleTimeString()})`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Core Executive Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Consignments */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Consignments
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {summary?.totalShipments ?? recentShipments.length}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Pipeline volume</span>
              <Link href="/admin/shipments" className="font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-0.5">
                View all →
              </Link>
            </div>
          </div>

          {/* Freight Revenue */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Freight Billed
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 tracking-tight">
                ₹{totalRevenueAmount.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Avg order ₹{revenueAnalytics?.averageOrderValue?.toFixed(0) || '120'}</span>
              <Link href="/admin/analytics" className="font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-0.5">
                Ledger →
              </Link>
            </div>
          </div>

          {/* Fleet Partners */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Fleet Drivers & Carriers
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {partners.length || 8}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Verified partner network</span>
              <Link href="/admin/partners" className="font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-0.5">
                Manage fleet →
              </Link>
            </div>
          </div>

          {/* Customer Accounts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Registered Users
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {summary?.activeUsers ?? users.length}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Customer directory</span>
              <Link href="/admin/users" className="font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-0.5">
                Directory →
              </Link>
            </div>
          </div>
        </div>

        {/* Operational Consignment Pipeline Funnel (Delhivery / Shiprocket Inspired) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Live Consignment Dispatch Pipeline
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of active stages across local & intercity hubs.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Total Active in Pipeline: <strong className="text-slate-900">{recentShipments.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* Stage 1: Pickup Queued */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500">Pickup Queued</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {pipelineCounts.pending}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Awaiting hub pickup</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-1.5 rounded-full" 
                  style={{ width: `${pipelineCounts.total ? Math.min((pipelineCounts.pending / pipelineCounts.total) * 100, 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 2: In Transit */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500">In Transit</span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {pipelineCounts.inTransit}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Hub linehaul transfer</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${pipelineCounts.total ? Math.min((pipelineCounts.inTransit / pipelineCounts.total) * 100, 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 3: Out for Delivery */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500">Out for Delivery</span>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {pipelineCounts.outForDelivery}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">With rider for doorstep drop</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div 
                  className="bg-teal-600 h-1.5 rounded-full" 
                  style={{ width: `${pipelineCounts.total ? Math.min((pipelineCounts.outForDelivery / pipelineCounts.total) * 100, 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 4: Delivered */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500">Delivered</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {pipelineCounts.delivered}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Completed POD signed</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-1.5 rounded-full" 
                  style={{ width: `${pipelineCounts.total ? Math.min((pipelineCounts.delivered / pipelineCounts.total) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Charts Row */}
        <ChartsRow 
          chartData={chartData}
          revenueAnalytics={revenueAnalytics}
          userGrowth={userGrowth}
          realTimeData={realTimeData}
        />

        {/* Live Consignment Manifest (Recent Shipments) Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-600" />
                Live Consignment Manifest
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active shipments with real-time checkpoint updates and invoices.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  activeFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({recentShipments.length})
              </button>
              <button
                onClick={() => setActiveFilter('IN_TRANSIT')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  activeFilter === 'IN_TRANSIT'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Transit ({pipelineCounts.inTransit})
              </button>
              <button
                onClick={() => setActiveFilter('PENDING')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  activeFilter === 'PENDING'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({pipelineCounts.pending})
              </button>
              <button
                onClick={() => setActiveFilter('DELIVERED')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  activeFilter === 'DELIVERED'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Delivered ({pipelineCounts.delivered})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pl-2">Waybill / Tracking ID</th>
                  <th className="pb-3">Route (Origin → Destination)</th>
                  <th className="pb-3">Customer / Sender</th>
                  <th className="pb-3">Service Tier</th>
                  <th className="pb-3">Current Location</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                      No consignments matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.slice(0, 8).map((s, idx) => {
                    const id = s.id || s.trackingId;
                    const isDelivered = (s.status || '').toLowerCase().includes('deliver');
                    const isInTransit = (s.status || '').toLowerCase().includes('transit');

                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 pl-2 font-mono font-bold text-slate-900">
                          <Link href={`/track-package?trackingId=${id}`} className="hover:text-teal-700">
                            {id}
                          </Link>
                        </td>
                        <td className="py-3 text-slate-700 max-w-xs truncate">
                          {s.origin || 'Mumbai'} → {s.destination || 'Delhi'}
                        </td>
                        <td className="py-3 text-slate-600">
                          {s.sender?.name || 'Customer'}
                        </td>
                        <td className="py-3 capitalize text-slate-600">
                          {s.packageDetails?.type || 'Standard'} Mode
                        </td>
                        <td className="py-3 text-slate-500 truncate max-w-[150px]">
                          {s.currentLocation || 'Dispatch Facility'}
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isInTransit
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {s.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 pr-2 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => trackingService.downloadInvoice(id).catch((err) => window.alert(err.message))}
                            className="inline-flex items-center text-slate-500 hover:text-teal-700 font-medium"
                            title="Download Tax Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/track-package?trackingId=${id}`}
                            className="inline-flex items-center text-teal-700 hover:text-teal-800 font-medium"
                            title="Live Tracking Console"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing top {Math.min(filteredShipments.length, 8)} of {filteredShipments.length} consignments</span>
            <Link href="/admin/shipments" className="font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1">
              <span>Full Shipments Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Operational Console Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/partners"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-2xs transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                Driver & Fleet Verification
              </span>
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-[11px] text-slate-500">
              Verify courier vehicle papers and driver KYC approvals.
            </p>
          </Link>

          <Link
            href="/admin/complaints"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-2xs transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                Support & Delay Escalations
              </span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-[11px] text-slate-500">
              Review customer tickets, damaged claims, and SLA refunds.
            </p>
          </Link>

          <Link
            href="/admin/reports"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-2xs transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                Audit Reports & Ledger
              </span>
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-[11px] text-slate-500">
              Export GST invoices, COD remittances, and CSV manifests.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-2xs transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                Dispatch System Settings
              </span>
              <CheckCircle2 className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-[11px] text-slate-500">
              Manage shipping rate slabs, webhooks, and hub configurations.
            </p>
          </Link>
        </div>

      </div>
    </div>
  );
}
