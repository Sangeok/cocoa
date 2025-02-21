"use client";

import { useEffect, useState } from "react";
import TradingViewWidget from "@/components/chart/TradingViewWidget";
import useMarketsStore from "@/store/useMarketsStore";
import useMarketStore from "@/store/useMarketStore";
import ChatRoom from "@/components/chat/ChatRoom";
import CoinPageSkeleton from "@/components/skeleton/CoinPageSkeleton";
import CoinHeader from "@/components/coin/CoinHeader";
import MarketData from "@/components/coin/MarketData";
import PricePrediction from "@/components/coin/PricePrediction";
import NicknameModal from "@/components/coin/NicknameModal";
import { useChatRoom } from "@/hooks/useChat";

export default function CoinPageContent({ symbol }: { symbol: string }) {
  const { markets, fetchMarkets, getKoreanName } = useMarketsStore();
  const { coins } = useMarketStore();
  const {
    isNicknameModalOpen,
    newNickname,
    setIsNicknameModalOpen,
    setNewNickname,
    handleNicknameChange,
  } = useChatRoom(symbol);

  const [isMarketLoading, setIsMarketLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (!markets) {
          await fetchMarkets();
        }
        setIsInitialized(true);
        setIsMarketLoading(false);
      } catch (error) {
        console.error("Failed to initialize data:", error);
        setIsMarketLoading(false);
      }
    };

    initializeData();
  }, [markets, fetchMarkets]);

  const koreanName = getKoreanName(symbol);
  const formattedSymbol = symbol.replace("-", "");

  if (!mounted || !isInitialized || isMarketLoading) {
    return <CoinPageSkeleton />;
  }

  if (isInitialized && !isMarketLoading && !coins[symbol]) {
    return <CoinPageSkeleton />;
  }

  return (
    <div className="w-full px-4 py-4">
      <CoinHeader symbol={symbol} koreanName={koreanName} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-black rounded-lg shadow-lg overflow-hidden">
            <TradingViewWidget symbol={formattedSymbol} />
          </div>
          <MarketData symbol={symbol} coins={coins} />
        </div>

        <div className="space-y-4">
          <PricePrediction symbol={symbol} coins={coins} />
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
            <ChatRoom symbol={symbol} symbolKoreanName={koreanName} />
          </div>
        </div>
      </div>

      <NicknameModal
        isOpen={isNicknameModalOpen}
        onClose={() => setIsNicknameModalOpen(false)}
        nickname={newNickname}
        onChangeNickname={(e) => setNewNickname(e.target.value)}
        onSubmit={handleNicknameChange}
      />
    </div>
  );
}
