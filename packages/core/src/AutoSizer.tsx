import React from "react";

interface AutoSizerProps {
  autoSizerRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function AutoSizer({
  autoSizerRef,
  children,
  className,
  style,
}: AutoSizerProps) {
  return (
    <div
      ref={autoSizerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
