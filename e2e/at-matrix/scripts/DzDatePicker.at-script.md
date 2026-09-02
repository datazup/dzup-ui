<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzDatePicker — AT test script

**Tier C · APG pattern `combobox` · source `packages/core/src/components/forms/DzDatePicker.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzDatePicker.md`](../DzDatePicker.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- An empty date field with the placeholder "Keyboard navigable" and the accessible name "Appointment date".
- This is the combobox-plus-dialog shape: a text field that opens a calendar.

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

**Open:** [`core-forms-dzdatepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdatepicker--accessibility&viewMode=story)

**Do:**

1. Tab until focus lands on the field.

**The AT must:**

- [ ] It is announced as a combobox named "Appointment date".
- [ ] It is announced as collapsed.
- [ ] Its current value, or the placeholder when empty, is announced.

**Read from:** Date Picker Combobox — role `combobox` with `aria-haspopup="dialog"`; `aria-expanded="false"`.

### Step 2 — task `open`

**Open:** [`core-forms-dzdatepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdatepicker--accessibility&viewMode=story)

**Do:**

1. Enter. Close it with Escape, then re-open with Alt+ArrowDown.

**The AT must:**

- [ ] The field is announced as expanded.
- [ ] The calendar is announced with its own role (dialog or grid) and its name.
- [ ] The AT arrives in the calendar — a focused day, or an active descendant, is announced without a further keystroke.
- [ ] Both Enter and Alt+ArrowDown open it.

**Read from:** Date Picker Combobox — Keyboard Interaction: Enter / Alt+Down open the dialog and move focus into it.

### Step 3 — task `navigate`

**Open:** [`core-forms-dzdatepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdatepicker--accessibility&viewMode=story)

**Do:**

1. ArrowRight, ArrowDown, Home, PageDown, PageUp.

**The AT must:**

- [ ] Every move announces the new date, including its weekday.
- [ ] PageUp/PageDown announce the new month.
- [ ] Days that lie outside the allowed range are announced as unavailable rather than being silently skipped.

**Read from:** Date Picker Dialog — Keyboard Interaction over the day grid; `aria-disabled` on out-of-range days.

### Step 4 — task `typeahead`

**Open:** [`core-forms-dzdatepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdatepicker--accessibility&viewMode=story)

**Do:**

1. Escape to close the calendar so focus is back in the text field.
1. Type `2026-06-21` (or the locale format the field advertises).

**The AT must:**

- [ ] The typed characters are echoed as the tester types.
- [ ] The value the field holds afterwards matches what was typed.
- [ ] If the calendar re-opens, its focused day follows the typed value.

**Read from:** Combobox — Keyboard Interaction: printable characters are accepted by the text field.

### Step 5 — task `select`

**Open:** [`core-forms-dzdatepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdatepicker--accessibility&viewMode=story)

**Do:**

1. Open the calendar and press Enter on a day.

**The AT must:**

- [ ] The day is announced as selected.
- [ ] The calendar closes and the field is announced as collapsed.
- [ ] Re-reading the field announces the committed date.

**Read from:** Date Picker Dialog — Enter commits the focused date and dismisses the dialog.

### Step 6 — task `dismiss`

**Open:** [`core-forms-dzdatepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdatepicker--accessibility&viewMode=story)

**Do:**

1. Open the calendar, then Escape.

**The AT must:**

- [ ] The field is announced as collapsed.
- [ ] Focus is back on the field and the AT announces it by name.
- [ ] The value is unchanged.

**Read from:** Dialog — Escape closes and returns focus to the invoking control.

### Step 7 — task `error`

**Open:** [`core-forms-dzdatepicker--invalid-state`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzdatepicker--invalid-state&viewMode=story)

**Do:**

1. Tab onto the control, Tab away, then Shift+Tab back.

**The AT must:**

- [ ] The control is announced as invalid.
- [ ] The error text is announced as part of the control.
- [ ] Re-focusing announces the error again.

**Read from:** WCAG 3.3.1; `aria-invalid` + `aria-describedby`/`aria-errormessage`.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

None on the register for this component. Anything that fails here is new — file it.

