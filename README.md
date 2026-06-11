# Learn Grep Regex

A regex-first learning app where `grep` is the practice vehicle. The first version is built for developers who are comfortable in a terminal but new to regular expressions.

The app behaves like a small terminal workbench: a read-only sample file stays visible while learners type supported `grep` commands, compare output, reveal hints, and move through a beginner lesson path.

## Features

- 12 beginner regex lessons.
- Practical sample files based on logs, config files, CSV rows, routes, versions, and incident reports.
- Safe simulated `grep` parser instead of real shell execution.
- Output-based validation, so equivalent commands can pass when they produce the expected result.
- Match highlighting in the sample file and terminal output.
- Group highlighting for grouped regex matches.
- Local browser progress with `localStorage`.
- Responsive layout: split file/terminal workbench on desktop, stacked panels on mobile.

## Curriculum

1. Literal matches.
2. Case sensitivity with `-i`.
3. Start anchor `^`.
4. End anchor `$`.
5. Any character `.`.
6. Character sets and ranges.
7. POSIX classes such as `[[:digit:]]`, `[[:alpha:]]`, and `[[:space:]]`.
8. Repetition with `+`, `*`, `?`, and `{2,4}` using `grep -E`.
9. Exact shapes such as IDs, dates, and versions.
10. Alternation with `|`.
11. Groups such as `(api|web)-[[:digit:]]+`.
12. Capstone log search with a preview of `> findings.txt`.

## Supported Grep Subset

The app simulates a focused beginner-friendly subset:

- Commands must start with `grep`.
- Supported flags: `-E`, `-i`, `-n`, and `-o`.
- Quoted patterns are supported.
- A sample filename argument is required.
- `> findings.txt` is supported only in the capstone lesson.

The browser never runs a real shell command.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run tests once:

```bash
npm run test:run
```

Run the production build:

```bash
npm run build
```

## Project Structure

```text
src/
  components/       React UI for the workbench
  content/          Beginner lessons and sample files
  domain/           Grep parser, execution engine, and shared types
  storage/          localStorage progress helpers
  test/             Vitest setup
```

## Current Scope

V1 is the beginner path only. It intentionally does not include accounts, email save, backend persistence, placement evaluation, real shell execution, or intermediate/advanced tracks.
