# Execution status — form-controls-readiness-tasks.md

> Live ledger for the synchronous run of `form-controls-readiness-tasks.md`
> (FORM-OSS-01 → 04). Started **2026-08-24** against `ui/dzup-ui` `main` @
> `8d80bc3`, clean worktree.
> Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on owner decision
>
> **Nothing here is committed, pushed, dispatched to CI, or published** — every
> packet stops at "locally qualified" per README §3 `<authority>`.

## Custody re-verification (README §2)

| Claim | State on 2026-08-24 at run start |
|---|---|
| `ui/dzup-ui` `main`, worktree state | Clean. `main` @ `8d80bc3`. Nothing to preserve. |
| Foundation packets P0–P5 | All `[x]` in `EXECUTION-STATUS.md`; its own "Ranked next packet" lists **FORM-OSS** as item 4, and the three ahead of it are not prerequisites of anything here. |
| Pro checkout | Still `esmir`, still behind. Nothing here consumes a Pro manifest — FORM-OSS is deliberately startable before Pro's FORM-00 admission. |
| Baseline test state | `vitest run packages/core/src/components/{forms,inputs}` → **72 files, 947 passed**, before any edit. |

## Progress

| Task | Status | Result |
|---|---|---|
| TASK-FORM-OSS-01 | `[x]` | Contract C1–C9 written; readiness matrix **generated**, not typed. Opened at 84 gaps. New `validate:form-readiness` gate in `validate:all`. |
| TASK-FORM-OSS-02 | `[x]` | 84 gaps → 3, in five family slices. Every Core control's value is now on the default model; every declared state reaches the DOM; all 39 controls have an SSR spec. |
| TASK-FORM-OSS-03 | `[x]` | One async-options seam across all seven selection controls; `DzFileUpload` reference mode; ten value codecs in `@dzup-ui/contracts`. |
| TASK-FORM-OSS-04 | `[x]` | `revealItem` + `revealed` on the three disclosure primitives, `useRevealAndFocus`, `DzStepper` gating, a **Layouts** section in the matrix. |

## Where the matrix ended

44 rows (39 controls + 5 layout primitives) × 9 clauses.

| Clause | | ✅ | ⛔ | 🕓 | ◻ | – |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| C1 | value | 31 | 0 | 0 | 5 | 8 |
| C2 | identity | 38 | 6 | 0 | 0 | 0 |
| C3 | states | 44 | 0 | 0 | 0 | 0 |
| C4 | messages | 35 | 0 | 0 | 0 | 9 |
| C5 | SSR | 44 | 0 | 0 | 0 | 0 |
| C6 | RTL | 3 | 0 | 0 | 41 | 0 |
| C7 | motion | 5 | 0 | 0 | 0 | 39 |
| C8 | keyboard | 30 | 0 | 0 | 3 | 11 |
| C9 | async | 8 | 0 | 5 | 5 | 26 |

**All six remaining gaps are one parked owner decision** (below). C6's 41
`unrun` is P4-05's anatomy rollout and is not this program's to close.

---

## TASK-FORM-OSS-01 — the audit

### The decision worth making was to write a program, not a table

The task asked for a matrix. A matrix typed by hand would have been accurate on
2026-08-24 and decorative by the time FORM-OSS-02 started flipping cells in it —
this repository has already paid that bill twice, once for a README package
table where five of six rows named a stale version, once for a `PRO_COMPONENTS`
list that classified components by prefix.

So the matrix is generated from four sources and gated: the **roster** from
`component-ownership.manifest.json`, the **facts** from re-reading source every
run, **C6 and C8 delegated** to the RTL declarations and `quality-matrix.json`
because P4-05 and P5-01 already own those questions, and the **judgments** from
a reviewed file with a date and a citation per cell. Where the two halves
disagree on a source-decidable clause, **source wins**, and a spec asserts that
rather than a comment claiming it.

### What the audit found

**Seven controls bound their value to `v-model:value` and nothing else.** A
registry entry binding `v-model` generically did *nothing* on them: no error, no
warning, a control that renders and never reports a value.

**Thirteen public props were declared, defaulted, and read nowhere.** Not
deprecated, not partial — referenced nowhere but their own `withDefaults` entry.
The type said the renderer could wire it; the DOM said otherwise; nothing failed.

**`DzFileUpload`'s model was `File[]`** — binary in a value that gets persisted
as JSON, with a `File` in the error payload too.

**The field context pointed `aria-describedby` at an element that may not
exist**, for all 32 controls that inject it, because `descriptionId` was pushed
unconditionally and most fields have no description.

**`DzFormMessage` set `role="alert"` and `aria-live="polite"` on one node** —
`alert` implies assertive and wins, so every standing field error interrupted.

**26 of 39 controls had no SSR spec at all**, including all three pickers.

**`DzNumberInput` announced a value it did not hold**: cleared to `undefined`,
emitted `change` with `0`.

**Only 11 of 39 extended `BaseFormControlProps`** — which is how `readonly` and
`loading` came to be absent from seventeen selection controls. Not decided;
never inherited.

### Four defects in the checks themselves, all found by running them

The first probe reported **`DzInput` — the contract's own reference
implementation — as failing C2**, because it looked for a variable named
`resolvedInvalid` and `DzInput` calls it `isInvalid`. A check that reports the
reference implementation as broken is wrong about the rule. It now detects the
*context member* each axis reads, which is naming-independent.

The second flagged `window` in `DzMention` as an SSR failure — a
`window.setTimeout` inside a blur handler, which cannot run on a server. The
brace-counting scanner lost depth on a generic type argument. Replaced with a
character scanner that tracks strings, template literals and comments; a spec
pins that exact case.

The third reported **21 of 39 controls as motion gaps** because `transition-`
matched `transition-colors`. A focus ring changing colour is not a vestibular
hazard, and a check demanding a `motion-reduce` beside every one of them would
have been switched off within a week and taken the real finding with it.
Narrowed to transforms and named animations: 21 → 1, and the 1 was real.

The fourth: `withDefaults` was matched with `\n\)` where the block closes with
`\n})`. The looser pattern ran past it and swallowed half the component, making
every prop below it look read.

### The correction that mattered most: C3 contradicted ADR-19

The first C3 rule required `data-state` to hold only the values in the global
`DataState` union, and reported 21 components for violating it — including
`DzInput`, whose **anatomy declares `states: ['disabled','loading','readonly']`**.

ADR-19 §4 had already decided the opposite: `data-state` is a *per-component
enum declared in that component's anatomy*, and the global union widens to
`string`. The rule was not a stricter reading of the contract; it was a
different contract, and acting on it would have "fixed" 21 components in a
direction the ADR rejected. C3 now checks the presence-only booleans (which is
what a renderer reads) and validates `data-state` against the component's own
declaration, with no anatomy meaning `unrun` rather than failing.

Caught before any component was touched, which is the argument for auditing
before fixing.

---

## TASK-FORM-OSS-02 — closing the gaps, five slices

84 → 3. Each slice validated on its own before the next started.

### Slice 1 — `inputs/` (14 gaps)

`data-readonly` on five controls that passed `readonly` to the native element
and told no stylesheet about it. `DzOtpInput` implements `required`.
`DzInputGroup` honours the three ARIA props it inherited and ignored.
`DzInputMask` gains `modelMode`, so a form can persist the stripped value
instead of a string formatted for a mask that may change.
`DzNumberInput.change` carries `number | undefined` and stops announcing `0`
for a cleared field.

**A defect in my own fix, caught by the test written for it.**
`:aria-invalid="ariaInvalid"` emits `aria-invalid="false"` on every group,
because `ariaInvalid` is typed `boolean | 'grammar' | 'spelling'`, Vue may
declare it a Boolean prop, and an `aria-*` binding renders `false` as the
string rather than dropping the attribute. A follow-up spec then established
that the `??` chains every other control uses are safe — the union type
compiles to `[Boolean, String]` and the absent-means-false cast does not apply.
Written down as a spec rather than a comment, because the reasoning is not
obvious from either the code or the docs.

### Slice 2 — selection (25 gaps)

`useDualModel`: `DzCascader` and `DzTreeSelect` take both `v-model` and
`v-model:value`, and the composable is what the remaining five used later.

Six props that were declared and read nowhere now reach the DOM.
`data-required` on six controls that already rendered `aria-required` (Reka
supplies it) but not the presence-only attribute ADR-19 names.
`DzRadioGroup` merged required, describedby and invalid from `DzFormField` and
**not disabled**, so every radio in a disabled field stayed live. `DzRadio` read
no context at all.

**`DzSelect` server-rendered an empty placeholder for a field with a value.**
`SelectValue` resolves its label from Reka's item registry, which fills when the
*content* mounts — and content never mounts during SSR. The label is now
computed from `items`. The first attempt supplied slot content unconditionally,
which replaced the placeholder too and emptied the accessible name of every
unset select; four existing specs caught it.

**`DzPersonaSelector` was never broken.** It renders a `DzCombobox`, and
injection walks the component tree. The matrix now records the delegation
instead of reporting three gaps against a wrapper that correctly does nothing.

### Slice 3 — date, time, file (9 gaps)

`data-required` across the four. **`DzFileUpload` computed an id and rendered it
nowhere** — no `id` in the DOM at all, so a `DzFormLabel`'s `for` named nothing
and clicking the label did nothing. It is on the drop zone, not the hidden
`<input>`, which is `aria-hidden` and `tabindex="-1"`.

### Slice 4 — sliders, knob, rating, colour (12 gaps)

Dual models for `DzKnob` and `DzRating`; `data-required` across five;
`data-loading`/`aria-busy` for two `loading` props that were read nowhere;
`DzColorPicker`'s id merged with the field context.

**A hypothesis tested and rejected.** The SSR spec found `DzSlider` rendering
`aria-valuemin` and no `aria-valuenow`, and setting it from Core looked like the
fix. It is not: Reka binds the attribute itself and wins over a fallthrough, and
the thumb is `display:none` on the server anyway, so nothing is announced either
way. Reverted, and the spec now asserts the deferral so a future Reka that
changes it is noticed rather than assumed.

### Slice 5 — compound and advanced (19 gaps)

The last five named models. `data-required`/`data-readonly`/`data-loading` on
`DzTagsInput` and `DzMention`. `DzInplace`'s `id` bound.

**`DzFieldArray` gives each row its own ids.** Every row of a repeater sits
inside one `DzFormField`, so every control in it resolved to the *same* id — a
label for row 1 could activate row 3, and an `aria-describedby` could name
another item's error. The default slot now receives `fieldId`, `descriptionId`
and `messageId` per row, which is spec 04 §8's "collision-free control/help/error
IDs per form instance and array item".

**The field context stopped naming elements that are not there.** And doing it
correctly needed two mechanisms rather than one: registration-on-mount cannot
work during SSR, because children render in order and there is no second pass —
a control serialised before the description's `setup` ran would omit the id and
the client would add it, which is a hydration mismatch on an accessibility
attribute and worse than the dangling id it replaced. `DzFormField` walks its
slot synchronously; registration remains the catch-all for a description
rendered by an intermediate component. **The SSR spec is what found this** —
the first fix passed every component test and failed the moment it was rendered
on a server.

**Five specs failed on the first full run and all five were correct**, asserting
the behaviour that had just been fixed. Each was updated with the reason beside
it rather than the expectation swapped.

---

## TASK-FORM-OSS-03 — the seams

**One async-options contract**, not seven: `AsyncOptionsProps`,
`AsyncOptionsEmits`, `useAsyncOptions`, and one `DzOptionsState` row component
used by all seven selection controls — rather than seven copies of a
`role="status"` block, the sixth of which stops matching the first within a
year. Five states rather than a boolean `loading`, because a failed load and a
successful one that returned nothing are not the same thing.

Core never performs the request. Every request supersedes the last and **aborts
its signal before emitting**, so a host that fences on the signal never has two
in flight.

**`DzFileUpload` reference mode.** `model-mode="ref"` binds `DzFileRef[]`; the
binary reaches the host through `uploadRequest` and never enters the model.
Removing a row that is still uploading aborts it.

**Ten value codecs.** Two are worth reading before use: `isEmptyValue(false)` is
**false** — an unchecked box has answered — and `toIsoDate` takes date *parts*,
not a `Date`, because `new Date('2026-08-24')` is midnight UTC and formats as
the 23rd in any negative offset.

### Three things this packet got wrong first

**A test of my own asserted an invariant that is false.** "Every kind's empty
value reports itself empty" fails on `boolean`: the empty value is `false` and
`isEmptyValue(false)` is `false`, deliberately. The two functions are not
inverses and C1.7 is exactly that distinction. The assertion now states it,
because the obvious invariant is wrong and the next person to assume it will
write it as a test.

**A duplicate request, caught by a contract spec.** `DzSelect` asked for options
on mount *and* the composable did, one tick apart — so the composable aborted
the first, and a host fencing on the signal would have dropped a response it had
already started fetching. Found by the assertion that the first request is *not*
aborted.

**A template insert broke a `v-if`/`v-else` pair.** The state row went between
`DzCascader`'s filter branch and its `v-else`, so the columns rendered
unconditionally. A filter spec caught it; the row is now the first branch of the
chain in all three panels that have one.

### Where the codecs live, and why it was not a free choice

They are in `@dzup-ui/contracts`, which is types-only with a stated exception for
`assertNever` — these are the same kind of thing, and Pro already depends on it.

They **could not** go in `@dzup-ui/core`. Its public surface is generated from
`public-api.manifest.json`, the ownership schema has no `utility` kind, and the
`unclassified` ceiling of 29 **only ratchets down**. Ten more functions of the
class `cn` and `themeScript` already occupy would have taken it to 39. The
ratchet exists to stop exactly that, so the decision is requested below rather
than taken.

### A near-miss worth recording

Regenerating `packages/core/src/index.ts` with `generate:exports` **silently
removed five composables from the public API**. The barrel carries a hand-written
warning saying it is not regenerated, because the manifest and the barrel have
drifted and resolving that drift is a recorded owner decision (TASK-OSS-P0-01
finding 2) — `useAffix`, `useCalendar`, `useInfiniteScroll`, `useScrollSpy` and
`useScrollToTop` would have been dropped and `useCountdown` and `useIntersection`
added, as a side effect of adding a composable.

Restored from `HEAD` and the two new composables added by hand the way the file
instructs, with manifest entries so a regeneration keeps them on the day the
drift is resolved. The warning was right there and I ran the generator anyway;
it is recorded here so the next person reads it first.

---

## TASK-FORM-OSS-04 — layouts

`revealItem(id)` + `revealed` on `DzTabs`, `DzAccordion` and `DzStepper`;
`useRevealAndFocus`, which returns **the element that actually holds focus, or
`null`** — because `focus()` on a node in a hidden panel is a silent no-op and
the caller otherwise has no way to find out.

`DzStepper.beforeChange` is a **boolean guard and nothing more**: the stepper is
never told what validation is. It is awaited even when synchronous, so an async
validator does not flash the next step. `linear` tracks the furthest step
reached, so a user can go back to step 1 and jump straight to 3 — which is what
"cannot skip ahead" means to a person filling in a form. A refusal emits
`blocked` with a reason, because a Next button that silently does nothing is
indistinguishable from a broken one. **`revealItem` bypasses the guard**: it is
how a form takes the user *to* an error.

`DzAccordion` honours `prefers-reduced-motion`; its panel animation and chevron
both ran regardless.

**Two of my own tests could not fail.** The first two guard tests clicked a step
and then asserted *conditionally* — `if (the guard was called)` — which passes
whether or not the guard exists. Rewritten to drive the stepper's own
`setActiveStep` through the provided context, which is the path a real click
takes and either runs or throws.

**`DzGrid` and `DzStack` were audited and are sound on direction**: CSS grid and
`flex-direction: row` are writing-mode relative, so `dir="rtl"` orders them with
nothing to configure.

---

## Not done

**`DzGrid` has no span API.** A renderer's "this field takes two of three
columns" is a raw `class` on the child. Adding a `DzGridItem` or a `span` prop
is an owner decision; a test asserts the absence so it is not mistaken for an
oversight.

**`DzStack` speaks a different vocabulary** — `horizontal`/`vertical` where a
renderer's layout node says `row`/`column`, and `direction="row"` silently falls
back to vertical.

**41 of 44 rows are `unrun` on C6.** They declare no RTL contract, which is
P4-05's anatomy rollout (7 of 144 catalog-wide) and not this program's to close.

**No story was authored for the async-options states.** The seam has contract
specs and SSR coverage; a `play()` story walking loading → ready → error → retry
is listed in the task and is not written.

**No browser run.** Everything here is jsdom and SSR. The Playwright matrix was
not run, so nothing claims browser or AT evidence.

**`DzMention` did not get the shared seam.** It has its own suggestion menu and
wiring it needs that menu to render the state rows — a bigger change than the
six selection controls took, and recorded as `future` rather than done quietly.

## Unresolved owner decisions

1. **The ownership schema needs a `utility` kind.** Ten pure codec functions are
   in `@dzup-ui/contracts` because Core's `unclassified` ceiling could not take
   them. `cn`, `themeScript`, `getThemeScript` and `DzResolver` are already
   carried there. Until the kind exists, every new pure helper faces the same
   choice.
2. **Six controls declare ARIA props they cannot honour.** `DzFloatLabel` (four),
   `DzStepper` (three), `DzInplace` (two), `DzTabs`, `DzGrid`, `DzStack` (one
   each). Binding them to a wrapper `<div>` would be equally meaningless and
   harder to notice. Removing them is a breaking type change. They are listed as
   `inertProps` with a reason each and are the **only six open gaps in the
   matrix**.
3. **`DzNumberInput.change` and `DzFileUpload`'s model are type changes.** The
   first widens to `number | undefined` — the point, since `0` and "cleared"
   were indistinguishable. The second widens to `File[] | DzFileRef[]`. Both are
   minors with a note; neither changes default runtime behaviour.
4. **The `time` profile has no offset.** `DzTimePicker` emits local wall-clock
   `HH:MM`, which is deliberately not JSON Schema `format: time`. Named in C1.5;
   the zone belongs to the renderer's codec.
5. **`DzGrid` span and `DzStack` vocabulary**, above.

## Focused validation output

```
yarn lint (packages/ apps/)         → ✓ 0 errors, 0 warnings
yarn typecheck (core)               → ✓ 0 errors
tsc -p packages/contracts           → ✓ 0 errors
vitest packages/core                → ✓ 337 files, 4,427 passed, 2 skipped
vitest packages/contracts + tooling → ✓  43 files,   654 passed, 1 todo
                                       ── 5,081 passing, from 947 at the baseline

24 validators, each run individually → all exit 0, including the new
   validate:form-readiness (44 controls, 238 pass, 6 gap, 5 future, 54 unrun, 93 n-a)
```

Two gates were **already failing at `8d80bc3`** and are fixed here as a side
effect of regenerating: `validate:at-matrix` (the index's `componentCommit` for
`DzFileUpload` still named `4c9fb7a`) and the ownership manifest's own
`sourceCommit`. Neither was caused by this program; both are noted because the
P5 ledger records a green `validate:all` for a commit that left them stale.

`yarn build`, `yarn storybook:build`, `yarn test:e2e` and the browser matrix
were **not** run. Nothing here claims packaged, browser or AT evidence.

## Ranked next packet

1. **Pro FORM-00 admission.** Everything OSS owes the renderer is in place and
   written down; the consumer census and the adapter decision are Pro's.
2. **The six inert ARIA props.** One decision, six components, and it is the
   only thing standing between the matrix and zero open gaps.
3. **The async-options stories.** The seam has specs; a `play()` story per
   selection control is what makes it reviewable by eye.
4. **`DzGrid` span.** The one layout capability a renderer needs and cannot
   express.
