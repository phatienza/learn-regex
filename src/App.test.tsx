import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { PROGRESS_STORAGE_KEY } from "./storage/progress";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = vi.fn();
  });

  it("renders the learn grep workbench heading", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /learn grep regex/i })).toBeInTheDocument();
  });

  it("shows Paul Henry Atienza as the app author", () => {
    render(<App />);

    expect(screen.getByText(/built by/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /paul henry atienza/i })).toHaveAttribute(
      "href",
      "https://paulatienza.dev/"
    );
  });

  it("starts a lesson in learn mode with the lab hidden", () => {
    render(<App />);

    expect(screen.getByText("Learn")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run example/i })).toBeInTheDocument();
    expect(screen.queryByText("Lab")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/grep command/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /next lesson/i })).not.toBeInTheDocument();
  });

  it("running the example reveals the lab, collapses learn, and focuses the command prompt", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /run example/i }));

    expect(screen.getByText("Lab")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /show learn/i })).toBeInTheDocument();
    expect(
      screen.queryByText("Literal text has no special regex meaning. This example finds lines that contain INFO.")
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/grep command/i)).toHaveFocus();
  });

  it("lets the learner reopen Learn after the example runs without losing lab state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /run example/i }));
    await user.type(screen.getByLabelText(/grep command/i), "grep 'ERROR' app.log");
    await user.click(screen.getByRole("button", { name: /show learn/i }));

    expect(
      screen.getByText("Literal text has no special regex meaning. This example finds lines that contain INFO.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/grep command/i)).toHaveValue("grep 'ERROR' app.log");
    expect(screen.getByRole("button", { name: /hide learn/i })).toBeInTheDocument();
  });

  it("lets a learner complete the first lesson and advance with saved progress", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("app.log")).toBeInTheDocument();
    expect(screen.getByText("Learn")).toBeInTheDocument();
    expect(screen.getByText(/example command/i)).toBeInTheDocument();
    expect(screen.queryByText(/expected output/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /run example/i }));

    expect(
      screen.getByText((_content, element) => {
        return (
          element?.classList.contains("example-output-line") === true &&
          element.textContent === "INFO boot sequence complete"
        );
      })
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/grep command/i), "grep 'ERROR' app.log");
    await user.click(screen.getByRole("button", { name: /run command/i }));

    expect(screen.getByText("$ grep 'ERROR' app.log")).toBeInTheDocument();
    expect(screen.getByText("Nice. Literal search is the baseline for every regex.")).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) => {
        return (
          element?.classList.contains("terminal-output-line") === true &&
          element.textContent === "ERROR payment worker failed"
        );
      })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next lesson/i }));

    expect(screen.getByRole("heading", { name: /ignore case/i })).toBeInTheDocument();
    expect(screen.queryByText("Lab")).not.toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0 });
    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}")).toMatchObject({
      currentLessonId: "case-insensitive",
      completedLessonIds: ["literal-matches"]
    });
  });
});
