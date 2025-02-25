"use client";

import { Suspense } from "react";
import PremiumTableContent from "@/components/premium/PremiumTableContent";
import PremiumTableSkeleton from "@/components/premium/PremiumTableSkeleton";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function PremiumTable() {
  return (
    <section className="container mx-auto sm:px-4">
      <div className="px-4 sm:px-0 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          실시간 김프
        </h2>
      </div>
      <ErrorBoundary
        fallback={
          <div className="text-center py-4">
            프리미엄 정보를 불러오는데 실패했습니다.
          </div>
        }
      >
        <Suspense fallback={<PremiumTableSkeleton />}>
          <PremiumTableContent />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}
