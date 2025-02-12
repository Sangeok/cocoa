import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface ChatMessageProps {
  message: string;
  nickname: string;
  timestamp: number;
  userId?: number;
  isPending?: boolean;
  isMyMessage: boolean;
}

export default function ChatMessage({
  message,
  nickname,
  timestamp,
  userId,
  isPending,
  isMyMessage,
}: ChatMessageProps) {
  return (
    <div
      className={`flex ${
        isMyMessage ? "justify-end" : "justify-start"
      } mb-3`}
    >
      <div
        className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
          isMyMessage
            ? `${isPending ? "opacity-50" : ""} bg-blue-50 dark:bg-blue-900 
               text-blue-900 dark:text-blue-50 border border-blue-200 
               dark:border-blue-800`
            : "bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 border border-gray-200 dark:border-gray-800"
        }`}
      >
        <div className="text-xs opacity-75 mb-1 flex items-center gap-2">
          <span className="font-medium">{nickname}</span>
          {userId && (
            <CheckCircleIcon className="h-4 w-4 text-blue-500" title="인증된 사용자" />
          )}
          {isPending && (
            <span className="text-xs text-gray-500">전송중...</span>
          )}
          <span className="text-gray-500">
            {format(timestamp, "HH:mm", { locale: ko })}
          </span>
        </div>
        <div className="break-words text-sm">{message}</div>
      </div>
    </div>
  );
} 