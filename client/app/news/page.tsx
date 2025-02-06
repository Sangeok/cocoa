import { serverClient } from '@/lib/axios'
import { NewsListResponse, NewsListResponseSchema } from '@/dto/news.dto'
import { API_ROUTES } from '@/const/api'
import NewsCard from '@/components/NewsCard'

async function getNewsList(): Promise<NewsListResponse> {
  try {
    const response = await serverClient.get(API_ROUTES.NEWS.GET.url, {
      params: {
        limit: 20,
        page: 1,
      }
    })
    return NewsListResponseSchema.parse(response.data.data)
  } catch (error) {
    return []
  }
}

export default async function NewsPage() {
  const newsList = await getNewsList()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            코인 뉴스
          </h1>
          {/* Add filters or search here if needed */}
        </div>

        {/* News List */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newsList.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>

        {newsList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">코인 뉴스가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export const metadata = {
  title: '코인 뉴스 - 코코아',
  description: '실시간 코인 뉴스와 시장 동향을 확인하세요.',
}
