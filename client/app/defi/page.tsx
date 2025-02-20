"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientAPICall } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";
import { Yield, PaginatedYields } from "@/types/yield";
import { useDebounce } from "@/hooks/useDebounce";
import { GuideCards } from "@/components/guide/GuideCards";

const TableSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
    <table className="min-w-full">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          {[...Array(7)].map((_, i) => (
            <th key={i} className="px-6 py-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, i) => (
          <tr key={i} className="border-b border-gray-200 dark:border-gray-800">
            {[...Array(7)].map((_, j) => (
              <td key={j} className="px-6 py-4">
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const getApyColor = (apy: number | null) => {
  if (!apy) return "text-gray-500 dark:text-gray-400";
  if (apy >= 1) return "text-green-600 dark:text-green-400 font-medium";
  return "text-gray-500 dark:text-gray-400";
};

const getChangeColor = (change: number | null) => {
  if (!change) return "";
  return change > 0
    ? "text-green-600 dark:text-green-400 font-medium"
    : "text-red-600 dark:text-red-400 font-medium";
};

export default function DeFiPage() {
  const router = useRouter();
  const [yields, setYields] = useState<Yield[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState<"tvl" | "apy" | "daily" | "weekly">(
    "tvl"
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [totalItems, setTotalItems] = useState(0);

  const fetchYields = async (page: number) => {
    setLoading(true);
    try {
      const response = await ClientAPICall.get<PaginatedYields>(
        API_ROUTES.YIELDS.GET.url,
        {
          params: {
            page,
            size: pageSize,
            sortBy,
            order,
            search: debouncedSearch,
          },
        }
      );
      setYields(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.total);
      setError(null);
    } catch (err) {
      setError("Failed to fetch yield data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // 검색어 변경시 첫 페이지로 리셋
    fetchYields(1);
  }, [debouncedSearch, sortBy, order]);

  useEffect(() => {
    fetchYields(currentPage);
  }, [currentPage]);

  const handleSort = (field: "tvl" | "apy" | "daily" | "weekly") => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
          DeFi 수익률
        </h1>

        {/* Search Input */}
        <div className="mb-6">
          <div className="w-full h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        <TableSkeleton />
      </div>
    );
  }

  if (error)
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        Error: {error}
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
        DeFi 수익률
      </h1>

      {/* Guide Links */}
      <div className="mb-8">
        <GuideCards />
      </div>

      {/* Info Text */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        총{" "}
        <span className="font-bold text-gray-900 dark:text-white">
          {totalItems.toLocaleString()}
        </span>
        개의 디파이 상품의 TVL, APY, 가격 변동을 제공합니다.
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="프로젝트, 체인, 심볼로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Chain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Symbol
              </th>
              <th
                onClick={() => handleSort("tvl")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                TVL (USD) {sortBy === "tvl" && (order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("apy")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                APY {sortBy === "apy" && (order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("daily")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Daily Change{" "}
                {sortBy === "daily" && (order === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("weekly")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Weekly Change{" "}
                {sortBy === "weekly" && (order === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {yields.map((yieldData) => (
              <tr
                key={`${yieldData.chain}-${yieldData.project}-${yieldData.pool}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td
                  onClick={() => router.push(`/defi/${yieldData.project}`)}
                  className="px-6 py-4 capitalize font-medium whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {yieldData.project}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {yieldData.chain}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {yieldData.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  ${Number(yieldData.tvlUsd).toLocaleString()}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${getApyColor(
                    Number(yieldData.apy)
                  )}`}
                >
                  {yieldData.apy
                    ? `${Number(yieldData.apy).toFixed(2)}%`
                    : "N/A"}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${getChangeColor(
                    Number(yieldData.apyPct1D)
                  )}`}
                >
                  {yieldData.apyPct1D
                    ? `${Number(yieldData.apyPct1D).toFixed(2)}%`
                    : "N/A"}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${getChangeColor(
                    Number(yieldData.apyPct7D)
                  )}`}
                >
                  {yieldData.apyPct7D
                    ? `${Number(yieldData.apyPct7D).toFixed(2)}%`
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-2 mt-6">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                   text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          이전
        </button>
        <span className="text-gray-700 dark:text-gray-300">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md
                   text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          다음
        </button>
      </div>
    </div>
  );
}
