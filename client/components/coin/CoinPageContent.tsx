"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
import StockDiscussion from "./StockDiscussion";

export default function CoinPageContent({ symbol }: { symbol: string }) {
  const { markets, fetchMarkets, getKoreanName } = useMarketsStore();
  const { coins } = useMarketStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
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

  // URL 파라미터에 따른 탭 전환
  useEffect(() => {
    const tab = searchParams.get('tab');
    switch (tab) {
      case 'chart':
        setSelectedTab(0);
        break;
      case 'info':
        setSelectedTab(1);
        break;
      case 'community':
        setSelectedTab(2);
        break;
      default:
        // 기본값은 차트 탭
        if (tab !== null) {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set('tab', 'chart');
          router.replace(`${pathname}?${newSearchParams.toString()}`);
        }
        setSelectedTab(0);
    }
  }, [searchParams, pathname, router]);

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (index: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    switch (index) {
      case 0:
        newSearchParams.set('tab', 'chart');
        break;
      case 1:
        newSearchParams.set('tab', 'info');
        break;
      case 2:
        newSearchParams.set('tab', 'community');
        break;
    }
    router.replace(`${pathname}?${newSearchParams.toString()}`);
    setSelectedTab(index);
  };

  // 토론글 ID로 스크롤
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#stock-discussion-')) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // 컴포넌트 렌더링 후 스크롤하기 위해 약간의 딜레이 추가
    }
  }, [selectedTab]); // selectedTab이 변경될 때마다 체크

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
            <ChatRoom symbol={symbol} symbolKoreanName={koreanName} />
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
      <CoinHeader symbol={symbol} koreanName={koreanName} coins={coins} />
      <CoinTabs
        selectedTab={selectedTab}
        onChange={handleTabChange}
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
