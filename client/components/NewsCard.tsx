'use client'

import { News } from '@/dto/news.dto'
import { clsx } from 'clsx'
import Link from 'next/link'
import { formatCurrency } from '@/lib/format'

interface NewsCardProps {
  news: News
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <Link 
      href={`/news/${news.id}`}
      className="block bg-white dark:bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <article className="p-4 space-y-3">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white/80 px-2 py-1 bg-gray-100 dark:bg-gray-800/50 rounded">
              {news.symbol}
            </span>
            <time className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(news.timestamp).toLocaleString()}
            </time>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {news.title}
          </h2>
        </div>

        {/* Content Preview */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {news.content}
        </p>

        {/* Market Data */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
            <p className="text-sm text-gray-900 dark:text-white">
              ${news.marketData.currentPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {formatCurrency(news.marketData.volume)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">24h Change</p>
            <p className={clsx(
              'text-sm font-medium',
              news.marketData.priceChange > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            )}>
              {news.marketData.priceChange > 0 ? '+' : ''}
              {news.marketData.priceChange.toFixed(2)}%
            </p>
          </div>
        </div>
      </article>
    </Link>
  )
} 