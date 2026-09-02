<!-- AUTO-GENERATED — do not edit. Written by `yarn generate:at-scripts` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# DzColorPicker — AT test script

**Tier C · APG pattern `custom` · source `packages/core/src/components/forms/DzColorPicker.vue`**

Read [`README.md`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [`../DzColorPicker.md`](../DzColorPicker.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

- Six brand presets are offered. APG has no colour-picker pattern; the sliders inside the panel follow the Slider pattern individually, and the panel as a whole follows the Dialog pattern.

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

The scaffold says this component owes 2 task(s):
`reach`, `activate`. There is exactly one step per task.

### Step 1 — task `reach`

**Open:** [`core-forms-dzcolorpicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcolorpicker--accessibility&viewMode=story)

**Do:**

1. Tab until focus lands on the colour trigger.

**The AT must:**

- [ ] It is announced as a button named "Brand color".
- [ ] Its current value is announced — a colour swatch with no announced value is a control whose state a screen-reader user cannot read.

**Read from:** The ARIA rule that every widget announces name, role and value; and Button — Keyboard Interaction.

### Step 2 — task `activate`

**Open:** [`core-forms-dzcolorpicker--accessibility`](http://127.0.0.1:6006/iframe.html?id=core-forms-dzcolorpicker--accessibility&viewMode=story)

**Do:**

1. Enter to open the panel. Then Escape, re-focus, and Space to open it again.
1. Tab through every control in the panel.
1. Escape.

**The AT must:**

- [ ] Enter and Space each open the panel, and each opens it exactly once.
- [ ] The panel is announced as a dialog or as a named group; it is not silent.
- [ ] The saturation surface is announced with the name "Color area" and with a readable value.
- [ ] The hex field is announced as a text field named "Hex color value".
- [ ] Each preset swatch announces which colour it is — not "button" alone.
- [ ] Escape closes the panel and focus returns to the trigger, which is re-announced with its new value.

**Read from:** Button — Keyboard Interaction (Enter and Space); Dialog — focus placement and return; Slider — name/value on each slider.


## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's `notes` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

None on the register for this component. Anything that fails here is new — file it.

