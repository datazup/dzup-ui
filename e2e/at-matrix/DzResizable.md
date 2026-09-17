<!-- AUTO-GENERATED HEADER — do not edit. Written by `yarn generate:at-matrix`. -->

# DzResizable — manual AT task matrix

**Tier B · APG pattern `window-splitter` · source `packages/core/src/components/layout/DzResizable.vue`**

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
| `non-drag` | Perform the drag interaction without a pointer drag. | A keyboard or single-pointer path exists, is discoverable, and narrates each step. |

## Declared keyboard contract

Drive **these** keys, not the pattern's from memory. They are declared in
`packages/core/src/components/layout/DzResizable.anatomy.ts` and are the same rows the component's documentation page publishes. A key that
does not do what this table says is a defect in the component **or** in the contract — record which,
in a note.

| Key | Where | Must |
|---|---|---|
| `ArrowRight` | — | Move the separator towards the inline end. |
| `ArrowLeft` | — | Move the separator towards the inline start. |
| `ArrowDown` | — | Move the separator down when the panes stack vertically. |
| `ArrowUp` | — | Move the separator up when the panes stack vertically. |
| `Home` | — | Move the separator to its minimum position. |
| `End` | — | Move the separator to its maximum position. |
| `Enter` | — | Collapse the pane, or restore it when already collapsed. |


## Pairs

| id | Pairing | What it exposes |
|---|---|---|
| `nvda-firefox` | NVDA + Firefox (Windows) | Browse/forms mode switching and the Gecko accessibility tree. |
| `nvda-chrome` | NVDA + Chrome (Windows) | The same AT over Blink, where virtualized and composite widgets differ. |
| `jaws-chrome` | JAWS + Chrome (Windows) | JAWS heuristics over ARIA, which override author intent more often. |
| `voiceover-safari` | VoiceOver + Safari (macOS) | WebKit behaviour and rotor navigation. |
| `voiceover-ios` | VoiceOver + Safari (iOS) | Touch exploration; a control reached by gesture, not by Tab. |
| `talkback-android` | TalkBack + Chrome (Android) | Touch exploration, gestures and drag alternatives. |

## How to record a run

Append one row per `{task, pair}` you actually drove. `result` is one of
`unrun`, `pass`, `fail`, `partial`, `blocked`. `unrun` means the AT or the
device was not available — it is a fact, not a placeholder, and it must not be
written as `fail`. `sourceCommit` is the repository HEAD you observed;
`validate:at-matrix` marks a row stale when the component has changed since.

<!-- results: append-only. The generator never rewrites below here. -->

## Results

| pair | result | versions | tester | date | sourceCommit | notes |
|---|---|---|---|---|---|---|
| nvda-firefox | unrun | - | - | - | - | not executed |
| nvda-chrome | unrun | - | - | - | - | not executed |
| jaws-chrome | unrun | - | - | - | - | not executed |
| voiceover-safari | unrun | - | - | - | - | not executed |
| voiceover-ios | unrun | - | - | - | - | not executed |
| talkback-android | unrun | - | - | - | - | not executed |
