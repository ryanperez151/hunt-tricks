import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { CopyButton } from "@/components/common/CopyButton";

describe("CopyButton", () => {
  test("copies its exact value and announces success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CopyButton value="source.device_type IN network_infrastructure" writeText={writeText} />);

    await user.click(screen.getByRole("button", { name: /copy/i }));

    expect(writeText).toHaveBeenCalledWith("source.device_type IN network_infrastructure");
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
  });

  test("preserves the text and offers a manual-copy message when clipboard access fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const user = userEvent.setup();
    render(<><label htmlFor="query">Query</label><textarea id="query" defaultValue="keep this text" /><CopyButton value="keep this text" writeText={writeText} /></>);

    await user.click(screen.getByRole("button", { name: /copy/i }));

    expect(screen.getByRole("status")).toHaveTextContent("Copy failed — select the text manually.");
    expect(screen.getByLabelText("Query")).toHaveValue("keep this text");
  });

  test("does not let an earlier clipboard response overwrite a later result", async () => {
    let resolveFirst: (() => void) | undefined;
    let rejectSecond: ((reason?: unknown) => void) | undefined;
    const first = new Promise<void>((resolve) => { resolveFirst = resolve; });
    const second = new Promise<void>((_, reject) => { rejectSecond = reject; });
    const writeText = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second);
    const user = userEvent.setup();
    render(<CopyButton value="query" writeText={writeText} />);

    await user.click(screen.getByRole("button", { name: /copy/i }));
    await user.click(screen.getByRole("button", { name: /copy/i }));
    rejectSecond?.(new Error("denied"));
    resolveFirst?.();
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copy failed — select the text manually."));
  });

  test("invalidates an in-flight completion and clears feedback when its value changes", async () => {
    let resolveCopy: (() => void) | undefined;
    const writeText = vi.fn().mockReturnValue(new Promise<void>((resolve) => { resolveCopy = resolve; }));
    const user = userEvent.setup();
    const { rerender } = render(<CopyButton value="old query" writeText={writeText} />);

    await user.click(screen.getByRole("button", { name: /copy/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Copying…");
    rerender(<CopyButton value="new query" writeText={writeText} />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    resolveCopy?.();
    await waitFor(() => expect(screen.getByRole("status")).toBeEmptyDOMElement());
  });

  test("transitions the live region for every repeated success and failure while retaining button focus", async () => {
    let resolveFirstSuccess: (() => void) | undefined;
    let resolveSecondSuccess: (() => void) | undefined;
    let rejectFirstFailure: ((reason?: unknown) => void) | undefined;
    let rejectSecondFailure: ((reason?: unknown) => void) | undefined;
    const writeText = vi.fn()
      .mockReturnValueOnce(new Promise<void>((resolve) => { resolveFirstSuccess = resolve; }))
      .mockReturnValueOnce(new Promise<void>((resolve) => { resolveSecondSuccess = resolve; }))
      .mockReturnValueOnce(new Promise<void>((_, reject) => { rejectFirstFailure = reject; }))
      .mockReturnValueOnce(new Promise<void>((_, reject) => { rejectSecondFailure = reject; }));
    const user = userEvent.setup();
    render(<CopyButton value="query" writeText={writeText} />);
    const button = screen.getByRole("button", { name: /copy/i });

    await user.click(button);
    expect(screen.getByRole("status")).toHaveTextContent("Copying…");
    resolveFirstSuccess?.();
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard."));
    await user.click(button);
    expect(screen.getByRole("status")).toHaveTextContent("Copying…");
    resolveSecondSuccess?.();
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard."));
    await user.click(button);
    expect(screen.getByRole("status")).toHaveTextContent("Copying…");
    rejectFirstFailure?.(new Error("denied"));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copy failed — select the text manually."));
    await user.click(button);
    expect(screen.getByRole("status")).toHaveTextContent("Copying…");
    rejectSecondFailure?.(new Error("denied"));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copy failed — select the text manually."));
    expect(button).toHaveFocus();
  });
});
