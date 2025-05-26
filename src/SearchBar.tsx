import React, { useRef, useEffect } from "react";
import css from "./SearchBar.module.css";

interface SearchBarProps {
  isOpen: boolean;
  search: string;
  currentIndex: number;
  totalResults: number;
  onSearchChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function SearchBar({
  isOpen,
  search,
  currentIndex,
  totalResults,
  onSearchChange,
  onNext,
  onPrev,
  onClose,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      if (e.shiftKey) {
        onPrev();
      } else {
        onNext();
      }
    }
  };

  if (!isOpen) return null;

  const displayIndex = totalResults > 0 ? currentIndex + 1 : 0;

  return (
    <div className={css.container}>
      <div className={css.searchIcon}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
            fill="currentColor"
          />
        </svg>
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Find in sheet"
        className={css.input}
      />
      
      {totalResults > 0 && (
        <div className={css.resultCounter}>
          {displayIndex} of {totalResults}
        </div>
      )}
      
      <div className={css.navigation}>
        <button
          onClick={onPrev}
          disabled={totalResults === 0}
          className={css.navButton}
          title="Previous result (Shift+Enter)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 4l-4 4 4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        <button
          onClick={onNext}
          disabled={totalResults === 0}
          className={css.navButton}
          title="Next result (Enter)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      
      <button
        onClick={onClose}
        className={css.closeButton}
        title="Close (Escape)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M12 4L4 12M4 4l8 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
