<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzTable — AT test script

**Tier C · APG pattern `table` · source `packages/core/src/components/data/DzTable.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzTable.md`](../DzTable.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- Three columns (Product, Price, Stock) and two rows. A static table is not a widget: the tester drives it with the AT own table-reading commands, not with Tab.
- NVDA and JAWS: Ctrl+Alt+Arrows. VoiceOver: VO+Arrows once inside the table. TalkBack and VoiceOver iOS: use the reading-control set to Table or Row where available, otherwise swipe.

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
`reach`, `navigate`, `non-drag`, `live`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-data-dztable--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dztable--accessibility&viewMode=story)

**Do:**

1. Use the AT next-table command (NVDA/JAWS: `t`; VoiceOver: rotor → Tables).

**The AT must:**

- [ ] It is announced as a table named "Accessible table with proper header scope".
- [ ] Its dimensions are announced — three columns, three rows including the header row.
- [ ] On `core-data-dztable--with-caption`, the caption is announced on entry.

**Read from:** Table — a `table` with an accessible name; the AT announces dimensions on entry.

### Step 2 — task `navigate`

**Open:** [`core-data-dztable--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dztable--accessibility&viewMode=story)

**Do:**

1. Move right across the header row, then down into the data rows, then right again.

**The AT must:**

- [ ] Each header cell is announced as a column header.
- [ ] Each data cell announces its column header together with its value — "Price, 9 dollars 99".
- [ ] Moving down a column does not lose the header association.
- [ ] On `core-data-dztable--with-spans`, a spanned cell is announced once, with the span stated, not repeated per covered column.

**Read from:** Table — `th` with `scope`, and the header/data-cell association the AT reads.

### Step 3 — task `non-drag`

**Open:** [`core-data-dztable--column-resizing`](http://127.0.0.1:6006/iframe.html?id=core-data-dztable--column-resizing&viewMode=story)

**Do:**

1. Tab to a column resize control.
1. Press ArrowLeft and ArrowRight.
1. Then try to resize the column with a single pointer WITHOUT dragging — a tap, or a tap-then-tap.

**The AT must:**

- [ ] The resize control is announced with the name "Resize column" and with the column it resizes.
- [ ] Arrow keys change the width, and each change is announced with the new value.
- [ ] There is a single-pointer path that does not require a held drag.

**Read from:** WCAG 2.5.7 Dragging Movements — a keyboard path is not sufficient on its own; the SC asks for a single-pointer alternative.

### Step 4 — task `live`

**Open:** [`core-data-dztable--loading`](http://127.0.0.1:6006/iframe.html?id=core-data-dztable--loading&viewMode=story)

**Do:**

1. Park focus outside the table, then load the loading story.
1. Then load `core-data-dztable--virtual-scroll` and scroll it while focus is elsewhere.

**The AT must:**

- [ ] The busy state is announced once, without moving focus.
- [ ] While loading, the previous page of values is NOT still readable as current — skeletons are hidden from the accessibility tree.
- [ ] Scrolling a virtualised table does not announce a page change and does not steal focus.

**Read from:** ARIA `aria-busy`; and the rule that content removed from view is removed from the accessibility tree.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

- **G5** — affects `non-drag`. Column resize is keyboard-operable but has NO single-pointer, non-drag alternative. WCAG 2.5.7 is not met for this operation and it is a recorded open owner decision, not a new finding. The non-drag step is expected to fail its third expectation on the touch pairs.

