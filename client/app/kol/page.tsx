"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import KOLCard from "@/components/KOLCard";
import type { KOL, KOLData } from "@/types/kol";

export default function KOLPage() {
  const [data, setData] = useState<KOLData | null>(null);

  useEffect(() => {
    fetch('/kols/telegram.json')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              국내 KOL 목록
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              마지막 업데이트: {new Date(data.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <Link
            href="https://docs.google.com/forms/d/e/1FAIpQLSe7xA2Zu4VCVcDDw5BB1O-TDf97xTMlLinKGn6qW9sQw7zadw/viewform?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            KOL 등록 신청
          </Link>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <span role="img" aria-label="info">ℹ️</span>
            KOL 소개글은 KOL이 직접 작성한 내용이며, 없는 경우 코코아 팀에서 직접 등록한 경우입니다.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.list.map((kol) => (
            <KOLCard key={kol.name} {...kol} />
          ))}
        </div>
      </div>
    </div>
  );
}
