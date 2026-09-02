<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzCalendar — AT test script

**Tier C · APG pattern `grid` · source `packages/core/src/components/data/DzCalendar.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzCalendar.md`](../DzCalendar.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- The calendar opens on June 2026 with 15 June 2026 already selected.
- A line under the grid reads `Selected: 2026-06-15`. Use it to confirm what the model holds; do not use it as the announcement.
- Do not touch the pointer for any step except where a step says so.

## Pairs this component owes

Drive the whole script once per pair. A pair you did not run is `unrun`, which
is a fact; it is never `fail`.

| id | Pairing | What it exposes |
|---|---|---|
| `nvda-firefox` | NVDA + Firefox (Windows) | Browse/forms mode switching and the Gecko accessibility tree. |
| `nvda-chrome` | NVDA + Chrome (Windows) | The same AT over Blink, where virtualized and composite widgets differ. |
| `jaws-chrome` | JAWS + Chrome (Windows) | JAWS heuristics over ARIA, which override author intent more often. |
| `voiceover-safari` | VoiceOver + Safari (macOS) | WebKit behaviour and rotor navigation. |
| `voiceover-ios` | VoiceOver + Safari (iOS) | Touch exploration; a control reached by gesture, not by Tab. |
| `talkback-android` | TalkBack + Chrome (Android) | Touch exploration, gestures and drag alternatives. |

## Steps

The scaffold says this component owes 4 task(s):
`reach`, `navigate`, `select`, `live`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-data-dzcalendar--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzcalendar--accessibility&viewMode=story)

**Do:**

1. Tab from the browser address bar until focus enters the calendar.

**The AT must:**

- [ ] The container is announced as a grid whose name is "Keyboard navigable calendar".
- [ ] The grid is one tab stop: Tab reaches it once, and one more Tab leaves it entirely.
- [ ] The cell that takes focus announces its date, the weekday column it sits under, and that it is selected.

**Read from:** Grid — Keyboard Interaction: "the grid contains one tab stop"; and Data Grid, cell announcement with row/column context.

### Step 2 — task `navigate`

**Open:** [`core-data-dzcalendar--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzcalendar--accessibility&viewMode=story)

**Do:**

1. ArrowRight (expect 16 June 2026).
1. ArrowDown (expect 23 June 2026).
1. Home (expect the first day of that week, 21 June 2026).
1. PageDown (expect the same day one month on, 21 July 2026).

**The AT must:**

- [ ] Every move announces the new date. No move is silent.
- [ ] Moving into a different column announces the new weekday header at least once.
- [ ] PageDown announces the new month, not only the new day number.
- [ ] The grid never announces a cell the caret is not on, and never skips a cell.

**Read from:** Grid — Keyboard Interaction: Right/Left/Down/Up, Home/End, PageUp/PageDown.

### Step 3 — task `select`

**Open:** [`core-data-dzcalendar--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzcalendar--accessibility&viewMode=story)

**Do:**

1. With 21 July 2026 focused, press ArrowUp four times to return to 23 June 2026, then Enter.

**The AT must:**

- [ ] The focused day is announced as selected the moment Enter commits.
- [ ] Re-reading the previously selected day (15 June 2026) announces it as NOT selected — exactly one day is selected.
- [ ] The `Selected:` line reads `2026-06-23`.

**Read from:** Grid — Keyboard Interaction (Enter activates the focused cell) and ARIA `aria-selected` on the selected gridcell.

### Step 4 — task `live`

**Open:** [`core-data-dzcalendar--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzcalendar--accessibility&viewMode=story)

**Do:**

1. Shift+Tab out of the grid onto the month header controls.
1. Activate `Next month`.

**The AT must:**

- [ ] The new month is announced without focus leaving the `Next month` control.
- [ ] It is announced exactly once — not once by the caption and again by the grid.
- [ ] The grid is not re-announced from the top, and the caret is not moved into it.

**Read from:** Date Picker Dialog — the month/year caption is a live region because the grid changes under a control that sits outside it.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

None on the register for this component. Anything that fails here is new — file it.

