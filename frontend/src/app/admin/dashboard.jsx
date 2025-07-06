import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function AdminDashboard() {
  // Example summary data
  const [summary] = useState({
    totalShipments: 1200,
    activeUsers: 340,
    revenue: 54000,
    pendingDeliveries: 23,
  });

  // Example chart data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Shipments',
        data: [120, 190, 300, 500, 200, 300],
        backgroundColor: '#fbbf24',
      },
      {
        label: 'Revenue',
        data: [2000, 3000, 4000, 6000, 3500, 5000],
        backgroundColor: '#6366f1',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-amber-500">{summary.totalShipments}</span>
          <span className="text-gray-600 mt-2">Total Shipments</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-blue-500">{summary.activeUsers}</span>
          <span className="text-gray-600 mt-2">Active Users</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-green-500">₹{summary.revenue.toLocaleString()}</span>
          <span className="text-gray-600 mt-2">Revenue</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-red-500">{summary.pendingDeliveries}</span>
          <span className="text-gray-600 mt-2">Pending Deliveries</span>
        </div>
      </div>
      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">Shipments & Revenue Trend</h2>
        <Bar data={chartData} />
      </div>
      {/* Placeholders for other features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <div className="h-24 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Notifications & Alerts</h3>
          <div className="h-24 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      {/* More features (user mgmt, shipments mgmt, settings, audit, etc.) would go here */}
    </div>
  );
}
