"use client";

import { Suspense } from "react";
import PremiumTableContent from "@/components/premium/PremiumTableContent";
import PremiumTableSkeleton from "@/components/premium/PremiumTableSkeleton";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function PremiumTable() {
  return (
    <ErrorBoundary fallback={<div>프리미엄 정보를 불러오는데 실패했습니다.</div>}>
      <Suspense 
        fallback={<PremiumTableSkeleton />}
        children={<PremiumTableContent />} 
      />
    </ErrorBoundary>
  );
}
