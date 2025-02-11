"use client";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/axios";
import { NewsListResponse, NewsListResponseSchema } from "@/dto/news.dto";
import { API_ROUTES } from "@/const/api";
import NewsCard from "@/components/news/NewsCard";
import NewsCardSkeleton from "@/components/news/NewsCardSkeleton";
import PremiumTable from "@/components/premium/PremiumTable";
import Link from "next/link";

export default function Home() {
  const [recentNews, setRecentNews] = useState<NewsListResponse>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentNews() {
      try {
        const response = await apiClient.get(API_ROUTES.NEWS.GET.url, {
          params: {
            limit: 3,
            page: 1,
          }
        });
        
        const data = NewsListResponseSchema.parse(response.data.data);
        setRecentNews(data);
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentNews();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Recent News Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            최신 뉴스
          </h2>
          <Link 
            href="/news"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            더보기
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <NewsCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {recentNews.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        )}
      </section>

      {/* Premium Table Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            실시간 김프
          </h2>
        </div>
        <PremiumTable />
      </section>
    </div>
  );
}
