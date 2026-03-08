"use client";

import { useState, useEffect } from "react";
import { Check, MessageSquare, Send } from "lucide-react";
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
  highlightedCommentId?: string | null;
  newlyAddedCommentId?: string | null;
}

export function CommentThread({
  comments,
  onResolve,
  onReply,
  onRefresh,
  highlightedCommentId,
  newlyAddedCommentId,
}: CommentThreadProps) {
  const activeComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);
  const [showResolved, setShowResolved] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightedCommentId) return;
    const el = document.getElementById(`comment-${highlightedCommentId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightedCommentId]);

  useEffect(() => {
    if (newlyAddedCommentId) {
      setFlashId(newlyAddedCommentId);
      const timer = setTimeout(() => setFlashId(null), 500);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedCommentId]);

  if (comments.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
        <MessageSquare className="h-5 w-5 text-fg-tertiary mb-2" />
        <p className="text-sm text-fg-secondary">No comments yet</p>
        <p className="text-xs text-fg-tertiary mt-1">
          Select text to leave a comment
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
      {activeComments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          highlighted={comment.id === highlightedCommentId}
          flashing={comment.id === flashId}
          onResolve={() => onResolve(comment.id)}
          onReply={async (body) => {
            const ok = await onReply(comment.id, body);
            if (ok) onRefresh();
          }}
        />
      ))}

      {resolvedComments.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="text-xs text-fg-tertiary flex items-center gap-1 cursor-pointer"
          >
            <span>{showResolved ? "\u25BE" : "\u25B8"}</span>
            {resolvedComments.length} resolved comment
            {resolvedComments.length !== 1 ? "s" : ""}
          </button>
          {showResolved && (
            <div className="mt-2 space-y-2 opacity-50">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CommentCardProps {
  comment: CommentWithAuthor;
  resolved?: boolean;
  highlighted?: boolean;
  flashing?: boolean;
  onResolve: () => void;
  onReply: (body: string) => Promise<void>;
}

function CommentCard({
  comment,
  resolved,
  highlighted,
  flashing,
  onResolve,
  onReply,
}: CommentCardProps) {
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
        "bg-surface-secondary border border-border dark:border-border-secondary rounded-md p-3 transition-colors duration-500",
        highlighted && "ring-1 ring-inset ring-amber-500/20",
        flashing && "!bg-accent-subtle"
      )}
    >
      {/* Anchor quote */}
      {comment.quotedText && (
        <div className="block bg-bg-muted border-l-2 border-border-strong rounded-r-sm text-xs italic text-fg-tertiary mb-2 px-2 py-1 truncate">
          {comment.quotedText}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <UserAvatar
          name={comment.author.name ?? comment.author.githubLogin ?? "User"}
          image={comment.author.image}
        />
        <span className="text-sm font-medium text-fg">
          {comment.author.githubLogin ?? comment.author.name ?? "User"}
        </span>
        <span className="ml-auto text-xs text-fg-tertiary">
          {formatRelativeTime(comment.createdAt)}
        </span>
        {resolved ? (
          <span className="text-xs text-fg-tertiary bg-surface-tertiary px-1.5 py-0.5 rounded">
            Resolved
          </span>
        ) : (
          <button
            onClick={onResolve}
            className="text-fg-tertiary hover:text-success transition-colors cursor-pointer"
            title="Resolve"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Body */}
      <p className="text-sm text-fg-secondary" style={{ lineHeight: 1.6 }}>
        {comment.body}
      </p>

      {/* Replies */}
      {comment.replies.map((reply) => (
        <div key={reply.id} className="mt-2 pl-4">
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
          <p className="text-xs text-fg-secondary pl-5" style={{ lineHeight: 1.6 }}>
            {reply.body}
          </p>
        </div>
      ))}

      {/* Reply input */}
      {!resolved && (
        <div className="mt-2">
          {showReply ? (
            <div className="flex gap-2 mt-1">
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
              className="text-xs text-accent mt-1 cursor-pointer transition-colors"
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
  const size = small ? 18 : 20;
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
        "rounded-full bg-accent flex items-center justify-center text-white font-bold flex-shrink-0",
        small ? "w-[18px] h-[18px] text-[9px]" : "w-[20px] h-[20px] text-[10px]"
      )}
    >
      {name[0].toUpperCase()}
    </div>
  );
}
