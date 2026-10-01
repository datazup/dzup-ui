# RESIDUAL-02 — the two filed-but-unfixed defects (`TASK-S1-O2-F1`, `TASK-S5-O1-F1`)

**Tree:** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` + uncommitted worktree (the
16-task programme + RESIDUAL-01, uncommitted **by design** — the owner commits).
**Run:** 2026-09-25. **Repository:** `ui/dzup-ui` (OSS, `@dzup-ui/*`) only.

> **Status: COMPLETE.** Written incrementally — every section appended as soon
> as its evidence existed, because three agents in this programme stalled mid-task
> and lost everything they had not yet written.

## 0. The batch

| # | filed as | title | section |
|---|---|---|---|
| 1 | **`TASK-S1-O2-F1`** | `ssr-smoke.spec.ts` renders four components with invalid props and still asserts `toBeTruthy()` | §1 |
| 2 | **`TASK-S5-O1-F1`** (decision 3) | `validate:i18n-packs` rule 9 counts one value as "has translations" | §2 |

**Measured entry state** (never quoted from a doc):

```
git rev-parse HEAD                                            →  4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a
git status --porcelain | wc -l                                 →  295   (RESIDUAL-01's exit number; unchanged by this batch's start)
node -e "…scripts['validate:all'].split('&&').length"          →  60
node …/tsx …/validators/i18n-packs.ts                          →  exit 0   de scaffold 0/116 · en complete 116/116
node …/tsx …/validators/i18n-completeness.ts                   →  exit 0   de 0 % (scaffold) · en source (100 %) · locales ≥95 % = 1, floor 1
node …/vitest run packages/core/tests/ssr/ssr-smoke.spec.ts     →  exit 0   62 passed | 1 skipped, and 4 × [Vue warn] Missing required prop
```

No `yarn install` was run and `yarn.lock` was not touched at any point; the
`validate:all` red at link 51 that RESIDUAL-01 documents is therefore still the
delivered state, unchanged by this batch (§4).

---

## 1. Defect 1 — `ssr-smoke.spec.ts` asserted almost nothing (`TASK-S1-O2-F1`)

### 1.1 What the four calls actually produced — measured, not inferred

The filer recorded the four `[Vue warn] Missing required prop` lines. What it did
not record is *what SSR emitted instead*, which is the part that makes the
assertion worthless. Each was rendered in isolation and the string printed:

| call at `4e4e46f` + worktree | SSR output | old assertion |
|---|---|---|
| `ssrRender(DzIconButton, { ariaLabel: 'Close' })` | 733 B `<button>` … `<!-- Icon (hidden when loading) --><!----></button>` — **no `<svg>` at all**: a blank icon-only control | `toBeTruthy()` passes |
| `ssrRender(DzIcon, { name: 'check' })` | **`'<!---->'` — 7 bytes. The component rendered NOTHING.** `name` is not even a declared prop | `toBeTruthy()` passes |
| `ssrRender(DzPagination, { totalItems: 100, pageSize: 10 })` | 2,400 B, **1** `data-type="page"` button for a hundred items (`totalItems` is not a declared prop; `total` is) | `toBeTruthy()` passes |
| `ssrRender(DzSegmented)` | 261 B, **0** `data-part="item"` — an empty track | `toBeTruthy()` passes |

`DzIcon` is the headline: its entire template is `<component :is="icon">`, so with
no `icon` the whole output is an HTML comment — and a non-empty string is truthy.
**The gate was not green by luck; it was green by construction.**

### 1.2 The fix — option (a) for all four, and why not (b)

Every one of the four has an obvious valid input its own `*.types.ts` declares
(`icon: Component`, `total: number`, `items: SegmentedItem[]`), so keeping the
invalid input and asserting a *defined* behaviour for it would mean inventing that
behaviour: none of the four documents a contract for a missing required prop, and
Vue's `Missing required prop` warning is a dev-mode-only framework side effect,
not a component contract. Asserting it would pin Vue's behaviour, not ours.
**So: valid props and real rendered output, for all four.** Nothing was skipped
and no component was declared unassertable.

| file | change | API effect |
|---|---|---|
| `packages/core/tests/ssr/ssr-smoke.spec.ts` | header rewritten (the old one claimed *"they only assert renders without crash"* and carried no warning about `'<!---->'`); `import { X } from 'lucide-vue-next'` added; four tests rewritten, one of them split in two | **none.** Test-only file, not published, in no `files` array. No changeset is owed |

Per component, what now has to hold — each line chosen so that an empty or error
render cannot satisfy it:

- **`DzIconButton`** (`{ icon: X, ariaLabel: 'Close' }`) — `type="button"`,
  `aria-label="Close"`, **exactly one** `<svg` (the icon, and *not* the loading
  spinner, which must stay unrendered when idle), a `<path` inside it (so the icon
  component really rendered through `<component :is>`), `aria-hidden="true"` on
  the glyph (the label is on the button, so announcing the glyph too would double
  it), `data-state="idle"`.
- **`DzIcon`** — **two** renders, because the aria contract has two halves and one
  call can only exercise one. Meaningful (`{ icon: X, ariaLabel, size: 'lg' }`):
  the output *starts with* `<svg`, has `<path`, `role="img"`, the label, **no**
  `aria-hidden`, and `stroke-width="1.75"` — the `lg` entry of
  `defaultStrokeWidth`, computed in `setup`, so the server pass is where a wrong
  size-to-stroke mapping first shows. Decorative (`{ icon: X }`):
  `aria-hidden="true"`, **no** `role="img"`, `stroke-width="2"`, `h-5 w-5`.
- **`DzPagination`** (`{ total: 100, pageSize: 10 }`) — `<nav`,
  `aria-label="Pagination"` plus `"Go to previous page"` and `"Go to next page"`
  (all three resolved through `useComponentMessages` with **no `DzProvider`
  mounted**, which is exactly ADR-20's server case), the page window asserted as
  an **ordered list** `['1','2','3']` extracted from the HTML,
  `aria-current="page"` present, the prev control already carrying `disabled` in
  the server HTML (the first paint must not offer a route to page 0), and
  **neither** edge control, because `showEdges` defaults to `false`.
- **`DzSegmented`** (`{ items: [list, grid], modelValue: 'list', ariaLabel }`) —
  `role="group"`, the label, **exactly 2** `data-part="item"`, both labels,
  `aria-pressed="true"` *and* `"false"` (so the selection is in the server HTML
  and the control does not paint unselected and jump on hydration),
  `data-state="on"`, and `dir="ltr"` — `useDzDirection` resolving to a concrete
  direction with no provider (ADR-20 §4), not an unresolved `'auto'`.

Why the pagination window is `1, 2, 3` and not `1, 2, … 10`: `showEdges` is what
adds the first/last page numbers and the ellipsis to Reka's `PaginationList`, and
this call leaves it at the component's default of `false`. The number is
**measured from the render**, not assumed, and the component's own unit spec never
pinned it — `DzPagination.spec.ts:48` says only *"we should see some page
buttons"*.

### 1.3 Focused validation

```
node node_modules/vitest/vitest.mjs run packages/core/tests/ssr/ssr-smoke.spec.ts
  before  ->  exit 0   62 passed | 1 skipped   + 4 x [Vue warn] Missing required prop
  after   ->  exit 0   63 passed | 1 skipped   + 0 x [Vue warn]      <- gone, not silenced
node node_modules/eslint/bin/eslint.js packages/core/tests/ssr/ssr-smoke.spec.ts   ->  exit 0   (no --fix used)
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit -p packages/core/tsconfig.json   ->  exit 0
```

62 to 63 is the `DzIcon` split. The four warnings disappearing is itself the proof
that no invalid-prop call is left: they were the only four in the file.

### 1.4 The seeded break — the new test is proved to fail, the old one proved unable to

Two components were broken deliberately, not one, and the **old** assertion was
re-run against the same broken tree, so the discrimination is measured on both
sides rather than argued.

```
sha256  before seeding
  8c67d4f127eb8ebb79b7c8801c0c1c31e344df111d9a160a6c773a1c29f0f566 *packages/core/src/components/media/DzIcon.vue
  f3885344387bf3f0303355de2ffd451c779fb43a0d028bf36c1806c3ec373f3e *packages/core/src/components/navigation/DzSegmented.vue

seed 1  DzIcon.vue:47       `v-if="false"` added to <component :is="icon">   -> renders nothing
seed 2  DzSegmented.vue:87  `v-for="item in items"` -> `v-for="item in []"`  -> zero segments
```

**New assertions, seeded tree:**

```
node node_modules/vitest/vitest.mjs run packages/core/tests/ssr/ssr-smoke.spec.ts   ->  exit 1
  Tests  3 failed | 60 passed | 1 skipped (64)
  x sSR: media > dzIcon renders a meaningful icon in SSR        -> expected false to be true
  x sSR: media > dzIcon renders decorative by default in SSR    -> expected false to be true
  x sSR: navigation > dzSegmented renders every segment in SSR  -> expected +0 to be 2
```

**Old assertions, the same seeded tree** — the four original calls with
`expect(html).toBeTruthy()`, run as a throwaway spec that was then deleted:

```
->  exit 0   2 passed
  DzIcon       SSR output = "<!--v-if-->"    toBeTruthy passes = true
  DzSegmented  261 B, 0 segments             toBeTruthy passes = true
```

So with both components rendering **nothing of what they exist to render**, the old
lane is green and the new lane is red. That is the whole finding, measured.

**Restore, proved byte-identical.** `git checkout` was *not* used (295 paths are
uncommitted by design); the files were copied back from byte-exact backups:

```
sha256sum -c <before>.sha256
  packages/core/src/components/media/DzIcon.vue: OK
  packages/core/src/components/navigation/DzSegmented.vue: OK          exit 0
git status --porcelain <both files>   ->  no output (clean, as before the seed)
node node_modules/vitest/vitest.mjs run .../ssr-smoke.spec.ts   ->  exit 0   63 passed | 1 skipped
```

### 1.5 What the filer did not find

1. **The output, not just the warning.** F1 recorded four warnings; the four
   renders were *blank control / nothing / one page of ten / zero segments*. One
   of them produced a 7-byte HTML comment as its entire output.
2. **`toBeTruthy()` was not merely weak on `DzIcon` — it was unfalsifiable.**
   `'<!---->'` is truthy, so no SSR failure short of a thrown exception could ever
   have reddened that row. §1.4 measures exactly that.
3. **Two of the four calls passed props that do not exist on the component**
   (`DzIcon.name`, `DzPagination.totalItems`) rather than merely omitting one, so
   the call sites also documented an API that was never there.
4. **`DzIcon` needed two tests, not one.** Its `isDecorative` branch means one
   render can only ever assert half the aria contract. The file had one.
5. **The capability matrix is unaffected** — verified, not assumed:
   `generate-capability-matrix.ts:440` derives `ssr-sample` (and
   `portal-hydration`) with `filesMentioning(sources.ssrSpecs, row.component)`, a
   *name mention*, not a test title. Every renamed test still names its component,
   so no cell moves and no regeneration is owed.

### 1.6 A real component defect the new assertions surfaced

**`DzPagination` emits a `<nav>` inside a `<nav>` — two nested navigation
landmarks, only the outer one labelled.** Reading the full SSR string (§1.1) shows
`<nav data-part="root" aria-label="Pagination">…<nav>…</nav></nav>`: Reka's
`PaginationRoot` renders as `nav` by default and `DzPagination.vue` wraps it in its
own. A screen-reader user gets a nameless nested landmark inside the named one.
**Not fixed here, deliberately** — the fix is a DOM change on a published
component (`:as="'div'"` on `PaginationRoot`, or dropping the outer `<nav>` and
moving the label onto it), which needs a changeset, a visual re-baseline and an AT
re-baseline. It is raised as an owner decision in §5, and the assertions
deliberately do **not** pin the nav count, so fixing it will not break this test.

---

## 2. Defect 2 — `validate:i18n-packs` rule 9 counted a raw value as a translation (`TASK-S5-O1-F1`)

### 2.1 Implemented files, and the API effect

Option **B** from TASK-S5-O1 decision 3, implemented as recommended. The
predicate was not duplicated: `isUntranslated` **moved** to `i18n-packs.ts` —
the lower of the two gates, the one `i18n-completeness.ts` already imports
`checkPack`, `flattenCatalog` and `catalogKeys` from — and both gates now read the
same number. Putting it the other way round would have made the dependency
circular, which is why the move went down the stack rather than up.

| file | change | API effect |
|---|---|---|
| `packages/tooling/src/validators/i18n-packs.ts` | `SOURCE_LOCALE` **new export**; `isUntranslated` **new export** (moved here); `PackCoverage.effective` **new required field**; `checkPack`'s counting loop counts `effective`; `status`'s `scaffold` test reads `effective`; rule 9's message reports the effective count; the console report prints `N effective` and, when they differ, `(K copied from en)`; rule 9 and the file header document all of it | internal tooling, **not a published package**. No changeset is owed. `PackCoverage` gained a **required** field, so every constructor of one is a compile error until updated — there is exactly one (`checkPack`) plus the spec fixtures, both updated |
| `packages/tooling/src/validators/i18n-completeness.ts` | `isUntranslated` is now `export { isUntranslated } from './i18n-packs.ts'` (the name still resolves, so its own spec is untouched); `measurePack` derives `identical = coverage.translated − coverage.effective` instead of recounting; `effective = coverage.effective`, which also removes the `isSource` branch from the arithmetic; `SOURCE_LOCALE` replaces the hard-coded `'en'`; header updated | same — internal tooling. **No output change**, proved in §2.3 |
| `packages/tooling/src/validators/i18n-packs.spec.ts` | three rule-9 fixtures gain `effective`; **8 new cases** (3 in `rule 9`, 5 in a new `effective translations` block) | — |

**Why the `scaffold` test moved to `effective` but the `complete` test did not.**
`status: effectiveCount === 0 ? 'scaffold' : translatedCount === total ? 'complete'
: 'partial'`. A pack where every key carries a translation **is** complete, even
though a handful of values legitimately coincide with English (`OK`, `Email`,
`PDF` — the completeness gate's own examples). Deriving `complete` from
`effective` too would have re-labelled a finished translation as `partial`, which
is a different wrong answer. The ordering makes the all-copied case a `scaffold`
before the `complete` test is ever reached.

**The gate still fails closed**, and §2.4 measures it: a copy-only pack is still
rejected — by `validate:i18n-completeness` with `[undeclared-scaffold]`, the gate
that owns the question — and it is now *also* rejected by rule 9 if someone
exports it, which the old predicate could not see.

### 2.2 Focused validation — exact commands, file-captured exit codes

```
node …/tsx packages/tooling/src/validators/i18n-packs.ts          ->  exit 0
node …/tsx packages/tooling/src/validators/i18n-completeness.ts   ->  exit 0
yarn typecheck:tooling                                            ->  exit 0
node …/eslint --max-warnings 0 <the 3 changed tooling files + both i18n specs + ssr-smoke.spec.ts>   ->  exit 0
node …/vitest run …/i18n-packs.spec.ts …/i18n-completeness.spec.ts ->  exit 0   74 passed (66 before, +8)
```

`eslint --fix` was **not** used. It reported three real problems on the first
pass and all three were fixed by hand: `test/prefer-lowercase-title` on a new
`it` title, `jsdoc/no-multi-asterisks` on a rule-9 doc line that began with
`*genuine*`, and `prefer-template` on the report line's concatenated suffix
(hoisted into a `const` and interpolated).

### 2.3 Current facts preserved — byte-for-byte, not approximately

`validate:i18n-completeness`' entire output is **identical** before and after,
table row for table row:

```
| de | ltr | 116 | 0 | 0 | 0 | 0 | 0 | 0 % (scaffold — owner: name a translator …, decision D59) |
| en | ltr | 116 | — | — | 0 | 0 | 0 | source (100 %) |

locales at >= 95 % completeness: 1 (en) — floor 1
i18n completeness: 2 pack(s) measured, 0 violation(s)
```

`validate:i18n-packs` changes only by gaining the number it now judges on:

```
before   de  scaffold  0/116 translated, 116 explicit fallback
after    de  scaffold  0/116 translated, 0 effective, 116 explicit fallback
before   en  complete  116/116 translated, 0 explicit fallback
after    en  complete  116/116 translated, 116 effective, 0 explicit fallback
```

The quotable figure is unchanged: **1 locale supported, 1 declared scaffold at
0 %, 0 non-conforming.** Not "2 locales". `locales at ≥95 %` is **1** in every run
in this report, including all six probe runs.

### 2.4 Seeded probes — on disk, both directions, then deleted

Probes were written to `packages/core/src/i18n/locales/` as `nl.json` (Dutch's
plural categories are `one`/`other`, the same as English, so the probe isolates
the effective-translation question instead of also tripping
`plural-categories`). Every run's exit code is file-captured.

**Probe A — one value, the English source copied verbatim** (`DzAlert.close` =
`"Close"`; this is the shape TASK-S5-O1 measured and filed):

```
validate:i18n-packs         ->  exit 0     <- NOT counted as "has translations"
  nl  scaffold  1/116 translated, 0 effective, 115 explicit fallback (1 copied from en)
validate:i18n-completeness  ->  exit 1     <- still rejected: the gate FAILS CLOSED
  | nl | ltr | 116 | 1 | 1 | 0 | 0 | 0 | 0 % (below threshold) |
  [undeclared-scaffold] … "nl" is 0 % complete, below the 95 % supported threshold,
  and is not listed in `scaffolds`
  locales at >= 95 % completeness: 1 (en) — floor 1
```

**Probe A against the OLD predicate** — `published = pack.translated !== 0` seeded
back into the shipped file, so the A/B is on the real gate rather than argued:

```
validate:i18n-packs  ->  exit 1
  [export] packages/core/package.json nl: "nl" has 0 effective translation(s)
           but no "./i18n/locales/nl.json" export
```

Read that line twice: **the old rule 9 demanded the publication of a pack with
zero effective translations.** The seed was then restored and re-hashed:

```
sha256sum -c   packages/tooling/src/validators/i18n-packs.ts: OK    exit 0
validate:i18n-packs (probe A still on disk)  ->  exit 0
```

**Probe B — one *genuine* translation** (`DzAlert.close` = `"Sluiten"`):

```
validate:i18n-packs         ->  exit 1
  nl  partial  1/116 translated, 1 effective, 115 explicit fallback
  [export] … "nl" has 1 effective translation(s) but no "./i18n/locales/nl.json" export
validate:i18n-completeness  ->  exit 1
  | nl | ltr | 116 | 1 | 0 | 0 | 0 | 0 | 0.9 % (below threshold) |
```

**This is deliberate and it is option B, not option C.** A pack with a real
translation is publishable, so rule 9 asks for its export; the completeness gate
separately refuses to let it read as *supported* at 0.9 %. The task brief's
"prove it" clause asked for one genuine translation **not** to count as "has
translations" — that is option **C** (publication behind the 95 % threshold),
which TASK-S5-O1 considered and rejected in writing because it *"blocks the
legitimate case of shipping a genuinely partial pack that falls back to
English — which R5-O4 deliberately supported"*. The brief's own instruction was to
implement S5-O1's recommendation, which is B, and the seed S5-O1 actually measured
was **one English-copied value** (probe A), described in its own report as *"not a
translation, and that is the point"*. **So probe A is the case the finding is
about and it now behaves as asked; probe B is recorded here as the deliberate
divergence from the literal wording, with the reason.** If the owner wants C, it
is one further predicate change and §5 raises it as a decision rather than
deciding it silently.

**Probe C — all 116 English values copied, `fallback: []`:**

```
validate:i18n-packs         ->  exit 0
  nl  scaffold  116/116 translated, 0 effective, 0 explicit fallback (116 copied from en)
validate:i18n-completeness  ->  exit 1
  | nl | ltr | 116 | 116 | 116 | 0 | 0 | 0 | 0 % (below threshold) |     <- reads 0 %, as required
  [undeclared-scaffold] … "nl" is 0 % complete …
  locales at >= 95 % completeness: 1 (en) — floor 1
```

**Probe C against the OLD `status` derivation** (`translatedCount === 0 ?
'scaffold' : …` seeded back) — the worst case of the defect, and worse than the
one that was filed:

```
validate:i18n-packs  ->  exit 1
  nl  complete  116/116 translated, 0 effective, 0 explicit fallback (116 copied from en)
  [export] … "nl" has 0 effective translation(s) but no "./i18n/locales/nl.json" export
```

**The old code called a pack that is entirely English `complete`, and demanded it
be published as a Dutch locale.** Restored and re-hashed: `sha256sum -c … OK`,
exit 0.

**Every probe deleted, and the directory proved clean:**

```
rm -f packages/core/src/i18n/locales/nl.json
ls -1 packages/core/src/i18n/locales/                                   ->  de.json  en.json
find … -type f -not -name en.json -not -name de.json | wc -l            ->  0
git status --porcelain packages/core/src/i18n/locales/                  ->  no output (clean)
```

### 2.5 What the filer did not find

1. **The all-copied case, which is far worse than the one-value case.** F1
   measured one English value and reported a wrong *demand*. A pack copying the
   whole catalog was reported `complete` — `status` derived from the raw count too,
   not just rule 9 — so the defect was two lines, not one, and the second one
   mislabels a 0 % pack as a finished translation in the gate's own console output.
2. **The predicate had to *move*, not be imported.** `i18n-completeness.ts` already
   depends on `i18n-packs.ts`; importing `isUntranslated` the other way would have
   made the cycle. The single-definition requirement therefore forced the
   definition down a layer, and `SOURCE_LOCALE` with it (`'en'` was hard-coded in
   two files).
3. **Rule 9 gained a failure the old predicate could not produce.** A copy-only
   pack that *is* exported now fires `exports "nl", a scaffold the build does not
   publish`. Under the old predicate that pack was "published", so exporting it was
   silently correct. The fix is net-stricter, not net-greener: it removes one wrong
   red and adds one right one.
4. **`identical` is no longer computed twice.** The completeness gate had its own
   loop over the pack applying `isUntranslated`; it now subtracts
   `coverage.translated − coverage.effective`. The two gates cannot drift because
   there is one subtraction, not two loops.

### 2.6 No pack defect surfaced

The two checked-in packs are exactly what they were declared to be: `en` is the
source at 100 %, `de` is a scaffold at 0/116 with 116 explicit fallbacks and a
register entry naming decision D59. Nothing about them changed, and no new
violation appeared in either gate.

---

## 3. Aggregate qualification — pre-existing vs new

### 3.1 The first aggregate attempt failed at link 24, on this batch's own edit

This is the part worth reading. `ssr-smoke.spec.ts` is a **declared input of the
capability matrix**, so editing it made the artifact stale and the chain stopped
at **link 24 of 60**, `validate:capability-matrix`:

```
yarn validate:all > log 2>&1 ; echo "exit $?" > exitfile     ->  exit 1   (132 lines)
✗ [freshness] packages/core/docs/capability-matrix.json is stale.
  Run `yarn generate:capability-matrix` and commit the result.
```

Links 1–23 were green in that run, including this batch's link 9
(`validate:i18n-packs`) and link 10 (`validate:i18n-completeness`) with their new
output. §1.5 item 5 had correctly predicted that no *cell* would move — and that
was true — but freshness is a stamp, not a cell, so a regeneration was owed
regardless. The prediction and the gate disagreed about nothing; the gate was
asking a different question.

### 3.2 The regeneration, in the sanctioned order, and what it proves

`ownership -> quality -> capability -> component-meta -> llms -> docs-pages`, all
six, each exit code captured:

```
yarn generate:ownership          ->  exit 0
yarn generate:quality-matrix     ->  exit 0
yarn generate:capability-matrix  ->  exit 0
yarn generate:component-meta     ->  exit 0
yarn generate:llms               ->  exit 0
yarn generate:docs-pages         ->  exit 0
```

**The first pass changed exactly one line of the matrix, and it was wrong — a
finding in its own right.**

```
diff <pre-batch capability-matrix.json> <after 1st regeneration>
12211c12211,12212
<             "packages/core/tests/ssr/dz-provider-ssr.spec.ts"
---
>             "packages/core/tests/ssr/dz-provider-ssr.spec.ts",
>             "packages/core/tests/ssr/ssr-smoke.spec.ts"
```

`generate-capability-matrix.ts` derives the `ssr-sample` artifact list with
`filesMentioning(sources.ssrSpecs, row.component)` — a **substring match over the
whole file**. One of my new comments contained the provider component's class
name in prose, and that component's SSR evidence list acquired a file that does
not test it. **The totals did not move, so no gate would ever have caught it**;
it is precisely the kind of citation this programme calls evidence laundering,
arrived at by accident. The comment was reworded to describe the provider without
naming it, and the reason is now written in the spec beside the assertion so the
next person does not reintroduce it.

**After the reword and a second regeneration, all four artifacts are byte-identical
to their pre-batch state:**

```
diff <pre-batch> <current>
  packages/core/docs/quality-matrix.json                    IDENTICAL
  packages/core/docs/capability-matrix.json                 IDENTICAL
  packages/core/docs/component-meta.json                    IDENTICAL
  packages/core/manifests/component-ownership.manifest.json  IDENTICAL
```

and the docs tree is proved settled by idempotence — `generate:docs-pages` run a
third time changes nothing, and no page cites the SSR smoke file:

```
md5sum -c <165 files under apps/docs>   ->  exit 0   165 OK
grep -c ssr-smoke apps/docs/components/DzProvider.md   ->  0
grep -c ssr-smoke apps/docs/evidence/*.md              ->  0 in every file
```

So the regeneration is a **no-op on content**: it refreshes the stamp the
freshness gate reads and moves not one cell, number or page.

### 3.3 The run this report quotes — end to end, on the tree as delivered

```
node -e "…scripts['validate:all'].split('&&').length"                    ->  60
yarn validate:all > validate-all-final.log 2>&1 ; echo "exit $?" > .exit  ->  exit 1
  469 lines · 39 lines carrying ✓ (grep -c '✓'; not comparable to RESIDUAL-01's
  differently-derived count of 119)
```

**This is the run after every document in this batch was written**, so links 1–50
are qualified against the new files in fact and not only in argument. The chain was
run twice end to end: once before the documentation (470 lines) and once after
(469). **The two runs differ by exactly one line**, and the missing one is worth
naming:

```
diff <before-docs run> <final run>
206d205
< STALE @dzup-ui/core: dist (…10:15:21Z) predates
        packages/core/src/generated/component-ownership.ts (…11:03:10Z)
```

That `validate:published-imports` advisory disappeared because the
individually-run link 60 (`yarn build`) refreshed the dist between the two — a live
demonstration of RESIDUAL-01 §3.4's reason for putting the build at the END of the
chain: the pre-build lane correctly reports that it is judging an older build, and
the next run's lane sees a dist newer than its inputs. `STALE` lines: **1 → 0**.

**Exactly one `✗` in the whole log, and it is not this batch's:**

```
✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared as "^0.475.0"                       <- orphan lockfile entry
      lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core, @dzup-ui/landing, @dzup-ui/sandbox
```

**Failing link: 51 (`yarn validate:peers` -> `validate:icon-duplicates`).**
Identical link, identical clause and identical text to RESIDUAL-01 §4.5. It is
**PRE-EXISTING**: RESIDUAL-01 aligned all three manifests to `^0.477.0` and proved
the chain green over all 60 links with the yarn-resolved lockfile, but an agent may
not leave a mutated `yarn.lock`, so the orphan resolution entry remains. **No
`yarn install` was run here and `yarn.lock` was not touched** — verified, not
assumed: `git status --porcelain yarn.lock` prints nothing.

### 3.4 Links 52–60 — never reached by the chain, so each run on its own

The chain is `&&`, so link 51 halts it. Each later link was run individually
against the same tree, exactly as RESIDUAL-01 did:

| link | gate | exit | note |
|---|---|---:|---|
| 52 | `validate:licenses` | **0** | |
| 53 | `validate:tree-shake` | **0** | |
| 54 | `validate:evidence-binding` | **0** | 4 × `! [dirty-input]` advisories, **all pre-existing** (§3.6) |
| 55 | `validate:deprecations` | **0** | |
| 56 | `validate:adr-status` | **0** | 3 documents · 0 Accepted · 3 Proposed · 3 grandfathered, **ceiling 3** |
| 57 | `validate:at-runs` | **0** | **0 of 534** executed cells |
| 58 | `validate:docs-freshness` | **0** | |
| 59 | `validate:runtime-floor` | **0** | |
| 60 | `yarn build` | **0** | |

### 3.5 The rest of the lane

```
yarn typecheck      ->  exit 0
yarn typecheck:all  ->  exit 0
yarn lint           ->  exit 0
yarn test           ->  exit 0   Test Files 572 passed (572)
                                 Tests 11135 passed | 3 skipped | 1 todo (11139)
                                 Duration 340.56s
```

**One run of `yarn test`, no flake** — the documented "exit 1 with zero failing
tests under load" reporter flake did not occur, so there is one run to quote and
not two. 11,126 -> **11,135** is exactly +9: one from the `DzIcon` split and eight
new `i18n-packs` cases. File count unchanged at 572 (no spec file was added; the
eight new cases went into an existing file, and the throwaway probe specs were
deleted before any suite run).

### 3.6 Advisories in the run — every one pre-existing, none able to fail the chain

- **`! [dirty-input]` × 4** (link 54) — `component-ownership.manifest.json`,
  `quality-matrix.json`, `capability-matrix.json`, `component-meta.json` each have
  declared inputs modified in the worktree. The gate's own words: *"the COMMITTED
  binding is what this gate proves; this line is not a failure."* Register row #2
  (commit the worktree), unchanged. **Note:** this batch regenerated all four, and
  they are byte-identical to pre-batch — the advisory is about the worktree being
  dirty, not about the artifacts being wrong.
- **`! [deprecated-ident]`** (link 51) — `lucide-vue-next` deprecated upstream.
  Register row #3 option (a), still open.
- **`⚠ docs-freshness`** — the pre-build lane cannot assert a build, by design.
- **`STALE @dzup-ui/mcp`** (link 32) — RESIDUAL-01's own manifest edit; link 60
  refreshes it.

Nothing in this list is new.

---

## 4. Ratchet movements (old → new)

| ratchet / counted quantity | old | new | evidence |
|---|---|---|---|
| **`unclassified`** | 29 | **29** | `✓ ownership-manifest: … 29/29 unclassified` (link 22) |
| **`maxWithoutAnatomy`** | 41 | **41** | same line: `41/41 public components without anatomy` |
| **`maxProposedCitedFromCode`** | 3 | **3** | link 56: `3 Proposed (ADR-18, ADR-19, ADR-20) · 3 cited … all 3 grandfathered (ceiling 3)` |
| **capability `fail`** | 0 | **0** | matrix totals byte-identical to pre-batch |
| **capability `stale`** | 22 | **22** | same |
| **capability `unrun`** | 400 | **400** | same |
| **capability `excepted`** | 47 | **47** | same |
| **AT cells executed** | 0 of 534 | **0 of 534** | link 57 |
| **locales at ≥ 95 %** | 1 (`en`) | **1 (`en`)** | printed in **every** run in this report, including all six probe runs, always `— floor 1` |
| **`validate:all` chain links** | 60 | **60** | measured, never quoted |
| `validate:all` failing link | 51 | **51** (same clause, same text) | §3.3 |
| `i18n-packs.spec.ts` cases | 16 | **24** (+8) | measured per file |
| both i18n specs together | 66 | **74** | §2.2 |
| `ssr-smoke.spec.ts` cases | 62 + 1 skipped | **63** + 1 skipped | §1.3 |
| `ssr-smoke.spec.ts` `[Vue warn] Missing required prop` | **4** | **0** | §1.3 |
| `ssr-smoke.spec.ts` bare `toBeTruthy()` on a component with absent required props | **4** | **0** | §1.2 |
| `PackCoverage` fields | 5 | **6** (`effective`, required) | §2.1 |
| Definitions of "a value identical to English" in the tree | **2** | **1** | §2.1 |
| Pending changesets | 43 | **43** | no published package changed |
| Dirty paths | 295 | **297** | below |

**No ceiling was raised and no allowlist widened.** No `*ceilings*.json` file is
among the five paths this batch touched, and every ratchet-bearing number above
prints unchanged. Both changes are *stricter*: four unfalsifiable assertions
became falsifiable, and rule 9 gained a failure mode (`exports "<x>", a scaffold`
for a copy-only pack) that its old predicate could not produce.

**The dirty count, 295 → 297.** This batch's paths are five:

```
 M packages/core/tests/ssr/ssr-smoke.spec.ts
 M packages/tooling/src/validators/i18n-packs.ts
 M packages/tooling/src/validators/i18n-packs.spec.ts
?? packages/tooling/src/validators/i18n-completeness.ts        (untracked before this batch too)
?? docs/program-2026-09-22-architecture/reports/RESIDUAL-02-filed-defects-handoff.md   (new)
```

`ssr-smoke.spec.ts` and `i18n-completeness.ts` were already dirty at entry; the
two `i18n-packs` files were clean (their whole diff against `HEAD` is this batch's,
checked line by line) and the report is new, which is +3. The measured delta is
**+2**, so the sanctioned regeneration returned one previously-dirty generated path
to its committed bytes. `packages/core/src/generated/component-ownership.ts` is
the only regenerated tracked path that is **not** in the dirty list, so it is the
candidate — named as an inference, not a measurement, because no per-path entry
snapshot was taken before the batch. It is a *reduction* in dirt and worth naming
so the owner's commit is not surprised by it.

---

## 5. Owner decisions — closed, and raised

### 5.1 Closed to the limit of agent authority

| filed as | new status |
|---|---|
| **`TASK-S1-O2-F1`** | **CLOSED — fixed in full, option (a).** All four invalid-prop calls now pass declared-required props and assert rendered output; two components were seeded broken and the test proved to fail, with the old assertion proved to pass on the same broken tree and a byte-identical restore (§1.4). Nothing owner-only remains but the commit |
| **`TASK-S5-O1-F1`** (decision 3) | **CLOSED — fixed in full, option (B) as recommended.** `isUntranslated` moved to `i18n-packs.ts` as the single definition, `PackCoverage.effective` added, rule 9 and `status` read it, both directions seeded on disk and measured, every probe deleted (§2.4). One divergence from the brief's literal "prove it" wording is recorded in §2.4 with its reason, and offered to the owner as decision `D-RES02-3` below |

### 5.2 Raised

1. **`D-RES02-1` 🟡 — `DzPagination` nests two `<nav>` landmarks.** Reka's
   `PaginationRoot` renders as `nav` and `DzPagination.vue` wraps it in its own,
   so the server HTML is `<nav aria-label="Pagination">…<nav>…</nav></nav>` and a
   screen-reader user meets a nameless landmark inside the named one (§1.6).
   Options: (a) `:as="'div'"` on `PaginationRoot`; (b) drop the outer `<nav>` and
   move `aria-label`, `data-part="root"`, the focus handlers and `ui.root` onto
   `PaginationRoot`; (c) leave it and document. **Recommendation: (a)** — smallest
   DOM delta, keeps every `data-part` and `ui` key where ADR-19 puts them. Costs a
   `patch` changeset, a visual re-baseline and an AT re-baseline, which is why it
   was not taken here. Not urgent: it is a landmark-nesting smell, not a blocker.
2. **`D-RES02-2` 🟡 — the capability matrix cites evidence on a substring match.**
   `generate-capability-matrix.ts:440` builds the `ssr-sample` and
   `portal-hydration` artifact lists with `filesMentioning`, so **a component named
   in a code comment acquires an evidence citation** — measured, not hypothesised
   (§3.2: one of this batch's comments did exactly that, and no gate could have
   caught it because the totals did not move). Options: (a) match only on an
   import specifier or a `describe`/`it` title; (b) match only outside comments;
   (c) leave it and rely on review. **Recommendation: (a)** — it is the only one
   that makes the citation mean "this file exercises that component". Worth
   pairing with an audit of the existing lists, since nothing guarantees this is
   the first accidental citation.
3. **`D-RES02-3` 🟢 — should a *genuinely* partial pack still demand publication?**
   Implemented as option **B** (S5-O1's recommendation and this task's brief): one
   real translation makes a pack publishable, so rule 9 asks for its export, while
   the completeness gate separately refuses to call it supported (§2.4, probe B).
   The task brief's "prove it" clause described option **C** instead (publication
   behind the 95 % threshold), which S5-O1 had considered and rejected in writing.
   Options: (a) keep B; (b) move to C — one predicate change, `published =
   completeness >= threshold`, which would also make the two gates share a
   threshold rather than a predicate; (c) B plus an advisory line when a
   publishable pack is under, say, 20 %. **Recommendation: (a), with (c) cheap and
   additive if the pressure is what worries the owner.** B is recorded rather than
   assumed, so this is a real choice and not a fait accompli.
4. **`D-RES02-4` 🟢 — `DzPagination`'s root class is empty.** `paginationVariants.root()`
   renders `class=""` on the `<nav>` (visible in §1.1's full string). Harmless, but
   an empty `class` attribute on every paginated page is either a missing style or
   a variant slot that should not exist. Options: (a) give `root` its layout
   classes; (b) omit the attribute when empty; (c) leave. **Recommendation: (b)**
   if nothing is missing, (a) if something is — needs a designer's eye, not an
   agent's.

---

## 6. Ranked next packet

1. **Register #2 / `D127` — commit the 297-path worktree.** Owner-only, unchanged
   as the single act that unblocks the most, and now also the only thing between
   this batch and its own evidence being citable (the four `! [dirty-input]`
   advisories at link 54 exist purely because it has not happened).
2. **`D-RES01-1` — the one `yarn install`.** Still the cheapest act with the
   largest measured effect: link 51 is this batch's only red and it is the same
   red, for the same reason, with **zero** declarants left on the old range.
3. **`D-RES02-2` — the `filesMentioning` citation rule.** Promoted above the
   component fixes because it is an *evidence integrity* defect in a generator
   this programme's reports quote from, it was measured rather than theorised, and
   no gate can see it. Cheap: one predicate plus an audit of the current lists.
4. **Register #8 / `D-S2O1-3` — the Nuxt nonce half.** Unchanged from
   RESIDUAL-01's ranking: *"a defect whose fix is already in the repository"*, and
   now covered by both a type gate and a build link.
5. **`D-RES02-1` — `DzPagination`'s nested landmarks.** Small and real, but it
   costs two baseline replacements, so it belongs in a batch that is already
   re-baselining.
6. **Register #3 option (a) — the `@lucide/vue ^1.47.0` swap.** Unchanged; note
   this batch's `ssr-smoke.spec.ts` now imports an icon from `lucide-vue-next`, so
   the swap's codemod has one more call site to rewrite (a test file, not a
   published one).
7. **The remaining SSR smoke blocks.** This batch fixed the four the filer named.
   **Of the file's 64 `it` blocks, 36 still have `expect(html).toBeTruthy()` as
   their sole assertion** (24 more pair it with real assertions; 4 were this
   batch's). Those 36 render their component with *no* props — those are not the filed defect (no
   required prop is absent, so nothing warns, and several of them genuinely have
   no assertable output with an empty prop set), but §1.1's `'<!---->'`
   demonstration applies to every one of them. A follow-up could take them family
   by family; it is a larger, lower-urgency job than the one filed, and inventing
   assertions for props-free renders is exactly the trap §1.2 avoided. Naming the
   scope so it is not mistaken for finished.
