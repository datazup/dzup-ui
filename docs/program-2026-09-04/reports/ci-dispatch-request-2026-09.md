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
