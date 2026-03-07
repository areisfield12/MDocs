"use client";

import {
  Folder,
  FileText,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type MillerItem =
  | { type: "folder"; path: string; name: string }
  | { type: "collection"; path: string; label: string }
  | { type: "file"; path: string; displayName: string };

interface MillerColumnProps {
  items: MillerItem[];
  selectedItem: string | null;
  onSelect: (path: string, itemType: MillerItem["type"]) => void;
  label: string;
}

export function MillerColumn({
  items,
  selectedItem,
  onSelect,
  label,
}: MillerColumnProps) {
  return (
    <div className="w-[220px] flex-shrink-0 border-r border-border-secondary flex flex-col h-full">
      {/* Column header */}
      <div className="px-3 py-2 border-b border-border-secondary">
        <span className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wider truncate block">
          {label}
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto py-1">
        {items.map((item) => {
          const path = item.path;
          const isSelected = selectedItem === path;
          const isNavigable = item.type === "folder" || item.type === "collection";

          return (
            <button
              key={path}
              onClick={() => onSelect(path, item.type)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-[7px] text-[13px] transition-colors duration-150",
                isSelected
                  ? "bg-accent text-fg-inverted"
                  : "text-fg-secondary hover:bg-surface-hover"
              )}
            >
              {item.type === "folder" && (
                <Folder className={cn("h-3.5 w-3.5 flex-shrink-0", isSelected ? "text-fg-inverted" : "text-fg-tertiary")} />
              )}
              {item.type === "collection" && (
                <LayoutGrid className={cn("h-3.5 w-3.5 flex-shrink-0", isSelected ? "text-fg-inverted" : "text-fg-tertiary")} />
              )}
              {item.type === "file" && (
                <FileText className={cn("h-3.5 w-3.5 flex-shrink-0", isSelected ? "text-fg-inverted" : "text-fg-tertiary")} />
              )}

              <span className="truncate flex-1 text-left">
                {item.type === "collection" ? item.label : item.type === "folder" ? item.name : item.displayName}
              </span>

              {isNavigable && (
                <ChevronRight className={cn("h-3 w-3 flex-shrink-0", isSelected ? "text-fg-inverted/70" : "text-fg-tertiary/50")} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
