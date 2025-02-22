import Image from "next/image";
import { UPBIT_STATIC_IMAGE_URL } from "@/const";
import { formatPriceByMarket, MarketType } from "@/lib/market";
import { formatPercent } from "@/lib/format";
import clsx from "clsx";
import { CoinData } from "@/store/useMarketStore";
import { useCurrentPrice } from "@/hooks/useCurrentPrice";

interface CoinHeaderProps {
  symbol: string;
  koreanName: string;
  coins: Record<string, CoinData>;
}

export default function CoinHeader({
  symbol,
  koreanName,
  coins,
}: CoinHeaderProps) {
  const { price, change24h } = useCurrentPrice(symbol, coins);
  const marketType = symbol.split("-")[1] as MarketType;
  const priceChange = (price * change24h) / 100;

  return (
    <div className="flex items-center gap-4">
      <Image
        src={`${UPBIT_STATIC_IMAGE_URL}/${symbol.split("-")[0]}.png`}
        alt={symbol.split("-")[0]}
        width={48}
        height={48}
        className="flex-shrink-0"
      />
      <div className="flex items-end gap-2">
        <div>
          <h1 className="text-lg font-bold">
            {koreanName}({symbol.split("-")[0]})
          </h1>
          <div className="text-lg font-bold">
            {formatPriceByMarket(price, marketType)}
          </div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            어제보다
          </div>
          <div
            className={clsx(
              "text-sm font-medium",
              change24h > 0
                ? "text-green-500"
                : change24h < 0
                ? "text-red-500"
                : "text-gray-500"
            )}
          >
            {formatPriceByMarket(priceChange, marketType)}(
            {formatPercent(change24h)})
          </div>
        </div>
      </div>
    </div>
  );
}
