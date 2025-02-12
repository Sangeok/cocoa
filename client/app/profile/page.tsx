"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { apiClient } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";

interface ProfileData {
  id: number;
  email: string;
  name: string;
  provider: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/user/profile');
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        logout();
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    fetchProfile();
  }, [isAuthenticated, router, logout]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-950 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-8">
              프로필 정보
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  이름
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {profile?.name}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  이메일
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {profile?.email}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  로그인 방식
                </label>
                <div className="mt-1 text-gray-900 dark:text-white capitalize">
                  {profile?.provider}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  가입일
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {new Date(profile?.createdAt || "").toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 
                         hover:bg-red-700 rounded-lg transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
