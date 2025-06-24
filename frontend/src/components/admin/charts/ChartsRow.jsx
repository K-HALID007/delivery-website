"use client";
import { Bar, Line, Doughnut } from 'react-chartjs-2';

export default function ChartsRow({ chartData, revenueAnalytics, userGrowth, realTimeData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
      {/* Revenue Analytics */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200" style={{ height: 400 }}>
        <h2 className="text-xl font-semibold mb-4 text-black flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Revenue Analytics
        </h2>
        <div style={{ height: 320 }}>
          {revenueAnalytics ? (
            <Line
              data={{
                labels: revenueAnalytics.labels,
                datasets: [
                  {
                    label: 'Monthly Revenue ($)',
                    data: revenueAnalytics.monthly,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#000' } }
                },
                scales: {
                  x: { 
                    ticks: { color: '#000' },
                    grid: { color: 'rgba(0,0,0,0.1)' }
                  },
                  y: { 
                    ticks: { color: '#000' },
                    grid: { color: 'rgba(0,0,0,0.1)' }
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                Loading revenue data...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200" style={{ height: 400 }}>
        <h3 className="text-xl font-semibold mb-4 text-black flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
          User Growth
        </h3>
        <div style={{ height: 320 }}>
          {userGrowth ? (
            <Bar
              data={{
                labels: userGrowth.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'New Users',
                    data: userGrowth.monthly || [50, 75, 120, 180, 250, 320],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#000' } }
                },
                scales: {
                  x: { 
                    ticks: { color: '#000' },
                    grid: { color: 'rgba(0,0,0,0.1)' }
                  },
                  y: { 
                    ticks: { color: '#000' },
                    grid: { color: 'rgba(0,0,0,0.1)' }
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Loading user growth data...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Status Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200" style={{ height: 400 }}>
        <h3 className="text-xl font-semibold mb-4 text-black flex items-center">
          <span className="w-3 h-3 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
          Status Distribution
        </h3>
        <div style={{ height: 320 }}>
          {realTimeData && realTimeData.statusDistribution ? (
            <Doughnut
              data={{
                labels: realTimeData.statusDistribution.map(item => item._id),
                datasets: [
                  {
                    data: realTimeData.statusDistribution.map(item => item.count),
                    backgroundColor: [
                      '#f59e0b', // amber
                      '#10b981', // green
                      '#3b82f6', // blue
                      '#ef4444', // red
                      '#8b5cf6', // purple
                      '#f97316', // orange
                    ],
                    borderWidth: 2,
                    borderColor: '#fff',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    labels: { color: '#000' },
                    position: 'bottom'
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                Loading status data...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
