import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { lessons } from "./content/lessons";
import { PROGRESS_STORAGE_KEY } from "./storage/progress";

function expectAbsentOrNotVisible(element: HTMLElement | null) {
  if (element === null) {
    expect(element).not.toBeInTheDocument();
    return;
  }

  expect(element).not.toBeVisible();
}

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

    expect(screen.queryByText(/^Learn$/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run example/i })).toBeInTheDocument();
    expect(screen.queryByText("Ask me for hints when you get stuck.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open terminal buddy/i })).toBeInTheDocument();
    expect(screen.getAllByText("Lesson 1 of 17")).toHaveLength(1);
    expect(screen.getByRole("navigation", { name: /beginner lesson progress/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/terminal buddy hints/i)).toHaveClass("is-floating");
    expect(screen.getByLabelText(/terminal buddy hints/i).closest(".lesson-header")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/terminal buddy hints/i).closest(".terminal-panel")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lesson 1: find exact text/i })).toBeInTheDocument();
    expect(document.querySelector(".lesson-dots")).not.toBeInTheDocument();
    expect(screen.getByText("Run the example to inspect its output.")).toBeInTheDocument();
    expectAbsentOrNotVisible(screen.queryByText("Lab"));
    expectAbsentOrNotVisible(screen.queryByLabelText(/grep command/i));
    expectAbsentOrNotVisible(screen.queryByRole("button", { name: /next lesson/i, hidden: true }));
  });

  it("running the example keeps Learn open for output inspection before starting the Lab", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /run example/i }));

    expect(
      screen.getByText("Literal text has no special regex meaning. This example finds lines that contain INFO.")
    ).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) => {
        return (
          element?.classList.contains("example-output-line") === true &&
          element.textContent === "INFO boot sequence complete"
        );
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start lab/i })).toBeInTheDocument();
    expectAbsentOrNotVisible(screen.queryByText("Lab"));
    expectAbsentOrNotVisible(screen.queryByLabelText(/grep command/i));

    await user.click(screen.getByRole("button", { name: /start lab/i }));

    expect(screen.getByText("Lab")).toBeInTheDocument();
    expect(screen.queryByText(/show learn/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /show lesson notes/i })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByLabelText(/grep command/i)).toHaveFocus();
  });

  it("targets the lab workspace when starting lesson 6 practice", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        currentLessonId: "escape-special-characters",
        completedLessonIds: lessons.slice(0, 5).map((lesson) => lesson.id)
      })
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: /run example/i }));
    await user.click(screen.getByRole("button", { name: /start lab/i }));

    expect(screen.getByText("Find only the row that contains the literal version v1.2.0.")).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start", behavior: "smooth" });
    expect(screen.getByLabelText(/grep command/i)).toHaveFocus();
  });

  it("lets the learner reopen Learn after the example runs without losing lab state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /run example/i }));
    await user.click(screen.getByRole("button", { name: /start lab/i }));
    await user.type(screen.getByLabelText(/grep command/i), "grep 'ERROR' app.log");
    await user.click(screen.getByRole("button", { name: /show lesson notes/i }));

    expect(
      screen.getByText("Literal text has no special regex meaning. This example finds lines that contain INFO.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/grep command/i)).toHaveValue("grep 'ERROR' app.log");
    expect(screen.queryByText(/hide learn/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hide lesson notes/i })).toBeInTheDocument();
  });

  it("reset after running the first example restores Learn content and Run example access", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /run example/i }));
    expect(screen.getByRole("button", { name: /start lab/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reset progress/i }));

    expect(
      screen.getByText("Literal text has no special regex meaning. This example finds lines that contain INFO.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run example/i })).toBeInTheDocument();
    expectAbsentOrNotVisible(screen.queryByText("Lab"));
  });

  it("submits the command with Enter and echoes the terminal command", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /run example/i }));
    await user.click(screen.getByRole("button", { name: /start lab/i }));
    await user.type(screen.getByLabelText(/grep command/i), "grep 'ERROR' app.log");
    await user.keyboard("{Enter}");

    expect(screen.getByText("$ grep 'ERROR' app.log")).toBeInTheDocument();
    const buddy = screen.getByLabelText(/terminal buddy hints/i);

    expect(within(buddy).getByText("Nice. Literal search is the baseline for every regex.")).toBeInTheDocument();
    expect(buddy).toHaveClass("is-floating");
    expect(buddy.closest(".lesson-header")).not.toBeInTheDocument();
    expect(buddy.closest(".terminal-panel")).not.toBeInTheDocument();
    expect(document.querySelector(".feedback")).not.toBeInTheDocument();
  });

  it("lets a learner complete the first lesson and advance with saved progress", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("app.log")).toBeInTheDocument();
    expect(screen.queryByText(/^Learn$/)).not.toBeInTheDocument();
    expect(screen.getByText(/example command/i)).toBeInTheDocument();
    expectAbsentOrNotVisible(screen.queryByText(/expected output/i));

    await user.click(screen.getByRole("button", { name: /run example/i }));

    expect(
      screen.getByText((_content, element) => {
        return (
          element?.classList.contains("example-output-line") === true &&
          element.textContent === "INFO boot sequence complete"
        );
      })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /start lab/i }));
    await user.type(screen.getByLabelText(/grep command/i), "grep 'ERROR' app.log");
    await user.click(screen.getByRole("button", { name: /^run$/i }));

    expect(screen.getByText("$ grep 'ERROR' app.log")).toBeInTheDocument();
    const buddy = screen.getByLabelText(/terminal buddy hints/i);

    expect(within(buddy).getByText("Nice. Literal search is the baseline for every regex.")).toBeInTheDocument();
    expect(within(buddy).queryByRole("button", { name: /next lesson/i })).not.toBeInTheDocument();
    const terminalActions = document.querySelector(".terminal-actions") as HTMLElement | null;

    expect(terminalActions).toBeInTheDocument();
    expect(within(terminalActions!).getByRole("button", { name: /next lesson/i })).toBeEnabled();
    expect(terminalActions?.previousElementSibling).toHaveClass("command-form");
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
    expectAbsentOrNotVisible(screen.queryByText("Lab"));
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0 });
    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}")).toMatchObject({
      currentLessonId: "case-insensitive",
      completedLessonIds: ["literal-matches"]
    });
  });

  it("shows completion note and complete Buddy copy after finishing the capstone", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        currentLessonId: "capstone-log-search",
        completedLessonIds: lessons
          .filter((lesson) => lesson.id !== "capstone-log-search")
          .map((lesson) => lesson.id)
      })
    );
    render(<App />);

    expect(screen.getByRole("heading", { name: /save numbered findings/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /run example/i }));
    await user.click(screen.getByRole("button", { name: /start lab/i }));
    await user.type(
      screen.getByLabelText(/grep command/i),
      "grep -En 'WARN|ERROR' incident.log > findings.txt"
    );
    await user.click(screen.getByRole("button", { name: /^run$/i }));
    await user.click(screen.getByRole("button", { name: /finish path/i }));

    expect(screen.getByText("Beginner path complete. Progress is saved in this browser.")).toBeInTheDocument();
    expect(screen.getByText("Path complete. Strong regex energy.")).toBeInTheDocument();
  });
});
