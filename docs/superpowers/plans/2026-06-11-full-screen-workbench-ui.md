# Full-Screen Workbench UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved full-screen workbench UI with guided Learn-to-Lab flow, editor-style sample file chrome, terminal-style command entry, transcript output, and the Terminal Buddy hint mascot.

**Architecture:** Keep `App` responsible for lesson/progress/attempt state. Extend `TerminalPanel` for local Learn collapse, command focus, and submitted-command transcript state. Split Terminal Buddy into its own component so hint UI does not bloat the terminal panel, and keep FileViewer responsible for editor chrome.

**Tech Stack:** Vite, React 19, TypeScript, Vitest, Testing Library, CSS, lucide-react, generated transparent PNG/WebP asset in `public/`.

---

## File Structure

- Modify `src/App.test.tsx`: integration tests for guided Learn/Lab flow, terminal transcript, focus, and lesson reset.
- Create `src/components/FileViewer.test.tsx`: focused tests for editor-style file chrome.
- Modify `src/components/FileViewer.tsx`: add filename tab, path/context, read-only badge, and line count.
- Create `src/components/TerminalBuddy.test.tsx`: focused tests for progressive hint behavior and status states.
- Create `src/components/TerminalBuddy.tsx`: mascot image, hint button, hint bubble, and status copy.
- Modify `src/components/TerminalPanel.tsx`: Learn/Lab reveal flow, focus ref, terminal command prompt, submitted-command transcript, and Terminal Buddy integration.
- Modify `src/styles.css`: full-screen shell, independent pane scrolling, editor chrome, guided panel transitions, terminal prompt styling, Terminal Buddy styling, and reduced-motion fallbacks.
- Create `public/terminal-buddy.png`: generated transparent mascot asset.

## Task 1: Guided Learn-To-Lab Tests

**Files:**
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write failing integration tests for the guided lesson flow**

Add these tests after the author test in `src/App.test.tsx`:

```tsx
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
    expect(screen.queryByText("Literal text has no special regex meaning. This example finds lines that contain INFO.")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/grep command/i)).toHaveFocus();
  });

  it("lets the learner reopen Learn after the example runs without losing lab state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /run example/i }));
    await user.type(screen.getByLabelText(/grep command/i), "grep 'ERROR' app.log");
    await user.click(screen.getByRole("button", { name: /show learn/i }));

    expect(screen.getByText("Literal text has no special regex meaning. This example finds lines that contain INFO.")).toBeInTheDocument();
    expect(screen.getByLabelText(/grep command/i)).toHaveValue("grep 'ERROR' app.log");
    expect(screen.getByRole("button", { name: /hide learn/i })).toBeInTheDocument();
  });
```

Update the existing completion test so it matches the new flow and asserts transcript echo:

```tsx
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
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test:run -- src/App.test.tsx
```

Expected: FAIL because Lab is currently visible before the example, the command input is visible immediately, there is no `Show Learn` toggle, no focus handoff, and no transcript command echo.

- [ ] **Step 3: Commit the failing tests**

Run:

```bash
git add src/App.test.tsx
git commit -m "test: cover guided learn lab flow"
```

## Task 2: Editor-Style File Viewer

**Files:**
- Create: `src/components/FileViewer.test.tsx`
- Modify: `src/components/FileViewer.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write a failing FileViewer chrome test**

Create `src/components/FileViewer.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FileViewer } from "./FileViewer";
import type { PracticeFile } from "../domain/types";

const file: PracticeFile = {
  id: "app-log",
  filename: "app.log",
  lines: ["INFO boot sequence complete", "ERROR payment worker failed"]
};

describe("FileViewer", () => {
  it("renders sample files with editor chrome", () => {
    render(<FileViewer file={file} matchSpans={[]} />);

    expect(screen.getByRole("tab", { name: "app.log" })).toBeInTheDocument();
    expect(screen.getByText("~/learn-regex/samples/app.log")).toBeInTheDocument();
    expect(screen.getByText("read-only")).toBeInTheDocument();
    expect(screen.getByText("2 lines")).toBeInTheDocument();
    expect(screen.getByLabelText("app.log contents")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the FileViewer test to verify it fails**

Run:

```bash
npm run test:run -- src/components/FileViewer.test.tsx
```

Expected: FAIL because the current file viewer has no tab role, no sample path, and no read-only status.

- [ ] **Step 3: Implement editor chrome in FileViewer**

Replace the header in `src/components/FileViewer.tsx` with:

```tsx
      <div className="editor-chrome">
        <div className="editor-tabs" role="tablist" aria-label="Open sample files">
          <button className="editor-tab is-active" role="tab" aria-selected="true" type="button">
            {file.filename}
          </button>
        </div>
        <div className="editor-meta">
          <span className="editor-path">~/learn-regex/samples/{file.filename}</span>
          <span className="editor-badge">read-only</span>
          <span className="line-count">{file.lines.length} lines</span>
        </div>
      </div>
```

Keep the existing `<pre className="file-viewer">` and file-line rendering unchanged.

Add CSS:

```css
.editor-chrome {
  border-bottom: 1px solid #2d3932;
  background: #171c19;
}

.editor-tabs {
  display: flex;
  min-height: 42px;
  align-items: end;
  gap: 6px;
  padding: 8px 10px 0;
}

.editor-tab {
  min-height: 34px;
  border: 1px solid #2d3932;
  border-bottom-color: #0d100e;
  border-radius: 6px 6px 0 0;
  padding: 0 14px;
  color: #f6f3e8;
  background: #0d100e;
  cursor: default;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.84rem;
}

.editor-meta {
  display: flex;
  min-height: 34px;
  align-items: center;
  gap: 10px;
  border-top: 1px solid #26312c;
  padding: 0 12px;
  color: #9fb0a6;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.78rem;
}

.editor-path {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor-badge {
  border: 1px solid #334139;
  border-radius: 999px;
  padding: 2px 7px;
  color: #8bd89f;
  background: #101411;
  white-space: nowrap;
}
```

- [ ] **Step 4: Run the FileViewer test to verify it passes**

Run:

```bash
npm run test:run -- src/components/FileViewer.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the file viewer change**

Run:

```bash
git add src/components/FileViewer.test.tsx src/components/FileViewer.tsx src/styles.css
git commit -m "feat: add editor chrome to file viewer"
```

## Task 3: Terminal Buddy Component And Asset

**Files:**
- Create: `public/terminal-buddy.png`
- Create: `public/terminal-buddy-idle.png`
- Create: `public/terminal-buddy-hint.png`
- Create: `public/terminal-buddy-fail.png`
- Create: `public/terminal-buddy-success.png`
- Create: `public/terminal-buddy-complete.png`
- Create: `src/components/TerminalBuddy.test.tsx`
- Create: `src/components/TerminalBuddy.tsx`
- Modify: `index.html`
- Modify: `src/seo.test.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Generate the Terminal Buddy bitmap assets**

Use the image generation tool to create a transparent PNG and save it to `public/terminal-buddy.png`. Use that as the favicon/base mascot.

Prompt:

```text
A tiny friendly command-line mascot named Terminal Buddy for a dark terminal learning app. Blocky cursor-inspired character, compact square proportions, glowing green terminal face, small pixel-like body, transparent background, no text, no letters, no symbols, no watermark, clean edges, suitable at 64px.
```

Then create five state sprites from the same character:

- `public/terminal-buddy-idle.png`
- `public/terminal-buddy-hint.png`
- `public/terminal-buddy-fail.png`
- `public/terminal-buddy-success.png`
- `public/terminal-buddy-complete.png`

The variants should keep the same silhouette and change only small expression/accent details. Use green for idle, cyan/yellow for hint, red for fail, bright green for success, and gold for complete.

Expected output: all six PNG files exist, are transparent PNGs, and look like the same mascot. If the image tool returns WebP, save WebP state variants and use matching `.webp` paths consistently.

- [ ] **Step 1a: Add the favicon assertion**

In `src/seo.test.ts`, extend the metadata test:

```ts
expect(html).toContain('rel="icon" type="image/png" href="/terminal-buddy.png"');
```

Run:

```bash
npm run test:run -- src/seo.test.ts
```

Expected: FAIL until `index.html` links the favicon.

- [ ] **Step 1b: Link the Terminal Buddy favicon**

In `index.html`, add the favicon in the `<head>` near the canonical link:

```html
<link rel="icon" type="image/png" href="/terminal-buddy.png" />
```

Run:

```bash
npm run test:run -- src/seo.test.ts
```

Expected: PASS.

- [ ] **Step 2: Write failing TerminalBuddy tests**

Create `src/components/TerminalBuddy.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TerminalBuddy } from "./TerminalBuddy";

const hints = ["Search for ERROR.", "Use the filename app.log."];

describe("TerminalBuddy", () => {
  it("shows the next hint through a terminal-style mascot control", async () => {
    const user = userEvent.setup();
    const onShowHint = vi.fn();

    render(<TerminalBuddy hints={hints} hintCount={0} status="idle" onShowHint={onShowHint} />);

    expect(screen.getByAltText("Terminal Buddy")).toBeInTheDocument();
    expect(screen.getByAltText("Terminal Buddy")).toHaveAttribute("src", "/terminal-buddy-idle.png");
    await user.click(screen.getByRole("button", { name: /ask terminal buddy/i }));

    expect(onShowHint).toHaveBeenCalledTimes(1);
  });

  it("renders visible hints and disables the control when all hints are shown", () => {
    render(<TerminalBuddy hints={hints} hintCount={2} status="hint" onShowHint={vi.fn()} />);

    expect(screen.getByText("Search for ERROR.")).toBeInTheDocument();
    expect(screen.getByText("Use the filename app.log.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /no more hints/i })).toBeDisabled();
  });

  it("uses status copy for failed and successful attempts", () => {
    const { rerender } = render(<TerminalBuddy hints={hints} hintCount={0} status="fail" onShowHint={vi.fn()} />);

    expect(screen.getByText(/need a nudge/i)).toBeInTheDocument();

    rerender(<TerminalBuddy hints={hints} hintCount={0} status="success" onShowHint={vi.fn()} />);

    expect(screen.getByText(/nice match/i)).toBeInTheDocument();
    expect(screen.getByAltText("Terminal Buddy")).toHaveAttribute("src", "/terminal-buddy-success.png");
  });

  it("uses the complete sprite and achievement copy", () => {
    render(<TerminalBuddy hints={hints} hintCount={0} status="complete" onShowHint={vi.fn()} />);

    expect(screen.getByText(/path complete/i)).toBeInTheDocument();
    expect(screen.getByAltText("Terminal Buddy")).toHaveAttribute("src", "/terminal-buddy-complete.png");
  });
});
```

- [ ] **Step 3: Run TerminalBuddy tests to verify they fail**

Run:

```bash
npm run test:run -- src/components/TerminalBuddy.test.tsx
```

Expected: FAIL because `TerminalBuddy.tsx` does not exist yet.

- [ ] **Step 4: Implement TerminalBuddy**

Create `src/components/TerminalBuddy.tsx`:

```tsx
interface TerminalBuddyProps {
  hints: string[];
  hintCount: number;
  status: "idle" | "hint" | "fail" | "success" | "complete";
  onShowHint: () => void;
}

const mascotSprites: Record<TerminalBuddyProps["status"], string> = {
  idle: "/terminal-buddy-idle.png",
  hint: "/terminal-buddy-hint.png",
  fail: "/terminal-buddy-fail.png",
  success: "/terminal-buddy-success.png",
  complete: "/terminal-buddy-complete.png"
};

export function TerminalBuddy({ hints, hintCount, status, onShowHint }: TerminalBuddyProps) {
  const visibleHints = hints.slice(0, hintCount);
  const hasMoreHints = hintCount < hints.length;
  const statusText = getStatusText(status, hintCount);
  const buttonLabel = hasMoreHints ? "Ask Terminal Buddy for a hint" : "No more hints from Terminal Buddy";

  return (
    <aside className={`terminal-buddy is-${status}`} aria-label="Terminal Buddy hints">
      <div className="terminal-buddy-avatar-wrap">
        <img className="terminal-buddy-avatar" src={mascotSprites[status]} alt="Terminal Buddy" width="64" height="64" />
      </div>
      <div className="terminal-buddy-panel">
        <p className="terminal-buddy-status">{statusText}</p>
        {visibleHints.length > 0 ? (
          <ol className="terminal-buddy-hints" aria-live="polite">
            {visibleHints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ol>
        ) : null}
        <button className="secondary-button terminal-buddy-button" disabled={!hasMoreHints} onClick={onShowHint} type="button">
          {hasMoreHints ? "Ask Buddy" : "No more hints"}
        </button>
      </div>
    </aside>
  );
}

function getStatusText(status: TerminalBuddyProps["status"], hintCount: number): string {
  if (status === "complete") {
    return "Path complete. Strong regex energy.";
  }

  if (status === "success") {
    return "Nice match. Ready for the next one.";
  }

  if (status === "fail") {
    return "Need a nudge? I can reveal the next clue.";
  }

  if (hintCount > 0 || status === "hint") {
    return "Hint stream open.";
  }

  return "Stuck? Ask for a small clue.";
}
```

- [ ] **Step 5: Add TerminalBuddy styles**

Add to `src/styles.css`:

```css
.terminal-buddy {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 12px;
  align-items: end;
  border-top: 1px solid #26312c;
  padding: 14px 16px;
  background: #101411;
}

.terminal-buddy-avatar-wrap {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 1px solid #334139;
  border-radius: 8px;
  background: #0b0f0c;
}

.terminal-buddy-avatar {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(0 0 12px rgba(139, 216, 159, 0.22));
}

.terminal-buddy-panel {
  min-width: 0;
  border: 1px solid #334139;
  border-radius: 8px;
  padding: 10px;
  background: #0d100e;
}

.terminal-buddy-status {
  margin-bottom: 8px;
  color: #dbe7df;
  font-size: 0.88rem;
  line-height: 1.4;
}

.terminal-buddy-hints {
  margin: 0 0 10px;
  padding-left: 20px;
  color: #f4f6ef;
  font-size: 0.88rem;
  line-height: 1.45;
}

.terminal-buddy-button {
  min-height: 34px;
  padding: 0 10px;
  font-size: 0.82rem;
}

.terminal-buddy.is-fail .terminal-buddy-avatar-wrap {
  border-color: #fca5a5;
}

.terminal-buddy.is-success .terminal-buddy-avatar-wrap {
  border-color: #8bd89f;
}

.terminal-buddy.is-complete .terminal-buddy-avatar-wrap {
  border-color: #f4d35e;
}

.terminal-buddy.is-idle .terminal-buddy-avatar,
.terminal-buddy.is-hint .terminal-buddy-avatar {
  animation: terminal-buddy-idle 2.8s ease-in-out infinite;
}

@keyframes terminal-buddy-idle {
  0%,
  100% {
    transform: translateY(0);
    filter: drop-shadow(0 0 10px rgba(139, 216, 159, 0.18));
  }

  50% {
    transform: translateY(-2px);
    filter: drop-shadow(0 0 14px rgba(139, 216, 159, 0.3));
  }
}

@media (prefers-reduced-motion: reduce) {
  .terminal-buddy.is-idle .terminal-buddy-avatar,
  .terminal-buddy.is-hint .terminal-buddy-avatar {
    animation: none;
  }
}
```

- [ ] **Step 6: Run TerminalBuddy tests to verify they pass**

Run:

```bash
npm run test:run -- src/components/TerminalBuddy.test.tsx src/seo.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit Terminal Buddy component and asset**

Run:

```bash
git add public/terminal-buddy.png public/terminal-buddy-idle.png public/terminal-buddy-hint.png public/terminal-buddy-fail.png public/terminal-buddy-success.png public/terminal-buddy-complete.png index.html src/seo.test.ts src/components/TerminalBuddy.test.tsx src/components/TerminalBuddy.tsx src/styles.css
git commit -m "feat: add terminal buddy hint component"
```

## Task 4: TerminalPanel Guided Flow, Prompt, Transcript, And Buddy Integration

**Files:**
- Modify: `src/components/TerminalPanel.tsx`
- Modify: `src/styles.css`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Implement local panel state and focus behavior**

In `src/components/TerminalPanel.tsx`, update imports:

```tsx
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Play, RotateCcw, XCircle } from "lucide-react";
import type { AttemptResult, Lesson } from "../domain/types";
import { HighlightedText } from "./HighlightedText";
import { TerminalBuddy, type TerminalBuddyStatus } from "./TerminalBuddy";
```

Inside the component, after `visibleHints`:

```tsx
  const hasRunExample = Boolean(exampleResult);
  const [isLearnOpen, setIsLearnOpen] = useState(true);
  const [shouldFocusCommand, setShouldFocusCommand] = useState(false);
  const [lastSubmittedCommand, setLastSubmittedCommand] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLearnOpen(true);
    setShouldFocusCommand(false);
    setLastSubmittedCommand("");
  }, [lesson.id]);

  useEffect(() => {
    if (!exampleResult || !shouldFocusCommand) {
      return;
    }

    commandInputRef.current?.focus();
    setShouldFocusCommand(false);
  }, [exampleResult, shouldFocusCommand]);

  function handleRunExample() {
    setIsLearnOpen(false);
    setShouldFocusCommand(true);
    onRunExample();
  }

  function handleRunCommand() {
    setLastSubmittedCommand(command);
    onRun();
  }

  const buddyStatus: TerminalBuddyStatus = isComplete
    ? "complete"
    : isPass
      ? "success"
      : result?.status === "fail"
        ? "fail"
        : hintCount > 0
          ? "hint"
          : "idle";
```

- [ ] **Step 2: Replace Learn rendering with collapsible Learn panel**

Use this structure where `.learn-block` currently renders:

```tsx
      <div className={`learn-block${isLearnOpen ? " is-open" : " is-collapsed"}`}>
        <div className="section-heading-row">
          <span>Learn</span>
          {hasRunExample ? (
            <button className="ghost-button" onClick={() => setIsLearnOpen((value) => !value)} type="button">
              {isLearnOpen ? <ChevronUp aria-hidden="true" size={16} /> : <ChevronDown aria-hidden="true" size={16} />}
              {isLearnOpen ? "Hide Learn" : "Show Learn"}
            </button>
          ) : null}
        </div>
        {isLearnOpen ? (
          <div className="learn-content">
            <p>{lesson.example.explanation}</p>
            <div className="example-command">
              <div>
                <span>Example command</span>
                <code>$ {lesson.example.command}</code>
              </div>
              <button className="secondary-button" onClick={handleRunExample} type="button">
                <Play aria-hidden="true" size={17} />
                Run example
              </button>
            </div>
          </div>
        ) : null}
        {exampleResult ? (
          <div className="example-output terminal-line-appear" aria-live="polite">
            {exampleResult.outputLines.length > 0 ? (
              exampleResult.outputLines.map((line, index) => (
                <pre className="example-output-line" key={`${line.lineNumber}-${index}`}>
                  <HighlightedText
                    text={line.displayText}
                    spans={line.spans}
                    groups={line.groups}
                    lineNumbers={line.lineNumberSpans}
                  />
                </pre>
              ))
            ) : (
              <p className="terminal-empty">No example lines matched.</p>
            )}
          </div>
        ) : null}
      </div>
```

- [ ] **Step 3: Hide Lab until the example runs**

Wrap Lab, form, output, feedback, actions, and Terminal Buddy in:

```tsx
      {hasRunExample ? (
        <div className="lab-workspace">
          {/* existing lesson-prompt, command form, terminal output, feedback, terminal actions go here */}
        </div>
      ) : null}
```

Remove the old `.hint-list` rendering after actions because Terminal Buddy owns hints.

- [ ] **Step 4: Replace the command form with terminal prompt styling**

Use this form:

```tsx
          <form
            className="command-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleRunCommand();
            }}
          >
            <label htmlFor="grep-command">Grep command</label>
            <div className="command-line">
              <span className="prompt-symbol" aria-hidden="true">
                $
              </span>
              <input
                autoComplete="off"
                id="grep-command"
                onChange={(event) => onCommandChange(event.target.value)}
                placeholder={`grep 'pattern' ${filename}`}
                ref={commandInputRef}
                spellCheck={false}
                value={command}
              />
              <span className="terminal-cursor" aria-hidden="true" />
              <button className="run-command-button" type="submit">
                <Play aria-hidden="true" size={15} />
                Run
              </button>
            </div>
          </form>
```

- [ ] **Step 5: Echo the submitted command in terminal output**

At the top of `.terminal-output`, after the output title:

```tsx
            {lastSubmittedCommand ? <pre className="terminal-command-echo">$ {lastSubmittedCommand}</pre> : null}
```

Keep existing result output rendering below the echo.

- [ ] **Step 6: Replace the hint action with Terminal Buddy**

Inside `.lab-workspace`, after feedback and before the next action row:

```tsx
          <TerminalBuddy hints={lesson.hints} hintCount={hintCount} onShowHint={onShowHint} status={buddyStatus} />
```

Keep the `Next lesson` button in `.terminal-actions`, but remove the old `Show hint` button:

```tsx
          <div className="terminal-actions">
            <button className="primary-button" disabled={!isPass} onClick={onAdvance} type="button">
              <ArrowRight aria-hidden="true" size={17} />
              {isLastLesson ? "Finish path" : "Next lesson"}
            </button>
          </div>
```

- [ ] **Step 7: Add terminal panel CSS**

Add or adjust these styles in `src/styles.css`:

```css
.section-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ghost-button {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  gap: 6px;
  border: 1px solid #334139;
  border-radius: 6px;
  padding: 0 10px;
  color: #d7e2dc;
  background: #101411;
  cursor: pointer;
  font-size: 0.82rem;
}

.learn-content,
.lab-workspace {
  display: grid;
  gap: 0;
  animation: panel-enter 160ms ease-out;
}

.command-line {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  border: 1px solid #26312c;
  border-radius: 6px;
  padding: 0 8px 0 12px;
  background: #0b0f0c;
}

.command-line:focus-within {
  border-color: #7dd3fc;
  box-shadow: inset 0 0 0 1px rgba(125, 211, 252, 0.45);
}

.command-line input {
  min-width: 0;
  width: 100%;
  border: 0;
  padding: 0;
  color: #f8fafc;
  background: transparent;
  outline: 0;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.9rem;
}

.terminal-cursor {
  width: 8px;
  height: 18px;
  background: #8bd89f;
  opacity: 0;
}

.command-line:focus-within .terminal-cursor {
  opacity: 1;
  animation: cursor-blink 1s steps(2, start) infinite;
}

.run-command-button {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  gap: 6px;
  border-radius: 5px;
  padding: 0 10px;
  color: #07110b;
  background: #8bd89f;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
}

.terminal-command-echo {
  margin: 0 0 10px;
  color: #8bd89f;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.9rem;
  line-height: 1.55;
  white-space: pre;
}

.terminal-line-appear {
  animation: panel-enter 160ms ease-out;
}

@keyframes cursor-blink {
  50% {
    opacity: 0;
  }
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 8: Run guided flow tests**

Run:

```bash
npm run test:run -- src/App.test.tsx src/components/TerminalBuddy.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit guided terminal flow**

Run:

```bash
git add src/App.test.tsx src/components/TerminalPanel.tsx src/styles.css
git commit -m "feat: guide lessons from learn to lab"
```

## Task 5: Full-Screen Layout And Responsive CSS

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Add viewport-shell CSS**

Update these existing rules in `src/styles.css`:

```css
html,
body,
#root {
  min-width: 320px;
  min-height: 100%;
  margin: 0;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(37, 49, 42, 0.42), rgba(16, 17, 15, 0) 360px),
    #10110f;
}

.app-shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(1440px, 100%);
  height: 100dvh;
  margin: 0 auto;
  padding: 18px 24px 16px;
  overflow: hidden;
}

.lesson-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
  gap: 20px;
  align-items: end;
  padding: 0 0 14px;
}

.workbench-layout {
  display: grid;
  min-height: 0;
  grid-template-columns: minmax(360px, 0.95fr) minmax(420px, 1.05fr);
  gap: 18px;
  align-items: stretch;
}

.workbench-panel {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #2d3932;
  border-radius: 8px;
  background: #151814;
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.28);
}

.file-panel,
.terminal-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.file-viewer {
  min-height: 0;
  max-height: none;
  margin: 0;
  overflow: auto;
  padding: 14px 0;
  background: #0d100e;
  color: #d8e4dd;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.92rem;
  line-height: 1.65;
}

.terminal-panel {
  overflow: auto;
}
```

- [ ] **Step 2: Add mobile and reduced-motion fallbacks**

Update media sections:

```css
@media (max-width: 980px) {
  body {
    overflow: auto;
  }

  .app-shell {
    height: auto;
    min-height: 100dvh;
    overflow: visible;
  }

  .lesson-header,
  .workbench-layout {
    grid-template-columns: 1fr;
  }

  .workbench-layout {
    align-items: start;
  }

  .lesson-progress {
    justify-items: start;
  }

  .file-viewer {
    min-height: 280px;
    max-height: 46vh;
  }

  .terminal-panel {
    max-height: none;
  }

  .site-footer {
    justify-content: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Run the full test suite**

Run:

```bash
npm run test:run
```

Expected: PASS for all test files.

- [ ] **Step 4: Commit layout CSS**

Run:

```bash
git add src/styles.css
git commit -m "feat: make workbench fill the viewport"
```

## Task 6: Build, Browser QA, And Final Polish

**Files:**
- Modify if browser QA exposes a visible issue: `src/styles.css`
- Modify if browser QA exposes an interaction issue: `src/components/TerminalPanel.tsx`
- Modify if browser QA exposes editor chrome issue: `src/components/FileViewer.tsx`
- Modify if browser QA exposes mascot issue: `src/components/TerminalBuddy.tsx`

- [ ] **Step 1: Run production build**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build complete with exit code 0.

- [ ] **Step 2: Start the dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL. Use the exact printed URL for browser QA.

- [ ] **Step 3: Browser QA desktop**

Open the local URL in the in-app browser and verify at a desktop viewport:

- Initial lesson shows Learn and hides Lab.
- File viewer has editor tab, path, read-only badge, and line count.
- Whole page does not require normal document scrolling during desktop lesson work.
- Running the example collapses Learn, reveals Lab, and focuses the command prompt.
- Command entry visually reads as `$ grep ...` in a terminal line, not a boxed text field.
- Running the lab echoes `$ grep 'ERROR' app.log` above output.
- Terminal Buddy reveals hints progressively and disables after all hints are visible.
- Failed attempt shows Terminal Buddy helpful state.
- Successful attempt shows Terminal Buddy success state and leaves Next lesson usable.

- [ ] **Step 4: Browser QA mobile**

Set viewport to a mobile width and verify:

- File viewer and terminal stack without overlap.
- File viewer remains scrollable.
- Terminal content remains readable.
- Buttons and text do not overflow their containers.
- Terminal Buddy bubble does not cover command entry or next action.

- [ ] **Step 5: Fix visible QA issues**

If QA finds layout or interaction issues, make focused edits only in the affected file, then rerun:

```bash
npm run test:run
npm run build
```

Expected: both commands pass.

- [ ] **Step 6: Commit QA polish**

If Step 5 changed files, run:

```bash
git add src/styles.css src/components/TerminalPanel.tsx src/components/FileViewer.tsx src/components/TerminalBuddy.tsx
git commit -m "fix: polish full-screen workbench interactions"
```

If Step 5 did not change files, skip this commit.

## Final Verification

- [ ] Run:

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] Run:

```bash
npm run build
```

Expected: production build succeeds.

- [ ] Confirm browser QA evidence for desktop and mobile before claiming completion.
