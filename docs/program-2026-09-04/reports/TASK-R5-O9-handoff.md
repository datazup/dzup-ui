# TASK-R5-O9 — Toolchain migrations execution and watch-list probes

> **ALL THREE PHASES RUN.** **Phase 1** (2026-09-17) — discovery, baseline, probes
> and the plan; no migration attempted, no dependency changed. **Phase 2**
> (2026-09-18, §7) — Vitest 3.2.6 → 4.1.11 executed in full, put through the whole
> ladder, then **refused and reverted byte-identically**, blocked on one owner
> decision (**D91**). **Phase 3** (2026-09-18, §8) — the memo's Track B: **tsdown
> refused** with a dated measurement (§8a) and **Vite 8 blocked behind D91** (§8b);
> **no dependency was changed at all**. The task's exact remaining state is §12.4:
> **`[!]` — complete except for D91.**
>
> *Read §12.4 first if you are deciding what to do next; §8c if you are deciding
> whether to trust the refusal; §7.1 if you are re-executing it.*
>
> **Bound to:** `ui/dzup-ui` `main` @ `569d887` **plus the uncommitted work of
> several other packets** (`git status --short` **280** lines at start). Every
> number below was measured in this session on 2026-09-17 between **17:26 UTC**
> and the times in §4; none of it is copied from an older report.
>
> **Machine:** Windows 11, Node **v24.14.1**, yarn **4.16.0**, 16 CPUs. The
> repository's declared floor is `^20.19.0 || >=22.13.0` (ADR-18); nothing here
> was run at the floor, so every result is *locally qualified on Node 24*, never
> CI evidence and never floor evidence.

---

## 1. `<done_check>` — run as written, then corrected

Run from `ui/dzup-ui`. **Result: 0 of 4 genuinely pass, and 2 of the 4 pass
*falsely* as written.** The task ran in full.

| # | Check as written | Raw result | Verdict |
|---|---|---|---|
| 1 | `grep -n "browser" vitest.config.* packages/core/vitest.config.* 2>/dev/null \| head -1` | prints `vitest.config.ts:144: *     in a real browser instead.` — a **comment** inside the coverage-ratchet prose, and `packages/core/vitest.config.*` **does not exist** (grep exits 2 for it, the pipe hides that) | **FALSE PASS.** No browser mode is configured in either file. The only browser-mode config in the repository is `apps/storybook/vitest.config.ts` (§3) |
| 2 | `grep -rn "tsdown\|\"vite\": \"^8" package.json packages/*/package.json \| head -1` | no output; `grep` exit **1**, `head` exit **0** | fails honestly (no match) but the pipe would report success to any caller reading `$?` |
| 3 | `ls .changeset/*toolchain* .changeset/*vitest* .changeset/*tsdown* 2>/dev/null \| head -1` | no output; `ls` exit **2**, pipe exit **0** | fails honestly; same pipe hazard. 31 changesets exist, none toolchain-related |
| 4 | `grep -n "addon-mcp\|context7" docs/program-2026-09-04/reports/TASK-R5-O9-handoff.md` | file did not exist, exit 2 | fails; **this document** satisfies it from now on (§5, §6) |

**Corrected checks** (for the ledger and for phases 2–3; each is exit-code
honest and reads a real path):

```bash
grep -n "browser" vitest.config.ts apps/storybook/vitest.config.ts; echo "exit $?"
grep -rn "tsdown\|\"vite\": \"\^8" package.json packages/*/package.json apps/*/package.json; echo "exit $?"
ls .changeset/ | grep -E "toolchain|vitest|tsdown|vite"; echo "exit $?"
grep -c "addon-mcp\|context7" docs/program-2026-09-04/reports/TASK-R5-O9-handoff.md; echo "exit $?"
```

This is the **D42 / D57 / D66 / D72 / D77 pattern for the sixth time** — a
`<done_check>` that names a path that does not exist and reads its result
through `| head`. Recorded as **D86**.

---

## 2. The migration memo, re-read — and what is stale in it

Memo: [`../../program-2026-09/reports/N5-03-toolchain-migration-memo.md`](../../program-2026-09/reports/N5-03-toolchain-migration-memo.md)
(the path in the task prompt is correct; the file is 377 lines, written
2026-09-03, explicitly "scheduled, not executed").

**What it says, in one line per track:** A = Vitest 3.2.6 → 5.x + browser mode,
blocked on `@storybook/addon-vitest`; B = Vite 7 → 8 and/or tsdown, blocked on A,
tsdown only on the five `tsc`-built packages and never on `core` first; C = the
Nuxt floor (`[!owner]`); D = Vue 3.6 lane (advisory); E = the `vue-component-meta`
pin (event-driven, never for currency); F = the docs-site size ceiling
(`[!owner]`, TASK-R1-O5's lane). Ordering: F, C, E cheap and available; A then B
expensive and blocked. Invariants the memo asks to hold: the coverage ratchet
must be **re-measured in the same change** (its HIGH risk), the unit suite must
**not** be re-platformed into browser mode, and the exact `resolutions` pin must
move all three `@vitest/*` packages together or not at all.

**Nothing in the memo has been executed since it was written** — measured, not
assumed: `vitest` is still `3.2.6` (exact, in `resolutions`), `vite` is still
`7.3.5`, `tsdown` is absent from `yarn.lock` and from every `package.json`.

### 2a. Staleness found (registry read 2026-09-17, `yarn npm info`)

| Fact in the memo (2026-09-03) | Today (2026-09-17) | Consequence |
|---|---|---|
| `vitest` latest **5.0.0**, 4.x "over" at 4.1.11 | latest **5.0.1**, `V4` tag **4.1.11**, `V3` tag **3.2.7** | — |
| Track A is written **against 5.x** | **`vitest@5` declares `engines.node ^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0`** | **Vitest 5 is not executable under ADR-18.** `validate:engines` compares each gate dependency's lowest admitted Node against the declared floor `20.19.0` and fails — and the task's own `<scope>` forbids a Node floor change. The memo never priced this, because it priced a Storybook blocker instead |
| "Storybook is the constraint… addon-vitest 10.5.1 declares which Vitest majors it supports" | `@storybook/addon-vitest@10.5.1` peers: **`vitest: ^3.0.0 \|\| ^4.0.0`**, `@vitest/browser: ^3 \|\| ^4`, `@vitest/browser-playwright: ^4` | **For Vitest 4 the blocker does not exist** — the installed Storybook already supports it. 10.6.0 has the *same* peer range, so Vitest 5 is blocked by Storybook **as well as** by the Node floor |
| `tsdown` latest 0.22.14, "adoption, not upgrade" | latest **0.23.0**; **0.22.0 and later declare `engines.node ^22.18.0 \|\| >=24.x`** | The newest ADR-18-compatible tsdown is **0.21.10** (2026-04-22, `>=20.19.0`), which pins `rolldown@1.0.0-rc.17` and `rolldown-plugin-dts@^0.23.2` (peer `vue-tsc ~3.2.0`; this repo runs vue-tsc **3.3.3**). Adopting tsdown today means adopting a five-month-old 0.x release of it |
| `vite` latest 8.2.2 | **8.3.0**, `engines.node ^20.19.0 \|\| >=22.12.0`, `dependencies.rolldown ~1.2.6` | Vite 8 itself is **floor-compatible**. It still implies Vitest ≥4 (`vitest@3.2.6` accepts `vite ^5 \|\| ^6 \|\| ^7` only) |
| "**ADR-12 commits `dist/` artifacts**, so a bundler swap rewrites committed bytes" (§3, twice) | **ADR-12 was corrected on 2026-09-04**: generated `dist/` is *published, never committed*; `.gitignore:9` ignores `dist/` and no package's `dist/` is tracked | The memo's biggest stated cost for Track B **no longer exists**. Byte comparison has to be done against a *recorded* hash manifest instead — which is why §4c of this document exists |
| "499 unit and contract test files … run in jsdom 29" | **534 test files / 9,983 tests** in `yarn test`; jsdom **29.1.1** | count only |
| `vue` 3.5.31 / latest 3.5.42 / rc 3.6.0-rc.6 | installed 3.5.31; latest **3.5.43**, rc **3.6.0-rc.8** | Track D unchanged in kind |
| `@playwright/test` 1.61.1 "not in scope" | installed 1.61.1; latest **1.63.0** | unchanged in kind |
| Storybook 10.5.1 | latest **10.6.0** (2026-09-02) | matters for probe P-612 (§5) |

**Not stale and re-confirmed:** the `resolutions` pin is exact and load-bearing;
browser mode exists in exactly one place; `vitest-axe@0.1.0` is still the
smallest-maintained link (peer `vitest >=0.16.0`); `vue-component-meta` is still
pinned exactly at 3.3.7 while `vue-tsc` floats at `^3` (3.3.3 installed) — the
two sit on `@vue/language-core` **3.3.7 and 3.3.3 respectively**, two copies in
one tree today.

---

## 3. The toolchain as it actually is (read from `node_modules`, not from ranges)

| Package | Declared | Installed | Where it bites |
|---|---|---|---|
| `vitest` / `@vitest/browser` / `@vitest/coverage-v8` | `^3.2.4` + **`resolutions` exact `3.2.6`** | 3.2.6 | every test lane |
| `vite` | `^7` (root, core, compat, tokens, tooling) | **7.3.5** | `yarn build`, root vitest transform, `validate:tree-shake` |
| `vite` (apps) | `^6.1.0` (`apps/storybook`, `apps/landing`, `apps/sandbox`), vitepress 1.6.4 → `vite ^5.4.14` (`apps/docs`) | 6.4.1 / 5.x | **apps are insulated**: `apps/storybook` sets `installConfig.hoistingLimits: "workspaces"`, so it holds its own `vite@6.4.1`, `vitest@3.2.6` and `storybook@10.5.1` |
| `@vitejs/plugin-vue` | `^6` (root, core, tooling), `^5.2.0` (apps) | 6.0.7 / 5.x | SFC transform |
| `vite-plugin-dts` | `^4.5.4` (root, compat, tokens, tooling) | 4.5.4 | `.d.ts` emit for the three vite-built packages |
| `vue` / `vue-tsc` / `typescript` | `^3.5.13` / `^3` / `^5.8.3` | 3.5.31 / 3.3.3 / 5.9.3 | `yarn typecheck` |
| `vue-component-meta` | **`3.3.7` exact** | 3.3.7 | five committed artifacts (memo Track E) |
| `@playwright/test`, `playwright` | `1.61.1` exact | 1.61.1 | the matrix, and the browser provider Vitest 4 would use |
| `jsdom` | `^29.0.2` | 29.1.1 | the unit environment |
| `nuxt` / `@nuxt/kit` | 4.4.5 (dev/fixtures) / 4.5.2 | 4.4.5 / 4.5.2 | Track C, untouched here |
| `tsdown` / `rolldown` | — | **absent** | Track B adoption |

**Vitest configs — the complete set** (`vitest.config.*` anywhere in the repo):

| File | Environment | Notes |
|---|---|---|
| `vitest.config.ts` (root) | **jsdom**, `globals: true`, 2 setup files, 60 s timeouts | single project (no `projects`/`workspace` key), `include` covers `packages/*/{src,tests,scripts,security}` and `apps/*/{src,scripts,.vitepress}`; carries the **coverage thresholds** (packages 80/80/80/80; `apps/landing/src` 89/80/91/91) |
| `apps/storybook/vitest.config.ts` | **browser** — `provider: 'playwright'`, `headless`, `instances: [{ browser: 'chromium' }]`, name `storybook` | **the only browser-mode lane in the repository**; driven by `@storybook/addon-vitest@10.5.1` |
| `packages/mcp/vitest.config.ts`, `packages/testing/vitest.config.ts` | node | package-local |
| `packages/nuxt/test/vitest.config.ts` | node, `fileParallelism: false`, 600 s timeouts | the tarball fixtures |
| `packages/tooling/scripts/vue-next.vitest.config.ts` | merged config for the Vue-3.6 lane | advisory lane |
| `packages/core/vite.config.ts` | sets `config.test = { environment: 'jsdom', … }` on the **build** config | there is **no** `packages/core/vitest.config.*` (the `<done_check>`'s path) |

There is **no SSR or security "lane"** in the config sense: `yarn test:ssr` and
`yarn test:a11y` are path filters over the same root config
(`vitest run --reporter=verbose packages/**/ssr/**/*.spec.ts`), and the security
corpus specs run inside the default `yarn test`.

**Build pipeline** (`yarn build`, in dependency order):

| Package | Builder | Output shape |
|---|---|---|
| `contracts`, `testing`, `mcp`, `codemods`, `nuxt` | **`tsc`** (`tsc -p tsconfig(.build).json`) | file-per-module `.js` + `.d.ts` + both `.map`s, structure preserved; `codemods` also emits its compiled `__tests__/*.spec.js` into `dist/` |
| `core`, `compat` | **`vite build`** via the shared `createLibConfig()` in `packages/tooling/src/vite.ts` (`@vitejs/plugin-vue` + `vite-plugin-dts`, `formats: ['es']`, `preserveModules: true`, `preserveModulesRoot: 'src'`, externals **derived** from the package's own `dependencies` + `peerDependencies`) | 1,450 files for `core` (incl. `dist/core.css` and the `i18n/locales/*.json` assets emitted by a local plugin) |
| `tokens` | `vite build` (own config, `rollupTypes: true`, `emptyOutDir: false`) **then** two `tsx` generators (`generate.ts`, `generate-dtcg.ts`) | 13 files incl. `tokens.css`, `tokens.dtcg.json`, `tokens.high-contrast.css` |
| `tooling` | *(private, no build)* | — |

The four build gates, and what each actually asserts:

- **`validate:dts`** — every `dist/*.js` has a sibling `.d.ts` (SFC runtime chunks excluded), root declaration has an export; 8 packages, **272 `.js` / 862 `.d.ts`** counted at baseline.
- **`validate:externals`** — parses every emitted bare import and fails on anything not declared, and on anything inlined out of `node_modules`; 8 passed, `tooling` skipped.
- **`validate:bundle`** — gzip budgets from `bundlesize.config.json`: `packages/core/dist/index.js` ≤150 kB (7.04 kB), `packages/tokens/dist/tokens.css` ≤15 kB (7.23 kB) and **`packages/core/dist/index.css`, which the build never emits** (the export is `dist/core.css`) — that third entry has been a permanent `SKIP`, so the CSS budget is inert (**F-3**).
- **`validate:tree-shake`** — builds four single-component bundles with `npx vite build` in `.tree-shake-test/` and greps each for the sentinel names `DzDataGrid`/`DzGantt`/`DzKanban`. **Red at baseline** (§4a, **F-2**).
- **`report:component-sizes`** — walks `packages/core/dist`, reports raw+gzip per component (206 components, 1.06 MB raw / 380.84 kB gzip at baseline); `--ci` prints the full JSON (its `generated` field is a timestamp — exclude it when diffing).

---

## 4. Baseline — `569d887` + dirty tree, 2026-09-17

Every command was run to a log file in the scratchpad with `echo $?` read
directly afterwards; **no gate result was read through a pipe**. Logs and
manifests: `…/scratchpad/o9/` (`results.tsv`, `results-validate.tsv`,
`results-e2e.tsv`, `logs/`). The essential hash manifests are copied into
[`./TASK-R5-O9-baseline/`](./TASK-R5-O9-baseline/) so phases 2 and 3 can diff
against them without this scratchpad.

### 4a. Gate table

| Gate | Exit | Result | Duration |
|---|---|---|---|
| `yarn typecheck` | **0** | clean | 19 s |
| `yarn lint` | **0** | clean | 68 s |
| `yarn test` | **1** | **3 failed / 9,975 passed / 4 skipped / 1 todo (9,983) · 534 files · 1 failed snapshot · 0 unhandled errors** | 305 s |
| `yarn build` | **0** | 8 packages | 114 s |
| `yarn validate:dts` | **0** | 272 `.js` / 862 `.d.ts`, 0 errors | 1 s |
| `yarn validate:externals` | **0** | 8 passed, 1 skipped (`tooling`) | 2 s |
| `yarn validate:bundle` | **0** | 2 passed, 1 **skipped** (`core/dist/index.css` does not exist — F-3) | 1 s |
| `yarn validate:tree-shake` | **1** | `DzButton` PASS; **`DzInput`, `DzSelect`, `DzAlert` FAIL** — each bundle contains the sentinel `DzDataGrid` (F-2) | 31 s |
| `yarn report:component-sizes` | **0** | 206 components, **1,110,232 B raw / 389,982 B gzip** | 1 s |
| `yarn test:ssr` | **0** | **129 passed / 1 skipped (130) · 5 files** | 6 s |
| `yarn test:nuxt-fixtures:pack` → `:install` → `yarn test:nuxt-fixtures` | 0 / 0 / **0** | **12 passed / 7 skipped (19) · 1 file**, 349 s; the 7 skips are the `core-pro` fixture (needs `DZUP_PRO_TARBALL`) | 4 s / 268 s / 351 s |
| `yarn test:contracts` | **0** | 1,594 passed / 1 skipped (1,595) · 150 files | 74 s |
| `yarn test:a11y` | **0** | 188 passed (188) · 11 files | 30 s |
| `yarn test:coverage` | **1** | same 3 failures **+ 4 unhandled errors** (3 × `requestAnimationFrame is not defined` from `apps/landing/src/pages/AnimationsPage.v2.spec.ts`, 1 × `[vitest-worker]: Timeout calling "onTaskUpdate"`) and **no coverage report was printed and no `coverage/` directory was produced** — the ratchet is **not measurable in this tree today** (**F-4**) | 363 s |
| `yarn storybook:test` (the browser lane) | **1** | **5 failed / 1,448 passed (1,453) · 169 files**, chromium | 117 s |
| `yarn validate:all` | **1** | **first failing link 19 of 43 — `validate:capability-matrix`** | 166 s |
| every `validate:all` link individually | — | **42 of 43 exit 0; only link 19 is red** | 214 s |
| `yarn test:e2e` (as written) | see §4d | — | — |

**The three `yarn test` failures — all inherited, none new:**

1. `packages/tooling/src/resolution/dzup-resolution.spec.ts > the real repository > covers exactly the specifiers the packages declare` — the **high-contrast snapshot** (`@dzup-ui/tokens/css/high-contrast`, R5-O7's packet).
2. `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts > every fallback matches the value its token resolves to` — 6 landing fallbacks.
3. `packages/tooling/src/validators/story-dod-tiers.spec.ts > countOpen > subtracts a waiver` — `TypeError: Cannot read properties of undefined (reading 'component')`.

That is exactly the inherited set the R5-O3/R3-O4 rows record. **The ~656
`requestAnimationFrame` unhandled errors those rows saw did not occur in the
`yarn test` run** (0) and **did occur in the `test:coverage` run** (4) — the race
is load-dependent, as recorded.

**`yarn storybook:test` ran** — TASK-R3-O3 recorded this lane as unrunnable
("tooling hang"); it is not, and it produced a real result in under two minutes.
Its 5 failures (pre-existing, in other packets' dirty work, **not** this task's):

| Failing story | File |
|---|---|
| `Async Options: loading → ready → error → retry` | `stories/forms/DzCombobox.stories.ts` |
| `Async Options: loading → ready → error → retry` | `stories/forms/DzMultiSelect.stories.ts` |
| `Invalid With Error` | `stories/forms/DzFormField.stories.ts` |
| `Invalid with Error Message` | `stories/forms/DzFormParts.stories.ts` |
| `Translated` | `stories/compositions/i18n/Localisation.stories.ts` |

Two of the five are TASK-R3-O3's new `AsyncOptions` play stories, which that
packet verified **in jsdom only** and recorded as unverified in a browser. In the
browser they fail. Routed to R3-O3's owner, recorded here as **F-5**; a phase-2
or phase-3 agent must compare against **5 failures, not 0**.

### 4b. `validate:all` — 43 links, one red

`yarn validate:all` exit **1**, first failing link **19/43 `validate:capability-matrix`**:

```
! input `browser-matrix` is absent (test-results/matrix-report.json).
22 stale cell(s)
✗ [tier-d] DzFileUpload is Tier D and its `browser-matrix` cell is unrun with no artifact
✗ [freshness] packages/core/docs/capability-matrix.json is stale.
```

Identical in reason to the known-red the ledger attributes to commit `a01965f`
(12 + 10 flipped cells). **Every other link was then run individually and every
one exits 0** — links 1–18 and 20–43, including `validate:engines` (link 35),
which is the gate any Node-floor-moving upgrade would trip.

### 4c. Byte-comparison baseline for the build

- `docs/program-2026-09-04/reports/TASK-R5-O9-baseline/dist-files.tsv` — **1,629 rows**: `package · path · bytes · sha256`, one per file in every `packages/*/dist`.
- `…/dist-summary.tsv` — per package: file count, total bytes, **`listSha256`** (identity of the file *list*) and **`contentSha256`** (identity of the *contents*):

| package | files | bytes | contentSha256 (first 16) |
|---|---|---|---|
| codemods | 51 | 227,043 | `0e964fe9d6316556` |
| compat | 38 | 47,041 | `20a6ac9d1c8a090e` |
| contracts | 45 | 180,075 | `38dc322d91856048` |
| core | 1,450 | 3,278,295 | `e24cd9d03c3e4966` |
| mcp | 12 | 119,546 | `4687e4a17275eb9c` |
| nuxt | 3 | 16,683 | `6d4693cf763da080` |
| testing | 21 | 162,278 | `9ccc5e233e7a3deb` |
| tokens | 13 | 448,814 | `94217ea5ae843114` |

- **The build is deterministic on this tree**: `yarn build` was run **twice** and the two manifests `diff` **exit 0** — 1,629 files, byte-identical. A byte difference after a migration is therefore signal, not noise.
- `…/component-sizes.txt` and `…/component-sizes.json` — the size report (drop the `generated` key when diffing the JSON).
- `…/nuxt-tarballs.sha256` — sha256 of the four `yarn pack` tarballs the fixtures installed.
- `…/toolchain-files.sha256` — every config a migration may touch, hashed, **plus `node_modules/.yarn-state.yml`**, so a phase can prove what it changed and what it restored.
- `…/perf-harness.sha256` — **the memo names no perf-harness config hash and none exists in the repository** (`packages/core/perf/baselines.json` records `schemaVersion`, a `policy` block, `sourceCommit 4c9fb7a` and a `host` block, but no config hash). The stop condition "alters the perf harness's config hash" is therefore given a concrete meaning here: the sha256 set of `packages/tooling/src/perf-bench.spec.ts`, `packages/tooling/src/perf/*.ts`, `packages/core/perf/baselines.json`, `vitest.config.ts`, `vitest.setup.ts`, `vitest.setup.a11y.ts` — **these files must be byte-identical before and after a migration** (**D90**). Note that the perf harness *runs vitest in child processes* (`node_modules/vitest/vitest.mjs`), so a Vitest major changes its measurements even when its files do not: `yarn perf:capture` is an **owner** action and must not be run by a migration.
- `…/hash-dist.mjs` — the script that produced the manifests. Phases 2/3 run **exactly this script** (`node docs/program-2026-09-04/reports/TASK-R5-O9-baseline/hash-dist.mjs <outDir>`) and `diff` the two `.tsv` files.

### 4d. The Playwright matrix

*Filled in by phase 2 from the phase-1 run's own artefacts — `results-e2e.tsv`,
`logs/e2e.log` and the 4.9 MB `e2e-report.json` left in the phase-1 scratchpad
(`…/83c571e5…/scratchpad/o9/`). These are phase-1 measurements, taken
2026-09-17 18:25–19:24 UTC; phase 2 did not re-time them.*

**`yarn test:e2e` as written cannot run on this machine** (F-6): Playwright's
default `webServer` is `yarn storybook --no-open`, whose entry guard never
matches on Windows, so the config reports *"Process from config.webServer exited
early"* and the run dies in 3 s. The runnable form is the static one the repo's
own `test:e2e:*` scripts use:

```bash
yarn workspace @dzup-ui/tokens build && yarn storybook:build
STORYBOOK_E2E_STATIC=1 STORYBOOK_E2E_PREBUILT=1 node node_modules/@playwright/test/cli.js test
```

**Baseline: exit 1 — 46 failed / 3,627 passed / 134 skipped (3,807 tests) across
21 projects / 15 files, 58.8 min.** Note *21*, not the 18 the task prompt and the
program README say: the three functional engine projects (`chromium`, `firefox`,
`webkit`) plus the 3 engines × 6 conditions matrix — `default`, `forced-colors`,
`reduced-motion`, `rtl`, `touch`, `zoom-400`. The README's "18 Playwright
projects: 3 engines × 6 conditions" counts the matrix only.

| Project | passed | failed | skipped |
|---|---|---|---|
| `chromium` | 157 | **36** | 0 |
| `firefox` | 132 | **3** | 58 |
| `webkit` | 129 | **6** | 58 |
| `matrix-chromium-forced-colors` | 175 | **1** | 1 |
| `matrix-chromium-{default,rtl,touch,zoom-400}` | 176 each | 0 | 1 each |
| `matrix-chromium-reduced-motion` | 190 | 0 | 1 |
| `matrix-firefox-*` (6) | 176 ×5, 190 (reduced-motion) | 0 | 1 each |
| `matrix-webkit-*` (6) | 176 ×5, 190 (reduced-motion) | 0 | 1 each |

**30 of chromium's 36 failures are the visual lane** — `e2e/visual/gallery.spec.ts`
(16) and `e2e/visual/theme-recipe-matrix.spec.ts` (14) — and they are structural,
not flaky: those screens only exist in a `DZUP_GALLERY=1` Storybook build, and the
plain `yarn storybook:build` above does not produce one (`test:e2e:visual` is the
script that does). The remaining 16 are `anatomy-parts` (`DzSpeedDial` + the
nested-scope assertion, on all three engines), `DzTabs` keyboard navigation on
webkit (4), a firefox `DzInput` Tab-focus assertion, and one
`matrix-chromium-forced-colors` `DzPagination` cell. **All pre-existing and none
of them this task's.**

**A phase comparing against this must compare against 46 failures, not 0** — and
should treat the 30 visual ones as an artefact of the build flavour rather than
as component failures.

### 4e. What a baseline run does *not* cover

`yarn test:e2e:visual` (the visual lane) and `yarn test:e2e:layer-order` (its own
config, no web server) were not run; `yarn perf:capture` was not run (owner
action); nothing was run at the Node floor; nothing was run in CI.

---

## 5. Probe P-612 — Storybook `addon-mcp` Vue parity

**Method.** Registry read first (`yarn npm info`, never `npx`):
`@storybook/addon-mcp` exists, `latest` is **10.6.0** (peers `storybook ^10.6.0`,
`@storybook/addon-vitest ^10.6.0` — that version **would** require a Storybook
upgrade), but **0.7.0** (2026-07-10) peers
`storybook ^…|| ^10.5.0-0` and `@storybook/addon-vitest ^…|| ^10.5.0-0`, so it
installs against the repository's Storybook **10.5.1 with no upgrade**. 0.7.0 was
therefore the version probed.

`package.json`, `yarn.lock`, `apps/storybook/package.json`,
`apps/storybook/.storybook/{main,preview}.ts` and `node_modules/.yarn-state.yml`
were copied to the scratchpad and hashed; then
`yarn workspace @dzup-ui/storybook add -D @storybook/addon-mcp@0.7.0`
(14 packages, +4.59 MiB, **exit 0**, no blocking peer error — `apps/storybook`
hoists to itself, so nothing landed in the root `node_modules`);
`'@storybook/addon-mcp'` was added to `main.ts`'s `addons` with
`features: { componentsManifest: true, experimentalDocgenServer: true }`.

**What was measured** (`storybook dev -p 6026`, MCP over streamable HTTP at
`/mcp`; raw responses in `…/scratchpad/o9/mcp-probe/`):

| Question | Result |
|---|---|
| Does it start on Vue / Storybook 10.5.1? | **Yes.** `Experimental components manifest feature detected - registering component tools` |
| Tools exposed | **8**: `preview-stories`, `get-storybook-story-instructions`, `get-changed-stories`, `get-stories-by-component`, `run-story-tests` (dev + testing toolsets) and `list-all-documentation`, `get-documentation`, `get-documentation-for-story` (docs toolset) |
| `list-all-documentation` | **works** — 169 entries, every Storybook id present (`core-buttons-dzbutton`, `core-forms-dzselect`, `core-overlays-dzdialog`, …) |
| `get-documentation` for the three components | **empty**: the entire answer is `# core-buttons-dzbutton\n\nID: core-buttons-dzbutton` (50/46/52 characters). No props, no events, no slots, no stories, no snippets, no description |
| `get-documentation-for-story {componentId, storyName: "Default"}` | `isError: true` — *"Story "Default" not found for component "core-buttons-dzbutton". Available stories: none"* |
| Without `experimentalDocgenServer` (re-run on port 6027) | the docs tools are **not registered at all**: *"Tool get-documentation not found"* |
| Built Storybook (`storybook build -o <scratch>`, exit 0) | `manifests/components.json` = **169 entries of `{id, name}` and nothing else**; `manifests/docs.json` does carry MDX summaries (that is addon-docs' MDX, not component API) |
| `get-stories-by-component` (dev toolset) with three real absolute `.vue` paths | **works well** — 631 stories across 74 components, distance-ranked (d1 346 / d2 81 / d3 204), with real `storyId`s and file paths |

**Parity against `@dzup-ui/mcp` 0.2.0** (built `dist/`, driven over stdio with
`DZUP_UI_REGISTRY_URL=<repo>`; 12 tools, `serverInfo.name = dzup-ui`):

| Component | `@dzup-ui/mcp` `get_component_metadata` | `get_component` | `get_component_example` | addon-mcp `get-documentation` |
|---|---|---|---|---|
| DzButton | **2,969 chars, 16 prop rows** + events/slots tables, anatomy parts, evidence cells | 2,861 chars / 16 rows | 749 chars — verbatim story source, file + line range | **50 chars, 0 rows** |
| DzSelect | **6,500 chars, 41 rows** | 6,182 / 41 | 663 chars | **46 chars, 0 rows** |
| DzDialog | **1,695 chars, 7 rows** | 2,263 / 7 | 2,111 chars | **52 chars, 0 rows** |

**Gaps, stated as facts:** addon-mcp's docs toolset answers **nothing** about a
Vue component's API on this Storybook version — the components manifest that
backs it is generated with ids and names only. Everything `@dzup-ui/mcp`
publishes (typed prop tables with declared-vs-effective defaults,
`descriptionSource`, ADR-19 anatomy parts, risk tier and evidence cells,
verbatim story source) has **no counterpart at all**. Conversely, addon-mcp
offers three things `@dzup-ui/mcp` does not: story↔component mapping with live
`storyId`s, preview URLs, and running story tests from the agent — all
framework-agnostic and all working here.

**Verdict: WATCH — not a task, and not a refusal.**
Recommendation: keep `@dzup-ui/mcp` as the component-API surface; re-probe
`addon-mcp` when the repository moves to **Storybook ≥ 10.6** (whose release
notes claim Vue manifest work: `apiDescription`, a raised `vue-component-meta`
floor, story-snippet generation) — that upgrade is its own packet and is **not**
in this task's scope. Do not adopt the addon for documentation; if the dev/test
toolset is ever wanted for agent-driven story authoring, that is a separate,
smaller question (**D88**).

**Restoration — verified, not asserted.** All five backed-up files were copied
back and `yarn install` re-run; then, byte for byte:

| Check | Result |
|---|---|
| sha256 of `package.json`, `yarn.lock`, `apps/storybook/package.json`, `.storybook/main.ts`, `.storybook/preview.ts`, `node_modules/.yarn-state.yml` | **identical to before the probe** (`diff` exit 0) |
| `ls -1A apps/storybook/node_modules` and `…/@storybook` | **identical** (`addon-mcp` and `mcp` gone) |
| `ls -1A node_modules` and root `@storybook` scope | **identical** |
| `git diff HEAD \| sha256sum` and `git status --porcelain -uall` | **identical** |

The probe's Storybook build went to the scratchpad, never to
`apps/storybook/storybook-static`. Both probe dev servers were killed (ports
6026/6027 free; the only surviving node processes are the ones that predate this
session).

---

## 6. Probe P-613 — Context7 opt-in / `context7.json`

**Method.** Repository search (`rg`, no `node_modules`) for `context7`; the
documented schema fetched read-only from Context7's own endpoints; the docs-site
build output inspected for per-page `.md` endpoints. **Nothing was submitted to
any index; nothing was published; no account, key or GitHub Action was created.**

**Findings.**

1. **`context7.json` does not exist anywhere in the repository.** The only
   mentions are prose in `docs/program-2026-09/` — TASK-N2-A3's evaluation
   (`N2-A3-llms-gate-handoff.md` §15), which ends in an `[!owner]` line and
   recommends *"yes, sequenced after the docs deploy, with an explicit `folders`
   allowlist and a gated `rules` array"*. That evaluation is still accurate; this
   probe extends it with what has changed.
2. **The documented shape, read today** (`https://context7.com/schema/context7.json`,
   draft-07, `additionalProperties: false`, **no required properties**):
   `$schema`, `projectTitle` (1–100), `description` (10–200), `branch`,
   `folders` (≤50, regex, full paths), `excludeFolders` (≤50), `excludeFiles`
   (≤100, filename only, no path separators), `rules` (≤50 × ≤255 chars),
   **`disallow`** (boolean — opt *out*), **`redirect`**, `previousVersions`
   (≤20; string tag, or `{tag}`/`{branch}`), and the ownership pair **`url` +
   `public_key`**, which the schema binds with `dependencies` (either both or
   neither). **Three of these are newer than the N2-A3 evaluation: `disallow`,
   `redirect`, `url`/`public_key`.** One field that evaluation lists,
   **`branchVersions`, is *not* in the schema** and would be rejected by
   `additionalProperties: false` — the docs page and the schema disagree, and the
   schema is what validates.
3. **Validation:** there is no file to validate. A file written from the
   N2-A3 recommendation would validate **except** for `branchVersions`.
4. **The `.md` endpoint question, measured.** The docs site emits **no per-page
   `.md` endpoints**: `apps/docs/.vitepress/dist` (built 2026-09-15) holds **508
   files, 0 of them `.md`**, 144 `components/*.html`, no `llms.txt`. The
   generated markdown *sources* (`apps/docs/components/*.md`, rendered by
   `renderComponentSection()`) exist in the repository but are VitePress inputs,
   not served endpoints. The seam N2-A3 §14 specified
   (`renderComponentSection` → `/r/components/<Name>.md`) is **still unused**:
   the only per-page markdown that ships is the landing site's **87 block pages**
   (`apps/landing/public/r/<id>.md`, advertised by `apps/landing/public/llms.txt`).
   So today Context7 would have `llms.txt` + `llms-full.txt` (two of them, on two
   surfaces) and the repository's markdown — not a per-component endpoint set.
5. **Two facts that change the risk since N2-A3.** (a) **`github.com/datazup/dzup-ui`
   is public** (`api.github.com` → `"private": false`, default branch `main`,
   pushed 2026-09-17), so **anyone** — not only the owner — can submit this
   repository at `context7.com/add-library`, and an unconfigured crawl would index
   `CHANGELOG.md`, `FEATURESLOG.md`, `docs/adr/` and this program's own handoffs
   as if they were user documentation. `context7.json` with `folders` +
   `excludeFolders`, **or** the new `disallow: true`, is the only control over
   that, and both are cheap. (b) `https://context7.com/datazup/dzup-ui` returns
   **404** — the library is **not currently indexed**.
6. Context7 can also ingest a **URL to an `llms.txt`** (`/api/v2/add/llmstxt`) or
   a website; the dzup surfaces are not deployed (`dzup-ui.com` is NXDOMAIN,
   confirmed against `8.8.8.8`), so a repository submission is the only shape
   available today.

**Verdict: WATCH, with one small task available now** (**D89**).
Recommendation, in order: (i) **do not submit** — N2-A3's sequencing (deploy
first) still holds and nothing about it has improved; (ii) consider landing a
`context7.json` **anyway**, before any submission, precisely because the repo is
public and a third party can submit it: either the defensive
`{"$schema": …, "disallow": true}` (two lines, reversible) or the full
`folders`/`excludeFolders`/`rules` file N2-A3 drafted — that is an **owner
decision**, not an agent one, and it is the only part of this probe that is
actionable today; (iii) when the docs site deploys (TASK-R1-O5), emit the
per-page `.md` endpoints through the existing seam **and** gate the `rules`
array against the curated `CONVENTIONS` source, as N2-A3 recommends.

---

## 7. Phase 2 — Vitest 3.2.6 → 4.1.11: EXECUTED IN FULL, THEN REFUSED AND REVERTED

> **Executed 2026-09-18, 09:30–11:35 UTC, on the same tree phase 1 closed on
> (`569d887` + the same dirty work; phase-1 END diff hash `a8ec0f7b…` = phase-2
> START diff hash).** The migration was applied in full — all seven manifests,
> `yarn.lock`, the browser-provider factory — and put through the entire ladder.
> **Sixteen of seventeen gates came back identical to the baseline**, including
> hard byte equality of all 1,629 `dist/` files and of the four published
> tarballs. **One gate came back worse, and it is the one the memo named as
> Track A's HIGH risk: the coverage ratchet.** Vitest 4 changes what the v8
> provider counts, four committed thresholds fail, and the only repair is to
> re-baseline them — an owner act this task's `<scope>` and the phase-2 brief
> both forbid. **The migration was therefore reverted byte-identically** (§7.8)
> and is recorded as a refusal *pending one owner decision* (**D91**), not as a
> defect in Vitest 4.
>
> **This is not "Vitest 4 does not work here."** It does: 9,975 unit tests,
> 1,594 contract tests, 188 axe assertions and 1,448 browser stories all pass
> exactly as they did on 3.2.6, 20–60 % faster, and the build output does not
> move a byte. The blocker is a number in `vitest.config.ts` that only the owner
> may change.

### 7.1 What was changed (the complete diff)

| File | Change |
|---|---|
| `package.json` | devDeps `vitest`, `@vitest/browser`, `@vitest/coverage-v8` `^3.2.4` → `^4.1.11`; `resolutions` `3.2.6` → `4.1.11` for all three **and a fourth entry `"@vitest/browser-playwright": "4.1.11"`**, so the pin still moves as one unit |
| `apps/storybook/package.json` | `vitest`, `@vitest/browser`, `@vitest/coverage-v8` `^3.2.6` → `^4.1.11`; **new** `"@vitest/browser-playwright": "^4.1.11"` |
| `apps/landing/package.json`, `packages/{mcp,testing,tooling}/package.json` | `vitest` `^3.2.4` → `^4.1.11` |
| `yarn.lock` | `yarn install` — **exit 0**, +24 packages / +38.18 MiB, 22 removed; no blocking peer error (every unmet peer is `optional: true`) |
| `apps/storybook/vitest.config.ts` | `provider: 'playwright'` → `provider: playwright()` from a new `import { playwright } from '@vitest/browser-playwright'`, with a comment saying why. **One line of behaviour, plus the import.** This is the whole of "Vitest 4 browser mode" under **D84** — the 534-file jsdom suite was not touched |

`node_modules/.yarn-state.yml` moved as a consequence. **No other file in the
repository was modified at any point**, and the perf-harness set that D90 defines
(`TASK-R5-O9-baseline/perf-harness.sha256`, 11 files) verified byte-identical at
start *and* at end.

**Installed after the bump** — one runner version per workspace root, as §7's
stop conditions required:

```
node_modules/vitest 4.1.11                      apps/storybook/node_modules/vitest 4.1.11
node_modules/@vitest/browser 4.1.11             apps/storybook/node_modules/@vitest/browser 4.1.11
node_modules/@vitest/coverage-v8 4.1.11         apps/storybook/node_modules/@vitest/coverage-v8 4.1.11
                                                apps/storybook/node_modules/@vitest/browser-playwright 4.1.11
```

`storybook@10.5.1`'s own bundled `@vitest/expect`/`@vitest/spy` 3.2.4 stayed, as
predicted, and caused nothing.

### 7.2 The ladder — every gate, before and after

Every command was run to a log file with `echo $?` read directly afterwards. **No
gate result was read through a pipe.** Logs, result TSVs, both coverage summaries
and the after-manifest are in `…/4e243631…/scratchpad/o9p2/`.

| Gate | Baseline (§4a, Vitest 3.2.6) | Phase 2 (Vitest 4.1.11) | Verdict |
|---|---|---|---|
| `yarn typecheck` | 0, clean, 19 s | **0**, clean, 20 s | same |
| `yarn lint` | 0, clean, 68 s | **0**, clean, 114 s | same |
| `yarn test` | 1 — **3 failed / 9,975 passed / 4 skipped / 1 todo (9,983)**, 534 files, 1 failed snapshot, 0 unhandled errors, 305 s | 1 — **3 / 9,975 / 4 / 1 (9,983)**, 534 files, 1 failed snapshot, 0 unhandled errors, **241 s** | **identical**, and the three are *the same three* (§7.3) |
| `yarn test:ssr` | 0 — 129 passed / 1 skipped (130), 5 files | **0 — 129 / 1 (130), 5 files** | same |
| `yarn test:contracts` | 0 — 1,594 / 1 (1,595), 150 files, 74 s | **0 — 1,594 / 1 (1,595), 150 files**, 57 s | same |
| `yarn test:a11y` | 0 — 188 (188), 11 files, 30 s | **0 — 188 (188), 11 files**, 12 s | same — **`vitest-axe@0.1.0` survives** (§7.3) |
| `yarn storybook:test` (browser lane) | 1 — **5 failed / 1,448 passed (1,453)**, 169 files, 117 s | 1 — **5 / 1,448 (1,453)**, 169 files, **102 s** | same, and *the same five stories* |
| `yarn build` | 0, 8 packages, 114 s | **0**, 8 packages, 124 s | same |
| **dist hash manifest** (D87's instrument) | 1,629 files, recorded `dist-{files,summary}.tsv` | **1,629 files — `diff` exit 0 on *both* files** | **byte-identical** |
| **`yarn pack` tarballs** | 4 recorded sha256 | **4 × `sha256sum -c` OK** | **byte-identical** |
| `yarn validate:dts` | 0 — 272 `.js` / 862 `.d.ts`, 0 errors | **0 — 272 / 862, 0 errors** | same |
| `yarn validate:externals` | 0 — 8 passed, 1 skipped | **0 — 8 passed, 1 skipped** | same |
| `yarn validate:bundle` | 0 — 2 passed, 1 skipped (F-3) | **0 — 2 passed, 1 skipped** | same |
| `yarn validate:tree-shake` | **1** — DzButton PASS; DzInput/DzSelect/DzAlert FAIL (F-2) | **1** — same three FAIL, same bundle sizes (191.6/202.3/211.8/192.2 KB) | same |
| `yarn report:component-sizes` | 206 components, 1,110,232 B raw / 389,982 B gzip | **206, 1,110,232 B / 389,982 B** — `--ci` JSON **identical** with `generated` dropped | **identical** |
| `test:nuxt-fixtures:pack` → `:install` → run | 0 / 0 / **0** — 12 passed / 7 skipped (19) | 0 / 0 / **0** — **12 / 7 (19)** | same |
| `yarn storybook:build` | 0 (F-7 fires) | **0**, 24.90 MB within the 25 MB budget (F-7 fires identically) | same |
| Playwright static matrix (§4d) | 1 — **46 failed / 3,627 passed / 134 skipped (3,807)**, 21 projects, 58.8 min | 1 — **45 failed / 3,628 passed / 134 skipped (3,807)**, 21 projects, **56.9 min** | **same or better** — **0 new failures**; 20 of 21 projects report an identical status breakdown, and `webkit` goes 6 → 5 because `navigation.spec.ts › DzTabs › ArrowRight skips disabled tabs` passed this time (a known webkit keyboard-timing flake; its three sibling `DzTabs` failures persist) |
| `yarn validate:all` | **1 at link 19/43 `validate:capability-matrix`** (22 stale cells · tier-D `DzFileUpload` · freshness) | **1 at link 19/43 `validate:capability-matrix`** — the same 2 violations, verbatim | same |
| **coverage ratchet** (`yarn test:coverage`) | see **§7.4** | see **§7.4** | **WORSE — this is the refusal** |

### 7.3 The two named break risks: both survived

- **`vitest-axe@0.1.0`** (peer `vitest >=0.16.0`, last published 2022, loaded
  *globally* through `vitest.setup.a11y.ts` so it enters all 534 files, not just
  the a11y ones): **`yarn test:a11y` 188/188 exit 0**, and the 15 files importing
  `axe`/`matchers.js` all passed. It survives because it imports **nothing from
  `vitest`** at runtime — it is a bag of matcher functions and the repo's own
  setup file does the `expect.extend`. The peer range is nominal.
- **`vi.restoreAllMocks()` in 29 files** (Vitest 4 restores manual spies only,
  not automocks): **zero new failures.** The three `yarn test` failures after the
  bump are byte-for-byte the inherited set —
  `dzup-resolution.spec.ts > covers exactly the specifiers the packages declare`
  (high-contrast snapshot, R5-O7), `landing-token-fallbacks.spec.ts > every
  fallback matches the value its token resolves to` (6 fallbacks) and
  `story-dod-tiers.spec.ts > countOpen > subtracts a waiver`
  (`TypeError … reading 'component'`) — with the same messages and the same one
  failed snapshot.

A third risk that phase 1 did not name and that also did not bite:
`@storybook/addon-vitest@10.5.1` is loaded by `storybook build` as well as by the
test lane, and **`yarn storybook:build` exits 0** with the addon peering a Vitest
major it was released before.

### 7.4 The deciding measurement — the coverage ratchet

**First, the gating condition from §7's stop conditions had to be resolved, and
it resolved in favour of measuring.** F-4 recorded that `yarn test:coverage`
"produces no coverage report at all" and blamed the `AnimationsPage` rAF race.
Phase 2 tested that: excluding `AnimationsPage.v2.spec.ts` removed 3 of the 4
unhandled errors **and still produced no report**. The real cause is in Vitest
itself (`node_modules/vitest/dist/chunks/cli-api.*.js`):

```js
async reportCoverage(coverage, allTestsRun) {
  if (this.state.getCountOfFailedTests() > 0) {
    await this.coverageProvider?.onTestFailure?.()
    if (!this.config.coverage.reportOnFailure) return   // ← no report, no thresholds
  }
  …
}
```

`coverage.reportOnFailure` defaults to **`false`** and the root
`vitest.config.ts` never sets it, so **any failing test suppresses the entire
coverage report *and* the threshold check.** That is **F-8**, and it means the
ratchet has been silently unenforced on this tree for as long as the three
inherited failures have existed — not merely unreported.

Passing `--coverage.reportOnFailure=true` on the command line (no file changed,
no threshold touched, report written to the scratchpad) makes the lane produce a
full report on the **unchanged** tree. **So option (a) of the gating condition
was taken: the ratchet was measured before the migration and re-measured after
it with the identical command.**

**Before — Vitest 3.2.6, unchanged tree** (exit 1 from the 3 failures; **zero
threshold errors**):

| glob | statements | branches | functions | lines | threshold (s/b/f/l) |
|---|---|---|---|---|---|
| `packages/*/src/**` (647 files) | 87.10 % (52,120/59,840) | 84.66 % (11,753/13,882) | 87.33 % (1,806/2,068) | 87.10 % (52,120/59,840) | 80 / 80 / 80 / 80 — **all pass** |
| `apps/landing/src/**` (391 files) | 94.21 % (29,118/30,906) | 91.12 % (5,612/6,159) | 82.46 % (1,678/2,035) | 94.21 % (29,118/30,906) | 91 / 89 / 80 / 91 — **all pass** |
| total | 89.52 % (81,238/90,746) | 86.64 % (17,365/20,041) | 84.91 % (3,484/4,103) | 89.52 % (81,238/90,746) | — |

**After — Vitest 4.1.11, identical tree, identical command, identical 1,038
files, identical 9,975 passing tests:**

| glob | statements | branches | functions | lines | threshold |
|---|---|---|---|---|---|
| `packages/*/src/**` (647 files) | 83.04 % (17,859/21,506) | **76.62 %** (11,231/14,659) | 86.83 % (4,396/5,063) | 82.50 % (16,530/20,036) | 80 / **80 ✗** / 80 / 80 |
| `apps/landing/src/**` (391 files) | **84.33 %** (10,813/12,822) | **78.71 %** (6,526/8,291) | 84.05 % (5,002/5,951) | **84.06 %** (9,983/11,876) | **91 ✗** / **89 ✗** / 80 / **91 ✗** |
| total | 83.52 % (28,672/34,328) | 77.37 % (17,757/22,950) | 85.32 % (9,398/11,014) | 83.08 % (26,513/31,912) | — |

```
ERROR: Coverage for branches (76.61%) does not meet "packages/*/src/**" threshold (80%)
ERROR: Coverage for lines (84.06%) does not meet "apps/landing/src/**" threshold (91%)
ERROR: Coverage for statements (84.33%) does not meet "apps/landing/src/**" threshold (91%)
ERROR: Coverage for branches (78.71%) does not meet "apps/landing/src/**" threshold (89%)
```

**Why, precisely — and why it is not a testing regression.** The *denominators*
moved, not the testing:

| | statements total | lines total | branches total | functions total |
|---|---|---|---|---|
| Vitest 3.2.6 | 90,746 | 90,746 | 20,041 | 4,103 |
| Vitest 4.1.11 | **34,328** | **31,912** | **22,950** | **11,014** |

Under 3.2.6 `statements === lines` **exactly**, on both the covered and the total
side — the signature of v8 counting the *compiled* output a line at a time. Under
4.1.11 they differ, because **Vitest 4 makes AST-aware remapping of v8 ranges
unconditional**: coverage is mapped back onto real source AST nodes. Per file:

| file | Vitest 3.2.6 | Vitest 4.1.11 |
|---|---|---|
| `utilities/cn.ts` | 100 % (5/5 statements, 5/5 lines) | 100 % (**1/1** statements, **1/1** lines) |
| `buttons/DzButton.vue` | 100 % (131/131 st, 3/3 fn) | 100 % (**46/46** st, **14/14** fn) |
| `forms/DzSelect.vue` | 94.03 % st · 92.50 % br · 85.71 % fn | **90.29 %** st · **88.50 %** br · **91.66 %** fn |

A fully covered file keeps its 100 % under either basis; a **partially** covered
file re-weights, and the repository has many. Across the 1,038 files: **361 get a
worse line-%, 47 better, 630 unchanged.** The aggregate lands below four
committed thresholds.

**And there is no way to make the two comparable.** `experimentalAstAwareRemapping`
— the Vitest 3 opt-in — **no longer exists in Vitest 4**; grepping the installed
`vitest@4.1.11` and `@vitest/coverage-v8@4.1.11` for it returns nothing (only
`excludeAfterRemap` and `ignoreClassMethods` remain). The new basis is
mandatory. *(Phase 1's grep list recorded `experimentalAstAwareRemapping: 0
occurrences` and read it as "nothing to migrate". A zero-occurrence grep proves
the repository does not **use** an option; it says nothing about that option's
default changing or the option being removed. **D94**.)*

**Why this forces a refusal rather than a note.** The four numbers are a
**ratchet**, and `vitest.config.ts` says so in its own comment: *"Raise each
number as that work lands; never lower one to make a build pass."* Restoring the
gate means lowering four of them against a measurement basis that did not exist
when they were set — which is precisely "re-baseline a threshold", an **owner
act** excluded from this task.

**What D91 actually asks the owner to sign, stated plainly.** Applying
`vitest.config.ts`'s own rule — *"measure with CI's own command, take the LOWEST
reading, and leave a point of margin"*, i.e. `floor(min observed) − 1` — to the
"after" table gives:

| glob · metric | bar today | would become | movement |
|---|---|---|---|
| `packages/*/src/**` statements | 80 | 82 | still clears — **no change needed** |
| `packages/*/src/**` **branches** | 80 | **75** | **−5** |
| `packages/*/src/**` functions | 80 | 85 | still clears — no change needed |
| `packages/*/src/**` lines | 80 | 81 | still clears — no change needed |
| `apps/landing/src/**` **statements** | 91 | **83** | **−8** |
| `apps/landing/src/**` **branches** | 89 | **77** | **−12** |
| `apps/landing/src/**` functions | 80 | 83 | still clears — no change needed |
| `apps/landing/src/**` **lines** | 91 | **83** | **−8** |

So the package bar survives on three of four metrics and the honest edit is **four
numbers**, three of them in the landing ratchet and one of them a 12-point drop.
**Those drops look like a retreat and are not one** — the same tests cover the
same code; only the unit of counting changed, and the new unit is the more
accurate of the two. But the four numbers carry a history (they were raised by
TASK-FREE3-12 after real interaction-sweep work) and a comment forbidding exactly
this edit, so **an agent lowering them silently would be doing the thing the
comment exists to prevent.** Hence D91 and not a quiet fix. A *one*-run reading
is also thin evidence for a ratchet: `vitest.config.ts` warns that these
percentages are not reproducible to the decimal, so the owner should take at
least two Vitest-4 readings before fixing a number.

It would have been possible to call this gate "no worse" on a technicality:
`yarn test:coverage` exits **1 both before and after** (the three inherited
failures), and thanks to **F-8** it prints nothing and checks nothing either way,
so the repository's own script cannot currently see the difference. **That would
be laundering.** The failure is *latent, not absent*: **TASK-R1-O1 is this
programme's first-priority packet and its whole job is to make the tree
truthfully green.** The moment it succeeds, `reportCoverage` stops returning
early, the thresholds are evaluated for the first time in this tree's recent
history, and under Vitest 4 four of them fail immediately — for a reason R1-O1
did not cause and cannot fix without an owner decision. Handing the programme's
critical-path packet a booby-trapped gate is worse than holding a runner that is
two majors old and entirely green.

### 7.4b The measurement is now in the repository (added 2026-09-18, sweep session)

Until this section was written, the **only** surviving record of the phase-2
measurement was the two aggregate rows in §7.4; the per-file
`coverage-summary.json` files sat in a session scratchpad that Windows reaps.
D91 asks the owner to move four ratcheted numbers, so its basis must outlive a
temp directory. Both readings are now committed under
`./TASK-R5-O9-baseline/`:

| File | What it is |
|---|---|
| `coverage-vitest3-before.json` | per-file summary, **Vitest 3.2.6**, 1,038 files |
| `coverage-vitest4-after.json` | per-file summary, **Vitest 4.1.11**, same tree, same command |
| `coverage-vitest3-glob.txt` · `coverage-vitest4-glob.txt` | the two glob aggregates as the run printed them |
| `coverage-file-diff.txt` | the 361 worse / 47 better / 630 unchanged file-level diff |

Re-aggregated from the committed files (this reproduces §7.4's two rows exactly —
`84.66 %` → `76.62 %`, `11,231/14,659` — so the table below is checkable by
anyone, not quoted from a lost run):

| package · `branches` | Vitest 3.2.6 | Vitest 4.1.11 | vs its bar |
|---|---|---|---|
| `packages/tooling` (92 files) | 3,470/4,072 · 85.22 % | **3,318/5,120 · 64.80 %** | −778 branches |
| `packages/codemods` (10) | 210/252 · 83.33 % | **228/366 · 62.30 %** | −65 |
| `packages/compat` (13) | 76/87 · 87.36 % | **82/146 · 56.16 %** | −35 |
| `packages/testing` (6) | 268/318 · 84.28 % | **322/441 · 73.02 %** | −31 |
| `packages/core` (491) | 6,873/8,204 · 83.78 % | 6,544/7,736 · 84.59 % | clears |
| `packages/tokens` (28) | 438/498 · 87.95 % | 373/447 · 83.45 % | clears |
| `packages/mcp` · `nuxt` · `contracts` | 90.57 / 87.10 / 99.19 % | 87.11 / 86.21 / 98.31 % | clears |
| **`packages/*/src/**` total** (647) | **11,753/13,882 · 84.66 %** | **11,231/14,659 · 76.62 %** | **bar 80 → fails** |
| `apps/landing` (391) | 5,612/6,159 · 91.12 % | **6,526/8,291 · 78.71 %** | bar 89 → fails |

**`packages/tooling` alone holds 1,802 of the 3,428 uncovered branches** in the
`packages` glob, so the +497 needed to clear the 80 bar is reachable almost
entirely there. The landing side is not: +853 branches is 48 % of every
uncovered branch left in the app, against a gap `vitest.config.ts:134-144`
documents as jsdom-**unreachable**.

**Why the totals prove this is a basis change, not a coverage regression** — the
denominators moved, and in the direction that says the *old* number was the
artifact:

| | statements total | lines total | branches total | functions total |
|---|---|---|---|---|
| 3.2.6 | 90,746 | 90,746 | 20,041 | 4,103 |
| 4.1.11 | **34,328** | **31,912** | **22,950** | **11,014** |

Under 3.2.6 `statements === lines` **exactly** — the signature of v8 counting
compiled output line-by-line. Vitest 4 makes AST-aware remapping unconditional,
so coverage maps onto real source AST nodes. No test regressed; the new figure
is the more accurate one. The honest reading is that branch coverage in
`packages/*/src/**` was always ≈76.6 %, and the 84.66 % that justified the 80
bar was compiled-output inflation. **D91 is therefore "re-baseline onto a
truthful basis", not "lower the bar to hide a regression"** — which is the
opposite of what `vitest.config.ts:145-146`'s "never lower one to make a build
pass" forbids, and the owner should be told so in those words.

### 7.4c D91's second reading — **executed 2026-09-18, and it settles the question**

D97 rec (a) asked for a second reading before the owner moves four numbers. It
has now been taken, by the cheap route below rather than by re-installing
Vitest 4: **`vitest@3.2.6`, the committed runner, with
`--coverage.experimentalAstAwareRemapping=true`**, no dependency changed, no
file edited, reports written to a scratch directory.

```
node node_modules/vitest/vitest.mjs run --coverage \
  --coverage.reportOnFailure=true \
  --coverage.experimentalAstAwareRemapping=true \
  --coverage.reportsDirectory=<scratch>        # exit 1
```

| `branches` | phase 2 · **Vitest 4.1.11** | this reading · **3.2.6 + remapping** |
|---|---|---|
| `packages/codemods` | 228/366 · 62.30 % | 228/366 · **62.30 %** |
| `packages/compat` | 82/146 · 56.16 % | 82/146 · **56.16 %** |
| `packages/contracts` | 116/118 · 98.31 % | 116/118 · **98.31 %** |
| `packages/testing` | 322/441 · 73.02 % | 322/441 · **73.02 %** |
| `packages/tokens` | 373/447 · 83.45 % | 373/447 · **83.45 %** |
| `packages/mcp` · `nuxt` | 87.11 % · 86.21 % | **87.11 %** · **86.21 %** |
| `packages/core` | 6,544/7,736 · 84.59 % | 6,550/7,736 · 84.67 % |
| `packages/tooling` | 3,318/5,120 · 64.80 % | 3,329/5,133 · 64.85 % |
| **`packages/*/src/**`** | **11,231/14,659 · 76.62 %** | **11,248/14,672 · 76.66 %** |

**Six of ten packages reproduce to the digit; the aggregate differs by 0.04 pp.**
The two that move are the two this session added files to (`tree-shake-sentinel.ts`
+ spec, and its effect on the tooling and core rollups — 648 files vs 647, +13
branches). The run **exited 1**, i.e. the thresholds fail *on the committed
runner* the moment remapping is switched on.

**What this proves, and it is the thing the owner needs:** the coverage drop is
**not caused by Vitest 4**. It is caused by the measurement basis, which
`vitest@3.2.6` can already produce. Upgrading the runner and re-baselining the
ratchet are therefore **independent decisions** — D91 can be taken, and the four
numbers moved, without Vitest 4 anywhere near the tree. Once taken, the Vitest 4
migration is coverage-neutral and becomes a pure agent packet.

*Caveat, stated so nobody over-reads the table:* this run skipped
`yarn test:prepare` (it writes generated files into a tree carrying several
packets' uncommitted work). That does not affect the `packages/*` glob — the
figures above are per-file sums over the same 647 files — but it does move
`apps/landing` (75.23 % here vs 78.71 % in phase 2, on a different denominator:
6,339 vs 8,291 branches), so **the landing row of this reading is not
comparable** and phase 2's remains the record for it. Both readings agree that
the landing bars (89 branches / 91 statements / 91 lines) fail under remapping.

**A route not recorded in phases 1–3:** the Vitest-4 basis can be produced **on
the current runner with no dependency change**, because 3.2.6 still carries the
opt-in switch that 4 removes —
`yarn test:coverage --coverage.reportOnFailure=true --coverage.experimentalAstAwareRemapping=true --coverage.reportsDirectory=<scratch>`
(`@vitest/coverage-v8@3.2.6` `provider.js:2680` takes the `astV8ToIstanbul`
branch when the flag is truthy; the key is absent from `coverageConfigDefaults`,
so this repo never enables it today). Consequence: **the ratchet re-baseline can
be decoupled from the runner upgrade.** The owner can move the four numbers once,
visibly, on 3.2.6 with remapping on; after that Vitest 4 is coverage-neutral and
the migration becomes a pure agent packet. This does not remove D91 — it makes it
answerable without a two-major toolchain move in flight, and it is the cheapest
way to give D91 the second reading D97 rec (a) asks for.

### 7.5 Verdict

**REFUSED on 2026-09-18, pending exactly one owner decision (D91).** Wording for
the ledger:

> *The Vitest 3.2.6 → 4.1.11 migration was executed in full and put through the
> complete ladder on 2026-09-18. Every functional gate returned identical to the
> 2026-09-17 baseline — 9,983 unit tests, 1,595 contract tests, 188 axe
> assertions, 1,453 browser stories, the Nuxt tarball fixtures, all four build
> validators, `validate:all`'s single pre-existing red at link 19/43 — and the
> build output was byte-identical: all 1,629 `dist/` files and all four published
> tarballs matched their recorded hashes. It is refused solely because Vitest 4
> makes v8 AST-aware remapping unconditional, which moves the measured coverage
> basis (statements 90,746 → 34,328; lines 90,746 → 31,912; functions 4,103 →
> 11,014) and drops four committed thresholds below their ratchet —
> `packages/*/src/**` branches 84.66 % → 76.62 % (bar 80) and
> `apps/landing/src/**` statements 94.21 % → 84.33 %, branches 91.12 % → 78.71 %,
> lines 94.21 % → 84.06 % (bars 91/89/91) — with no configuration available to
> restore the old basis. Repairing it means re-baselining four thresholds, an
> owner act. The tree was restored byte-identically.*

### 7.6 What this buys the owner if D91 is taken

Everything except the four numbers is already proven, so taking D91 makes this a
short packet rather than a fresh one:

- **Performance, measured**: `yarn test` 305 s → **241 s** (−21 %),
  `test:contracts` 74 s → **57 s** (−23 %), `test:a11y` 30 s → **12 s** (−60 %),
  `storybook:test` 117 s → **102 s** (−13 %). Only `lint` was slower (68 s → 114 s),
  which is unrelated — ESLint does not load Vitest; it is cold-cache noise.
- **Vite 8 unblocks.** `vitest@3.2.6` accepts `vite ^5 || ^6 || ^7` only;
  `vitest@4.1.11` accepts `^6 || ^7 || ^8`. Phase 3's §8b item **cannot start**
  until this lands (memo B2).
- **The floor holds.** `vitest@4.1.11` declares
  `^20.0.0 || ^22.0.0 || >=24.0.0`; `validate:engines` compares each gate
  dependency's *lowest admitted* Node against the 20.19.0 floor and only
  complains when it is **higher**, so link 35 stays green — re-verified by
  reading the validator, not assumed.
- **The exact change is in §7.1** and is nine lines across eight files.

### 7.7 Two findings new to phase 2

- **F-8 — the coverage ratchet is unenforced whenever any test fails.**
  `coverage.reportOnFailure` defaults to `false`; `Vitest.reportCoverage()`
  returns before the provider runs, so **no report and no threshold check**.
  F-4 described the symptom and misattributed it to the `AnimationsPage` rAF
  race; the race is real but irrelevant here (excluding that spec removes 3 of 4
  unhandled errors and still yields no report). Consequence: the 80/80/80/80 and
  91/89/80/91 bars have not been enforced on this tree at any point while the
  three inherited failures existed. **D92.**
- **F-9 — phase 1's planned *empty* changeset would have turned link 41 red.**
  `validate:release-policy` rule **R7** fails any changeset whose front-matter
  names no package (*"An empty changeset produces no changelog entry and no bump;
  it is almost always a lost edit"*). A devDependency-only toolchain move has no
  published surface, so the only legal shape is one naming a **private/ignored**
  package — `@dzup-ui/tooling` is both — which R4 explicitly permits as long as
  no *released* package is named alongside it. No changeset was written, because
  the migration was refused; recorded so a re-execution does not discover this
  after the fact. **D93.**

### 7.8 Revert — proved, not asserted

The nine changed files were copied back from the hashed backup
(`…/4e243631…/scratchpad/o9p2/backup/`, taken before the first edit) and
`yarn install` re-run. **The root `package.json` was already dirty at phase-2
START** (another packet's uncommitted work), so the revert restores *that* state
and never `git checkout` — which would have destroyed it. Verified afterwards,
byte for byte:

**1. Every file the migration touched — `sha256sum -c` against the START
manifest, exit 0, 13 of 13 OK:**

```
package.json: OK                      apps/storybook/vitest.config.ts: OK
yarn.lock: OK                         node_modules/.yarn-state.yml: OK
apps/storybook/package.json: OK       .tree-shake-test/entry.ts: OK               (F-1)
apps/landing/package.json: OK         .tree-shake-test/vite.config.ts: OK         (F-1)
packages/mcp/package.json: OK         …/_data/playgroundSnippets.generated.ts: OK (F-7)
packages/testing/package.json: OK     …/_data/anatomy.generated.ts: OK  (dirty at START, other packet)
packages/tooling/package.json: OK
```

**2. Both phase-1 baseline hash sets re-verified, 55 files, zero mismatches:**
`TASK-R5-O9-baseline/toolchain-files.sha256` (44 files — every `package.json`,
`tsconfig`, `vite`/`vitest` config, `playwright.config.ts`, `bundlesize.config.json`,
`.nvmrc`, `.yarnrc.yml`, both `.tree-shake-test` files and `node_modules/.yarn-state.yml`)
and `perf-harness.sha256` (11 files, **D90**) both `sha256sum -c` clean.

**3. The runner is back**, and the fourth package is gone:

```
node_modules/vitest 3.2.6                  apps/storybook/node_modules/vitest 3.2.6
node_modules/@vitest/browser 3.2.6         apps/storybook/node_modules/@vitest/browser 3.2.6
node_modules/@vitest/coverage-v8 3.2.6     apps/storybook/node_modules/@vitest/coverage-v8 3.2.6
@vitest/browser-playwright — absent everywhere
```

**4. Worktree, stated exactly.** `git status --porcelain -uall` diffed against the
phase-1 END snapshot returns **one added line, and it is this phase's own
deliverable**:

```
>  M docs/program-2026-09/reports/N5-03-toolchain-migration-memo.md
```

so `-uall` is **290 → 291** and `git status --short` **282 → 283**.
`git diff HEAD | sha256sum` is `ebe862b455bf4723…`, not the START
`a8ec0f7b70d26346…` — **and it is important to say why rather than round it
off**: this phase edited two *tracked documents*, `EXECUTION-STATUS.md` (already
dirty at START) and the N5-03 memo (clean at START, now modified), both of which
the task requires. A whole-diff hash cannot be equal while a required write-up
lives in a tracked file. What *is* provable, and is proved above, is that
**nothing outside those two documents changed**: 13/13 migration files byte-equal,
55/55 baseline-manifest files byte-equal, and a porcelain that differs by exactly
one documentation path. The third document, this handoff, is untracked and so
does not enter `git diff HEAD` at all.

*(Method note for the next phase: snapshot the sha256 of every document you
intend to edit at START as well as every file you intend to change, so the END
comparison can be stated as a single equality instead of an argument.)*

**5. The restored tree was re-run, not just re-hashed** — a byte-equal tree with a
broken `node_modules` is not a revert:

| Gate, after the revert | Result | Baseline |
|---|---|---|
| `yarn test:ssr` | **0** — `RUN v3.2.6`, 129 passed / 1 skipped (130), 5 files | identical |
| `yarn test:a11y` | **0** — 188 passed (188), 11 files | identical |
| `yarn storybook:test` (the file this phase edited) | **1** — 5 failed / 1,448 passed (1,453), 169 files, `provider: 'playwright'` string form working again | identical |

**6. No commit, push, stash, checkout, revert, clean, branch operation, CI
dispatch or publication** was performed at any point, and no unrelated dirty path
was disturbed — including the root `package.json`, which carried another packet's
uncommitted work throughout and was restored to exactly that state.

### 7.9 The plan, retained for a re-execution

*Everything below is phase 1's plan. It executed as written — the package list,
the file list, the greps and the revert procedure were all correct — with the two
corrections in §7.7 (the changeset must name `@dzup-ui/tooling`, not be empty)
and §7.4 (the coverage stop condition fires).*

**Target: `vitest@4.1.11`, not 5.x.** Evidence in §2a: Vitest 5 requires Node
`^22.12.0`, the declared floor is `^20.19.0`, `validate:engines` (link 35, green
today) fails on exactly that comparison, and both a Node-floor change (ADR-18)
and a scope departure are forbidden by this task. Vitest 4.1.11 declares
`^20.0.0 || ^22.0.0 || >=24.0.0` — floor-compatible — and
`@storybook/addon-vitest@10.5.1` already declares support for `vitest ^4`.

**Current state.** `vitest`/`@vitest/browser`/`@vitest/coverage-v8` **3.2.6**,
pinned exactly in the root `resolutions` and ranged `^3.2.4`/`^3.2.6` in the
root, `apps/storybook`, `apps/landing`, `packages/{mcp,testing,tooling}`.
Browser mode: `apps/storybook/vitest.config.ts` only.

**Packages to move — all together, or not at all:**

| Package | From | To | Where |
|---|---|---|---|
| `vitest` | 3.2.6 | **4.1.11** | root `devDependencies` + `resolutions`; `apps/storybook`, `apps/landing`, `packages/{mcp,testing,tooling}` devDeps |
| `@vitest/coverage-v8` | 3.2.6 | **4.1.11** | root + `apps/storybook` |
| `@vitest/browser` | 3.2.6 | **4.1.11** | root + `apps/storybook` (still a declared peer of `addon-vitest`) |
| `@vitest/browser-playwright` | — | **4.1.11 (new)** | `apps/storybook`; it is the peer `addon-vitest@10.5.1` names for Vitest 4 |

**Files to change:** `package.json` (devDeps + the three-line `resolutions` block, plus the new fourth entry), `yarn.lock`, `apps/storybook/package.json`, `apps/landing/package.json`, `packages/mcp/package.json`, `packages/testing/package.json`, `packages/tooling/package.json`, and **one config line**: `apps/storybook/vitest.config.ts`'s `provider: 'playwright'` becomes the factory `provider: playwright({ … })` imported from `@vitest/browser-playwright`. Nothing else in the repository uses a Vitest 4 breaking API — this was grepped, not assumed:

- `@vitest/browser/context` / `@vitest/browser/utils` imports: **0**
- `poolOptions`, `singleThread`, `singleFork`, `minWorkers`, `maxThreads`, `threads.useAtomics`: **0**
- `environmentMatchGlobs`, `poolMatchGlobs`, `deps.optimizer.web`, `transformMode`, `vitest/execute`, `vite-node` (outside `yarn.lock`): **0**
- `coverage.all`, `coverage.extensions`, `coverage.ignoreEmptyLines`, `experimentalAstAwareRemapping`: **0** (and `coverage.include` is already explicit, which Vitest 4 requires)
- test options as a third argument (`}, { timeout: … }`): **0**
- `workspace`/`projects`: the root config has neither (single project)
- reporter `basic`: **0**; `--reporter=verbose` is used by `test:ssr`, `test:contracts`, `test:a11y` — in Vitest 4 `verbose` prints a **flat list** instead of a tree, which changes log shape only
- `vi.restoreAllMocks()`: **29 files** — in Vitest 4 it restores manual spies only, not automocks. This is the one behavioural change with real failure potential; the suite either stays green or names the files.

`@dzup-ui/testing` publishes a `./vitest` entry, but its built `dist/vitest.js`
imports **nothing from vitest** (it calls `installDzupUiDomTestEnvironment()`), so
the runner bump touches no published API and needs no peer range.

**How to revert byte-identically.** Back up, hashed, before touching anything:
the seven `package.json` files above, `yarn.lock`, `apps/storybook/vitest.config.ts`,
`node_modules/.yarn-state.yml`. Reverting = copy them back + `yarn install`, then
re-verify all hashes (the P-612 restore in §5 is the worked example and it held).

**The ladder, in this order, comparing against §4a:**

```
yarn typecheck · yarn lint · yarn test                 # expect 3 failed / 9,975 passed (9,983), 534 files
yarn test:ssr · yarn test:contracts · yarn test:a11y   # 129/1 · 1,594/1 · 188
yarn storybook:test                                    # THE browser lane: expect 5 failed / 1,448 passed (1,453)
yarn build && node docs/program-2026-09-04/reports/TASK-R5-O9-baseline/hash-dist.mjs <out> && diff
yarn validate:dts · validate:externals · validate:bundle · validate:tree-shake (expect exit 1, same 3 FAILs)
yarn report:component-sizes                            # expect 206 / 1,110,232 B raw / 389,982 B gzip
yarn test:nuxt-fixtures:pack && :install && yarn test:nuxt-fixtures   # 12 passed / 7 skipped
STORYBOOK_E2E_STATIC=1 STORYBOOK_E2E_PREBUILT=1 node node_modules/@playwright/test/cli.js test   # §4d
yarn validate:all                                      # expect exit 1 at link 19/43 and NOTHING else
```

A Vitest upgrade must not change a single byte of `dist/` (it is not the build
tool); the dist manifest diff is therefore a **hard** equality check in phase 2,
unlike phase 3.

**Stop conditions visible in advance:**

- **The coverage ratchet cannot be re-measured today (F-4).** The memo's HIGH risk is that a major moves measured coverage and the CI ratchet reads it as a regression — but `yarn test:coverage` currently *produces no report at all* (exit 1, unhandled errors, no `coverage/`). Phase 2 must either (a) make the lane produce a report on the unchanged tree first (the AnimationsPage rAF race is the obstacle and belongs to another packet), and only then compare, or (b) record that the ratchet is **unverified** and refuse the change on that ground. Do **not** re-baseline the thresholds — that is explicitly an owner act.
- **`vitest-axe@0.1.0`** (peer `vitest >=0.16.0`, last published 2022) extends `expect`; it is the most likely single break, and `yarn test:a11y` (188 assertions) is the check that names it.
- **Two Vitest majors in one tree = flake.** `apps/storybook` hoists to itself, so root `resolutions` do **not** reach it: its `package.json` must move in the same change, or the storybook lane runs Vitest 3 against a Vitest-4 root.
- **`storybook@10.5.1` bundles `@vitest/expect`/`@vitest/spy` 3.2.4 internally.** These are its own dependencies, not the runner; they are expected to stay, and `yarn why vitest` after the install should show exactly one runner version per workspace root.
- Node 24 is what this machine runs; the floor (20.19.0) is exercised only by the CI `validate-min-runtime` job, which no agent may dispatch.

**Changeset.** One, named so the corrected done-check finds it
(`.changeset/toolchain-vitest-4.md`). Every affected package is private or has no
published surface change, so it is an **empty** changeset (front-matter with no
package lines) documenting the runner move; `validate:release-policy` (link 41,
green, 31 pending changesets) is the gate to re-run after writing it.

---

## 8. Phase 3 — the package build tool (the memo's Track B): ONE REFUSAL, ONE BLOCK

> **Executed 2026-09-18, 11:34–11:55 UTC**, on the tree phase 2 closed on plus
> documentation-only owner edits made between the phases (§11 states this exactly).
>
> **Phase 3 changed no dependency.** No `package.json`, no `yarn.lock`, no
> `yarn install`, no `yarn add`, no config file. The two Track-B items resolve
> without one, and the evidence says so in two different ways:
>
> - **tsdown is REFUSED** (§8a) — dated, measured, with a re-evaluation trigger.
>   A refusal is a complete deliverable under this task's `<success_criteria>`
>   ("or refused with a dated, measured reason"). **D85 option (a) taken.**
> - **Vite 8 is BLOCKED, not refused** (§8b) — `vitest@3.2.6` admits
>   `vite ^5 || ^6 || ^7` and nothing else, verified from `node_modules`, so Vite 8
>   requires Vitest 4, which is refused pending **D91**. There is no measured
>   defect in Vite 8 to refuse it on; it has an unsatisfiable precondition, and
>   that precondition is D91 alone.
>
> Phase 3 also independently re-verified the measurement phase 2's refusal rests
> on (§8c). **It holds** — and the re-measurement is a *second* reading of the
> Vitest-3 side of the coverage ratchet, which is exactly what `vitest.config.ts`'s
> own comment demands before any of those four numbers is moved.

### 8.0 Implemented files and API effect

| File | Change | API effect |
|---|---|---|
| **— no source, config, manifest, lockfile or generated artefact —** | **unchanged** | **none** |
| `docs/program-2026-09-04/reports/TASK-R5-O9-handoff.md` | this §8 rewritten as an execution record; D95–D97 added to §10; phase-3 custody row in §11; §12 folded | documentation |
| `docs/program-2026-09/reports/N5-03-toolchain-migration-memo.md` | §11's status column extended so **every Track-B item carries its phase-3 disposition** | documentation |
| `docs/program-2026-09-04/EXECUTION-STATUS.md` | TASK-R5-O9 row `[~]` → `[!]`; D85 disposition recorded; D95–D97 appended | documentation |

**Public API effect: none, provably.** Nothing that produces a published byte was
touched, so no entry point, type, token, CSS asset or `dist/` file could move. The
non-documentation half of the worktree diff is byte-identical at START and END
(§11) — a single equality, not an argument, which is what phase 2's own method
note asked the next phase to produce.

---

### 8a. tsdown — **REFUSED, 2026-09-18**

**Registry re-read today** (`yarn npm info <pkg> --json`, never `npx`), because
§8's evidence was written on 2026-09-17 and registries move. Every fact below is
from that read, not from the earlier table.

| Fact | as written 2026-09-17 | **re-verified 2026-09-18** | effect on the refusal |
|---|---|---|---|
| `tsdown` `latest` | 0.23.0 | **0.23.0 — unchanged** (published 2026-09-03) | no newer release to reconsider |
| `tsdown@0.23.0` `engines.node` | `^22.18.0 \|\| >=24.x` | **`^22.18.0 \|\| ^24.11.0 \|\| >=26.0.0`** | **worse than recorded** — `latest` now also excludes Node 24.0–24.10 and all of 25.x |
| first ADR-18-breaking release | 0.22.0 | **0.22.0 confirmed** — `^22.18.0 \|\| >=24.0.0` | unchanged |
| newest floor-compatible release | 0.21.10 (2026-04-22) | **still 0.21.10** — `engines.node >=20.19.0`. No 0.21.11 and no later backport exists; the stable list runs `… 0.21.9 · 0.21.10 · 0.22.0 …` | **the only usable release is now ~5 months old** |
| its bundler | `rolldown@1.0.0-rc.17` | **confirmed**, against `rolldown` `latest` **1.2.9** today | a pre-1.0 release candidate, nine minors behind |
| its dts plugin | `rolldown-plugin-dts@^0.23.2`, peer `vue-tsc ~3.2.0` | **confirmed**: 0.23.2 peers `vue-tsc ~3.2.0`, `rolldown ^1.0.0-rc.12`, `typescript ^5 \|\| ^6`. Installed `vue-tsc` is **3.3.3** | **peer conflict confirmed**, and the line is dead: `rolldown-plugin-dts` `latest` is **0.28.6** and 0.23.x stops at 0.23.2 |

**The floor, stated exactly.** `package.json` declares
`engines.node "^20.19.0 || >=22.13.0"` (ADR-18), and
`validate-engines.ts`'s `DECLARING_PACKAGES` requires `packages/mcp/package.json`
to declare the same. tsdown ≥ 0.22.0 admits no Node below **22.18.0** — a range
the declared floor *does* admit — so adopting it would make the manifest promise
support the build could not deliver. This task's `<scope>` forbids moving the
floor (ADR-18 is TASK-R0-O2's lane).

**And no gate would say so — read, not assumed.**
`packages/tooling/scripts/validate-engines.ts:38` declares

```ts
const GATE_DEPENDENCIES = [
  'vite', 'vitest', 'eslint', 'tsx', 'typescript', 'jsdom', '@playwright/test',
]
```

**`tsdown` is not in that list.** Link 35 (`validate:engines`) would therefore stay
**green while the floor was broken**, which is why this refusal is written against
ADR-18 rather than against a red gate — the gate is structurally unable to see it.

**Trigger B3 re-tested, not assumed.** The memo's tsdown trigger is *"the next
time `vite-plugin-dts` blocks a `validate:dts` fix"*. Re-run today on the unchanged
tree, to a log, exit code read directly:

```
yarn validate:dts > …/o9p3/logs/validate-dts.log 2>&1; echo "exit $?"
exit 0
  PASS  declaration import boundaries
============================================================
Total: 272 .js files, 862 .d.ts files
Declaration file validation passed: 0 errors
```

**Exit 0, 272 `.js` / 862 `.d.ts`, 0 errors — identical to the 2026-09-17 baseline
(§4a).** `vite-plugin-dts@4.5.4` has blocked nothing. **B3 has not fired.**

**Present state re-confirmed:**
`grep -rn "tsdown" package.json packages/*/package.json yarn.lock` → exit **1**,
no match (read directly, never through a pipe). tsdown is declared nowhere and
installed nowhere. This is an **adoption**, and the memo's own standard for one is
that *"something has to be better afterwards, not merely newer"* — nothing here is.

#### The refusal, for the ledger

> **tsdown adoption is REFUSED on 2026-09-18.** Measured: every release from
> `tsdown@0.22.0` onward declares `engines.node ^22.18.0 || …`, and the current
> `latest` (**0.23.0**) declares `^22.18.0 || ^24.11.0 || >=26.0.0`, against this
> repository's declared floor `^20.19.0 || >=22.13.0` (**ADR-18**), which this
> task's `<scope>` forbids changing. The newest floor-compatible release is
> **0.21.10 (2026-04-22, `>=20.19.0`)** — five months old, carrying
> `rolldown@1.0.0-rc.17` (a pre-1.0 release candidate, against `rolldown@1.2.9`
> current) and `rolldown-plugin-dts@^0.23.2`, whose declared peer `vue-tsc ~3.2.0`
> conflicts with this repository's **`vue-tsc@3.3.3`**; that 0.23.x line is dead
> (`latest` 0.28.6). `validate:engines` would **not** catch the breach, because
> `tsdown` is absent from its `GATE_DEPENDENCIES`. And the memo's own adoption
> trigger **B3** — *"the next time `vite-plugin-dts` blocks a `validate:dts` fix"*
> — **has not fired**: `yarn validate:dts` exits **0** at 272 `.js` / 862 `.d.ts`,
> 0 errors. Adopting tsdown today would replace file-per-module `tsc` output on
> five packages — output that `validate:dts`, `validate:externals` and
> `validate:exports` all read — with a large unreviewable diff, bought for no
> measured benefit, on a five-month-old 0.x release.

**Re-evaluation trigger — re-open this when *any one* of these becomes true:**

1. tsdown publishes a release whose `engines.node` admits `^20.19.0 || >=22.13.0`; **or**
2. ADR-18 moves for an unrelated reason (TASK-R0-O2's lane) — then re-price 0.22+ against the new floor; **or**
3. **B3 fires** — `vite-plugin-dts` blocks a `validate:dts` fix.

Until one of those, **this is not a packet**, and a future agent should cite this
paragraph rather than re-measure it.

---

### 8b. Vite 7.3.5 → 8.3.0 — **NOT EXECUTED: blocked behind D91**

#### The deciding check

Run against `node_modules`, not against a range quoted from a memo, as the
phase-3 brief required:

```
node -e "const p=require('./node_modules/vitest/package.json'); …"
vitest@3.2.6   dependencies.vite  = "^5.0.0 || ^6.0.0 || ^7.0.0-0"
               peerDependencies.vite = (none)
```

**The range claim holds.** `vitest@3.2.6` admits `^5 || ^6 || ^7` and nothing
else; `vite@8.3.0` is outside it. Vite 8 therefore requires Vitest 4, and Vitest 4
is refused pending **D91** (§7). **Vite 8 is blocked, not refused.**

#### …and the mechanism is worse than "rejected" — §8b's prediction is corrected here

`vite` is a **`dependencies`** entry of `vitest@3.2.6`, *not* a
`peerDependencies` one. Read from the installed tree:

| Package | declares `vite` as | range |
|---|---|---|
| `vitest@3.2.6` | **dependency** | `^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0-0` |
| `vite-node@3.2.4` | **dependency** | `^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0-0` |
| `@vitest/mocker@3.2.6` | **peer** | `^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0-0` |
| `@vitejs/plugin-vue@6.0.7` | peer | `^5 \|\| ^6 \|\| ^7 \|\| ^8` — **Vite-8-ready** |
| `vite-plugin-dts@4.5.4` | peer | `*` — installs against anything, **tested against nothing** |
| `vitest@4.1.11` *(registry)* | **dependency *and* peer** | `^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0` — confirms §7.6 |

`yarn.lock:18697` today reads

```
"vite@npm:^5.0.0 || ^6.0.0 || ^7.0.0-0, vite@npm:^7":
```

— **one lockfile entry serving both descriptors**, i.e. vitest and the four `^7`
workspaces (`root`, `core`, `compat`, `tokens`, `tooling`) share the single hoisted
`vite@7.3.5`. Moving the workspaces to `^8` **splits that pair**: the packages
would build with `vite@8.3.0` while every test lane transformed through a **nested
`vite@7.x`** that yarn would install for `vitest`/`vite-node`. `@vitest/mocker`'s
peer would be satisfied by vitest's own nested copy, so there would be **no peer
warning and no install error — `yarn install` would exit 0** and the ladder would
run, silently, on two Vite majors.

That is the memo's trigger **B2** verbatim — *"a partial upgrade that holds two
incompatible Vite majors in one tree"* — and nothing in this repository asserts
one Vite major per tree: `validate:engines` reads the *hoisted* `vite`'s engines
(it would see 8.3.0 and pass), and `validate:peer-ranges` reads declared peers,
not installed duplicates. **D95.**

#### What phase 2 already proved *for free* about Vite 8

This is the substantive product of §8b: a Vite 8 attempt after D91 does **not**
start from zero. All four classifiers §8b names are instrumented, and phase 2
exercised every one of them end-to-end across a runner major and got exact
equality.

| §8b classifier | Instrument | Proven by phase 2? | Reading to compare against |
|---|---|---|---|
| **file list — did `preserveModules` survive** | `listSha256` per package in `TASK-R5-O9-baseline/dist-summary.tsv`, produced by `hash-dist.mjs` | **yes** — manifest regenerated across a whole-toolchain change, `diff` exit **0** on *both* `.tsv` files | **1,629 files**; per-package `listSha256`/`contentSha256` in §4c |
| **`.d.ts` bytes** (`vite-plugin-dts` unchanged ⇒ must be identical) | `contentSha256` + `validate:dts` | **yes** — `contentSha256` equal for all 8 packages; `validate:dts` exit 0 | **272 `.js` / 862 `.d.ts`, 0 errors** |
| **externals** | `validate:externals` | **yes** — unchanged | exit 0, **8 passed / 1 skipped** (`tooling`) |
| **per-component gzip** | `report:component-sizes --ci` | **yes** — `--ci` JSON byte-identical once `generated` is dropped | **206 components · 1,110,232 B raw · 389,982 B gzip** |
| *(plus)* the two live budgets | `validate:bundle` | yes | `core/dist/index.js` ≤150 kB (**7.04 kB**); `tokens/dist/tokens.css` ≤15 kB (**7.23 kB**); third entry permanently `SKIP` (**F-3**) |
| *(plus)* the red one | `validate:tree-shake` | yes | compare against **3 FAILs, not green** (`DzInput`/`DzSelect`/`DzAlert`, **F-2**), bundle sizes 191.6 / 202.3 / 211.8 / 192.2 KB |

So **D87's dist-manifest instrument is no longer a plan** — it has been run
against a real toolchain change and returned exact equality, which is precisely
the property a bundler swap needs from it. What it has *never* been exercised
against is a **bundler** change, and that is what Vite 8 is: `vite@8.3.0` declares
`dependencies.rolldown ~1.2.6`, a Rollup → rolldown swap. `contentSha256` **will**
move for `core`/`compat`/`tokens`, and §8b's stop condition stands unchanged —
*a `contentSha256` change with a plausible bundler explanation is acceptable; any
change to the file **list**, or to the `.d.ts` bytes, is the stop.*

#### Floor and trigger

- **Floor: fine.** `vite@8.3.0` declares `engines.node "^20.19.0 || >=22.12.0"`,
  which the declared floor `^20.19.0 || >=22.13.0` satisfies. Vite 8 is **not** a
  floor problem; it is a sequencing problem.
- **Trigger B1 has not fired either.** The memo's condition is *"Vite 7 leaves
  security support, **or** a dependency this repository needs drops Vite 7
  support. Not 'Vite 8 is out'."* Measured today: `vite`'s `previous` dist-tag is
  **7.3.6** — published *after* the installed 7.3.5, so the 7.x line is still
  receiving releases — and every plugin in the build path still admits `^7`.
  So even once D91 lands, Vite 8 is a **currency** upgrade carrying one untested
  link (`vite-plugin-dts@4.5.4`'s `vite: "*"` peer, whose own 5.x is a separate
  major decision), not a maintenance necessity. **D96.**

**Status: BLOCKED behind D91.** Not refused, and not attempted — attempting it on
`vitest@3.2.6` would produce the silent split above, which is itself a stop
condition.

---

### 8c. Independent re-verification of phase 2's deciding measurement

The phase-3 brief required the refusal's foundation to be checked *before*
anything was built on it, because everything downstream depends on it. **Both
parts hold.**

#### (1) F-8's mechanism, read from the installed `vitest@3.2.6`

Not inferred from a symptom — the chain is four hops and every one was read:

```
node_modules/vitest/dist/chunks/defaults.B7q_naMc.js:48    reportOnFailure: false,          ← the default
node_modules/vitest/dist/chunks/cli-api.DWGBtMmz.js:9896   async reportCoverage(coverage, allTestsRun) {
                                                    :9897    if (this.state.getCountOfFailedTests() > 0) {
                                                    :9898      await this.coverageProvider?.onTestFailure?.();
                                                    :9899      if (!this.config.coverage.reportOnFailure) return;   ← EARLY RETURN
                                                    :9900    }
                                                    :9902    await this.coverageProvider.reportCoverage(coverage, { allTestsRun })
node_modules/vitest/dist/chunks/coverage.DfSpMS-b.js:4078    await this.generateReports(…)
node_modules/@vitest/coverage-v8/dist/provider.js:2609       async generateReports(coverageMap, allTestsRun) {
                                                    :2630       await this.reportThresholds(coverageMap, allTestsRun);   ← NEVER REACHED
```

The early return at `cli-api:9899` sits upstream of `generateReports`, which is the
**only** caller of `reportThresholds`. A single failing test therefore suppresses
**the report and the threshold check together** — and `vitest.config.ts` never sets
`reportOnFailure` (`grep -n reportOnFailure vitest.config.ts` → no match).

**F-8 is confirmed at the source level, and F-4's `AnimationsPage` rAF attribution
is confirmed wrong** — the rAF race is not on this code path at all.

#### (2) The four thresholds exist with the stated values, and the Vitest-3 measurement clears them

Read from `vitest.config.ts` **lines 90–94** and **158–162**:

```ts
'packages/*/src/**':   { branches: 80, functions: 80, lines: 80, statements: 80 },
'apps/landing/src/**': { branches: 89, functions: 80, lines: 91, statements: 91 },
```

— exactly the bars §7.4 names. The lane was then run **once, on the unchanged
tree, with no file edited and no threshold touched**, reports diverted to the
scratchpad:

```
yarn test:coverage --coverage.reportOnFailure=true \
  --coverage.reportsDirectory=…/o9p3/coverage-v3 > …/logs/coverage-v3.log 2>&1; echo "exit $?"
exit 1
```

Exit 1 from the same three inherited failures —
**3 failed / 9,975 passed / 4 skipped / 1 todo (9,983) · 534 files · 1 failed
snapshot · 1 unhandled error · 280.46 s** — **and a full coverage report was
printed**, which is F-8's direct empirical proof. **Zero `ERROR: Coverage …`
lines.**

| glob | files | statements | branches | functions | lines | bars (s/b/f/l) | verdict |
|---|---|---|---|---|---|---|---|
| `packages/*/src/**` | **647** | 87.08 % (52,108/59,840) | 84.65 % (11,745/13,874) | 87.33 % (1,806/2,068) | 87.08 % (52,108/59,840) | 80/80/80/80 | **all PASS** |
| `apps/landing/src/**` | **391** | 94.11 % (28,550/30,338) | 91.14 % (5,640/6,188) | 82.97 % (1,729/2,084) | 94.11 % (28,550/30,338) | 91/89/80/91 | **all PASS** |
| total | **1,038** | 89.44 % (80,658/90,178) | 86.66 % (17,385/20,062) | 85.14 % (3,535/4,152) | 89.44 % | — | — |

*(Per-glob figures recomputed from the run's own `coverage-final.json`; the text
reporter's `All files` row agrees at **89.44 / 86.65 / 85.13 / 89.44**.)*

#### Verdict on §7.4: **it holds.**

Same file counts (**647 / 391 / 1,038**), same pass/fail pattern, and the same
signature — **`statements === lines` exactly**, on both the covered and the total
side, which is the Vitest-3 compiled-output basis §7.4 describes and which Vitest 4
breaks. The percentages differ from §7.4's reading only in the third significant
figure (packages 87.10 → **87.08**, 84.66 → **84.65**; landing 94.21 → **94.11**,
91.12 → **91.14**, 82.46 → **82.97**), and the landing **function total moved
2,035 → 2,084**.

**That movement is not noise to be smoothed over — it is the thing
`vitest.config.ts` itself warns about** in the comment above these very
thresholds: *"the function TOTAL moves between runs — 1,953 / 2,051 / 2,343 for
the same tree … BOTH sides of the fraction move together."* A third reading lands
inside the band the comment already predicted. **Nothing in §7.4's argument depends
on those digits**: the closest call — landing `functions` against its bar of 80 —
moved *upward*, from 2.46 points of headroom to **2.97**, and the Vitest-4 gaps
§7.4 reports are 3.4 to 12.3 points, two orders of magnitude larger than the
run-to-run spread.

**What this buys D91.** The **Vitest-3** side of the ratchet now has **two
independent readings**, taken a day apart by different phases with the same
command — which is what the config comment asks for before any number is moved
("measure with CI's own command, take the LOWEST reading, and leave a point of
margin"). The **Vitest-4 side still has exactly one** (§7.4). **D97.**

---

### 8d. Aggregate qualification

**What ran in phase 3** — each to a log file with `echo $?` read directly
afterwards; **no gate result was read through a pipe**. Logs and artefacts in
`…/4e243631…/scratchpad/o9p3/`:

| Command | Exit | Result |
|---|---|---|
| `yarn validate:dts` (the **B3** test) | **0** | 272 `.js` / 862 `.d.ts`, 0 errors — identical to §4a |
| `yarn test:coverage --coverage.reportOnFailure=true --coverage.reportsDirectory=<scratch>` | **1** | 3 failed / 9,975 passed / 4 skipped / 1 todo (9,983) · 534 files · 1 failed snapshot · 1 unhandled error · 280.46 s · **full report printed, 0 threshold errors** |
| `yarn npm info` × 12 (5 package-level, 7 version-level) | 0 | §8a / §8b tables |
| direct reads: `node_modules/{vitest,vite-node,@vitest/mocker,@vitest/browser,@vitest/coverage-v8,@vitejs/plugin-vue,vite-plugin-dts,vite,vue-tsc,typescript}/package.json`, `validate-engines.ts`, `vitest.config.ts`, `yarn.lock`, `.gitignore`, the four `dist/chunks` + `provider.js` sites | — | §8a / §8b / §8c |

**What deliberately did *not* run, and why.** The full ladder was **not** re-run.
Phase 3 changed no dependency and no config, so there is nothing for a ladder to
qualify: §4a's baseline and §7.2's post-migration re-measurement both remain bound
to this exact tree, whose non-documentation diff hash phase 3 did not move (§11).
Re-running a 59-minute Playwright matrix to show that an untouched tree still
behaves the same is ceremony, not evidence. So `yarn test:e2e`, `yarn build`,
`storybook:build`, `storybook:test`, `validate:tree-shake`, `validate:all` and the
Nuxt fixtures were not run — **and as a direct consequence neither F-1 nor F-7
fired**: nothing ran that deletes or rewrites a tracked file.

**Still red, pre-existing vs new:**

| Red | Phase-3 status | Owner |
|---|---|---|
| `yarn test` / `test:coverage` 3 failures (high-contrast snapshot · 6 landing token fallbacks · `story-dod-tiers countOpen`) | **unchanged — the same three, same messages, same one failed snapshot**, observed in the coverage run | the inherited set (R5-O7 / landing tokens / story-dod packets) |
| coverage lane prints nothing under `yarn test:coverage` as scripted | **unchanged** — F-8 / **D92**; only the explicit CLI flag makes it report | R1-O1 |
| `validate:tree-shake` 3 FAILs · `validate:all` link 19/43 · `storybook:test` 5 stories · Playwright matrix | **not re-run** — no phase-3 change could reach them; §12.2 remains the record | as §12.2 |

**New red introduced by phase 3: none.** Nothing was changed, and the
non-documentation worktree diff is byte-identical at START and END (§11).

**Maturity:** every phase-3 number is *locally qualified on Node 24.14.1, Windows
11, 16 CPUs*, against `569d887` plus several other packets' uncommitted work.
**Not CI evidence, not release evidence, not floor evidence.**

### 8e. Ratchet movements (old → new)

**No ratchet, budget, threshold or ceiling was moved by phase 3** — and none could
have been, because no file that holds one was edited.

| Ratchet | Before phase 3 | After phase 3 | Note |
|---|---|---|---|
| coverage `packages/*/src/**` bars | 80 / 80 / 80 / 80 | **80 / 80 / 80 / 80 — unchanged** | not touched; **not re-baselined** |
| coverage `apps/landing/src/**` bars | 91 / 89 / 80 / 91 | **91 / 89 / 80 / 91 — unchanged** | not touched; **not re-baselined** |
| coverage `packages/*/src/**` *measurement* (Vitest 3) | **one** reading — 87.10 / 84.66 / 87.33 / 87.10 | **two** readings — second: **87.08 / 84.65 / 87.33 / 87.08** | agreement to 0.02 pt |
| coverage `apps/landing/src/**` *measurement* (Vitest 3) | **one** reading — 94.21 / 91.12 / 82.46 / 94.21 | **two** readings — second: **94.11 / 91.14 / 82.97 / 94.11** | tightest metric (`functions`) **gained** headroom, 2.46 → **2.97** pt |
| `validate:dts` | 272 `.js` / 862 `.d.ts`, exit 0 | **272 / 862, exit 0 — unchanged** | re-run as the B3 test |
| `validate:all` links / first red | 43 / link 19 | **unchanged by construction** (not re-run) | §4b |
| changesets pending | 31 | **31** | no migration executed ⇒ none owed; **D93** holds the shape for when one is |
| dependencies changed | — | **zero** | no `yarn install` was run at any point in phase 3 |

### 8f. Owner decisions raised by phase 3

Three, numbered from **D95**; full options and recommendations in **§10**.

- **D95 🟠 — Vite 8 on `vitest@3.2.6` fails *silently*, not loudly.** `vite` is a
  *dependency* of vitest, not a peer, so `yarn install` would exit 0 and hand the
  tree two Vite majors — 8.3.0 for `yarn build`, a nested 7.x for every test lane —
  with no peer warning and no gate that can see it. **Rec.:** keep Vite 8 strictly
  behind D91, and when it is attempted, add a one-Vite-major assertion to the
  engine/peer validators as part of that packet.
- **D96 🟢 — Vite 8 has no fired trigger and one untested link.** Memo **B1** has
  not fired (`vite@7.3.6` is the `previous` tag, i.e. the 7.x line is still
  shipping; every build-path plugin still admits `^7`), and `vite-plugin-dts@4.5.4`
  declares `vite: "*"` — it will install against Vite 8 and has been tested against
  nothing. **Rec.:** after D91, treat Vite 8 as a discretionary currency packet and
  bind it to the `vite-plugin-dts` 5.x decision, rather than executing it reflexively.
- **D97 🟢 — D91 needs a second Vitest-4 coverage reading before a number is
  moved.** Phase 3 supplied the second **Vitest-3** reading; the Vitest-4 side still
  has one. The two Vitest-3 readings differ by up to 0.51 pt and the landing
  function total moved 2,035 → 2,084 — exactly the instability `vitest.config.ts`
  documents. **Rec.:** take at least one more Vitest-4 reading with the identical
  command, then set each bar to `floor(min observed) − 1` per that file's own rule.

**Disposition of an earlier decision:** **D85 option (a) is taken** — the tsdown
refusal is written, dated and measured (§8a), with a three-condition re-evaluation
trigger. D85 stays on the register as a *watch*, not as an open question.

### 8g. Ranked next packet (phase 3's view)

1. **[!owner] D91 — take or refuse the coverage re-baseline.** Unchanged as the
   number-one item, and phase 3 strengthens it: it is now the **sole** remaining
   blocker on this whole task. It gates a proven, faster, byte-neutral Vitest 4
   (§7.2) *and*, through it, Vite 8 (§8b). The measurement is §7.4, now with a
   corroborated Vitest-3 side (§8c); the re-execution is §7.1, nine lines across
   eight files. **Take D97's advice first: one more Vitest-4 reading, then set the
   four numbers.**
2. **D92 — set `coverage.reportOnFailure: true`** (one line in `vitest.config.ts`).
   Best folded into **TASK-R1-O1**. Phase 3 re-proved the mechanism from source
   (§8c) and re-proved that the flag alone makes the lane report on a red tree.
   Until it lands, the 80 % bar is decorative whenever anything is red.
3. **F-2 / D87(b)** — fix `validate:tree-shake`'s substring sentinel and
   `validate:bundle`'s inert `index.css` budget (**F-3**). Promoted above the Vite 8
   work by phase 3, because these are two of the six classifiers a bundler swap
   must be judged on and both are currently lying; fixing them is small,
   self-contained, and is a **precondition for reading a Vite 8 attempt honestly**.
4. **Vite 8 (§8b), after D91 — discretionary.** No trigger has fired (**D96**);
   the instrument is ready and proven (**D87**); the sequencing hazard is **D95**.
   Bundle it with the `vite-plugin-dts` 4.x → 5.x decision.
5. **D86 / D94** — amend this task's `<done_check>` to the exit-code-honest block in
   §1, and add the "defaults diff" step to the major-upgrade pre-flight. Note that
   check 2 (`grep … "tsdown\|\"vite\": \"^8"`) will now return *no match* **forever**,
   by design: the refusal in §8a *is* its pass condition, and the grep cannot see it.
6. **tsdown — nothing, until a trigger in §8a fires.** Cite the refusal; do not
   re-measure it.


---

## 9. Findings

| # | Finding |
|---|---|
| **F-1** | **`validate:tree-shake` deletes two *tracked* files.** `.tree-shake-test/{entry.ts,vite.config.ts}` are committed (with this machine's absolute paths baked in, from some earlier run) and the script `rmSync`s its temp dir in a `finally`. Running the gate leaves ` D` entries in `git status`. This phase backed both up and restored them byte-identically (hashes equal before/after); **every later phase must do the same** |
| **F-2** | **`validate:tree-shake` is red at baseline and probably for a false reason.** `DzInput`, `DzSelect` and `DzAlert` single-component bundles contain the string `DzDataGrid`. The sentinel is a plain substring search over an unminified bundle, and `packages/core/src/i18n/messages.ts` — which every message-consuming component imports — declares the catalog keys `DzDataGridHeader` and `DzDataGridPagination`. `DzButton`, which consumes no messages, passes. Not proven to the byte here (the bundles are deleted by the script); flagged so a phase does not read it as a regression it caused |
| **F-3** | **One third of `validate:bundle`'s budget is inert**: `bundlesize.config.json` gates `packages/core/dist/index.css`, which the build never emits (the CSS asset is `dist/core.css`, per `cssFileName: 'core'`). It has always printed `SKIP (file not found — build first)` while the gate exits 0 |
| **F-4** | **`yarn test:coverage` produces no coverage report in this tree.** Exit 1 with the 3 inherited failures **plus 4 unhandled errors**; no summary table is printed and no `coverage/` directory is created. The memo's HIGH-risk item for Track A — "re-measure the ratchet in the same change" — is therefore not currently satisfiable, and phase 2 must treat that as a gating condition (§7) |
| **F-5** | **The Storybook browser lane runs here and is 5-red.** TASK-R3-O3 recorded it as unrunnable; it took 117 s. Two of the five failures are R3-O3's own `AsyncOptions` play stories, which that packet verified in jsdom only. Not this task's to fix; recorded so the next agent compares against 5, not 0 |
| **F-7** | **`yarn storybook:build` rewrites a tracked generated file.** `apps/storybook/scripts/build-playground-snippets.mjs` regenerates `apps/storybook/stories/_data/playgroundSnippets.generated.ts` (160 snippets: 115 from `@example`, 45 fallback) and the fresh render **differed** from the copy in the worktree — i.e. the committed/dirty copy is stale against current sources. This phase backed the file up before the build and **restored it byte-identically**, because it belongs to another packet's dirty work. Any phase that runs `storybook:build` (the static e2e path does) must do the same, or decide deliberately to keep the regenerated file |
| **F-8** | **The coverage ratchet is unenforced whenever any test fails — so, on this tree, always.** `coverage.reportOnFailure` defaults to `false` and `vitest.config.ts` never sets it; `Vitest.reportCoverage()` returns before the provider runs when `getCountOfFailedTests() > 0`, so **neither the report nor the threshold check happens**. This is the true cause of **F-4** (which blamed the `AnimationsPage` rAF race — excluding that spec removes 3 of the 4 unhandled errors and still yields no report). The 80/80/80/80 and 91/89/80/91 bars have therefore not been enforced at any point while the three inherited failures existed. Adding `--coverage.reportOnFailure=true` on the CLI — no file changed, no threshold touched — makes the lane report normally, which is how phase 2 measured the ratchet on both sides of the migration (§7.4). **D92** |
| **F-9** | **An *empty* changeset fails `validate:release-policy`.** Rule **R7** rejects any changeset whose front-matter names no package. Phase 1's plan for the Vitest packet was exactly that shape, so writing it would have turned link 41 red. A devDependency-only change has no published surface, so the only legal shape names a **private/ignored** package (`@dzup-ui/tooling` is both); R4 permits a changeset that names *only* skipped packages, and refuses one that mixes skipped with released. **D93** |
| **F-6** | **`yarn storybook` cannot start a server on Windows.** `apps/storybook/scripts/dev.mjs` guards its entry point with ``import.meta.url === `file://${process.argv[1]}` ``, which is never true on Windows (`file:///C:/…` vs `C:\…`), so the script exits 0 having done nothing. `playwright.config.ts`'s default `webServer` is exactly that command, which is why `yarn test:e2e` **as written** cannot run here (§4d) and the repo's own `test:e2e:*` scripts all use the static-Storybook path instead |

---

## 10. Decisions raised

Numbering continues from D82 (highest in `EXECUTION-STATUS.md`).

| # | Decision | Options / recommendation |
|---|---|---|
| **D83** 🟠 | **The Vitest target is 4.1.11, not the memo's 5.x.** Vitest 5 declares `engines.node ^22.12.0`; the floor is `^20.19.0` (ADR-18) and `validate:engines` fails on it, so 5.x cannot be executed under this task's scope. Vitest 4.1.11 is floor-compatible and already supported by `@storybook/addon-vitest@10.5.1` | (a) phase 2 executes **4.1.11** under the full ladder — **rec.**; (b) hold 3.2.6 and record Track A as refused until ADR-18 moves; (c) `[!owner]` amend ADR-18 to a Node 22 floor and take 5.x — a much larger act (`.nvmrc`, two `engines` blocks, ~14 CI `node-version:` values, ADR-18 amendment), and it is TASK-R0-O2's lane, not this one |
| **D84** 🟢 | **"Vitest 4 browser mode for the memo's lanes" means the `apps/storybook` lane and nothing else.** The memo refuses to re-platform the 534-file jsdom suite ("that is not a toolchain upgrade, it is a re-platforming of every piece of unit-level evidence"), and the `<done_check>`'s root-config grep implies the opposite | (a) scope phase 2's browser work to `apps/storybook/vitest.config.ts` (the `provider` factory) — **rec.**; (b) add a second browser project to the root config — refused for the memo's reason |
| **D85** 🟠 | **tsdown: recommend a recorded refusal** (§8a): ADR-18-incompatible from 0.22.0 on, five-month-old last compatible release on a pre-1.0 rolldown with a conflicting `vue-tsc` peer, and trigger B3 has not fired | (a) refuse with the dated measurement and revisit on a floor change — **rec.**; (b) adopt 0.21.10 on the five `tsc` packages anyway; (c) wait for Vite 8 to make the question moot |
| **D86** 🟢 | **The `<done_check>` cannot be trusted as written** — check 1 is a false pass (matches a comment; names `packages/core/vitest.config.*`, which does not exist) and checks 2/3 read `grep`/`ls` through `\| head`. Sixth occurrence of the pattern (D42, D57, D66, D72, D77) | (a) replace with the corrected block in §1 — **rec.**; (b) leave it, and accept that a fresh agent may record this task found-done over an unexecuted migration |
| **D87** 🟢 | **`validate:tree-shake` and `validate:bundle` are the two build gates that cannot serve as byte comparisons** — the first is red at baseline for a probable substring artefact (F-2), the second's CSS budget is inert (F-3). The byte instrument for phases 2–3 is the dist hash manifest in §4c | (a) use the manifest + `report:component-sizes` as the byte gate and treat both validators as "unchanged vs baseline" checks — **rec.**; (b) fix the sentinel/budget first (separate, small packet — not a toolchain change) |
| **D90** 🟢 | **No perf-harness config hash exists**, so the stop condition that names one is given a definition: the sha256 set in `TASK-R5-O9-baseline/perf-harness.sha256` must be byte-identical across a migration, and `yarn perf:capture` stays an owner action (a Vitest major changes measured timings even with the files untouched) | (a) adopt that definition — **rec.**; (b) add a real config hash to `baselines.json` (a change to the perf packet, TASK-R2-O7's lane) |

**Raised by phase 2 (2026-09-18):**

| # | Decision | Options / recommendation |
|---|---|---|
| **D91** 🔴 | **Vitest 4 changes the coverage basis, four committed thresholds fail, and only the owner may move them — this is the sole reason phase 2 refused.** Vitest 4 makes v8 AST-aware remapping unconditional and **removed `experimentalAstAwareRemapping`**, so there is no setting that restores the Vitest-3 basis. On the identical tree, identical command and identical 1,038 files: `packages/*/src/**` branches **84.66 % → 76.62 %** (bar 80) and `apps/landing/src/**` statements **94.21 % → 84.33 %**, branches **91.12 % → 78.71 %**, lines **94.21 % → 84.06 %** (bars 91/89/91). Totals: statements 90,746 → 34,328, lines 90,746 → 31,912, functions 4,103 → 11,014 — a denominator change, not a testing regression (361 files worse, 47 better, 630 unchanged; a 100 %-covered file stays 100 %). **Everything else about the migration is already proven identical, including byte-identical `dist/` and tarballs** (§7.2) | **(a) owner re-baselines the four thresholds against a Vitest-4 measurement, then this packet is re-run from §7.1 — rec.** The numbers to set are in §7.4's "after" table; the same `--coverage.reportOnFailure=true` command reproduces them, and the honest floors are `floor(measured) − 1` as `vitest.config.ts`'s own comment prescribes · (b) hold `vitest@3.2.6` until the ratchet is expressed on a basis-independent instrument (per-file non-decreasing, say) — safe, but it also holds **Vite 8**, which `vitest@3.2.6` cannot accept (§8b) · (c) keep Vitest 4 now and let TASK-R1-O1 discover the four failures — **rejected**: R1-O1 is the critical-path packet and would inherit a gate it did not break and may not fix |
| **D92** 🟠 | **`coverage.reportOnFailure` is `false`, so the coverage ratchet is silently skipped whenever any test fails** (F-8). Not a Vitest-4 issue — it is true today on 3.2.6, and it is why F-4 read as "no coverage report exists". The gate that is supposed to hold 80/80/80/80 has been inert for as long as the three inherited failures have existed | (a) set `reportOnFailure: true` in `vitest.config.ts` so the ratchet is measured and reported even on a red suite, and the number is visible while it is being fixed — **rec.**, but it belongs to the coverage/**R1-O1** packet, not to a toolchain task, because it changes what a gate prints on every red run · (b) leave it and rely on the suite being green — which makes the ratchet's enforcement conditional on the thing it is meant to guard · (c) keep the default but have CI fail when `coverage/` is absent, so a missing report is loud |
| **D93** 🟢 | **The Vitest changeset cannot be empty** (F-9). Phase 1 specified "front-matter with no package lines"; `validate:release-policy` R7 rejects exactly that. The only legal shape for a devDependency-only move names a private/ignored package | (a) when the migration is re-executed, write `.changeset/toolchain-vitest-4.md` naming **`"@dzup-ui/tooling": patch`** and nothing else — private *and* in `.changeset/config.json`'s `ignore`, so it produces no bump and no changelog for any published package, and R4 is satisfied because no released package is named alongside — **rec.** · (b) name the published packages `patch` — a version bump users would receive for a change that moves no published byte (proven: all four tarballs byte-identical) · (c) write no changeset and amend the task's `<done_check>` item 3 |
| **D94** 🟢 | **A zero-occurrence grep is not migration clearance.** Phase 1's pre-flight recorded `experimentalAstAwareRemapping: 0` alongside genuinely removed APIs, and that zero was read as "nothing to do". It proves only that the repository never *set* the option; the breaking change was the option's **removal and its behaviour becoming the default**. The same reasoning applies to `coverage.all`, `coverage.extensions` and `deps.optimizer.web`, all recorded as 0 | (a) for a major-version pre-flight, grep for removed APIs **and** separately diff the *defaults* of every option the repo relies on implicitly — **rec.**; the cheap version is to run the one gate that reads each default (here: the coverage lane) before declaring the pre-flight clean · (b) accept greps as clearance and discover default changes in the ladder, which is what happened — recoverable only because the ladder was actually run |

**Raised by phase 3 (2026-09-18):**

| # | Decision | Options / recommendation |
|---|---|---|
| **D95** 🟠 | **Vite 8 on `vitest@3.2.6` fails *silently*, not loudly — §8b's "vitest rejects Vite 8" is too kind.** `vite` is a **`dependencies`** entry of `vitest@3.2.6` (`^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0-0`), not a `peerDependencies` one, and the same is true of `vite-node@3.2.4`; only `@vitest/mocker@3.2.6` declares it as a peer, and *that* peer would be satisfied by vitest's own nested copy. Today `yarn.lock:18697` reads `"vite@npm:^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0-0, vite@npm:^7":` — **one entry serving both descriptors**, so vitest and the five `^7` workspaces share the single hoisted `vite@7.3.5`. Moving the workspaces to `^8` splits that pair: **`yarn install` would exit 0 with no peer warning**, `yarn build` would use `vite@8.3.0` and every test lane would transform through a nested `vite@7.x`. That is memo trigger **B2** verbatim ("two incompatible Vite majors in one tree"), and **no gate can see it**: `validate:engines` reads the hoisted `vite`'s `engines` (8.3.0, which passes) and `validate:peer-ranges` reads declared peers, not installed duplicates | (a) keep Vite 8 strictly behind **D91**, and when it is attempted, add a **one-major-per-tool assertion** (exactly one resolved `vite` major across the workspace) to the engine/peer validators *inside that packet* — **rec.**, because the assertion is worth having for `vitest` and `vue` too · (b) attempt Vite 8 on `vitest@3.2.6` and accept the split — **rejected**: the ladder would run green over two toolchains and the dist manifest would be comparing a build that the tests never exercised · (c) add the assertion now as a small independent packet, ahead of any Vite work |
| **D96** 🟢 | **Vite 8 has no fired trigger and one untested link, so it is discretionary even after D91.** Memo **B1** is *"Vite 7 leaves security support, or a dependency drops Vite 7 — not 'Vite 8 is out'"*. Measured 2026-09-18: `vite`'s `previous` dist-tag is **7.3.6**, published *after* the installed 7.3.5, so the 7.x line is still shipping; `@vitejs/plugin-vue@6.0.7` admits `^5 \|\| ^6 \|\| ^7 \|\| ^8` and every other build-path plugin still admits `^7`. The one genuinely untested link is **`vite-plugin-dts@4.5.4`, whose peer is `vite: "*"`** — it will install against Vite 8 and has been proven against nothing, and its own 5.x is a separate major with different peers. Vite 8 is also a Rollup → rolldown swap (`vite@8.3.0` deps `rolldown ~1.2.6`), so `contentSha256` *will* move for `core`/`compat`/`tokens` by design | (a) after D91, treat Vite 8 as a **discretionary currency packet** and bind it to the `vite-plugin-dts` 4.x → 5.x decision so the untested link is decided in the same change — **rec.** · (b) execute Vite 8 immediately after D91 purely for currency, keeping `vite-plugin-dts@4.5.4` — accepts an unproven peer at the exact point the `.d.ts` bytes are the stop condition · (c) wait for B1 to fire, and meanwhile keep the dist-manifest instrument (D87) exercised by whatever toolchain work does land |
| **D97** 🟢 | **D91 should not be signed off a single Vitest-4 reading.** `vitest.config.ts`'s own comment above these thresholds says the percentages are *"NOT reproducible to the decimal"*, that the function **total** moves between runs (it records 1,953 / 2,051 / 2,343 for one tree), and that the rule is *"measure with CI's own command, take the LOWEST reading, and leave a point of margin"*. Phase 3 supplied the **second Vitest-3 reading** (§8c): the two agree to 0.02 pt on `packages/*/src/**` but differ by up to **0.51 pt** on `apps/landing/src/**`, whose function total moved **2,035 → 2,084**. The **Vitest-4 side still has exactly one reading** (§7.4), and it is the side four numbers would be set from | (a) before taking D91, run the identical `--coverage.reportOnFailure=true` command at least once more **on Vitest 4**, then set each bar to `floor(min observed) − 1` per that file's own rule — **rec.**; the Vitest-3 side is now corroborated and needs nothing further · (b) set the bars from §7.4's single reading and accept a wider margin instead (e.g. `floor(measured) − 3`) — cheaper, but it lowers the ratchet further than the evidence requires · (c) express the ratchet per-file non-decreasing so it stops depending on an aggregate basis at all — the durable fix, and a real packet rather than a threshold edit (see D91 option (b)) |

Probe verdicts are recorded as decisions too, because both end in a recommendation an owner may want to take:

| # | Decision | Options / recommendation |
|---|---|---|
| **D88** 🟢 | **`@storybook/addon-mcp` (P-612): WATCH.** 0.7.0 installs against Storybook 10.5.1 with no upgrade and its dev/testing tools work on Vue, but its docs toolset returns an **empty** manifest record for every Vue component (`{id, name}` only, in dev *and* in a built Storybook), against `@dzup-ui/mcp`'s full prop/event/slot tables | (a) keep `@dzup-ui/mcp` as the API surface and re-probe at Storybook ≥ 10.6 — **rec.**; (b) adopt the addon now for story authoring only (dev toolset), accepting a second MCP surface; (c) drop the watch item |
| **D89** 🟢 | **Context7 (P-613): WATCH, with one act available now.** Not indexed (404), no `context7.json`, no per-page `.md` endpoints on the docs site — but **the GitHub repository is public**, so a third party can submit it and an unconfigured crawl would index `CHANGELOG.md`, `docs/adr/` and this program's handoffs as documentation | (a) land a minimal `context7.json` as a **control** before any submission — either `disallow: true` or N2-A3's `folders`/`excludeFolders` draft — and keep submission sequenced after the docs deploy — **rec.**; (b) do nothing until R1-O5 deploys the site (N2-A3's original sequencing); (c) submit now — not recommended, and outside any agent's authority. Note for whoever writes the file: `branchVersions` from the N2-A3 table is **not** in the published schema and would be rejected |

---

## 11. Worktree custody

| Moment | `git status --short` | `git diff HEAD \| sha256sum` |
|---|---|---|
| **START** 2026-09-17 17:26 UTC | **280** lines | `2359cd5420dea0c9…` |
| after `yarn test`, after `test:ssr`, after chain A (build ×2, validators, fixtures) | 282 (`-uall`) — unchanged | `2359cd5420dea0c9…` (identical) |
| after the P-612 probe install **and restore** | identical porcelain and identical diff hash (§5) | `2359cd5420dea0c9…` |
| **END** | see below | |

*Phase 1 ended without writing this row. Phase 2 filled it from phase 1's own
recorded artefacts (`git-porcelain-chainC-after.txt`,
`git-diff-sha-chainC-after.txt` in the phase-1 scratchpad) rather than
re-deriving it, and then re-measured the same tree at its own start.*

| Moment | `git status --porcelain -uall` | `git status --short` | `git diff HEAD \| sha256sum` |
|---|---|---|---|
| **phase-1 START** 2026-09-17 17:26 UTC | 282 | 280 | `2359cd5420dea0c9…` |
| **phase-1 END** 2026-09-17 21:24 UTC (after chain C) | **290** | — | **`a8ec0f7b70d26346…`** |
| **phase-2 START** 2026-09-18 09:30 UTC | 290 | **282** | **`a8ec0f7b70d26346…`** |

The diff hash moved once during phase 1 (chain B/C) and **has not moved since**:
phase 2 opened on exactly the tree phase 1 closed on, so every phase-1 number in
§4 is still bound to the tree phase 2 measured against. The +8 `-uall` paths
between phase-1 START and END are other packets' generated files touched by the
`test:prepare` step that `yarn test` / `yarn test:contracts` run
(`tokens:generate` + the landing count build); none of them is a phase-1 edit.

### Phase-2 custody

| Moment | `git status --porcelain -uall` | `git status --short` | `git diff HEAD \| sha256sum` |
|---|---|---|---|
| **phase-2 START** 2026-09-18 09:30 UTC | 290 | **282** | **`a8ec0f7b70d26346…`** |
| migration applied (8 tracked files + `node_modules/.yarn-state.yml`) | 297 | 289 | `f614cc04c229c628…` |
| **phase-2 END** — after the revert | **291** | **283** | `ebe862b455bf4723…` |

**The +1 and the changed hash are this phase's write-ups, not residue.** The
porcelain diff against phase-1 END is a single line — ` M
docs/program-2026-09/reports/N5-03-toolchain-migration-memo.md`, the memo status
section the task's `<success_criteria>` asks for — and the diff hash moves because
that memo plus `EXECUTION-STATUS.md` are *tracked* files carrying required
documentation. **Every file the migration itself touched is byte-identical to
START (13/13), as are both phase-1 baseline hash sets (55/55).** Full proof in
§7.8.

No commit, stash, checkout, revert, clean or branch operation was performed in
either phase. Phase 1's only dependency change was the P-612 probe install;
phase 2's was the Vitest 4.1.11 install — **both restored and verified
byte-identically**. The only files the two phases add to the repository are this
handoff, the `TASK-R5-O9-baseline/` directory, and the ledger rows.

Phase 2 also honoured the two custody hazards phase 1 recorded, and both fired
exactly as predicted:

| Hazard | Fired? | Handling |
|---|---|---|
| **F-1** — `validate:tree-shake` deletes the tracked `.tree-shake-test/{entry.ts,vite.config.ts}` | **yes** | backed up before the gate, restored immediately after; `sha256sum -c` **OK** on both; `git status .tree-shake-test/` clean |
| **F-7** — `yarn storybook:build` rewrites the tracked generated `apps/storybook/stories/_data/playgroundSnippets.generated.ts` | **yes** (the fresh render differs from the worktree copy again) | backed up before the build, restored after; `sha256sum -c` **OK** |
| `apps/storybook/stories/_data/anatomy.generated.ts` (already dirty at START — another packet) | not rewritten | hashed at START, **OK** at END |

### Phase-3 custody

**Phase 3 changed no dependency and no config, so its custody claim is a single
equality rather than an argument** — which is exactly what phase 2's method note
asked the next phase to produce.

| Moment | `git status --porcelain -uall` | `git status --short` | `git diff HEAD \| sha256sum` | **`git diff HEAD -- . ':(exclude)docs'`** |
|---|---|---|---|---|
| **phase-2 END** 2026-09-18 ~11:2x UTC | 291 | 283 | `ebe862b455bf4723…` | *(not recorded by phase 2)* |
| **phase-3 START** 2026-09-18 **11:34:39 UTC** | **291** | **283** | **`2319a02df2eef322…`** | **`fea9485e3c559ace…`** |
| after the coverage lane (§8c) | 291 — identical | 283 | `2319a02d…` — **identical** | `fea9485e…` — identical |
| **phase-3 END** 2026-09-18 **11:55:23 UTC** | **291** | **283** | `3b56d8a6544909c8…` | **`fea9485e3c559ace…` — UNCHANGED** |

**The load-bearing number is the last column.** `git diff HEAD -- . ':(exclude)docs'`
— the whole worktree diff *minus documentation* — is **byte-identical at phase-3
START and END**. Every phase-3 edit is therefore provably confined to three
documents, and the whole-tree hash movement `2319a02d…` → `3b56d8a6…` is exactly
the two *tracked* ones this task requires (`EXECUTION-STATUS.md` and the N5-03
memo; this handoff is untracked and never enters `git diff HEAD`). The porcelain is
**identical at both ends** — `diff` exit 0 on the full 291-line listing.

**The phase-2 END → phase-3 START hash difference, explained rather than rounded
off.** Phase 2 recorded its END as `ebe862b4…`; the owner's handover reading was
`ae7baecf…`; phase 3 opened on `2319a02d…`. **Three hashes, one porcelain.** That
can only mean edits to files already listed as modified, and it is documentation:

- the **porcelain is identical (291 / 283)** across all three, so no path was added, removed or re-classified;
- **no tracked file outside `docs/` has an mtime later than 2026-09-17 19:07** — i.e. nothing in the source tree moved during or after phase 2;
- `docs/program-2026-09-04/EXECUTION-STATUS.md` was last written at **11:33:49 UTC**, roughly **one minute before** phase 3's first reading, and the N5-03 memo at 10:34 UTC.

So phase 2's account — that it took its END hash before writing its ledger edit —
is **consistent with every observable**, and the owner's subsequent edits account
for the rest. It is confirmed structurally, not assumed. **This is also the reason
phase 3 records the non-documentation hash: a whole-tree hash cannot be an
invariant in a repository whose deliverables are tracked documents.** Future
phases should quote the `':(exclude)docs'` hash as the custody number and the
whole-tree hash only as context.

**Hazard files — all eight verified byte-identical at END** (`sha256sum -c`, exit 0):

| File | Why it is on the list | Result |
|---|---|---|
| `.tree-shake-test/entry.ts`, `.tree-shake-test/vite.config.ts` | **F-1** — `validate:tree-shake` deletes them | **OK** — and **F-1 did not fire**: the gate was not run |
| `apps/storybook/stories/_data/playgroundSnippets.generated.ts` | **F-7** — `storybook:build` rewrites it | **OK** — and **F-7 did not fire**: no build was run |
| `apps/storybook/stories/_data/anatomy.generated.ts` | already dirty (another packet) | **OK** |
| `DESIGN.md`, `apps/landing/src/generated/counts.ts` | rewritten by `yarn test:prepare`, which `test:coverage` runs | **OK — regenerated byte-identically.** Their mtimes moved (13:39 local); their contents did not. Worth recording: on this tree the generators are idempotent, so the +8 `-uall` drift phase 1 saw was a one-off, not a per-run tax |
| `README.md`, `apps/landing/index.html` | also written by `build-counts.ts` | **OK** — untouched |

**No commit, push, stash, checkout, revert, clean, branch operation, CI dispatch,
publication or threshold re-baseline** was performed in phase 3, and **no
`yarn install`, `yarn add` or lockfile write** of any kind. Phase 3 is the only
phase of this task that changed nothing outside its own write-ups.

---

## 12. Ratchets, aggregate qualification, and the next packet

### 12.1 Ratchet movements

**None moved, in any of the three phases.** Phase 2 ended with the tree
byte-identical to its start; phase 3 changed nothing at all. **No threshold,
budget, ceiling or bar was re-baselined by this task** — that is an owner act, and
it is the whole of what D91 asks for. What *did* change is the evidence behind two
numbers that were previously unmeasured, and that is the substantive product of
phases 2–3 besides the two refusals:

| Ratchet | Before phase 2 | After phase 2 | **After phase 3** | Note |
|---|---|---|---|---|
| coverage `packages/*/src/**` **bars** | 80 / 80 / 80 / 80 | unchanged | **unchanged — 80 / 80 / 80 / 80** | never touched by any phase |
| coverage `apps/landing/src/**` **bars** | 91 / 89 / 80 / 91 | unchanged | **unchanged — 91 / 89 / 80 / 91** | never touched by any phase |
| coverage `packages/*/src/**` *measurement* (Vitest 3) | **unmeasured** — F-4 said the lane produces no report | **87.10 / 84.66 / 87.33 / 87.10** — one reading | **two readings**; second **87.08 / 84.65 / 87.33 / 87.08** | agreement to **0.02 pt**; headroom comfortable on every metric |
| coverage `apps/landing/src/**` *measurement* (Vitest 3) | **unmeasured** | **94.21 / 91.12 / 82.46 / 94.21** — one reading | **two readings**; second **94.11 / 91.14 / 82.97 / 94.11** | spread up to **0.51 pt**, function total 2,035 → 2,084 — the instability `vitest.config.ts` documents. The tightest metric, landing `functions`, **gained** headroom (2.46 → **2.97** pt) |
| coverage *measurement* (Vitest 4) | — | **83.04 / 76.62 / 86.83 / 82.50** and **84.33 / 78.71 / 84.05 / 84.06** — **one** reading (§7.4) | **still one** — phase 3 did not re-install Vitest 4 | **D97**: the side the four numbers would be set from is the side with the least evidence |
| `validate:dts` | 272 `.js` / 862 `.d.ts`, exit 0 | unchanged | **unchanged — 272 / 862, exit 0** | re-run by phase 3 as the **B3** trigger test |
| `validate:all` links / first red | 43 links, first red 19 | **unchanged: 43 / 19** | unchanged by construction (not re-run — nothing changed) | re-measured by phase 2 post-migration *and* post-revert |
| changesets pending | 31 | **31** | **31** | none written in any phase — no migration was kept (**D93** has the legal shape for when one is) |
| dependencies changed, net | — | **0** (applied, then reverted byte-identically) | **0** (none attempted) | phase 3 ran no `yarn install` at all |

### 12.2 Aggregate qualification

**Phase 3 added two commands and no risk** (§8d): `yarn validate:dts` (exit 0,
272/862 — the **B3** trigger test) and one coverage lane on the unchanged tree
(exit 1, the same three inherited failures, **a full report and zero threshold
errors**). It deliberately did **not** re-run the ladder, because it changed
nothing for a ladder to qualify — and as a direct consequence **neither F-1 nor
F-7 fired**. Everything below is therefore still the authoritative aggregate, and
phase 3 added **no new red**.

**What ran:** the complete phase-2 ladder — `typecheck`, `lint`, `test`,
`test:ssr`, `test:contracts`, `test:a11y`, `storybook:test`, `build` + the dist
hash manifest, `validate:{dts,externals,bundle,tree-shake}`,
`report:component-sizes(:ci)`, `test:nuxt-fixtures:{pack,install}` + the
fixtures, `storybook:build`, the 21-project Playwright static matrix,
`validate:all` end to end, and the coverage lane **twice on each side** of the
migration. Each was run to a log file with its exit code read directly; **no gate
result was read through a pipe**.

**What is still red, and why — all pre-existing, none caused by this phase:**

| Red | Owner |
|---|---|
| `yarn test` 3 failures (high-contrast snapshot · 6 landing token fallbacks · `story-dod-tiers countOpen`) | R5-O7 / landing tokens / story-dod packets — the inherited set the R5-O3/R3-O4 rows record |
| `validate:tree-shake` 3 FAILs (`DzInput`/`DzSelect`/`DzAlert` carry the `DzDataGrid` sentinel) | **F-2** — probable substring artefact of `i18n/messages.ts`'s catalog keys; a separate small packet (**D87b**) |
| `validate:all` link 19/43 `validate:capability-matrix` (22 stale cells · tier-D `DzFileUpload` · freshness) | the capability-matrix packet; the known-red the ledger attributes to `a01965f` |
| `storybook:test` 5 stories | **F-5** — two are R3-O3's `AsyncOptions` play stories, verified in jsdom only |
| Playwright matrix failures | 30 of them are the visual lane needing a `DZUP_GALLERY=1` build (§4d); the rest are `anatomy-parts`, webkit `DzTabs` keyboard, one firefox focus assertion and one forced-colors cell |
| coverage lane prints nothing | **F-8 / D92** — `reportOnFailure: false` plus the three failures |

**Maturity of every number in this document:** *locally qualified on Node
24.14.1, Windows 11, 16 CPUs*, against `569d887` plus several other packets'
uncommitted work. **Nothing here is CI evidence, release evidence, or floor
evidence** — the declared floor (`^20.19.0 || >=22.13.0`, ADR-18) was not
exercised, and no agent may dispatch the `validate-min-runtime` job that would.

### 12.3 Ranked next packet

1. **[!owner] D91 — take or refuse the coverage re-baseline.** After phase 3 it is
   the **sole remaining blocker on this entire task** (§12.4). It is the only thing
   standing between this repository and a proven, faster, byte-neutral Vitest 4,
   and it also gates **Vite 8** (§8b cannot begin on `vitest@3.2.6`). The
   measurement is in §7.4 — now with a **corroborated Vitest-3 side** (§8c) — and
   the re-execution is §7.1, nine lines across eight files. **Do D97 first:** take
   one more Vitest-4 reading before fixing any of the four numbers.
2. **D92 — set `coverage.reportOnFailure: true`** (one line, `vitest.config.ts`).
   Best folded into **TASK-R1-O1**, which is already in that file's territory and
   whose success is what makes the ratchet observable again. Until it lands, the
   80 % bar is decorative whenever anything is red.
3. ~~**TASK-R5-O9 phase 3**~~ — **done, 2026-09-18.** tsdown **refused** with a
   dated measurement and a three-condition re-evaluation trigger (§8a, **D85**
   option (a) taken); Vite 8 **blocked behind D91**, not refused, with the
   sequencing hazard recorded (§8b, **D95**/**D96**). Nothing further to schedule
   here.
4. **F-2 / D87(b)** — fix `validate:tree-shake`'s substring sentinel and
   `validate:bundle`'s inert `index.css` budget (F-3). Small, self-contained, and
   it converts two permanently-misleading gates into real ones — which every
   future toolchain phase needs, because they are the gates a bundler swap must
   be compared on. **Phase 3 promotes this above the Vite 8 work**: two of the six
   classifiers a bundler swap is judged on are currently lying, so fixing them is
   a *precondition* for reading a Vite 8 attempt honestly.
5. **Vite 8 (§8b), after D91 — discretionary, not owed.** No trigger has fired
   (**D96**: `vite@7.3.6` shipped after the installed 7.3.5 and every build-path
   plugin still admits `^7`); the byte instrument is ready and proven (**D87**);
   the sequencing hazard is **D95**. Bundle it with the `vite-plugin-dts`
   4.x → 5.x decision.
6. **D86 / D94** — amend this task's `<done_check>` to the exit-code-honest block
   in §1, and add the "defaults diff" step to the major-upgrade pre-flight. Note
   that check 2 (`grep … "tsdown\|\"vite\": \"^8"`) now returns *no match*
   **permanently, by design**: the §8a refusal **is** its pass condition, and the
   grep cannot see it — so a future agent reading that check literally will
   conclude "not done" about work that is finished.

### 12.4 The exact state of TASK-R5-O9 after phase 3

**`[!]` — the task's `<scope>` is complete except for one owner decision, D91.**
Item by item against `<success_criteria>`:

| Criterion | State |
|---|---|
| *"each memo item executed … or refused with a dated, measured reason"* | **Track A** executed in full, then refused (§7, dated 2026-09-18, measured) · **tsdown** refused (§8a, dated 2026-09-18, measured, with a re-evaluation trigger) · **Vite 8** blocked behind D91 (§8b) — not refused, because it has no measured defect, only an unsatisfiable precondition · Tracks C/D/E/F are outside this task's `<scope>` and are recorded as such in the memo's §11 |
| *"no gate less green than the baseline"* | **satisfied** — every gate was returned to, or never left, its baseline result; the non-documentation worktree diff is byte-identical (§11) |
| *"both probes recorded with a verdict and a recommendation"* | **satisfied** — P-612 (§5, **D88**, WATCH) and P-613 (§6, **D89**, WATCH + one act available now); nothing was submitted or published |
| *"the memo updated with a status column"* | **satisfied** — `N5-03-toolchain-migration-memo.md` §11 carries all six tracks, and both Track-B rows now carry a phase-3 disposition |
| *"a changeset per **executed** migration"* | **vacuously satisfied** — no migration was kept, so none is owed. **D93** records the only legal shape (naming `@dzup-ui/tooling`, which is private *and* ignored) for when one is |

**The single remaining item is D91**, and it is an owner act by construction: it
asks for four ratcheted numbers to be lowered against a measurement basis that did
not exist when they were set, under a comment in `vitest.config.ts` that forbids
exactly that edit. No further agent work unblocks it. **D97** says what to do
first — take one more Vitest-4 reading, then set each bar to
`floor(min observed) − 1` as that file's own rule prescribes.
