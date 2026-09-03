import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { BehaviorComparison } from "@/components/hunts/BehaviorComparison";

const expectedFlow = {
  title: "Expected management traffic",
  nodes: [
    { id: "firewall", label: "Firewall" },
    { id: "nms", label: "Approved NMS" },
  ],
  edges: [{ source: "firewall", target: "nms", label: "HTTPS administration" }],
  textAlternative: ["Firewall sends HTTPS to Approved NMS."],
} as const;

const suspiciousFlow = {
  title: "Suspicious management traffic",
  nodes: [
    { id: "firewall", label: "Firewall" },
    { id: "vps", label: "Unknown VPS" },
  ],
  edges: [{ source: "firewall", target: "vps", label: "HTTPS egress" }],
  textAlternative: ["Firewall sends HTTPS to Unknown VPS."],
} as const;

test("labels expected and suspicious behavior in text", () => {
  render(<BehaviorComparison expected={expectedFlow} suspicious={suspiciousFlow} />);

  expect(screen.getByRole("heading", { name: "Expected" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Suspicious" })).toBeInTheDocument();
  expect(screen.getByText("Firewall sends HTTPS to Unknown VPS.")).toBeInTheDocument();
});
