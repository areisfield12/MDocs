"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { GripHorizontal, Trash2, Copy } from "lucide-react";
import type { Editor } from "@tiptap/react";
import type { RelativeRect } from "./useTableGeometry";

interface TableColumnHandleProps {
  editor: Editor;
  table: HTMLTableElement;
  colIndex: number;
  colRect: RelativeRect;
  tableRect: RelativeRect;
  totalCols: number;
  scrollContainer: HTMLElement | null;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const DRAG_THRESHOLD = 5;

function getColHighlightRect(
  table: HTMLTableElement,
  colIndex: number,
  scrollContainer: HTMLElement
): HighlightRect | null {
  const headerRow = table.rows[0];
  if (!headerRow || !headerRow.cells[colIndex]) return null;
  const cellRect = headerRow.cells[colIndex].getBoundingClientRect();
  const tableRect = table.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();
  const scrollTop = scrollContainer.scrollTop;
  return {
    top: tableRect.top - containerRect.top + scrollTop,
    left: cellRect.left - containerRect.left,
    width: cellRect.width,
    height: tableRect.height,
  };
}

export function TableColumnHandle({
  editor,
  table,
  colIndex,
  colRect,
  tableRect,
  scrollContainer,
}: TableColumnHandleProps) {
  const currentIndexRef = useRef(colIndex);
  const [dragHighlight, setDragHighlight] = useState<HighlightRect | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dismiss on click outside
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return;
      setShowMenu(false);
      setDragHighlight(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!scrollContainer) return;
      e.preventDefault();
      e.stopPropagation();

      // If menu is already open, close it
      if (showMenu) {
        setShowMenu(false);
        setDragHighlight(null);
        return;
      }

      currentIndexRef.current = colIndex;

      const rect = getColHighlightRect(table, colIndex, scrollContainer);
      setDragHighlight(rect);

      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      const startX = e.clientX;
      const startY = e.clientY;
      let didDrag = false;

      const { moveTableColumn } = require("prosemirror-tables");

      const updateHighlight = () => {
        const r = getColHighlightRect(table, currentIndexRef.current, scrollContainer);
        setDragHighlight(r);
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (!didDrag && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
        didDrag = true;

        const current = currentIndexRef.current;
        const headerRow = table.rows[0];
        if (!headerRow) return;
        const cells = Array.from(headerRow.cells);

        if (current > 0) {
          const leftRect = cells[current - 1].getBoundingClientRect();
          if (moveEvent.clientX < leftRect.left + leftRect.width / 2) {
            try {
              const pos = editor.view.posAtDOM(table, 0);
              moveTableColumn({ from: current, to: current - 1, pos })(
                editor.view.state,
                editor.view.dispatch
              );
              currentIndexRef.current = current - 1;
              requestAnimationFrame(updateHighlight);
            } catch {
              /* ignore */
            }
            return;
          }
        }

        if (current < cells.length - 1) {
          const rightRect = cells[current + 1].getBoundingClientRect();
          if (moveEvent.clientX > rightRect.left + rightRect.width / 2) {
            try {
              const pos = editor.view.posAtDOM(table, 0);
              moveTableColumn({ from: current, to: current + 1, pos })(
                editor.view.state,
                editor.view.dispatch
              );
              currentIndexRef.current = current + 1;
              requestAnimationFrame(updateHighlight);
            } catch {
              /* ignore */
            }
            return;
          }
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";

        if (!didDrag) {
          // Click without drag — keep highlight, show menu
          const freshRect = getColHighlightRect(table, currentIndexRef.current, scrollContainer);
          setDragHighlight(freshRect);
          setShowMenu(true);
        } else {
          setDragHighlight(null);
        }
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [editor, table, colIndex, scrollContainer, showMenu]
  );

  const handleDelete = useCallback(() => {
    const targetCol = currentIndexRef.current;
    try {
      const headerRow = table.rows[0];
      if (headerRow && headerRow.cells[targetCol]) {
        const pos = editor.view.posAtDOM(headerRow.cells[targetCol], 0);
        editor.chain().focus().setTextSelection(pos).deleteColumn().run();
      }
    } catch {
      /* ignore */
    }
    setShowMenu(false);
    setDragHighlight(null);
  }, [editor, table]);

  const handleDuplicate = useCallback(() => {
    const targetCol = currentIndexRef.current;
    try {
      const rows = Array.from(table.rows);
      if (!rows[0] || !rows[0].cells[targetCol]) return;

      // Capture source cell content BEFORE adding the column
      const cellContents: (typeof editor.state.doc.content)[] = [];
      for (let r = 0; r < rows.length; r++) {
        const srcCell = rows[r].cells[targetCol];
        if (!srcCell) {
          cellContents.push(editor.state.doc.type.schema.nodes.paragraph.create().content);
          continue;
        }
        try {
          const cellPos = editor.view.posAtDOM(srcCell, 0);
          const resolved = editor.state.doc.resolve(cellPos);
          let depth = resolved.depth;
          while (depth > 0) {
            const n = resolved.node(depth);
            if (n.type.name === "tableCell" || n.type.name === "tableHeader") break;
            depth--;
          }
          cellContents.push(resolved.node(depth).content);
        } catch {
          cellContents.push(editor.state.doc.type.schema.nodes.paragraph.create().content);
        }
      }

      // Add the empty column
      const pos = editor.view.posAtDOM(rows[0].cells[targetCol], 0);
      editor.chain().focus().setTextSelection(pos).addColumnAfter().run();

      // Fill new column cells in a single transaction
      const updatedRows = Array.from(table.rows);
      const { tr } = editor.view.state;
      for (let r = 0; r < updatedRows.length && r < cellContents.length; r++) {
        const dstCell = updatedRows[r].cells[targetCol + 1];
        if (!dstCell || cellContents[r].size === 0) continue;
        try {
          const dstPos = editor.view.posAtDOM(dstCell, 0);
          const dstResolved = editor.state.doc.resolve(dstPos);
          let dstDepth = dstResolved.depth;
          while (dstDepth > 0) {
            const n = dstResolved.node(dstDepth);
            if (n.type.name === "tableCell" || n.type.name === "tableHeader") break;
            dstDepth--;
          }
          const from = tr.mapping.map(dstResolved.start(dstDepth));
          const to = tr.mapping.map(dstResolved.end(dstDepth));
          tr.replaceWith(from, to, cellContents[r]);
        } catch {
          continue;
        }
      }
      if (tr.steps.length > 0) {
        editor.view.dispatch(tr);
      }
    } catch {
      /* ignore */
    }
    setShowMenu(false);
    setDragHighlight(null);
  }, [editor, table]);

  return (
    <>
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: tableRect.top - 20,
          left: colRect.left,
          width: colRect.width,
          zIndex: 5,
        }}
      >
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center justify-center h-4 rounded-sm text-fg-tertiary hover:text-text-primary cursor-grab transition-colors duration-100"
          style={{ width: Math.min(colRect.width, 24) }}
          title="Drag to reorder"
        >
          <GripHorizontal className="h-3 w-3" />
        </div>
      </div>

      {/* Highlight overlay */}
      {dragHighlight && scrollContainer && createPortal(
        <div
          style={{
            position: "absolute",
            top: dragHighlight.top,
            left: dragHighlight.left,
            width: dragHighlight.width,
            height: dragHighlight.height,
            border: "2px solid var(--color-accent)",
            borderRadius: 2,
            background: "rgba(79, 122, 248, 0.08)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />,
        scrollContainer
      )}

      {/* Compact menu on click-select */}
      {showMenu && dragHighlight && scrollContainer && createPortal(
        <div
          ref={menuRef}
          className="absolute flex items-center gap-0.5 rounded-md border border-border bg-surface shadow-md py-0.5 px-0.5"
          style={{
            top: dragHighlight.top - 32,
            left: dragHighlight.left,
            zIndex: 20,
            pointerEvents: "auto",
          }}
        >
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleDuplicate}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded text-text-secondary hover:bg-bg-muted hover:text-text-primary transition-colors duration-100 cursor-pointer"
            title="Duplicate column"
          >
            <Copy className="h-3 w-3" />
            Duplicate
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleDelete}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors duration-100 cursor-pointer"
            title="Delete column"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>,
        scrollContainer
      )}
    </>
  );
}
