import type { NumberOrNumberFn } from "./types";

export function numberOrFnToFn(nfn: NumberOrNumberFn): (index: number) => number {
  if (typeof nfn === "number") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (_index: number) => nfn;
  }

  return nfn;
}

export function dimensionToIndex(dimension: number, itemDimensions: number[]): number {
  let index = 0;
  let remaining = dimension;
  while (remaining > 0) {
    remaining -= itemDimensions[index];
    index += 1;
  }
  return index;
}

export function indexToDimension(index: number, itemDimensions: number[]): number {
  let dimension = 0;
  for (let i = 0; i < index; i++) {
    dimension += itemDimensions[i];
  }
  return dimension;
}

export function sum(arr: number[]) {
  let sum = 0;
  for (const n of arr) {
    sum += n;
  }
  return sum;
}
