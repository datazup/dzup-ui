<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzTransfer — AT test script

**Tier C · APG pattern `listbox` · source `packages/core/src/components/forms/DzTransfer.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzTransfer.md`](../DzTransfer.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- Two lists side by side. The source holds eight languages: JavaScript, TypeScript, Python, Rust, Go, Java, C# (disabled), Ruby. The target starts empty.
- Two move buttons sit between them, named "Move selected to target" and "Move selected to source".

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

**Open:** [`core-forms-dztransfer--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztransfer--accessibility&viewMode=story)

**Do:**

1. Tab through the whole component once.

**The AT must:**

- [ ] The component is announced with the name "Language selection transfer".
- [ ] The source list is announced as a listbox named "Source items" and the target as a listbox named "Target items".
- [ ] Each list announces how many items it holds.
- [ ] The two move buttons are announced with their own names.
- [ ] An empty target list is announced as empty, not as silence.

**Read from:** Listbox — each listbox carries its own accessible name; and the ARIA rule that an empty collection states that it is empty.

### Step 2 — task `navigate`

**Open:** [`core-forms-dztransfer--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztransfer--accessibility&viewMode=story)

**Do:**

1. Tab into the source list, then ArrowDown five times, ArrowUp once, End, Home.

**The AT must:**

- [ ] Each item is announced with its label and its position — "JavaScript, 1 of 8".
- [ ] The disabled "C#" entry is announced as unavailable.
- [ ] The disabled entry is reachable for reading but refuses selection.
- [ ] Nothing is skipped.

**Read from:** Listbox — Keyboard Interaction Down/Up/Home/End; `aria-disabled` on an option that cannot be chosen.

### Step 3 — task `typeahead`

**Open:** [`core-forms-dztransfer--searchable`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztransfer--searchable&viewMode=story)

**Do:**

1. Tab to the source search field and type `ru`.

**The AT must:**

- [ ] The search field is announced as a text field named "Search source items".
- [ ] The source list narrows to Rust and Ruby.
- [ ] The number of results is announced politely, once.

**Read from:** Listbox with a filter — the filtered count is announced in a live region.

### Step 4 — task `select`

**Open:** [`core-forms-dztransfer--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztransfer--accessibility&viewMode=story)

**Do:**

1. Back on the entry story: in the source list, select Rust and Go with Space.
1. Tab to "Move selected to target" and activate it.

**The AT must:**

- [ ] Each selection is announced as selected.
- [ ] After the move, the AT announces what moved and how many.
- [ ] Both lists announce their new sizes.
- [ ] Focus is not lost — it stays on the button, or lands somewhere the AT names.

**Read from:** Listbox (multi-select) — `aria-selected` on every option; and ARIA live regions for the resulting change.

### Step 5 — task `live`

**Open:** [`core-forms-dztransfer--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dztransfer--accessibility&viewMode=story)

**Do:**

1. With focus still on the move button, move two more items across.

**The AT must:**

- [ ] Each transfer is announced politely, exactly once.
- [ ] The announcement states the new counts.
- [ ] A move button that can no longer act (nothing selected, or the source is empty) is announced as unavailable.
- [ ] Neither list is re-read from the top.

**Read from:** ARIA live regions; `aria-disabled` on a control with nothing to act on.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

None on the register for this component. Anything that fails here is new — file it.

