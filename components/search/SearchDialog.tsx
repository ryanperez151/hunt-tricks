"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { searchGuide, type SearchEntry } from "@/lib/search";

type SearchDialogProps = {
  entries: readonly SearchEntry[];
  onClose: () => void;
  onActivate: () => void;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function SearchDialog({ entries, onClose, onActivate }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const idPrefix = `guide-search-${useId().replaceAll(":", "")}`;
  const titleId = `${idPrefix}-title`;
  const descriptionId = `${idPrefix}-description`;
  const listboxId = `${idPrefix}-listbox`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const portalRootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchGuide(query, entries), [entries, query]);
  const selectedIndex = results.length ? Math.min(activeIndex, results.length - 1) : -1;
  const selectedResult = selectedIndex >= 0 ? results[selectedIndex] : undefined;
  const activeDescendant = selectedIndex >= 0 ? `${idPrefix}-option-${selectedIndex}` : undefined;

  useEffect(() => {
    const portalRoot = portalRootRef.current;
    const dialog = dialogRef.current;
    if (!portalRoot || !dialog) return;

    const previousOverflow = document.body.style.overflow;
    const backgroundState = Array.from(document.body.children)
      .filter((element) => element !== portalRoot)
      .map((element) => ({
        element,
        wasInert: element.hasAttribute("inert"),
        ariaHidden: element.getAttribute("aria-hidden"),
      }));

    document.body.style.overflow = "hidden";
    for (const { element } of backgroundState) {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    }
    inputRef.current?.focus();

    const handleModalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };

    document.addEventListener("keydown", handleModalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleModalKeyDown);
      document.body.style.overflow = previousOverflow;
      for (const { element, wasInert, ariaHidden } of backgroundState) {
        if (!wasInert) element.removeAttribute("inert");
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      }
    };
  }, [onClose]);

  useEffect(() => {
    if (!activeDescendant) return;
    document.getElementById(activeDescendant)?.scrollIntoView?.({ block: "nearest" });
  }, [activeDescendant, selectedResult?.id]);

  function moveActive(direction: -1 | 1) {
    if (!results.length) return;
    setActiveIndex((current) => {
      const safeCurrent = Math.min(current, results.length - 1);
      return (safeCurrent + direction + results.length) % results.length;
    });
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === "Enter" && selectedIndex >= 0) {
      event.preventDefault();
      document.getElementById(`${idPrefix}-option-${selectedIndex}`)?.click();
    }
  }

  return createPortal(
    <div
      className="search-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={portalRootRef}
    >
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="search-dialog"
        ref={dialogRef}
        role="dialog"
      >
        <header className="search-dialog__header">
          <div>
            <p className="eyebrow">Global guide search</p>
            <h2 id={titleId}>Search the field guide</h2>
          </div>
          <button className="search-dialog__close" onClick={onClose} type="button">Close search</button>
        </header>
        <p className="sr-only" id={descriptionId}>Search hunts, protocols, queries, research, and methodology.</p>
        <label className="search-dialog__input-label">
          <span className="sr-only">Search guide</span>
          <input
            aria-activedescendant={activeDescendant}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded="true"
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search by behavior, protocol, telemetry, or technique"
            ref={inputRef}
            role="combobox"
            type="search"
            value={query}
          />
        </label>
        <p className="search-dialog__hint"><kbd>↑</kbd><kbd>↓</kbd> select · <kbd>Enter</kbd> open · <kbd>Esc</kbd> close</p>
        <ul aria-label="Search results" className="search-results" id={listboxId} role="listbox">
          {results.map((result, index) => (
            <li key={result.id} role="presentation">
              <Link
                aria-label={`${result.type} ${result.title}`}
                aria-selected={index === selectedIndex}
                className="search-result"
                href={result.href}
                id={`${idPrefix}-option-${index}`}
                onClick={onActivate}
                onMouseMove={() => setActiveIndex(index)}
                role="option"
              >
                <span className="search-result__type">{result.type}</span>
                <span>
                  <strong>{result.title}</strong>
                  <small>{result.description}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {results.length === 0 ? (
          <p className="search-dialog__empty" role="status">No guide entries match your search.</p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
