import React, { useRef, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
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
        <Search size={16} />
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
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={onNext}
          disabled={totalResults === 0}
          className={css.navButton}
          title="Next result (Enter)"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <button
        onClick={onClose}
        className={css.closeButton}
        title="Close (Escape)"
      >
        <X size={16} />
      </button>
    </div>
  );
}
