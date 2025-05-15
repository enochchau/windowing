import type { NumberOrNumberFn } from "./types";

export function numberOrFnToFn(
  nfn: NumberOrNumberFn
): (index: number) => number {
  if (typeof nfn === "number") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (_index: number) => nfn;
  }

  return nfn;
}

export function createPlacementToIndex(itemDimensions: number[]) {
  const cache: Record<string, number> = {};

  return (dimension: number) => {
    if (typeof cache[dimension] === "number") {
      return cache[dimension];
    }
    let index = 0;
    let remaining = dimension;
    while (remaining > 0) {
      remaining -= itemDimensions[index];
      index += 1;
    }

    cache[dimension] = index;
    return index;
  };
}

export function createIndexToPlacement(itemDimensions: number[]) {
  const cache: Record<string, number> = {};

  return (index: number) => {
    if (typeof cache[index] === "number") {
      return cache[index];
    }

    let dimension = 0;
    for (let i = 0; i < index; i++) {
      dimension += itemDimensions[i];
    }

    cache[index] = dimension;
    return dimension;
  };
}

export function sum(arr: number[]) {
  let sum = 0;
  for (const n of arr) {
    sum += n;
  }
  return sum;
}
