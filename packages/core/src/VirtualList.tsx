import { type ReactNode } from "react";
import type { UseVirtualListReturn } from "./useVirtualList";

export type VirtualListProps = UseVirtualListReturn["listProps"] & {
  overflowCount?: number;
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
    overflowCount = 0,
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

    const top = getItemPlacement(i);
    items.push(
      <div
        key={i}
        style={{
          height: getItemHeight(i),
          width: "100%",
          position: "absolute",
          transform: `translateY(${top}px)`,
        }}
      >
        {itemRenderer({ isSticky: false, index: i })}
      </div>,
    );
  }

  const stickyItems: ReactNode[] = [];
  if (typeof stickyItemCount === "number") {
    for (let i = 0; i < stickyItemCount; i++) {
      const top = getItemPlacement(i);
      stickyItems.push(
        <div
          key={i}
          style={{
            height: getItemHeight(i),
            width: "100%",
            transform: `translateY(${top}px)`,
            position: "absolute",
          }}
        >
          {itemRenderer({ isSticky: true, index: i })}
        </div>,
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
        <div
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            height: 0,
            zIndex: 2,
          }}
        >
          {stickyItems}
        </div>
        {items}
      </div>
    </div>
  );
}
