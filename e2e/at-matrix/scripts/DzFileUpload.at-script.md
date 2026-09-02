<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzFileUpload — AT test script

**Tier D · APG pattern `button` · source `packages/core/src/components/forms/DzFileUpload.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzFileUpload.md`](../DzFileUpload.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- This is the only Tier D component in the catalog: it reads files the user chooses, over both a picker and a drop target.
- Have three files ready before you start: a small PNG, a file over 2 MB, and a .txt file. The size and type steps need them.
- A native file picker is an OS dialog. Record what the AT does when it opens and when it closes; that is part of the run.

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
`reach`, `activate`, `non-drag`, `error`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-forms-dzfileupload--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzfileupload--accessibility&viewMode=story)

**Do:**

1. Tab until focus lands on the drop zone.

**The AT must:**

- [ ] It is announced as a button named "Document upload".
- [ ] The instruction text is announced as its description, not as separate page text.
- [ ] The underlying file input is NOT announced as a second, unlabelled control.

**Read from:** Button — role and name; and the ARIA rule that a visually hidden native input must not surface as an unnamed control.

### Step 2 — task `activate`

**Open:** [`core-forms-dzfileupload--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzfileupload--accessibility&viewMode=story)

**Do:**

1. Enter. Cancel the picker.
1. Space. Choose the small PNG.

**The AT must:**

- [ ] Both Enter and Space open the file picker, and each opens it exactly once.
- [ ] After the file is chosen, the file name and the new file count are announced politely.
- [ ] Focus returns to the drop zone (or to the new file entry) and the AT says where it landed.
- [ ] The announced file name is the visible label. It is not a raw path and not an unbounded string.

**Read from:** Button — Keyboard Interaction: both Enter and Space activate; ARIA live region for the resulting change.

### Step 3 — task `non-drag`

**Open:** [`core-forms-dzfileupload--multiple-files`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzfileupload--multiple-files&viewMode=story)

**Do:**

1. Add two files using the keyboard only.
1. Tab through the list of added files.
1. Activate the remove control on the first file.

**The AT must:**

- [ ] Every operation the drop target offers is reachable without a pointer drag: adding a file, and removing one.
- [ ] Each remove control is announced with the file it removes — not "Remove" alone repeated four times.
- [ ] Removing announces which file was removed and the new count.
- [ ] No step requires a drag, a path-based gesture, or a held pointer.

**Read from:** WCAG 2.5.7 Dragging Movements — every drag operation has a single-pointer, non-drag alternative; and Button — Keyboard Interaction.

### Step 4 — task `error`

**Open:** [`core-forms-dzfileupload--max-file-size`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzfileupload--max-file-size&viewMode=story)

**Do:**

1. Choose the file that is over the limit.
1. Then, on `core-forms-dzfileupload--accept-filter`, choose the .txt file.
1. Finally, on `core-forms-dzfileupload--invalid-state`, Tab onto the control and away, then back.

**The AT must:**

- [ ] Each rejection is announced when it happens, without the tester having to go looking for it.
- [ ] The rejection text is programmatically associated with the drop zone — re-focusing the control announces it again.
- [ ] The control is announced as invalid while the error stands.
- [ ] The rejected file is not silently added.

**Read from:** WCAG 3.3.1 Error Identification; `aria-invalid` + `aria-errormessage`; ARIA live region for the rejection itself.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

None on the register for this component. Anything that fails here is new — file it.

