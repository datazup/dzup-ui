<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts`. -->

# AT test scripts — Tier C/D

Executable scripts for the 22 Tier C/D components, one per file.
They are the "how" for the obligations in `e2e/at-matrix/{Component}.md`, which
stays the only place a result is ever written.

**Nothing in this directory records a result.** Results are append-only rows in
the scaffold file, and only a human writes them.

## Running Storybook

```bash
yarn storybook              # http://127.0.0.1:6006
```

Every step links to `/iframe.html?id=…`, which is the story canvas without the
Storybook chrome — so the AT reads the component and not the sidebar. If you
prefer the full Storybook UI, drop `iframe.html` from the URL and open the
story from the sidebar instead; the story ids are the same.

If you are running the built static preview instead of the dev server, the port
is **6106**, not 6006.

## The AT commands the steps assume

| Instruction in a step | NVDA | JAWS | VoiceOver (macOS) | VoiceOver (iOS) | TalkBack |
|---|---|---|---|---|---|
| "Tab to X" | Tab | Tab | Tab | swipe right until X | swipe right until X |
| "Activate" | Enter / Space | Enter / Space | VO+Space | double-tap | double-tap |
| Arrow keys inside a widget | Arrows in focus mode | Arrows in forms mode | VO+Arrows | swipe / rotor | swipe / explore |
| Toggle browse vs focus mode | NVDA+Space | Insert+Z | n/a | n/a | n/a |
| Next link | `k` | `k` | rotor → Links | rotor → Links | reading control → Links |
| Next table | `t` | `t` | rotor → Tables | rotor → Tables | reading control → Controls |
| Next landmark | `d` | `r` | rotor → Landmarks | rotor → Landmarks | reading control → Headings |
| Move between table cells | Ctrl+Alt+Arrows | Ctrl+Alt+Arrows | VO+Arrows | swipe | swipe |

Turn on your AT's speech log before you start (NVDA: Speech Viewer; JAWS:
speech history, Insert+Space then H; VoiceOver: the caption panel). A step that
asks whether something was announced **once** cannot be answered from memory.

## How to record

One row per `{component, pair}` in `e2e/at-matrix/{Component}.md`, below the
append-only marker:

```text
| <pair> | <result> | <AT + browser versions> | <your name> | <YYYY-MM-DD> | <git HEAD> | <notes> |
```

- `result` is one of `unrun`, `pass`, `fail`, `partial`, `blocked`.
  `pass` means **every** step passed. If one step failed, the row is `partial`
  (or `fail`), and the notes say which step.
- `versions` must be real version numbers — "NVDA 2026.1, Firefox 151.0", not
  "NVDA, Firefox". `validate:at-matrix` rejects a non-`unrun` row with a dash
  in it, because a result with nothing behind it is worse than `unrun`.
- `sourceCommit` is the repository HEAD you observed: `git rev-parse HEAD`.
  Record it **before** you start, and record whether the worktree was clean
  (`git status --short`) in the notes. A run from a dirty worktree is still a
  run; it is just not release evidence.
- **Never edit a row that is already there.** Append. The history is what tells
  a new regression from a known one.

## When a step fails

1. Finish the rest of the steps. A failed step is not a reason to abandon the
   pair — the remaining steps are still evidence.
2. Read the script's "Known open defects" section at the bottom. If it explains
   the failure, reference the defect id in the notes and stop there.
3. If it does not, **file a defect**. A failed step creates a defect entry;
   never a silent re-run, and never a second attempt recorded as the first.
   Record what you heard, verbatim, and what the step said you should have.

## The scripts

| Component | Tier | Pattern | Steps | Cells (steps x 6 pairs) |
|---|---|---|---|---|
| [`DzCalendar`](./DzCalendar.at-script.md) | C | `grid` | 4 | 24 |
| [`DzCascader`](./DzCascader.at-script.md) | C | `combobox` | 8 | 48 |
| [`DzColorPicker`](./DzColorPicker.at-script.md) | C | `custom` | 2 | 12 |
| [`DzCombobox`](./DzCombobox.at-script.md) | C | `combobox` | 8 | 48 |
| [`DzCommandPalette`](./DzCommandPalette.at-script.md) | C | `combobox` | 8 | 48 |
| [`DzDataGrid`](./DzDataGrid.at-script.md) | C | `grid` | 4 | 24 |
| [`DzDataView`](./DzDataView.at-script.md) | C | `custom` | 3 | 18 |
| [`DzDatePicker`](./DzDatePicker.at-script.md) | C | `combobox` | 7 | 42 |
| [`DzDateRangePicker`](./DzDateRangePicker.at-script.md) | C | `combobox` | 7 | 42 |
| [`DzFileUpload`](./DzFileUpload.at-script.md) | D | `button` | 4 | 24 |
| [`DzMegaMenu`](./DzMegaMenu.at-script.md) | C | `menubar` | 6 | 36 |
| [`DzMention`](./DzMention.at-script.md) | C | `combobox` | 8 | 48 |
| [`DzMultiSelect`](./DzMultiSelect.at-script.md) | C | `combobox` | 8 | 48 |
| [`DzOrderList`](./DzOrderList.at-script.md) | C | `listbox` | 6 | 36 |
| [`DzPersonaSelector`](./DzPersonaSelector.at-script.md) | C | `listbox` | 5 | 30 |
| [`DzSidebar`](./DzSidebar.at-script.md) | C | `treeview` | 5 | 30 |
| [`DzTable`](./DzTable.at-script.md) | C | `table` | 4 | 24 |
| [`DzTimePicker`](./DzTimePicker.at-script.md) | C | `combobox` | 7 | 42 |
| [`DzTour`](./DzTour.at-script.md) | C | `dialog` | 4 | 24 |
| [`DzTransfer`](./DzTransfer.at-script.md) | C | `listbox` | 5 | 30 |
| [`DzTree`](./DzTree.at-script.md) | C | `treeview` | 5 | 30 |
| [`DzTreeSelect`](./DzTreeSelect.at-script.md) | C | `combobox` | 8 | 48 |

**22 components · 126 steps · 756 step-runs
across all six pairs.** The matrix itself counts a coarser cell — one per
`{component, pair}` — so these 22 components are
**132 of the scaffold's 534 cells**.
