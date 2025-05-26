import React, { useState, useEffect } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import css from "./Popover.module.css";

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right" | "top-start" | "top-end" | "bottom-start" | "bottom-end";
}

export function Popover({ trigger, children, placement = "bottom" }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      setIsOpen(open);
      if (!open) {
        setIsPositioned(false);
      }
    },
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({
        fallbackAxisSideDirection: "start",
      }),
      shift({ padding: 8 }),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  // Track when positioning is complete to prevent flash
  useEffect(() => {
    if (isOpen && floatingStyles.left !== undefined && floatingStyles.top !== undefined) {
      setIsPositioned(true);
    }
  }, [isOpen, floatingStyles.left, floatingStyles.top]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()} className={css.trigger}>
        {trigger}
      </div>
      
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              opacity: isPositioned ? 1 : 0,
            }}
            {...getFloatingProps()}
            className={css.popover}
          >
            <div className={css.content}>
              {children}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
