"use client";

import Link from "next/link";
import clsx from "clsx";
import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import {
  formatPriceByMarket,
  getMarketType,
  getPriorityExchanges,
} from "@/lib/market";
import { formatPercent } from "@/lib/format";
import { usePredict } from "@/hooks/usePredict";
import { CoinData } from "@/store/useMarketStore";

interface PricePredictionProps {
  symbol: string;
  coins: Record<string, CoinData>;
}

export default function PricePrediction({
  symbol,
  coins,
}: PricePredictionProps) {
  const marketType = getMarketType(symbol);
  const priorityExchanges = getPriorityExchanges(marketType);

  // Get current price from priority exchanges
  const getCurrentPrice = (): { price: number; exchange: string } => {
    if (!coins || !symbol) {
      return { price: 0, exchange: priorityExchanges[0] };
    }

    for (const exchange of priorityExchanges) {
      const coinData = coins[symbol];
      if (!coinData) {
        return { price: 0, exchange: priorityExchanges[0] };
      }

      const exchangeData = coinData[exchange as keyof typeof coinData];
      if (exchangeData?.price) {
        return { price: exchangeData.price, exchange };
      }
    }
    return { price: 0, exchange: priorityExchanges[0] };
  };

  const { price: currentPrice, exchange: currentExchange } = getCurrentPrice();

  const [selectedDuration, setSelectedDuration] = useState<30 | 180>(30);
  const {
    activePredict,
    isLoading,
    error,
    canPredict,
    startPredict,
    remainingTime,
    stats,
    fetchStats,
  } = usePredict();

  // Fetch stats when component mounts
  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated) {
      fetchStats();
    }
  }, [fetchStats]);

  // Calculate win rate
  const winRate = stats
    ? (stats.wins / (stats.wins + stats.losses + stats.draws)) * 100
    : 0;

  // Calculate price change percentage
  const getPriceChangePercent = (currentPrice: number, entryPrice: number) => {
    if (!entryPrice) return 0;
    return ((currentPrice - entryPrice) / entryPrice) * 100;
  };

  const handlePredict = async (position: "L" | "S", duration: 30 | 180) => {
    try {
      await startPredict(symbol, currentExchange, position, duration);
    } catch (error) {
      console.error("Failed to start prediction:", error);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
      {/* Login Overlay */}
      {!useAuthStore.getState().isAuthenticated && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <Link
            href="/signin"
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
          >
            로그인하고 가격 예측하기
          </Link>
        </div>
      )}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          가격 예측
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          가격이 오를지 내릴지 예측하고 승률을 높여보세요
        </p>
      </div>
      <div className="p-4">
        {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

        {/* Stats Display */}
        {stats && (
          <div className="mb-4 flex items-center justify-between text-sm">
            <div className="flex gap-2">
              <span className="text-green-500">{stats.wins}승</span>
              <span className="text-red-500">{stats.losses}패</span>
              <span className="text-gray-500">{stats.draws}무</span>
            </div>
            <div className="text-gray-500">
              승률: {isNaN(winRate) ? 0 : winRate.toFixed(1)}%
            </div>
          </div>
        )}

        {/* Duration Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex gap-4" aria-label="Tabs">
            <button
              onClick={() => setSelectedDuration(30)}
              className={clsx(
                "px-1 py-2 text-sm font-medium border-b-2 transition-colors",
                selectedDuration === 30
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              30초 예측
            </button>
            <button
              onClick={() => setSelectedDuration(180)}
              className={clsx(
                "px-1 py-2 text-sm font-medium border-b-2 transition-colors",
                selectedDuration === 180
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              3분 예측
            </button>
          </nav>
        </div>

        {/* Current Price Display */}
        <div className="my-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            현재 가격 ({currentExchange.toUpperCase()})
          </div>
          <div className="text-2xl font-bold">
            {formatPriceByMarket(currentPrice, marketType)}
          </div>
          {activePredict && (
            <div className="space-y-2 mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                진입 가격:{" "}
                {formatPriceByMarket(activePredict.price, marketType)}
              </div>
              <div
                className={clsx(
                  "text-sm font-semibold",
                  currentPrice > activePredict.price
                    ? "text-green-500"
                    : "text-red-500"
                )}
              >
                {formatPercent(
                  getPriceChangePercent(currentPrice, activePredict.price),
                  5
                )}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {activePredict.position === "L" ? "롱 포지션" : "숏 포지션"}
                </div>
                <div className="text-sm font-medium">
                  {Math.ceil(remainingTime / 1000)}초 남음
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Position Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handlePredict("L", selectedDuration)}
            disabled={!canPredict || isLoading}
            className={clsx(
              "px-4 py-3 rounded-lg font-semibold text-white transition-colors",
              "bg-green-500",
              canPredict
                ? "hover:bg-green-600"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            롱 (Long)
          </button>
          <button
            onClick={() => handlePredict("S", selectedDuration)}
            disabled={!canPredict || isLoading}
            className={clsx(
              "px-4 py-3 rounded-lg font-semibold text-white transition-colors",
              "bg-red-500",
              canPredict ? "hover:bg-red-600" : "opacity-50 cursor-not-allowed"
            )}
          >
            숏 (Short)
          </button>
        </div>
      </div>
    </div>
  );
}
