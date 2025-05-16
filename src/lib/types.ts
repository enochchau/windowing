export type ScrollPlacement = "start" | "center" | "end";

export type NumberOrNumberFn = number | ((index: number) => number);

export type VisibleIndex = {
  start: number;
  end: number;
};

export type VisibleGridIndex = {
  column: VisibleIndex;
  row: VisibleIndex;
};

export type ScrollToCell = (
  args: {
    rowIndex: number;
    columnIndex: number;
  },
  opts?: {
    block?: ScrollPlacement;
    inline?: ScrollPlacement;
  }
) => void;

export type ScrollToItem = (
  index: number,
  opts?: {
    block: ScrollPlacement;
  }
) => void;

export type Placer = {
  indexToPlacement: (index: number) => number;
  placementToIndex: (placement: number) => number;
};
