'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePartner } from '../../../contexts/PartnerContext.js';
import { useToast } from '../../../contexts/ToastContext.js';
import partnerService from '../../../services/partner.service.js';
import { Package, CheckCircle2, TrendingUp, RefreshCw, ArrowRight, MapPin } from 'lucide-react';

export default function PartnerDashboard() {
  const { partner, stats, onlineStatus, toggleOnlineStatus, setStats } = usePartner();
  const { showSuccess, showInfo } = useToast();
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!partnerService.isLoggedIn()) { router.push('/partner'); return; }
    loadDashboardData();
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      showInfo('Checking for new deliveries...', 3000);
      loadDashboardData();
      setTimeout(() => showSuccess('You\'re online! Ready to receive deliveries.', 4000), 2000);
    };
    window.addEventListener('partnerOnline', handleOnline);
    return () => window.removeEventListener('partnerOnline', handleOnline);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getDashboard();
      if (res.success) {
        setStats(res.stats);
        setActiveDeliveries(res.activeDeliveries || []);
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes('unauthorized') || err.message.includes('token')) {
        partnerService.logout(); router.push('/partner');
      }
    } finally { setLoading(false); }
  };

  const handleToggle = async () => { try { await toggleOnlineStatus(); } catch (e) { setError(e.message); } };

  const getStatusColor = (status) => {
    const map = {
      assigned: 'bg-teal-50 text-teal-700 border-teal-200',
      picked_up: 'bg-sky-50 text-sky-700 border-sky-200',
      in_transit: 'bg-teal-50 text-teal-700 border-teal-200',
      out_for_delivery: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return map[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 mb-2">
              <span className={`w-2 h-2 rounded-full ${onlineStatus ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              {onlineStatus ? 'Online · Accepting deliveries' : 'Currently offline'}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {partner?.name?.split(' ')[0] || 'Partner'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Here's your delivery overview for today.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition shadow-sm"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggle}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition shadow-sm ${
                onlineStatus
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                  : 'bg-teal-600 border-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              {onlineStatus ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>

        {/* ── Error ───────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* ── KPI Cards ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Today's Deliveries", value: stats?.todayDeliveries ?? 0, icon: Package, badge: 'Today', badgeStyle: 'text-slate-700 bg-slate-100 border-slate-200' },
            { label: 'Total Completed', value: stats?.completedDeliveries ?? 0, icon: CheckCircle2, badge: 'All time', badgeStyle: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
            { label: 'Monthly Earnings', value: `₹${(stats?.monthlyEarnings || 0).toLocaleString('en-IN')}`, icon: TrendingUp, badge: 'This month', badgeStyle: 'text-teal-800 bg-teal-50 border-teal-200' },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.label}</span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <card.icon className="w-4 h-4 text-slate-700" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</span>
                <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${card.badgeStyle}`}>{card.badge}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Active Deliveries ───────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Deliveries</h2>
              <p className="text-xs text-slate-500 mt-0.5">{activeDeliveries.length} ongoing right now</p>
            </div>
            <button
              onClick={() => router.push('/partner/deliveries')}
              className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {activeDeliveries.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No active deliveries</p>
              <p className="text-xs text-slate-400 mt-1">
                {onlineStatus ? 'Waiting for new assignments' : 'Go online to start receiving orders'}
              </p>
              {!onlineStatus && (
                <button
                  onClick={handleToggle}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition"
                >
                  Go Online
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeDeliveries.map((d) => (
                <div key={d._id} className="px-5 py-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-bold text-slate-900">#{d.trackingId}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(d.status)}`}>
                          {d.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-slate-700 truncate">{d.sender?.name}</p>
                            <p className="truncate">{d.sender?.address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 text-teal-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-slate-700 truncate">{d.receiver?.name}</p>
                            <p className="truncate">{d.receiver?.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-slate-900">₹{d.partnerEarnings || 0}</p>
                      <button
                        onClick={() => router.push(`/partner/deliveries/${d.trackingId}`)}
                        className="mt-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
