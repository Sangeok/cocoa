import { useState, useMemo, useEffect } from "react";
import { calculatePriceGap } from "@/lib/format";
import useMarketStore from "@/store/useMarketStore";
import useMarketsStore, { KoreanMarket } from "@/store/useMarketsStore";
import type { ExchangePair, SortState } from "@/types/exchange";

export function useMarketData() {
  const { coins, exchangeRate } = useMarketStore();
  const { markets, fetchMarkets, getKoreanName } = useMarketsStore();
  const [exchangePair, setExchangePair] = useState<ExchangePair>({
    from: "upbit",
    to: "binance",
    fromBase: "KRW",
    toBase: "USDT",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!markets) {
      fetchMarkets().catch((error) => {
        console.error("Failed to fetch markets:", error);
      });
    }
  }, [markets, fetchMarkets]);

  const filteredMarkets = useMemo(() => {
    if (!coins || !exchangeRate?.rate || !markets) return [];

    if (exchangePair.from === "binance") {
      const list = markets?.binance.map((market) => {
        const { baseToken, quoteToken } = market;
        const fromMarketSymbol = `${baseToken}-${exchangePair.fromBase}`;
        const toMarketSymbol = `${baseToken}-${exchangePair.toBase}`;
        const fromPrice =
          coins[fromMarketSymbol]?.[exchangePair.from]?.price || 0;
        const toPrice = coins[toMarketSymbol]?.[exchangePair.to]?.price || 0;

        const volume =
          coins[fromMarketSymbol]?.[exchangePair.from]?.volume || 0;

        const priceGapPercent = calculatePriceGap(
          coins,
          {
            exchange: exchangePair.from,
            symbol: fromMarketSymbol,
            price: fromPrice,
            volume,
            timestamp:
              coins[fromMarketSymbol]?.[exchangePair.from]?.timestamp ||
              Date.now(),
          },
          exchangePair,
          {
            USDT: { KRW: exchangeRate?.rate || 0 },
            BTC: {
              KRW: coins["BTC-KRW"]?.[exchangePair.from]?.price || 0,
              USDT: coins["BTC-USDT"]?.[exchangePair.to]?.price || 0,
            },
          }
        );

        return {
          symbol: `${baseToken}-${quoteToken}`,
          exchange: exchangePair.from,
          fromPrice,
          toPrice,
          volume,
          timestamp:
            coins[fromMarketSymbol]?.[exchangePair.from]?.timestamp ||
            Date.now(),
          fromPriceChange24h:
            coins[fromMarketSymbol]?.[exchangePair.from]?.change24h || 0,
          toPriceChange24h:
            coins[toMarketSymbol]?.[exchangePair.to]?.change24h || 0,
          priceGapPercent,
        };
      });

      if (searchTerm) {
        return list.filter((item) => {
          const { symbol } = item;
          return symbol.includes(searchTerm);
        });
      }

      return list;
    }

    const list = markets?.[exchangePair.from as keyof typeof markets]
      .filter((item) => {
        const { market } = item as KoreanMarket;
        return market.split("-")[0] === exchangePair.fromBase;
      })
      .map((item) => {
        const { market } = item as KoreanMarket;
        const [quoteToken, baseToken] = market.split("-");
        const fromMarketSymbol = `${baseToken}-${exchangePair.fromBase}`;
        const toMarketSymbol = `${baseToken}-${exchangePair.toBase}`;
        const fromPrice =
          coins[fromMarketSymbol]?.[exchangePair.from]?.price || 0;
        const toPrice = coins[toMarketSymbol]?.[exchangePair.to]?.price || 0;

        const volume =
          coins[fromMarketSymbol]?.[exchangePair.from]?.volume || 0;

        const priceGapPercent = calculatePriceGap(
          coins,
          {
            exchange: exchangePair.from,
            symbol: fromMarketSymbol,
            price: fromPrice,
            volume,
            timestamp:
              coins[fromMarketSymbol]?.[exchangePair.from]?.timestamp ||
              Date.now(),
          },
          exchangePair,
          {
            USDT: { KRW: exchangeRate?.rate || 0 },
            BTC: {
              KRW: coins["BTC-KRW"]?.[exchangePair.from]?.price || 0,
              USDT: coins["BTC-USDT"]?.[exchangePair.to]?.price || 0,
            },
          }
        );

        return {
          symbol: `${baseToken}-${quoteToken}`,
          exchange: exchangePair.from,
          fromPrice,
          toPrice,
          volume,
          timestamp:
            coins[fromMarketSymbol]?.[exchangePair.from]?.timestamp || 0,
          fromPriceChange24h:
            coins[fromMarketSymbol]?.[exchangePair.from]?.change24h || 0,
          toPriceChange24h:
            coins[toMarketSymbol]?.[exchangePair.to]?.change24h || 0,
          priceGapPercent,
        };
      });

    if (searchTerm) {
      return list.filter((item) => {
        const { symbol } = item;

        if (getKoreanName(symbol)) {
          return getKoreanName(symbol).includes(searchTerm);
        }

        return symbol.includes(searchTerm.toUpperCase());
      });
    }

    return list;
  }, [coins, exchangePair, exchangeRate?.rate, markets, searchTerm]);

  const getSortedMarkets = useMemo(() => {
    return (sortState: SortState) => {
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
  }, [filteredMarkets]);

  const isLoading = !markets || !coins || !exchangeRate;
  if (isLoading) {
    throw new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  return {
    exchangeRate,
    exchangePair,
    setExchangePair,
    searchTerm,
    setSearchTerm,
    getKoreanName,
    getSortedMarkets,
    filteredMarkets,
  };
}
