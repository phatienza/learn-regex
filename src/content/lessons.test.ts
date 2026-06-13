import { describe, expect, it } from "vitest";
import { evaluateAttempt } from "../domain/grepEngine";
import { lessons } from "./lessons";
import { practiceFiles } from "./practiceFiles";

const filesById = new Map(practiceFiles.map((file) => [file.id, file]));

describe("beginner lessons", () => {
  it("defines the 17-step beginner concept ladder in order", () => {
    expect(lessons.map((lesson) => lesson.concept)).toEqual([
      "Literal matches",
      "Case sensitivity with -i",
      "Start anchor ^",
      "End anchor $",
      "Any character .",
      "Escaping special characters",
      "Character sets and ranges",
      "Shorthand digit and space classes",
      "One or more with +",
      "Zero or more with *",
      "Optional pieces with ?",
      "Counted repetition with {2,4}",
      "Combined repetition",
      "Exact shapes",
      "Alternation with |",
      "Groups",
      "Capstone line-number search"
    ]);
  });

  it("references existing files and includes usable teaching content", () => {
    lessons.forEach((lesson, index) => {
      expect(lesson.order).toBe(index + 1);
      expect(filesById.has(lesson.practiceFileId)).toBe(true);
      expect(lesson.hints).toHaveLength(3);
      expect(lesson.expected.outputLines.length).toBeGreaterThan(0);
      expect(lesson.canonicalCommand).toMatch(/^grep\b/);
      expect(lesson.example.command).toMatch(/^grep\b/);
      expect(lesson.example.explanation.length).toBeGreaterThan(20);
    });
  });

  it("has example and canonical commands that run against the visible file", () => {
    lessons.forEach((lesson) => {
      const file = filesById.get(lesson.practiceFileId);
      expect(file, lesson.title).toBeDefined();

      const exampleResult = evaluateAttempt(
        lesson.example.command,
        { ...lesson, expected: { outputLines: [], matches: [] }, successFeedback: "example" },
        file!
      );
      expect(exampleResult.outputLines.length, `${lesson.title} example`).toBeGreaterThan(0);

      const result = evaluateAttempt(lesson.canonicalCommand, lesson, file!);
      expect(result.status, lesson.title).toBe("pass");
      expect(result.outputLines.map((line) => line.displayText)).toEqual(
        lesson.expected.outputLines
      );
    });
  });

  it("keeps concepts in teaching order", () => {
    const escapeLesson = lessons.find((lesson) => lesson.id === "escape-special-characters");
    const repetitionLessons = lessons.filter((lesson) =>
      ["one-or-more", "zero-or-more", "optional-pieces", "counted-repetition", "combined-repetition"].includes(lesson.id)
    );
    const groupsLesson = lessons.find((lesson) => lesson.id === "groups");
    const capstoneLesson = lessons.find((lesson) => lesson.id === "capstone-log-search");

    expect(escapeLesson?.canonicalCommand).toBe("grep 'v1\\.2\\.0' version-notes.txt");
    expect(escapeLesson?.canonicalCommand).not.toContain("-E");
    expect(escapeLesson?.canonicalCommand).not.toContain("\\d");
    expect(repetitionLessons.map((lesson) => lesson.concept)).toEqual([
      "One or more with +",
      "Zero or more with *",
      "Optional pieces with ?",
      "Counted repetition with {2,4}",
      "Combined repetition"
    ]);
    expect(groupsLesson?.canonicalCommand).toBe("grep -E '(api|web)-\\d+' targets.txt");
    expect(capstoneLesson?.example.explanation).toContain("-n");
    expect(capstoneLesson?.example.explanation).toContain("> findings.txt");
  });

  it("explains and requires -E for the one-or-more lesson", () => {
    const oneOrMoreLesson = lessons.find((lesson) => lesson.id === "one-or-more");
    const file = filesById.get(oneOrMoreLesson?.practiceFileId ?? "");

    expect(oneOrMoreLesson).toBeDefined();
    expect(file).toBeDefined();
    expect(oneOrMoreLesson?.example.command).toBe("grep -E '^job-\\d$' request-ids.txt");
    expect(oneOrMoreLesson?.explanation).toContain("extended regex");
    expect(oneOrMoreLesson?.explanation).toContain("+");

    const missingExtendedFlag = evaluateAttempt("grep '^job-\\d+$' request-ids.txt", oneOrMoreLesson!, file!);

    expect(missingExtendedFlag.status).toBe("fail");
    expect(missingExtendedFlag.feedback).toContain("-E");
  });

  it("uses capstone-only output redirection", () => {
    const redirectLessons = lessons.filter((lesson) => lesson.allowRedirect);

    expect(redirectLessons.map((lesson) => lesson.id)).toEqual(["capstone-log-search"]);
    expect(redirectLessons[0].canonicalCommand).toContain("> findings.txt");
  });

  it("does not use POSIX class syntax in beginner-facing content", () => {
    const lessonText = JSON.stringify(lessons);

    expect(lessonText).not.toContain("[[:digit:]]");
    expect(lessonText).not.toContain("[[:alpha:]]");
    expect(lessonText).not.toContain("[[:space:]]");
  });
});
