"use client";

import useMarketStore from "@/store/useMarketStore";
import Image from "next/image";
import clsx from "clsx";
import { useState, useMemo } from "react";
import Select from "@/components/Select";
import { calculatePriceGap, ExchangePair } from "@/lib/format";
import PremiumTableSkeleton from "@/components/PremiumTableSkeleton";
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const EXCHANGE_OPTIONS = [
  { value: "upbit", label: "업비트" },
  { value: "bithumb", label: "빗썸" },
  { value: "binance", label: "바이낸스" },
];

const BASE_TOKEN_OPTIONS = {
  upbit: [
    { value: "KRW", label: "KRW" },
    { value: "BTC", label: "BTC" },
    { value: "USDT", label: "USDT" },
  ],
  bithumb: [
    { value: "KRW", label: "KRW" },
    { value: "BTC", label: "BTC" },
  ],
  binance: [{ value: "USDT", label: "USDT" }],
};

type SortField = 'name' | 'fromPrice' | 'toPrice' | 'premium' | 'volume' | 'timestamp';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField;
  direction: SortDirection;
}

export default function PremiumPage() {
  const { coins, exchangeRate } = useMarketStore();
  const [exchangePair, setExchangePair] = useState<ExchangePair>({
    from: "upbit",
    to: "binance",
    fromBase: "KRW",
    toBase: "USDT",
  });
  const [sort, setSort] = useState<SortState>({
    field: 'premium',
    direction: 'desc'
  });

  // 선택된 기준 화폐에 따라 마켓 데이터 필터링
  const filteredMarkets = useMemo(() => {
    if (!coins || !exchangeRate) return [];

    return Object.entries(coins)
      .filter(([marketSymbol, data]) => {
        const marketData = data[exchangePair.from];
        if (!marketData) return false;

        // 'BTC-KRW'와 같은 마켓 심볼에서 기준 화폐 확인
        const [coin, quoteToken] = marketSymbol.split("-");
        return quoteToken === exchangePair.fromBase;
      })
      .map(([marketSymbol, data]) => {
        const marketData = data[exchangePair.from];
        if (!marketData) return null;

        return {
          symbol: marketSymbol,
          exchange: exchangePair.from,
          price: marketData.price,
          volume: marketData.volume,
          timestamp: marketData.timestamp,
          priceGapPercent: calculatePriceGap(
            coins,
            {
              exchange: exchangePair.from,
              symbol: marketSymbol,
              price: marketData.price,
              volume: marketData.volume,
              timestamp: marketData.timestamp,
            },
            exchangePair,
            {
              USDT: { KRW: exchangeRate?.rate || 0 },
              BTC: {
                KRW: coins["BTC-KRW"]?.upbit?.price || 0,
                USDT: coins["BTC-USDT"]?.binance?.price || 0,
              },
            }
          ),
        };
      })
      .filter(
        (market): market is NonNullable<typeof market> => market !== null
      );
  }, [coins, exchangePair, exchangeRate?.rate]);

  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      direction: 
        prev.field === field
          ? prev.direction === 'asc'
            ? 'desc'
            : prev.direction === 'desc'
              ? null
              : 'asc'
          : 'asc'
    }));
  };

  const sortedMarkets = useMemo(() => {
    if (!filteredMarkets) return [];
    
    return [...filteredMarkets].sort((a, b) => {
      if (sort.direction === null) return 0;
      
      const modifier = sort.direction === 'asc' ? 1 : -1;
      
      switch (sort.field) {
        case 'name':
          return modifier * a.symbol.localeCompare(b.symbol);
        case 'fromPrice':
          return modifier * (a.price - b.price);
        case 'toPrice':
          return modifier * (a.price - b.price);
        case 'premium':
          return modifier * (a.priceGapPercent - b.priceGapPercent);
        case 'volume':
          return modifier * (a.volume - b.volume);
        case 'timestamp':
          return modifier * (a.timestamp - b.timestamp);
        default:
          return 0;
      }
    });
  }, [filteredMarkets, sort]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) return <ChevronUpDownIcon className="w-4 h-4" />;
    if (sort.direction === 'asc') return <ChevronUpIcon className="w-4 h-4" />;
    if (sort.direction === 'desc') return <ChevronDownIcon className="w-4 h-4" />;
    return <ChevronUpDownIcon className="w-4 h-4" />;
  };

  const formatPrice = (price: number, quoteToken: string) => {
    const options: Intl.NumberFormatOptions = {
      maximumFractionDigits: quoteToken === 'BTC' ? 8 : 0,
      minimumFractionDigits: quoteToken === 'BTC' ? 8 : 0,
    };
    return new Intl.NumberFormat("ko-KR", options).format(price);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  if (!coins || !exchangeRate) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white dark:bg-gray-950 rounded-lg p-6 border border-gray-200 dark:border-gray-900">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Select
                label="시작 거래소"
                value={exchangePair.from}
                onChange={(value) => {
                  const newFrom = value as "upbit" | "binance";
                  setExchangePair((prev) => ({
                    ...prev,
                    from: newFrom,
                    fromBase: BASE_TOKEN_OPTIONS[newFrom][0].value,
                  }));
                }}
                options={EXCHANGE_OPTIONS}
              />
              <Select
                label="기준 화폐"
                value={exchangePair.fromBase}
                onChange={(value) => {
                  setExchangePair((prev) => ({
                    ...prev,
                    fromBase: value,
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
                label="기준 화폐"
                value={exchangePair.toBase}
                onChange={(value) => {
                  setExchangePair((prev) => ({
                    ...prev,
                    toBase: value,
                  }));
                }}
                options={BASE_TOKEN_OPTIONS[exchangePair.to]}
              />
            </div>
          </div>
        </div>
        <PremiumTableSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white dark:bg-gray-950 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-900">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Select
              label="시작 거래소"
              value={exchangePair.from}
              onChange={(value) => {
                const newFrom = value as "upbit" | "binance";
                setExchangePair((prev) => ({
                  ...prev,
                  from: newFrom,
                  fromBase: BASE_TOKEN_OPTIONS[newFrom][0].value,
                }));
              }}
              options={EXCHANGE_OPTIONS}
            />
            <Select
              label="기준 화폐"
              value={exchangePair.fromBase}
              onChange={(value) => {
                setExchangePair((prev) => ({
                  ...prev,
                  fromBase: value,
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
              label="기준 화폐"
              value={exchangePair.toBase}
              onChange={(value) => {
                setExchangePair((prev) => ({
                  ...prev,
                  toBase: value,
                }));
              }}
              options={BASE_TOKEN_OPTIONS[exchangePair.to]}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-900">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                <th className="px-4 sm:px-6 py-3 text-left">이름</th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    {exchangePair.from} 가격
                    <SortIcon field="fromPrice" />
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    {exchangePair.to} 가격
                    <SortIcon field="toPrice" />
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    프리미엄
                    <SortIcon field="premium" />
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    거래량
                    <SortIcon field="volume" />
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    최근 업데이트
                    <SortIcon field="timestamp" />
                  </div>
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
                      <span className="text-gray-900 dark:text-white font-medium">
                        {market.symbol.split("-")[0]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap text-gray-900 dark:text-white">
                    {exchangePair.fromBase === "KRW" ? "₩" : ""}
                    {formatPrice(market.price, exchangePair.fromBase)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap text-gray-900 dark:text-white">
                    {exchangePair.fromBase === "KRW" ? "₩" : ""}
                    {formatPrice(market.price, exchangePair.toBase)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                    <span className={clsx(
                      'font-medium',
                      market.priceGapPercent === 0 
                        ? 'text-gray-400 dark:text-gray-500'
                        : market.priceGapPercent > 0
                          ? 'text-green-500 dark:text-green-400'
                          : 'text-red-500 dark:text-red-400'
                    )}>
                      {formatPercent(market.priceGapPercent)}
                    </span>
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
