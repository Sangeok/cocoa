import { Menu, Field, Textarea } from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import clsx from "clsx";
import Link from "next/link";
import { findUrls } from "@/lib/utils";

interface CommentProps {
  comment: any;
  discussionId: number;
  isAuthenticated: boolean;
  userId?: number;
  editingCommentId: number | null;
  editCommentContent: string;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (discussionId: number, commentId: number) => void;
  onEditStart: (commentId: number, content: string) => void;
  onEditCancel: () => void;
  setEditCommentContent: (content: string) => void;
}

export default function Comment({
  comment,
  discussionId,
  isAuthenticated,
  userId,
  editingCommentId,
  editCommentContent,
  onEdit,
  onDelete,
  onEditStart,
  onEditCancel,
  setEditCommentContent,
}: CommentProps) {
  const renderContent = (text: string) => {
    const parts = findUrls(text);
    return parts.map((part, index) => {
      if (part.type === 'url') {
        return (
          <a
            key={index}
            href={part.text}
            target="_blank"
            rel="noopener noreferrer"
            title={part.text}
            className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline break-all"
          >
            {part.displayText || part.text}
          </a>
        );
      }
      return part.text;
    });
  };

  return (
    <div key={comment.id} className="pl-4 ">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Link
            href={`/u/${comment.user.id}`}
            className="font-medium hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
          >
            {comment.user.name}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
          {isAuthenticated && userId === comment.user.id && (
            <Menu as="div" className="relative">
              <Menu.Button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onEditStart(comment.id, comment.content)}
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } w-full text-left px-4 py-2 text-sm`}
                    >
                      수정
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(discussionId, comment.id)}
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
      {editingCommentId === comment.id ? (
        <div className="mt-2 space-y-2">
          <Field>
            <Textarea
              value={editCommentContent}
              onChange={(e) => setEditCommentContent(e.target.value)}
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
            <Button size="sm" variant="secondary" onClick={onEditCancel}>
              취소
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onEdit(comment.id, editCommentContent)}
            >
              수정
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm mt-1 whitespace-pre-wrap">
          {renderContent(comment.content)}
        </p>
      )}
    </div>
  );
}
