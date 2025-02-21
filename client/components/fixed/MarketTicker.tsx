"use client";

import React, { useRef, useState, MouseEvent, useEffect } from "react";
import Image from "next/image";
import { useExchangeRate, useUpbitMarketData } from "@/store/useMarketStore";
import Link from "next/link";
import { formatKRWWithUnit } from "@/lib/format";
import { UPBIT_STATIC_IMAGE_URL } from "@/const";
import { useHangangTemp } from "@/hooks/useHangangTemp";
import { CoinItem } from "./CoinItem";

export default function MarketTicker() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const exchangeRate = useExchangeRate();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const hangangTemp = useHangangTemp();
  const [showExchangeRate, setShowExchangeRate] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowExchangeRate((prev) => !prev);
    }, 2000); // 2초마다 토글

    return () => clearInterval(interval);
  }, []);

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
      image: `${UPBIT_STATIC_IMAGE_URL}/${symbol.split("-")[0]}.png`,
      change24h: data.upbit!.change24h,
    }))
    .sort((a, b) => b.price - a.price); // 가격 기준 내림차순 정렬

  // 온도에 따른 색상을 결정하는 함수를 추가
  const getTemperatureColor = (temp: number | null) => {
    if (temp === null) return "text-gray-600 dark:text-gray-400";
    if (temp <= 5) return "text-blue-500";
    if (temp <= 15) return "text-green-500";
    if (temp <= 25) return "text-yellow-500";
    return "text-red-500";
  };

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

  return (
    <div className="relative bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-900">
      <div className="flex items-stretch">
        {/* 환율과 한강 수온 */}
        <div className="flex flex-col flex-shrink-0 border-r border-gray-200 dark:border-gray-900">
          <Link
            href="https://www.google.com/finance/quote/USD-KRW"
            target="_blank"
            className="px-4 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors border-b border-gray-200 dark:border-gray-900"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              💹 환율:{" "}
              {new Intl.NumberFormat("ko-KR").format(exchangeRate.rate)}원
            </span>
          </Link>
          <Link
            href="https://hangang.life/"
            target="_blank"
            className="px-4 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-sm text-gray-600 dark:text-gray-400"
          >
            🌡️ 한강 수온:
            <span className={getTemperatureColor(hangangTemp)}>
              {" "}
              {hangangTemp !== null ? `${hangangTemp}°C` : "로딩중..."}
            </span>
          </Link>
        </div>

        {/* 스크롤 가능한 코인 가격 */}
        <div
          ref={scrollContainerRef}
          className="relative flex-1 overflow-x-auto custom-scrollbar select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="inline-block whitespace-nowrap pt-2 min-w-[200%]">
            {krwMarketPrices.map((coin) => (
              <CoinItem key={coin.symbol} coin={coin} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
