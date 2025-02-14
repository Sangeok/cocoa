"use client";

import Image from "next/image";
import { formatKRWWithUnit, formatPercent } from "@/lib/format";
import { CoinData } from "@/store/useMarketStore";

interface MarketDataProps {
  symbol: string;
  coins: Record<string, CoinData>;
}

const ExchangeVolume = ({
  symbol,
  coins,
  exchange,
}: {
  symbol: string;
  coins: Record<string, CoinData>;
  exchange: "upbit" | "bithumb" | "binance" | "coinone";
}) => {
  if (!coins[symbol]?.[exchange]) return null;

  return (
    <div className="flex items-center gap-2">
      <Image
        src={`/exchanges/${exchange}.svg`}
        alt={exchange}
        width={16}
        height={16}
        className="opacity-75"
      />
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {exchange}
        </div>
        <div className="text-sm font-semibold">
          {exchange === "binance"
            ? coins[symbol]?.[exchange]?.volume
            : formatKRWWithUnit(coins[symbol]?.[exchange]?.volume || 0)}
        </div>
      </div>
    </div>
  );
};

const ExchangePrice = ({
  symbol,
  coins,
  exchange,
}: {
  symbol: string;
  coins: Record<string, CoinData>;
  exchange: "upbit" | "bithumb" | "binance" | "coinone";
}) => {
  if (!coins[symbol]?.[exchange]) return null;

  return (
    <div className="flex items-center gap-2">
      <Image
        src={`/exchanges/${exchange}.svg`}
        alt={exchange}
        width={16}
        height={16}
        className="opacity-75"
      />
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {exchange}
        </div>
        <div className="text-sm font-semibold">
          {formatKRWWithUnit(coins[symbol]?.[exchange]?.price || 0)}
        </div>
      </div>
    </div>
  );
};

const ExchangeChange24h = ({
  symbol,
  coins,
  exchange,
}: {
  symbol: string;
  coins: Record<string, CoinData>;
  exchange: "upbit" | "bithumb" | "binance" | "coinone";
}) => {
  if (!coins[symbol]?.[exchange]) return null;

  return (
    <div className="flex items-center gap-2">
      <Image
        src={`/exchanges/${exchange}.svg`}
        alt={exchange}
        width={16}
        height={16}
        className="opacity-75"
      />
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {exchange}
        </div>
        <div
          className={`text-sm font-semibold ${
            coins[symbol]?.[exchange]?.change24h >= 0
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {formatPercent(coins[symbol]?.[exchange]?.change24h || 0)}
        </div>
      </div>
    </div>
  );
};

export default function MarketData({ symbol, coins }: MarketDataProps) {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          실시간 시장 데이터
        </h2>
      </div>
      <div className="p-4 space-y-4">
        {/* 거래량 */}
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            거래량
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ExchangeVolume symbol={symbol} coins={coins} exchange="upbit" />
            <ExchangeVolume symbol={symbol} coins={coins} exchange="bithumb" />
            <ExchangeVolume symbol={symbol} coins={coins} exchange="binance" />
          </div>
        </div>

        {/* 현재가 */}
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            현재가
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ExchangePrice symbol={symbol} coins={coins} exchange="upbit" />
            <ExchangePrice symbol={symbol} coins={coins} exchange="bithumb" />
            <ExchangePrice symbol={symbol} coins={coins} exchange="binance" />
            <ExchangePrice symbol={symbol} coins={coins} exchange="coinone" />
          </div>
        </div>

        {/* 24시간 변동 */}
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            전일 대비 가격(%)
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ExchangeChange24h symbol={symbol} coins={coins} exchange="upbit" />
            <ExchangeChange24h
              symbol={symbol}
              coins={coins}
              exchange="bithumb"
            />
            <ExchangeChange24h
              symbol={symbol}
              coins={coins}
              exchange="binance"
            />
            <ExchangeChange24h
              symbol={symbol}
              coins={coins}
              exchange="coinone"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
