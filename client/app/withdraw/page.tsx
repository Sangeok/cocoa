"use client";

import { useState } from "react";
import Select from "@/components/common/Select";
import Input from "@/components/common/Input";
import {
  Exchange,
  WithdrawPathResult,
  KOREA_EXCHANGES,
  GLOBAL_EXCHANGES,
} from "@/dto/withdraw.dto";
import { API_ROUTES } from "@/const/api";
import { ClientAPICall } from "@/lib/axios";
import WithdrawPathCard from "@/components/withdraw/WithdrawPathCard";
import { sendGAEvent } from "@/lib/gtag";

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

    // GA 이벤트 전송
    sendGAEvent("calculate_withdraw_path", {
      from_exchange: fromExchange,
      to_exchange: toExchange,
      amount: Number(amount),
      currency: isFromKorea ? "KRW" : "USDT",
    });

    setIsLoading(true);
    try {
      const response = await ClientAPICall.get(API_ROUTES.WITHDRAW.PATH.url, {
        params: {
          amount: Number(amount),
          from: fromExchange as Exchange,
          to: toExchange as Exchange,
        },
      });
      setPathResults(response.data);
    } catch (error) {
      console.error("Failed to calculate withdraw path:", error);
      // 에러 이벤트도 전송
      sendGAEvent("withdraw_path_error", {
        error: (error as Error).message,
        from_exchange: fromExchange,
        to_exchange: toExchange,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            송금 계산기
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            거래소 간 송금 수수료와 예상 수령액을 계산해보세요.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Select
            label="출발 거래소"
            options={[...KOREA_EXCHANGES, ...GLOBAL_EXCHANGES]}
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
          className="w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 
                   disabled:bg-gray-50 dark:disabled:bg-white/5 disabled:cursor-not-allowed 
                   text-gray-900 dark:text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {isLoading ? "계산 중..." : "계산하기"}
        </button>

        {/* Disclaimer */}
        <div className="text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
          <p className="mb-2">⚠️ 주의사항</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              해당 서비스는 거래소의 실제 시세 및 수수료 정책과 차이가 있을 수
              있습니다.
            </li>
            <li>
              송금 과정에서 발생하는 실제 비용 및 최종 수령 금액은 보장되지
              않습니다.
            </li>
            <li>참고용 정보로만 활용해 주시기 바랍니다.</li>
          </ul>
        </div>

        {pathResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              추천 송금 경로
            </h2>

            {pathResults.map((path, index) => (
              <WithdrawPathCard key={index} path={path} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
