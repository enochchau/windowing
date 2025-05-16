import type {
  NumberOrNumberFn,
  Placer,
  ScrollToCell,
  VisibleGridIndex,
} from "./types";
import { usePlacer } from "./usePlacer";
import { useCallback, useRef, useState } from "react";

export interface UseVirtualGridArgs {
  height: number;
  width: number;
  rowCount: number;
  columnCount: number;
  columnWidth: NumberOrNumberFn;
  rowHeight: NumberOrNumberFn;
  stickyColumnCount?: number;
  stickyRowCount?: number;
}

export interface UseVirtualGridReturn {
  gridProps: {
    outerRef: React.RefObject<HTMLDivElement | null>;
    outerWidth: number;
    outerHeight: number;

    innerRef: React.RefObject<HTMLDivElement | null>;
    innerWidth: number;
    innerHeight: number;
    onOuterScroll: React.UIEventHandler<HTMLDivElement>;

    getColumnWidth: (i: number) => number;
    getRowHeight: (i: number) => number;
    getColumnPlacement: Placer["indexToPlacement"];
    getRowPlacement: Placer["indexToPlacement"];

    visibleIndex: VisibleGridIndex;
    rowCount: number;
    columnCount: number;

    stickyColumnCount: number;
    stickyRowCount: number;
  };
  scrollToCell: ScrollToCell;
}

export function useVirtualGrid(args: UseVirtualGridArgs): UseVirtualGridReturn {
  const {
    height: outerHeight,
    width: outerWidth,
    rowCount,
    columnCount,
    stickyColumnCount,
    stickyRowCount,
  } = args;
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const {
    getDimension: getColumnWidth,
    placer: columnPlacer,
    sum: columnWidthsSum,
  } = usePlacer(args.columnWidth, columnCount);

  const {
    placer: rowPlacer,
    sum: rowHeightsSum,
    getDimension: getRowHeight,
  } = usePlacer(args.rowHeight, rowCount);

  const [visibleIndex, setVisibleIndex] = useState<VisibleGridIndex>({
    column: {
      start: 0,
      end: columnPlacer.placementToIndex(outerWidth),
    },
    row: { start: 0, end: rowPlacer.placementToIndex(outerHeight) },
  });

  const onOuterScroll: React.UIEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const outerEl = e.currentTarget;
      const top = outerEl.scrollTop;
      const bottom = top + outerEl.clientHeight;
      const left = outerEl.scrollLeft;
      const right = left + outerEl.clientWidth;

      const row = {
        start: rowPlacer.placementToIndex(top),
        end: rowPlacer.placementToIndex(bottom),
      };
      const column = {
        start: columnPlacer.placementToIndex(left),
        end: columnPlacer.placementToIndex(right),
      };
      setVisibleIndex({ row: row, column: column });
    },
    [rowPlacer, columnPlacer]
  );

  const scrollToCell: ScrollToCell = useCallback(
    (args, opts) => {
      if (!outerRef.current) return;

      let top = rowPlacer.indexToPlacement(args.rowIndex);
      if (opts?.block === "center") {
        top = top - outerHeight / 2;
      } else if (opts?.block === "end") {
        top = top - (outerHeight - getRowHeight(args.rowIndex));
      } else {
        let stickyRowOffset = 0;
        if (stickyRowCount) {
          stickyRowOffset = rowPlacer.indexToPlacement(stickyRowCount);
        }
        top = top - stickyRowOffset;
      }

      let left = columnPlacer.indexToPlacement(args.columnIndex);
      if (opts?.inline === "center") {
        left = left - outerWidth / 2;
      } else if (opts?.inline === "end") {
        left = left - (outerWidth - getColumnWidth(args.columnIndex));
      } else {
        let stickyColumnOffset = 0;
        if (stickyColumnCount) {
          stickyColumnOffset = columnPlacer.indexToPlacement(stickyColumnCount);
        }
        left = left - stickyColumnOffset;
      }

      outerRef.current.scrollTo({ top, left });
    },
    [
      rowPlacer,
      columnPlacer,
      stickyColumnCount,
      stickyRowCount,
      outerHeight,
      outerWidth,
      getColumnWidth,
      getRowHeight,
    ]
  );

  return {
    gridProps: {
      outerRef,
      outerWidth,
      outerHeight,

      innerRef,
      innerWidth: columnWidthsSum,
      innerHeight: rowHeightsSum,
      onOuterScroll: onOuterScroll,

      getColumnWidth,
      getColumnPlacement: columnPlacer.indexToPlacement,
      getRowHeight,
      getRowPlacement: rowPlacer.indexToPlacement,

      visibleIndex,
      rowCount,
      columnCount,

      stickyColumnCount: stickyColumnCount ?? 0,
      stickyRowCount: stickyRowCount ?? 0,
    },
    scrollToCell,
  };
}
