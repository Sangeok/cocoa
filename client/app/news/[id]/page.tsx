import { Suspense } from 'react'
import NewsDetail from '@/components/news/NewsDetail'
import NewsDetailSkeleton from '@/components/news/NewsDetailSkeleton'

interface NewsPageProps {
  params: {
    id: string
  }
}

export default function NewsPage({ params }: NewsPageProps) {
  return (
    <Suspense fallback={<NewsDetailSkeleton />}>
      <NewsDetail id={params.id} />
    </Suspense>
  )
}
