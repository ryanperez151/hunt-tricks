"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { navigation } from "@/data/navigation";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef(false);

  const closeNavigation = () => {
    returnFocus.current = true;
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen && returnFocus.current) {
      triggerRef.current?.focus();
      returnFocus.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const inertSiblings = Array.from(document.body.children).filter((element) => element !== dialog);
    const previousInertState = inertSiblings.map((element) => [element, element.hasAttribute("inert")] as const);
    inertSiblings.forEach((element) => element.setAttribute("inert", ""));

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeNavigation();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousInertState.forEach(([element, wasInert]) => {
        if (!wasInert) element.removeAttribute("inert");
      });
    };
  }, [isOpen]);

  return (
    <div className="mobile-navigation">
      <button
        aria-controls="mobile-navigation"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="menu-trigger"
        onClick={() => setIsOpen(true)}
        ref={triggerRef}
        type="button"
      >
        Open navigation
      </button>
      {isOpen
        ? createPortal(
            <div
              aria-label="Navigation"
              aria-modal="true"
              className="mobile-menu"
              id="mobile-navigation"
              ref={dialogRef}
              role="dialog"
            >
              <div className="mobile-menu__bar">
                <p className="eyebrow">Field guide</p>
                <button className="menu-trigger" onClick={closeNavigation} ref={closeRef} type="button">
                  Close navigation
                </button>
              </div>
              <nav aria-label="Mobile navigation">
                <ul>
                  {navigation.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} onClick={closeNavigation}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>,
          document.body,
        )
        : null}
    </div>
  );
}
