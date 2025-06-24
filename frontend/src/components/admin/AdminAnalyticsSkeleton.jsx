import React from 'react';

const AdminAnalyticsSkeleton = () => {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-80 mb-2"></div>
          
          <div className="mt-2 flex items-center space-x-2">
            <div className="h-6 bg-gray-300 rounded-full w-32"></div>
            <div className="h-6 bg-gray-300 rounded-full w-28"></div>
            <div className="h-6 bg-gray-300 rounded-full w-20"></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
          <div className="h-10 bg-gray-300 rounded w-24"></div>
          <div className="h-10 bg-gray-300 rounded w-36"></div>
          <div className="h-10 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
      
      {/* Key Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
              <div className="h-12 w-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-5 w-5 bg-gray-300 rounded mr-2"></div>
                <div className="h-6 bg-gray-300 rounded w-48"></div>
              </div>
              {index === 1 && (
                <div className="h-6 bg-gray-300 rounded w-24"></div>
              )}
            </div>
            <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
              </div>
            </div>
            {index === 1 && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-start">
                  <div className="h-5 w-5 bg-gray-300 rounded mr-3 mt-0.5"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Secondary Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-5 w-5 bg-gray-300 rounded mr-2"></div>
                <div className="h-6 bg-gray-300 rounded w-40"></div>
              </div>
            </div>
            <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="h-20 w-20 bg-gray-300 rounded-full mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-36 mx-auto"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, tableIndex) => (
          <div key={tableIndex} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {[...Array(3)].map((_, colIndex) => (
                      <th key={colIndex} className="py-2">
                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                      </td>
                      <td className="py-3">
                        <div className="h-4 bg-gray-300 rounded w-16 ml-auto"></div>
                      </td>
                      <td className="py-3">
                        <div className="h-4 bg-gray-300 rounded w-12 ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary Skeleton */}
      <div className="mt-10 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="text-center">
              <div className="h-8 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="text-center mt-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
          <span className="text-gray-500 text-sm">Loading analytics dashboard...</span>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsSkeleton;