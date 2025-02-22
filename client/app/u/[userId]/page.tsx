"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ClientAPICall } from "@/lib/axios";
import { API_ROUTES } from "@/const/api";
import useAuthStore from "@/store/useAuthStore";
import Link from "next/link";
import { Menu, Field, Textarea, Checkbox } from "@headlessui/react";
import { EllipsisHorizontalIcon, CheckIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Button from "@/components/common/Button";
import { toast } from "react-hot-toast";
import useMarketStore from "@/store/useMarketStore";
import { formatDollar } from "@/lib/format";

interface PublicProfile {
  id: number;
  name: string;
  bio: string;
  createdAt: string;
  telegram: string;
  youtube: string;
  instagram: string;
  twitter: string;
  discord: string;
  homepage: string;
  github: string;
  predict: {
    wins: number;
    losses: number;
    draws: number;
    longCount: number;
    shortCount: number;
    maxWinStreak: number;
    maxLoseStreak: number;
    vault: number;
    lastCheckInAt: string;
  };
}

interface ProfileStats {
  totalVisits: number;
  todayVisits: number;
}

interface Guestbook {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  user: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    name: string;
  };
  commentCount: number;
}

interface GuestbookComment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
  isSecret: boolean;
  mentionedUser?: {
    id: number;
    name: string;
  };
}

interface GuestbookWithComments extends Guestbook {
  comments?: GuestbookComment[];
  isCommentsOpen?: boolean;
  isSecret?: boolean;
  hasMoreComments?: boolean;
}

interface Rankings {
  mostVault: { userId: number }[];
  mostWins: { userId: number }[];
  bestWinRate: { userId: number }[];
}

const ProfileSkeleton = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <div className="lg:flex lg:gap-8">
      <div className="lg:w-1/3">
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl p-6 mb-8 lg:mb-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-4" />

          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-28" />
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:flex-1">
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48" />
          </div>

          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                </div>
                <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [guestbooks, setGuestbooks] = useState<GuestbookWithComments[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [rankings, setRankings] = useState<Rankings | null>(null);
  const [isSecretGuestbook, setIsSecretGuestbook] = useState(false);
  const [isSecretComment, setIsSecretComment] = useState<{
    [key: number]: boolean;
  }>({});
  const isOwnProfile =
    isAuthenticated && user?.id === parseInt(userId as string);
  const exchangeRate = useMarketStore((state) => state.exchangeRate);
  const [commentPages, setCommentPages] = useState<{ [key: number]: number }>(
    {}
  );
  const [selectedGuestbookId, setSelectedGuestbookId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let visitRecorded = false;

    const fetchProfileData = async () => {
      try {
        const [profileRes, statsRes, guestbookRes, rankingsRes] =
          await Promise.all([
            ClientAPICall.get(
              API_ROUTES.USER.PUBLIC_PROFILE.url.replace(
                ":userId",
                userId as string
              )
            ),
            ClientAPICall.get(
              API_ROUTES.PROFILE_STATS.GET.url.replace(
                ":userId",
                userId as string
              )
            ),
            ClientAPICall.get(API_ROUTES.GUESTBOOK.LIST.url, {
              params: { userId: userId, page: 1, limit: 10 },
            }),
            ClientAPICall.get(API_ROUTES.PREDICT.RANKINGS.url),
          ]);

        if (isMounted) {
          setProfile(profileRes.data.data);
          setStats({
            totalVisits:
              statsRes.data.data.totalVisits + (isOwnProfile ? 0 : 1),
            todayVisits:
              statsRes.data.data.todayVisits + (isOwnProfile ? 0 : 1),
          });
          setGuestbooks(
            guestbookRes.data.data.items.map((gb: GuestbookWithComments) => ({
              ...gb,
              isCommentsOpen: false,
            }))
          );
          setRankings(rankingsRes.data.data);
          setIsLoading(false);

          if (!visitRecorded && isAuthenticated && !isOwnProfile) {
            visitRecorded = true;
            ClientAPICall.post(
              API_ROUTES.PROFILE_STATS.RECORD_VISIT.url.replace(
                ":userId",
                userId as string
              ),
              {}
            ).catch((error) => {
              console.error("Failed to record visit:", error);
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, [userId, isAuthenticated, user?.id]);

  useEffect(() => {
    // URL 해시값에서 guestbook ID 추출
    const hash = window.location.hash;
    if (hash.startsWith('#guestbook-')) {
      const id = hash.replace('#guestbook-', '');
      setSelectedGuestbookId(id);
      
      // 해당 요소로 스크롤
      const element = document.getElementById(`guestbook-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const handleSubmitGuestbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isAuthenticated) return;

    try {
      const response = await ClientAPICall.post(
        API_ROUTES.GUESTBOOK.CREATE.url,
        {
          content: newMessage,
          targetUserId: userId,
          isSecret: isSecretGuestbook,
        }
      );

      setGuestbooks([response.data.data, ...guestbooks]);
      setNewMessage("");
      setIsSecretGuestbook(false);
    } catch (error) {
      console.error("Failed to submit guestbook:", error);
    }
  };

  const handleDeleteGuestbook = async (guestbookId: number) => {
    if (!isAuthenticated) return;

    try {
      await ClientAPICall.delete(
        API_ROUTES.GUESTBOOK.DELETE.url.replace(
          ":guestbookId",
          guestbookId.toString()
        )
      );
      setGuestbooks(guestbooks.filter((gb) => gb.id !== guestbookId));
    } catch (error) {
      console.error("Failed to delete guestbook:", error);
    }
  };

  const toggleComments = async (guestbookId: number) => {
    const guestbook = guestbooks.find((gb) => gb.id === guestbookId);
    if (!guestbook?.comments) {
      try {
        const response = await ClientAPICall.get(
          API_ROUTES.GUESTBOOK.GET_COMMENTS.url.replace(
            ":guestbookId",
            guestbookId.toString()
          ),
          {
            params: { page: 1, limit: 10 },
          }
        );
        setGuestbooks((prev) =>
          prev.map((gb) =>
            gb.id === guestbookId
              ? {
                  ...gb,
                  comments: response.data.data.items,
                  isCommentsOpen: true,
                  hasMoreComments: response.data.data.pagination.hasMore,
                }
              : gb
          )
        );
        setCommentPages((prev) => ({
          ...prev,
          [guestbookId]: 1,
        }));
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    } else {
      setGuestbooks((prev) =>
        prev.map((gb) =>
          gb.id === guestbookId
            ? { ...gb, isCommentsOpen: !gb.isCommentsOpen }
            : gb
        )
      );
    }
  };

  const handleSubmitComment = async (guestbookId: number) => {
    if (!newComment[guestbookId]?.trim() || !isAuthenticated) return;

    try {
      const response = await ClientAPICall.post(
        API_ROUTES.GUESTBOOK.CREATE_COMMENT.url.replace(
          ":guestbookId",
          guestbookId.toString()
        ),
        {
          content: newComment[guestbookId],
          isSecret: isSecretComment[guestbookId] || false,
        }
      );

      const newCommentData = {
        ...response.data.data,
        user: {
          id: user?.id,
          name: user?.name,
        },
      };

      setGuestbooks((prev) =>
        prev.map((gb) =>
          gb.id === guestbookId
            ? {
                ...gb,
                comments: [...(gb.comments || []), newCommentData],
                commentCount: Number(gb.commentCount) + 1,
              }
            : gb
        )
      );
      setNewComment((prev) => ({ ...prev, [guestbookId]: "" }));
      setIsSecretComment((prev) => ({ ...prev, [guestbookId]: false }));
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  const handleDeleteComment = async (
    guestbookId: number,
    commentId: number
  ) => {
    if (!isAuthenticated) return;

    try {
      await ClientAPICall.delete(
        API_ROUTES.GUESTBOOK.DELETE_COMMENT.url.replace(
          ":commentId",
          commentId.toString()
        )
      );

      setGuestbooks((prev) =>
        prev.map((gb) =>
          gb.id === guestbookId
            ? {
                ...gb,
                comments: gb.comments?.filter((c) => c.id !== commentId),
                commentCount: Number(gb.commentCount) - 1,
              }
            : gb
        )
      );
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const startEditComment = (comment: GuestbookComment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleEditComment = async (guestbookId: number, commentId: number) => {
    if (!editCommentContent.trim() || !isAuthenticated) return;

    try {
      const response = await ClientAPICall.patch(
        API_ROUTES.GUESTBOOK.UPDATE_COMMENT.url.replace(
          ":commentId",
          commentId.toString()
        ),
        { content: editCommentContent }
      );

      setGuestbooks((prev) =>
        prev.map((gb) =>
          gb.id === guestbookId
            ? {
                ...gb,
                comments: gb.comments?.map((c) =>
                  c.id === commentId ? response.data.data : c
                ),
              }
            : gb
        )
      );
      setEditingCommentId(null);
      setEditCommentContent("");
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleCommentKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    guestbookId: number
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment(guestbookId);
    }
  };

  const handleReplyClick = (comment: GuestbookComment, guestbookId: number) => {
    const mentionText = `@${comment.user.name} `;
    setNewComment((prev) => ({
      ...prev,
      [guestbookId]: mentionText,
    }));
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getUserRanking = () => {
    if (!rankings || !profile) return null;
    const vaultIndex = rankings.mostVault.findIndex(
      (r) => r.userId === profile.id
    );
    const winsIndex = rankings.mostWins.findIndex(
      (r) => r.userId === profile.id
    );
    const winRateIndex = rankings.bestWinRate.findIndex(
      (r) => r.userId === profile.id
    );

    return {
      vault: vaultIndex === -1 ? "100+" : `${vaultIndex + 1}`,
      wins: winsIndex === -1 ? "100+" : `${winsIndex + 1}`,
      winRate: winRateIndex === -1 ? "100+" : `${winRateIndex + 1}`,
    };
  };
  
  const canCheckIn = isOwnProfile
    ? new Date(user?.predict?.lastCheckInAt).toDateString() !==
      new Date().toDateString()
    : false;

  const handleCheckIn = async () => {
    if (!user) return;

    try {
      const response = await ClientAPICall.post(
        API_ROUTES.PREDICT.CHECK_IN.url,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                predict: {
                  ...prev.predict,
                  lastCheckInAt: new Date().toISOString(),
                  vault: Number(prev.predict.vault) + 1000,
                },
              }
            : null
        );
        toast.success("출석 체크 완료! $1,000 지급되었습니다.");
      } else {
        toast.error(response.data.message ?? "출석 체크에 실패했습니다.");
      }
    } catch (error) {
      toast.error("출석 체크에 실패했습니다.");
    }
  };

  const handleLoadMoreComments = async (guestbookId: number) => {
    const currentPage = commentPages[guestbookId] || 1;
    try {
      const response = await ClientAPICall.get(
        API_ROUTES.GUESTBOOK.GET_COMMENTS.url.replace(
          ":guestbookId",
          guestbookId.toString()
        ),
        {
          params: { page: currentPage + 1, limit: 10 },
        }
      );

      setGuestbooks((prev) =>
        prev.map((gb) =>
          gb.id === guestbookId
            ? {
                ...gb,
                comments: [...response.data.data.items, ...(gb.comments || [])],
                hasMoreComments: response.data.data.pagination.hasMore,
              }
            : gb
        )
      );
      setCommentPages((prev) => ({
        ...prev,
        [guestbookId]: currentPage + 1,
      }));
    } catch (error) {
      console.error("Failed to load more comments:", error);
    }
  };

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            😢 사용자를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            요청하신 프로필 페이지가 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white 
                       rounded-lg transition-colors duration-200"
            >
              홈으로 가기
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 
                       dark:hover:bg-gray-700 text-gray-900 dark:text-white 
                       rounded-lg transition-colors duration-200"
            >
              이전 페이지
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="lg:flex lg:gap-8">
        <div className="lg:w-1/3">
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl p-6 mb-8 lg:mb-4">
            <h1 className="text-2xl font-bold mb-4">{profile.name}</h1>
            <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {profile.bio}
            </h2>

            {isOwnProfile && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      코코아 머니
                    </span>
                    <span className="font-bold">
                      {formatDollar(profile?.predict?.vault ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>원화</span>
                    <span>
                      ≈{" "}
                      {exchangeRate
                        ? (
                            user?.predict.vault * exchangeRate.rate
                          ).toLocaleString()
                        : "---"}
                      원
                    </span>
                  </div>
                </div>
              </div>
            )}

            {rankings && (
              <div className="mb-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-blue-600 dark:text-blue-400">
                    자산 순위
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {getUserRanking()?.vault}위
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-green-600 dark:text-green-400">
                    승리 순위
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {getUserRanking()?.wins}위
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-purple-600 dark:text-purple-400">
                    승률 순위
                  </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {getUserRanking()?.winRate}위
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-400">⚔️</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">
                    {profile.predict.wins}승
                  </span>
                  <span className="text-gray-400">
                    {profile.predict.draws}무
                  </span>
                  <span className="text-red-500">
                    {profile.predict.losses}패
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-400">🚀</span>
                <span>최대: {profile.predict.maxWinStreak}연승</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-400">😢</span>
                <span>최대: {profile.predict.maxLoseStreak}연패</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>롱/숏</span>
                  <span>
                    {profile.predict.longCount}/{profile.predict.shortCount}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex">
                  {(profile.predict.longCount > 0 ||
                    profile.predict.shortCount > 0) && (
                    <>
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${
                            (profile.predict.longCount /
                              (profile.predict.longCount +
                                profile.predict.shortCount)) *
                            100
                          }%`,
                        }}
                      />
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${
                            (profile.predict.shortCount /
                              (profile.predict.longCount +
                                profile.predict.shortCount)) *
                            100
                          }%`,
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            {isAuthenticated && user?.id === parseInt(userId as string) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                <button
                  onClick={canCheckIn ? handleCheckIn : undefined}
                  className={clsx(
                    "w-full px-4 py-2 rounded-lg transition-colors",
                    canCheckIn
                      ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-default"
                  )}
                >
                  {canCheckIn ? "출석체크" : "출석 완료 (내일 다시 받기)"}
                </button>
                <Link
                  href="/profile"
                  className="w-full block text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 
                           dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 
                           rounded-lg transition-colors"
                >
                  개인정보 관리
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 
                           dark:bg-red-900/30 dark:hover:bg-red-900/50 
                           text-red-600 dark:text-red-400
                           rounded-lg transition-colors"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:flex-1">
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">방명록</h2>
              <div className="text-sm text-gray-500">
                <span className="mr-4">
                  오늘 방문자: {stats?.todayVisits || 0}
                </span>
                <span>총 방문자: {stats?.totalVisits || 0}</span>
              </div>
            </div>

            {isAuthenticated && (
              <form onSubmit={handleSubmitGuestbook} className="mb-6">
                <div className="space-y-2">
                  <Field>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className={clsx(
                        "mt-2 block w-full resize-none rounded-lg border-none",
                        "bg-white/5 dark:bg-gray-800 py-2 px-3",
                        "text-gray-900 dark:text-white text-sm/6",
                        "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2",
                        "data-[focus]:outline-teal-500/25 dark:data-[focus]:outline-teal-400/25",
                        "placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      )}
                      rows={3}
                      maxLength={200}
                      placeholder="방명록을 작성해주세요 (최대 200자)"
                    />
                  </Field>
                  <div className="flex items-center justify-between">
                    {!isOwnProfile ? (
                      <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Checkbox
                          checked={isSecretGuestbook}
                          onChange={setIsSecretGuestbook}
                          className={clsx(
                            "group size-5 rounded",
                            "bg-white dark:bg-gray-800",
                            "ring-1 ring-gray-300 dark:ring-gray-600",
                            "data-[checked]:bg-teal-600 dark:data-[checked]:bg-teal-500",
                            "data-[checked]:ring-0"
                          )}
                        >
                          <CheckIcon className="hidden size-4 text-white group-data-[checked]:block" />
                        </Checkbox>
                        <span>비밀 방명록</span>
                      </label>
                    ) : (
                      <div />
                    )}
                    <Button type="submit" size="lg" variant="primary">
                      작성
                    </Button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {guestbooks.map((guestbook) => (
                <div
                  key={guestbook.id}
                  id={`guestbook-${guestbook.id}`}
                  className={clsx(
                    'bg-white dark:bg-gray-950 rounded-xl shadow-xl p-6 mb-4',
                    selectedGuestbookId === guestbook.id.toString() && 
                    'ring-2 ring-blue-500 dark:ring-blue-400'
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "font-bold",
                          guestbook.author.name === "비공개" &&
                            "text-gray-500 dark:text-gray-400 italic"
                        )}
                      >
                        {guestbook.author.name}
                      </span>
                      {guestbook.isSecret && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                          비밀
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(guestbook.createdAt).toLocaleDateString()}
                      </span>
                      {isAuthenticated &&
                        (user?.id === parseInt(userId as string) ||
                          user?.id === guestbook.author.id) && (
                          <Menu as="div" className="relative">
                            <Menu.Button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                              <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </Menu.Button>
                            <Menu.Items className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() =>
                                      handleDeleteGuestbook(guestbook.id)
                                    }
                                    className={`${
                                      active
                                        ? "bg-gray-100 dark:bg-gray-700"
                                        : ""
                                    } text-red-600 dark:text-red-400 w-full text-left px-4 py-2 text-sm`}
                                  >
                                    삭제
                                  </button>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Menu>
                        )}
                    </div>
                  </div>
                  <p
                    className={clsx(
                      "whitespace-pre-wrap",
                      guestbook.isSecret
                        ? "text-gray-600 dark:text-gray-400"
                        : ""
                    )}
                  >
                    {guestbook.content}
                  </p>

                  <div className="mt-2">
                    <p
                      onClick={() => toggleComments(guestbook.id)}
                      className="text-sm text-gray-500 mt-2 cursor-pointer hover:text-gray-700"
                    >
                      댓글 {guestbook.commentCount}개
                    </p>

                    {guestbook.isCommentsOpen && (
                      <div className="mt-4 space-y-3">
                        {guestbook.hasMoreComments && (
                          <button
                            onClick={() => handleLoadMoreComments(guestbook.id)}
                            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 
                                     dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            이전 댓글 더보기
                          </button>
                        )}
                        {guestbook.comments?.map((comment) => (
                          <div key={comment.id} className="pl-4 border-l-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <span
                                  className={clsx(
                                    "font-medium",
                                    comment.user.name === "비공개" &&
                                      "text-gray-500 dark:text-gray-400 italic"
                                  )}
                                >
                                  {comment.user.name}
                                </span>
                                {comment.isSecret && (
                                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                    비밀
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {isAuthenticated && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleReplyClick(comment, guestbook.id);
                                    }}
                                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm"
                                  >
                                    답글
                                  </button>
                                )}
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(
                                    comment.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                {isAuthenticated &&
                                  user?.id === comment.user.id && (
                                    <Menu as="div" className="relative">
                                      <Menu.Button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                        <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                      </Menu.Button>
                                      <Menu.Items className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                        <Menu.Item>
                                          {({ active }) => (
                                            <Button
                                              size="sm"
                                              variant="primary"
                                              onClick={() =>
                                                startEditComment(comment)
                                              }
                                              className="w-full text-left"
                                            >
                                              수정
                                            </Button>
                                          )}
                                        </Menu.Item>
                                        <Menu.Item>
                                          {({ active }) => (
                                            <Button
                                              size="sm"
                                              variant="danger"
                                              onClick={() =>
                                                handleDeleteComment(
                                                  guestbook.id,
                                                  comment.id
                                                )
                                              }
                                              className="w-full text-left"
                                            >
                                              삭제
                                            </Button>
                                          )}
                                        </Menu.Item>
                                      </Menu.Items>
                                    </Menu>
                                  )}
                              </div>
                            </div>
                            <p
                              className={clsx(
                                "whitespace-pre-wrap",
                                comment.isSecret
                                  ? "text-gray-600 dark:text-gray-400 text-sm mt-1"
                                  : "text-sm mt-1"
                              )}
                            >
                              {comment.mentionedUser && (
                                <span className="text-teal-600">
                                  @{comment.mentionedUser.name}{" "}
                                </span>
                              )}
                              {comment.content}
                            </p>
                          </div>
                        ))}

                        {isAuthenticated && (
                          <div className="mt-4 space-y-2">
                            <Field>
                              <Textarea
                                value={newComment[guestbook.id] || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setNewComment((prev) => ({
                                    ...prev,
                                    [guestbook.id]: value,
                                  }));
                                }}
                                onKeyPress={(e) =>
                                  handleCommentKeyPress(e, guestbook.id)
                                }
                                className={clsx(
                                  "mt-2 block w-full resize-none rounded-lg border-none",
                                  "bg-white/5 dark:bg-gray-800 py-2 px-3",
                                  "text-gray-900 dark:text-white text-sm/6",
                                  "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2",
                                  "data-[focus]:outline-teal-500/25 dark:data-[focus]:outline-teal-400/25",
                                  "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                                  "min-h-[60px]"
                                )}
                                placeholder="댓글을 입력하세요 (Shift + Enter: 줄바꿈, Enter: 작성)"
                                maxLength={200}
                              />
                            </Field>
                            <div className="flex items-center justify-between">
                              <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <Checkbox
                                  checked={
                                    isSecretComment[guestbook.id] || false
                                  }
                                  onChange={(checked) => {
                                    setIsSecretComment((prev) => ({
                                      ...prev,
                                      [guestbook.id]: checked,
                                    }));
                                  }}
                                  className={clsx(
                                    "group size-5 rounded",
                                    "bg-white dark:bg-gray-800",
                                    "ring-1 ring-gray-300 dark:ring-gray-600",
                                    "data-[checked]:bg-teal-600 dark:data-[checked]:bg-teal-500",
                                    "data-[checked]:ring-0"
                                  )}
                                >
                                  <CheckIcon className="hidden size-4 text-white group-data-[checked]:block" />
                                </Checkbox>
                                <span>비밀 댓글</span>
                              </label>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                  handleSubmitComment(guestbook.id)
                                }
                              >
                                작성
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
