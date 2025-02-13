"use client";

import Image from "next/image";
import { formatKRWWithUnit, formatPercent } from "@/lib/format";
import { CoinData } from "@/types/market";

interface MarketDataProps {
  symbol: string;
  coins: Record<string, CoinData>;
}

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
            {coins?.[symbol]?.upbit?.volume && (
              <div className="flex items-center gap-2">
                <Image
                  src="/exchanges/upbit.svg"
                  alt="Upbit"
                  width={16}
                  height={16}
                  className="opacity-75"
                />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Upbit
                  </div>
                  <div className="text-sm font-semibold">
                    {formatKRWWithUnit(coins[symbol].upbit.volume)}
                  </div>
                </div>
              </div>
            )}
            {/* ... 다른 거래소들의 거래량 데이터 ... */}
          </div>
        </div>

        {/* 현재가 */}
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            현재가
          </div>
          <div className="grid grid-cols-3 gap-4">
            {coins?.[symbol]?.upbit?.price && (
              <div className="flex items-center gap-2">
                <Image
                  src="/exchanges/upbit.svg"
                  alt="Upbit"
                  width={16}
                  height={16}
                  className="opacity-75"
                />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Upbit
                  </div>
                  <div className="text-sm font-semibold">
                    {formatKRWWithUnit(coins[symbol].upbit.price)}
                  </div>
                </div>
              </div>
            )}
            {/* ... 다른 거래소들의 현재가 데이터 ... */}
          </div>
        </div>

        {/* 24시간 변동 */}
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            전일 대비 가격(%)
          </div>
          <div className="grid grid-cols-3 gap-4">
            {coins?.[symbol]?.upbit?.change24h !== undefined && (
              <div className="flex items-center gap-2">
                <Image
                  src="/exchanges/upbit.svg"
                  alt="Upbit"
                  width={16}
                  height={16}
                  className="opacity-75"
                />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Upbit
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      coins[symbol].upbit.change24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {formatPercent(coins[symbol].upbit.change24h)}
                  </div>
                </div>
              </div>
            )}
            {/* ... 다른 거래소들의 변동률 데이터 ... */}
          </div>
        </div>
      </div>
    </div>
  );
} 