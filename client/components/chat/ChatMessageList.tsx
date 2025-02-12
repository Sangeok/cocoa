import { CoinTalkMessageData, GlobalChatMessageData } from "@/types/chat";
import ChatMessage from "./ChatMessage";
import { useRef, useEffect } from "react";

interface ChatMessageListProps {
  messages: (CoinTalkMessageData | GlobalChatMessageData)[];
  nickname: string;
  pendingMessages: Set<number>;
}

export default function ChatMessageList({ messages, nickname, pendingMessages }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-2 flex flex-col-reverse h-64">
      <div ref={messagesEndRef} />
      {messages.map((msg, i) => (
        <ChatMessage
          key={msg.timestamp + i}
          message={msg.message}
          nickname={msg.nickname}
          timestamp={msg.timestamp}
          userId={msg.userId}
          isPending={pendingMessages.has(msg.timestamp)}
          isMyMessage={msg.nickname === nickname}
        />
      ))}
    </div>
  );
} 