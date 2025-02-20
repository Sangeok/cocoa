"use client";

import { Suspense } from "react";
import NewsContent from "@/components/news/NewsContent";
import NewsCardSkeleton from "@/components/news/NewsCardSkeleton";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function NewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <ErrorBoundary
        fallback={
          <div className="text-red-500">뉴스를 불러오는데 실패했습니다.</div>
        }
      >
        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <NewsCardSkeleton key={index} />
              ))}
            </div>
          }
        >
          <NewsContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
