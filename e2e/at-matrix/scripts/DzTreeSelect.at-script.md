<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzTreeSelect — AT test script

**Tier C · APG pattern `combobox` · source `packages/core/src/components/forms/DzTreeSelect.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzTreeSelect.md`](../DzTreeSelect.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- A category tree in a select: Fruit (Apple, Banana, Citrus → Orange, Lemon), Vegetable (Carrot, Potato), Dairy.
- The declared contract is a combobox that KEEPS focus on the trigger and publishes the active node through `aria-activedescendant`. Watch for a focus move; it is the thing this script is looking for.

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

**Open:** [`core-forms-dztreeselect--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztreeselect--accessibility&viewMode=story)

**Do:**

1. Tab until focus lands on the trigger.

**The AT must:**

- [ ] It is announced as a combobox named "Keyboard category", collapsed.
- [ ] It is announced as having a tree popup.
- [ ] Exactly one control is announced. No second control is announced inside it.

**Read from:** Combobox — role, name, `aria-haspopup="tree"`, `aria-expanded="false"`; and the HTML rule that a button may not contain interactive content.

### Step 2 — task `open`

**Open:** [`core-forms-dztreeselect--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztreeselect--accessibility&viewMode=story)

**Do:**

1. ArrowDown.

**The AT must:**

- [ ] The trigger is announced as expanded.
- [ ] The popup is announced as a tree.
- [ ] The first node, "Fruit", becomes the active node and is announced with its level and position.
- [ ] Focus does NOT move: the AT must not report a focus change to a tree row. The trigger keeps focus and publishes the active node through `aria-activedescendant`.

**Read from:** Combobox — `aria-activedescendant` focus management: the element with `aria-activedescendant` must retain DOM focus.

### Step 3 — task `navigate`

**Open:** [`core-forms-dztreeselect--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztreeselect--accessibility&viewMode=story)

**Do:**

1. ArrowRight to expand "Fruit".
1. ArrowDown to step into "Apple", ArrowDown again to "Banana".
1. ArrowLeft to return to the parent.

**The AT must:**

- [ ] Each active node is announced with its label, its level and its position in its set.
- [ ] ArrowRight on a collapsed branch expands it and announces "expanded".
- [ ] ArrowLeft collapses or climbs, and announces the node it lands on.
- [ ] Nothing is skipped and no hidden child is announced.

**Read from:** Tree View — Keyboard Interaction, driven from a combobox trigger.

### Step 4 — task `typeahead`

**Open:** [`core-forms-dztreeselect--filterable`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztreeselect--filterable&viewMode=story)

**Do:**

1. Open the popup and type `car` into the filter field.
1. Then clear it and type `qqq`.

**The AT must:**

- [ ] The filter field is announced as a text field named "Filter options".
- [ ] The tree narrows to "Carrot" and the number of results is announced politely, once.
- [ ] "No results found" is announced when nothing matches.

**Read from:** Combobox with list autocomplete over a tree popup.

### Step 5 — task `select`

**Open:** [`core-forms-dztreeselect--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztreeselect--accessibility&viewMode=story)

**Do:**

1. On the entry story: open, expand "Fruit", move to "Apple", press Enter.

**The AT must:**

- [ ] "Apple" is announced as selected.
- [ ] The popup is announced as collapsed.
- [ ] Re-reading the trigger announces "Apple" as its value.

**Read from:** Combobox — Enter accepts the active node and closes the popup.

### Step 6 — task `dismiss`

**Open:** [`core-forms-dztreeselect--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztreeselect--accessibility&viewMode=story)

**Do:**

1. Open the popup again, then Escape.

**The AT must:**

- [ ] The trigger is announced as collapsed.
- [ ] Focus is on the trigger and it is re-announced with its value.
- [ ] The selection is unchanged.

**Read from:** Combobox — Escape closes the popup and returns focus to the combobox.

### Step 7 — task `error`

**Open:** [`core-forms-dztreeselect--in-form-field`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztreeselect--in-form-field&viewMode=story)

**Do:**

1. Tab onto the control, leave it empty, Tab away, then Shift+Tab back.

**The AT must:**

- [ ] The control is announced as required.
- [ ] Leaving a required field empty is announced as an error, and the error text is announced as part of the control.
- [ ] Re-focusing announces it again.

**Read from:** WCAG 3.3.1 Error Identification; `aria-required`, `aria-invalid` and `aria-describedby`/`aria-errormessage`.

### Step 8 — task `live`

**Open:** [`core-forms-dztreeselect--filterable`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztreeselect--filterable&viewMode=story)

**Do:**

1. Open the popup, type `qqq` in the filter field, and do not move focus.

**The AT must:**

- [ ] "No results found" is announced politely, exactly once.
- [ ] Focus stays in the filter field.

**Read from:** ARIA live regions.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

- **D10** — affects `open`. The component runs two focus mechanisms at once: it advertises `aria-activedescendant` from the trigger while the popover moves real DOM focus onto the tree row. The fourth expectation of the `open` step is expected to FAIL — the AT will report a focus move to a tree row. This is a known open defect.
- **D4** — affects `reach`. On `core-forms-dztreeselect--multiple-chips`, each chip remove control is `role="button"` rendered INSIDE the `role="combobox"` button. The reach step on that story is expected to announce nested controls.
- **D8** — affects `select`. `useDualModel` ignores external writes to `v-model:value` after the first user edit. Resetting the selection from outside the component will not take.

