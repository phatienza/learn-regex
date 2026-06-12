import { act, render, screen } from "@testing-library/react";
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
  it("renders as a floating compact companion and opens hints from the avatar", async () => {
    const user = userEvent.setup();
    const onShowHint = vi.fn();

    render(<TerminalBuddy hintCount={0} hints={hints} onShowHint={onShowHint} status="idle" />);

    expect(screen.getByLabelText(/terminal buddy hints/i)).toHaveClass("is-floating");
    expect(screen.getByRole("img", { name: "Terminal Buddy" })).toHaveAttribute(
      "src",
      "/terminal-buddy-idle.png"
    );

    await user.click(screen.getByRole("button", { name: /open terminal buddy/i }));

    expect(screen.getByRole("button", { name: /ask terminal buddy for a hint/i })).toBeInTheDocument();
  });

  it("renders all visible hints and disables the exhausted hint control", () => {
    render(<TerminalBuddy hintCount={hints.length} hints={hints} onShowHint={vi.fn()} status="hint" />);

    expect(screen.getByText("Search for ERROR.")).toBeInTheDocument();
    expect(screen.getByText("Use the filename app.log.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /no more hints from terminal buddy/i })).toBeDisabled();
  });

  it("keeps the hint live region mounted before hints are visible", () => {
    const { container } = render(<TerminalBuddy hintCount={0} hints={hints} onShowHint={vi.fn()} status="hint" />);
    const hintList = container.querySelector(".terminal-buddy-hints");

    expect(hintList).toBeInTheDocument();
    expect(hintList).toHaveAttribute("aria-live", "polite");
    expect(hintList).toHaveAttribute("aria-atomic", "false");
    expect(hintList?.children).toHaveLength(0);
  });

  it("clamps out-of-range hint counts", () => {
    const { rerender } = render(<TerminalBuddy hintCount={-2} hints={hints} onShowHint={vi.fn()} status="idle" />);

    expect(screen.queryByText("Search for ERROR.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open terminal buddy/i })).toBeEnabled();

    rerender(<TerminalBuddy hintCount={99} hints={hints} onShowHint={vi.fn()} status="hint" />);

    expect(screen.getByText("Search for ERROR.")).toBeInTheDocument();
    expect(screen.getByText("Use the filename app.log.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /no more hints from terminal buddy/i })).toBeDisabled();
  });

  it("treats NaN hint counts like zero", () => {
    render(<TerminalBuddy hintCount={Number.NaN} hints={hints} onShowHint={vi.fn()} status="idle" />);

    expect(screen.queryByText("Search for ERROR.")).not.toBeInTheDocument();
    expect(screen.queryByText("Use the filename app.log.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open terminal buddy/i })).toBeEnabled();
  });

  it.each(spriteCases)("uses the %s sprite", (status, spritePath) => {
    render(<TerminalBuddy hintCount={0} hints={hints} onShowHint={vi.fn()} status={status} />);

    expect(screen.getByRole("img", { name: "Terminal Buddy" })).toHaveAttribute("src", spritePath);
  });

  it("can show lesson progress inside the buddy panel", () => {
    render(
      <TerminalBuddy
        hintCount={0}
        hints={hints}
        onShowHint={vi.fn()}
        progressLabel="Lesson 1 of 17"
        status="hint"
      />
    );

    expect(screen.getByText("Lesson 1 of 17")).toBeInTheDocument();
  });

  it("shows failed attempt copy", () => {
    render(<TerminalBuddy hintCount={0} hints={hints} onShowHint={vi.fn()} status="fail" />);

    expect(screen.getByText(/need a nudge/i)).toBeInTheDocument();
  });

  it("shows successful match copy and avatar", () => {
    render(<TerminalBuddy hintCount={0} hints={hints} onShowHint={vi.fn()} status="success" />);

    expect(screen.getByText("Ready for the next one.")).toBeInTheDocument();
    expect(screen.queryByText(/nice match/i)).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Terminal Buddy" })).toHaveAttribute(
      "src",
      "/terminal-buddy-success.png"
    );
  });

  it("shows attempt feedback before the generic success prompt without a primary action", () => {
    render(
      <TerminalBuddy
        feedback="Nice. Literal search is the baseline for every regex."
        hintCount={0}
        hints={hints}
        onShowHint={vi.fn()}
        status="success"
      />
    );

    const panel = screen.getByText("Nice. Literal search is the baseline for every regex.").closest(
      ".terminal-buddy-panel"
    );
    const panelText = panel?.textContent ?? "";

    expect(panelText.indexOf("Nice. Literal search is the baseline for every regex.")).toBeLessThan(
      panelText.indexOf("Ready for the next one.")
    );
    expect(screen.queryByRole("button", { name: /next lesson/i })).not.toBeInTheDocument();
  });

  it("toggles an active message bubble closed and open from the avatar", async () => {
    const user = userEvent.setup();

    render(
      <TerminalBuddy
        feedback="Nice. Literal search is the baseline for every regex."
        hintCount={0}
        hints={hints}
        onShowHint={vi.fn()}
        status="success"
      />
    );

    expect(screen.getByText("Nice. Literal search is the baseline for every regex.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close terminal buddy/i }));

    expect(screen.queryByText("Nice. Literal search is the baseline for every regex.")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/terminal buddy hints/i)).toHaveClass("is-compact");

    await user.click(screen.getByRole("button", { name: /open terminal buddy/i }));

    expect(screen.getByText("Nice. Literal search is the baseline for every regex.")).toBeInTheDocument();
    expect(screen.getByText("Ready for the next one.")).toBeInTheDocument();
  });

  it("leans toward nearby pointer movement and hops back after a moment", () => {
    vi.useFakeTimers();
    const { container } = render(<TerminalBuddy hintCount={0} hints={hints} onShowHint={vi.fn()} status="idle" />);
    const buddy = screen.getByLabelText(/terminal buddy hints/i);
    const avatarButton = screen.getByRole("button", { name: /open terminal buddy/i });

    vi.spyOn(avatarButton, "getBoundingClientRect").mockReturnValue({
      bottom: 164,
      height: 64,
      left: 100,
      right: 164,
      top: 100,
      width: 64,
      x: 100,
      y: 100,
      toJSON: () => ({})
    });

    const pointerMove = new Event("pointermove");
    Object.defineProperties(pointerMove, {
      clientX: { value: 150 },
      clientY: { value: 120 },
      pointerType: { value: "mouse" }
    });

    act(() => {
      document.dispatchEvent(pointerMove);
    });

    expect(buddy).toHaveClass("is-clinging");
    expect(container.querySelector(".terminal-buddy")).toHaveStyle("--buddy-nudge-x: 9px");

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(buddy).toHaveClass("is-hopping");

    act(() => {
      vi.advanceTimersByTime(420);
    });

    expect(buddy).not.toHaveClass("is-clinging");
    expect(buddy).not.toHaveClass("is-hopping");
    vi.useRealTimers();
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
