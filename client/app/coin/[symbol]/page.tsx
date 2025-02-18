import { Suspense } from "react";
import CoinPageSkeleton from "@/components/skeleton/CoinPageSkeleton";
import CoinPageContent from "@/components/coin/CoinPageContent";

export default async function CoinPage({
  params,
}: {
  params: { symbol: string };
}) {
  const symbol = await Promise.resolve(params.symbol);
  
  return (
    <Suspense fallback={<CoinPageSkeleton />}>
      <CoinPageContent symbol={symbol} />
    </Suspense>
  );
}
