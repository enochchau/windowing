import { useRef, useEffect, useState, useCallback } from "react";

export interface AutoSizerDimensions {
  width: number;
  height: number;
}

export interface UseAutoSizerReturn {
  ref: React.RefObject<HTMLDivElement>;
  dimensions: AutoSizerDimensions;
  isReady: boolean;
}

export function useAutoSizer(): UseAutoSizerReturn {
  const ref = useRef<HTMLDivElement>(null!);
  const [dimensions, setDimensions] = useState<AutoSizerDimensions>({
    width: 0,
    height: 0,
  });
  const [isReady, setIsReady] = useState(false);

  const updateDimensions = useCallback(() => {
    if (!ref.current) {
      return;
    }

    const { width, height } = ref.current.getBoundingClientRect();
    setDimensions({ width, height });
    setIsReady(true);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    // Initial measurement
    updateDimensions();

    // Set up ResizeObserver for efficient resize detection
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
        setIsReady(true);
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateDimensions]);

  return {
    ref,
    dimensions,
    isReady,
  };
}
