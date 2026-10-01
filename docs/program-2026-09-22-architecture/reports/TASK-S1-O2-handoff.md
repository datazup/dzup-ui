# TASK-S1-O2 — Capability-matrix close-out: stale proven, 441 unrun triaged

> Programme: [Architecture Review 2026-09-22](../README.md) · file
> [evidence-execution-tasks.md](../evidence-execution-tasks.md) · agent run
> **2026-09-22**. Written incrementally while the task ran; sections below the
> cursor were appended as each step finished.
>
> **Commit this report is bound to:** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`
> (`4e4e46f`). Every number here is a measurement **at that commit**, with the
> TASK-S0-O1 regeneration and this task's changes uncommitted in the worktree.
> Nothing here is CI, release or production evidence — it is **locally
> qualified** only.
>
> Companion: [`TASK-S1-O2-matrix-state.md`](./TASK-S1-O2-matrix-state.md) — the
> three-bucket report the `<done_check>` requires.

---

## 0. Baseline re-verification (README §4 point 1)

| Fact | README §2 / task preamble says | Measured 2026-09-22 |
|---|---|---|
| HEAD | `589be13` | **`4e4e46f`** — README §2 is stale, `589be13` is HEAD's parent |
| worktree | (clean, per S0-O1's end state) | **168 dirty paths**, all created by TASK-S0-O1 by design. Preserved. |
| capability-matrix `sourceCommit` | `589be13` | **`4e4e46f`** — rebound by TASK-S0-O1 |
| capability stale | **37** (README §5 ratchet line, task preamble) | **22** |
| capability unrun | 441 | **441** — confirmed |
| capability excepted | 17 | **17** — confirmed |
| capability fail | 0 | **0** — confirmed |

The task title ("37 stale → 0") and the `<repo_conventions>` ratchet line
("capability stale 37 → 0") are both **stale by 15**. The 37 figure was
measured at `589be13` against artifacts that themselves stamped an older
commit; TASK-S0-O1's rebinding re-derived every `componentCommit` from git and
the true figure at HEAD is 22. This is recorded as a ratchet correction in §5,
not as progress.

### done_check outcome — **2 of 4 at `4e4e46f`; checks 1 and 2 are DEFECTIVE**

Run first, before the rest of the prompt, per README §4.

| # | Check | At start | At end |
|---|---|---|---|
| 1 | `stale === 0` | **FAIL** — `stale 22`, exit 1 | **FAIL — impossible by design.** See §1: the only action that satisfies it is a baseline replacement, which this prompt and `<repo_conventions><authority>` both forbid, and which TASK-S1-O4 owns. |
| 2 | "every remaining Tier C/D **unrun** cell appears in the exceptions file with a reason" | **FAIL** — C 100 / D 1, none excepted | **FAIL — the clause is self-contradictory.** A cell that appears in the exceptions file is `excepted`, **not** `unrun`; the generator moves it the moment the entry lands. So the clause can only be satisfied when Tier C/D `unrun` is **0**, which is the N1 exit condition itself, not a check of it. Addressed under its evident intent instead — see below. |
| 3 | `validate:capability-matrix` → 0, **and the validator refuses a seeded stale-count increase** | **PARTIAL** — exited 0, but no staleness ratchet existed, so the second half could not be true | **PASS, both halves.** Exit 0 at the shipped ceiling; exit **1** under a seeded ceiling of 21, with a control run on the identical tree at exit 0. Also proven as 3 pure-function unit cases. |
| 4 | `TASK-S1-O2-matrix-state.md` exists with the three-bucket counts | **FAIL** — absent | **PASS** — [`TASK-S1-O2-matrix-state.md`](./TASK-S1-O2-matrix-state.md), 441 cells reconciled. |

**0 of 4 at the start → the task ran in full.** This is the **6th and 7th**
recurrence of the defect class README §4 point 3 names. Neither was silently
passed and neither was silently rerun.

**Check 2 under its evident intent** — *"no Tier C/D cell is both unrun and
unaccounted for"* — is the honest measure, and it moved:

| Tier C/D cells | at start | at end |
|---|---:|---:|
| `unrun` **with an artifact on disk** (a *scheduled* gap — the meaning the Tier D gate already enforces) | 53 | **53** |
| `unrun` **with nothing on disk** (an *absent* gap) | 48 | **35** |
| `excepted` with a written reason | 0 | **2** |
| `present` / `pass` | 272 (C 253 · D 19) | **283** (C 264 · D 19) |

Which reading of "unaccounted for" governs is **owner decision O2-D2** (§7).

---

## 1. Discovery — the stale cells are one input, and it is not mine to move

**All 22 stale cells are `perf-baseline`, and nothing else contributes.** Proven
by enumeration over every cell in the artifact, not by sampling:

```
node -e "...for(const r of rows) for(const cell of r.cells) if(cell.state==='stale')..."
→ total stale cells: 22 · kinds: perf-baseline
```

| Tier | Components owing a `perf-baseline` cell | stale |
|---|---:|---:|
| C | 21 (every Tier C component) | **21** |
| D | 1 (`DzFileUpload`) | **1** |
| A / B | 0 — the row is not owed below Tier C | 0 |

So **100 % of the perf-baseline column is stale and no other column has a
single stale cell.** The 22 are: `DzCalendar` `DzCascader` `DzColorPicker`
`DzCombobox` `DzCommandPalette` `DzDataGrid` `DzDataView` `DzDatePicker`
`DzDateRangePicker` `DzMegaMenu` `DzMention` `DzMultiSelect` `DzOrderList`
`DzPersonaSelector` `DzSidebar` `DzTable` `DzTimePicker` `DzTour` `DzTransfer`
`DzTree` `DzTreeSelect` (Tier C) and `DzFileUpload` (Tier D).

### Why it is one input, and why that input is not mine to move

`packages/core/perf/baselines.json` holds **33 baselines over 26 components,
and every one of them stamps `sourceCommit: 4c9fb7a1` (2026-08-21).** There is
no second perf input and no partial capture — the whole file is one capture
session. The generator's rule is
`state = evidenceIsCurrent(baseline.sourceCommit, componentCommit) ? pass : stale`.

Measured ancestry (`git merge-base --is-ancestor`):

| Baseline capture | Components' last change | Ancestor? |
|---|---|---|
| `4c9fb7a` 2026-08-21 | `a01965f` 2026-09-17 | yes → every cell it feeds is stale |
| `4c9fb7a` 2026-08-21 | `2d51eec` 2026-09-18 | yes → stale |
| `4c9fb7a` 2026-08-21 | `527dbd1` 2026-09-20 | yes → stale |

The staleness is an **ordering fact in git**, not a validator artefact: the
components moved three times after the capture. The single action that clears
all 22 at once is rewriting `baselines.json` from a ≥5-run capture — a
**baseline replacement**, which `<repo_conventions><authority>` and this
programme's `[!owner]` rule both refuse to any agent, and which is the declared
property of **TASK-S1-O4**.

### The `<done_check>`'s first clause is defective

`stale === 0` cannot be satisfied by any action this prompt authorises. It is
the third instance of the defect class README §4 point 3 names ("two could only
be satisfied by an action the same prompt forbade"). Resolved per §4 point 3:
the check is recorded as **impossible-by-design**, the cause is proven
exhaustively above, and the 22 cells are made *machine-checkable as blocked*
rather than silently carried — see §4 (the staleness ratchet gate) and §3
(`perf-baselines-blocked.json`). **No stale cell was cleared, relabelled, or
promoted.** Zero of the 22 is clearable by re-running an existing lane, because
the lane's output *is* the baseline file.

### One adjacent number a reader will trip over

`capability-matrix.json` also carries a **per-row `visual` field** whose state
can read `stale`. **8 rows are `visual: stale` at `4e4e46f`.** These are *not*
in any tier total and are *not* part of the 22 — visual is a row field, not an
evidence cell (N1-O6 §4.2), and `checkCapabilityMatrix` never looks at it. A
reader who counts "stale" by grepping the JSON gets 30, not 22. This is called
out in the matrix-state report so the next agent does not "discover" 8 new
stale cells that were never cells.

---

## 2. Triage — the 441 unrun, by column

The full column-by-column split, the bucket rules and the reconciliation of all
441 cells live in
[`TASK-S1-O2-matrix-state.md`](./TASK-S1-O2-matrix-state.md) §3. The result in
one line:

| Bucket | Cells | |
|---|---:|---|
| **not-applicable** — moved to `excepted` with a reason | **30** | `controlled-uncontrolled` 27 · `axe` 3 |
| **runnable-now, executed here** — moved to `present` by a test that ran green | **11** | `ssr-sample` 7 · `portal-hydration` 4 |
| **runnable-now, residual** | **311** | a harness this repo already ships covers it; 6 proposed tasks |
| **needs-a-lane** | **89** | `at-manual` only — the lane is a staffed AT session |
| | **441** | |

**The finding worth carrying forward: exactly one column in the matrix is
blocked on a lane that does not exist, and that lane is a human.** Every other
one of the 441 is reachable with a harness already in the repository. That was
not knowable before the split, and it converts "441 unrun" from a number nobody
could interpret into a six-task plan plus one staffing request.

### A defect in the prompt's own example

The `<requirements><example>` scores `manual-at | C | 84 | 0 | 0 | 0`: 84 unrun
with **zero in all three buckets**, which cannot reconcile against a total. It
is written as if there were a fourth, unnamed bucket for "blocked on a human".
Resolved by placing `at-manual` in **needs-a-lane** — the lane *is* the staffed
AT session, and the task that owns it (TASK-S1-O1) is named in the row exactly
as the example wanted. The three buckets then sum to 441 exactly. Recorded here
rather than silently re-scored, per README §4 point 3.

---

## 3. Implemented files, and their API effect

| File | Change | API effect |
|---|---|---|
| `packages/tooling/src/quality/component-tiers.ts` | +2 exported-by-use reason helpers (`noValueToControl`, `RENDERS_NO_DOM`); `exceptions` added to 28 component entries (30 keys) | **None public.** `TierAssignment` is unchanged; this is data in the one handwritten review artifact the tier model has. `validate:quality-tiers` already refuses an exception keyed to a row a component does not owe, so every key was checked by a gate, not by me. |
| `packages/tooling/src/validators/capability-matrix-ceilings.json` | **new** — `staleCells` (ceiling 22 + the 22 component names + `blockedOn`), `staleCellKinds` (`['perf-baseline']`), `unrunCells` (baseline 400, per tier) | New tracked ratchet file, same shape and same two-way handshake as `component-meta-ceilings.json`. |
| `packages/tooling/src/validators/capability-matrix.ts` | **gate 7** — `checkStaleRatchet()` + `readCapabilityCeilings()` exported; `CapabilityViolation.rule` gains `'stale-ratchet'`; CLI prints the ceiling, the blocker and the unrun baseline; `DZUP_CAPABILITY_CEILINGS` env override with a banner | `validate:capability-matrix` can now exit 1 for a seventh reason. `checkCapabilityMatrix()` is **unchanged** — the new gate is a separate pure function, so every existing caller and spec is untouched. |
| `packages/tooling/src/validators/capability-matrix.spec.ts` | +6 cases for gate 7, incl. the seeded increase, the kind swap and the shipped-ceiling-vs-shipped-matrix check | Test-only. |
| `packages/core/tests/ssr/ssr-smoke.spec.ts` | +1 `sSR: tier C` block, 7 real `renderToString` cases | Test-only. Not a second harness — the same `ssrRender` helper and the same contract as the 11 family blocks above it. |
| `packages/core/docs/quality-matrix.json` · `capability-matrix.json` · `component-meta.json` · `llms{,-full}.txt` · `apps/docs/**` | regenerated in the prescribed order | Generated artifacts; the generator reports, it does not decide. |

### Why `stale-ratchet` holds *kinds* and not only a count

A bare count is a gate that can be walked around: clear one `perf-baseline`
cell, let one `browser-matrix` cell go stale, and 22 is still 22 while the
matrix has traded a gap blocked on an owner action for a lane that quietly
stopped running. Gate 7 therefore errors on a stale cell of **any kind not in
`staleCellKinds`, whatever the count says**, and names the component and the
kind. Adding a kind to that list requires writing the reason it cannot be
re-run — the file says, in its own text, that it must never be edited to make a
red run green.

---

## 4. Focused validation output

Every command was run end-to-end with its exit code read directly — never
through a pipe.

| # | Command | Exit | What it proves |
|---|---|---:|---|
| 1 | `node node_modules/eslint/bin/eslint.js --fix packages/tooling/src/quality/component-tiers.ts` | **0** | the 28 patched entries parse and conform |
| 2 | `yarn typecheck:tooling` (after the tiers patch) | **0** | |
| 3 | `yarn generate:quality-matrix` | **0** | exceptions reach the quality matrix |
| 4 | `yarn generate:capability-matrix` | **0** | unrun 441 → 411, excepted 17 → 47 |
| 5 | `node node_modules/vitest/vitest.mjs run packages/core/tests/ssr/ssr-smoke.spec.ts` | **0** | **62 passed, 1 skipped** — all 7 new Tier C SSR renders green on first write |
| 6 | `yarn generate:capability-matrix` (after the SSR block) | **0** | unrun 411 → 400, present 597 → 608 |
| 7 | `node node_modules/eslint/bin/eslint.js --fix .../validators/capability-matrix.ts` | **0** | |
| 8 | `yarn typecheck:tooling` (after gate 7) | **0** | |
| 9 | `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/capability-matrix.ts` | **0** | gate 7 green at the shipped ceiling |
| 10 | `node node_modules/vitest/vitest.mjs run packages/tooling/src/validators/capability-matrix.spec.ts` | **0** | **16 passed** (10 pre-existing + 6 new) |
| 11 | **seeded increase:** same validator, `DZUP_CAPABILITY_CEILINGS=<ceiling 21>` | **1** | `✗ [stale-ratchet] 22 stale cell(s), above the ceiling of 21. Ratchets move one way only. … Re-run the owning lane; do not raise the ceiling.` |
| 12 | **control:** same validator, tracked ceilings, same tree | **0** | the difference in 11 is the seed and nothing else |
| 13 | `yarn generate:component-meta` | **0** | 209 components, 0 unclassifiable, every debt number still 0 |
| 14 | `yarn generate:llms` | **0** | |
| 15 | `yarn generate:docs-pages` | **0** | `evidence: 1662 capability cells over 144 components — 400 unrun, 22 stale, 47 excepted` · `AT cells executed: 0/534 ← published as unrun, per pair, on every page` |

**The seeded increase is proven twice**, at two levels, because one alone is
weak evidence: as a pure-function unit case (`FAILS on a seeded increase`,
`FAILS on a kind swap that keeps the count identical`, `FAILS on a drop that
does not lower the ceiling`) **and** end-to-end at the CLI, with a control run
on the identical tree to show the seed is the only difference. The env override
prints a banner, so a run under it can never be mistaken for a real one — the
same discipline `DZUP_BROWSER_EVIDENCE_BASELINE` already uses for gate 5.

> Note on the SSR run: it prints four pre-existing `[Vue warn] Missing required
> prop` lines from *other* blocks (`DzIconButton.icon`, `DzIcon.icon`,
> `DzPagination.total`, `DzSegmented.items`). They are at `4e4e46f`, not mine,
> and none is a failure. Filed as finding F1 below rather than fixed here.

---

## 5. Aggregate qualification

`yarn validate:all` run **end-to-end**, output to a file, exit code read
directly from the shell — never through a pipe.

```
yarn validate:all > <log> 2>&1; echo "exit $?"   →  exit 1
```

**First red at link 44 of 51 — `validate:externals`.** The chain is `&&`, so it
halts there and links 45–51 do not execute. Each was therefore run on its own
against the same tree:

| Link | Gate | Exit | Verdict |
|---:|---|---:|---|
| 1–43 | typecheck · typecheck:tooling · lint · … · readme-facts | **0** | all green, including **22 `capability-matrix`**, 21 `at-matrix`, 16 `quality-tiers`, 32 `component-meta`, 35 `docs-pages` |
| **44** | `validate:externals` | **1** | **pre-existing** |
| **45** | `validate:dts` | **1** | **pre-existing** |
| 46 | `validate:changelog` | 0 | |
| 47 | `validate:release-policy` | 0 | |
| **48** | `validate:peers` | **1** | **pre-existing** |
| 49 | `validate:licenses` | 0 | |
| 50 | `validate:tree-shake` | 0 | |
| **51** | `validate:evidence-binding` | **0** | **the one that matters here** — see below |

**48 of 51 green. Identical to the state TASK-S0-O1 left**: same three reds,
same first-red position, same cause.

`yarn test` run whole, exit code read directly:

```
yarn test > <log> 2>&1; echo "exit $?"   →  exit 0
Test Files  553 passed (553)
     Tests  10531 passed | 3 skipped | 1 todo (10535)
```

**10,531 = TASK-S0-O1's 10,518 + exactly the 13 tests this task wrote** (7 SSR
renders + 6 gate-7 cases). File count unchanged at 553 — no new spec file was
created, both additions went into the harness that already existed. **0 failed.**

### The three reds are one pre-existing open decision, and none is mine

All three name
`packages/codemods/dist/transforms/__fixtures__/swap-icon-library/*` — codemod
fixtures that import `@lucide/vue`, a module installed nowhere. They landed in
`589be13`, before this programme opened, and are the **D174/D175 icon-swap**
decision plus TASK-S0-O1's **D-S0O1-1** and **D-S0O1-3**. `yarn build` is red
from the same 14 TS errors.

**Proof they are not mine, beyond the timeline:** this task touched
`packages/tooling/src/quality/component-tiers.ts`, three files under
`packages/tooling/src/validators/`, one file under `packages/core/tests/ssr/`,
and generated artifacts. **It touched nothing under `packages/codemods/`**, and
the three failures name only files under `packages/codemods/dist`. Nothing was
made worse: links 1–43 were green before and are green after, and **the four
gates most exposed to this task's changes — 16 `quality-tiers`, 22
`capability-matrix`, 32 `component-meta`, 35 `docs-pages` — are all exit 0.**

### Link 51 is the one that matters here

`validate:evidence-binding` — the gate TASK-S0-O1 added yesterday — asks whether
any declared input changed **after** an artifact was stamped. This task edited
`component-tiers.ts` (an input to the quality matrix) and regenerated five
artifacts. **Exit 0** is the evidence that the regeneration order in
`<repo_conventions>` (ownership → quality → capability → component-meta → llms →
docs-pages) was followed and that no artifact is now reporting over an input
that moved under it. Had I regenerated the capability matrix and stopped, this
is the link that would have caught it.

### Maturity level reached

**Aggregate-qualified, locally.** Not CI, not release, not production evidence.
Specifically:

- The 11 cells promoted to `present` are **focused-validated**: a test that did
  not exist was written and ran green in a real vitest run.
- The 30 cells moved to `excepted` are **specified** — a reasoned claim about an
  API surface, reviewable and falsifiable, awaiting owner acceptance (O2-D3).
  They are not evidence and are not counted as any.
- Gate 7 is **aggregate-qualified**: unit-tested and proven end-to-end at the
  CLI on this machine. It has never run in CI.
- `at-manual` remains **0 of 534 executed**, untouched, as it must.

---

## 6. Ratchet movements

| Ratchet | Old | New | Direction |
|---|---:|---:|---|
| Capability-matrix **stale** cells | 22 (**not** the 37 the README claims) | **22** | **unmoved — and now held.** Gate 7 makes 23 a failure and 21 a failure-until-the-ceiling-is-lowered. Clearable only by TASK-S1-O4. |
| Stale cells **held by a gate** | 0 of 22 | **22 of 22** | ↑ (new capability) |
| Accepted stale **kinds** | *unbounded* | **1** (`perf-baseline`) | ↓ — a stale cell of any other kind is now an error at any count |
| Capability-matrix **unrun** cells | 441 | **400** | ↓ 41 |
| — of which Tier C | 100 | **87** | ↓ 13 |
| — of which Tier D | 1 | **1** | unmoved (`at-manual`, human) |
| Tier C/D unrun **with nothing on disk** ("unexplained") | 48 | **35** | ↓ 13 |
| Capability-matrix **excepted** cells | 17 | **47** | ↑ 30 — every one a *reason recorded*, not a row deleted |
| Capability-matrix **present** cells | 597 | **608** | ↑ 11 — each from a test that ran green |
| Capability-matrix **pass** cells | 585 | **585** | **unmoved — nothing was promoted** |
| Capability-matrix **fail** cells | 0 | **0** | unmoved |
| Untriaged unrun cells | 441 | **0** | ↓ 441 — all assigned a bucket with a written rule |
| `validate:capability-matrix` gates | 6 | **7** | ↑ |
| `capability-matrix.spec.ts` cases | 10 | **16** | ↑ 6 |
| SSR smoke cases | 55 | **62** | ↑ 7 |
| Repository tests passing | 10,518 | **10,531** | ↑ 13 — exactly the 13 written here, 0 failed |
| Repository test **files** | 553 | **553** | unmoved — no new spec file; both additions went into harnesses that already existed |
| `validate:all` links | 51 | **51** | unmoved — gate 7 is inside link 22, not a new link |
| AT cells executed | 0 of 534 | **0 of 534** | **untouched. An agent never fills one.** |
| `maxProposedCitedFromCode` · unclassified · `maxWithoutAnatomy` | 3 · 29 · 41 | 3 · 29 · 41 | untouched |

**No ratchet was raised and no allowlist was widened to turn a gate green.** The
30 new `excepted` cells changed no gate's colour: `validate:capability-matrix`
was exit 0 before them and is exit 0 after. They exist because the prompt's
`<requirements><reasons>` asks for exactly that record, and because an `unrun`
cell that nobody owes is the "empty checkbox" the 08-11 quality spec forbids.

---

## 7. Owner decisions raised

**O2-D1 — the 22 stale `perf-baseline` cells.** The ratchet cannot move without
a baseline replacement, which no agent may make.
- (a) **Owner runs the ≥5-run capture under TASK-S1-O4 and lowers
  `staleCells.ceiling` to 0 in the same change.** Gate 7 now *requires* the
  second half, so the drop cannot be silently re-spent.
- (b) Accept 22 stale indefinitely and relabel the perf evidence as historical.
- (c) Remove the `perf-baseline` row from Tier C/D — a quality-model change.
- **Recommend (a).** (b) leaves 22 cells printing a result measured against
  source that changed three times since; (c) trades a visible gap for an
  invisible one, which is what this matrix exists to prevent.

**O2-D2 — what "unexplained" means in the N1 exit condition.** The roadmap says
"zero *unexplained* `unrun` in Tier C/D" and never defines it; the number
changes by 53 depending on the reading.
- (a) **The meaning the Tier D gate already enforces**: `unrun` **with no
  artifact on disk**. Distance today = **35** (`axe` 16 · `controlled-uncontrolled` 19).
- (b) Anything not `pass`/`present`/`excepted`. Distance today = **88**.
- **Recommend (a)** and writing it into the roadmap. The repository already has
  one checkable definition of "unexplained" and a second one in prose is how
  the same number gets re-derived differently every packet. Under (a) the exit
  is two tasks away; under (b) it additionally requires a human AT wave.

**O2-D3 — accept or reject the 30 new exceptions.** They are a proposal in the
one handwritten review artifact the tier model has, and the owner is the
reviewer.
- (a) **Accept as written** — 27 `controlled-uncontrolled` + 3 `axe`.
- (b) Accept the 27 and reject the 3 `axe` ones as too strong (arguing a
  renderless component should still be scanned in a host fixture).
- (c) Reject wholesale: delete the two helpers and the 28 `exceptions` keys;
  the 30 cells return to `unrun` and nothing else changes.
- **Recommend (a).** Each reason names a source fact and carries the commit it
  was measured at, so a wrong one is falsifiable rather than merely arguable —
  and `validate:quality-tiers` already refuses an exception keyed to a row the
  component does not owe.

**O2-D4 — should `unrunCells` become a hard gate too?** It is recorded as a
baseline and printed beside the stale gate, but does not fail.
- (a) **Leave it reporting.** (b) Gate it on a rise.
- **Recommend (a) for now, revisit once the six F-tasks land.** Gating it today
  fails the chain the first time a component is added, which is how a gate
  earns a `--skip` flag.

**O2-D5 — `DzThemeProvider` has no stories file.** It is the only public
component in the catalog without one, already carried as
`publicComponentsWithoutExample: 1` in `component-meta-ceilings.json`. Two of
the 11 singleton unrun cells (`story-light-dark`, `browser-matrix` 0/24) trace
to that one absence.
- (a) **Write the story** — clears 2 cells, lowers a ceiling, and gives the
  browser matrix a target it currently skips.
- (b) Declare it story-exempt and except both cells.
- **Recommend (a).** The component whose entire job is the theme is a strange
  one to have no light/dark story.

### Findings filed, not fixed (per `<stop_conditions>`)

**F1 — the SSR smoke lane renders four components with invalid props and still
asserts `toBeTruthy()`.** At `4e4e46f`, `ssr-smoke.spec.ts` prints
`[Vue warn] Missing required prop` for `DzIconButton.icon`, `DzIcon.icon`,
`DzPagination.total` and `DzSegmented.items` — the calls pass `ariaLabel`,
`name`, `totalItems`/`pageSize` and nothing respectively. The tests pass because
the assertion is only that a string came back. Pre-existing, not mine, and not a
capability-matrix cell (the cells read `present`, which is what a file naming
the component means). It belongs to TASK-S1-O2-F4, which extends this block.

> **Addendum 2026-09-25 — F1 is CLOSED. Fixed by RESIDUAL-02**
> ([`RESIDUAL-02-filed-defects-handoff.md`](./RESIDUAL-02-filed-defects-handoff.md) §1).
> Nothing above is rewritten; this note is the disposition.
>
> All four calls now pass the props their `*.types.ts` declares as required and
> assert rendered output. What F1 did not record is what SSR actually emitted:
> `DzIconButton` a `<button>` with **no `<svg>`**, `DzIcon` **`'<!---->'` — seven
> bytes, the component rendering nothing — `DzPagination` **one** page button for a
> hundred items, `DzSegmented` **zero** segments. `'<!---->'` is truthy, so
> `DzIcon`'s assertion was not merely weak, it was **unfalsifiable**. Proved by
> seeding `DzIcon.vue` and `DzSegmented.vue` to render nothing: the new
> assertions exit 1, the old `toBeTruthy()` exits 0 on the same tree, and the
> restore is `sha256sum -c` clean. 62 → 63 tests, and the four
> `[Vue warn] Missing required prop` lines are **gone**.
>
> Two corrections to this section's own text, both measured: F1 says the finding is
> "not a capability-matrix cell", which is right about *cells* — `unrun`/`present`
> did not move — but `ssr-smoke.spec.ts` **is a declared input of the matrix**, so
> the edit made `capability-matrix.json` stale and stopped `validate:all` at link
> 24 until the sanctioned regeneration ran. And the `filesMentioning` derivation is
> a **substring match over the whole file**, so a component named in a *comment*
> acquires an evidence citation — measured, and raised as `D-RES02-2`.
>
> **Scope note:** RESIDUAL-02 fixed the four calls F1 named. Of the file's 64 `it`
> blocks, **36 still have `toBeTruthy()` as their sole assertion**; those render
> with no props at all, so nothing warns and several have no assertable SSR output.
> Not the filed defect, and not finished — ranked 7th in RESIDUAL-02 §6.

**F2 — nothing else surfaced.** No component failure was produced by any lane
this task ran: 7 new SSR renders green on first write, 16 validator cases green,
`fail` cells 0 → 0.

---

## 8. Ranked next packet

1. **TASK-S3-O1** — the parent's stated next task, and nothing here blocks it.
   This task touched `component-tiers.ts`, the capability/quality/meta/llms/docs
   artifacts, one validator and two spec files; it added no dependency S3-O1
   reads.
2. **TASK-S1-O4** — `[!owner]`. The **only** thing that moves the stale ratchet
   off 22. Gate 7 now tells whoever runs it, in the failure message, to lower
   the ceiling in the same change.
3. **TASK-S1-O2-F3** (`controlled-uncontrolled`, 19 Tier C) then
   **TASK-S1-O2-F1** (`axe`, 16 Tier C) — together they are the *whole* distance
   to the N1 exit under reading (a) of O2-D2.
4. **TASK-S1-O1** — `[!owner tester]`. The single `needs-a-lane` cluster in the
   matrix: 89 cells, 22 of them Tier C/D.

Full ranking, with per-task Tier C/D yield, in
[`TASK-S1-O2-matrix-state.md`](./TASK-S1-O2-matrix-state.md) §6.

### Nothing here blocks the next tasks

- **Worktree:** all work is **uncommitted**, as required. The 168 paths
  TASK-S0-O1 created were preserved untouched; this task's changes add to them.
  No commit, push, CI dispatch, publish, deployment or baseline replacement was
  performed.
- **TASK-S1-O4 inherits a better starting position**, not a worse one: the 22
  cells are enumerated by name in the ceilings file, the cause is proven, and
  the gate will refuse the drop until the ceiling is lowered with it.
