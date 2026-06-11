import { describe, expect, it } from "vitest";
import { evaluateAttempt } from "../domain/grepEngine";
import { lessons } from "./lessons";
import { practiceFiles } from "./practiceFiles";

const filesById = new Map(practiceFiles.map((file) => [file.id, file]));

describe("beginner lessons", () => {
  it("defines the 12-step beginner concept ladder in order", () => {
    expect(lessons.map((lesson) => lesson.concept)).toEqual([
      "Literal matches",
      "Case sensitivity with -i",
      "Start anchor ^",
      "End anchor $",
      "Any character .",
      "Character sets and ranges",
      "POSIX digit, letter, and space classes",
      "Repetition with grep -E",
      "Exact shapes",
      "Alternation with |",
      "Groups",
      "Capstone log search"
    ]);
  });

  it("references existing files and includes usable teaching content", () => {
    lessons.forEach((lesson, index) => {
      expect(lesson.order).toBe(index + 1);
      expect(filesById.has(lesson.practiceFileId)).toBe(true);
      expect(lesson.hints).toHaveLength(3);
      expect(lesson.expected.outputLines.length).toBeGreaterThan(0);
      expect(lesson.canonicalCommand).toMatch(/^grep\b/);
    });
  });

  it("has canonical commands that pass output-based validation", () => {
    lessons.forEach((lesson) => {
      const file = filesById.get(lesson.practiceFileId);
      expect(file, lesson.title).toBeDefined();

      const result = evaluateAttempt(lesson.canonicalCommand, lesson, file!);
      expect(result.status, lesson.title).toBe("pass");
      expect(result.outputLines.map((line) => line.displayText)).toEqual(
        lesson.expected.outputLines
      );
    });
  });

  it("uses capstone-only output redirection", () => {
    const redirectLessons = lessons.filter((lesson) => lesson.allowRedirect);

    expect(redirectLessons.map((lesson) => lesson.id)).toEqual(["capstone-log-search"]);
    expect(redirectLessons[0].canonicalCommand).toContain("> findings.txt");
  });
});
