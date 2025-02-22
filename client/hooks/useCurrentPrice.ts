import { useMemo } from "react";
import { CoinData } from "@/store/useMarketStore";
import { getMarketType, getPriorityExchanges } from "@/lib/market";

interface CurrentPriceInfo {
  price: number;
  exchange: string;
  change24h: number;
}

export function useCurrentPrice(symbol: string, coins: Record<string, CoinData>) {
  const marketType = getMarketType(symbol);
  const priorityExchanges = getPriorityExchanges(marketType);

  return useMemo((): CurrentPriceInfo => {
    if (!coins || !symbol) {
      return { price: 0, exchange: priorityExchanges[0], change24h: 0 };
    }

    for (const exchange of priorityExchanges) {
      const coinData = coins[symbol];
      if (!coinData) {
        return { price: 0, exchange: priorityExchanges[0], change24h: 0 };
      }

      const exchangeData = coinData[exchange as keyof typeof coinData];
      if (exchangeData?.price) {
        return {
          price: exchangeData.price,
          exchange,
          change24h: exchangeData.change24h,
        };
      }
    }
    return { price: 0, exchange: priorityExchanges[0], change24h: 0 };
  }, [coins, symbol, priorityExchanges]);
} 