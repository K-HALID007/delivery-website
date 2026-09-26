'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import partnerService from '../../../services/partner.service.js';
import { TrendingUp, Package, BarChart2, RefreshCw, ArrowRight, Lightbulb } from 'lucide-react';

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
  const maxEarning = earnings?.dailyBreakdown?.length ? Math.max(...earnings.dailyBreakdown.map(d => d.dailyEarnings), 1) : 1;

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

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
                selectedPeriod === p.key ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
              badge: 'Period total', badgeStyle: 'text-amber-900 bg-amber-50 border-amber-200', icon: TrendingUp
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

        {/* ── Daily Breakdown ─────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm">
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
              {/* Mini bar chart */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Earnings chart</p>
                <div className="flex items-end gap-1 h-24">
                  {earnings.dailyBreakdown.slice(-14).map((day, i) => {
                    const pct = (day.dailyEarnings / maxEarning) * 100;
                    return (
                      <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                          ₹{day.dailyEarnings}
                        </div>
                        <div
                          className="w-full rounded-sm bg-slate-900 hover:bg-amber-500 transition-colors"
                          style={{ height: `${Math.max(pct, 3)}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>

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

        {/* ── Tips ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Tips to Boost Earnings</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: 'Stay Online', desc: 'Be available during peak hours (12–2 PM, 6–9 PM)' },
              { title: 'Complete Quickly', desc: 'Faster deliveries mean more orders per day' },
              { title: 'Maintain Ratings', desc: 'High ratings get you priority assignments' },
              { title: 'Smart Positioning', desc: 'Stay near busy areas during meal times' },
            ].map((tip) => (
              <div key={tip.title} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                <div>
                  <p className="text-xs font-bold text-slate-800">{tip.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}