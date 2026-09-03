import { CopyButton, type ClipboardWriter } from "@/components/common/CopyButton";

export function InvestigationChecklist({ steps, writeText }: { steps: readonly string[]; writeText?: ClipboardWriter }) {
  const copyValue = steps.map((step, index) => `${index + 1}. ${step}`).join("\n");
  return (
    <section aria-labelledby="investigation-checklist-title" className="investigation-checklist">
      <div className="investigation-checklist__heading"><h2 id="investigation-checklist-title">Investigation checklist</h2><CopyButton label="Copy checklist" value={copyValue} writeText={writeText} /></div>
      <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
    </section>
  );
}
