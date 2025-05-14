import { useRef, useState, type ReactNode } from "react";
import "./App.css";

export type ListItemData<T> = {
  id: React.Key;
  data: T;
};

export interface VirtualListProps<T> {
  overflowCount: number;
  width: number;
  height: number;
  itemHeight: number;
  itemData: ListItemData<T>[];
  itemRenderer: (args: {
    index: number;
    data: T;
    id: React.Key;
    isSticky: boolean;
  }) => ReactNode;
  stickyRowCount?: number;
}
export function VirtualList<T>(props: VirtualListProps<T>) {
  const outerDimension = {
    height: props.height,
    width: props.width,
  };
  const { stickyRowCount, itemHeight, itemData, overflowCount, itemRenderer } =
    props;

  const outerRef = useRef<HTMLDivElement>(null);
  const [visibleIndex, setVisibleIndex] = useState({
    start: 0,
    end: Math.floor(outerDimension.height / itemHeight) + overflowCount,
  });
  const innerDivHeight = itemHeight * itemData.length;

  const onInnerScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const outerEl = e.currentTarget;
    const top = outerEl.scrollTop;
    const bottom = top + e.currentTarget.clientHeight;

    const start = Math.floor(top / itemHeight);
    const end = Math.floor(bottom / itemHeight);
    setVisibleIndex({ start, end });
  };

  const items: ReactNode[] = [];

  for (
    let i = Math.max(0, visibleIndex.start - overflowCount);
    i <= Math.min(itemData.length - 1, visibleIndex.end + overflowCount);
    i++
  ) {
    if (typeof stickyRowCount === "number") {
      if (i >= 0 && i < stickyRowCount) {
        continue;
      }
    }

    const data = itemData[i];

    items.push(
      <div
        key={data.id}
        style={{
          height: itemHeight,
          width: "100%",
          position: "absolute",
          left: 0,
          top: i * itemHeight,
          overflow: "hidden",
        }}
      >
        {itemRenderer({ ...itemData[i], isSticky: false, index: i })}
      </div>
    );
  }

  const stickyItems: ReactNode[] = [];
  if (typeof stickyRowCount === "number") {
    for (let i = 0; i < stickyRowCount; i++) {
      const data = itemData[i];
      stickyItems.push(
        <div
          key={data.id}
          style={{
            height: itemHeight,
            width: "100%",
            position: "sticky",
            left: 0,
            top: i * itemHeight,
            overflow: "hidden",
            zIndex: 99,
          }}
        >
          {itemRenderer({ ...itemData[i], isSticky: true, index: i })}
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
