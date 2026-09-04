"use client";

import { useRef, useState } from "react";

export type ClipboardWriter = (value: string) => Promise<void>;

export function CopyButton({ value, label = "Copy", writeText }: { value: string; label?: string; writeText?: ClipboardWriter }) {
  return <CopyButtonAttempt key={value} label={label} value={value} writeText={writeText} />;
}

function CopyButtonAttempt({ value, label, writeText }: { value: string; label: string; writeText?: ClipboardWriter }) {
  const [status, setStatus] = useState("");
  const requestId = useRef(0);

  async function copy() {
    const currentRequest = ++requestId.current;
    setStatus("Copying…");
    try {
      const copier = writeText ?? navigator.clipboard?.writeText.bind(navigator.clipboard);
      if (!copier) throw new Error("Clipboard API unavailable");
      await copier(value);
      if (currentRequest === requestId.current) setStatus("Copied to clipboard.");
    } catch {
      if (currentRequest === requestId.current) setStatus("Copy failed — select the text manually.");
    }
  }

  return (
    <span className="copy-control">
      <button className="copy-button" type="button" onClick={copy}>{label}</button>
      <span aria-live="polite" className="copy-status" role="status">{status}</span>
    </span>
  );
}
