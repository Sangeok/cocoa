'use client'

import { News } from '@/dto/news.dto'
import { clsx } from 'clsx'
import Link from 'next/link'

interface NewsCardProps {
  news: News
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <Link 
      href={`/news/${news.id}`}
      className="block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
    >
      <article className="p-4 space-y-3">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-white/80 px-2 py-1 bg-gray-900/50 rounded">
              {news.symbol}
            </span>
            <time className="text-sm text-gray-400">
              {new Date(news.timestamp).toLocaleString()}
            </time>
          </div>
          <h2 className="text-lg font-semibold text-white line-clamp-2">
            {news.title}
          </h2>
        </div>

        {/* Content Preview */}
        <p className="text-sm text-gray-300 line-clamp-2">
          {news.content}
        </p>

        {/* Market Data */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <p className="text-xs text-gray-400">Price</p>
            <p className="text-sm text-white">
              ${news.marketData.price.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Volume</p>
            <p className="text-sm text-white">
              ${news.marketData.volume.toLocaleString()}
            </p>
          </div>
          {news.marketData.priceChange24h && (
            <div>
              <p className="text-xs text-gray-400">24h Change</p>
              <p className={clsx(
                'text-sm font-medium',
                news.marketData.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {news.marketData.priceChange24h > 0 ? '+' : ''}
                {news.marketData.priceChange24h.toFixed(2)}%
              </p>
            </div>
          )}
          {news.marketData.volumeChange24h && (
            <div>
              <p className="text-xs text-gray-400">Vol Change</p>
              <p className={clsx(
                'text-sm font-medium',
                news.marketData.volumeChange24h > 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {news.marketData.volumeChange24h > 0 ? '+' : ''}
                {news.marketData.volumeChange24h.toFixed(2)}%
              </p>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
} 