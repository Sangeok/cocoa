import { useEffect, useState } from "react";
import useMarketStore, { type CoinData } from "@/store/useMarketStore";

interface CoinPriceData {
  exchange: "upbit" | "binance";
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

export function useCoinPrice(symbol: string) {
  const [coinData, setCoinData] = useState<CoinPriceData | null>(null);
  const coins = useMarketStore((state) => state.coins);

  useEffect(() => {
    const marketData = coins[symbol as keyof typeof coins];
    if (!marketData?.upbit) return;

    setCoinData({
      exchange: "upbit",
      symbol,
      price: marketData.upbit.price,
      volume: marketData.upbit.volume,
      timestamp: marketData.upbit.timestamp,
    });
  }, [coins, symbol]);

  return coinData;
}
