import React from "react";
import css from "./Button.module.css";
import { classNames } from "../classNames";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export function Button({ 
  children, 
  onClick, 
  variant = "secondary", 
  size = "md", 
  disabled = false,
  className,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={classNames({
        [css.button]: true,
        [css[variant]]: true,
        [css[size]]: true,
        [className || ""]: !!className,
      })}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
