<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzDataGrid — AT test script

**Tier C · APG pattern `grid` · source `packages/core/src/components/data/DzDataGrid.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzDataGrid.md`](../DzDataGrid.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- Four employees, five columns: Name, Role, Department, Salary, Status. Name/Role/Department/Salary are sortable; multiple-row selection is on.
- Use your AT table-reading commands where the step says so (NVDA and JAWS: Ctrl+Alt+Arrows; VoiceOver: VO+Arrows once inside the table).

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

**Open:** [`core-data-dzdatagrid--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzdatagrid--accessibility&viewMode=story)

**Do:**

1. Tab until focus enters the grid.

**The AT must:**

- [ ] It is announced as a grid named "Accessible employee data grid".
- [ ] Its size is announced — the number of rows and columns.
- [ ] The grid is one tab stop.
- [ ] The cell that takes focus announces its column header and its value.

**Read from:** Grid — "the grid contains one tab stop"; and the ARIA requirement that a grid announces its dimensions.

### Step 2 — task `navigate`

**Open:** [`core-data-dzdatagrid--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzdatagrid--accessibility&viewMode=story)

**Do:**

1. ArrowRight across a row, then ArrowDown into the next row.
1. Ctrl+Home, then Ctrl+End.
1. Move onto the "Name" column header and press Enter, then Enter again.

**The AT must:**

- [ ] Each cell announces its column header and its value; the header is not repeated on every cell within the same column beyond what the AT normally does.
- [ ] Ctrl+Home announces the first cell and Ctrl+End the last.
- [ ] A sortable column header is announced as a column header AND as sortable, with its current sort state.
- [ ] Activating it announces the new sort state ("ascending", then "descending") and does not silently re-render.
- [ ] No cell is skipped.

**Read from:** Grid — Keyboard Interaction Right/Left/Down/Up, Ctrl+Home/Ctrl+End; and `aria-sort` on the sorted column header.

### Step 3 — task `select`

**Open:** [`core-data-dzdatagrid--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzdatagrid--accessibility&viewMode=story)

**Do:**

1. Move to a row and press Space (or activate that row selection control).
1. Select a second row.
1. Move to the header selection control, announced as "Select all rows".

**The AT must:**

- [ ] Each selected row is announced as selected as it is selected.
- [ ] With some but not all rows selected, "Select all rows" is announced as partially checked / mixed — not as unchecked.
- [ ] Selecting all and then clearing announces both transitions.

**Read from:** Grid — row selection; ARIA `aria-selected` on the row and the tri-state checkbox contract for a select-all control.

### Step 4 — task `live`

**Open:** [`core-data-dzdatagrid--loading`](http://127.0.0.1:6006/iframe.html?id=core-data-dzdatagrid--loading&viewMode=story)

**Do:**

1. Park focus on the browser address bar, then load the loading story.
1. Then load `core-data-dzdatagrid--empty` the same way.

**The AT must:**

- [ ] The busy state is announced once, without moving focus.
- [ ] The empty state text is announced politely, once.
- [ ] Neither state leaves a stale grid readable underneath the new state.

**Read from:** ARIA `aria-busy` and live regions; a grid that is loading must not present the previous page as current.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

None on the register for this component. Anything that fails here is new — file it.

