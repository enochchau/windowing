import { useState, type ReactNode } from "react";
import type { NumberOrNumberFn } from "./types";
import { usePlacer } from "./usePlacer";

export type ListItemData<T> = {
  id: React.Key;
  data: T;
};

export interface VirtualGridProps {
  height: number;
  width: number;

  columnWidth: NumberOrNumberFn;
  columnCount: number;
  /** additional columns to render outside the window */
  columnOverflow: number;

  rowCount: number;
  rowHeight: NumberOrNumberFn;
  /** additional rows to render outside the window */
  rowOverflow: number;

  itemRenderer: (args: {
    isHovering: boolean;
    isSticky: boolean;
    rowIndex: number;
    columnIndex: number;
  }) => React.ReactNode;

  stickyRowCount?: number;
  stickyColumnCount?: number;

  rowHover?: boolean;
  columnHover?: boolean;
}
export function VirtualGrid(props: VirtualGridProps) {
  const outerDimension = {
    height: props.height,
    width: props.width,
  };
  const {
    rowCount,
    rowOverflow,
    columnCount,
    columnOverflow,
    itemRenderer,
    stickyColumnCount = 0,
    stickyRowCount = 0,
    rowHover = false,
    columnHover = false,
  } = props;

  const {
    dimensions: columnWidths,
    placer: columnPlacer,
    sum: columnWidthsSum,
  } = usePlacer(props.columnWidth, columnCount);

  const {
    placer: rowPlacer,
    sum: rowHeightsSum,
    dimensions: rowHeights,
  } = usePlacer(props.rowHeight, rowCount);

  const [visibleIndex, setVisibleIndex] = useState({
    col: {
      start: 0,
      end: columnPlacer.placementToIndex(outerDimension.width),
    },
    row: { start: 0, end: rowPlacer.placementToIndex(outerDimension.height) },
  });
  const [mouseOverIndex, setMouseOverIndex] = useState<{
    row: number;
    column: number;
  } | null>(null);

  const innerDimension = {
    width: columnWidthsSum,
    height: rowHeightsSum,
  };

  const onInnerScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const outerEl = e.currentTarget;
    const top = outerEl.scrollTop;
    const bottom = top + outerEl.clientHeight;
    const left = outerEl.scrollLeft;
    const right = left + outerEl.clientWidth;

    const row = {
      start: rowPlacer.placementToIndex(top),
      end: rowPlacer.placementToIndex(bottom),
    };
    const col = {
      start: columnPlacer.placementToIndex(left),
      end: columnPlacer.placementToIndex(right),
    };
    setVisibleIndex({ row: row, col: col });
  };

  const rowStart = Math.max(0, visibleIndex.row.start - rowOverflow);
  const rowEnd = Math.min(rowCount - 1, visibleIndex.row.end + rowOverflow);
  const colStart = Math.max(0, visibleIndex.col.start - columnOverflow);
  const colEnd = Math.min(
    columnCount - 1,
    visibleIndex.col.end + columnOverflow
  );

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

      items.push(
        <div
          key={`${rowI}:${colJ}`}
          onMouseEnter={() => handleItemMouseEnter({ column: colJ, row: rowI })}
          style={{
            width: columnWidths[colJ],
            height: rowHeights[rowI],
            position: "absolute",
            top: rowPlacer.indexToPlacement(rowI),
            left: columnPlacer.indexToPlacement(colJ),
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

      stickyItems.push(
        <div
          onMouseEnter={() => handleItemMouseEnter({ column: colJ, row: rowI })}
          key={key}
          style={{
            width: columnWidths[colJ],
            height: rowHeights[rowI],
            position: "absolute",
            top: rowPlacer.indexToPlacement(rowI),
            left: columnPlacer.indexToPlacement(colJ),
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

  const stickyColumnTop = rowPlacer.indexToPlacement(stickyRowCount);
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
      stickyColumns.push(
        <div
          onMouseEnter={() => handleItemMouseEnter({ column: colJ, row: rowI })}
          key={key}
          style={{
            width: columnWidths[colJ],
            height: rowHeights[rowI],
            position: "absolute",
            top: rowPlacer.indexToPlacement(rowI) - stickyColumnTop,
            left: columnPlacer.indexToPlacement(colJ),
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

  const stickyRowLeft = columnPlacer.indexToPlacement(stickyColumnCount);
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
      stickyRows.push(
        <div
          onMouseEnter={() => handleItemMouseEnter({ column: colJ, row: rowI })}
          key={key}
          style={{
            width: columnWidths[colJ],
            height: rowHeights[rowI],
            position: "absolute",
            top: rowPlacer.indexToPlacement(rowI),
            left: columnPlacer.indexToPlacement(colJ) - stickyRowLeft,
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
      style={{ ...outerDimension, overflow: "auto" }}
      onScroll={onInnerScroll}
      onMouseLeave={onMouseLeaveOuterEl}
    >
      <div style={{ position: "relative", ...innerDimension }}>
        {/* sticky rows container has to come first */}
        {stickyRows.length && (
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
        {stickyItems.length && (
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
        {stickyColumns.length && (
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
        {items}
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
