"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { GripVertical, Trash2, Copy } from "lucide-react";
import type { Editor } from "@tiptap/react";
import type { RelativeRect } from "./useTableGeometry";

interface TableRowHandleProps {
  editor: Editor;
  table: HTMLTableElement;
  rowIndex: number;
  rowRect: RelativeRect;
  tableRect: RelativeRect;
  totalRows: number;
  scrollContainer: HTMLElement | null;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const DRAG_THRESHOLD = 5;

function getRowHighlightRect(
  table: HTMLTableElement,
  rowIndex: number,
  scrollContainer: HTMLElement
): HighlightRect | null {
  const row = table.rows[rowIndex];
  if (!row) return null;
  const rowDomRect = row.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();
  const scrollTop = scrollContainer.scrollTop;
  return {
    top: rowDomRect.top - containerRect.top + scrollTop,
    left: rowDomRect.left - containerRect.left,
    width: rowDomRect.width,
    height: rowDomRect.height,
  };
}

export function TableRowHandle({
  editor,
  table,
  rowIndex,
  rowRect,
  tableRect,
  scrollContainer,
}: TableRowHandleProps) {
  const currentIndexRef = useRef(rowIndex);
  const isHeader = rowIndex === 0;
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
      if (isHeader || !scrollContainer) return;
      e.preventDefault();
      e.stopPropagation();

      // If menu is already open, close it
      if (showMenu) {
        setShowMenu(false);
        setDragHighlight(null);
        return;
      }

      currentIndexRef.current = rowIndex;

      const rect = getRowHighlightRect(table, rowIndex, scrollContainer);
      setDragHighlight(rect);

      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      const startX = e.clientX;
      const startY = e.clientY;
      let didDrag = false;

      const { moveTableRow } = require("prosemirror-tables");

      const updateHighlight = () => {
        const r = getRowHighlightRect(table, currentIndexRef.current, scrollContainer);
        setDragHighlight(r);
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (!didDrag && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
        didDrag = true;

        const current = currentIndexRef.current;
        const rows = Array.from(table.rows);

        if (current > 1) {
          const aboveRect = rows[current - 1].getBoundingClientRect();
          if (moveEvent.clientY < aboveRect.top + aboveRect.height / 2) {
            try {
              const pos = editor.view.posAtDOM(table, 0);
              moveTableRow({ from: current, to: current - 1, pos })(
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

        if (current < rows.length - 1) {
          const belowRect = rows[current + 1].getBoundingClientRect();
          if (moveEvent.clientY > belowRect.top + belowRect.height / 2) {
            try {
              const pos = editor.view.posAtDOM(table, 0);
              moveTableRow({ from: current, to: current + 1, pos })(
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
          const freshRect = getRowHighlightRect(table, currentIndexRef.current, scrollContainer);
          setDragHighlight(freshRect);
          setShowMenu(true);
        } else {
          setDragHighlight(null);
        }
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [editor, table, rowIndex, isHeader, scrollContainer, showMenu]
  );

  const handleDelete = useCallback(() => {
    const targetRow = currentIndexRef.current;
    try {
      const row = table.rows[targetRow];
      if (row && row.cells[0]) {
        const pos = editor.view.posAtDOM(row.cells[0], 0);
        editor.chain().focus().setTextSelection(pos).deleteRow().run();
      }
    } catch {
      /* ignore */
    }
    setShowMenu(false);
    setDragHighlight(null);
  }, [editor, table]);

  const handleDuplicate = useCallback(() => {
    const targetRow = currentIndexRef.current;
    try {
      const row = table.rows[targetRow];
      if (!row || !row.cells[0]) return;

      // Capture source cell content BEFORE adding the row
      const cellContents: (typeof editor.state.doc.content)[] = [];
      for (let c = 0; c < row.cells.length; c++) {
        try {
          const cellPos = editor.view.posAtDOM(row.cells[c], 0);
          const resolved = editor.state.doc.resolve(cellPos);
          // Walk up to the tableCell/tableHeader node
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

      // Add the empty row
      const pos = editor.view.posAtDOM(row.cells[0], 0);
      editor.chain().focus().setTextSelection(pos).addRowAfter().run();

      // Fill new row cells in a single transaction
      const newRow = table.rows[targetRow + 1];
      if (!newRow) return;

      const { tr } = editor.view.state;
      for (let c = 0; c < newRow.cells.length && c < cellContents.length; c++) {
        if (cellContents[c].size === 0) continue;
        try {
          const dstPos = editor.view.posAtDOM(newRow.cells[c], 0);
          const dstResolved = editor.state.doc.resolve(dstPos);
          let dstDepth = dstResolved.depth;
          while (dstDepth > 0) {
            const n = dstResolved.node(dstDepth);
            if (n.type.name === "tableCell" || n.type.name === "tableHeader") break;
            dstDepth--;
          }
          const from = tr.mapping.map(dstResolved.start(dstDepth));
          const to = tr.mapping.map(dstResolved.end(dstDepth));
          tr.replaceWith(from, to, cellContents[c]);
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
        className="absolute flex items-center"
        style={{
          top: rowRect.top,
          left: tableRect.left - 20,
          height: rowRect.height,
          zIndex: 5,
        }}
      >
        <div
          onMouseDown={handleMouseDown}
          className={`flex items-center justify-center w-4 rounded-sm text-fg-tertiary hover:text-text-primary transition-colors duration-100 ${
            isHeader ? "cursor-default opacity-30" : "cursor-grab"
          }`}
          style={{ height: Math.min(rowRect.height, 24) }}
          title={isHeader ? "Header row" : "Drag to reorder"}
        >
          <GripVertical className="h-3 w-3" />
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
            title="Duplicate row"
          >
            <Copy className="h-3 w-3" />
            Duplicate
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleDelete}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors duration-100 cursor-pointer"
            title="Delete row"
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
