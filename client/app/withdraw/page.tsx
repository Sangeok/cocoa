"use client";

import { useState, useEffect } from "react";
import Select from "@/components/Select";
import {
  Exchange,
  WithdrawPathResult,
  formatKRW,
  formatCrypto,
} from "@/dto/withdraw.dto";
import { API_ROUTES } from "@/const/api";
import { serverClient } from "@/lib/axios";
import { KOREA_EXCHANGES, GLOBAL_EXCHANGES } from "@/const/exchange";

export default function WithdrawPage() {
  const [fromExchange, setFromExchange] = useState<string>("");
  const [toExchange, setToExchange] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [coin, setCoin] = useState<string>("");
  const [pathResult, setPathResult] = useState<WithdrawPathResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Determine available exchanges based on selection
  const isFromGlobal = GLOBAL_EXCHANGES.some((ex) => ex.value === fromExchange);
  const isToGlobal = GLOBAL_EXCHANGES.some((ex) => ex.value === toExchange);

  const fromOptions = [...KOREA_EXCHANGES, ...GLOBAL_EXCHANGES];
  const toOptions = isFromGlobal
    ? KOREA_EXCHANGES
    : fromExchange
    ? GLOBAL_EXCHANGES
    : [...KOREA_EXCHANGES, ...GLOBAL_EXCHANGES];

  // Reset toExchange if it becomes invalid
  useEffect(() => {
    if (
      (isFromGlobal && isToGlobal) ||
      (!isFromGlobal && !isToGlobal && fromExchange === toExchange)
    ) {
      setToExchange("");
    }
  }, [fromExchange]);

  const handleCalculate = async () => {
    if (!fromExchange || !toExchange || !amount || !coin) return;

    setIsLoading(true);
    try {
      const response = await serverClient.get(API_ROUTES.WITHDRAW.PATH.url, {
        params: {
          coin,
          amount: Number(amount),
          from: fromExchange as Exchange,
          to: toExchange as Exchange,
        },
      });
      setPathResult(response.data.data);
    } catch (error) {
      console.error("Failed to calculate withdraw path:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">송금 계산기</h1>
          <p className="mt-2 text-gray-400">
            거래소 간 송금 수수료와 예상 수령액을 계산해보세요.
          </p>
        </div>

        {/* Exchange Selection */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Select
            label="출발 거래소"
            options={fromOptions}
            value={fromExchange}
            onChange={setFromExchange}
            placeholder="거래소 선택"
          />
          <Select
            label="도착 거래소"
            options={toOptions}
            value={toExchange}
            onChange={setToExchange}
            placeholder="거래소 선택"
            disabled={!fromExchange}
          />
        </div>

        {/* Amount and Coin Input */}
        <div className="grid gap-6 sm:grid-cols-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="수량 입력"
            className="bg-gray-800 text-white rounded-lg px-4 py-2.5"
          />
          <input
            type="text"
            value={coin}
            onChange={(e) => setCoin(e.target.value.toUpperCase())}
            placeholder="코인 심볼 (예: BTC)"
            className="bg-gray-800 text-white rounded-lg px-4 py-2.5 uppercase"
          />
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          disabled={
            !fromExchange || !toExchange || !amount || !coin || isLoading
          }
          className="w-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 
                   disabled:cursor-not-allowed text-white font-medium py-2.5 
                   rounded-lg transition-colors"
        >
          {isLoading ? "계산 중..." : "계산하기"}
        </button>

        {/* Results */}
        {pathResult && (
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <h2 className="text-lg font-semibold text-white">예상 수수료</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-400">출금 수수료</p>
                <p className="text-white">
                  {formatCrypto(pathResult.withdrawFee)} {pathResult.coin}
                </p>
                <p className="text-sm text-gray-400">
                  ≈ {formatKRW(pathResult.feeInKRW)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">예상 수령액</p>
                <p className="text-white">
                  {formatCrypto(pathResult.estimatedReceiveAmount)}{" "}
                  {pathResult.coin}
                </p>
              </div>
              {pathResult.exchangeRate && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-400">적용 환율</p>
                  <p className="text-white">
                    {formatKRW(pathResult.exchangeRate)} / USD
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
