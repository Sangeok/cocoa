import { Menu, Field, Textarea } from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Comment from "./Comment";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";

interface DiscussionItemProps {
  discussion: any;
  isAuthenticated: boolean;
  userId?: number;
  editingCommentId: number | null;
  editCommentContent: string;
  newComment: Record<number, string>;
  onToggleComments: (discussionId: number) => void;
  onDeleteDiscussion: (discussionId: number) => void;
  onSubmitComment: (discussionId: number) => void;
  onEditComment: (discussionId: number, commentId: number) => void;
  onDeleteComment: (discussionId: number, commentId: number) => void;
  onEditCommentStart: (commentId: number, content: string) => void;
  onEditCommentCancel: () => void;
  setEditCommentContent: (content: string) => void;
  setNewComment: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

export default function DiscussionItem({
  discussion,
  isAuthenticated,
  userId,
  editingCommentId,
  editCommentContent,
  newComment,
  onToggleComments,
  onDeleteDiscussion,
  onSubmitComment,
  onEditComment,
  onDeleteComment,
  onEditCommentStart,
  onEditCommentCancel,
  setEditCommentContent,
  setNewComment,
}: DiscussionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const LINE_HEIGHT = 24; // 1줄당 높이 (px)
  const MAX_LINES = 4; // 최대 표시 줄 수

  // 컨텐츠 높이를 체크하여 더보기 버튼 필요 여부 확인
  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setNeedsExpansion(contentHeight > LINE_HEIGHT * MAX_LINES);
    }
  }, [discussion.content]);

  return (
    <div 
      id={`stock-discussion-${discussion.id}`}
      className="p-6 bg-white dark:bg-gray-900 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      {/* 토론글 헤더 */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold">{discussion.author.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(discussion.createdAt).toLocaleDateString()}
          </span>
          {isAuthenticated && userId === discussion.author.id && (
            <Menu as="div" className="relative">
              <Menu.Button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onDeleteDiscussion(discussion.id)}
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

      {/* 토론글 내용 */}
      <div className="relative">
        <p
          ref={contentRef}
          className={clsx(
            "whitespace-pre-wrap",
            !isExpanded && needsExpansion && "line-clamp-4"
          )}
        >
          {discussion.content}
        </p>
        {needsExpansion && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-500 hover:text-blue-600 mt-2"
          >
            {isExpanded ? "간략히" : "더보기"}
          </button>
        )}
      </div>

      {/* 댓글 섹션 */}
      <div className="mt-2">
        <button
          onClick={() => onToggleComments(discussion.id)}
          className="text-sm text-gray-500 mt-2 cursor-pointer hover:text-gray-700"
        >
          댓글 {discussion.commentCount}개
        </button>

        {discussion.isCommentsOpen && (
          <div className="mt-4 space-y-3">
            {discussion.comments?.map((comment: any) => (
              <Comment
                key={comment.id}
                comment={comment}
                discussionId={discussion.id}
                isAuthenticated={isAuthenticated}
                userId={userId}
                editingCommentId={editingCommentId}
                editCommentContent={editCommentContent}
                onEdit={(commentId, content) => onEditComment(discussion.id, commentId)}
                onDelete={onDeleteComment}
                onEditStart={onEditCommentStart}
                onEditCancel={onEditCommentCancel}
                setEditCommentContent={setEditCommentContent}
              />
            ))}

            {isAuthenticated && (
              <div className="mt-4">
                <Field>
                  <Textarea
                    value={newComment[discussion.id] || ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setNewComment(prev => {
                        const updated = { ...prev };
                        updated[discussion.id] = e.target.value;
                        return updated;
                      });
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
                    onClick={() => onSubmitComment(discussion.id)}
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
  );
}
