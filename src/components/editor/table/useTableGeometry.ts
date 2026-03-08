"use client";

import { useEffect, useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";

export interface RelativeRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export interface TableGeometry {
  tableRect: RelativeRect;
  rowRects: RelativeRect[];
  colRects: RelativeRect[];
}

const EMPTY_GEOMETRY: TableGeometry = {
  tableRect: { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 },
  rowRects: [],
  colRects: [],
};

function toRelativeRect(
  rect: DOMRect,
  containerRect: DOMRect,
  scrollTop: number
): RelativeRect {
  return {
    top: rect.top - containerRect.top + scrollTop,
    left: rect.left - containerRect.left,
    width: rect.width,
    height: rect.height,
    bottom: rect.top - containerRect.top + scrollTop + rect.height,
    right: rect.left - containerRect.left + rect.width,
  };
}

export function useTableGeometry(
  table: HTMLTableElement | null,
  scrollContainer: HTMLElement | null,
  editor: Editor | null
): TableGeometry {
  const [geometry, setGeometry] = useState<TableGeometry>(EMPTY_GEOMETRY);

  const recalculate = useCallback(() => {
    if (!table || !scrollContainer) {
      setGeometry(EMPTY_GEOMETRY);
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const scrollTop = scrollContainer.scrollTop;

    const tableRect = toRelativeRect(
      table.getBoundingClientRect(),
      containerRect,
      scrollTop
    );

    const rows = Array.from(table.rows);
    const rowRects = rows.map((row) =>
      toRelativeRect(row.getBoundingClientRect(), containerRect, scrollTop)
    );

    // Compute column rects from header row cells
    const colRects: RelativeRect[] = [];
    if (rows.length > 0) {
      const headerCells = Array.from(rows[0].cells);
      for (const cell of headerCells) {
        const cellRect = cell.getBoundingClientRect();
        colRects.push({
          top: tableRect.top,
          left: cellRect.left - containerRect.left,
          width: cellRect.width,
          height: tableRect.height,
          bottom: tableRect.bottom,
          right: cellRect.left - containerRect.left + cellRect.width,
        });
      }
    }

    setGeometry({ tableRect, rowRects, colRects });
  }, [table, scrollContainer]);

  // Recalculate on transaction
  useEffect(() => {
    if (!editor) return;
    const handler = () => recalculate();
    editor.on("transaction", handler);
    return () => {
      editor.off("transaction", handler);
    };
  }, [editor, recalculate]);

  // Recalculate on scroll
  useEffect(() => {
    if (!scrollContainer) return;
    const handler = () => recalculate();
    scrollContainer.addEventListener("scroll", handler);
    return () => scrollContainer.removeEventListener("scroll", handler);
  }, [scrollContainer, recalculate]);

  // Recalculate on resize
  useEffect(() => {
    const handler = () => recalculate();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [recalculate]);

  // Recalculate when table changes
  useEffect(() => {
    recalculate();
  }, [table, recalculate]);

  return geometry;
}
