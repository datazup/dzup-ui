# TASK-S3-O2 — handoff

> Form-control primitives: `DzGrid` spans · `DzStack` gaps · async-options
> stories · `DzMention`. 🟢 `[!owner]`
>
> Run at `ui/dzup-ui` **`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`** (`4e4e46f`),
> worktree dirty by design (**274** paths at start, from fourteen prior tasks;
> all preserved). `main` is 11 commits behind `origin/main`; no pull, merge or
> rebase was performed. Every number below is bound to `4e4e46f`. Written
> incrementally while the task ran.

---

## 0. `<done_check>` executed first (README §4)

Run from `ui/dzup-ui` before reading the rest of the prompt.

| # | Clause as written | Verdict | Measured |
|---|---|---|---|
| 1 | `grep -n 'colSpan\|rowSpan' packages/core/src/components/layout/DzGrid.types.ts` | **fail (exit 1)** — but **misleading**: a span API *does* exist, spelled `span` on `DzGridItem` | see §1.1 |
| 2 | `grep -n "'none' \| 'xs' \| 'sm' \| 'md' \| 'lg'" packages/core/src/components/layout/DzStack.types.ts` | **fail (exit 1)** — **DEFECTIVE on two counts**; the vocabulary exists | see §1.2 |
| 3 | `ls packages/core/stories/forms/ \| grep -i async \| wc -l` | **0** — but **misleading** *and* a pipe that masks `grep`'s exit code | see §1.3 |
| 4 | `npx tsx packages/tooling/src/validators/form-readiness.ts` | **exit 0** (run as `node node_modules/tsx/dist/cli.mjs …` — `npx` is unsafe here) · `44 controls, 280 pass, 0 gap, 0 future, 20 unrun, 96 n-a` | see §1.4 |

**Outcome: 1 of 4 at `4e4e46f`** (clause 4 only). Protocol branch: *some pass* →
run the residual steps.

### 0.1 Defective and misleading clauses (register row 41, fifth+ recurrence)

**Clause 2 is defective on two independent counts.** The vocabulary it looks for
**exists and is complete**:

- It greps `DzStack.types.ts`, but `LayoutGap` is *declared* in
  `DzGrid.types.ts:19` and *imported* by `DzStack.types.ts:11`. `DzStack` is one
  of four consumers (`DzGrid`, `DzStack`, `DzFlex`, `DzDataView`); the union has
  never lived in the file the clause reads.
- The literal it greps excludes `| 'xl'`. The real type is
  `'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'` — a **superset** of the spec's
  `none|xs|sm|md|lg`, every member mapped to a spacing token in
  `DzGrid.variants.ts` (`--dz-spacing-0/1/2/4/6/8`). So even pointed at the right
  file the clause fails on formatting, not on substance.

  A correct probe: `node node_modules/tsx/dist/cli.mjs -e "…"` or
  `grep -n \"export type LayoutGap\" packages/core/src/components/layout/DzGrid.types.ts`
  then assert the five spec members are present.

**Clause 3 is a pipeline** (`ls … | grep -i async | wc -l`) — `wc -l` always
exits 0, so `grep`'s "no match" is invisible. It also asks the wrong question:
it counts **file names**, and the async-options *stories* exist as **nine story
exports across eight per-control files** plus a shared host
(`packages/core/stories/_shared/asyncOptionsHost.ts`) — none of which has
"async" in its file name. D72(2) in `../program-2026-09-04/reports/TASK-R3-O3-decisions.md`
predicted exactly this failure mode and its remedy is still `open`.

**Clause 1 fails honestly but describes the gap wrongly.** A span API *does*
exist; what does not exist is the **spec's spelling** and the **row axis**. See
§1.1.

**Clause 4 passes** and its substantive sub-claim ("`DzMention` with an explicit
disposition rather than a blank") **was already true at `4e4e46f`** — see §1.4.
`npx` was replaced with `node node_modules/tsx/dist/cli.mjs` per register row 41
class (ii).

---

## 1. What already existed — measured before editing

README §1's Form-System verdict was written on 2026-09-22 and **three of its four
residuals were already closed** by the uncommitted TASK-R3-O3 work in the
worktree. §4/§6 of the programme README warn about exactly this ("a packet's
stated gap is a hypothesis"). Corrections, with evidence:

### 1.1 `DzGrid` — a span API exists; `rowSpan` does not

| Claim in README §1 / the prompt | Measured at `4e4e46f` |
|---|---|
| "`DzGrid` has no span API" | **False.** `packages/core/src/components/layout/DzGridItem.vue` exists (65 lines), exported from `layout/index.ts:80`, typed by `DzGridItemProps` (`DzGrid.types.ts`), classed from the literal `gridItemSpanMap` table in `DzGrid.variants.ts` (4 breakpoints × 13 values), covered by 9 tests in `DzGrid.formLayout.spec.ts` and by `SpanningItems` in `packages/core/stories/layout/DzGrid.stories.ts:198`. Landed by TASK-R3-O3 decision **D67 option (b)** |
| "so a schema-driven grid layout cannot be expressed without a raw class" | **Half true.** The *column* axis needs no class. The **row** axis still does |

**The real, remaining gap — and it is load-bearing.** The Form document's
`nodeLayout` (`workspace-docs/repos/ui/docs/architecture/dzup-form-system-2026-08-08/schemas/dzup-form-document-v1alpha1.schema.json:174-189`)
declares **two** fields:

```json
"colSpan": { "type": "integer", "minimum": 1, "maximum": 12 },
"rowSpan": { "type": "integer", "minimum": 1, "maximum": 12 }
```

`DzGridItem` implements only the first, and it spells it `span`. So:

1. A document carrying `layout.rowSpan: 2` has **nowhere to go in Core** — the
   renderer must emit a raw `row-span-2`, which is the exact violation doc 03 §3
   forbids, relocated into the component boundary. `grep -rn "row-span" packages/ apps/`
   returns **0 hits** at `4e4e46f`: nothing in this repository can express it.
2. Once `rowSpan` exists, a bare `span` is **ambiguous** ("span of what?"), and
   it does not match the field name the document uses.

### 1.2 `DzStack` gaps — already complete, no code owed

`DzStack.types.ts:48` declares `gap?: LayoutGap`; `LayoutGap` resolves to
`'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'` (`DzGrid.types.ts:19`) — the spec's
five plus `xl`. `stackVariants`/`gridVariants` map all six to
`gap-[var(--dz-spacing-{0,1,2,4,6,8})]`. `DzGrid.formLayout.spec.ts` already pins
"spaces with gap rather than margins".

**Decision: no change.** Narrowing the union to the spec's exactly-five would be
a **breaking** type change (`xl` is consumed by `DzFlex.types.ts:34` and
`DzDataView.types.ts:64`) bought for nothing: a superset satisfies a document
that only ever emits five of the members. Recorded as **found-done**.

### 1.3 Async-options stories — the seam and eight stories exist; the six-state walk does not

`useAsyncOptions` (`packages/core/src/composables/useAsyncOptions/useAsyncOptions.ts`,
TASK-FORM-OSS-03) + the internal `DzOptionsState.vue` row are in place, and
**eight** controls carry an `AsyncOptions`/`AsyncSearch` story driven by the
shared mock host: `DzSelect`, `DzCombobox`, `DzListbox`, `DzMultiSelect`,
`DzCascader`, `DzTreeSelect`, `DzTransfer`, `DzMention`.

What those eight actually walk is `walkAsyncOptionsStates()` in
`packages/core/stories/_shared/asyncOptionsHost.ts` — **four** phases:
`loading → ready → error → retry`. Three of the prompt's six states have **no
story evidence anywhere in the repository**:

- **empty result** — the host's `resolve()` *can* produce `state='empty'` when
  the filter matches nothing, but no story ever drives it.
- **dependency-change clearing** (the cascading load the prompt calls out as
  "where schema-driven forms actually fail) — not exercised by any story.
- **stale-response discard** — the fence exists and is the composable's stated
  reason to exist ("Abort is the part worth having"), and the mock host honours
  `signal.aborted`, but **no story ever creates two in-flight requests**, so
  nothing proves the fence.

So the residual is real, and clause 3's "≥ 1 story file" is the right
deliverable even though its probe is wrong.

### 1.4 `DzMention` — the seam is resolved and the disposition is not blank

| Claim | Measured at `4e4e46f` |
|---|---|
| "the `DzMention` seam is unresolved" | **False.** `DzMention.vue` imports `useAsyncOptions` (line 39) and renders `DzOptionsState` (line 45/840); it drives **both** host-driven (`optionsState` + `@load-options`) and resolver-driven (`DzMentionOptionResolver`) mentions through the one seam, with the resolver run against the seam's `AbortSignal` (`runResolver`, line 302). That is TASK-R3-O3 decision **D71 option (a)**, executed |
| "`validate:form-readiness` must show it with an explicit disposition rather than a blank" | **Already true.** `docs/program-2026-08/form-controls-readiness-matrix.md:116` — `DzMention` carries a verdict in **all nine** clause cells (`C1…C6` ✅, `C7` – n-a, `C8` ✅, **`C9` ✅ pass**), specs `✓/·/✓`, story states `Invalid`. `grep -c '| |' ` on the row → 0. The gate exits **0** |

The only `DzMention` question left is **D71(b)** — whether to `@deprecate`
`DzMentionOptionResolver` in favour of `@load-options` — and D71 already records
that as "left open" because a deprecation is an owner act under
`packages/contracts/VERSIONING.md` §4. It is re-presented here as
**`D-S3O2-4`** (§5).

### 1.5 The owner-decision register does not carry any of the three decisions

`docs/program-2026-09-22-architecture/reports/owner-decision-register-2026-09-22.md`
(62 rows + §8 addendum) is the refreshed entry point. Measured:

```
grep -c D67 … → 0     grep -c D68 … → 0     grep -c D69 … → 0
grep -c D70 … → 0     grep -c D71 … → 0     grep -c span … → 0
grep -c Stack … → 0
```

None of them appears as a row, and none appears in §6.1 (consolidated), §6.2
(superseded) or §6.3 (out of scope) either — so they were not merged or closed,
they were **dropped**. README §7 item 9 names all three as open owner decisions,
so the register is **incomplete against its own entry-point claim**. This is a
gap, not a falsified row, so nothing existing is edited: §5 re-presents the three
with current numbers and **§8.4 is appended** to the register (appending, not
inserting, exactly as its own §8 does, so no row number moves).

*(implementation sections follow)*

---

## 2. Implemented files and API effect

### 2.1 New public API — `DzGridItem.colSpan` and `DzGridItem.rowSpan`

| File | Change |
|---|---|
| `packages/core/src/components/layout/DzGrid.types.ts` | `DzGridItemProps` gains `colSpan?: GridSpan \| ResponsiveSpan` and `rowSpan?: GridSpan \| ResponsiveSpan`. `GridSpan`'s doc widened to both axes and bound to the schema's `1..12`. `span` retained, documented as an alias of `colSpan`, **not** deprecated. No type removed, no union narrowed |
| `packages/core/src/components/layout/DzGrid.variants.ts` | New `gridItemRowSpanMap` — 4 breakpoints × 13 values, **literal** (a template string is invisible to Tailwind's scanner and compiles to nothing). Not added to `layout/index.ts`, matching `gridItemSpanMap`, which is why neither appears in the ownership manifest |
| `packages/core/src/components/layout/DzGridItem.vue` | One shared `spanClassesFor(span, table)` for both axes; `resolvedColSpan = colSpan ?? span`; both class strings merged through `cn()` so a consumer class still wins on either axis. No `data-part`, no provide/inject, no DOM read — server and client output identical, as before |
| `packages/core/src/utilities/warnConflictingProps.ts` **(new)** | The once-per-session dev warning for an alias pair, plus `resetConflictingPropWarnings()` for specs. **Exported from no barrel** — see the decision sheet's `D-S3O2-2` for why that mattered |
| `packages/core/src/utilities/warnConflictingProps.spec.ts` **(new)** | 6 tests: silence when one side is absent, the message's three facts, the once-gate, per-component counters, and a falsy-but-present value (a `!value` guard would drop the most ambiguous case) |
| `packages/core/src/components/layout/DzGrid.formLayout.spec.ts` | +15 tests in two new `describe` blocks: the document's vocabulary (`colSpan`, `rowSpan`, both axes at once, per-breakpoint, clamping, precedence + warning, consumer-class override, the literal table, and the schema's layout node rendered end to end) and the gap vocabulary (all five document gaps on both `DzStack` and `DzGrid`, plus `xl`). 20 → **35** tests |
| `packages/core/stories/layout/DzGrid.stories.ts` | New `FormLayoutNode` story: a six-node document array rendered with `:col-span="node.layout.colSpan"` / `:row-span="node.layout.rowSpan"`, with a `play()` measuring that the `rowSpan: 2` item is taller and the `'full'` item at least as wide as `colSpan: 6` |

**Why a `<script setup>` block could not hold the warning's flag.** The first
implementation used a module-scoped `let` inside `DzGridItem.vue`, and the gate did
not work — 20 mounts produced 20 warnings. `<script setup>` compiles its whole body
into `setup()`, so the flag was per instance. There is **no precedent for a second
`<script>` block** in this repository (`grep -rl '^<script lang="ts">' packages/core/src/components/`
→ **0** of 208 components), so introducing one for a warning was the wrong trade; a
private module was the `warnRemovedProp.ts` answer and is the one taken. Recorded
because the failure is silent and the next agent will otherwise repeat it.

### 2.2 `DzStack` gaps — nothing implemented, and that is the finding

No code change. §1.2 has the proof. One test block was added to
`DzGrid.formLayout.spec.ts` so the claim is measured rather than asserted in prose,
and so a future narrowing of `LayoutGap` fails loudly.

### 2.3 Async-options stories — one new page, six states

`packages/core/stories/forms/AsyncOptionsStates.stories.ts` **(new)**, titled
`Core/Forms/Async Options`, eight exports: `Loading`, `EmptyResult`,
`ErrorWithRetry`, `RealWorldDependentSelects`, `StaleResponseDiscard`,
`Accessibility`, `StatesMatrix`, `DarkMode`.

`DzSelect` is the subject, chosen per `<discovery>` step 3 as *the richest seam
host*: it is the only control of the nine that requests on `open`, on `search`
**and** on retry (`grep -rn "requestOptions('search'" packages/core/src/components/forms/*.vue`
→ `DzSelect.vue:260` and nothing else), so it is the only one that can put two
requests in flight without a test reaching inside it.

The page carries its own host, `createTrackingHost()`, rather than reusing
`../_shared/asyncOptionsHost.ts`. The shared host keeps a **single** `pending`
request, which is precisely the shape that cannot express two in flight — so the
discard state is unwritable against it. The eight per-control pages keep using the
shared host and its four-phase walk; nothing existing changed.

Each `play()` drives its host **programmatically** rather than by clicking the
on-page buttons. That is not a shortcut: the panel is a dismissable layer, a
pointer-down outside it closes the panel, and `handleOpenChange(false)` calls
`abortOptions()` — so a walk that clicked a canvas button would abort the very
request it was about to answer. The shared walk already does it this way; the reason
had not been written down.

### 2.4 The six states, and how each is genuinely exercised

| # | State | Exercised by | Why it is not a mocked instant resolve |
|---|---|---|---|
| 1 | **loading** | panel opened → `load-options` emitted with a live `AbortSignal` → `[data-part="options-state"][data-options-state="loading"]` renders **instead of** the list | The request is asserted to exist, to carry `reason: 'open'`, and to be **un-aborted**; the `[role="option"]` count is asserted **0**, so the row replaces the list rather than sitting above it |
| 2 | **empty result** | host answers with **zero rows** → empty row + `No options found`; then the **inference** path — `state: 'ready'` with an empty collection must give the same row | Two distinct host behaviours, not one. The inference is the composable's own documented rule and had never been asserted through a control. This is where finding `D-S3O2-5` surfaced |
| 3 | **error with retry** | host fails with its **own** message → the error row shows that message, not the catalog's; the retry control is clicked **inside the panel** → `retry-options` **and** a fresh `load-options`, then the list returns | Both emissions are asserted, so a host listening to only one of the two still reloads. `optionsRetryable: false` is asserted to remove the control |
| 4 | **dependency-change clearing** | a country `DzSelect` drives a city `DzSelect`; changing the country clears the city's **value**, empties its **collection**, and puts it back to `loading`; reopening shows the loading row and the new country's cities | All three effects asserted separately, and `Berlin` is asserted **absent from the DOM** — not merely unselected. A stale option a user can still click is the defect |
| 5 | **stale-response discard** | two searches one after the other put ≥ 3 requests in flight; the **invariant** `aborted === requests − 1` is asserted, each signal is distinct, a fencing host **refuses** the abandoned answer, and the refused rows never appear | The fence is the composable's stated reason to exist and **nothing in the repository had ever created two of a control's requests**. The count is deliberately *not* asserted — that would bind the evidence to how often `DzSelect` happens to ask |
| 6 | **accessible announcement of each** | the row is asserted `role="status"` + `aria-live="polite"`; the message is walked `loading → empty → error`, each time against the catalog string, and **the element identity is asserted unchanged** across all three | Identity is the load-bearing assertion: a region that unmounts and remounts per state passes every other check here and announces nothing reliably. The retry control is asserted by **accessible name** |

### 2.5 The story `play()` walks were NOT executed in a browser here — so the six states were also written as a spec that runs

This is the part worth reading carefully, because it is the difference between
evidence and a claim.

`apps/storybook`'s `test-storybook` is `vitest run --project=storybook`, a real
browser lane. It was attempted **twice**, foreground and background, and produced
**no test result in ~19 minutes of wall clock**: the first run spent 542 s
re-optimizing Vite dependencies and was killed at the 570 s ceiling; the second
printed only the `RUN` banner and in 25 minutes launched no browser process
(`Get-Process` showed none started after the run began). **The lane did not
execute.** Its `play()` walks are therefore **authored and unrun**, and this
handoff claims nothing else for them.

Because a story that "covers" a state it does not exercise is exactly the
fabricated evidence this task was told not to produce, the same six states were
**additionally written as a runnable spec**:

`packages/core/src/components/forms/DzSelect.asyncStates.spec.ts` **(new)** —
**21 tests, exit 0**, inside `yarn test`, in jsdom, against the real control. Every
row of §2.4's table has at least one measured assertion there, and the two files
cross-reference each other in their headers.

That spec is also what **found `D-S3O2-5`**: three of its assertions failed on first
run and the failures were real — `data-options-state` publishes the raw host state,
not the row being rendered. **The story had the same wrong assumption written into
it and would have shipped it.** A browser lane that never ran would not have caught
it either. This is the concrete argument for writing the measured half.

### 2.6 `DzMention` — nothing built, disposition confirmed already recorded

§1.4 has the measurement. `validate:form-readiness` exits **0** and
`form-controls-readiness-matrix.md:116` gives `DzMention` a verdict in all nine
clause cells with `C9 ✅ pass`. **No blank cell existed to remove.** The remaining
question is D71(b) — deprecate `DzMentionOptionResolver` or not — re-presented as
`D-S3O2-4` with a recommendation to **keep and revisit at the 1.0 freeze**, because
`VERSIONING.md` §4 makes a deprecation a full `0.x` minor series and that machinery
is itself unbuilt (TASK-S2-O2).

No mention control was built. There was nothing to build.

### 2.7 Changeset and generated artifacts

- `.changeset/a-grid-item-can-span-rows-and-answers-to-the-documents-own-names.md`
  — `@dzup-ui/core: patch`. Pending changesets **41 → 42**, measured as
  `find .changeset -name '*.md' -not -name 'README.md' | wc -l`.
  **Self-correction:** an earlier draft of this handoff wrote 42 → 43 from
  `ls .changeset/*.md | wc -l`, which counts changesets' own
  `.changeset/README.md` — the exact off-by-one the ledger's *Pending changesets*
  row was amended to forbid on 2026-09-24. Recorded rather than quietly fixed,
  because it is the **second** time that miscount has been made in this
  programme.
- **Regenerated, in the sanctioned order.** `validate:ownership` and
  `validate:capability-matrix` were already **fresh** (no new barrel export, no new
  component), so nothing upstream needed regenerating.
  `validate:component-meta` was **stale** by construction — two new props —
  so: `generate:component-meta` → `generate:llms` → `generate:docs-pages`.
  The component-meta diff was inspected symbol by symbol: the only semantic
  additions are `"name": "colSpan"`, `"name": "rowSpan"` and
  `"name": "Form Layout Node (colSpan + rowSpan)"`, plus the `sourceCommit` moving
  **`589be13` → `4e4e46f`** (it was stamped one commit behind HEAD before this
  task; that is an improvement and is reported here because another task's evidence
  may quote it). `props 1757/1757 described`, `unresolved types 0`.
- `README.md` — `yarn generate:readme-facts` rewrote the catalog region:
  **181 → 182 story files**, my one new file. Caught by
  `generate-readme-facts.spec.ts`, not by me.

---

## 3. Focused validation — exact commands and exit codes

All run from `ui/dzup-ui` at `4e4e46f`. **Every exit code read directly, never
through a pipe.** `npx` replaced with `node node_modules/<tool>/…` throughout
(register row 41 class (ii)); logs written to a repo-external scratchpad because
`/tmp` is not writable here (class (i)).

| Command | Exit | Result |
|---|---|---|
| `node node_modules/vitest/vitest.mjs run packages/core/src/components/layout/DzGrid.formLayout.spec.ts` | **0** | **35** tests (was 20) |
| `node node_modules/vitest/vitest.mjs run packages/core/src/utilities/warnConflictingProps.spec.ts` | **0** | 6 tests |
| `node node_modules/vitest/vitest.mjs run packages/core/src/components/forms/DzSelect.asyncStates.spec.ts` | **0** | **21** tests — the six states, measured |
| `node node_modules/vitest/vitest.mjs run packages/core/src/components/layout packages/core/src/utilities packages/core/src/composables/useAsyncOptions` | **0** | 41 files, 455 tests |
| `node node_modules/eslint/bin/eslint.js --max-warnings 0 <7 changed paths>` | **0** | see §3.1 |
| `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit -p packages/core/tsconfig.json` | **0** | — |
| `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/form-readiness.ts` | **0** | `44 controls, 280 pass, 0 gap, 0 future, 20 unrun, 96 n-a` — **identical before and after** |
| `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/anatomy-parts.ts` | **0** | unchanged — `DzGridItem` emits no `data-part` |
| `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/ownership-manifest.ts` | **0** | `unclassified` **29**, unmoved |
| `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/capability-matrix.ts` | **0** | fresh; no Tier D cell unexplained |
| `yarn validate:story-dod` | **0** | all 3 enforced checks 100 % over **170** in-scope files |
| `yarn validate:story-status` · `validate:quality-tiers` · `validate:playground-parity` · `validate:registry` · `validate:docs-size` | **0** each | quality 144/144 (A 55 · B 67 · C 21 · D 1) |
| `yarn storybook:build` | **0** | 25.12 MB / 26 MB budget, 903.4 kB spare; 1658 ThemeRecipeV1 entries; **the new story compiles and is indexed** |
| `yarn test` | **0** | **572 files · 11,126 passed · 3 skipped · 1 todo · 0 failed** |
| `yarn validate:all` | **1** | 59 links; fails at **link 51**, pre-existing — see §4 |

### 3.1 Two lint warnings that would have failed `yarn lint`

`yarn lint` is `eslint … --max-warnings 0`, so a warning is a failure. Two
`jsdoc/no-multi-asterisks` warnings appeared in the new spec, from a JSDoc line
*beginning* with `*emphasis*` — the rule reads the leading `*` plus the emphasis
marker as a double asterisk. Reflowed so no line starts with the marker. Recorded
because it is invisible in a narrow `eslint <file>` run (which exits 0 on warnings)
and only bites in the aggregate.

`eslint --fix` was **not** run on any file, per the standing warning that it has
corrupted a string literal in this repository.

### 3.2 The three lanes that did NOT run, each with a named reason

Per `<evidence_rules>` these are stated, not glossed. **None is claimed as
evidence.**

| Lane the prompt's `<validation>` names | State | Reason |
|---|---|---|
| `yarn storybook:test` (the story `play()` walks) | **did not execute** | `vitest run --project=storybook`, attempted **three times** (once foreground, twice background). Attempt 1: 542 s re-optimizing Vite dependencies, killed at the 570 s ceiling. Attempts 2 and 3: the `RUN` banner and nothing else in 25 min and 7 min respectively, with **no browser process started** (`Get-Process` checked). This is a harness limit on this machine, not a story defect — but the walks are **unrun**, which is exactly why §2.5's runnable spec exists |
| `yarn test:e2e:visual` ("must not move") | **refused, by design** | `yarn visual:platform gallery theme-recipe` exits **1**: `authoritative platform linux`, `this run chromium/win32-x64`. Both gate lanes are linux-locked; the harness refuses an in-place capture on a non-designated host. Pre-existing and already ratcheted by **TASK-S1-O3 / `D-S1O3-2`** |
| `yarn test:e2e` / `test:e2e:matrix` | not attempted | not in this task's `<validation>`, and the same platform authority applies |

**What *is* measurable about "the visual lane must not move", and it is not
nothing:** `yarn validate:visual-baselines` exits **0** ("every baseline is
accounted for, with a cause and an author"), **no baseline image was added, removed
or rewritten**, and the addition is default-identical by construction — both new
props default to `undefined`, `spanClassesFor(undefined)` returns `''`, and
`DzGrid.formLayout.spec.ts` asserts that an item with no span emits **no `class`
attribute at all**. The `FormLayoutNode` story is new, so no committed baseline
references it. That is "structurally cannot have moved", which is a weaker and
honest claim than "measured green on the authoritative platform".

---

## 4. Aggregate qualification

```
node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"
→ 59
yarn validate:all > <scratchpad>/s3o2-validate-all.log 2>&1; echo "exit $?"
→ exit 1
```

**59 links. Fails at link 51, `yarn validate:peers`.** That link is itself a
two-command chain — `tsx packages/tooling/scripts/validate-peers.ts && yarn validate:icon-duplicates`
— and it is the **second** half that fails:

```
Peer dependency validation passed.          ← first half, 7 compatible, 0 incompatible
…
✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared by @dzup-ui/landing, @dzup-ui/sandbox
      lucide-vue-next@0.477.0  declared by @dzup-ui/core
```

**Pre-existing and unrelated to this task** — register **#3** (`D174`/`D175`,
consolidating `N5-04 D2`, `D-S0O1-3`, `D-S1O3-5`), the icon-library swap contract.
Nothing in this task touches a dependency, a lockfile or an icon.

**Links 52–59 are unreached in the aggregate**, so they were each run
individually to prove the unreached set is not newly red:

| Link | Command | Exit |
|---|---|---|
| 52 | `yarn validate:licenses` | **0** |
| 53 | `yarn validate:tree-shake` | **0** |
| 54 | `yarn validate:evidence-binding` | **0** |
| 55 | `yarn validate:deprecations` | **0** |
| 56 | `yarn validate:adr-status` | **0** |
| 57 | `yarn validate:at-runs` | **0** |
| 58 | `yarn validate:docs-freshness` | **0** |
| 59 | `yarn validate:runtime-floor` | **0** |

**So: links 1–50 green, 51 red (pre-existing, one open owner decision), 52–59
green when run directly.** The link count is **59**, and this programme's
`EXECUTION-STATUS.md` records it **three different ways at once**: its header says
**55**, one ratchet row says **58**, and a later row says **59**. Only the last
agrees with `package.json`. It is measured above, never quoted — see
`D-S3O2-6`.

### 4.1 Two `yarn test` runs, both quoted

The first full run **exited 1 with 3 failures**, and both failures were **real
consequences of this task**, not load flakiness:

1. `packages/tooling/scripts/generate-readme-facts.spec.ts` (2 tests) — the
   committed `README.md` claims a story-file count, and the count moved
   **181 → 182**. Fixed by `yarn generate:readme-facts`, which rewrote one region
   of `README.md`. `apps/landing/src/generated/counts.ts` moved the same way.
2. `packages/tooling/src/quality/generate-matrix-targets.spec.ts` — the derived
   story id `core-forms-async-options--loading` was not in the **built** Storybook
   index, because `apps/storybook/storybook-static/index.json` predated the new
   story. Fixed by `yarn storybook:build` (exit 0).

Second run, after both: **exit 0 · 572 files · 11,126 passed · 3 skipped · 1 todo
· 0 failed.** Baseline was 570 files / 11,084 passed, so **+2 files / +42 tests** —
exactly 15 (grid) + 6 (warn utility) + 21 (async states). Neither run showed the
"exit 1 with zero failing tests" load artefact; both failures had named causes.

### 4.2 Regeneration, and a provenance side effect worth reporting

`validate:ownership`, `validate:capability-matrix` and `validate:llms` were
**already fresh** — no new barrel export and no new component, so nothing upstream
of `component-meta` was stale. `validate:component-meta` was stale by construction
(two new props), which blocks `validate:docs-pages` by design, so the sanctioned
tail ran: **component-meta → llms → docs-pages**.

Semantic footprint, verified rather than assumed:

- `component-meta.json` — the only added symbols are `"name": "colSpan"`,
  `"name": "rowSpan"` and `"name": "Form Layout Node (colSpan + rowSpan)"`.
  `props 1757/1757 described`, `events 366/366`, `slots 328/328`,
  `unresolved types 0`.
- **`sourceCommit` moved `589be13` → `4e4e46f`.** It was stamped one commit behind
  HEAD before this task. That is an improvement, and it is called out because
  another task's evidence may quote that field.
- `apps/docs/components/*.md` — **`DzGrid.md` is the only page whose content
  changed**: `grep -rl "rowSpan" apps/docs/components/` returns exactly one file.
  The other 143 dirty pages were already dirty from TASK-S0-O1 and were rewritten
  byte-identically. `nav.json` moved 10 hash lines; `seeds.json` and
  `playgroundSnippets.generated.ts` one hash line each.
- `llms.txt` (763 lines) and `llms-full.txt` (8971 lines) regenerated;
  `validate:llms` green with all four ratchets at **0**.

### 4.3 Worktree

`git status --porcelain | wc -l` → **274 at start, 289 at end.** Of the 168 files
this session rewrote, 153 are generated docs pages that were **already dirty**;
the new *paths* created are the 5 source/changeset files and, inside the
already-untracked `reports/` directory, two report documents. **Nothing was
reverted, stashed, checked out or cleaned; no commit, push, CI dispatch,
publication or baseline replacement was made.** Another session writes to this
repository concurrently, so the +15 delta is not claimed as wholly this task's.

---

## 5. Ratchet movements (old → new), measured at `4e4e46f`

| Ratchet | Before | After | How it was measured |
|---|---|---|---|
| **`unclassified`** (down-only, ceiling 29) | **29** | **29 — unmoved** | `node -e "…manifest…filter(kind==='unclassified').length"` → 29; `validate:ownership` exit 0. The new utility module is exported from **no barrel**, which is exactly why (see `D-S3O2-2`) |
| **`maxWithoutAnatomy`** (down-only, 41) | **41** | **41 — unmoved** | `validate:anatomy-parts` exit 0. `DzGridItem` emits no `data-part` and declares no anatomy; it follows its Tier A parent, as D67 established |
| `maxProposedCitedFromCode` | **3** | **3** | `validate:adr-references` green inside the aggregate; no new ADR cited |
| capability: fail / stale / unrun / excepted | 0 / 22 / 400 / 47 | **0 / 22 / 400 / 47 — unmoved** | `generate:docs-pages` reported `1662 capability cells over 144 components — 400 unrun, 22 stale, 47 excepted`; `validate:capability-matrix` exit 0 |
| AT cells executed | **0 of 534** | **0 of 534 — untouched** | `generate:docs-pages`: `AT cells executed: 0/534`. **No manual AT cell was filled by this agent** |
| story-DoD enforced violations | **0** | **0** | 3 enforced checks at 100 % over 170 files. Report-level stragglers **312**, and the new page adds to **none** of the seven report checks — it carries a gallery (`StatesMatrix`), an `Accessibility` export, a `RealWorld*` export and a `play()` |
| quality tiers | 144/144 | **144/144** | A 55 · B 67 · C 21 · D 1 |
| visual baselines | — | **unchanged** | none added, removed or rewritten; `validate:visual-baselines` exit 0 |
| `validate:all` links | **59** (the ledger says 55 / 58 / 59 in three places) | **59** | counted from `package.json`, never quoted; the ledger's header and one of its rows are stale |
| test files / tests | 570 / 11,084 | **572 / 11,126** | +2 files, +42 tests |
| story files | 181 | **182** | `generate:readme-facts`; `counts.ts` agrees |
| pending changesets | 41 | **42** | `find .changeset -name '*.md' -not -name 'README.md' \| wc -l` — **not** `ls .changeset/*.md`, which counts `.changeset/README.md` (see §2.7) |
| public props on `DzGridItem` | 2 (`span`, `as`) | **4** (`span`, `colSpan`, `rowSpan`, `as`) | additive; no prop removed or narrowed |

**No ratchet was raised. No allowlist, exception file or ceiling was widened.**

---

## 6. Owner decisions raised

Full sheets with costed options in
[`./TASK-S3-O2-decisions.md`](./TASK-S3-O2-decisions.md); `§8.4` appended to
[`./owner-decision-register-2026-09-22.md`](./owner-decision-register-2026-09-22.md)
so the entry point carries them.

| id | Question | Recommendation |
|---|---|---|
| **`D-S3O2-1`** 🟢 (was D67) | the `DzGrid` span API — the row axis, and `colSpan`/`rowSpan` as the document's names | **Ratify.** Implemented under standing delegation; six alternatives costed and rejected; fully reversible while unpublished |
| **`D-S3O2-2`** 🟠 (was D68) | the `utility` + `injection-key` ownership kinds, schema 1.2.0 | **(a), as its own tooling packet.** 29 of 29 unclassified fall into the two named kinds, so it goes to 0 with no residue. **Second observed instance of the ceiling steering an engineering choice** — §2.1 |
| **`D-S3O2-3`** 🟢 (was D69) | the `time` format profile | **Ratify (a).** Re-verified: `DzTimePicker` is `partial-time`, not `full-time`. The codec owns the zone. **No Core change owed** |
| **`D-S3O2-4`** 🟢 (was D71(b)) | `@deprecate` `DzMentionOptionResolver`? | **Keep, un-deprecated; revisit at the 1.0 freeze**, when the deprecation machinery (TASK-S2-O2) exists |
| **`D-S3O2-5`** 🟠 **NEW — found by this task** | `data-options-state` publishes the **raw** host state, not the row being rendered: `ready` on an empty row, `idle` on a loading row, across **nine** controls | **(a) publish the row.** Recorded, **not fixed** — it is not an additive change, and `<stories_not_behaviour>` says file it. Three tests pin the current behaviour so either decision shows in a diff |
| **`D-S3O2-6`** 🟢 **NEW — process** | This programme's `EXECUTION-STATUS.md` states the `validate:all` link count **three different ways in one file**: the header says **55**, the row *"`validate:all` links"* says **58**, and the row *"`validate:all` chain links"* says **59**. The measured value is **59**. The same file's *"links that have EVER executed"* row therefore reads **58 of 58** against a 59-link chain. The register's §1.1 already corrects this field once, and it has drifted again | Stop carrying the number in prose anywhere: delete all three statements and leave only the one-line `node -e` probe plus the **named** first-failing gate (`validate:peers` → `validate:icon-duplicates`). A number that has never been right for a whole day should not be written down |

---

## 7. `<done_check>` outcome and prompt defects

**`1 of 4 at 4e4e46f`** — clause 4 only. **Three of the four clauses are
defective or misleading**, which makes this the **sixth-plus** recurrence of
register row **41** (`D-S3O2-6` above is a seventh instance of the same family, one
level up):

| # | Defect | Class (register #41) |
|---|---|---|
| 1 | Greps for `colSpan\|rowSpan` and so reports "no span API" when a span API exists under another name. Fails honestly but **mis-describes the gap**, and an agent that trusted its wording would have rebuilt `DzGridItem` | new — *a clause that fails for the wrong reason* |
| 2 | **DEFECTIVE, two ways.** Greps `DzStack.types.ts` for a union declared in `DzGrid.types.ts`, and greps a literal spelling (`… \| 'lg'`) that excludes the real type's `\| 'xl'`. The vocabulary **exists and is complete** | new — *wrong file* + (iii)-adjacent *formatting-sensitive literal* |
| 3 | A **pipeline** (`ls \| grep \| wc -l`) — `wc -l` always exits 0, so `grep`'s "no match" is invisible. Also counts **file names** when the thing it wants is **story coverage**; D72(2) predicted this exact failure in 2026-09-17 and its remedy is still `open` | **(iii)** pipe masking an exit code |
| 4 | `npx tsx …` — `npx` fetches dependency-confusion placeholders that exit 0 **without running**, a silent false green. Run as `node node_modules/tsx/dist/cli.mjs …`. Its substantive sub-claim (`DzMention` not blank) was **already true** | **(ii)** `npx` |

The `<validation>` block adds **class (i)**: six `/tmp` paths, on a machine where
`/tmp` is not writable.

**Corrected clauses, for whoever amends the task file:**

```bash
# 1 — the span API, by what it must express rather than by one spelling
grep -nE '\b(colSpan|rowSpan|span)\?:' packages/core/src/components/layout/DzGrid.types.ts; echo "exit $?"

# 2 — the gap vocabulary, at its declaration, without depending on formatting
node node_modules/tsx/dist/cli.mjs -e "
  const s=require('node:fs').readFileSync('packages/core/src/components/layout/DzGrid.types.ts','utf8');
  const m=/export type LayoutGap = ([^\n]+)/.exec(s);
  const have=new Set([...m[1].matchAll(/'([a-z]+)'/g)].map(x=>x[1]));
  const need=['none','xs','sm','md','lg'];
  const missing=need.filter(n=>!have.has(n));
  if(missing.length){console.error('missing',missing);process.exit(1)}
  console.log('LayoutGap covers the document vocabulary:',[...have].join(' '));
"; echo "exit $?"

# 3 — story coverage, per file, no pipeline
for f in packages/core/stories/forms/*Async*.stories.ts; do
  test -f "$f" || { echo "no async-options story file"; exit 1; }
  echo "$f"; grep -c 'export const' "$f"
done; echo "exit $?"

# 4 — no npx
node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/form-readiness.ts; echo "exit $?"
grep -c '| |' docs/program-2026-08/form-controls-readiness-matrix.md   # 0 = no blank cell anywhere
```

---

## 8. Ranked next packet

1. **`D-S3O2-2` — execute the `utility`/`injection-key` schema 1.2.0 migration.**
   The single cheapest `unclassified` movement left in the programme: **29 → 0**
   with no residue and no standing exception, fully specified in D68 and re-costed
   here. It is a self-contained tooling packet (schema + classifier + 3 consumers +
   the sanctioned regeneration chain), and the ceiling is now demonstrably steering
   engineering choices rather than merely recording them.
2. **`D-S3O2-5` — align `data-options-state` with the row.** One line ×
   nine controls, with the three pinning tests already written. It is the only
   **published styling surface** in this task's findings that currently describes
   something other than what is on screen.
3. **Register row #3 (`D174`/`D175`) — the icon-library swap.** It is the *only*
   thing between this repository and `validate:all` exit 0, it has been the first
   failing link for four programmes, and it hides links 52–59 from every aggregate
   run (all eight of which are green when run directly).
4. **The harness-facts block** (register row #41 option (a)). Every prompt audited
   in this programme has carried a defective clause and this task found three more.
   One block of text in three files.

### What blocks TASK-S5-O2

**Nothing in this task blocks it, and one thing in it helps.**

`TASK-S5-O2` is the toolchain-execution packet — Vue 3.6, Nuxt 4, **Vitest 4
browser mode**, tsdown/Vite 8. Two findings are directly relevant:

1. **The Vitest browser lane does not complete on this machine.** Three attempts,
   no test result, no browser process (§3.2). S5-O2's Vitest 4 browser-mode
   evaluation should treat "does the browser lane run at all here" as its **first**
   measurement rather than an assumption — and it now has a concrete, reproducible
   prior. If S5-O2 fixes the lane, this task's story `play()` walks become runnable
   evidence for free, so **re-running `AsyncOptionsStates` is a cheap first
   check** that the migration actually improved something.
2. **The emits surface was not touched.** TASK-S2-O4 proved the published
   `vue: ^3.5.0` admits 13 releases that never worked because every `Dz*Emits` is
   an `interface`. This task added **two props and no emits interface**
   (`DzGridItemProps` has no emits at all), so `D-S2O4-5` is untouched and the
   peer-range question is exactly where S2-O4 left it.

The only cross-task hazard is mechanical: this task rewrote `component-meta.json`,
`llms{,-full}.txt`, 144 docs pages, `nav.json`, `seeds.json`,
`playgroundSnippets.generated.ts`, `README.md` and `counts.ts`. A concurrent task
regenerating the same artifacts will collide. **Re-run the sanctioned chain rather
than merging generated output by hand**, and note that `component-meta.json`'s
`sourceCommit` is now `4e4e46f` where other reports may still quote `589be13`.

---

## 9. Final aggregate run (the only one quoted as the end state)

Artifacts were regenerated and documents edited after §4's run, so the aggregate
was re-run **end to end** afterwards. Nothing was edited under `docs/` while it
was in flight.

```
node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"
→ 59
yarn validate:all > <scratchpad>/s3o2-validate-all-final.log 2>&1; echo "exit $?"
→ exit 1
grep -c '^✓' <log>  → 33          grep -n '^✗' <log>  → 466: [single-version] …
```

**59 links · exit 1 · 33 gates printed a green line · one `✗`, at link 51, and it
is the pre-existing `lucide-vue-next` 0.475.0 / 0.477.0 duplication** (register
**#3**, `D174`/`D175`). Byte-for-byte the same failure as before this task. Links
52–59 remain unreached in the aggregate and exit **0** each individually (§4).

`packages/tooling` was re-run after the documentation edits, since several of its
specs read files under `docs/`: **92 files · 1,890 passed · 1 todo · exit 0.**

### 9.1 What this task is and is not qualified as

Per `<evidence_rules>`'s maturity ladder, stated at exactly one level and no
higher:

| Deliverable | Level reached | Not claimed |
|---|---|---|
| `DzGridItem.colSpan` / `.rowSpan` | **aggregate-qualified** minus link 51 — implemented, focused-validated (35 tests), in a green `yarn test`, in `validate:all`'s first 50 links, and the built Storybook compiles it | not browser-qualified (no `test:e2e` for it), not packaged, not released |
| The six async-options states | **aggregate-qualified** as a **spec** (21 tests, in `yarn test`) | the **story `play()` walks are `implemented`, not `focused-validated`** — the browser lane did not execute (§3.2). The page is authored, compiles, and is indexed in a successful `storybook:build`; its interactions are unrun |
| "the visual lane must not move" | **argued structurally**, and `validate:visual-baselines` is green | **not measured** — the gate lanes are `linux`-authoritative and this host is `win32`, refused by design |
| `DzStack` gaps | **found already done**, and now measured by a test | nothing was built |
| `DzMention` | **found already dispositioned** | nothing was built; D71(b) remains an owner call |
