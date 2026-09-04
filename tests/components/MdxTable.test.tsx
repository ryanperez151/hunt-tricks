import { createElement } from "react";
import type { ComponentType, TableHTMLAttributes } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { useMDXComponents } from "@/mdx-components";

test("makes every potentially overflowing MDX table a labelled keyboard-focusable region", async () => {
  const user = userEvent.setup();
  const Table = useMDXComponents({}).Table as ComponentType<TableHTMLAttributes<HTMLTableElement>>;
  render(createElement(Table, { "aria-label": "Infrastructure Communication Allow Matrix" }, <tbody><tr><td>Allow-matrix value</td></tr></tbody>));

  const region = screen.getByRole("region", { name: /Infrastructure Communication Allow Matrix.*scrollable table/i });
  const instructionId = region.getAttribute("aria-describedby");
  expect(region).toHaveAttribute("tabindex", "0");
  expect(instructionId).toBeTruthy();
  expect(document.getElementById(instructionId!)).toHaveTextContent(/scroll horizontally to view all columns/i);
  expect(within(region).getByRole("table", { name: "Infrastructure Communication Allow Matrix" })).toBeInTheDocument();

  await user.tab();
  expect(region).toHaveFocus();
});
