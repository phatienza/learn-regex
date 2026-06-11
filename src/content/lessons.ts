import type { Lesson } from "../domain/types";

export const lessons: Lesson[] = [
  {
    id: "literal-matches",
    order: 1,
    title: "Find Exact Text",
    concept: "Literal matches",
    explanation:
      "A literal match searches for the exact characters you type. Start by finding a single word in the log.",
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
    practiceFileId: "routes",
    prompt: "Find routes whose line starts with GET.",
    hints: [
      "You only want GET when it is the first text on the line.",
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
    practiceFileId: "feature-flags",
    prompt: "Find feature flags that end with =true.",
    hints: [
      "Several lines contain equals signs, but only some end with true.",
      "Put $ after the final literal text.",
      "Try: grep '=true$' feature-flags.env"
    ],
    expected: {
      outputLines: ["SEARCH_ENABLED=true", "CACHE_WARMUP=true"],
      matches: [
        { lineNumber: 1, text: "=true" },
        { lineNumber: 3, text: "=true" }
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
    id: "character-sets",
    order: 6,
    title: "Choose From A Set",
    concept: "Character sets and ranges",
    explanation:
      "Square brackets match one character from a set or range, such as [A-C].",
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
    id: "posix-classes",
    order: 7,
    title: "Use Portable Classes",
    concept: "POSIX digit, letter, and space classes",
    explanation:
      "POSIX classes like [[:alpha:]], [[:digit:]], and [[:space:]] work in macOS and Linux grep.",
    practiceFileId: "tasks",
    prompt: "Find task lines that start with one letter, one digit, then a space.",
    hints: [
      "The shape is letter, digit, space.",
      "Use POSIX classes inside square brackets.",
      "Try: grep '^[[:alpha:]][[:digit:]][[:space:]]' tasks.txt"
    ],
    expected: {
      outputLines: ["A1 deploy dashboard", "B2 rotate logs", "C3 reboot cache"],
      matches: [
        { lineNumber: 1, text: "A1 " },
        { lineNumber: 2, text: "B2 " },
        { lineNumber: 4, text: "C3 " }
      ]
    },
    canonicalCommand: "grep '^[[:alpha:]][[:digit:]][[:space:]]' tasks.txt",
    successFeedback: "Good. POSIX classes are portable building blocks for common character types."
  },
  {
    id: "repetition",
    order: 8,
    title: "Repeat A Pattern",
    concept: "Repetition with grep -E",
    explanation:
      "Extended grep unlocks modern repetition forms such as +, ?, and {2,4}.",
    practiceFileId: "alerts",
    prompt: "Find ERR alert lines with an optional dash and two to four digits.",
    hints: [
      "Use -E for the repetition operators in this lesson.",
      "The dash is optional and the digit count is limited.",
      "Try: grep -E '^ERR-?[[:digit:]]{2,4}[[:space:]]' alerts.log"
    ],
    expected: {
      outputLines: ["ERR-12 api timeout", "ERR1234 web latency"],
      matches: [
        { lineNumber: 1, text: "ERR-12 " },
        { lineNumber: 2, text: "ERR1234 " }
      ]
    },
    canonicalCommand: "grep -E '^ERR-?[[:digit:]]{2,4}[[:space:]]' alerts.log",
    successFeedback: "Sharp. Repetition lets a pattern describe a range of valid lengths."
  },
  {
    id: "exact-shapes",
    order: 9,
    title: "Describe Exact Shapes",
    concept: "Exact shapes",
    explanation:
      "Combine anchors, classes, escaped dots, and repetition to describe IDs, dates, and versions.",
    practiceFileId: "release-manifest",
    prompt: "Find release rows shaped like REL-YYYY-MM-DD vN.NN.N.",
    hints: [
      "The date needs four digits, dash, two digits, dash, two digits.",
      "Escape dots when they should be literal version separators.",
      "Try: grep -E '^REL-[[:digit:]]{4}-[[:digit:]]{2}-[[:digit:]]{2} v[[:digit:]]\\.[[:digit:]]{2}\\.[[:digit:]]$' release-manifest.txt"
    ],
    expected: {
      outputLines: ["REL-2026-06-10 v1.24.0", "REL-2026-06-11 v2.03.4"],
      matches: [
        { lineNumber: 1, text: "REL-2026-06-10 v1.24.0" },
        { lineNumber: 3, text: "REL-2026-06-11 v2.03.4" }
      ]
    },
    canonicalCommand:
      "grep -E '^REL-[[:digit:]]{4}-[[:digit:]]{2}-[[:digit:]]{2} v[[:digit:]]\\.[[:digit:]]{2}\\.[[:digit:]]$' release-manifest.txt",
    successFeedback: "Excellent. Exact shapes turn regex into a compact format checker."
  },
  {
    id: "alternation",
    order: 10,
    title: "Match This Or That",
    concept: "Alternation with |",
    explanation:
      "With grep -E, the | operator means either the pattern on the left or the pattern on the right can match.",
    practiceFileId: "service-events",
    prompt: "Find events mentioning api or web.",
    hints: [
      "The two service names are alternatives.",
      "Use -E so | means OR.",
      "Try: grep -E 'api|web' service-events.log"
    ],
    expected: {
      outputLines: ["api timeout after 30s", "web latency above threshold"],
      matches: [
        { lineNumber: 1, text: "api" },
        { lineNumber: 3, text: "web" }
      ]
    },
    canonicalCommand: "grep -E 'api|web' service-events.log",
    successFeedback: "Good. Alternation keeps related searches in one pattern."
  },
  {
    id: "groups",
    order: 11,
    title: "Group Alternatives",
    concept: "Groups",
    explanation:
      "Parentheses group part of a regex. Here the service name varies, while the dash and digits stay shared.",
    practiceFileId: "targets",
    prompt: "Find api or web targets followed by a dash and one or more digits.",
    hints: [
      "Only the service name should vary.",
      "Put the alternatives inside parentheses before the shared suffix.",
      "Try: grep -E '(api|web)-[[:digit:]]+' targets.txt"
    ],
    expected: {
      outputLines: ["api-12 healthy", "web-7 degraded", "api-42 failed"],
      matches: [
        { lineNumber: 1, text: "api-12" },
        { lineNumber: 2, text: "web-7" },
        { lineNumber: 4, text: "api-42" }
      ]
    },
    canonicalCommand: "grep -E '(api|web)-[[:digit:]]+' targets.txt",
    successFeedback: "Nice. The grouped service name is highlighted separately from the full match."
  },
  {
    id: "capstone-log-search",
    order: 12,
    title: "Capstone Log Search",
    concept: "Capstone log search",
    explanation:
      "Finish by combining alternation, line numbers, and a light preview of saving output to findings.txt.",
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
