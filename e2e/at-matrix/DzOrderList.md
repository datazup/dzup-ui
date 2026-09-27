<!-- AUTO-GENERATED HEADER — do not edit. Written by `yarn generate:at-matrix`. -->

# DzOrderList — manual AT task matrix

**Tier C · APG pattern `listbox` · source `packages/core/src/components/data/DzOrderList.vue`**

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
| `typeahead` | Type the first characters of an item while the collection has focus. | Focus moves to the matching item and it is announced. |
| `select` | Select an item and confirm the selection. | The selected state is announced, and the control's value reflects it afterwards. |
| `non-drag` | Perform the drag interaction without a pointer drag. | A keyboard or single-pointer path exists, is discoverable, and narrates each step. |
| `live` | Trigger the loading, empty and error states while focus is elsewhere. | Each is announced without moving focus, exactly once. |

## Declared keyboard contract

Drive **these** keys, not the pattern's from memory. They are declared in
`packages/core/src/components/data/DzOrderList.anatomy.ts` and are the same rows the component's documentation page publishes. A key that
does not do what this table says is a defect in the component **or** in the contract — record which,
in a note.

| Key | Where | Must |
|---|---|---|
| `ArrowDown` | — | Move focus to the next option. |
| `ArrowUp` | — | Move focus to the previous option. |
| `Home` | — | Move focus to the first option. |
| `End` | — | Move focus to the last option. |
| `Enter` | — | Select the focused option. |
| `Space` | — | Select the focused option. |
| any character key | — | Move focus to the next option whose label starts with that character. |
| `Alt` + `ArrowUp` | — | Move the selected item one position earlier. |
| `Alt` + `ArrowDown` | — | Move the selected item one position later. |
| `Escape` | — | Cancel the reorder and restore the original position. |

## Pairs

A **required** pairing holds this component's evidence state: its `at-manual` row
cannot read `pass` until every task above has passed on every required pairing.
Which ones are required follows the tier, from `requiredAtPairs()` in
`@dzup-ui/contracts` — Tier C requires 3 of 6.
An **optional** pairing is still worth running and is still recorded if you run
it; it simply does not gate qualification.

| id | Tier C | Pairing | What it exposes |
|---|---|---|---|
| `nvda-firefox` | **required** | NVDA + Firefox (Windows) | Browse/forms mode switching and the Gecko accessibility tree. |
| `nvda-chrome` | optional | NVDA + Chrome (Windows) | The same AT over Blink, where virtualized and composite widgets differ. |
| `jaws-chrome` | **required** | JAWS + Chrome (Windows) | JAWS heuristics over ARIA, which override author intent more often. |
| `voiceover-safari` | **required** | VoiceOver + Safari (macOS) | WebKit behaviour and rotor navigation. |
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
