export default function NewsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow animate-pulse">
      <div className="p-4 space-y-3">
        {/* Symbol */}
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        
        {/* Content */}
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        
        {/* Timestamp */}
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
      </div>
    </div>
  )
} 