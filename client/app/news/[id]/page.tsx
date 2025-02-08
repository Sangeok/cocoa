import { Suspense } from 'react'
import NewsDetail from '@/components/NewsDetail'
import NewsDetailSkeleton from '@/components/NewsDetailSkeleton'

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
