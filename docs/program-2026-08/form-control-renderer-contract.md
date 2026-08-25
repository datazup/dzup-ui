# The renderer-facing control contract (Core)

> **What this is.** The single written contract that Pro's `DzFormRenderer`
> (Pro packet P6) may hold Core's form controls to. Nine clauses, `C1`–`C9`.
> Each clause says what a control must do, why the renderer needs it, and how
> the claim is checked.
>
> **What this is not.** It is not a description of what Core does today. The
> honest per-control answer is
> [`form-controls-readiness-matrix.md`](./form-controls-readiness-matrix.md),
> which is generated from source and lists every gap. Read the contract to know
> what to build; read the matrix to know what you can rely on.
>
> Part of [System Program 2026-08](./README.md), task `TASK-FORM-OSS-01`.
> Source: `workspace-docs/repos/ui/docs/architecture/dzup-form-system-2026-08-08/`
> documents 03 (`dzup-form-document-v1alpha1`), 04 (`runtime-components-and-extension-contracts`)
> and 06 (`security-and-remote-execution`).
> Written 2026-08-24 against `ui/dzup-ui` `main` @ `8d80bc3`.

---

## Why a contract at all

The renderer binds a JSON value to a Core control through a registry entry
(spec 04 §4). The registry names a component and a value codec; it does not name
a workaround. So every difference between two controls — one emits `''` on
clear and another emits `undefined`, one reads `aria-describedby` from the field
context and another ignores it, one calls its model `modelValue` and another
calls it `value` — becomes a branch in the renderer, and the renderer grows one
branch per control until it is the "manual validation architecture under new
names" that spec 01 was written to stop.

The clauses below are the seam. A control that satisfies all nine is
registry-addressable with a codec and nothing else.

## How to read a clause

Each clause has a **rule** (what a conforming control does), a **why** (what
breaks in the renderer when it does not), and a **check** (how the readiness
matrix decides the cell — `derived` when the generator reads it out of source,
`reviewed` when a person judged it and signed the row).

A clause never asks a control to know about JSON Schema, a form document, a
validator, or an operation. Everything above the control surface is Pro's.

---

## C1 — Value

**Rule.**

1. The primary value is bound to the **default model** (`v-model`, i.e.
   `defineModel<T>()` with no name). A named model — `v-model:value` — is not a
   substitute: it is a second, incompatible convention the registry cannot
   dispatch to generically. Secondary models (`v-model:open`,
   `v-model:expandedKeys`) are fine and are not the value.
2. The value is **JSON-serializable**. `File`, `Blob`, `Date`, `Map`, class
   instances, and functions are not values; a reference object that describes
   one is (see C1.6).
3. The control documents its **empty value** and emits exactly that value when
   the user clears it. Whether an empty value is written to the document or
   removes the property is the codec's decision, not the control's — but the
   control must be *consistent*, so the codec can be written once.
4. **Number** controls emit `number | undefined`, never `NaN` and never a
   numeric string. `undefined` is the empty value and means *absent*, which is
   what spec 04 asks for — "an empty input removes the property by default
   rather than producing `NaN`". A partially typed number (`"-"`, `"1e"`) is a
   control-internal display state, not a model value. Any `change`/`input`
   event the control emits alongside the model carries **the same value the
   model now holds** — a control that clears to `undefined` and announces `0`
   gives the renderer two different answers to the same question.
5. **Date and time** controls emit strings in these profiles, which are the
   RFC 3339 productions JSON Schema's `date`/`time`/`date-time` formats name:
   - date → `full-date`, `YYYY-MM-DD`
   - time → `partial-time`, `HH:MM` or `HH:MM:SS` — **a local wall-clock time
     with no offset.** This is deliberately *not* JSON Schema `format: time`,
     which requires an offset. A control cannot invent an offset it was never
     given, so the profile is named honestly here and the renderer's codec
     supplies the zone. Document 04's built-in renderer table has no `dz.time`
     row, so nothing downstream is broken by naming it; a future `dz.time` must
     read this clause first.
   - date-time → `date-time` with an explicit offset, only when the control was
     given a zone.
   A control that has no value emits the empty string, not `undefined` — the
   empty value must be typed the same as a present one so `toControl` is total.
6. **File** controls never place a `File` or `Blob` in the model. The model
   holds a reference:
   ```ts
   interface DzFileRef {
     id: string
     name: string
     size: number
     type: string
     status: 'pending' | 'uploaded' | 'failed'
     error?: string
   }
   ```
   The binary travels through an event to the host (C9), never through the
   value.
7. **Boolean** controls distinguish `false` from absent. `false` is a value; a
   control must not emit `undefined` where it means "unchecked".
8. **Multi-value** controls emit an array of the item type, and the empty
   array — not `undefined` — is the empty value.

**Why.** The document is persisted JSON (spec 03). Anything the control puts in
the model is either serialized or silently lost. A `File` in the model is lost
on reload and leaks a live handle into a builder preview; a `NaN` serializes to
`null` in a way the validator cannot explain to the user; a named model means
the registry entry needs a per-control binding table.

**Check.** `derived` for the model name, the declared model type, and the
presence of a documented empty value; `reviewed` for parse and clear behaviour.

---

## C2 — Identity

**Rule.** A control:

1. accepts an `id` prop;
2. when rendered inside `DzFormField`, consumes the injected identity **without
   any props being passed** — id, `aria-describedby`, invalid and required all
   come from the context;
3. when rendered standalone, accepts `ariaDescribedby` and `ariaInvalid` props
   and honours them;
4. resolves the two in this precedence: **own prop → field context →
   generated** — a prop always wins, and the generated id is stable across SSR
   and hydration.

`DzInput` is the reference implementation
(`packages/core/src/components/inputs/DzInput.vue:70-155`): `resolvedId`,
`resolvedDisabled`, `resolvedRequired`, `resolvedInvalid`,
`resolvedAriaDescribedby`. A control conforms to C2 when it computes those five
the same way.

**Why.** The renderer generates collision-free ids per form instance and per
array item (spec 04 §8) and wires label/description/error itself. If a control
ignores the context, the renderer must pass every id explicitly and know which
controls need which props — and if a control ignores the *props* too, there is
no way to wire it at all.

A prop that is declared and never read is worse than an absent one: the type
says the renderer can wire it, the DOM says otherwise, and nothing fails.

**Check.** `derived` — the generator reads which of the five resolutions exist
and which declared identity props are never referenced in the component.

---

## C3 — States

**Rule.** Five states, each with one spelling:

| State | Prop | DOM |
| --- | --- | --- |
| disabled | `disabled` | `data-disabled` present + native `disabled`/`aria-disabled` |
| readonly | `readonly` | `data-readonly` present + native `readonly`/`aria-readonly` |
| invalid | `invalid` / `error` | `data-invalid` present + `aria-invalid="true"` |
| loading | `loading` | `data-loading` present + `aria-busy="true"` |
| required | `required` | `data-required` present + `aria-required="true"` |

Each of the five is a **presence-only boolean attribute** — present as `""`,
absent when false, never `="false"`. This is not a new rule: it is ADR-19 §4's
list (`data-disabled · data-loading · data-invalid · data-readonly ·
data-required · …`), restated here only because it is the half of the styling
contract a renderer depends on.

`data-state` is a **different thing and this clause does not govern it.**
ADR-19 §4 makes it a *per-component enum declared in that component's anatomy*,
holding one lifecycle value at a time — `DzInput` declares
`['disabled','loading','readonly']`, `DzDisclosure` declares
`['open','closed']`, and both are correct. The global `DataState` union in
`@dzup-ui/contracts` is a named vocabulary of common values, not a closed list;
a union a shipped component already violates is not a contract. What C3 asks
about `data-state` is only that a component which declares an anatomy emits
values its own declaration names. A component with no anatomy yet is `unrun` on
that axis, not failing — the anatomy rollout is P3-02's ratchet and this clause
does not get to re-open it.

Every state a control declares must be reflected in the DOM and styled through
`Dz{Name}.tokens.ts` + `.variants.ts`. A state a control cannot support is
**not declared** — an accepted-and-ignored prop is a C3 failure, not a partial
pass, because the type tells the renderer to wire something the DOM will never
show.

**Why the booleans and not `data-state`.** The renderer sets these states from
schema and runtime binding (`readOnly`, `disabled` in the document; pending
validation; a loading data source), and they compose: a control can be loading
*and* invalid at once. A single-valued attribute cannot express two of them, so
the renderer reads the booleans and leaves the lifecycle enum to the component.

**Check.** `derived` — declared props, whether each is read, which boolean
attributes appear in the template, and whether the emitted `data-state` values
are in the component's own declared enum.

---

## C4 — Messages

**Rule.**

1. `aria-describedby` lists the description **before** the message, and both
   are merged with any consumer-supplied `ariaDescribedby` rather than replacing
   it.
2. An id is only referenced when the element it names is rendered. A
   describedby that points at nothing is a silent failure that no test and no
   screen reader reports.
3. A message that appears *after* first paint — an async or server validation
   error — is announced in a polite live region. A message present on first
   paint is not announced (it is read when the control is focused).
4. `role="alert"` is used only for a message that must interrupt; the standing
   field error is `aria-live="polite"`.

**Why.** Spec 04 §8 requires errors to be associated programmatically and async
validation to be announced. Order matters: a screen-reader user hears the
description as instruction and the message as correction, and the reverse order
reads as an error followed by an explanation of a field they have already left.

**Check.** `reviewed`, with the describedby merge and ordering `derived`.

---

## C5 — SSR

**Rule.** A control renders on the server with a provided value, produces the
same initial DOM on the client, and reads no browser global during `setup` or
render. `window`, `document`, `navigator`, `matchMedia` and `localStorage` are
permitted inside event handlers and `onMounted` only. Generated ids come from
`useId()` so they match across the boundary.

**Why.** Spec 04 §8 requires SSR paths without browser globals; a hydration
mismatch in a form control is a value that silently reverts.

**Check.** `derived` for global reads outside handlers and for whether an SSR
spec names the control; `reviewed` for hydration equality.

---

## C6 — RTL

**Rule.** Logical properties only, and the direction-sensitive behaviour —
caret movement, slider and knob increase direction, stepper progression, the
side a panel opens on — follows the resolved `dir`. The control declares its
RTL contract in `Dz{Name}.anatomy.ts` (`rtl.mirrors`, `rtl.keyboard`).

**Why.** Already Core's rule as of `TASK-OSS-P4-05` (ADR-19). The renderer adds
nothing to it, so this clause **delegates**: the cell in the readiness matrix
reads the RTL declaration and defers to `yarn validate:rtl` and
`packages/core/docs/rtl-matrix.md`. Restating the rule here would create a
second authority for the same fact.

**Check.** `derived` — delegated to the RTL matrix.

---

## C7 — Motion

**Rule.** Any transition or animation is disabled under
`prefers-reduced-motion: reduce`. A control with no animation is `n-a`, not a
pass.

**Why.** WCAG 2.3.3, and the renderer reveals and hides controls in response to
conditions — a form that animates every conditional field is a vestibular
hazard that the host never opted into.

**Check.** `derived` — animation utilities present without a `motion-reduce`
guard is a gap.

---

## C8 — Keyboard

**Rule.** The control implements the APG pattern assigned to it in
`packages/tooling/src/quality/component-tiers.ts` and recorded in
`packages/core/docs/quality-matrix.json`.

**Why.** The assignment, its `custom` justifications, and the gate that keeps it
honest already exist (`TASK-OSS-P5-01`, `yarn validate:quality-tiers`). This
clause **delegates** for the same reason C6 does.

**Check.** `derived` — delegated to the quality matrix.

---

## C9 — Async options

**Rule — future.** This clause describes a seam Core does **not** have today; it
is what `TASK-FORM-OSS-03` builds. It is written now so the matrix can say
`future` rather than `gap` and mean something different by it.

A control whose options can come from a remote source:

1. accepts `optionsState: 'idle' | 'loading' | 'error' | 'empty' | 'ready'` and
   `optionsError?: string`;
2. renders a token-styled loading row, empty row, and error row with a retry
   action, and announces the transition in a polite live region;
3. emits `load-options: { query: string; reason: 'open' | 'search' | 'more'; signal: AbortSignal }`
   and aborts the previous signal before emitting a new request;
4. keeps focus on the trigger or the search field while loading — never moves it
   to a spinner;
5. **never** performs the request itself. No URL, no credential, and no fetch
   lives in Core. The host owns cancellation, sequence fencing and caching
   (spec 04 §5, spec 06).

A control with only static options is `n-a`.

**Why.** Seven selection controls will otherwise each grow their own loading
convention, and Pro's registry will need seven adapters instead of one.

**Check.** `reviewed` until the seam exists; `derived` after.

---

## What a control owes, by kind

| Kind | Clauses that apply |
| --- | --- |
| Text-like input | C1–C8 |
| Boolean control | C1–C8 (C1.7 is the whole of C1) |
| Selection control | C1–C9 |
| Date / time control | C1–C8, C1.5 profiles |
| File control | C1–C9, C1.6 reference model |
| Compound part (`DzFormLabel`, …) | C2, C4, C5, C6 — it has no value |
| Wrapper (`DzInputGroup`, `DzFloatLabel`, `DzInplace`) | C2, C5, C6 — it must not *swallow* the field context of what it wraps |

## Open owner decisions this contract records

1. **The `time` profile has no offset** (C1.5). Named here as a local wall-clock
   string. If Pro's `dz.time` renderer needs an absolute instant, the zone comes
   from the codec, not the control — but somebody has to own that decision, and
   this document only makes it visible.
2. **Empty value, `''` versus absent** (C1.3). Core controls emit a typed empty
   (`''`, `[]`, `null`). Whether that empty removes the property from the
   document is spec 04's `emptyValue(context)` — a codec decision. This
   contract requires only consistency, and the matrix records which controls are
   inconsistent today.
3. **`DataState` is still declared as a closed union.** ADR-19 §4 decided it
   widens to `string`, with the per-component anatomy enum carrying the real
   constraint — and the ADR is `Proposed`, so
   `packages/contracts/src/data-attributes.types.ts:18-26` still holds the
   closed list while `DzInput.anatomy.ts` already declares values outside it.
   Nothing is broken by the disagreement today, because nothing enforces the
   union. Resolving it means either approving ADR-19 and widening the type, or
   rejecting §4 and renaming values in shipped DOM. That is an owner decision
   and this contract does not pre-empt it; C3 checks against the anatomy, which
   is what ADR-19 says is authoritative.

## Related

- [`form-controls-readiness-matrix.md`](./form-controls-readiness-matrix.md) — per-control status, generated.
- [`../contracts/README.md`](../contracts/README.md) — Contract Spec v1 docs.
- `packages/core/docs/quality-matrix.json` — tiers and APG patterns (C8).
- `packages/core/docs/rtl-matrix.md` — RTL declarations (C6).
