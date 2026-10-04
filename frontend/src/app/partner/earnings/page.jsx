'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import partnerService from '../../../services/partner.service.js';
import { TrendingUp, Package, BarChart2, RefreshCw, ArrowRight } from 'lucide-react';

export default function PartnerEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const router = useRouter();

  useEffect(() => {
    if (!partnerService.isLoggedIn()) { router.push('/partner'); return; }
    loadEarnings();
  }, [selectedPeriod]);

  const loadEarnings = async () => {
    try {
      setLoading(true); setError('');
      const res = await partnerService.getEarnings(selectedPeriod);
      if (res.success) setEarnings(res.earnings);
      else setError('Failed to load earnings data');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('unauthorized')) { partnerService.logout(); router.push('/partner'); }
    } finally { setLoading(false); }
  };

  const PERIODS = [
    { key: 'week', label: 'Last 7 days' },
    { key: 'month', label: 'Last 30 days' },
    { key: 'year', label: 'Last year' },
  ];

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-5 sm:py-7 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Header ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Earnings Report</h1>
            <p className="text-sm text-slate-500 mt-0.5">Track your delivery income and performance.</p>
          </div>
          <button onClick={loadEarnings} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition shadow-sm" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ── Error ─────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* ── Period tabs ────────────────────────── */}
        <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setSelectedPeriod(p.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                selectedPeriod === p.key ? 'bg-teal-700 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── KPI Cards ─────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Total Earnings', value: `₹${(earnings?.totalEarnings || 0).toLocaleString('en-IN')}`,
              badge: 'Period total', badgeStyle: 'text-teal-800 bg-teal-50 border-teal-200', icon: TrendingUp
            },
            {
              label: 'Deliveries Completed', value: earnings?.totalDeliveries || 0,
              badge: 'Completed', badgeStyle: 'text-emerald-800 bg-emerald-50 border-emerald-200', icon: Package
            },
            {
              label: 'Avg Per Delivery', value: `₹${earnings?.averagePerDelivery || 0}`,
              badge: 'Per order', badgeStyle: 'text-slate-700 bg-slate-100 border-slate-200', icon: BarChart2
            },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
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

        {/* ── Daily Breakdown ─────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daily Breakdown</h2>
              <p className="text-xs text-slate-500 mt-0.5">{PERIODS.find(p => p.key === selectedPeriod)?.label}</p>
            </div>
            <button onClick={() => router.push('/partner/deliveries')} className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
              All deliveries <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {!earnings?.dailyBreakdown?.length ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <BarChart2 className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No earnings data for this period</p>
              <p className="text-xs text-slate-400 mt-1">Complete deliveries to see your breakdown here</p>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Date', 'Deliveries', 'Earnings', 'Avg/Order'].map((h) => (
                        <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 ${h === 'Date' ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {earnings.dailyBreakdown.map((day, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap">{fmtDate(day._id)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {day.deliveryCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">₹{day.dailyEarnings}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-500">₹{day.deliveryCount > 0 ? Math.round(day.dailyEarnings / day.deliveryCount) : 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>



      </div>
    </div>
  );
}
