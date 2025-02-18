"use client";
import { useState, useEffect } from "react";
import { ClientAPICall } from "@/lib/axios";
import { NewsListResponse, NewsListResponseSchema } from "@/dto/news.dto";
import { API_ROUTES } from "@/const/api";
import NewsCard from "@/components/news/NewsCard";
import NewsCardSkeleton from "@/components/news/NewsCardSkeleton";
import PremiumTable from "@/components/premium/PremiumTable";
import Link from "next/link";
import EventBanner from "@/components/event/EventBanner";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useSwipeable } from "react-swipeable";

export default function Home() {
  const [recentNews, setRecentNews] = useState<NewsListResponse>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  
  const handlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const handlePrev = () => {
    setCurrentNewsIndex((prev) => (prev === 0 ? recentNews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentNewsIndex((prev) => (prev === recentNews.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    async function fetchRecentNews() {
      try {
        const response = await ClientAPICall.get(API_ROUTES.NEWS.GET.url, {
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
    <main>
      <div className="container mx-auto px-4 py-8">
        <div className="flex lg:flex-row flex-col gap-6 mb-6">
          <EventBanner />
          <div className="lg:w-2/3 w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                최신 뉴스
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </div>
                <Link 
                  href="/news"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  더보기
                </Link>
              </div>
            </div>
            <div {...handlers}>
              {isLoading ? (
                <NewsCardSkeleton />
              ) : (
                <NewsCard news={recentNews[currentNewsIndex]} />
              )}
            </div>
          </div>
        </div>
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
    </main>
  );
}
