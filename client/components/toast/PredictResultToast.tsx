import { PredictResult } from "@/types/predict";
import { formatPriceByMarket } from "@/lib/market";
import { getMarketType } from "@/lib/market";

interface PredictResultToastProps {
  result: PredictResult;
  className?: string;
}

export const PredictResultToast = ({ result, className }: PredictResultToastProps) => {
  const marketType = getMarketType(result.market);
  
  return (
    <div className={`flex items-center gap-3 min-w-[300px] ${className || ''}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
        ${result.isDraw 
          ? 'bg-gray-100 text-gray-600' 
          : result.isLiquidated
          ? 'bg-yellow-100 text-yellow-600'
          : result.isWin 
            ? 'bg-green-100 text-green-600'
            : 'bg-red-100 text-red-600'
        }`}
      >
        {result.isDraw ? '=' : result.isLiquidated ? '!' : result.isWin ? '✓' : '✗'}
      </div>
      <div className="flex-1">
        <div className="font-medium">
          {result.isLiquidated 
            ? '청산 발생!'
            : result.isDraw 
              ? '무승부' 
              : result.isWin 
                ? '예측 성공!' 
                : '예측 실패'}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {result.position === 'L' ? '롱' : '숏'} |{' '}
          {formatPriceByMarket(result.entryPrice, marketType)} →{' '}
          {formatPriceByMarket(result.closePrice, marketType)}
        </div>
      </div>
    </div>
  );
}; 