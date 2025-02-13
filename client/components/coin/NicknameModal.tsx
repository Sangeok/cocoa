"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface NicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  nickname: string;
  onChangeNickname: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function NicknameModal({
  isOpen,
  onClose,
  nickname,
  onChangeNickname,
  onSubmit,
}: NicknameModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-950 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  닉네임 변경
                </Dialog.Title>
                <form onSubmit={onSubmit} className="mt-4">
                  <input
                    type="text"
                    value={nickname}
                    onChange={onChangeNickname}
                    className="w-full rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 
                             border border-gray-300 dark:border-gray-700
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             text-gray-900 dark:text-white"
                    maxLength={10}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    2-10자 이내로 입력해주세요
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                               hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 
                               hover:bg-green-700 rounded-lg"
                    >
                      변경
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 