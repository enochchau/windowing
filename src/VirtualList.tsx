import { useRef, useState, type ReactNode } from "react";
import { createIndexToPlacement, createPlacementToIndex, numberOrFnToFn, sum } from "./util";
import type { NumberOrNumberFn } from "./types";

export interface VirtualListProps {
  overflowCount: number;
  width: number;
  itemCount: number;
  height: number;
  itemHeight: NumberOrNumberFn;
  itemRenderer: (args: { index: number; isSticky: boolean }) => ReactNode;
  stickyRowCount?: number;
}
export function VirtualList(props: VirtualListProps) {
  const outerDimension = {
    height: props.height,
    width: props.width,
  };
  const { itemCount, stickyRowCount, overflowCount, itemRenderer } = props;

  const getItemHeight = numberOrFnToFn(props.itemHeight)

  const itemHeights: number[] = [];
  for (let i = 0; i < itemCount; i++) {
    itemHeights.push(getItemHeight(i));
  }
  const dimensionToIndex = createPlacementToIndex(itemHeights)
  const indexToDimension = createIndexToPlacement(itemHeights)

  const outerRef = useRef<HTMLDivElement>(null);
  const [visibleIndex, setVisibleIndex] = useState({
    start: 0,
    end:
      dimensionToIndex(outerDimension.height) + overflowCount,
  });
  const innerDivHeight = sum(itemHeights);

  const onInnerScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const outerEl = e.currentTarget;
    const top = outerEl.scrollTop;
    const bottom = top + e.currentTarget.clientHeight;

    const start = dimensionToIndex(top);
    const end = dimensionToIndex(bottom);
    setVisibleIndex({ start, end });
  };

  const items: ReactNode[] = [];

  for (
    let i = Math.max(0, visibleIndex.start - overflowCount);
    i <= Math.min(itemCount - 1, visibleIndex.end + overflowCount);
    i++
  ) {
    if (typeof stickyRowCount === "number") {
      if (i >= 0 && i < stickyRowCount) {
        continue;
      }
    }

    items.push(
      <div
        key={i}
        style={{
          height: getItemHeight(i),
          width: "100%",
          position: "absolute",
          left: 0,
          top: indexToDimension(i),
          overflow: "hidden",
        }}
      >
        {itemRenderer({ isSticky: false, index: i })}
      </div>
    );
  }

  const stickyItems: ReactNode[] = [];
  if (typeof stickyRowCount === "number") {
    for (let i = 0; i < stickyRowCount; i++) {
      stickyItems.push(
        <div
          key={i}
          style={{
            height: getItemHeight(i),
            width: "100%",
            position: "sticky",
            left: 0,
            top: indexToDimension(i),
            overflow: "hidden",
            zIndex: 2,
          }}
        >
          {itemRenderer({ isSticky: true, index: i })}
        </div>
      );
    }
  }

  return (
    <div
      style={{ ...outerDimension, overflow: "auto" }}
      ref={outerRef}
      onScroll={onInnerScroll}
    >
      <div style={{ position: "relative", height: innerDivHeight }}>
        {stickyItems}
        {items}
      </div>
    </div>
  );
}
