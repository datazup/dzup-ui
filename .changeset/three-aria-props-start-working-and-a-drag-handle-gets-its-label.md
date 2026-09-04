---
"@dzup-ui/core": patch
---

**`DzStepper` now honours `ariaLabelledby` and `ariaDescribedby`, `DzInplace` now honours `ariaLabelledby`, and `DzOrderList`'s `dragHandleLabel` finally reaches the DOM.**

`TASK-N5-02`, the other half of the six C2 gaps in
`docs/program-2026-08/form-controls-readiness-matrix.md`. Where the accompanying
`minor` removes a prop that no element could carry, this ships the three that
could — plus one documented label that nothing rendered.

**`DzStepper.ariaLabelledby` and `DzStepper.ariaDescribedby`** (C2). The root is
`role="group"`, which supports both, and `aria-describedby` is global to every
role. The root already carried `aria-label`, so accepting one form of a name
while dropping the id-reference form of the same name *on the same element* was
incoherent rather than principled. A wizard can now be named by its own visible
heading instead of by a duplicated string.

The built-in `aria-label="Progress steps"` fallback yields when `ariaLabelledby`
is supplied. Two names on one element is not an error — `aria-labelledby` wins —
but shipping a fallback the browser is guaranteed to discard is noise in the DOM
and in every snapshot of it. An explicit `ariaLabel` is still honoured alongside
`ariaLabelledby`; only the default steps aside.

**`DzInplace.ariaLabelledby`** (C2). The display trigger is a real `<button>`
already carrying `aria-label` and `aria-describedby`. Same argument, same
element, one line.

**`DzOrderList.dragHandleLabel` renders.** It was documented as "accessible label
for each row's drag handle" and **no element carried it** — a gap this repository
stated openly rather than fixed when the i18n work went in. It now reaches the
DOM as the handle's `title`, and its default moved into the message catalog as
`DzOrderList.dragHandle`, so it is translatable like every other string. The
rendered default is byte-identical: `Drag to reorder`.

It is deliberately **not** an accessible name, and the prop's documentation now
says so. The handle stays `aria-hidden="true"`: it is a pointer-only affordance
whose function is already reachable from the keyboard through the Move controls
and the row's own space-to-grab, and naming it would fold "Drag to reorder" into
the accessible name of *every* row under `selectable`, where each row is
`role="option"` — a name-from-content role. Trading a dead prop for four polluted
row names is not an accessibility improvement. Correcting the prop's
documentation to describe a tooltip is the honest end of it.

**Why these are `patch` and the removals are `minor`.**
`packages/contracts/VERSIONING.md` §3: correcting a rendered accessibility
attribute ships as a patch even though it changes what the browser sees and can
break a consumer's DOM snapshot — we would rather change an attribute than keep
a known accessibility failure until a range bump. Nothing here narrows a type.
