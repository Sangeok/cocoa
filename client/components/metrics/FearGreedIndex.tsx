"use client";

import { useEffect, useState } from "react";
import { globalMetricAPI } from "@/lib/api/globalMetric";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
export default function FearGreedIndex() {
  const [data, setData] = useState<{
    value: number;
    value_classification: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await globalMetricAPI.getFearGreedIndex();
        if (response) {
          setData(response);
        }
      } catch (error) {
        console.error("Failed to fetch fear & greed index:", error);
      }
    };

    fetchData();
  }, []);

  if (!data) return null;

  // 값을 180도 기준으로 반전 (0이 오른쪽, 100이 왼쪽이 되도록)
  const angle = ((100 - data.value) / 100) * Math.PI;

  return (
    <Link
      href="https://coinmarketcap.com/charts/"
      target="_blank"
      className="sm:aspect-square bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2 sm:p-4 flex flex-col justify-between 
      transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">공포 & 탐욕</h2>
        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex flex-col items-center sm:mb-5">
        <div className="relative w-56">
          {/* 반원형 세그먼트들 */}
          <svg className="w-full h-40" viewBox="0 0 140 70">
            <path
              d="M10,70 A60,60 0 0,1 40,21"
              fill="none"
              stroke="#EF4444"
              strokeWidth="6"
            />
            <path
              d="M40,21 A60,60 0 0,1 70,14"
              fill="none"
              stroke="#F97316"
              strokeWidth="6"
            />
            <path
              d="M70,14 A60,60 0 0,1 100,21"
              fill="none"
              stroke="#EAB308"
              strokeWidth="6"
            />
            <path
              d="M100,21 A60,60 0 0,1 130,70"
              fill="none"
              stroke="#84CC16"
              strokeWidth="6"
            />

            {/* 검은 점 (현재 값 표시) */}
            <circle
              cx={71 + 60 * Math.cos((Math.PI * (1 - data.value / 100)))}
              cy={71 - 60 * Math.sin((Math.PI * (1 - data.value / 100)))}
              r="7"
              fill="black"
              className="dark:invert"
            />
          </svg>
          {/* 지표 값 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-16">
            <span className="text-4xl font-bold">{data.value}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {data.value_classification === "Fear"
                ? "공포"
                : data.value_classification === "Extreme Fear"
                ? "극도의 공포"
                : data.value_classification === "Greed"
                ? "탐욕"
                : data.value_classification === "Extreme Greed"
                ? "극도의 탐욕"
                : "중립"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
