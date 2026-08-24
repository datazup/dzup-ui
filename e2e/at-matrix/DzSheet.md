<!-- AUTO-GENERATED HEADER — do not edit. Written by `yarn generate:at-matrix`. -->

# DzSheet — manual AT task matrix

**Tier B · APG pattern `dialog` · source `packages/core/src/components/overlays/DzSheet.vue`**

Automated checks cover semantics, contrast and DOM relationships. They do not
cover whether somebody using a screen reader can tell what happened. These
tasks are the part a human has to do.

Record every run as a **new row** in the results table. Never edit a row that is
already there: the history is what distinguishes a new regression from a
known one.

## Tasks

| id | Do this | The AT must |
|---|---|---|
| `open` | Open the popup or panel from its trigger. | The expanded state is announced and the AT moves into the new content. |
| `reach` | Reach the component by the platform's own navigation (Tab, or swipe on touch). | Name, role and current state are announced together, and the name is the visible label. |
| `dismiss` | Dismiss with Escape, and again by activating the close affordance. | Focus returns to the trigger and the AT announces where it landed. |

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
