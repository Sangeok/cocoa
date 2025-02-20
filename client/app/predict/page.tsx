"use client";

import { useEffect, useState } from "react";
import { ClientAPICall } from "@/lib/axios";
import Link from "next/link";
import Image from "next/image";
import { UPBIT_STATIC_IMAGE_URL } from "@/const";
import useMarketsStore from "@/store/useMarketsStore";
import { API_ROUTES } from "@/const/api";
import { formatNumber } from "@/lib/format";
import EventBanner from "@/components/event/EventBanner";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useSwipeable } from "react-swipeable";
import useAuthStore from "@/store/useAuthStore";

interface Ranking {
  userId: number;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  winRate?: number;
  vault: string;
}

interface Rankings {
  mostVault: Ranking[];
  mostWins: Ranking[];
  bestWinRate: Ranking[];
}

const RankingSkeleton = () => (
  <div className="space-y-2">
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg animate-pulse"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    ))}
  </div>
);

export default function PredictPage() {
  const [rankings, setRankings] = useState<Rankings | null>(null);
  const { markets, fetchMarkets, getKoreanName } = useMarketsStore();
  const [currentRankingIndex, setCurrentRankingIndex] = useState(0);
  const { user, isAuthenticated } = useAuthStore();

  const rankingTitles = ["현재 자산", "최다 적중", "최고 승률"];
  const rankingComponents = [
    rankings?.mostVault,
    rankings?.mostWins,
    rankings?.bestWinRate,
  ];

  const handlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handlePrev = () => {
    setCurrentRankingIndex((prev) => (prev === 0 ? 2 : prev - 1));
  };

  const handleNext = () => {
    setCurrentRankingIndex((prev) => (prev === 2 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!markets) {
      fetchMarkets();
    }
  }, [markets, fetchMarkets]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await ClientAPICall.get(
          API_ROUTES.PREDICT.RANKINGS.url
        );
        if (response.data.success) {
          setRankings(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch rankings:", error);
      }
    };

    fetchRankings();
  }, []);

  const bestCoins = ["BTC", "ETH", "XRP", "USDT", "SOL", "BNB", "DOGE", "ADA"];

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🏆";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `${index + 1}`;
    }
  };

  const getRankingContent = (
    rank: Ranking,
    type: "vault" | "wins" | "winRate"
  ) => {
    switch (type) {
      case "vault":
        return (
          <span className="text-green-500">
            ${formatNumber(Number(rank.vault))}
          </span>
        );
      case "wins":
        return (
          <div className="flex gap-2 text-sm">
            <span className="text-green-500">{rank.wins}승</span>
            <span className="text-red-500">{rank.losses}패</span>
            <span className="text-gray-500">{rank.draws}무</span>
          </div>
        );
      case "winRate":
        return (
          <div className="flex gap-2 text-sm">
            <span className="text-blue-500">{rank.winRate?.toFixed(1)}%</span>
            <span className="text-gray-500">
              ({rank.wins}/{rank.wins + rank.losses + rank.draws})
            </span>
          </div>
        );
    }
  };

  const getUserRanking = (rankings: Ranking[] | undefined) => {
    if (!rankings || !isAuthenticated || !user) return null;
    const index = rankings.findIndex((rank) => rank.userId === user.id);
    if (index === -1) return "랭킹 100위권 이하";
    return `${index + 1}위`;
  };

  const getUserRankingContent = (rankings: Ranking[] | undefined) => {
    if (!rankings || !isAuthenticated || !user) return null;
    const userRank = rankings.find((rank) => rank.userId === user.id);
    if (!userRank) return null;
    
    return getRankingContent(
      userRank,
      currentRankingIndex === 0
        ? "vault"
        : currentRankingIndex === 1
        ? "wins"
        : "winRate"
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 flex gap-6 lg:flex-row flex-col">
        <EventBanner />
        <div className="lg:w-2/3 w-full" {...handlers}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {rankingTitles[currentRankingIndex]}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
            {isAuthenticated && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <span role="img" aria-label="user">👤</span>
                      <span>나의 순위</span>
                    </div>
                    <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                      {getUserRanking(rankingComponents[currentRankingIndex])}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {getUserRankingContent(rankingComponents[currentRankingIndex])}
                  </div>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <div className="p-4">
                {rankings ? (
                  <div className="space-y-2 min-w-[600px]">
                    {rankingComponents[currentRankingIndex]?.slice(0, 10).map(
                      (rank, index) => (
                        <div
                          key={rank.userId}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 text-center font-medium">
                              {getRankIcon(index)}
                            </div>
                            <div>{rank.name}</div>
                          </div>
                          <div className="text-sm">
                            {getRankingContent(
                              rank,
                              currentRankingIndex === 0
                                ? "vault"
                                : currentRankingIndex === 1
                                ? "wins"
                                : "winRate"
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <RankingSkeleton />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">인기 마켓</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {bestCoins.map((symbol) => (
            <Link
              key={symbol}
              href={`/coin/${symbol}-KRW`}
              className="bg-white dark:bg-gray-950 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 
                hover:shadow-md hover:scale-105 hover:border-green-500 dark:hover:border-green-500
                transition-all duration-200 ease-in-out
                flex items-center gap-2"
            >
              <Image
                src={`${UPBIT_STATIC_IMAGE_URL}/${symbol}.png`}
                alt={symbol}
                width={24}
                height={24}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              <div>
                <div className="font-medium">
                  {getKoreanName(symbol + "-KRW")}
                </div>
                <div className="text-sm text-gray-500">{symbol}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
