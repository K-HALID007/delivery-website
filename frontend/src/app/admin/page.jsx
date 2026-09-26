"use client";

import { useState, useEffect, useCallback } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartsRow from '@/components/admin/charts/ChartsRow';
import { 
  Package, 
  Users, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  Wifi, 
  ShieldCheck, 
  ArrowUpRight, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import AdminDashboardSkeleton from '@/components/admin/AdminDashboardSkeleton';
import { API_URL } from '../../services/api.config.js';
import Link from 'next/link';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [userGrowth, setUserGrowth] = useState(null);
  const [shipmentHeatmap, setShipmentHeatmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('Polling Mode');

  useEffect(() => {
    setConnectionStatus('Polling Mode');
  }, []);

  // Fetch real-time analytics data
  const fetchRealTimeAnalytics = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('user_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const response = await fetch(`${API_URL}/admin/analytics/realtime`, { headers });
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
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              borderColor: '#0f172a',
              borderWidth: 1.5,
              borderRadius: 6,
              borderSkipped: false,
              hoverBackgroundColor: '#0f172a',
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

      if (data.regionalData && data.regionalData.length > 0) {
        setShipmentHeatmap({
          regions: data.regionalData.map(item => ({
            region: item._id,
            count: item.count
          }))
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
      const data = await response.json();
      setRevenueAnalytics(data);
      
      if (data.totalRevenue > 0) {
        setNotifications(prev => [
          { 
            id: Date.now(), 
            message: `Total Revenue: ₹${data.totalRevenue.toLocaleString()} | Avg Order: ₹${data.averageOrderValue?.toFixed(2) || '0'}`, 
            type: 'success' 
          },
          ...prev.slice(0, 4)
        ]);
      }
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

      const [summaryRes, shipmentsRes, usersRes] = await Promise.allSettled([
        fetch(`${API_URL}/admin/summary`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/admin/shipments/recent`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/admin/users`, { headers }).then(r => r.json())
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setSummary(summaryRes.value);
      } else {
        setSummary({ totalShipments: 0, activeUsers: 0, revenue: 0, pendingDeliveries: 0 });
      }

      if (shipmentsRes.status === 'fulfilled' && shipmentsRes.value) {
        setRecentShipments(Array.isArray(shipmentsRes.value) ? shipmentsRes.value : shipmentsRes.value.shipments || []);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value) {
        setUsers(Array.isArray(usersRes.value) ? usersRes.value : usersRes.value.users || []);
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

  if (loading && !summary) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Console */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Logistics Operations</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Live oversight of shipment consignments, driver fleet assignments, and revenue flow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Live Polling: {lastUpdate.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={() => {
                fetchDashboardData();
                fetchRealTimeAnalytics();
                fetchRevenueAnalytics();
              }}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Minimal Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Active Shipments */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Active Shipments
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <Package className="w-4 h-4 text-slate-800" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {summary?.totalShipments ?? 0}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Transit pipeline</span>
              <Link href="/admin/shipments" className="font-bold text-slate-900 hover:text-amber-700 flex items-center gap-0.5">
                View all →
              </Link>
            </div>
          </div>

          {/* Active Registered Users */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Registered Users
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <Users className="w-4 h-4 text-slate-800" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {summary?.activeUsers ?? users.length}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                +12% mo
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Customer directory</span>
              <Link href="/admin/users" className="font-bold text-slate-900 hover:text-amber-700 flex items-center gap-0.5">
                Manage →
              </Link>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Total Freight Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                ₹{(summary?.revenue || revenueAnalytics?.totalRevenue || 0).toLocaleString()}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Settled
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Avg order ₹{revenueAnalytics?.averageOrderValue?.toFixed(0) || '120'}</span>
              <Link href="/admin/analytics" className="font-bold text-slate-900 hover:text-amber-700 flex items-center gap-0.5">
                Financials →
              </Link>
            </div>
          </div>

          {/* Pending Deliveries */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pending Actions
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <Clock className="w-4 h-4 text-slate-800" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {summary?.pendingDeliveries ?? 0}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Awaiting dispatch
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Delivery queues</span>
              <Link href="/admin/shipments" className="font-bold text-slate-900 hover:text-amber-700 flex items-center gap-0.5">
                Process →
              </Link>
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

        {/* Quick Analytics & Performance Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Operational Velocity & Trends
              </h2>
              <p className="text-xs text-slate-600 font-medium">Consolidated snapshot of daily, weekly, and monthly cadence</p>
            </div>
            <Link
              href="/admin/analytics" 
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              Full Analytics Console →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Today's Performance */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Today's Performance
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">New Shipments</span>
                  <span className="font-extrabold text-slate-900">
                    {chartData?.datasets?.[0]?.data?.slice(-1)[0] || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Daily Revenue</span>
                  <span className="font-extrabold text-emerald-800">
                    ₹{revenueAnalytics?.daily?.slice(-1)[0]?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* This Week */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                This Week Cadence
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Total Volume</span>
                  <span className="font-extrabold text-slate-900">
                    {chartData?.datasets?.[0]?.data?.slice(-7).reduce((a, b) => a + b, 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Week-over-Week</span>
                  <span className="font-extrabold text-emerald-800">+12.5%</span>
                </div>
              </div>
            </div>

            {/* This Month */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Monthly Aggregate
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Total Revenue</span>
                  <span className="font-extrabold text-slate-900">
                    ₹{revenueAnalytics?.monthly?.slice(-1)[0]?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Avg Ticket Size</span>
                  <span className="font-extrabold text-slate-900">
                    ₹{revenueAnalytics?.averageOrderValue?.toFixed(0) || '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Distribution Breakdown */}
        {realTimeData && realTimeData.statusDistribution && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Consignment Pipeline Distribution
              </h3>
              <Link href="/admin/shipments" className="text-xs font-bold text-slate-700 hover:text-slate-900">
                Filter in table →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {realTimeData.statusDistribution.slice(0, 4).map((status, index) => (
                <div key={index} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
                  <div className="text-2xl font-extrabold text-slate-900">{status.count}</div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{status._id}</div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-slate-900 h-1.5 rounded-full" 
                      style={{
                        width: `${Math.min((status.count / Math.max(...realTimeData.statusDistribution.map(s => s.count))) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2-Column: Recent Shipments & Live Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Shipments */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-700" />
                Recent Dispatched Consignments
              </h3>
              <Link href="/admin/shipments" className="text-xs font-bold text-slate-700 hover:text-slate-900">
                View All
              </Link>
            </div>
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {recentShipments.slice(0, 6).map((s, i) => (
                <Link 
                  key={i} 
                  href={`/admin/shipments/${s.id || s.trackingId}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900 block">{s.id || s.trackingId}</span>
                    <span className="text-slate-600 text-xs font-medium truncate max-w-xs block mt-0.5">{s.origin} → {s.destination}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    s.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' :
                    s.status === 'In Transit' ? 'bg-blue-50 text-blue-800 border border-blue-300' :
                    'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {s.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts & Navigation Console */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Admin Command Shortcuts
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Link
                  href="/admin/create-shipment"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition group block"
                >
                  <span className="font-bold text-slate-900 block group-hover:text-amber-700">Book Shipment</span>
                  <span className="text-slate-600 text-xs font-medium block mt-0.5">Generate new courier</span>
                </Link>

                <Link
                  href="/admin/partners"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition group block"
                >
                  <span className="font-bold text-slate-900 block group-hover:text-amber-700">Driver Verification</span>
                  <span className="text-slate-600 text-xs font-medium block mt-0.5">Approve KYC applications</span>
                </Link>

                <Link
                  href="/admin/complaints"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition group block"
                >
                  <span className="font-bold text-slate-900 block group-hover:text-amber-700">Complaints & Refunds</span>
                  <span className="text-slate-600 text-xs font-medium block mt-0.5">Review customer tickets</span>
                </Link>

                <Link
                  href="/admin/reports"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition group block"
                >
                  <span className="font-bold text-slate-900 block group-hover:text-amber-700">Audit Reports</span>
                  <span className="text-slate-600 text-xs font-medium block mt-0.5">Export CSV & financial ledger</span>
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Prime Logistics Dispatcher Core v2.4</span>
              <span className="font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Services Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}