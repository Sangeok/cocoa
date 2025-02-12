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
import { apiClient } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";
import { formatKRWWithUnit, formatPercent } from "@/lib/format";
import ChatRoom from "@/components/chat/ChatRoom";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedChat, setSelectedChat] = useState<"global" | "coin">("global");
  const baseSymbol = symbol.split("-")[0]; // BTC-KRW -> BTC
  const [pendingMessages, setPendingMessages] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    if (!markets) {
      fetchMarkets();
    }
  }, [markets, fetchMarkets]);

  useEffect(() => {
    // 초기 메시지 로드
    apiClient
      .get(API_ROUTES.CHAT.GET.url + `/${symbol}`)
      .then((res) => {
        console.log("Initial coin messages:", res.data);
        setCoinMessages(res.data);
      })
      .catch((error) => {
        console.error("Failed to fetch coin messages:", error);
      });

    // 전체 채팅 메시지 로드
    apiClient
      .get(API_ROUTES.CHAT.GET_GLOBAL.url)
      .then((res) => {
        console.log("Initial global messages:", res.data);
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
          const exists = prev.some(msg => msg.timestamp === message.timestamp);
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
        const exists = prev.some(msg => msg.timestamp === message.timestamp);
        if (exists) return prev;
        return [message, ...prev];
      });
    });

    return () => {
      socket.off("coin-talk-message");
      socket.off("global-chat-message");
    };
  }, [symbol]);

  // 새 메시지가 올 때마다 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coinMessages, globalMessages]);

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

  const renderMessage = (
    msg: CoinTalkMessageData | GlobalChatMessageData,
    i: number
  ) => {
    const isPending = pendingMessages.has(msg.timestamp);

    return (
      <div
        key={msg.timestamp + i}
        className={`flex ${
          msg.nickname === nickname ? "justify-end" : "justify-start"
        } mb-3`}
      >
        <div
          className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
            msg.nickname === nickname
              ? `${isPending ? "opacity-50" : ""} bg-blue-50 dark:bg-blue-900 
                 text-blue-900 dark:text-blue-50 border border-blue-200 
                 dark:border-blue-800`
              : "bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 border border-gray-200 dark:border-gray-800"
          }`}
        >
          <div className="text-xs opacity-75 mb-1 flex items-center gap-2">
            {msg.nickname}
            {isPending && (
              <span className="text-xs text-gray-500">전송중...</span>
            )}
          </div>
          <div className="break-words text-sm">{msg.message}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
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

      {/* 데스크탑: 수평 정렬, 모바일: 수직 정렬 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* TradingView */}
        <div className="flex-1 bg-black rounded-lg shadow-lg overflow-hidden">
          <TradingViewWidget symbol={formattedSymbol} />
        </div>

        {/* 채팅 & 시장 데이터 */}
        <div className="lg:w-96">
          {/* 시장 데이터 */}
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
          {/* 채팅 영역 */}
          <div className="mt-8">
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
