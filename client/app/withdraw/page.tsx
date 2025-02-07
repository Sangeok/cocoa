"use client";

import { useState } from "react";
import Select from "@/components/Select";
import Input from "@/components/Input";
import {
  Exchange,
  WithdrawPathResult,
  formatKRW,
  formatCrypto,
  KOREA_EXCHANGES,
  GLOBAL_EXCHANGES,
} from "@/dto/withdraw.dto";
import { API_ROUTES } from "@/const/api";
import { apiClient } from "@/lib/axios";
import clsx from "clsx";

export default function WithdrawPage() {
  const [fromExchange, setFromExchange] = useState<string>("");
  const [toExchange, setToExchange] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [pathResults, setPathResults] = useState<WithdrawPathResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Determine available exchanges based on selection
  const isFromKorea = KOREA_EXCHANGES.some((ex) => ex.value === fromExchange);
  const toOptions = isFromKorea ? GLOBAL_EXCHANGES : KOREA_EXCHANGES;

  const handleCalculate = async () => {
    if (!fromExchange || !toExchange || !amount) return;

    setIsLoading(true);
    try {
      const response = await apiClient.get(API_ROUTES.WITHDRAW.PATH.url, {
        params: {
          amount: Number(amount),
          from: fromExchange as Exchange,
          to: toExchange as Exchange,
        },
      });
      setPathResults(response.data);
    } catch (error) {
      console.error("Failed to calculate withdraw path:", error);
    } finally {
      setIsLoading(false);
    }
  };

  function formatPrice(price: number, isKRW: boolean) {
    if (isKRW) {
      return formatKRW(price);
    }
    return `$${price.toFixed(2)}`;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">송금 계산기</h1>
          <p className="mt-2 text-gray-400">
            거래소 간 송금 수수료와 예상 수령액을 계산해보세요.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Select
            label="출발 거래소"
            options={[...KOREA_EXCHANGES, ...GLOBAL_EXCHANGES]}
            value={fromExchange}
            onChange={setFromExchange}
          />
          <Select
            label="도착 거래소"
            options={toOptions}
            value={toExchange}
            onChange={setToExchange}
          />
        </div>

        <Input
          type="number"
          label={isFromKorea ? "원화 금액" : "USDT 금액"}
          value={amount}
          onChange={setAmount}
          placeholder={isFromKorea ? "원화 금액 입력" : "USDT 금액 입력"}
        />

        <button
          onClick={handleCalculate}
          disabled={!fromExchange || !toExchange || !amount || isLoading}
          className="w-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 
                   disabled:cursor-not-allowed text-white font-medium py-2.5 
                   rounded-lg transition-colors"
        >
          {isLoading ? "계산 중..." : "계산하기"}
        </button>

        {pathResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">추천 송금 경로</h2>
            
            {pathResults.map((path, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">
                    {index + 1}. {path.coin} 경로
                  </span>
                  <span className={clsx(
                    "font-medium",
                    path.profitRate > 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {path.profitRate ? path.profitRate.toFixed(2) : "0.00"}% 
                    {path.profitRate > 0 ? " 이득" : " 손해"}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-400">출금 수수료</p>
                    <p className="text-white">
                      {formatCrypto(path.withdrawFee)} {path.coin}
                    </p>
                    <p className="text-sm text-gray-400">
                      ≈ {formatKRW(path.feeInKRW)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">예상 수령액</p>
                    <p className="text-white">
                      {formatCrypto(path.estimatedReceiveAmount)} {path.coin}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400">송금 단계</p>
                  <ul className="mt-1 space-y-1">
                    {path.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-white text-sm">
                        {stepIndex + 1}. {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>코인: {path.coin}</div>
                <div>수량: {formatCrypto(path.amount)}</div>
                <div>출발지 가격: {formatPrice(path.fromPrice, path.fromExchange === 'upbit')}</div>
                <div>도착지 가격: {formatPrice(path.toPrice, path.toExchange === 'upbit')}</div>
                <div>출발 금액: {formatKRW(path.sourceAmountInKRW || 0)}</div>
                <div>도착 금액: {formatKRW(path.targetAmountInKRW || 0)}</div>
                <div>수수료: {formatKRW(path.feeInKRW)}</div>
                <div>수익률: {path.profitRate ? path.profitRate.toFixed(2) : "0.00"}%</div>
                <div>단계:
                  {path.steps.map((step, i) => (
                    <div key={i} className="ml-4">{step}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
