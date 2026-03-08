"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { Editor } from "@tiptap/react";

const HIDE_DELAY_MS = 150;
const BOUNDARY_THRESHOLD = 8;

export interface TableHoverState {
  table: HTMLTableElement | null;
  rowIndex: number | null;
  colIndex: number | null;
  isNearBottomEdge: boolean;
  isNearRightEdge: boolean;
  nearRowBoundary: number | null;
  nearColBoundary: number | null;
  cell: HTMLTableCellElement | null;
}

const INITIAL_STATE: TableHoverState = {
  table: null,
  rowIndex: null,
  colIndex: null,
  isNearBottomEdge: false,
  isNearRightEdge: false,
  nearRowBoundary: null,
  nearColBoundary: null,
  cell: null,
};

/**
 * Detects which table the mouse is hovering, using mouseover/mouseout
 * on the editor DOM with a debounced hide so controls stay clickable.
 *
 * The `cancelHide` / `scheduleHide` methods are exposed so the controls
 * container can call them on mouseenter / mouseleave — this keeps
 * controls visible when the mouse moves from the table to a button.
 */
export function useTableHover(editor: Editor | null) {
  const [state, setState] = useState<TableHoverState>(INITIAL_STATE);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTableRef = useRef<HTMLTableElement | null>(null);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimerRef.current = setTimeout(() => {
      activeTableRef.current = null;
      setState(INITIAL_STATE);
    }, HIDE_DELAY_MS);
  }, [cancelHide]);

  // mouseover (bubbles) — detect when mouse enters a table
  useEffect(() => {
    if (!editor?.view?.dom) return;
    const dom = editor.view.dom;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const table = target.closest("table") as HTMLTableElement | null;
      if (table && dom.contains(table)) {
        cancelHide();
        activeTableRef.current = table;

        const cell = target.closest("td, th") as HTMLTableCellElement | null;

        // Determine row/col from the cell
        let rowIndex: number | null = null;
        let colIndex: number | null = null;
        if (cell) {
          const row = cell.parentElement as HTMLTableRowElement;
          rowIndex = Array.from(table.rows).indexOf(row);
          colIndex = Array.from(row.cells).indexOf(cell);
        }

        const tableRect = table.getBoundingClientRect();

        // Edge detection
        const isNearBottomEdge =
          e.clientY > tableRect.bottom - 12 && e.clientX >= tableRect.left && e.clientX <= tableRect.right;
        const isNearRightEdge =
          e.clientX > tableRect.right - 12 && e.clientY >= tableRect.top && e.clientY <= tableRect.bottom;

        // Row boundary proximity
        let nearRowBoundary: number | null = null;
        const rows = Array.from(table.rows);
        for (let i = 0; i < rows.length; i++) {
          const rowRect = rows[i].getBoundingClientRect();
          if (Math.abs(e.clientY - rowRect.bottom) < BOUNDARY_THRESHOLD) {
            nearRowBoundary = i;
            break;
          }
        }

        // Column boundary proximity
        let nearColBoundary: number | null = null;
        if (rows.length > 0 && e.clientY < tableRect.top + 16) {
          const headerCells = Array.from(rows[0].cells);
          for (let i = 0; i < headerCells.length; i++) {
            const cellRect = headerCells[i].getBoundingClientRect();
            if (Math.abs(e.clientX - cellRect.right) < BOUNDARY_THRESHOLD) {
              nearColBoundary = i;
              break;
            }
          }
        }

        setState({
          table,
          rowIndex,
          colIndex,
          isNearBottomEdge,
          isNearRightEdge,
          nearRowBoundary,
          nearColBoundary,
          cell: cell || null,
        });
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const table = target.closest("table") as HTMLTableElement | null;
      if (!table) return;
      // Check if the mouse is leaving the table entirely
      const related = e.relatedTarget as HTMLElement | null;
      const stillInTable = related?.closest("table") === table;
      if (!stillInTable) {
        scheduleHide();
      }
    };

    dom.addEventListener("mouseover", handleMouseOver);
    dom.addEventListener("mouseout", handleMouseOut);

    return () => {
      dom.removeEventListener("mouseover", handleMouseOver);
      dom.removeEventListener("mouseout", handleMouseOut);
      cancelHide();
    };
  }, [editor, cancelHide, scheduleHide]);

  return { state, cancelHide, scheduleHide };
}
