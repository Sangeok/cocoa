import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
  useNotificationStore,
  Notification,
} from "@/store/useNotificationStore";
import { ClientAPICall } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";
import useAuthStore from "@/store/useAuthStore";
interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
}: NotificationModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { notifications, markAsRead, deleteNotification, markAllAsRead } =
    useNotificationStore();

  const getGuestbook = async (guestbookId: number) => {
    const response = await ClientAPICall.get(
      API_ROUTES.GUESTBOOK.GET_GUESTBOOK.url.replace(
        ":guestbookId",
        guestbookId.toString()
      )
    );
    return response.data;
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);

    // 내 페이지에 달린 새로운 방명록
    if (notification.type === "NEW_GUESTBOOK") {
      router.push(`/u/${user?.id}#guestbook-${notification.targetId}`);
    } else if (notification.type === "NEW_COMMENT") {
      const guestbook = await getGuestbook(notification.targetId);

      if (guestbook.success) {
        // targetId는 guestbookId
        router.push(
          `/u/${guestbook.data.userId}#guestbook-${notification.targetId}`
        );
      }
    }
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-900 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25 dark:focus:ring-teal-400/25"
                    onClick={onClose}
                  >
                    <span className="sr-only">닫기</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="px-4 pb-4 pt-5 sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center  sm:mt-0 sm:text-left w-full">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                      >
                        알림
                      </Dialog.Title>
                      <div className="mt-4 space-y-2">
                        {notifications.length > 0 ? (
                          <>
                            <div className="flex justify-end">
                              <button
                                onClick={() => markAllAsRead()}
                                className="rounded-md text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25 dark:focus:ring-teal-400/25"
                              >
                                모두 읽음 표시
                              </button>
                            </div>
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`group relative rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                                  notification.isRead
                                    ? "bg-gray-50/50 dark:bg-gray-800/50"
                                    : "bg-teal-50 dark:bg-teal-900/20"
                                }`}
                                onClick={() =>
                                  handleNotificationClick(notification)
                                }
                              >
                                <div className="flex justify-between items-start">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-900 dark:text-white">
                                      {notification.content}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(
                                        notification.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="ml-4 opacity-0 group-hover:opacity-100 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25 dark:focus:ring-teal-400/25"
                                  >
                                    <span className="sr-only">알림 삭제</span>
                                    <XMarkIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            알림이 없습니다
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
