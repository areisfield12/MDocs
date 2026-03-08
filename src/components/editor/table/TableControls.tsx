"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";
import type { Editor } from "@tiptap/react";
import { useTableHover } from "./useTableHover";
import { useTableGeometry } from "./useTableGeometry";
import { TableAddRowButton } from "./TableAddRowButton";
import { TableAddColumnButton } from "./TableAddColumnButton";
import { TableRowHandle } from "./TableRowHandle";
import { TableColumnHandle } from "./TableColumnHandle";
import { TableContextMenu } from "./TableContextMenu";

interface TableControlsProps {
  editor: Editor;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

export function TableControls({
  editor,
  scrollContainerRef,
}: TableControlsProps) {
  const { state: hoverState, cancelHide, scheduleHide } = useTableHover(editor);
  const geometry = useTableGeometry(
    hoverState.table,
    scrollContainerRef.current,
    editor
  );

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    cell: HTMLTableCellElement;
    table: HTMLTableElement;
  } | null>(null);

  // Handle right-click on table cells
  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cell = target.closest("td, th") as HTMLTableCellElement | null;
      const table = target.closest("table") as HTMLTableElement | null;
      if (cell && table) {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, cell, table });
      }
    },
    []
  );

  useEffect(() => {
    if (!editor?.view?.dom) return;
    const dom = editor.view.dom;
    dom.addEventListener("contextmenu", handleContextMenu);
    return () => dom.removeEventListener("contextmenu", handleContextMenu);
  }, [editor, handleContextMenu]);

  // Handle "⋮" click on cell hover
  const handleCellMenuClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (hoverState.cell && hoverState.table) {
        const rect = hoverState.cell.getBoundingClientRect();
        setContextMenu({
          x: rect.right,
          y: rect.top,
          cell: hoverState.cell,
          table: hoverState.table,
        });
      }
    },
    [hoverState.cell, hoverState.table]
  );

  if (!hoverState.table) {
    return contextMenu ? (
      <TableContextMenu
        editor={editor}
        table={contextMenu.table}
        cell={contextMenu.cell}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        onClose={() => setContextMenu(null)}
      />
    ) : null;
  }

  const activeTable = hoverState.table;
  const { tableRect, rowRects, colRects } = geometry;
  const totalRows = rowRects.length;
  const totalCols = colRects.length;
  const lastRowIndex = totalRows - 1;
  const lastColIndex = totalCols - 1;

  return (
    <>
      {/* Controls overlay — cancel hide timer when mouse enters, schedule hide when leaving */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 5 }}
      >
        <div
          className="pointer-events-auto"
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        >
          {/* Add row button at bottom edge */}
          {lastRowIndex >= 0 && (
            <TableAddRowButton
              editor={editor}
              mode="bottom-edge"
              tableRect={tableRect}
              rowIndex={lastRowIndex}
              table={activeTable}
            />
          )}

          {/* Add column button at right edge */}
          {lastColIndex >= 0 && (
            <TableAddColumnButton
              editor={editor}
              mode="right-edge"
              tableRect={tableRect}
              colIndex={lastColIndex}
              table={activeTable}
            />
          )}

          {/* Between-row "+" buttons — one per row boundary */}
          {rowRects.map((rowRect, i) => (
            <TableAddRowButton
              key={`between-row-${i}`}
              editor={editor}
              mode="between-rows"
              tableRect={tableRect}
              rowRect={rowRect}
              rowIndex={i}
              table={activeTable}
            />
          ))}

          {/* Between-column "+" buttons — one per column boundary */}
          {colRects.map((colRect, i) => (
            <TableAddColumnButton
              key={`between-col-${i}`}
              editor={editor}
              mode="between-columns"
              tableRect={tableRect}
              colRect={colRect}
              colIndex={i}
              table={activeTable}
            />
          ))}

          {/* Row drag handles — one per row, always visible when table is hovered */}
          {rowRects.map((rowRect, i) => (
            <TableRowHandle
              key={`row-handle-${i}`}
              editor={editor}
              table={activeTable}
              rowIndex={i}
              rowRect={rowRect}
              tableRect={tableRect}
              totalRows={totalRows}
              scrollContainer={scrollContainerRef.current}
            />
          ))}

          {/* Column drag handles — one per column, always visible when table is hovered */}
          {colRects.map((colRect, i) => (
            <TableColumnHandle
              key={`col-handle-${i}`}
              editor={editor}
              table={activeTable}
              colIndex={i}
              colRect={colRect}
              tableRect={tableRect}
              totalCols={totalCols}
              scrollContainer={scrollContainerRef.current}
            />
          ))}

          {/* Cell menu button "⋮" */}
          {hoverState.cell && !contextMenu && (
            <CellMenuButton
              cell={hoverState.cell}
              scrollContainer={scrollContainerRef.current}
              onClick={handleCellMenuClick}
            />
          )}
        </div>
      </div>

      {/* Context menu (fixed position) */}
      {contextMenu && (
        <TableContextMenu
          editor={editor}
          table={contextMenu.table}
          cell={contextMenu.cell}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}

/** Small "⋮" button that appears on cell hover */
function CellMenuButton({
  cell,
  scrollContainer,
  onClick,
}: {
  cell: HTMLTableCellElement;
  scrollContainer: HTMLElement | null;
  onClick: (e: React.MouseEvent) => void;
}) {
  if (!scrollContainer) return null;

  const cellRect = cell.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();
  const scrollTop = scrollContainer.scrollTop;

  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="absolute flex items-center justify-center w-5 h-5 rounded-sm text-fg-tertiary hover:text-text-primary hover:bg-bg-muted cursor-pointer transition-colors duration-100 opacity-40 hover:opacity-100"
      style={{
        top: cellRect.top - containerRect.top + scrollTop + 2,
        left: cellRect.right - containerRect.left - 20,
        zIndex: 6,
      }}
      title="Table cell options"
    >
      <MoreVertical className="h-3 w-3" />
    </button>
  );
}
