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
import CoinTabs from "@/components/coin/CoinTabs";
import StockDiscussion from './StockDiscussion';

export default function CoinPageContent({ symbol }: { symbol: string }) {
  const { markets, fetchMarkets, getKoreanName } = useMarketsStore();
  const { coins } = useMarketStore();
  const [selectedTab, setSelectedTab] = useState(0);
  
  const {
    isNicknameModalOpen,
    newNickname,
    setIsNicknameModalOpen,
    setNewNickname,
    handleNicknameChange,
    hasNewMessage,
    messageType,
  } = useChatRoom(symbol, selectedTab);

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

  const renderLeftContent = () => {
    switch (selectedTab) {
      case 0: // 차트・호가
        return (
          <div className="bg-black rounded-lg overflow-hidden">
            <TradingViewWidget symbol={formattedSymbol} />
          </div>
        );
      case 1: // 종목정보
        return <MarketData symbol={symbol} coins={coins} />;
      case 2: // 커뮤니티
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StockDiscussion symbol={symbol} symbolKoreanName={koreanName} />
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <ChatRoom symbol={symbol} symbolKoreanName={koreanName} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!mounted || !isInitialized || isMarketLoading) {
    return <CoinPageSkeleton />;
  }

  if (isInitialized && !isMarketLoading && !coins[symbol]) {
    return <CoinPageSkeleton />;
  }

  return (
    <div className="w-full max-w-[2000px] mx-auto px-4 py-4">
      <CoinHeader 
        symbol={symbol} 
        koreanName={koreanName} 
        coins={coins}
      />
      <CoinTabs 
        selectedTab={selectedTab} 
        onChange={setSelectedTab}
        hasNewMessage={hasNewMessage}
        messageType={messageType}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">{renderLeftContent()}</div>

        <div className="space-y-4">
          <PricePrediction symbol={symbol} coins={coins} />
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
