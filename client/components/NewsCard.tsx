"use client";

import { News } from "@/dto/news.dto";
import { clsx } from "clsx";
import Link from "next/link";
import { formatKRWWithUnit } from "@/lib/format";
import Image from "next/image";
interface NewsCardProps {
  news: News;
}

const MarketLabel = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-xs text-gray-500 dark:text-gray-400">{children}</p>;
};

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <Link
      href={`/news/${news.id}`}
      className="block bg-white dark:bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <article className="p-4 space-y-3">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Image
              src={`https://static.upbit.com/logos/${
                news.symbol.split("-")[0]
              }.png`}
              alt={news.symbol.split("-")[0]}
              width={20}
              height={20}
            />
            <time className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(news.timestamp).toLocaleString()}
            </time>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {news.title}
          </h2>
        </div>

        {/* Content Preview */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {news.content}
        </p>

        {/* Market Data */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <MarketLabel>시세</MarketLabel>
            <p className="text-sm text-gray-900 dark:text-white">
              {formatKRWWithUnit(news.marketData.currentPrice)}원
            </p>
          </div>
          <div>
            <MarketLabel>거래량</MarketLabel>
            <p className="text-sm text-gray-900 dark:text-white">
              {formatKRWWithUnit(news.marketData.volume)}원
            </p>
          </div>
          <div>
            <MarketLabel>24시간 변동률</MarketLabel>
            <p
              className={clsx(
                "text-sm font-medium",
                news.marketData.priceChange > 0
                  ? "text-green-500 dark:text-green-400"
                  : "text-red-500 dark:text-red-400"
              )}
            >
              {news.marketData.priceChange > 0 ? "+" : ""}
              {news.marketData.priceChange.toFixed(2)}%
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
