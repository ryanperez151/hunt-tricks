import { render, screen, within } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, test, vi } from "vitest";
import { HuntCard } from "@/components/hunts/HuntCard";
import { HuntSchema } from "@/lib/schemas";
import { makeHunt } from "@/tests/test-utils";

vi.mock("next/link", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

describe("HuntCard", () => {
  test("presents the hunt's operational metadata as one accessible trailing-slash link", () => {
    render(<HuntCard hunt={{ ...HuntSchema.parse(makeHunt()), protocols: ["SNMP"] }} />);

    const article = screen.getByRole("article");
    const link = within(article).getByRole("link", { name: "Test Hunt" });
    const labelledBy = link.getAttribute("aria-labelledby");

    expect(link).toHaveAttribute("href", "/hunts/test-hunt/");
    expect(screen.getAllByRole("link")).toEqual([link]);
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)).toHaveTextContent("Test Hunt");
    expect(within(article).getByText("Management-Plane C2")).toBeInTheDocument();
    expect(within(article).getByText("HIGH")).toBeInTheDocument();
    expect(within(article).getByText("SNMP")).toBeInTheDocument();
    expect(within(article).getByText("NetFlow / IPFIX")).toBeInTheDocument();
    expect(within(article).getByText("router")).toBeInTheDocument();
  });

  test("gives every card instance a distinct resolvable title label", () => {
    const hunt = HuntSchema.parse(makeHunt());
    render(<><HuntCard hunt={hunt} /><HuntCard hunt={{ ...hunt, id: "hunt-second", slug: "second-hunt", title: "Second Hunt" }} /></>);

    const links = screen.getAllByRole("link");
    const titleIds = links.map((link) => link.getAttribute("aria-labelledby"));

    expect(links).toHaveLength(2);
    expect(new Set(titleIds).size).toBe(2);
    expect(titleIds.every((id) => id && document.getElementById(id))).toBe(true);
  });
});
