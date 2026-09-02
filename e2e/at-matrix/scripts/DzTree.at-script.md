<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzTree — AT test script

**Tier C · APG pattern `treeview` · source `packages/core/src/components/data/DzTree.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzTree.md`](../DzTree.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- A file tree. `src` is expanded and holds `components` (collapsed), `composables` (collapsed), `main.ts` and `App.vue`. A sibling branch `tests` is collapsed. Selection is on.

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
`reach`, `navigate`, `select`, `typeahead`, `live`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-data-dztree--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dztree--accessibility&viewMode=story)

**Do:**

1. Tab until focus enters the tree.

**The AT must:**

- [ ] It is announced as a tree named "Keyboard navigable file tree".
- [ ] The tree is one tab stop.
- [ ] The node that takes focus announces its label, its level, its position in its set, the set size, and whether it is expanded or collapsed.

**Read from:** Tree View — Keyboard Interaction: "the tree contains one tab stop"; `aria-level`, `aria-posinset`, `aria-setsize`, `aria-expanded`.

### Step 2 — task `navigate`

**Open:** [`core-data-dztree--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dztree--accessibility&viewMode=story)

**Do:**

1. ArrowDown to `components`.
1. ArrowRight (expands it), ArrowRight again (moves to its first child).
1. ArrowLeft (returns to the parent), ArrowLeft again (collapses it).
1. End, then Home.

**The AT must:**

- [ ] ArrowRight on a collapsed node expands it and announces "expanded"; it does not move focus.
- [ ] ArrowRight on an already-expanded node moves to its first child and announces the new level.
- [ ] ArrowLeft on an expanded node collapses it; on a collapsed node it moves to the parent and announces it.
- [ ] End announces the last visible node and Home the first.
- [ ] Every move announces the level and the position; nothing is skipped and no hidden child is announced.

**Read from:** Tree View — Keyboard Interaction Right/Left/Down/Up/Home/End, exactly as specified.

### Step 3 — task `select`

**Open:** [`core-data-dztree--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dztree--accessibility&viewMode=story)

**Do:**

1. Move to `DzButton.vue` and press Enter, then Space.

**The AT must:**

- [ ] The node is announced as selected.
- [ ] A previously selected node is announced as no longer selected.
- [ ] Both Enter and Space select — neither is silent.

**Read from:** Tree View — Enter/Space perform the default action; `aria-selected` on the selected node.

### Step 4 — task `typeahead`

**Open:** [`core-data-dztree--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-data-dztree--accessibility&viewMode=story)

**Do:**

1. With the tree focused, press `c`, then `c` again.

**The AT must:**

- [ ] Focus moves to the next visible node whose label starts with `c` and it is announced.
- [ ] Pressing it again moves to the next such node and wraps at the end.
- [ ] Only visible nodes are considered — a collapsed branch child is not reached by typeahead.

**Read from:** Tree View — Keyboard Interaction: "type a character, focus moves to the next node with a name that starts with the typed character".

### Step 5 — task `live`

**Open:** [`core-data-dztree--loading`](http://127.0.0.1:6006/iframe.html?id=core-data-dztree--loading&viewMode=story)

**Do:**

1. Park focus outside the tree, then load the loading story.
1. Then load `core-data-dztree--empty` the same way.
1. Finally, on `core-data-dztree--disabled`, Tab towards the tree.

**The AT must:**

- [ ] The busy state is announced once, without moving focus.
- [ ] The empty state text is announced politely, once.
- [ ] A tree marked disabled is announced as disabled AND is not operable — it is not a tab stop, rows do not take focus, and branches cannot be expanded.

**Read from:** ARIA `aria-busy` and live regions; and the rule that a disabled composite is disabled throughout, not only on its container.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

- **D1** — affects `live`. Tree-level `disabled` is presentational only: the root is marked disabled but the prop never reaches the rows, so every row keeps its roving tabindex, its click handler, its expand chevron and its selection. The third expectation of the `live` step is expected to FAIL. This is a known open defect.

