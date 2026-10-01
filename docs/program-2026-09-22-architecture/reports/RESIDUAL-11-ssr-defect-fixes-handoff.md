# RESIDUAL-11 — fixing the five defects the SSR assertion sweep found

**Tree:** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` + uncommitted worktree (the
16-task programme + RESIDUAL-01…10, uncommitted **by design** — the owner commits).
**Run:** 2026-09-28. **Repository:** `ui/dzup-ui` (OSS, `@dzup-ui/*`) only.

> **Written incrementally.** Each section was appended as soon as its evidence
> existed. Four agents in this session stalled mid-task and only the
> already-written sections survived. A section that is present is measured.

## 0. The batch, and the entry state measured before anything was touched

RESIDUAL-10 §7.2 raised five defects. This batch is the packet that dispositions
all five, in the order RESIDUAL-10 ranked them.

| id | severity | defect | disposition | section |
|---|---|---|---|---|
| `D-RES10-1` | 🔴 | `DzStepperItem` assigns its index in `onMounted`, which never runs during SSR | **FIXED** — index claimed during `setup`. Hydration now rewrites **0 bytes**. RESIDUAL-10's *"hydration mismatch"* is corrected: there never was a Vue warning, which is worse | §1 |
| `D-RES10-2` | 🟡 | `DzMegaMenu` renders `ul[role="menubar"] > li` with no role on the `li` | **FIXED** — `role="none"` on the expanded branch only. **Three** axe rules fired, not the two predicted | §2 |
| `D-RES10-3` | 🟢 | `DzChip` is `role="status"` on every chip | **FIXED** — role removed; the chip now matches `DzTag`. One cost measured and raised as `D-RES11-1` rather than hidden | §3 |
| `D-RES10-4` | 🟢 | `DzDataView` announces "No items" twice | **FIXED** — recommendation (c): the window region reports the count, the empty state reports the title. One story play function was asserting the defect | §4 |
| `D-RES10-5` | 🟢 | `DzSelect` ships `value="__DZ_SELECT_EMPTY__"` | **HALF LOAD-BEARING, HALF FIXED** — the item mapping stays (Reka throws on `''`), the root mapping goes. **Not hygiene:** it was suppressing the placeholder's own styling | §5 |

**Outcome: five raised, five dispositioned, none deliberately left unfixed** — and two
new findings raised from the investigations (`D-RES11-1`, `D-RES11-2`, §9.2). Two of
RESIDUAL-10's own statements are corrected with measurements: `D-RES10-1` produced **no**
hydration mismatch (§1.2), and `D-RES10-5` was **not** cosmetic (§5.2).

```
git rev-parse HEAD                                   ->  4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a
git status --porcelain | wc -l                        ->  333
```

The full `git status --porcelain` **listing** (not the count) was snapshotted to
the session scratchpad **outside** the repository, by a command that creates
nothing inside it, before any file was read for editing.

### 0.1 The versioning position each fix ships in, decided once from the policy

`packages/contracts/VERSIONING.md` §3 settles four of the five without argument:

> **Correcting a rendered accessibility attribute is a `patch`.** Removing a
> dangling `aria-describedby` id, dropping an `aria-live` that conflicts with
> `role="alert"`, fixing a token that fails WCAG AA contrast: these change what
> the browser sees and can break a consumer's own DOM snapshot, and they still
> ship as a patch.

And §2.2 settles the structural half: *"DOM structure. **A part is a promise
about identity, not about structure**"* — so an attribute added to an existing
element is not a contract change, and no `*.anatomy.ts` `parts` or `states` list
moves in this batch. Checked, not assumed: `DzStepperItem.anatomy.ts` already
declares `states: ['upcoming', 'active', 'completed']`, which is the enum the
`D-RES10-1` fix makes *correct* rather than the enum it changes.

So **every changeset in this batch is `@dzup-ui/core: patch`.** `major` is
refused by `validate:release-policy` under the 0.x rule and `minor` is reserved
for a break; none of these five removes, renames or narrows anything in the five
surfaces VERSIONING.md §2 enumerates.

---

## 1. `D-RES10-1` 🔴 — `DzStepperItem`'s index. **FIXED.**

### 1.1 What was measured before anything was touched

Rendered through the same helper `ssr-smoke.spec.ts` uses, three times, with the
only variable being the model:

| render | bytes | `data-state` sequence | `aria-current` | check-mark `<svg>` |
|---|---:|---|---:|---:|
| `modelValue: 0` | 2,706 | `ready` · `completed` · `completed` · `completed` | **0** | **3** |
| `modelValue: 1` | 2,706 | `ready` · `completed` · `completed` · `completed` | **0** | **3** |
| `modelValue: 2` | 2,706 | `ready` · `completed` · `completed` · `completed` | **0** | **3** |

**Identical byte counts and identical states for three different models.** That
is stronger than RESIDUAL-10 stated: the server HTML of a stepper did not depend
on `modelValue` in any way. The first entry of each sequence is the root's own
`ready` state; the other three are the steps.

### 1.2 The correction to RESIDUAL-10's finding 1 — there was no hydration mismatch

RESIDUAL-10 §3.1 finding 1 says *"it is also a hydration mismatch on every stepper
that server-renders."* **Measured: it is not, and that is worse.**

The server HTML was hydrated into a real jsdom container with `console.warn` and
`console.error` captured:

```
hydration console output          0 line(s)
server HTML                       2,706 bytes   states ready·completed·completed·completed
DOM immediately after hydration   2,317 bytes   states ready·completed·active·upcoming
                                                aria-current  0 -> 1      <svg  3 -> 1
```

Vue said nothing because the client's **first** render agreed with the server —
both had `stepIndex === -1`, so hydration matched exactly. The correction arrived
*after* hydration, in `onMounted`, as an ordinary reactive patch. So the defect
was not a mismatch Vue could report; it was a **silent 389-byte DOM rewrite** that
no warning, no gate and no test could see: a flash of wrong content claiming a
wizard is finished, with nothing in any log.

This matters for the fix's proof, and §1.6 uses it. The assertion that holds the
fix cannot be *"no hydration warning"*, because there never was one. It has to be
*"hydrating the server HTML changes nothing"*.

### 1.3 The fix, and why `setup` rather than the other two options

RESIDUAL-10 §7.2 offered (a) register during `setup`, (b) derive the index from the
parent's child list at render time, (c) document that a stepper must not be
server-rendered. **(a)**, as recommended, for reasons that were checked rather
than assumed:

- **How the families that already work in SSR solve it.** `DzTabTrigger`,
  `DzTabContent` and `DzRadio` all take an explicit `value` prop — an identity
  supplied by the caller, resolved during render, correct on the server. `DzList`
  and `DzListItem` inject a context and read it in `computed`s during `setup`;
  neither has a registration step at all. Measured across the whole component
  tree: **`registerStep` is the only positional-counter registration in
  `packages/core/src`** (`DzCarousel`'s `registerSlide` is the only other
  `register*` in any context type, and it returns an *unregister function*, not an
  index). So there was no in-repo mechanism to copy, and the nearest working
  family resolves identity during render. `setup` is when render-time identity is
  available.
- **Giving `DzStepperItem` a `value` prop** — the `DzTabTrigger` shape, and the
  most robust answer — is **not** available here: `DzStepper`'s model is
  `defineModel<number>()`, a positional index, so an item's identity *is* its
  position. Adding a required `value` is a breaking API change on a published
  component for a defect a five-line change fixes.
- **(b), deriving from the parent's slot vnodes**, breaks on any wrapper: a
  `v-for`, a `<template>`, or a consumer's own `<div>` between the stepper and its
  items all change the vnode shape while leaving document order intact.
- **(c)** is a documented defect, not a fix.

```
packages/core/src/components/navigation/DzStepperItem.vue

-import { computed, inject, onMounted, ref, useAttrs } from 'vue'
+import { computed, inject, useAttrs } from 'vue'

-const stepIndex = ref(-1)
-onMounted(() => { if (ctx) { stepIndex.value = ctx.registerStep() } })
+const stepIndex = ctx ? ctx.registerStep() : -1
```

…plus the five `.value` reads that followed it, and a 25-line comment recording
the measurement above so the next reader does not have to re-derive it.

**A plain `const`, not a `ref`.** A step's position is fixed for the life of the
instance; the reactivity `status` needs is `ctx.activeStep`, not this. Keeping it
a `ref` would advertise a mutability that does not exist.

### 1.4 What was checked before moving the call, and what did NOT change

| question | answer, measured |
|---|---|
| does anything read `totalSteps` (the counter `registerStep` advances)? | **No.** Grepped `packages/*`: `totalSteps` is *provided* by `DzStepper.vue:94` and read by nothing in this repository. It is part of the published `DzStepperContext`, so an external consumer could inject it — which is why the counter's semantics were left alone |
| does the context type change? | **No.** `registerStep: () => number` and `totalSteps: Ref<number>` are untouched, so the `DzStepperContext` signature recorded under `packages/tooling/api-surface/` still matches. Only the moment of the call moved |
| does mutating `stepCounter` during a child's `setup` re-enter the parent's render? | **No.** `DzStepper`'s render function does not read `stepCounter`; nothing does. Proved by the suite rather than argued — 37 client-side stepper tests and the whole 575-file suite are green, with no `Maximum recursive updates` warning anywhere in the log |
| can hydration double-register? | **No.** The counter lives on the `DzStepper` instance, and SSR and hydration are separate instances each starting at 0. Proved by §1.5: the two renders produce byte-identical HTML, which they could not if the client's indices were offset |
| does the declared state enum change? | **No.** `DzStepperItem.anatomy.ts` already declares `states: ['upcoming', 'active', 'completed']`. The fix makes that declaration *true* on the server; it does not alter it. No `*.anatomy.ts` was edited in this batch |
| do the two stepper behaviour specs depend on the old timing? | **No.** `DzStepper.gating.spec.ts` drives `setActiveStep` through the injected context and never reads an index; `DzStepper.spec.ts` already `await nextTick()`s before asserting clickable state, which a setup-time index satisfies trivially. Both were read in full before the edit and neither was changed |

### 1.5 After the fix — measured the same three ways

| render | bytes | `data-state` sequence | `aria-current` | check-mark `<svg>` |
|---|---:|---|---:|---:|
| `modelValue: 0` | 2,170 | `ready` · **`active`** · `upcoming` · `upcoming` | **1** | **0** |
| `modelValue: 1` | 2,349 | `ready` · `completed` · **`active`** · `upcoming` | **1** | **1** |
| `modelValue: 2` | 2,528 | `ready` · `completed` · `completed` · **`active`** | **1** | **2** |

Three different models, three different renders, exactly one current step each,
and a check-mark count equal to the number of steps actually behind the user.

**And hydration now changes nothing:**

```
hydration console output          0 line(s)        (as before — there was never a warning)
server HTML                       2,349 bytes
DOM immediately after hydration   2,349 bytes
container.innerHTML === serverHtml            ->  TRUE
server states   ready·completed·active·upcoming
client states   ready·completed·active·upcoming
```

### 1.6 The assertions that hold it, and the seeded break that proves they discriminate

Three assertions, in two files, all on SSR output:

| file | block | what it now requires |
|---|---|---|
| `packages/core/tests/ssr/ssr-smoke.spec.ts` | `dzStepper renders one step per item in SSR` | rendered with **three** items and `modelValue: 1`: the full ordered state sequence `['ready','completed','active','upcoming']`, **exactly 1** `aria-current="step"`, the current-state/`aria-current` pair adjacent on one element, **exactly 1** `<polyline` (the check mark — nothing else in the render emits one), and the two un-completed indicators printing `['2','3']`, since a step that never resolved its index prints `0`. This replaces the deliberate *"NOT asserted here"* comment RESIDUAL-10 §2.4 left in exactly this block |
| `packages/core/tests/ssr/form-layouts-ssr.spec.ts` | `dzStepper renders the active step on the server` | the title's own claim, which its two `toContain(title)` calls did not check: a completed state ordered before an active one, and exactly one `aria-current="step"` |
| `packages/core/tests/ssr/form-layouts-ssr.spec.ts` | **new** — `dzStepper hydrates its server HTML without rewriting a single byte` | `renderToString` → `container.innerHTML = html` → `createSSRApp(...).mount(container)` → `await nextTick()` → **`container.innerHTML` is exactly the server string**. This is the §1.2 finding turned into a gate: the defect produced no warning, so only an equality holds it |

**Seed A, on component source, restoring the exact defect.** Not an invented
mutation — the *original* code put back: `ref(-1)`, the `onMounted` registration,
and the five `.value` reads.

```
node node_modules/vitest/vitest.mjs run  <ssr-smoke> <form-layouts-ssr> \
     <DzStepper.spec> <DzStepper.gating.spec> <DzStepper.contract.spec>
  ->  exit 1     Test Files 2 failed | 3 passed (5)
                 Tests      3 failed | 105 passed | 1 skipped (109)

FAIL  sSR: navigation > dzStepper renders one step per item in SSR
      AssertionError: expected [ 'ready', 'completed', …(2) ] to deeply equal [ Array(4) ]
        - "active",  - "upcoming",   + "completed",  + "completed",
FAIL  sSR: form layouts … > dzStepper renders the active step on the server
      expected '<div data-part="root" …' to match /data-state="completed"[\s\S]*data-state="active"/
FAIL  sSR: form layouts … > dzStepper hydrates its server HTML without rewriting a single byte
      expected  …completed…completed…completed…                       (the server string)
          to be …completed…active" aria-current="step"…upcoming…       (the DOM one tick later)
```

**Three failures, and they are the three claims.** The precision is in what stayed
green: **all 37 client-side stepper tests** — `DzStepper.contract.spec.ts` (6),
`DzStepper.gating.spec.ts` (12) and `DzStepper.spec.ts` (19) — passed under the
seed, because the defect is server-only and those specs mount. A seed that
reddened the stepper family would not have shown that. And the third failure's own
diff *is* the §1.2 finding, printed by the runner: *expected* (the server) says
`completed · completed · completed`; *received* (the DOM one tick later) says
`completed · active · upcoming`.

**Restore, proved byte-identical — all five of this batch's target files at once:**

```
sha256sum -c before.sha256
  packages/core/src/components/navigation/DzStepperItem.vue: OK
  packages/core/src/components/navigation/DzMegaMenu.vue: OK
  packages/core/src/components/data/DzChip.vue: OK
  packages/core/src/components/data/DzDataView.vue: OK
  packages/core/src/components/forms/DzSelect.vue: OK          exit 0
vitest run packages/core/tests/ssr/ packages/core/src/components/navigation/DzStepper
  ->  exit 0     9 files passed · 183 passed | 1 skipped
```

`git checkout` was **not** used anywhere in this batch. Every restore is a byte
copy from a backup taken in the session scratchpad, outside the repository.

### 1.7 Changeset

`.changeset/a-server-rendered-stepper-no-longer-says-every-step-is-done.md` —
`@dzup-ui/core: patch`, per VERSIONING.md §3. It names the rendered-output change
explicitly, because a consumer who snapshots a server-rendered stepper will see
the snapshot move — and it says what the old snapshot recorded.

---

## 2. `D-RES10-2` 🟡 — `DzMegaMenu`'s menubar owning a `listitem`. **FIXED.**

### 2.1 What was measured

```
DzMegaMenu  items: [{Products,/products}, {Docs,/docs}]   ->  1,571 B

<nav data-part="root" …>
  <ul role="menubar" aria-orientation="horizontal" data-part="list" …>
    <li class="relative">                                   <-- no role
      <a href="/products" role="menuitem" … tabindex="0">Products</a>
    <li class="relative">                                   <-- no role
      <a href="/docs" role="menuitem" … tabindex="-1">Docs</a>
```

**RESIDUAL-10 predicted two axe rules. Measured: three.** The third was found by
writing the fix, seeding it away and running axe over the result (§2.4), which is
the only way the count could have been established:

| rule | element it fires on | axe's own words |
|---|---|---|
| `aria-required-children` | the `<ul>` | *"Element has children which are not allowed: `li[tabindex]`"* |
| `aria-required-parent` | **each `<a role="menuitem">`** — not the `<li>` | *"Required ARIA parents role not present: menu, menubar, group"* |
| **`listitem`** — not predicted | each `<li>` | *"List item parent element has a role that is not `role="list"`"* |

The second one is worth reading twice: the violation lands on the **menu item**,
because a broken menubar ownership leaves the menu item with no menubar above it
in the accessibility tree. So the consequence is not only *"the `<ul>` has an odd
child"* — it is that neither menu item is in a menubar at all.

### 2.2 The fix

`role="none"` on the expanded branch's `<li>` — RESIDUAL-10's recommendation (a),
one attribute, no pixel change. Verified against the **vendored** `axe-core`
rather than against the spec from memory: `getOwnedRoles` resolves each child with
`getRole(vNode, { noPresentational: true })`, which returns `null` for a
presentational role, and then — when the element also has no global ARIA attribute
and is not focusable — pushes that element's *children* onto the queue. So axe
descends **through** a presentational wrapper and finds the `menuitem` the menubar
is meant to own.

That `and` is a condition the fix depends on, so the test asserts it (§2.3): a
presentational role is ignored by the browser, and by axe, if the element becomes
focusable or gains a global ARIA attribute.

**The collapsed disclosure branch was deliberately left alone.** Its `<ul>` has no
role, so there the `<li>` is a genuine `listitem` in a genuine `list`, and giving
it `role="none"` would break the branch that is currently correct.

### 2.3 What holds it, and a trap this batch walked into and recorded

| file | block | requires |
|---|---|---|
| `packages/core/tests/a11y/navigation.a11y.spec.ts` | **new** `dzMegaMenu > has no a11y violations on the expanded menubar` | `toHaveNoViolations()` over the rendered menubar. **This family had no entry in this file at all before now**, which is half of why the defect survived |
| `packages/core/tests/a11y/navigation.a11y.spec.ts` | **new** `dzMegaMenu > puts no listitem between the menubar and its menu items` | every element child of `[role="menubar"]` is an `LI` with `role="none"` owning exactly **1** `[role="menuitem"]`; **no** `tabindex` and **zero** `aria-*` attributes on the wrapper (the condition §2.2 names); and all three rule ids absent from **both** `violations` **and** `incomplete` |
| `packages/core/tests/ssr/ssr-smoke.spec.ts` | `dzMegaMenu renders one linked menu item per item in SSR` | **exactly 1** `<li role="none"`, and the ordering `menubar … <li role="none" … menuitem` in the server string. Replaces the *"NOT asserted"* comment RESIDUAL-10 §2.4 left in this block |

`incomplete` is searched as well as `violations`, and the reason is a measured
difference from RESIDUAL-06 rather than caution: `DzCarouselDots`' childless
`tablist` was reported by axe as **`incomplete`**, which `toHaveNoViolations()`
cannot see, so that fix needed a structural assertion beside the axe run. This one
lands in **`violations`**, because the required child is *present but wrapped*
rather than absent. Both lists are searched so the assertion does not depend on
which list a future axe version picks.

**The trap, recorded because it is the second sighting of the same thing.** The
first draft of this fix put the twenty-line explanation in a **template** comment
beside the `<li>`. Vue's server renderer ships template comments verbatim, so the
comment's own `role="menuitem"` string landed in the rendered HTML and the SSR
block went red:

```
FAIL  sSR: tier C > dzMegaMenu renders one linked menu item per item in SSR
      expect((html.match(/role="menuitem"/g) ?? []).length).toBe(1)
      AssertionError: expected 2 to be 1
```

That is exactly RESIDUAL-10 §2.5's `DzNumberInput` `tabindex="-1"` finding —
*"a file that documents itself defeats counting by substring"* — arriving from the
other direction: this time the self-documentation was in the **component**, and
the count was in the test. Two things were done about it. The explanation moved
into the `<script setup>` block, where it is compiled away rather than shipped
(a mega menu's wire bytes are not the place for a design note), and the template
keeps a one-line pointer. And the incident is written into that comment, so the
next person who reaches for a template comment on a published component reads why
not.

### 2.4 Seed B — remove the one attribute

```
packages/core/src/components/navigation/DzMegaMenu.vue   delete  role="none"

node node_modules/vitest/vitest.mjs run tests/ssr/ tests/a11y/navigation.a11y.spec.ts src/components/navigation/
  ->  exit 1     Test Files 2 failed | 30 passed (32)
                 Tests      3 failed | 537 passed | 1 skipped (541)

FAIL  navigation family — Accessibility > dzMegaMenu > has no a11y violations on the expanded menubar
      $('ul')                    aria-required-children  "Element has children which are not allowed: li[tabindex]"
      $('a[href$="products"]')   aria-required-parent    "Required ARIA parents role not present: menu, menubar, group"
      $('a[href$="docs"]')       aria-required-parent    same
      $('li:nth-child(1)')       listitem                "List item parent element has a role that is not role=list"
      $('li:nth-child(2)')       listitem                same
FAIL  navigation family — Accessibility > dzMegaMenu > puts no listitem between the menubar and its menu items
      AssertionError: expected null to be 'none'
FAIL  sSR: tier C > dzMegaMenu renders one linked menu item per item in SSR
      AssertionError: expected +0 to be 1        (the `<li role="none"` count)
```

**Three failures, all three of them this defect's own assertions**, out of 541
tests across 32 files — including the other 15 files under
`src/components/navigation/` and the other six SSR specs, all green. The five axe
findings inside the first failure are the measurement §2.1 reports; they were not
available before the fix existed, because there was no assertion to print them.

**Restore, proved byte-identical** (the fix re-applied to a pristine byte copy of
the file, then re-hashed, so the recorded hash is of the *accepted* state and not
of a patched patch):

```
cp <backup>/DzMegaMenu.vue  packages/core/src/components/navigation/DzMegaMenu.vue   # pristine
…re-apply the accepted fix, re-snapshot, re-hash
sha256sum -c current.sha256   ->  all five OK, exit 0
vitest run tests/ssr/ tests/a11y/ src/components/navigation/
  ->  exit 0     42 files passed · 699 passed | 1 skipped
```

### 2.5 Changeset

`.changeset/a-mega-menus-menubar-no-longer-owns-two-list-items.md` —
`@dzup-ui/core: patch`, VERSIONING.md §3. It carries all three measured rules and
the reason the browser lane could not have caught this: both structure rules run
there (they carry the `wcag2a` tag `preview.ts` pins in `a11y.options.runOnly`)
and neither can fail, because the global gate is `a11y.test: 'todo'` and
`stories/navigation/` has not opted into `a11yError`.

---

## 3. `D-RES10-3` 🟢 — `DzChip`'s `role="status"`. **FIXED**, with a cost that is named.

This is one of the two RESIDUAL-10 flagged as *"may have a non-obvious reason"*, so
the investigation came first and is reported first.

### 3.1 What depended on the current value — measured before deciding

```
grep 'role="status"' packages/core/src/components/data/
  DzChip.vue:109                  the declaration
  DzChip.spec.ts:159              it('has role="status"')
  DzChip.contract.spec.ts:35      it('has role="status"')
  DzOrderList.vue:622             an sr-only live region — a DIFFERENT, correct use
```

**Two assertions, and both assert the defect itself.** Nothing else in the
repository — no story, no anatomy file, no a11y spec, no docs page — reads the
value. The three existing `DzChip` axe tests in `tests/a11y/data.a11y.spec.ts` do
not mention it.

### 3.2 The finding that decided it: `DzTag` is the same component without the role

`DzTag` sits in the same family directory and its root is, attribute for
attribute, the same element:

| | `DzChip` root | `DzTag` root |
|---|---|---|
| element | `<span>` | `<span>` |
| `data-part` | `root` | `root` |
| names forwarded | `aria-label` · `aria-labelledby` · `aria-describedby` | identical |
| state | `data-state` idle/disabled · `data-tone` · `data-disabled` | identical |
| focus | `tabindex="0"` when `closable` | identical |
| containment | `contain: layout style` | identical |
| remove control | `<button data-part="close">` with the same SC 2.5.8 treatment — `DzChip`'s own comment says *"same treatment as DzTag"* | identical |
| **role** | **`status`** | **none** |

Two components with one anatomy and two different roles is not a design decision,
it is a divergence — and `DzTag` is the side that is not a live region. That
settles what the chip *should* be without an agent inventing a role, which is the
thing RESIDUAL-10 said it could not do.

`role="button"` — the brief's other candidate — was rejected on measurement:
activating the chip root does nothing. `handleKeyDown` handles only
Backspace/Delete, there is no click handler on the root, and the remove control is
its own real `<button>` with its own label. `role="button"` would promise an
activation that does not exist.

### 3.3 The cost, measured with axe on both components before and after

This is the part that had to be established rather than assumed. A `<span>` with no
role is `generic`, and ARIA 1.2 prohibits `aria-label` on `generic`:

| render | `violations` | `incomplete` |
|---|---|---|
| `DzChip` plain — **with** `role="status"` | `[]` | `[]` |
| `DzChip` + `ariaLabel` — **with** `role="status"` | `[]` | `[]` |
| `DzChip` + `ariaLabel` + `closable` — **with** `role="status"` | `[]` | `[]` |
| `DzTag` plain (no role, always) | `[]` | `[]` |
| **`DzTag` + `ariaLabel`** (no role) | `[]` | **`['aria-prohibited-attr']`** |
| **`DzTag` + `ariaLabel` + `closable`** (no role) | `[]` | **`['aria-prohibited-attr']`** |

So `role="status"` **was** doing something: it suppressed
`aria-prohibited-attr` on a named chip. That is the non-obvious reason the brief
warned about, and it is not a good enough one — it suppressed a naming warning by
declaring a live region, which is a larger defect than the one it hid, and it did
so on **every** chip including the unnamed ones that had no warning to suppress.

**Decision: fix it, and raise the exposed issue rather than let it be discovered
later.** `DzChip` now matches `DzTag` exactly. The `aria-prohibited-attr`
consequence is real, pre-existing in `DzTag`, invisible to `toHaveNoViolations()`
because axe reports it as `incomplete`, and now shared by both components — raised
as **`D-RES11-1`** (§7) with this table as its evidence. The changeset states it in
the body, because a consumer who passes `ariaLabel` deserves to read it there
rather than find it in an audit.

### 3.4 What was changed

| file | change |
|---|---|
| `packages/core/src/components/data/DzChip.vue` | `role="status"` removed from the root; a 33-line `NO ROLE ON THE ROOT` note added to the **script** (not the template — §2.3's trap) carrying the measurement, the `DzTag` comparison, the rejected `role="button"`, and the `aria-prohibited-attr` cost |
| `DzChip.spec.ts` | `has role="status"` **inverted** rather than deleted (a claim needs a test): `declares no role on the root, and is not a live region`. Two more added: `is not a live region when closable either` (the state that also takes focus) and `agrees with DzTag about the root role` |
| `DzChip.contract.spec.ts` | `has role="status"` → `declares no role on the root` |
| `tests/a11y/data.a11y.spec.ts` | **new** `is not a live region, in any state` — loops the three states and asserts zero `[aria-live]` and zero `[role="status"|"alert"|"log"]`, with a comment recording that **axe cannot hold this**: `role="status"` on a `<span>` is valid ARIA and all three existing chip axe renders were clean with it in place |
| `tests/ssr/ssr-smoke.spec.ts` | the `dzChip` block gains `not.toContain('role=')` and `not.toContain('aria-live')` — asserted on the server output, because `aria-live` in first-paint HTML is announced before any script runs |

`agrees with DzTag about the root role` is the assertion doing the most work: it
compares the two components rather than restating a literal, so the *divergence*
that produced this defect is what goes red, not just the value.

### 3.5 Seed C — put `role="status"` back

```
packages/core/src/components/data/DzChip.vue   restore  role="status"

node node_modules/vitest/vitest.mjs run src/components/data/ tests/a11y/data.a11y.spec.ts tests/ssr/ssr-smoke.spec.ts
  ->  exit 1     Test Files 4 failed | 34 passed (38)
                 Tests      6 failed | 670 passed | 1 skipped (677)

FAIL  data family — Accessibility > dzChip > is not a live region, in any state
        expected <span data-part="root" …> to have a length of +0 but got 1
FAIL  sSR: data > dzChip renders its label and its resolved tone in SSR
        expected '<span data-part="root" …' not to contain 'role='
FAIL  dzChip — Contract Spec v1 > declares no role on the root          expected 'status' to be undefined
FAIL  dzChip > declares no role on the root, and is not a live region   expected 'status' to be undefined
FAIL  dzChip > is not a live region when closable either …              expected 'status' to be undefined
FAIL  dzChip > agrees with DzTag about the root role                    expected 'status' to be undefined
```

**Six failures, and they are the six assertions this fix added or inverted**, out
of 677 tests across 38 files. Every `DzTag` test stayed green — including the six
tone renders and the closable render — which is the precision claim: the seed
touches one component's role and nothing else in the family notices.

**Restore, proved byte-identical:**

```
sha256sum -c current.sha256    ->  all five OK, exit 0
vitest run src/components/data/ tests/a11y/data.a11y.spec.ts tests/ssr/ssr-smoke.spec.ts
  ->  exit 0     38 files passed · 676 passed | 1 skipped
```

### 3.6 Changeset

`.changeset/a-chip-is-no-longer-an-aria-live-region.md` — `@dzup-ui/core: patch`,
VERSIONING.md §3. It names the removed attribute, tells a consumer selecting on
`[role="status"]` what to use instead, and carries the `aria-prohibited-attr`
consequence in the body.

---

## 4. `D-RES10-4` 🟢 — `DzDataView` announcing "No items" twice. **FIXED.**

### 4.1 What was measured

```
DzDataView  (no props)  ->  934 B
  "No items"        occurrences: 2
  role="status"     occurrences: 1
  aria-live         occurrences: 1

<div data-part="root" data-size="md" data-layout="list" …>
  <div class="sr-only" aria-live="polite" aria-atomic="true">No items</div>
  …
  <div data-state="ready" role="status">          <-- DzEmpty's root, a live region
    <p …>No items</p>
```

Two live regions, one string, one render. And with items the same region reads
`Showing 2 items`, so the zero case was the only one where the window region
stopped reporting a window and started repeating the empty state.

### 4.2 The fix — RESIDUAL-10's option (c), and why not (a) or (b)

RESIDUAL-10 §7.2 offered (a) drop the wrapper region, (b) drop `role="status"` from
`DzEmpty`, (c) make the sr-only region announce the **count** instead, and
recommended (c). Taken, for reasons that were checked:

- **(c) keeps both purposes.** The two regions are for different things — the
  window, and the empty state — and the defect was that one of them was doing the
  other's job. Making it do its own is a one-line change to a `computed`, with no
  DOM change, no part change and no state change.
- **(b) would have coupled this to `D-RES10-3`.** `DzEmpty`'s `role="status"` is a
  different question from `DzChip`'s: an empty state genuinely *is* a status —
  it announces that a collection the user was looking at is now empty — so
  removing it is a real loss, not a correction. And it is not local: `DzEmpty` is
  imported by `DzDataView.vue` **and** `DzTableBody.vue` (measured — two `.vue`
  files under `packages/core/src/components/`, plus every consumer who renders it
  directly), so changing its role from inside a `DzDataView` fix would move a
  component this defect is not about.
- **(a) would leave a data view that announces nothing about its window** when the
  collection empties from a paginated state, which is the one transition the region
  exists for.

```ts
-  if (total.value === 0)
-    return props.emptyTitle
+  if (total.value === 0)
+    return dzFormat('showingAll', { count: 0 })
```

**No new message key, so no locale moved.** `showingAll` is the existing
count-bearing key (`'{count, plural, one {Showing # item} other {Showing # items}}'`),
already covered by `packages/core/src/i18n/count-bearing.spec.ts` and already
translated in `de.json`'s coverage list — so the frozen *"locales at ≥ 95 %: 1"*
ratchet cannot move, and it did not (§8).

**The branch could not simply be deleted.** Falling through to the paginator arm
with `total === 0` computes `start = pageOffset + 1 = 1` and
`end = min(0 + rows, 0) = 0`, announcing *"Showing 1 to 0 of 0 items"*. That is
recorded in the component comment so the branch is not "tidied away" later.

### 4.3 What holds it

| file | block | requires |
|---|---|---|
| `packages/core/tests/ssr/ssr-smoke.spec.ts` | `dzDataView renders its empty state and its live region in SSR` | `No items` appears **exactly once**; the polite region's text is `Showing 0 items`; and **exactly one** `aria-live=` and **exactly one** `role="status"` remain — so the count could not have been achieved by deleting a live region. Replaces the *"NOT asserted: how MANY nodes announce No items"* comment |
| `packages/core/src/components/data/DzDataView.spec.ts` | **new** — `announces the empty state once, not in two live regions` | mounted with `emptyTitle: 'Nothing here'` — a **custom** title on purpose, because a substring count of the default "No items" cannot tell an announcement from an incidental occurrence — there are **2** live-region nodes, **exactly 1** of them carries the title, and the other reads `Showing 0 items` |

### 4.4 Seed D — put `emptyTitle` back into the live region

```
packages/core/src/components/data/DzDataView.vue
  -  return dzFormat('showingAll', { count: 0 })
  +  return props.emptyTitle

node node_modules/vitest/vitest.mjs run src/components/data/ tests/a11y/data.a11y.spec.ts tests/ssr/ src/i18n/
  ->  exit 1     Test Files 2 failed | 45 passed (47)
                 Tests      2 failed | 824 passed | 1 skipped (827)

FAIL  sSR: tier C > dzDataView renders its empty state and its live region in SSR
      AssertionError: expected 2 to be 1            (the `No items` count)
FAIL  dzDataView — empty + loading > announces the empty state once, not in two live regions
      AssertionError: expected [ DOMWrapper{…}, …(1) ] to have a length of 1 but got 2
```

**Two failures, and they are the two claims**, out of 827 tests across 47 files —
including all 13 other `i18n` and `DzEmpty` specs and the other six SSR files. Note
what did *not* fail: `DzDataView.contract.spec.ts`'s `exposes a polite live region`
stayed green under the seed and after the fix, which is the point of asserting the
**count** rather than the presence.

**Restore, proved byte-identical:**

```
sha256sum -c current.sha256    ->  all five OK, exit 0
vitest run src/components/data/ tests/a11y/data.a11y.spec.ts tests/ssr/ src/i18n/
  ->  exit 0     47 files passed · 826 passed | 1 skipped
```

### 4.5 Changeset

`.changeset/an-empty-data-view-announces-itself-once.md` — `@dzup-ui/core: patch`,
VERSIONING.md §3. It states exactly which text changed and which did not, because
the visible empty state is untouched and only the screen-reader-only region moved.

---

## 5. `D-RES10-5` 🟢 — `DzSelect`'s sentinel. **HALF LOAD-BEARING, HALF FIXED** — and it was not cosmetic.

This is the other one RESIDUAL-10 flagged as possibly having a non-obvious reason,
and it does. The investigation split the sentinel into two uses with different
answers, and it found that RESIDUAL-10's *"inert in a browser, so this is a hygiene
finding rather than a bug"* is **wrong**.

### 5.1 What the sentinel is for, established from Reka's source

```
node_modules/reka-ui/dist/Select/SelectItem.js:89
  if (props.value === "") throw new Error(
    "A <SelectItem /> must have a value prop that is not an empty string. This is
     because the Select value can be set to an empty string to clear the selection
     and show the placeholder.")
```

Two facts in one sentence, and they point in opposite directions:

1. **An `<SelectItem>` cannot take `''` — it throws.** So an item that legitimately
   declares the empty string *must* be mapped onto something else. `toInternal`
   exists for that, and it is **load-bearing. It stays.**
2. **The root's value *may* be `''`** — Reka's own message says that is how the
   selection is cleared. So the root never needed the mapping.

Confirmed from `SelectRoot.js`: `modelValue` is spread onto the `BubbleSelect`,
whose `<select>` receives `mergeProps(props)` — which is how `value=` reaches the
rendered element. `useFormControl(triggerElement)` returns `true` when there is no
element, which is why the hidden `<select>` is present in SSR output at all.

### 5.2 Measured before — and the consequence RESIDUAL-10 missed

| render | `__DZ_SELECT_EMPTY__` in output | hidden `<select>` | trigger `data-placeholder` |
|---|---:|---|---|
| unset, no item claims `''` | **1** | `value="__DZ_SELECT_EMPTY__"` | **absent** |
| `modelValue: 'apple'` | 0 | `value="apple"` | absent (correct) |
| unset, an item declares `value: ''` | 1 | `value="__DZ_SELECT_EMPTY__"` | absent |

**The third column is the finding.** Reka's placeholder predicate is

```
node_modules/reka-ui/dist/Select/utils.js:24
  function shouldShowPlaceholder(value) {
    return value === void 0 || value === null || value === "" || (Array.isArray(value) && value.length === 0)
  }
```

and `SelectTrigger.js:74` binds `data-placeholder` from it. The sentinel is not
`''`, so `shouldShowPlaceholder` returned **false** for every unset select, the
trigger never got `data-placeholder`, and this component's own recipe class —
`data-[placeholder]:text-[var(--dz-muted-foreground)]`, which exists for exactly
this and nothing else — **could never apply**. The placeholder of every unset
`DzSelect` painted in the normal foreground colour instead of the muted placeholder
colour.

So `D-RES10-5` is not hygiene. It was a **visible styling defect on the default
state of a form control**, hidden behind a string nobody was looking at. RESIDUAL-10
called it *"inert in a browser (`value` is not a content attribute of `<select>`, and
the element has no options)"* — true of the attribute itself, and beside the point:
the damage was done by what the value did to Reka's own predicate, not by the
attribute.

### 5.3 The fix

RESIDUAL-10 offered (a) map it back to `''` on the hidden native element, (b) leave
it and note it in the header, (c) omit the hidden select when there is no value,
recommending (a) *"if it is one binding"*. (a) is not available as written — the
hidden `<select>` is rendered by Reka, not by this component, so there is nothing
here to map back. (c) would remove form participation. The route that exists is one
level up: **stop sending the sentinel to the root**, and keep it for the one case
that needs it.

```ts
+const hasEmptyValueItem = computed(() => props.items.some(item => item.value === ''))
+
+const internalModel = computed(() =>
+  model.value === '' && hasEmptyValueItem.value ? EMPTY_VALUE_SENTINEL : model.value,
+)

-      :model-value="toInternal(model)"
+      :model-value="internalModel"
```

**Why the guard rather than dropping the mapping outright.** An item may
legitimately declare `value: ''` — an *"— any —"* row. Its internal value **is** the
sentinel (it has to be; `SelectItem` throws otherwise), so the root's value has to
match the sentinel for the panel to show that row as chosen. Guarding on `items`
keeps that working, reactively, including when items arrive late through
`optionsState`. Dropping the mapping would have silently stopped that row resolving
— trading one defect for another, which §3 accepted only because it was measured
and named, and which is avoidable here.

**`undefined` was considered and rejected on measurement.** `SelectRoot` computes
`passive: props.modelValue === void 0`, so handing it `undefined` for the unset case
would make the root **uncontrolled** — a far worse regression than the one being
fixed. `''` keeps it controlled.

### 5.4 Measured after

| render | `__DZ_SELECT_EMPTY__` | hidden `<select>` | trigger `data-placeholder` |
|---|---:|---|---|
| unset, no item claims `''` | **0** | `value` (empty) | **present** ← the styling defect is gone |
| `modelValue: 'apple'` | 0 | `value="apple"` | absent (correct) |
| unset, an item declares `value: ''` | **1** — deliberately | `value="__DZ_SELECT_EMPTY__"` | absent, and the trigger reads `Any` |

The placeholder text and the accessible name are unchanged in every case
(`Pick fruit` in the `SelectValue` span, `aria-labelledby` pointing at it), because
`selectedLabel` is computed from `items` against the *external* model and never saw
the sentinel.

### 5.5 What holds it

| file | block | requires |
|---|---|---|
| `packages/core/src/components/forms/DzSelect.spec.ts` | **new** `keeps its internal marker out of the rendered output of an unset select` | no `__DZ_SELECT_EMPTY__`, and no `/__DZ_/` at all — the assertion is about the *class* of thing, not one string — and the hidden `<select>`'s `value` is `''` |
| ″ | **new** `marks the trigger as showing a placeholder, which the marker used to suppress` | the trigger has `data-placeholder`. This is the assertion that holds §5.2's real consequence, and it is the one a "hygiene" framing would never have written |
| ″ | **new** `drops the attribute once a value is chosen` | with `modelValue: 'apple'`: `value="apple"`, and **no** `data-placeholder` — so the previous test cannot be satisfied by emitting the attribute unconditionally |
| ″ | **new** `still uses the marker when an item actually claims the empty string` | the *preserved* behaviour: the hidden select carries the sentinel and the trigger reads `Any`. The test that stops a future "tidy-up" deleting the guard |
| `packages/core/tests/ssr/ssr-smoke.spec.ts` | `dzSelect renders its placeholder and closed state in SSR` | `not.toMatch(/__DZ_/)` and `role="combobox" … data-placeholder` in the server string |

### 5.6 Seed E — send the sentinel to the root again

```
packages/core/src/components/forms/DzSelect.vue
  -  const internalModel = computed(() => model.value === '' && hasEmptyValueItem.value ? EMPTY_VALUE_SENTINEL : model.value)
  +  const internalModel = computed(() => toInternal(model.value))

node node_modules/vitest/vitest.mjs run src/components/forms/ tests/a11y/forms.a11y.spec.ts tests/ssr/
  ->  exit 1     Test Files 2 failed | 64 passed (66)
                 Tests      3 failed | 1,048 passed | 1 skipped (1,052)

FAIL  sSR: forms > dzSelect renders its placeholder and closed state in SSR
      expected '<div data-part="root" …' not to match /__DZ_/
FAIL  dzSelect — the internal empty-value marker > keeps its internal marker out of the rendered output of an unset select
      expected '<div data-part="root" …' not to contain '__DZ_SELECT_EMPTY__'
FAIL  dzSelect — the internal empty-value marker > marks the trigger as showing a placeholder, which the marker used to suppress
```

**Three failures, and they are the three claims about the unset case**, out of 1,052
tests across 66 files. What stayed green is the discriminating part: `still uses the
marker when an item actually claims the empty string` **passed under the seed**,
because the seed preserves that behaviour — so the four new tests separate the two
uses of the sentinel rather than testing "the sentinel is gone", which would have
been wrong.

**Restore, proved byte-identical:**

```
sha256sum -c current.sha256    ->  all five OK, exit 0
vitest run src/components/forms/ tests/a11y/forms.a11y.spec.ts tests/ssr/
  ->  exit 0     66 files passed · 1,051 passed | 1 skipped
```

### 5.7 Changeset, and the one thing an owner should look at

`.changeset/no-internal-marker-in-an-unset-selects-output.md` — `@dzup-ui/core: patch`.

**It carries a warning the other four do not: a visual baseline may move.** An unset
select's placeholder now paints `--dz-muted-foreground` instead of `--dz-foreground`,
which is a pixel change on the default state of a widely used control. It is a
*correction* — the old baseline recorded a placeholder styled as a value — but it is
the kind of change a `test:e2e:visual` run should be looked at for. That lane is
`continue-on-error` in `ci.yml` (RESIDUAL-10 §4.1 re-verified it) and was **not** run
in this batch, so this is stated as an owner item in §7 rather than claimed as
checked.

---

## 6. One story play function had to change, and it was asserting the defect

`D-RES10-4` broke a browser-lane assertion, and that is recorded here rather than
absorbed — it is the same shape as RESIDUAL-06's `DzCarousel.spec.ts` consequence.

Before running the lane, every story file was searched for assertions on what this
batch changes — `role="status"`, `aria-current`, `data-state="completed"`,
`menubar`, `data-placeholder`, `No items`, `[aria-live]`, and
`getByRole('status')` across `packages/core/stories/` and `apps/storybook/stories/`.
**One hit:**

```
packages/core/stories/data/DzDataView.stories.ts:412
  await expect(empty.querySelector('[aria-live="polite"]')).toHaveTextContent('No products found')
```

`querySelector('[aria-live="polite"]')` returns the **window** region — `DzEmpty`'s
root carries `role="status"` and no `aria-live` attribute — so this line required the
window region to read the empty-state title. It was the defect, written down as a
play function. Replaced with three assertions that require the two regions to say
**different** things:

```ts
await expect(empty.querySelector('[aria-live="polite"]')).toHaveTextContent('Showing 0 items')
await expect(empty.querySelector('[aria-live="polite"]')).not.toHaveTextContent('No products found')
await expect(within(empty).getByRole('status')).toHaveTextContent('No products found')
```

Stronger than before: the title must still be announced (third line), and it must not
be announced twice (second line).

**Everything else in that search was a false positive**, checked individually:
`getByRole('status')` appears in seven story files and none is a chip
(`DzEmpty`, `DzNotification`, `DzResult`, `DzSpinner`, `DzOrderList`,
`DzRunStatusBadge`, `TeamMemberBadge` — the last two wrap `DzBadge`, in `feedback`,
untouched). `DzStepper.stories.ts:334` queries `[aria-current="step"]` after a click,
which is client-side behaviour and unchanged. `DzMegaMenu.stories.ts` queries
`getByRole('menubar')` and `getAllByRole('menuitem')`, neither of which a
presentational wrapper affects. No `DzSelect` story asserts on the hidden native
select or on `data-placeholder`.

Editing a story file makes `component-meta.json` stale (it records each story's
example **line range**, CLAUDE.md regeneration table step 4), so `yarn regenerate:all`
was run a second time; §8 records what moved.

---

## 7. Aggregate qualification — pre-existing versus new

### 7.1 Order of operations, stated so the evidence can be trusted

Every number below is from a run made **after** every source, test, story and document
edit in this batch was on disk, except where a section says otherwise. Each exit code
was written to a **file** with an absolute path and the log then read — never a
completion notice, and never through a pipe. The browser lane was run **once**, after
the story fix and before the documents, because it is the only lane whose invocation
this repository asks to be minimised.

**Exactly what came after the final gate run, stated so the claim above is precise.**
The final `validate:all` and the final `yarn test` were made with this report's §0–§12,
the register's §17 and the `EXECUTION-STATUS.md` entry already on disk. After them, four
edits were made to **this document only** — substituting the final line count into §7.3,
adding §7.6, noting the second `yarn test` run, and adding the process-drift paragraph
below. None touches a `.vue`, a spec, a story, a changeset or a generated artifact, and
the `git status --porcelain` listing taken after them is **identical** to the one taken
immediately after the gates. Also: documents were **not** edited while `validate:all` was
scanning, because `validate:anatomy-parts` reads `docs/`.

### 7.2 Regeneration — run twice, and only what should have moved did

`ssr-smoke.spec.ts`, `form-layouts-ssr.spec.ts`, `navigation.a11y.spec.ts`,
`data.a11y.spec.ts` and four `.vue` files carrying inline `style=` were edited, so
several artifacts went stale at once. `yarn regenerate:all` was used rather than the
seven-step column being copied by hand.

```
yarn regenerate:all   (after the five fixes)      ->  exit 0   7 of 7 steps
  packages/core/docs/capability-matrix.json                    CHANGED   (§8.1, one cell)
  packages/core/docs/component-meta.json                       CHANGED   (its capability join)
  packages/core/docs/quality-matrix.json                        IDENTICAL
  packages/core/manifests/component-ownership.manifest.json     IDENTICAL
  packages/core/security/inline-style-inventory.json            CHANGED   (line numbers only — §8)

yarn regenerate:all   (after the story fix, §6)   ->  exit 0   7 of 7 steps
  packages/core/docs/capability-matrix.json                     IDENTICAL to the previous run
  packages/core/docs/component-meta.json                       CHANGED   (the story's line range)
  packages/core/security/inline-style-inventory.json            IDENTICAL to the previous run
```

The inventory **did** change in the first run and that is the expected result, not a
surprise: `DzChip.vue`, `DzDataView.vue`, `DzMegaMenu.vue` and `DzSelect.vue` all carry
inline `style=` sites, and the inventory records each site's **line number**, so
inserting a comment above one makes it stale with nothing added or removed. Its
**totals are unchanged** — 81 static sites in 78 files + 52 bound sites in 38 files =
the same **133** RESIDUAL-10 handed over, with the same disposition split
(`recipe-movable` 78 · `layout-static` 3 · `custom-property` 0 · `required-dynamic` 19
· `unclassified-binding` 33). This is the trap CLAUDE.md's step 7 exists for and the
one `validate:all` does not check; it is caught only by the unit suite, which is green.

### 7.3 The three lanes, end to end

```
node -e "…scripts['validate:all'].split('&&').length"   ->  61       (unchanged)

yarn validate:all > <abs>.log 2>&1 ; echo "exit $?" > <abs>.exit
  ->  exit 0    1,311 lines · 52 lines carrying ✓ · ZERO lines carrying ✗ · ZERO STALE
                (run THREE times end to end — §7.6 records what each run was for and what
                 moved between them; the figures above are the final run, made after every
                 source, test, story and document edit in this batch was on disk.)

yarn test > <abs>.log 2>&1 ; echo "exit $?" > <abs>.exit
  ->  exit 0    Test Files 575 passed (575)
                Tests 11,226 passed | 3 skipped | 1 todo (11,230)
                grep -c FAIL  ->  0
                Run TWICE: once after the five fixes (358.86 s) and once after the story
                fix and the second regeneration (393.85 s). IDENTICAL figures both times,
                and green on the FIRST attempt each time — no reporter flake, no retry.

browser lane, app-local runner invoked from apps/storybook:
  node node_modules/vitest/vitest.mjs run --project=storybook
  ->  exit 0    170 files passed (170) · 1,462 tests · 1,462 passed · 0 failed · 97.01 s
                grep -c FAIL  ->  0
```

**The browser lane was green on the FIRST attempt and leaked nothing.** Process counts
were taken immediately before and immediately after, by name:

```
                before      after
chrome            56          56
chromium           0           0
node              23          23
msedge             0           0
headless_shell     0           0
```

**Nothing was killed, and nothing needed to be.** RESIDUAL-10's run leaked 176 browser
processes and clearing it terminated 37 processes named `chrome` — which on Windows is
also the name of a person's own Google Chrome. This batch ran the lane **once**, took the
counts on both sides, and did not run `taskkill` or any equivalent at any point.

A later count, taken at handover rather than at the lane boundary, reads `chrome` **60**
and `node` **27**. That drift is **not** this batch's, and it was checked rather than
assumed: enumerating every `node.exe` with its command line and creation time shows none
belonging to any command run here — they are the owner's own `vite` dev servers
(timestamps 15:57, 17:11, 17:33), Serena language servers, and two dzup-ui processes
created on **18 September**, long before this session. The pre/post pair at the lane
boundary is the measurement; the handover count is reported so the difference is not
mistaken for a leak.

### 7.4 The test-count delta, accounted for test by test

**11,215 → 11,226 is exactly +11**, and every one is named:

| file | before | after | Δ | what was added |
|---|---:|---:|---:|---|
| `tests/ssr/form-layouts-ssr.spec.ts` | 7 | 8 | **+1** | the hydration byte-equality test (§1.6) |
| `tests/a11y/navigation.a11y.spec.ts` | — | — | **+2** | `dzMegaMenu` axe pass · `dzMegaMenu` structure (§2.3) |
| `tests/a11y/data.a11y.spec.ts` | — | — | **+1** | `dzChip is not a live region, in any state` (§3.4) |
| `src/components/data/DzChip.spec.ts` | 1 | 3 | **+2** | one inverted, two added (§3.4) |
| `src/components/data/DzChip.contract.spec.ts` | 1 | 1 | 0 | inverted in place |
| `src/components/data/DzDataView.spec.ts` | — | — | **+1** | `announces the empty state once` (§4.3) |
| `src/components/forms/DzSelect.spec.ts` | — | — | **+4** | the empty-value-marker describe block (§5.5) |
| `tests/ssr/ssr-smoke.spec.ts` | 64 | 64 | 0 | four blocks strengthened, none added |
| | | | **+11** | |

**File count unchanged at 575.** No spec file was added, and the two throwaway
measurement probes were **deleted before any suite was run for evidence** (§9).

### 7.5 Advisories in the run — every one pre-existing

| advisory | count | status |
|---|---:|---|
| `! [dirty-input]` | 4 | the four generated artifacts have declared inputs modified in the worktree. The gate's own words: *"the COMMITTED binding is what this gate proves; this line is not a failure."* Register row #2 / `D127`, unchanged |
| `! [deprecated-ident]` | 1 | `lucide-vue-next` deprecated upstream. Register row #3 option (a), still open |
| `! [generated-surface-drift]` | 1 | 40 landing registry items depend on the same deprecated package. The line's own words: *"Consequence of the open decision, not a defect here."* Nothing in this batch touches `apps/landing` |
| `! [stale]` (docs site) | 1 | 155 of 160 docs inputs newer than the built site. Off CI this is a report by design |
| `! …win32 / linux` | 1 | the per-component visual coverage join gates on `win32` while CI runs `linux`. An honest declaration, reported not failed, and the reason `visual-baselines` declares `ciGate: false` |
| `⚠ docs-freshness` | 1 | the pre-build lane cannot assert a build, by design |
| `⚠ 3 report-level registry findings` | 1 | `@dzup-ui/core` / `@dzup-ui/tokens` 404 on npm (A4-D1, publish-or-freeze). Owner decision |

**There is no `✗` anywhere in the log.** `grep -c '✗'` over all 1,311 lines → **0**,
and `grep -c 'STALE'` → **0**.

### 7.6 The three `validate:all` runs, and what moved between them

Recorded because two of them were not green, and a report that quoted only the third
would be the kind of thing this programme exists to stop.

| run | lines | exit | why it was made, and what it found |
|---|---:|---|---|
| **1** | 11 | **1** | made after the five fixes and the first `regenerate:all`. **Failed on link 2 (`yarn lint`) with 2 warnings** under `--max-warnings 0`: `jsdoc/no-multi-asterisks` on `DzMegaMenu.vue:62` and `DzSelect.spec.ts:409` — two new comment lines whose content began with a single `*` (an italicised quotation), which the rule reads as a second JSDoc asterisk. **Fixed by hand; `eslint --fix` was not used** (it has corrupted a string literal in this repository before). Note what the rule does *not* object to: `**bold**` after the leading asterisk, which several pre-existing lines in the same files use |
| **2** | 1,312 | **0** | 52 `✓`, 0 `✗`, **1 `STALE`** advisory |
| **3 (final)** | 1,311 | **0** | 52 `✓`, 0 `✗`, **0 `STALE`**. Made after the story fix (§6), the second `regenerate:all`, and every document in this batch |

**The `STALE` line, and why it is absent from the final run.** Run 2 carried:

```
STALE @dzup-ui/core: dist (…14:32:12Z) predates
      packages/core/src/generated/component-ownership.ts (…14:44:33Z)
      — this run is evidence about that older build
```

`yarn build` is **link 60**, deliberately at the END of the chain, while
`validate:published-imports` runs much earlier — so a `validate:all` that immediately
follows a `regenerate:all` always sees a dist older than the artifacts step 1 has just
rewritten, and its own link 60 then refreshes it. Run 3 was not preceded by a
regeneration, so the line is gone: `STALE` **1 → 0**, which is the whole of the
one-line difference between 1,312 and 1,311. This is the same demonstration RESIDUAL-02
§3.3 and RESIDUAL-10 §5.4 both recorded, from the same cause, and it is why the build
sits at the end of the chain. Every other difference between the two logs is
build-output ordering and elapsed times.

---

## 8. Ratchet movements (old → new)

| ratchet / counted quantity | old | new | evidence |
|---|---|---|---|
| **`unclassified`** | 29 | **29** | `✓ ownership-manifest: … 29/29 unclassified` |
| **`maxWithoutAnatomy`** | 41 | **41** | same line: `41/41 public components without anatomy` |
| **`maxProposedCitedFromCode`** | 3 | **3** | `✓ adr-status: … 3 Proposed (ADR-18, ADR-19, ADR-20) · 3 cited … all 3 grandfathered (ceiling 3)` |
| **AT cells executed** | 0 of 534 | **0 of 534** | `executed cells  0 of 534` |
| **locales at ≥ 95 %** | 1 (`en`) | **1 (`en`)** | `locales at >= 95 % completeness: 1 (en) — floor 1`. The `D-RES10-4` fix deliberately reuses the existing `showingAll` key so no locale could move |
| **capability `pass`** | 585 | **585** | re-summed from the artifact |
| **capability `fail`** | 0 | **0** | same |
| **capability `present`** | 610 | **611** | **MOVED — §8.1** |
| **capability `stale`** | 22 | **22** | same, `ceiling 22` |
| **capability `unrun`** | 398 | **397** | **MOVED — §8.1** |
| **capability `excepted`** | 47 | **47** | same |
| capability rows / cells | 144 / 1662 | **144 / 1662** | unchanged |
| **`validate:all` chain links** | 61 | **61** | measured by splitting on `&&`, before and after |
| **`validate:all` `✗` count** | 0 | **0** | `grep -c '✗'` over the whole log |
| **Pending changesets** | 48 | **53** (+5) | `✓ release-policy: … 53 pending changeset(s), 0 major, 0 mixed`. Five `@dzup-ui/core: patch`, one per fixed defect |
| inline-style inventory sites | 133 | **133** | `81 static in 78 files + 52 bound in 38 files`; the artifact's **bytes** changed (line numbers) and its **totals** did not |
| `ssr-smoke.spec.ts` `it` blocks | 64 (63 + 1 skip) | **64** (63 + 1 skip) | none added, none removed; four blocks strengthened |
| `ssr-smoke.spec.ts` blocks carrying a "NOT asserted" deferral | **4** | **0** | all four of RESIDUAL-10 §2.4's deliberate gaps are closed |
| `yarn test` tests | 11,215 | **11,226** (+11) | §7.4 — accounted for file by file |
| `yarn test` files | 575 | **575** | no spec file added |
| browser lane files / tests | 170 / 1,462 | **170 / 1,462** | unchanged, 0 failed |
| `DzMegaMenu` entries in `tests/a11y/` | **0** | **2** | the family had none |

**No ceiling was raised and no allowlist widened.**
`find packages -name '*ceiling*.json' -newermt <session start>` is **empty**. Every
change in this batch is *stricter*: four unfalsifiable deferrals became assertions, one
story play function that asserted a defect now asserts its correction, and thirteen new
tests exist where there were none.

### 8.1 The one cell that moved, and why it is a movement rather than a slip

**`present` 610 → 611 and `unrun` 398 → 397 — one cell, and they are the same cell.**

```
DzMegaMenu  axe  unrun  artifacts []
         -> present     artifacts ["packages/core/tests/a11y/navigation.a11y.spec.ts"]
```

Tier C totals: `present` 117 → **118**, `unrun` 87 → **86**. Nothing else in the 144 rows
changed by a single byte — checked cell by cell by diffing the two artifacts, not by
comparing summary counts: **1 changed cell out of 1,662**.

The cause is the fix. `DzMegaMenu` had **no entry at all** in
`packages/core/tests/a11y/`, which is half of why `D-RES10-2` survived — the other half
being that the browser lane runs both structure rules over it and cannot fail on them
(RESIDUAL-10 §3.1). Adding the family gives the `axe` cell a real artifact where the
list had been **empty**.

**It is reported as a movement rather than presented as "nothing changed"**, because the
frozen set named these numbers and an agent that moved one quietly would be doing the
thing this programme exists to stop. The direction is the one the programme wants —
evidence appearing where there was an empty list — and the alternative was to fix an
ARIA structure defect on a Tier C component while leaving it with no axe coverage.

---

## 9. Owner decisions — five closed, two raised

### 9.1 Closed to the limit of agent authority

| item | new status |
|---|---|
| **`D-RES10-1`** 🔴 — `DzStepperItem` renders every step `completed` on the server | **FIXED (2026-09-28).** Index claimed during `setup`. Server HTML now depends on the model — three different renders for `modelValue` 0/1/2, exactly one `aria-current="step"`, check-mark count equal to the steps behind the user — and hydrating the server HTML now changes **zero bytes**. Seed A restored the original `onMounted` registration and failed **exactly 3** tests, all three server-side, with **all 37 client-side stepper tests green** (§1) |
| **`D-RES10-2`** 🟡 — `DzMegaMenu`'s menubar owns a `listitem` | **FIXED (2026-09-28).** `role="none"` on the expanded branch's `<li>`; the collapsed branch deliberately untouched. Verified against the vendored `axe-core`'s own traversal, not from memory. The family gained its first two entries in `tests/a11y/`. Seed B failed **exactly 3** tests and printed **three** axe rules, not the two RESIDUAL-10 predicted (§2) |
| **`D-RES10-3`** 🟢 — `DzChip` is `role="status"` on every chip | **FIXED (2026-09-28), with a named cost.** Role removed; the chip now matches `DzTag`, which is the same element without it, and a test compares the two so they cannot diverge again. The exposed `aria-prohibited-attr` on a named chip is raised as `D-RES11-1` rather than left to be discovered (§3) |
| **`D-RES10-4`** 🟢 — `DzDataView` announces "No items" twice | **FIXED (2026-09-28).** Recommendation (c): the window region reports the count (`showingAll` at 0), the empty state reports the title. No new message key, so no locale moved. One browser-lane play function was asserting the defect and now asserts its correction (§4, §6) |
| **`D-RES10-5`** 🟢 — `DzSelect` ships `value="__DZ_SELECT_EMPTY__"` | **FIXED (2026-09-28), and it was NOT hygiene.** The sentinel is load-bearing for **items** (Reka's `SelectItem` throws on `''`) and was never needed at the **root**. Measured consequence RESIDUAL-10 missed: because Reka's `shouldShowPlaceholder` tests for `''`, the sentinel withheld the trigger's `data-placeholder` and with it this component's own muted-placeholder class, so **every unset select painted its placeholder in the foreground colour**. Fixed at the root, kept for the one item case that needs it (§5) |

### 9.2 Raised

1. **`D-RES11-1` 🟢 — `aria-label` on `DzChip` and `DzTag` is prohibited on their root's
   role, and axe reports it where no gate can see.** Measured with axe on both
   components (§3.3): a `<span>` with no role is `generic`, ARIA 1.2 prohibits
   `aria-label` on `generic`, and passing `ariaLabel` produces
   `aria-prohibited-attr` — in **`incomplete`**, which `toHaveNoViolations()` does not
   see. `DzTag` has had this since it was written; `DzChip` acquired it in this batch
   by giving up a live-region role that was suppressing the warning by being wrong.
   Both components forward `ariaLabel`, `ariaLabelledby` and `ariaDescribedby` from
   `BaseAccessibilityProps`.
   **Options:** (a) let the chip's own text be its name and document `ariaLabel` as
   unsupported on these two — cheapest, and it is what a chip should do, but it leaves
   a declared prop that misbehaves, which VERSIONING.md §3 calls *"a promise-shaped
   lie"*; (b) give the root a naming-capable, non-live role **when** it is named
   (e.g. `group`) — correct ARIA, but a conditional role and a new a11y-tree node on
   every labelled chip; (c) remove `ariaLabel`/`ariaLabelledby` from both components'
   props — the honest fix under §3, and a **`minor`**, with a codemod and a
   `warnDeprecated`; (d) keep and record a deviation.
   **Recommendation: (b) for a named chip**, because it is the only one that is both
   correct and non-breaking — but which role a chip should be is the same design
   question `D-RES10-3` raised, and an agent should not answer it alone.
   **Cost of delay: low.** Nothing regresses; the warning is not new to the repository,
   only newly symmetric. **Add an `incomplete` assertion when it is decided** — the
   existing chip and tag axe tests cannot fail on it.
2. **`D-RES11-2` 🟢 — `DzChip.anatomy.ts` declares a keyboard contract the component
   has never implemented.** Found while establishing what a chip should be. The
   anatomy's `keyboard` table lists
   `{ key: 'Enter', action: 'Activate the chip.', apg: 'button' }` and the same for
   `' '`, with no `when` guard — and `DzChip.vue`'s `handleKeyDown` handles **only**
   `Delete` and `Backspace`, and the root has no click handler at all. So the published
   keyboard documentation promises an activation that does not exist, and the two
   removal keys it *does* handle are listed with `when: 'removable'` while the prop is
   named `closable`. This is **pre-existing and untouched by this batch**; it is
   recorded because `role="button"` was rejected on exactly this evidence (§3.2) and
   the next person to look at the chip's role will find the anatomy disagreeing.
   **Options:** (a) delete the two Enter/Space rows — the anatomy then matches the
   code; (b) implement activation and emit a `click`-shaped event — a new behaviour on
   a published component, and it needs a reason to exist; (c) leave and document.
   **Recommendation: (a)**, plus correcting `when: 'removable'` to `closable`.
   **Cost of delay: low**, but it is *documentation that is wrong*, which is the class
   this programme keeps finding. Whether an anatomy keyboard table is gated against the
   component's actual handlers is the more interesting question underneath it — nothing
   checks that today.

### 9.3 Not raised, because there is no choice in it — but somebody should look

**A visual baseline may move, and this batch did not run the visual lane.** The
`D-RES10-5` fix makes an unset `DzSelect` carry `data-placeholder` on its trigger, which
activates `data-[placeholder]:text-[var(--dz-muted-foreground)]` — so the placeholder
paints muted instead of in the foreground colour. That is the *correction*; the existing
baseline, if any covers an unset select, records a placeholder styled as a value.

`test:e2e:visual` is Playwright, is not part of `validate:all`, and its CI step carries
`continue-on-error: true` (re-verified by RESIDUAL-10 §4.1 and re-asserted by
`validate:browser-lane` clause 7 on every run — the final run prints
`visual-baselines declared false enforcing 0 · 1 advisory job(s): ci.yml:e2e`). It was
**not** run here, and the component-baselines lane is `developer-local` on `win32` while
CI is `linux`, so a win32 run would have qualified nothing anyway. Stated as an owner
item rather than claimed as checked.

---

## 10. Residue — nothing left behind, proved by difference

| thing | state |
|---|---|
| the two measurement probes | `packages/core/tests/__probe-res11.spec.ts` (SSR + hydration dumps) and `__probe-res11b.spec.ts` (the axe comparison of `DzChip` and `DzTag`) were written **outside** `packages/core/tests/ssr/` on purpose — that directory is the capability matrix's `ssrSpecs` glob — used for the measurement passes in §1.1, §1.2, §1.5, §2.1, §3.3, §4.1, §5.2 and §5.4, then **deleted**. `ls packages/core/tests/` shows no probe, and `git status --porcelain packages/core/tests/` lists only `M` entries for real specs. **No suite was run for evidence while either existed** |
| the five seeded `.vue` files | `DzStepperItem.vue`, `DzMegaMenu.vue`, `DzChip.vue`, `DzDataView.vue`, `DzSelect.vue` — each seeded once, each restored, and the hash file re-baselined after every accepted fix so a recorded hash is always of the **accepted** state rather than of a patched patch. `sha256sum -c` **OK** for all five after every restore. `git checkout` was **not** used anywhere in this batch |
| `yarn.lock` | **untouched.** sha256 `dcef3ed26f23fd00ea99f64ba8c977442bdcc6abd776300c323dc99a63e076cf`, byte-identical to the value RESIDUAL-09 and RESIDUAL-10 both recorded. Its ` M` status is **the owner's `yarn install` of 2026-09-28 09:36**. No `yarn install` was run and none is owed |
| screenshots / PNGs | none. No baseline was written, replaced or accepted; the browser lane was run, not re-baselined |
| processes | **none killed.** `chrome` 56 → 56, `node` 23 → 23, `chromium`/`msedge`/`headless_shell` 0 → 0 across the browser-lane run. No `taskkill`, no kill-by-name, no kill at all |
| scratch files inside the repository | none. Every log, backup, hash file and probe output lives in the session scratchpad **outside** the repository, and the scratch directory was created by a command that touches nothing inside it |
| `*ceiling*.json` | none opened for writing — `find packages -name '*ceiling*.json' -newermt <session start>` is **empty** |
| `.changeset/` | **48 → 53.** Five added, one per fixed defect, all `@dzup-ui/core: patch`. Nothing existing was edited |
| git | nothing committed, pushed, stashed, reverted, checked out, cleaned, pulled, merged or rebased. No CI dispatch, no publish, no deployment, no baseline replacement |

### 10.1 Dirty paths — 333 → 349, and every one of the 16 is attributed

```
git status --porcelain | wc -l          before 333   after 349
diff <before listing> <after listing>   ->  16 lines added, 0 removed, 0 modified
```

**Nothing that was dirty at entry stopped being dirty, and nothing changed its status
letter.** The 16 new paths, by defect:

```
 M packages/core/src/components/navigation/DzStepperItem.vue        D-RES10-1
 M packages/core/tests/ssr/form-layouts-ssr.spec.ts                 D-RES10-1
 M packages/core/src/components/navigation/DzMegaMenu.vue           D-RES10-2
 M packages/core/tests/a11y/navigation.a11y.spec.ts                 D-RES10-2
 M packages/core/src/components/data/DzChip.vue                     D-RES10-3
 M packages/core/src/components/data/DzChip.spec.ts                 D-RES10-3
 M packages/core/src/components/data/DzChip.contract.spec.ts        D-RES10-3
 M packages/core/src/components/data/DzDataView.vue                 D-RES10-4
 M packages/core/src/components/data/DzDataView.spec.ts             D-RES10-4
 M packages/core/stories/data/DzDataView.stories.ts                 D-RES10-4  (§6)
 M packages/core/src/components/forms/DzSelect.spec.ts              D-RES10-5
?? .changeset/a-server-rendered-stepper-no-longer-says-every-step-is-done.md
?? .changeset/a-mega-menus-menubar-no-longer-owns-two-list-items.md
?? .changeset/a-chip-is-no-longer-an-aria-live-region.md
?? .changeset/an-empty-data-view-announces-itself-once.md
?? .changeset/no-internal-marker-in-an-unset-selects-output.md
```

Five files this batch edited were **already** dirty at entry and so appear in neither
list — verified by name against the entry snapshot rather than assumed:

```
 M packages/core/src/components/forms/DzSelect.vue                  D-RES10-5
 M packages/core/tests/ssr/ssr-smoke.spec.ts                        all five
 M packages/core/tests/a11y/data.a11y.spec.ts                       D-RES10-3
 M packages/core/docs/capability-matrix.json  + component-meta.json + the docs pages
                                                                    regenerated
 M packages/core/security/inline-style-inventory.json               regenerated
 M docs/program-2026-09-22-architecture/EXECUTION-STATUS.md         the batch ledger entry
?? docs/program-2026-09-22-architecture/reports/                    this report + the register
```

---

## 11. Ranked next packet

1. **Register #2 / `D127` — commit the 349-path worktree.** Owner-only, and unchanged as
   the single act that unblocks the most. It is now also the only thing between five
   published-component fixes with five changesets and any of it being releasable: the
   four `! [dirty-input]` advisories exist purely because it has not happened, and every
   assertion this batch added is qualified against an uncommitted tree.
2. **Look at an unset `DzSelect` in a browser, or run `test:e2e:visual`** (§9.3). The
   `D-RES10-5` fix changes the placeholder's colour on the default state of a widely used
   control — a correction, and the one change in this batch a human eye should confirm.
   Ten minutes, and it is the only item here that cannot be settled by reading.
3. **`D-RES11-1` — what names a `DzChip` and a `DzTag`** (§9.2). The `aria-prohibited-attr`
   pair, now symmetric between the two components. It is a design decision with four
   costed options, and it is the natural successor to `D-RES10-3` rather than a new
   thread.
4. **`D-RES11-2` — the anatomy keyboard table that documents keys the component does not
   handle** (§9.2), and the gate-shaped question underneath it: **nothing checks an
   anatomy `keyboard` entry against the component's actual handlers.** `DzChip` is one
   instance found by accident; 144 components declare anatomy and this batch did not
   look at the other 143. A validator that parsed each `keyboard` key out of the anatomy
   and required the component's source to mention it would be cheap and would find its
   own backlog — the same shape as RESIDUAL-10's `ciGate` clause, applied to a different
   claim.
5. **The a11y-spec coverage gap `D-RES10-2` fell through.** `DzMegaMenu` — a Tier C
   component with a full APG menubar implementation — had **no entry in
   `packages/core/tests/a11y/`** at all, and the browser lane's axe pass cannot fail on
   it because `stories/navigation/` has not opted into `a11yError` (129 of 169 story
   files have not). So a component can have zero axe enforcement from either lane and
   nothing says so. RESIDUAL-10 §9 item 4 proposed counting opted-in families and
   ratcheting it; this batch is the evidence that the *other* half matters too — a gate
   that required every Tier C component to appear in its family's `a11y.spec.ts` would
   have found this before an SSR sweep did.
6. **Make the capability generator derive `ciGate` from the same workflow read the
   validator performs** (RESIDUAL-10 §7.3). Unchanged, and unchanged in rank: two routes
   to one answer. ~1 h, and it moves the artifact, so it belongs in a batch that is
   regenerating anyway — which this one was, and it was out of scope for the same reason
   RESIDUAL-10 gave.
7. **`D-RES09-1` — write the changeset rule into `release-policy.json`'s comment.** Hit a
   third time: this batch changed `capability-matrix.json`'s bytes again (one cell),
   added no changeset **for that**, and had to re-decide the same question a third
   consecutive batch has re-decided. Ten minutes.
8. **`dzAccordion`'s skip** — the one honest gap left in `ssr-smoke.spec.ts`, unchanged
   from RESIDUAL-10 §9 item 8. Upstream triage, not a test edit: does Reka's
   `AccordionRoot` still stall `renderToString` under jsdom? If not, un-skipping yields
   one more measured component; if so, the skip should cite a version rather than
   "known".
9. **`D-RES02-2`'s residue — audit the rest of the citation lists.** Unchanged, and this
   batch adds one more data point that the RESIDUAL-05 predicate behaves correctly: one
   cell moved, for one real reason, and the other 1,661 did not.

---

## 12. State of the tree at handover

```
HEAD                             4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a   (unchanged)
git status --porcelain | wc -l   349    (entry 333; +16, every one attributed in §10.1)
yarn.lock                        ` M`, sha256 dcef3ed2…e076cf — the OWNER's install, untouched
committed                        nothing. No push, no CI dispatch, no publish, no
                                 deployment, no baseline replacement, no `yarn install`
validate:all                     EXIT=0 · 61 links · 1,311 lines · 52 ✓ · ZERO ✗ · ZERO STALE
yarn test                        EXIT=0 · 575 files · 11,226 passed · 3 skipped · 1 todo · 0 failed
browser lane                     EXIT=0 · 170 files · 1,462 tests · 1,462 passed · 0 failed · 97.01 s
                                 green on the FIRST attempt · zero process leak · nothing killed
pending changesets               53 (48 received + 5, all `@dzup-ui/core: patch`)
ceiling files opened for writing none (`find … -newermt <session start>` empty)
```

**All three lanes handed back green.** The five defects RESIDUAL-10 raised are all
dispositioned: **five fixed**, none deliberately left, and two new findings raised
(`D-RES11-1`, `D-RES11-2`) with the measurements that produced them.

**Files this batch wrote or edited — 18:**

```
 M packages/core/src/components/navigation/DzStepperItem.vue      D-RES10-1
 M packages/core/src/components/navigation/DzMegaMenu.vue         D-RES10-2
 M packages/core/src/components/data/DzChip.vue                   D-RES10-3
 M packages/core/src/components/data/DzDataView.vue               D-RES10-4
 M packages/core/src/components/forms/DzSelect.vue                D-RES10-5
 M packages/core/tests/ssr/ssr-smoke.spec.ts                      4 blocks + the header
 M packages/core/tests/ssr/form-layouts-ssr.spec.ts               +1 hydration test
 M packages/core/tests/a11y/navigation.a11y.spec.ts               +2 DzMegaMenu tests
 M packages/core/tests/a11y/data.a11y.spec.ts                     +1 DzChip test
 M packages/core/src/components/data/DzChip.spec.ts               1 inverted, +2
 M packages/core/src/components/data/DzChip.contract.spec.ts      1 inverted
 M packages/core/src/components/data/DzDataView.spec.ts           +1
 M packages/core/src/components/forms/DzSelect.spec.ts            +4
 M packages/core/stories/data/DzDataView.stories.ts               a play function that
                                                                 asserted the defect
?? .changeset/  × 5                                              one per defect
 M packages/core/docs/capability-matrix.json  + component-meta.json
   + security/inline-style-inventory.json + 153 docs pages + nav.json
                                                                 regenerated, sanctioned order
?? docs/program-2026-09-22-architecture/reports/RESIDUAL-11-…-handoff.md   this report
 M docs/program-2026-09-22-architecture/EXECUTION-STATUS.md       the batch ledger entry
?? docs/program-2026-09-22-architecture/reports/owner-decision-register-2026-09-22.md  §17
```

**What a reader should not over-read from this report.**

- **`D-RES10-1`'s hydration claim is a byte equality in jsdom**, not a browser
  measurement. It proves that Vue's hydration of this component's server HTML performs no
  patch — which is the whole of the defect — and it does not prove anything about paint
  timing in a real engine.
- **The axe results are jsdom axe results.** They are structural (roles, ownership,
  prohibited attributes), which jsdom computes correctly; they say nothing about contrast
  or anything else that needs layout, and RESIDUAL-06 §2.3 records why.
- **`D-RES11-1` is raised, not fixed.** A named `DzChip` still produces an axe
  `incomplete` that no gate can see, exactly as a named `DzTag` always has. The batch
  made the two symmetric and said so; it did not make either correct.
- **No visual lane was run** (§9.3), and one fix plausibly moves a baseline.
