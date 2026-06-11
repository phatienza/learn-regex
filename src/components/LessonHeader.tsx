import type { LearnerProgress, Lesson } from "../domain/types";

interface LessonHeaderProps {
  currentLesson: Lesson;
  lessons: Lesson[];
  progress: LearnerProgress;
  onSelectLesson: (lessonId: string) => void;
}

export function LessonHeader({
  currentLesson,
  lessons,
  progress,
  onSelectLesson
}: LessonHeaderProps) {
  const currentIndex = lessons.findIndex((lesson) => lesson.id === currentLesson.id);

  return (
    <header className="lesson-header">
      <div className="lesson-copy">
        <p className="terminal-path">~/learn-regex/beginner/{currentLesson.order}</p>
        <h1>Learn Grep Regex</h1>
        <h2>{currentLesson.title}</h2>
        <p>{currentLesson.explanation}</p>
      </div>

      <nav className="lesson-progress" aria-label="Beginner lesson progress">
        <span className="progress-label">
          Lesson {currentLesson.order} of {lessons.length}
        </span>
        <div className="lesson-dots">
          {lessons.map((lesson, index) => {
            const isCompleted = progress.completedLessonIds.includes(lesson.id);
            const isCurrent = lesson.id === currentLesson.id;
            const isUnlocked = isCompleted || index <= currentIndex;

            return (
              <button
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Lesson ${lesson.order}: ${lesson.title}`}
                className={`lesson-dot${isCompleted ? " is-complete" : ""}${isCurrent ? " is-current" : ""}`}
                disabled={!isUnlocked}
                key={lesson.id}
                onClick={() => onSelectLesson(lesson.id)}
                type="button"
              >
                {lesson.order}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
