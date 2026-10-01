# TASK-S1-O4 — Performance contract: the capture authority, the eight-scenario audit, and why the 22 stale cells did not move

> **Status: `[x]` engineering complete. The capture itself is `[!owner]`.**
> Repository: `ui/dzup-ui` · Commit observed: **`4e4e46f`**
> (`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`). README §2 quotes `589be13`;
> that is **stale**. Every number below is bound to `4e4e46f`.
>
> The worktree carried **225 dirty paths** from six prior tasks of this
> programme at the start and **234** at the end — every pre-existing one
> preserved, nothing committed, stashed, reverted or cleaned. The +9 are 5 new
> files and 4 newly-modified tracked files, none of them a baseline.
>
> **Nothing in this task captured, replaced or rewrote a perf baseline.**
> `packages/core/perf/baselines.json` is byte-identical to its HEAD blob
> (`sha256 dad67bf48ba3740b4b700cd3020aa6bfd981bf80f148c9bde1cf4380be7d4413`)
> before and after every command in this report, and
> `git status --porcelain packages/core/perf/baselines.json` is empty. Capture
> is an owner action; this task built the mechanism and proved the refusal.
>
> Companion: [`TASK-S1-O4-scenario-audit.md`](./TASK-S1-O4-scenario-audit.md) —
> the eight-scenario audit the `<done_check>` requires.

---

## 0. Progress log (written as the task ran — long tasks cross context windows)

| # | step | state |
|---|---|---|
| 1 | Baseline re-verification + `<done_check>` executed and critiqued | done |
| 2 | Discovery: perf machinery, the six metric families, the variance policy, R2-O7's D132/D135 | done |
| 3 | `DZUP_PERF_GATE=1` run of both harness halves, with machine load recorded before and after | done |
| 4 | Deterministic re-measurement of the 22 export sizes (writes nothing) | done |
| 5 | Capture-environment declared as data; four refusals implemented | done |
| 6 | `inputs[].gate` + `note` for `perf-baselines` (the hook S1-O3 left) | done |
| 7 | `validate:perf-baselines` + its ceilings + 39 unit cases | done |
| 8 | Eight-scenario audit published | done |
| 9 | Proposal capture (≥5 runs) to the scratchpad — never into the repository | done |
| 10 | Sanctioned regeneration order (capability → component-meta → llms → docs-pages) | done |
| 11 | `Can fail CI` column on the published evidence page — the rendering half of S1-O3's `inputs[].gate` | done |
| 12 | `validate:all` end to end. Attempt 2 stopped at link 2 on a typecheck error this task caused (§8.2); fixed, then re-run end to end — **only the third run is quoted** | done |
| 13 | `yarn build` · `yarn test` ×2 (a non-reproducible vitest reporter flake on the first, §8.3) | done |

---

## 1. The `<done_check>`, read critically — **0 of 4 at `4e4e46f`**, three clauses defective

README §4.3 warns that a check can itself be wrong, and all six prior tasks in
this programme found at least one defect. This one has three, and two of them
are the serious kind: a clause that can only be satisfied by an action the same
prompt forbids.

| # | clause | verdict at `4e4e46f` | assessment |
|---|---|---|---|
| 1 | `b.sourceCommit` equals HEAD **and** `b.hardwareProfile` is present | **FAIL** — both print `undefined` | **DEFECTIVE on three counts.** (a) *Wrong level.* Neither field has ever existed at the file root; `sourceCommit` and `host` are stamped **per baseline**, on all 33 entries, and have been since P5-05. The substance the clause is reaching for was already true. (b) *Impossible by construction.* `sourceCommit === HEAD` can only hold in the seconds between a capture and the commit that carries it: the file is committed **by** a commit whose hash did not exist when the capture ran, so the clause is false forever after. This is the class TASK-S0-O1 documented. (c) *Forbidden.* The only way to change either field is to **write `baselines.json`** — a baseline replacement, withheld from every agent by `<repo_conventions><authority>`. Decided from evidence instead: the *emit* path now writes a file-level `capture` block (schema 1.2.0) carrying `sourceCommit`, `capturedAt`, `runs` and a `hardwareProfile`; the *write* is the owner's. See §4.2. |
| 2 | the perf contribution to the capability stale count is `0` | **FAIL** — 22 | **DEFECTIVE — the same impossibility.** TASK-S1-O2 proved by enumeration over all 1,662 cells that all 22 stale cells are `perf-baseline`, that they trace to one input, and that **zero of them is clearable by re-running an existing lane, because the lane's output *is* that file**. Clearing them is a baseline replacement. Unchanged at 22, and now held by two gates rather than one. See §6. |
| 3 | `TASK-S1-O4-scenario-audit.md` exists with a verdict per scenario | **FAIL** — absent | Correct and decisive. Delivered: [`TASK-S1-O4-scenario-audit.md`](./TASK-S1-O4-scenario-audit.md), eight rows, one verdict each. **PASS at the end.** |
| 4 | `DZUP_PERF_GATE=1 yarn test:perf > /tmp/perf.log 2>&1` runs to completion and **reports sample counts per metric** | **not run as written; run corrected** | **DEFECTIVE on the log path** — `/tmp` is not writable on this machine (the same correction TASK-S1-O3 recorded). Corrected to the session scratchpad. Run in its corrected form: **exit 0**, 85 tests, and it does print a sample count per metric — but the second half of the clause is the interesting one, because what it printed is that **179 of 190 metric observations have no baseline to count samples against**. See §3. |

**Recorded outcome: `0 of 4 at 4e4e46f`.** The task ran in full. Clause 3 passes
at the end; clauses 1 and 2 remain unsatisfiable by any agent and are recorded
as such rather than silently passed or silently rerun. This is the **7th and
8th** recurrence of the defect class README §4.3 names.

---

## 2. Discovery — six metric families, and four of them have never been baselined

`packages/core/perf/baselines.json` at `4e4e46f`:

| fact | value |
|---|---|
| schema | **1.0.0** — predates TASK-R2-O7's 1.1.0, so there is **no `harness` identity block** |
| baselines | **33** over 26 components |
| by family | `size` **22** · `runtime` **11** · `leak` **0** · `longtask` **0** · `memory` **0** · `hydration` **0** |
| with a derived threshold | **24** |
| `unmeasurable: variance-exceeds-signal` | **9** — every one a `runtime` metric |
| `sourceCommit` | `4c9fb7a1…` (2026-08-21) on all 33 |
| `host` | `win32/x64, 16 CPUs, node v24.14.1` on all 33 — unanimous |

**TASK-R2-O7 built the `leak`, `longtask`, `memory` and `hydration` lanes, ran
them, and captured them only into a proposal** at
`docs/program-2026-09-04/reports/TASK-R2-O7-baseline/baselines.proposed.json`
(`2d51eec`) — correctly, because adopting a budget is an owner act. The proposal
was never adopted. So the four lanes exist, run green, and **have nothing to
compare against**.

### The three prior defects this task inherits, all confirmed at HEAD

- **D132 — the downward-only ratchet is documented, tested and not enforced
  where baselines are written.** `mayRatchet()` has six unit tests and, until
  this task, **no production call site**: `toBaseline()` derives a threshold
  from the fresh distribution alone and never reads the recorded file, so
  `perf:capture` wrote whatever the machine produced that day, upward moves
  included. R2-O7 measured the cost — an in-place capture at that moment would
  have raised **22 of 33** budgets, by up to **+21.6 %**. **Closed here** (§4.3).
- **D135 — the 22 per-export `size:*` budgets are enforced by nothing, and most
  are breached.** Confirmed at `4e4e46f` by a fresh deterministic measurement
  (§3.2): **20 of 22 over threshold**, worst `size:DzMention` **+15.8 %**. Still
  open — closing it is an owner decision, D-S1O4-4.
- **D90 — the harness has an identity block now, and the committed file predates
  it.** Every lane run prints `harness unrecorded: the recorded baselines
  predate schema 1.1.0 … this tree is 5c7429346dce on vitest 3.2.6`. So even
  where a threshold exists, the instrument that produced it is unnamed.

### The three false regressions the gate was created to suppress

`<discovery>` step 2 asks whether the variance policy suppresses them, and says
"that is a re-run, not an argument". The re-run says: **the question cannot be
asked of two of the three, and the policy answers the third by refusing to
gate.**

- The regressions are recorded in `perf-bench.spec.ts`'s own comment:
  `runtime:DzTable:mount-1000` measured 1,344 ms and 2,392 ms **within minutes**
  on this machine, each capture internally consistent (cv 0.17) and disagreeing
  by 78 %, because one shared the machine with a Storybook build.
- The policy's answer is `unmeasurable`. At `4e4e46f` **9 of the 11 runtime
  metrics carry `threshold: null` with `unmeasurable: variance-exceeds-signal`**
  — including `DzTable:mount-1`, `DzTable:mount-100`, `DzDataGrid:mount-1`,
  `DzDataGrid:mount-100`, `DzDialog:open-close`, `DzListbox:arrow-down-10`,
  `DzAccordion:mount-20`, `DzFileUpload:list-50`. A metric with no threshold
  cannot produce a false regression, so **the policy suppresses them by
  declining to gate them at all**, which is the honest outcome P5-05's stop
  condition asks for and not the same thing as making them reliable.
- The two runtime metrics that *do* carry a threshold (`DzTable:mount-1000`,
  `DzTabs:mount-10`) both read `ok` under `DZUP_PERF_GATE=1` here — on a machine
  at 21 % idle CPU load with 562 live processes. One green pair is not evidence
  that the suppression is robust; it is evidence that it did not fire today.

---

## 3. What the gated run actually measures — 2 of 190

### 3.1 `DZUP_PERF_GATE=1 yarn test:perf`, both halves, exit codes read directly

```
DZUP_PERF_GATE=1 yarn test:perf:bench  > <scratchpad>/perf-bench-gated.log 2>&1 ; echo "exit $?"  → exit 0
DZUP_PERF_GATE=1 yarn test:perf:lanes  > <scratchpad>/perf-lanes-gated.log 2>&1 ; echo "exit $?"  → exit 0
```

`Test Files 1 passed · Tests 11 passed` (bench, 27.9 s) and
`Test Files 4 passed · Tests 74 passed` (lanes, 65.2 s). **85 tests, 0 failed.**

Every metric line, tallied from the two logs:

| family | observations | verdict |
|---|---:|---|
| `leak` | 110 | **no baseline** ×110 |
| `longtask` | 44 | **no baseline** ×44 |
| `memory` | 22 | **no baseline** ×22 |
| `hydration` | 3 | **no baseline** ×3 |
| `runtime` | 11 | 9 `not yet measurable` · **2 `ok`** |
| `size` | **0** | no test asserts a `size:*` metric (D135) |
| | **190** | |

**Exactly 2 of 190 metric observations could have failed.** 179 have nothing to
compare against, 9 have no threshold, and 22 deterministic size budgets are
asserted by no test. That number is the whole `DZUP_PERF_GATE` argument (§7).

Two component findings surfaced, neither of them caused by this task:

- **3 of 22 Tier C/D components run a synchronous task over 50 ms** —
  `DzCombobox`, `DzCommandPalette`, `DzPersonaSelector`, each median **1**,
  **cv 0.00** within the run. Had the `longtask` family been baselined at 0,
  these three would fail the gate.
- **0 of 22 components leak anything.** All 110 `leak` metrics read `no growth`
  over 49 counted cycles.

### 3.2 The one scenario that is fully measurable here — and 20 of 22 are breached

Export size is deterministic, so this needs no capture host. Re-measured at
`4e4e46f` with `measureExportSizes()` into the **scratchpad**, writing nothing
into the repository:

```
node node_modules/tsx/dist/cli.mjs <scratchpad>/measure-sizes.ts → exit 0
  20 of 22 over their committed threshold
```

| export | committed threshold | measured at `4e4e46f` | over by |
|---|---:|---:|---:|
| `size:DzMention` | 22,421 B | 25,965 B | **+15.8 %** |
| `size:DzDataView` | 23,369 B | 25,541 B | +9.3 % |
| `size:DzPersonaSelector` | 22,302 B | 23,918 B | +7.2 % |
| `size:DzCombobox` | 21,709 B | 23,266 B | +7.2 % |
| `size:DzTreeSelect` | 26,661 B | 28,556 B | +7.1 % |
| `size:DzDataGrid` | 34,773 B | 37,128 B | +6.8 % |
| …14 more between +0.6 % and +6.1 % | | | |
| `size:DzColorPicker` · `size:DzOrderList` | | | the only two **under** |

This reproduces R2-O7's §6.6 finding at a later commit and to within a few
bytes — the drift is real, accumulated and ongoing. **It is a defect, not a
threshold problem**, and the `<downward_only>` requirement is explicit that
re-capturing to make it green is the wrong move: doing so would *raise* 20
budgets. Raised as **D-S1O4-4**.

---

## 4. Implemented files, and their API effect

### 4.1 New files

| file | what it is |
|---|---|
| `packages/core/perf/capture-environment.json` | **The authority, declared as data.** Which host profile a perf capture must run on, why none is designated yet, three ranked candidates with pros and cons, the quiescence rules, and the policy the refusals enforce. The perf analogue of `e2e/visual/visual-baselines.json` `scope.platformAuthority` (TASK-S1-O3), kept in its own file so a `perf:capture` — which rewrites `baselines.json` wholesale — cannot destroy it. |
| `packages/tooling/src/perf/capture-environment.ts` | The mechanism: `readCaptureEnvironment`, `currentHost`, `hostMatchesProfile`, `checkCaptureAuthority` (the four refusals), `thresholdMovements` (D132's missing call site), `checkPerfBaselines` (the host-free gate), `perfInputGate` / `perfInputNote` (the capability-matrix descriptor). **Imports no vitest and no Vite**, so it runs with no harness. |
| `packages/tooling/src/perf/capture-environment.spec.ts` | **39 unit cases.** Each refusal proved to fire, the positive path proved not to be a blanket refusal, each ratchet proved to fail in **both** directions and on a **kind swap that keeps the count identical**, and a final block asserting the **committed** repository state passes every hard gate. |
| `packages/tooling/src/validators/perf-baselines.ts` | `yarn validate:perf-baselines` — the repository-state half, no host required. |
| `packages/tooling/src/validators/perf-baselines-ceilings.json` | Two one-way ratchets: `metricFamiliesWithoutBaseline` (**4**) and `unmeasurableMetrics` (**9**). |

### 4.2 Changed files, and the API effect

| file | change | API effect |
|---|---|---|
| `packages/tooling/src/perf/baselines.ts` | `+CaptureStamp` interface; `BaselineFile.capture?`; `BASELINE_SCHEMA_VERSION` **1.1.0 → 1.2.0** | **Additive.** Every 1.0.0 and 1.1.0 file is a valid 1.2.0 file with `harness` and/or `capture` absent. No reader breaks. |
| `packages/tooling/src/perf/capture-baselines.ts` | two-phase authority check + `capture` stamp + `--quiet-host-attested-by`, `--raise-budget`, `--owner`, `--reason` | `yarn perf:capture` can now exit 1 for four new reasons, **before** spending five process runs where possible. `yarn perf:propose` is unchanged and never refused. `captureRuntimeSamples`, `toBaseline` and `describeMetricId` are untouched, so every existing caller and spec is unaffected. |
| `packages/tooling/src/quality/capability-matrix.ts` | *(unchanged)* | `inputs[].gate` already existed — S1-O3 added it at schema 1.2.0 and named `perf-baselines` as the other host-sensitive input that should carry one. This task fills that hook rather than inventing a parallel field. |
| `packages/tooling/src/quality/generate-capability-matrix.ts` | `+sources.captureEnvironment`; `perf-baselines` gains `note` + `gate`; `+packages/core/perf/capture-environment.json` in `generatedFrom` | The perf input now says whether it can fail CI, not only that it was read. |
| `packages/tooling/src/docs/evidence-pages.ts` | the published inputs table gains a **`Can fail CI`** column | The generated evidence page stops printing one fact where there are two. `inputs[].gate` has existed since S1-O3 and this page rendered only `available`, so `perf-baselines` and `visual-baselines` both read "Available: yes" beside a note explaining that they gate nothing — the exact misreading the field was added to prevent, reproduced in the rendering of it. |
| `packages/tooling/src/docs/evidence.ts` | `+gate` on the structural restatement of the capability-matrix input type | Type-only. See §8.2: the missing field is also what made the previous line a typecheck error rather than a silent omission. |
| `package.json` | `+validate:perf-baselines` (with its `//` doc entry), inserted into `validate:all` after `validate:visual-baselines`; `//perf:capture` doc updated to describe the refusals | **`validate:all` is now 53 links, not 52.** See §8 — this renumbers the known pre-existing red from link 48 to **link 49**. |

### 4.3 The four refusals, and why the fourth is the one that matters

An **in-place** write of `packages/core/perf/baselines.json` is refused unless
all four hold. `yarn perf:propose <path>` is never refused — that split is
R2-O7's `--propose` flag made load-bearing rather than advisory.

| code | fires when | phase |
|---|---|---|
| `undesignated` | no authoritative capture host is declared (**the state at `4e4e46f`**) | before the capture runs |
| `wrong-host` | the running machine is not an instance of the declared profile | before the capture runs |
| `unattested` | quiescence was not signed for with `--quiet-host-attested-by` | before the capture runs |
| `raises-budget` | **any** recorded threshold would move up, without `--raise-budget` + `--owner` + `--reason` together | after the capture, before the write |

The fourth is **D132's missing call site**, and it is the one that protects the
thing this task's `<authority>` is really about. The failure mode it closes is
not "an agent runs the wrong command"; it is that **a capture on a contended
machine produces a wide distribution, a wide distribution earns a *permissive*
threshold under `median + max(3σ, 5 %)`, and the ratchet is downward-only** —
so that permissive number cannot be tightened by a later quiet run without an
owner decision. A bad perf capture is **durable damage, not a wasted
afternoon**, and that sentence is written into
`capture-environment.json` `quiescence.why` so the next reader meets it before
they meet the command.

Note what the fourth refusal implies for the 20 breached size budgets: a
re-capture today would raise all 20, so the refusal fires on exactly the action
that would have "fixed" D135 by deleting the evidence of it.

---

## 5. Focused validation — the refusal is proved un-silenceable

**Correction recorded as README §4.3 requires.** The `<done_check>` and
`<validation>` blocks write to `/tmp/perf.log`, `/tmp/s1o4-gen.log`,
`/tmp/s1o4-perf.log` and `/tmp/s1o4-validate-all.log`. **`/tmp` is not writable
on this machine** — the same correction TASK-S1-O3 recorded. Every log below
went to the session scratchpad and **every exit code was read directly**
(`cmd > log 2>&1; echo "exit $?"`), never through a pipe.

**`npx` was not used anywhere.** The `<validation>` block prescribes
`npx tsx packages/tooling/src/validators/capability-matrix.ts`; in this
repository `npx` fetches dependency-confusion placeholders that **exit 0 without
running**. Every such invocation was run as
`node node_modules/tsx/dist/cli.mjs …` instead. A silent green is precisely what
this task exists to eliminate.

### 5.1 The refusal, three ways

**(a) The command itself — `yarn perf:capture` → exit 1, in about a second, before any measurement.**

```
✗ perf:capture REFUSED [undesignated] perf: no authoritative capture host is designated
  (authoritative.designated = false). Designating one is an owner action — see `candidates`
  in packages/core/perf/capture-environment.json and decision D-S1O4-1. Until then, capture
  with `yarn perf:propose <path>`.
✗ perf:capture REFUSED [unattested] perf: quiescence is not attested. A capture on a
  contended machine records a wide distribution, which earns a PERMISSIVE threshold, and the
  ratchet is downward only — so the damage is durable. …

2 refusal(s). packages/core/perf/baselines.json is unchanged. Baseline replacement is an
owner action (docs/program-2026-09-22-architecture/README.md §5 <authority>).
```

`sha256sum packages/core/perf/baselines.json` **before and after**:
`dad67bf48ba3740b4b700cd3020aa6bfd981bf80f148c9bde1cf4380be7d4413` — identical,
and `git status --porcelain` on that path is empty.

**(b) As 39 pure-function unit cases**, because an end-to-end run alone is weak
evidence:

```
node node_modules/vitest/vitest.mjs run packages/tooling/src/perf/capture-environment.spec.ts
  → 39 passed, exit 0
```

Including: every refusal fires and names both sides; **a proposal is never
refused, whatever the host**; a fully qualified capture **is allowed** (the
refusal is not a blanket one); a budget raise passes only with all three of
`--raise-budget`, `--owner`, `--reason`; adding a lane is classified `added`,
**not** `raised`; a lost threshold is classified as evidence *removed*; and both
ratchets fail on a rise, on a drop that does not lower the ceiling, and on a
**kind swap that keeps the count identical**.

**(c) Against the committed tree, not only fixtures.** The last block of the
spec asserts that the real `baselines.json` + `capture-environment.json` +
ceilings pass every hard gate, and that an in-place capture is refused on any
machine. A suite of fixtures can be green while the shipped file is broken.

### 5.2 The narrow validators

| # | command | exit | what it proves |
|---|---|---:|---|
| 1 | `node node_modules/eslint/bin/eslint.js --fix <6 files>` | **0** | |
| 2 | `yarn typecheck:tooling` | **0** | |
| 3 | `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/perf-baselines.ts` | **0** | green on the committed tree at the shipped ceilings |
| 4 | `node node_modules/vitest/vitest.mjs run packages/tooling/src/perf/capture-environment.spec.ts` | **0** | 39 passed |
| 5 | `yarn perf:capture` | **1** | the refusal, with `baselines.json` byte-identical after |
| 6 | `yarn perf:propose <scratchpad>` | **0** | the positive path still works — see §5.4 |
| 7 | `yarn generate:capability-matrix` | **0** | `perf-baselines` gains `note` + `gate` |
| 8 | `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/capability-matrix.ts` | **0** | **S1-O2's stale ratchet still holds at 22** |

`validate:perf-baselines` prints the state the audit is about:

```
  schema     1.0.0 (no harness identity — pre-1.1.0 capture)
  metrics    33 recorded · 24 with a threshold · 9 not yet measurable
  families   with a baseline: runtime, size
             WITHOUT one:     leak, longtask, memory, hydration  ← these lanes run, report, and cannot fail
  capture    authoritative host: (undesignated — in-place capture is refused)
             committed evidence: win32-x64-16c-node24
  ratchets   metricFamiliesWithoutBaseline ≤ 4 · unmeasurableMetrics ≤ 9
```

### 5.3 `validate:all` — 52 links → **53**, and the known red moves to link 49

`validate:perf-baselines` was inserted as **link 24**, immediately after its
sibling `validate:visual-baselines`, so the chain reaches it long before the
known red. Full end-to-end reading, the one new red this task caused and closed,
and the four links the chain never reaches are all in **§8**.

### 5.4 The proposal, and why it is **not** in the repository

`yarn perf:propose <scratchpad>/baselines.proposed-4e4e46f.json` was run to
prove the positive path and to obtain real ≥5-run sample counts at HEAD.
**It was written to the session scratchpad and deliberately not committed.**

The reason is the same one the refusals encode: this machine is **not** a
measurement host. Recorded load, before each run and after — 16 logical CPUs,
32,641 MB RAM; **CPU 21 %, 562 processes** before the gated run; **CPU 38 %, 556
processes** before the proposal. A proposal captured here is exactly the artifact
that must not become a budget, and a 190 KB file named `baselines.proposed…`
sitting in `docs/` is an invitation to adopt it. R2-O7's proposal at `2d51eec`
already exists in the repository for anyone who wants one; a second, worse one
is not an improvement. Its numbers are summarised in §8 and its log path is in
the scratchpad.

---

---

## 5.5 The proposal's numbers — 23 thresholds would move UP, 0 down

`yarn perf:propose <scratchpad>/baselines.proposed-4e4e46f.json` → **exit 0**,
**212 metrics**, 168 with a threshold, 44 not yet measurable.
`packages/core/perf/baselines.json` unchanged (`sha256 dad67bf4…`, `git status`
empty). The new `capture` stamp block came out as designed:

```json
"capture": {
  "sourceCommit": "4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a",
  "capturedAt": "2026-09-23T15:24:59.462Z",
  "runs": 5,
  "hardwareProfile": { "profileId": null, "platform": "win32", "arch": "x64",
                       "cpus": 16, "node": "v24.14.1" },
  "quiescenceAttestedBy": null
}
```

`profileId: null` and `quiescenceAttestedBy: null` are the honest record of a
**proposal from an undesignated, unattested host** — which is exactly why the
same numbers are refused as an in-place write.

### Sample discipline, per family (`<requirements><sample_discipline>`)

| family | metrics | samples per metric | unmeasurable after the capture |
|---|---:|---:|---:|
| `leak` | 110 | **5** | **0** |
| `size` | 22 | **5** | **0** |
| `memory` | 22 | **10** | **18 of 22** |
| `longtask` | 44 | **15** | 16 of 44 |
| `runtime` | 11 | **35** | 7 of 11 |
| `hydration` | 3 | **35** | **3 of 3** |
| | **212** | all ≥ 5 | **44** |

The two deterministic families earn a threshold for **every** metric; the three
wall-clock families lose most of theirs on this host. That split is the whole
`DZUP_PERF_GATE` argument (§7), measured rather than asserted.

### The movement, and why the refusal fired on it

```
perf:capture — threshold movement vs the committed file:
  23 up · 0 down · 179 new · 0 gone · 1 threshold lost
```

**Every one of the 22 `size` budgets would be raised**, from +4.7 % to
**+21.6 %** (`size:DzMention` 22,421 → 27,263 B), plus
`runtime:DzDataGrid:mount-1000` (+10.9 %). **Not one threshold would move
down.** Two of the raised exports (`DzColorPicker`, `DzOrderList`) are currently
*under* their thresholds — they are raised anyway, because the threshold is
derived from the new, larger median plus the 5 % floor.

**That is the entire D135 story in one line: re-capturing does not fix the 20
breached size budgets, it deletes the evidence of them.** The `raises-budget`
refusal (§4.3) fires on exactly that action.

`runtime:DzTabs:mount-10` would also **lose** its threshold to
`variance-exceeds-signal` — leaving, after a re-capture on this host, exactly
**one** gating runtime metric.

> **Caveat recorded rather than hidden:** the proposal run overlapped with this
> task's capability-matrix regeneration for part of its duration. That makes its
> timings *worse*, not better, which only strengthens the conclusion that this
> host is not a measurement host — and it is another reason the file stays in
> the scratchpad.

### What adopting this capture would silently accept — read this before capturing

| family | threshold it would earn | verdict |
|---|---|---|
| `leak` ×110 | **exactly 0**, every one | **Ready.** "Tolerance 0" falls straight out of `median 0 + max(3σ 0, 5 % 0)`; no special case was needed. Adopt and this family gates immediately, on any host. |
| `longtask:*:over-50ms` for `DzCombobox`, `DzCommandPalette`, `DzPersonaSelector` | **1.05** | **Do not adopt as-is.** These three components run a task over 50 ms *today*; a baseline of 1.05 writes "one blocked frame is the budget" into the contract. `DzCalendar` 1.46, `DzCascader` 1.46, `DzDataGrid` 1.06 do the same for occasional breaches. **6 of 22 components would have a long-task allowance baked in.** Raised as D-S1O4-6. |
| `size` ×22 | +4.7 % … +21.6 % | **Do not adopt as-is.** See D-S1O4-4. |
| `memory`, `hydration` | 18 of 22 and 3 of 3 `unmeasurable` | Adopting them records honest gaps, not budgets. Harmless, and clears nothing. |

---

## 6. Ratchet movements (old → new)

| ratchet | old | new | direction | note |
|---|---:|---:|---|---|
| Capability-matrix **stale** cells | 22 | **22** | **unchanged** | Still all `perf-baseline`. `staleCells.ceiling` **not touched** — lowering it without a capture would be raising a claim, and S1-O2's gate 7 requires the two to move together. Clearable only by D-S1O4-2. |
| Capability-matrix `unrun` / `excepted` / `pass` / `present` / `fail` | 400 / 47 / 585 / 608 / 0 | **400 / 47 / 585 / 608 / 0** | unchanged | Nothing promoted, excepted or demoted. |
| **Capability-matrix inputs stating whether they can fail CI** | **1 of 6** (`visual-baselines`) | **2 of 6** (`+perf-baselines`) | ↑ | The hook S1-O3 left, filled rather than duplicated. |
| Baseline-file schema | 1.1.0 | **1.2.0** | additive | `+capture` block. Every 1.0.0/1.1.0 file stays valid. |
| **Perf captures that can silently overwrite a budget** | **all of them** | **0** | ↓ | Four refusals, none silenceable by an environment variable. |
| `mayRatchet()` production call sites (**D132**) | **0** | **1** | ↑ | Six unit tests and no caller since P5-05. |
| NEW `metricFamiliesWithoutBaseline` ceiling | *(did not exist)* | **4** | new, one-way | `leak`, `longtask`, `memory`, `hydration`. Two-way handshake: a rise fails, a fall fails unless the ceiling drops in the same change, and a **swap at an unchanged count** fails too. |
| NEW `unmeasurableMetrics` ceiling | *(did not exist)* | **9** | new, one-way | |
| `validate:all` links | 52 | **53** | ↑ 1 | `validate:perf-baselines` inserted after `validate:visual-baselines`. **This renumbers the known pre-existing red from link 48 to link 49.** |
| Repository test files / tests | 559 / 10,716 | **560 / 10,755** | ↑ | +1 file, +39 cases — exactly `capture-environment.spec.ts`. 0 failed. |
| **Capability-matrix inputs whose CI-gating status is visible on the published evidence page** | **0 of 6** | **6 of 6** | ↑ | `inputs[].gate` existed since S1-O3 and the page rendered only `available`, so both host-locked inputs printed "Available: yes" beside a note saying they gate nothing. A `Can fail CI` column now prints `no` for `perf-baselines` and `visual-baselines` and `—` for the four that declare no gate. |
| **Perf thresholds moved** | — | **0, in either direction** | — | No threshold was raised, lowered, added or removed. |
| `staleCells.blockedOn` text (S1-O2's ceilings file) | "TASK-S1-O4 (perf recapture) / O2-D1" | "**D-S1O4-1 then D-S1O4-2** … TASK-S1-O4 ran on 2026-09-23 and confirmed it cannot clear these cells" | text only | The **ceiling is untouched at 22**. Only the pointer changed: the old text implied S1-O4 had not run, so the next reader would have looked for a task instead of a decision. |
| AT cells executed | 0 of 534 | **0 of 534** | **untouched** | An agent never fills one. |
| `maxProposedCitedFromCode` · unclassified · `maxWithoutAnatomy` · `developerLocalLanes` | 3 · 29 · 41 · 1 | **unchanged** | | |

**No ratchet was raised and no allowlist was widened to turn a gate green.** The
two new ceilings are set at the **measured** values (4 and 9), not at values
chosen to pass.

---

## 7. `DZUP_PERF_GATE` — keep it opt-in, and stop treating it as one switch

`<task>` item 5 asks two questions. Both are answered from runs, not preference.

### 7.1 Would the variance policy have suppressed the three false regressions?

**In the literal sense yes — and for a reason that should not be reassuring.**

The flakes are recorded in `perf-bench.spec.ts`'s own comment:
`runtime:DzTable:mount-1000` measured **1,344 ms and 2,392 ms within minutes**
on this machine — each capture internally consistent at **cv 0.17**, the two
disagreeing by **78 %**, because the second shared the machine with a Storybook
build.

At `4e4e46f` that metric carries **`threshold: null`,
`unmeasurable: variance-exceeds-signal`**, from a 35-sample capture at
**cv 0.26**. So it cannot false-fail — because the policy declined to gate it at
all.

Three things follow, and they are the evidence for §7.2:

1. **The margin is one percentage point.** `MEASURABLE_CV` is 0.25 and the
   capture came in at 0.26. A marginally quieter capture gives this metric a
   threshold, and then the busy run — **internally consistent at cv 0.17** —
   sails past the `cv` guard and **fails the gate**. The suppression is an
   accident of where one capture landed, not a property of the design.
2. **The `cv` guard is a within-capture statistic and the flake is a
   between-capture one.** Nothing in the policy compares two captures of the
   same metric taken in different machine states. That is the defect class, and
   no threshold formula can close it — only a declared capture host can.
3. **The scale of the suppression is total.** 9 of 11 runtime metrics carry no
   threshold, so the policy's answer to "this host is too noisy" has been to
   retire 82 % of the runtime family. That is honest, and it is also why the
   gate protects almost nothing.

### 7.2 Recommendation — **keep the flag opt-in, and split it by metric family**

Making `DZUP_PERF_GATE` default-on **today** would change the behaviour of
**2 metric observations out of 190**, so it is not worth doing. Making it
default-on **after** a capture would be actively harmful for the wall-clock
families, for the reason §7.1 gives. But leaving *every* family behind one flag
is equally wrong, because two of the six are **deterministic** and their gates
are host-independent:

| family | host-sensitive? | recommendation |
|---|---|---|
| `leak` | **no** — a listener either survives unmount or it does not; the count is an integer produced by teardown, not by the clock. Measured: 110/110 read 0 here, and a capture earns a threshold of exactly **0** for every one. | **Gate unconditionally**, the moment the family is baselined. No flag. |
| `size` | **no** — gzipped bytes are deterministic (cv 0.000 on all 22). | **Gate unconditionally**, but only together with a decision on the 20 existing breaches (D-S1O4-4), or it lands red on day one. |
| `longtask:*:over-50ms` | **partly** — the count is deterministic within a run (cv 0.00), but *whether a span crosses 50 ms* is the CPU. | Gate **only on the designated capture host**. |
| `runtime`, `memory`, `hydration`, `longtask:*:worst-span` | **yes** | **Keep behind the flag**, and read the flag as what its own doc comment already says it is: *"set it on a dedicated perf job, where the number means something"* — i.e. **a declaration that this host is the measurement host**, not a preference. |

The flag should therefore be re-defined in meaning rather than re-spelled: it is
the runtime twin of `capture-environment.json`'s `authoritative.designated`.
That keeps one concept — "am I on the measurement host" — instead of two.

Raised as **D-S1O4-5**.

---

## 8. Aggregate qualification

Every lane run **end to end**, each to its own log, each exit code read
**directly** — never through a pipe, because a pipe returns the last stage's
status and this repository has already had an aggregate report green over a
stale artifact for three packets.

| lane | before (S1-O3's end state) | after | verdict |
|---|---|---|---|
| `yarn build` | 0 | **0** | unchanged · `✓ built in 19.37s` |
| `yarn typecheck` | 0 | **0** | unchanged |
| `yarn typecheck:tooling` | 0 | **0** | unchanged |
| `yarn lint` | 0 | **0** | unchanged — inside link 3 of the final chain |
| `yarn test` | 559 files · 10,716 passed · 0 failed | **560 files · 10,755 passed · 3 skipped · 1 todo · 0 failed** | **+1 file, +39 tests — exactly `capture-environment.spec.ts`.** No pre-existing test changed state. See the flake note below. |
| `yarn validate:all` | exit 1 · 52 links · 1–47 green · **48** `validate:peers` RED · 49–52 unreached | **exit 1 · 53 links · 1–48 green · link 49 `validate:peers` RED · 50–53 unreached** | **the same single pre-existing red, one position later** because this task added link 24 |
| links 50–53, run individually | *(no measurement — D-S1O3-5)* | `validate:licenses` **0** · `validate:tree-shake` **0** · `validate:evidence-binding` **0** · `validate:deprecations` **0** | **all four measured**, applying D-S1O3-5's stopgap (B) |

The one `✗` in 443 lines of output is verbatim the known one:

```
✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared as "^0.475.0" by @dzup-ui/landing, @dzup-ui/sandbox
      lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core
```

That is open decision **D174/D175** (the icon swap). Not this task's, not
touched, not worked around. Link 48 `validate:release-policy` is green
immediately before it, which is what fixes the red at link **49**.

**`validate:all` is now 53 links.** A reader with a report that says "link 48 is
the red" is reading a stale position — recorded here because three prior handoffs
quote 48.

### 8.1 `validate:evidence-binding` is the link that matters here

Link 52 — the gate TASK-S0-O1 built — asks whether any declared input changed
**after** an artifact was stamped. This task added
`packages/core/perf/capture-environment.json` to the capability matrix's
`generatedFrom` and regenerated five artifacts. **Exit 0** is the evidence that
the sanctioned order (*ownership → quality → capability → component-meta → llms
→ docs-pages*) was followed and that nothing is now reporting over an input that
moved under it. It had to be run standalone, because link 49 stops the chain.

### 8.2 One new red, caused by this task and closed

The **second** end-to-end `validate:all` attempt **stopped at link 2
`yarn typecheck:tooling`** with two errors:

```
packages/tooling/src/docs/evidence-pages.ts(250,11): error TS2339:
  Property 'gate' does not exist on type '{ available: boolean; path: string; note?: string }'.
```

Cause: `packages/tooling/src/docs/evidence.ts` holds a **structural restatement**
of the capability-matrix input type rather than importing it, and that copy had
never learned about `inputs[].gate`. So the *generator* (run under `tsx`, which
does not typecheck) produced a correct page while the *typechecker* rejected the
code that produced it. Fixed by adding `gate` to the structural type, with a
comment saying why the copy exists.

Two things are worth recording about it:

- **That run's reading is worthless past link 2 and is not quoted.** The chain
  is `&&`; links 3–53 never executed. It was re-run **end to end** afterwards and
  only the third run is quoted above. This is the same discipline S1-O3 had to
  apply when its first chain stopped at link 33.
- **It is an instance of the defect it fixes.** A structural copy of a type is
  how `available` and `gate` came to be rendered as one fact; the copy is also
  how the type drifted. Both halves are now closed, and the comment names the
  trade-off for the next reader.

### 8.3 The `yarn test` flake, and why it is not this task's

The **first** `yarn test` run reported `exit 1` with **560 files passed, 10,755
tests passed, 0 failed** and one *unhandled error*:

```
⎯⎯ Unhandled Error ⎯⎯
Error: [vitest-worker]: Timeout calling "onTaskUpdate"
 ❯ Object.onTimeoutError node_modules/vitest/dist/chunks/rpc.-pEldfrD.js:53:10
```

That is the reporter **RPC** timing out, not an assertion. No test failed and no
file failed. Re-run on the same tree: **exit 0**, 560 files, 10,755 passed, **no
unhandled error**. So it is a load-induced flake on a 16-core workstation that
had just run a 434-second suite, and it is **not reproducible**. Both runs are
quoted rather than only the green one, because quoting only the second would be
the reporting failure this programme keeps finding.

### 8.4 One thing deliberately NOT built

S1-O2 added a `DZUP_CAPABILITY_CEILINGS` env override so its seeded-failure
proof could run at the CLI, and the same trick would have let this task prove
`wrong-host` and `raises-budget` at the CLI too, rather than only as unit cases.

**It was considered and rejected.** An environment variable that changes which
capture environment is read is an escape hatch on a **write-path refusal**, and
an escape hatch on a write-path refusal is what makes the refusal decorative —
the opposite of the property §4.3 is for. S1-O2's override is over a *gate* (a
read), where a seeded run cannot damage anything. The four refusal codes are
proved as pure functions against seeded environments (§5.1b) and the
refusal-to-write path is proved end to end at the CLI with a sha256 on both
sides (§5.1a); that is the strongest combination available without opening a
door that should not exist.

### 8.5 Two edits landed after the quoted chain, and were re-verified individually

Stated rather than hidden, because S1-O3 recorded the same ordering caveat. After
the third end-to-end `validate:all`, two **text-only** changes landed:

- the two report files in this directory, plus the `EXECUTION-STATUS.md` row and
  ratchet board;
- the `staleCells.blockedOn` **string** in
  `packages/tooling/src/validators/capability-matrix-ceilings.json` — the
  ceiling is untouched at **22**; only the pointer changed, because the old text
  read "TASK-S1-O4 (perf recapture)" and would have sent the next reader looking
  for a task instead of a decision.

Both were re-verified by the gates that own them, each exit code read directly:
`validate:doc-snippets` **0** · `validate:adr-references` **0** ·
`validate:docs-size` **0** · `validate:docs-pages` **0** ·
`validate:capability-matrix` **0** (still `22 stale cell(s) — ceiling 22`) ·
`validate:perf-baselines` **0**. `capability-matrix-ceilings.json` is read by
`validate:capability-matrix` alone and is not a declared input of
`validate:evidence-binding`, so no artifact binding moved under it.

### 8.6 Maturity level reached

Per `<evidence_rules>`, this task reaches **aggregate-qualified** and no further.

- **specified → implemented → focused-validated → aggregate-qualified** ✔
- **browser/AT-qualified** — not applicable: nothing here runs a browser, and
  three of the eight doc-06 scenarios *require* one, which is the audit's
  finding rather than this task's omission.
- **packaged / released** — not reached, not attempted.
- The `leak`, `longtask`, `memory` and `hydration` lanes remain
  **focused-validated only**: they run green and have nothing to compare
  against. Promoting them is D-S1O4-2.
- **AT cells remain 0 of 534, untouched.**

Everything above is **locally qualified**: measured on one contended machine, on
a 234-path dirty worktree, never in CI. It is not CI, release or production
evidence.

---

## 9. Owner decisions raised

### D-S1O4-1 🔴 — Designate the authoritative perf capture host

*Nothing else in this file can move until this is answered.* It is the perf twin
of S1-O3's `scope.authoritativePlatform`, and today
`packages/core/perf/capture-environment.json` says `designated: false`, so
**every in-place capture is refused**. The three candidates are in that file
with their pros and cons; repeated here with the measurement behind each.

| option | cost | result |
|---|---|---|
| **A — `linux-x64-dedicated` (recommended)** | provision one dedicated/self-hosted linux runner with no co-tenant workload | The only option under which a `runtime`, `leak`, `longtask`, `memory` or `hydration` threshold can be **both trustworthy and able to fail CI**. Matches the platform all 18 CI jobs already run on, so a captured threshold is comparable with what CI would measure. |
| B — `win32-x64-16c-node24` | zero — all 33 committed baselines are already on it | A like-for-like re-capture, no platform migration. But **no CI runner is win32**, so a threshold captured here can never fail a CI run — the exact trap S1-O3 found in the visual lane — and it keeps the measurement on a shared developer machine, which `DZUP_PERF_GATE`'s own doc comment says makes the number meaningless. |
| C — `linux-x64-ci` (`ubuntu-latest`), **scoped to `size` only** | zero | `size` is deterministic, so a shared runner measures it exactly. Adopting it for the timing families would bake GitHub-runner variance into 11 runtime and 179 lane thresholds. Legitimate as a *partial* designation; wrong as a whole one. |

**Recommendation: A, with C as the interim for `size` alone.** C can land this
week and makes the 22 deterministic budgets gateable; A is what the other five
families need and is a provisioning decision, not a code one.

### D-S1O4-2 🔴 — Adopt a capture, clear the 22 stale cells, and lower three ceilings in the same change

This is **O2-D1 executed**, and it is the only thing that moves
`capability stale` off 22. It requires D-S1O4-1 first, and it requires D-S1O4-4
and D-S1O4-6 to be decided *before* the capture, not after — see §5.5 for what
adopting today's numbers would silently accept.

- (a) **Capture on the designated host, triage the breaches first, then adopt** —
  22 stale cells resolve, 4 metric families gain baselines, `leak` becomes a
  real gate. Requires lowering `staleCells.ceiling` 22 → 0 **and**
  `metricFamiliesWithoutBaseline.ceiling` 4 → 0 in the same change; both gates
  refuse the drop otherwise, by design.
- (b) Adopt only the four **new lane** families, leaving `size`/`runtime`
  untouched — the four lanes become gateable, **but the 22 cells stay stale**,
  because staleness is a property of the existing `size`/`runtime` metrics.
- (c) Accept 22 stale indefinitely and relabel the perf evidence as historical.
- **Recommend (a).** (b) is a legitimate half-step that costs nothing and
  unlocks the `leak` gate; it is worth doing *first* if (a) is blocked on
  provisioning. (c) leaves 22 cells reporting a result measured against source
  that has changed three times since.

### D-S1O4-3 🟠 — No CI workflow runs the perf harness at all

`grep -rn 'test:perf\|perf:capture' .github/` returns **nothing**. The
`landing-perf` job is Lighthouse on the marketing site, a different measurement
entirely. So every threshold in this repository — present, past and future — is
unreachable by CI.

- (a) **Add a `perf` job on the designated host** running
  `DZUP_PERF_GATE=1 yarn test:perf` (recommended).
- (b) Start with the deterministic families only: a job that asserts `size` and
  `leak`, which need no special host.
- (c) Leave it local.
- **Recommend (b) then (a).** (b) is runnable on `ubuntu-latest` today and turns
  132 metrics into real gates; (a) needs D-S1O4-1. (c) is how the visual lane
  became unowned the first time.

### D-S1O4-4 🔴 — 20 of 22 export-size budgets are breached, and a re-capture would raise all 22

Inherited as **D135**, re-measured at `4e4e46f` (§3.2) and re-confirmed by the
proposal (§5.5). `size:DzMention` is **+15.8 %** over its threshold; a fresh
capture would raise that threshold **+21.6 %**.

- (a) **Triage the growth before any capture** (recommended). Six exports are
  over +6 %; start there. Each is a fixture importing one symbol, so the
  regression is localisable.
- (b) Accept the growth with **a recorded user benefit and a named owner**, per
  doc 06, using `--raise-budget --owner --reason`. The tooling now requires all
  three, and records them in the `capture` block.
- (c) Retire the per-export size budgets.
- **Recommend (a).** (b) is legitimate *if* the growth is bought something —
  doc 06's point is that the benefit must be written down, not that a raise is
  forbidden. (c) throws away the only measurement that answers "what does
  importing `DzDataGrid` cost me".

### D-S1O4-5 🟠 — `DZUP_PERF_GATE` should be split by metric family

Full evidence in §7. In one line: the flag today gates **2 metric observations
out of 190**, and two of the six families are deterministic and do not need a
host declaration at all.

- (a) **Gate `leak` and `size` unconditionally; keep the wall-clock families
  behind the flag; gate `longtask:over-50ms` only on the designated host**
  (recommended).
- (b) Leave the flag as one global switch, opt-in.
- (c) Make the flag default-on.
- **Recommend (a).** (c) today is a no-op affecting 2 metrics, and after a
  capture it turns 44 `unmeasurable` metrics plus every wall-clock threshold
  into a flake source on developer machines.

### D-S1O4-6 🟠 — Three components breach the 50 ms responsiveness budget, and a capture would legalise it

Measured here: `DzCombobox`, `DzCommandPalette` and `DzPersonaSelector` each run
**one synchronous task over 50 ms** during their scripted interaction, median 1,
**cv 0.00**. Under the standing formula a capture gives them
`longtask:*:over-50ms` a threshold of **1.05** — i.e. it writes "one blocked
frame is the budget" into the contract. `DzCalendar` (1.46), `DzCascader` (1.46)
and `DzDataGrid` (1.06) get the same for occasional breaches: **6 of 22
components would carry a long-task allowance.**

- (a) **File the three as defects and fix them before the capture**
  (recommended) — then the baseline is 0 for all 22, exactly as `leak` already
  is.
- (b) Capture as-is and record the six allowances as accepted, with a reason
  each.
- (c) Raise `LONG_TASK_MS` above 50. **Not recommended and named only to reject
  it** — 50 ms is the responsiveness budget, not a tuning knob.
- **Recommend (a).** This is the one place where capturing first destroys the
  evidence that the capture was premature.

### Findings filed, not fixed (per `<stop_conditions>`)

- **F1 — the perf harness runs nowhere in CI.** Covered by D-S1O4-3; recorded
  separately because a reader of `capability-matrix.json` would otherwise assume
  `perf-baseline: pass` means something gated.
- **F2 — the committed baselines predate the harness-identity block (D90).**
  Every lane run prints `harness unrecorded`. Even the 24 thresholds that exist
  cannot be attributed to an instrument. Resolves itself on the next capture.
- **F3 — no component failure was produced by any lane this task ran.** 85
  gated tests, 0 failed; `leak` 0 growth on 110 metrics; capability `fail` cells
  0 → 0. The two component-level findings above (20 size breaches, 3 long-task
  breaches) came from *comparison against recorded budgets*, not from a red test
  — which is precisely the gap D-S1O4-3 and D-S1O4-5 exist to close.

---

## 10. The owner's capture command, in one place

Everything this task could not do. **Two owner acts, in this order** — the
second is refused until the first lands.

```bash
# ── STEP 0. Decide D-S1O4-4 and D-S1O4-6 FIRST. ──────────────────────────────
# Capturing before they are decided bakes 20 raised size budgets and 6 long-task
# allowances into the contract, and the ratchet is downward-only, so undoing it
# needs another owner decision. §5.5 has the exact numbers.

# ── STEP 1. Designate the host (an owner edit, not a command). ───────────────
# packages/core/perf/capture-environment.json:
#   authoritative.designated  -> true
#   authoritative.profileId   -> "linux-x64-dedicated"   (D-S1O4-1 option A)
# Then confirm the repository still agrees with itself:
yarn validate:perf-baselines          # expect exit 0; a designation that no
                                      # committed baseline is on fails here by
                                      # design ("gate-claim")

# ── STEP 2. Capture, ON that host, with nothing else running. ───────────────
yarn generate:quality-matrix          # the capture reads it for tiers
yarn perf:capture --quiet-host-attested-by "<your name>"

#   • 5 process runs by default; add `--runs 9` for a tighter band.
#   • It will REFUSE if this machine is not the declared profile, if the
#     attestation is missing, or if ANY threshold would move up. The refusal
#     arrives in about a second for the first two; the third arrives after the
#     capture and still writes nothing.
#   • If a raise is genuinely bought something, and only then:
#       yarn perf:capture --quiet-host-attested-by "<name>" \
#         --raise-budget --owner "<name>" --reason "<the user benefit>"
#     All three flags are required together and all three are recorded in the
#     file's `capture` block.

# ── STEP 3. Lower the ceilings in the SAME change. Three gates refuse otherwise.
#   packages/tooling/src/validators/capability-matrix-ceilings.json
#       staleCells.ceiling                        22 -> 0
#   packages/tooling/src/validators/perf-baselines-ceilings.json
#       metricFamiliesWithoutBaseline.ceiling      4 -> 0   (families -> [])
#       unmeasurableMetrics.ceiling                9 -> <the new count>

# ── STEP 4. Finish the sanctioned regeneration order and prove it. ──────────
yarn generate:capability-matrix && yarn generate:component-meta \
  && yarn generate:llms && yarn generate:docs-pages
yarn validate:perf-baselines && yarn validate:capability-matrix && yarn validate:all
DZUP_PERF_GATE=1 yarn test:perf
```

**Which host?** `linux-x64-dedicated` if D-S1O4-1 resolves to A. If it resolves
to C (size-only on `ubuntu-latest`), capture with `--skip-lanes` so the
wall-clock families are not written from a shared runner, and leave their
`metricFamiliesWithoutBaseline` entries in place rather than lowering that
ceiling.

**What NOT to do.** Do not run `yarn perf:capture` on a developer workstation to
"clear the 22 stale cells". It will be refused, and if the refusals were removed
it would raise 23 budgets, retire one of the two remaining runtime gates, and
legalise six long-task breaches — a strictly worse contract with a green matrix.

---

## 11. Ranked next packet

1. **D-S1O4-2 option (b) — adopt the four lane families only.** 🔴 The cheapest
   real win in the whole performance contract: it needs no host designation
   (the `leak` family is host-independent and earns a threshold of exactly 0 on
   any machine), it turns 110 leak metrics into a real gate, and it drops
   `metricFamiliesWithoutBaseline` 4 → 0. It does **not** clear the 22 stale
   cells, and saying so plainly is the point.
2. **D-S1O4-1 — designate the capture host.** 🔴 Everything else in this file
   is downstream of it.
3. **D-S1O4-4 — triage the 20 breached size budgets.** 🔴 Independent of the
   host question (size is deterministic), and it must be settled *before* any
   capture or the evidence of it is deleted.
4. **TASK-S3-O3** — see §12. Nothing here blocks it.
5. **TASK-S1-O4-a … -i** — the nine scenario-gap tasks, each named and sized in
   [`TASK-S1-O4-scenario-audit.md`](./TASK-S1-O4-scenario-audit.md) §4.
   `-h` (optional-engine load) is the only *absent* scenario; the rest are
   partial.

### 12. Nothing here blocks the next tasks

- **Worktree:** all work is **uncommitted**, as required. The 225 paths the six
  prior tasks created were preserved untouched; this task's changes add to them.
  No commit, push, CI dispatch, publish, deployment or baseline replacement was
  performed.
- **`packages/core/perf/baselines.json` was never written.** Proven by sha256
  before and after every command, and by an empty
  `git status --porcelain` on that path at the end of the task.
- **S1-O2's and S1-O3's gates are intact.** `validate:capability-matrix` exits 0
  and still reports `22 stale cell(s) — ceiling 22, blocked on TASK-S1-O4 /
  owner decision O2-D1`; `validate:visual-baselines` is untouched; the
  `developerLocalLanes` ceiling is unchanged at 1.
- **One thing TASK-S3-O3 must know:** `validate:all` is now **53 links**, not
  52, and the known pre-existing red (`validate:peers`, D174/D175) is at
  **link 49**, not 48. Any report quoting "link 48" against this tree is
  quoting a stale position.
