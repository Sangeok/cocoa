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
import { useState } from "react";
import { UPBIT_STATIC_IMAGE_URL } from "@/const";
import Link from "next/link";
import { UsdtPremiumBox } from "./UsdtPremiumBox";
import {
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

const TriangleUp = () => (
  <div className="w-0 h-0 border-x-[2px] border-b-[4px] sm:border-x-[4px] border-x-transparent sm:border-b-[6px] border-b-current" />
);

const TriangleDown = () => (
  <div className="w-0 h-0 border-x-[2px] border-t-[4px] sm:border-x-[4px] border-x-transparent sm:border-t-[6px] border-t-current" />
);

function ImageWithFallback({ symbol }: { symbol: string }) {
  const [showImage, setShowImage] = useState(true);

  if (!showImage) {
    return (
      <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-1 sm:mr-2 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs">
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
      className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-1 sm:mr-2"
      onError={() => setShowImage(false)}
    />
  );
}

function truncateKoreanName(name: string, maxLength: number = 6): string {
  return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
}

// 거래소와 마켓을 조합한 옵션 생성
const COMBINED_EXCHANGE_OPTIONS = [
  ...EXCHANGE_OPTIONS.flatMap((exchange) =>
    BASE_TOKEN_OPTIONS[exchange.value].map((market) => ({
      value: `${exchange.value}:${market.value}`,
      label: `${exchange.label} ${market.value}`,
      image: true,
      imageUrl: exchange.value,
    }))
  ),
];

interface TableHeaderProps {
  label: string;
  sortField: SortField;
  sortState: SortState;
  handleSort: (field: SortField) => void;
  className?: string;
  children?: React.ReactNode;
  align?: "left" | "right";
}

function TableHeader({
  label,
  sortField,
  sortState,
  handleSort,
  className = "",
  children,
  align = "left",
}: TableHeaderProps) {
  return (
    <th className={className}>
      <button
        onClick={() => handleSort(sortField)}
        className={clsx(
          "flex items-center gap-1 whitespace-nowrap w-full",
          align === "right" ? "justify-end" : "justify-start"
        )}
      >
        {children || (
          <div className="flex flex-col items-start gap-1">
            <div>{label}</div>
          </div>
        )}
        <div className="hidden sm:block">
          <SortIcon
            direction={
              sortState.field === sortField ? sortState.direction : null
            }
          />
        </div>
      </button>
    </th>
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
    field: "volume",
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
    <div className="space-y-2 sm:space-y-4 lg:space-y-6">
      <div className="bg-white dark:bg-gray-950 sm:rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-900">
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 lg:gap-4 sm:justify-between sm:items-end">
          <div className="flex items-end justify-between sm:justify-start gap-0.5 sm:gap-2 lg:gap-4">
            <Select
              label="시작 거래소"
              value={`${exchangePair.from}:${exchangePair.fromBase}`}
              onChange={(value) => {
                const [exchange, market] = value.split(":") as [Exchange, QuoteToken];
                setExchangePair((prev) => ({
                  ...prev,
                  from: exchange,
                  fromBase: market,
                }));
              }}
              options={COMBINED_EXCHANGE_OPTIONS}
            />
            <button
              onClick={() => {
                setExchangePair((prev) => ({
                  from: prev.to,
                  to: prev.from,
                  fromBase: prev.toBase,
                  toBase: prev.fromBase,
                }));
              }}
              className="mb-1.5 p-1 sm:p-2 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              title="거래소 스왑"
            >
              <ArrowsRightLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <Select
              label="비교 거래소"
              value={`${exchangePair.to}:${exchangePair.toBase}`}
              onChange={(value) => {
                const [exchange, market] = value.split(":") as [Exchange, QuoteToken];
                setExchangePair((prev) => ({
                  ...prev,
                  to: exchange,
                  toBase: market,
                }));
              }}
              options={COMBINED_EXCHANGE_OPTIONS}
            />
          </div>
          <div className="relative mt-1 sm:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="코인명 검색 (한글/영문)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                         bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      <UsdtPremiumBox />

      {sortedMarkets.length === 0 && searchTerm ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          검색 결과가 없습니다
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-950 sm:rounded-lg overflow-hidden border border-gray-200 dark:border-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-900">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-sm xl:text-base">
                  <TableHeader
                    label="코인명"
                    sortField="name"
                    sortState={sortState}
                    handleSort={handleSort}
                    className="w-[30%] px-3 py-1 sm:py-3 text-center"
                  />
                  <TableHeader
                    label="프리미엄"
                    sortField="premium"
                    sortState={sortState}
                    handleSort={handleSort}
                    className="w-[15%] px-1 sm:px-3 py-1.5 sm:py-3 text-center"
                    align="right"
                  />
                  <TableHeader
                    sortField="fromPrice"
                    sortState={sortState}
                    handleSort={handleSort}
                    className="w-[20%] px-1 sm:px-3 py-1.5 sm:py-3 text-center"
                    align="right"
                    label=""
                  >
                    <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                      <div>
                        {EXCHANGE_OPTIONS.find(
                          (option) => option.value === exchangePair.from
                        )?.label}{" "}
                        가격
                      </div>
                      <span className="text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 block">
                        전일대비(%)
                      </span>
                    </div>
                  </TableHeader>
                  <TableHeader
                    sortField="toPrice"
                    sortState={sortState}
                    handleSort={handleSort}
                    className="w-[20%] px-1 sm:px-3 py-1.5 sm:py-3 text-center"
                    align="right"
                    label=""
                  >
                    <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                      <div>
                        {EXCHANGE_OPTIONS.find(
                          (option) => option.value === exchangePair.to
                        )?.label}{" "}
                        가격
                      </div>
                      <span className="text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 block">
                        전일대비(%)
                      </span>
                    </div>
                  </TableHeader>
                  <TableHeader
                    sortField="volume"
                    sortState={sortState}
                    handleSort={handleSort}
                    className="w-[15%] pr-1 py-1.5 sm:py-3 text-center"
                    align="right"
                    label=""
                  >
                    <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                      <div>거래량</div>
                      <span className="text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 block">
                        (시작거래소)
                      </span>
                    </div>
                  </TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-900">
                {sortedMarkets.map((market) => (
                  <tr
                    key={market.symbol}
                    className="text-xs sm:text-sm xl:text-base hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="pl-2 sm:px-3 py-1 sm:py-3 xl:py-4 whitespace-nowrap">
                      <Link
                        href={`/coin/${market.symbol}`}
                        className="text-gray-900 dark:text-white hover:underline"
                      >
                        <div className="flex items-center">
                          <ImageWithFallback symbol={market.symbol} />
                          <div className="text-gray-900 dark:text-white">
                            <div className="text-[12px] sm:text-[16px] lg:text-[17px] font-medium">
                              <span className="hidden sm:block">
                                {getKoreanName(market.symbol)}
                              </span>
                              <span className="sm:hidden">
                                {truncateKoreanName(
                                  getKoreanName(market.symbol)
                                )}
                              </span>
                            </div>
                            <div className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                              {market.symbol.split("-")[0]}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-1 sm:px-3 py-1.5 sm:py-3 xl:py-4 text-right whitespace-nowrap">
                      <span
                        className={clsx(
                          "font-medium flex items-center justify-end gap-0.5 text-xs sm:text-base xl:text-lg",
                          market.priceGapPercent === 0
                            ? "text-gray-400 dark:text-gray-500"
                            : market.priceGapPercent > 0
                            ? "text-green-600 dark:text-green-500"
                            : "text-red-500 dark:text-red-400"
                        )}
                      >
                        {market.priceGapPercent > 0 ? (
                          <TriangleUp />
                        ) : market.priceGapPercent < 0 ? (
                          <TriangleDown />
                        ) : null}
                        {formatPercent(Math.abs(market.priceGapPercent))}
                      </span>
                    </td>
                    <td className="px-1 sm:px-3 py-1.5 sm:py-3 xl:py-4 text-right font-medium whitespace-nowrap text-gray-900 dark:text-white">
                      {(exchangePair.fromBase === "KRW" ||
                        exchangePair.fromBase === "USDT") && (
                        <span className="hidden sm:inline">₩</span>
                      )}
                      <span className="font-medium text-xs md:text-[14px] sm:text-base xl:text-lg">
                        {formatExchangePrice(
                          market.fromPrice,
                          exchangePair.fromBase,
                          exchangeRate || { rate: 0 },
                          true
                        )}
                      </span>
                      <div
                        className={clsx(
                          "text-[11px] sm:text-sm xl:text-base flex items-center justify-end gap-0.5 font-medium mt-0.5 sm:mt-1",
                          market.fromPriceChange24h > 0
                            ? "text-green-600 dark:text-green-500"
                            : market.fromPriceChange24h < 0
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {market.fromPriceChange24h > 0 ? (
                          <TriangleUp />
                        ) : market.fromPriceChange24h < 0 ? (
                          <TriangleDown />
                        ) : null}
                        {Math.abs(market.fromPriceChange24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-0 sm:px-3 py-1.5 sm:py-3 xl:py-4 text-right font-medium whitespace-nowrap text-gray-900 dark:text-white">
                      {(exchangePair.toBase === "KRW" ||
                        exchangePair.toBase === "USDT") && (
                        <span className="hidden sm:inline">₩</span>
                      )}
                      <span className="font-medium text-[13px] md:text-[14px] sm:text-base xl:text-lg">
                        {formatExchangePrice(
                          market.toPrice,
                          exchangePair.toBase,
                          exchangeRate || { rate: 0 },
                          true
                        )}
                      </span>
                      <div
                        className={clsx(
                          "text-[11px] sm:text-sm xl:text-base flex items-center justify-end gap-0.5 font-medium mt-0.5 sm:mt-1",
                          market.toPriceChange24h > 0
                            ? "text-green-600 dark:text-green-500"
                            : market.toPriceChange24h < 0
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {market.toPriceChange24h > 0 ? (
                          <TriangleUp />
                        ) : market.toPriceChange24h < 0 ? (
                          <TriangleDown />
                        ) : null}
                        {Math.abs(market.toPriceChange24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="pr-1 sm:px-3 py-1.5 sm:py-3 xl:py-4 text-right text-gray-500 dark:text-gray-400 font-medium text-[11px] sm:text-base xl:text-lg">
                      {exchangePair.fromBase === "KRW"
                        ? formatKRWWithUnit(market.volume, false)
                        : formatCryptoToKRWWithUnit(
                            market.volume,
                            market.fromPrice,
                            exchangeRate?.rate || 0,
                            false
                          )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
