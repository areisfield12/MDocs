"use client";

import { useState } from "react";
import { Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import { FrontmatterData } from "@/types";
import { cn } from "@/lib/utils";

interface FrontmatterEditorProps {
  data: FrontmatterData;
  onChange: (data: FrontmatterData) => void;
}

export function FrontmatterEditor({ data, onChange }: FrontmatterEditorProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleValueChange = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  const handleKeyRename = (oldKey: string, newKey: string) => {
    if (!newKey || newKey === oldKey) return;
    const entries = Object.entries(data);
    const idx = entries.findIndex(([k]) => k === oldKey);
    if (idx >= 0) {
      entries[idx] = [newKey, entries[idx][1]];
      onChange(Object.fromEntries(entries));
    }
  };

  const handleAddField = () => {
    const key = `field${Object.keys(data).length + 1}`;
    onChange({ ...data, [key]: "" });
  };

  const handleRemoveField = (key: string) => {
    const { [key]: _, ...rest } = data;
    onChange(rest);
  };

  const entries = Object.entries(data);

  return (
    <div className="border-b border-border bg-surface-secondary">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full px-6 py-2.5 text-xs font-semibold text-fg-tertiary uppercase tracking-wide hover:bg-surface-hover transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        Frontmatter
        <span className="font-normal normal-case text-fg-tertiary">
          ({entries.length} field{entries.length !== 1 ? "s" : ""})
        </span>
      </button>

      {!collapsed && (
        <div className="px-6 pb-3 space-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="text"
                defaultValue={key}
                onBlur={(e) => handleKeyRename(key, e.target.value)}
                className={cn(
                  "w-32 text-xs font-mono px-2 py-1.5 border border-border rounded bg-surface",
                  "focus:outline-none focus:ring-1 focus:ring-fg/20 text-fg-secondary"
                )}
              />
              <span className="text-fg-tertiary text-xs">:</span>
              <input
                type="text"
                value={String(value ?? "")}
                onChange={(e) => handleValueChange(key, e.target.value)}
                className={cn(
                  "flex-1 text-xs px-2 py-1.5 border border-border rounded bg-surface",
                  "focus:outline-none focus:ring-1 focus:ring-fg/20"
                )}
              />
              <button
                onClick={() => handleRemoveField(key)}
                className="p-1 text-fg-tertiary hover:text-red-500 transition-colors"
                aria-label="Remove field"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <button
            onClick={handleAddField}
            className="flex items-center gap-1 text-xs text-violet-500 hover:text-violet-400 transition-colors mt-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add field
          </button>
        </div>
      )}
    </div>
  );
}
