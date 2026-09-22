# TASK-R1-O1 — A truthfully green committed tree (handoff)

> Program: [2026-09-04](../README.md) · Task file: [`release-exit-tasks.md`](../release-exit-tasks.md)
> **Baseline observed: `main` @ `527dbd1` (`527dbd150036b5f07bd69e672825ff14ec3a592d`), clean worktree, 0 ahead / 0 behind `origin/main`.**
> The README's stated baseline `99b963a` is four commits stale (`a01965f`, `569d887`, `2d51eec`, `527dbd1` landed the R3/R5 and R2 programme work).
> **Every number in this report binds to `527dbd1`, not to the README.**
> Nothing is committed. The work sits in the working tree for the owner.

---

## 0. `<done_check>` at `527dbd1` — 0 of 7 passed

| # | Check | Result at `527dbd1` | Verdict |
|---|---|---|---|
| 1 | ownership manifest `sourceCommit` == `git rev-parse HEAD` | `2d51eec4…` vs `527dbd15…` | **FAIL** |
| 2 | `validators/capability-matrix.ts` exit 0 | exit 1 — committed artifact stale vs a fresh build | **FAIL** |
| 3 | `yarn test` exit 0 | exit 1 — **3** failed files / **3** failed tests of 543 / 10,237 | **FAIL** |
| 4 | `tsc -p packages/tooling --noEmit` exit 0 | exit 2 — **18** errors in 12 files (not 7) | **FAIL** |
| 5 | `eslint e2e/` exit 0 **and** root `lint` targets `e2e/` | exit 1 — 9 errors in 2 files; `lint` = `eslint packages/ apps/ --max-warnings 0` | **FAIL** |
| 6 | 0 tracked `.js`/`.d.ts`/`.map` under `packages/core/src/providers` | **12** | **FAIL** |
| 7 | `validate:at-scripts` **and** `validate:tree-shake` in `validate:all` | `at-scripts` yes, `tree-shake` **no** | **FAIL** |

Chain length at `527dbd1` = **44 links** (counted from `package.json`; the prompt's
"37" is the 2026-09-04 figure and must not be quoted). Now **47**.

**The prompt named two failing specs; there were three.** The third,
`dzup-resolution.spec.ts`, arrived with the R5 styling work in `a01965f` and no
predecessor report mentions it.

---

## 1. Discovery record

### 1a. The stamp defect (N0-05 F1 / D1) — two things, only one fixable

| | Nature | Fixed here? |
|---|---|---|
| **(a) Copied binding** | `generate-quality-matrix.ts:193` set `sourceCommit: manifest.sourceCommit`; `generate-capability-matrix.ts:973` set `sourceCommit: quality.sourceCommit`. Neither asked git. A matrix regenerated four commits after the manifest still claimed the manifest's commit, and every "N commits behind" statement derived from the chain inherited the **oldest** hash in it. | **Yes.** Each generator now calls one shared `headCommit()`. No schema change. |
| **(b) Off-by-one at commit time** | `generate:ownership` already wrote `git rev-parse HEAD` correctly. The artifact is written in the working tree at `HEAD = X` and lands as commit `X+1`, so a *committed* artifact always stamps its own parent. No generator can do better: the commit it should name does not exist while the file is being written. | **No — structural.** Owner decision **1**. |

Three private copies of the same three lines existed (`gitHead()` in
`generate-ownership-manifest.ts`, `headCommit()` in `generate-component-meta.ts`,
and nothing at all in the two matrices). There is now one, in
`packages/tooling/src/quality/git.ts`, next to `lastCommitFor` and
`evidenceIsCurrent` where the other git questions already live.

### 1b. First-failing-link record at `527dbd1`, before any edit

`validate:capability-matrix` (link 20 of 44) — `✗ [freshness]
packages/core/docs/capability-matrix.json is stale`. Continuing the chain
manually past it, every later link passed except the ones this task added.
**The stale-cell count was never the failure**: the validator does not fail on
stale cells, it fails when the *committed* artifact disagrees with a fresh
build. It reported `37 stale cell(s)` and still exits 0 today.

### 1c. What the committed matrix was claiming — the S1-F10 defect, measured

| | `pass` | `stale` | `present` | `unrun` | `excepted` |
|---|---|---|---|---|---|
| Committed at `527dbd1` (stamped `2d51eec`) | **585** | **22** | 597 | 441 | 17 |
| Regenerated at HEAD | **570** | **37** | 597 | 441 | 17 |

**15 cells were committed as `pass` that a fresh build calls `stale`.** The
committed artifact was over-claiming browser evidence for components that
`527dbd1` changed after the evidence was captured. That is exactly the failure
S1-F10 describes, and it is the reason nothing in this program may quote a
number taken before this regeneration.

### 1d. The stale cells — 37, none of them fakeable

`<no_fake_freshness>` forbids editing an artifact to make a validator pass.
Every stale cell needs a **lane re-run**, not an edit:

| Cell kind | Count | Why stale at `527dbd1` | Refreshed by | State after |
|---|---|---|---|---|
| `browser-matrix` | **15** | 24/24 Playwright projects measured green at `2d51eec` (worktree dirty); `527dbd1` then changed the component. `evidenceIsCurrent` correctly reports the evidence as predating the change. | **TASK-R2-O1** (`yarn test:e2e`, 18 projects) | stale (visible, reasoned) |
| `perf-baseline` | **22** | Thresholds are derived, not captured; needs a ≥5-run median capture behind `DZUP_PERF_GATE` (N0-05 **F5**) | **TASK-R2-O7** | stale (visible, reasoned) |
| `visual` (a per-row field, not a cell) | **8** | The seven button-family rows plus `DzButtonGroup`; no accepted baseline at HEAD | **TASK-R2-O6** | stale (visible, reasoned) |

Components, for the record —
`browser-matrix`: DzAnchor, DzBlockUI, DzButton, DzCombobox, DzCommandPalette,
DzMegaMenu, DzMention, DzOtpInput, DzPasswordInput, DzPopconfirm, DzProvider,
DzResizable, DzSplitter, DzTree, DzTreeItem.
`perf-baseline`: DzCalendar, DzCascader, DzColorPicker, DzCombobox,
DzCommandPalette, DzDataGrid, DzDataView, DzDatePicker, DzDateRangePicker,
DzFileUpload, DzMegaMenu, DzMention, DzMultiSelect, DzOrderList,
DzPersonaSelector, DzSidebar, DzTable, DzTimePicker, DzTour, DzTransfer,
DzTree, DzTreeSelect.
`visual`: DzButton, DzButtonGroup, DzCopyButton, DzFab, DzIconButton,
DzSpeedDial, DzSplitButton, DzToggleButton.

The prompt's "12 stale cells (7 button-family `visual`, `DzOrderList` perf, +4)"
is the `99b963a` figure. The same three classes; the counts grew because three
commits landed after the evidence runs. **R2 already executed these lanes**
(2026-09-19) — the cells went stale again the moment `527dbd1` landed. See
owner decision **3**.

---

## 2. Implemented files + API effect

**26 files changed by hand, 4 added, 14 deleted, 155 regenerated.**
No public runtime API changed. No component source was touched.

### 2a. The stamp (4 files)
- `packages/tooling/src/quality/git.ts` — **new export `headCommit()`**, documented with what it does and does not fix.
- `packages/tooling/src/quality/generate-quality-matrix.ts` — stops copying `manifest.sourceCommit`.
- `packages/tooling/src/quality/generate-capability-matrix.ts` — stops copying `quality.sourceCommit`.
- `packages/tooling/src/meta/generate-component-meta.ts`, `packages/tooling/src/ownership/generate-ownership-manifest.ts` — private copies deleted, both call the shared helper.

### 2b. The three failing specs (4 files, fixed at the defect; none deleted or skipped)
- `packages/tooling/src/validators/story-dod-tiers.spec.ts` — **`countOpen` now reads a fixture.** It used to call `triage()` and pick `summary.items.find(i => i.required)!` out of the live repository; TASK-N1-O1 drove the ratchet to **0**, so that became `undefined!` and the suite failed *as the reward for finishing the work it measured*. The fixture is 6 hand-built items (4 required across 3 checks, 2 advisory); 2 tests became **9**, covering per-check reporting, a waiver that matches, one that does not, an advisory item, and the empty case that used to crash. The live repository is still asserted, in one clearly-labelled invariant test that is honestly vacuous at 0.
- `apps/landing/src/pages/ThemesPage.vue`, `apps/landing/src/components/themes/ThemesHeroField.vue` — **6 fallback hexes corrected.** The spec was already right: it resolves each token through `packages/tokens/dist/tokens.css` and converts `oklch()` to sRGB rather than comparing to a hard-coded list, exactly as `<tests>` requires. The defect was in the landing source. Re-verified against a **freshly rebuilt** `tokens.css` first, so the "should be" values are not themselves stale: `--dz-secondary` `#0766ee`→`#7260bd` (it was falling back to the *primary* brand blue), `--dz-success` `#007146`→`#1c882d`, `--dz-colors-primary-400` `#4b93f3`→`#5195ff` (×2), `--dz-colors-secondary-400` `#8a79d6`→`#978bda`, `--dz-colors-secondary-600` `#5b4a9e`→`#5c4a9e`.
- `packages/tooling/src/resolution/dzup-resolution.spec.ts` — **one line** added to the inline snapshot: `@dzup-ui/tokens/css/high-contrast`. Verified first that the subpath is a legitimately declared export (`packages/tokens/package.json` → `./dist/tokens.high-contrast.css`, landed in `a01965f`, file present after build). The spec's own comment asks for exactly this. Not a defect — a snapshot the declaring change forgot.

### 2c. The 18 tooling type errors (10 files)
Fixed at the defect; **no `@ts-ignore`, `@ts-expect-error`, `as any` or blind `!`**.
Two were real bugs rather than fixture noise:
- `packages/tooling/src/quality/accept-visual-baseline.ts` — `record()` takes `file` as its own parameter and writes it into the entry, but the `fields` type never `Omit`ted it. Signature corrected.
- `packages/tooling/src/quality/story-dod-triage.ts` — `byCheck` was being written through a `Readonly<>` index signature; now built mutable and returned as the readonly view.

The rest were fixture gaps (`task`, `file`, `providerHooks`, `requiredPairs`),
two `?.` narrowings, an index signature on `GridRow`, a `NonNullable<>`, and an
optional parameter replacing a write to a readonly property. Files:
`docs/evidence.spec.ts`, `ownership/anatomy-source.{ts,spec.ts}`,
`perf-bench.spec.ts`, `playground/playground.spec.ts`,
`validators/{at-matrix,component-meta,vendor-sublayers}.spec.ts`.

### 2d. The two `messages.ts` errors were not type errors at all — `tsc -p packages/tooling` was reading a gitignored build
`TS2717`/`TS2353` on `packages/core/src/i18n/messages.ts` were a `declare module`
augmentation in the **live source** merging against a *different* one in
`packages/core/dist/i18n/messages.d.ts`. Tracing it (`tsc --explainFiles`):
`packages/tooling/src/perf-bench.spec.ts` imports `@dzup-ui/core/data`; the path
mapping `"@dzup-ui/core/*": ["./packages/core/src/*"]` misses, because a family
subpath lives under `src/components/`, not `src/`; TypeScript falls through to
node_modules → `exports` → `dist/**`. **661 gitignored build files were in the
typecheck program.**

- `tsconfig.base.json` — second candidate added: `"@dzup-ui/core/*": ["./packages/core/src/*", "./packages/core/src/components/*"]`.
- Result: `packages/core/dist` files in the program **661 → 0**, errors **2 → 0**, with **no source edit**. `yarn typecheck` (vue-tsc on core) re-verified at **exit 0** afterwards.

This is the difference between a gate that is green and a gate that is green for
a reason: before the change, `tsc -p packages/tooling` passed or failed depending
on whether someone had run `yarn build` recently. On a fresh clone there is no
`dist/` at all.

### 2e. Lint scope (3 files)
- `package.json` — `lint` and `lint:fix` now target `packages/ apps/ e2e/`.
- `e2e/smoke/storybook.spec.ts`, `e2e/utils/storybook.ts` — 9 errors fixed as defects, **no disable comments**. 6 were stylistic (autofixed). The 3 unused variables were each traced through git history: `sidebar` and `storybookSidebar` were born dead in `4cd1790` with no assertion ever attached (`page.locator()` is lazy, so the calls had no side effect) and were deleted with their intent folded into the surviving `nav` assertion; `frame` was orphaned by `2c6c146`, which moved the wait it fed into `loadStoryCanvas()` — the `await` is kept, only the dead binding dropped. An `_`-prefix would have been dishonest in all three cases. No `expect` was added or removed.
- Combined `eslint packages/ apps/ e2e/ --max-warnings 0` → **exit 0**, so widening the target introduced no new debt.

### 2f. The 12 leftovers, and the gate that stops the next 12 (4 files)
Deleted from the index: `DzThemeProvider.types.{d.ts,js,js.map}`,
`index.{d.ts,js,js.map}`, `theme-script.{d.ts,js,js.map}`,
`useTheme.{d.ts,js,js.map}` under `packages/core/src/providers/`. Confirmed
unreferenced first — every live reference points at `./dist/providers/index.js`.

- **New** `packages/tooling/src/validators/tracked-build-output.ts` + script `validate:tracked-build-output`, chained at **link 4**.
- **New** `packages/tooling/scripts/tracked-build-output-allowlist.json` — data, not code. 5 hand-written exceptions, each with a reason: three `env.d.ts` ambient declarations and the `release-parser.mjs`/`.d.mts` pair that is plain JS on purpose so a `node`-run `.mjs` and a `tsx`-run `.ts` can share one changelog parser.
- **New** `packages/tooling/src/validators/tracked-build-output.spec.ts` — 21 tests.

Design points worth keeping:
- It reads **`git ls-files`, not the filesystem** — `dist/` and a local scratch build are nobody's business; only what a clone receives is a violation.
- **A `.map` can never be allowlisted.** No sourcemap is hand-written, so the escape hatch cannot re-admit the exact class of file the gate exists for. There is a test that puts a `.map` on the allowlist and asserts it still fails.
- The allowlist is itself gated: every entry needs a non-empty reason and must still be tracked, so it cannot rot unnoticed.

### 2g. `.tree-shake-test/` — the same defect, found while chaining
`validate:tree-shake` writes `entry.ts` and `vite.config.ts` from scratch on
every run and then `rmSync`s the directory. **Both files were tracked.** A
validator that overwrites and deletes committed files leaves the worktree dirty
(or short two files) whenever the cleanup wins the race — precisely the
flakiness that would have kept this gate out of the chain. Untracked, and
`.tree-shake-test/` added to `.gitignore` with the reason.

### 2h. Chain (1 file)
`validate:all` **44 → 47 links**:

| Link | Added | Why here |
|---|---|---|
| 2 | `yarn typecheck:tooling` | New script. `yarn typecheck` is `vue-tsc -p packages/core/tsconfig.json` — **`packages/tooling` was never type-checked by the chain at all**, which is how 18 errors accumulated unseen. Next to the other typecheck. |
| 4 | `yarn validate:tracked-build-output` | Before every content validator: what is *in* the tree is prior to what the tree says. ~1 s. |
| 47 | `yarn validate:tree-shake` | Last. It is the only link that runs four Vite builds (**54 s**, measured, exit 0) and it needs no artifact, so it costs nothing to defer and would otherwise delay every cheaper failure. |

`validate:at-scripts` was already in the chain at link 19 — the prompt's claim
that it was missing is stale.

**Nothing was excluded.** Both validators `<chain>` names are now in.

---

## 3. Focused validation output

Every command run unpiped, exit code read directly (`cmd > log 2>&1; echo "exit $?"`).
`npx` is unusable in this repo — it fetches a dependency-confusion placeholder
that prints "This is not the tsc command you are looking for" and exits 1,
which reads exactly like a failing gate. All invocations below are by module path.

| Gate | Before (`527dbd1`) | After |
|---|---|---|
| `validators/capability-matrix.ts` | exit 1 (artifact stale) | **exit 0** |
| `validators/tracked-build-output.ts` | (did not exist) | **exit 0** — 5 declared exceptions |
| `tsc -p packages/tooling --noEmit` | exit 2, 18 errors | **exit 0**, 0 errors, 0 `dist` files in the program |
| `yarn typecheck` (vue-tsc, core) | exit 0 | **exit 0** (re-verified after the `paths` change) |
| `eslint e2e/ --max-warnings 0` | exit 1, 9 errors | **exit 0** |
| `eslint packages/ apps/ e2e/ --max-warnings 0` | (not a target) | **exit 0** |
| `story-dod-tiers.spec.ts` + `tracked-build-output.spec.ts` | 1 failing / n-a | **exit 0**, 44 tests |
| `landing-token-fallbacks.spec.ts` | exit 1 | **exit 0**, 9 tests |
| `dzup-resolution.spec.ts` | exit 1 | **exit 0**, 24 tests |
| `yarn validate:tree-shake` | not chained | **exit 0** in 54 s, 4/4 components pass |

### Seeded-failure proof for the new gate (`<steps>` 4)

Two files seeded into the index with `git add -N`
(`packages/contracts/src/__seeded-build-output.js` and `….js.map`) — a package
that had none:

```
✗ packages/contracts/src/__seeded-build-output.js is tracked build output (.js)
  → git rm --cached … and delete it (ADR-12: dist/ is published, never committed)
  → if it is genuinely hand-written, add it to …allowlist.json with a reason
✗ packages/contracts/src/__seeded-build-output.js.map is tracked build output (.js.map)
  a sourcemap is never hand-written: delete it — the allowlist does not cover `.map`

2 tracked build-output file(s) under packages/*/src.        exit 1
```

Index restored afterwards and verified byte-identical to the pre-seed
`git status --porcelain`. The permanent proof is the 21-test spec, which seeds
all twelve original filenames plus single files in four other packages.

---

## 4. Aggregate qualification

**Locally qualified only.** A green local run is never CI, release or production
evidence (`<evidence_rules>`), and none of this has been committed, packed or
published. What follows is the *aggregate-qualified* rung of the maturity
ladder and no higher.

| Lane | Result at HEAD, working tree | Read how |
|---|---|---|
| `yarn validate:all` | **exit 0**, all **47** links, end to end | exit code written to a file, never through a pipe; 34 `✓` markers, **0** `✗`/`FAIL` in the log |
| `yarn test` | **exit 0** — **544** files, **10,263** passed, 3 skipped, 1 todo, **0 failed** | unpiped |
| `yarn typecheck` (vue-tsc, core) | **exit 0** | unpiped |
| `tsc -p packages/tooling --noEmit` | **exit 0** | unpiped |
| `eslint packages/ apps/ e2e/ --max-warnings 0` | **exit 0** | unpiped |
| `yarn build` | **exit 0** — all 8 workspace builds, declarations emitted | unpiped |
| `validate:tracked-build-output` **after** a full build | **exit 0** | the build writes to `dist/`, and the gate reads `git ls-files`, so a fresh build cannot trip it |

**Still red: nothing.** Every gate named in `<validation>` is green, and each is
green for a reason stated in §2 rather than because an artifact was edited or a
spec relaxed.

**What is *not* claimed.** 37 capability cells and 8 visual rows remain
**`stale`**, visibly and on purpose (§1d). They are not a failing gate —
`validate:capability-matrix` is exit 0 — they are unrefreshed evidence, each
with a lane and a task id. 441 cells remain `unrun`. No browser, AT, packaging
or release evidence was produced by this task, and no manual AT result cell was
touched.

---

## 5. Ratchet movements

| Ratchet | At `527dbd1` (committed) | After this task (working tree) |
|---|---|---|
| `validate:all` first failing link | **20 of 44** (`validate:capability-matrix`) | **none — exit 0 over 47 links** |
| `validate:all` chain length | 44 | **47** |
| `yarn test` failures | **3** (`dzup-resolution`, `landing-token-fallbacks`, `story-dod-tiers countOpen`) | **0** (544 files / 10,263 tests) |
| `tsc -p packages/tooling` errors | **18** | **0** |
| gitignored `dist` files inside the tooling typecheck program | **661** | **0** |
| `eslint e2e/` errors | **9** (and outside the lint target) | **0** (and in the target) |
| tracked build outputs under `packages/*/src` | **12** (+2 in `.tree-shake-test/`) | **0**, gated |
| artifacts stamping HEAD | **0 of 4** (all `2d51eec`) | **4 of 4** (`527dbd1`) |
| capability cells committed as `pass` | **585** | **570** — 15 were over-claimed |
| capability cells committed as `stale` | **22** | **37** — the truth, each with a lane and a task id |
| `visual` rows stale | 8 | 8 (unchanged — TASK-R2-O6) |

Note the two ratchets that moved the "wrong" way: `pass` **down** and `stale`
**up**. That is the task succeeding, not failing. The committed artifact was
claiming evidence it did not have.

---

## 6. Owner decisions raised

### Decision 1 — the structural off-by-one in `sourceCommit` (N0-05 D1, unfixed half)

A committed artifact always stamps its own **parent**, because it is written at
`HEAD = X` and lands as `X + 1`. The copied-binding half is fixed; this half
cannot be fixed by any generator.

- **(a) Accept and state the invariant.** Define `sourceCommit` as "the tree the artifact was generated from", which is what it honestly is, and stop treating parent-stamping as staleness. Costs nothing; every freshness gate already excludes provenance from its byte comparison, so nothing gates on it either way.
- **(b) Post-commit hook that re-stamps and amends.** Makes the field name the landing commit. Rewrites history on every commit that touches an artifact, and is unenforceable on a contributor who has not installed hooks.
- **(c) CI job that regenerates and compares bodies (ignoring provenance).** This already exists as `validate:*` freshness; it does not make the stamp equal HEAD.
- **(d) Add `dirty: true|false` alongside the stamp** (D1's other suggestion). **Not done here deliberately** — it changes the artifact schema version, which `<stop_conditions>` routes to the owner.

**Recommendation: (a), plus (d) folded into the next schema bump rather than its own.**
Also: **retire the `<done_check>` line that compares `sourceCommit` to `git rev-parse HEAD`.** It can only ever pass in an uncommitted tree — it passes right now, and will fail the moment the owner commits. It is a check that measures when you looked, not what is true.

### Decision 2 — `validate:changelog` vs `validate:mcp` after `changeset version` (the `<d1_proof>`)

Proven, not predicted. See §7 for the run. **D1 is confirmed — and understates the problem by four.**

- **(a) Widen the `validate:mcp` heading regex** (one line: allow an optional ` - YYYY-MM-DD` suffix in `latestChangelogVersion`). Resolves the mutual exclusivity. Does **not** resolve the other 4 failures.
- **(b) Also make versioning update the three mirrors.** `changeset version` bumps `packages/mcp/package.json` and nothing else; `server.json#version`, `server.json#packages[0].version` and `mcp-tool-surface.json#version` are hand-maintained copies that immediately disagree, and the generated surface goes stale. A `version` script that runs `generate:mcp-surface` and syncs `server.json` afterwards fixes all four mechanically.
- **(c) Change the changelog format instead** so changesets' native `## x.y.z` heading is accepted, and drop the ISO-date rule. Cheapest, but loses the date the release report needs.

**Recommendation: (a) + (b) together, before any release is attempted.** They are ~20 lines combined and turn a guaranteed-red first release into a green one. The decision is TASK-R0-O1's; this task only proves the mechanism.

### Decision 3 — evidence goes stale on the commit *after* it is captured

15 browser cells were `pass` in the committed artifact and are `stale` at HEAD
because `527dbd1` changed those components after the R2 evidence run on
`2d51eec`. R2-O1/O6/O7 all **ran and passed**; the cells still went stale. This
is Decision 1's shape one level up, and "0 stale cells" is unreachable under the
current workflow.

- **(a) Accept staleness as normal between releases**, and gate only on "no cell stale for more than N commits".
- **(b) Re-run the browser/perf/visual lanes as the last act before a release commit**, so the release tree is the one the evidence describes.
- **(c) Reduce granularity** — measure per component (already done: `evidenceIsCurrent` uses `merge-base --is-ancestor`, correctly). No further gain available here.

**Recommendation: (a) day to day, (b) for release commits only.** Anything else means re-running 18 Playwright projects on every merge.

### Decision 4 — `typecheck:tooling` is now a chain link

`packages/tooling` had **no** type gate; 18 errors accumulated silently, two of
them real signature bugs. I chained it at link 2. It is fast and now hermetic
(Decision-free after the `tsconfig.base.json` fix). **The owner should confirm
they want the chain to grow** rather than run this in a separate lane — it is
the only change here that makes `validate:all` stricter for every future commit.

---

## 7. The `<d1_proof>` dry run

Run in a **throwaway `git worktree` of `527dbd1`** in the scratchpad, never on
the tree, with `node_modules` junctioned in. (`git worktree add` needed
`-c core.longpaths=true`: the visual-baseline filenames exceed Windows
`MAX_PATH` under a scratchpad path. Worth knowing — a plain clone into a deep
directory fails on this repository.) Worktree and junction removed afterwards;
`git worktree list` shows only `main`.

| Stage | `validate:changelog` | `validate:mcp` |
|---|---|---|
| At `527dbd1`, before versioning | **exit 0** (7 passed) | **exit 0** (12 tools, versions agree at 0.2.0) |
| After `changeset version` (37 changesets; core 0.2.0→0.3.0, mcp 0.2.0→0.2.1, tokens/testing/contracts 0.2.0, nuxt 0.1.0) | **exit 1** — 5 of 7 packages: `Version entry missing ISO date (YYYY-MM-DD): "## 0.3.0"` | **exit 1** — 4 errors |
| After adding ` - 2026-09-21` to every `## x.y.z` heading | **exit 0** | **exit 1** — **5** errors |

**Both fail, and fixing one makes the other worse.** The exact mechanism:

- `validate-changelog.ts:75` requires `/\d{4}-\d{2}-\d{2}/` on every `## x.y.z` line. Changesets writes a bare `## 0.3.0`.
- `mcp-surface.ts:94` reads the version with `/^##\s+(\d+\.\d+\.\d+(?:-[\w.]+)?)\s*$/m` — **anchored to end of line, whitespace only**. A dated heading does not match, `latestChangelogVersion` returns `null`, and the new fifth error is:
  `✗ packages/mcp/CHANGELOG.md's newest release heading is null but package.json is "0.2.1".`

The three failures **no date fix can touch**, which N5-01 D1 does not mention:

```
✗ packages/mcp/server.json#version says "0.2.0" but package.json says "0.2.1"
✗ packages/mcp/server.json#packages[0].version says "0.2.0" but package.json says "0.2.1"
✗ packages/mcp/docs/mcp-tool-surface.json#version says "0.2.0" but package.json says "0.2.1"
```

plus `packages/mcp/docs/mcp-tool-surface.json is STALE` and the README tool
table with it. `changeset version` bumps one file; four others mirror that
version by hand. **The first `changeset version` turns `validate:all` red for
five reasons, not one.** Report only — the decision is TASK-R0-O1's (Decision 2).

---

## 8. End-to-end re-run at HEAD — `<done_check>` 7 of 7

Re-run in full at the end, after every edit, in the working tree at `527dbd1`:

| # | Check | Result |
|---|---|---|
| 1 | ownership `sourceCommit` == `git rev-parse HEAD` | `527dbd150036b5f07bd69e672825ff14ec3a592d` both sides — **PASS** |
| 2 | `validators/capability-matrix.ts` | **exit 0** |
| 3 | `yarn test` | **exit 0** — 0 failed |
| 4 | `tsc -p packages/tooling --noEmit` | **exit 0** |
| 5 | `eslint e2e/` + `lint` targets `e2e/` | **exit 0**, `lint = eslint packages/ apps/ e2e/ --max-warnings 0` — **PASS** |
| 6 | tracked `.js`/`.d.ts`/`.map` under `packages/core/src/providers` | **0** |
| 7 | `validate:at-scripts` **and** `validate:tree-shake` in the chain | both **true** |

**`<success_criteria>`, item by item**

| Criterion | Status |
|---|---|
| `validate:all` exits 0 end-to-end at HEAD (first failing link 20 → none) | **met** — 47 links, exit 0 |
| `yarn test` 0 failed | **met** — 0 of 10,267 |
| tooling `tsc` 0 | **met**, and now hermetic (661 → 0 gitignored `dist` files in the program) |
| e2e lint 0 and in the target | **met** |
| every generated artifact's `sourceCommit` equals HEAD | **met for the 4 chain artifacts + 144 docs pages.** Deliberately **not** applied to `at-matrix/index.json`, `browser-evidence.json`, `engine-ratchets.json`, `visual-baselines.json`, `wcag-deviations.json` — those are **run records**, whose `sourceCommit` is the commit the run was *observed* at. Re-stamping them to HEAD would be fabricating evidence, which is what `<no_fake_freshness>` forbids. |
| the stale cells each refreshed or recorded stale with a lane and a task id | **met** — 37 cells + 8 visual rows, all three classes tabled in §1d with component lists and task ids. None refreshed, because none *can* be without a browser or perf run; none faked. |
| tracked-build-output gate fires on a seeded file | **met** — live seeded proof in §3 plus a 21-test spec |
| D1 proof recorded with the exact failing validator and message | **met** — §7, with the two regexes, the five failures, and the counter-proof that dating the headings makes `validate:mcp` worse |

**`<stop_conditions>` — which fired, and what was done**

The instruction for this run was to record a trigger as a numbered owner
decision and continue, not to halt.

- *“A stale cell can only be refreshed by editing the artifact by hand”* — **did not fire.** All 45 stale items need a **lane re-run**, which is a different thing; routed to R2-O1/O6/O7 and recorded as decision **3**.
- *“The stamp fix would change an artifact's schema version”* — **fired, and was avoided.** D1 also proposes a `dirty: true\|false` flag; that is a schema change, so it was **not** implemented and is decision **1(d)**.
- *“`validate:all` fails on a link this task did not touch”* — **did not fire.**
- *“A failing spec encodes a real defect in a component”* — **did not fire.** The two real defects found were in *tooling* (`accept-visual-baseline` signature, `story-dod-triage` readonly write) and in the *landing app* (6 fallback hexes), not in a component. Nothing was routed to R2-O3.

**Custody.** `git status --porcelain` — **199 paths**: 181 modified (144 of them
regenerated docs pages whose only change is the stamp), 14 deleted (the 12
leftovers + 2 `.tree-shake-test/` files untracked), 4 added. The worktree was
**clean** at the start, so every path is this task's; no one else's dirty work
was present to preserve. **Nothing is committed, pushed, packed, published or
dispatched** — all owner actions. The throwaway D1 worktree and its
`node_modules` junction were removed; `git worktree list` shows only `main`.

---

## 9. Ranked next packet

1. **TASK-R1-O2** — consumer-truth gates. Unblocked and highest value: the tree is now honest about itself, but nothing yet proves what a consumer installs. The `Node import()` gate is the one that would have caught the invalid-ESM defect twice over.
2. **TASK-R2-O1 re-run** (browser lane) — the 15 stale `browser-matrix` cells are the largest block of unqualified evidence and the lane exists. Cheap now, and it is what makes the capability matrix quotable.
3. **TASK-R0-O1** — with §7 in hand the publish-or-freeze packet can state exactly what the first release costs: five validator failures, ~20 lines of repair.
4. **TASK-R2-O7 / R2-O6** — the 22 perf and 8 visual stale rows, in that order (perf is more cells and has a committed baseline format).
