<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzTour — AT test script

**Tier C · APG pattern `dialog` · source `packages/core/src/components/overlays/DzTour.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzTour.md`](../DzTour.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- A toolbar of three buttons is the tour target set. A button, "Start accessible tour", opens the tour.
- Three steps: "Create a project", "Invite teammates", "Tune your settings".
- Note which element you were on before you start the tour. The dismiss step depends on it.

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

The scaffold says this component owes 4 task(s):
`open`, `reach`, `dismiss`, `live`. There is exactly one step per task.

### Step 1 — task `open`

**Open:** [`core-overlays-dztour--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-overlays-dztour--accessibility&viewMode=story)

**Do:**

1. Tab to "Start accessible tour" and activate it.

**The AT must:**

- [ ] A modal dialog is announced.
- [ ] Its name is the step title, "Create a project", and its description is the step body, "Start here to spin up a new workspace for your team."
- [ ] Focus moves into the popover without a further keystroke.
- [ ] The page behind the dialog is not reachable.

**Read from:** Dialog (Modal) — `aria-modal="true"`, name from the title, description from the body, focus moved into the dialog.

### Step 2 — task `reach`

**Open:** [`core-overlays-dztour--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-overlays-dztour--accessibility&viewMode=story)

**Do:**

1. Tab through every control in the popover, and one Tab past the last one. Then Shift+Tab past the first.

**The AT must:**

- [ ] Each control is announced with its name and its role.
- [ ] Tab from the last control wraps to the first and never lands on the page behind.
- [ ] Shift+Tab from the first wraps to the last.
- [ ] Nothing outside the popover is reachable while it is open.

**Read from:** Dialog (Modal) — Tab and Shift+Tab cycle within the dialog.

### Step 3 — task `dismiss`

**Open:** [`core-overlays-dztour--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-overlays-dztour--accessibility&viewMode=story)

**Do:**

1. Escape.
1. Re-open the tour and dismiss it with the Skip control instead.

**The AT must:**

- [ ] The dialog closes both ways.
- [ ] Focus returns to "Start accessible tour" — the element that opened the tour — and the AT announces it.
- [ ] The tester can tell where they landed without looking. Focus on the document body is a FAIL for this step, not a pass.

**Read from:** Dialog (Modal) — "focus returns to the element that invoked the dialog"; WCAG 2.4.3 Focus Order.

### Step 4 — task `live`

**Open:** [`core-overlays-dztour--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-overlays-dztour--accessibility&viewMode=story)

**Do:**

1. Re-open the tour and advance to step 2, then step 3.

**The AT must:**

- [ ] "Step 2 of 3" is announced politely, exactly once.
- [ ] The new step title and body are announced.
- [ ] The step change does not produce a second, competing focus announcement.

**Read from:** ARIA live regions — a step change is a status, announced once.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

- **D7** — affects `dismiss`. `useFocusTrap.deactivate()` removes its keydown listener and nothing else — it never restores focus. Dismissing the tour by Escape, Skip or Finish is expected to leave focus on the document body instead of on "Start accessible tour". The dismiss step is expected to FAIL on every pair. This is a known open defect, not a new finding.

