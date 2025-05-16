import { useMemo } from "react";
import type { NumberOrNumberFn } from "./types";

export function usePlacer(itemDimension: NumberOrNumberFn, count: number) {
  return useMemo(() => {
    const getDimension = numberOrFnToFn(itemDimension);
    const dimensions: number[] = [];
    for (let i = 0; i < count; i++) {
      dimensions.push(getDimension(i));
    }
    const placer = createPlacer(dimensions);

    return {
      placer: placer,
      sum: sum(dimensions),
      getDimension: (index:number) => dimensions[index],
    };
  }, [itemDimension, count]);
}

function numberOrFnToFn(nfn: NumberOrNumberFn): (index: number) => number {
  if (typeof nfn === "number") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (_index: number) => nfn;
  }

  return nfn;
}

/**
 * Cached translation of index to placement and visa versa
 * @param itemDimensions
 * @returns
 */
function createPlacer(itemDimensions: number[]) {
  const indexToPlacementCache: Record<string, number> = {};
  const placementToIndexCache: Record<string, number> = {};

  return {
    indexToPlacement: (index: number) => {
      if (typeof indexToPlacementCache[index] === "number") {
        return indexToPlacementCache[index];
      }

      let placement = 0;
      for (let i = 0; i < index; i++) {
        placement += itemDimensions[i];
      }

      indexToPlacementCache[index] = placement;
      return placement;
    },
    placementToIndex: (placement: number) => {
      if (typeof placementToIndexCache[placement] === "number") {
        return placementToIndexCache[placement];
      }

      let index = 0;
      let remaining = placement;
      while (remaining > 0) {
        remaining -= itemDimensions[index];
        index += 1;
      }

      placementToIndexCache[placement] = index;
      return index;
    },
  };
}

function sum(arr: number[]) {
  let sum = 0;
  for (const n of arr) {
    sum += n;
  }
  return sum;
}
