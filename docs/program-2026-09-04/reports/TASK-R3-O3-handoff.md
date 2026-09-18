# TASK-R3-O3 — Form-layout and seam residuals — handoff

> **Status: `[x]` done** — 2026-09-17, `ui/dzup-ui` `main` @ `569d887` + dirty tree
> (65 paths of uncommitted TASK-R5-O4 work at start, preserved). Every number below
> is bound to that tree, not to a commit. Decisions: `TASK-R3-O3-decisions.md`
> (D67–D72). Maturity reached: **implemented → focused-validated → aggregate-qualified
> (with pre-existing red)**. **Not** browser-qualified: the Storybook browser lane
> could not run on this machine (§3).

## Progress

- 2026-09-17 — started; status row `[~]`. `<done_check>` **0 / 6 pass** (no `span` in `DzGrid.types.ts`; no `row|column` in `DzStack.types.ts`; `useAsyncOptions` in 0 story files; not in `forms/DzMention.vue`; `form-readiness` `278 pass · 0 gap · 5 future · 20 unrun · 93 n-a`; decisions file absent) → ran in full, no step skipped.
- Discovery → `future` inventory (§0). Decision sheets D67–D72. DzStack aliases. DzGridItem (D67). DzMention onto the seam. DzPersonaSelector forward. Reviewed C9 cells (D70). Eight `AsyncOptions` stories. Regeneration in convention order. Changesets. Focused lane, `validate:all`, full `yarn test`.
- 2026-09-17 — ended; ledger row, ratchet board and decision register updated.

## 0. `future` cell inventory (discovery step 1)

All five were clause **C9**.

| Control | Was | Now | How |
|---|---|---|---|
| `DzMention` | future — own loader + menu | **pass** (derived) | moved onto `useAsyncOptions` / `DzOptionsState` |
| `DzPersonaSelector` | future — wraps a seam host, declared none of it | **pass** (derived) | declares + forwards the seam |
| `DzCheckboxGroup` | future — slot of children | **n-a** (reviewed) | D70: owns no option source |
| `DzRadioGroup` | future — slot of children | **n-a** (reviewed) | D70 |
| `DzTagsInput` | future — no suggestion source | **n-a** (reviewed) | D70 |

None needed a renderer-contract (C1–C9) change.

## 1. Implemented files + API effect

| Area | Files | API effect (all additive → `patch`) |
|---|---|---|
| DzStack aliases | `layout/DzStack.types.ts`, `DzStack.vue`, `DzStack.contract.spec.ts`, `DzGrid.formLayout.spec.ts`, `stories/layout/DzStack.stories.ts` | `StackDirection` gains `'row' \| 'column'` (aliases of `horizontal`/`vertical`); unknown still falls back to vertical; no deprecation |
| DzGridItem (D67) | `layout/DzGridItem.vue` (new), `DzGrid.types.ts`, `DzGrid.variants.ts` (`gridItemSpanMap`, not exported from the barrel), `layout/index.ts`, `manifests/public-api.manifest.json`, `DzGrid.formLayout.spec.ts`, `tests/ssr/form-layouts-ssr.spec.ts`, `stories/layout/DzGrid.stories.ts` (`SpanningItems` + static `Default`) | New compound part `DzGridItem` (`span?: GridSpan \| ResponsiveSpan`, `as?`); new types `DzGridItemProps`, `DzGridItemSlots`, `GridSpan` (1–12 \| `'full'`), `ResponsiveSpan` (`base/sm/md/lg`). Literal class table (scanner-safe), numeric span clamped to 1–12, `col-span-*` only (RTL-logical), no DOM read (SSR-neutral), no `data-part` (Tier A parent has no anatomy → no anatomy update owed) |
| DzMention seam | `forms/DzMention.vue`, `DzMention.types.ts`, `DzMention.anatomy.ts`, `DzMention.contract.spec.ts`, `forms.anatomy.spec.ts`, `contracts/src/anatomy.types.ts` | Props extend `AsyncOptionsProps`, emits extend `AsyncOptionsEmits`. Host-driven (`optionsState`): `load-options` `open` per new token / `search` as the query grows, previous signal aborted, shared rows for loading/empty/error, retry keeps focus (mousedown prevented + refocus). **Private loader deleted** (`resolveOptions()`, `resolveToken`, private `loading` ref); a function resolver now runs as host of the seam request (abort = supersede) and a rejection shows the error row (was an unhandled rejection). Resolver loading/empty rows + `#loading`/`#empty` slots unchanged (D71). `aria-controls` only while the list renders; keyboard cannot insert hidden options. Anatomy declares `options-state/-message/-retry` (optional); `DzMention` added as owner in `ANATOMY_PART_EXTENSIONS` |
| DzPersonaSelector | `forms/DzPersonaSelector.types.ts`, `.vue`, `.contract.spec.ts` | Props extend `AsyncOptionsProps` (`optionsRetryable` defaults `undefined`, not cast to `false`), emits extend `AsyncOptionsEmits`, forwarded to/from its `DzCombobox` |
| Readiness review | `tooling/src/forms/assessments.ts` | reviewed C9 `future` removed (Mention, PersonaSelector — now derived); `n-a` + D70 evidence (CheckboxGroup, RadioGroup, TagsInput) |
| Stories | `stories/_shared/asyncOptionsHost.ts` (new: signal-honouring mock host + shared `walkAsyncOptionsStates` play), `AsyncOptions` export in `DzSelect`, `DzMultiSelect`, `DzCombobox`, `DzListbox`, `DzCascader`, `DzTreeSelect`, `DzTransfer`, `DzMention` stories | loading → ready → error → retry per control, deterministic (no timers), each in the component's own stories file (matrix-selectable id `core-forms-dz<name>--async-options`) |
| Ceiling comment | `tooling/src/validators/component-meta-ceilings.json` | `$comment` only — value unchanged at 80 |
| Changesets | `.changeset/a-grid-item-can-say-how-many-columns-it-spans.md` (core patch), `.changeset/mention-and-persona-selector-join-the-async-options-seam.md` (contracts + core patch) | — |
| Generated (never hand-edited; each generator run twice, byte-identical) | `form-controls-readiness-matrix.md`, `component-ownership.manifest.json` + `src/generated/component-ownership.ts` + `stories/_data/anatomy.generated.ts`, `quality-matrix.json`, `component-meta.json`, `llms{,-full}.txt`, `apps/docs/**` (144 pages restamped: quality-matrix commit `99b963a` → `569d887`), `README.md` fact region, `DESIGN.md` (via `test:prepare`) | — |

**Deliberately not regenerated: `capability-matrix.json`.** A trial run moved **115 rows**, all driven by `a01965f` component commits (pre-existing staleness, not this task); the file and `stories/_data/capability.generated.ts` were restored byte-for-byte. It stays the known-red link.

**Pro follow-ups (notes only, no Pro edit):** (1) `DzFormGridLayout.vue` can replace its `<div :class="spanClass(child)">` wrapper with `<DzGridItem :span="{ md: clamped }">` and delete `FORM_GRID_SPANS` (12 entries, `DzFormRenderer.variants.ts:108-121`) and `spanClass()`; keep the clamp. (2) `DzFormStackLayout` may pass `direction="column"` directly. (3) D69: `dz.date` matches `format: 'time'` and stores an offset-less value — needs a `dz.time` codec. (4) `DzFormComboboxControl`-style async wiring now also works for mentions/persona selectors.

## 2. Focused validation output

| Command | Result |
|---|---|
| `vitest run layout/DzStack* layout/DzGrid*` | 5 files / 54 tests, exit 0 (after aliases) |
| `vitest run layout/DzGrid* tests/ssr/form-layouts-ssr.spec.ts` | 4 files / 48 tests, exit 0 |
| `vitest run forms/DzMention*` | 2 files / 41 tests, exit 0 (12 new C9 cases) |
| `vitest run forms/DzPersonaSelector*` | 2 files / 17 tests, exit 0 (5 new C9 cases) |
| `vitest run forms/forms.anatomy.spec.ts` | 101 tests, exit 0 (HOSTS 7 → 8 + in-tree DzMention conformance) |
| `yarn test packages/core/src/components/layout packages/core/src/components/forms packages/core/src/composables packages/core/tests/ssr/form-layouts-ssr.spec.ts packages/tooling/src/forms` | **125 files / 1,748 tests, exit 0** |
| `yarn generate:form-readiness && yarn validate:form-readiness` | exit 0 / exit 0 — `44 controls, 280 pass, 0 gap, 0 future, 20 unrun, 96 n-a` |
| `yarn validate:story-dod` · `validate:story-dod-tiers` | exit 0 · exit 0 (`play` 157/169 reported) |
| `yarn validate:rtl` · `validate:anatomy-parts` | exit 0 · exit 0 (615 emissions, 0/0 undeclared, 0/0 unemitted) |
| `yarn typecheck` · `eslint` on every touched file | exit 0 · exit 0 |
| `yarn storybook:test` (scoped and unscoped) | **could not run — tooling failure** (§3) |
| Portable-stories substitute (jsdom, temporary harness, deleted) | **8/8 `AsyncOptions` plays pass**; mutation of the shared walker's error-message assertion → **8/8 fail** (plays execute through error + retry). jsdom evidence, not browser evidence |

## 3. Aggregate qualification

- **`yarn validate:all`** (end-to-end, exit code read directly): **exit 1 at link 18/41 `validate:capability-matrix`** — links 1–17 pass (incl. `typecheck`, `lint`, `form-readiness`, `anatomy-parts`, `rtl`, `story-dod`). Cause **pre-existing**: `[tier-d]` DzFileUpload `browser-matrix` unrun + `[freshness]` stale file, **22 stale cells — the same count TASK-R5-O4 recorded**. Links 19–41 run individually: **all 23 exit 0** (`visual-baselines`, `tokens`, `tokens:refs`, `tokens:dtcg`, `tokens:schema`, `exports`, `ownership`, `mcp`, `component-meta`, `llms`, `docs-pages`, `playground-parity`, `package-names`, `doc-snippets`, `engines`, `adr-references`, `readme-facts`, `externals`, `dts`, `changelog`, `release-policy`, `peers`, `licenses`). Caveat: the capability freshness delta cannot be separated into "pre-existing" and "this task's quality-matrix restamp" without a regeneration that moves 115 unrelated rows.
- **`yarn test`** (full): **3 failed / 9,877 passed / 4 skipped / 1 todo; 532 files; exit 1** — exactly the **3 pre-existing** failures (`dzup-resolution` "covers exactly the specifiers", `landing-token-fallbacks`, `story-dod-tiers countOpen`). **New failures: 0.**
- **Storybook browser lane — tooling failure, not a component failure.** `vitest run --project=storybook` (from `apps/storybook`, filtered and unfiltered, 4 attempts, one after "Re-optimizing dependencies because lockfile has changed") connects the orchestrator and tester, loads the vitest runtime (`vite-inject-mocker-entry.js`), then requests nothing for ~140 s and exits "Browser connection was closed" — **before any setup file or story module is requested** (DEBUG `vite:*`, `vitest:browser*`), so it is independent of story content. `yarn test:e2e`, the chromium matrix targets, `storybook:build`, `build`, `test:nuxt-fixtures` were **not run**.
- **Worktree custody:** `git status --short` 65 paths at start → **251** at end (250 before ticking `contract-conformance-tasks.md`); **0 start paths removed** (`comm -23` empty); +47 non-page paths and +139 generated docs pages. Final `<done_check>` re-run: **6/6 pass**. No commit/stash/checkout/reset/clean; HEAD still `569d887`.

## 4. Ratchet movements (old → new, `569d887` + dirty tree)

| Ratchet | Old | New |
|---|---|---|
| form-readiness `future` | **5** | **0** (pass 278 → 280, n-a 93 → 96; C9 pass 8 → 10) |
| async-options `play()` stories (story files mentioning `useAsyncOptions`) | 0 | **8** (+ shared helper) |
| `DzOptionsState` hosts declaring `options-*` (D15 option d) | 7 (+ PersonaSelector by composition) | **8** (+ PersonaSelector); `maxUndeclaredEmissions` 0 → 0 |
| ownership entries / compound parts / unclassified | 1,331 / 64 / 29 | **1,336 / 65 / 29** |
| component-meta records / `componentsWithoutStaticTemplate` | 208 / 80 | **209 / 80** (held: DzGridItem +1, DzGrid's static Default −1) |
| `maxWithoutAnatomy` | 41 | 41 (unchanged — no Tier A declaration) |
| `validate:all` first failing link | 18/41 | 18/41 (unchanged, pre-existing) |
| `yarn test` failures | 3 pre-existing | 3 pre-existing, 0 new |
| page-contract sections | intent 144 · variants 49 · parts/keyboard/locale/states 41 · provider 39 · api/usage/operational 0 | unchanged |

## 5. Owner decisions (D67–D72, sheets in `TASK-R3-O3-decisions.md`)

| # | Decision | Recommendation | State |
|---|---|---|---|
| D67 | DzGrid span: (a) `data-span` attributes · (b) `DzGridItem` | (b) | **taken under owner delegation 2026-09-17** (reversible: delete before release) — implemented |
| D68 | `utility` ownership kind: (a) schema 1.2.0 `utility` + `injection-key` · (b) codecs as `contract` · (c) leave | (a) → unclassified 29 → 0 | **taken as recommendation, NOT executed** |
| D69 | `time` profile offset: (a) codec owns zone · (b) `timeZone` prop · (c) leave | (a); Pro finding on `dz.date` | **taken** — no Core change |
| D70 | C9 for controls with no option source: (a) reviewed `n-a` · (b) build sources · (c) keep `future` | (a) | **taken** (reversible in `assessments.ts`) |
| D71 | DzMention resolver: (a) adapter over seam · (b) + deprecate · (c) remove | (a) now, (b) later | (a) **taken**; (b) open |
| D72 | done_check fragility (glob works by depth accident; mention count ≠ state walk) | amend | open |

## 6. Findings outside scope (reported, not fixed)

- `DzMention`'s `loading` prop (from `BaseFormControlProps`) was always dead — the template's `loading` bound the private ref. Still unused; wiring it is a behaviour change.
- Six of the seven seam hosts declare an `options-state` **slot type** that only `DzSelect` renders.
- Storybook browser lane hang (§3) — blocks every `play()` in the repo on this machine, not only these.

## 7. Ranked next packet

1. **Unblock the Storybook browser lane** on this machine (vitest browser tester stalls after runtime load), then run `yarn storybook:test` for the 8 `AsyncOptions` stories + `DzGrid SpanningItems` to reach browser-qualified.
2. **Pro follow-up**: adopt `DzGridItem` in `DzFormGridLayout.vue` (delete `FORM_GRID_SPANS`), add a `dz.time` codec (D69).
3. **Execute D68** as its own tooling packet (schema 1.2.0, classifier, consumers, regenerate; unclassified 29 → 0).
4. **TASK-R1-O1**: regenerate `capability-matrix.json` against `a01965f` (115 rows move) and resolve the DzFileUpload tier-d cell, which turns link 18 green.
5. Amend TASK-R3-O3 `<done_check>` per D72.
