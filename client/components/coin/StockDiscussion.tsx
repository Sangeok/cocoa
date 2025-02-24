"use client";

import { useEffect, useState } from "react";
import { stockDiscussionAPI } from "@/lib/api/stockDiscussion";
import useAuthStore from "@/store/useAuthStore";
import Button from "@/components/common/Button";
import { Menu, Field, Textarea } from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

interface StockDiscussionProps {
  symbol: string;
  symbolKoreanName: string;
}

export default function StockDiscussion({
  symbol,
  symbolKoreanName,
}: StockDiscussionProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 토론글 목록 조회
  const fetchDiscussions = async () => {
    try {
      const response = await stockDiscussionAPI.getDiscussions(symbol, page);
      if (response.success) {
        if (page === 1) {
          setDiscussions(response.data.items);
        } else {
          setDiscussions((prev) => [...prev, ...response.data.items]);
        }
        setHasMore(
          response.data.pagination.page < response.data.pagination.totalPages
        );
      }
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    }
  };

  // 댓글 토글
  const toggleComments = async (discussionId: number) => {
    const updatedDiscussions = discussions.map((discussion) => {
      if (discussion.id === discussionId) {
        return {
          ...discussion,
          isCommentsOpen: !discussion.isCommentsOpen,
        };
      }
      return discussion;
    });
    setDiscussions(updatedDiscussions);

    // 댓글이 열릴 때만 댓글 목록 조회
    const discussion = updatedDiscussions.find((d) => d.id === discussionId);
    if (discussion?.isCommentsOpen && !discussion.comments) {
      try {
        const response = await stockDiscussionAPI.getComments(discussionId);
        if (response.success) {
          setDiscussions(
            discussions.map((d) => {
              if (d.id === discussionId) {
                return {
                  ...d,
                  comments: response.data.items,
                  hasMoreComments: response.data.pagination.total > page * 10,
                };
              }
              return d;
            })
          );
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    }
  };

  // 토론글 작성
  const handleSubmitDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await stockDiscussionAPI.createDiscussion(
        symbol,
        newMessage
      );
      if (response.success) {
        setDiscussions((prev) => [response.data, ...prev]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to create discussion:", error);
    }
  };

  // 댓글 작성
  const handleSubmitComment = async (discussionId: number) => {
    const content = newComment[discussionId];
    if (!content?.trim()) return;

    try {
      const response = await stockDiscussionAPI.createComment(
        discussionId,
        content
      );
      if (response.success) {
        setDiscussions(
          discussions.map((d) => {
            if (d.id === discussionId) {
              return {
                ...d,
                comments: [...(d.comments || []), response.data],
                commentCount: (d.commentCount || 0) + 1,
              };
            }
            return d;
          })
        );
        setNewComment((prev) => ({ ...prev, [discussionId]: "" }));
      }
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  // 토론글 삭제
  const handleDeleteDiscussion = async (discussionId: number) => {
    try {
      const response = await stockDiscussionAPI.deleteDiscussion(discussionId);
      if (response.success) {
        setDiscussions((prev) => prev.filter((d) => d.id !== discussionId));
      }
    } catch (error) {
      console.error("Failed to delete discussion:", error);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (
    discussionId: number,
    commentId: number
  ) => {
    try {
      const response = await stockDiscussionAPI.deleteComment(commentId);
      if (response.success) {
        setDiscussions(
          discussions.map((d) => {
            if (d.id === discussionId) {
              return {
                ...d,
                comments: d.comments.filter((c: any) => c.id !== commentId),
                commentCount: d.commentCount - 1,
              };
            }
            return d;
          })
        );
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // 댓글 수정
  const handleEditComment = async (discussionId: number, commentId: number) => {
    if (!editCommentContent.trim()) return;

    try {
      const response = await stockDiscussionAPI.updateComment(
        commentId,
        editCommentContent
      );
      if (response.success) {
        setDiscussions(
          discussions.map((d) => {
            if (d.id === discussionId) {
              return {
                ...d,
                comments: d.comments.map((c: any) =>
                  c.id === commentId ? response.data : c
                ),
              };
            }
            return d;
          })
        );
        setEditingCommentId(null);
        setEditCommentContent("");
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  // 더보기
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    setPage(1);
    setDiscussions([]);
    fetchDiscussions();
  }, [symbol]);

  useEffect(() => {
    if (page > 1) {
      fetchDiscussions();
    }
  }, [page]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 h-[600px] overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          {symbolKoreanName} 토론방
        </h2>

        {isAuthenticated && (
          <form onSubmit={handleSubmitDiscussion} className="mb-6">
            <Field>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className={clsx(
                  "mt-2 block w-full resize-none rounded-lg",
                  "border border-gray-200 dark:border-none",
                  "bg-white dark:bg-gray-800 py-2 px-3",
                  "text-gray-900 dark:text-white text-sm/6",
                  "focus:outline-none focus:ring-2 focus:ring-teal-500/25 dark:focus:ring-teal-400/25",
                  "placeholder:text-gray-500 dark:placeholder:text-gray-400"
                )}
                rows={3}
                maxLength={200}
                placeholder="토론글을 작성해주세요 (최대 200자)"
              />
            </Field>
            <div className="flex justify-end mt-2">
              <Button type="submit" variant="primary">
                작성
              </Button>
            </div>
          </form>
        )}

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {discussions.map((discussion) => (
            <div
              key={discussion.id}
              className="p-6 bg-white dark:bg-gray-900 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{discussion.author.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(discussion.createdAt).toLocaleDateString()}
                  </span>
                  {isAuthenticated && user?.id === discussion.author.id && (
                    <Menu as="div" className="relative">
                      <Menu.Button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() =>
                                handleDeleteDiscussion(discussion.id)
                              }
                              className={`${
                                active ? "bg-gray-100 dark:bg-gray-700" : ""
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
              <p className="whitespace-pre-wrap">{discussion.content}</p>

              <div className="mt-2">
                <button
                  onClick={() => toggleComments(discussion.id)}
                  className="text-sm text-gray-500 mt-2 cursor-pointer hover:text-gray-700"
                >
                  댓글 {discussion.commentCount}개
                </button>

                {discussion.isCommentsOpen && (
                  <div className="mt-4 space-y-3">
                    {discussion.comments?.map((comment: any) => (
                      <div key={comment.id} className="pl-4 border-l-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {comment.user.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
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
                                        <button
                                          onClick={() => {
                                            setEditingCommentId(comment.id);
                                            setEditCommentContent(
                                              comment.content
                                            );
                                          }}
                                          className={`${
                                            active
                                              ? "bg-gray-100 dark:bg-gray-700"
                                              : ""
                                          } w-full text-left px-4 py-2 text-sm`}
                                        >
                                          수정
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() =>
                                            handleDeleteComment(
                                              discussion.id,
                                              comment.id
                                            )
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
                        {editingCommentId === comment.id ? (
                          <div className="mt-2 space-y-2">
                            <Field>
                              <Textarea
                                value={editCommentContent}
                                onChange={(
                                  e: React.ChangeEvent<HTMLTextAreaElement>
                                ) => setEditCommentContent(e.target.value)}
                                className={clsx(
                                  "block w-full resize-none rounded-lg",
                                  "border border-gray-200 dark:border-none",
                                  "bg-white dark:bg-gray-800 py-2 px-3",
                                  "text-gray-900 dark:text-white text-sm/6",
                                  "focus:outline-none focus:ring-2 focus:ring-teal-500/25 dark:focus:ring-teal-400/25",
                                  "placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                )}
                                rows={2}
                                maxLength={200}
                              />
                            </Field>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditCommentContent("");
                                }}
                              >
                                취소
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                  handleEditComment(discussion.id, comment.id)
                                }
                              >
                                수정
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm mt-1 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        )}
                      </div>
                    ))}

                    {isAuthenticated && (
                      <div className="mt-4">
                        <Field>
                          <Textarea
                            value={newComment[discussion.id] || ""}
                            onChange={(
                              e: React.ChangeEvent<HTMLTextAreaElement>
                            ) => {
                              setNewComment((prev) => ({
                                ...prev,
                                [discussion.id]: e.target.value,
                              }));
                            }}
                            className={clsx(
                              "block w-full resize-none rounded-lg",
                              "border border-gray-200 dark:border-none",
                              "bg-white dark:bg-gray-800 py-2 px-3",
                              "text-gray-900 dark:text-white text-sm/6",
                              "focus:outline-none focus:ring-2 focus:ring-teal-500/25 dark:focus:ring-teal-400/25",
                              "placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            )}
                            rows={2}
                            maxLength={200}
                            placeholder="댓글을 입력하세요"
                          />
                        </Field>
                        <div className="flex justify-end mt-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleSubmitComment(discussion.id)}
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

        {hasMore && (
          <div className="mt-4 text-center">
            <Button
              variant="secondary"
              onClick={handleLoadMore}
              className="w-full"
            >
              더보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
