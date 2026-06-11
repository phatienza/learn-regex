import { ArrowRight, CheckCircle2, Lightbulb, Play, RotateCcw, XCircle } from "lucide-react";
import type { AttemptResult, Lesson } from "../domain/types";
import { HighlightedText } from "./HighlightedText";

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
  const visibleHints = lesson.hints.slice(0, hintCount);

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

      <div className="learn-block">
        <span>Learn</span>
        <p>{lesson.example.explanation}</p>
        <div className="example-command">
          <div>
            <span>Example command</span>
            <code>$ {lesson.example.command}</code>
          </div>
          <button className="secondary-button" onClick={onRunExample} type="button">
            <Play aria-hidden="true" size={17} />
            Run example
          </button>
        </div>
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
          onRun();
        }}
      >
        <label htmlFor="grep-command">Grep command</label>
        <div className="command-row">
          <span className="prompt-symbol" aria-hidden="true">
            $
          </span>
          <input
            autoComplete="off"
            id="grep-command"
            onChange={(event) => onCommandChange(event.target.value)}
            placeholder={`grep 'pattern' ${filename}`}
            spellCheck={false}
            value={command}
          />
          <button className="primary-button" type="submit">
            <Play aria-hidden="true" size={17} />
            Run command
          </button>
        </div>
      </form>

      <div className="terminal-output" aria-live="polite">
        <div className="terminal-output-title">Output</div>
        {result ? (
          result.outputLines.length > 0 ? (
            result.outputLines.map((line, index) => (
              <pre className="terminal-output-line" key={`${line.lineNumber}-${index}`}>
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
        <button
          className="secondary-button"
          disabled={hintCount >= lesson.hints.length}
          onClick={onShowHint}
          type="button"
        >
          <Lightbulb aria-hidden="true" size={17} />
          Show hint
        </button>
        <button className="primary-button" disabled={!isPass} onClick={onAdvance} type="button">
          <ArrowRight aria-hidden="true" size={17} />
          {isLastLesson ? "Finish path" : "Next lesson"}
        </button>
      </div>

      {visibleHints.length > 0 ? (
        <ol className="hint-list">
          {visibleHints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ol>
      ) : null}

      {isComplete ? <p className="completion-note">Beginner path complete. Progress is saved in this browser.</p> : null}
    </section>
  );
}
