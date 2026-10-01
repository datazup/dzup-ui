# RESIDUAL-12 — the anatomy keyboard contracts nothing checked, and the name a chip may not carry

**Batch:** RESIDUAL-12 · **Date:** 2026-09-28 · **Repo:** `ui/dzup-ui` (OSS, `@dzup-ui/*`)
**Entry HEAD:** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` · **entry dirty paths:** 349
**Raised by:** `RESIDUAL-11-ssr-defect-fixes-handoff.md` §9.2 — `D-RES11-2` and `D-RES11-1`

> Written incrementally. Each section was appended as its phase finished, because four
> agents stalled in this session and only incremental writes survived.

---

## 0. The two items, and why they are the same item

| item | RESIDUAL-11's words | shape |
|---|---|---|
| `D-RES11-2` 🔴 | `DzChip.anatomy.ts` declares an Enter/Space `apg: 'button'` activation the component never implemented — and **nothing checks any anatomy keyboard table against actual handlers** | a **published** contract with no mechanism able to falsify it |
| `D-RES11-1` | `aria-label` on the `DzChip`/`DzTag` root is `aria-prohibited-attr`, which axe reports as **`incomplete`** — and `toHaveNoViolations()` cannot see an `incomplete` | a **measured** defect with no mechanism able to see it |

Both are invisible-evidence, which is the class this programme exists to remove. The
first is closed with a gate; the second with an assertion that reads the `incomplete`
bucket directly.

*(Sections 1 onward are appended as each phase completes.)*

---

## 1. Item 1 / `D-RES11-2` — the measurement, which is the headline

*Measured on `4e4e46f` with the uncommitted working tree, by
`packages/tooling/src/validators/anatomy-keyboard.ts` before any fix in this batch.*

| | count |
|---|---|
| anatomy declarations (`components/**` + `providers/**`) | **104** |
| of those, declaring `keyboard: 'none'` explicitly | **19** |
| **components declaring keyboard behaviour** (a bindings array) | **85** |
| **declared binding rows** across them | **398** |
| distinct keys declared | 17 |
| **backed** — an owner can be named and cited | **358** (89.9 %) |
| **unbacked** — the closure resolved completely and nothing owns the key | **32** (8.0 %) |
| **undetermined** — an edge of the closure could not be followed | **8** (2.0 %) |
| **undeclared handlers** — the reverse drift, a key handled and not declared | **8** |

The 104 / 19 / 85 split agrees, row for row, with the assertion
`packages/tooling/src/quality/keyboard-contract.spec.ts` already makes
(*"the catalogue-wide totals are what the documentation ratchet was set from"*), so the
population this validator walks is the same population the existing spec walks — and
the existing spec never compared a single one of those 398 rows to a line of code.

### 1.1 Where the 358 backed rows are owned — and why a naive check is useless

| route | rows | what it means |
|---|---|---|
| `own` | 122 | the declaring component's own source handles the key |
| `primitive` | 154 | a Reka primitive it imports owns it, cited to Reka's own `dist` |
| `platform` | 56 | a native element's documented HTML behaviour, or `Tab` |
| `part` | 11 | a `compound-part` the ownership manifest attributes to it |
| `renders` | 8 | a component or unexported internal it renders |
| `composable` | 7 | a `use*` it calls |

**236 of 358 backed rows — 66 % — are owned by something other than the declaring
file.** Measured directly: **57 of the 85** components that declare bindings contain no
`keydown`/`keyup` token of any kind in their own `.vue`. A "no `@keydown` in this file"
check would therefore have reported two thirds of the library's keyboard contracts as
broken, which is why the delegation resolution is the whole content of this gate and not
a detail of it.

### 1.2 How the checker resolves delegation — six routes, each with a citation

`packages/tooling/src/validators/anatomy-keyboard.ts`, built to the shape of its
neighbour `anatomy-parts.ts` (same `ROOT` resolution, same ceilings-file convention, same
CLI/`process.exit` tail, same `checkX()` export for the spec).

| # | route | how it is resolved | example |
|---|---|---|---|
| 1 | `own` | the declaring `.vue` has a key-event token **and** names the key in a key-comparison shape | `DzOrderList` — a `switch` over `event.key` with a `case` per arrow |
| 2 | `part` | a `compound-part` whose `parentComponent` is this component — **the ownership manifest's own relation**, the same one `anatomy-parts.ts` walks for a part name | `DzTabs` declares Delete; `DzTabTrigger.vue:65` handles it |
| 3 | `renders` | a `Dz*` or unexported internal the closure's templates render, transitively to depth 6 | `DzSelect` reaching `DzOptionsState.vue` |
| 4 | `composable` | a `use*` under `src/composables/` reached from the closure | `useEscapeKey`, `useFocusTrap`, `useDataGridHeader` |
| 5 | `primitive` | **derived from Reka's own installed source.** The walk indexes `node_modules/reka-ui/dist/**/*.js` by basename, follows each imported primitive's *relative* import graph to depth 6, and harvests key literals, `kbd.*` constants, `withKeys([…])` aliases and unquoted object-literal key names | `DzTabs` Home → `TabsList` → `RovingFocusGroup` → `RovingFocus/utils.js:14`, whose `MAP_KEY_TO_FOCUS_INTENT` names it |
| 6 | `platform` | a written-down table of native HTML behaviour, **scoped to the node the row is about** | `DzButton` Enter → its own root `<component :is>`; `DzAccordion` Enter at the trigger → `AccordionTrigger` → `CollapsibleTrigger.js`, whose `as` default is `"button"` |

Four decisions inside routes 5 and 6 are what make the verdicts trustworthy, and each was
forced by a measured false positive during construction:

1. **Reka's `shared/useKbd.js` is excluded as a *dictionary*.** It returns every
   `KeyboardEvent.key` name there is. Harvested, it would make every primitive that
   imports it — most of them — the owner of every key. That is precisely the
   "satisfied because a primitive probably handles it" verdict the brief forbids.
2. **The platform route credits activation and text entry only, never navigation.** A
   native `<select>` really does own ArrowDown; `DzTimePicker` really does contain one
   (its meridiem picker); and its declared ArrowUp/ArrowDown/Home/End rows are an APG
   `combobox` contract about its popover list and have nothing to do with it. No
   component template in the repository contains an `<input type="range">` (measured), so
   excluding navigation keys from this route costs nothing legitimate. A declared arrow is
   a claim about roving focus, and roving focus always takes code.
3. **The platform route is scoped to the node the row is about** — the node carrying the
   row's `when` part when `when` names one, the component's own root otherwise, which is
   what an unscoped row means (`KeyboardBinding.when`: *"applies wherever the component
   has focus"*). Unscoped, "there is a `<button>` somewhere inside" marked **`DzChip`'s
   `Enter` as backed** — by its **remove** button, which does something else entirely.
   And when the root itself takes focus, it *is* the node: a focusable `<span>` that
   activates on nothing fails the row, which is exactly how `DzChip` and `DzTag` are
   caught.
4. **`Tab` is asked last and never treated as a handler.** `Tab` is the document's focus
   order; a component that called `preventDefault()` on it would be *trapping* focus, not
   implementing the row. So a `Tab` row is satisfied by there being a focusable node —
   located over template **nodes**, not over whole file text, because `tabIndex` appears
   in plenty of `.ts` that renders nothing and citing `useComponentMessages.ts` as the
   focusable node behind a `Tab` row is a citation nobody can read back. Asking it last
   means `DzDialogContent`'s `Tab` is attributed to Reka's `FocusScope`, which really does
   manage it.

### 1.3 `undetermined` — 8 rows, and not one of them is counted as satisfied

A row is **`unbacked`** only when the closure resolved *completely*. When an edge could
not be followed the answer might be behind it, so the row is `undetermined`, the reason is
printed per row, and it has its own ceiling so that widening the resolution shows up as
**this** number falling rather than as `unbacked` rising.

| component | key | why undetermined |
|---|---|---|
| `DzAnchor` | `Enter` | builds its links with `h()` / `renderList()` in the script; its template is a `<nav>` and nothing else |
| `DzCheckboxGroup` | `' '` | a `<div>` and a slot; the checkboxes are the application's |
| `DzCollapse` | `Enter`, `' '` | the trigger node is consumer markup |
| `DzFieldArray` | `Enter`, `' '` | the action node is consumer markup |
| `DzOrderList` | `<character>` | no text field and no type-ahead in its own markup; the rows are slotted |
| `DzRadioGroup` | `' '` | `RadioGroupRoot` and a slot; the radios are the application's |

Every one of these is settleable, and by a mechanism that already exists:
`expectKeyboardContract` from `@dzup-ui/testing` runs against **rendered DOM**, so a
spec that mounts the component with real children answers all six slot cases. That
helper is exported and **called from zero component specs on this tree** — raised as
finding **F11** below.

---

## 2. The gate, and the proof that it fails closed

`yarn validate:anatomy-keyboard` → `packages/tooling/src/validators/anatomy-keyboard.ts`,
chained at the **END** of `validate:all`, after `yarn validate:browser-lane`, so every
existing link number is unchanged. **`validate:all` is now 62 links, was 61.**

Ceilings seeded in `packages/tooling/src/validators/anatomy-keyboard-ceilings.json` at
**the measured values, never above**:

| rule | ceiling | measured |
|---|---|---|
| `maxUnbackedDeclarations` | **28** | 28 (32 before this batch's four removals) |
| `maxUndeterminedDeclarations` | **8** | 8 |
| `maxUndeclaredHandlers` | **0** | 0 (8 before this batch's eight additions) |

### 2.1 Seeded breaks — both directions, then byte-identical restore

```
sha256 of all four files recorded first          scratchpad/seed-hashes.txt

SEED A   a declared key loses its handler
         DzChip.vue:88 — drop the Delete arm of handleKeyDown
  exit 1
  x DzChip declares `Delete` (when closable) - "Remove the chip." - and nothing
    handles it: not DzChip's own source, not a compound part, not a component it
    renders, not a composable, not a Reka primitive it imports, and no native
    element it renders. packages/core/src/components/data/DzChip.anatomy.ts
  x unbacked-declaration: 29 ... over the ceiling of 28
         restored -> sha256sum -c   OK (4 of 4)

SEED B1  a handler appears with no declaration
         DzChip.vue:88 — add an Escape arm to handleKeyDown
  exit 1
  x packages/core/src/components/data/DzChip.vue:88 handles `Escape` and DzChip's
    anatomy does not declare it.
  x undeclared-handler: 1 key(s) ... over the ceiling of 0
         restored -> sha256sum -c   OK (4 of 4)

SEED B2  the declaration disappears while a COMPOUND PART keeps handling it
         DzTabs.anatomy.ts — delete the Delete row; DzTabTrigger.vue untouched
  exit 1
  x packages/core/src/components/navigation/DzTabTrigger.vue:65 handles `Delete`
    and DzTabs's anatomy does not declare it.
  x undeclared-handler: 1 key(s) ... over the ceiling of 0
         restored -> sha256sum -c   OK (4 of 4)
```

**B2 is the proof that matters most**, because it is the one a per-file checker cannot
make: the handler is in `DzTabTrigger.vue` and the declaration is in
`DzTabs.anatomy.ts`, two different files in two different roles, joined only by the
ownership manifest's `parentComponent`. No `git checkout` was used anywhere; every restore
was the inverse edit, verified by `sha256sum -c`.

### 2.2 The unit spec

`packages/tooling/src/validators/anatomy-keyboard.spec.ts` — 23 tests. Eight of them pin
the key-recognition function in **both** directions, because that function is where every
false verdict during construction came from:

- read too loosely it took a placement comparison and a `join` separator as keys and
  reported **12 keys of reverse drift that do not exist**;
- read too strictly it lost Reka's `MAP_KEY_TO_FOCUS_INTENT` (Home/End/PageUp/PageDown
  are **unquoted** object keys there) and the last element of a one-name-per-line array in
  `Slider/utils.js`, and reported `DzTabs` Home/End and `DzSlider` ArrowRight as unbacked.

Four more assert properties of the report that a reader has to be able to rely on: every
row gets exactly one verdict, every `backed` row carries an openable citation, every
`undetermined` row carries a reason, and **no navigation key is ever resolved through the
platform route**. One asserts that `DzChip` and `DzTag` declare the *same* keyboard
contract, which is what stops the pair diverging again. Three pin the population at
104 / 19 / 85 — the same three numbers `quality/keyboard-contract.spec.ts` asserts from
its own independent walk.

---

## 3. Item 2 / `D-RES11-1` — the prohibited name, and the bucket nothing read

### 3.1 The measurement that decided it

RESIDUAL-11 established the defect and four costed options, and said which role a chip
should be *"is a design question an agent should not answer alone"*. It can, however, be
**measured**, and that is what settles it. A probe rendered both components against the
vendored `axe-core` in eleven configurations each — 22 renders — and read **both** result
buckets, not just `violations`:

| root | axe `violations` | axe `incomplete` |
|---|---|---|
| no name, no role | `[]` | `[]` |
| `aria-label`, no role | `[]` | **`['aria-prohibited-attr']`** |
| `aria-labelledby`, no role | `[]` | **`['aria-prohibited-attr']`** |
| `aria-label` + `closable`, no role | `[]` | **`['aria-prohibited-attr']`** |
| `aria-describedby`, no role | `[]` | `[]` |
| `aria-label` + `role="group"` | `[]` | `[]` |
| `aria-label` + `closable` + `role="group"` | `[]` | `[]` |
| `aria-label` + `role="note"` | `[]` | `[]` |
| `aria-label` + `role="button"` | `[]` | `[]` |
| `aria-label` + `role="listitem"` | **`['aria-required-parent']`** | `[]` |

Identical for `DzChip` and for `DzTag`, in all eleven. Three facts RESIDUAL-11 did not
have:

1. **`aria-labelledby` is prohibited too**, not only `aria-label`. The defect is twice the
   size it was recorded as.
2. **`aria-describedby` is not affected** — it is a global attribute, allowed on `generic`.
   So the fix does not have to touch it, and does not.
3. **`role="listitem"` is measurably worse than the defect**: it turns an `incomplete`
   into a real `violations` entry (`aria-required-parent`). Any resolution that reached for
   a list role would have made things worse while looking like a fix.

### 3.2 The decision, and the alternatives it was chosen over

**A naming-capable role, and only when the root is actually named.** Both components now
compute `role="group"` when `ariaLabel` or `ariaLabelledby` is set, and **no role at all**
otherwise, which leaves the `D-RES10-3` position exactly as RESIDUAL-11 left it for the
overwhelmingly common case.

Why `group`, against each alternative that measured clean:

- **`note`** — clean, and wrong. A chip is not an annotation; the role would be announced
  as one.
- **`button`** — clean, and already rejected on its own evidence (RESIDUAL-11 §3.2, and
  the note in `DzChip.vue`): activating this root does nothing. The same evidence that made
  this batch delete the Enter/Space anatomy rows forbids the role.
- **`listitem`** — a new violation. Out on measurement.
- **Stop forwarding `ariaLabel` / `ariaLabelledby` to the root** (the brief's "move the
  name to an element that may hold it"). Also clean, and cheaper. **Rejected**, and the
  reason is specific rather than aesthetic: both props come from
  `BaseAccessibilityProps`, both are rendered on the component's generated documentation
  page as supported props, and `ariaLabel` is already read *inside* the component by the
  remove button's own name. Silently making a declared prop do nothing is what
  VERSIONING.md §3 calls a promise-shaped lie — the failure class this programme exists to
  remove, not to create a new instance of.
- **Record a deviation** in `packages/core/docs/wcag-deviations.json` — the mechanism
  exists and is honest, but that file's own note says *"an entry is a DEFECT, not a
  waiver: the library owes it"*, and this defect is a two-line fix. A register entry
  would have been a way of not fixing it.

The cost RESIDUAL-11 named is real and unchanged: **one a11y-tree node, on chips and tags
an author deliberately named.** A filter bar of plain chips is byte-identical to before.

**Both components were changed together, deliberately.** RESIDUAL-11 §3.2 established
that these two roots are attribute-for-attribute the same element, and `DzChip.spec.ts`
already asserts that the two agree about the root role. Fixing one alone would have
re-created the divergence that test exists to prevent.

### 3.3 How it is now assertable — the part that matters most

`aria-prohibited-attr` was invisible because `vitest-axe`'s `toHaveNoViolations()` reads
**only** the `violations` bucket, and axe puts this rule in **`incomplete`**. Ten axe
assertions across `DzChip` and `DzTag` were green the whole time.

New: `packages/core/tests/a11y/prohibited-aria.ts` — `expectNoProhibitedAria(results)`,
which reads `aria-prohibited-attr` out of **both** buckets and fails with the rule, the
bucket and the offending element's HTML. It is used beside `toHaveNoViolations()`, never
instead of it, because the two read different buckets and neither is a superset of the
other.

It is deliberately **narrow — one rule, not the whole `incomplete` bucket.** `incomplete`
also carries `color-contrast` (undecidable under jsdom, which has no layout) and
`aria-valid-attr-value` (fired by any `aria-describedby` pointing at an id a test fixture
does not render), so a blanket assertion would be red on arrival for properties of the
test environment rather than of the component. Sweeping the rest is raised as **F12**.

Wired into `packages/core/tests/a11y/data.a11y.spec.ts`: three cases per component
(`ariaLabel`, `ariaLabel` + `closable`, `ariaLabelledby`) — exactly the cases that used to
fail — plus two structural assertions: that the role appears **only** when named, and that
`DzTag` and `DzChip` agree about when it appears.

### 3.4 Seeded break — the assertion fails closed

```
sha256 of DzChip.vue and DzTag.vue recorded first     scratchpad/seed-hashes2.txt

SEED C   remove `:role="namingRole"` from DzChip.vue's root (one line)
  node node_modules/vitest/vitest.mjs run packages/core/tests/a11y/data.a11y.spec.ts
  exit 1 — 5 failures, and DzTag's three stayed GREEN, which is the proof the
  assertion is per-component and not a shared fixture:
    x dzChip > carries no prohibited ARIA name with ariaLabel
    x dzChip > carries no prohibited ARIA name with ariaLabel + closable
    x dzChip > carries no prohibited ARIA name with ariaLabelledby
    x dzChip > takes a naming-capable role only when it is named
    x dzTag  > agrees with DzChip about when the root takes a naming-capable role
  message:
    axe reports `aria-prohibited-attr` in `incomplete` on <span data-part="root"
    ... aria-label="Design" ...>. ARIA 1.2 prohibits `aria-label` and
    `aria-labelledby` on some roles - `generic` among them, which is what a
    <span> or <div> with no role is. ...
         restored -> sha256sum -c   OK (2 of 2)
```

The three `toHaveNoViolations()` assertions above these in the same `describe` block were
**green under the seed**, which is the whole finding restated as a test result: the old
matcher cannot see this defect, and the new assertion can.

### 3.5 The probe

`packages/core/tests/__probe-res12.spec.ts` — 22 renders, written **outside**
`packages/core/tests/ssr/` (the capability matrix's `ssrSpecs` glob) and **deleted** after
the measurement, exactly as RESIDUAL-11 handled its two probes. `ls packages/core/tests/`
shows `a11y/ aria-prop-removals.spec.ts portal-target.spec.ts rtl.spec.ts ssr/
vapor-interop.spec.ts` and no probe. No suite was run for evidence while it existed.

---

## 4. Findings — raised, not fixed, with counts

**28 unbacked declarations remain across 10 components, and none of them is a
documentation error.** Every one is a published contract that states what its APG pattern
requires, against code that does not do it. Deleting the rows would make the gate green and
the library less accessible, so they are raised.

| # | component | keys | what the evidence says |
|---|---|---|---|
| **F1** | `DzToolbar` | ArrowRight, ArrowLeft, Home, End (4) | **The worst of them.** The root is `role="toolbar"`, which the APG defines as a single tab stop with arrow-key roving focus, and `DzToolbar.vue` contains no key handling at all — no `keydown`, no composable, no primitive. A declared `toolbar` whose arrows do nothing is a WCAG 2.1.1 gap, not a stale table |
| **F2** | `DzColorPicker` | ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Home, End (6) | Declares APG `slider` over a saturation/value area. Built from scratch on `PopoverRoot`; the only interaction is pointer. The panel cannot be operated from the keyboard at all |
| **F3** | `DzTimePicker` | ArrowDown, ArrowUp, Home, End (4) | Declares APG `combobox`. Its `Enter` **is** backed (the trigger is a real `<button>`), so the list opens; nothing moves the highlight once it is open |
| **F4** | `DzCascader` | Home, End (2) | Has a real `onColumnsKeydown` with a `switch` on ArrowDown/ArrowUp/in/out — Home and End are simply absent from it |
| **F5** | `DzDatePicker`, `DzDateRangePicker` | Home, End (2 each = 4) | Declared `when: 'list open'` as APG `combobox`; Reka's calendar primitives own the arrows and the page keys but not these two |
| **F6** | `DzTransfer` | Home, End (2) | Declares APG `listbox` over both panes; the item rows take focus and no key moves between the ends |
| **F7** | `DzCarousel` | ArrowRight, ArrowLeft (2) | Declares APG `carousel`. `DzCarousel.vue` is a `<div role="region">` and a slot with no key handling; the previous/next controls are buttons, so a pointer user can move and a keyboard user must tab to them |
| **F8** | `DzTour` | ArrowRight, ArrowLeft (2) | Declares step navigation; the overlay traps focus (`useFocusTrap`) and the arrows are not bound |
| **F9** | `DzListItem` | Enter, Space (2) | **The `DzChip` shape, with the opposite conclusion.** An `interactive` row takes `tabindex="0"` and has an `@click` that emits `click` — so unlike the chip there **is** a pointer action for a key to mirror, which makes this a genuine SC 2.1.1 failure rather than a false claim. Deleting the rows would hide it. Not fixed here because `DzListItemEmits` types `click` as a `MouseEvent`, so implementing it needs an emit-signature decision on a published component |
| **F10** | `DzOrderList` | `<character>` (1)† | Declares listbox type-ahead. The component has a full roving-focus grab/move implementation and no type-ahead of any kind. †Reported as `undetermined` rather than `unbacked` because the rows are slotted |

**Two findings about the mechanisms, not the components:**

- **F11 — `expectKeyboardContract` is exported and called from nothing.** The contract type
  in `@dzup-ui/contracts` says of every `KeyboardBinding` field: *"Every field is a promise
  something checks: `expectKeyboardContract` (@dzup-ui/testing) asserts the rows against
  the rendered component."* Measured: **zero component specs call it** on this tree. It is
  also the mechanism that would settle all **8 undetermined** rows, because it runs against
  rendered DOM and therefore sees the children a consumer put in the slot. Cheapest next
  step in this thread by a wide margin.
- **F12 — the rest of axe's `incomplete` bucket is still unread.** This batch closed one
  rule, on two components, with a helper any a11y spec can now use. A catalogue-wide sweep
  was **not** attempted, and the reason is measured rather than assumed: `incomplete` also
  carries `color-contrast` (jsdom has no layout, so axe cannot decide it) and
  `aria-valid-attr-value` (any `aria-describedby` pointing at an id the fixture does not
  render). A blanket assertion would be red on arrival for properties of the environment.
  The honest shape is a rule at a time with a reason each, and a ratchet on the count of
  rules admitted.

**Two smaller things found in passing, raised rather than silently fixed:**

- **F13 — a remove button named `"Remove "`.** Both `DzChip.vue` and `DzTag.vue` bind
  `:aria-label="\`Remove ${ariaLabel ?? ''}\`"` on the close control. With no `ariaLabel`
  the icon-only button's accessible name is the literal `"Remove "` — a name with no
  object. axe's `button-name` passes (there *is* a name), so nothing reports it. Neither
  component uses `useComponentMessages`, so `"Remove"` is also an untranslated English
  literal on a published component. Fixing it properly means giving these two components a
  message catalogue, which is a larger change than this batch should make to a published
  API.
- **F14 — a `when` that names a prop is unchecked.** `checkKeyboardContract` flags a
  single-word `when` that is neither a declared part nor a declared state as *"almost
  always a typo"*. The catalogue has 12 such values in live use
  (`clickable`, `interactive`, `open`, `removable`→now `closable`, `dropzone`, …), all
  legitimate prop names, and nothing calls that check. Either the contract should say a
  `when` may name a prop, or the rule should be enforced — at present it is neither.

---

## 5. Validation — every exit code read from a log file, never from a notice

All commands run from the repository root. Every one wrote to an **absolute** path under the
session scratchpad and the exit code was read from `echo "exit $?"` written to that same
file, never through a pipe and never from a harness notice.

| command | exit | evidence |
|---|---|---|
| `yarn validate:all` | **0** | **62 links** (was 61) · **53** `✓` (was 52) · **0** `✗` |
| `yarn test` | **0** | **576** files (was 575) · **11,261** passed (was 11,226) · 3 skipped · 1 todo · **0 failed** · 295.51 s · `grep -c FAIL` → **0** |
| `yarn storybook:test` (the browser lane) | **0** | **170** files · **1,462** tests · **1,462 passed** · **0 failed** · 96.11 s · `grep -c FAIL` → **0** |
| `yarn regenerate:all` | **0** | 7 of 7 steps, run **twice** |
| `yarn typecheck:tooling` | **0** | after the fix described below |
| `node node_modules/eslint/bin/eslint.js <12 changed files>` | **0** | `--max-warnings 0` |
| `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/anatomy-keyboard.ts` | **0** | 402 rows · 366 backed · 28/28 unbacked · 8/8 undetermined · 0/0 drift |

**Two gates failed first and both were fixed by hand.**

1. **`yarn validate:all` exited `2`** on **15 `typecheck:tooling` errors** —
   `noUncheckedIndexedAccess` is on for `packages/tooling`, so every regex capture group is
   `string | undefined`. Worth recording because
   `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit -p tsconfig.json` had already exited
   **0**: the root typecheck does not cover the tooling package, and a new validator can pass
   it and still fail `validate:all`'s second link.
2. **`eslint --max-warnings 0` exited `1`** on **34 errors and 2 warnings** across three
   files. Every one fixed **by hand — `--fix` was not used**, per this repository's own
   record of it corrupting a string literal. The interesting ones, because they are
   properties of this codebase's lint config rather than of my typing: `regexp/
   no-contradiction-with-assertion` on `/<button\b[^>]*…/` (a `\b` followed by a
   zero-minimum class), `regexp/no-super-linear-backtracking` on the template-node scanner
   (fixed with a lookahead that makes exactly one split viable, and the reason is now a
   comment in the source), `style/quote-props` on a key table that mixed
   `enter:` with `'arrow-up':`, and `jsdoc/no-multi-asterisks` on three doc lines whose
   continuation began with a markdown `*` — the same rule that cost RESIDUAL-11 a run.

The browser lane was run **once**, app-locally (`yarn storybook:test`, which delegates to
`apps/storybook`'s own vitest), never with the root binary — `validate:browser-lane`'s own
note records that the cross-install invocation launches a browser, connects it and then dies
at collection with no error for about seven minutes. It was run because this batch changes
the **rendered output** of two published components (a conditional `role` on the root) and
four story play functions on those two components locate elements by accessible name and then
search inside them. All 170 files green on the first attempt.

### 5.1 Capability movement — two cells, both the right way

**`present` 611 → 613 · `unrun` 397 → 395.** Two cells of 1,662, both `keyboard-spec`, and
each moved for a reason worth stating rather than just counting:

```
DzChip  keyboard-spec  unrun -> present
   That cell is `present` only when EVERY declared key is asserted by name in the
   component's unit spec. DzChip.spec.ts asserts Delete and Backspace and could never
   assert Enter or Space, because the component does not implement them. Removing the
   two rows nothing implemented is what made the cell satisfiable.

DzTag   keyboard-spec  unrun -> present
   DzTag.spec.ts asserted NO key at all, for a component whose entire keyboard contract
   is Delete and Backspace and whose handleKeyDown is identical to DzChip's. Four tests
   added, mirroring DzChip.spec.ts line for line.
```

Everything else unmoved: `pass` **585** · `fail` **0** · `stale` **22** · `excepted` **47** ·
rows **144** / cells **1662** · `unclassified` **29** · `maxWithoutAnatomy` **41** ·
`maxProposedCitedFromCode` **3** · **AT 0 of 534** · locales ≥ 95 % **1** · inline-style
sites **133** (81 static in 78 files + 52 bound in 38 files; the artifact's **bytes** changed
because it records line numbers and both edited `.vue` files gained one, and its **totals**
did not) · browser lane **170 / 1,462**.

**No ceiling was raised and no allowlist was widened.** The only `*ceiling*.json` created is
this batch's own, seeded at measured values; no existing one was opened for writing.

---

## 6. Residue — nothing left behind, and every dirty path attributed

| thing | state |
|---|---|
| the measurement probe | `packages/core/tests/__probe-res12.spec.ts` (22 axe renders) was written **outside** `packages/core/tests/ssr/` on purpose — that directory is the capability matrix's `ssrSpecs` glob — used for §3.1's before-and-after passes, then **deleted**. `ls packages/core/tests/` shows `a11y/ aria-prop-removals.spec.ts portal-target.spec.ts rtl.spec.ts ssr/ vapor-interop.spec.ts` and no probe. **No suite was run for evidence while it existed.** |
| the four seeded files | `DzChip.vue` (twice: seed A and seed B1), `DzTabs.anatomy.ts` (seed B2), `DzChip.vue` again (seed C). Every restore was the **inverse edit**, verified by `sha256sum -c` against a hash file recorded **before** the first seed. **`git checkout` was not used anywhere in this batch.** |
| `yarn.lock` | **untouched.** No `yarn install` was run and none is owed. Its ` M` remains the owner's install. |
| screenshots / PNGs / baselines | none. No baseline was written, replaced or accepted. The visual lane was **not** run (§7). |
| processes | **none killed.** `chromium` 0 → 0 · `msedge` 0 → 0 · `headless_shell` 0 → 0 · `node` 23 → 23 · `chrome` 59 → **53**. The chrome delta is **downward**, which a leak cannot be; it is the user's own browser closing tabs during the 96-second run, and the lane's own engine is `chromium`, which is zero both times. No `taskkill`, no kill-by-name, no kill at all. |
| scratch files inside the repository | none. Every log, hash file, probe output and draft lives in the session scratchpad **outside** the repository, and the scratch directory was created by a command that touches nothing inside it. |
| git | nothing committed, pushed, stashed, reverted, checked out, cleaned, pulled, merged or rebased. No CI dispatch, no publish, no deployment, no baseline replacement. |

### 6.1 Dirty paths — 349 → 362, and all 13 are attributed

```
git status --porcelain | wc -l        before 349   after 362
diff <before listing> <after listing>  ->  13 added, 0 removed, 0 modified
```

**Nothing that was dirty at entry stopped being dirty, and nothing changed its status
letter.** The 13 new paths:

```
 M packages/core/src/components/data/DzChip.anatomy.ts               D-RES11-2  rows removed
 M packages/core/src/components/data/DzTag.anatomy.ts                D-RES11-2  rows removed
 M packages/core/src/components/buttons/DzSpeedDial.anatomy.ts       D-RES11-2  drift, +4
 M packages/core/src/components/forms/DzRating.anatomy.ts            D-RES11-2  drift, +2
 M packages/core/src/components/navigation/DzTabs.anatomy.ts         D-RES11-2  drift, +2
 M packages/core/src/components/data/DzTag.vue                       D-RES11-1  namingRole
 M packages/core/src/components/data/DzTag.spec.ts                   +4 keyboard tests
?? packages/tooling/src/validators/anatomy-keyboard.ts               the gate
?? packages/tooling/src/validators/anatomy-keyboard.spec.ts          its 23 tests
?? packages/tooling/src/validators/anatomy-keyboard-ceilings.json    its ceilings
?? packages/core/tests/a11y/prohibited-aria.ts                       D-RES11-1  the assertion
?? .changeset/published-keyboard-tables-now-match-the-code.md
?? .changeset/a-named-chip-or-tag-carries-a-role-that-may-hold-a-name.md
```

Ten files this batch edited were **already** dirty at entry and so appear in neither list —
verified by name against the entry snapshot rather than assumed:

```
 M packages/core/src/components/data/DzChip.vue            D-RES11-1  namingRole  (dirty from RESIDUAL-11)
 M packages/core/tests/a11y/data.a11y.spec.ts              D-RES11-1  +8 assertions
 M package.json                                            the new script + the 62nd link
 M packages/core/manifests/component-ownership.manifest.json          regenerated
 M packages/core/docs/capability-matrix.json + component-meta.json + llms*  regenerated
 M packages/core/security/inline-style-inventory.json                 regenerated (line numbers)
 M apps/docs/**  + .vitepress/generated/nav.json                      regenerated
 M docs/program-2026-09-22-architecture/EXECUTION-STATUS.md            this batch's ledger entry
?? packages/tooling/src/regenerate-all.ts     one word: "its 61 links" -> "its 62 links"
?? docs/program-2026-09-22-architecture/reports/                       this report + the register
```

That last one is the only edit in this batch that is neither item: `regenerate-all.ts`'s own
header counts `validate:all`'s links to say that step 7 is checked by **none** of them, and
appending a 62nd link made the number stale in the same commit that made the sentence more
true. `regenerate-all.spec.ts` asserts that the script and `CLAUDE.md`'s table name the same
seven commands in the same order and says nothing about the count, so nothing else moves —
14 tests, exit 0, re-run after the edit.

---

## 7. Not done, and named rather than left to be discovered

- **`D-RES12-1`'s 28 rows are the real remainder.** The ceiling cannot rise and the gate
  names all 28 on every run, but two of those components — `DzToolbar` and `DzListItem` —
  are keyboard-inoperable controls in a shipped library, and that is a WCAG AA claim the
  library cannot currently make. See §4 F1 and F9.
- **The visual lane was not run and RESIDUAL-11 §9.3's `DzSelect` item is deliberately
  untouched.** Nothing in this batch changes a painted pixel: the `role` attribute is not a
  style, and no `.variants.ts`, token or class moved. Visual capture is owner-gated and the
  authoritative platform is linux while this machine is win32, so a local run would have
  qualified nothing for anyone.
- **F11 / `D-RES12-2` is the cheapest next step in this thread** and would take
  `maxUndeterminedDeclarations` from 8 toward 0 with no new mechanism.
- Still open and untouched: register #2 / `D127` the commit · `D112` the named AT tester ·
  `D-S1O4-1` / `D-S1O4-3` · the Playwright-matrix CI job · the linux visual accept pass ·
  RESIDUAL-10 §7.3's single `ciGate` derivation · `D-RES09-1` · `D-RES07-1` · `D-RES06-2` ·
  `D-RES04-2` · `D91` · ADR-18/19/20 acceptance.

---

## 8. Ranked next packet

1. **Register #2 / `D127` — commit the 362-path worktree.** Owner-only and unchanged as the
   single act that unblocks the most. Two more published-component changesets now sit behind
   it, and every assertion this batch added is qualified against an uncommitted tree.
2. **`D-RES12-2` / F11 — wire `expectKeyboardContract` into the six components whose rows
   are `undetermined`** (`DzCheckboxGroup`, `DzCollapse`, `DzFieldArray`, `DzOrderList`,
   `DzRadioGroup`, `DzAnchor`). It runs against rendered DOM, so it sees the children a
   consumer supplies, which is exactly what the source scan cannot. ~1 h, no new mechanism,
   and it lowers a ceiling this batch had to seed above zero. It is also the second time a
   helper written to check a claim has been found wired to nothing.
3. **`D-RES12-1` / F1 — give `DzToolbar` the roving focus its `role="toolbar"` promises.**
   The single largest accessibility gap the measurement found: a declared APG toolbar with no
   key handling at all. Reka's `RovingFocusGroup` is already installed and is what every
   other roving row in this library uses, so the fix is composition rather than invention.
   4 of the 28 unbacked rows, and the ceiling falls to 24 in the same change.
4. **`D-RES12-1` / F9 — `DzListItem`'s Enter/Space.** A focusable row with an `@click` and no
   key activation is a genuine SC 2.1.1 failure, and it is the one item on this list where
   *deleting the declaration would hide a defect*. It needs an emit-signature decision
   (`DzListItemEmits` types `click` as a `MouseEvent`), which is why it is a decision and not
   a patch.
5. **F12 — decide what else in axe's `incomplete` bucket should be gated.** This batch
   closed one rule on two components and left a helper any a11y spec can use. The shape that
   stays true is a rule at a time with a reason each, plus a ratchet on how many rules are
   admitted — not a blanket assertion, which measurement says would be red on arrival.
6. **F13 — give `DzChip` and `DzTag` a message catalogue.** Their remove button is named
   `` `Remove ${ariaLabel ?? ''}` ``, so an unnamed chip's icon-only button is named the
   literal `"Remove "`, and `"Remove"` is untranslated on a published component. axe passes
   because a name exists.
7. **F14 — settle whether a keyboard row's `when` may name a prop.** 12 live values do;
   `checkKeyboardContract` calls that *"almost always a typo"*; nothing calls
   `checkKeyboardContract`. Either the contract should say so or the rule should be enforced.
   Ten minutes of decision, and it is the kind of unenforced rule this programme keeps
   finding.
