"use client";

import { useRef, useState } from "react";

export type ClipboardWriter = (value: string) => Promise<void>;

export function CopyButton({ value, label = "Copy", writeText }: { value: string; label?: string; writeText?: ClipboardWriter }) {
  const [feedback, setFeedback] = useState({ value, generation: 0, message: "" });
  const requestId = useRef(0);

  if (feedback.value !== value) {
    setFeedback({ value, generation: feedback.generation + 1, message: "" });
  }

  const status = feedback.value === value ? feedback.message : "";

  async function copy() {
    const currentRequest = ++requestId.current;
    const attemptedValue = value;
    const attemptedGeneration = feedback.generation;
    const updateAttemptFeedback = (message: string) => {
      setFeedback((currentFeedback) => currentFeedback.value === attemptedValue && currentFeedback.generation === attemptedGeneration
        ? { ...currentFeedback, message }
        : currentFeedback);
    };

    updateAttemptFeedback("Copying…");
    try {
      const copier = writeText ?? navigator.clipboard?.writeText.bind(navigator.clipboard);
      if (!copier) throw new Error("Clipboard API unavailable");
      await copier(attemptedValue);
      if (currentRequest === requestId.current) updateAttemptFeedback("Copied to clipboard.");
    } catch {
      if (currentRequest === requestId.current) updateAttemptFeedback("Copy failed — select the text manually.");
    }
  }

  return (
    <span className="copy-control">
      <button className="copy-button" type="button" onClick={copy}>{label}</button>
      <span aria-live="polite" className="copy-status" role="status">{status}</span>
    </span>
  );
}
