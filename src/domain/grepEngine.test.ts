import { describe, expect, it } from "vitest";
import { executeGrep, evaluateAttempt } from "./grepEngine";
import type { Lesson, PracticeFile } from "./types";

const file: PracticeFile = {
  id: "sample",
  filename: "sample.log",
  lines: [
    "INFO api-12 started",
    "warn web-7 slow",
    "ERROR api-42 failed",
    "ticket AB-1204 opened on 2026-06-10",
    "release v1.24.0"
  ]
};

describe("executeGrep", () => {
  it("matches literal text and supports ignore-case output", () => {
    const result = executeGrep(
      {
        raw: "grep -i warn sample.log",
        pattern: "WARN",
        filename: "sample.log",
        flags: { extended: false, ignoreCase: true, lineNumber: false, onlyMatching: false }
      },
      file
    );

    expect(result.outputLines.map((line) => line.displayText)).toEqual(["warn web-7 slow"]);
    expect(result.matchSpans).toEqual([
      { lineNumber: 2, start: 0, end: 4, text: "warn", groups: [] }
    ]);
  });

  it("supports anchors, dot, character sets, shorthand classes, repetition, and exact shapes", () => {
    expect(
      executeGrep(
        {
          raw: "grep '^ERROR' sample.log",
          pattern: "^ERROR",
          filename: "sample.log",
          flags: { extended: false, ignoreCase: false, lineNumber: false, onlyMatching: false }
        },
        file
      ).outputLines.map((line) => line.displayText)
    ).toEqual(["ERROR api-42 failed"]);

    expect(
      executeGrep(
        {
          raw: "grep -E 'api-\\d+' sample.log",
          pattern: "api-\\d+",
          filename: "sample.log",
          flags: { extended: true, ignoreCase: false, lineNumber: false, onlyMatching: true }
        },
        file
      ).outputLines.map((line) => line.displayText)
    ).toEqual(["api-12", "api-42"]);

    expect(
      executeGrep(
        {
          raw: "grep -E 'v\\d\\.\\d{2}\\.\\d' sample.log",
          pattern: "v\\d\\.\\d{2}\\.\\d",
          filename: "sample.log",
          flags: { extended: true, ignoreCase: false, lineNumber: false, onlyMatching: true }
        },
        file
      ).outputLines.map((line) => line.displayText)
    ).toEqual(["v1.24.0"]);
  });

  it("supports beginner shorthand classes and escaped literal dots without POSIX translation", () => {
    const versionResult = executeGrep(
      {
        raw: "grep -E 'v\\d\\.\\d\\d\\.\\d' sample.log",
        pattern: "v\\d\\.\\d\\d\\.\\d",
        filename: "sample.log",
        flags: { extended: true, ignoreCase: false, lineNumber: false, onlyMatching: true }
      },
      {
        id: "sample",
        filename: "sample.log",
        lines: ["release v1.24.0", "release v1-24-0", "release v1x24x0"]
      }
    );

    expect(versionResult.outputLines.map((line) => line.displayText)).toEqual(["v1.24.0"]);

    const classResult = executeGrep(
      {
        raw: "grep -E '\\D\\d\\s' sample.log",
        pattern: "\\D\\d\\s",
        filename: "sample.log",
        flags: { extended: true, ignoreCase: false, lineNumber: false, onlyMatching: true }
      },
      {
        id: "sample",
        filename: "sample.log",
        lines: ["A1 ready", "11 ready", "B2 ready"]
      }
    );

    expect(classResult.outputLines.map((line) => line.displayText)).toEqual(["A1 ", "B2 "]);

    const nonSpaceResult = executeGrep(
      {
        raw: "grep -E '\\S+' sample.log",
        pattern: "\\S+",
        filename: "sample.log",
        flags: { extended: true, ignoreCase: false, lineNumber: false, onlyMatching: true }
      },
      {
        id: "sample",
        filename: "sample.log",
        lines: ["one two"]
      }
    );

    expect(nonSpaceResult.outputLines.map((line) => line.displayText)).toEqual(["one", "two"]);

    const oldPosixResult = executeGrep(
      {
        raw: "grep '[[:digit:]]' sample.log",
        pattern: "[[:digit:]]",
        filename: "sample.log",
        flags: { extended: false, ignoreCase: false, lineNumber: false, onlyMatching: true }
      },
      {
        id: "sample",
        filename: "sample.log",
        lines: ["ticket 7"]
      }
    );

    expect(oldPosixResult.outputLines.map((line) => line.displayText)).toEqual([]);
  });

  it("supports alternation, line numbers, only-matching output, and group spans", () => {
    const result = executeGrep(
      {
        raw: "grep -Eno '(api|web)-\\d+' sample.log",
        pattern: "(api|web)-\\d+",
        filename: "sample.log",
        flags: { extended: true, ignoreCase: false, lineNumber: true, onlyMatching: true }
      },
      file
    );

    expect(result.outputLines.map((line) => line.displayText)).toEqual([
      "1:api-12",
      "2:web-7",
      "3:api-42"
    ]);
    expect(result.outputLines.map((line) => line.lineNumberSpans)).toEqual([
      [{ start: 0, end: 2 }],
      [{ start: 0, end: 2 }],
      [{ start: 0, end: 2 }]
    ]);
    expect(result.matchSpans.map((span) => span.groups)).toEqual([
      [{ start: 5, end: 8 }],
      [{ start: 5, end: 8 }],
      [{ start: 6, end: 9 }]
    ]);
  });
});

describe("evaluateAttempt", () => {
  const lesson: Lesson = {
    id: "literal",
    order: 1,
    title: "Literal matches",
    concept: "Literal text",
    explanation: "Find the ERROR line.",
    example: {
      command: "grep 'INFO' sample.log",
      explanation: "Example text for the test fixture."
    },
    practiceFileId: "sample",
    prompt: "Find ERROR.",
    hints: ["Search for the exact word.", "Use grep 'ERROR' sample.log"],
    expected: {
      outputLines: ["ERROR api-42 failed"],
      matches: [{ lineNumber: 3, text: "ERROR" }]
    },
    canonicalCommand: "grep 'ERROR' sample.log",
    successFeedback: "You found the error line."
  };

  it("passes when produced output equals the lesson expectation", () => {
    expect(evaluateAttempt("grep 'ERROR' sample.log", lesson, file)).toMatchObject({
      status: "pass",
      feedback: "You found the error line."
    });
  });

  it("fails with feedback when parsing fails or output differs", () => {
    expect(evaluateAttempt("cat sample.log", lesson, file)).toMatchObject({
      status: "fail",
      feedback: "Commands must start with grep."
    });

    expect(evaluateAttempt("grep 'INFO' sample.log", lesson, file)).toMatchObject({
      status: "fail",
      feedback: "That command ran, but the output does not match this lesson yet."
    });
  });
});
