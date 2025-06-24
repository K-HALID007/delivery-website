import React from 'react';

const AdminPageSkeleton = ({ 
  title = "Loading...", 
  showCards = true, 
  showTable = true, 
  showCharts = false,
  cardCount = 4,
  tableRows = 8 
}) => {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Page Title Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>

      {/* Action Bar Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <div className="h-10 bg-gray-300 rounded w-32"></div>
          <div className="h-10 bg-gray-300 rounded w-24"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-300 rounded w-20"></div>
          <div className="h-10 bg-gray-300 rounded w-28"></div>
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      {showCards && (
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(cardCount, 4)} gap-6 mb-8`}>
          {[...Array(cardCount)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-300 rounded w-24"></div>
                <div className="h-8 bg-gray-300 rounded w-8"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Section Skeleton */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
      )}

      {/* Main Content Area Skeleton */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Content Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-300 rounded w-48"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-300 rounded w-20"></div>
              <div className="h-8 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>

        {/* Filters/Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        {showTable && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[...Array(6)].map((_, index) => (
                    <th key={index} className="px-6 py-3">
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(tableRows)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {[...Array(6)].map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        {colIndex === 0 ? (
                          <div className="h-4 bg-gray-300 rounded w-32"></div>
                        ) : colIndex === 1 ? (
                          <div className="h-4 bg-gray-300 rounded w-40"></div>
                        ) : colIndex === 5 ? (
                          <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                        ) : (
                          <div className="h-4 bg-gray-300 rounded w-24"></div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Content List Skeleton (Alternative to table) */}
        {!showTable && (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                    <div className="h-8 bg-gray-300 rounded w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination Skeleton */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
            <div className="flex space-x-2">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-8 w-8 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="text-center mt-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
          <span className="text-gray-500 text-sm">Loading {title.toLowerCase()}...</span>
        </div>
      </div>
    </div>
  );
};

export default AdminPageSkeleton;