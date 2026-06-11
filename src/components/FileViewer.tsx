import type { MatchSpan, PracticeFile } from "../domain/types";
import { HighlightedText } from "./HighlightedText";

interface FileViewerProps {
  file: PracticeFile;
  matchSpans: MatchSpan[];
}

export function FileViewer({ file, matchSpans }: FileViewerProps) {
  return (
    <section className="workbench-panel file-panel" aria-label={`${file.filename} sample file`}>
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

      <pre className="file-viewer" aria-label={`${file.filename} contents`}>
        {file.lines.map((line, index) => {
          const lineNumber = index + 1;
          const lineMatches = matchSpans.filter((span) => span.lineNumber === lineNumber);

          return (
            <code className="file-line" key={`${file.id}-${lineNumber}`}>
              <span className="line-number" aria-hidden="true">
                {String(lineNumber).padStart(2, "0")}
              </span>
              <span className="line-text">
                <HighlightedText
                  text={line}
                  spans={lineMatches.map((match) => ({ start: match.start, end: match.end }))}
                  groups={lineMatches.flatMap((match) => match.groups)}
                />
              </span>
            </code>
          );
        })}
      </pre>
    </section>
  );
}
