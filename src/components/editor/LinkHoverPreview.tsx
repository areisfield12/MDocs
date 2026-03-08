"use client";

import { useRef, useEffect, useCallback } from "react";
import { ExternalLink, Pencil } from "lucide-react";

interface LinkHoverPreviewProps {
  href: string;
  position: { top: number; left: number };
  onEdit: () => void;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function LinkHoverPreview({
  href,
  position,
  onEdit,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: LinkHoverPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  // Close on scroll outside the preview
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (previewRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("scroll", handleScroll, true);
    return () => document.removeEventListener("scroll", handleScroll, true);
  }, [onClose]);

  const handleVisit = useCallback(() => {
    window.open(href, "_blank", "noopener,noreferrer");
  }, [href]);

  // Display URL without protocol for cleanliness
  const displayUrl = href.replace(/^https?:\/\//, "");

  return (
    <div
      ref={previewRef}
      className="fixed z-50"
      style={{ top: position.top, left: position.left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Upward caret */}
      <div className="absolute -top-1 left-4 w-2 h-2 bg-surface border-l border-t border-border rotate-45" />

      {/* Preview body */}
      <div className="max-w-70 bg-surface border border-border rounded-md shadow-md py-1 px-2 flex items-center gap-1.5">
        <span className="text-sm font-mono text-fg-secondary truncate min-w-0">
          {displayUrl}
        </span>

        <button
          onClick={handleVisit}
          title="Open link"
          className="h-6 w-6 flex items-center justify-center rounded-sm text-fg-tertiary cursor-pointer shrink-0 hover:bg-bg-muted hover:text-fg transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
        </button>

        <button
          onClick={onEdit}
          title="Edit link"
          className="h-6 w-6 flex items-center justify-center rounded-sm text-fg-tertiary cursor-pointer shrink-0 hover:bg-bg-muted hover:text-fg transition-colors"
        >
          <Pencil className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
