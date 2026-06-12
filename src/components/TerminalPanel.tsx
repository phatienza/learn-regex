import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, Play, RotateCcw } from "lucide-react";
import type { AttemptResult, Lesson } from "../domain/types";
import { HighlightedText } from "./HighlightedText";

interface TerminalPanelProps {
  lesson: Lesson;
  filename: string;
  command: string;
  result?: AttemptResult;
  exampleResult?: AttemptResult;
  isComplete: boolean;
  isLastLesson: boolean;
  onCommandChange: (command: string) => void;
  onAdvance: () => void;
  onRun: () => void;
  onRunExample: () => void;
  onReset: () => void;
}

export function TerminalPanel({
  lesson,
  filename,
  command,
  result,
  exampleResult,
  isComplete,
  isLastLesson,
  onCommandChange,
  onAdvance,
  onRun,
  onRunExample,
  onReset
}: TerminalPanelProps) {
  const [isLabOpen, setIsLabOpen] = useState(false);
  const isPass = result?.status === "pass";
  const hasStartedLab = isLabOpen || isComplete;
  const showPracticeControls = hasStartedLab && (!isComplete || Boolean(exampleResult) || Boolean(result));
  const learnContentId = `learn-content-${lesson.id}`;
  const [isLearnOpen, setIsLearnOpen] = useState(true);
  const [shouldFocusCommand, setShouldFocusCommand] = useState(false);
  const [lastSubmittedCommand, setLastSubmittedCommand] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLearnOpen(true);
    setIsLabOpen(false);
    setShouldFocusCommand(false);
    setLastSubmittedCommand("");
  }, [lesson.id]);

  useEffect(() => {
    if (exampleResult || isComplete) return;
    setIsLearnOpen(true);
    setIsLabOpen(false);
    setShouldFocusCommand(false);
    setLastSubmittedCommand("");
  }, [exampleResult, isComplete]);

  useEffect(() => {
    if (!isLabOpen || !shouldFocusCommand) return;
    commandInputRef.current?.focus();
    setShouldFocusCommand(false);
  }, [isLabOpen, shouldFocusCommand]);

  function handleRunExample() {
    onRunExample();
  }

  function handleStartLab() {
    setIsLabOpen(true);
    setIsLearnOpen(false);
    setShouldFocusCommand(true);
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

      <div className="terminal-panel-body">
        <div className={`learn-block${isLearnOpen ? " is-open" : " is-collapsed"}`}>
          {hasStartedLab ? (
            <div className="section-heading-row">
              <button
                aria-label={isLearnOpen ? "Hide lesson notes" : "Show lesson notes"}
                aria-controls={learnContentId}
                aria-expanded={isLearnOpen}
                className="ghost-button"
                onClick={() => setIsLearnOpen((current) => !current)}
                title={isLearnOpen ? "Hide lesson notes" : "Show lesson notes"}
                type="button"
              >
                {isLearnOpen ? <ChevronUp aria-hidden="true" size={16} /> : <ChevronDown aria-hidden="true" size={16} />}
                <span className="sr-only">{isLearnOpen ? "Hide lesson notes" : "Show lesson notes"}</span>
              </button>
            </div>
          ) : null}
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
          <div className="terminal-output learn-output" aria-live="polite">
            <div className="terminal-output-title">Output</div>
            {exampleResult ? (
              exampleResult.outputLines.length > 0 ? (
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
              )
            ) : (
              <p className="terminal-empty">Run the example to inspect its output.</p>
            )}
            {exampleResult && !hasStartedLab ? (
              <button className="primary-button start-lab-button" onClick={handleStartLab} type="button">
                <ArrowRight aria-hidden="true" size={17} />
                Start lab
              </button>
            ) : null}
          </div>
        </div>

        {hasStartedLab ? (
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

                <div className="terminal-actions">
                  <button className="primary-button" disabled={!isPass} onClick={onAdvance} type="button">
                    <ArrowRight aria-hidden="true" size={17} />
                    {isLastLesson ? "Finish path" : "Next lesson"}
                  </button>
                </div>

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
              </>
            ) : null}

            {isComplete ? <p className="completion-note">Beginner path complete. Progress is saved in this browser.</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
