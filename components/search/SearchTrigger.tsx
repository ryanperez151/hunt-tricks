"use client";

import { useRef } from "react";
import { useGuideSearch } from "@/components/search/SearchProvider";

export function SearchTrigger() {
  const search = useGuideSearch();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      aria-haspopup="dialog"
      aria-keyshortcuts="Control+K Meta+K"
      aria-label="Search guide"
      className="search-trigger"
      onClick={() => search?.openSearch(triggerRef.current)}
      ref={triggerRef}
      type="button"
    >
      <svg aria-hidden="true" className="search-trigger__icon" focusable="false" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
      <span className="search-trigger__label">Search</span>
      <kbd aria-hidden="true">Ctrl / ⌘ K</kbd>
    </button>
  );
}
