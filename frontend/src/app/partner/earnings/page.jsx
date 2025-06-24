'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import partnerService from '../../../services/partner.service.js';

export default function PartnerEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const router = useRouter();

  useEffect(() => {
    if (!partnerService.isLoggedIn()) {
      router.push('/partner');
      return;
    }
    loadEarnings();
  }, [selectedPeriod]);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await partnerService.getEarnings(selectedPeriod);
      
      if (response.success) {
        setEarnings(response.earnings);
      } else {
        setError('Failed to load earnings data');
      }
    } catch (error) {
      setError(error.message);
      if (error.message.includes('unauthorized') || error.message.includes('token')) {
        partnerService.logout();
        router.push('/partner');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPeriodLabel = (period) => {
    const labels = {
      'week': 'Last 7 Days',
      'month': 'Last 30 Days',
      'year': 'Last 365 Days'
    };
    return labels[period] || 'Last 30 Days';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto"></div>
          <p className="mt-6 text-lg text-white font-medium">Loading earnings data...</p>
          <p className="mt-2 text-sm text-slate-300">Please wait while we fetch your earnings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg border-b border-yellow-400/20">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                <span className="text-yellow-400">Earnings</span> Report
              </h1>
              <p className="text-slate-300 flex items-center">
                <span className="mr-2">💰</span>
                Track your delivery earnings and performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/20">
                <p className="text-sm text-yellow-400">Total Earned</p>
                <p className="text-2xl font-bold text-white">₹{earnings?.totalEarnings || 0}</p>
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

        {/* Period Selector */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg mb-6 p-6 border border-yellow-400/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Select Time Period</h3>
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-800 shadow-lg shadow-yellow-400/25'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:shadow-md'
                }`}
              >
                {getPeriodLabel(period)}
              </button>
            ))}
          </div>
        </div>

        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-yellow-400/20 hover:bg-white/15">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-white">₹{earnings?.totalEarnings || 0}</p>
                <p className="text-xs text-yellow-400 mt-1 font-medium">💰 {getPeriodLabel(selectedPeriod)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Deliveries Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-yellow-400/20 hover:bg-white/15">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-1">Total Deliveries</p>
                <p className="text-3xl font-bold text-white">{earnings?.totalDeliveries || 0}</p>
                <p className="text-xs text-amber-400 mt-1 font-medium">📦 Completed</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Average per Delivery Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-yellow-400/20 hover:bg-white/15">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-1">Avg per Delivery</p>
                <p className="text-3xl font-bold text-white">₹{earnings?.averagePerDelivery || 0}</p>
                <p className="text-xs text-yellow-400 mt-1 font-medium">📊 Per order</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Period Info Card */}
          <div className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-yellow-400/30 hover:from-yellow-400/25 hover:to-amber-500/25">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-400 mb-1">Time Period</p>
                <p className="text-2xl font-bold text-white">{getPeriodLabel(selectedPeriod)}</p>
                <p className="text-xs text-amber-400 mt-1 font-medium">📅 Selected</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-amber-600 to-yellow-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Daily Earnings Breakdown - {getPeriodLabel(selectedPeriod)}
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live Data</span>
              </div>
            </div>
          </div>

          {!earnings?.dailyBreakdown || earnings.dailyBreakdown.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No earnings data for this period</h4>
              <p className="text-gray-500 mb-4">
                Complete deliveries to start earning and see your earnings breakdown here.
              </p>
              <button
                onClick={() => router.push('/partner/deliveries')}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                View Deliveries
              </button>
            </div>
          ) : (
            <div className="p-6">
              {/* Chart Placeholder */}
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h4 className="text-lg font-semibold text-blue-900">📊 Earnings Chart</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Visual chart representation would be implemented here with a charting library like Chart.js or Recharts
                </p>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deliveries
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Earnings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {earnings.dailyBreakdown.map((day, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatDate(day._id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {day.deliveryCount} orders
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                          ₹{day.dailyEarnings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{day.deliveryCount > 0 ? Math.round(day.dailyEarnings / day.deliveryCount) : 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">📊 Summary Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-3xl font-bold text-green-600">₹{earnings.totalEarnings || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Earned</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-3xl font-bold text-blue-600">{earnings.totalDeliveries || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Deliveries Completed</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-3xl font-bold text-purple-600">₹{earnings.averagePerDelivery || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Average per Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tips for Increasing Earnings */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-900">💡 Tips to Increase Your Earnings</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-blue-800">
                  <strong className="text-blue-900">🟢 Stay Online:</strong> Keep your status online during peak hours (12-2 PM, 6-9 PM) to receive more delivery requests.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-blue-800">
                  <strong className="text-blue-900">⚡ Complete Quickly:</strong> Faster deliveries mean more deliveries per day and higher earnings.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-blue-800">
                  <strong className="text-blue-900">⭐ High Ratings:</strong> Maintain good ratings to get priority assignments and potential bonuses.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-blue-800">
                  <strong className="text-blue-900">📍 Strategic Location:</strong> Position yourself near restaurants and busy areas during meal times.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}