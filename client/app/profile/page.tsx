"use client";

import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { useState } from "react";
import { ClientAPICall } from "@/lib/axios";
import toast from "react-hot-toast";
import { API_ROUTES } from "@/const/api";
export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, setUser } = useAuthStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === user?.name) {
      setIsEditingName(false);
      return;
    }

    try {
      setIsUpdating(true);
      const response = await ClientAPICall.patch(
        API_ROUTES.USER.UPDATE_NAME.url,
        {
          name: newName,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.data);
        toast.success("이름이 변경되었습니다.");
        setIsEditingName(false);
      } else {
        toast.error("이름 변경에 실패했습니다.");
        setNewName(user?.name || "");
      }
    } catch (error) {
      toast.error("이름 변경에 실패했습니다.");
      setNewName(user?.name || "");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAuthenticated || !user) {
    router.push("/signin");
    return null;
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
                <div className="mt-1">
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 
                          bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white 
                          focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isUpdating}
                      />
                      <button
                        onClick={handleUpdateName}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 
                          text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setNewName(user?.name || "");
                        }}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 
                          text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white">
                        {user?.name}
                      </span>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-sm text-green-500 hover:text-green-600"
                      >
                        변경
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  이메일
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  로그인 방식
                </label>
                <div className="mt-1 text-gray-900 dark:text-white capitalize">
                  {user?.provider}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  가입일
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {new Date(user?.createdAt || "").toLocaleDateString()}
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
