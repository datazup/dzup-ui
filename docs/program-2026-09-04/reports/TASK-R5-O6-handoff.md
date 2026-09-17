# TASK-R5-O6 — Composition contract: `asChild` allowlist, multi-root fallthrough, `ui` merge order

> Baseline **`99b963a`** on `main` (HEAD did not move; re-verified at the end).
> Every number below is bound to that commit **+ the dirty tree** (662 paths at
> start, 674 at end — nine packets' uncommitted work, all preserved).
> **`git status --short`: 662 → 674. 12 new paths, all mine. 0 disappeared,
> 0 status changes on any pre-existing path** (decision D5's mitigation; the
> full set-diff is §8).

## 0. Done-check result

Run first, per README §4. **0 of 4 passed** — the task ran in full.

| Check | At start | At end |
|---|---|---|
| `ls packages/contracts/src/**/as-child* …` | no match; `packages/core/src/composition/` did not exist | `packages/contracts/src/as-child-allowlist.ts`, **8 entries** |
| `grep -rl "fallthrough" …/*.contract.spec.ts \| wc -l` | **0** | **7** — exactly the number of multi-root components |
| `ls …/uiMergeOrder.contract.spec.ts` | no match | present |
| `grep -rn "external write" …` | no match | `…/controlledModel.contract.spec.ts` |

---

## 1. Discovery — the three inventories (step 1)

**Two of the brief's three premises were wrong, and the measurement is what
this section publishes.** Both errors were in the same direction: a `grep`
that matched more than it meant, and a count frozen before another packet
landed.

### 1.1 `asChild` — **8 components, not 5**

The brief says "`asChild` is implemented on **5** components". It is not.

| What the brief's scan did | Result |
|---|---|
| `grep -rln "asChild" packages/core/src` | 9 files |
| …of which match the unrelated identifier **`hasChildren`** | **4** — `DzTreeItem`, `treeNavigation.ts`, `DzCascader`, `DzTreeSelect` |
| …and it cannot see the six always-on triggers, which spell it `as-child` **in a template** | **6 missed** |

A word-boundary scan of the script blocks plus a template scan gives the real
surface — **2 opt-in props + 6 always-on pass-through triggers**:

| Mode | Components |
|---|---|
| `opt-in` (`asChild?: boolean`) | `DzButton` ⚠, `DzDialogClose` |
| `always` (`as-child` wrapping `<slot />`) | `DzContextMenuTrigger`, `DzDialogTrigger`, `DzDropdownMenuTrigger`, `DzPopoverTrigger`, `DzSheetTrigger`, `DzTooltipTrigger` |

Two further discriminations were needed, and each one changed the count:

- **Six components use `as-child` around markup they wrote themselves** —
  `DzSelect` on a `<ChevronDown>`, `DzCombobox`/`DzMultiSelect`/`DzTimePicker`/
  `DzCascader`/`DzColorPicker` on their own `<button>`. That is an internal
  Reka detail with **no consumer surface**; listing them would put six
  components on an allowlist for a promise they do not make.
- **Five overlay compounds show `<DzXTrigger as-child>` in an `@example`**
  (`DzDialog`, `DzTooltip`, `DzDropdownMenu`, `DzPopover`, `DzSheet`). A scan
  that does not strip comments reports all five as implementers.

⚠ **`DzButton`'s `asChild` is declared and does nothing (finding F-1).**
`DzButton.types.ts:47` declares `asChild?: boolean` and `DzButton.vue:34`
defaults it to `false`, and **the template never reads it**: the root is
`<component :is="computedTag">` chosen from `as`/`href`/`to`, and no branch
renders the slot in place of an element. Setting `asChild` changes nothing at
all. Asserted as such (§3.1) and recorded in the allowlist as `unimplemented`
rather than deleted → **D40**.

### 1.2 Multi-root components — **7**

Found by parsing each template's root nodes with `v-if`/`v-else` chains counted
as one root:

| Component | Roots | `$attrs` binds to | Declared target |
|---|---|---|---|
| `DzFieldArray` | `<template v-for>` + `<slot>` | nothing | **`none`** |
| `DzKnob` | `div` + `p` | the `role="slider"` gauge | `root` |
| `DzLightbox` | `<slot>` + `DialogRoot` | `DialogContent` | **`content`** |
| `DzPopconfirm` | `span` + `Teleport` | the teleported panel | **`panel`** |
| `DzSidebar` | `Teleport` + `nav` | the `<nav>` | `root` |
| `DzTableRow` | `tr` + `tr` | the data row | **`row`** |
| `DzToastViewport` | `ToastViewport` + `DzToast` | the viewport `<ol>` | *(spec-declared)* |

Six of the seven set `inheritAttrs: false` and choose explicitly. `DzFieldArray`
does not — it is genuinely renderless, and `target: 'none'` is the promise.

### 1.3 `ui` declarers — **100 members / 90 files, not 27**

The brief says "the 27". That number is from ADR-19 §386 and was already
corrected once (ADR-19 §5's 2026-09-04 clarification: "**26 public components
+ 1 compound part**, not 27 components and not 5"). It is now stale in the other
direction: TASK-R5-O2 completed the Tier B+ rollout, so at `99b963a` + the dirty
tree it is **`ui?:` on 100 members across 90 `.types.ts` files, 89/89 Tier B+
components**. Everything in §2 is measured over that population.

---

## 2. The ratified `ui` merge order — and the defect it exposed

### 2.1 The gap (finding R-021), measured

ADR-19 §5 says `class` and `ui` "merge through the same `cn()`". **It never says
in which order** — and `cn()` is tailwind-merge, where the *last* conflicting
utility wins, so the order is the entire answer to "which one takes effect".

Measured across every merge site in `packages/core/src`:

| | Sites | Components |
|---|---|---|
| **Order A** — `cn(recipe, ui, class)`, consumer `class` wins | **5** | 5 |
| **Order B** — `cn(recipe, class, ui)`, `ui` wins | **74** | **73** |
| **Total** | **79** | 78 |

Two opposite contracts were shipping in one library. A consumer writing
`<DzButton class="rounded-none" :ui="{ root: 'rounded-xl' }" />` and
`<DzCard class="rounded-none" :ui="{ root: 'rounded-xl' }" />` got **opposite
results from the same two props**, and nothing anywhere said which was right.

### 2.2 The decision: `recipe → ui → class` (D38)

The task's `<stop_conditions>` says to "pick the order that the pilots' browser
evidence proves". That resolves cleanly, and the coincidence is exact:

> **The 5 Order-A components are `DzButton`, `DzDialogContent`, `DzInput`,
> `DzSelect` and `DzTable` — precisely the component set in
> `packages/core/stories/compositions/styling/Overrides.stories.ts`**, the P3-03
> fixture behind the only *browser* evidence the override contract has
> (`e2e/components/styling-overrides.spec.ts`).

Three arguments, not one, because the coincidence alone would be thin:

1. **ADR-19 §5 promises it.** "`class` keeps its meaning: it applies to the root
   only, merged through `cn()`. **Nothing about existing usage changes.**" Under
   Order B, adding a `ui` prop to a component silently changes what every
   existing `class` on it does.
2. **It is the rule that survives composition.** The case that matters is not
   one author passing both — it is a *wrapper*. An application builds
   `AppButton` over `DzButton` and sets `ui` for its house style; someone then
   writes `<AppButton class="w-full" />`. Order B makes the wrapper's choice
   unoverridable and sends that author to `!important` — the single outcome
   ADR-19 exists to prevent ("A consumer override needs no `!important`").
3. **The deliberate five agree; the bulk-applied 73 do not.** The 73 acquired
   `ui` during the three-session R5-O2 rollout, where the order was copied
   rather than chosen — the same "made once, per component, in bulk" shape
   `tv-slot-calls.ts` documents for `DzLightbox`'s ten uncalled slots.

**Honest limit:** the browser evidence proves `ui` beats the recipe (three
computed-style assertions). It does **not** test `class` and `ui` together, so
it settles the half both orders agree on. The `class`-vs-`ui` half is decided by
(1) and (2) above and is now proved *in jsdom* by a rendered assertion (§3.3).

### 2.3 What was NOT done, deliberately

**The 73 are recorded, not fixed.** Re-ordering a merge changes rendered output
for real consumers; this task writes the contract, and migrating to it is
separate work. They live in
`packages/core/src/composition/ui-merge-order-ceilings.json` as a **recorded
defect with a downward-only ceiling** — never an exemption list:

- a **new** component merging the wrong way fails immediately (it is not in the
  ceiling);
- a **fixed** component fails too, until the ceiling is lowered (the downward
  arm — R5-O5's F-8 was found by exactly this shape);
- a **stale** entry fails (renamed or deleted components cannot pad the count).

### 2.4 A hole in my own checker, found mid-task (finding F-2)

The first version of the merge-order scan read `cn()` calls only. Opening
`DzKnob` for an unrelated reason (its fallthrough target) showed it merging
`:class="[rootClasses, ui?.root]"` — where `rootClasses` is
`cn(styles.root(), attrs.class)`. The consumer's `class` is *inside* the
computed and the `ui` value **never enters a `cn()` call at all**, so the scan
could not see it. Vue concatenates the array left to right, so the array
position is the merge order just as an argument position is.

**Eighteen components merge that way, 19 sites.** The scanner now reads both
idioms and each ceiling entry records which. **The ceiling went from 53
components to 73 when the checker got honest** — the number got worse because
the measurement got better, which is the direction this program prefers.

Four permanent seeded tests pin the hole shut, including one that proves the
identifier is resolved **per file** (a same-named `rootClasses` that does *not*
fold in `attrs.class` is correctly not a site — a false positive is how a gate
acquires an exemption list).

---

## 3. Implemented files + API effect

### 3.1 New — `@dzup-ui/contracts` (additive, `patch` under 0.x)

| File | What it adds |
|---|---|
| `packages/contracts/src/as-child-allowlist.ts` | `AS_CHILD_ALLOWLIST` (8 entries), `asChildEntryFor()`, types `AsChildEntry` / `AsChildMode` / `AsChildGuarantee` |
| `packages/contracts/src/composition.types.ts` | `UI_MERGE_ORDER`, `SAFE_FALLTHROUGH_ATTRS`, `HANDLER_COMPOSITION_RULE`, type `UiMergeLayer` |

**Why the allowlist is central and not a per-component declaration.** Every
other contract fact in this repo lives beside the component because the
component is the only thing that knows it. An allowlist is the opposite case:
its entire value is that a component **cannot add itself**. A
`composition.asChild` field on `ComponentAnatomy` would be self-certification —
the component that copied the prop would copy the declaration with it, and the
gate would go green on exactly the change it exists to catch. So it lives in a
package a component edit does not touch, and source and list are checked against
each other **in both directions**.

### 3.2 Extended — `ComponentAnatomy.fallthrough` (one field, two decisions)

`packages/contracts/src/anatomy.types.ts` gains an optional `fallthrough`
(`ComponentFallthrough`: `target`, `reason?`, `delegatesTo?`).

**This deliberately collapses D24 and D26 into one field.** D24 wanted a
`classTarget`; D26 wanted a `delegatesTo`. They are the same question from two
ends — *which node is this component's outward-facing surface?* A `classTarget`
answers "an inner part of mine"; a `delegatesTo` answers "another component's
root". Two fields would have let a component answer one and not the other, and
left a reader two places to look for one fact.

Absent is the honest default and most of the catalogue. **14 components
declare it** — 12 in their anatomy, 2 in their contract spec:

| Reason | Components |
|---|---|
| Multi-root (anatomy) | `DzFieldArray` (`none`), `DzKnob`, `DzLightbox`, `DzPopconfirm`, `DzSidebar` |
| Multi-root (spec-only — no anatomy file) | `DzTableRow`, `DzToastViewport` |
| **D24** — `class` re-pointed inward | `DzSlider`, `DzRangeSlider`, `DzRating`, `DzDatePicker`, `DzDateRangePicker` → `control`; `DzMention` → `input` |
| **D26** — pure wrapper | `DzPersonaSelector` → `root` + `delegatesTo: 'DzCombobox'` |

`DzTableRow` and `DzToastViewport` are compound sub-parts with no anatomy file
of their own. Stamping a `data-part` on a non-declaring component purely to make
the check addressable would add an emission `validate:anatomy-parts` then
reports as undeclared — so the helper takes a `targetSelector` and the
components stay honest about having no parts.

### 3.3 New — `@dzup-ui/testing` (additive)

`packages/testing/src/composition.ts` — the **fourth member** of the family
`expectAnatomy` / `expectKeyboardContract` / `expectRtl` already form, exported
from the same barrel. It follows `rtl.ts`'s source-vs-rendered split:

| Export | Kind | Claim |
|---|---|---|
| `mergeSitesIn`, `arrayMergeSitesIn`, `classCarryingIdentifiers`, `checkUiMergeOrder`, `expectUiMergeOrder` | **source** | catalogue-wide, no mount needed |
| `checkFallthrough`, `expectFallthrough` | **rendered** | Vue's fallthrough is a runtime rule |
| `checkAsChild`, `expectAsChild` | **rendered** | the consumer's element survived |
| `checkHandlerComposition`, `expectHandlerComposition` | **rendered** | the listener ran exactly once |
| `checkExternalWrite`, `expectExternalWrite` | **behavioural over time** | needs a *sequence*, not a snapshot |

**A check I deliberately removed rather than shipped (finding F-3).**
`checkAsChild` first flagged "the component wrapped your element" by looking for
a parent carrying a `data-part`. That is wrong, and it was wrong in practice:
`DzDialogClose` renders inside the dialog's own `content` part, so its
consumer's button legitimately has a `data-part` parent `DzDialogClose` did not
add. Nothing in a rendered tree distinguishes "my wrapper" from "my parent's
part" without knowing which nodes the component authored. **A gate that cries
wolf is a gate somebody switches off**, so the wrapper claim is made by the
per-component assertion that the consumer's element carries no `data-part` of
ours, and the heuristic is gone with the reasoning recorded at the call site.

### 3.4 New — the contract lane (`packages/core/src/composition/`)

| File | Tests | What it holds |
|---|---|---|
| `uiMergeOrder.contract.spec.ts` | 23 | catalogue-wide order + ceiling (4 arms) · rendered proof on the pilots · handler composition · safe attrs · 9 seeded |
| `asChild.contract.spec.ts` | 19 | allowlist both directions · the shared matrix · `DzButton`'s dead prop · 6 seeded |
| `fallthrough.contract.spec.ts` | 16 | declaration self-consistency · D24 rendered on 3 controls · D26 · 6 seeded |
| `controlledModel.contract.spec.ts` | 10 + 1 skipped | D8 reproduced and pinned · the population census · 5 seeded |
| `ui-merge-order-ceilings.json` | — | the 73-component downward-only ceiling |

Plus `fallthrough` assertions appended to the **7** multi-root components' own
contract specs, and a `fallthrough contract` block (8 tests) in
`packages/tooling/src/ownership/anatomy-source.spec.ts`.

### 3.5 Generators and docs — the field is carried end to end

Per `<repo_conventions>`, `fallthrough` was wired through the **existing**
pipeline rather than a second one:

| Stage | Change |
|---|---|
| `packages/tooling/src/ownership/anatomy-source.ts` | `readFallthrough()`, modelled on `readRtl()`; `ManifestAnatomy.fallthrough` |
| `packages/tooling/src/meta/component-meta.ts` + `generate-component-meta.ts` | `AnatomyJoin.fallthrough`, copied verbatim |
| `packages/tooling/src/docs/contract-sections.ts` | `renderParts()` publishes **the merge order on every page**, and a tailored "Where your `class` lands" note where declared |

`reason` is deliberately **not** carried into the manifest: it is prose
containing commas, quotes and backticks, and `fieldValue` is a brace matcher,
not a JS parser. The manifest carries the machine-readable half; the contract
spec enforces that a non-`root` target has a reason.

**Rendered result:** the merge order now appears on **103** component pages (all
with a declared anatomy, 0 before) and the fallthrough note on **12** (0 before).
The note is tailored three ways — renderless, delegating, and inner-node — after
a first draft got two things wrong that I caught by reading the output: it
claimed "not the outermost node" for multi-root components whose target *is*
`root`, and it cross-referenced "the merge order below" when the merge order was
not yet on the page.

### 3.6 `package.json` — `test:contracts` was unrunnable on Windows (finding F-4)

`yarn test:contracts` exits **1** with `The command line is too long.` The script
shell-expands `packages/**/*.contract.spec.ts` to **9,692 characters** of argv,
and **cmd.exe's limit is 8,191**.

**This is pre-existing, not mine**: without my four new files the expansion is
still **9,455** characters — 1,264 over the limit. The lane named in this task's
own `<validation>` block, and the lane the allowlist gate is supposed to fail
in, could not run for any Windows contributor.

Changed to a vitest **filter substring** (`.contract.spec.ts`), which is
platform-independent and coverage-identical: **150 files, 1,575 tests, exit 0**.
Raised as **D39** for the owner to confirm, since it is a shared lane.

---

## 4. Focused validation — exact commands and exit codes

Read directly (`cmd; echo "exit $?"`), never through a pipe.

| Command | Exit | Result |
|---|---|---|
| `npx vitest run packages/core/src/composition` | **0** | 68 passed, 1 skipped (4 files) |
| `npx vitest run …/composition + the 7 multi-root specs + tooling ownership/meta/docs` | **0** | **386 passed, 1 skipped (21 files)** |
| `yarn test:contracts` *(after F-4 fix)* | **0** | **150 files, 1,575 passed, 1 skipped** |
| `yarn generate:component-meta` | 0 | `fallthrough` on 12 records |
| `yarn validate:component-meta` | **0** | — |
| `yarn validate:ownership` | **0** | `fallthrough` on 12 manifest entries |
| `yarn validate:anatomy-parts` | **0** | unchanged by the new field |
| `yarn validate:docs-pages` | **0** | — |
| `yarn validate:rtl` · `validate:llms` · `validate:tv-slots` · `validate:quality-tiers` | **0** | — |
| `yarn typecheck` | **0** | — |
| `yarn lint` | **0** | — |
| `yarn validate:changelog` | **0** | 7 passed — changeset added |

The one skipped test is deliberate: `the contract, once D8 is fixed`, which
TASK-R2-O3 enables.

### 4.1 Seed-and-prove — three **live** seeds, all confirmed red, all restored

Per the standing lesson, no green was believed before a matching red.

| Seed | Result |
|---|---|
| Flip `DzButton` to `class`-then-`ui` | **exit 1 on 4 independent assertions** — the unrecorded-deviation check, the ceiling (74 > 73), the conformant-set check, **and the rendered behaviour check** (`h-32` no longer wins). The rendered arm firing is what proves the source scan is not the only thing holding this. |
| Remove `DzTooltipTrigger` from the allowlist | **exit 1** — unlisted implementer + entry count |
| Point `DzRating.fallthrough.target` at `root` | **exit 1** — "landed on `<div>` with `data-part="control"`" |

All three restored and verified **byte-identical to their pre-seed backups**
(`filecmp.cmp(shallow=False)`), and the lane re-run green afterwards.
**26 further seeded failures ship permanently** inside the four specs.

---

## 5. Aggregate qualification

| Lane | Exit | Reading |
|---|---|---|
| `yarn validate:all` | **1** | Stops at **`validate:capability-matrix`** — 12 stale cells + `DzFileUpload` tier-d. **Pre-existing, byte-identical to the known-red at `99b963a`.** |
| every link **after** capability-matrix, run individually (17 of them) | **0** each | visual-baselines, tokens, tokens:dtcg, exports, mcp, playground-parity, package-names, doc-snippets, engines, adr-references, readme-facts, externals, dts, changelog, release-policy, peers, licenses |
| `yarn test` (full suite) | **1** | **9,715 passed / 4 skipped / 1 todo of 9,722; 524 files.** The **2 failures are the documented inherited ones** — `landing-token-fallbacks` and `story-dod-tiers countOpen` — **and no others.** |

**Attribution is explicit: this packet introduced no new failure in any lane.**
The suite grew from R5-O5's 9,637 to 9,722; the growth is this packet's tests.

Not run (unchanged by this work, and browser lanes are not locally qualifying):
`test:e2e`, `test:e2e:visual`, `storybook:build`, `storybook:test`,
`test:nuxt-fixtures`, perf lanes.

---

## 6. Ratchet movements (old → new)

| Ratchet | Old | New | Direction |
|---|---|---|---|
| `ui` merge-order deviating **components** | *(no ratchet existed)* | **73** | new, downward-only |
| `ui` merge-order deviating **sites** | *(none)* | **74** | new, downward-only |
| `ui` merge-order **conformant** components | *(unmeasured)* | **5** | pinned to the pilot set |
| `asChild` allowlist entries | *(no allowlist)* | **8** (2 opt-in, 6 always) | new, both directions gated |
| `asChild` implementers **unimplemented** | *(uncounted)* | **1** (`DzButton`) | new, downward-only |
| Components declaring `fallthrough` | **0** | **14** (12 anatomy + 2 spec) | upward — coverage |
| Multi-root components **declaring** their target | **0 / 7** | **7 / 7** | complete |
| `component-meta.json` records with `fallthrough` | **0** | **12** | new field |
| Docs pages publishing the **merge order** | **0 / 144** | **103 / 144** | upward (103 = every page with a declared anatomy) |
| Docs pages with a **fallthrough** note | **0** | **12** | new section content |
| D8 controls pinned by contract | **0 / 7** | **7 / 7** | census gated |
| `yarn test:contracts` runnable on Windows | **no** (exit 1) | **yes** (150 files, exit 0) | fixed |

**No ceiling was raised to make a gate pass.** The merge-order ceiling was
*created* at the measured value and then **raised once, from 53 to 73, before
any gate depended on it** — because the checker learned to read a second idiom
(§2.4). That is the measurement getting honest, and it is recorded here rather
than smoothed over.

---

## 7. Owner decisions

### Settled by this packet

**D24 — SETTLED, option (c).** `fallthrough.target` *is* the `classTarget` the
decision asked for. All six named components declare it (five `control`, one
`input`), each with a reason; the targets were **measured from source, then
proved by rendering** three of them. It is in the ownership manifest, in
`component-meta.json`, on the docs page, and self-consistency-checked (a target
must be one of the component's own declared parts). Option (a) — "ship as
declared, nothing moves" — is preserved exactly: **no component's rendering
changed.** Recommendation "(a) now, (c) next" is fully discharged.

**D26 — PARTIALLY SETTLED, option (b) first half.** `delegatesTo` exists and
`DzPersonaSelector` declares `delegatesTo: 'DzCombobox'`. The fact is now
declarable, carried and checkable, which is what was blocking. **The second half
is not done**: `validate:anatomy-parts` still does not credit a delegate's
emissions, so the component still marks all sixteen parts `optional`. That
change moves `optionalParts`, a number another packet ratchets. → **D41**.

**D18 — PARTIALLY SETTLED, and its recommendation is blocked on the owner.**
The negative clause — *an `as-child` trigger is not a part* — is now **gated
repo-wide**: the allowlist enumerates every pass-through trigger, and the matrix
asserts the consumer's element carries no `data-part` of ours. The three
positive clauses (*parent-covers*, *boundary-stops*, *wrapper-covers-union*)
remain as-applied and asserted only in `overlays.anatomy.spec.ts`, exactly as
R5-O2 left them. D18's recommendation was "**(b) ratify into ADR-19 §3 first,
then gate**" — and **ADR-19 is explicitly outside this task's authority**
("Not yours: … ADR-19/ADR-20"). I could not take the recommended path. The
agent-available path (a) is taken for the negative clause only; the three
positive clauses need the ADR act first. **D18 stays open, with its scope now
reduced to the three positive clauses.**

### New — numbered from D38 (D1–D37 taken)

**D38 🔴 — Ratify `UI_MERGE_ORDER = recipe → ui → class`, and sequence the 73.**
*Taken provisionally and implemented*, because the task's `<stop_conditions>`
prescribes the tiebreak and it resolved unambiguously (§2.2). The 73 deviating
components are a **recorded defect under a downward-only ceiling**, not an
exemption list, and are not fixed here.
- (a) **Confirm Order A and commission the 73-component migration** — *taken as
  far as an agent may*: the contract is ratified, gated and published; the
  migration is a separate packet because re-ordering a merge changes rendered
  output for real consumers.
- (b) Ratify the *other* order (`ui` last) and re-point the 5 pilots instead —
  5 files rather than 73, but it contradicts ADR-19 §5's "nothing about existing
  usage changes", defeats the wrapper case, and discards the only browser-backed
  set.
- (c) Declare the order component-specific and publish it per page — honest,
  and it makes the library unlearnable.
- **rec. (a).** The cheap option (b) is cheap only because the mistake is
  widespread, which is not an argument. **Also needs an ADR-19 §5 amendment
  stating the order** — an owner act this task could not perform.

**D39 🟠 — `yarn test:contracts` was unrunnable on Windows; fixed, please
confirm.** The glob expands to 9,692 argv characters against cmd.exe's 8,191
limit; it was already 9,455 before this packet (§3.6). Changed to a vitest
filter substring — platform-independent, coverage-identical (150 files, 1,575
tests, exit 0).
- (a) **Keep the filter — taken.** · (b) Revert and let Windows contributors use
  `npx vitest run .contract.spec.ts` by hand. · (c) Split the lane per package.
- **rec. (a).** A named validation lane that cannot run on a maintainer's
  platform is a gate that silently is not run. The one behavioural difference —
  a substring filter also matches a path *containing* `.contract.spec.ts` — is
  exactly the intended set.

**D40 🟠 — `DzButton.asChild` is a published prop that does nothing.** Declared
in the types, defaulted in the component, never read by the template (§1.1).
Recorded in the allowlist as `unimplemented` with `guarantees: []`, and asserted
to be inert, so the defect is counted by the contract lane rather than
discovered by a reader of the types.
- (a) **Remove the prop** — breaking, therefore a `minor` while 0.x, and the
  honest correction: `as`/`href`/`to` already provide polymorphism and work.
- (b) **Implement it** — a new `asChild` implementer, which this task's
  `<scope>` explicitly forbids, and which means deciding what a button's recipe
  classes and `data-part` do on a consumer's element.
- (c) Leave it documented as inert — the status quo, plus a note.
- **rec. (a)**, sequenced by the owner into the next `minor`. A prop the type
  system confirms and the DOM ignores is worse than an absent one.

**D41 🟢 — Teach `validate:anatomy-parts` to credit a delegate's emissions
(D26's second half).** With `delegatesTo` declared, the validator could credit
`DzPersonaSelector` with `DzCombobox`'s emissions and let it drop `optional`
from sixteen parts that are not optional at all.
- (a) **Leave it — taken here.** The declaration is the part that was blocking;
  the validator change moves `optionalParts`, which another packet ratchets.
- (b) Teach the validator, in the packet that owns `optionalParts`.
- (c) Infer delegation from a template rendering exactly one child component —
  a heuristic over a template, which D26 already rejected.
- **rec. (b)**, with whoever next holds the anatomy-parts ratchet.

---

## 8. `git status --short` — start and end

**Start: 662 paths. End: 674 paths. Net +12, every one mine.**

```
NEW (12)
 ?? .changeset/your-class-wins-and-the-docs-now-say-where-it-lands.md
 ?? packages/contracts/src/as-child-allowlist.ts
 ?? packages/contracts/src/composition.types.ts
 ?? packages/core/src/composition/            (4 specs + 1 ceilings JSON)
 ?? packages/testing/src/composition.ts
  M packages/core/src/components/data/DzTable.contract.spec.ts
  M packages/core/src/components/feedback/DzToastViewport.contract.spec.ts
  M packages/core/src/components/forms/DzFieldArray.contract.spec.ts
  M packages/core/src/components/forms/DzKnob.contract.spec.ts
  M packages/core/src/components/media/DzLightbox.contract.spec.ts
  M packages/core/src/components/navigation/DzSidebar.contract.spec.ts
  M packages/core/src/components/overlays/DzPopconfirm.contract.spec.ts

DISAPPEARED: 0        STATUS CHANGED on a pre-existing path: 0
```

Files I edited that were **already** ` M` from earlier packets (so they do not
appear above): `packages/contracts/src/{index,anatomy.types}.ts`,
`packages/testing/src/index.ts`, `package.json`, the 12 `*.anatomy.ts`
declarations, `packages/tooling/src/{ownership/anatomy-source.ts,
ownership/anatomy-source.spec.ts, meta/component-meta.ts,
meta/generate-component-meta.ts, docs/contract-sections.ts}`, and the
regenerated artifacts under `packages/core/manifests/`, `packages/core/docs/`
and `apps/docs/`.

**Generator determinism proven, not assumed:** the full chain
(ownership → quality → capability → component-meta → llms → docs-pages) was run
**twice**, with **171 artifacts SHA-256 hashed after each pass and the sorted
hash lists compared — identical**. `DzButton.vue`,
`as-child-allowlist.ts` and `DzRating.anatomy.ts` were additionally confirmed
byte-identical to their pre-seed backups after the live-failure probes.

---

## 9. Ranked next packet

1. **🔴 The 73-component merge-order migration (D38(a)).** The contract is
   ratified and gated; 73 components still contradict it, and every one is a
   consumer who cannot override a wrapper without `!important`. The ceiling
   makes the work countable and each fix must lower it. Do it family by family
   with the rendered assertion as the acceptance test — and note that **19 of
   the 74 sites are the array form**, which needs the computed unpicked rather
   than two arguments swapped.
2. **🔴 ADR-19 §5 amendment stating the merge order (D38).** The contract now
   ships, is gated and is published on 103 documentation pages, while the ADR it
   derives from is still silent. Owner act; the agent could not touch ADR-19.
3. **🟠 TASK-R2-O3 — fix D8.** The contract that catches it now exists and is
   arranged so the fix turns this file red: delete the expected-failure test,
   drop `D8_CONTROLS`, and un-skip `the contract, once D8 is fixed`.
4. **🟠 D40 — remove `DzButton.asChild`** in the next `minor`.
5. **🟢 D18's three positive clauses**, after the ADR-19 §3 ratification the
   decision asks for.
6. **🟢 D41 — delegate crediting in `validate:anatomy-parts`**, with the packet
   that owns `optionalParts`.
