import { beforeEach, describe, expect, it } from "vitest";
import {
  completeLesson,
  loadProgress,
  PROGRESS_STORAGE_KEY,
  resetProgress,
  saveProgress
} from "./progress";

describe("progress storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads default progress when nothing is stored", () => {
    expect(loadProgress("literal-matches")).toEqual({
      currentLessonId: "literal-matches",
      completedLessonIds: []
    });
  });

  it("saves and loads progress", () => {
    saveProgress({
      currentLessonId: "case-insensitive",
      completedLessonIds: ["literal-matches"]
    });

    expect(loadProgress("literal-matches")).toEqual({
      currentLessonId: "case-insensitive",
      completedLessonIds: ["literal-matches"]
    });
  });

  it("completes lessons without duplicating ids and advances the current lesson", () => {
    const first = completeLesson(
      { currentLessonId: "literal-matches", completedLessonIds: [] },
      "literal-matches",
      "case-insensitive"
    );
    const second = completeLesson(first, "literal-matches", "case-insensitive");

    expect(second).toEqual({
      currentLessonId: "case-insensitive",
      completedLessonIds: ["literal-matches"]
    });
  });

  it("resets progress back to the first lesson", () => {
    saveProgress({
      currentLessonId: "groups",
      completedLessonIds: ["literal-matches", "case-insensitive"]
    });

    expect(resetProgress("literal-matches")).toEqual({
      currentLessonId: "literal-matches",
      completedLessonIds: []
    });
    expect(localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it("falls back to defaults when stored data is invalid", () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ currentLessonId: 12 }));

    expect(loadProgress("literal-matches")).toEqual({
      currentLessonId: "literal-matches",
      completedLessonIds: []
    });
  });
});
