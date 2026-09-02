<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzCombobox — AT test script

**Tier C · APG pattern `combobox` · source `packages/core/src/components/forms/DzCombobox.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzCombobox.md`](../DzCombobox.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- The list holds ten US cities: New York, Los Angeles, Chicago, Houston, Phoenix, Philadelphia, San Antonio, San Diego, Dallas, San Jose.
- This is an EDITABLE combobox: focus stays in the text field and the active option is published through `aria-activedescendant`.

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

**Open:** [`core-forms-dzcombobox--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcombobox--accessibility&viewMode=story)

**Do:**

1. Tab until focus lands on the field.

**The AT must:**

- [ ] It is announced as a combobox named "City search".
- [ ] It is announced as collapsed and as editable.
- [ ] Exactly one control is announced. No second control is announced inside it.

**Read from:** Combobox (list autocomplete) — role `combobox` on the text input, `aria-expanded="false"`.

### Step 2 — task `open`

**Open:** [`core-forms-dzcombobox--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcombobox--accessibility&viewMode=story)

**Do:**

1. ArrowDown.

**The AT must:**

- [ ] The combobox is announced as expanded.
- [ ] The popup is announced as a listbox.
- [ ] The first option becomes active and is announced, WITHOUT the AT reporting a focus move — focus stays in the text field.

**Read from:** Combobox — Keyboard Interaction: Down Arrow opens and moves the active option; `aria-activedescendant` focus management.

### Step 3 — task `navigate`

**Open:** [`core-forms-dzcombobox--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcombobox--accessibility&viewMode=story)

**Do:**

1. ArrowDown three times, ArrowUp once, then End, then Home.

**The AT must:**

- [ ] Each option is announced with its label and its position — "Los Angeles, 2 of 10".
- [ ] End announces the last option and Home the first.
- [ ] Nothing is skipped, and the text field never loses focus.

**Read from:** Combobox — Keyboard Interaction Down/Up/Home/End over the listbox.

### Step 4 — task `typeahead`

**Open:** [`core-forms-dzcombobox--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcombobox--accessibility&viewMode=story)

**Do:**

1. Type `san`.

**The AT must:**

- [ ] The list narrows to San Antonio, San Diego and San Jose.
- [ ] The number of results is announced politely, once, after typing stops.
- [ ] The first match becomes active and is announced as "1 of 3".

**Read from:** Combobox with list autocomplete — the filtered result count is announced in a live region.

### Step 5 — task `select`

**Open:** [`core-forms-dzcombobox--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcombobox--accessibility&viewMode=story)

**Do:**

1. Enter on the active option.

**The AT must:**

- [ ] The option is announced as selected.
- [ ] The combobox is announced as collapsed.
- [ ] Re-reading the field announces the committed label.

**Read from:** Combobox — Keyboard Interaction: Enter accepts the active option.

### Step 6 — task `dismiss`

**Open:** [`core-forms-dzcombobox--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcombobox--accessibility&viewMode=story)

**Do:**

1. Open the list again, then Escape.

**The AT must:**

- [ ] The combobox is announced as collapsed.
- [ ] Focus is on the combobox and it is re-announced with its value.
- [ ] The committed value from the previous step is unchanged.

**Read from:** Combobox — Keyboard Interaction: Escape closes the popup without changing the value.

### Step 7 — task `error`

**Open:** [`core-forms-dzcombobox--invalid-state`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcombobox--invalid-state&viewMode=story)

**Do:**

1. Tab onto the control, Tab away, then Shift+Tab back.

**The AT must:**

- [ ] The control is announced as invalid.
- [ ] The error text is announced as part of the control.
- [ ] Re-focusing announces the error again.

**Read from:** WCAG 3.3.1; `aria-invalid` + `aria-describedby`/`aria-errormessage`.

### Step 8 — task `live`

**Open:** [`core-forms-dzcombobox--loading-state`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcombobox--loading-state&viewMode=story)

**Do:**

1. Tab onto the control and open it. Do not move focus again.
1. Then open `core-forms-dzcombobox--default`, open the list and type `zzzz`.

**The AT must:**

- [ ] On the loading story, "Loading options…" is announced politely, exactly once, with focus unmoved.
- [ ] On the default story with no match, "No results found" is announced politely, exactly once.
- [ ] Neither announcement moves the caret or re-reads the whole control.

**Read from:** ARIA live regions; and Combobox — a busy or empty popup is a status, not a focus event.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

- **D9** — affects `reach`. The clear button ignores `disabled`. On `core-forms-dzcombobox--disabled` a live "Clear selection" control is still present; touch-exploration pairs (VoiceOver iOS, TalkBack) can reach and press it.

