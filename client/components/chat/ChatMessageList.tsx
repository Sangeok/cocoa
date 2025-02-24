import { CoinTalkMessageData, GlobalChatMessageData } from "@/types/chat";
import ChatMessage from "./ChatMessage";

interface ChatMessageListProps {
  messages: (CoinTalkMessageData | GlobalChatMessageData)[];
  nickname: string;
  pendingMessages: Set<number>;
}

export default function ChatMessageList({
  messages,
  nickname,
  pendingMessages,
}: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-2 flex flex-col-reverse h-[532px]">
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
