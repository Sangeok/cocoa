import { serverClient } from '@/lib/axios'
import { NewsResponse, NewsSchema } from '@/dto/news.dto'
import { API_ROUTES } from '@/const/api'
import { notFound } from 'next/navigation'
import { clsx } from 'clsx'

interface NewsDetailProps {
  params: {
    id: string
  }
}

async function getNewsById(id: string): Promise<NewsResponse> {
  try {
    const url = API_ROUTES.NEWS.READ.url.replace(':id', id)
    const response = await serverClient.get(url)
    return NewsSchema.parse(response.data)
  } catch (error) {
    notFound()
  }
}

export default async function NewsDetail({ params }: NewsDetailProps) {
  const news = await getNewsById(params.id)
  
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Title and Symbol */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          {news.title}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-base sm:text-lg font-medium text-white/80">
            {news.symbol}
          </span>
          <time className="text-sm text-gray-400 sm:ml-auto">
            {new Date(news.timestamp).toLocaleString()}
          </time>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        <p className="text-sm sm:text-base text-gray-200 whitespace-pre-wrap leading-relaxed">
          {news.content}
        </p>
      </div>

      {/* Market Data */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-3">Market Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Basic Market Data */}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-sm text-gray-400">Price</p>
            <p className="text-base sm:text-lg text-white">
              ${news.marketData.price.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-sm text-gray-400">Volume</p>
            <p className="text-base sm:text-lg text-white">
              ${news.marketData.volume.toLocaleString()}
            </p>
          </div>
          
          {/* Optional Market Data */}
          {news.marketData.marketCap && (
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-sm text-gray-400">Market Cap</p>
              <p className="text-base sm:text-lg text-white">
                ${news.marketData.marketCap.toLocaleString()}
              </p>
            </div>
          )}
          
          {/* Price Change */}
          {news.marketData.priceChange24h && (
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-sm text-gray-400">24h Price Change</p>
              <p className={clsx(
                'text-base sm:text-lg font-medium',
                news.marketData.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {news.marketData.priceChange24h > 0 ? '+' : ''}
                {news.marketData.priceChange24h.toFixed(2)}%
              </p>
            </div>
          )}
          
          {/* Volume Change */}
          {news.marketData.volumeChange24h && (
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-sm text-gray-400">24h Volume Change</p>
              <p className={clsx(
                'text-base sm:text-lg font-medium',
                news.marketData.volumeChange24h > 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {news.marketData.volumeChange24h > 0 ? '+' : ''}
                {news.marketData.volumeChange24h.toFixed(2)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

// Generate metadata for the page
export async function generateMetadata({ params }: NewsDetailProps) {
  try {
    const news = await getNewsById(params.id)
    return {
      title: `${news.title} - 코코아`,
      description: news.content.slice(0, 160),
    }
  } catch {
    return {
      title: '코인 뉴스를 찾을 수 없습니다 - 코코아',
      description: '요청한 코인 뉴스 기사를 찾을 수 없습니다.',
    }
  }
}
