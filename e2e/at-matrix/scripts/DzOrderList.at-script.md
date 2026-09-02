<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzOrderList — AT test script

**Tier C · APG pattern `listbox` · source `packages/core/src/components/data/DzOrderList.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzOrderList.md`](../DzOrderList.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- Five rows under the visible heading "Release checklist": Draft the proposal, Review with the team, Incorporate feedback, Send for approval, Publish.
- The drag handle is switched off in this story on purpose. Everything below is keyboard-driven.
- This component carries the WCAG 2.5.7 obligation: every reorder a pointer drag can do must be doable without one.

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

The scaffold says this component owes 6 task(s):
`reach`, `navigate`, `typeahead`, `select`, `non-drag`, `live`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-data-dzorderlist--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzorderlist--accessibility&viewMode=story)

**Do:**

1. Tab until focus enters the list.

**The AT must:**

- [ ] The list takes its accessible name from the visible heading "Release checklist".
- [ ] The list is one tab stop.
- [ ] The row that takes focus is announced with its label and its position — "Draft the proposal, 1 of 5".

**Read from:** Listbox — Keyboard Interaction: "the listbox contains one tab stop"; `aria-posinset`/`aria-setsize`.

### Step 2 — task `navigate`

**Open:** [`core-data-dzorderlist--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzorderlist--accessibility&viewMode=story)

**Do:**

1. ArrowDown twice, ArrowUp once, End, Home.

**The AT must:**

- [ ] Each row is announced with its label and its position in the set.
- [ ] End announces "Publish, 5 of 5" and Home announces the first row.
- [ ] Nothing is skipped.

**Read from:** Listbox — Keyboard Interaction Down/Up/Home/End.

### Step 3 — task `typeahead`

**Open:** [`core-data-dzorderlist--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzorderlist--accessibility&viewMode=story)

**Do:**

1. With the list focused, press `p`.

**The AT must:**

- [ ] Focus moves to "Publish" and it is announced.
- [ ] Pressing `p` again wraps to the next row starting with the same letter, or stays if there is only one.

**Read from:** Listbox — Keyboard Interaction: "type a character, focus moves to the next item with a name that starts with the typed character".

### Step 4 — task `select`

**Open:** [`core-data-dzorderlist--multi-select`](http://127.0.0.1:6006/iframe.html?id=core-data-dzorderlist--multi-select&viewMode=story)

**Do:**

1. ArrowDown to the second row, press Space, ArrowDown, press Space again.

**The AT must:**

- [ ] The list is announced as allowing more than one selection.
- [ ] Each row announces its selected state as it is toggled.
- [ ] Every row announces a selected state, including the unselected ones.

**Read from:** Listbox (multi-select) — `aria-multiselectable`; `aria-selected` on every option.

### Step 5 — task `non-drag`

**Open:** [`core-data-dzorderlist--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dzorderlist--accessibility&viewMode=story)

**Do:**

1. Back on the entry story: ArrowDown twice to reach "Incorporate feedback".
1. Space to grab it.
1. ArrowUp to move it one place.
1. Space to drop it.
1. Then grab another row and press Escape instead of Space.
1. Finally, on `core-data-dzorderlist--with-controls`, Tab to the reorder buttons and use them.

**The AT must:**

- [ ] Space announces that the row is grabbed AND its current position — "Grabbed item at position 3 of 5".
- [ ] Each ArrowUp/ArrowDown while grabbed announces the new position — "Item moved to position 2 of 5."
- [ ] Space announces the drop, and the committed order is what the announcements said it would be.
- [ ] Escape cancels the grab, announces the cancellation, and the order is unchanged.
- [ ] The control buttons are announced within a group named "Reorder controls", each with its own name: "Move up", "Move down", "Move to top", "Move to bottom".
- [ ] A control that cannot act on the current row (Move up on row 1) is announced as unavailable, not silently inert.

**Read from:** WCAG 2.5.7 Dragging Movements; and the ARIA grabbed/drop announcement contract for a keyboard reorder.

### Step 6 — task `live`

**Open:** [`core-data-dzorderlist--with-controls`](http://127.0.0.1:6006/iframe.html?id=core-data-dzorderlist--with-controls&viewMode=story)

**Do:**

1. Park focus on "Move up" and activate it twice.

**The AT must:**

- [ ] Each reorder is announced politely, exactly once.
- [ ] The announcement says what moved and where it landed.
- [ ] Focus stays on the control; the list is not re-read from the top.

**Read from:** ARIA live regions — a reorder is a status change, announced once, without a focus move.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

- **E6** — affects `reach`. At the committed commit the list bound `:ariaLabel` instead of `:aria-label`, so an `aria-label` given as a prop only reached the accessibility tree through modern ARIA reflection and was ABSENT from server-rendered markup. This story names the list with `aria-labelledby`, which was always bound correctly, so the reach step should pass; a story that names it with `aria-label` is where this surfaces. Check the commit you are running against before filing.

