import type { LearnerProgress, LessonId } from "../domain/types";

export const PROGRESS_STORAGE_KEY = "learn-grep:progress:v1";

export function loadProgress(defaultLessonId: LessonId): LearnerProgress {
  const fallback = defaultProgress(defaultLessonId);
  const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);

  if (!raw) {
    return fallback;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isProgress(parsed)) {
      return fallback;
    }

    return parsed;
  } catch {
    return fallback;
  }
}

export function saveProgress(progress: LearnerProgress): void {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

export function completeLesson(
  progress: LearnerProgress,
  completedLessonId: LessonId,
  nextLessonId: LessonId
): LearnerProgress {
  const completedLessonIds = progress.completedLessonIds.includes(completedLessonId)
    ? progress.completedLessonIds
    : [...progress.completedLessonIds, completedLessonId];

  return {
    currentLessonId: nextLessonId,
    completedLessonIds
  };
}

export function resetProgress(defaultLessonId: LessonId): LearnerProgress {
  localStorage.removeItem(PROGRESS_STORAGE_KEY);
  return defaultProgress(defaultLessonId);
}

function defaultProgress(defaultLessonId: LessonId): LearnerProgress {
  return {
    currentLessonId: defaultLessonId,
    completedLessonIds: []
  };
}

function isProgress(value: unknown): value is LearnerProgress {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybe = value as Partial<LearnerProgress>;
  return (
    typeof maybe.currentLessonId === "string" &&
    Array.isArray(maybe.completedLessonIds) &&
    maybe.completedLessonIds.every((id) => typeof id === "string")
  );
}
