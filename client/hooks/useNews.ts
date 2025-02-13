import { useState, useEffect } from 'react'
import { serverClient } from '@/lib/axios'
import { NewsListResponse, NewsListResponseSchema } from '@/dto/news.dto'
import { API_ROUTES } from '@/const/api'

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination: {
    limit: number;
    page: number;
  };
}

let newsCache: NewsListResponse | null = null;
let fetchPromise: Promise<NewsListResponse> | null = null;

export function useNews() {
  const [news, setNews] = useState<NewsListResponse | null>(newsCache);

  if (!newsCache) {
    if (!fetchPromise) {
      fetchPromise = serverClient
        .get<ApiResponse<NewsListResponse>>(API_ROUTES.NEWS.GET.url, {
          params: {
            limit: 20,
            page: 1,
          }
        })
        .then(response => {
          const data = NewsListResponseSchema.parse(response.data.data);
          newsCache = data;
          setNews(data);
          return data;
        });
    }
    throw fetchPromise;
  }

  return newsCache;
} 