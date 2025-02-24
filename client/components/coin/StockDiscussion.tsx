"use client";

import { useEffect, useState } from "react";
import { stockDiscussionAPI } from "@/lib/api/stockDiscussion";
import useAuthStore from "@/store/useAuthStore";
import Button from "@/components/common/Button";
import { Field, Textarea } from "@headlessui/react";
import clsx from "clsx";
import DiscussionItem from "../discussion/DiscussionItem";

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
    // 먼저 현재 discussions의 최신 상태를 사용
    setDiscussions((prevDiscussions) => {
      const updatedDiscussions = prevDiscussions.map((discussion) => {
        if (discussion.id === discussionId) {
          return {
            ...discussion,
            isCommentsOpen: !discussion.isCommentsOpen,
          };
        }
        return discussion;
      });

      // 댓글이 열릴 때만 댓글 목록 조회
      const discussion = updatedDiscussions.find((d) => d.id === discussionId);
      if (discussion?.isCommentsOpen && !discussion.comments) {
        // 비동기 호출을 즉시 실행
        (async () => {
          try {
            const response = await stockDiscussionAPI.getComments(discussionId);
            if (response.success) {
              setDiscussions((currentDiscussions) =>
                currentDiscussions.map((d) => {
                  if (d.id === discussionId) {
                    return {
                      ...d,
                      comments: response.data.items,
                      hasMoreComments:
                        response.data.pagination.total > page * 10,
                    };
                  }
                  return d;
                })
              );
            }
          } catch (error) {
            console.error("Failed to fetch comments:", error);
          }
        })();
      }

      return updatedDiscussions;
    });
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
                commentCount: Number(d.commentCount || 0) + 1,
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
                commentCount: Number(d.commentCount) - 1,
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
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="p-4 min-h-[600px]">
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
          {discussions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                아직 작성된 토론글이 없습니다.
              </p>
              {isAuthenticated ? (
                <p className="text-gray-500 dark:text-gray-400">
                  첫 번째 의견을 남겨보세요!
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  로그인하고 첫 번째 의견을 남겨보세요!
                </p>
              )}
            </div>
          ) : (
            discussions.map((discussion) => (
              <DiscussionItem
                key={discussion.id}
                discussion={discussion}
                isAuthenticated={isAuthenticated}
                userId={user?.id}
                editingCommentId={editingCommentId}
                editCommentContent={editCommentContent}
                newComment={newComment}
                onToggleComments={toggleComments}
                onDeleteDiscussion={handleDeleteDiscussion}
                onSubmitComment={handleSubmitComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                onEditCommentStart={(commentId, content) => {
                  setEditingCommentId(commentId);
                  setEditCommentContent(content);
                }}
                onEditCommentCancel={() => {
                  setEditingCommentId(null);
                  setEditCommentContent("");
                }}
                setEditCommentContent={setEditCommentContent}
                setNewComment={setNewComment}
              />
            ))
          )}
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
