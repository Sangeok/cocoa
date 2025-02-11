"use client";

import { Suspense } from "react";
import PremiumTableContent from "./PremiumTableContent";
import PremiumTableSkeleton from "./PremiumTableSkeleton";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function PremiumTable() {
  return (
    <ErrorBoundary
      fallback={<div>프리미엄 정보를 불러오는데 실패했습니다.</div>}
    >
      <Suspense fallback={<PremiumTableSkeleton />}>
        <PremiumTableContent />
      </Suspense>
    </ErrorBoundary>
  );
}
