export type LessonId = string;
export type PracticeFileId = string;

export interface PracticeFile {
  id: PracticeFileId;
  filename: string;
  lines: string[];
  lineLabels?: Record<number, string>;
}

export interface ExpectedMatch {
  lineNumber: number;
  text: string;
}

export interface LessonExample {
  command: string;
  explanation: string;
}

export interface Lesson {
  id: LessonId;
  order: number;
  title: string;
  concept: string;
  explanation: string;
  example: LessonExample;
  practiceFileId: PracticeFileId;
  prompt: string;
  hints: string[];
  expected: {
    outputLines: string[];
    matches: ExpectedMatch[];
  };
  canonicalCommand: string;
  successFeedback: string;
  allowRedirect?: boolean;
  requiresExtended?: boolean;
}

export interface ParsedGrepCommand {
  raw: string;
  pattern: string;
  filename: string;
  flags: {
    extended: boolean;
    ignoreCase: boolean;
    lineNumber: boolean;
    onlyMatching: boolean;
  };
  redirectTo?: "findings.txt";
}

export type ParseResult =
  | {
      ok: true;
      command: ParsedGrepCommand;
    }
  | {
      ok: false;
      error: string;
    };

export interface ParseOptions {
  allowRedirect?: boolean;
}

export interface TextSpan {
  start: number;
  end: number;
}

export interface MatchSpan extends TextSpan {
  lineNumber: number;
  text: string;
  groups: TextSpan[];
}

export interface OutputLine {
  lineNumber: number;
  text: string;
  displayText: string;
  spans: TextSpan[];
  groups: TextSpan[];
  lineNumberSpans: TextSpan[];
}

export interface AttemptResult {
  parsed?: ParsedGrepCommand;
  outputLines: OutputLine[];
  matchSpans: MatchSpan[];
  status: "pass" | "fail";
  feedback: string;
}

export interface LearnerProgress {
  currentLessonId: LessonId;
  completedLessonIds: LessonId[];
}
