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
- Make the command entry feel like a real terminal prompt instead of a regular text input.
- Add a compact Terminal Buddy mascot that owns the hint experience.
- Add subtle terminal life through cursor animation, transcript behavior, and panel transitions.

## Non-Goals

- Do not change lesson content or validation rules in this UI pass.
- Do not add accounts, backend persistence, real shell execution, or deployment changes.
- Do not turn the app into a marketing page.
- Do not introduce heavy decorative animation that distracts from learning.
- Do not make the mascot the primary learning surface. It supports hints; the lesson and lab remain the main experience.

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

## Terminal Buddy Mascot

Add a compact mascot named Terminal Buddy to make hints feel more alive.

Visual direction:

- Terminal Buddy should feel native to the command-line aesthetic: small, blocky, cursor-inspired, and made for a dark terminal UI.
- Use a transparent PNG or WebP bitmap asset generated for this project. Do not use ASCII art, emoji, CSS art, handcrafted inline SVG, or placeholder boxes for the final mascot.
- Use Terminal Buddy as the site favicon so the learning app has a recognizable browser-tab identity.
- Create separate bitmap sprites for `idle`, `hint`, `fail`, `success`, and `complete` states. The sprites should clearly feel like the same character with small expression/accent changes, not unrelated icons.
- Keep the mascot small enough that it never competes with the file viewer, command entry, output, or lesson content.

Behavior:

- Replace the plain `Show hint` button with a Terminal Buddy hint control.
- Before any hint is shown, Terminal Buddy sits near the terminal actions with a concise affordance such as `Ask Buddy`.
- Clicking the mascot or its hint control reveals the next available hint.
- Hints appear in a compact terminal-style speech bubble connected to the mascot.
- Repeated clicks reveal the existing progressive hints one at a time.
- When all hints are shown, the hint control becomes disabled or changes to a quiet `No more hints` state.
- On failed attempts, Terminal Buddy visually shifts into a helpful state and invites the learner to ask for a hint.
- On successful attempts, Terminal Buddy shows a subtle success state without blocking the `Next lesson` action.
- When the beginner path is completed, Terminal Buddy uses a distinct complete/achievement sprite and short celebratory status copy.

State boundaries:

- Keep using the existing lesson `hints` array and `hintCount`.
- Do not add new hint content in this UI pass.
- Do not persist mascot state separately from existing lesson progress.
- Reset visible mascot hint state when changing lessons, advancing, or resetting progress.
- Derive mascot display state from existing UI state: completed path wins over success, then failure, then open hints, then idle.

## Terminal Feel

Add subtle interaction cues:

- A blinking cursor or caret treatment inside the command prompt while the input is focused.
- Gentle transitions for Learn collapse and Lab reveal.
- Slight output appearance animation when example or lab output is produced.
- Small Terminal Buddy idle, hint, failure, success, and completion states that are subtle and quick.
- Terminal Buddy should have an idle animation, such as a soft bob, screen glow, or blink. It should feel alive without becoming distracting.

Animations should be quick and functional. Use `prefers-reduced-motion` to disable or reduce transitions and cursor blinking for users who request less motion.

## Command Entry

The command entry must feel like a shell prompt, not a form input.

Use this direction:

- Render the command row as a terminal line inside the terminal surface.
- Show a stable `$` prompt at the start of the line.
- Style the actual input as inline terminal text: no rounded rectangle, no separate input box background, and no default input border.
- Use a focused terminal-line state instead of a standard input focus ring around the text field.
- Add a block or bar cursor treatment that blinks while the command input is focused.
- Let pressing Enter submit the command, with the button kept as a compact runnable affordance rather than the main visual object.
- After a command runs, echo the submitted command in the output transcript above the result so the panel reads like terminal history.

The native input should remain accessible and keyboard-friendly, but visually it should disappear into the prompt line.

## State And Components

Extend the existing `TerminalPanel` flow instead of replacing it.

Use this UI state:

- `hasRunExample`: derive from whether `exampleResult` exists for the current lesson.
- `isLearnOpen`: local panel state that controls whether Learn is expanded after the example has been run.
- `hintCount`: remains parent-owned existing state.

The parent `App` already owns command, result, example result, progress, and lesson-change resets. Keep that boundary. `TerminalPanel` should manage only local display state and input focus:

- Reset `isLearnOpen` when the lesson id changes.
- Collapse Learn after `exampleResult` appears.
- Focus the command input with a `ref` after `Run example`.
- Store the last submitted lab command so the terminal transcript can echo it.
- Introduce a focused mascot/hint component if it keeps `TerminalPanel` from growing too large.

## Accessibility

- The Learn toggle must be a real button with clear accessible text.
- The Terminal Buddy hint control must be a real button with accessible text that names the action.
- The mascot image needs useful alt text or should be hidden from assistive tech if the adjacent button text already names it.
- The Lab reveal should not trap focus.
- After `Run example`, focus should move to the command input intentionally.
- Example and lab output should keep `aria-live="polite"`.
- Newly revealed hints should be announced politely.
- Motion should respect `prefers-reduced-motion`.
- Hidden Lab content should not create confusing tab stops before it is available.

## Testing

Add focused coverage for:

- Initial lesson state shows Learn and hides Lab controls.
- Running the example reveals Lab, collapses Learn, preserves example output, and focuses the command input.
- The Learn toggle can reopen the lesson explanation after the example.
- Changing lessons resets the guided flow to Learn mode.
- Existing first-lesson completion flow still works after the UI state changes.
- The command area visually reads as a terminal prompt rather than a standalone text field.
- Submitted commands echo in the terminal output transcript.
- Terminal Buddy reveals progressive hints using the existing hint order.
- Terminal Buddy reaches a disabled or complete state when all hints are visible.
- Failed and successful attempts can update Terminal Buddy state without blocking command entry or lesson advancement.

Continue to run the full unit test suite and production build before completion. Use browser validation for desktop and mobile viewports because this is a layout and interaction change.

## Acceptance Criteria

- The workbench fills the viewport on desktop without the whole document feeling like a long scroll page.
- The file viewer and terminal panel are independently scrollable when needed.
- The sample file has editor-like chrome with filename, path/context, read-only status, and line count.
- Learn is visible first and Lab is hidden until the example runs.
- Running the example automatically transitions the learner into Lab mode and focuses the command input.
- The learner can reopen Learn at any time after the example runs.
- The command entry looks and behaves like an inline terminal prompt, not a boxed text input.
- The output area includes the submitted command and result as a terminal-like transcript.
- Terminal Buddy replaces the plain hint button and shows hints in a compact terminal-style bubble.
- Terminal Buddy supports idle, hint, failed-attempt, and success states without distracting from the lab.
- Cursor animation and transitions make the page feel alive without making it noisy.
- Desktop and mobile layouts remain readable with no overlapping text or controls.
