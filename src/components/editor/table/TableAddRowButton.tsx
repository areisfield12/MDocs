"use client";

import { Plus } from "lucide-react";
import type { Editor } from "@tiptap/react";
import type { RelativeRect } from "./useTableGeometry";

interface TableAddRowButtonProps {
  editor: Editor;
  mode: "bottom-edge" | "between-rows";
  tableRect: RelativeRect;
  rowRect?: RelativeRect;
  rowIndex: number;
  table: HTMLTableElement;
}

function focusCellInRow(editor: Editor, table: HTMLTableElement, rowIndex: number) {
  const row = table.rows[rowIndex];
  if (!row || !row.cells[0]) return;
  const pos = editor.view.posAtDOM(row.cells[0], 0);
  editor.chain().focus().setTextSelection(pos).run();
}

export function TableAddRowButton({
  editor,
  mode,
  tableRect,
  rowRect,
  rowIndex,
  table,
}: TableAddRowButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    focusCellInRow(editor, table, rowIndex);
    editor.chain().focus().addRowAfter().run();
  };

  if (mode === "bottom-edge") {
    return (
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleClick}
        className="absolute flex items-center justify-center cursor-pointer transition-colors duration-100 bg-bg-muted hover:bg-bg-emphasis border border-dashed border-border text-fg-tertiary hover:text-text-primary rounded-b-sm"
        style={{
          top: tableRect.bottom,
          left: tableRect.left,
          width: tableRect.width,
          height: 20,
          zIndex: 5,
        }}
        title="Add row"
      >
        <Plus className="h-3 w-3" />
      </button>
    );
  }

  // Between-rows mode: small circle on the left edge
  if (!rowRect) return null;

  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={handleClick}
      className="absolute flex items-center justify-center cursor-pointer transition-all duration-100 bg-bg-muted hover:bg-bg-emphasis border border-border text-fg-tertiary hover:text-text-primary rounded-full opacity-0 hover:opacity-100 group-hover/table-controls:opacity-70"
      style={{
        top: rowRect.bottom - 8,
        left: tableRect.left - 24,
        width: 16,
        height: 16,
        zIndex: 5,
      }}
      title="Insert row below"
    >
      <Plus className="h-2.5 w-2.5" />
    </button>
  );
}
