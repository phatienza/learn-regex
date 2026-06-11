# Regex Shorthand And Learn-Lab Lesson Flow Design

## Summary

Update the beginner path so learners receive a short interactive teaching moment before each graded hands-on lab. Replace beginner-facing POSIX class notation with modern backslash shorthand notation: `\d`, `\s`, `\D`, and `\S`. Add an escape-character lesson that teaches how to search for regex special characters literally, starting with `\.`.

## Product Goals

- Reduce the feeling of being dropped directly into a challenge.
- Keep the terminal workbench feel while adding a small, useful teaching step.
- Teach cumulative regex concepts where each lab can reuse earlier lessons.
- Use modern shorthand regex notation in beginner lessons.
- Be honest that the app simulates a beginner-friendly grep subset rather than executing the user's real shell.

## Lesson Flow

Each lesson has two parts:

1. Learn
   - Shows a short explanation of the new concept.
   - Shows a concrete example command.
   - Lets the learner run the example against the visible sample file.
   - Displays highlighted example output with the same engine used by labs.
   - The example is instructional and is not graded as the lesson answer.

2. Lab
   - Shows the hands-on goal.
   - Learner types a grep-style command.
   - Output-based validation decides pass or fail.
   - Successful labs unlock the next lesson and persist progress.

The lab should require the current concept and, where natural, integrate earlier concepts. For example, exact-shape labs should combine anchors, `\d`, escaped literal dots, and repetition.

## Curriculum

The beginner path becomes 13 lessons:

1. Literal matches.
2. Case sensitivity with `-i`.
3. Start anchor `^`.
4. End anchor `$`.
5. Any character `.`.
6. Escape special characters with `\.`.
7. Character sets and ranges.
8. Shorthand classes with `\d`, `\s`, `\D`, and `\S`.
9. Repetition with `+`, `*`, `?`, and `{2,4}` using `grep -E`.
10. Exact shapes such as IDs, dates, and versions.
11. Alternation with `|`.
12. Groups such as `(api|web)-\d+`.
13. Capstone log search with a light preview of `> findings.txt`.

## Data Model

Add an example field to each lesson:

```ts
example: {
  command: string;
  explanation: string;
}
```

The existing lab fields remain: `prompt`, `hints`, `expected`, `canonicalCommand`, and `successFeedback`.

## Regex Engine

The simulated engine should support these beginner shorthand forms:

- `\d` for one digit.
- `\D` for one non-digit.
- `\s` for one whitespace character.
- `\S` for one non-whitespace character.
- Escaped literals already understood by JavaScript regular expressions, especially `\.` for a literal dot.

Beginner content should no longer use `[[:digit:]]`, `[[:alpha:]]`, or `[[:space:]]`. The parser still accepts safe grep commands with the existing flags and redirection rule. The app still does not execute real shell commands.

## UI

Add a compact Learn section above the Lab goal in the terminal panel. It should include:

- A short label such as `Learn`.
- The example explanation.
- The example command in terminal style.
- A small button to run the example.
- Example output with match and group highlighting.

The existing Lab command input, output, feedback, hints, and next-lesson controls remain below the Learn section. The desktop split layout and mobile stacked layout stay the same.

## Documentation

Update README and project notes where they describe the curriculum or grep policy so they reflect:

- 13 beginner lessons.
- Backslash shorthand notation as the beginner default.
- POSIX classes are no longer part of V1 beginner content.
- The app simulates a focused modern regex subset through grep-style commands.

## Testing

Coverage should include:

- Engine support for `\d`, `\D`, `\s`, `\S`, and escaped literal dots.
- Lesson integrity for 13 ordered lessons.
- Every example command produces output.
- Every canonical lab command passes output-based validation.
- UI flow renders the Learn section, runs an example, completes a lab, advances, and persists progress.
- Build check after implementation.

## Acceptance Criteria

- Learners see a Learn section before the hands-on Lab in every lesson.
- The beginner path has 13 lessons in the approved order.
- Lesson content uses `\d`, `\s`, `\D`, and `\S` instead of POSIX classes.
- The escape-character lesson teaches `\.` before exact-shape lessons rely on escaped dots.
- Cumulative labs use previous concepts where practical.
- Existing progress, highlighting, hints, and responsive layout continue to work.
