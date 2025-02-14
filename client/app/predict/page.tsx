"use client";

import { useEffect, useState } from "react";
import { ClientAPICall } from "@/lib/axios";
import useMarketStore from "@/store/useMarketStore";
import Link from "next/link";
import Image from "next/image";
import { UPBIT_STATIC_IMAGE_URL } from "@/const";
import useMarketsStore from "@/store/useMarketsStore";
import { API_ROUTES } from "@/const/api";
import { formatNumber } from "@/lib/format";

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
    {[...Array(5)].map((_, i) => (
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
  const { coins } = useMarketStore();
  const { markets, fetchMarkets, getKoreanName } = useMarketsStore();

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Rankings Section */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Most Vault Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">총 자산</h2>
            <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="p-4">
                {rankings ? (
                  <div className="space-y-2">
                    {rankings.mostVault.map((rank, index) => (
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
                          <span className="text-green-500">
                            ${formatNumber(Number(rank.vault))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <RankingSkeleton />
                )}
              </div>
            </div>
          </div>

          {/* Most Wins Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">최다 적중</h2>
            <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="p-4">
                {rankings ? (
                  <div className="space-y-2">
                    {rankings.mostWins.map((rank, index) => (
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
                          <span className="text-green-500">{rank.wins}승</span>
                          <span className="mx-1">/</span>
                          <span className="text-red-500">{rank.losses}패</span>
                          <span className="mx-1">/</span>
                          <span className="text-gray-500">{rank.draws}무</span>
                          <span className="ml-2 text-gray-500">
                            {(
                              (rank.wins /
                                (rank.wins + rank.losses + rank.draws)) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <RankingSkeleton />
                )}
              </div>
            </div>
          </div>

          {/* Best Win Rate Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">최고 승률</h2>
            <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="p-4">
                {rankings ? (
                  <div className="space-y-2">
                    {rankings.bestWinRate.map((rank, index) => (
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
                          <span className="text-green-500">{rank.wins}승</span>
                          <span className="mx-1">/</span>
                          <span className="text-red-500">{rank.losses}패</span>
                          <span className="mx-1">/</span>
                          <span className="text-gray-500">{rank.draws}무</span>
                          <span className="ml-2 text-gray-500">
                            {rank.winRate?.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
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
