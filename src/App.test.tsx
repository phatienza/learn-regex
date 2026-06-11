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

  it("lets a learner complete the first lesson and advance with saved progress", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("app.log")).toBeInTheDocument();
    expect(screen.getByText("ERROR payment worker failed")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/grep command/i), "grep 'ERROR' app.log");
    await user.click(screen.getByRole("button", { name: /run command/i }));

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
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0 });
    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}")).toMatchObject({
      currentLessonId: "case-insensitive",
      completedLessonIds: ["literal-matches"]
    });
  });
});
