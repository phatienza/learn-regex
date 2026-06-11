import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TerminalBuddy, type TerminalBuddyStatus } from "./TerminalBuddy";

const hints = ["Search for ERROR.", "Use the filename app.log."];
const spriteCases: Array<[TerminalBuddyStatus, string]> = [
  ["idle", "/terminal-buddy-idle.png"],
  ["hint", "/terminal-buddy-hint.png"],
  ["fail", "/terminal-buddy-fail.png"],
  ["success", "/terminal-buddy-success.png"],
  ["complete", "/terminal-buddy-complete.png"]
];

describe("TerminalBuddy", () => {
  it("renders the idle avatar and asks for a hint", async () => {
    const user = userEvent.setup();
    const onShowHint = vi.fn();

    render(<TerminalBuddy hintCount={0} hints={hints} onShowHint={onShowHint} status="idle" />);

    expect(screen.getByRole("img", { name: "Terminal Buddy" })).toHaveAttribute(
      "src",
      "/terminal-buddy-idle.png"
    );

    await user.click(screen.getByRole("button", { name: /ask terminal buddy for a hint/i }));

    expect(onShowHint).toHaveBeenCalledTimes(1);
  });

  it("renders all visible hints and disables the exhausted hint control", () => {
    render(<TerminalBuddy hintCount={hints.length} hints={hints} onShowHint={vi.fn()} status="hint" />);

    expect(screen.getByText("Search for ERROR.")).toBeInTheDocument();
    expect(screen.getByText("Use the filename app.log.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /no more hints from terminal buddy/i })).toBeDisabled();
  });

  it("keeps the hint live region mounted before hints are visible", () => {
    const { container } = render(<TerminalBuddy hintCount={0} hints={hints} onShowHint={vi.fn()} status="idle" />);
    const hintList = container.querySelector(".terminal-buddy-hints");

    expect(hintList).toBeInTheDocument();
    expect(hintList).toHaveAttribute("aria-live", "polite");
    expect(hintList).toHaveAttribute("aria-atomic", "false");
    expect(hintList?.children).toHaveLength(0);
  });

  it("clamps out-of-range hint counts", () => {
    const { rerender } = render(<TerminalBuddy hintCount={-2} hints={hints} onShowHint={vi.fn()} status="idle" />);

    expect(screen.queryByText("Search for ERROR.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ask terminal buddy for a hint/i })).toBeEnabled();
    expect(screen.getByText(/stuck/i)).toBeInTheDocument();

    rerender(<TerminalBuddy hintCount={99} hints={hints} onShowHint={vi.fn()} status="hint" />);

    expect(screen.getByText("Search for ERROR.")).toBeInTheDocument();
    expect(screen.getByText("Use the filename app.log.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /no more hints from terminal buddy/i })).toBeDisabled();
  });

  it.each(spriteCases)("uses the %s sprite", (status, spritePath) => {
    render(<TerminalBuddy hintCount={0} hints={hints} onShowHint={vi.fn()} status={status} />);

    expect(screen.getByRole("img", { name: "Terminal Buddy" })).toHaveAttribute("src", spritePath);
  });

  it("shows failed attempt copy", () => {
    render(<TerminalBuddy hintCount={0} hints={hints} onShowHint={vi.fn()} status="fail" />);

    expect(screen.getByText(/need a nudge/i)).toBeInTheDocument();
  });

  it("shows successful match copy and avatar", () => {
    render(<TerminalBuddy hintCount={0} hints={hints} onShowHint={vi.fn()} status="success" />);

    expect(screen.getByText(/nice match/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Terminal Buddy" })).toHaveAttribute(
      "src",
      "/terminal-buddy-success.png"
    );
  });

  it("shows completed path copy and avatar", () => {
    render(<TerminalBuddy hintCount={hints.length} hints={hints} onShowHint={vi.fn()} status="complete" />);

    expect(screen.getByText(/path complete/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Terminal Buddy" })).toHaveAttribute(
      "src",
      "/terminal-buddy-complete.png"
    );
  });
});
