import { Tab } from "@headlessui/react";
import clsx from "clsx";

interface CoinTabsProps {
  selectedTab: number;
  onChange: (index: number) => void;
  hasNewMessage?: boolean;
  messageType: "global" | "coin";
}

export default function CoinTabs({ 
  selectedTab, 
  onChange, 
  hasNewMessage,
  messageType,
}: CoinTabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 -mx-4 px-4 mb-4">
      <Tab.Group selectedIndex={selectedTab} onChange={onChange}>
        <Tab.List className="flex gap-8">
          {["차트・호가", "종목정보", "커뮤니티"].map((tab, index) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                clsx(
                  "py-4 font-medium text-base relative",
                  "focus:outline-none",
                  selected
                    ? "text-gray-900 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gray-900 dark:after:bg-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )
              }
            >
              <span className="relative">
                {index === 2 && hasNewMessage && selectedTab !== 2 && (
                  <span className="absolute -top-2 -left-3">
                    <span className="relative flex size-3">
                      <span className={clsx(
                        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                        messageType === "global" ? "bg-green-400" : "bg-blue-400"
                      )} />
                      <span className={clsx(
                        "relative inline-flex size-3 rounded-full",
                        messageType === "global" ? "bg-green-500" : "bg-blue-500"
                      )} />
                    </span>
                  </span>
                )}
                {tab}
              </span>
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>
    </div>
  );
} 