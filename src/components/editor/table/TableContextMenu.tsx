"use client";

import { useEffect, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Combine,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

interface TableContextMenuProps {
  editor: Editor;
  table: HTMLTableElement;
  cell: HTMLTableCellElement;
  position: { x: number; y: number };
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export function TableContextMenu({
  editor,
  table,
  cell,
  position,
  onClose,
}: TableContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Ensure focus is in the right cell before running commands
  const focusCell = () => {
    const pos = editor.view.posAtDOM(cell, 0);
    editor.chain().focus().setTextSelection(pos).run();
  };

  const totalRows = table.rows.length;
  const totalCols = table.rows[0]?.cells.length ?? 0;

  // Check if there's a multi-cell selection
  const { CellSelection } = require("prosemirror-tables");
  const hasMultiCellSelection =
    editor.state.selection instanceof CellSelection &&
    (editor.state.selection as unknown as { ranges: readonly unknown[] }).ranges.length > 1;

  const items: (MenuItem | "separator")[] = [
    {
      label: "Insert row above",
      icon: ArrowUp,
      action: () => {
        focusCell();
        editor.chain().focus().addRowBefore().run();
      },
    },
    {
      label: "Insert row below",
      icon: ArrowDown,
      action: () => {
        focusCell();
        editor.chain().focus().addRowAfter().run();
      },
    },
    "separator",
    {
      label: "Insert column left",
      icon: ArrowLeft,
      action: () => {
        focusCell();
        editor.chain().focus().addColumnBefore().run();
      },
    },
    {
      label: "Insert column right",
      icon: ArrowRight,
      action: () => {
        focusCell();
        editor.chain().focus().addColumnAfter().run();
      },
    },
    "separator",
    {
      label: "Delete row",
      icon: Trash2,
      action: () => {
        focusCell();
        editor.chain().focus().deleteRow().run();
      },
      disabled: totalRows <= 1,
      destructive: true,
    },
    {
      label: "Delete column",
      icon: Trash2,
      action: () => {
        focusCell();
        editor.chain().focus().deleteColumn().run();
      },
      disabled: totalCols <= 1,
      destructive: true,
    },
    "separator",
    {
      label: "Merge cells",
      icon: Combine,
      action: () => {
        editor.chain().focus().mergeCells().run();
      },
      disabled: !hasMultiCellSelection,
    },
  ];

  // Adjust position to keep menu on screen
  const adjustedPosition = { ...position };
  if (typeof window !== "undefined") {
    const menuWidth = 200;
    const menuHeight = 300;
    if (position.x + menuWidth > window.innerWidth) {
      adjustedPosition.x = window.innerWidth - menuWidth - 8;
    }
    if (position.y + menuHeight > window.innerHeight) {
      adjustedPosition.y = window.innerHeight - menuHeight - 8;
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed bg-surface border border-border rounded-md shadow-lg py-1 text-[13px] min-w-[180px]"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        zIndex: 50,
      }}
    >
      {items.map((item, i) => {
        if (item === "separator") {
          return (
            <div key={`sep-${i}`} className="h-px bg-border-secondary my-1" />
          );
        }

        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              item.action();
              onClose();
            }}
            disabled={item.disabled}
            className={`flex items-center gap-2 w-full px-3 py-1.5 text-left cursor-pointer transition-colors duration-100 outline-none ${
              item.disabled
                ? "opacity-30 pointer-events-none"
                : item.destructive
                  ? "text-fg-secondary hover:bg-bg-muted hover:text-error"
                  : "text-fg-secondary hover:bg-bg-muted hover:text-text-primary"
            }`}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
