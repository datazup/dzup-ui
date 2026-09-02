<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzCascader — AT test script

**Tier C · APG pattern `combobox` · source `packages/core/src/components/forms/DzCascader.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzCascader.md`](../DzCascader.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- The cascade holds two roots: China (Zhejiang → Hangzhou/Ningbo/Wenzhou; Jiangsu → Nanjing/Suzhou) and USA (California → Los Angeles/San Francisco; New York → New York City).
- A line under the control reads `Path:` and shows the committed value.
- Steps 4 and 8 switch to a different story; the step says which.

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

**Open:** [`core-forms-dzcascader--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcascader--accessibility&viewMode=story)

**Do:**

1. Tab until focus lands on the cascader trigger.

**The AT must:**

- [ ] It is announced as a combobox named "Keyboard region cascade".
- [ ] It is announced as collapsed.
- [ ] Its current value, or the placeholder "Select region" when empty, is announced.
- [ ] Exactly ONE control is announced here. No second control is announced inside it.

**Read from:** Combobox (select-only) — role `combobox`, `aria-expanded="false"`, `aria-haspopup`; and the HTML rule that a button may not contain interactive content.

### Step 2 — task `open`

**Open:** [`core-forms-dzcascader--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcascader--accessibility&viewMode=story)

**Do:**

1. ArrowDown (Alt+ArrowDown is also allowed).

**The AT must:**

- [ ] The trigger is announced as expanded.
- [ ] The popup is announced with its role (listbox).
- [ ] The first option of the first column, "China", becomes the active option and is announced.

**Read from:** Combobox — Keyboard Interaction: Down Arrow opens the popup and moves focus (or the active option) into it.

### Step 3 — task `navigate`

**Open:** [`core-forms-dzcascader--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcascader--accessibility&viewMode=story)

**Do:**

1. ArrowDown then ArrowUp inside the first column.
1. ArrowRight to descend from "China" into its second column.
1. ArrowDown to "Jiangsu", then ArrowRight into its third column.
1. ArrowLeft twice to climb back to the first column.

**The AT must:**

- [ ] Every option is announced with its label AND its position in the set — "China, 1 of 2".
- [ ] An option that owns a further column is announced as expandable or as having a submenu, before it is descended into.
- [ ] Descending announces the new column and its first option; climbing back announces the parent.
- [ ] No option is skipped and none is announced twice.

**Read from:** Combobox with a hierarchical listbox popup — Keyboard Interaction Down/Up/Right/Left; `aria-setsize` / `aria-posinset` on each option.

### Step 4 — task `typeahead`

**Open:** [`core-forms-dzcascader--filterable`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcascader--filterable&viewMode=story)

**Do:**

1. Tab to the control and open it.
1. Type `san` into the search field.

**The AT must:**

- [ ] The search field is announced as a text field named "Search paths".
- [ ] The result list is announced with the name "Matching paths".
- [ ] The number of matches is announced politely after typing stops — announced once, not once per keystroke.
- [ ] The first match becomes the active option and is announced.
- [ ] Typing `zzz` announces "No matching paths".

**Read from:** Combobox with list autocomplete — printable characters filter, and the count of results is announced in a live region.

### Step 5 — task `select`

**Open:** [`core-forms-dzcascader--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcascader--accessibility&viewMode=story)

**Do:**

1. Back on the entry story, open the cascade and walk USA → California → San Francisco.
1. Enter.

**The AT must:**

- [ ] The committed leaf is announced as selected.
- [ ] The popup is announced as collapsed.
- [ ] Re-reading the trigger announces the committed path, not the placeholder.
- [ ] The `Path:` line reads `us → ca → sf`.

**Read from:** Combobox — Keyboard Interaction: Enter accepts the active option and closes the popup.

### Step 6 — task `dismiss`

**Open:** [`core-forms-dzcascader--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcascader--accessibility&viewMode=story)

**Do:**

1. Open the cascade again.
1. Escape.

**The AT must:**

- [ ] The trigger is announced as collapsed.
- [ ] Focus is back on the trigger and the AT announces it by name — the tester can tell where they are without looking.
- [ ] The value from the previous step is unchanged.

**Read from:** Combobox — Keyboard Interaction: Escape closes the popup and returns focus to the combobox.

### Step 7 — task `error`

**Open:** [`core-forms-dzcascader--invalid-state`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcascader--invalid-state&viewMode=story)

**Do:**

1. Tab onto the control, then Tab away from it.
1. Shift+Tab back onto it.

**The AT must:**

- [ ] The control is announced as invalid.
- [ ] The error text is announced as part of the control, not as loose page text the tester has to hunt for.
- [ ] Re-focusing the control announces the error text again.

**Read from:** WCAG 3.3.1 Error Identification, and ARIA `aria-invalid` + `aria-describedby`/`aria-errormessage`.

### Step 8 — task `live`

**Open:** [`core-forms-dzcascader--filterable`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcascader--filterable&viewMode=story)

**Do:**

1. Open the control and type `qqq` into the search field.
1. Do not move focus.

**The AT must:**

- [ ] "No matching paths" is announced politely.
- [ ] It is announced exactly once.
- [ ] Focus stays in the search field — the announcement does not move the caret.

**Read from:** ARIA live regions: a status change is announced without moving focus, once.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

- **D4** — affects `reach`. The "Clear selection" affordance is rendered as `role="button"` INSIDE the `role="combobox"` button. Expect the reach step to announce two controls, or the clear control to be unreachable, depending on the pair.
- **D8** — affects `select`. `useDualModel` ignores external writes to `v-model:value` after the first user edit. A step that resets the value from outside the component may not take.

