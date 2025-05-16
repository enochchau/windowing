export type NumberOrNumberFn = number | ((index: number) => number);
export type VisibleIndex = {
  column: { start: number; end: number };
  row: { start: number; end: number };
};

export type ScrollToCell = (args: {
  rowIndex: number;
  columnIndex: number;
}, opts?: {
  block?: 'start' | 'center' | 'end',
  inline?: 'start' | 'center' | 'end'
}) => void;
