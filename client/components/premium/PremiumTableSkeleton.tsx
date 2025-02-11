export default function PremiumTableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-900">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-900">
        <thead>
          <tr className="text-gray-500 dark:text-gray-400 text-sm">
            <th className="px-6 py-3 text-left">이름</th>
            <th className="px-6 py-3 text-right">가격</th>
            <th className="px-6 py-3 text-right">가격</th>
            <th className="px-6 py-3 text-right">프리미엄</th>
            <th className="px-6 py-3 text-right">거래량</th>
            <th className="px-6 py-3 text-right">최근 업데이트</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-900">
          {[...Array(20)].map((_, index) => (
            <tr key={index} className="text-sm">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-800 animate-pulse mr-2" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse ml-auto" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse ml-auto" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse ml-auto" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse ml-auto" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 