"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, MessageSquare, Send } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CommentWithAuthor } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CommentThreadProps {
  comments: CommentWithAuthor[];
  onResolve: (commentId: string) => Promise<void>;
  onReply: (commentId: string, body: string) => Promise<boolean>;
  onRefresh: () => void;
  onClose: () => void;
  highlightedCommentId?: string | null;
}

export function CommentThread({
  comments,
  onResolve,
  onReply,
  onRefresh,
  onClose,
  highlightedCommentId,
}: CommentThreadProps) {

  const activeComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  useEffect(() => {
    if (!highlightedCommentId) return;
    const el = document.getElementById(`comment-${highlightedCommentId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightedCommentId]);

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-fg-tertiary" />
          <span className="text-sm font-semibold text-fg">Comments</span>
          {activeComments.length > 0 && (
            <span className="bg-violet-500/10 text-violet-500 text-xs font-medium px-1.5 py-0.5 rounded-full">
              {activeComments.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-fg-tertiary hover:text-fg-secondary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-secondary">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-fg-tertiary" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="h-8 w-8 text-fg-tertiary mx-auto mb-2" />
            <p className="text-sm text-fg-secondary">No comments yet</p>
            <p className="text-xs text-fg-tertiary mt-1">
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
                onResolve={() => onResolve(comment.id)}
                onReply={async (body) => {
                  const ok = await onReply(comment.id, body);
                  if (ok) onRefresh();
                }}
              />
            ))}
            {resolvedComments.length > 0 && (
              <>
                <div className="px-4 py-2 bg-surface-secondary">
                  <span className="text-xs font-semibold text-fg-tertiary uppercase tracking-wide">
                    Resolved ({resolvedComments.length})
                  </span>
                </div>
                {resolvedComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    resolved
                    highlighted={comment.id === highlightedCommentId}
                    onResolve={() => onResolve(comment.id)}
                    onReply={async (body) => {
                      const ok = await onReply(comment.id, body);
                      if (ok) onRefresh();
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
        highlighted && "bg-amber-500/5 ring-1 ring-inset ring-amber-500/20"
      )}
    >
      {/* Author + timestamp */}
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar
          name={comment.author.name ?? comment.author.githubLogin ?? "User"}
          image={comment.author.image}
        />
        <div>
          <span className="text-xs font-medium text-fg">
            {comment.author.githubLogin ?? comment.author.name ?? "User"}
          </span>
          <span className="text-xs text-fg-tertiary ml-2">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        {!resolved && (
          <button
            onClick={onResolve}
            className="ml-auto p-1 text-fg-tertiary hover:text-green-500 transition-colors"
            title="Resolve comment"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Body */}
      <p className="text-sm text-fg-secondary leading-relaxed">{comment.body}</p>

      {/* Replies */}
      {comment.replies.map((reply) => (
        <div key={reply.id} className="mt-3 pl-3 border-l-2 border-border-secondary">
          <div className="flex items-center gap-2 mb-1">
            <UserAvatar
              name={reply.author.name ?? reply.author.githubLogin ?? "User"}
              image={reply.author.image}
              small
            />
            <span className="text-xs font-medium text-fg-secondary">
              {reply.author.githubLogin ?? reply.author.name}
            </span>
            <span className="text-xs text-fg-tertiary">
              {formatRelativeTime(reply.createdAt)}
            </span>
          </div>
          <p className="text-xs text-fg-secondary leading-relaxed pl-6">{reply.body}</p>
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
                className="flex-1 text-xs px-2.5 py-1.5 border border-border rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-fg/20"
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
              className="text-xs text-violet-500 hover:text-violet-400 mt-1 transition-colors"
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
        "rounded-full bg-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0",
        small ? "w-[18px] h-[18px] text-[9px]" : "w-[22px] h-[22px] text-[10px]"
      )}
    >
      {name[0].toUpperCase()}
    </div>
  );
}
