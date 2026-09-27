---
"@dzup-ui/contracts": patch
"@dzup-ui/core": patch
"@dzup-ui/mcp": patch
"@dzup-ui/nuxt": patch
"@dzup-ui/testing": patch
"@dzup-ui/tokens": patch
---

**A pane and a column can now be resized with a single pointer and no dragging, and the packages say which browsers they are built for.**

**WCAG 2.2 SC 2.5.7 Dragging Movements was measured as not met on three
surfaces** — `DzResizable`, `DzSplitter` and `DzTable`'s column resize. All
three were keyboard-operable, and a keyboard path satisfies SC 2.1.1, not this
one: the criterion is about pointer input and asks for a single pointer without
dragging. `DzTable`'s handle was the worst of them, because `@click.stop` sat on
it and discarded the one plain press that might have been a non-drag path.

Each of the three now carries a **stepper pair** — one control that shrinks, one
that grows:

- **Nothing moves until you reach for it.** The pair is absolutely positioned
  over the gutter (or, for a column, over the header cell) and rests fully
  transparent, so it occupies no layout and paints nothing: every splitter and
  every table header looks exactly as it did, and no consuming layout shifts.
  It is revealed by hovering the gutter, by focusing the separator, or by one
  tap on a device that has no hover. The **DOM** does gain two buttons per
  handle, so a consumer's own DOM snapshot of one of these three components will
  need re-recording — that is the one thing this change asks of you.
- **It is the same step as the keyboard.** On a splitter, a press dispatches the
  very `keydown` the arrow keys already drive, so the step is `keyboardResizeBy`
  and `Shift` is still the full sweep. On a column, both paths call one
  function: 8 px, or 24 px with `Shift`.
- **There is no prop to switch it off.** A conformance claim a consumer can
  withdraw is not one worth publishing.
- Each control is **24 × 24 CSS px**, the SC 2.5.8 floor, measured in chromium,
  firefox and webkit.

New `data-part` names you can style and test against: `step-decrease` and
`step-increase` on the resizable, splitter and table anatomies. `DzTable`'s
column-resize handle also gains `data-part="separator"` — it has carried
`role="separator"` all along — plus `aria-valuenow` and `aria-valuemin`, so a
screen reader is told the width it is changing.

Four catalog keys, so nothing is hard-coded English:
`DzResizableHandle.shrinkPane`, `DzResizableHandle.growPane`,
`DzTableCell.narrowColumn`, `DzTableCell.widenColumn`.

**The packages now declare a supported-browser floor.** All six published
packages carry a `browserslist` key naming the same range. It is not a
preference: it is the lowest range the published CSS can be generated for, so a
declaration below it would be a promise the build could not keep. The
browser-support evidence page reads it out of the tree and prints, beside it,
the engines the matrix actually drives — a browser the floor admits and no lane
measures is named as supported by declaration and nothing more.

This is a `patch` under `packages/contracts/VERSIONING.md`: every part, key and
attribute above is **added**, none is removed, renamed or narrowed, and §3's
accessibility carve-out puts a corrected rendered accessibility attribute in the
patch position deliberately — we would rather ship the fix than hold it for a
range bump.
