"use client";

import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { useState, useEffect } from "react";
import { ClientAPICall } from "@/lib/axios";
import toast from "react-hot-toast";
import { API_ROUTES } from "@/const/api";
import useMarketStore from "@/store/useMarketStore";
import clsx from "clsx";

interface PredictLog {
  id: number;
  market: string;
  exchange: string;
  entryPrice: number;
  closePrice: number;
  deposit: number;
  position: string;
  leverage: number;
  entryAt: string;
  exitAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, setUser } = useAuthStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [predictLogs, setPredictLogs] = useState<PredictLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(user?.phoneNumber || "");
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const exchangeRate = useMarketStore((state) => state.exchangeRate);
  const canCheckIn = user?.predict?.lastCheckInAt
    ? new Date(user.predict.lastCheckInAt).toDateString() !==
      new Date().toDateString()
    : true;

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

  const handleUpdatePhone = async () => {
    if (!user) return;

    if (!newPhone.trim() || newPhone === user?.phoneNumber) {
      setIsEditingPhone(false);
      return;
    }

    try {
      setIsUpdatingPhone(true);
      const response = await ClientAPICall.patch(
        API_ROUTES.USER.UPDATE_PHONE.url,
        {
          phoneNumber: newPhone,
        }
      );

      if (response.data.success) {
        toast.success("연락처가 변경되었습니다.");
        setIsEditingPhone(false);
      } else {
        toast.error("연락처 변경에 실패했습니다.");
        setNewPhone(user?.phoneNumber || "");
      }
    } catch (error) {
      toast.error("연락처 변경에 실패했습니다.");
      setNewPhone(user?.phoneNumber || "");
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const fetchPredictLogs = async () => {
    try {
      setIsLoading(true);
      const response = await ClientAPICall.get(API_ROUTES.PREDICT.LOGS.url, {
        params: {
          page,
          limit: LIMIT,
        },
      });

      if (response.data.success) {
        if (page === 1) {
          setPredictLogs(response.data.data.logs);
        } else {
          setPredictLogs((prev) => [...prev, ...response.data.data.logs]);
        }
        setHasMore(response.data.data.pagination.totalPages > page);
      }
    } catch (error) {
      toast.error("예측 기록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPredictLogs();
    }
  }, [isAuthenticated, user, page]);

  useEffect(() => {
    const fetchLatestUserData = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await ClientAPICall.get(API_ROUTES.USER.PROFILE.url);
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch latest user data:', error);
      }
    };

    fetchLatestUserData();
  }, [isAuthenticated, setUser]);

  const handleCheckIn = async () => {
    if (!user) return;

    try {
      const response = await ClientAPICall.post(
        API_ROUTES.PREDICT.CHECK_IN.url,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser({
          ...user,
          predict: {
            ...user?.predict,
            lastCheckInAt: new Date().toISOString(),
            vault: Number(user?.predict?.vault) + 1000,
          },
        });
        toast.success("출석 체크 완료! $1,000 지급되었습니다.");
      } else {
        toast.error("출석 체크에 실패했습니다.");
      }
    } catch (error) {
      toast.error("출석 체크에 실패했습니다.");
    }
  };

  if (!isAuthenticated || !user) {
    router.push("/signin");
    return null;
  }

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-950 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  코코아 머니
                </h3>
                <div className="mt-4 space-y-1">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    $ {user?.predict.vault.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    ≈{" "}
                    {exchangeRate
                      ? (
                          user?.predict.vault * exchangeRate.rate
                        ).toLocaleString()
                      : "---"}
                    원
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={!canCheckIn}
                className={clsx(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                  canCheckIn
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                )}
              >
                {canCheckIn ? (
                  "출석 체크"
                ) : (
                  <div className="flex flex-col items-center text-xs">
                    <span>출석 완료</span>
                    <span>내일 다시 받기</span>
                  </div>
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              매일 출석 체크로 $1,000를 받을 수 있습니다.
            </p>
          </div>
        </div>

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

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  연락처
                </label>
                <div className="mt-1">
                  {isEditingPhone ? (
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 
                          bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white 
                          focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isUpdatingPhone}
                        placeholder="010-0000-0000"
                      />
                      <button
                        onClick={handleUpdatePhone}
                        disabled={isUpdatingPhone}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 
                          text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingPhone(false);
                          setNewPhone(user?.phoneNumber || "");
                        }}
                        disabled={isUpdatingPhone}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 
                          text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white">
                        {user?.phoneNumber || "미등록"}
                      </span>
                      <button
                        onClick={() => setIsEditingPhone(true)}
                        className="text-sm text-green-500 hover:text-green-600"
                      >
                        {user?.phoneNumber ? "변경" : "등록"}
                      </button>
                    </div>
                  )}
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

        <div className="bg-white dark:bg-gray-950 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              예측 기록
            </h3>

            <div className="space-y-4">
              {predictLogs.length === 0 && (
                <div className="text-gray-500 dark:text-gray-400">
                  예측 기록이 없습니다.
                </div>
              )}
              {predictLogs.map((log) => {
                const pnl =
                  ((log.closePrice - log.entryPrice) / log.entryPrice) *
                  100 *
                  log.leverage;
                const isProfit = pnl > 0;

                return (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg gap-2"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {log.market}
                        </span>
                        <span className="text-sm text-gray-500">
                          {log.exchange}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.position === "L" ? "롱" : "숏"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.entryAt).toLocaleString()} →{" "}
                        {new Date(log.exitAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`font-medium ${
                          isProfit ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {pnl.toFixed(2)}%
                      </span>
                      <div className="text-sm text-gray-500">
                        {log.leverage}x · {log.deposit.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                );
              })}

              {hasMore && (
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={isLoading}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 
                    dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                >
                  {isLoading ? "로딩 중..." : "더 보기"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
