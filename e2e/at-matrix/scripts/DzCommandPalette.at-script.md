<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzCommandPalette — AT test script

**Tier C · APG pattern `combobox` · source `packages/core/src/components/overlays/DzCommandPalette.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzCommandPalette.md`](../DzCommandPalette.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- The page shows one button, "Open command palette". The palette itself is a modal dialog that is ABSENT from the document until it is opened.
- Ten commands in four groups: File (New File, Open File, Save), Edit (Search, Find and Replace), View (Toggle Dark Mode, Zoom In, Zoom Out), Application (Open Settings, Keyboard Shortcuts).
- The global shortcut is switched off in this story on purpose — open it from the button.

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

**Open:** [`core-overlays-dzcommandpalette--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-overlays-dzcommandpalette--accessibility&viewMode=story)

**Do:**

1. Tab to "Open command palette" and activate it.

**The AT must:**

- [ ] A modal dialog is announced, named "Application command palette".
- [ ] Focus lands in the search field, and that field is announced as a combobox.
- [ ] The page behind the dialog is not reachable — Shift+Tab from the first control does not land on the page.

**Read from:** Dialog (Modal) — focus placement and containment; Combobox — role on the search field.

### Step 2 — task `open`

**Open:** [`core-overlays-dzcommandpalette--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-overlays-dzcommandpalette--accessibility&viewMode=story)

**Do:**

1. Observe the state of the search field as the dialog appears.

**The AT must:**

- [ ] The search field is announced as expanded, with its listbox popup already present.
- [ ] The first command, "New File", is the active option and is announced.
- [ ] The expanded state is announced once — not once by the dialog and again by the combobox.

**Read from:** Combobox — `aria-expanded="true"` with the popup present; Dialog — the dialog announcement precedes the widget announcement.

### Step 3 — task `navigate`

**Open:** [`core-overlays-dzcommandpalette--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-overlays-dzcommandpalette--accessibility&viewMode=story)

**Do:**

1. ArrowDown four times, then ArrowUp once.

**The AT must:**

- [ ] Each command is announced with its label and its position in the set.
- [ ] Crossing from one group into the next announces the new group name ("File", then "Edit").
- [ ] A command that carries a keyboard shortcut announces the shortcut as part of its description, not as a separate control.
- [ ] Nothing is skipped.

**Read from:** Combobox with a grouped listbox — `role="group"` with an accessible name is announced on entry; `aria-setsize`/`aria-posinset`.

### Step 4 — task `typeahead`

**Open:** [`core-overlays-dzcommandpalette--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-overlays-dzcommandpalette--accessibility&viewMode=story)

**Do:**

1. Type `zoom`.

**The AT must:**

- [ ] The list narrows to Zoom In and Zoom Out.
- [ ] The result count is announced politely, once.
- [ ] "Zoom In" becomes active and is announced as "1 of 2".

**Read from:** Combobox with list autocomplete.

### Step 5 — task `select`

**Open:** [`core-overlays-dzcommandpalette--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-overlays-dzcommandpalette--accessibility&viewMode=story)

**Do:**

1. Enter on the active command.

**The AT must:**

- [ ] The command runs exactly once.
- [ ] The dialog closes and the closure is announced.
- [ ] Focus returns to "Open command palette" and the AT announces it.

**Read from:** Combobox — Enter accepts; Dialog — focus returns to the element that opened it.

### Step 6 — task `dismiss`

**Open:** [`core-overlays-dzcommandpalette--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-overlays-dzcommandpalette--accessibility&viewMode=story)

**Do:**

1. Re-open the palette, then Escape. Re-open it once more and dismiss it with the close affordance if one exists.

**The AT must:**

- [ ] The dialog closes on Escape.
- [ ] Focus returns to "Open command palette" and the AT announces where it landed.
- [ ] No command ran.

**Read from:** Dialog (Modal) — Escape closes; focus returns to the invoking element.

### Step 7 — task `error`

**Open:** [`core-overlays-dzcommandpalette--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-overlays-dzcommandpalette--accessibility&viewMode=story)

**Not applicable.** The scaffold derives an `error` task from the `combobox` pattern. DzCommandPalette has no validation surface at all — no invalid state, no error message, no required semantics — so there is nothing to drive. Write `error task not applicable: no validation surface` in the run row `notes`. Do NOT record `fail`; a task with no surface is not a failed task.

### Step 8 — task `live`

**Open:** [`core-overlays-dzcommandpalette--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-overlays-dzcommandpalette--accessibility&viewMode=story)

**Do:**

1. With focus in the search field, type `qqqq`. Do not move focus.

**The AT must:**

- [ ] The empty-result copy is announced politely.
- [ ] It is announced exactly once.
- [ ] Focus stays in the search field.

**Read from:** ARIA live regions.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

None on the register for this component. Anything that fails here is new — file it.

