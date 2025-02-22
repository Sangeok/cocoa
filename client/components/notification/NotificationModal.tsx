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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
                    >
                      알림
                    </Dialog.Title>
                    <div className="mt-4 space-y-2">
                      {notifications.length > 0 ? (
                        <>
                          <div className="flex justify-end">
                            <button
                              onClick={() => markAllAsRead()}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              모두 읽음 표시
                            </button>
                          </div>
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-lg cursor-pointer ${
                                notification.isRead
                                  ? "bg-gray-50 dark:bg-gray-800"
                                  : "bg-blue-50 dark:bg-blue-900"
                              }`}
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {notification.content}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                                  className="text-gray-400 hover:text-gray-500"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">
                          알림이 없습니다
                        </p>
                      )}
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
