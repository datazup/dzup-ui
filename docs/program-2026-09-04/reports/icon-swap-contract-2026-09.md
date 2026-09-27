# The icon swap contract — `lucide-vue-next` → `@lucide/vue`

> **Packet:** TASK-R1-O6 decision item 1 (**D174**). **Prepared, NOT applied.**
> **Repository:** `ui/dzup-ui` @ **`527dbd1`**, 2026-09-21. Locally qualified.
> **Decision memo:** [`peer-hygiene-decisions-2026-09.md`](./peer-hygiene-decisions-2026-09.md).
> **Predecessor:** [`../../program-2026-09/reports/peer-hygiene-2026-09.md`](../../program-2026-09/reports/peer-hygiene-2026-09.md) §2 (N5-04-D2).
>
> Nothing in `packages/core`, `apps/landing` or `apps/sandbox` was edited by
> this packet. `yarn.lock` was not touched. `@lucide/vue` was **not installed**:
> every number below comes from an `npm pack`ed tarball unpacked in the session
> scratchpad and from the `lucide-vue-next@0.477.0` already on disk at
> `packages/core/node_modules/`.

---

## 1. The two packages

| | `lucide-vue-next` | `@lucide/vue` |
|---|---|---|
| latest on npm (2026-09-21) | **`1.0.0`** | **`1.47.0`** |
| deprecated? | **yes, all versions** — *"Package deprecated. Please use @lucide/vue instead."* | no |
| licence | ISC | ISC |
| repository | `lucide-icons/lucide`, `packages/vue` | `lucide-icons/lucide`, `packages/vue` |
| provenance | — | npm attestation, SLSA provenance v1 |
| peer | `vue >=3.0.1` | `vue >=3.0.1` |
| runtime deps | none | none |
| `exports` map | none (`main`/`module`/`typings`) | none (`main`/`module`/`typings`) |
| `sideEffects` | `false` | `false` |
| named exports in the ESM barrel | 5,276 | **6,329** |
| unpacked size | ~1.1 MB | **23.4 MB** (3,726 files) |
| declared in this repo | `packages/core@^0.477.0` · `apps/landing@^0.475.0` · `apps/sandbox@^0.475.0` | — |

They are the same project under two names, which is why
`packages/tooling/src/validators/peer-icon-duplicates.ts` treats them as one
identity set: installing both at once is a half-finished swap, not two
dependencies.

---

## 2. The mapping table

**18 identifiers · 22 modules · 0 renames.** Every identifier `@dzup-ui/core`
imports resolves in `@lucide/vue@1.47.0`, confirmed twice: against
`dist/lucide-vue.d.ts` and against the ESM barrel's runtime `export { … }`
clauses. **The `<stop_conditions>` case "`@lucide/vue` lacks an icon the library
uses" does not fire.**

`artwork` compares the icon node array literally. `class` is the rendered
`<svg class>` attribute — 0.x builds it in `Icon.js` as
`["lucide", "lucide-" + toKebabCase(name)]` with `name = "XIcon"`; 1.x builds it
in `shared/src/build/buildLucideIconNode.mjs` from `icon.name` (already kebab)
plus one class per `icon.aliases` entry.

| # | identifier | modules using it | old module | new module | artwork | rendered class: 0.477.0 → 1.47.0 |
|---:|---|---:|---|---|:--:|---|
| 1 | `CalendarIcon` | 2 | `calendar.js` | `calendar.mjs` | **changed** | `lucide lucide-calendar-icon` → `lucide lucide-calendar` |
| 2 | `Check` | 7 | `check.js` | `check.mjs` | same | `lucide lucide-check-icon` → `lucide lucide-check` |
| 3 | `ChevronDown` | 7 | `chevron-down.js` | `chevron-down.mjs` | same | `…-chevron-down-icon` → `…-chevron-down` |
| 4 | `ChevronLeft` | 5 | `chevron-left.js` | `chevron-left.mjs` | same | `…-chevron-left-icon` → `…-chevron-left` |
| 5 | `ChevronRight` | 7 | `chevron-right.js` | `chevron-right.mjs` | same | `…-chevron-right-icon` → `…-chevron-right` |
| 6 | `ChevronUp` | 1 | `chevron-up.js` | `chevron-up.mjs` | same | `…-chevron-up-icon` → `…-chevron-up` |
| 7 | `ChevronsDown` | 1 | `chevrons-down.js` | `chevrons-down.mjs` | same | `…-chevrons-down-icon` → `…-chevrons-down` |
| 8 | `ChevronsLeft` | 1 | `chevrons-left.js` | `chevrons-left.mjs` | same | `…-chevrons-left-icon` → `…-chevrons-left` |
| 9 | `ChevronsRight` | 1 | `chevrons-right.js` | `chevrons-right.mjs` | same | `…-chevrons-right-icon` → `…-chevrons-right` |
| 10 | `ChevronsUp` | 1 | `chevrons-up.js` | `chevrons-up.mjs` | same | `…-chevrons-up-icon` → `…-chevrons-up` |
| 11 | `Clock` | 1 | `clock.js` | `clock.mjs` | **changed** | `lucide lucide-clock-icon` → `lucide lucide-clock` |
| 12 | `Filter` | 1 | `filter.js` | **`funnel.mjs`** | **changed** | `lucide lucide-filter-icon` → **`lucide lucide-funnel lucide-filter`** |
| 13 | `GripVertical` | 1 | `grip-vertical.js` | `grip-vertical.mjs` | same | `…-grip-vertical-icon` → `…-grip-vertical` |
| 14 | `Minus` | 2 | `minus.js` | `minus.mjs` | same | `lucide lucide-minus-icon` → `lucide lucide-minus` |
| 15 | `MoreHorizontal` | 1 | `ellipsis.js` | `ellipsis.mjs` | same | `lucide lucide-ellipsis-icon` → **`lucide lucide-ellipsis lucide-more-horizontal`** |
| 16 | `Plus` | 1 | `plus.js` | `plus.mjs` | same | `lucide lucide-plus-icon` → `lucide lucide-plus` |
| 17 | `Star` | 1 | `star.js` | `star.mjs` | same | `lucide lucide-star-icon` → `lucide lucide-star` |
| 18 | `X` | 8 | `x.js` | `x.mjs` | same | **`lucide lucide-xicon`** → `lucide lucide-x` |

**15 of 18 artworks identical · 0 of 18 classes identical.**

Row 18 is worth reading twice: 0.x names the component `"XIcon"` and kebabs it
to `xicon` — not `x-icon` — so the class shipped today is `lucide-xicon`, on the
single most-used glyph in the library.

### 2.1 The three redrawn glyphs, in full

```diff
  CalendarIcon        calendar.js -> calendar.mjs
- ["path",{d:"M8 2v4"}], ["path",{d:"M16 2v4"}],
- ["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2"}], ["path",{d:"M3 10h18"}]
+ ["path",{d:"M8 2v3"}], ["path",{d:"M16 2v3"}],
+ ["rect",{x:"3",y:"3",width:"18",height:"18",rx:"2"}], ["path",{d:"M3 9h18"}]

  Clock               clock.js -> clock.mjs
- ["circle",{cx:"12",cy:"12",r:"10"}], ["polyline",{points:"12 6 12 12 16 14"}]
+ ["circle",{cx:"12",cy:"12",r:"10"}], ["path",{d:"M12 6v6l4 2"}]

  Filter              filter.js -> funnel.mjs
- ["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"}]
+ ["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341
+   L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"}]
```

Components affected: `DzDatePicker` / `DzDateRangePicker` (`CalendarIcon`),
`DzTimePicker` (`Clock`), `DzDataGridHeader` (`Filter`).

### 2.2 The runtime contract also changes

Read from the two packages' `Icon` implementations, not predicted:

| | `lucide-vue-next@0.477.0` | `@lucide/vue@1.47.0` |
|---|---|---|
| `createLucideIcon` signature | `(name: string, nodes)` | `(iconData \| name, nodes?)` — the string form is kept for compatibility |
| `class` | `["lucide", "lucide-" + kebab(name)]` | `mergeClasses("lucide", "lucide-" + icon.name, …aliases, …contextClass)` |
| `aria-hidden` | **never emitted** | **`"true"` when `hasA11yProp === false` and there is no default slot** |
| `viewBox` | from `defaultAttributes` | computed from `icon.size ?? icon.width` |
| provider | none | `setLucideProps()` / `useLucideProps()` — size, color, strokeWidth, absoluteStrokeWidth, nonScalingStroke, class |
| `vector-effect="non-scaling-stroke"` | not supported | supported per-icon and via the provider |

The `aria-hidden` default is the one to weigh. Every icon `@dzup-ui/core`
renders today is decorative inside a labelled control, so `aria-hidden="true"`
is almost certainly correct — but it is a change to the accessibility tree, the
AT matrix (TASK-R2-O2) records that tree, and `yarn test` carries axe assertions
that count nodes.

The provider is a *gift* for ADR-20: N5-04's Option C ("the icon-slot contract,
defaults preserved") proposed a tenth provider concern and a `useDzIcons()`
composable. `@lucide/vue` ships size/colour/stroke context already, which is a
strict subset of Option C but removes some of its motivation. **Not proposed
here** — Option C is its own decision and needs an ADR-20 amendment.

---

## 3. Measured bundle delta

esbuild, `vue` external, `--minify`, tree-shaking on; the 18 glyphs re-exported
from one entry. Both packages read from disk; nothing installed.

| | raw | gzip |
|---|---:|---:|
| `lucide-vue-next@0.477.0` | 3,337 | 1,376 |
| `@lucide/vue@1.47.0` | 5,769 | 2,444 |
| **delta** | **+2,432** | **+1,068** |

Isolating the icon code from the entry scaffolding (same build, icon package
external, subtracted):

| | raw | gzip |
|---|---:|---:|
| icon cost, `0.477.0` | 2,658 | 1,034 |
| icon cost, `1.47.0` | 5,039 | 2,054 |

And the shape of the delta — it is a **fixed runtime cost**, not per-glyph:

| glyphs bundled | Δ raw | Δ gzip |
|---:|---:|---:|
| 1 | +1,908 | +864 |
| 5 | +1,995 | +905 |
| 18 | +2,432 | +1,068 |

**Interpretation.** ~0.86 kB gzip of the delta is 1.x's larger shared runtime
(provider context, `buildLucideIconNode`, `mergeClasses`, alias handling,
`aria-hidden` defaulting, non-scaling-stroke); only ~0.2 kB accrues across the
remaining 17 glyphs. The library's total icon cost roughly **doubles**, from
~1.0 kB to ~2.1 kB gzip.

That is a kilobyte, and currency still wins the argument. But it **reverses**
N5-04's framing — *"do not argue this on bundle size, there are only 1,206 of
them"* — and the memo says so rather than quietly inheriting it.

### 3.1 What `validate:bundle-budget` can and cannot say about this

`validate:bundle-budget` reads `bundlesize.config.json` and gzips **built
files** in `packages/core/dist`. It can only see this delta **after** the swap
is applied and `yarn build` is re-run; it cannot compare a hypothesis. Its
current state is recorded in the handoff's validation table as a *baseline*, so
the post-swap run has something to be compared against.

---

## 4. The codemod

`packages/codemods/src/transforms/swap-icon-library.ts`, exported from the
package index as `swapIconLibrary`, and registered on the CLI as
`dzup-codemod swap-icon-library <dir>`. **Deliberately not part of `all`**: the
`all` bundle is the vNext migration, and this is an owner decision.

What it rewrites:

| input | output |
|---|---|
| `import { X } from 'lucide-vue-next'` | `import { X } from '@lucide/vue'` |
| `import type { LucideIcon } from 'lucide-vue-next'` | `… from '@lucide/vue'` |
| `import X from 'lucide-vue-next/dist/esm/icons/x.js'` | `import X from '@lucide/vue/dist/esm/icons/x.mjs'` |
| `export { Star } from 'lucide-vue-next'` · `export * from …` | `… from '@lucide/vue'` |
| `await import('lucide-vue-next')` | `await import('@lucide/vue')` |
| a `<script setup>` block in a `.vue` SFC | same, via the runner's SFC extraction |
| anything already on `@lucide/vue`, or any other package | **unchanged — returns `null`** |

Identifier renaming is wired but inert: `GLYPH_MAP` is an identity map for all
18, because measurement says no rename is needed. It is written out in full
rather than left empty, because an empty map and an unchecked map look
identical in a diff.

**One printing artefact.** `recast` re-prints the statement around a node it
mutated, so the dynamic-import line comes back with a trailing semicolon this
repository's ESLint removes. Fixture `04-dynamic-and-reexport.output.ts` records
that raw output rather than hiding it. **Run `yarn lint --fix` after the
codemod.**

### 4.1 Fixtures

`packages/codemods/src/transforms/__fixtures__/swap-icon-library/` — seven
cases, driven by `__tests__/swap-icon-library.spec.ts` (**19 tests, exit 0**).
A case with no `.output.*` sibling asserts the opposite property: the transform
must report *nothing to do*, which is what makes it safe to re-run over a
half-migrated tree.

| fixture | asserts |
|---|---|
| `01-named-import` | the shape 22 `packages/core/src` modules actually use |
| `02-type-import` | `import type` and value imports from the same package |
| `03-deep-subpath` | the `.js` → `.mjs` extension change |
| `04-dynamic-and-reexport` | `export …from`, `export * from`, `await import()`, and the semicolon artefact |
| `05-idempotent` | already on `@lucide/vue` → **no change** |
| `06-unrelated` | `reka-ui`, `vue` → **no change** |
| `07-sfc` | a `.vue` `<script setup>` block, template untouched |

The directory is added to `eslint.config.js`'s `ignores` with the same
reasoning the ownership-scanner fixtures carry, one step stronger: an
`.output.*` fixture is a *recording*, and autofixing it would not tidy the
fixture, it would **falsify** it.

---

## 5. The execution runbook — for the owner, if D174 is taken as (a)

Nothing below has been run.

```bash
cd ui/dzup-ui

# 1. manifests — all three at once, or the gate's single-ident clause fires
#    packages/core/package.json   "lucide-vue-next": "^0.477.0" -> "@lucide/vue": "^1.47.0"
#    apps/landing/package.json    "lucide-vue-next": "^0.475.0" -> "@lucide/vue": "^1.47.0"
#    apps/sandbox/package.json    "lucide-vue-next": "^0.475.0" -> "@lucide/vue": "^1.47.0"
yarn install

# 1b. the manifest yarn.lock CANNOT see — it is not a workspace, it is what a
#     visitor downloads. Forgetting it is the `shipped-manifest-ident` failure.
#     apps/landing/playground-template/package.json  "lucide-vue-next": "^0.475.0"
#                                                 -> "@lucide/vue": "^1.47.0"

# 2. the code — 22 modules in core, ~157 import lines in apps/landing, 5 in apps/sandbox
yarn workspace @dzup-ui/codemods build
node packages/codemods/bin/dzup-codemod.js swap-icon-library packages/core/src --verbose
node packages/codemods/bin/dzup-codemod.js swap-icon-library packages/core/stories --verbose
node packages/codemods/bin/dzup-codemod.js swap-icon-library apps/landing/src --verbose
node packages/codemods/bin/dzup-codemod.js swap-icon-library apps/sandbox/src --verbose
node packages/codemods/bin/dzup-codemod.js swap-icon-library apps/landing/playground-template --verbose
yarn lint --fix

# 2b. the GENERATED consumer surfaces. Never edit these; re-run their generators.
#     BOTH registry generators, in this order — `build:registry` WIPES public/r/
#     before it writes and the animations registry is a second script, so running
#     one alone deletes 60 files (R1-O5 F-2 / D171).
yarn workspace @dzup-ui/landing build:registry            # 40 of 89 items name the icon package
yarn workspace @dzup-ui/landing build:animations-registry
yarn generate:llms                                        # 41 occurrences in llms-full.txt
yarn validate:registry;  echo "exit $?"
yarn validate:llms;      echo "exit $?"

# 3. the gate that started this
yarn validate:icon-duplicates;  echo "exit $?"      # must now be 0

# 4. the gates the swap can break, narrowest first
yarn typecheck;                 echo "exit $?"
yarn validate:externals;        echo "exit $?"      # the resolved dependency changed
yarn validate:tree-shake;       echo "exit $?"
yarn build && yarn validate:bundle-budget; echo "exit $?"   # compare against §3
yarn validate:published-imports; echo "exit $?"     # R1-O2's tarball import gate
yarn test;                      echo "exit $?"      # axe assertions see the new aria-hidden
yarn storybook:build && yarn storybook:test; echo "exit $?"

# 5. the baselines that MUST be re-recorded, not repaired
#    - e2e/visual: DzDatePicker, DzDateRangePicker, DzTimePicker, DzDataGridHeader
#      (the three redrawn glyphs) — and anything else the run reports
#    - the AT matrix rows touching icon-only controls (aria-hidden default)
#    Baseline replacement is an OWNER action (README §5 <authority>).

# 6. the changeset — `minor`, see the memo §1.5
yarn changeset            # @dzup-ui/core: minor
```

**Order matters at step 1**: changing one manifest and not the others leaves one
version of each name installed, which is exactly the `single-ident` clause the
new gate exists to catch.

---

## 6. What this contract does not cover

- **N5-04 Option C**, the icon-slot provider contract (`DzIcons` in
  `@dzup-ui/contracts`, `useDzIcons()` in core, 18 slots named by *role* rather
  than by glyph). It is a separate decision, it needs an **ADR-20 amendment**
  (the ADR enumerates nine provider concerns), and `@lucide/vue`'s own provider
  changes its cost estimate. Not proposed here.
- **Moving the icon package to `optionalDependencies`.** That is Option C's
  companion and is `minor (breaking)` on its own.
- **`apps/docs`** — it imports no lucide glyph (measured: 0 import lines).
