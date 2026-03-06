"use client";

import { cn } from "@/lib/utils";

interface MarkdownToggleProps {
  mode: "wysiwyg" | "raw";
  onToggle: (mode: "wysiwyg" | "raw") => void;
}

export function MarkdownToggle({ mode, onToggle }: MarkdownToggleProps) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
      <button
        onClick={() => onToggle("wysiwyg")}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-md transition-colors",
          mode === "wysiwyg"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        Visual
      </button>
      <button
        onClick={() => onToggle("raw")}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-md transition-colors",
          mode === "raw"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        Markdown
      </button>
    </div>
  );
}
