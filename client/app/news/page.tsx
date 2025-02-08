'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/axios'
import { NewsListResponse, NewsListResponseSchema } from '@/dto/news.dto'
import { API_ROUTES } from '@/const/api'
import NewsCard from '@/components/NewsCard'
import NewsCardSkeleton from '@/components/NewsCardSkeleton'

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination: {
    limit: number;
    page: number;
  };
}

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsListResponse>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await apiClient.get<ApiResponse<NewsListResponse>>(API_ROUTES.NEWS.GET.url, {
          params: {
            limit: 20,
            page: 1,
          }
        })
        
        const data = NewsListResponseSchema.parse(response.data.data)
        setNewsList(data)
      } catch (err) {
        setError('뉴스를 불러오는데 실패했습니다.')
        console.error('Failed to fetch news:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            코인 뉴스
          </h1>
          {/* Add filters or search here if needed */}
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <NewsCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          /* News List */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newsList.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        )}

        {!isLoading && newsList.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">코인 뉴스가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}