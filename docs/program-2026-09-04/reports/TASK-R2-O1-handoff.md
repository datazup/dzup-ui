# TASK-R2-O1 — Re-run the built evidence and persist the browser record

> Handoff for [`../evidence-completion-tasks.md`](../evidence-completion-tasks.md)
> §TASK-R2-O1. Program [`../README.md`](../README.md); protocol §4; conventions §5.
>
> **Repo / commit observed:** `ui/dzup-ui` `main` @ **`2d51eec`** — *not* the
> `99b963a` the task file's header and the program README assume. Worktree
> **dirty: 420 uncommitted paths at task start**, 427 at task end (+5 files this
> task created, +2 files it turned from clean to modified). Every one of the 420
> is the accumulated output of TASK-R2-O2/O3/O4/O5 and the R3/R5 tasks and was
> **preserved untouched** — nothing was stashed, checked out, cleaned or
> committed.
>
> Every number below binds to **`2d51eec` + that dirty tree** and is **locally
> qualified**: a developer machine on win32, not CI, not release, not production
> evidence.
>
> **Started / ended:** 2026-09-19, 12:31 → 14:15. Nothing committed, pushed,
> dispatched, published, deployed or registry-mutated.
>
> **Ends `[~]`** — five of the six numbered deliverables are complete and
> measured. The sixth half of deliverable 3 — "re-run **from the clean committed
> tree**" — is **structurally impossible for an agent** and was not faked. See
> §0.2 and owner action **D127**.

---

## PROGRESS NOTE (kept live while the task ran — the filesystem is the memory)

| When | State |
|---|---|
| 12:31 | `<done_check>` run. HEAD `2d51eec`, 420 dirty paths. |
| 12:35–12:39 | `yarn workspace @dzup-ui/tokens build` exit 0 · `yarn storybook:build` exit 0. |
| 12:39 | chromium sweep started (8 projects, one engine per invocation per D123). |
| 12:40–12:43 | Ledger module, generator, degradation gate, capability wiring, unit spec landed. 11/11 unit tests pass. |
| 12:44 | `validate:capability-matrix` smoke-run against the new code: exit 1, input now named `e2e/matrix/browser-evidence.json`, degradation gate reports itself inert. |
| 12:45 | Platform decision recorded in `e2e/visual/visual-baselines.json`; `validate:visual-baselines` exit 0. |
| 12:55 | **chromium: 1,431 passed · 8 skipped · 0 failed · 16.1m · exit 0.** firefox started. |
| 13:20 | **firefox: 1,431 passed · 8 skipped · 0 failed · 24.7m · exit 0.** webkit started. |
| 13:40 | **webkit: 1,431 passed · 8 skipped · 0 failed · 19.8m · exit 0.** Engine versions probed; full ledger written. |
| 13:41 | `generate:capability-matrix`: browser-matrix cells **89 unrun → 88 pass + 1 declared-unrun**. |
| 13:42 | Visual pilot win32 **24/24 exit 0**; security corpus **403/403 exit 0**; `coverage.json` stamped. |
| 13:45 | **Seeded regression proves the gate: 26 violations, exit 1.** Clean run: `validate:capability-matrix` **exit 0**. |
| 13:50 | component-meta · llms · docs-pages regenerated (exit 0 each). `validate:all` run end-to-end. |
| 13:55 | First `validate:all` failed at link 2 on **7 ESLint errors in this task's own files** — fixed (the engine probe became a named async function; `--report` validation stopped abusing `filter`). `eslint` over all 7 touched files then exit 0; ledger, matrix and the 11 unit tests re-run clean. |
| 14:05 | **`validate:all` re-run end-to-end: links 1–21 pass** (incl. link 20 `capability-matrix` ✓ and link 21 `visual-baselines` ✓); first failure is **link 22 `validate:tokens`**, on TASK-R2-O7's untracked `tier-fixtures.ts`. |
| 14:10 | `yarn test`: 3 failed / 10,209 passed — **2 inherited + 1 belonging to TASK-R5-O7; none from this task.** |
| 14:15 | Ledger rows, ratchet board and decision register (D124–D128) written. Task closed `[~]` on D127. |

---

## 0. `<done_check>` result

Run first, from `ui/dzup-ui`, before anything was read or edited.

| # | Check | Result at `2d51eec` | Verdict |
|---|---|---|---|
| 1 | `git ls-files \| grep -E 'matrix-report\|browser-evidence'` → a tracked artifact whose `sourceCommit` equals HEAD | **empty** — no such path is tracked; the `node -e` half never ran | **FAIL** |
| 2 | `capability-matrix.ts` → exit 0 and 0 browser cells `unrun` at Tier B+ | **exit 1**; `browser-matrix` input absent; **89 of 89** browser cells `unrun`; 1 hard violation (`DzFileUpload`, Tier D) | **FAIL** |
| 3 | `grep -rn '"platform"' e2e/visual/ \| head -1` names the authoritative platform and matches the committed baselines | prints `"platform": "win32"`, and the committed baselines are win32 | **"passes" — and cannot fail. New defect D124.** |
| 4 | `git log -1 --format=%h -- packages/core/security/coverage.json` at or after the current sweep, and the file carries `sourceCommit` | last commit **`e0d1707`** (two commits behind HEAD); **no `sourceCommit` key** (`schemaVersion`, `note`, `artifacts` only) | **FAIL** |

Protocol §4.2: three fail outright → **run the task**. The fourth is worse than
a fail and is registered rather than counted.

### 0.1 Check 3 cannot fail honestly — **D124**

This programme's standing warning (D108 / D116 / D122) applies again, and this
time the clause is a **tautology**. It greps `e2e/visual/` for `"platform"` and
then asks whether the value it just read "names the authoritative platform". The
only file in that directory that carries the key is
`visual-baselines.json`, which is *also* the file that declares which platform
the baselines are for. The check therefore compares a value with itself:

- If the ledger says `win32` and the baselines are win32 → passes.
- If somebody changed it to `linux` and re-captured → passes.
- If it said `solaris` → still passes, because "names the authoritative platform"
  has no external referent the grep can reach.

There is exactly one state in which it fails — a ledger whose `platform` key is
absent — and that state is already a hard failure of `validate:visual-baselines`,
so the check adds nothing and reads as evidence of a decision nobody made. Two
further clauses in the same block are defective in the other direction and are
folded into D124:

- **Check 1 is unsatisfiable by the agent the prompt is written for.** It reads
  `git ls-files`, which lists the **index**. Putting a new file there is
  `git add` — a mutation of the owner's staging area, on a worktree carrying 427
  uncommitted paths belonging to five other tasks. The prompt's own
  `<authority>` reserves repository mutations to the owner. The artifact exists,
  is generated, is stamped and is read by the generator; it is `??` and will stay
  `??` until the owner runs one command (§6, D127).
- **Check 4's first clause is likewise an owner action.** `git log -1 -- <path>`
  can only move when somebody commits. Its *second* clause ("the file carries
  `sourceCommit`") is the half an agent can satisfy, and it now does.

### 0.2 "Re-run from the clean committed tree" — what was actually done, and why

The task says to re-run "from the **clean committed tree**". At `2d51eec` there
is no such tree and an agent may not make one: committing is the owner's, and the
worktree carries 420 paths of five other tasks' work that must survive.

Nothing was faked to paper over this. Instead:

1. Every run stamps `sourceCommit: 2d51eec` **and** `worktreeDirty: true` **and**
   `dirtyPathCount: 427`, per run, inside the artifact — not in a paragraph.
2. The ledger's top-level `admissibility` string says in as many words that no
   row in it is release or CI evidence and that full commit-binding requires the
   owner to commit and re-run.
3. That re-run is routed as owner action **D127** with the exact commands.

A stamp claiming a clean tree it did not have is the specific failure this task
exists to end; the honest alternative is a stamp that says which tree it had.

> **`dirtyPathCount` is a point-in-time snapshot, not a property of the commit —
> two artifacts stamped at the same `sourceCommit` will legitimately disagree.**
> (Added by the independent verification, 2026-09-19.) `sourceCommit` identifies
> a commit and is stable; `worktreeDirty` and `dirtyPathCount` describe the
> *working tree at the instant the generator ran*, and this tree gained paths all
> day as other packets landed. Measured today: `packages/core/security/coverage.json`
> carries `dirtyPathCount: 427` and `e2e/matrix/browser-evidence.json` carries
> `443`, **both stamped `sourceCommit: 2d51eec`, both correct**. Neither is being
> rewritten — they are measurements, and back-dating one to match the other would
> destroy the very provenance the field exists to record. Read a difference
> between two such counts as *"these ran at different moments"*, never as
> *"one of them is wrong"*; only `sourceCommit` is comparable across artifacts.

### 0.3 The `<done_check>` re-run at task end — what is and is not satisfied

Re-run rather than assumed, because `<success_criteria>` says to re-check.

| # | Clause | At task end | Honest verdict |
|---|---|---|---|
| 1 | a **tracked** artifact exists | the artifact exists, is generated and is stamped; `git ls-files` still does not list it, because listing it means `git add` | **agent-complete, owner-blocked (D127)** |
| 1b | its `sourceCommit` equals `git rev-parse HEAD` (7 chars) | `2d51eec` == `2d51eec` ✓ — and `worktreeDirty: true` beside it | **satisfied** |
| 2a | `validate:capability-matrix` → exit 0 | **exit 0**, standalone and at link 20 of `validate:all` | **satisfied** |
| 2b | 0 browser cells `unrun` for chromium/firefox/webkit at Tier B+ | **1 remains**: `DzThemeProvider`, Tier B, which has **no story to drive** (`targets.generated.ts` emits `story: null`) and is registered by `declareUnrun()` as a `test.fixme` in all 24 projects | **not satisfied as literally written, and it must not be.** Driving it would mean inventing a story; hiding it would mean deleting the one cell the lane is honest about. 88 of 89 pass; the 89th is a *declared* gap with its reason, which is what `unrun` is for |
| 3 | platform clause | the decision is now made, dated, justified against the CI runner, and carries an owner action | **the check is a tautology (D124); the underlying question is answered** |
| 4a | `git log -1 -- coverage.json` at or after the sweep | still `e0d1707` — only a commit moves it | **owner-blocked (D127)** |
| 4b | the file carries `sourceCommit` | `sourceCommit: 2d51eec`, plus `worktreeDirty`, `dirtyPathCount` and a full `lastRun` block | **satisfied** |

Four clauses satisfied, two blocked on a commit, one that cannot be satisfied
without lying and one that cannot fail. Hence `[~]`, not `[x]`.

`<success_criteria>`'s last item — "a fresh clone can read every cited artifact"
— is **true of the artifact and false of the clone** until D127: the file is
where the generator says it is and contains what it claims, and a clone will not
have it until somebody commits it. That sentence is the whole task in miniature.

---

## 1. What was measured before anything was edited

| Fact | Value at `2d51eec`, before this task |
|---|---|
| `git ls-files` matching `matrix-report\|browser-evidence` | **0 paths** |
| `test-results/matrix-report.json` on disk | **GONE.** `test-results/` held `.last-run.json` and four failure dirs from R2-O5's 2026-09-18 chromium `text-200` run, and nothing else. See §3.1 |
| `browser-matrix` capability cells | **89 `unrun`, 0 pass, 0 fail** |
| `validate:capability-matrix` | **exit 1** — 1 hard violation (`DzFileUpload` Tier D, `browser-matrix` unrun with no artifact) + **22 stale cells** (the README's "12" is bound to `99b963a`) |
| `packages/core/security/coverage.json` | last commit `e0d1707`; keys `schemaVersion`, `note`, `artifacts`; **no run record, no commit stamp** |
| `e2e/visual/visual-baselines.json` | `platform: win32`, `ciPlatform: linux`, 58 baselines; `validate:visual-baselines` exit 0 with 24 stale reported |
| capability matrix `visual` states | `covered 1 · stale 7 · not-covered 136` in the **committed** file (stamped `99b963a`); regenerating at `2d51eec` gives `covered 0 · stale 8` — `DzButton` moved after its baselines were captured (`a01965f`) |
| Matrix lane shape | **24 projects** (3 engines × 8 conditions), not the 18 / "3,168" the prompt names — R2-O5 added `text-200` and `spacing`. §2.6 does the arithmetic |
| CI runner | **`ubuntu-latest` in all 13 jobs** of `.github/workflows/ci.yml` (+ chromatic, landing, release, vue-next) |

---

## 2. Implemented files and API effect

### 2.1 `e2e/matrix/browser-evidence.json` — the tracked artifact (NEW, 111 KB)

Generated, never hand-edited, and read by the capability-matrix generator. Shape:

```jsonc
{
  "schemaVersion": "1.0.0",
  "sourceCommit": "2d51eec", "worktreeDirty": true, "dirtyPathCount": 427,
  "admissibility": "LOCALLY QUALIFIED ONLY. …",
  "engines": ["chromium", "firefox", "webkit"],
  "conditions": ["default", "forced-colors", "reduced-motion", "rtl",
                 "touch", "zoom-400", "text-200", "spacing"],
  "totals": { "projects": 24, "projectsRun": 24, "components": 89,
              "cells": 2136, "pass": 2112, "fail": 0, "unrun": 24 },
  "runs":       [ /* one per {engine, condition}: commit, dirty flag, date,
                     engine version, playwright version, platform, counts */ ],
  "components": [ { "component": "DzDialog", "tier": "B", "story": "…",
                    "cells": { "chromium/rtl": "pass", … } } ]
}
```

**Why a summary and not the full report** (the `<discovery>` asked for the
choice): the three Playwright JSON reports are 1.77 MB **each**; the projection
is 111 KB, and the 5.3 MB they contain is 96 % stack frames, step timings and
attachment paths that say nothing a reader of the matrix wants. The summary also
diffs legibly — a re-run changes result values and a handful of run records, not
five megabytes of timings.

**The `<example>` row shape is derived, not stored twice.** `deriveEvidenceRows()`
joins each cell to the run with the same engine and condition and yields exactly
`| component | tier | engine | condition | result | sourceCommit | date |`:

| component | tier | engine | condition | result | sourceCommit | date |
|---|---|---|---|---|---|---|
| DzDialog | B | chromium | rtl | pass | 2d51eec | 2026-09-19 |
| DzDialog | B | webkit | spacing | pass | 2d51eec | 2026-09-19 |
| DzFileUpload | D | chromium | default | pass | 2d51eec | 2026-09-19 |

2,136 such rows derive; 2,112 `pass`, 24 `unrun`. The provenance lives on the
*run* rather than on 2,136 rows because a sweep is executed one project at a time
(D123) — a run is precisely the unit that shares a commit and a date — and
because per-row stamps would triple the file for no new fact.

**Provenance is excluded from byte comparisons**, as `<requirements>` asks:
`BROWSER_EVIDENCE_PROVENANCE_KEYS` names `sourceCommit`, `worktreeDirty`,
`dirtyPathCount`, `generatedAt`, matching the `stripComponentCommits` /
`sourceCommit` precedent already in `validate:capability-matrix`.

### 2.2 `packages/tooling/src/quality/browser-evidence.ts` (NEW)

Types, paths, `readBrowserEvidence`, `serializeBrowserEvidence`,
`deriveEvidenceRows`, `readDeclaredMatrixProjects`, and the degradation gate
`checkBrowserDegradation`. Pure — no filesystem beyond two reads — so the seeded
regression runs in milliseconds instead of an hour.

`BrowserCellResult` is deliberately **three** values (`pass` / `fail` / `unrun`)
and not `CellState`'s six: a browser run either went green, went red, or did not
happen. `stale` is not a state a *run* can be in — it is a comparison between the
run's commit and the component's, and the capability matrix performs it with
`evidenceIsCurrent` where the component commit lives.

### 2.3 `packages/tooling/src/quality/generate-browser-evidence.ts` (NEW)

`yarn generate:browser-evidence --report <playwright-json> …`. It **adds no
lane, no config, no assertion** — it parses reports the existing
`playwright.config.ts` produced. This is the `<stop_conditions>` boundary: a
second harness would have been a second set of assertions, and there are none
here.

Three properties worth naming:

- **Attribution is counted, never dropped.** A test is attributed to a component
  by the `test.describe(component)` wrapper (`conditions.spec.ts`,
  `motion-policy.spec.ts`) or by the `DzX — operation` title form
  (`non-drag.spec.ts`). Anything it cannot attribute increments
  `unattributedTests` on the run. **All 24 projects reported `unattributedTests: 0`**,
  which is how we know the 4,293 attributed passes are the whole lane and not a
  subset.
- **Merge-forward keeps the run record with the cell.** A project no report
  covers keeps its previous cells *and* its previous run entry, so a kept cell
  still says which checkout measured it. Nothing is ever written from a prose
  ledger: this ledger was built with `--reset` from three Playwright reports
  produced today, and **not one cell was copied from `engine-ratchets.json`**,
  whose 2026-08-31 numbers were measured on a tree that no longer exists.
- **`--probe-engines`** launches each engine once and records
  `browser.version()`; separate from the projection because the projection must
  not need browsers.

### 2.4 The degradation gate — `validate:capability-matrix` gates 5 and 6

Wired into the existing validator, not a new script, so it rides in
`validate:all` at the link that already exists.

- **Gate 5 `browser-degradation`** compares the ledger **as HEAD has it**
  (`git show HEAD:e2e/matrix/browser-evidence.json`) against the working tree. A
  cell that was `pass` and is now `unrun`, `fail`, or gone is an **error** naming
  component, engine and condition. `unrun → pass` is allowed and ungated: the
  asymmetry is the whole point, because `unrun` is what a lane that quietly
  stopped running looks like and is indistinguishable from one never wired up.
  A deleted component is reported as `absent` rather than skipped — deleting a
  row is the cheapest way to make a red cell stop being red.
- **Gate 6 `browser-shape`** compares the ledger's declared `engines` and
  `conditions` against what `playwright.config.ts` declares, read from its
  source. R2-O5's lesson made executable: the lane went 6 → 8 conditions and
  three documents went on saying six. A ledger claiming 18/18 projects while the
  config declares 24 would read as complete coverage of a lane it never ran.

Two env overrides (`DZUP_BROWSER_EVIDENCE_BASELINE`, `…_CURRENT`) exist only to
drive the gate by hand; both print a banner saying the run **proves nothing about
the tracked ledger**, so a green run under an override cannot be mistaken for a
real one.

### 2.5 The seeded regression — proof the gate fires

`<requirements><degradation_gate>` asks for a seeded regression. The tracked
ledger was **not** edited; a scratch copy was, which is both the safer and the
stricter demonstration (the baseline is the real measured file):

```text
seed: DzButton    chromium/rtl            pass → unrun
      DzFileUpload webkit/forced-colors   pass → fail
      DzTooltip    (whole component deleted from the ledger)

DZUP_BROWSER_EVIDENCE_BASELINE=e2e/matrix/browser-evidence.json \
DZUP_BROWSER_EVIDENCE_CURRENT=<scratch>/browser-evidence.SEEDED.json \
node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/capability-matrix.ts
→ exit 1
```

```text
  browser-degradation: 2112 committed `pass` cell(s) compared; 26 degraded

✗ [browser-degradation] DzButton / chromium / rtl: the committed ledger records `pass` and it is now `unrun`. …
✗ [browser-degradation] DzFileUpload / webkit / forced-colors: the committed ledger records `pass` and it is now `fail`. …
✗ [browser-degradation] DzTooltip / chromium / default: the committed ledger records `pass` and the component is no longer in the ledger. …
   … 23 more DzTooltip cells …
26 capability-matrix violation(s).
```

26 = 1 + 1 + 24, exactly the seed. `git status --porcelain e2e/matrix/browser-evidence.json`
after the proof: `?? e2e/matrix/browser-evidence.json` — untouched.

The same gate is driven by **11 unit tests** in
`packages/tooling/src/quality/browser-evidence.spec.ts`, including the
one-directional clause (`unrun → pass` must NOT fire), the deleted-cell and
deleted-component cases, the multi-violation case, and a test that a cell which
was never a pass is not gated.

### 2.6 The three sweeps — and the arithmetic against "3,168"

Run **one engine per invocation**, which is D123's documented procedure. All
three exited **0**; the teardown fault R2-O5 recorded did not recur.

| Engine | Version | Projects | Tests | Passed | Failed | Skipped | Wall clock | Exit |
|---|---|---|---|---|---|---|---|---|
| chromium | 149.0.7827.55 | 8 | 1,439 | **1,431** | **0** | 8 | 16.1m | **0** |
| firefox | 151.0 | 8 | 1,439 | **1,431** | **0** | 8 | 24.7m | **0** |
| webkit | 26.5 | 8 | 1,439 | **1,431** | **0** | 8 | 19.8m | **0** |
| **total** | Playwright 1.61.1 | **24** | **4,317** | **4,293** | **0** | **24** | **60.6m** | — |

**The prompt's expected 3,168 is stale by construction, and here is every step
of the delta:**

| Term | Count | Where it comes from |
|---|---|---|
| 3,168 (the prompt) | 88 runnable × 2 tests × **6** conditions × 3 engines | `conditions.spec.ts` only, 18 projects, before R2-O5 |
| `conditions.spec.ts` today | 88 × 2 × **8** × 3 = **4,224** | R2-O5 added `text-200` (SC 1.4.4) and `spacing` (SC 1.4.12) |
| `motion-policy.spec.ts` | 14 × 3 = **42** | R5-O3, `reduced-motion` project only (190 − 176 per engine) |
| `non-drag.spec.ts` | 9 × 3 = **27** | R2-O5, `default` project only (185 − 176 per engine) |
| **attributed passes** | **4,293** | 4,224 + 42 + 27 — matches 1,431 × 3 exactly |
| declared-unrun | 8 × 3 = **24** | `DzThemeProvider` has no story; `declareUnrun()` registers a `test.fixme` once per project. Visible, not hidden |
| **total executions** | **4,317** | |
| **evidence cells in the ledger** | 89 × 24 = **2,136** | one per {component, engine, condition}: **2,112 pass**, 0 fail, **24 unrun** |

Every delta is accounted for. `known-failures.json` is empty and stayed empty;
`engine-exceptions.json` `exceptions: []` and stayed empty. **No entry was added
to either, because nothing failed** — and an entry may only be added with a
measured number.

**No failure that N1-O3 recorded as fixed reproduced.** The `<stop_conditions>`
trigger for a component regression did not fire once in 4,293 executions.

### 2.7 The capability matrix now cites the commit

`browser-matrix` no longer reads a boolean ("does a git-ignored file exist?").
It counts per project and resolves:

- `fail` if any project failed · `unrun` if none passed · `present` if some
  projects are unrun or the component has a cross-engine ledger entry ·
  `stale` if a passing run predates the component's last change · else `pass`.
- The note names the count, the commits and the dirty flag, e.g.
  *"24/24 projects measured green at 2d51eec (worktree dirty)"*.

`inputs['browser-matrix']` now points at `e2e/matrix/browser-evidence.json` and
its note prints projects-run/projects-declared **and the admissibility**, because
"1,408 cells passed" and "1,408 cells passed on a tree nobody can check out" are
different claims and the page had been printing the first while meaning the
second.

Security cells gained a citation — *"Corpus last run 2026-09-19 at 2d51eec
(worktree dirty): 403/403 passed, 0 failed, exit 0"* — and `coverage.json` was
added to their artifact list. **Their state stays `present`, deliberately.** The
suites are corpus-scoped; one green `yarn test` does not resolve to 60
per-component passes, and promoting them would be exactly the
aggregate-standing-in-for-components move the `scope` field exists to prevent.
Whether the corpus earns a `corpus`-scoped `pass` cell of its own is an owner
decision, not a generator's (**D128**).

Also removed: the **second hand-typed copy of `MATRIX_CONDITIONS`** inside
`generate-capability-matrix.ts`. It is now read from `playwright.config.ts`, and
two stale "eighteen projects" sentences were corrected to 24.

### 2.8 The platform decision — recorded, owner-visible, TASK-R2-O6's input

`e2e/visual/visual-baselines.json` gains `scope.platformDecision`:

```jsonc
{ "decidedBy": "TASK-R2-O1", "decidedAt": "2026-09-19",
  "authoritative": "linux", "gatingToday": "win32",
  "state": "recorded, NOT executed - the change of `platform` to linux is an OWNER action",
  "rationale": "…13 of 13 CI jobs are `runs-on: ubuntu-latest`…",
  "ownerAction": "One `yarn visual:accept` pass per snapshot on a linux host…",
  "consumes": "TASK-R2-O6 …" }
```

**The decision: `linux` is authoritative**, because the authoritative platform is
the one the gate runs on and every CI job is `ubuntu-latest`. It is recorded
*beside* `platform` rather than written *into* it, and that is the substance of
the decision rather than a hedge: baselines are platform-locked by construction
(Playwright writes `{arg}-{project}-{platform}.png`), so setting
`platform: "linux"` today would make the ledger claim 58 baselines that do not
exist and turn `validate:visual-baselines` red on 58 `missing` records. The thing
the gate actually checks — that the record and the committed images agree — holds
and was verified: `platform: win32`, 58 win32 images, **`validate:visual-baselines`
exit 0**.

The pilot was then run on the platform there are baselines for:
**`e2e/visual/component-baselines.spec.ts --project=chromium` → 24/24 passed,
exit 0, 19.4s.** Worth noting against the capability matrix's `stale` reading:
`DzButton`'s two baselines are `stale` (its source moved in `a01965f` after they
were captured) and the images are nonetheless **pixel-identical** — `stale` is a
provenance claim, not a visual one, and here it is a false alarm about a real
provenance gap.

### 2.9 Full file list

**New (5):**

| Path | What |
|---|---|
| `e2e/matrix/browser-evidence.json` | the tracked artifact, 111 KB, generated |
| `packages/tooling/src/quality/browser-evidence.ts` | types, reader, row projection, lane-shape reader, degradation gate |
| `packages/tooling/src/quality/generate-browser-evidence.ts` | the Playwright-report → ledger projection + `--probe-engines` |
| `packages/tooling/src/quality/browser-evidence.spec.ts` | 11 tests, incl. the seeded regressions |
| `docs/program-2026-09-04/reports/TASK-R2-O1-handoff.md` | this file |

**Modified (8 source/data + the generated chain):**

| Path | Change |
|---|---|
| `packages/tooling/src/quality/generate-capability-matrix.ts` | browser-matrix reads the ledger per project; security cells cite the run; `MATRIX_CONDITIONS` read from the config; two stale counts fixed |
| `packages/tooling/src/validators/capability-matrix.ts` | gates 5 + 6, the HEAD-side reader, the override banner |
| `packages/tooling/src/validators/visual-baselines.ts` | `scope.platformDecision` added to `VisualLedger` |
| `packages/tooling/src/docs/read-evidence.ts` | doc comment: the F4 hazard is removed, and the report was even less durable than F4 said |
| `package.json` | `generate:browser-evidence` + its `//` doc entry; `//validate:capability-matrix` documents gates 5 + 6 |
| `e2e/visual/visual-baselines.json` | `scope.platformDecision` |
| `packages/core/security/coverage.json` | `sourceCommit`, `worktreeDirty`, `dirtyPathCount`, `lastRun` (per-file counts, corpus validator result, and what it does **not** speak for) |
| `packages/core/docs/capability-matrix.json` | regenerated |
| `packages/core/docs/component-meta.json` · `llms.txt` · `llms-full.txt` · `apps/docs/**` (152 files) · `apps/docs/.vitepress/generated/nav.json` | regenerated in the documented order: capability → component-meta → llms → docs-pages |

**Not touched:** `known-failures.json`, `engine-exceptions.json`,
`engine-ratchets.json`, any baseline PNG, any AT result cell, and the 420 dirty
paths belonging to R2-O2/O3/O4/O5 and R3/R5.

---

## 3. Findings

### 3.1 The record N1-O2 D1 set out to protect **is gone** — new defect **D125**

`test-results/matrix-report.json` — 443 KB, MD5 `15b41393…92a3`, the 2026-08-25
chromium run, the file N0-05 X3/D5 flagged and N1-O2's decision D1 named, and the
file TASK-R2-O5 **deliberately declined to overwrite** on 2026-09-18 to protect
it — **no longer exists.** At task start `test-results/` contained
`.last-run.json` and four failure directories from R2-O5's own `text-200` run,
and nothing else.

The mechanism is not exotic: Playwright **empties `outputDir` at the start of
every run**, and `outputDir` defaults to `test-results/`. The protection strategy
was "do not write to that path", which does nothing about a tool that clears the
directory the path is in. R2-O5's sweep destroyed the artifact R2-O5 was
protecting, in the same invocation, and the loss was invisible because nothing
ever compared the file to a record of it.

Consequences, all now closed by this task: every `browser-matrix` capability cell
had been derived from that file's mere existence since 2026-08-25; it proved two
of six projects (`config.argv`, N1-O2 §1e); and it was the only copy.

**The remedy is exactly what N1-O2 D1 asked for** — "a committed, schema-pinned
browser ledger … make `validate:capability-matrix` **fail** (not note) when a
`browser-matrix` cell degrades from `pass`/`present` to `unrun`" — and it is
built and proven. D1 can be closed once the owner commits the ledger.

Recorded as **D125** so the *cause* is on the register and not only the fix: any
future artifact written under `test-results/` is ephemeral by construction. The
generator's own doc block and `package.json` entry both say so.

### 3.2 A citation correction

The task prompt and `evidence-completion-tasks.md` both cite "N0-05 F4" for the
git-ignored report. N0-05's handoff has no finding F4; the report is its **X3**
inventory row and its owner decision **D5**. The substance is identical. Noted
because the next agent following the citation finds nothing.

### 3.3 `validate:all`'s first failing link moves — and the cause changes

**17 of 40 → 22 of 44.** `validate:capability-matrix` (link 20) and
`validate:visual-baselines` (link 21) now pass inside the aggregate. The chain's
new first failure is link 22, `validate:tokens`, on **5 raw colour literals in
`packages/tooling/src/perf/tier-fixtures.ts`** — an *untracked* file belonging to
**TASK-R2-O7**'s in-flight work. Reported, deliberately not fixed: it is another
task's uncommitted code, and `<repo_conventions>` says not to fix unrelated reds
inside a task. Whoever finishes R2-O7 should add
`token-check-allow-raw-values` to that file (it is a fixture *about* colour
values, which is the documented exception) or replace the literals.

### 3.4 The visual pilot is green and the matrix calls it stale — both are right

`DzButton`'s two baselines read `stale` in the regenerated matrix because
`DzButton.vue` last moved in `a01965f`, after the images were captured. The
pilot then rendered all 24 snapshots and **every one matched**. `stale` is a
statement about provenance, not about pixels, and this is the clearest example of
why the two must not be collapsed: a reviewer reading `stale` learns that nobody
has re-accepted these images since the component changed, which is true and
worth knowing, and learns nothing about whether they still match, which is also
true and separately worth knowing. Both facts are now recorded.

---

## 4. Focused validation (every exit code read directly from a file — never through a pipe)

| Command | Exit | Result |
|---|---|---|
| `vitest run packages/tooling/src/quality/browser-evidence.spec.ts` | **0** | **11/11** |
| chromium sweep (8 projects) | **0** | 1,431 passed · 8 skipped · 0 failed · 16.1m |
| firefox sweep (8 projects) | **0** | 1,431 passed · 8 skipped · 0 failed · 24.7m |
| webkit sweep (8 projects) | **0** | 1,431 passed · 8 skipped · 0 failed · 19.8m |
| `generate:browser-evidence` (3 reports) | **0** | 24/24 projects · 2,112 pass · 0 fail · 24 unrun · **0 unattributed tests in any project** |
| `generate:capability-matrix` | **0** | 144 components, 1,662 cells |
| `validate:capability-matrix` (clean) | **0** | ✓ fresh, no Tier D cell unexplained — **the `DzFileUpload` red link is closed** |
| `validate:capability-matrix` (seeded) | **1** | 26 degradation violations, each naming component/engine/condition |
| `test:e2e:visual:pilot` (win32) | **0** | **24/24** in 19.4s |
| `validate:visual-baselines` | **0** | 58 on disk / 58 accepted; 24 stale reported; platform mismatch reported |
| `yarn test packages/testing packages/core/security` | **0** | **9 files · 403 tests · 403 passed · 0 failed** · 7.13s |
| `validate:security-corpus` | **0** | schema 1.1.0 · 6 category files · 34 fixtures · 2 peer fixtures |
| `generate:component-meta` | **0** | 209 components, 0 unclassifiable, all description ratchets still 0 |
| `generate:llms` | **0** | 209 components |
| `generate:docs-pages` | **0** | 144 pages + 65 nested parts; AT cells published **0/534**, as they must be |
| `eslint` over all 7 touched tooling files | **0** | after the 7 errors found by the first end-to-end `validate:all` were fixed |
| `yarn validate:all` (end to end, twice) | **1** | **links 1–21 pass**; first failure is link 22 `validate:tokens`, on TASK-R2-O7's untracked `tier-fixtures.ts`. Was link 17/40 (`capability-matrix`) |
| `yarn test` (end to end) | **1** | 3 failed / **10,209 passed** / 3 skipped / 1 todo over 543 files. 2 inherited + 1 belonging to TASK-R5-O7 — **none from this task** |
| `validate:component-meta` · `validate:llms` · `validate:docs-pages` · `validate:playground-parity` | **0** each | Run individually **after** the final regeneration, because `validate:all` stops at link 22 and never reaches links 29–33. All four artifacts are fresh against the new capability matrix |

> A note for the next agent, costing one lost minute here: `validate:docs-pages`
> is `tsx packages/tooling/src/docs/generate-docs-pages.ts --check`, **not**
> `src/validators/docs-pages.ts`. Invoking by module path is the right habit in
> this repo (`npx` fetches dependency-confusion placeholders that exit 0), but
> the validator filenames are not the script names, and a wrong path here fails
> with `ERR_MODULE_NOT_FOUND` — loudly, which is the only reason it is a nuisance
> rather than a false green.

Per-file security counts (the whole suite, not a subset): `index` 3 · `anatomy`
34 · `security-corpus` 22 · `inline-style-inventory` 7 ·
`DzFileUpload.malicious-corpus` 17 · `DzFileUpload.url-policy` 16 ·
`DzFileUpload.csp-fixture` 9 · `url-boundary.url-policy` 144 ·
`url-boundary.malicious-corpus` 151.

---

## 5. Aggregate qualification

`yarn validate:all` was run **end to end** and its exit code read from a file,
never through a pipe (the S1-F10 rule).

| Run | Exit | First failing link | Cause |
|---|---|---|---|
| after the code landed, before lint fixes | **1** | link 2, `yarn lint` | 7 ESLint errors in this task's own new files — **mine, and fixed** (see below) |
| after the lint fixes | **1** | **link 22 of 44**, `validate:tokens` | 5 raw colour literals in `packages/tooling/src/perf/tier-fixtures.ts` — an **untracked** file belonging to **TASK-R2-O7**'s in-flight work. Not mine, not a repository state, and out of scope to fix inside this task |

**Links 1–21 all pass**, and that includes the two that matter here:

```text
✓ capability-matrix: fresh, and no Tier D cell is unexplained.          ← link 20
✓ visual-baselines: every baseline is accounted for, with a cause and an author.  ← link 21
```

`validate:capability-matrix` had been the **first failing link since `99b963a`**
(12 stale cells then; at `2d51eec` the hard violation was `DzFileUpload`, Tier D,
`browser-matrix` unrun with no artifact). It is now green **inside the
aggregate**, not only standalone.

**Tooling failures and component failures, reported separately, as §5 requires:**

- **Component failures measured by this task: zero.** 4,293 attributed browser
  executions across 3 engines × 8 conditions, 0 failed; 24 visual snapshots, 0
  failed; 403 security assertions, 0 failed. No failure that N1-O3 recorded as
  fixed reproduced, so the `<stop_conditions>` component-regression trigger never
  fired.
- **Tooling failures found and fixed inside this task:** 7 ESLint errors in the
  new/edited tooling files on the first end-to-end run (3 × `no-top-level-await`
  in the `--probe-engines` branch, 1 × `array-callback-return`, 1 ×
  `no-use-before-define`, 2 × `indent-binary-ops`). Restructured — the browser
  probe is now a named async function reached through `void probeEngines(…)`, so
  `@playwright/test` never enters the module graph of a validator that reads JSON
  — and `eslint` over all seven touched files is **exit 0**.
- **Pre-existing reds, unchanged and not fixed here** (they belong to R1-O1):
  the inherited `yarn test` failures, `packages/tooling` `tsc` errors, and the
  `eslint e2e/` errors outside the lint target.

  `yarn test` end to end: **exit 1 — 3 failed / 10,209 passed / 3 skipped / 1
  todo over 543 files** (252.9s). The 11 new `browser-evidence.spec.ts` tests are
  among the passes. **None of the three failures is this task's**, and each was
  read rather than assumed:

  | Failure | Owner |
  |---|---|
  | `token-checks/landing-token-fallbacks.spec.ts` — 6 fallbacks disagree with their tokens | **inherited**, documented red since `99b963a` |
  | `validators/story-dod-tiers.spec.ts` › `countOpen subtracts a waiver` | **inherited**, documented red since `99b963a` |
  | `resolution/dzup-resolution.spec.ts` — inline snapshot mismatch: `+ "@dzup-ui/tokens/css/high-contrast"` | **TASK-R5-O7's**, whose third semantic cascade added that export subpath without updating this snapshot. Uncommitted, not mine, and out of scope to fix here |

  The inherited count is therefore **2 → 2**; the third is a different task's
  in-flight work and is reported rather than folded into the baseline.

**Maturity level of everything above: `browser/AT-qualified` is *not* reached.**
The ladder is `specified → implemented → focused-validated → aggregate-qualified
→ browser/AT-qualified → packaged → released`. What this task produced is
**browser-qualified on a developer machine at a dirty tree** — one step short,
because the 0 of 534 AT cells are untouched and because no runner has executed
any of it. The ledger says so in its own `admissibility` field rather than
leaving it to a reader.

---

## 6. Ratchet movements (old → new, each bound to `2d51eec` + this working tree)

| Ratchet | Old | New |
|---|---|---|
| **Tracked browser evidence artifacts** | **0** (`git ls-files` matching `matrix-report\|browser-evidence` was empty) | **1** — `e2e/matrix/browser-evidence.json`, 111 KB, generated, stamped, read by the generator. Still `??` until the owner stages it (D127) |
| **`browser-matrix` capability cells** | **89 `unrun`** / 0 pass / 0 fail | **88 `pass`** / **1 `unrun`** / 0 fail. The one is `DzThemeProvider`, which has no story — *declared* unrun with a reason, never hidden |
| Tier B capability cells (pass / unrun) | 259 / 343 | **325 / 277** |
| Tier C capability cells (pass / unrun) | 126 / 121 | **147 / 100** |
| Tier D capability cells (pass / unrun) | 6 / 2 | **7 / 1** |
| **`validate:capability-matrix`** | **exit 1** — `DzFileUpload` Tier D `browser-matrix` unrun with no artifact | **exit 0** — ✓ fresh, no Tier D cell unexplained. **The single red link in the chain is closed** |
| **`validate:all` first failing link** | 17 of 40 (`capability-matrix`), per R5-O7's row | **22 of 44** — and **the cause changed**. The chain grew to 44 links; links 1–21 pass; the new first failure is `validate:tokens` on 5 raw colour literals in TASK-R2-O7's untracked `tier-fixtures.ts` |
| **Hard gates on the browser lane** | 0 | **2** — `browser-degradation` (`pass` → `unrun`/`fail`/absent fails and names the cell) and `browser-shape` (ledger engines/conditions must equal `playwright.config.ts`'s) |
| **measured browser failures** | 0 | **0 — held**, now over 4,293 executions instead of an unknown number derived from a 2-project file that no longer exists |
| Browser projects with a durable per-project record | **0 of 24** (the only record was git-ignored, proved 2 of 6, and has been destroyed) | **24 of 24** |
| Engine coverage recorded per project | prose in `engine-ratchets.json`, measured 2026-08-31 at `51dec93` on a tree that no longer exists | **per {component, engine, condition}, at `2d51eec`, with `worktreeDirty` and `dirtyPathCount` on every run** |
| `known-failures.json` entries | 0 | **0 — untouched.** Nothing failed, so nothing was triaged in |
| `engine-exceptions.json` exceptions | 0 | **0 — untouched** |
| **`packages/core/security/coverage.json` commit stamp** | **absent** (`schemaVersion`, `note`, `artifacts` only; last commit `e0d1707`) | **`sourceCommit: 2d51eec` + `worktreeDirty` + `dirtyPathCount` + a full `lastRun` block** (9 files, 403 tests, per-file counts, corpus-validator result, and an explicit statement of what it does *not* cover) |
| Security corpus runs bound to a commit | **0** | **1** — 403/403, exit 0, `2d51eec` + dirty |
| **Visual platform: decided?** | no — `platform: win32` vs `ciPlatform: linux` recorded as a disagreement in a `note`, with no decision | **decided: `linux` is authoritative**, recorded as a dated, owner-visible `scope.platformDecision` with a rationale, an owner action and a consumer (TASK-R2-O6). D126 |
| visual pilot executions bound to a commit | 0 | **24/24 green at `2d51eec`** on win32 |
| capability-matrix `visual` states | `covered 1 · stale 7` in the committed file (stamped `99b963a`) | **`covered 0 · stale 8`** at `2d51eec` — `DzButton` moved in `a01965f` after its baselines were captured. The images are nonetheless pixel-identical: `stale` is a provenance claim, not a visual one |
| capability-matrix stale cells | 12 (at `99b963a`) → 22 measured at `2d51eec` | **22 — unmoved.** Not this task's; they are AT and perf artifacts predating component changes |
| Hand-typed copies of `MATRIX_CONDITIONS` | 2 (`playwright.config.ts` + `generate-capability-matrix.ts`) | **1** — read from the config; two stale "eighteen projects" sentences corrected to 24 |
| AT cells executed (of 534) | **0** | **0 — untouched, as they must be.** No agent fills a manual AT result cell |
| `wcag-deviations.json` open 2.5.7 surfaces | 3 | **3 — untouched** (D117 is R2-O5's) |
| Unit tests over the browser ledger | 0 | **11** |

**Ceilings raised: none. Gates weakened: none. Exceptions added: none. Baselines
replaced: none. Known-failure entries added: none.**

---

## 7. Owner decisions raised

Full text with options and recommendations is in the register in
[`../EXECUTION-STATUS.md`](../EXECUTION-STATUS.md).

| # | Decision | Recommendation |
|---|---|---|
| **D124** 🔴 | **A fifth `<done_check>` is defective, and one clause is a pure tautology** — check 3 compares a value with itself; checks 1 and 4 can only be satisfied by an owner-only repository mutation | (a) rewrite the three clauses against signals an agent can produce — check 3 against the PNG filenames on disk *and* `ciPlatform`, which are external referents |
| **D125** 🔴 | **The 2026-08-25 chromium record is gone, destroyed by the sweep of the task that was protecting it** — `test-results/` is emptied by Playwright at the start of every run | Remedy already landed exactly as N1-O2 D1 specified; the register entry exists so the *cause* is recorded. **N1-O2 D1 is closable on the commit** |
| **D126** 🟠 | **The authoritative visual platform is `linux`; today's baselines are `win32`** — recorded, not executed, because flipping `platform` would claim 58 images that do not exist | (a) one `visual:accept` pass per snapshot on a linux host, then flip `platform`. **This is TASK-R2-O6's input** |
| **D127** 🔴 | **Commit the evidence** — the one step of this task no agent can perform. The stamps say `2d51eec` **+ `worktreeDirty: true` + 427 paths**, which is the honest version of what the prompt asked for | (a) commit the tree, re-run the three sweeps (≈61 min) and `yarn generate:browser-evidence`; the ledger becomes clean-tree evidence and the degradation gate goes live |
| **D128** 🟢 | **Should the security corpus get a `corpus`-scoped `pass` cell?** Its cells stay `present`; one green corpus run is not 60 per-component passes | (b) leave it for 1.0 — the run record already cites the commit; (a) afterwards |

---

## 8. Ranked next packet

1. **Take D127 and commit** (owner, ~5 min + one optional 61-min re-run). It
   costs almost nothing and it converts 2,112 cells from "measured here" into
   "reproducible by anyone", turns the degradation gate from inert to live, and
   closes the `<done_check>`'s checks 1 and 4 mechanically.
2. **TASK-R2-O6 — visual-regression rollout + CI gate.** Its stated dependency
   (this task's platform decision) is now discharged and written into the ledger
   it reads. D126 is the first thing it must execute.
3. **TASK-R1-O1 — truthfully green committed tree.** Its headline red link
   (`validate:capability-matrix`) is now green, which changes what R1-O1 has left
   to do; the inherited `yarn test` failures and `packages/tooling` `tsc` errors
   are still its own.
4. **Wire the matrix lane into CI one engine at a time** (D123), after R1-O4
   decides CI dispatch at all. The per-engine invocation is now the *documented*
   procedure and was executed three times today with exit 0 each time — the
   teardown fault did not recur.
5. **Take D124 with the other four done-check defects together.** Five tasks have
   now hit this; it is a property of the task files, not of any one prompt.
6. **TASK-R2-O2 wave 1** — 0 of 534 AT cells is the largest untouched evidence
   gap in the repository and the only one no engineering shortens (D112).

---

## 9. What this task deliberately did not do

- **Did not commit, stage, push, dispatch, publish, deploy or touch a registry.**
  `git add` was refused as well as `git commit`: the worktree carries 427
  uncommitted paths belonging to five other tasks, and staging one file silently
  changes what the owner's next `git commit` captures. The artifact is on disk
  and untracked, and D127 carries the one command that fixes it.
- **Did not claim a clean tree.** The task asked for a re-run "from the clean
  committed tree" and there is no such tree. Every run stamps `worktreeDirty:
  true` and `dirtyPathCount: 427` beside `sourceCommit: 2d51eec`, and the ledger
  says in its own `admissibility` field that no row in it is release or CI
  evidence. A stamp claiming a clean tree it did not have is the exact failure
  this task exists to end.
- **Did not copy one cell from the earlier dirty run.** `engine-ratchets.json`'s
  2026-08-31 numbers (1,056 per engine at `51dec93`) were read for context and
  left untouched; the ledger was built with `--reset` from three Playwright
  reports produced today. `<no_fake>` is satisfied by construction: a project no
  report covers is `unrun` with a reason.
- **Did not build a second harness.** No new Playwright config, project, spec or
  assertion. The generator is a projection of reports the existing
  `playwright.config.ts` produced; the gate is two clauses inside the validator
  that already runs in `validate:all`.
- **Did not touch `known-failures.json`, `engine-exceptions.json` or
  `engine-ratchets.json`.** Nothing failed, so there was nothing to triage, and
  an entry may only be added with a measured number.
- **Did not replace, accept or re-capture a single visual baseline**, and did not
  flip `scope.platform` to `linux` — both are owner actions (D126), and flipping
  it would have made the ledger claim 58 images that do not exist.
- **Did not fill an AT result cell.** 0 of 534, unchanged.
- **Did not promote the security cells to `pass`.** They cite their run's commit
  and stay `present`, because a corpus-level green is not 60 component-level
  passes. Raised as D128 rather than decided.
- **Did not fix the pre-existing reds** — the inherited `yarn test` failures,
  `packages/tooling` `tsc`, `eslint e2e/`, the 22 stale AT/perf cells. They are
  R1-O1's, and R2-O5 said the same about them yesterday.
- **Did not run `e2e/csp`, `e2e/styling` or the perf lanes.** They are not part
  of the browser matrix or of `yarn test`, and `coverage.json`'s `lastRun` says
  explicitly that it does not speak for the CSP lane.
- **Did not re-derive what a predecessor already measured.** N1-O2's engine
  re-checks, N1-O3's 46 fixes and R2-O5's two new conditions are cited, not
  repeated.

---

## 2026-09-22 — residual executed at the first clean committed tree

> **Repo / commit observed:** `ui/dzup-ui` `main` @ **`589be13`**
> ("feat: land program-2026-09-04 R0/R1 — release-exit lane").
> `git status --short --branch` → `## main...origin/main` and **nothing else**:
> **0 uncommitted paths, 0 ahead, 0 behind**. This is the first clean committed
> tree this task has ever been able to measure from, and it is the whole reason
> the residual is runnable. Owner action **D127** is discharged.
>
> **Scope of this session:** TASK-R2-O1 `<steps>` **3, 5 and 6 only** — re-run
> the three engine sweeps from the clean tree, regenerate the browser evidence
> so it stamps HEAD with `worktreeDirty: false`, re-run and re-stamp the
> security corpus, regenerate the capability matrix, and re-run the
> `<done_check>`. **Nothing built on 2026-09-19 was rebuilt**: the tracked
> ledger, the generator, the degradation gate, the shape gate and their 11 unit
> tests are already committed at `589be13` and were left exactly as they are.
> Step 4 (the visual pilot) was **not** in this session's scope and was not run;
> the visual cells therefore keep the provenance the 09-19 run gave them and
> D126 stays TASK-R2-O6's.
>
> **Still locally qualified.** A clean tree makes the record *reproducible*; it
> does not make it CI, release or production evidence. win32 developer machine,
> Node v24.x, Playwright 1.61.1.
>
> Nothing committed, staged, pushed, dispatched, published, deployed or
> registry-mutated by this session either.

### R.0 Progress note (written as the task ran — the filesystem is the memory)

| When | State |
|---|---|
| start | HEAD `589be13`; `git status --porcelain` → **0 paths**. Baseline captured (R.1). |
| +0 | `yarn workspace @dzup-ui/tokens build && yarn storybook:build` → **exit 0** (25.01 MB within the 26 MB budget, 1012.5 kB spare). Tree re-checked: **still 0 dirty paths** — every build output is git-ignored. |
| +0 | Baseline `validate:capability-matrix` → **exit 0**; `browser-degradation: 2112 committed 'pass' cell(s) compared; 0 degraded` — **the gate is LIVE for the first time**; D141's precondition is discharged by the owner's commit. 37 stale cells. |
| +0 | chromium sweep started — 8 projects, one engine per invocation (**D123**), `PLAYWRIGHT_JSON_OUTPUT` pointed **outside** `test-results/` (**D125**). |

> **Dirtiness note — read this before the stamps below.** The tree was verified at **0 uncommitted paths** when every sweep was launched. At **12:57–13:00 local**, while the chromium sweep was in its last three minutes, a **concurrent session** created two untracked directories —
>
> - `docs/program-2026-09-22-architecture/` (5 markdown files)
> - `docs/program-2026-09-22-planning/` (4 markdown files)
>
> — which are **not this task's** and were **preserved untouched** (`<authority>`: preserve all unrelated dirty work). They are markdown under `docs/` and feed no build, no story, no Playwright project and no generator input. From that moment `git status --porcelain` can no longer return 0, and no agent may make it return 0 without deleting or moving another session's work. So the headline stamp reads what is true rather than what was hoped for, and §R.4 gives the **decomposition** of every path it counted, plus the measure that actually governs reproducibility:
>
> ```
> git status --porcelain --untracked-files=no   # tracked content vs HEAD
> ```
>
> **No file under `packages/`, `e2e/`, `apps/`, or any root config differs from `589be13`** — the code every cell was measured against is byte-identical to the commit the cells cite. That is the claim the artifact is for; `dirtyPathCount` is the raw probe, not the claim. Raised as **D195**.

### R.1 Baseline measured at `589be13` before anything was touched

| Artifact / gate | State at `589be13`, before this session |
|---|---|
| `e2e/matrix/browser-evidence.json` (tracked, 111 KB) | `sourceCommit: 2d51eec` · `worktreeDirty: true` · `dirtyPathCount: 443` — **stale stamp, three commits behind HEAD** |
| `packages/core/security/coverage.json` | `sourceCommit: 2d51eec` · `worktreeDirty: true` · `dirtyPathCount: 427` — **stale stamp** |
| `packages/core/docs/capability-matrix.json` | `sourceCommit: 527dbd1…` — one commit behind HEAD |
| `validate:capability-matrix` | **exit 0** · `✓ fresh, and no Tier D cell is unexplained` · **`browser-degradation: 2112 committed 'pass' cell(s) compared; 0 degraded`** |
| capability cells by state | pass **570** (A106/B315/C142/D7) · fail **0** · present **597** · stale **37** · unrun **441** · excepted **17** |
| `browser-matrix` cells | **73 `pass` · 15 `stale` · 1 `unrun`** — the 15 are the components `527dbd1` changed *after* the `2d51eec` evidence run (R1-O1 finding S1-F10); they are what this re-run exists to clear |
| visual coverage | covered 0 · stale 8 · not-covered 136 of 144 |
| `yarn validate:all` | **exit 1** at link **48 `validate:peers`** — `[single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0)`. **Pre-existing, TASK-R1-O6's deliberate red under D174/D175. Not touched by this session.** |
| 10:40–11:00 UTC | **chromium: 1,431 passed · 8 skipped · 0 failed · 19.6m · exit 0** (8 projects, `matrix-chromium-{default,forced-colors,reduced-motion,rtl,touch,zoom-400,text-200,spacing}`). Tree still **0 dirty paths**. firefox started. |
| 11:01–11:2x UTC | **firefox sweep STOPPED at test 306/1439 — killed by the harness, not by the lane.** The Claude Code background-shell reaper terminated it because the machine was critically low on memory while the session was idle. No Playwright JSON report was written, so **not one firefox cell was projected**, and none was invented. The harness's own note forbids an agent restarting a reaped command on its own initiative, so the firefox and webkit sweeps are **held pending an explicit go-ahead** rather than retried. |

### R.2 Engine sweeps at `589be13` — run record (append-only)

Run one engine per invocation (**D123**). `PLAYWRIGHT_JSON_OUTPUT` points at the
session scratchpad, **outside `test-results/`**, which Playwright empties at the
start of every run (**D125**). Exit codes read directly from the log file, never
through a pipe.

| Engine | Projects | Tests | Passed | Failed | Skipped | Wall clock | Exit | When (UTC) | State |
|---|---|---|---|---|---|---|---|---|---|
| **chromium** | 8 | 1,439 | **1,431** | **0** | 8 | **19.6m** | **0** | 10:40:22 → 11:00:01 | ✅ report projected |
| ~~firefox (attempt 1)~~ | 8 | 1,439 | — | — | — | — | — | 11:01:28 → killed | ⛔ **reaped at 306/1439 for host memory pressure — no report, no cells** |
| ~~firefox (attempt 2)~~ | 8 | 1,439 | — | — | — | — | **1** | 11:2x | ⛔ died instantly on the orphaned `:6106` server (R.2.1, **D196**) |
| **firefox (attempt 3)** | 8 | 1,439 | **1,431** | **0** | 8 | **31.0m** | **0** | 11:23:09 → 11:54:08 | ✅ report projected |
| webkit | 8 | 1,439 | — | — | — | — | — | 12:0x → running | 🔵 in flight |

**chromium reproduces the 2026-09-19 figures exactly** (1,431 / 8 / 0, exit 0),
now from a tree whose tracked content is byte-identical to `589be13`. **No
failure that TASK-N1-O3 recorded as fixed reproduced**, so the
`<stop_conditions>` component-regression trigger did not fire on chromium.

**firefox reproduces them exactly too** (1,431 / 8 / 0), read from the report's
own `stats` block rather than from the console tail, because the sweep outlived
the session that launched it (see R.2.2) and no shell remained to report an exit
code:

```
matrix-firefox.json  stats: {"startTime":"2026-09-22T11:23:09.352Z",
  "duration":1858821.737,"expected":1431,"skipped":8,"unexpected":0,"flaky":0}
  projects: matrix-firefox-{default,forced-colors,reduced-motion,rtl,
            spacing,text-200,touch,zoom-400}   ← all 8 present
```

`unexpected: 0` **is** the exit-0 fact: Playwright exits non-zero iff
`unexpected > 0` (or the run aborts). `flaky: 0` additionally says no test
passed on retry — and `retries` is 0 outside CI in this config, so a flake would
have surfaced as `unexpected`, not been absorbed. The component-regression
trigger did not fire on firefox either.

**Wall clock, and why it is not a finding:** firefox took **31.0m** against
chromium's 19.6m, on the same tree and the same 1,439 tests. Two other Claude
sessions were busy on the host throughout (see R.3), one of which drove it to
the memory pressure that reaped attempt 1. The matrix lane asserts behaviour,
not latency — no perf metric is derived from these sweeps — so the delta is
recorded and **not** raised as a defect. Perf lives in TASK-R2-O7's lanes, which
require a quiet machine by policy.

### R.2.2 The firefox report survived its own launcher

Attempt 3 was started as a background process by an implementation agent that
was then **terminated by an API/network error (`ENOTFOUND`)** partway through
the run. The sweep continued to completion regardless, wrote its JSON report,
and was recovered from disk afterwards.

This is worth recording because it is the second time in this task that the
*evidence* outlived the *process that ordered it*, and both times the artifact
on disk was the thing that made recovery possible rather than a re-run. It is
the `<repo_conventions>` "the filesystem is the memory" rule paying for itself
twice in one afternoon. No number in the table above was reconstructed from a
console tail or from memory; each is read from the report's `stats` block, and
the report is retained at
`scratchpad/reports/matrix-{chromium,firefox,webkit}.json` until
`generate:browser-evidence` has consumed it.

**Nothing was merged forward to stand in for firefox or webkit.** Until those
two sweeps run, `e2e/matrix/browser-evidence.json` is deliberately **left as
committed** (`sourceCommit: 2d51eec`): regenerating it from the chromium report
alone would stamp the ledger `589be13` at the top while 16 of its 24 projects
still carried `2d51eec` cells — a header that overstates two thirds of the file.
`<no_fake>` is satisfied by *not* writing.

### R.2.1 The reap left an orphaned web server, and the next run died on it — finding **F-R2O1-A**

The retry of the firefox sweep (authorised by the user after the reap) **exited
1 in seven seconds** with:

```
Error: http://127.0.0.1:6106 is already used, make sure that nothing is running
on the port/url or set reuseExistingServer:true in config.webServer.
```

That is **not** a lane failure and not a component failure. Playwright's
`webServer` for this config is `vite preview --outDir apps/storybook/storybook-static
--host 127.0.0.1 --port 6106 --strictPort`. When the harness killed the sweep's
top-level process, Playwright never reached its teardown, so the preview server
**survived as an orphan** — confirmed by identity, not by assumption:

| Evidence | Value |
|---|---|
| PID holding `:6106` | 36868, `node.exe` |
| Command line | `vite preview --outDir apps/storybook/storybook-static --host 127.0.0.1 --port 6106 --strictPort` |
| Process start time | **13:01:30 local** — the reaped sweep launched at **11:01:28 UTC = 13:01:28 local**, two seconds earlier |
| Parent | `cmd.exe` PID 17224, already gone — a true orphan |

So the holder was **this task's own** reaped run, not one of the two concurrent
sessions, and clearing it touched nothing belonging to anybody else. PID 36868
was stopped, the port re-checked free, and the sweep relaunched. `--strictPort`
is right — silently moving to 6107 would let two sweeps drive two different
Storybook builds — but it means **any interrupted matrix run poisons the next
one**, with an error that reads like a config mistake rather than like leftover
state.

Recorded as **D196** rather than fixed here: the repair belongs in
`playwright.config.ts`/`webServer` policy, and this task's scope is steps 3, 5
and 6.

### R.3 Generation — the evidence is bound to `589be13`

Run only after all 24 projects had a report. Engine versions were **measured,
not copied** from the 2026-09-19 ledger (`--probe-engines`), because `--reset`
drops the previous file and a version carried forward would be an assertion
nobody made today:

```
chromium 149.0.7827.55 · firefox 151.0 · webkit 26.5
```

`--reset` was deliberate: with all 24 projects covered by a report from this
tree, merge-forward would have been a way for a `2d51eec` cell to survive
unnoticed. Resetting makes that structurally impossible.

```
generate:browser-evidence --reset --report {chromium,firefox,webkit}.json \
  --engine-versions … --wall-clock chromium=19.6m --wall-clock firefox=31.0m \
  --wall-clock webkit=27.9m                                        → exit 0
  24 projects attributed · 0 unattributed · 0 failed
```

| `e2e/matrix/browser-evidence.json` | before (committed) | after |
|---|---|---|
| `sourceCommit` | `2d51eec` | **`589be13`** = HEAD |
| runs | 8 `run` + 16 stale/unrun | **24 `run`** |
| cells | 73 pass · 15 stale · 1 unrun | **2112 pass · 0 fail · 24 unrun** |
| `dirtyPathCount` | 443 | **4** (none of them source — see R.4) |

The 24 `unrun` cells are one per project for `DzThemeProvider`, which has no
story to drive; that is the declared exception, not a gap.

**Security corpus**, re-run and re-stamped:

```
yarn test packages/testing packages/core/security    → exit 0 · 9 files · 403/403
yarn validate:security-corpus                        → exit 0 · schema 1.1.0 · 34 fixtures
```

`packages/core/security/coverage.json` `lastRun` moves `2026-09-19 / 2d51eec /
427 dirty` → **`2026-09-22 / 589be13 / 5 dirty`**. The recorded duration is
**33.78 s** against the previous record's 7.13 s; that is host contention (R.4),
not a regression, and it is written into the record rather than quietly
normalised because no timing assertion depends on it.

**Chain regenerated in the documented order** (README §5
`<generated_authority>`): capability → component-meta → llms → docs-pages.

`component-meta.json` went **stale as a direct consequence** of this task and
was regenerated, not worked around. The diff is 31 insertions / 66 deletions and
is entirely: the stamp, plus 15 components whose embedded evidence summary lost
`"stale": ["browser-matrix"]` and gained a `pass`. That is the same 15 cells,
observed a second time through an independent artifact — a cross-check, not a
duplicate claim.

| Capability matrix | before | after |
|---|---|---|
| stale cells | **37** (B 10 · C 26 · D 1) | **22** (B 0 · C 21 · D 1) |
| Tier B pass | 315 | **325** |
| Tier C pass | 142 | **147** |
| `browser-matrix` cells | 73 pass · 15 stale · 1 unrun | **88 pass · 1 declared-unrun** |
| `sourceCommit` | `527dbd1` | **`589be13`** |

The **22 remaining stale cells are 21 perf + 1 Tier D**, not browser. They are
**TASK-R2-O7's `O7-D1`** and can only be cleared by writing
`packages/core/perf/baselines.json`, which README §5 `<authority>` withholds
from every agent. They are left visible on purpose.

### R.4 Two other sessions were working in this repository throughout

Verified, not inferred: `internal-dev-ff` (live, busy, started ~11:40 UTC) and
`internal-dev-dd` (live, busy). `internal-dev-ff` created
`docs/program-2026-09-22-architecture/` and `docs/program-2026-09-22-planning/`
and added two lines to `docs/program-2026-09-04/README.md` pointing at a
successor planning programme.

**The owner's instruction was to leave that work completely alone, and it was.**
Nothing there was deleted, moved, staged, reverted or edited; `README.md` was
not touched by this task.

Three consequences, all recorded rather than papered over:

1. **`dirtyPathCount: 0` is unobtainable.** Reaching it would mean deleting
   another session's files. **D195** is the resolution: the claim that governs
   reproducibility is `git status --porcelain --untracked-files=no -- packages/
   apps/ e2e/` → **zero paths** other than this task's own generated artifacts,
   i.e. every file the sweeps executed is byte-identical to `589be13`. The raw
   `worktreeDirty` probe cannot tell that apart from "untracked docs exist", so
   it stays `true` and the decomposition is written into the artifacts.
2. **Host contention inflated two wall clocks** (firefox 31.0m vs chromium
   19.6m; the corpus 33.78 s vs 7.13 s) and caused the reap of firefox attempt 1.
   Recorded, not raised as a defect: the matrix and corpus lanes assert
   behaviour, not latency. Perf belongs to TASK-R2-O7, which requires a quiet
   machine by policy.
3. **Their two untracked directories turn `validate:all` red on gates this task
   did not touch** — see R.5.

### R.5 Aggregate qualification — read directly, every exit code from a file

`yarn validate:all` → **exit 1**, 311 lines, first failure at
`validate:package-names`.

| Red | Owner | Verdict |
|---|---|---|
| `validate:package-names` — 2 occurrences of the retired `@dzup-ui/pro` in `docs/program-2026-09-22-planning/{README,planning-docs-disposition}.md` | **`internal-dev-ff`** | **NOT THIS TASK.** Green at the 2026-09-22 baseline. Their files, their fix; the gate itself offers a `retired-name-ok: <reason>` escape hatch for a deliberate historical mention. |
| `validate:adr-references` — `docs/program-2026-09-22-architecture/custody-and-release-tasks.md:205` cites **ADR-21**, which has no document and no registry entry | **`internal-dev-ff`** | **NOT THIS TASK.** Baseline was `✓ 17 ADR(s) cited · 3 documented · 14 registry-only`. The gate explicitly refuses the registry-entry workaround. | <!-- adr-example-ok: discusses the unwritten number, not a citation -->
| `validate:peers` — 2 icon-library versions resolve (0.475.0, 0.477.0) | TASK-R1-O6 | **Pre-existing and deliberate.** `D174`/`D175` clear it. Untouched. |

Because `&&` short-circuits, `package-names` now hides the links behind it, so
the remaining 11 were run **individually**:

```
doc-snippets 0 · engines 0 · adr-references 1 · readme-facts 0 · externals 0
dts 0 · changelog 0 · release-policy 0 · peers 1 · licenses 0 · tree-shake 0
```

**Every gate this task touched or regenerated is green**, each read from its own
log:

```
✓ security-corpus    ✓ quality-tiers    ✓ at-matrix    ✓ capability-matrix
✓ ownership-manifest ✓ component-meta   ✓ llms         ✓ docs-size
```

**The aggregate is NOT called green.** It exits 1, for three reasons, two of
which belong to another session and one to an open owner decision.

### R.6 `<done_check>` re-run at the end — 4 clauses

| # | Clause | Verdict |
|---|---|---|
| 1 | tracked artifact exists and its `sourceCommit` equals HEAD | ✅ `e2e/matrix/browser-evidence.json` · `589be13` == `589be13` |
| 2 | `validate:capability-matrix` exit 0, no browser cell `unrun` at Tier B+ | ✅ exit 0 · **88 pass · 1 unrun**, the declared `DzThemeProvider` exception |
| 3 | a `"platform"` line names the authoritative platform and matches the baselines | ⚠️ **passes, and is the tautology D124 predicted** — it greps the same file that declares the value and compares it with itself; `win32`, `linux` and `solaris` all pass. By intent: baselines are `win32`, the recorded platform is `win32`, self-consistent. The live question — **D126 chose `linux`** and CI runs bare `ubuntu-latest` — is **TASK-R2-O6's blocker**, measured there, not this task's to close. |
| 4 | `coverage.json` git log at/after the sweep, and the file carries `sourceCommit` | ✅ by intent — carries `589be13` == HEAD, `lastRun.ranAt: 2026-09-22`. The *committed* half is unreachable by any agent: **the owner commits** (`D127`). |

### R.7 Ratchets (old → new, bound to `589be13`)

| Ratchet | Old | New |
|---|---|---|
| browser evidence `sourceCommit` | `2d51eec` (3 commits behind) | **`589be13`** = HEAD |
| browser projects with a run record from HEAD | **8 of 24** | **24 of 24** |
| `browser-matrix` stale cells | **15** | **0** |
| `browser-matrix` pass cells | 73 | **88** (+1 declared-unrun) |
| capability stale cells | **37** | **22** (all perf/Tier D — `O7-D1`) |
| security `coverage.json` `sourceCommit` | `2d51eec` | **`589be13`** |
| commit-bound corpus runs at HEAD | 0 | **1** |
| artifacts whose `sourceCommit` == HEAD | 0 of 6 | **5 of 6** (`engine-ratchets.json` still `51dec93`, untouched — not this task's input) |
| measured browser failures | 0 | **0** (held: 4,293 executions, 3 engines) |

### R.8 Owner decisions

- **D195** (new) — `worktreeDirty`/`dirtyPathCount` cannot distinguish "measured
  code differs from HEAD" from "untracked files exist". Options: (a) decompose
  the probe into `trackedDirty` + `untrackedCount` and gate only on the first;
  (b) scope it to the paths the lane executes; (c) leave it and rely on prose.
  **Recommend (a)** — it is a change to one helper, and it is the difference
  between an artifact that can say "commit-bound" and one that can never say it
  again while anybody else works in the repository.
- **D196** (new) — an interrupted matrix run orphans the `:6106` Storybook
  preview server and `--strictPort` makes the *next* run die on it with an error
  that reads like a config mistake. Options: (a) pre-flight the port and fail
  with the real reason; (b) reap the orphan automatically; (c) document it.
  **Recommend (a)** — (b) risks killing a server another session owns.
- **D127** (standing) — full commit-binding needs the owner to commit. This task
  has now discharged everything on the agent side of it.
- **O7-D1** (TASK-R2-O7's) — the 22 remaining stale cells are perf and need
  `baselines.json` written. Unchanged by this task.

### R.9 Ranked next packet

1. **Owner:** commit this tree. The degradation gate compares against *committed*
   `pass` cells, so 2,112 of them only become a tripwire once HEAD carries them.
2. **Owner / `internal-dev-ff`:** clear the two `validate:package-names` hits and
   the ADR-21 citation, or the aggregate stays red for reasons unrelated to any <!-- adr-example-ok: discusses the unwritten number, not a citation -->
   task in this programme.
3. **D174/D175** — the icon-library duplication, the last pre-existing red.
4. **TASK-R2-O6** — its *input* is now the only open question: D126 chose
   `linux`, the committed baselines are `win32`, and CI runs bare
   `ubuntu-latest`. That trio is what stands between 8/144 visual coverage and a
   real lane.

### R.10 Files this session changed

| Path | Why |
|---|---|
| `e2e/matrix/browser-evidence.json` | regenerated, `--reset`, from all 24 projects at `589be13` |
| `packages/core/security/coverage.json` | `lastRun` re-stamped to `2026-09-22 / 589be13` |
| `packages/core/docs/capability-matrix.json` | regenerated — 15 stale browser cells cleared |
| `packages/core/docs/component-meta.json` | regenerated — downstream of the above |
| `packages/core/docs/llms.txt` · `llms-full.txt` | regenerated — documented chain order |
| `apps/docs/.vitepress/generated/nav.json` | regenerated — documented chain order |
| `apps/storybook/stories/_data/capability.generated.ts` | written by `generate:capability-matrix` |
| this handoff | the record |

**Not touched:** `packages/core/perf/baselines.json`, every baseline PNG,
`known-failures.json`, `engine-exceptions.json`, `engine-ratchets.json`,
`.changeset/`, `yarn.lock`, any `docs/adr/` `Status:` line, any ratchet JSON,
`docs/program-2026-09-04/README.md`, and every file belonging to
`internal-dev-ff`. Nothing committed, pushed, dispatched, published or deployed.
