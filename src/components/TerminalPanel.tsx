import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Play, RotateCcw, XCircle } from "lucide-react";
import type { AttemptResult, Lesson } from "../domain/types";
import { HighlightedText } from "./HighlightedText";
import { TerminalBuddy, type TerminalBuddyStatus } from "./TerminalBuddy";

interface TerminalPanelProps {
  lesson: Lesson;
  filename: string;
  command: string;
  result?: AttemptResult;
  exampleResult?: AttemptResult;
  hintCount: number;
  isLastLesson: boolean;
  isComplete: boolean;
  onCommandChange: (command: string) => void;
  onRun: () => void;
  onRunExample: () => void;
  onShowHint: () => void;
  onAdvance: () => void;
  onReset: () => void;
}

export function TerminalPanel({
  lesson,
  filename,
  command,
  result,
  exampleResult,
  hintCount,
  isLastLesson,
  isComplete,
  onCommandChange,
  onRun,
  onRunExample,
  onShowHint,
  onAdvance,
  onReset
}: TerminalPanelProps) {
  const isPass = result?.status === "pass";
  const hasRunExample = Boolean(exampleResult) || isComplete;
  const showPracticeControls = !isComplete || Boolean(exampleResult) || Boolean(result);
  const learnContentId = `learn-content-${lesson.id}`;
  const [isLearnOpen, setIsLearnOpen] = useState(true);
  const [shouldFocusCommand, setShouldFocusCommand] = useState(false);
  const [lastSubmittedCommand, setLastSubmittedCommand] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);
  const buddyStatus: TerminalBuddyStatus = isComplete
    ? "complete"
    : isPass
      ? "success"
      : result?.status === "fail"
        ? "fail"
        : hintCount > 0
          ? "hint"
          : "idle";

  useEffect(() => {
    setIsLearnOpen(true);
    setShouldFocusCommand(false);
    setLastSubmittedCommand("");
  }, [lesson.id]);

  useEffect(() => {
    if (exampleResult || isComplete) return;
    setIsLearnOpen(true);
    setShouldFocusCommand(false);
    setLastSubmittedCommand("");
  }, [exampleResult, isComplete]);

  useEffect(() => {
    if (!exampleResult || !shouldFocusCommand) return;
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

  return (
    <section className="workbench-panel terminal-panel" aria-labelledby="terminal-title">
      <div className="panel-bar">
        <div>
          <p className="panel-kicker">terminal</p>
          <h2 id="terminal-title">{lesson.concept}</h2>
        </div>
        <button className="icon-button" onClick={onReset} title="Reset progress" type="button">
          <RotateCcw aria-hidden="true" size={17} />
          <span className="sr-only">Reset progress</span>
        </button>
      </div>

      <div className={`learn-block${isLearnOpen ? " is-open" : " is-collapsed"}`}>
        <div className="section-heading-row">
          <span>Learn</span>
          {hasRunExample ? (
            <button
              aria-controls={learnContentId}
              aria-expanded={isLearnOpen}
              className="ghost-button"
              onClick={() => setIsLearnOpen((current) => !current)}
              type="button"
            >
              {isLearnOpen ? <ChevronUp aria-hidden="true" size={16} /> : <ChevronDown aria-hidden="true" size={16} />}
              {isLearnOpen ? "Hide Learn" : "Show Learn"}
            </button>
          ) : null}
        </div>
        {isLearnOpen ? (
          <div className="learn-content" id={learnContentId}>
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
          <div className="example-output" aria-live="polite">
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

      {hasRunExample ? (
        <div className="lab-workspace">
          {showPracticeControls ? (
            <>
              <div className="lesson-prompt">
                <span>Lab</span>
                <p>{lesson.prompt}</p>
                <div className="expected-output">
                  <span>Expected output</span>
                  {lesson.expected.outputLines.map((line) => (
                    <pre className="expected-output-line" key={line}>
                      {line}
                    </pre>
                  ))}
                </div>
              </div>

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

              <div className="terminal-output" aria-live="polite">
                <div className="terminal-output-title">Output</div>
                {lastSubmittedCommand ? <pre className="terminal-command-echo">$ {lastSubmittedCommand}</pre> : null}
                {result ? (
                  result.outputLines.length > 0 ? (
                    result.outputLines.map((line, index) => (
                      <pre className="terminal-output-line terminal-line-appear" key={`${line.lineNumber}-${index}`}>
                        <HighlightedText
                          text={line.displayText}
                          spans={line.spans}
                          groups={line.groups}
                          lineNumbers={line.lineNumberSpans}
                        />
                      </pre>
                    ))
                  ) : (
                    <p className="terminal-empty">No lines matched.</p>
                  )
                ) : (
                  <p className="terminal-empty">Run a command to compare output with the lesson goal.</p>
                )}
              </div>

              {result ? (
                <div className={`feedback ${isPass ? "is-pass" : "is-fail"}`} role="status">
                  {isPass ? <CheckCircle2 aria-hidden="true" size={18} /> : <XCircle aria-hidden="true" size={18} />}
                  <span>{result.feedback}</span>
                </div>
              ) : null}

              <div className="terminal-actions">
                <button className="primary-button" disabled={!isPass} onClick={onAdvance} type="button">
                  <ArrowRight aria-hidden="true" size={17} />
                  {isLastLesson ? "Finish path" : "Next lesson"}
                </button>
              </div>
            </>
          ) : null}

          <TerminalBuddy hints={lesson.hints} hintCount={hintCount} onShowHint={onShowHint} status={buddyStatus} />

          {isComplete ? <p className="completion-note">Beginner path complete. Progress is saved in this browser.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
