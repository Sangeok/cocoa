"use client";

import Image from "next/image";
import clsx from "clsx";
import Select from "@/components/common/Select";
import SortIcon from "@/components/icons/SortIcon";
import {
  formatExchangePrice,
  formatPercent,
  formatKRWWithUnit,
  formatCryptoToKRWWithUnit,
} from "@/lib/format";
import { EXCHANGE_OPTIONS, BASE_TOKEN_OPTIONS } from "@/const/exchange";
import type { SortField, SortState } from "@/types/exchange";
import { useMarketData } from "@/hooks/useMarketData";
import { Exchange, QuoteToken } from "@/types/exchange";
import { useState, useEffect } from "react";
import { UPBIT_STATIC_IMAGE_URL } from "@/const";
import Link from "next/link";
import useMarketsStore from "@/store/useMarketsStore";

function ImageWithFallback({ symbol }: { symbol: string }) {
  const [showImage, setShowImage] = useState(true);

  if (!showImage) {
    return (
      <div className="w-5 h-5 sm:w-6 sm:h-6 mr-2 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs">
        {symbol.charAt(0)}
      </div>
    );
  }

  return (
    <Image
      src={`${UPBIT_STATIC_IMAGE_URL}/${symbol.split("-")[0]}.png`}
      alt={symbol.split("-")[0]}
      width={20}
      height={20}
      className="mr-2 sm:w-6 sm:h-6"
      onError={() => setShowImage(false)}
    />
  );
}

export default function PremiumTableContent() {
  const {
    exchangeRate,
    exchangePair,
    setExchangePair,
    searchTerm,
    setSearchTerm,
    getKoreanName,
    getSortedMarkets,
  } = useMarketData();

  const [sortState, setSortState] = useState<SortState>({
    field: "premium",
    direction: "desc",
  });

  if (!exchangeRate) {
    return null;
  }

  const handleSort = (field: SortField) => {
    setSortState((prev) => ({
      field,
      direction:
        prev.field === field
          ? prev.direction === "asc"
            ? "desc"
            : prev.direction === "desc"
            ? null
            : "asc"
          : "asc",
    }));
  };

  const sortedMarkets = getSortedMarkets(sortState);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-950 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-900">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-end">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Select
                label="시작 거래소"
                value={exchangePair.from}
                onChange={(value) => {
                  const newFrom = value as Exchange;
                  setExchangePair((prev) => ({
                    ...prev,
                    from: newFrom,
                    fromBase: BASE_TOKEN_OPTIONS[newFrom][0].value,
                  }));
                }}
                options={EXCHANGE_OPTIONS}
              />
              <Select
                label="마켓"
                value={exchangePair.fromBase}
                onChange={(value) => {
                  setExchangePair((prev) => ({
                    ...prev,
                    fromBase: value as QuoteToken,
                  }));
                }}
                options={BASE_TOKEN_OPTIONS[exchangePair.from]}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                label="비교 거래소"
                value={exchangePair.to}
                onChange={(value) => {
                  const newTo = value as "upbit" | "binance";
                  setExchangePair((prev) => ({
                    ...prev,
                    to: newTo,
                    toBase: BASE_TOKEN_OPTIONS[newTo][0].value,
                  }));
                }}
                options={EXCHANGE_OPTIONS}
              />
              <Select
                label="마켓"
                value={exchangePair.toBase}
                onChange={(value) => {
                  setExchangePair((prev) => ({
                    ...prev,
                    toBase: value as QuoteToken,
                  }));
                }}
                options={BASE_TOKEN_OPTIONS[exchangePair.to]}
              />
            </div>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="코인명 검색 (한글/영문)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {sortedMarkets.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          검색 결과가 없습니다
        </div>
      )}

      <div className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-900">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    코인명
                    <SortIcon
                      direction={
                        sortState.field === "name" ? sortState.direction : null
                      }
                    />
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort("premium")}
                    className="flex items-center justify-end gap-1 whitespace-nowrap w-full"
                  >
                    프리미엄
                    <SortIcon
                      direction={
                        sortState.field === "premium"
                          ? sortState.direction
                          : null
                      }
                    />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort("fromPrice")}
                    className="flex items-center justify-end gap-1 whitespace-nowrap w-full"
                  >
                    <div className="flex flex-col items-end gap-1">
                      <div>
                        {
                          EXCHANGE_OPTIONS.find(
                            (option) => option.value === exchangePair.from
                          )?.label
                        }{" "}
                        가격
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        전일대비(%)
                      </span>
                    </div>
                    <SortIcon
                      direction={
                        sortState.field === "fromPrice"
                          ? sortState.direction
                          : null
                      }
                    />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort("toPrice")}
                    className="flex items-center justify-end gap-1 whitespace-nowrap w-full"
                  >
                    <div className="flex flex-col items-end gap-1">
                      <div>
                        {
                          EXCHANGE_OPTIONS.find(
                            (option) => option.value === exchangePair.to
                          )?.label
                        }{" "}
                        가격
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        전일대비(%)
                      </span>
                    </div>
                    <SortIcon
                      direction={
                        sortState.field === "toPrice"
                          ? sortState.direction
                          : null
                      }
                    />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-right">
                  <button
                    onClick={() => handleSort("volume")}
                    className="flex items-center justify-end gap-1 whitespace-nowrap w-full"
                  >
                    <div className="flex flex-col items-end gap-1">
                      <div>일일 거래량</div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        (시작거래소)
                      </span>
                    </div>
                    <SortIcon
                      direction={
                        sortState.field === "volume"
                          ? sortState.direction
                          : null
                      }
                    />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-900">
              {sortedMarkets.map((market) => (
                <tr
                  key={market.symbol}
                  className="text-xs sm:text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                    <Link
                      href={`/coin/${market.symbol}`}
                      className="text-gray-900 dark:text-white hover:underline"
                    >
                      <div className="flex items-center">
                        <ImageWithFallback symbol={market.symbol} />
                        <div className="text-gray-900 dark:text-white font-medium">
                          <div>{getKoreanName(market.symbol)}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                            {market.symbol.split("-")[0]}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 text-right whitespace-nowrap">
                    <span
                      className={clsx(
                        "font-medium",
                        market.priceGapPercent === 0
                          ? "text-gray-400 dark:text-gray-500"
                          : market.priceGapPercent > 0
                          ? "text-green-500 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      )}
                    >
                      {formatPercent(market.priceGapPercent)}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 text-right font-medium whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {(exchangePair.fromBase === "KRW" ||
                      exchangePair.fromBase === "USDT") &&
                      "₩"}
                    {formatExchangePrice(
                      market.fromPrice,
                      exchangePair.fromBase,
                      exchangeRate || { rate: 0 }
                    )}
                    {
                      <div
                        className={clsx(
                          "text-xs",
                          market.fromPriceChange24h > 0
                            ? "text-green-500 dark:text-green-400"
                            : market.fromPriceChange24h < 0
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {market.fromPriceChange24h.toFixed(2)}%
                      </div>
                    }
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 text-right font-medium whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {(exchangePair.toBase === "KRW" ||
                      exchangePair.toBase === "USDT") &&
                      "₩"}
                    {formatExchangePrice(
                      market.toPrice,
                      exchangePair.toBase,
                      exchangeRate || { rate: 0 }
                    )}
                    {
                      <div
                        className={clsx(
                          "text-xs",
                          market.toPriceChange24h > 0
                            ? "text-green-500 dark:text-green-400"
                            : market.toPriceChange24h < 0
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {market.toPriceChange24h.toFixed(2)}%
                      </div>
                    }
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-4 text-right text-gray-500 dark:text-gray-400">
                    {exchangePair.fromBase === "KRW"
                      ? formatKRWWithUnit(market.volume)
                      : formatCryptoToKRWWithUnit(
                          market.volume,
                          market.fromPrice,
                          exchangeRate?.rate || 0
                        )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
