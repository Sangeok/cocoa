import { PredictResult } from "@/types/predict";
import { formatPriceByMarket, getMarketType } from "@/lib/market";

export const PredictResultToast = ({ result }: { result: PredictResult }) => {
  const marketType = getMarketType(result.market);
  const pnl = result.vault - result.deposit; // 손익 계산
  const isProfit = pnl > 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="font-medium">
        {result.isLiquidated
          ? "포지션 청산"
          : result.isWin
          ? "예측 성공"
          : result.isDraw
          ? "예측 무승부"
          : "예측 실패"}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {result.market} {result.position === "L" ? "롱" : "숏"} {result.leverage}x
      </div>
      <div className="text-sm">
        <span className="text-gray-500">
          {formatPriceByMarket(result.entryPrice, marketType)} →{" "}
          {formatPriceByMarket(result.closePrice, marketType)}
        </span>
      </div>
      {!result.isDraw && (
        <div
          className={`text-sm font-medium ${
            isProfit ? "text-green-500" : "text-red-500"
          }`}
        >
          {isProfit ? "+" : ""}
          {formatPriceByMarket(pnl, marketType)}
          {` (${((pnl / result.deposit) * 100).toFixed(2)}%)`}
        </div>
      )}
    </div>
  );
}; 