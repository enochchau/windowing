import { useCallback, useRef, useState } from "react";
import type {
  NumberOrNumberFn,
  Placer,
  ScrollToItem,
  VisibleIndex,
} from "./types";
import { usePlacer } from "./usePlacer";

export type UseVirtualListArgs = {
  height: number;
  itemCount: number;
  itemHeight: NumberOrNumberFn;
  stickyItemCount?: number;
};
export type UseVirtualListReturn = {
  listProps: {
    outerRef: React.RefObject<HTMLDivElement | null>;
    outerHeight: number;

    innerRef: React.RefObject<HTMLDivElement | null>;
    innerHeight: number;

    itemCount: number;
    visibleIndex: VisibleIndex;

    getItemHeight: (i: number) => number;
    getItemPlacement: Placer["indexToPlacement"];

    stickyItemCount: number;
    onOuterScroll: React.UIEventHandler<HTMLDivElement>;
  };
  scrollToItem: ScrollToItem;
};

export function useVirtualList(args: UseVirtualListArgs): UseVirtualListReturn {
  const { stickyItemCount, height: outerHeight, itemCount } = args;

  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const {
    placer,
    getDimension: getItemHeight,
    sum: innerHeight,
  } = usePlacer(args.itemHeight, itemCount);

  const [visibleIndex, setVisibleIndex] = useState({
    start: 0,
    end: placer.placementToIndex(outerHeight),
  });

  const onOuterScroll: React.UIEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const outerEl = e.currentTarget;
      const top = outerEl.scrollTop;
      const bottom = top + e.currentTarget.clientHeight;

      const start = placer.placementToIndex(top);
      const end = placer.placementToIndex(bottom);
      setVisibleIndex({ start, end });
    },
    [placer]
  );

  const scrollToItem: ScrollToItem = useCallback(
    (index, opts) => {
      if (!outerRef.current) return;

      let top = placer.indexToPlacement(index);
      if (opts?.block === "center") {
        top = top - outerHeight / 2;
      } else if (opts?.block === "end") {
        top = top - (outerHeight - getItemHeight(index));
      } else {
        const stickyOffset = stickyItemCount
          ? placer.indexToPlacement(stickyItemCount)
          : 0;
        top = top - stickyOffset;
      }

      outerRef.current.scrollTo({ top });
    },
    [getItemHeight, placer, outerHeight, stickyItemCount]
  );

  return {
    listProps: {
      visibleIndex,
      itemCount,
      innerRef,
      innerHeight,
      outerRef,
      outerHeight,
      getItemHeight,
      getItemPlacement: placer.indexToPlacement,
      stickyItemCount: stickyItemCount ?? 0,
      onOuterScroll,
    },
    scrollToItem,
  };
}
