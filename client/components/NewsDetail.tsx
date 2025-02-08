'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/axios'
import { NewsResponse, NewsSchema } from '@/dto/news.dto'
import { API_ROUTES } from '@/const/api'
import { useRouter } from 'next/navigation'
import NewsDetailSkeleton from '@/components/NewsDetailSkeleton'
import { clsx } from 'clsx'

interface ApiResponse {
  success: boolean;
  data: NewsResponse[];
}

interface NewsDetailProps {
  id: string
}

export default function NewsDetail({ id }: NewsDetailProps) {
  const [news, setNews] = useState<NewsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchNews() {
      try {
        const url = API_ROUTES.NEWS.READ.url.replace(':id', id)
        const response = await apiClient.get<ApiResponse>(url)
        const newsData = response.data.data[0]
        const data = NewsSchema.parse(newsData)
        setNews(data)
      } catch (error) {
        console.error('Failed to fetch news:', error)
        setError('뉴스를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [id])

  if (isLoading) {
    return <NewsDetailSkeleton />
  }

  if (error || !news) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center">
          <p className="text-red-500">{error || '뉴스를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Title and Symbol */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
          {news.title}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-base sm:text-lg font-medium text-gray-700 dark:text-white/80">
            {news.symbol}
          </span>
          <time className="text-sm text-gray-500 dark:text-gray-400 sm:ml-auto">
            {new Date(news.timestamp).toLocaleString()}
          </time>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
          {news.content}
        </p>
      </div>

      {/* Market Data */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Market Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Price */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
            <p className="text-base sm:text-lg text-gray-900 dark:text-white">
              ${news.marketData.currentPrice.toLocaleString()}
            </p>
          </div>
          
          {/* Volume */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Volume</p>
            <p className="text-base sm:text-lg text-gray-900 dark:text-white">
              ${news.marketData.volume.toLocaleString()}
            </p>
          </div>
          
          {/* Price Change */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">24h Price Change</p>
            <p className={clsx(
              'text-base sm:text-lg font-medium',
              news.marketData.priceChange > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            )}>
              {news.marketData.priceChange > 0 ? '+' : ''}
              {news.marketData.priceChange.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </article>
  )
} 