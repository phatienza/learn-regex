# Full-Screen Workbench UI Design

## Summary

Enhance the existing regex learning app with a more alive, full-screen terminal workbench. The core product remains the same: learners study a short regex idea, run an example, then solve the lab with the sample file visible beside the terminal.

The UI change should make each lesson feel less like a long scrolling page and more like an interactive coding environment. The app should fill the viewport, keep the file viewer and terminal usable without page-level scrolling, and guide the learner from Learn mode into Lab mode.

## Goals

- Make the first-screen experience feel like a full-screen developer workbench.
- Show the Learn section first so the learner gets quick training before the lab.
- Hide the Lab until the learner runs the example command.
- After the example runs, automatically collapse Learn, reveal Lab, and focus the command input.
- Keep a clear way to reopen Learn without losing lab state.
- Add text-editor affordances to the sample file viewer so it feels like a read-only editor.
- Add subtle terminal life through cursor animation and panel transitions.

## Non-Goals

- Do not change lesson content or validation rules in this UI pass.
- Do not add accounts, backend persistence, real shell execution, or deployment changes.
- Do not turn the app into a marketing page.
- Do not introduce heavy decorative animation that distracts from learning.

## Layout

Use a full-screen app shell built around the browser viewport.

Desktop:

- The app shell uses `100dvh` and avoids document-level scrolling during normal lesson work.
- The top lesson header is compact and stays visible at the top of the workbench.
- The main area is a two-column grid:
  - Left: read-only editor-style sample file.
  - Right: terminal lesson panel.
- Each pane scrolls internally when its content is taller than the available area.

Mobile:

- The layout stacks into one column.
- The lesson header remains compact.
- The file viewer and terminal panel each get stable maximum heights so the learner can scroll within each area without content overlap.
- Buttons and inputs keep fixed, predictable dimensions.

## File Viewer

The sample file should feel more like a lightweight text editor than a plain file dump.

Add an editor header with:

- Filename tab.
- Relative path or lesson file context.
- Read-only indicator.
- Line count.

Keep the existing numbered gutter and match highlighting. The editor chrome must not reduce readability or require learners to use terminal commands to inspect the file.

## Terminal Lesson Flow

Each lesson starts in Learn mode:

- Learn is expanded.
- Lab content, command form, output, feedback, hints, and next action are hidden or visually inactive until the example runs.
- The example command remains visible and runnable.

When the learner clicks `Run example`:

- The example output appears.
- Learn automatically collapses after the example result is shown.
- Lab is revealed with a slide/fade transition.
- Keyboard focus moves to the grep command input.
- A compact `Show Learn` control appears so the learner can reopen the Learn section.

When the learner clicks `Show Learn`:

- Learn expands without clearing example output, typed command, lab output, hints, or progress.
- The control becomes `Hide Learn` or an equivalent compact toggle.

When the learner changes lessons, resets progress, or advances:

- The panel returns to Learn mode.
- Example output, command text, result feedback, and hint count reset according to existing lesson-change behavior.

## Terminal Feel

Add subtle interaction cues:

- A blinking cursor or caret treatment near the command prompt/input while the input is focused.
- Gentle transitions for Learn collapse and Lab reveal.
- Slight output appearance animation when example or lab output is produced.

Animations should be quick and functional. Use `prefers-reduced-motion` to disable or reduce transitions and cursor blinking for users who request less motion.

## State And Components

Extend the existing `TerminalPanel` flow instead of replacing it.

Use this UI state:

- `hasRunExample`: derive from whether `exampleResult` exists for the current lesson.
- `isLearnOpen`: local panel state that controls whether Learn is expanded after the example has been run.

The parent `App` already owns command, result, example result, progress, and lesson-change resets. Keep that boundary. `TerminalPanel` should manage only local display state and input focus:

- Reset `isLearnOpen` when the lesson id changes.
- Collapse Learn after `exampleResult` appears.
- Focus the command input with a `ref` after `Run example`.

## Accessibility

- The Learn toggle must be a real button with clear accessible text.
- The Lab reveal should not trap focus.
- After `Run example`, focus should move to the command input intentionally.
- Example and lab output should keep `aria-live="polite"`.
- Motion should respect `prefers-reduced-motion`.
- Hidden Lab content should not create confusing tab stops before it is available.

## Testing

Add focused coverage for:

- Initial lesson state shows Learn and hides Lab controls.
- Running the example reveals Lab, collapses Learn, preserves example output, and focuses the command input.
- The Learn toggle can reopen the lesson explanation after the example.
- Changing lessons resets the guided flow to Learn mode.
- Existing first-lesson completion flow still works after the UI state changes.

Continue to run the full unit test suite and production build before completion. Use browser validation for desktop and mobile viewports because this is a layout and interaction change.

## Acceptance Criteria

- The workbench fills the viewport on desktop without the whole document feeling like a long scroll page.
- The file viewer and terminal panel are independently scrollable when needed.
- The sample file has editor-like chrome with filename, path/context, read-only status, and line count.
- Learn is visible first and Lab is hidden until the example runs.
- Running the example automatically transitions the learner into Lab mode and focuses the command input.
- The learner can reopen Learn at any time after the example runs.
- Cursor animation and transitions make the page feel alive without making it noisy.
- Desktop and mobile layouts remain readable with no overlapping text or controls.
