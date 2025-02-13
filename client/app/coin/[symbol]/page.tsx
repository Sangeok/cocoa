"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import TradingViewWidget from "@/components/chart/TradingViewWidget";
import useMarketsStore from "@/store/useMarketsStore";
import useMarketStore from "@/store/useMarketStore";
import useChat from "@/store/useChat";
import { socket } from "@/lib/socket";
import { CoinTalkMessageData, GlobalChatMessageData } from "@/types/chat";
import Image from "next/image";
import { UPBIT_STATIC_IMAGE_URL } from "@/const";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ClientAPICall } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";
import { formatKRWWithUnit, formatPercent, formatKRW } from "@/lib/format";
import ChatRoom from "@/components/chat/ChatRoom";
import { usePredict } from "@/hooks/usePredict";
import clsx from "clsx";
import Link from "next/link";
import useAuthStore from "@/store/useAuthStore";
import {
  getMarketType,
  getPriorityExchanges,
  formatPriceByMarket,
} from "@/lib/market";
import CoinPageSkeleton from "@/components/skeleton/CoinPageSkeleton";

export default function CoinPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const { markets, fetchMarkets, getKoreanName } = useMarketsStore();
  const { coins } = useMarketStore();
  const { nickname, setNickname, validateNickname } = useChat();
  const [globalMessages, setGlobalMessages] = useState<GlobalChatMessageData[]>(
    []
  );
  const [coinMessages, setCoinMessages] = useState<CoinTalkMessageData[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [newNickname, setNewNickname] = useState(nickname);
  const [selectedChat, setSelectedChat] = useState<"global" | "coin">("global");
  const baseSymbol = symbol.split("-")[0]; // BTC-KRW -> BTC
  const [pendingMessages, setPendingMessages] = useState<Set<number>>(
    new Set()
  );
  const {
    activePredict,
    isLoading,
    error,
    canPredict,
    startPredict,
    remainingTime,
    stats,
    fetchStats,
  } = usePredict();
  const [selectedDuration, setSelectedDuration] = useState<30 | 180>(30);

  const marketType = getMarketType(symbol);
  const priorityExchanges = getPriorityExchanges(marketType);

  // Get current price from priority exchanges
  const getCurrentPrice = (): { price: number; exchange: string } => {
    if (!coins || !symbol) {
      return { price: 0, exchange: priorityExchanges[0] };
    }

    for (const exchange of priorityExchanges) {
      const coinData = coins[symbol];
      if (!coinData) {
        return { price: 0, exchange: priorityExchanges[0] };
      }

      const exchangeData = coinData[exchange as keyof typeof coinData];
      if (exchangeData?.price) {
        return { price: exchangeData.price, exchange };
      }
    }
    return { price: 0, exchange: priorityExchanges[0] };
  };

  // 데이터 로딩 상태 추가
  const [isMarketLoading, setIsMarketLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (!markets) {
          await fetchMarkets();
        }
        setIsMarketLoading(false);
      } catch (error) {
        console.error("Failed to initialize data:", error);
        setIsMarketLoading(false);
      }
    };

    initializeData();
  }, [markets, fetchMarkets]);

  // 로딩 중이거나 필수 데이터가 없는 경우 스켈레톤 UI 표시
  if (isMarketLoading || !markets || !symbol) {
    return <CoinPageSkeleton />;
  }

  // 유효하지 않은 심볼인 경우 에러 UI 표시
  if (!coins[symbol]) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">존재하지 않는 마켓입니다.</div>
      </div>
    );
  }

  const { price: currentPrice, exchange: currentExchange } = getCurrentPrice();

  // Calculate price change percentage
  const getPriceChangePercent = (currentPrice: number, entryPrice: number) => {
    if (!entryPrice) return 0;
    return ((currentPrice - entryPrice) / entryPrice) * 100;
  };

  const handlePredict = async (position: "L" | "S", duration: 30 | 180) => {
    try {
      await startPredict(symbol, currentExchange, position, duration);
    } catch (error) {
      console.error("Failed to start prediction:", error);
    }
  };

  // Fetch stats when component mounts
  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated) {
      fetchStats();
    }
  }, [fetchStats]);

  // Calculate win rate
  const winRate = stats
    ? (stats.wins / (stats.wins + stats.losses + stats.draws)) * 100
    : 0;

  useEffect(() => {
    // 초기 메시지 로드
    ClientAPICall.get(API_ROUTES.CHAT.GET.url + `/${symbol}`)
      .then((res) => {
        setCoinMessages(res.data);
      })
      .catch((error) => {
        console.error("Failed to fetch coin messages:", error);
      });

    // 전체 채팅 메시지 로드
    ClientAPICall.get(API_ROUTES.CHAT.GET_GLOBAL.url)
      .then((res) => {
        setGlobalMessages(res.data);
      })
      .catch((error) => {
        console.error("Failed to fetch global messages:", error);
      });

    // 새 메시지 수신
    socket.on("coin-talk-message", (message: CoinTalkMessageData) => {
      if (message.symbol === symbol.split("-")[0]) {
        setPendingMessages((prev) => {
          const newPending = new Set(prev);
          newPending.delete(message.timestamp);
          return newPending;
        });
        setCoinMessages((prev) => {
          const exists = prev.some(
            (msg) => msg.timestamp === message.timestamp
          );
          if (exists) return prev;
          return [message, ...prev];
        });
      }
    });

    socket.on("global-chat-message", (message: GlobalChatMessageData) => {
      setPendingMessages((prev) => {
        const newPending = new Set(prev);
        newPending.delete(message.timestamp);
        return newPending;
      });
      setGlobalMessages((prev) => {
        const exists = prev.some((msg) => msg.timestamp === message.timestamp);
        if (exists) return prev;
        return [message, ...prev];
      });
    });

    return () => {
      socket.off("coin-talk-message");
      socket.off("global-chat-message");
    };
  }, [symbol]);

  const handleNicknameChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateNickname(newNickname)) {
      setNickname(newNickname);
      setIsNicknameModalOpen(false);
    }
  };

  const koreanName = getKoreanName(symbol);
  const formattedSymbol = symbol.replace("-", "");

  const handleSendMessage = (message: string) => {
    if (!message.trim() || !socket) return;

    const timestamp = Date.now();
    const baseMessageData = {
      message: message.trim(),
      timestamp,
      nickname,
    };

    if (selectedChat === "global") {
      const globalMessageData: GlobalChatMessageData = baseMessageData;
      setGlobalMessages((prev) => [globalMessageData, ...prev]);
      setPendingMessages((prev) => new Set(prev).add(timestamp));

      console.log("Sending global message:", globalMessageData);
      socket.emit("global-chat-message", globalMessageData);
    } else {
      const coinMessageData: CoinTalkMessageData = {
        ...baseMessageData,
        symbol: baseSymbol,
      };
      setCoinMessages((prev) => [coinMessageData, ...prev]);
      setPendingMessages((prev) => new Set(prev).add(timestamp));

      console.log("Sending coin message:", coinMessageData);
      socket.emit("coin-talk-message", coinMessageData);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Image
            src={`${UPBIT_STATIC_IMAGE_URL}/${symbol.split("-")[0]}.png`}
            alt={symbol.split("-")[0]}
            width={20}
            height={20}
          />
          {koreanName}({symbol.split("-")[0]})
        </h1>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* TradingView */}
          <div className="bg-black rounded-lg shadow-lg overflow-hidden">
            <TradingViewWidget symbol={formattedSymbol} />
          </div>

          {/* Market Data */}
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                실시간 시장 데이터
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {/* 거래량 */}
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  거래량
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {coins?.[symbol]?.upbit?.volume && (
                    <div className="flex items-center gap-2">
                      <Image
                        src="/exchanges/upbit.svg"
                        alt="Upbit"
                        width={16}
                        height={16}
                        className="opacity-75"
                      />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Upbit
                        </div>
                        <div className="text-sm font-semibold">
                          {formatKRWWithUnit(coins[symbol].upbit.volume)}
                        </div>
                      </div>
                    </div>
                  )}
                  {coins?.[symbol]?.binance?.volume && (
                    <div className="flex items-center gap-2">
                      <Image
                        src="/exchanges/binance.svg"
                        alt="Binance"
                        width={16}
                        height={16}
                        className="opacity-75"
                      />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Binance
                        </div>
                        <div className="text-sm font-semibold">
                          {formatKRWWithUnit(coins[symbol].binance.volume)}
                        </div>
                      </div>
                    </div>
                  )}
                  {coins?.[symbol]?.bithumb?.volume && (
                    <div className="flex items-center gap-2">
                      <Image
                        src="/exchanges/bithumb.svg"
                        alt="Bithumb"
                        width={16}
                        height={16}
                        className="opacity-75"
                      />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Bithumb
                        </div>
                        <div className="text-sm font-semibold">
                          {formatKRWWithUnit(coins[symbol].bithumb.volume)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 현재가 */}
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  현재가
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {coins?.[symbol]?.upbit?.price && (
                    <div className="flex items-center gap-2">
                      <Image
                        src="/exchanges/upbit.svg"
                        alt="Upbit"
                        width={16}
                        height={16}
                        className="opacity-75"
                      />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Upbit
                        </div>
                        <div className="text-sm font-semibold">
                          {formatKRWWithUnit(coins[symbol].upbit.price)}
                        </div>
                      </div>
                    </div>
                  )}
                  {coins?.[symbol]?.binance?.price && (
                    <div className="flex items-center gap-2">
                      <Image
                        src="/exchanges/binance.svg"
                        alt="Binance"
                        width={16}
                        height={16}
                        className="opacity-75"
                      />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Binance
                        </div>
                        <div className="text-sm font-semibold">
                          {formatKRWWithUnit(coins[symbol].binance.price)}
                        </div>
                      </div>
                    </div>
                  )}
                  {coins?.[symbol]?.bithumb?.price && (
                    <div className="flex items-center gap-2">
                      <Image
                        src="/exchanges/bithumb.svg"
                        alt="Bithumb"
                        width={16}
                        height={16}
                        className="opacity-75"
                      />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Bithumb
                        </div>
                        <div className="text-sm font-semibold">
                          {formatKRWWithUnit(coins[symbol].bithumb.price)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* 24시간 변동 */}
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  전일 대비 가격(%)
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {coins?.[symbol]?.upbit?.change24h !== undefined && (
                    <div className="flex items-center gap-2">
                      <Image
                        src="/exchanges/upbit.svg"
                        alt="Upbit"
                        width={16}
                        height={16}
                        className="opacity-75"
                      />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Upbit
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            coins[symbol].upbit.change24h >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {formatPercent(coins[symbol].upbit.change24h)}
                        </div>
                      </div>
                    </div>
                  )}
                  {coins?.[symbol]?.binance?.change24h !== undefined && (
                    <div className="flex items-center gap-2">
                      <Image
                        src="/exchanges/binance.svg"
                        alt="Binance"
                        width={16}
                        height={16}
                        className="opacity-75"
                      />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Binance
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            coins[symbol].binance.change24h >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {formatPercent(coins[symbol].binance.change24h)}
                        </div>
                      </div>
                    </div>
                  )}
                  {coins?.[symbol]?.bithumb?.change24h !== undefined && (
                    <div className="flex items-center gap-2">
                      <Image
                        src="/exchanges/bithumb.svg"
                        alt="Bithumb"
                        width={16}
                        height={16}
                        className="opacity-75"
                      />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Bithumb
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            coins[symbol].bithumb.change24h >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {formatPercent(coins[symbol].bithumb.change24h)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-4">
          {/* Price Prediction */}
          <div className="relative bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
            {/* Login Overlay */}
            {!useAuthStore.getState().isAuthenticated && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Link
                  href="/signin"
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                >
                  로그인하고 가격 예측하기
                </Link>
              </div>
            )}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                가격 예측
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                가격이 오를지 내릴지 예측하고 승률을 높여보세요
              </p>
            </div>
            <div className="p-4">
              {error && (
                <div className="mb-4 text-sm text-red-500">{error}</div>
              )}

              {/* Stats Display */}
              {stats && (
                <div className="mb-4 flex items-center justify-between text-sm">
                  <div className="flex gap-2">
                    <span className="text-green-500">{stats.wins}승</span>
                    <span className="text-red-500">{stats.losses}패</span>
                    <span className="text-gray-500">{stats.draws}무</span>
                  </div>
                  <div className="text-gray-500">
                    승률: {isNaN(winRate) ? 0 : winRate.toFixed(1)}%
                  </div>
                </div>
              )}

              {/* Duration Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="flex gap-4" aria-label="Tabs">
                  <button
                    onClick={() => setSelectedDuration(30)}
                    className={clsx(
                      "px-1 py-2 text-sm font-medium border-b-2 transition-colors",
                      selectedDuration === 30
                        ? "border-green-500 text-green-500"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    30초 예측
                  </button>
                  <button
                    onClick={() => setSelectedDuration(180)}
                    className={clsx(
                      "px-1 py-2 text-sm font-medium border-b-2 transition-colors",
                      selectedDuration === 180
                        ? "border-green-500 text-green-500"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    3분 예측
                  </button>
                </nav>
              </div>

              {/* Current Price Display */}
              <div className="my-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  현재 가격 ({currentExchange.toUpperCase()})
                </div>
                <div className="text-2xl font-bold">
                  {formatPriceByMarket(currentPrice, marketType)}
                </div>
                {activePredict && (
                  <div className="space-y-2 mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      진입 가격:{" "}
                      {formatPriceByMarket(activePredict.price, marketType)}
                    </div>
                    <div
                      className={clsx(
                        "text-sm font-semibold",
                        currentPrice > activePredict.price
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {formatPercent(
                        getPriceChangePercent(
                          currentPrice,
                          activePredict.price
                        ),
                        5
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {activePredict.position === "L"
                          ? "롱 포지션"
                          : "숏 포지션"}
                      </div>
                      <div className="text-sm font-medium">
                        {Math.ceil(remainingTime / 1000)}초 남음
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Position Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handlePredict("L", selectedDuration)}
                  disabled={!canPredict || isLoading}
                  className={clsx(
                    "px-4 py-3 rounded-lg font-semibold text-white transition-colors",
                    "bg-green-500",
                    canPredict
                      ? "hover:bg-green-600"
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  롱 (Long)
                </button>
                <button
                  onClick={() => handlePredict("S", selectedDuration)}
                  disabled={!canPredict || isLoading}
                  className={clsx(
                    "px-4 py-3 rounded-lg font-semibold text-white transition-colors",
                    "bg-red-500",
                    canPredict
                      ? "hover:bg-red-600"
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  숏 (Short)
                </button>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
            <ChatRoom
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              globalMessages={globalMessages}
              coinMessages={coinMessages}
              nickname={nickname}
              symbolKoreanName={koreanName}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              onSendMessage={handleSendMessage}
              onEditNickname={() => setIsNicknameModalOpen(true)}
              pendingMessages={pendingMessages}
            />
          </div>
        </div>
      </div>

      {/* 닉네임 수정 모달 */}
      <Transition appear show={isNicknameModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsNicknameModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className="w-full max-w-md transform overflow-hidden rounded-xl 
                                      bg-white dark:bg-gray-950 p-6 text-left align-middle shadow-xl transition-all"
                >
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    닉네임 변경
                  </Dialog.Title>
                  <form onSubmit={handleNicknameChange} className="mt-4">
                    <input
                      type="text"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 
                               border border-gray-300 dark:border-gray-700
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               text-gray-900 dark:text-white"
                      maxLength={10}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      2-10자 이내로 입력해주세요
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsNicknameModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                                 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 
                                 hover:bg-green-700 rounded-lg"
                      >
                        변경
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
