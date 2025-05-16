import { type ReactNode } from "react";
import type { UseVirtualListReturn } from "./useVirtualList";

export type VirtualListProps = UseVirtualListReturn["listProps"] & {
  overflowCount: number;
  itemRenderer: (args: { index: number; isSticky: boolean }) => ReactNode;
  width: number;
};
export function VirtualList(props: VirtualListProps) {
  const {
    innerRef,
    innerHeight,
    outerRef,
    outerHeight,

    visibleIndex,
    itemCount,
    stickyItemCount,
    overflowCount,
    itemRenderer,

    getItemHeight,
    getItemPlacement,
    onOuterScroll,

    width,
  } = props;

  const items: ReactNode[] = [];

  for (
    let i = Math.max(0, visibleIndex.start - overflowCount);
    i <= Math.min(itemCount - 1, visibleIndex.end + overflowCount);
    i++
  ) {
    if (typeof stickyItemCount === "number") {
      if (i >= 0 && i < stickyItemCount) {
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
          top: getItemPlacement(i),
        }}
      >
        {itemRenderer({ isSticky: false, index: i })}
      </div>
    );
  }

  const stickyItems: ReactNode[] = [];
  if (typeof stickyItemCount === "number") {
    for (let i = 0; i < stickyItemCount; i++) {
      stickyItems.push(
        <div
          key={i}
          style={{
            height: getItemHeight(i),
            width: "100%",
            position: "sticky",
            left: 0,
            top: getItemPlacement(i),
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
      ref={outerRef}
      style={{ height: outerHeight, overflow: "auto", width }}
      onScroll={onOuterScroll}
    >
      <div style={{ position: "relative", height: innerHeight }} ref={innerRef}>
        {stickyItems}
        {items}
      </div>
    </div>
  );
}
