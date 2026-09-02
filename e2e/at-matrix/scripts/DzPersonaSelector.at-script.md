<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzPersonaSelector — AT test script

**Tier C · APG pattern `listbox` · source `packages/core/src/components/forms/DzPersonaSelector.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzPersonaSelector.md`](../DzPersonaSelector.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- Four people: Ada Lovelace (Engineering Lead), Linus Torvalds (Kernel Maintainer), Grace Hopper (Compiler Pioneer), Alan Turing (Research).
- Two of them have an avatar image and two do not. An avatar is decoration: it must not be announced as a separate image with a filename.

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

The scaffold says this component owes 5 task(s):
`reach`, `navigate`, `typeahead`, `select`, `live`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-forms-dzpersonaselector--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzpersonaselector--accessibility&viewMode=story)

**Do:**

1. Tab until focus lands on the search field.

**The AT must:**

- [ ] It is announced as a combobox named "Assign a reviewer", collapsed.
- [ ] The placeholder is announced as a hint, not as the name.
- [ ] Exactly one control is announced. No second control is announced inside it.

**Read from:** Combobox — role, name and expanded state.

### Step 2 — task `navigate`

**Open:** [`core-forms-dzpersonaselector--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzpersonaselector--accessibility&viewMode=story)

**Do:**

1. ArrowDown to open, then ArrowDown twice more, then ArrowUp.

**The AT must:**

- [ ] Each person is announced with their name, their role and their position — "Ada Lovelace, Engineering Lead, 1 of 4".
- [ ] The avatar image is not announced as a separate object, and never as a URL or a filename.
- [ ] Nothing is skipped.

**Read from:** Listbox — Keyboard Interaction and `aria-posinset`/`aria-setsize`; and the ARIA rule that decorative images are hidden.

### Step 3 — task `typeahead`

**Open:** [`core-forms-dzpersonaselector--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzpersonaselector--accessibility&viewMode=story)

**Do:**

1. Type `gra`.

**The AT must:**

- [ ] The roster narrows to "Grace Hopper".
- [ ] The number of matches is announced politely, once.
- [ ] The single match becomes active and is announced.

**Read from:** Combobox with list autocomplete.

### Step 4 — task `select`

**Open:** [`core-forms-dzpersonaselector--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzpersonaselector--accessibility&viewMode=story)

**Do:**

1. Enter.

**The AT must:**

- [ ] "Grace Hopper" is announced as selected.
- [ ] The list is announced as collapsed.
- [ ] Re-reading the control announces her name as the current value.

**Read from:** Combobox — Enter accepts the active option.

### Step 5 — task `live`

**Open:** [`core-forms-dzpersonaselector--empty`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzpersonaselector--empty&viewMode=story)

**Do:**

1. Tab to the field and open it. Do not move focus.

**The AT must:**

- [ ] The empty-roster copy is announced politely, exactly once.
- [ ] The popup is not announced as an empty listbox with no explanation.
- [ ] Focus stays in the field.

**Read from:** ARIA live regions; an empty popup states why it is empty.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

- **D9** — affects `reach`. The clear button ignores `disabled`. On `core-forms-dzpersonaselector--disabled` a live "Clear selection" control is still present. It is out of the tab order, so keyboard-only pairs will not find it — but VoiceOver iOS and TalkBack reach controls by gesture, not by Tab, and are expected to reach and press it.

