"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SearchDialog } from "@/components/search/SearchDialog";
import type { SearchEntry } from "@/lib/search";

type SearchContextValue = {
  openSearch: (invoker?: HTMLElement | null) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function useGuideSearch(): SearchContextValue | null {
  return useContext(SearchContext);
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.matches("input, textarea, select") || target.isContentEditable || Boolean(target.closest("[contenteditable='true']"));
}

function anotherModalIsOpen() {
  return Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'));
}

export function SearchProvider({ entries, children }: { entries: readonly SearchEntry[]; children: ReactNode }) {
  const immutableEntries = useMemo(() => Object.freeze(entries.map((entry) => Object.freeze({
    ...entry,
    tags: Object.freeze([...entry.tags]),
  }))), [entries]);
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const invokerRef = useRef<HTMLElement | null>(null);
  const pendingRestoreRef = useRef<HTMLElement | null>(null);

  const openSearch = useCallback((invoker?: HTMLElement | null) => {
    if (isOpenRef.current || anotherModalIsOpen()) return;
    const activeElement = document.activeElement;
    invokerRef.current = invoker ?? (activeElement instanceof HTMLElement ? activeElement : null);
    pendingRestoreRef.current = null;
    isOpenRef.current = true;
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback((restoreFocus = true) => {
    if (!isOpenRef.current) return;
    pendingRestoreRef.current = restoreFocus ? invokerRef.current : null;
    isOpenRef.current = false;
    setIsOpen(false);
  }, []);

  const handleActivate = useCallback(() => closeSearch(false), [closeSearch]);
  const handleClose = useCallback(() => closeSearch(true), [closeSearch]);

  useEffect(() => {
    if (isOpen) return;
    const invoker = pendingRestoreRef.current;
    pendingRestoreRef.current = null;
    if (invoker?.isConnected) invoker.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const hasOnePrimaryModifier = (event.ctrlKey || event.metaKey) && !(event.ctrlKey && event.metaKey);
      if (
        event.key.toLowerCase() !== "k"
        || !hasOnePrimaryModifier
        || event.altKey
        || event.shiftKey
        || event.repeat
        || isEditableTarget(event.target)
      ) return;

      if (isOpenRef.current || anotherModalIsOpen()) return;
      event.preventDefault();
      openSearch(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [openSearch]);

  return (
    <SearchContext.Provider value={{ openSearch }}>
      {children}
      {isOpen ? (
        <SearchDialog
          entries={immutableEntries}
          onActivate={handleActivate}
          onClose={handleClose}
        />
      ) : null}
    </SearchContext.Provider>
  );
}
