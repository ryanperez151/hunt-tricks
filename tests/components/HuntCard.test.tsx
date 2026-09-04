import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { HuntCard } from "@/components/hunts/HuntCard";
import { HuntSchema } from "@/lib/schemas";
import { makeHunt } from "@/tests/test-utils";

describe("HuntCard", () => {
  test("presents the hunt's operational metadata as one accessible trailing-slash link", () => {
    render(<HuntCard hunt={{ ...HuntSchema.parse(makeHunt()), protocols: ["SNMP"] }} />);

    const link = screen.getByRole("link", { name: /test hunt/i });
    expect(link).toHaveAttribute("href", "/hunts/test-hunt/");
    expect(screen.getAllByRole("link")).toEqual([link]);
    expect(within(link).getByText("Management-Plane C2")).toBeInTheDocument();
    expect(within(link).getByText("HIGH")).toBeInTheDocument();
    expect(within(link).getByText("SNMP")).toBeInTheDocument();
    expect(within(link).getByText("NetFlow / IPFIX")).toBeInTheDocument();
    expect(within(link).getByText("router")).toBeInTheDocument();
  });
});
