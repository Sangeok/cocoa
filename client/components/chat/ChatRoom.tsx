import { Tab } from "@headlessui/react";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import clsx from "clsx";
import { useChatRoom } from "@/hooks/useChat";

interface ChatRoomProps {
  symbol: string;
  symbolKoreanName: string;
}

export default function ChatRoom({ symbol, symbolKoreanName }: ChatRoomProps) {
  const {
    globalMessages,
    coinMessages,
    pendingMessages,
    inputMessage,
    selectedChat,
    nickname,
    setInputMessage,
    setSelectedChat,
    handleSendMessage,
    setIsNicknameModalOpen,
  } = useChatRoom(symbol, 2);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg h-fit">
      <Tab.Group
        selectedIndex={selectedChat === "global" ? 0 : 1}
        onChange={(index) => setSelectedChat(index === 0 ? "global" : "coin")}
      >
        <Tab.List className="flex space-x-1 rounded-t-lg bg-gray-100 dark:bg-gray-800 p-1">
          <Tab
            className={({ selected }) =>
              clsx(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                "ring-white/60 ring-offset-2 ring-offset-green-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-gray-800"
              )
            }
          >
            <span className="flex items-center justify-center gap-1.5">
              <span className="relative flex size-2">
                <span className="relative inline-flex size-2 rounded-full bg-green-500" />
              </span>
              전체 채팅방
            </span>
          </Tab>
          <Tab
            className={({ selected }) =>
              clsx(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-gray-800"
              )
            }
          >
            <span className="flex items-center justify-center gap-1.5">
              <span className="relative flex size-2">
                <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
              </span>
              {symbolKoreanName} 채팅방
            </span>
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <div className="mt-4 flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  전체 채팅
                </h2>
              </div>
              <ChatMessageList
                messages={globalMessages}
                nickname={nickname}
                pendingMessages={pendingMessages}
              />
              <ChatInput
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                onSendMessage={handleSendMessage}
                nickname={nickname}
                onEditNickname={() => setIsNicknameModalOpen(true)}
              />
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="mt-4 flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {symbolKoreanName} 채팅
                </h2>
              </div>
              <ChatMessageList
                messages={coinMessages}
                nickname={nickname}
                pendingMessages={pendingMessages}
              />
              <ChatInput
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                onSendMessage={handleSendMessage}
                nickname={nickname}
                onEditNickname={() => setIsNicknameModalOpen(true)}
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
