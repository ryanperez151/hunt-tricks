"use client";
import { useState } from "react";

const scenarios = [
  { label: "Fixed script", branch: "Choose a configured fallback", observation: "A predefined sequence can call APIs quickly, retry, and take a configured fallback. Timing and a fallback alone cannot identify AI." },
  { label: "Adaptive automation", branch: "Select another tool using configured rules", observation: "Rules respond to the denial and choose another permitted tool. Branching on results also occurs without a model." },
  { label: "Autonomous agent", branch: "Select another permitted tool using the run context", observation: "Model, run, and tool provenance can corroborate this synthetic agent example when joined to independent target events. The visible action sequence alone cannot." },
] as const;
export function AutomationTimeline() {
  const [selected, setSelected] = useState(0);
  const scenario = scenarios[selected];
  const steps = ["Read inventory", "Attempt authorized API", "Receive denial", scenario.branch, "Verify result against the target system"];
  return <section className="automation-timeline" aria-labelledby="automation-timeline-title">
    <p className="eyebrow">Synthetic examples · overlapping capabilities</p>
    <h2 id="automation-timeline-title">Same sequence. Different orchestration.</h2>
    <p>These examples illustrate possible workflows, not signatures or measured incident traces. All three can call APIs quickly; adaptive automation and agents can both branch on results.</p>
    <div className="automation-timeline__controls" role="group" aria-label="Choose a scenario">{scenarios.map((item, index) => <button key={item.label} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.label}</button>)}</div>
    <div aria-live="polite">
      <ol aria-label="Scenario steps">{steps.map((step, index) => <li key={step}><span aria-hidden="true">0{index + 1}</span><strong>{step}</strong></li>)}</ol>
      <p className="automation-timeline__observation"><strong>Observation: </strong>{scenario.observation}</p>
    </div>
    <p>Speed alone does not identify AI involvement. Permission, target, and outcome context are also needed to assess malicious intent.</p>
  </section>;
}
