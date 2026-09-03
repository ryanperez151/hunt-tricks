"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { navigation } from "@/data/navigation";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
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

    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeNavigation();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      {isOpen ? (
        <div
          aria-label="Navigation"
          aria-modal="true"
          className="mobile-menu"
          id="mobile-navigation"
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
        </div>
      ) : null}
    </div>
  );
}
