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
    isSticky: boolean;
    rowIndex: number;
    columnIndex: number;
  }) => React.ReactNode;

  stickyRowCount?: number;
  stickyColumnCount?: number;
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
  } = props;

  const outerRef = useRef<HTMLDivElement>(null);
  const [visibleIndex, setVisibleIndex] = useState({
    col: { start: 0, end: Math.floor(outerDimension.width / columnWidth) },
    row: { start: 0, end: Math.floor(outerDimension.height / rowHeight) },
  });
  console.log("initial", visibleIndex);

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

      items.push(
        <div
          key={`${rowI}:${colJ}`}
          style={{
            width: columnWidth,
            height: rowHeight,
            position: "absolute",
            top: rowI * rowHeight,
            left: colJ * columnWidth,
          }}
        >
          {itemRenderer({ isSticky: false, rowIndex: rowI, columnIndex: colJ })}
        </div>
      );
    }
  }

  const placed = new Set<string>();
  const stickyItems: ReactNode[] = [];
  for (let rowI = 0; rowI < stickyRowCount; rowI++) {
    for (let colJ = 0; colJ < stickyColumnCount; colJ++) {
      const key = `${rowI}:${colJ}`;
      placed.add(key);
      stickyItems.push(
        <div
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

      stickyColumns.push(
        <div
          key={key}
          style={{
            width: columnWidth,
            height: rowHeight,
            position: "absolute",
            top: rowI * rowHeight - stickyRowCount * rowHeight,
            left: colJ * columnWidth,
          }}
        >
          {itemRenderer({
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

      stickyRows.push(
        <div
          key={key}
          style={{
            width: columnWidth,
            height: rowHeight,
            position: "absolute",
            top: rowI * rowHeight,
            left: colJ * columnWidth - stickyColumnCount * columnWidth,
          }}
        >
          {itemRenderer({
            isSticky: true,
            rowIndex: rowI,
            columnIndex: colJ,
          })}
        </div>
      );
    }
  }

  const stickyColumnTop = stickyRowCount * rowHeight;
  const stickyRowLeft = stickyColumnCount * columnWidth;
  return (
    <div
      style={{ ...outerDimension, overflow: "auto" }}
      ref={outerRef}
      onScroll={onInnerScroll}
    >
      <div style={{ position: "relative", ...innerDimension }}>
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
        {items}
      </div>
    </div>
  );
}
