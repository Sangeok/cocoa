import { Suspense } from "react";
import CoinPageSkeleton from "@/components/skeleton/CoinPageSkeleton";
import CoinPageContent from "@/components/coin/CoinPageContent";

export default function CoinPage({ params }: { params: { symbol: string } }) {
  return (
    <Suspense fallback={<CoinPageSkeleton />}>
      <CoinPageContent symbol={params.symbol} />
    </Suspense>
  );
}
