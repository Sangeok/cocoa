"use client";

import { WithdrawPathResult } from "@/dto/withdraw.dto";
import { formatKRW, formatCrypto, formatDollar } from "@/lib/format";
import { clsx } from "clsx";
import Image from "next/image";
import { UPBIT_STATIC_IMAGE_URL } from "@/const";
interface WithdrawPathCardProps {
  path: WithdrawPathResult;
}

export default function WithdrawPathCard({ path }: WithdrawPathCardProps) {
  function formatPrice(price: number, isKRW: boolean) {
    return isKRW ? formatKRW(price) : formatDollar(price);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-4">
      {/* Header with Coin Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src={`${UPBIT_STATIC_IMAGE_URL}/${path.coin}.png`}
            alt={path.coin}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="text-gray-900 dark:text-white font-medium">
            {path.coin}
          </span>
        </div>
        <span
          className={clsx(
            "font-medium",
            path.profitRate > 0
              ? "text-green-500 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
          )}
        >
          {path.profitRate ? path.profitRate.toFixed(2) : "0.00"}%
          {path.profitRate > 0 ? " 이득" : " 손해"}
        </span>
      </div>

      {/* Fee and Estimated Amount */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            출금 수수료
          </p>
          <p className="text-gray-900 dark:text-white">
            {formatCrypto(path.withdrawFee)} {path.coin}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ≈ {formatKRW(path.feeInKRW)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            예상 수령액
          </p>
          <p className="text-gray-900 dark:text-white">
            {formatCrypto(path.estimatedReceiveAmount)} {path.coin}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          송금 단계
        </p>
        <ul className="space-y-1">
          {path.steps.map((step, stepIndex) => (
            <li
              key={stepIndex}
              className="text-gray-900 dark:text-white text-sm"
            >
              {stepIndex + 1}. {step}
            </li>
          ))}
        </ul>
      </div>

      {/* Summary Table */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">요약</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">
              구매한 코인
            </span>
            <p className="text-gray-900 dark:text-white font-medium">
              {path.coin}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">구매 수량</span>
            <p className="text-gray-900 dark:text-white font-medium">
              {formatCrypto(path.amount)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">출발 가격</span>
            <p className="text-gray-900 dark:text-white font-medium">
              {formatPrice(path.fromPrice, path.fromExchange === "upbit")}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">도착 가격</span>
            <p className="text-gray-900 dark:text-white font-medium">
              {formatPrice(path.toPrice, path.toExchange === "upbit")}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">출발 금액</span>
            <p className="text-gray-900 dark:text-white font-medium">
              {formatKRW(path.sourceAmountInKRW || 0)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">도착 금액</span>
            <p className="text-gray-900 dark:text-white font-medium">
              {formatKRW(path.targetAmountInKRW || 0)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">수수료</span>
            <p className="text-gray-900 dark:text-white font-medium">
              {formatKRW(path.feeInKRW)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">차액</span>
            <p
              className={clsx(
                "font-medium",
                path.profitRate > 0
                  ? "text-green-500 dark:text-green-400"
                  : "text-red-500 dark:text-red-400"
              )}
            >
              {path.profitRate ? path.profitRate.toFixed(2) : "0.00"}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
