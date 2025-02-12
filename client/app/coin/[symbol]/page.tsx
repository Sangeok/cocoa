'use client';

import { useParams } from 'next/navigation';
import TradingViewWidget from '@/components/chart/TradingViewWidget';
import useMarketsStore from '@/store/useMarketsStore';
import { useEffect } from 'react';

export default function CoinPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const { markets, fetchMarkets, getKoreanName } = useMarketsStore();

  useEffect(() => {
    if (!markets) {
      fetchMarkets();
    }
  }, [markets, fetchMarkets]);

  const koreanName = getKoreanName(symbol);
  const formattedSymbol = symbol.replace('-', '');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {koreanName} ({symbol})
        </h1>
      </div>
      <div className="bg-black rounded-lg shadow-lg overflow-hidden">
        <TradingViewWidget symbol={formattedSymbol} />
      </div>
    </div>
  );
}
