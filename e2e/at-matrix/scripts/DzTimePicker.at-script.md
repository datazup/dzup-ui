<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzTimePicker — AT test script

**Tier C · APG pattern `combobox` · source `packages/core/src/components/forms/DzTimePicker.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzTimePicker.md`](../DzTimePicker.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- An empty time field named "Appointment time", using the select-list panel layout.
- The panel controls are named "Select hours", "Select minutes", "Select AM/PM", "OK" and "Cancel".

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

**Open:** [`core-forms-dztimepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztimepicker--accessibility&viewMode=story)

**Do:**

1. Tab until focus lands on the trigger.

**The AT must:**

- [ ] It is announced as a combobox named "Appointment time", collapsed.
- [ ] Its current value, or the placeholder when empty, is announced.

**Read from:** Combobox — role, name, `aria-haspopup="dialog"`, `aria-expanded="false"`.

### Step 2 — task `open`

**Open:** [`core-forms-dztimepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztimepicker--accessibility&viewMode=story)

**Do:**

1. Enter.

**The AT must:**

- [ ] The trigger is announced as expanded.
- [ ] The panel is announced as a dialog.
- [ ] Focus moves into the panel and the first control is announced without a further keystroke.

**Read from:** Combobox with a dialog popup — Enter opens and moves focus into the dialog.

### Step 3 — task `navigate`

**Open:** [`core-forms-dztimepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztimepicker--accessibility&viewMode=story)

**Do:**

1. Tab through every control in the panel, then Shift+Tab back.

**The AT must:**

- [ ] Every control is announced with a name: "Select hours", "Select minutes", "Select AM/PM", "OK", "Cancel".
- [ ] Each list announces its current value and its position in the set as the tester moves within it.
- [ ] No control in the panel is announced as unnamed.

**Read from:** Dialog — every control has an accessible name; Listbox — position and set size within each column.

### Step 4 — task `typeahead`

**Open:** [`core-forms-dztimepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztimepicker--accessibility&viewMode=story)

**Do:**

1. Move into the hours list and type `14` (or `2` in twelve-hour mode).

**The AT must:**

- [ ] The matching hour becomes active and is announced.
- [ ] Typing a value that does not exist does not move the active option and does not announce a wrong one.

**Read from:** Listbox — Keyboard Interaction: printable characters move focus to a matching option.

### Step 5 — task `select`

**Open:** [`core-forms-dztimepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztimepicker--accessibility&viewMode=story)

**Do:**

1. Choose 14 hours and 30 minutes, then activate "OK".

**The AT must:**

- [ ] Each column choice is announced as selected.
- [ ] "OK" commits the value and the commit is announced.
- [ ] The panel closes and the trigger announces 14:30 as its value.

**Read from:** Dialog — an explicit commit control; the resulting value is announced.

### Step 6 — task `dismiss`

**Open:** [`core-forms-dztimepicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztimepicker--accessibility&viewMode=story)

**Do:**

1. Open the panel again, then Escape. Then open it once more and use "Cancel".

**The AT must:**

- [ ] Escape closes the panel and focus returns to the trigger, which is re-announced.
- [ ] "Cancel" closes it the same way and leaves the value unchanged.
- [ ] In both cases the tester can tell where focus landed without looking.

**Read from:** Dialog — Escape closes and focus returns to the invoking control.

### Step 7 — task `error`

**Open:** [`core-forms-dztimepicker--invalid-state`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztimepicker--invalid-state&viewMode=story)

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

