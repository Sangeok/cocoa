import { create } from "zustand";
import { socket } from "@/lib/socket";
import { ClientAPICall } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";

export interface Notification {
  id: number;
  type: "NEW_GUESTBOOK" | "NEW_COMMENT" | "NEW_COMMENT_STOCK_DISCUSSION";
  content: string;
  isRead: boolean;
  createdAt: string;
  targetId: number;
  sender: {
    id: number;
    name: string;
  };
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  setUnreadCount: (count: number) => void;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;

  // Socket initialization
  initializeSocket: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  markAsRead: async (notificationId) => {
    try {
      await ClientAPICall.patch(
        API_ROUTES.NOTIFICATIONS.MARK_AS_READ.url.replace(
          ":id",
          notificationId.toString()
        ),
        {}
      );

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await ClientAPICall.post(
        API_ROUTES.NOTIFICATIONS.MARK_ALL_AS_READ.url,
        {}
      );
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await ClientAPICall.delete(
        API_ROUTES.NOTIFICATIONS.DELETE.url.replace(
          ":id",
          notificationId.toString()
        )
      );

      set((state) => ({
        notifications: state.notifications.filter(
          (n) => n.id !== notificationId
        ),
        unreadCount:
          state.unreadCount -
          (state.notifications.find((n) => n.id === notificationId)?.isRead
            ? 0
            : 1),
      }));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  },

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await ClientAPICall.get(
        API_ROUTES.NOTIFICATIONS.GET.url
      );
      set({ notifications: response.data.data.items });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({ error: "Failed to fetch notifications" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await ClientAPICall.get(
        API_ROUTES.NOTIFICATIONS.UNREAD.url
      );
      set({ unreadCount: response.data.data });
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  initializeSocket: () => {
    socket.on("notification", (notification: Notification) => {
      get().addNotification(notification);
    });
  },
}));
