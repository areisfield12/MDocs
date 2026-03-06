"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface CommentPopoverProps {
  owner: string;
  repo: string;
  filePath: string;
  commitSha: string;
  charStart: number;
  charEnd: number;
  quotedText: string;
  onCommentAdded: () => void;
}

export function CommentPopover({
  owner,
  repo,
  filePath,
  commitSha,
  charStart,
  charEnd,
  quotedText,
  onCommentAdded,
}: CommentPopoverProps) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Position the popover near the selection
  useEffect(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: Math.min(rect.left + window.scrollX, window.innerWidth - 340),
      });
    }
  }, [charStart, charEnd]);

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner: owner,
          repoName: repo,
          filePath,
          commitSha,
          charStart,
          charEnd,
          quotedText,
          body: body.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.actionable ?? "Failed to add comment");
        return;
      }

      toast.success("Comment added");
      setBody("");
      setOpen(false);
      onCommentAdded();
    } catch {
      toast.error("Failed to add comment. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <div
        style={{ position: "fixed", top: position.top, left: position.left }}
        className="z-30"
      >
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Comment
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ position: "fixed", top: position.top, left: position.left }}
      className="z-30 w-80 bg-white border border-gray-200 rounded-xl shadow-xl"
    >
      <div className="p-3 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Add comment
        </span>
      </div>
      <div className="p-3">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Leave a comment on this passage..."
          rows={3}
          className="w-full text-sm px-2.5 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">⌘↵ to submit</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              loading={submitting}
              disabled={!body.trim()}
            >
              <Send className="h-3.5 w-3.5" />
              Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
