---
"@dzup-ui/core": minor
---

**Every text input now reflects `readonly` in the DOM, `DzOtpInput` finally does something with `required`, `DzInputGroup` honours the three ARIA props it was ignoring, `DzInputMask` can hold the unmasked value, and `DzNumberInput` stops announcing `0` for a field the user cleared.**

The first slice of `TASK-FORM-OSS-02`, closing the `inputs/` gaps that
`docs/program-2026-08/form-controls-readiness-matrix.md` reports. Clause
references are to
`docs/program-2026-08/form-control-renderer-contract.md`.

**`data-readonly` on five controls** (C3). `DzTextarea`, `DzSearchInput`,
`DzPasswordInput`, `DzNumberInput` and `DzInputMask` all pass `readonly` to the
native element and none of them said so on the root, so no stylesheet and no
test could distinguish a read-only field from an editable one. `DzInput` has
always emitted it; the other five now match. Presence-only, absent when false,
per ADR-19 §4.

**`DzOtpInput` implements `required`** (C3). The prop was declared, defaulted to
`false`, and read nowhere — the type told a consumer it worked. It now resolves
against `DzFormField` the way the other states do and emits `data-required` plus
`aria-required`.

**`DzInputGroup` honours `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid`**
(C2). All three are inherited from `BaseAccessibilityProps` and all three were
dropped on the floor. While wiring them: binding `:aria-invalid="ariaInvalid"`
directly emits `aria-invalid="false"` on every group, because an unset prop in
that position renders as the string. It is `ariaInvalid || undefined`, and a
contract assertion holds the line.

**`DzInputMask` gains `modelMode`** (C1), defaulting to `'masked'` — today's
behaviour, byte for byte. `model-mode="unmasked"` puts the stripped value in
`v-model` instead, which is what a form document should persist: with the
default, changing a mask from `"(999) 999-9999"` to `"999-999-9999"` leaves
every stored value formatted for a mask that no longer exists.
`update:unmasked` has always emitted the raw value, but a consumer binding
`v-model` generically — a schema-driven renderer, for instance — has no way to
reach a one-way emit. The displayed value is derived, not stored, so the field
renders correctly on the server in both modes.

**`DzNumberInput.change` carries `number | undefined`** (C1). Clearing the field
sets the model to `undefined` and used to announce `0` — indistinguishable from
the user typing zero, and only the event was wrong. The event now carries what
the model holds.

**This one is a behaviour change**: a handler typed `(value: number) => void`
must widen to `number | undefined`, and code that treated the cleared field as
`0` will now see `undefined`. That is the point — `0` is a legitimate value and
nothing downstream could tell the two apart.

**Tests.** A new `packages/core/tests/ssr/form-controls-ssr.spec.ts` renders
every input *with a value* and checks the server output contains it — the audit
found 26 of 39 controls with no SSR spec at all, and "renders without throwing"
does not catch a field that hydrates into a different value. Contract specs
gained the clause assertions for each fix, and
`forms/aria-invalid-casting.spec.ts` pins the `??` resolution chain that every
control shares.
