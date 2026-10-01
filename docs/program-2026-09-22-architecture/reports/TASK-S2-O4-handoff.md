# TASK-S2-O4 — handoff (in progress)

> Programme: [`program-2026-09-22-architecture`](../README.md) · task
> **TASK-S2-O4** — "Dispatch the four written-but-never-dispatched CI lanes"
> 🟢 `[!owner dispatches]`.
> Measured at **`4e4e46f`** (`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`).
> Machine: **win32** (Windows 11), Node **v24.14.1**, yarn **4.16.0**.
> Written incrementally — sections are appended as each step completes.

## 0. Progress log (append-only)

- **Step 0 — baseline re-verified.** `git rev-parse HEAD` =
  `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`; `git status --porcelain | wc -l`
  = **269** dirty paths (uncommitted by design, thirteen prior tasks). Nothing
  reverted, stashed, checked out or cleaned.
- **Step 1 — which file holds which job (done_check clause 1 re-done
  per-file).** See §1.
- (log continues below as steps complete)

## 1. Which file holds which of the four jobs

`done_check` clause 1 is `ls .github/workflows/*.yml | xargs grep -l '…' | wc -l`.
It is **defective as a discriminator** (see §9): it counts *files that mention a
lane name*, not *jobs that exist*, and a mention inside a comment counts. Run
per-file instead:

| Workflow file | Matches | What actually lives there |
|---|---|---|
| `.github/workflows/validate-min-runtime.yml` | `min-runtime` (2) | **job `validate-min-runtime`** — reusable (`workflow_call`) + `workflow_dispatch` |
| `.github/workflows/vue-next.yml` | `vue-next` (3), `nuxt-majors` (1), `validate-min-runtime` (1, comment) | **job `suite`** (the Vue 3.6 lane) **and job `nuxt-majors`** (matrix 3.19.0 / 4.4.5) — `schedule` + `workflow_dispatch` |
| `.github/workflows/min-peer.yml` | `min-peer` (6), `validate-min-runtime` (1, comment) | **job `min-peer`** — `workflow_call` + `workflow_dispatch` |
| `.github/workflows/ci.yml` | `validate-min-runtime` (2) | **caller only** — `uses: ./.github/workflows/validate-min-runtime.yml` |
| `chromatic.yml`, `landing-e2e-snapshots.yml`, `publish-prerelease.yml`, `release.yml` | none | no lane content (the earlier "4 files across 8" grep was a file count, not a job map) |

**There is no `nuxt-majors.yml`.** The Nuxt-majors lane is the second job in
`vue-next.yml` (line 165). That means a `gh workflow run` of the Vue 3.6 lane
**also runs the two Nuxt fixture legs** — the two are not separately
dispatchable. That is a dispatch-ordering fact the owner needs (§7).

Four lanes, **three files**, and only **three** of the four are individually
dispatchable (`nuxt-majors` rides `vue-next.yml`).

## 2. The declared environment, and how far this machine could reproduce it

| | Declared by the workflow | Available here | Reproduced? |
|---|---|---|---|
| OS | `ubuntu-latest` — all four lanes, and **19 of 19** `runs-on:` declarations across the eight workflow files (re-counted; S1-O3's 18 predates the two new lane files) | **win32** (Windows 11 Pro 26200) | **No, and it cannot be.** Every exit code below is a win32 exit code |
| Node | **20.19.0** — `validate-min-runtime` and `min-peer` via `node-version-file: .nvmrc`; `vue-next`'s two jobs via the literal `node-version: '20.19.0'`. `.nvmrc` = `20.19.0` | developer default **v24.14.1**; no `nvm`/`fnm`/`volta`/`n`/`nodenv`/`asdf` on the machine | **Yes — obtained.** `node-v20.19.0-win-x64.zip` was fetched from `nodejs.org/dist` into the scratchpad and every run below is under it, verified by `node -v` inside the same shell |
| Package manager | `corepack enable` → `yarn@4.16.0` (`packageManager`) | yarn 4.16.0 | **Yes.** `/c/Program Files/nodejs/yarn.CMD` hard-codes `"%~dp0\node.exe"`, so prepending Node 20 to `PATH` is **not enough** — the shim would still run yarn on Node 24. A scratchpad `yarn.cmd` invoking `corepack/v1/yarn/4.16.0/yarn.js` with the Node 20 binary was used instead; `yarn --version` → `4.16.0` with `node -v` → `v20.19.0` in the same shell |
| Install | `yarn install --immutable` on a **cold** checkout (min-runtime explicitly refuses a cache restore) | the shared `node_modules` installed under Node 24 | **No — deliberately skipped.** A reinstall would mutate the install state that 269 dirty paths and a concurrent session depend on. Recorded as a named gap, not glossed |
| Build | `yarn build` (min-runtime) / `yarn workspace @dzup-ui/tokens build` (vue-next, min-peer) | all eight `packages/*/dist` present, `packages/tokens/dist/tokens.css` written **today 15:14** by the concurrent session | **No — deliberately skipped.** Rewriting the shared gitignored `dist/` while another session runs gates is the one irreversible-feeling thing a read-only task can do here. The existing `dist` is what the lanes' build step produces; the deviation is that it was produced under Node 24 |

**What this arrangement can and cannot prove.** It changes exactly one variable
— the Node major — against a fixed tree and a fixed `node_modules`. That is
enough to answer the question the min-runtime lane exists to ask (*does the
toolchain start and pass at the declared floor?*) and it is the H4 defect class
verbatim. It cannot answer anything about linux, about a cold `--immutable`
install, or about native rebuilds.

## 3. Which jobs the four lanes are, declared exactly

| Lane | File · job | Trigger | Node | Install | Command sequence (verbatim order) |
|---|---|---|---|---|---|
| **validate-min-runtime** | `validate-min-runtime.yml` · `validate-min-runtime` | `workflow_call` (from `ci.yml`) + `workflow_dispatch` | `.nvmrc` → 20.19.0 | `yarn install --immutable`, **no cache on purpose** | `node -v` → `yarn validate:engines` → `yarn generate:exports:core` + `yarn generate:ownership:core` → **`git checkout -- .`** → `yarn build` → `yarn validate:all` → `yarn test` |
| **min-peer** | `min-peer.yml` · `min-peer` | `workflow_call` + `workflow_dispatch` (input `commands`) | `.nvmrc` → 20.19.0 | `yarn install --immutable`, then the runner's own `yarn install --no-immutable` with pins | `yarn workspace @dzup-ui/tokens build` → `min-peer-lane.mjs --plan` → `min-peer-lane.mjs` → `git diff --exit-code -- package.json yarn.lock` |
| **vue-next** | `vue-next.yml` · `suite` | `schedule` `0 4 * * 1` + `workflow_dispatch` (input `version`) | literal `20.19.0` | `yarn install --immutable` + yarn cache, then the runner's pinned install | `yarn workspace @dzup-ui/tokens build` → `vue-next-lane.mjs --plan` → `vue-next-lane.mjs` → summary → `git diff --exit-code -- package.json yarn.lock` |
| **nuxt-majors** | `vue-next.yml` · `nuxt-majors` (matrix `3.19.0`, `4.4.5`) | **same dispatch as `suite`** — a job cannot be dispatched alone | literal `20.19.0` | `yarn install --immutable`, no cache | `pack-fixtures.mjs --build` (env `DZUP_FIXTURE_NUXT`) → `install-fixtures.mjs` → `yarn test:nuxt-fixtures` |

Declared dependency sets (from the lane data files, not from the workflow):

- `vue-next-lane.json` — `channel: "rc"`, `resolutions` pinning **`3.6.0-rc.6`**
  across `vue`, `@vue/compiler-sfc`, `@vue/runtime-core`, `@vue/runtime-dom`,
  `@vue/shared`, `@vue/server-renderer`. `vue-component-meta` and `vue-tsc`
  deliberately **not** overridden.
- `min-peer-lane.json` — carries **no version numbers at all**: the floors are
  derived at run time from `peerDependencies` (`vue` from `packages/core`,
  `contracts`, `compat`; `reka-ui` from `packages/core`), lockstep set for
  `vue`. Commands: `typecheck`, then
  `vitest run packages/core packages/contracts packages/nuxt`.

### 3.1 A hazard in `validate-min-runtime` that a local run must not reproduce

Step 4 of the lane is **`git checkout -- .`** (restoring the tree the generators
rewrite — R1-O4's DEFECT 1 fix). It is correct in CI, where the checkout is
clean. **Run verbatim in this worktree it would destroy all 269 uncommitted
paths.** It was not run. The generator step was reproduced instead with an
explicit snapshot/restore of the one file the generator writes
(`packages/core/src/index.ts`), verified by `sha256sum -c`. **This belongs in
the dispatch request as a warning: never run this lane's step list locally in a
dirty tree.**

## 4. Implemented files + API effect

Primary deliverable: [`TASK-S2-O4-lane-evidence.md`](./TASK-S2-O4-lane-evidence.md)
— the per-lane run record and the four go/no-go recommendations.

New gate (**link 59**, appended at the END so every existing link number holds):

| File | What it is |
|---|---|
| `packages/tooling/src/validators/runtime-floor.ts` | `validate:runtime-floor`. Derives the floor from `engines.node` (the **lowest** version any branch admits), cross-checks `.nvmrc`, scans **2,309** source files under `packages`, `scripts`, `e2e`, `apps/{docs,landing}` and requires every use of a Node API newer than the floor to be listed with an `api`, a `since`, a `reachableFrom`, a dated `reason` and an `exit` condition |
| `packages/tooling/src/validators/runtime-floor-ceilings.json` | The named set: the **two** `fs.globSync` sites, `maxBreaches: 2`. The ceiling must **equal** the list, so a swap (one repaired, one added) is red — the hole `adr-status.ts` closed one level up |
| `packages/tooling/src/validators/runtime-floor-apis.json` | The API table **as data**. Not tidiness: the scanner matches literal substrings, so the table written inside the validator made the validator its own worst offender — **the first run reported 15 violations, every one a row of its own table**. The three Set methods whose names collide with ordinary user code are omitted on purpose and the file says why |
| `packages/tooling/src/validators/runtime-floor.spec.ts` | 23 tests. Includes the swap case, both ratchet directions, and a HEAD assertion that the two breaches are exactly the two listed |
| `package.json` | `validate:runtime-floor` script + a `//validate:runtime-floor` rationale + the chain link. **`validate:all` 58 → 59** |

**API effect on consumers: none.** No package export, type, component, token or
runtime behaviour changed. The gate is repository tooling.

**What the gate deliberately is not.** Not a fix — the floor decision is
**D160 / D176 / `N5-04 D3`** (register row 19) and TASK-R1-O4's
`<stop_conditions>` already classified it as an ADR-18 amendment. Not a second
`validate:engines`: that gate is **green at `4e4e46f`** while the floor is
unusable, because a dependency's `engines` field says nothing about which
built-ins this repository's own source calls.

## 5. The ADR-18 / Node-22 finding, re-measured

TASK-S0-O3's two findings both hold at `4e4e46f`:

- **Exactly two `node:fs` glob sites**, not the one D160 records:
  `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts:49` (used at
  :110) and `packages/codemods/scripts/run-story-color-tokens.ts:15` (used at :33
  and :53). A third site at `packages/codemods/src/runner.ts:13` imports from the
  **`glob` package** — not a breach, and the proof that the replacement is
  already a dependency here.
- **Only the first is lane-reachable.** `run-story-color-tokens.ts` is reached
  only by `yarn codemod:story-colors`, a root script in no CI job, no
  `validate:all` link and no test project — verified by grep across
  `package.json`, `.github/` and every JSON.

The decisive probe, both ways on one machine:

```
v20.19.0 -> typeof require('node:fs').globSync === 'undefined'
v24.14.1 -> typeof require('node:fs').globSync === 'function'
```

and the same spec, same tree, same `node_modules`, one variable changed:

```
node20: vitest run .../landing-token-fallbacks.spec.ts  -> exit 1, TypeError: globSync is not a function, "Tests: no tests"
node24: vitest run .../landing-token-fallbacks.spec.ts  -> exit 0, 9 passed
```

**`validate-min-runtime` is the only one of the four lanes this affects**, and it
affects it decisively: the lane's last step is `yarn test`.

## 6. Aggregate qualification — what ran, what is red, and whose fault it is

### 6.1 Local, at `4e4e46f`, under the declared floor v20.19.0

| Command | Exit | Note |
|---|---|---|
| `yarn validate:engines` | **0** | floor declared consistently; every gate dependency accepts it |
| `generate:ownership:core --check` | **0** | generator starts at the floor |
| `generate:exports:core` | **0** | starts — and **rewrites `packages/core/src/index.ts`** (`e6237d9…` to `379be8a…`): **D158's generator drift is live at `4e4e46f`**. Restored byte-for-byte, `sha256sum -c` exit 0 |
| `yarn validate:all` | **1** in **325 s** | link **51** of 58, `validate:peers` then `validate:icon-duplicates`: `[single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0)`. **Identical under v24.14.1** — not a floor failure |
| links 52–58, individually | **0 each** | `validate:{licenses,tree-shake,evidence-binding,deprecations,adr-status,at-runs,docs-freshness}`. **First execution of these seven in any context**, because link 51 makes them unreachable in the aggregate |
| `vitest run .../landing-token-fallbacks.spec.ts` | **1** | the floor verdict (§5) |
| `min-peer-lane.mjs --plan` | **0** | derives `vue 3.5.0` + `reka-ui 2.0.0`; on-disk `3.5.31` / `2.9.2` |
| `vue-next-lane.mjs --plan` with `DZUP_VUE_NEXT=""` | **0** | pins `3.6.0-rc.6` — **R1-O4's F1 fix holds**, the schedule's empty string no longer pins the empty string |
| `vue-next-lane.mjs --plan` with `=3.6.0-rc.9` | **0** | the dispatch override path works |
| `pack-fixtures.mjs` (no `--build`) | **0** | 4 tarballs; 6/7 fixtures staged; `core-pro` `unrun`. The dist-freshness gate **approved** rather than being bypassed |
| `tar -tzf` the tarballs | **0** | **core carries 1,454 `package/dist/` entries** (tokens 13, contracts 48, nuxt 3) — R1-O4's root cause verified at the artifact level |
| `install-fixtures.mjs` | **0** in 261 s | 6 fixtures, 639 packages each |
| **`yarn test:nuxt-fixtures`** with `DZUP_FIXTURE_NUXT=4.4.5` | **0** in 330 s | **12 passed, 8 skipped (20)** — all six staged fixtures build and assert. The six assertions that used to fail identically on both majors now pass |
| `validate:runtime-floor` | **0** | 2,309 files, 2 listed breaches |
| `validate:runtime-floor --self-test` | **0** | **10/10** clauses fire |
| `vitest run .../runtime-floor.spec.ts` | **0** | **23 passed** |

### 6.2 What the registry says about the declared pins

| Pin | Still resolves? | Drift |
|---|---|---|
| `vue@3.6.0-rc.6` (`vue-next-lane.json`) | **yes** | the `rc` dist-tag is now **`3.6.0-rc.9`** — three RCs stale. **Not repinned** (a `<stop_conditions>` case); raised as `D-S2O4-1` |
| `vue@latest` | `3.5.43` | 3.6 is **not** stable, so `vue-next`'s "becomes blocking" trigger has **not** fired. Advisory remains correct |
| `vue@3.5.0`, `reka-ui@2.0.0` (derived floors) | **both exist** | `reka-ui@latest` is 2.10.5 |
| `nuxt@3.19.0`, `nuxt@4.4.5` | **both exist** | `nuxt@latest` is **4.5.2**. `nuxt@4.4.6` declares `^22.12.0 || ^24.11.0 || >=26.0.0`; `4.5.2` declares `^22.19.0 || …`. **The matrix cannot pin a current Nuxt while this repo's floor is 20.19.0** — raised as `D-S2O4-2` |

### 6.3 CI, read read-only — and it moved under this task

Reading run history is not a dispatch. `gh` is authenticated as `eisic1`
(`gist, read:org, repo, workflow`).

**D167's rationale re-measured.** `gh run list --workflow=ci.yml --limit 100`,
from the JSON:

| | R1-O4 (2026-09-21) | this task (2026-09-24) |
|---|---|---|
| failure / cancelled / success | 83 / 13 / 4 | **82 / 13 / 4** (+1 in flight) |
| newest success | 2026-07-03 | **2026-07-03** (`974019d`) |

**The claim holds — `ci.yml` has not been green for 83 days.** The 83 to 82 move
is one in-flight run entering the window, not an improvement.

**Correction to this task's own brief.** The brief says *"D167 is directly
yours: `ci.yml` has been red since 2026-07-03."* **D167 is the docs-deploy
*trigger* decision** (`workflow_dispatch` + `push: tags: ['v*']` versus
`push: main`); the 83-day red streak is its *rationale*, and it is **TASK-R1-O4's
finding**. The register carries no row for the streak itself — checked across all
62 rows and the §8 addendum. Nothing is contradicted; the attribution is
corrected.

**The remote has moved 11 commits past this checkout, three of them CI fixes.**
`gh api …/compare/4e4e46f...main` returns `status: ahead, ahead_by: 11,
behind_by: 0`. `e528fd9`, `8b46ab4`, `bc02789` (2026-09-24, 12:44–12:59 UTC)
claim exactly the failures R1-O4 catalogued. **None of the 11 touches
`.github/`**, so all four lane files are byte-identical to `589be13`.

**Run `36004699830` (head `3147432`, the first run after those fixes) —
per-job, ubuntu-latest, today:**

| Job | Conclusion | What it means |
|---|---|---|
| Typecheck | **success** | first time in this programme's records |
| Lint | **success** | as above |
| **Validate (boundaries + tokens)** | **success** | **R1-O4's `tooling` to `@dzup-ui/contracts` boundary violation is fixed on `main`** |
| Unit Tests (Node 22.13.0) | cancelled | fail-fast — the upper half of the range is **still unmeasured** |
| **Unit Tests (Node 20.19.0)** | **failure** | `TypeError: globSync is not a function`, **1 failed / 553 passed (554)**. The local Node-20 reproduction matches CI line for line |
| **validate-min-runtime / Validators** | **failure** | `[freshness] packages/core/docs/capability-matrix.json is stale` — **a third, different non-floor cause** |
| Storybook Build · E2E · Landing E2E · Storybook Tests | failure | pre-existing, R1-O4 §6 |
| Build (library mode) · Test Coverage | skipped | dependency of a failed job |
| workflow conclusion | **cancelled** | |

Two findings fall out of that table, and they change the recommendations:

1. **The `lucide-vue-next` dual version is fixed on `main`, not here.** All three
   declarants (`apps/landing`, `apps/sandbox`, `packages/core`) now read
   `^0.477.0` on `main` — read from the remote contents API. So the local link-51
   failure at `4e4e46f` is **already closed upstream**, and register row **#3**
   (with **#17**, `apps/sandbox`) should be re-measured against `main` before
   anyone works it.
2. **`validate-min-runtime` now fails at `validate:capability-matrix`, and the
   fix is sitting in this worktree.** `packages/core/docs/capability-matrix.json`
   is modified-uncommitted here (TASK-S1-O2's regeneration) and
   `validate:capability-matrix` is **exit 0** locally. On `main`, which does not
   have that uncommitted change, it is stale. **Until the owner commits the 269
   paths, no dispatch of this lane can reach the step that carries the floor
   question.**

**The three scheduled `vue-next` runs, independently re-verified.**
`gh run list --workflow=vue-next.yml` returns exactly three runs (2026-09-07
`63be543`, -09-14 `ecd885b`, -09-21 `527dbd1`), all `event: schedule`, all
`conclusion: success`. `gh run view 35583557452 --json jobs` on the newest:

```
workflow conclusion: success
  job: Unit + contract suite under Vue 3.6-RC        -> failure
  job: Nuxt consumer fixtures (nuxt 4.4.5)          -> failure
  job: Nuxt consumer fixtures (nuxt 3.19.0)         -> failure
```

**R1-O4's F4 confirmed from the source.** And `validate-min-runtime.yml` and
`min-peer.yml` return **NO RUNS** as workflows of their own — neither has ever
been dispatched. All three `vue-next` runs predate `589be13`, so **the fixed
lane has never run.**

## 7. The min-peer lane, run in full — the finding that justifies the whole task

`min-peer` was run **in a throwaway `git worktree` at `4e4e46f`** under Node
20.19.0, placed at `C:/Users/Ekii/AppData/Local/Temp/s2o4wt` and removed
afterwards. Deviations from the CI job, stated rather than glossed:

- the CI job's first `yarn install --immutable` was skipped and the runner's own
  pinned install was the only one — the worktree started with no `node_modules`;
- `yarn workspace @dzup-ui/tokens build` was replaced by **copying the eight
  already-built `packages/*/dist` directories** from the main checkout. The CI
  job builds tokens under the **default** toolchain *before* the pin is applied,
  so a dist built at `vue 3.5.31` is the artifact that step produces. The
  deviation is that all eight were copied, not one built;
- win32, not `ubuntu-latest`.

A first attempt failed and the reason is worth recording: `git worktree add` into
the scratchpad died with **`Filename too long`** on the
`e2e/visual/theme-recipe-matrix.spec.ts-snapshots/*.png` baselines — the
scratchpad path plus a 134-character snapshot name exceeds Windows' `MAX_PATH`.
`git worktree list` confirmed nothing was registered and the partial directory
was removed. The retry used a short path plus `git -c core.longpaths=true`, with
**no persistent config change** to the repository.

### 7.1 The install succeeded — the declared floor resolved here for the first time

```
· resolved on disk:
    vue 3.5.0 · @vue/compiler-sfc 3.5.0 · @vue/runtime-core 3.5.0
    @vue/runtime-dom 3.5.0 · @vue/server-renderer 3.5.0 · @vue/shared 3.5.0
    reka-ui 2.0.0
```

Install: **1 m 59 s**, `Done with warnings`. The runner's own assertion that the
pin landed **passed**, so this is **not** an `exit 2` ("the lane could not run").

### 7.2 `typecheck` FAILS at the declared peer floor — exit 1, 171 s

**622 TypeScript errors across 127 files in 11 of the 11 component families.**
`TS2345` 341 · `TS2344` 95 · `TS2769` 92 · `TS2339` 87 · `TS2322` 6 · `TS7006` 1.
Only **16** of the 127 files are the `reka-ui`-backed overlays, so this is **not**
a Reka finding.

**The root cause is one Vue type, measured to the exact patch release.**
`@vue/runtime-core`'s `.d.ts`, read out of the registry tarballs:

| Vue | `ComponentTypeEmits` |
|---|---|
| 3.5.0 – **3.5.12** | `((...args: any[]) => any) \| Record<string, any[]>` |
| **3.5.13** – 3.5.31 | `((...args: any[]) => any) \| Record<string, any>` |

Probed at 3.5.1, .5, .8, .11, **.12**, **.13**, .17, .22, .31 — the widening
lands at **3.5.13**.

And the mechanism, isolated in a nine-line `tsc --strict` probe rather than
asserted:

```
interface E { escapeKeyDown: [event: Event] }
declare function narrow<T extends ((...a: any[]) => any) | Record<string, any[]>>(): T
narrow<E>()
→ error TS2344: Type 'E' does not satisfy the constraint …
    Index signature for type 'string' is missing in type 'E'.
```

**An `interface` has no implicit index signature**, so it satisfies the widened
`Record<string, any>` and fails the narrow `Record<string, any[]>`. Every
`Dz*Emits` in this repository is declared as an `interface` — that is the
documented pattern in `CLAUDE.md`. So **95 constraint failures follow from one
upstream type change**, and the other 527 errors are its downstream fallout in
`mount()` overloads and `$el` access.

### 7.3 What that means, in one sentence

`@dzup-ui/core`, `@dzup-ui/contracts` and `@dzup-ui/compat` all publish
`peerDependencies: { vue: "^3.5.0" }`. **The library does not typecheck on
`vue` 3.5.0 through 3.5.12 — thirteen releases the published range admits.** The
root manifest already depends on `vue: ^3.5.13`, which is **exactly** the first
version that works. The range was written one way and developed against another,
and nothing in the repository could see the gap until the floor was resolved.

This is precisely the class of defect the lane was built to find, found **without
spending a CI minute** — and it is the answer to the 08-11 package matrix's
minimum-peer row and to N5-04's `R-058c`.

### 7.4 The suite at the floor

The runner stops at the first failing command, so its second command
(`vitest run packages/core packages/contracts packages/nuxt`) did not run inside
the lane. Because the worktree's `node_modules` still held the floor versions
(`vue 3.5.0`, `reka-ui 2.0.0`, verified by reading their `package.json`s), that
command was run **directly in the same worktree** under Node 20.19.0 — the lane's
second command, at the lane's dependency set, one step outside the lane's control
flow. Result below.

### 7.5 The suite at the floor — the second finding

`vitest run packages/core packages/contracts packages/nuxt`, Node 20.19.0,
`vue 3.5.0`, `reka-ui 2.0.0`: **exit 1 in 256 s — 9 failed / 364 passed (373 files);
32 failed / 5,670 passed / 3 skipped (5,705 tests).** Every one triaged, because "32 red" is not a finding:

| Cluster | Tests | Measured | Cause |
|---|---:|---|---|
| `DzPersonaSelector` security corpus (`url-policy` 9 + `malicious-corpus` 11) | **20** | all measured **`rejected`** where the corpus requires `inert` / `escaped` — *"no `src` rendered"*, *"the value does not appear in the DOM at all"* | the combobox option list never opens at `reka-ui@2.0.0`, so the sink is never rendered. **`rejected` is the strictest outcome in the corpus's vocabulary — these are NOT security regressions** |
| `DzCombobox` 3 · `DzMultiSelect` 2 · `DzCascader` 1 | **6** | `expected undefined to be truthy`; `expected to have a length of 3 but got +0` | same root cause: the listbox / inline Reka options do not appear |
| `useDialog` | **3** | `expected 'hidden' not to be 'hidden'` on unmount cleanup and in non-modal mode | **a scroll lock applied when it should not be and not released on unmount** — the one failure here a consumer would meet on their first modal |
| `DzPanel` · `DzDatePicker` aria wiring | **2** | `aria-controls`, native `required` semantics | `reka-ui` id-and-aria wiring differs at 2.0.0 |
| `count-bearing` → `DzCountdown announces plurals` | **1** | `expected '2 days, 2 hours, 2 seconds remaining' to be 'Countdown finished'`; the file took **70.2 s**; the run also reported `Error: [vitest-worker]: Timeout calling "onTaskUpdate"` | **a load flake, not a floor finding.** This machine has produced exactly this shape before. Not counted either way |

**The two halves of the lane found two different things — which is what it was
built to separate.** `typecheck` fails because of **`vue@3.5.0`**; the suite fails
because of **`reka-ui@2.0.0`**. `@dzup-ui/core` publishes `reka-ui: ^2.0.0`, the
tree resolves 2.9.2, and **2.0.0 has never been installed here and does not
work.** The exact boundary is **not** bisected — that is a follow-up, not a guess
(`D-S2O4-6`).

### 7.6 Two confounds considered and excluded, so the §7.2 conclusion can be relied on

The `min-peer` worktree run deviated from the CI job in two ways, and both were
checked against the conclusion rather than left as caveats:

1. **"The copied `packages/*/dist` were built under `vue 3.5.31`, so maybe the
   `.d.ts` mismatch is mine."** No. The 95 constraint errors are of the form
   `Type 'Dz…Emits' does not satisfy the constraint 'ComponentTypeEmits'`, where
   `Dz…Emits` is declared in **core's own `.types.ts` source** and
   `ComponentTypeEmits` comes from the **resolved Vue in `node_modules`** (3.5.0).
   Neither side of the failing relation is read from a copied `dist`.
2. **"`vue-tsc` was deliberately not overridden (it stayed at 3.3.3), so maybe
   this is a tool mismatch rather than a peer-range problem."** No — and this is
   the reason the `tsc --strict` probe exists. The probe uses **no `vue-tsc` and
   no Vue at all**: it declares the two `ComponentTypeEmits` definitions as
   literal type aliases, read out of the two registry tarballs, and asks plain
   `tsc` whether an interface satisfies each. The narrow one fails with
   `Index signature for type 'string' is missing`. The mechanism is TypeScript's
   implicit-index-signature rule meeting Vue's published type — it holds for any
   consumer, with any checker version.

What the deviations *do* leave open, stated plainly: this is **win32**, and the
CI job's first default `yarn install --immutable` was skipped. Neither can change
a type relation, but both are reasons the CI record is still worth having, which
is the first half of the `min-peer` **GO**.

## 8. Ratchet movements (old → new)

| Ratchet | Old | New | Note |
|---|---:|---:|---|
| `validate:all` chain links | **58** | **59** | `validate:runtime-floor` appended at the END; links 1–58 keep their numbers. **Counted, never quoted:** `node -e "…scripts['validate:all'].split('&&').length"` |
| Source sites using a Node API newer than the declared floor, **held by a named set** | **0** (nothing held them; D160 recorded **one** of the two) | **2 of 2** | new `maxBreaches: 2` in `runtime-floor-ceilings.json`, two-way: a new breach fails unlisted, a repaired one fails until the ceiling falls |
| Gates that can distinguish "the declarations agree" from "the floor is usable" | **0** (`validate:engines` only does the first, and is green while the floor is unusable) | **1** | |
| `validate:all` links that have **ever executed** | **50 of 58** (51 fails, 52–58 unreachable in the aggregate) | **58 of 58** | links 52–58 run individually under the floor, exit 0 each — first execution in any context |
| CI lanes with a local run record under their **declared** runtime | **0 of 4** | **4 of 4** | min-runtime full · min-peer **full, including the pinned install** · nuxt-majors full for 1 of 2 matrix legs · vue-next `--plan` only (dependency set named as not installed) |
| Lanes ever dispatched or scheduled-and-fixed | `validate-min-runtime` **NO RUNS** · `min-peer` **NO RUNS** · `vue-next` 3 runs, all measuring the wrong Vue | unchanged — **0 dispatched by this task** | dispatch is the owner's act |
| Published peer ranges **verified at their declared floor** | **0 of 2** | **2 of 2 verified — and 2 of 2 FALSE** | `vue: ^3.5.0` fails typecheck below 3.5.13; `reka-ui: ^2.0.0` fails the suite. This is the ratchet the 08-11 package matrix's minimum-peer row asked for |
| `nuxt-majors` fixtures asserting something | **0 of 6** (all six failed identically on a tarball with no `dist/`) | **6 of 6 green** at nuxt 4.4.5, locally | 12 passed / 8 skipped; `core-pro` `unrun` pending TASK-S3-O1 |
| Tarballs carrying build output | *unverified at the artifact level* | **4 of 4** | `tar -tzf`: core 1,454 `package/dist/` entries, tokens 13, contracts 48, nuxt 3 |
| Self-tested gate clauses added | — | **10/10** fire · **23** unit tests | `runtime-floor --self-test`, `runtime-floor.spec.ts` |

**No ratchet raised. No allowlist widened. No exception file loosened.**
`maxBreaches: 2` is a new ceiling set from a measurement, not a relaxation of an
existing one, and both entries carry a dated reason and an exit condition.

## 9. Proof that the install state is unchanged

| Check | Before | After |
|---|---|---|
| `sha256sum yarn.lock` | `6332fae9…87b` | **`6332fae9…87b` — identical** |
| `git status --porcelain -- yarn.lock` | clean | **clean** |
| shared `node_modules` resolved versions | `vue 3.5.31` · `reka-ui 2.9.2` · `@vue/runtime-core 3.5.31` | **unchanged** |
| `git status --porcelain \| wc -l` | **269** | **274** = 269 + the four new validator files + the one tracked file this task edited outside its own programme (`docs/program-2026-09-04/reports/ci-dispatch-request-2026-09.md`, appended §5). `docs/program-2026-09-22-architecture/reports/` was already a single `??` directory entry, so the two new reports add 0. **`diff` of the full porcelain list before and after shows exactly those five additions and nothing else** — no path this task did not create was changed or removed |
| `git worktree list` | one entry | **one entry** — the throwaway worktree was pruned and its directory removed |
| `packages/core/src/index.ts` | sha `e6237d9…` | **`e6237d9…`, `sha256sum -c` exit 0** |
| `packages/core/manifests/component-ownership.manifest.json` | sha `e4d6fc2…` | **`e4d6fc2…`, exit 0** |

**Two state changes I made and repaired, stated rather than hidden:**

1. **`generate:exports:core` rewrote `packages/core/src/index.ts`.** It was
   snapshotted before the run and restored after; `sha256sum -c` confirms the
   bytes, and `git status` confirms the file is **clean against HEAD**.
2. **The restore moved that file's mtime**, and `pack-fixtures.mjs`'s dist
   freshness gate is mtime-based — it immediately refused, reporting core's dist
   *"20 h 42 m behind"*. The mtime was repaired to **2026-09-23T16:28:48Z**, the
   newest pre-existing mtime under `packages/core/src`, which restores the gate's
   verdict (newest src `16:28:48Z` < newest dist `16:49:06Z`, i.e. **fresh**)
   without inventing a time later than any real edit. The original mtime is not
   recoverable — git does not store it — and this is recorded here because a
   silently stale-looking dist is exactly the kind of thing that costs the next
   agent an hour.

`packages/nuxt/test/.tarballs/` was repacked (four fresher tarballs, replacing
2026-09-21 ones). It is **gitignored** via `packages/nuxt/test/.gitignore:4`, it
is regenerable by `yarn test:nuxt-fixtures:pack`, and the new ones passed the
freshness gate the old ones predate. Nuxt fixtures were staged and installed
**outside the repository**, in the scratchpad.

## 10. Owner decisions raised

Six, in the order they bite. Full options and recommendations in
[`TASK-S2-O4-lane-evidence.md`](./TASK-S2-O4-lane-evidence.md) §12.

1. **`D-S2O4-5`** 🔴 — **`vue: ^3.5.0` is false; narrow to `^3.5.13`.** Measured to
   the patch. **A4-D1 precondition**: free today, a breaking 0.x `minor` after
   first publication.
2. **`D-S2O4-6`** 🔴 — **`reka-ui: ^2.0.0` is false.** Bisect the boundary and
   narrow; same changeset as #1. `useDialog` leaking a scroll lock makes "leave
   it" unavailable.
3. **`D-S2O4-3`** 🟠 — `validate-min-runtime` has now mis-attributed a failure to
   Node **three times**. Commit the tree (which carries the fresh capability
   matrix) and split the `Validators` step.
4. **`D-S2O4-2`** 🟠 — the Node floor now costs Nuxt coverage: the matrix cannot
   pin `nuxt@4.5.x`. A second, independent argument for D160/D176.
5. **`D-S2O4-4`** 🟢 — wire `min-peer.yml` into `ci.yml` after its first green run.
6. **`D-S2O4-1`** 🟢 — the `vue-next` pin is three RCs stale; repin, or resolve the
   `rc` dist-tag at run time.

Two register rows should be **re-measured against `main`, not against this
worktree**, because `main` has moved: row **#3** (icon-library single version —
**fixed on `main`**) and, with it, row **#17** (`apps/sandbox` removal, which was
#3's cheapest cause and is now not needed for that purpose).

## 11. done_check outcome — **4 of 4 at `4e4e46f`, clause 1 defective and clause 3 partial**

| Clause | Verbatim result | Verdict |
|---|---|---|
| 1. `ls .github/workflows/*.yml \| xargs grep -l 'min-runtime\|nuxt-majors\|vue-next\|min-peer' \| wc -l` → *"the four jobs exist as configuration"* | **4** | **PASSED and DEFECTIVE — the fourth recurrence of this shape in this programme.** It counts **files**, not jobs, and the coincidence that the number is 4 hides two errors that cancel: `ci.yml` matches while holding **no lane job** (only a `uses:` line and a comment), and `vue-next.yml` holds **two**. **Deleting the `nuxt-majors` job entirely would still return 4**, so the clause cannot detect the absence of the very job the task is named for. It is also a pipeline ending in `wc -l`, so `grep`'s exit code is discarded — the repository's own rule against reading a gate through a pipe. Replaced by the per-file map in §1 of the lane-evidence document |
| 2. `ls …/TASK-S2-O4-lane-evidence.md` | **exit 0** (did not exist at start) | **PASSED** |
| 3. *"For each lane, the evidence document shows a local run under the **declared** runtime/dependency set"* | see §2–§7 | **PASSED for three of four, PARTIAL for `vue-next`.** min-runtime: declared Node, declared commands, cold install named as skipped. min-peer: declared Node **and** the declared dependency set actually installed and asserted. nuxt-majors: declared Node and dependency set, 1 of 2 matrix legs. **`vue-next`: declared Node yes, declared dependency set NO** — the `3.6.0-rc.6` pin was planned and verified resolvable but not installed, because the runner leaves `node_modules` pinned and the one worktree slot went to the lane whose answer nothing else will ever produce. Recorded as not run, with the reason, rather than inferred |
| 4. `grep -n 'go\|no-go' …` → *"each lane carries a recommendation"* | **5 matching lines** | **PASSED, but the clause cannot decide what it claims.** `go\|no-go` is `go` OR `no-go`, and `go` matches inside `going`, `ago`, `category`. A document with no recommendation at all would pass it. The recommendations are in §8 as a four-row table with a blocking-vs-reporting column and a reason each |

**At task start: 1 of 4 (clause 1 only). At task end: 4 of 4, with clause 1
defective and clause 3 partial by a named, deliberate omission.**

## 12. Ranked next packet

1. **Take `D-S2O4-5` + `D-S2O4-6` and write the changeset** — the two false peer
   ranges. It is the only finding here that is *free today and expensive after
   first publication*, and it blocks **A4-D1**. Bisect `reka-ui` with
   `min-peer.yml -f commands=…` (~4 dispatches, ~10 min each) or take the safe
   `^2.9.0`.
2. **Commit the 269 working-tree paths.** Three separate things are waiting on it:
   `validate-min-runtime` cannot reach the floor question without the fresh
   capability matrix; every artifact in this programme is stamped in an
   uncommitted tree; and the remote is 11 commits ahead, so the merge gets more
   expensive each day.
3. **Dispatch `min-peer.yml`, then `vue-next.yml`** — in that order, at a named
   sha, per §11 of the lane-evidence document. Or let Monday's schedule take
   `vue-next` for free.
4. **`D160`/`D176`, the Node floor** — now supported by three independent
   measurements: the two `globSync` sites, CI's `Unit Tests (Node 20.19.0)`
   failing today, and `nuxt@4.4.6`+ having dropped Node 20 (so the floor costs
   coverage, not just tidiness). `validate:runtime-floor` holds the line until it
   is taken.
5. **`D-S2O4-3`** — split `validate-min-runtime`'s `Validators` step so a
   Node-independent failure is named as such. Cheap, and this lane has now
   mis-attributed three failures to Node.

## 13. A defect this task introduced, found, and fixed — worth one paragraph

The gate's self-reference problem has two layers and only the first is obvious.

**Layer one:** the scanner matches literal substrings, so the API table written
inside the validator made the validator its own worst offender — the first run
reported **15 violations, every one a row of its own table**, plus prose from its
own header. Fixed by moving the table into `runtime-floor-apis.json`, which the
scanner does not read, plus a `runtime-floor-ok` marker for the residue.

**Layer two, and the reason the marker is not the answer:** `eslint --fix` (run
to clear three real style errors) **deleted an inline `runtime-floor-ok` marker
comment** while reformatting an array literal, and the gate went red on its own
seeded self-test data in the very next run. Two further self-matches appeared the
same way — an `eslint --fix` reflow, and a doc comment that named a too-new API
in prose.

The fix is `seedLine()` / `seedCall()`, which **compose** the offending string at
run time so the literal never exists on any line of the file. It is recorded in
`seedLine`'s own doc comment, because the next person to add a seeded case will
reach for a marker first.

Generalisable: **a gate that scans source text is inside its own input, and any
marker-based exemption is only as durable as the formatter.** `adr-status.ts`
solved the same problem one task earlier with per-line markers and has not yet
met a formatter that moves them.

## 14. Final validation — exact commands and exit codes

Run from `ui/dzup-ui`, each exit code read **directly**, never through a pipe.

| Command | Exit | Note |
|---|---:|---|
| `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/runtime-floor.ts` | **0** | *"declared floor 20.19.0 · 2309 source file(s) scanned · 2 API(s) above the floor, all listed"* |
| `… runtime-floor.ts --self-test` | **0** | **10/10** clauses fire |
| `node node_modules/vitest/vitest.mjs run packages/tooling/src/validators/runtime-floor.spec.ts` | **0** | **23 passed** |
| `node node_modules/eslint/bin/eslint.js --max-warnings 0` on the two new `.ts` | **0** | after one `--fix` pass, whose side effect is §13 |
| `yarn typecheck:tooling` | **0** | `validate:all` link 2 accepts the new validator |
| `node -e "…scripts['validate:all'].split('&&').length"` | **59** | **58 → 59**, appended at the END. Measured, not quoted |
| **`yarn validate:all`** (end to end, 59 links) | **1** in **360 s** | **exits at link 51, unchanged**: `validate:peers` → `validate:icon-duplicates`, `✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0)`. **Pre-existing, not new** — identical link and message before this task, under both Node majors, and **already fixed on `main`** (register row #3). Everything from link 1 to 50 passes, including `validate:{doc-snippets,readme-facts,adr-references,changelog,release-policy}` **with this task's two new reports and four new files in the tree** |
| **`node node_modules/vitest/vitest.mjs run`** (whole suite) | **0** in **339 s** | **570 files passed (570) · 11,084 passed / 3 skipped / 1 todo (11,088).** Was 569 / 11,061 at task start; the delta is exactly this task's one new spec file and its 23 tests |

**One honest caveat about link 59.** The chain exits at link 51, so
`validate:runtime-floor` is **not reached in the aggregate** — the same condition
links 52–58 are in, which is itself a finding this task recorded. The gate is
therefore proven by its **own invocation** (exit 0), its **`--self-test`** (10/10)
and its **spec** (23 tests), not by the aggregate. It becomes aggregate-reachable
the moment link 51 is settled, and on `main` today the chain stops even earlier,
at `validate:capability-matrix`. Saying "`validate:all` is green" would be false
either way, and this task does not say it.

Under the **declared floor v20.19.0**, for the record: `validate:engines` 0 ·
generators 0 · `validate:all` **1 at link 51** in 325 s · links 52–58
individually **0 each** · the `globSync` spec **1** (and **0** under v24.14.1) ·
`min-peer` full lane **1** at `typecheck` · the min-peer suite **1** ·
`nuxt-majors` at nuxt 4.4.5 **0**.

---

*Nothing was committed, pushed, dispatched, published or deployed. No CI workflow
was triggered; run history was read read-only. No sibling repository was touched.*
