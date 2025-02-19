import { PencilIcon } from "@heroicons/react/24/outline";
import useAuthStore from "@/store/useAuthStore";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: (message: string) => void;
  nickname: string;
  onEditNickname: () => void;
}

export default function ChatInput({
  inputMessage,
  setInputMessage,
  onSendMessage,
  nickname,
  onEditNickname,
}: ChatInputProps) {
  const MAX_MESSAGE_LENGTH = 100;
  const { isAuthenticated } = useAuthStore();

  return (
    <div>
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <span>닉네임: {nickname}</span>
          {!isAuthenticated && (
            <button
              onClick={onEditNickname}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {inputMessage.length}/{MAX_MESSAGE_LENGTH}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!inputMessage.trim()) return;
          onSendMessage(inputMessage.trim());
          setInputMessage("");
        }}
        className="p-2 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            placeholder="메시지를 입력하세요"
            className="flex-1 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-950 
                   border border-gray-300 dark:border-gray-800
                   focus:outline-none focus:ring-2 focus:ring-green-500
                   text-gray-900 dark:text-white text-sm"
            maxLength={MAX_MESSAGE_LENGTH}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 
                   text-white rounded-lg text-sm font-medium
                   transition-colors duration-200"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
} 