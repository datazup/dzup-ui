<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzMultiSelect — AT test script

**Tier C · APG pattern `combobox` · source `packages/core/src/components/forms/DzMultiSelect.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzMultiSelect.md`](../DzMultiSelect.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- Six frameworks: React, Vue, Angular, Svelte, Solid, Preact. More than one may be selected.
- Committed values are shown as removable tags on the control.

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

The scaffold says this component owes 8 task(s):
`reach`, `open`, `navigate`, `typeahead`, `select`, `dismiss`, `error`, `live`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-forms-dzmultiselect--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmultiselect--accessibility&viewMode=story)

**Do:**

1. Tab until focus lands on the control.

**The AT must:**

- [ ] It is announced as a combobox named "Framework selection", collapsed.
- [ ] The current selection is announced — the count, or the tags, or both. An empty selection is announced as empty, not as silence.

**Read from:** Combobox — role and expanded state; and the ARIA rule that a multi-value control announces its full value.

### Step 2 — task `open`

**Open:** [`core-forms-dzmultiselect--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmultiselect--accessibility&viewMode=story)

**Do:**

1. ArrowDown.

**The AT must:**

- [ ] The combobox is announced as expanded.
- [ ] The popup is announced as a listbox that allows more than one selection.
- [ ] The first option becomes active and is announced.

**Read from:** Combobox — Down Arrow opens; `aria-multiselectable="true"` on the listbox.

### Step 3 — task `navigate`

**Open:** [`core-forms-dzmultiselect--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmultiselect--accessibility&viewMode=story)

**Do:**

1. ArrowDown three times, ArrowUp once, End, Home.

**The AT must:**

- [ ] Each option is announced with its label, its position ("Vue, 2 of 6") AND its selected state.
- [ ] An option already selected is announced as selected before it is toggled.
- [ ] Nothing is skipped.

**Read from:** Combobox with a multi-select listbox — `aria-selected` is present on EVERY option, not only the selected ones.

### Step 4 — task `typeahead`

**Open:** [`core-forms-dzmultiselect--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmultiselect--accessibility&viewMode=story)

**Do:**

1. Type `sv`.

**The AT must:**

- [ ] "Svelte" becomes the active option and is announced.
- [ ] The number of matches is announced politely, once.

**Read from:** Combobox with list autocomplete.

### Step 5 — task `select`

**Open:** [`core-forms-dzmultiselect--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmultiselect--accessibility&viewMode=story)

**Do:**

1. Enter on "Svelte", ArrowDown to another option, Enter again.

**The AT must:**

- [ ] Each selection is announced as selected as it happens.
- [ ] The popup does NOT close after the first selection — a multi-select combobox stays open.
- [ ] The control announces both values afterwards.
- [ ] Each tag is announced with its own label and its own remove control, and the remove control names what it removes.

**Read from:** Combobox with a multi-select listbox — Enter toggles the active option and the popup remains open.

### Step 6 — task `dismiss`

**Open:** [`core-forms-dzmultiselect--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmultiselect--accessibility&viewMode=story)

**Do:**

1. Escape.

**The AT must:**

- [ ] The combobox is announced as collapsed.
- [ ] Focus is on the combobox and it is re-announced with both values.
- [ ] The selections are unchanged.

**Read from:** Combobox — Escape closes the popup without changing the value.

### Step 7 — task `error`

**Open:** [`core-forms-dzmultiselect--invalid-state`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmultiselect--invalid-state&viewMode=story)

**Do:**

1. Tab onto the control, Tab away, then Shift+Tab back.

**The AT must:**

- [ ] The control is announced as invalid.
- [ ] The error text is announced as part of the control and is re-announced on re-focus.

**Read from:** WCAG 3.3.1; `aria-invalid` + `aria-describedby`/`aria-errormessage`.

### Step 8 — task `live`

**Open:** [`core-forms-dzmultiselect--max-selections`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzmultiselect--max-selections&viewMode=story)

**Do:**

1. Select options until the maximum is reached, then try to select one more. Do not move focus.

**The AT must:**

- [ ] Reaching the maximum is announced politely, exactly once.
- [ ] Options beyond the maximum are announced as unavailable BEFORE the tester tries to select one.
- [ ] The refusal does not move focus and does not close the popup silently.

**Read from:** ARIA live regions; and `aria-disabled` on options that cannot currently be chosen.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

None on the register for this component. Anything that fails here is new — file it.

