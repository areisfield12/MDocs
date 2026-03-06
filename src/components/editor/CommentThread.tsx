"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, MessageSquare, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useComments } from "@/hooks/useComments";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CommentThreadProps {
  owner: string;
  repo: string;
  filePath: string;
  commitSha: string;
  userId: string;
  onClose: () => void;
  highlightedCommentId?: string | null;
}

export function CommentThread({
  owner,
  repo,
  filePath,
  commitSha,
  onClose,
  highlightedCommentId,
}: CommentThreadProps) {
  const { comments, loading, resolveComment, addReply, refresh } = useComments({
    owner,
    repo,
    filePath,
    commitSha,
  });

  const activeComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  useEffect(() => {
    if (!highlightedCommentId) return;
    const el = document.getElementById(`comment-${highlightedCommentId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightedCommentId]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-900">Comments</span>
          {activeComments.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
              {activeComments.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No comments yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Select text in the editor and click &ldquo;Comment&rdquo;
            </p>
          </div>
        ) : (
          <>
            {activeComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                highlighted={comment.id === highlightedCommentId}
                onResolve={() => resolveComment(comment.id)}
                onReply={async (body) => {
                  const ok = await addReply(comment.id, body);
                  if (ok) refresh();
                }}
              />
            ))}
            {resolvedComments.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Resolved ({resolvedComments.length})
                  </span>
                </div>
                {resolvedComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    resolved
                    highlighted={comment.id === highlightedCommentId}
                    onResolve={() => resolveComment(comment.id)}
                    onReply={async (body) => {
                      const ok = await addReply(comment.id, body);
                      if (ok) refresh();
                    }}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface CommentCardProps {
  comment: {
    id: string;
    body: string;
    resolved: boolean;
    createdAt: string;
    author: { id: string; name: string | null; image: string | null; githubLogin: string | null };
    replies: Array<{
      id: string;
      body: string;
      createdAt: string;
      author: { id: string; name: string | null; image: string | null; githubLogin: string | null };
    }>;
  };
  resolved?: boolean;
  highlighted?: boolean;
  onResolve: () => void;
  onReply: (body: string) => Promise<void>;
}

function CommentCard({ comment, resolved, highlighted, onResolve, onReply }: CommentCardProps) {
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(replyText.trim());
    setReplyText("");
    setShowReply(false);
    setSubmitting(false);
  };

  return (
    <div
      id={`comment-${comment.id}`}
      className={cn(
        "px-4 py-3 transition-colors",
        resolved && "opacity-60",
        highlighted && "bg-yellow-50 ring-1 ring-inset ring-yellow-200"
      )}
    >
      {/* Author + timestamp */}
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar
          name={comment.author.name ?? comment.author.githubLogin ?? "User"}
          image={comment.author.image}
        />
        <div>
          <span className="text-xs font-medium text-gray-800">
            {comment.author.githubLogin ?? comment.author.name ?? "User"}
          </span>
          <span className="text-xs text-gray-400 ml-2">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        {!resolved && (
          <button
            onClick={onResolve}
            className="ml-auto p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Resolve comment"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Body */}
      <p className="text-sm text-gray-700 leading-relaxed">{comment.body}</p>

      {/* Replies */}
      {comment.replies.map((reply) => (
        <div key={reply.id} className="mt-3 pl-3 border-l-2 border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <UserAvatar
              name={reply.author.name ?? reply.author.githubLogin ?? "User"}
              image={reply.author.image}
              small
            />
            <span className="text-xs font-medium text-gray-700">
              {reply.author.githubLogin ?? reply.author.name}
            </span>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(reply.createdAt)}
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed pl-6">{reply.body}</p>
        </div>
      ))}

      {/* Reply input */}
      {!resolved && (
        <div className="mt-2">
          {showReply ? (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleReply();
                  if (e.key === "Escape") setShowReply(false);
                }}
                placeholder="Reply..."
                autoFocus
                className="flex-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button
                size="sm"
                onClick={handleReply}
                loading={submitting}
                disabled={!replyText.trim()}
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowReply(true)}
              className="text-xs text-blue-600 hover:text-blue-700 mt-1 transition-colors"
            >
              Reply
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function UserAvatar({
  name,
  image,
  small = false,
}: {
  name: string;
  image: string | null;
  small?: boolean;
}) {
  const size = small ? 18 : 22;
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={size}
        height={size}
        className="rounded-full flex-shrink-0"
      />
    );
  }
  return (
    <div
      className={cn(
        "rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0",
        small ? "w-[18px] h-[18px] text-[9px]" : "w-[22px] h-[22px] text-[10px]"
      )}
    >
      {name[0].toUpperCase()}
    </div>
  );
}
