# TASK-N5-02 — the twelve un-honoured ARIA prop declarations, and `DzOrderList.dragHandleLabel`

> Handoff for [`release-and-toolchain-tasks.md` → TASK-N5-02](../release-and-toolchain-tasks.md).
> Conventions: [`README.md §3 <repo_conventions>`](../README.md#3-how-these-tasks-are-written).
>
> **Run date:** 2026-09-03 · **Repo:** `ui/dzup-ui` · **Branch:** `main`
> **HEAD:** `6f1f6539…` (`6f1f653 Merge remote-tracking branch 'origin/main'`), 0 ahead / 0 behind `origin/main`.
> **Worktree at run start:** **not clean — 16 entries, all `TASK-N5-01`'s.** Every one preserved; none reverted, stashed, cleaned or committed.
> **Toolchain:** Node `v24.14.1`, Yarn `4.16.0`, Vitest `3.2.6`, `vue-component-meta` `3.3.7`.
>
> **Evidence class: `locally qualified, against a dirty tree`.** Weaker than
> N5-01's, and the difference matters: every generated artifact regenerated here
> stamps `sourceCommit: 6f1f6533…` while actually describing uncommitted source.
> Not CI, not release, not production, and **not browser- or AT-qualified** —
> nothing here was run against a real assistive technology.
>
> **Blocked-by satisfied by reading, not by merging.** `packages/contracts/VERSIONING.md`
> exists in the working tree (uncommitted, N5-01's). This packet **applies** it and
> defines no policy of its own.
>
> **Nothing is committed, pushed, dispatched to CI, built, packed or published.
> Zero version bumps. Zero publishes. No `git commit`, `push`, `checkout --`,
> `restore`, `stash` or `clean`.**

---

## 1. Headline

**The FORM-OSS readiness gate's six `⛔ gap` cells are 0.** They were never six
props: they were six C2 *cells* covering **twelve declared identity props across
six components**, all inherited from `BaseAccessibilityProps` and none of them
read.

The implement-vs-remove split came out **3 implemented / 9 removed**, and it was
not decided per component. It was decided per prop against one question — *can
the element this component actually renders carry this attribute under ARIA 1.2?*
— and that question cut straight through two of the six recorded owner decisions.
`DzStepper` and `DzInplace` were parked as "remove all of them" and **two thirds
of `DzStepper`'s and half of `DzInplace`'s parked props turned out to be
honourable on the element those components already put `aria-label` on.**
Refusing `aria-labelledby` on an element you accept `aria-label` on is not a
principle; it is an inconsistency with a reason written under it.

Three things worth reading before the table:

- **`Omit<>` in an `extends` clause was invisible to the probe**, which would have
  made the only available removal mechanism unusable and kept six fixed cells red
  (F4). Teaching the probe to read it is a fidelity fix, pinned in both
  directions, and is the one gate edit in this packet.
- **Removing a prop does not silence it — it renders it.** Vue routes the
  undeclared binding into `$attrs` and every one of these components spreads
  `$attrs` onto its root. The old bug swallowed the value; the new behaviour puts
  it on a `<div>` with no role. That is why a type removal alone is not the fix
  (F5).
- **The gate now reads `0 gap` while a real, reviewed C2 concern about
  `DzInplace` stands**, invisible because C2 is source-decided and the `wrapper`
  kind owes nothing. `0 gap` is not `no known problem` (F8, `[!owner]` **D3**).

---

## 2. Discovery — control · prop · why un-honoured · can it be honoured · decision

Read from the gate's own output (`inertProps` in `packages/tooling/src/forms/assessments.ts`,
rendered into the matrix), then re-decided per prop against the element each
component renders. **"Reka support" is the brief's question and it is the wrong
question for five of the six controls** — only `DzTabs` is backed by a Reka
primitive at all. The column that decides is the element and its role.

| # | Control | Prop | Why un-honoured | Element it would land on | Can it be honoured? | Decision | Level |
|---|---|---|---|---|---|---|---|
| 1 | `DzFloatLabel` | `ariaLabel` | declared, never bound | wrapper `<div>` (+ a `<label>`) | **No** — a generic element is not labelable and computes no accessible name | **remove** | `minor` |
| 2 | `DzFloatLabel` | `ariaLabelledby` | declared, never bound | same | **No** — same | **remove** | `minor` |
| 3 | `DzFloatLabel` | `ariaDescribedby` | declared, never bound | same | **No** — generic role ignores it; and the wrapped control merges its *own* error id into `aria-describedby`, so writing it from outside clobbers that merge | **remove** | `minor` |
| 4 | `DzFloatLabel` | `ariaInvalid` | declared, never bound | same | **No** — not supported on a generic element | **remove** | `minor` |
| 5 | `DzInplace` | `ariaLabelledby` | declared, never bound | the display `<button>`, which **already carries `aria-label` and `aria-describedby`** | **Yes** | **implement** | `patch` |
| 6 | `DzInplace` | `ariaInvalid` | declared, never bound | same `<button>` | **No** — ARIA 1.2 does not list `button` among the roles supporting `aria-invalid`; validity belongs to the editor in `#edit`, which the wrapper cannot reach | **remove** | `minor` |
| 7 | `DzGrid` | `ariaInvalid` | declared, never bound | `<component :is="as">`, default `<div>`, no role | **No** | **remove** | `minor` |
| 8 | `DzStack` | `ariaInvalid` | declared, never bound | same | **No** | **remove** | `minor` |
| 9 | `DzStepper` | `ariaLabelledby` | declared, never bound | root `<div role="group">`, which **already carries `aria-label`** | **Yes** — `aria-labelledby` is supported on `group` | **implement** | `patch` |
| 10 | `DzStepper` | `ariaDescribedby` | declared, never bound | same | **Yes** — `aria-describedby` is global to every role | **implement** | `patch` |
| 11 | `DzStepper` | `ariaInvalid` | declared, never bound | same | **No** — not supported on `group` | **remove** | `minor` |
| 12 | `DzTabs` | `ariaInvalid` | declared, never forwarded to `TabsRoot` | Reka `TabsRoot` (a container, not a widget) | **No** — a tab set has no validity; `DzTabTrigger` is where an invalid-panel affordance goes | **remove** | `minor` |
| 13 | `DzOrderList` | `dragHandleLabel` | documented as "accessible label", nothing rendered it; the handle is `aria-hidden="true"` | the handle `<span>` | **Partly** — see F6 | **implement as `title`, correct the documentation** | `patch` |

The level column is not a second judgement. It falls out of
`VERSIONING.md` §3 mechanically: **removal is a type removal → `minor`;
implementation corrects a rendered ARIA attribute → `patch`.**

---

## 3. Findings

### N5-02-F1 — the six "gap cells" were twelve props, and three of them were honourable

The brief and the matrix summary both say *six*. Six is the count of **C2 cells**,
one per control; the cells carry between one and four props each. The real unit of
work is twelve, and the three that could be honoured were all parked for removal
by the recorded owner decision.

The common shape of the two mistakes:

```
DzStepper.vue  :aria-label="ariaLabel ?? 'Progress steps'"     ← accepted
               (no aria-labelledby, no aria-describedby)       ← parked as "remove"
DzInplace.vue  :aria-label="ariaLabel"                          ← accepted
               :aria-describedby="ariaDescribedby"              ← accepted
               (no aria-labelledby)                             ← parked as "remove"
```

`aria-label` and `aria-labelledby` are the same promise in two spellings. A
component that takes one and refuses the other on the *same element* has an
oversight, not a policy — and the parked reasons say so when read back:
*"the steps name themselves; DzStepperItem carries the title"* is an argument
about naming a **step**, and `ariaLabelledby` on the root names the **stepper**.
For `DzTabs`, which does bind all three on `TabsRoot`, the same reasoning already
produced the right answer; `DzStepper` is `DzTabs` with two lines missing.

**Consequence for the decision record:** the `inertProps` register was not merely
parked, it was **partly wrong**. Three of its twelve entries described a
limitation that did not exist.

### N5-02-F2 — `ariaInvalid` is the whole of the removal set, and its home is the wrong base interface

All six controls needed exactly `ariaInvalid` removed; `DzFloatLabel` needed three
more. `ariaInvalid` is a **validity** attribute living in
`BaseAccessibilityProps` — the labelling base — rather than in
`BaseValidationProps` beside `invalid`, `error` and `required`:

```ts
// packages/contracts/src/props.types.ts
export interface BaseAccessibilityProps {
  id?: string
  ariaLabel?: string
  ariaLabelledby?: string
  ariaDescribedby?: string
  ariaInvalid?: boolean | 'grammar' | 'spelling'   // ← the odd one out
}
```

Every component that wants a name and a description therefore also inherits a
validity claim it usually cannot keep. Six controls tripped over it; nothing
here proves the other 138 public components do not.

**Not fixed, deliberately.** Moving `ariaInvalid` from `BaseAccessibilityProps`
to `BaseValidationProps` is a `minor` on `@dzup-ui/contracts` that removes the
prop from **every** component extending `BaseInteractiveProps` (which includes
behaviour + appearance + accessibility but *not* validation) — a blast radius
several times this packet's, on a package with `zero runtime deps` and every
other package downstream of it. Recorded as `[!owner]` **D1**.

### N5-02-F3 — `Omit<Base, 'k'>` is the removal mechanism, because the props are inherited

None of the twelve props is declared by the component. Deleting one means
narrowing the inherited base at the point of use:

```ts
export interface DzGridProps extends Omit<BaseAccessibilityProps, 'ariaInvalid'> {
```

Three mechanisms were considered:

| Option | Cost | Verdict |
|---|---|---|
| `Omit<Base, …>` at each use | one probe fidelity fix (F4) | **chosen** — the removal is legible at the point of use, and the diff says exactly which prop went |
| Stop extending the base; re-declare the four kept props inline | ~20 lines of duplicated JSDoc across six files, drifting from `contracts` | rejected |
| Add `BaseLabellingProps` to `contracts` and have five controls extend it | a new public export, manifest/dts/llms churn, and *still* a probe change | rejected — larger blast radius for the same outcome |

`Omit<>` already had precedent in the repository (`DzToast.types.ts`) and Vue
3.5's `defineProps` macro resolves it; `vue-tsc` and `vue-component-meta` both
agree (component-meta went `1734 → 1725` props, exactly `−9`).

### N5-02-F4 — the probe could not see an `Omit`, which would have kept six fixed cells red — **the one gate edit in this packet**

`packages/tooling/src/forms/probe.ts` resolves an inherited base **by name**:

```ts
if (/BaseAccessibilityProps/.test(extendsClause))
  add(IDENTITY_PROPS)
```

`extends Omit<BaseAccessibilityProps, 'ariaInvalid'>` matches that regex. So the
probe would have contributed `ariaInvalid` to `declared`, found it unread, and
reported a **gap for a prop the source no longer declares** — a false positive
whose only workaround would have been to abandon `Omit`.

Fixed by `omittedKeys()`, deliberately narrow: it reads string literals out of the
second type argument and nothing else. No `keyof`, no aliased unions, no `Pick`.
A clause it cannot read contributes nothing, which restores the old behaviour —
the prop stays reported and the cell stays red.

> **The probe is allowed to miss a removal; it is not allowed to invent one.**

**This is a gate edit and it is named as one.** It is not "editing a gate to make
a cell disappear": it makes the probe read the source correctly, and it is pinned
in **both** directions by three new tests in `form-readiness.spec.ts` — the
omitted key is gone from `DzGrid`, the four keys that were *not* omitted survive,
and `DzInput` (which omits nothing) still declares all five. A probe that returned
an empty set would pass the first assertion and be completely broken; the second
is what catches that.

### N5-02-F5 — removal converts a silent swallow into a rendered attribute

The consequence that makes a type removal insufficient on its own. Before:
`<DzGrid :aria-invalid="hasError">` bound a declared prop that nothing read — the
value vanished. After: it is no longer a prop, so Vue routes it into `$attrs`, and
every one of these six components ends its root tag with
`v-bind="{ ...$attrs, class: undefined }"`. The attribute **renders**, on an
element with no role to carry it.

This is asserted rather than described (`packages/core/tests/aria-prop-removals.spec.ts`),
including the sharpest case: a consumer's `aria-describedby` passed to
`DzFloatLabel` now lands on the wrapper `<div>` and **still** not on the control —

```
expect(wrapper.attributes('aria-describedby')).toBe('hint')
expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()
```

— which is the same wrong answer as before, made visible. Stripping the
consumer's attribute instead would be surprising and un-Vue; the answer is the
dev warning, and the assertion exists so nobody later "fixes" the fall-through by
silently deleting it.

### N5-02-F6 — `dragHandleLabel` cannot be an accessible name without polluting every row's accessible name

The prop is documented as *"Accessible label for each row's drag handle"*. The
handle is `<span aria-hidden="true">` — a pointer-only affordance whose function
is duplicated by the Move controls and by the row's own space-to-grab. Giving it
a real accessible name means removing `aria-hidden` and adding `role="img"` +
`aria-label`.

That is a **net accessibility regression**, and the reason is mechanical. Under
`selectable`, each row is `role="option"` — a *name-from-content* role. The
accname algorithm walks descendants and uses a descendant's `aria-label`, so
every row would be announced *"Drag to reorder, Alpha"*. There is no ARIA
mechanism for "visible to AT but excluded from the parent's name computation";
`aria-hidden` is the only lever and it is all-or-nothing.

Three options, one chosen:

| Option | Outcome | Verdict |
|---|---|---|
| `role="img"` + `aria-label` on the handle | four rows named *"Drag to reorder, …"* | rejected — trades a dead prop for four polluted names |
| Same, but only when `!selectable` | correct in one mode, conditional a11y semantics keyed on an unrelated prop | rejected — this is the class of cleverness that becomes next year's bug |
| **`title` on the handle, `aria-hidden` retained** | the string reaches the DOM on the element the prop names, serves the pointer users the handle exists for, changes no accessible name | **chosen** |

The prop's documentation is corrected to say `title` rather than "accessible
label", and the default moved into the message catalog
(`DzOrderList.dragHandle: 'Drag to reorder'`), byte-identical to the literal it
replaced. **Correcting the doc is not weaseling out of the promise** — the promise
was never kept, and the honest options are "keep it and describe it accurately" or
"remove it". The second is a `minor` for a prop nobody could have been relying on
for anything. Recorded as `[!owner]` **D2** in case an owner prefers the loud
version.

**Side effect worth naming:** this deleted the repository's *only*
`hardcoded-string-ok` exemption (1 → 0). That exemption's six-line justification
is quoted in `hardcoded-strings.ts`'s own JSDoc as the reason the marker may sit
anywhere in a comment block; the JSDoc is updated to say the exemption closed and
why, and `hardcoded-strings.spec.ts` still exercises the multi-line rule against a
synthetic fixture of the same shape.

### N5-02-F7 — the dev warning had to be written, not reused, and this is the second time the boundary has forced that

`VERSIONING.md` §3 requires a dev-mode runtime warning on every removal. N5-01 §9.5
already flagged that `warnDeprecated` lives in `@dzup-ui/compat`, which stable
Core may never import.

Checked before writing, per the standing warning about second implementations:

```
grep -rn "warnOnce|devWarn|import.meta.env?.DEV" packages/core/src
→ 7 hits, all inline `if (import.meta.env?.DEV) console.warn(...)` in components.
  No helper. No warn-once set. Nothing to reuse.
```

So `packages/core/src/utilities/warnRemovedProp.ts` is new, and it is **not a copy
of `warnDeprecated`** — it answers a different question. `warnDeprecated(old, new,
pkg)` names a replacement *component*; `warnRemovedProps(component, attrs, removed)`
names a removed *prop on a component that still exists*, and has to look the value
up in `$attrs`, because a prop that is no longer declared does not arrive as a
prop. It checks **both** spellings — `aria-invalid` (what a template writes) and
`ariaInvalid` (what a consumer migrating from the declared prop has already
written); warning on only one would leave exactly the population this exists for
in silence.

Internal only: not exported from `packages/core/src/index.ts` or from
`utilities/index.ts` (which is manifest-generated, ADR-01), so it adds no public
API and no ownership-manifest entry.

**The boundary decision itself is unresolved and is not mine to take.** Two
warn-once utilities now exist in two packages because `core` may not import
`compat`. That is the correct outcome under the current rule and a bad outcome in
absolute terms. `[!owner]` **D4**.

### N5-02-F8 — the matrix now reads `0 gap` while a reviewed C2 concern about `DzInplace` stands `[inherited]`

`packages/tooling/src/forms/assessments.ts` has carried this since the audit and
still does:

```ts
DzInplace: {
  kind: 'wrapper',
  reviewed: {
    C2: { verdict: 'gap',
          note: 'does not consume the field context, so an inplace editor inside a DzFormField is unlabelled',
          evidence: 'probe: consumesFieldContext false' },
```

It never reaches the table. C2 is on the `HARD` list, where source outranks
review unconditionally, and `deriveC2` requires nothing of a `wrapper`. So the
reviewed gap was invisible *before* this packet too — it was masked by a different
derived gap, and is now masked by a derived pass.

**This is not a regression I introduced, and I did not delete the entry.** It is
recorded here because "C2 identity: 44 pass, 0 gap" is now a headline number, and
a reader is entitled to know that one known C2 defect is structurally excluded
from it. `[!owner]` **D3**.

### N5-02-F9 — `@dzup-ui/codemods` work has no delivery path, exactly as N5-01 D2 predicted `[inherited]`

The removals ship a real codemod: a new `removeTemplateAttrs` util handling all
four Vue binding forms, nine `REMOVED_ARIA_PROPS` entries, JSX attribute removal,
and nine tests including idempotency and the negative case (the three
*implemented* props must survive the transform).

It cannot reach a consumer. `@dzup-ui/codemods` is public and publishable but sits
on the changesets `ignore` list, and a changeset naming an ignored package
alongside a published one is refused outright. So the `minor` changeset
**describes** the codemod in its body and is forbidden from naming the package in
its frontmatter — the identical failure `.changeset/pro-package-is-named-dzup-ui-pro-pro.md`
already demonstrates and N5-01 **F6** measured. The changeset says so in plain
text and gives a hand-migration table instead. **The codemod is written, tested,
and undeliverable.**

### N5-02-F10 — `VERSIONING.md` §3 and §4 disagree about whether an inert prop gets a deprecation window `[!owner]`

§3 removes an un-honoured prop outright: type removed, warning, codemod,
`minor` changeset. §4 says a deprecated API keeps working for **at least one full
`0.x` minor series**, and N5-01 §9.7 raises the same point.

Read together, §3's four artifacts are deprecation-*shaped* (there is a runtime
warning) but §3 grants no window. My reading, and what shipped: §4 governs "a
deprecated API", and these were never deprecated — they were inert, and there is
nothing to keep working, because they never worked. Announcing a window for a
prop that does nothing would only delay the type fix by a release while the
warning it would ship is identical to the one shipping now.

Recorded rather than assumed, because it is a policy reading and this packet may
not define policy. `[!owner]` **D5**.

### N5-02-F11 — `yarn test` is red in two places, and neither is mine `[inherited]`

`yarn test`: **2 failed / 499 passed** files, **2 failed / 9152 passed** tests.

| Failing spec | Why | Attribution |
|---|---|---|
| `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts` | six `var(--dz-*, #hex)` fallbacks in `apps/landing` disagree with the token values | not mine |
| `packages/tooling/src/validators/story-dod-tiers.spec.ts` → `countOpen > subtracts a waiver` | `summary.items.find(i => i.required)!` returns `undefined` — there are no required items, so the non-null assertion throws | not mine |

**How non-attribution is established, rather than asserted.** Both specs and
*every input they read* are byte-identical to `HEAD` in this working tree:
`git status` shows no modification under `apps/landing/`, no story file, no
`quality-matrix.json`, and neither spec file nor `story-dod-triage.ts` is touched.
A spec running on unmodified inputs produces `HEAD`'s result. These are `HEAD`'s
failures.

The second is the same species as the fixture this packet had to retire (§4.4): a
test written against an example that later expired. Its sibling assertion
(`total === summary.requiredTotal`, i.e. `0 === 0`) passes, which is what pins
`requiredTotal` at zero. Note that `validate:story-dod-tiers` — the *gate* — passes.

**Not fixed.** Both are other lanes' artifacts and outside this packet's scope.

---

## 4. What shipped

### 4.1 The nine removals

`extends BaseAccessibilityProps` → `extends Omit<BaseAccessibilityProps, …>` in six
`.types.ts` files, each with the ARIA reason and the `VERSIONING.md` §3 citation in
its JSDoc, plus a `warnRemovedProps(...)` call in each `.vue` carrying the
consumer-facing guidance.

### 4.2 The three implementations

```diff
  DzStepper.vue
- :aria-label="ariaLabel ?? 'Progress steps'"
+ :aria-label="ariaLabel ?? (ariaLabelledby ? undefined : 'Progress steps')"
+ :aria-labelledby="ariaLabelledby"
+ :aria-describedby="ariaDescribedby"

  DzInplace.vue (the display trigger)
+ :aria-labelledby="ariaLabelledby"
```

The `aria-label` default **yields** to `ariaLabelledby`. Two names on one element
is not an error — accname prefers `aria-labelledby` — but shipping a fallback the
browser is guaranteed to discard is noise in the DOM and in every snapshot of it.
An **explicit** `ariaLabel` still survives alongside `ariaLabelledby`; only the
default steps aside. This is the one place the removals/implementations change
rendered output for an existing binding, and it is a `patch` under §3's first
half, which says so in as many words.

### 4.3 `dragHandleLabel`

`title` on the handle; default `'Drag to reorder'` → `undefined` resolved through
`dzMessages.value.dragHandle`; new catalog key `DzOrderList.dragHandle` (both the
`DzMessageCatalog` augmentation and the English catalog); prop JSDoc corrected;
the `hardcoded-string-ok` exemption deleted.

### 4.4 The specs

| File | Tests | What it holds |
|---|---|---|
| `packages/core/tests/aria-prop-removals.spec.ts` | 14 (new) | all nine removals as a **table**, each asserting the dev warning fires; the fall-through renders (F5); `DzOrderList` — which kept all four identity props — is unaffected |
| `packages/core/src/utilities/warnRemovedProp.spec.ts` | 7 (new) | kebab **and** camel spellings, once-per-`component.prop`, silence when nothing was passed, and that the message names the fall-through |
| `DzStepper.spec.ts` | +5 | both new attributes land on the group root; the default `aria-label` yields; an explicit one does not; nothing changes when neither is passed |
| `DzInplace.spec.ts` | +3 | `aria-labelledby` on the trigger, beside the two it already carried |
| `DzOrderList.spec.ts` | +5 | `title` on all four handles, an explicit override, `aria-hidden` retained, **and that the label is not folded into a `role="option"` row's name** (F6, asserted rather than argued) |
| `rename-props.spec.ts` | +8 | every binding form stripped, JSX spelling stripped, idempotent, and the three *implemented* props survive |
| `form-readiness.spec.ts` | +5, −1 | see below |

`packages/core/tests/aria-prop-removals.spec.ts` is deliberately **not** in
`tests/a11y/`: `probe.ts` scans that directory to decide the matrix's `specs a/…`
column, so a file dropped there would move a matrix cell as a side effect of
testing something else. A gate should not be nudgeable by where a spec file is put.

**The fixture that expired.** `form-readiness.spec.ts` carried:

```ts
// DzFloatLabel inherits four ARIA props from BaseAccessibilityProps and
// honours none. … this stays a live fixture until an owner removes them.
expect(unread).toContain('ariaDescribedby')
```

Its own author wrote the expiry date into it, and this packet is that date. It is
replaced by the rule it was standing in for, per the file's own doctrine that *"a
rule is the thing to assert; an example is a fixture with an expiry date"*:

```ts
it('leaves no control declaring an identity prop it never reads', () => {
  const offenders = build().rows.flatMap(row =>
    row.probe.declaredUnread.filter(u => /^(?:id|aria)/.test(u.prop))
      .map(u => `${row.component}.${u.prop}`))
  expect(offenders).toEqual([])
})
```

That is the entire content of the C2 gap column, now failing a unit test rather
than only a generated table.

### 4.5 The codemod (undeliverable — F9)

`removeTemplateAttrs` + `TemplateAttrRemoveRule` in
`packages/codemods/src/utils/vue-template.ts`; `REMOVED_ARIA_PROPS` (nine entries)
and `JSX_PROP_REMOVALS` in `rename-props.ts`. Removal runs **after** the renames,
because a removal is unconditional and would otherwise delete an attribute a
rename was about to rewrite.

### 4.6 The `inertProps` register is empty, and the gate required that

Leaving the six entries was not an option: `build()` raises a structural problem
for any `inertProps` key the probe no longer reports as unread —

> *"lists ariaInvalid as inert, but source now reads it — delete the entry rather
> than leaving a parked decision that has been made"*

— so the gate itself demands the register be emptied when the decision lands. The
`inertProps` field stays on the interface, with a note saying the register is empty
as of this packet and why the mechanism is kept.

---

## 5. Before / after

### The gate

```
$ yarn validate:form-readiness            # before, on the tree as inherited
form-readiness: OK — 44 controls, 245 pass, 6 gap, 5 future, 47 unrun, 93 n-a

$ yarn validate:form-readiness            # after
form-readiness: OK — 44 controls, 251 pass, 0 gap, 5 future, 47 unrun, 93 n-a
```

| | before | after |
|---|---:|---:|
| ✅ pass | 245 | **251** |
| ⛔ gap | **6** | **0** |
| 🕓 future | 5 | 5 |
| ◻ unrun | 47 | 47 |
| – n-a | 93 | 93 |

**C2 identity: 38 pass / 6 gap → 44 pass / 0 gap.** Every other clause row is
unchanged, and the matrix diff touches exactly the six rows plus the two summary
tables and the "compound & advanced" slice heading (`2 gaps → 0 gaps`). **No cell
became `n-a`** — the brief allowed `n/a-with-record` for a removal and it was not
needed: with the prop gone, `deriveC2` finds nothing unread and the cell is an
honest `pass`.

The five 🕓 `future` cells (C9, `TASK-FORM-OSS-03`) and the 47 ◻ `unrun` cells are
untouched. **`0 gap` is not `0 problems`** — see F8.

### The artifacts

| Ratchet / count | before | after | Cause |
|---|---:|---:|---|
| `form-readiness` gap cells | 6 | **0** | this packet |
| `form-readiness` pass cells | 245 | **251** | this packet |
| `component-meta` props | 1734 | **1725** | −9, exactly the removals |
| `component-meta` propsWithDescription | 1671 | 1662 | same nine |
| `component-meta` propsWithoutDescription **(ratchet)** | 63 | **63** | held |
| `component-meta` propsWithDeclaredDefault | 727 | 726 | `dragHandleLabel` default → `undefined` |
| `hardcoded-string-ok` exemptions in `core/src` | 1 | **0** | F6 |
| `llms` ratchets (4) | — | unchanged | regenerated, no ratchet moved |
| pending changesets | 16 | 18 | +1 `minor`, +1 `patch` |
| `changelogFormatCollisionCeiling` | 1 | **1** | untouched |

No ratchet loosened. No ceiling raised.

---

## 6. Validation ladder

Narrowest first, then widened. Every command's exit code is the command's own —
none read through a pipe, none wrapped in an `echo $?`.

| # | Command | Exit | Result |
|---|---|---:|---|
| 1 | `vitest run` × 5 touched/new component specs | 0 | 52 passed |
| 2 | `vitest run rename-props.spec.ts` | 0 | 20 passed |
| 3 | `vitest run form-readiness.spec.ts` | 0 | 19 passed |
| 4 | `vue-tsc --noEmit -p packages/core/tsconfig.json` | 0 | clean |
| 5 | `eslint packages/ apps/ --max-warnings 0` | 0 | clean (after fixing 6 of my own: 3 trailing blank lines, 3 lowercase-title) |
| 6 | `yarn validate:form-readiness` | 0 | **0 gap** |
| 7 | `yarn validate:component-meta` | 1 → regenerate → 0 | legitimately stale: nine props left the surface |
| 8 | `yarn validate:docs-pages` | 1 → regenerate → 0 | 7 component pages + nav + seeds, all mine |
| 9 | `yarn validate:llms` | 1 → regenerate → 0 | `llms-full.txt`, mine |
| 10 | `yarn validate:release-policy` | 0 | 18 pending, 0 major, 0 mixed |
| 11 | **`yarn validate:all`** | **1 at link 15** | see below |
| 12 | links 16–37 individually | 1 at 16, **0 for 17–37** | see below |
| 13 | `yarn test` (full suite) | 1 | 2 failed / 499 passed files — **both inherited (F11)** |

### `yarn validate:all`, unpacked — 37 links

`yarn validate:all` is `&&`-chained and stops at the first failure, so it can only
ever prove the links before the break. It reached and failed at **link 15**:

```
✓ 1 typecheck · 2 lint · 3 boundaries · 4 interaction-contract · 5 contract-parity
✓ 6 hardcoded-strings · 7 tv-slots · 8 anatomy-parts · 9 rtl
✓ 10 form-readiness — 44 controls, 251 pass, 0 gap, 5 future, 47 unrun, 93 n-a
✓ 11 quality-tiers · 12 story-status · 13 story-dod · 14 story-dod-tiers
✗ 15 at-matrix — [index] e2e/at-matrix/index.json disagrees with the markdown files
                                                                          EXIT=1
```

Links 16–37 were then run individually, because `&&` had never reached them:

```
✗ 16 capability-matrix — [freshness] packages/core/docs/capability-matrix.json is stale
✓ 17 visual-baselines  ✓ 18 tokens        ✓ 19 tokens:dtcg   ✓ 20 exports
✓ 21 ownership         ✓ 22 mcp           ✓ 23 component-meta ✓ 24 llms
✓ 25 docs-pages        ✓ 26 playground-parity ✓ 27 package-names ✓ 28 doc-snippets
✓ 29 engines           ✓ 30 adr-references ✓ 31 readme-facts  ✓ 32 externals
✓ 33 dts               ✓ 34 changelog     ✓ 35 release-policy ✓ 36 peers
✓ 37 licenses
```

### Separated per the conventions

**Inherited failures — 2, unchanged, untouched:**

- **Link 15 `validate:at-matrix`** and **link 16 `validate:capability-matrix`**:
  generated-evidence staleness from commit `e0d1707`, root-caused by N5-01 **F12**
  to `componentCommit = lastCommitFor(source)` inside a byte comparison — git
  provenance in an equality check, which can never be green in a committed state.
  Filed as N5-01 **D6**. **I did not regenerate either artifact.** Regenerating
  another lane's evidence to turn a red link green is precisely the move the lane
  rules forbid, and it would have been undone by the next commit anyway.

- **`yarn test`**: 2 failing specs, both proven to be `HEAD`'s by byte-identical
  inputs (F11).

**Failures I caused: none surviving.** Three gates went red *because of* my change
and were closed by regenerating the artifact my change made stale — `component-meta`
(−9 props), `docs-pages` (7 component pages + nav + playground seeds), and `llms`.
Each is the artifact whose *own source* I edited, regenerated with its own
generator, and each returned to green. That is the opposite of the inherited case:
regenerating my own artifact is the fix; regenerating someone else's would be
concealment.

**Not run, and therefore not claimed:** `yarn build` / `validate:bundle` /
`validate:tree-shake` (packaging is not authorized); Playwright e2e; any real
assistive technology. `packages/core/dist/` still declares the removed props —
it is a build output, **untracked in git** (`git ls-files packages/core/dist` →
0 files), rebuilt at publish time. Nothing to commit and nothing stale in the
repository, but worth knowing that the type removal is only real for a consumer
**after a build**.

---

## 7. `[!owner]` decisions

| # | Decision | Evidence | Priority |
|---|---|---|---|
| **D1** | **Should `ariaInvalid` move from `BaseAccessibilityProps` to `BaseValidationProps`?** It is a validity attribute in the labelling base, so every component wanting a name inherits a validity claim it usually cannot keep — the root cause of all six cells. Not fixed here: a `minor` on `@dzup-ui/contracts` that removes the prop from every `BaseInteractiveProps` component. | F2 | 🟠 |
| **D2** | **Is `title` the right answer for `dragHandleLabel`, or should the prop be removed as a `minor` instead?** The chosen fix renders the string and corrects the documentation from "accessible label" to "tooltip"; a real accessible name is measurably worse (it pollutes every `role="option"` row name). The loud alternative is removing the prop outright. | F6 | 🟠 |
| **D3** | **`DzInplace`'s reviewed C2 gap is structurally invisible.** "Does not consume the field context, so an inplace editor inside a `DzFormField` is unlabelled" is still true and can never reach the matrix, because C2 is source-decided and a `wrapper` owes nothing. Either `deriveC2` should ask a wrapper for something, or the matrix should surface overridden reviews. `0 gap` currently overstates. | F8 | 🔴 |
| **D4** | **Two warn-once utilities now exist in two packages** because stable Core may not import `compat`. Correct under the current boundary rule, bad in absolute terms. Either bless the duplication, or move the primitive somewhere both may reach (`contracts` is types-only, so this is not free). | F7 | 🟢 |
| **D5** | **Does `VERSIONING.md` §3's removal path owe §4's one-minor-series deprecation window?** Shipped on the reading that §4 governs *deprecated* APIs and these were *inert* — there is nothing to keep working. A policy reading, and this packet may not define policy. | F10; N5-01 §9.7 | 🟠 |
| **D6** | **`@dzup-ui/codemods` still cannot ship** (N5-01 **D2**, restated with a second measured cost). The nine-entry codemod is written and tested and cannot reach a consumer; the `minor` changeset describes it in prose and is forbidden from naming the package. | F9 | 🟠 |

---

## 8. Files

**New**

| Path | What |
|---|---|
| `packages/core/src/utilities/warnRemovedProp.ts` | Core-local dev warning; internal, not exported publicly |
| `packages/core/src/utilities/warnRemovedProp.spec.ts` | 7 tests — the mechanism |
| `packages/core/tests/aria-prop-removals.spec.ts` | 14 tests — the nine removals as a table, plus the fall-through |
| `.changeset/nine-aria-props-that-did-nothing-are-gone.md` | `@dzup-ui/core: minor` |
| `.changeset/three-aria-props-start-working-and-a-drag-handle-gets-its-label.md` | `@dzup-ui/core: patch` |
| `docs/program-2026-09/reports/N5-02-aria-prop-gaps-handoff.md` | This document |

**Modified — Core source**

| Path | What |
|---|---|
| `packages/core/src/components/forms/DzFloatLabel.{types.ts,vue}` | four props removed + warning |
| `packages/core/src/components/forms/DzInplace.{types.ts,vue}` | `ariaInvalid` removed; `ariaLabelledby` **implemented** |
| `packages/core/src/components/layout/DzGrid.{types.ts,vue}` | `ariaInvalid` removed + warning |
| `packages/core/src/components/layout/DzStack.{types.ts,vue}` | `ariaInvalid` removed + warning |
| `packages/core/src/components/navigation/DzStepper.{types.ts,vue}` | `ariaInvalid` removed; `ariaLabelledby` + `ariaDescribedby` **implemented** |
| `packages/core/src/components/navigation/DzTabs.{types.ts,vue}` | `ariaInvalid` removed + warning |
| `packages/core/src/components/data/DzOrderList.{types.ts,vue}` | `dragHandleLabel` renders as `title`; catalog-resolved; exemption deleted |
| `packages/core/src/i18n/messages.ts` | `DzOrderList.dragHandle` |

**Modified — specs**

`DzInplace.spec.ts` (+3) · `DzStepper.spec.ts` (+5) · `DzOrderList.spec.ts` (+5) ·
`rename-props.spec.ts` (+8) · `form-readiness.spec.ts` (+5, −1 expired fixture)

**Modified — tooling and codemods**

| Path | What |
|---|---|
| `packages/tooling/src/forms/probe.ts` | `omittedKeys()` — the one gate edit (F4) |
| `packages/tooling/src/forms/assessments.ts` | six `inertProps` blocks deleted (the gate requires it); field kept with a note |
| `packages/tooling/src/validators/hardcoded-strings.ts` | JSDoc only — the cited exemption closed |
| `packages/codemods/src/utils/vue-template.ts` | `removeTemplateAttrs` + `TemplateAttrRemoveRule` |
| `packages/codemods/src/transforms/rename-props.ts` | `REMOVED_ARIA_PROPS`, `JSX_PROP_REMOVALS` |

**Modified — regenerated artifacts (never hand-edited)**

`docs/program-2026-08/form-controls-readiness-matrix.md` ·
`packages/core/docs/component-meta.json` · `packages/core/docs/llms-full.txt` ·
`apps/docs/components/{DzFloatLabel,DzGrid,DzInplace,DzOrderList,DzStack,DzStepper,DzTabs}.md` ·
`apps/docs/.vitepress/generated/nav.json` · `apps/docs/public/playground/seeds.json`

**Preserved untouched — all 16 of TASK-N5-01's entries**, including
`packages/contracts/VERSIONING.md`, `validate-release-policy.{ts,spec.ts}`,
`release-policy.json`, `.changeset/config.json`, root `package.json`,
`generate-readme-facts.{ts,spec.ts}`, both READMEs,
`packages/contracts/package.json`, and the three N5-01 reports.

---

## 9. What this work refuses to imply

- **It is not AT-qualified.** Nothing here was run against NVDA, JAWS, VoiceOver
  or TalkBack. `aria-labelledby` on `role="group"` is asserted to be *in the DOM*;
  that it is *announced* is inference from the ARIA specification, not
  observation. Links 15/16 are red precisely because the AT evidence is unrun, and
  this packet does not change that: **0/534 AT cells executed.**
- **`0 gap` is not `no known C2 defect`.** F8 names one that the derivation cannot
  see. The number means "no cell the gate can decide is failing".
- **The removals are not delivered.** They are uncommitted, unbuilt, unpublished.
  `packages/core/dist/` still declares all nine props; a consumer sees the removal
  only after a build and a release, and the codemod that would automate the
  migration **cannot be released at all** (F9).
- **The three implementations are not proof the other identity props are honoured.**
  This packet examined twelve props on six controls. `BaseAccessibilityProps` is
  inherited far more widely, and F2 argues its shape makes this class of defect
  likely elsewhere. Nothing was swept for it.
- **`warnRemovedProps` is not a deprecation system.** It warns about nine props
  hard-coded at nine call sites. There is still no repository-wide ledger of
  deprecated props, parts or states — `VERSIONING.md` §4 says so, and this packet
  did not build one.
- **The probe fix is not a `defineProps` type resolver.** It reads string literals
  out of `Omit<>`. `Pick`, `keyof`, aliased unions and conditional types all
  degrade to the old behaviour, which reports the prop and keeps the cell red.
- **A green local run is not CI, not a release, and not production.** The evidence
  class here is weaker still than N5-01's, because the tree was dirty: every
  artifact regenerated stamps `sourceCommit: 6f1f6533…` while describing source
  that is not in that commit.

---

## 10. Ranked next step for TASK-N5-03

1. 🔴 **Take N5-01 D6 before anything else touches a generated artifact.** Links
   15/16 have now stood red across two consecutive packets, and each one has to
   spend a section of its handoff proving the red is not its own. That cost is
   recurring and rises with every packet. The fix N5-01 identified is one line —
   exclude `componentCommit` from the byte comparison, exactly as
   `validate:component-meta` already excludes `sourceCommit`.
2. 🟠 **D3 (F8) is the highest-value a11y follow-up here**, not a toolchain item:
   the matrix's freshly-clean C2 column is structurally unable to report a defect
   somebody already found and wrote down.
3. 🟢 Toolchain currency should expect `vue-component-meta@3.3.7` to be the
   sensitive pin — `component-meta.json`, `llms-full.txt`, all 144 docs pages, the
   playground seeds and the nav are projections of its output, so a bump to it
   rewrites five artifacts at once and every one of them is byte-compared by a
   gate.
