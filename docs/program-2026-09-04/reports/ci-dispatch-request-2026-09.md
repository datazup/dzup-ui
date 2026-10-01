# CI dispatch request — 2026-09

> **For the owner. TASK-R1-O4 prepared these lanes; dispatching them is owner authority.**
> Prepared 2026-09-21 against `main` @ `527dbd1` plus the working tree of
> TASK-R1-O1/O2/O3/O4 (231 uncommitted paths). Nothing here was dispatched,
> pushed, committed or triggered.
>
> Report: [`TASK-R1-O4-handoff.md`](./TASK-R1-O4-handoff.md) — read §1 first, because
> **the premise that these lanes "have never run" is false**. They have run; they
> have been reporting `success` while failing.

---

## 0. Read this before you dispatch anything

**A. The working tree must be committed and pushed first.** `workflow_dispatch`
resolves a workflow **by the file that exists on the ref**, and two of the five
files below (`min-peer.yml`, `validate-min-runtime.yml`) are new and untracked.
GitHub also requires a `workflow_dispatch` workflow to have been seen on the
**default branch** before the API will accept a dispatch for it. Until
`git push` happens, every command in this document fails with
`could not find any workflows named …` — and dispatching the *existing* lanes
against today's `main` would only reproduce the failures §1 of the handoff
describes, because the fixes are in the uncommitted tree.

**B. Every expectation below is bound to a commit that contains R1-O1 + R1-O2 +
R1-O3 + R1-O4.** Against `527dbd1` alone they are all wrong.

**C. Two results are already known without dispatching, and they change what you
should expect:**

1. **The declared Node floor is false on its 20.x branch.**
   `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts:49` imports
   `globSync` from `node:fs`. `fs.globSync` is `@since v22.0.0`
   (`node_modules/@types/node/fs.d.ts:4442`). `engines.node` is
   `^20.19.0 || >=22.13.0` and `.nvmrc` is `20.19.0`, so `yarn test` **cannot
   pass** on the lower half of the declared range. CI already recorded it on
   2026-09-20 (`Release` run `35511985926`: `TypeError: globSync is not a
   function`). This is **1.0 criterion C10, answered**, and the answer is *no*.
   It is an ADR-18 amendment, not a dispatch outcome — see handoff decision
   **D160**.
2. **CI has not been green since 2026-07-03.** Of the last 100 `ci.yml` runs:
   **83 failure · 13 cancelled · 4 success**, and all four successes are from
   June/early July. Every "locally qualified" claim in this programme sits on
   top of that.

---

## 1. The dispatch table

| Workflow | Ref | Expected | If red it means |
|---|---|---|---|
| **`validate-min-runtime.yml`** (new; extracted from `ci.yml`) | `main` @ the commit carrying R1-O1…O4 | Reaches `Validators` (link 48 of `validate:all`) **green**, then **fails at `Test at the floor`** with `TypeError: globSync is not a function`. That is the *expected* red and it is the point of the lane. | Failing **earlier** than `yarn test` is new information: at `Install` = a dependency stopped accepting Node 20.19.0; at `Generators` = a generator does not start at the floor; at `Validators` = a validator does not run at the floor, which is a second ADR-18 input beside the `globSync` one. Failing **nowhere** would mean the `globSync` analysis is wrong and C10 is satisfiable — re-read the log before believing it. |
| **`min-peer.yml`** (new) | same | The lane **runs** (installs `vue@3.5.0` + `reka-ui@2.0.0`, asserts both landed), then reports typecheck and suite results at the floor. Locally proven: the floor pair installs with npm's own peer resolution and **8 components SSR-render from the packed `@dzup-ui/core` tarball** under it, including the `reka-ui`-backed `DzTooltip`. The suite at the floor is **genuinely unknown** — nothing has ever run it. | **Exit 2** = the lane could not run: either the install refused (a transitive constraint the resolver will not bend — that is TASK-R1-O6 peer-hygiene input, and a stop condition of this task) or the floor did not land on disk (a lockfile lifted it). **Exit 1** = a published peer range is **false**: `@dzup-ui/core` tells consumers `vue: ^3.5.0` / `reka-ui: ^2.0.0` and it is not true. The fix is code, or a narrowed range with a changeset — narrowing is `minor` under `VERSIONING.md`, the breaking position for 0.x. |
| **`vue-next.yml`** — job `suite` | same | The **first real run this lane has ever had**. Expect it to pin `3.6.0-rc.6` (it previously pinned `""`) and actually execute; N5-03 measured **9,181/9,183** locally under 3.6, so that is the reference. Advisory: `continue-on-error`. Read the **run summary**, not the tick. | A genuine Vue 3.6 regression → the watch-list item becomes a task. **Exit 2** now means the pin did not land and the run is *not* a result — the lane says so instead of measuring the wrong Vue, which is what it did on 2026-09-07, -09-14 and -09-21. |
| **`vue-next.yml`** — job `nuxt-majors` (same dispatch; a job cannot be dispatched alone) | same | Both legs (`nuxt 3.19.0`, `nuxt 4.4.5`) **green**. They failed identically on both majors only because the tarballs carried no `dist/`; `--build` fixes that, and `yarn test:nuxt-fixtures:pack` is exit 0 locally (R1-O3 §7). | A **real** Nuxt compatibility defect, for the first time. Both majors here are *released*, so unlike the `suite` job this is a defect claim against this repository — which is exactly decision **N5-03-D6** (should this leg be blocking?), still open. |
| **`ci.yml`** (now dispatchable) | same | **Still red in several jobs, and that is the finding.** Seven were red on 2026-09-20, each for its own reason — handoff §6 lists them one by one from the log. Only `test` is a missing-build failure (**D161**); `validate` is a boundary violation, `storybook` is a size budget exceeded by 0.00 MB, `landing-e2e` is assertion failures, and three (`e2e`, `storybook-test`, `landing-perf`) have **no error line in `--log-failed`** and are recorded as *not determined*. R1-O4 fixed only the lanes it owns. | `typecheck`, `lint`, `validate` and `build` going green = the R1-O1 green tree survives CI, which nothing has yet shown. Match every red job against handoff §6's table before calling anything a regression: most of it has been red since 2026-07-03. |

---

## 2. The exact commands

Run from a checkout of `datazup/dzup-ui`. `gh` is authenticated as `eisic1`
with the `workflow` scope (verified 2026-09-21), so all five will work once the
tree is pushed. Replace `<sha>` with the commit that carries R1-O1…O4 — naming
the sha rather than `main` is what makes the run quotable later.

```bash
# 1. The Node floor (ADR-18, 1.0 criterion C10). ~8 min.
gh workflow run validate-min-runtime.yml --ref <sha>

# 2. The declared peer floor (08-11 doc 08 package matrix). ~10 min.
gh workflow run min-peer.yml --ref <sha>
#    …or narrow it to one suite while triaging:
gh workflow run min-peer.yml --ref <sha> -f commands='vitest run packages/core'

# 3+4. Vue 3.6 RC and both Nuxt majors — one dispatch, three jobs. ~6 min.
gh workflow run vue-next.yml --ref <sha>
#    …pin a different RC when triaging a specific one:
gh workflow run vue-next.yml --ref <sha> -f version=3.6.0-rc.7

# 5. The whole blocking graph, on demand for the first time. ~15 min.
gh workflow run ci.yml --ref <sha>
```

Then watch and collect:

```bash
gh run list --limit 10
gh run watch <run-id>
gh run view <run-id> --json jobs -q '.jobs[] | "\(.name)\t\(.conclusion)"'
gh run view <run-id> --log-failed > <run-id>-failed.log    # never read a gate through a pipe
```

**`vue-next.yml` needs `gh run view --json jobs`, not the run conclusion.** Every
job in it is `continue-on-error: true`, so the workflow reports `success` even
when all three jobs fail — which is exactly what happened three weeks running.
R1-O4 added an `if: always()` step to each job that writes the true outcome into
the run summary, so the summary page is now readable on its own; the tick is
still not.

---

## 3. Recording scaffold — fill after dispatch

Step 4 of TASK-R1-O4 (triage and record) **could not be reached**: it begins
after the dispatch, and the dispatch is yours. Paste the rows here; the handoff
and `EXECUTION-STATUS.md` both point at this table.

| Workflow | Run id | Date (UTC) | Ref | Conclusion (from `--json jobs`, not the tick) | Per-job result | Triage: workflow bug / lane failure / pre-existing | Log |
|---|---|---|---|---|---|---|---|
| validate-min-runtime | | | | | | | |
| min-peer | | | | | | | |
| vue-next · suite | | | | | | | |
| vue-next · nuxt-majors (3.19.0) | | | | | | | |
| vue-next · nuxt-majors (4.4.5) | | | | | | | |
| ci | | | | | | | |

**Triage rule, so the rows mean the same thing to everyone:** a *workflow bug*
is fixed here and re-dispatched. A *lane failure* is a finding with a task id
and is **not** fixed inside this packet — the floor breaking is ADR-18's
business (R0-O2), a peer range breaking is R1-O6's, a Vue 3.6 break is the
watch list's. A *pre-existing* red is one the handoff §1 already names.

**The evidence pages stay untouched until these rows exist.** `apps/docs`
evidence pages are generated, never hand-edited, and there is no CI-evidence
input to the generator yet — building one before a single run exists would be a
schema with nothing in it. Handoff decision **D162** proposes the shape.

---

## 4. What was NOT prepared, and why

- **Nothing was dispatched, pushed, committed or tagged.** `[!owner dispatches]`.
- **The `actions/*@v4` → `@v5` bump was not made.** Every run since GitHub's
  2025-09-19 deprecation warns that `actions/checkout@v4`,
  `actions/setup-node@v4` and `actions/cache@v4` target Node 20 and are being
  forced onto Node 24. It is six files and cannot be verified without a
  dispatch, so it is decision **D163** rather than an unverified edit made on
  the way past.
- **The missing build step in `ci.yml`'s other jobs was not added** (**D161**).
  `test`, `e2e` and `coverage` have no build step; `validate` builds only half
  of what it needs. Four lines, outside this task, and it belongs with whoever
  owns the CI graph — most naturally a follow-up to TASK-R1-O1, whose green tree
  it is preventing CI from confirming.
- **`landing-token-fallbacks.spec.ts`'s `globSync` was not fixed.** This task's
  own `<stop_conditions>` say a lane failing on the declared floor is an ADR-18
  amendment input, not a fix here. **D160.**

---

## 5. Addendum — local evidence and go/no-go, 2026-09-24 at `4e4e46f` (TASK-S2-O4)

*Appended, not rewritten, so §0–§4 above stay readable as what was known on
2026-09-21 at `527dbd1`. Full record:
[`../../program-2026-09-22-architecture/reports/TASK-S2-O4-lane-evidence.md`](../../program-2026-09-22-architecture/reports/TASK-S2-O4-lane-evidence.md);
reasoning and deviations:
[`../../program-2026-09-22-architecture/reports/TASK-S2-O4-handoff.md`](../../program-2026-09-22-architecture/reports/TASK-S2-O4-handoff.md).
Nothing was dispatched.*

### 5.1 §0.A is discharged — the tree is pushed and all four lanes are dispatchable

`git ls-files .github/workflows/` lists all **eight** files; every lane
definition landed in **`589be13`**; `4e4e46f` is an **ancestor** of the remote
default branch (`gh api …/compare/4e4e46f...main` → `ahead_by: 11,
behind_by: 0`). The blocking precondition this request opened with no longer
applies.

### 5.2 `main` has moved 11 commits, three of them CI fixes, and none touches `.github/`

`e528fd9` · `8b46ab4` · `bc02789` (2026-09-24, 12:44–12:59 UTC) address exactly
the failure classes §1 and the R1-O4 handoff §6 catalogue. Run
**`36004699830`** (head `3147432`) is the first `ci.yml` run after them:

| Job | Then (2026-09-20) | Now (`3147432`) |
|---|---|---|
| Typecheck · Lint | red | **success** |
| Validate (boundaries + tokens) | red — `tooling` → `@dzup-ui/contracts` | **success** |
| Unit Tests (Node 20.19.0) | red — config load, nothing built (**D161**) | **red for a different reason: `TypeError: globSync is not a function`, 1 failed / 553 passed.** D161 is discharged; **D160 is confirmed on CI** |
| Unit Tests (Node 22.13.0) | — | cancelled by fail-fast — the upper half of the range is **still unmeasured** |
| validate-min-runtime | red — generator drift misread as the floor (F2) | **red at `validate:capability-matrix`: `[freshness] packages/core/docs/capability-matrix.json is stale`** |
| Storybook Build · E2E · Landing E2E · Storybook Tests | red | red, pre-existing |

**`ci.yml` still has not been green since 2026-07-03** — re-measured over the last
100 runs: **82 failure · 13 cancelled · 4 success**, newest success `974019d`,
2026-07-03. The 83 → 82 move is one in-flight run entering the window.

### 5.3 Two of §1's expectations are falsified, and the reasons matter

1. **The `lucide-vue-next` dual version is fixed on `main`.** All three
   declarants (`apps/landing`, `apps/sandbox`, `packages/core`) read `^0.477.0`
   on `main`. Locally at `4e4e46f` they do not, which is why a local
   `validate:all` still fails at link 51.
2. **`validate-min-runtime` cannot reach the floor question from `main`**, because
   `packages/core/docs/capability-matrix.json` is stale there. The fresh matrix is
   one of the **269 uncommitted paths** in the working tree (TASK-S1-O2's
   regeneration; `validate:capability-matrix` is exit 0 locally). **Commit the
   tree before dispatching this lane, or its red says nothing about Node.**

### 5.4 The measured local evidence §3's scaffold was waiting for

Obtained for this: **Node v20.19.0** (`node-v20.19.0-win-x64`, scratchpad, never
installed) driving yarn 4.16.0. **win32, not `ubuntu-latest`** — every exit code
below is locally qualified and nothing more.

| Lane | What ran under the declared Node 20.19.0 | Exit |
|---|---|---|
| `validate-min-runtime` | `validate:engines` · `generate:ownership:core --check` · `generate:exports:core` | **0 · 0 · 0** — every generator and validator **starts** at the floor; the H4 class is clear |
| " | `yarn validate:all` (58 links at `4e4e46f`) | **1** at link 51 — `validate:icon-duplicates`, **identical under v24.14.1**, so not a floor failure |
| " | links 52–58 individually | **0 each** — their first execution in any context |
| " | `vitest run …/landing-token-fallbacks.spec.ts` | **1**, `TypeError: globSync is not a function`, `Tests: no tests`. Same command under v24.14.1: **0, 9 passed.** §0.C.1 is now measured, not inferred |
| `min-peer` | `min-peer-lane.mjs --plan`; then the **full lane in a throwaway `git worktree`** | see §5.5 |
| `vue-next` | `vue-next-lane.mjs --plan` with an empty input (the `schedule` shape) and with `3.6.0-rc.9` (the dispatch shape) | **0 · 0** — F1's fix holds: the empty string falls through to the config pin instead of pinning `""` |
| `nuxt-majors` | `pack-fixtures.mjs` → `install-fixtures.mjs` → `yarn test:nuxt-fixtures`, `DZUP_FIXTURE_NUXT=4.4.5` | **0 · 0 · 0** — **12 passed, 8 skipped (20)**, all six staged fixtures build and assert. `tar -tzf` confirms `dzup-ui-core.tgz` carries **1,454 `package/dist/` entries**: the tarball-without-dist root cause is fixed at the artifact level |

Registry drift, not repinned: `vue@3.6.0-rc.6` still resolves but the `rc`
dist-tag is **`3.6.0-rc.9`**; `vue@latest` is still `3.5.43`, so the Vue 3.6
lane's "becomes blocking" trigger has not fired. `nuxt@latest` is **4.5.2** and
`nuxt@4.4.6`+ requires Node ≥ 22.12 — **the `nuxt-majors` matrix cannot pin a
current Nuxt while the floor is 20.19.0.**

### 5.5 The four go/no-go recommendations

| Lane | Call | Blocking vs reporting | Why |
|---|---|---|---|
| **`min-peer`** | **GO — first** | blocking **after** its first green run (one line in `ci.yml`) | The only lane whose answer is news, and the only one with **no schedule**, so nobody ever gets it for free. See §5.6 for the local result |
| **`vue-next`** + **`nuxt-majors`** (one dispatch) | **GO — second**, or wait for the schedule | `suite` **reporting** (3.6 is still an RC); `nuxt-majors` **blocking once green** (both its majors are released — **N5-03-D6 / D164**) | First real run the lane will ever have had. **The `schedule` fires Monday 2026-09-28 04:00 UTC and runs the fixed lane for free** — dispatch now only if the answer is wanted sooner |
| **`validate-min-runtime`** | **NO-GO as a separate dispatch** | already blocking: `ci.yml` calls it on every push | Its answer is known and measured three ways (local Node 20, CI's `Unit Tests (Node 20.19.0)`, and the `@types/node` `@since`). From `main` it cannot even reach the floor step (§5.3.2). Every push re-runs it at no extra cost |
| **`ci.yml`** | **NO-GO — already answered** | — | `3147432` is that run. Read it (§5.2) instead of spending another 15 minutes |

### 5.6 `min-peer`, the full lane, run locally

The runner pins, installs, asserts, runs and restores — and then leaves
`node_modules` on the floor versions, so it cannot be run against a shared tree.
It was run in a **throwaway `git worktree` at `4e4e46f`** under Node 20.19.0,
outside the repository, removed afterwards. The main checkout's `yarn.lock` hash
and its resolved `vue 3.5.31` / `reka-ui 2.9.2` are unchanged, verified after.

**Result — exit 1 at `typecheck`, and the finding the lane was built for.** The
pinned install succeeded and the runner asserted all seven packages landed
(`vue 3.5.0`, the five-package Vue lockstep set, `reka-ui 2.0.0`), so this is
**not** an `exit 2`. Then:

- **`typecheck`: 622 errors in 127 files across 11 of 11 families.** Root cause
  measured to the patch release: Vue widened `ComponentTypeEmits` from
  `Record<string, any[]>` to `Record<string, any>` at **exactly 3.5.13**, and
  every `Dz*Emits` here is an `interface`, which has no implicit index signature
  (isolated in a nine-line `tsc --strict` probe). **`vue: ^3.5.0` admits thirteen
  releases the library has never worked on**, and the root manifest already
  depends on `^3.5.13`.
- **the suite (run directly, because the runner stops at the first failure):
  exit 1, 9 of 373 files and 32 of 5,705 tests.** 31 of 32 trace to **`reka-ui@2.0.0`** — the
  combobox option list does not open (which is also why 20 `DzPersonaSelector`
  security assertions measured the *stricter* `rejected` instead of
  `inert`/`escaped`, so **no security regression**) and `useDialog` does not
  release its scroll lock. The 32nd is a load flake, named as such.
- **`git diff --exit-code -- package.json yarn.lock`** — the workflow's own
  restore check — **exit 0**.

**Both published peer ranges are false.** That is decision **D-S2O4-5** (`vue`,
narrow to `^3.5.13`) and **D-S2O4-6** (`reka-ui`, bisect then narrow), and it is
an **A4-D1 precondition**: free today, a breaking 0.x `minor` after first
publication.

### 5.7 Recording scaffold — still yours to fill

§3's table stands. Add a column for **which ref** was dispatched: a sha, not
`main`, and say whether that sha carries the 269 working-tree paths, because
§5.3.2 makes the difference decide what a red means.
