"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import Select from "@/components/Select";
import { calculatePriceGap } from "@/lib/format";
import PremiumTableSkeleton from "@/components/PremiumTableSkeleton";
import {
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import useMarketStore from "@/store/useMarketStore";
import { EXCHANGE_OPTIONS, BASE_TOKEN_OPTIONS } from "@/const/exchange";
import {
  type ExchangePair,
  type SortState,
  type SortField,
  type Exchange,
  type QuoteToken,
} from "@/types/exchange";
import useMarketsStore from "@/store/useMarketsStore";

export default function PremiumTable() {
  const { coins, exchangeRate } = useMarketStore();
  const { fetchMarkets, getKoreanName } = useMarketsStore();
  const [exchangePair, setExchangePair] = useState<ExchangePair>({
    from: "upbit",
    to: "binance",
    fromBase: "KRW",
    toBase: "USDT",
  });
  const [sort, setSort] = useState<SortState>({
    field: "premium",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");

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
          toPriceChange24h: data[exchangePair.to]?.change24h || 0,
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
  }, [coins, exchangePair, exchangeRate?.rate, searchTerm]);

  const handleSort = (field: SortField) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field
          ? prev.direction === "asc"
            ? "desc"
            : prev.direction === "desc"
            ? null
            : "asc"
          : "asc",
    }));
  };

  const sortedMarkets = useMemo(() => {
    if (!filteredMarkets) return [];

    return [...filteredMarkets].sort((a, b) => {
      if (sort.direction === null) return 0;

      const modifier = sort.direction === "asc" ? 1 : -1;

      switch (sort.field) {
        case "name":
          return modifier * a.symbol.localeCompare(b.symbol);
        case "fromPrice":
          return modifier * (a.fromPrice - b.fromPrice);
        case "toPrice":
          return modifier * (a.toPrice - b.toPrice);
        case "premium":
          return modifier * (a.priceGapPercent - b.priceGapPercent);
        case "volume":
          return modifier * (a.volume - b.volume);
        case "timestamp":
          return modifier * (a.timestamp - b.timestamp);
        default:
          return 0;
      }
    });
  }, [filteredMarkets, sort]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) return <ChevronUpDownIcon className="w-4 h-4" />;
    if (sort.direction === "asc") return <ChevronUpIcon className="w-4 h-4" />;
    if (sort.direction === "desc")
      return <ChevronDownIcon className="w-4 h-4" />;
    return <ChevronUpDownIcon className="w-4 h-4" />;
  };

  const formatPrice = (price: number, quoteToken: string) => {
    let displayPrice = price;
    let suffix = "";

    // 가격 변환 로직
    if (quoteToken === "USDT") {
      displayPrice = price * (exchangeRate?.rate || 0);
    } else if (quoteToken === "BTC") {
      suffix = " BTC";
    }

    const options: Intl.NumberFormatOptions = {
      maximumFractionDigits: quoteToken === "BTC" ? 8 : 0,
      minimumFractionDigits: quoteToken === "BTC" ? 8 : 0,
    };

    return (
      new Intl.NumberFormat("ko-KR", options).format(displayPrice) + suffix
    );
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  if (!coins || !exchangeRate) {
    return <PremiumTableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-950 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-900">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-end">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Select
                label="시작 거래소"
                value={exchangePair.from}
                onChange={(value) => {
                  const newFrom = value as Exchange;
                  setExchangePair((prev) => ({
                    ...prev,
                    from: newFrom,
                    fromBase: BASE_TOKEN_OPTIONS[newFrom][0].value,
                  }));
                }}
                options={EXCHANGE_OPTIONS}
              />
              <Select
                label="마켓"
                value={exchangePair.fromBase}
                onChange={(value) => {
                  setExchangePair((prev) => ({
                    ...prev,
                    fromBase: value as QuoteToken,
                  }));
                }}
                options={BASE_TOKEN_OPTIONS[exchangePair.from]}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                label="비교 거래소"
                value={exchangePair.to}
                onChange={(value) => {
                  const newTo = value as "upbit" | "binance";
                  setExchangePair((prev) => ({
                    ...prev,
                    to: newTo,
                    toBase: BASE_TOKEN_OPTIONS[newTo][0].value,
                  }));
                }}
                options={EXCHANGE_OPTIONS}
              />
              <Select
                label="마켓"
                value={exchangePair.toBase}
                onChange={(value) => {
                  setExchangePair((prev) => ({
                    ...prev,
                    toBase: value as QuoteToken,
                  }));
                }}
                options={BASE_TOKEN_OPTIONS[exchangePair.to]}
              />
            </div>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="코인명 검색 (한글/영문)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {filteredMarkets.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          검색 결과가 없습니다
        </div>
      )}

      <div className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-900">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                <th className="px-4 sm:px-6 py-3 text-left">코인명</th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort("premium")}
                    className="flex items-center justify-end gap-1 whitespace-nowrap w-full"
                  >
                    프리미엄
                    <SortIcon field="premium" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort("fromPrice")}
                    className="flex items-center justify-end gap-1 whitespace-nowrap w-full"
                  >
                    <div className="flex flex-col items-end gap-1">
                      <div>
                        {
                          EXCHANGE_OPTIONS.find(
                            (option) => option.value === exchangePair.from
                          )?.label
                        }{" "}
                        가격
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        전일대비(%)
                      </span>
                    </div>
                    <SortIcon field="fromPrice" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort("toPrice")}
                    className="flex items-center justify-end gap-1 whitespace-nowrap w-full"
                  >
                    <div className="flex flex-col items-end gap-1">
                      <div>
                        {
                          EXCHANGE_OPTIONS.find(
                            (option) => option.value === exchangePair.to
                          )?.label
                        }{" "}
                        가격
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        전일대비(%)
                      </span>
                    </div>
                    <SortIcon field="toPrice" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort("volume")}
                    className="flex items-center justify-end gap-1 whitespace-nowrap w-full"
                  >
                    거래량
                    <SortIcon field="volume" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort("timestamp")}
                    className="flex items-center justify-end gap-1 whitespace-nowrap w-full"
                  >
                    최근 업데이트
                    <SortIcon field="timestamp" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-900">
              {sortedMarkets.map((market) => (
                <tr
                  key={market.symbol}
                  className="text-xs sm:text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Image
                        src={`https://static.upbit.com/logos/${
                          market.symbol.split("-")[0]
                        }.png`}
                        alt={market.symbol.split("-")[0]}
                        width={20}
                        height={20}
                        className="mr-2 sm:w-6 sm:h-6"
                      />
                      <div className="text-gray-900 dark:text-white font-medium">
                        <div>{getKoreanName(market.symbol)}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          {market.symbol.split("-")[0]}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                    <span
                      className={clsx(
                        "font-medium",
                        market.priceGapPercent === 0
                          ? "text-gray-400 dark:text-gray-500"
                          : market.priceGapPercent > 0
                          ? "text-green-500 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      )}
                    >
                      {formatPercent(market.priceGapPercent)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right font-medium whitespace-nowrap text-gray-800 dark:text-gray-200">
                    {(exchangePair.fromBase === "KRW" ||
                      exchangePair.fromBase === "USDT") &&
                      "₩"}
                    {formatPrice(market.fromPrice, exchangePair.fromBase)}
                    {
                      <div
                        className={clsx(
                          "text-xs",
                          market.fromPriceChange24h > 0
                            ? "text-green-500 dark:text-green-400"
                            : market.fromPriceChange24h < 0
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {market.fromPriceChange24h.toFixed(2)}%
                      </div>
                    }
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right font-medium whitespace-nowrap text-gray-800 dark:text-gray-200">
                    {(exchangePair.toBase === "KRW" ||
                      exchangePair.toBase === "USDT") &&
                      "₩"}
                    {formatPrice(market.toPrice, exchangePair.toBase)}
                    {
                      <div
                        className={clsx(
                          "text-xs",
                          market.toPriceChange24h > 0
                            ? "text-green-500 dark:text-green-400"
                            : market.toPriceChange24h < 0
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {market.toPriceChange24h.toFixed(2)}%
                      </div>
                    }
                  </td>

                  <td className="px-4 sm:px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                    {formatPrice(market.volume, exchangePair.toBase)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                    {new Date(market.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
