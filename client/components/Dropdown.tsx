'use client'

import { Menu } from '@headlessui/react'
import {
  ArchiveBoxXMarkIcon,
  ChevronDownIcon,
  PencilIcon,
  Square2StackIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'

export default function Dropdown() {
  return (
    <div className="w-52">
      <Menu as="div" className="relative">
        <Menu.Button className="inline-flex w-full items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 text-sm font-semibold text-white hover:bg-gray-700 focus:outline-none">
          Options
          <ChevronDownIcon className="h-4 w-4 text-white/60" />
        </Menu.Button>

        <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-gray-700 bg-gray-800 p-1 text-sm text-white shadow-lg focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <button className={`${active ? 'bg-gray-700' : ''} group flex w-full items-center gap-2 rounded-lg py-1.5 px-3`}>
                <PencilIcon className="h-4 w-4 text-white/30" />
                Edit
                <kbd className="ml-auto font-sans text-xs text-white/50">⌘E</kbd>
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button className={`${active ? 'bg-gray-700' : ''} group flex w-full items-center gap-2 rounded-lg py-1.5 px-3`}>
                <Square2StackIcon className="h-4 w-4 text-white/30" />
                Duplicate
                <kbd className="ml-auto font-sans text-xs text-white/50">⌘D</kbd>
              </button>
            )}
          </Menu.Item>
          <div className="my-1 h-px bg-gray-700" />
          <Menu.Item>
            {({ active }) => (
              <button className={`${active ? 'bg-gray-700' : ''} group flex w-full items-center gap-2 rounded-lg py-1.5 px-3`}>
                <ArchiveBoxXMarkIcon className="h-4 w-4 text-white/30" />
                Archive
                <kbd className="ml-auto font-sans text-xs text-white/50">⌘A</kbd>
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button className={`${active ? 'bg-gray-700' : ''} group flex w-full items-center gap-2 rounded-lg py-1.5 px-3`}>
                <TrashIcon className="h-4 w-4 text-white/30" />
                Delete
                <kbd className="ml-auto font-sans text-xs text-white/50">⌘⌫</kbd>
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  )
} 