"use client";

import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import { ClientAPICall } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";
import { CoinTalkMessageData, GlobalChatMessageData } from "@/types/chat";
import useChat from "@/store/useChat";
import useAuthStore from "@/store/useAuthStore";

export function useChatRoom(symbol: string) {
  const { getCurrentNickname, setNickname, validateNickname } = useChat();
  const [globalMessages, setGlobalMessages] = useState<GlobalChatMessageData[]>(
    []
  );
  const [coinMessages, setCoinMessages] = useState<CoinTalkMessageData[]>([]);
  const [pendingMessages, setPendingMessages] = useState<Set<number>>(
    new Set()
  );
  const [inputMessage, setInputMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<"global" | "coin">("global");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [newNickname, setNewNickname] = useState(getCurrentNickname());
  const { user } = useAuthStore();

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

  const handleSendMessage = (message: string) => {
    if (!message.trim() || !socket) return;

    const timestamp = Date.now();
    const baseMessageData = {
      message: message.trim(),
      timestamp,
      nickname: getCurrentNickname(),
      userId: user?.id,
    };

    if (selectedChat === "global") {
      const globalMessageData: GlobalChatMessageData = baseMessageData;
      setGlobalMessages((prev) => [globalMessageData, ...prev]);
      setPendingMessages((prev) => new Set(prev).add(timestamp));
      socket.emit("global-chat-message", globalMessageData);
    } else {
      const coinMessageData: CoinTalkMessageData = {
        ...baseMessageData,
        symbol: symbol.split("-")[0],
      };
      setCoinMessages((prev) => [coinMessageData, ...prev]);
      setPendingMessages((prev) => new Set(prev).add(timestamp));
      socket.emit("coin-talk-message", coinMessageData);
    }
  };

  const handleNicknameChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateNickname(newNickname)) {
      setNickname(newNickname);
      setIsNicknameModalOpen(false);
    }
  };

  return {
    globalMessages,
    coinMessages,
    pendingMessages,
    inputMessage,
    selectedChat,
    isNicknameModalOpen,
    newNickname,
    nickname: getCurrentNickname(),
    setInputMessage,
    setSelectedChat,
    setIsNicknameModalOpen,
    setNewNickname,
    handleSendMessage,
    handleNicknameChange,
  };
}
