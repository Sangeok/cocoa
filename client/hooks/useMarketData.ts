import { useState, useMemo, useEffect } from "react";
import { calculatePriceGap } from "@/lib/format";
import useMarketStore from "@/store/useMarketStore";
import useMarketsStore from "@/store/useMarketsStore";
import type { ExchangePair, SortState, SortField } from "@/types/exchange";

export function useMarketData() {
  const { coins, exchangeRate } = useMarketStore();
  const { fetchMarkets, getKoreanName } = useMarketsStore();
  const [exchangePair, setExchangePair] = useState<ExchangePair>({
    from: "upbit",
    to: "binance",
    fromBase: "KRW",
    toBase: "USDT",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPromise = fetchMarkets();
    if (!coins || !exchangeRate) {
      throw fetchPromise;
    }
  }, [fetchMarkets]);

  // 데이터가 없으면 에러를 throw하여 Suspense가 처리하도록 함
  if (!coins || !exchangeRate) {
    throw new Promise((resolve) => {
      // 데이터 로딩이 완료되면 resolve
      const interval = setInterval(() => {
        if (coins && exchangeRate) {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
    });
  }

  const filteredMarkets = useMemo(() => {
    if (!coins || !exchangeRate?.rate) return [];

    return Object.entries(coins)
      .filter(([marketSymbol, data]) => {
        const fromData = data[exchangePair.from];
        if (!fromData?.price) return false;

        const [baseToken, quoteToken] = marketSymbol.split("-");
        if (quoteToken !== exchangePair.fromBase) return false;

        const toMarketSymbol = `${baseToken}-${exchangePair.toBase}`;
        if (!coins[toMarketSymbol]?.[exchangePair.to]?.price) return false;

        if (searchTerm) {
          const koreanName = getKoreanName(marketSymbol).toLowerCase();
          const englishName = baseToken.toLowerCase();
          const search = searchTerm.toLowerCase();
          return koreanName.includes(search) || englishName.includes(search);
        }

        return true;
      })
      .map(([marketSymbol, data]) => {
        const [baseToken] = marketSymbol.split("-");
        const fromPrice = data[exchangePair.from]?.price || 0;
        const toMarketSymbol = `${baseToken}-${exchangePair.toBase}`;
        const toPrice = coins[toMarketSymbol]?.[exchangePair.to]?.price || 0;

        return {
          symbol: marketSymbol,
          exchange: exchangePair.from,
          fromPrice,
          toPrice,
          volume: data[exchangePair.from]?.volume || 0,
          timestamp: data[exchangePair.from]?.timestamp || Date.now(),
          fromPriceChange24h: data[exchangePair.from]?.change24h || 0,
          toPriceChange24h:
            coins[toMarketSymbol]?.[exchangePair.to]?.change24h || 0,
          priceGapPercent: calculatePriceGap(
            coins,
            {
              exchange: exchangePair.from,
              symbol: marketSymbol,
              price: fromPrice,
              volume: data[exchangePair.from]?.volume || 0,
              timestamp: data[exchangePair.from]?.timestamp || Date.now(),
            },
            exchangePair,
            {
              USDT: { KRW: exchangeRate?.rate || 0 },
              BTC: {
                KRW: coins["BTC-KRW"]?.[exchangePair.from]?.price || 0,
                USDT: coins["BTC-USDT"]?.[exchangePair.to]?.price || 0,
              },
            }
          ),
        };
      });
  }, [coins, exchangePair, exchangeRate?.rate, searchTerm, getKoreanName]);

  const getSortedMarkets = (sortState: SortState) => {
    if (!filteredMarkets) return [];

    return [...filteredMarkets].sort((a, b) => {
      if (sortState.direction === null) return 0;

      const modifier = sortState.direction === "asc" ? 1 : -1;

      switch (sortState.field) {
        case "name":
          return modifier * a.symbol.localeCompare(b.symbol);
        case "fromPrice":
          return modifier * (a.fromPrice - b.fromPrice);
        case "toPrice":
          return modifier * (a.toPrice - b.toPrice);
        case "premium":
          return modifier * (a.priceGapPercent - b.priceGapPercent);
        case "volume":
          return modifier * (a.volume * a.fromPrice - b.volume * b.fromPrice);
        case "timestamp":
          return modifier * (a.timestamp - b.timestamp);
        default:
          return 0;
      }
    });
  };

  return {
    exchangeRate,
    exchangePair,
    setExchangePair,
    searchTerm,
    setSearchTerm,
    getKoreanName,
    getSortedMarkets,
  };
} 