import Image from "next/image";
import { formatKRWWithUnit } from "@/lib/format";
import React from "react";

interface CoinItemProps {
  coin: {
    symbol: string;
    price: number;
    image: string;
    change24h: number;
  };
}

export const CoinItem = React.memo(({ coin }: CoinItemProps) => (
  <span className="inline-flex items-center px-4 h-8 text-sm text-gray-600 dark:text-gray-400 font-medium mr-1">
    <div className="flex items-center">
      <Image
        src={coin.image}
        alt={coin.symbol.split("-")[0]}
        width={16}
        height={16}
        className="mr-1"
        priority
        unoptimized
      />
      <span className="font-bold text-gray-900 dark:text-white">
        {coin.symbol.split("-")[0]}
      </span>
    </div>
    <span
      className={`ml-2 text-right ${
        coin.change24h > 0 ? "text-green-500" : "text-red-500"
      }`}
    >
      {formatKRWWithUnit(coin.price)}({coin.change24h > 0 ? "+" : ""}
      {coin.change24h.toFixed(2)}%)
    </span>
  </span>
));

CoinItem.displayName = 'CoinItem'; 