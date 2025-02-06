import { useEffect, useState } from 'react';
import { subscribeToCoinPrice } from '@/lib/socket';

interface CoinPriceData {
  symbol: string;
  price: number;
  difference: number;
  timestamp: number;
}

export function useCoinPrice() {
  const [coinData, setCoinData] = useState<CoinPriceData | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCoinPrice((data) => {
      setCoinData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return coinData;
} 