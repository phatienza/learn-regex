import type { MatchSpan, PracticeFile } from "../domain/types";
import { HighlightedText } from "./HighlightedText";

interface FileViewerProps {
  file: PracticeFile;
  matchSpans: MatchSpan[];
}

export function FileViewer({ file, matchSpans }: FileViewerProps) {
  return (
    <section className="workbench-panel file-panel" aria-labelledby="file-viewer-title">
      <div className="panel-bar">
        <div>
          <p className="panel-kicker">sample file</p>
          <h2 id="file-viewer-title">{file.filename}</h2>
        </div>
        <span className="line-count">{file.lines.length} lines</span>
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
