"use client";

import React, { useRef, useState, MouseEvent } from "react";
import Image from "next/image";
import { useExchangeRate, useUpbitMarketData } from "@/store/useMarketStore";
import Link from "next/link";
import { formatKRWWithUnit } from "@/lib/format";
export default function MarketTicker() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const exchangeRate = useExchangeRate();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current!.offsetLeft);
    setScrollLeft(scrollContainerRef.current!.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current!.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    scrollContainerRef.current!.scrollLeft = scrollLeft - walk;
  };

  // KRW 마켓의 코인 가격만 필터링
  const krwMarketPrices = useUpbitMarketData()
    .map(([symbol, data]) => ({
      symbol,
      price: data.upbit!.price,
      timestamp: data.upbit!.timestamp,
      image: `https://static.upbit.com/logos/${symbol.split("-")[0]}.png`,
      change24h: data.upbit!.change24h,
    }))
    .sort((a, b) => b.price - a.price); // 가격 기준 내림차순 정렬

  // 로딩 상태 표시
  if (!exchangeRate || krwMarketPrices.length === 0) {
    return (
      <div className="relative bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-900">
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            실시간 정보 연결 중...
          </div>
        </div>
      </div>
    );
  }

  const getWidthClass = (price: number) => {
    const digits = Math.floor(Math.log10(price)) + 1;
    if (digits <= 4) return "w-[90px]"; // ~9,999
    if (digits <= 5) return "w-[100px]"; // ~99,999
    if (digits <= 6) return "w-[110px]"; // ~999,999
    if (digits <= 7) return "w-[120px]"; // ~9,999,999
    return "w-[130px]"; // 10,000,000~
  };

  const formatPrice = (price: number) => {
    return (
      new Intl.NumberFormat("ko-KR", {
        maximumFractionDigits: 0,
      }).format(price) + "원"
    );
  };

  const CoinItem = React.memo(
    ({ coin }: { coin: (typeof krwMarketPrices)[0] }) => (
      <span className="inline-flex items-center px-4 h-8 text-sm text-gray-600 dark:text-gray-400 font-medium mr-1">
        <div className="flex items-center">
          <Image
            src={coin.image}
            alt={coin.symbol.split("-")[0]}
            width={16}
            height={16}
            className="mr-1"
          />
          <span className="font-bold text-gray-900 dark:text-white">
            {coin.symbol.split("-")[0]}
          </span>
        </div>
        <span
          className={`ml-2 ${getWidthClass(coin.price)} text-right ${
            coin.change24h > 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {formatKRWWithUnit(coin.price)}({coin.change24h > 0 ? "+" : ""}
          {coin.change24h.toFixed(2)}%)
        </span>
      </span>
    )
  );

  return (
    <div className="relative bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-900">
      <div className="flex items-stretch">
        {/* 고정된 환율 표시 */}
        <Link
          href="https://www.google.com/finance/quote/USD-KRW"
          target="_blank"
          className="flex-shrink-0 px-4 py-2 border-r border-gray-200 dark:border-gray-900 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">
            실시간 환율:{" "}
            {new Intl.NumberFormat("ko-KR").format(exchangeRate.rate)}원
          </span>
        </Link>

        {/* 스크롤 가능한 코인 가격 */}
        <div
          ref={scrollContainerRef}
          className="relative flex-1 overflow-x-auto custom-scrollbar select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="inline-block whitespace-nowrap py-2">
            {krwMarketPrices.map((coin) => (
              <CoinItem key={coin.symbol} coin={coin} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
