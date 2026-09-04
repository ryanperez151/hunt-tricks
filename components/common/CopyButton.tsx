"use client";

import { useLayoutEffect, useRef, useState } from "react";

export type ClipboardWriter = (value: string) => Promise<void>;

export function CopyButton({ value, label = "Copy", writeText }: { value: string; label?: string; writeText?: ClipboardWriter }) {
  const [feedback, setFeedback] = useState({ value, message: "" });
  const requestId = useRef(0);
  const currentValue = useRef(value);
  const status = feedback.value === value ? feedback.message : "";

  useLayoutEffect(() => {
    currentValue.current = value;
    requestId.current += 1;
  }, [value]);

  async function copy() {
    const currentRequest = ++requestId.current;
    const attemptedValue = value;
    setFeedback({ value: attemptedValue, message: "Copying…" });
    try {
      const copier = writeText ?? navigator.clipboard?.writeText.bind(navigator.clipboard);
      if (!copier) throw new Error("Clipboard API unavailable");
      await copier(attemptedValue);
      if (currentRequest === requestId.current && currentValue.current === attemptedValue) setFeedback({ value: attemptedValue, message: "Copied to clipboard." });
    } catch {
      if (currentRequest === requestId.current && currentValue.current === attemptedValue) setFeedback({ value: attemptedValue, message: "Copy failed — select the text manually." });
    }
  }

  return (
    <span className="copy-control">
      <button className="copy-button" type="button" onClick={copy}>{label}</button>
      <span aria-live="polite" className="copy-status" role="status">{status}</span>
    </span>
  );
}
