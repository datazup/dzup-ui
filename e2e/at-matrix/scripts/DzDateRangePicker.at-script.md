<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzDateRangePicker — AT test script

**Tier C · APG pattern `combobox` · source `packages/core/src/components/forms/DzDateRangePicker.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzDateRangePicker.md`](../DzDateRangePicker.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- A range field named "Booking date range". A range has TWO values, and the extra obligation over DzDatePicker is that the AT must say which of the two the tester is choosing at any moment.

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

The scaffold says this component owes 7 task(s):
`reach`, `open`, `navigate`, `typeahead`, `select`, `dismiss`, `error`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-forms-dzdaterangepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdaterangepicker--accessibility&viewMode=story)

**Do:**

1. Tab until focus lands on the field.

**The AT must:**

- [ ] It is announced as a combobox named "Booking date range", collapsed.
- [ ] Its current value is announced as a range — both ends, or the placeholder when empty.

**Read from:** Date Picker Combobox; and the ARIA rule that a composite value is announced in full.

### Step 2 — task `open`

**Open:** [`core-forms-dzdaterangepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdaterangepicker--accessibility&viewMode=story)

**Do:**

1. Enter.

**The AT must:**

- [ ] The field is announced as expanded and the calendar is announced.
- [ ] The AT states which end of the range is being chosen first.

**Read from:** Date Picker Dialog — the dialog announces its purpose on entry.

### Step 3 — task `navigate`

**Open:** [`core-forms-dzdaterangepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdaterangepicker--accessibility&viewMode=story)

**Do:**

1. ArrowRight, ArrowDown, PageDown.

**The AT must:**

- [ ] Each move announces the new date.
- [ ] After a start date is chosen, days before it are announced as unavailable.
- [ ] Days inside the provisional range are announced as in-range, not merely highlighted.

**Read from:** Date Picker Dialog — Keyboard Interaction; `aria-disabled` and range state exposed programmatically, not by colour.

### Step 4 — task `typeahead`

**Open:** [`core-forms-dzdaterangepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdaterangepicker--accessibility&viewMode=story)

**Do:**

1. Escape back to the field and type a range in the format the field advertises.

**The AT must:**

- [ ] The typed characters are echoed.
- [ ] The value the field holds afterwards matches what was typed.

**Read from:** Combobox — printable characters are accepted by the text field.

### Step 5 — task `select`

**Open:** [`core-forms-dzdaterangepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdaterangepicker--accessibility&viewMode=story)

**Do:**

1. Open the calendar, Enter on a start date, move forward three days, Enter again.

**The AT must:**

- [ ] After the first Enter the AT states that a start date is selected and that an end date is expected.
- [ ] After the second Enter the whole range is announced.
- [ ] The calendar closes and the field is announced as collapsed with both dates.

**Read from:** Date Picker Dialog — each commit announces the resulting value; ARIA live region for the intermediate state.

### Step 6 — task `dismiss`

**Open:** [`core-forms-dzdaterangepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdaterangepicker--accessibility&viewMode=story)

**Do:**

1. Open the calendar, choose only a start date, then Escape.

**The AT must:**

- [ ] The calendar closes and focus returns to the field, which is re-announced.
- [ ] The AT makes clear whether the half-finished range was kept or discarded.

**Read from:** Dialog — Escape closes and returns focus; and the ARIA rule that a cancelled edit announces its outcome.

### Step 7 — task `error`

**Open:** [`core-forms-dzdaterangepicker--invalid-state`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdaterangepicker--invalid-state&viewMode=story)

**Do:**

1. Tab onto the control, Tab away, then Shift+Tab back.

**The AT must:**

- [ ] The control is announced as invalid.
- [ ] The error text is announced as part of the control and is re-announced on re-focus.

**Read from:** WCAG 3.3.1; `aria-invalid` + `aria-describedby`/`aria-errormessage`.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

None on the register for this component. Anything that fails here is new — file it.

