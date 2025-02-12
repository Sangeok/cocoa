import { Tab } from "@headlessui/react";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import { CoinTalkMessageData, GlobalChatMessageData } from "@/types/chat";
import clsx from "clsx";

interface ChatRoomProps {
  selectedChat: "global" | "coin";
  setSelectedChat: (chat: "global" | "coin") => void;
  globalMessages: GlobalChatMessageData[];
  coinMessages: CoinTalkMessageData[];
  nickname: string;
  symbolKoreanName: string;
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: (message: string) => void;
  onEditNickname: () => void;
  pendingMessages: Set<number>;
}

export default function ChatRoom({
  selectedChat,
  setSelectedChat,
  globalMessages,
  coinMessages,
  nickname,
  symbolKoreanName,
  inputMessage,
  setInputMessage,
  onSendMessage,
  onEditNickname,
  pendingMessages,
}: ChatRoomProps) {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow">
      <Tab.Group
        selectedIndex={selectedChat === "global" ? 0 : 1}
        onChange={(index) => setSelectedChat(index === 0 ? "global" : "coin")}
      >
        <Tab.List className="flex space-x-1 rounded-t-lg bg-gray-100 dark:bg-gray-800 p-1">
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
            전체 채팅방
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
            {(symbolKoreanName)} 채팅방
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <div className="mt-4 flex-1 bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
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
                onSendMessage={onSendMessage}
                nickname={nickname}
                onEditNickname={onEditNickname}
              />
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="mt-4 flex-1 bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
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
                onSendMessage={onSendMessage}
                nickname={nickname}
                onEditNickname={onEditNickname}
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
