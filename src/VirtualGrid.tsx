import { useRef, useState, type ReactNode } from "react";

export type ListItemData<T> = {
  id: React.Key;
  data: T;
};

export interface VirtualGridProps {
  height: number;
  width: number;

  columnWidth: number;
  columnCount: number;

  rowCount: number;
  rowHeight: number;

  overflowCount: number;
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
    columnWidth,
    rowHeight,
    columnCount,
    overflowCount,
    itemRenderer,
    stickyColumnCount = 0,
    stickyRowCount = 0,
    rowHover = false,
    columnHover = false,
  } = props;

  const outerRef = useRef<HTMLDivElement>(null);
  const [visibleIndex, setVisibleIndex] = useState({
    col: { start: 0, end: Math.floor(outerDimension.width / columnWidth) },
    row: { start: 0, end: Math.floor(outerDimension.height / rowHeight) },
  });
  const [mouseOverIndex, setMouseOverIndex] = useState<{
    row: number;
    column: number;
  } | null>(null);

  const innerDimension = {
    width: columnCount * columnWidth,
    height: rowCount * rowHeight,
  };

  const onInnerScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const outerEl = e.currentTarget;
    const top = outerEl.scrollTop;
    const bottom = top + outerEl.clientHeight;
    const left = outerEl.scrollLeft;
    const right = left + outerEl.clientWidth;

    const row = {
      start: Math.floor(top / rowHeight),
      end: Math.floor(bottom / rowHeight),
    };
    const col = {
      start: Math.floor(left / columnWidth),
      end: Math.floor(right / columnWidth),
    };
    setVisibleIndex({ row: row, col: col });
  };

  const rowStart = Math.max(0, visibleIndex.row.start - overflowCount);
  const rowEnd = Math.min(rowCount - 1, visibleIndex.row.end + overflowCount);
  const colStart = Math.max(0, visibleIndex.col.start - overflowCount);
  const colEnd = Math.min(
    columnCount - 1,
    visibleIndex.col.end + overflowCount
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
            width: columnWidth,
            height: rowHeight,
            position: "absolute",
            top: rowI * rowHeight,
            left: colJ * columnWidth,
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
            width: columnWidth,
            height: rowHeight,
            position: "absolute",
            top: rowI * rowHeight,
            left: colJ * columnWidth,
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

  const stickyColumnTop = stickyRowCount * rowHeight;
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
            width: columnWidth,
            height: rowHeight,
            position: "absolute",
            top: rowI * rowHeight - stickyColumnTop,
            left: colJ * columnWidth,
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

  const stickyRowLeft = stickyColumnCount * columnWidth;
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
            width: columnWidth,
            height: rowHeight,
            position: "absolute",
            top: rowI * rowHeight,
            left: colJ * columnWidth - stickyRowLeft,
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
      ref={outerRef}
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
