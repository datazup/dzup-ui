---
"@dzup-ui/core": minor
---

**`aria-describedby` names only the sub-parts a field actually renders, `DzFormMessage` stops interrupting the user, `DzFileUpload` and `DzColorPicker` get an id a label can point at, `DzFieldArray` gives each row ids of its own, and the last five controls take `v-model`.**

Slices three to five of `TASK-FORM-OSS-02`, which closes it: the readiness
matrix goes from 84 open gaps to 3, and all three are out of scope on purpose —
one is `TASK-FORM-OSS-03`'s work and two are owner decisions recorded below.

**A field described its control with ids that were not there** (C4).
`useFormField` pushed `descriptionId` into `aria-describedby` unconditionally,
so every control inside a `DzFormField` with no `DzFormDescription` — most of
them — announced itself described by an element that did not exist. It failed in
the quietest way available: assistive technology ignores a dangling id, nothing
warned, and the `parts.length > 0` guard at the end could never be false.

The field now names only what is rendered. It decides that by **walking its
slot before children render**, because registration alone cannot work on the
server: SSR renders children in order and never comes back, so a control
serialised before the description's `setup` ran would omit the id and the client
would add it — a hydration mismatch on an accessibility attribute, which is
worse than the dangling id it replaced. Registration is kept as the catch-all
for a description rendered by some intermediate component of the consumer's own.

**`DzFormMessage` carried `role="alert"` and `aria-live="polite"` on the same
node** (C4). `alert` implies assertive and wins, so every standing field error
interrupted whatever the user was being told. A message already on screen when
the control is focused is read as part of its description; only one that
*arrives* needs a live region. It is polite now, with no `role`.

**Two controls computed an id and rendered it nowhere** (C2). `DzFileUpload`
had no `id` in the DOM at all — a `DzFormLabel`'s `for` named an id that
appeared nowhere in the control, and clicking the label did nothing. It is on
the drop zone, not the hidden `<input>`, because the input is `aria-hidden` and
`tabindex="-1"`: a label pointing at it would name a node no user can reach.
`DzColorPicker` skipped the field context in the same way.

**`DzFieldArray` hands each row its own ids** (C2). Every row of a repeater
sits inside one `DzFormField`, so every control in it resolved to the *same*
id: a label for row 1 could activate row 3, and an `aria-describedby` could name
another item's error. The default slot now receives `fieldId`, `descriptionId`
and `messageId` per row, derived from an `id` prop, the field context, or a
generated base — which is spec 04 §8's "collision-free control/help/error IDs
per form instance and array item".

**The last five named models** (C1). `DzKnob`, `DzRating`, `DzTagsInput`,
`DzMention` and `DzInplace` join `DzCascader` and `DzTreeSelect` in taking both
`v-model` and `v-model:value`. Every Core control's value is now on the default
model, and a spec ratchets that so the next one cannot ship without it.

**States and SSR.** `data-required` on the six text inputs and on every date,
time, file, slider, knob, rating and colour control; `data-loading` and
`aria-busy` on `DzKnob` and `DzRating`, whose `loading` prop was declared,
defaulted and read nowhere. `packages/core/tests/ssr/form-controls-ssr.spec.ts`
now renders all 39 controls with a value: the audit found 26 with no SSR spec at
all, including all three pickers, where a server/client locale split is exactly
the defect `TASK-OSS-P4-03` found elsewhere.

**Two owner decisions, recorded rather than made.** `DzFloatLabel` inherits
`ariaLabel`, `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid` and honours
none; `DzInplace` inherits two of them. Binding them to a wrapper `<div>` would
be equally meaningless and merely harder to notice, so they are listed in
`packages/tooling/src/forms/assessments.ts` as `inertProps` with a reason each,
and their cells stay open. Removing them is a breaking type change.

**One SSR behaviour is Reka's, not ours.** `DzSlider` renders its track and
filled range on the server and defers the thumb — `display:none`, at 0%, with no
`aria-valuenow` until the collection registers on mount. Setting the attribute
from Core does not work, because the primitive binds it itself and wins over a
fallthrough. Asserted as-is so a future Reka that changes it is noticed.
