"use client";

import Link from "next/link";
import clsx from "clsx";
import { useState, useEffect, useMemo } from "react";
import useAuthStore from "@/store/useAuthStore";
import {
  formatPriceByMarket,
  getMarketType,
  getPriorityExchanges,
} from "@/lib/market";
import { formatPercent } from "@/lib/format";
import { usePredict } from "@/hooks/usePredict";
import { CoinData } from "@/store/useMarketStore";
import useMarketStore from "@/store/useMarketStore";
import Input from "@/components/common/Input";
import toast from "react-hot-toast";
import { PredictResultToast } from "@/components/toast/PredictResultToast";
import { PredictResult } from "@/types/predict";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { ClientAPICall } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";
import useLongShortStore from "@/store/useLongShort";

interface PricePredictionProps {
  symbol: string;
  coins: Record<string, CoinData>;
}

const MarketLongShortRatio = ({ symbol }: { symbol: string }) => {
  const { marketRatios, initializeSocket } = useLongShortStore();
  const ratio = marketRatios[symbol];

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  if (!ratio) return null;

  return (
    <div className="space-y-2 mt-4">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        실시간 포지션 ({ratio.total})
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">
          <span className="text-green-500">
            롱 {ratio.longPercent.toFixed(1)}%
          </span>
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-red-500">
            숏 {ratio.shortPercent.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-green-500"
          style={{
            width: `${ratio.longPercent}%`,
            transition: "width 0.3s ease-in-out",
          }}
        />
        <div
          className="h-full bg-red-500"
          style={{
            width: `${ratio.shortPercent}%`,
            transition: "width 0.3s ease-in-out",
          }}
        />
      </div>
    </div>
  );
};

export default function PricePrediction({
  symbol,
  coins,
}: PricePredictionProps) {
  const marketType = getMarketType(symbol);
  const priorityExchanges = getPriorityExchanges(marketType);
  const { user, updateVault } = useAuthStore();
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

  const [selectedDuration, setSelectedDuration] = useState<15 | 30 | 60 | 180>(
    30
  );
  const {
    activePredict,
    isLoading,
    error,
    canPredict,
    startPredict,
    stats,
    fetchStats,
    lastResult,
  } = usePredict();
  const exchangeRate = useMarketStore((state) => state.exchangeRate?.rate);

  const [remainingTimeDisplay, setRemainingTimeDisplay] = useState(0);
  const [depositRatio, setDepositRatio] = useState<number>(10);
  const [deposit, setDeposit] = useState<string>(
    (Number(user?.predict?.vault) / 10).toFixed(0)
  );
  const [leverage, setLeverage] = useState<number>(20);
  const leverageOptions = [10, 20, 50, 100];

  // 0.1초 단위로 남은 시간 업데이트
  useEffect(() => {
    if (!activePredict) return;

    const interval = setInterval(() => {
      const remaining = activePredict.finishedAt - Date.now();
      setRemainingTimeDisplay(remaining > 0 ? remaining : 0);
    }, 100); // 0.1초마다 업데이트

    return () => clearInterval(interval);
  }, [activePredict]);

  // 결과 표시를 위한 상태
  const [resultDisplay, setResultDisplay] = useState<{
    show: boolean;
    result: PredictResult | null;
  }>();

  // 자산 새로고침 함수 추가
  const refreshVault = async () => {
    try {
      const response = await ClientAPICall.get(API_ROUTES.USER.PROFILE.url);
      if (response.data.success) {
        updateVault(response.data.data.predict.vault);
      }
    } catch (error) {
      console.error("Failed to refresh vault:", error);
    }
  };

  // 결과 수신 시 자산 업데이트 로직 개선
  useEffect(() => {
    if (lastResult) {
      // 결과 표시 설정
      setResultDisplay({ show: true, result: lastResult });

      // 자산 업데이트 (결과 수신 직후 서버에서 최신 데이터 가져오기)
      refreshVault();

      const timer = setTimeout(() => {
        setResultDisplay({ show: false, result: null });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [lastResult]);

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

  // Calculate price change percentage with leverage
  const getPriceChangePercent = (
    currentPrice: number,
    entryPrice: number,
    leverage: number = 1
  ) => {
    if (!entryPrice) return 0;
    return ((currentPrice - entryPrice) / entryPrice) * 100 * leverage;
  };

  // Calculate virtual profit/loss
  const getVirtualPnL = (
    currentPrice: number,
    entryPrice: number,
    position: "L" | "S",
    deposit: number,
    leverage: number
  ) => {
    if (!entryPrice) return 0;
    const priceChangePercent = (currentPrice - entryPrice) / entryPrice;
    const leveragedReturn = priceChangePercent * leverage;
    const pnl = position === "L" ? leveragedReturn : -leveragedReturn;
    if (marketType === "USDT") {
      return deposit * pnl;
    } else {
      return deposit * pnl * (exchangeRate || 0);
    }
  };

  const handlePredict = async (
    position: "L" | "S",
    duration: 15 | 30 | 60 | 180
  ) => {
    const depositAmount = Number(deposit);

    try {
      if (!depositAmount || depositAmount <= 0) {
        toast.error("투자 금액을 입력해주세요");
        return;
      }

      if (depositAmount > (user?.predict?.vault || 0)) {
        toast.error("보유 자산이 부족합니다");
        return;
      }

      // 예측 시작 전에 vault 즉시 차감
      const newVault = Number(user?.predict?.vault || 0) - depositAmount;
      updateVault(newVault);

      await startPredict(
        symbol,
        currentExchange,
        position,
        duration,
        depositAmount,
        leverage
      );
    } catch (error) {
      // 에러 발생 시 vault 원상복구
      if (user?.predict?.vault) {
        updateVault(Number(user.predict.vault) + depositAmount);
      }
      console.error("Failed to start prediction:", error);
    }
  };

  const getVirtualPnLDisplayAmount = useMemo(() => {
    return getVirtualPnL(
      currentPrice,
      activePredict?.price || lastResult?.entryPrice || 0,
      activePredict?.position || lastResult?.position || "L",
      Number(deposit),
      activePredict?.leverage || lastResult?.leverage || 20
    );
  }, [currentPrice, activePredict, lastResult]);

  const getPriceChangePercentDisplay = useMemo(() => {
    return getPriceChangePercent(
      currentPrice,
      activePredict?.price || lastResult?.entryPrice || 0,
      activePredict?.leverage || lastResult?.leverage || 20
    );
  }, [currentPrice, activePredict, lastResult]);

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
          <br />
          (가격 예측에는 수수료가 발생하지 않습니다!)
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
              <span className="text-gray-500">
                {stats.draws}무(승률: {isNaN(winRate) ? 0 : winRate.toFixed(1)}
                %)
              </span>
            </div>
          </div>
        )}

        {/* Trading Options */}
        <div className="mb-4 space-y-4">
          <Input
            label="투자 금액($)"
            type="number"
            value={deposit}
            onChange={setDeposit}
            placeholder="금액을 입력하세요($)"
            min={0}
            max={
              user
                ? Number(user?.predict?.vault) + (activePredict?.deposit || 0)
                : 0
            }
          />
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              투자 비율
            </label>
            <div className="mt-2 flex gap-3">
              {[10, 20, 50, 100].map((option) => (
                <label
                  key={option}
                  className={clsx(
                    "flex-1 py-2 px-3 rounded-lg border text-center cursor-pointer transition-colors",
                    option === depositRatio
                      ? "  border-green-500"
                      : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                  )}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={option}
                    checked={depositRatio === option}
                    onChange={(e) => {
                      setDeposit(
                        Math.floor(
                          Number(user?.predict?.vault) * (option / 100)
                        ).toFixed(0)
                      );
                      setDepositRatio(option);
                    }}
                  />
                  {option}%
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              레버리지
            </label>
            <div className="mt-2 flex gap-3">
              {leverageOptions.map((option) => (
                <label
                  key={option}
                  className={clsx(
                    "flex-1 py-2 px-3 rounded-lg border text-center cursor-pointer transition-colors",
                    leverage === option
                      ? "  border-green-500"
                      : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                  )}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={option}
                    checked={leverage === option}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                  />
                  {option}x
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Duration Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex gap-4" aria-label="Tabs">
            {[15, 30, 60, 180].map((duration) => (
              <button
                key={duration}
                onClick={() =>
                  setSelectedDuration(duration as 15 | 30 | 60 | 180)
                }
                className={clsx(
                  "px-1 py-2 text-sm font-medium border-b-2 transition-colors",
                  selectedDuration === duration
                    ? "border-green-500 text-green-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {duration}초 예측
              </button>
            ))}
          </nav>
        </div>

        {/* Current Price and Active Predict Display */}
        <div className="my-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            현재 가격 ({currentExchange.toUpperCase()})
          </div>
          <div className="text-2xl font-bold">
            {formatPriceByMarket(currentPrice, marketType)}
          </div>
          {(activePredict || (resultDisplay?.show && resultDisplay.result)) && (
            <div className="space-y-2 mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                <div>
                  진입 가격:{" "}
                  {formatPriceByMarket(
                    activePredict?.price ||
                      resultDisplay?.result?.entryPrice ||
                      0,
                    marketType
                  )}
                </div>
                <div
                  className={clsx(
                    "text-sm font-medium",
                    activePredict?.position === "L"
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {activePredict?.position === "L"
                    ? "롱 포지션"
                    : activePredict?.position === "S"
                    ? "숏 포지션"
                    : ""}
                </div>
              </div>
              {activePredict ? (
                <>
                  <div
                    className={clsx(
                      "text-lg font-bold",
                      getPriceChangePercentDisplay === 0
                        ? "text-gray-500"
                        : getPriceChangePercentDisplay > 0
                        ? activePredict?.position === "L"
                          ? "text-green-500"
                          : "text-red-500"
                        : activePredict?.position === "L"
                        ? "text-red-500"
                        : "text-green-500"
                    )}
                  >
                    {formatPriceByMarket(
                      getVirtualPnLDisplayAmount,
                      marketType
                    )}
                    (
                    {formatPercent(
                      activePredict?.position === "L"
                        ? getPriceChangePercentDisplay
                        : -getPriceChangePercentDisplay,
                      2
                    )}
                    )
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">
                      {(remainingTimeDisplay / 1000).toFixed(1)}초 남음
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={clsx(
                      "text-base font-bold flex justify-between items-center",
                      resultDisplay?.result?.isLiquidated
                        ? "text-yellow-500"
                        : resultDisplay?.result?.isWin
                        ? "text-green-500"
                        : resultDisplay?.result?.isDraw
                        ? "text-gray-500"
                        : "text-red-500"
                    )}
                  >
                    <span>
                      {resultDisplay?.result?.isLiquidated
                        ? "포지션 청산"
                        : resultDisplay?.result?.isWin
                        ? "예측 성공"
                        : resultDisplay?.result?.isDraw
                        ? "예측 무승부"
                        : "예측 실패"}
                    </span>
                    {!resultDisplay?.result?.isDraw && (
                      <span className="text-xl">
                        {resultDisplay?.result?.isWin ? "+" : ""}
                        {formatPriceByMarket(
                          (resultDisplay?.result
                            ? resultDisplay.result.vault -
                              resultDisplay.result.deposit
                            : 0) * (exchangeRate || 0),
                          "KRW"
                        )}
                      </span>
                    )}
                  </div>
                </>
              )}
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
              canPredict ? "bg-green-500 hover:bg-green-600" : "bg-green-500/50"
            )}
          >
            롱 (Long)
          </button>
          <button
            onClick={() => handlePredict("S", selectedDuration)}
            disabled={!canPredict || isLoading}
            className={clsx(
              "px-4 py-3 rounded-lg font-semibold text-white transition-colors",
              canPredict ? "bg-red-500 hover:bg-red-600" : "bg-red-500/50"
            )}
          >
            숏 (Short)
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={refreshVault}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="자산 새로고침"
            >
              <ArrowPathIcon className="w-4 h-4 text-gray-500" />
            </button>
            <span className="text-gray-500">
              현재 자산:{" "}
              {formatPriceByMarket(Number(user?.predict?.vault), "USDT")}
              {exchangeRate &&
                `(${formatPriceByMarket(
                  Number(user?.predict?.vault) * (exchangeRate || 0),
                  "KRW"
                )})`}
            </span>
          </div>
        </div>

        {/* Move MarketLongShortRatio here */}
        <MarketLongShortRatio symbol={symbol} />
      </div>
    </div>
  );
}
