import { parseGrepCommand } from "./grepParser";
import type {
  AttemptResult,
  Lesson,
  MatchSpan,
  OutputLine,
  ParsedGrepCommand,
  PracticeFile,
  TextSpan
} from "./types";

interface GrepExecution {
  outputLines: OutputLine[];
  matchSpans: MatchSpan[];
}

export function executeGrep(command: ParsedGrepCommand, file: PracticeFile): GrepExecution {
  const regex = buildRegex(command);
  const outputLines: OutputLine[] = [];
  const matchSpans: MatchSpan[] = [];

  file.lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const matches = collectLineMatches(regex, line, lineNumber);

    if (matches.length === 0) {
      return;
    }

    matchSpans.push(...matches);

    if (command.flags.onlyMatching) {
      matches.forEach((match) => {
        outputLines.push(formatOnlyMatchingOutput(command, match));
      });
      return;
    }

    const prefix = command.flags.lineNumber ? `${lineNumber}:` : "";
    outputLines.push({
      lineNumber,
      text: line,
      displayText: `${prefix}${line}`,
      spans: matches.map((match) => ({
        start: prefix.length + match.start,
        end: prefix.length + match.end
      })),
      groups: matches.flatMap((match) =>
        match.groups.map((group) => ({
          start: prefix.length + group.start,
          end: prefix.length + group.end
        }))
      )
    });
  });

  return { outputLines, matchSpans };
}

export function evaluateAttempt(
  commandInput: string,
  lesson: Lesson,
  file: PracticeFile
): AttemptResult {
  const parsed = parseGrepCommand(commandInput, {
    allowRedirect: lesson.allowRedirect === true
  });

  if (!parsed.ok) {
    return {
      outputLines: [],
      matchSpans: [],
      status: "fail",
      feedback: parsed.error
    };
  }

  if (parsed.command.filename !== file.filename) {
    return {
      parsed: parsed.command,
      outputLines: [],
      matchSpans: [],
      status: "fail",
      feedback: `Use the visible sample file: ${file.filename}.`
    };
  }

  let execution: GrepExecution;
  try {
    execution = executeGrep(parsed.command, file);
  } catch (error) {
    return {
      parsed: parsed.command,
      outputLines: [],
      matchSpans: [],
      status: "fail",
      feedback: error instanceof Error ? error.message : "The regex could not be run."
    };
  }

  const actual = execution.outputLines.map((line) => line.displayText);
  const expected = lesson.expected.outputLines;
  const passed = arraysEqual(actual, expected);

  return {
    parsed: parsed.command,
    ...execution,
    status: passed ? "pass" : "fail",
    feedback: passed
      ? lesson.successFeedback
      : "That command ran, but the output does not match this lesson yet."
  };
}

function buildRegex(command: ParsedGrepCommand): RegExp {
  const pattern = translatePosixClasses(command.pattern);
  const flags = `g${command.flags.ignoreCase ? "i" : ""}`;

  try {
    return new RegExp(pattern, flags);
  } catch {
    throw new Error("That regex is not valid yet. Check the pattern syntax.");
  }
}

function translatePosixClasses(pattern: string): string {
  return pattern
    .replace(/\[\[:digit:\]\]/g, "[0-9]")
    .replace(/\[\[:alpha:\]\]/g, "[A-Za-z]")
    .replace(/\[\[:space:\]\]/g, "\\s");
}

function collectLineMatches(regex: RegExp, line: string, lineNumber: number): MatchSpan[] {
  const matches: MatchSpan[] = [];
  regex.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(line))) {
    const text = match[0];
    const start = match.index;
    const end = start + text.length;

    matches.push({
      lineNumber,
      start,
      end,
      text,
      groups: captureGroupSpans(match, start)
    });

    if (text.length === 0) {
      regex.lastIndex += 1;
    }
  }

  return matches;
}

function captureGroupSpans(match: RegExpExecArray, matchStart: number): TextSpan[] {
  const fullMatch = match[0];
  const spans: TextSpan[] = [];
  let searchFrom = 0;

  match.slice(1).forEach((group) => {
    if (!group) {
      return;
    }

    const groupStartInMatch = fullMatch.indexOf(group, searchFrom);
    if (groupStartInMatch === -1) {
      return;
    }

    const start = matchStart + groupStartInMatch;
    const end = start + group.length;
    spans.push({ start, end });
    searchFrom = groupStartInMatch + group.length;
  });

  return spans;
}

function formatOnlyMatchingOutput(command: ParsedGrepCommand, match: MatchSpan): OutputLine {
  const prefix = command.flags.lineNumber ? `${match.lineNumber}:` : "";

  return {
    lineNumber: match.lineNumber,
    text: match.text,
    displayText: `${prefix}${match.text}`,
    spans: [{ start: prefix.length, end: prefix.length + match.text.length }],
    groups: match.groups.map((group) => ({
      start: prefix.length + group.start - match.start,
      end: prefix.length + group.end - match.start
    }))
  };
}

function arraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
