"use client";

import { useEffect, useState } from "react";
import { ClientAPICall } from "@/lib/axios";
import useMarketStore from "@/store/useMarketStore";
import Link from "next/link";
import Image from "next/image";
import { UPBIT_STATIC_IMAGE_URL } from "@/const";
import useMarketsStore from "@/store/useMarketsStore";
import { API_ROUTES } from "@/const/api";
interface Ranking {
  userId: number;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  winRate?: number;
}

interface Rankings {
  mostWins: Ranking[];
  bestWinRate: Ranking[];
}

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

  const supportedCoins = coins ? Object.keys(coins) : [];

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Most Wins Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">최다 적중</h2>
            <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="p-4">
                <div className="space-y-2">
                  {rankings?.mostWins.map((rank, index) => (
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
              </div>
            </div>
          </div>
          {/* Best Win Rate Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">최고 승률</h2>
            <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="p-4">
                <div className="space-y-2">
                  {rankings?.bestWinRate.map((rank, index) => (
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Coins Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">지원 마켓</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {supportedCoins.map((symbol) => (
            <Link
              key={symbol}
              href={`/coin/${symbol}`}
              className="bg-white dark:bg-gray-950 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 
                hover:shadow-md transition-shadow flex items-center gap-2"
            >
              <Image
                src={`${UPBIT_STATIC_IMAGE_URL}/${symbol.split("-")[0]}.png`}
                alt={symbol}
                width={24}
                height={24}
              />
              <div>
                <div className="font-medium">{getKoreanName(symbol)}</div>
                <div className="text-sm text-gray-500">{symbol}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
