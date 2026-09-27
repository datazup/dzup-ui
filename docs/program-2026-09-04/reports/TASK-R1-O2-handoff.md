# TASK-R1-O2 — Consumer-truth gates: Node `import()` of every published entry, pack freshness, the i18n catalog export

> Baseline: `main` @ **`527dbd1`**, worktree carrying TASK-R1-O1's ~200 uncommitted
> paths (preserved untouched; this task adds to them). Every number below is bound
> to that commit. No commit, push, publish, CI dispatch or baseline replacement was
> performed — those are owner actions.
> Predecessors cited rather than re-derived:
> [`TASK-R1-O1-handoff.md`](./TASK-R1-O1-handoff.md) (green tree, 47 links, D145–D148),
> [`TASK-R5-O4-handoff.md`](./TASK-R5-O4-handoff.md) (the i18n export slice, D58),
> [`../program-2026-09/reports/N5-03-toolchain-currency-handoff.md`](../../program-2026-09/reports/N5-03-toolchain-currency-handoff.md) (`N5-03-D3`),
> [`../program-2026-09/reports/N5-04-peer-hygiene-handoff.md`](../../program-2026-09/reports/N5-04-peer-hygiene-handoff.md) (`D4`, `F9`, `F10`).

## 0. `<done_check>` at start — **2 of 5**

| # | Check | Result |
|---|---|---|
| 1 | `grep -c 'validate:published-imports' package.json` ≥ 2 | **FAIL** — 0. No such script, not in the chain. |
| 2 | `test:nuxt-fixtures:pack` shows a build or freshness step | **FAIL** — `node packages/nuxt/scripts/pack-fixtures.mjs`, no freshness logic anywhere in it. Reproduced, §1. |
| 3 | `core` exports an i18n subpath; packed tarball imports it with > 0 keys | **PASS** — `./i18n` + `./i18n/locales/en.json` ship (TASK-R5-O4, D58). Probed from the tarball: both load. |
| 4 | exports validator newer than `5773f65` **and** the exports snapshot contains the i18n entry | **FAIL** — and the path in the check does not exist: the validator is `packages/tooling/scripts/validate-exports.ts` (last touched `cf8a93d`), not `src/validators/exports*`. There was **no exports snapshot of any kind**: `validate:exports` proved declared targets resolve, and would have passed with `./i18n` deleted. |
| 5 | `import('@dzup-ui/contracts')` exits 0 from a packed tarball | **PASS** — 55 exports, exit 0. `N5-03-D3`(2) / `G8-7` defect **closed at `527dbd1`**, verified from the tarball, not from source. |

Per README §4 the two passing slices were cited, not redone; the residual was run.

## 1. Reproductions, before any edit

**F10 — the pack path packs a stale `dist` and says nothing.** `touch
packages/core/src/index.ts` (mtime only; `git status` unchanged) put `src` at
`2026-09-21T12:02:06.357Z` against a `dist` built at `11:36:43.812Z`. Then:

```
$ yarn test:nuxt-fixtures:pack          # exit 0, 24 s
✓ packed 4 tarball(s) → packages/nuxt/test/.tarballs
✓ staged outside the repository → …/dzup-nuxt-fixtures
  ✓ core-only: ready (nuxt ^3.19.0)     … 6 fixtures ready, 1 unrun
```

Four tarballs and seven staged fixtures built from a `dist` 25 m 23 s older than
its sources, reported green. Every assertion that Nuxt suite makes is evidence
about a build nobody has.

**D4 — already fixed, cited not redone.** `./i18n` and `./i18n/locales/en.json`
ship and the root `index.d.ts` reaches the `DzMessageCatalog` augmentation
(TASK-R5-O4, decision D58, changeset
`.changeset/a-count-reads-right-in-every-language-and-the-catalog-ships.md`).
The residual this task owed was the *gate*: nothing made the subpath's removal
fail, and nothing proved the augmentation reaches a **consumer** — §3.

**The premise the whole gate rests on, measured.** `packages/core` packed both ways:

| | `@dzup-ui/contracts` dependency range in the tarball |
|---|---|
| `yarn workspace @dzup-ui/core pack` | `"0.1.0"` — what the registry would receive |
| `npm pack` (in `packages/core`) | `"workspace:*"` — verbatim; `EUNSUPPORTEDPROTOCOL` on install |

## 2. Implemented

Eight new files, eight modified. No component behaviour changed; no public API
changed.

**New**

| File | What it is |
|---|---|
| `packages/tooling/src/validators/published-imports.ts` | The gate. Packs the six `published` packages with `yarn pack`, extracts the tarballs into a scratch consumer, `import()`s every `exports` subpath by specifier under plain Node, and runs two isolated `tsc --noEmit` programs over the `types` conditions. |
| `packages/tooling/src/validators/published-imports.spec.ts` | 15 unit tests over the planning half — `classifyTarget`, `runtimeLeafFor`, `planRuntimeProbes` (including a "100 % of non-wildcard subpaths" assertion), the report shape, and that the inventory is `release-policy.json` rather than a hand-kept list. |
| `packages/tooling/src/pack-freshness.mjs` | The shared "is this `dist` older than its sources?" check. Plain JS for the same reason `release-parser.mjs` is: a `node`-run `.mjs` and a `tsx`-run `.ts` must share **one** definition of stale. |
| `packages/tooling/src/pack-freshness.d.mts` | Its hand-written declarations (the `release-parser.d.mts` pattern). |
| `packages/tooling/src/pack-freshness.spec.ts` | 7 tests: both directions distinguishable, `package.json` counted as a source input, unbuilt ≠ fresh, and the refusal carrying both timestamps. |
| `packages/tooling/scripts/required-export-subpaths.json` | The published subpath contract, as data — 31 subpaths across the 6 published packages, with per-package reasons and notes on `./i18n`, `./i18n/locales/en.json`, `./styles`, `./dtcg`. |
| `packages/tooling/scripts/published-imports-policy.json` | The one legitimate zero-export entry (`@dzup-ui/testing#./vitest`, a setup module) as an allowlist with a reason, so "exports nothing" stays a failure for everything else. |
| `docs/program-2026-09-04/reports/TASK-R1-O2-handoff.md` | This file. |

**Modified**

| File | Change |
|---|---|
| `packages/nuxt/scripts/pack-fixtures.mjs` | `ensureFreshDist()` before packing; refuses a stale/unbuilt `dist` naming both timestamps and the lag; `--build` / `DZUP_PACK_BUILD=1` builds instead of refusing; `DZUP_PACK_ALLOW_STALE=1` is the explicit, loudly-warned escape. The refusal prints as a message, not a stack trace. |
| `packages/tooling/scripts/validate-exports.ts` | New `validateRequiredSubpaths()` section: the subpath **set** is now gated in both directions (a removed subpath is a breaking change; an unlisted addition must be written down). |
| `packages/tooling/scripts/tracked-build-output-allowlist.json` | Two entries for the `pack-freshness.mjs` / `.d.mts` pair, with reasons. |
| `package.json` | `validate:published-imports` + its `//` rationale; chained into `validate:all` immediately after `validate:exports`. |
| `.github/workflows/ci.yml` | `yarn validate:published-imports --built` in the `build` job, right after `validate:exports --built` (the job has just run `yarn build`, so there a stale dist is an error, not a warning). **Added to the file only — no dispatch.** |
| `packages/tooling/README.md` | Both gates described in the script table. |
| `packages/tooling/src/validators/tracked-build-output.ts` | New `trackablePackageFiles()` — tracked **plus** untracked-and-not-ignored. See §5 F3: allowlisting a new hand-written `.mjs` is mandatory and committing it is the owner's act, so the two cannot both be satisfied by an agent. Gitignored paths are still excluded, so the real rot still fails. |
| `packages/tooling/src/validators/tracked-build-output.spec.ts` | The anti-rot assertion reads the new list, **plus a new test** proving a gitignored path (`packages/core/dist/index.js`) is still rejected. 23 → 24 tests (the file is TASK-R1-O1's, still uncommitted). |

### How the gate works, and its one honest boundary

Tarballs are **extracted**, never `npm install`ed, into
`<tmp>/consumer/node_modules/`, with a junction one level up to this
repository's `node_modules` so third-party peers (`vue`, `reka-ui`,
`tailwind-variants`) resolve. Node finds the extracted copy first, so every
`@dzup-ui/*` specifier — including the cross-package ones inside `core`'s own
`dist` — hits packed content rather than the workspace symlink. Extraction
means **no lifecycle script can run** (`--ignore-scripts` by construction) and
the gate needs **no network**, which is what lets it be a `validate:all` link
instead of a CI-only lane.

The boundary, stated rather than hidden: third-party dependencies come from this
repository's install, so an *undeclared* runtime dependency would still import
here. `validate:externals` and `validate:peers` own that; this gate does not
claim it. A full-fidelity `--install` variant is **D150**.

### Why there are two `tsc` programs

`types-probe.ts` re-exports every `types`-declaring subpath. The
`DzMessageCatalog` assertion lives in its **own** program, importing only
`@dzup-ui/core` — measured necessity, not tidiness: with the assertion in the
shared probe, deleting `export * from './i18n/index.ts'` from
`dist/index.d.ts` still **passed**, because the sibling `@dzup-ui/core/i18n`
import had already pulled `messages.d.ts` into the program. The question
N5-04 `D4`/`F9` asks is specifically *"does a consumer who writes `import
'@dzup-ui/core'` and nothing else see the catalog?"*, and only a program with
nothing else in it can ask it. Isolated, the seed fails correctly (§4, seed D).

Both programs use a **consumer's** tsconfig — `moduleResolution: bundler`,
`strict`, `skipLibCheck: true`, `types: []`, and deliberately **no**
`allowImportingTsExtensions` and no `paths`. The repo sets both, and a
repo-flavoured probe would answer a question no consumer asks.

## 3. Focused validation

```
$ yarn validate:published-imports                                  exit 0
validate:published-imports — 6 published packages (packages/tooling/scripts/release-policy.json)

  PASS  @dzup-ui/contracts@0.1.0: 1 probes
  PASS  @dzup-ui/core@0.2.0: 18 probes
  PASS  @dzup-ui/mcp@0.2.0: 2 probes
  PASS  @dzup-ui/nuxt@0.1.0-alpha.0: 1 probes
  PASS  @dzup-ui/testing@0.1.0: 3 probes
  PASS  @dzup-ui/tokens@0.2.0: 6 probes

  62 exports leaves · 31 runtime entries · 26 types entries · 16.1s
  types probe: PASS (consumer tsconfig: moduleResolution bundler, skipLibCheck, no allowImportingTsExtensions)
  DzMessageCatalog reachable from `import '@dzup-ui/core'` alone: YES (isolated program — N5-04 D4/F9)

validate:published-imports PASSED
  31 entries verified: 26 imported under Node · 2 imported as JSON · 3 assets present in the tarball (not importable under Node)
  tarballs: (removed — pass --keep to inspect)
```

**Coverage — 100 % of the `exports` surface of the six published packages.**
31 of 31 non-wildcard subpaths are probed (there are no wildcard subpaths at
`527dbd1`); all 62 leaves, plus `main`/`module`/`types`, are checked for
presence **inside the tarball** — the check `validate:exports` structurally
cannot make, since it reads `packages/<p>/` where a file excluded by `files` is
still there. 26 subpaths are `import()`ed, 2 are imported as JSON with
`with { type: 'json' }` (`@dzup-ui/core/i18n/locales/en.json`,
`@dzup-ui/tokens/dtcg`), and 3 are assets (`@dzup-ui/core/styles`,
`@dzup-ui/tokens/css`, `/css/high-contrast`) reported as **existence-checked,
not importable under Node** rather than pretended green. 26 subpaths carry a `types` condition and are compiled.

**Runtime: 16 s** on an idle host (16.1 s / 12.4 s / 14.4 s across three runs);
**52 s** when another gate was running, and **161 s** on a run that overlapped a
full `yarn test`. Budget was 3 minutes, and even the contended run stayed inside
it. Packing dominates (~9 s idle); the two `tsc` programs are ~4 s.

```
$ yarn validate:exports          exit 0    # + 31 contracted subpaths across 6 packages
$ yarn test:nuxt-fixtures:pack   exit 0    # fresh dist; 4 tarballs, 6 fixtures ready, 1 unrun
$ yarn test packages/core/src/i18n  exit 0 # 4 files, 66 tests
$ node node_modules/vitest/vitest.mjs run packages/tooling/src/validators/published-imports.spec.ts   exit 0  (15)
$ node node_modules/vitest/vitest.mjs run packages/tooling/src/pack-freshness.spec.ts                 exit 0  (7)
$ node node_modules/typescript/bin/tsc -p packages/tooling --noEmit                                   exit 0
$ node node_modules/eslint/bin/eslint.js <the 9 touched JS/TS files> --max-warnings 0                  exit 0
```

## 4. The gates fire — four seeded defects, each reverted

Seeds were applied to real files and reverted from a byte-backup; `git status`
confirms `packages/core/package.json` and `packages/testing/package.json` are
unchanged, and the two touched `dist` files were restored and rebuilt.

| Seed | What was seeded | Result |
|---|---|---|
| **A** — missing `exports` target | `"./seeded-missing": { types: "./dist/seeded-missing.d.ts", import: "./dist/seeded-missing.js" }` on `@dzup-ui/testing` | **exit 1**, four independent failures: both leaves absent from the tarball, `ERR_MODULE_NOT_FOUND` on `import('@dzup-ui/testing/seeded-missing')`, and `TS2307` from the types probe. The staleness warning also fired for the edited `package.json`. |
| **B** — the `N5-03-D3` defect class | dropped `.js` from one relative specifier in `packages/contracts/dist/index.js` | **exit 1**, `15 of 31 entries failed` — `ERR_MODULE_NOT_FOUND: … /dist/anatomy.types`, propagating from `@dzup-ui/contracts` through `@dzup-ui/core`'s root and all 13 of its subpaths. Exactly how the original defect behaved, and exactly what no existing gate saw. |
| **C** — a removed subpath | deleted `"./i18n"` from `packages/core/package.json` | `validate:exports` **exit 1** with the contract message. `validate:published-imports` **exit 0** with `30` entries instead of 31 — and that is the point: a gate that enumerates what the tarball declares cannot see a promise that is gone. The two gates are complementary, and the snapshot is what closes the hole. |
| **D** — unreachable catalog augmentation | removed `export * from './i18n/index.ts'` from `packages/core/dist/index.d.ts` | **exit 1**: `DzMessageCatalog reachable from \`import '@dzup-ui/core'\` alone: NO`, with `TS2322 … { DZUP_ERROR: 'DzMessageCatalog is EMPTY for consumers …' }`. (Under the shared-program design this seed passed — see §2.) |

## 5. Aggregate qualification

`yarn validate:all` — **48 links, exit 0**, run end to end with the exit code
read directly from the command (never through a pipe). Log: **34 `✓`, 0 `✗`,
0 `FAILED`**, with `validate:published-imports PASSED` inside it. The chain grew
47 → 48; `validate:published-imports` is link **29**, immediately after
`validate:exports`. Locally qualified — not CI, not release evidence.

Reported separately, per `<evidence_rules>`:

- **Tooling failures: none new.** `tsc -p packages/tooling` 0, `eslint` 0 on
  every touched file.
- **Component failures: none.** No component source was edited. `yarn test`
  **exit 0 — 546 files, 10,286 passed, 0 failed, 3 skipped, 1 todo** (R1-O1's
  baseline was 544 / 10,263; +2 files and +23 tests are this task's).
  `yarn test packages/core/src/i18n` 66/66.
- **One flake observed and identified as one, not a regression.** The first full
  `yarn test` of this task ran while `validate:published-imports` was also
  running (339 s, heavy contention) and reported
  `DzMasonry.spec.ts > reflows the column count on container resize` failing
  (`expected […1] to have a length of 3`). Re-run in isolation it passes, and the
  idle full run above passes. A `ResizeObserver` timing flake under load — worth
  recording because the next agent will otherwise re-discover it as a defect.
- **Still red, pre-existing:** nothing this task found in `validate:all`. The
  `core-pro` Nuxt fixture remains `unrun` (needs `DZUP_PRO_TARBALL` from a Pro
  checkout) — reported, not skipped, as it was before.
- **Structurally unavailable:** a *fresh registry install* of the tarballs. The
  environment has no guarantee of network access for arbitrary registry
  installs, so the gate is offline by construction (§2 boundary, **D150**).

### Measured while here, not gated (routed, not fixed)

**F1 — `skipLibCheck: false` is TypeScript's default, and our published
declarations produce 21 errors under it.** Re-running the types probe against
the kept scratch consumer with `skipLibCheck: false` produced 113 errors, of
which **92 come from third-party packages reached through the junction**
(`nitropack`, `h3`, `db0`, `@nuxt/schema`, `@types/node`, `postcss`, three
copies of `@vue/runtime-core`) and are an artifact of the mechanism, not of our
tarballs. The remaining **21 are ours**, in four published files:

- `TS2300 Duplicate identifier 'event'` ×18 — `DzSpeedDial.vue.d.ts:66`,
  `DzPopconfirm.vue.d.ts:68,191`. The emitted line is literally
  `$emit: ((event: "click", event: MouseEvent) => void) & …` — two parameters
  with the same name, from an emits tuple whose payload label is `event`.
  That is an invalid signature in a **published** declaration.
- `TS2344 GlobalComponents does not satisfy …` ×3 — `DzRangeSlider`,
  `DzSlider`, `DzPopconfirm`; plausibly the three-`@vue/runtime-core`-copies
  artifact, **not confirmed as ours**.

`moduleResolution: node16` passes cleanly, so the `.ts` relative specifiers in
`packages/core/dist/**/*.d.ts` are **not** a consumer problem — TypeScript's
extension substitution handles them in both `bundler` and `node16`. Routed as
**D152**.

**F3 — the allowlist gate and the no-commit rule were mutually unsatisfiable.**
`.mjs` and `.d.mts` are in `BUILD_OUTPUT_EXTENSIONS`, so a hand-written one
under a package's `src/` **must** be allowlisted or `validate:tracked-build-output`
goes red the moment it is committed. But `tracked-build-output.spec.ts` asserted
every allowlist entry names a path `git ls-files` prints — and an agent forbidden
from committing can never produce that state. Adding `pack-freshness.mjs` therefore
turned that spec red (`is allowlisted but not tracked`) while the *validator* stayed
green. Fixed at the defect: the assertion now reads tracked **or** untracked-and-not-ignored
(`git ls-files --others --exclude-standard`), which is exactly "a file git would add".
Rot — an entry naming nothing — still fails, and so does the real risk, an entry
naming a gitignored path, which a new test now pins.

**F2 — CI's "Pack smoke test" has never been able to fail.**
`.github/workflows/ci.yml` runs `npm pack --dry-run` per package and greps the
output for `workspace:` / `link:`. `npm pack --dry-run` prints the *tarball file
list*; 0 matches, measured. It also pipes through `tee`, so the step's exit
status is `tee`'s. And a real `npm pack` of `packages/core` does ship
`"@dzup-ui/contracts": "workspace:*"` (§1) — the exact thing the step believes
it is preventing. Routed as **D151**; the CI job graph is not this task's to
restructure.

## 6. Ratchet movements (old → new, bound to `527dbd1`)

| Ratchet | Before | After |
|---|---|---|
| `validate:all` links | 47 | **48** (`validate:published-imports` at 29) |
| `validate:all` exit code | 0 | **0** — first failing link: none |
| Published entries loaded under Node by any gate | **0** | **28** (26 ESM + 2 JSON), of 31 subpaths; 3 assets existence-checked |
| `exports` leaves verified present *inside a tarball* | 0 | **62** (+ `main`/`module`/`types`) |
| `types` conditions compiled under a consumer tsconfig | 0 | **26** + 1 catalog assertion |
| Published subpaths under a removal-proof contract | 0 | **31** across 6 packages |
| Pack paths that refuse a stale `dist` | 0 of 2 | **2 of 2** (`test:nuxt-fixtures:pack`, `validate:published-imports --built`) |
| Tooling specs | — | **+22** (15 + 7), all passing |
| Packages in the import gate's inventory | — | 6 of 6 `published`; `compat`/`codemods` reported as withheld, `tooling`/`apps` private |

## 7. Run record

| Command | Exit | Notes |
|---|---|---|
| `yarn validate:published-imports` | 0 | 6 packages · 62 leaves · 31 runtime (26 ESM + 2 JSON + 3 assets) · 26 types · 16.1 s idle |
| `yarn validate:published-imports --keep` | 0 | scratch retained for the F1 measurement |
| `yarn validate:exports` | 0 | + 31 contracted subpaths |
| `yarn test:nuxt-fixtures:pack` | 0 | fresh dist; refusal proven separately at exit 1 |
| `yarn test packages/core/src/i18n` | 0 | 4 files · 66 tests |
| `tsc -p packages/tooling --noEmit` | 0 | |
| `eslint` (7 touched files, `--max-warnings 0`) | 0 | |
| `yarn test` | **0** | 546 files · 10,286 passed · 0 failed (baseline 544 / 10,263) |
| `yarn validate:all` | **0** | 48 links end-to-end, read directly (never through a pipe). Run **twice**: once after the gates landed, once after the `trackablePackageFiles` fix |

## 8. Owner decisions (numbered from TASK-R1-O1's D148)

**D149 — should `validate:all` require a *fresh* build for the import gate?**
Today the gate warns on a stale `dist` and skips an unbuilt one, mirroring
`validate:exports`; `--built` (CI, after `yarn build`) makes both errors.
(a) **Keep as is — recommended.** `validate:all` stays runnable on a
freshly-edited tree, and CI carries the strict lane. (b) Pass `--built` in
`validate:all`, which makes a full `yarn build` a precondition of every
aggregate run (minutes). (c) Drop the staleness reporting — rejected: it is the
only thing that keeps a green run from being about an unknown build.

**D150 — a full-fidelity `--install` variant?** The gate resolves third-party
peers from this repository's `node_modules` (offline, deterministic), so an
*undeclared* runtime dependency would still import. (a) **Add a separate
CI-only lane doing `npm install --ignore-scripts --legacy-peer-deps` of the
tarballs — recommended**, sequenced with TASK-R1-O3's release evidence and
TASK-R1-O4's CI dispatch. (b) Make it the default: loses offline determinism and
costs ~2 min per run. (c) Rely on `validate:externals` + `validate:peers` — they
do cover declaration, but never installation.

**D151 — CI's "Pack smoke test" step (F2).** It cannot fail: `npm pack
--dry-run` prints a file list, the grep has nothing to match, and `tee` swallows
the exit status — while a real `npm pack` *does* emit `workspace:*`.
(a) **Delete the step — recommended**: `validate:published-imports --built` now
covers the same ground with `yarn pack` and actually loads the result.
(b) Rewrite it to unpack the tarball and inspect its `package.json`
`dependencies`. Not done here: the `ci.yml` job graph is outside this task.

**D152 — 21 errors in published declarations under `skipLibCheck: false` (F1).**
The 18 `TS2300` are a genuine defect in `DzSpeedDial.vue.d.ts` and
`DzPopconfirm.vue.d.ts` (`(event: "click", event: MouseEvent)`), visible to any
consumer who leaves `skipLibCheck` at TypeScript's default. (a) **Route to
TASK-R2-O3 (defect register close-out) with a one-line source fix — relabel the
emits payload parameter in those components' `.types.ts` — plus a `patch`
changeset — recommended.** (b) Add a `--strict-lib-check` lane to this gate:
premature while the junction mechanism contributes 92 unrelated errors.
(c) Document `skipLibCheck: true` as a requirement — rejected: that is a defect
dressed as a prerequisite. The 3 `TS2344` are **not** confirmed as ours.

**D153 — no changeset was written for this task, deliberately.** Everything
shipped is in the private `@dzup-ui/tooling` package, a test script under
`packages/nuxt/scripts/` that is not in the tarball, `package.json` scripts and
`ci.yml`. No published package's `exports`, types or behaviour changed. The
`<i18n_export>` requirement's changeset already exists and is TASK-R5-O4's
(`.changeset/a-count-reads-right-in-every-language-and-the-catalog-ships.md`,
`@dzup-ui/core: patch`). If the owner wants tooling changes changeset-tracked as
policy, that is a `release-policy.json` decision, not this task's.

## 9. Ranked next packet

1. **D152 → TASK-R2-O3**: the 18 `TS2300` in published declarations. Smallest
   real consumer defect found here, one-line fix, `patch`.
2. **D151**: delete or repair CI's pack smoke test — it is currently a green
   step that asserts nothing, and it sits in the release path.
3. **TASK-R1-O3** (release evidence): the import gate is the natural producer of
   the per-tarball hash + entry inventory the 8-section release report needs; it
   already packs all six and reads their packed manifests.
4. **D150** with TASK-R1-O4: the real-install lane, as a CI job.
5. **TASK-R5-O4 residual**: when the first non-`en` locale lands, its
   `exports` entry must be added to `required-export-subpaths.json` — the gate
   now fails until it is, which is the intended friction.
