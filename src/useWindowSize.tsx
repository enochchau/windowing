import { useSyncExternalStore, useMemo } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => {
    window.removeEventListener("resize", callback);
  };
}

function getSnapshot() {
  // Return a stringified version to ensure referential stability
  return `${window.innerWidth}x${window.innerHeight}`;
}

export function useWindowSize() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);

  // Parse the stringified snapshot into an object
  const { width, height } = useMemo(() => {
    const [width, height] = snapshot.split("x").map(Number);
    return { width, height };
  }, [snapshot]);

  return { width, height };
}
