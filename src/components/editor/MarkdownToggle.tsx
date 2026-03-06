"use client";

import { cn } from "@/lib/utils";

interface MarkdownToggleProps {
  mode: "wysiwyg" | "raw";
  onToggle: (mode: "wysiwyg" | "raw") => void;
}

export function MarkdownToggle({ mode, onToggle }: MarkdownToggleProps) {
  return (
    <div className="flex items-center bg-surface-tertiary rounded-lg p-0.5">
      <button
        onClick={() => onToggle("wysiwyg")}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-md transition-colors",
          mode === "wysiwyg"
            ? "bg-surface text-fg shadow-sm"
            : "text-fg-tertiary hover:text-fg-secondary"
        )}
      >
        Visual
      </button>
      <button
        onClick={() => onToggle("raw")}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-md transition-colors",
          mode === "raw"
            ? "bg-surface text-fg shadow-sm"
            : "text-fg-tertiary hover:text-fg-secondary"
        )}
      >
        Markdown
      </button>
    </div>
  );
}
