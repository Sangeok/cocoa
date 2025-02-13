import React from 'react';

export default function CoinPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chart Skeleton */}
          <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-[calc(100vh-200px)]" />

          {/* Market Data Skeleton */}
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div>
                          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Price Prediction Skeleton */}
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="space-y-4">
              <div className="h-8 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          </div>

          {/* Chat Skeleton */}
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="p-4">
              <div className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded mb-4" />
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 