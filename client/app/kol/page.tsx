"use client";

import Link from "next/link";
import KOLCard from "@/components/kol/KOLCard";
import KOLCardSkeleton from "@/components/kol/KOLCardSkeleton";
import KOLSortSelect from "@/components/kol/KOLSortSelect";
import KOLSocialFilter from "@/components/kol/KOLSocialFilter";
import { useKOLs } from "@/hooks/useKOLs";

export default function KOLPage() {
  const {
    kols,
    isLoading,
    error,
    sortOption,
    setSortOption,
    socialFilter,
    setSocialFilter,
  } = useKOLs();

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              국내 KOL 목록
            </h1>
            {kols && (
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                마지막 업데이트: {new Date().toLocaleDateString()}
              </p>
            )}
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
            <span role="img" aria-label="info">
              ℹ️
            </span>
            KOL 소개글은 KOL이 직접 작성한 내용이며, 없는 경우 코코아 팀에서
            직접 등록한 경우입니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <KOLSortSelect value={sortOption} onChange={setSortOption} />
          <KOLSocialFilter value={socialFilter} onChange={setSocialFilter} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? [...Array(9)].map((_, i) => <KOLCardSkeleton key={i} />)
            : kols?.map((kol) => <KOLCard key={kol.id} {...kol} />)}
        </div>
      </div>
    </div>
  );
}

