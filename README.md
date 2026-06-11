# Learn Grep Regex

A regex-first learning app where `grep` is the practice vehicle. The first version is built for developers who are comfortable in a terminal but new to regular expressions.

The app behaves like a small terminal workbench: a read-only sample file stays visible while learners type supported `grep` commands, compare output, reveal hints, and move through a beginner lesson path.

## Features

- 17 beginner regex lessons.
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
6. Escaping special characters with `\.`
7. Character sets and ranges.
8. Shorthand classes such as `\d`, `\s`, `\D`, and `\S`.
9. One or more with `+` using `grep -E`.
10. Zero or more with `*` using `grep -E`.
11. Optional pieces with `?` using `grep -E`.
12. Counted repetition with `{2,4}` using `grep -E`.
13. Combined repetition.
14. Exact shapes such as IDs, dates, and versions.
15. Alternation with `|`.
16. Groups such as `(api|web)-\d+`.
17. Capstone line-number search with `-n` and a preview of `> findings.txt`.

## Supported Grep Subset

The app simulates a focused beginner-friendly modern regex subset:

- Commands must start with `grep`.
- Supported flags: `-E`, `-i`, `-n`, and `-o`.
- Supported shorthand classes: `\d`, `\s`, `\D`, and `\S`.
- Escaped special characters such as `\.` can be used for literal matching.
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
