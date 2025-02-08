"use client";

import useMarketStore from "@/store/useMarketStore";
import Image from "next/image";
import clsx from "clsx";
import { useState, useMemo } from "react";
import Select from "@/components/Select";

type ExchangePair = {
  from: "upbit" | "binance";
  fromBase: string;
  to: "upbit" | "binance";
  toBase: string;
};

const EXCHANGE_OPTIONS = [
  { value: "upbit", label: "업비트" },
  { value: "binance", label: "바이낸스" },
];

const BASE_TOKEN_OPTIONS = {
  upbit: [
    { value: "KRW", label: "KRW" },
    { value: "BTC", label: "BTC" },
    { value: "USDT", label: "USDT" },
  ],
  binance: [{ value: "USDT", label: "USDT" }],
};

export default function PremiumPage() {
  const { upbit, binance, exchangeRate } = useMarketStore();
  const [exchangePair, setExchangePair] = useState<ExchangePair>({
    from: "upbit",
    fromBase: "KRW",
    to: "binance",
    toBase: "USDT",
  });

  const marketData = useMemo(() => {
    const fromMarket = exchangePair.from === "upbit" ? upbit : binance;
    const toMarket = exchangePair.to === "upbit" ? upbit : binance;

    const fromBaseMarket = fromMarket[exchangePair.fromBase];
    const toBaseMarket = toMarket[exchangePair.toBase];

    if (!fromBaseMarket || !toBaseMarket || !exchangeRate) return [];

    // 두 거래소에 모두 있는 코인만 필터링
    const commonCoins = Object.keys(fromBaseMarket).filter(
      (coin) => toBaseMarket[coin] !== undefined
    );
    return commonCoins
      .map((symbol) => {
        const fromData = fromBaseMarket[symbol];
        const toData = toBaseMarket[symbol];

        // 환율 적용 (KRW <-> USDT 변환이 필요한 경우)
        const fromPrice = fromData.price;
        const toPrice =
          exchangePair.toBase === "USDT" && exchangePair.fromBase === "KRW"
            ? toData.price * exchangeRate.rate
            : exchangePair.toBase === "KRW" && exchangePair.fromBase === "USDT"
            ? toData.price / exchangeRate.rate
            : toData.price;

        const premium = ((fromPrice - toPrice) / toPrice) * 100;

        return {
          symbol,
          fromPrice,
          fromVolume: fromData.volume,
          toPrice,
          toVolume: toData.volume,
          premium,
          timestamp: Math.max(fromData.timestamp, toData.timestamp),
        };
      })
      .sort((a, b) => Math.abs(b.premium) - Math.abs(a.premium));
  }, [upbit, binance, exchangePair, exchangeRate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-4 mb-6">
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

      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead>
            <tr className="text-gray-500 dark:text-gray-400 text-sm">
              <th className="px-6 py-3 text-left">이름</th>
              <th className="px-6 py-3 text-right">{exchangePair.from} 가격</th>
              <th className="px-6 py-3 text-right">{exchangePair.to} 가격</th>
              <th className="px-6 py-3 text-right">프리미엄</th>
              <th className="px-6 py-3 text-right">거래량</th>
              <th className="px-6 py-3 text-right">최근 업데이트</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {marketData.map((market) => (
              <tr key={market.symbol} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Image
                      src={`https://static.upbit.com/logos/${market.symbol}.png`}
                      alt={market.symbol}
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {market.symbol}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                  {exchangePair.fromBase === "KRW" ? "₩" : ""}
                  {formatPrice(market.fromPrice)}
                </td>
                <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                  {exchangePair.toBase === "KRW" ? "₩" : ""}
                  {formatPrice(market.toPrice)}
                </td>
                <td
                  className={clsx(
                    "px-6 py-4 text-right font-medium",
                    market.premium > 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
                  )}
                >
                  {formatPercent(market.premium)}
                </td>
                <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                  {formatPrice(market.fromVolume)}
                </td>
                <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                  {new Date(market.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
