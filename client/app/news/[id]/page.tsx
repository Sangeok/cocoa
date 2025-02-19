import { Metadata } from 'next'
import { Suspense } from 'react'
import NewsDetail from '@/components/news/NewsDetail'
import NewsDetailSkeleton from '@/components/news/NewsDetailSkeleton'
import { ServerAPICall } from '@/lib/axios'
import { API_ROUTES } from '@/const/api'
import { NewsResponse } from '@/dto/news.dto'

interface NewsPageProps {
  params: {
    id: string
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  try {
    const url = API_ROUTES.NEWS.READ.url.replace(":id", params.id)
    const response = await ServerAPICall.get(url)
    const newsData: NewsResponse = response.data.data[0]

    return {
      title: newsData.title,
      description: newsData.content.slice(0, 200) + '...',
      openGraph: {
        title: newsData.title,
        description: newsData.content.slice(0, 200) + '...',
        type: 'article',
        publishedTime: newsData.timestamp,
        authors: ['코코아:코인코인코리아'],
      },
      twitter: {
        card: 'summary_large_image',
        title: newsData.title,
        description: newsData.content.slice(0, 200) + '...',
      }
    }
  } catch (error) {
    return {
      title: 'CoinStudio News',
      description: 'Cryptocurrency news and analysis'
    }
  }
}

// 병렬 라우트를 위한 @news 디렉토리 컴포넌트
export default function NewsPage({ params }: NewsPageProps) {
  return (
    <Suspense fallback={<NewsDetailSkeleton />}>
      <NewsDetail id={params.id} />
    </Suspense>
  )
}
