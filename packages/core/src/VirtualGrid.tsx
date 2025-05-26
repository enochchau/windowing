import { useState, type ReactNode } from "react";
import type { UseVirtualGridReturn } from "./useVirtualGrid";

export type VirtualGridProps = UseVirtualGridReturn["gridProps"] & {
  rowOverflow?: number;
  columnOverflow?: number;

  itemRenderer: (args: {
    isHovering: boolean;
    isSticky: boolean;
    rowIndex: number;
    columnIndex: number;
  }) => React.ReactNode;

  rowHover?: boolean;
  columnHover?: boolean;
};
export function VirtualGrid(props: VirtualGridProps) {
  const {
    outerRef,
    outerWidth,
    outerHeight,
    innerRef,
    innerWidth,
    innerHeight,
    onOuterScroll: onOuterScroll,
    getColumnWidth,
    getRowHeight,
    getColumnPlacement,
    getRowPlacement,
    visibleIndex,
    itemRenderer,
    stickyColumnCount,
    stickyRowCount,
    rowHover = false,
    columnHover = false,
    rowOverflow = 3,
    rowCount,
    columnCount,
    columnOverflow = 3,
  } = props;
  const [mouseOverIndex, setMouseOverIndex] = useState<{
    row: number;
    column: number;
  } | null>(null);

  const rowStart = Math.max(0, visibleIndex.row.start - rowOverflow);
  const rowEnd = Math.min(rowCount - 1, visibleIndex.row.end + rowOverflow);
  const colStart = Math.max(0, visibleIndex.column.start - columnOverflow);
  const colEnd = Math.min(
    columnCount - 1,
    visibleIndex.column.end + columnOverflow
  );
  const stickyRowLeft = getColumnPlacement(stickyColumnCount);
  const stickyColumnTop = getRowPlacement(stickyRowCount);

  const items: ReactNode[] = [];
  for (let rowI = rowStart; rowI <= rowEnd; rowI++) {
    if (rowI >= 0 && rowI < stickyRowCount) {
      continue;
    }
    for (let colJ = colStart; colJ <= colEnd; colJ++) {
      if (colJ >= 0 && colJ < stickyColumnCount) {
        continue;
      }

      const isHovering = checkHovering({
        colJ,
        rowI,
        rowHover,
        columnHover,
        mouseOverIndex,
      });

      const top = getRowPlacement(rowI) 
      const left = getColumnPlacement(colJ) 
      items.push(
        <div
          key={`${rowI}:${colJ}`}
          onMouseEnter={() => handleItemMouseEnter({ column: colJ, row: rowI })}
          style={{
            width: getColumnWidth(colJ),
            height: getRowHeight(rowI),
            position: "absolute",
            transform: `translate(${left}px, ${top}px)`,
          }}
        >
          {itemRenderer({
            isHovering,
            isSticky: false,
            rowIndex: rowI,
            columnIndex: colJ,
          })}
        </div>
      );
    }
  }

  const handleItemMouseEnter = (args: { row: number; column: number }) => {
    if (!rowHover && !columnHover) return;
    setMouseOverIndex(args);
  };

  const onMouseLeaveOuterEl = () => {
    setMouseOverIndex(null);
  };

  const placed = new Set<string>();
  const stickyItems: ReactNode[] = [];
  for (let rowI = 0; rowI < stickyRowCount; rowI++) {
    for (let colJ = 0; colJ < stickyColumnCount; colJ++) {
      const key = `${rowI}:${colJ}`;
      placed.add(key);

      const isHovering = checkHovering({
        colJ,
        rowI,
        rowHover,
        columnHover,
        mouseOverIndex,
      });

      const top = getRowPlacement(rowI);
      const left = getColumnPlacement(colJ);
      stickyItems.push(
        <div
          onMouseEnter={() => handleItemMouseEnter({ column: colJ, row: rowI })}
          key={key}
          style={{
            width: getColumnWidth(colJ),
            height: getRowHeight(rowI),
            position: "absolute",
            overflow: "hidden",
            transform: `translate(${left}px, ${top}px)`,
          }}
        >
          {itemRenderer({
            isHovering,
            isSticky: true,
            rowIndex: rowI,
            columnIndex: colJ,
          })}
        </div>
      );
    }
  }

  const stickyColumns: ReactNode[] = [];
  for (let rowI = rowStart; rowI <= rowEnd; rowI++) {
    for (let colJ = 0; colJ < stickyColumnCount; colJ++) {
      const key = `${rowI}:${colJ}`;
      if (placed.has(key)) continue;

      const isHovering = checkHovering({
        colJ,
        rowI,
        rowHover,
        columnHover,
        mouseOverIndex,
      });
      const top = getRowPlacement(rowI) - stickyColumnTop;
      const left = getColumnPlacement(colJ);
      stickyColumns.push(
        <div
          onMouseEnter={() => handleItemMouseEnter({ column: colJ, row: rowI })}
          key={key}
          style={{
            width: getColumnWidth(colJ),
            height: getRowHeight(rowI),
            position: "absolute",
            overflow: "hidden",
            transform: `translate(${left}px, ${top}px)`,
          }}
        >
          {itemRenderer({
            isHovering,
            isSticky: true,
            rowIndex: rowI,
            columnIndex: colJ,
          })}
        </div>
      );
    }
  }

  const stickyRows: ReactNode[] = [];
  for (let rowI = 0; rowI < stickyRowCount; rowI++) {
    for (let colJ = colStart; colJ <= colEnd; colJ++) {
      const key = `${rowI}:${colJ}`;
      if (placed.has(key)) continue;

      const isHovering = checkHovering({
        colJ,
        rowI,
        rowHover,
        columnHover,
        mouseOverIndex,
      });

      const top = getRowPlacement(rowI);
      const left = getColumnPlacement(colJ) - stickyRowLeft;
      stickyRows.push(
        <div
          onMouseEnter={() => handleItemMouseEnter({ column: colJ, row: rowI })}
          key={key}
          style={{
            width: getColumnWidth(colJ),
            height: getRowHeight(rowI),
            position: "absolute",
            overflow: "hidden",
            transform: `translate(${left}px, ${top}px)`,
          }}
        >
          {itemRenderer({
            isHovering,
            isSticky: true,
            rowIndex: rowI,
            columnIndex: colJ,
          })}
        </div>
      );
    }
  }

  return (
    <div
      ref={outerRef}
      style={{ height: outerHeight, width: outerWidth, overflow: "auto" }}
      onScroll={onOuterScroll}
      onMouseLeave={onMouseLeaveOuterEl}
    >
      <div
        style={{ position: "relative", height: innerHeight, width: innerWidth }}
        ref={innerRef}
      >
        {items}
        {/* sticky rows container has to come first */}
        {stickyRows.length > 0 && (
          <div
            style={{
              position: "sticky",
              top: 0,
              left: stickyRowLeft,
              height: 0,
              width: `calc(100% - ${stickyRowLeft}px)`,
              zIndex: 2,
            }}
          >
            {stickyRows}
          </div>
        )}
        {stickyItems.length > 0 && (
          <div
            style={{
              position: "sticky",
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              zIndex: 3,
            }}
          >
            {stickyItems}
          </div>
        )}
        {stickyColumns.length > 0 && (
          <div
            style={{
              position: "sticky",
              top: stickyColumnTop,
              left: 0,
              height: `calc(100% - ${stickyColumnTop}px)`,
              width: 0,
              zIndex: 2,
            }}
          >
            {stickyColumns}
          </div>
        )}
      </div>
    </div>
  );
}

function checkHovering({
  rowI,
  colJ,
  rowHover,
  columnHover,
  mouseOverIndex,
}: {
  rowI: number;
  colJ: number;
  rowHover: boolean;
  columnHover: boolean;
  mouseOverIndex: null | { row: number; column: number };
}) {
  return !!(
    mouseOverIndex &&
    ((rowHover && rowI === mouseOverIndex.row) ||
      (columnHover && colJ === mouseOverIndex.column))
  );
}
