<!-- AUTO-GENERATED HEADER — do not edit. Written by `yarn generate:at-matrix`. -->

# DzTreeItem — manual AT task matrix

**Tier B · APG pattern `treeview` · source `packages/core/src/components/data/DzTreeItem.vue`**

Automated checks cover semantics, contrast and DOM relationships. They do not
cover whether somebody using a screen reader can tell what happened. These
tasks are the part a human has to do.

Record every run as a **new row** in the results table. Never edit a row that is
already there: the history is what distinguishes a new regression from a
known one.

## Tasks

| id | Do this | The AT must |
|---|---|---|
| `reach` | Reach the component by the platform's own navigation (Tab, or swipe on touch). | Name, role and current state are announced together, and the name is the visible label. |
| `navigate` | Move through the collection with the pattern's own keys or gestures. | Each item is announced with its position and set size, and nothing is skipped. |
| `select` | Select an item and confirm the selection. | The selected state is announced, and the control's value reflects it afterwards. |
| `typeahead` | Type the first characters of an item while the collection has focus. | Focus moves to the matching item and it is announced. |

## Declared keyboard contract

Drive **these** keys, not the pattern's from memory. They are declared in
`packages/core/src/components/data/DzTreeItem.anatomy.ts` and are the same rows the component's documentation page publishes. A key that
does not do what this table says is a defect in the component **or** in the contract — record which,
in a note.

| Key | Where | Must |
|---|---|---|
| `ArrowDown` | — | Move focus to the next visible node. |
| `ArrowUp` | — | Move focus to the previous visible node. |
| `ArrowRight` | — | Expand the focused node, or move to its first child when already expanded. |
| `ArrowLeft` | — | Collapse the focused node, or move to its parent when already collapsed. |
| `Home` | — | Move focus to the first visible node. |
| `End` | — | Move focus to the last visible node. |
| `Enter` | — | Activate the focused node. |
| `Space` | — | Select the focused node. |

## Pairs

A **required** pairing holds this component's evidence state: its `at-manual` row
cannot read `pass` until every task above has passed on every required pairing.
Which ones are required follows the tier, from `requiredAtPairs()` in
`@dzup-ui/contracts` — Tier B requires 1 of 6.
An **optional** pairing is still worth running and is still recorded if you run
it; it simply does not gate qualification.

| id | Tier B | Pairing | What it exposes |
|---|---|---|---|
| `nvda-firefox` | **required** | NVDA + Firefox (Windows) | Browse/forms mode switching and the Gecko accessibility tree. |
| `nvda-chrome` | optional | NVDA + Chrome (Windows) | The same AT over Blink, where virtualized and composite widgets differ. |
| `jaws-chrome` | optional | JAWS + Chrome (Windows) | JAWS heuristics over ARIA, which override author intent more often. |
| `voiceover-safari` | optional | VoiceOver + Safari (macOS) | WebKit behaviour and rotor navigation. |
| `voiceover-ios` | optional | VoiceOver + Safari (iOS) | Touch exploration; a control reached by gesture, not by Tab. |
| `talkback-android` | optional | TalkBack + Chrome (Android) | Touch exploration, gestures and drag alternatives. |

## How to record a run

Append one row per `{task, pair}` you actually drove. `result` is one of
`unrun`, `pass`, `fail`, `partial`, `blocked`. `unrun` means the AT or the
device was not available — it is a fact, not a placeholder, and it must not be
written as `fail`. `sourceCommit` is the repository HEAD you observed;
`validate:at-matrix` marks a row stale when the component has changed since.

`task` is one of the ids in the Tasks table above, or `*` for a row
that covers every task at once. The generated rows below use `*`:
they say "nobody has run this pairing", which is true of every task equally.
**Leave them in place and append beneath them** — they are the matrix's
denominator, and a run that replaces one instead of following it destroys the
record it was supposed to add to.

<!-- results: append-only. The generator never rewrites below here. -->

## Results

| pair | task | result | versions | tester | date | sourceCommit | notes |
|---|---|---|---|---|---|---|---|
| nvda-firefox | * | unrun | - | - | - | - | not executed |
| nvda-chrome | * | unrun | - | - | - | - | not executed |
| jaws-chrome | * | unrun | - | - | - | - | not executed |
| voiceover-safari | * | unrun | - | - | - | - | not executed |
| voiceover-ios | * | unrun | - | - | - | - | not executed |
| talkback-android | * | unrun | - | - | - | - | not executed |
