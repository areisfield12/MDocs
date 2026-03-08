"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Link2, Check, Unlink, Type } from "lucide-react";

interface LinkPopoverProps {
  initialUrl: string;
  initialText: string;
  isEditing: boolean;
  position: { top: number; left: number };
  onApply: (url: string, text?: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function LinkPopover({
  initialUrl,
  initialText,
  isEditing,
  position,
  onApply,
  onRemove,
  onClose,
}: LinkPopoverProps) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const textInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Auto-focus: text input when editing, URL input for new links
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEditing && textInputRef.current) {
        textInputRef.current.focus();
      } else if (urlInputRef.current) {
        urlInputRef.current.focus();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isEditing]);

  // Click outside to close
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose]);

  // Close on scroll (only when the scroll happens outside the popover)
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (popoverRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("scroll", handleScroll, true);
    return () => document.removeEventListener("scroll", handleScroll, true);
  }, [onClose]);

  const handleApply = useCallback(() => {
    const normalized = normalizeUrl(url);
    if (normalized) {
      const textChanged = isEditing && text !== initialText;
      onApply(normalized, textChanged ? text : undefined);
    }
  }, [url, text, initialText, isEditing, onApply]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleApply();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [handleApply, onClose]
  );

  return (
    <div
      ref={popoverRef}
      className="fixed z-50"
      style={{ top: position.top, left: position.left }}
    >
      {/* Upward caret */}
      <div
        className="absolute -top-1 left-4 w-2 h-2 bg-surface border-l border-t border-border rotate-45"
      />

      {/* Popover body */}
      <div className="w-80 bg-surface border border-border rounded-md shadow-md p-1.5 flex flex-col gap-1.5">
        {/* Text input row — only when editing an existing link */}
        {isEditing && (
          <div className="flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5 text-fg-tertiary shrink-0" />
            <input
              ref={textInputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Link text"
              className="flex-1 min-w-0 h-[30px] px-2 text-sm bg-bg-muted border border-border-secondary rounded-sm text-fg placeholder:text-fg-quaternary focus:outline-none focus:border-border-strong"
            />
          </div>
        )}

        {/* URL input row */}
        <div className="flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5 text-fg-tertiary shrink-0" />

          <input
            ref={urlInputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste or type a URL"
            className="flex-1 min-w-0 h-[30px] px-2 text-sm font-mono bg-bg-muted border border-border-secondary rounded-sm text-fg placeholder:text-fg-quaternary focus:outline-none focus:border-border-strong"
          />

          <button
            onClick={handleApply}
            disabled={!url.trim()}
            title="Apply link"
            className="h-7 w-7 flex items-center justify-center rounded-sm bg-accent text-white cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-default hover:bg-accent/90 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>

          {isEditing && (
            <button
              onClick={onRemove}
              title="Remove link"
              className="h-7 w-7 flex items-center justify-center rounded-sm text-fg-tertiary cursor-pointer shrink-0 hover:bg-bg-muted hover:text-error transition-colors"
            >
              <Unlink className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
