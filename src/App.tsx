import { useEffect, useMemo, useState } from "react";
import { FileViewer } from "./components/FileViewer";
import { LessonHeader } from "./components/LessonHeader";
import { TerminalPanel } from "./components/TerminalPanel";
import { lessons } from "./content/lessons";
import { findPracticeFile } from "./content/practiceFiles";
import { evaluateAttempt } from "./domain/grepEngine";
import type { AttemptResult, LearnerProgress } from "./domain/types";
import { completeLesson, loadProgress, saveProgress, resetProgress } from "./storage/progress";
import "./styles.css";

const firstLesson = lessons[0];

export function App() {
  const [progress, setProgress] = useState<LearnerProgress>(() => loadProgress(firstLesson.id));
  const [command, setCommand] = useState("");
  const [result, setResult] = useState<AttemptResult | undefined>();
  const [hintCount, setHintCount] = useState(0);

  const currentLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === progress.currentLessonId) ?? firstLesson,
    [progress.currentLessonId]
  );
  const currentFile = findPracticeFile(currentLesson.practiceFileId) ?? findPracticeFile(firstLesson.practiceFileId)!;
  const currentLessonIndex = lessons.findIndex((lesson) => lesson.id === currentLesson.id);
  const isLastLesson = currentLessonIndex === lessons.length - 1;
  const isComplete = lessons.every((lesson) => progress.completedLessonIds.includes(lesson.id));

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const settleScroll = window.setTimeout(() => window.scrollTo({ top: 0 }), 0);

    return () => window.clearTimeout(settleScroll);
  }, [currentLesson.id]);

  function runCommand() {
    setResult(evaluateAttempt(command, currentLesson, currentFile));
  }

  function advanceLesson() {
    const nextLesson = lessons[Math.min(currentLessonIndex + 1, lessons.length - 1)];
    const nextProgress = completeLesson(progress, currentLesson.id, nextLesson.id);

    setProgress(nextProgress);
    saveProgress(nextProgress);
    setCommand("");
    setResult(undefined);
    setHintCount(0);
  }

  function selectLesson(lessonId: string) {
    const nextProgress = {
      ...progress,
      currentLessonId: lessonId
    };

    setProgress(nextProgress);
    saveProgress(nextProgress);
    setCommand("");
    setResult(undefined);
    setHintCount(0);
  }

  function resetAllProgress() {
    setProgress(resetProgress(firstLesson.id));
    setCommand("");
    setResult(undefined);
    setHintCount(0);
  }

  return (
    <main className="app-shell" aria-label="Learn Grep Regex">
      <LessonHeader
        currentLesson={currentLesson}
        lessons={lessons}
        onSelectLesson={selectLesson}
        progress={progress}
      />

      <div className="workbench-layout">
        <FileViewer file={currentFile} matchSpans={result?.matchSpans ?? []} />
        <TerminalPanel
          command={command}
          filename={currentFile.filename}
          hintCount={hintCount}
          isComplete={isComplete}
          isLastLesson={isLastLesson}
          lesson={currentLesson}
          onAdvance={advanceLesson}
          onCommandChange={setCommand}
          onReset={resetAllProgress}
          onRun={runCommand}
          onShowHint={() => setHintCount((count) => Math.min(count + 1, currentLesson.hints.length))}
          result={result}
        />
      </div>
    </main>
  );
}
