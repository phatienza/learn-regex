import type { TextSpan } from "../domain/types";

interface HighlightedTextProps {
  text: string;
  spans: TextSpan[];
  groups?: TextSpan[];
  lineNumbers?: TextSpan[];
}

export function HighlightedText({ text, spans, groups = [], lineNumbers = [] }: HighlightedTextProps) {
  if (spans.length === 0 && groups.length === 0 && lineNumbers.length === 0) {
    return <>{text}</>;
  }

  const boundaries = new Set<number>([0, text.length]);
  [...spans, ...groups, ...lineNumbers].forEach((span) => {
    boundaries.add(clamp(span.start, text.length));
    boundaries.add(clamp(span.end, text.length));
  });

  const sorted = [...boundaries].sort((left, right) => left - right);

  return (
    <>
      {sorted.slice(0, -1).map((start, index) => {
        const end = sorted[index + 1];
        const value = text.slice(start, end);
        const isMatch = spans.some((span) => start >= span.start && end <= span.end);
        const isGroup = groups.some((span) => start >= span.start && end <= span.end);
        const isLineNumber = lineNumbers.some((span) => start >= span.start && end <= span.end);

        if (!value) {
          return null;
        }

        if (!isMatch && !isGroup && !isLineNumber) {
          return <span key={`${start}-${end}-${value}`}>{value}</span>;
        }

        if (isLineNumber) {
          return (
            <mark className="text-highlight text-highlight-line-number" key={`${start}-${end}-${value}`}>
              {value}
            </mark>
          );
        }

        return (
          <mark className={isGroup ? "text-highlight text-highlight-group" : "text-highlight"} key={`${start}-${end}-${value}`}>
            {value}
          </mark>
        );
      })}
    </>
  );
}

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(value, max));
}
