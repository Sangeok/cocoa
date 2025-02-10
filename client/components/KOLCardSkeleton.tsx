export default function KOLCardSkeleton() {
  return (
    <div className="block bg-white dark:bg-gray-900 rounded-lg shadow animate-pulse">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full"
            />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded"
              />
            ))}
          </div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
} 