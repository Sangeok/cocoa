'use client'

import { useNews } from '@/hooks/useNews'
import NewsCard from '@/components/news/NewsCard'

export default function NewsContent() {
  const newsList = useNews();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          코코아 뉴스
        </h1>
      </div>

      {newsList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">코인 뉴스가 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newsList.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      )}
    </div>
  );
} 