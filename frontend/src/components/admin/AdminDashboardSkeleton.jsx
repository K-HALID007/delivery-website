import React from 'react';

const AdminDashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 bg-gray-300 rounded w-80"></div>
        <div className="flex items-center space-x-4">
          <div className="h-6 bg-gray-300 rounded-full w-24"></div>
          <div className="h-6 bg-gray-300 rounded w-32"></div>
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl shadow-lg p-6 flex flex-col items-center">
            <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div className="bg-gray-400 h-2 rounded-full w-3/4"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Analytics Overview Skeleton */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            <div className="h-6 bg-gray-300 rounded w-48"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-32"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
              <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                  <div className="h-3 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Status Overview Skeleton */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            <div className="h-6 bg-gray-300 rounded w-48"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-6 bg-gray-300 rounded w-16"></div>
            <div className="h-6 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="h-8 bg-gray-300 rounded w-12 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-gray-400 h-1 rounded-full w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators Skeleton */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            <div className="h-6 bg-gray-300 rounded w-56"></div>
          </div>
          <div className="h-6 bg-gray-300 rounded w-40"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="text-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
              <div className="h-8 bg-gray-300 rounded w-24 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-20 mx-auto mb-1"></div>
              <div className="h-2 bg-gray-300 rounded w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Distribution Skeleton */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-200">
        <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-6 bg-gray-300 rounded w-8"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-400 h-2 rounded-full w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Features - Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {/* Recent Activity Skeleton */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            <div className="h-6 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded-full w-16"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Notifications Skeleton */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            <div className="h-6 bg-gray-300 rounded w-36"></div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="p-3 rounded-lg border-l-4 border-gray-300 bg-gray-50">
                <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Management Table Skeleton */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-10 border border-gray-200">
        <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Role', 'Status'].map((header, index) => (
                  <th key={index} className="px-6 py-3">
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(8)].map((_, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loading Text at Bottom */}
      <div className="text-center mt-8 mb-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
          <div className="h-4 bg-gray-300 rounded w-48"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;