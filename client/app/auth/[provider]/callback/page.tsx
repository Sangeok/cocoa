"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClientAPICall } from "@/lib/axios";
import useAuthStore from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { API_ROUTES } from "@/const/api";
import { socket } from "@/lib/socket";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const { fetchNotifications, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await ClientAPICall.get(API_ROUTES.USER.PROFILE.url);
        
        // refreshToken이 응답에 포함되어 있다면 저장
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
          setTokens(data.refreshToken);
        }
        
        setUser(data.data);

        // 로그인 성공 후 알림 데이터 로드 및 소켓 연결
        await Promise.all([fetchNotifications(), fetchUnreadCount()]);
        socket.connect();

        router.push(`/u/${data.data.id}`);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        router.push("/signin");
      }
    };

    fetchUserProfile();
  }, [router, setUser, setTokens, fetchNotifications, fetchUnreadCount]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600 dark:text-gray-400">로그인 처리중...</div>
    </div>
  );
}
