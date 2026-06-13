import type { Lesson } from "../domain/types";

export const lessons: Lesson[] = [
  {
    id: "literal-matches",
    order: 1,
    title: "Find Exact Text",
    concept: "Literal matches",
    explanation:
      "A literal match searches for the exact characters you type. Start by finding a single word in the log.",
    example: {
      command: "grep 'INFO' app.log",
      explanation: "Literal text has no special regex meaning. This example finds lines that contain INFO."
    },
    practiceFileId: "app-log",
    prompt: "Find the line that contains ERROR.",
    hints: [
      "Search for the exact uppercase word shown in the file.",
      "A grep command needs a pattern and a filename.",
      "Try: grep 'ERROR' app.log"
    ],
    expected: {
      outputLines: ["ERROR payment worker failed"],
      matches: [{ lineNumber: 3, text: "ERROR" }]
    },
    canonicalCommand: "grep 'ERROR' app.log",
    successFeedback: "Nice. Literal search is the baseline for every regex."
  },
  {
    id: "case-insensitive",
    order: 2,
    title: "Ignore Case",
    concept: "Case sensitivity with -i",
    explanation:
      "grep is case-sensitive by default. The -i flag finds the same letters regardless of uppercase or lowercase.",
    example: {
      command: "grep 'todo' team-notes.txt",
      explanation: "Without -i, lowercase todo only matches lowercase text."
    },
    practiceFileId: "team-notes",
    prompt: "Find every TODO item, whether it is uppercase or lowercase.",
    hints: [
      "The file contains both TODO and todo.",
      "Add the ignore-case flag before the pattern.",
      "Try: grep -i 'todo' team-notes.txt"
    ],
    expected: {
      outputLines: ["TODO rotate staging credentials", "todo document rollback steps"],
      matches: [
        { lineNumber: 1, text: "TODO" },
        { lineNumber: 3, text: "todo" }
      ]
    },
    canonicalCommand: "grep -i 'todo' team-notes.txt",
    successFeedback: "Good. -i lets the regex idea stay the same while case varies."
  },
  {
    id: "start-anchor",
    order: 3,
    title: "Match The Start",
    concept: "Start anchor ^",
    explanation:
      "The ^ anchor means the pattern must appear at the beginning of a line.",
    example: {
      command: "grep 'GET' routes.txt",
      explanation: "Literal GET finds the word anywhere, including lines that only mention GET later."
    },
    practiceFileId: "routes",
    prompt: "Find only the routes whose line starts with GET.",
    hints: [
      "Some lines contain GET later, but they should not pass.",
      "Put ^ before the literal text.",
      "Try: grep '^GET' routes.txt"
    ],
    expected: {
      outputLines: ["GET /api/users", "GET /health"],
      matches: [
        { lineNumber: 1, text: "GET" },
        { lineNumber: 3, text: "GET" }
      ]
    },
    canonicalCommand: "grep '^GET' routes.txt",
    successFeedback: "Exactly. ^ pins the match to the start of each line."
  },
  {
    id: "end-anchor",
    order: 4,
    title: "Match The End",
    concept: "End anchor $",
    explanation:
      "The $ anchor means the pattern must appear at the end of a line.",
    example: {
      command: "grep '=true' feature-flags.env",
      explanation: "Literal =true can match a value even when extra text follows it."
    },
    practiceFileId: "feature-flags",
    prompt: "Find only feature flags whose line ends with =true.",
    hints: [
      "One true value has a trailing comment, so it should not pass.",
      "Put $ after the final literal text.",
      "Try: grep '=true$' feature-flags.env"
    ],
    expected: {
      outputLines: ["SEARCH_ENABLED=true", "AUDIT_MODE=true"],
      matches: [
        { lineNumber: 1, text: "=true" },
        { lineNumber: 5, text: "=true" }
      ]
    },
    canonicalCommand: "grep '=true$' feature-flags.env",
    successFeedback: "Clean. $ keeps the match at the line ending."
  },
  {
    id: "any-character",
    order: 5,
    title: "Use Any Character",
    concept: "Any character .",
    explanation:
      "A dot matches any single character. It is useful when one position can vary.",
    example: {
      command: "grep 'v1.2' versions.txt",
      explanation: "The dot characters here are wildcards, so this can match v1.2 and v1-2."
    },
    practiceFileId: "versions",
    prompt: "Find the two version-like lines that match v1, any separator, 2, any separator, 0.",
    hints: [
      "The separators are different in two matching lines.",
      "Use . where one character can vary.",
      "Try: grep 'v1.2.0' versions.txt"
    ],
    expected: {
      outputLines: ["release v1.2.0", "release v1-2-0"],
      matches: [
        { lineNumber: 1, text: "v1.2.0" },
        { lineNumber: 2, text: "v1-2-0" }
      ]
    },
    canonicalCommand: "grep 'v1.2.0' versions.txt",
    successFeedback: "Right. Dot is flexible, so use it when any one character is allowed."
  },
  {
    id: "escape-special-characters",
    order: 6,
    title: "Escape A Dot",
    concept: "Escaping special characters",
    explanation:
      "A backslash turns a regex operator into a literal character. Use \\. when you need an actual dot.",
    example: {
      command: "grep 'v1.2.0' version-notes.txt",
      explanation: "Without backslashes, each dot is still a wildcard, so dashes and letters can sneak through."
    },
    practiceFileId: "version-notes",
    prompt: "Find only the row that contains the literal version v1.2.0.",
    hints: [
      "The dots in this version should be actual dots.",
      "Put a backslash before each dot that should be literal.",
      "Try: grep 'v1\\.2\\.0' version-notes.txt"
    ],
    expected: {
      outputLines: ["release v1.2.0 passed smoke tests"],
      matches: [{ lineNumber: 1, text: "v1.2.0" }]
    },
    canonicalCommand: "grep 'v1\\.2\\.0' version-notes.txt",
    successFeedback: "Good. Escaping keeps regex operators from acting like operators."
  },
  {
    id: "character-sets",
    order: 7,
    title: "Choose From A Set",
    concept: "Character sets and ranges",
    explanation:
      "Square brackets match one character from a set or range, such as [A-C].",
    example: {
      command: "grep '^[A-D]' users.csv",
      explanation: "A range inside brackets lets one position match A, B, C, or D."
    },
    practiceFileId: "users",
    prompt: "Find users whose names start with A, B, or C.",
    hints: [
      "The first character decides whether a row should match.",
      "Use a range inside square brackets.",
      "Try: grep '^[A-C]' users.csv"
    ],
    expected: {
      outputLines: ["Alice,dev", "Bob,ops", "Carla,qa"],
      matches: [
        { lineNumber: 1, text: "A" },
        { lineNumber: 2, text: "B" },
        { lineNumber: 3, text: "C" }
      ]
    },
    canonicalCommand: "grep '^[A-C]' users.csv",
    successFeedback: "Nice. Sets and ranges let one position accept a controlled list."
  },
  {
    id: "shorthand-classes",
    order: 8,
    title: "Use Shorthand Classes",
    concept: "Shorthand digit and space classes",
    explanation:
      "\\d means a digit, \\D means a non-digit, \\s means whitespace, and \\S means non-whitespace.",
    example: {
      command: "grep '\\d' tasks.txt",
      explanation: "\\d finds any digit in the task list, no matter where the digit appears."
    },
    practiceFileId: "tasks",
    prompt: "Find task lines that start with one non-digit, one digit, then a space.",
    hints: [
      "The shape is non-digit, digit, space.",
      "Use \\D for non-digit, \\d for digit, and \\s for space.",
      "Try: grep '^\\D\\d\\s' tasks.txt"
    ],
    expected: {
      outputLines: ["A1 deploy dashboard", "B2 rotate logs", "C3 reboot cache"],
      matches: [
        { lineNumber: 1, text: "A1 " },
        { lineNumber: 2, text: "B2 " },
        { lineNumber: 4, text: "C3 " }
      ]
    },
    canonicalCommand: "grep '^\\D\\d\\s' tasks.txt",
    successFeedback: "Good. Shorthand classes keep common character types compact."
  },
  {
    id: "one-or-more",
    order: 9,
    title: "Repeat One Or More",
    concept: "One or more with +",
    explanation:
      "Use grep -E for extended regex. In this lesson, + means the previous piece repeats one or more times.",
    example: {
      command: "grep -E '^job-\\d$' request-ids.txt",
      explanation: "With -E enabled, the next step can add + so one digit becomes one or more digits."
    },
    practiceFileId: "request-ids",
    prompt: "Find job IDs with one or more digits after job-.",
    hints: [
      "Use -E for repetition operators in grep-style commands.",
      "Put + after \\d to allow more than one digit.",
      "Try: grep -E '^job-\\d+$' request-ids.txt"
    ],
    expected: {
      outputLines: ["job-7", "job-42", "job-314"],
      matches: [
        { lineNumber: 1, text: "job-7" },
        { lineNumber: 2, text: "job-42" },
        { lineNumber: 3, text: "job-314" }
      ]
    },
    canonicalCommand: "grep -E '^job-\\d+$' request-ids.txt",
    successFeedback: "Good. -E turns on the extended form where + can mean one or more.",
    requiresExtended: true
  },
  {
    id: "zero-or-more",
    order: 10,
    title: "Allow Zero Or More",
    concept: "Zero or more with *",
    explanation:
      "With grep -E, * means the previous piece can appear zero times or many times.",
    example: {
      command: "grep -E '^lo+g$' log-shapes.txt",
      explanation: "The + version requires at least one o between l and g."
    },
    practiceFileId: "log-shapes",
    prompt: "Find lines shaped as l, zero or more o characters, then g.",
    hints: [
      "The line lg should pass because zero o characters are allowed.",
      "Put * after the o.",
      "Try: grep -E '^lo*g$' log-shapes.txt"
    ],
    expected: {
      outputLines: ["lg", "log", "loog", "looog"],
      matches: [
        { lineNumber: 1, text: "lg" },
        { lineNumber: 2, text: "log" },
        { lineNumber: 3, text: "loog" },
        { lineNumber: 4, text: "looog" }
      ]
    },
    canonicalCommand: "grep -E '^lo*g$' log-shapes.txt",
    successFeedback: "Right. * is useful when the repeated part may be absent."
  },
  {
    id: "optional-pieces",
    order: 11,
    title: "Make A Piece Optional",
    concept: "Optional pieces with ?",
    explanation:
      "With grep -E, ? means the previous piece appears zero or one time.",
    example: {
      command: "grep -E '^ERR-\\d+' alert-codes.log",
      explanation: "This version requires a dash after ERR, so it misses compact codes."
    },
    practiceFileId: "alert-codes",
    prompt: "Find ERR codes where the dash may be present or absent.",
    hints: [
      "The dash is the optional character.",
      "Put ? after the dash.",
      "Try: grep -E '^ERR-?\\d+' alert-codes.log"
    ],
    expected: {
      outputLines: ["ERR-12 api timeout", "ERR1234 web latency"],
      matches: [
        { lineNumber: 1, text: "ERR-12" },
        { lineNumber: 2, text: "ERR1234" }
      ]
    },
    canonicalCommand: "grep -E '^ERR-?\\d+' alert-codes.log",
    successFeedback: "Nice. ? handles a small optional shape change."
  },
  {
    id: "counted-repetition",
    order: 12,
    title: "Limit The Count",
    concept: "Counted repetition with {2,4}",
    explanation:
      "With grep -E, braces such as {2,4} set the minimum and maximum repeat count.",
    example: {
      command: "grep -E '^JOB-\\d+' job-codes.log",
      explanation: "\\d+ accepts any digit length, including IDs that are too short or too long."
    },
    practiceFileId: "job-codes",
    prompt: "Find JOB rows whose numeric ID has two to four digits.",
    hints: [
      "The count applies to the digit shorthand.",
      "Use {2,4} after \\d.",
      "Try: grep -E '^JOB-\\d{2,4}\\s' job-codes.log"
    ],
    expected: {
      outputLines: ["JOB-42 queued", "JOB-314 done", "JOB-9001 done"],
      matches: [
        { lineNumber: 2, text: "JOB-42 " },
        { lineNumber: 3, text: "JOB-314 " },
        { lineNumber: 4, text: "JOB-9001 " }
      ]
    },
    canonicalCommand: "grep -E '^JOB-\\d{2,4}\\s' job-codes.log",
    successFeedback: "Good. Counted repetition is how regex checks length."
  },
  {
    id: "combined-repetition",
    order: 13,
    title: "Combine Repetition",
    concept: "Combined repetition",
    explanation:
      "Repetition pieces can work together: optional punctuation, counted digits, and anchors can all describe one shape.",
    example: {
      command: "grep -E '^ERR-?\\d+' alerts.log",
      explanation: "This accepts ERR codes with or without a dash, but it does not limit the digit count yet."
    },
    practiceFileId: "alerts",
    prompt: "Find ERR alert lines with an optional dash and two to four digits.",
    hints: [
      "Use ? for the optional dash.",
      "Use {2,4} to limit the digit count.",
      "Try: grep -E '^ERR-?\\d{2,4}\\s' alerts.log"
    ],
    expected: {
      outputLines: ["ERR-12 api timeout", "ERR1234 web latency"],
      matches: [
        { lineNumber: 1, text: "ERR-12 " },
        { lineNumber: 2, text: "ERR1234 " }
      ]
    },
    canonicalCommand: "grep -E '^ERR-?\\d{2,4}\\s' alerts.log",
    successFeedback: "Sharp. Repetition lets a pattern describe a range of valid lengths."
  },
  {
    id: "exact-shapes",
    order: 14,
    title: "Describe Exact Shapes",
    concept: "Exact shapes",
    explanation:
      "Combine anchors, shorthand classes, escaped dots, and repetition to describe IDs, dates, and versions.",
    example: {
      command: "grep -E '^REL-\\d{4}-\\d{2}-\\d{2}' release-manifest.txt",
      explanation: "This example checks only the release ID and date shape at the start of the line."
    },
    practiceFileId: "release-manifest",
    prompt: "Find release rows shaped like REL-YYYY-MM-DD vN.NN.N.",
    hints: [
      "The date needs four digits, dash, two digits, dash, two digits.",
      "Use \\s for the space and escape version dots with \\.",
      "Try: grep -E '^REL-\\d{4}-\\d{2}-\\d{2}\\sv\\d\\.\\d{2}\\.\\d$' release-manifest.txt"
    ],
    expected: {
      outputLines: ["REL-2026-06-10 v1.24.0", "REL-2026-06-11 v2.03.4"],
      matches: [
        { lineNumber: 1, text: "REL-2026-06-10 v1.24.0" },
        { lineNumber: 3, text: "REL-2026-06-11 v2.03.4" }
      ]
    },
    canonicalCommand:
      "grep -E '^REL-\\d{4}-\\d{2}-\\d{2}\\sv\\d\\.\\d{2}\\.\\d$' release-manifest.txt",
    successFeedback: "Excellent. Exact shapes turn regex into a compact format checker."
  },
  {
    id: "alternation",
    order: 15,
    title: "Match This Or That",
    concept: "Alternation with |",
    explanation:
      "With grep -E, the | operator means either the pattern on the left or the pattern on the right can match.",
    example: {
      command: "grep 'api' service-events.log",
      explanation: "A literal search finds only api events. Alternation lets one command include a second choice."
    },
    practiceFileId: "service-events",
    prompt: "Find events mentioning api or web.",
    hints: [
      "The two service names are alternatives.",
      "Use -E so | means OR.",
      "Try: grep -E 'api|web' service-events.log"
    ],
    expected: {
      outputLines: [
        "api timeout after 30s",
        "web latency above threshold",
        "api retry succeeded"
      ],
      matches: [
        { lineNumber: 1, text: "api" },
        { lineNumber: 3, text: "web" },
        { lineNumber: 5, text: "api" }
      ]
    },
    canonicalCommand: "grep -E 'api|web' service-events.log",
    successFeedback: "Good. Alternation keeps related searches in one pattern."
  },
  {
    id: "groups",
    order: 16,
    title: "Group Alternatives",
    concept: "Groups",
    explanation:
      "Parentheses group part of a regex so a shared suffix can apply to every alternative inside the group.",
    example: {
      command: "grep -E 'api|web-\\d+' targets.txt",
      explanation: "Without grouping, api can match by itself while only web gets the dash-and-digits suffix."
    },
    practiceFileId: "targets",
    prompt: "Find api or web targets followed by a dash and one or more digits.",
    hints: [
      "Only the service name should vary.",
      "Put the alternatives inside parentheses before the shared suffix.",
      "Try: grep -E '(api|web)-\\d+' targets.txt"
    ],
    expected: {
      outputLines: ["api-12 healthy", "web-7 degraded", "api-42 failed"],
      matches: [
        { lineNumber: 1, text: "api-12" },
        { lineNumber: 2, text: "web-7" },
        { lineNumber: 5, text: "api-42" }
      ]
    },
    canonicalCommand: "grep -E '(api|web)-\\d+' targets.txt",
    successFeedback: "Nice. The group makes the shared suffix apply to both alternatives."
  },
  {
    id: "capstone-log-search",
    order: 17,
    title: "Save Numbered Findings",
    concept: "Capstone line-number search",
    explanation:
      "Finish by combining alternation, line numbers, and a light preview of saving output to findings.txt.",
    example: {
      command: "grep -n 'ERROR' incident.log",
      explanation:
        "-n prefixes each matching output line with its line number. The final lab also uses > findings.txt to simulate saving that output."
    },
    practiceFileId: "incident",
    prompt: "Find WARN or ERROR lines with line numbers, then save the simulated output to findings.txt.",
    hints: [
      "Use alternation for WARN or ERROR.",
      "Add -n to include line numbers.",
      "Try: grep -En 'WARN|ERROR' incident.log > findings.txt"
    ],
    expected: {
      outputLines: [
        "2:WARN web-7 latency above 900ms",
        "3:ERROR api-42 payment worker failed",
        "5:WARN db-2 replica lag rising"
      ],
      matches: [
        { lineNumber: 2, text: "WARN" },
        { lineNumber: 3, text: "ERROR" },
        { lineNumber: 5, text: "WARN" }
      ]
    },
    canonicalCommand: "grep -En 'WARN|ERROR' incident.log > findings.txt",
    successFeedback: "Capstone complete. You combined a practical search with saved-output syntax.",
    allowRedirect: true
  }
];

export function findLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}
