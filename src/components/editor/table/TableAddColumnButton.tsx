"use client";

import { Plus } from "lucide-react";
import type { Editor } from "@tiptap/react";
import type { RelativeRect } from "./useTableGeometry";

interface TableAddColumnButtonProps {
  editor: Editor;
  mode: "right-edge" | "between-columns";
  tableRect: RelativeRect;
  colRect?: RelativeRect;
  colIndex: number;
  table: HTMLTableElement;
}

function focusCellInColumn(editor: Editor, table: HTMLTableElement, colIndex: number) {
  const row = table.rows[0];
  if (!row || !row.cells[colIndex]) return;
  const pos = editor.view.posAtDOM(row.cells[colIndex], 0);
  editor.chain().focus().setTextSelection(pos).run();
}

export function TableAddColumnButton({
  editor,
  mode,
  tableRect,
  colRect,
  colIndex,
  table,
}: TableAddColumnButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    focusCellInColumn(editor, table, colIndex);
    editor.chain().focus().addColumnAfter().run();
  };

  if (mode === "right-edge") {
    return (
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleClick}
        className="absolute flex items-center justify-center cursor-pointer transition-colors duration-100 bg-bg-muted hover:bg-bg-emphasis border border-dashed border-border text-fg-tertiary hover:text-text-primary rounded-r-sm"
        style={{
          top: tableRect.top,
          left: tableRect.right,
          width: 20,
          height: tableRect.height,
          zIndex: 5,
        }}
        title="Add column"
      >
        <Plus className="h-3 w-3" />
      </button>
    );
  }

  // Between-columns mode: small circle above header at column boundary
  if (!colRect) return null;

  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={handleClick}
      className="absolute flex items-center justify-center cursor-pointer transition-all duration-100 bg-bg-muted hover:bg-bg-emphasis border border-border text-fg-tertiary hover:text-text-primary rounded-full opacity-0 hover:opacity-100 group-hover/table-controls:opacity-70"
      style={{
        top: tableRect.top - 24,
        left: colRect.right - 8,
        width: 16,
        height: 16,
        zIndex: 5,
      }}
      title="Insert column after"
    >
      <Plus className="h-2.5 w-2.5" />
    </button>
  );
}
