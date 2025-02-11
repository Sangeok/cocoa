'use client'

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

interface PopoverItem {
  title: string
  description: string
  href: string
}

interface PopoverProps {
  mainItems: PopoverItem[]
  documentationItem?: PopoverItem
  buttonText?: string
}

export default function CustomPopover({ 
  mainItems, 
  documentationItem,
  buttonText = "Solutions" 
}: PopoverProps) {
  return (
    <div className="relative">
      <Popover className="relative">
        <PopoverButton 
          className="block text-sm/6 font-semibold text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white focus:outline-none focus-visible:text-gray-900 dark:focus-visible:text-white focus-visible:outline-1 focus-visible:outline-gray-900 dark:focus-visible:outline-white"
        >
          {buttonText}
        </PopoverButton>

        <PopoverPanel className="absolute z-10 mt-2 w-80 transform">
          <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* Main items section */}
              <div className="p-3">
                {mainItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="block rounded-lg py-2 px-3 transition hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-gray-500 dark:text-white/50">{item.description}</p>
                  </a>
                ))}
              </div>

              {/* Documentation section */}
              {documentationItem && (
                <div className="p-3">
                  <a
                    href={documentationItem.href}
                    className="block rounded-lg py-2 px-3 transition hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {documentationItem.title}
                    </p>
                    <p className="text-gray-500 dark:text-white/50">
                      {documentationItem.description}
                    </p>
                  </a>
                </div>
              )}
            </div>
          </div>
        </PopoverPanel>
      </Popover>
    </div>
  )
} 