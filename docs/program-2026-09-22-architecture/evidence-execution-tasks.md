# dzup-ui — Evidence-execution tasks (S1)

> Part of the [Architecture Review Program 2026-09-22](./README.md). Every
> prompt assumes the `<repo_conventions>` block in [README §5](./README.md#5-how-these-tasks-are-written)
> and the check-first protocol in [README §4](./README.md#4-how-to-run-a-task--the-check-first-protocol).
>
> **Sources:** 08-11 reassessment doc 06 (the tier A–D evidence model, the
> automation-versus-manual split, the four-platform AT pairing table, the
> performance and reliability contract) and doc 08 (the browser and
> accessibility matrix by tier); 08-28 roadmap N1-O1…O6 and its exit condition
> ("both capability matrices show zero unexplained `unrun` in Tier C/D"); the
> 2026-09-04 R2 handoffs, whose four `[~]` rows are the whole of this file.
> Every number below is bound to `main` @ `589be13` — re-measure before quoting.
>
> **The rule that governs this file:** the machinery exists. Run it, capture
> what it produces, and leave the cells it cannot fill visibly empty. A task
> that finds itself designing a second harness has drifted — stop and re-read
> the one that exists. **An agent never fills a manual AT result cell**; a
> fabricated row is worse than an empty one, and the tier model's whole value
> is that an empty cell is readable as empty.
>
> **Ordering:** S1-O2 and S1-O4 after TASK-S0-O1 (nothing re-runs against a
> tree whose artifacts stamp the wrong commit). S1-O1's phase 1 is independent
> and can start immediately; its phase 2 is a human's. S1-O3 is independent.

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[x] found-done` · `[!]` blocked on owner decision
> **Priority:** 🔴 · 🟠 · 🟢

---

## 🟠 The evidence only a person can produce

### [ ] TASK-S1-O1 — AT matrix wave 1: prepare, schedule, ingest 🟠 `[!owner tester + cadence]`

_Gap: **534 AT cells, 0 executed** — verified at `589be13` by counting the
`unrun` markers across the 89 files in `e2e/at-matrix/`, not by reading a
ledger. This has been the headline honest gap since P5-04 generated the
scaffold in 2026-08, and it has not moved because it cannot: 08-11 doc 06 is
explicit that automation covers semantics, axe, contrast, DOM relationships,
keyboard state machines, focus order, forced colours and reduced motion, while
**task-based manual evidence is required for Tier B/C/D** across four platform
pairings (NVDA+Firefox / NVDA+Chrome, VoiceOver+Safari, TalkBack+Chrome,
forced-colours Edge). The 2026-09-04 R2-O2 packet fixed the scaffold defects
that would have falsified the first results — `CellState` gained `fail` so an
all-`fail` run no longer publishes `pass`; pairings became tier-differentiated;
`DzSidebar`'s APG declaration and `DzCommandPalette`'s task set were corrected;
`validate:at-scripts` was chained — and produced a wave-1 runbook. What remains
is a named tester, a cadence, and the ingestion path for the records they
produce. Sources: 08-11 doc 06 §"Automation versus manual evidence" and doc 08
§"Browser and accessibility matrix"; 08-28 doc 06 N1-O4;
`../program-2026-09-04/reports/TASK-R2-O2-handoff.md`,
`TASK-R2-O2-wave-1-runbook.md`, `at-pairing-decision-packet.md`._

```xml
<role>You are an accessibility evidence engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You prepare the matrix so that a person's run is recorded truthfully and mechanically, and you ingest what they produce. You never fill a result cell.</role>

<task>Phase 1 (agent, do now): verify the R2-O2 scaffold fixes still hold at HEAD by seeding a regression for each — an all-`fail` run must resolve to `fail`, a Tier D component must not inherit only Tier B obligations, `validate:at-scripts` must be a live link. Then build the **ingestion path**: a documented record format, a `yarn at:ingest <record>` lane that validates a submitted run record against the schema and appends it (append-only, never overwriting), and a regeneration step that flows the new cells into the AT matrix and the capability matrix. Prove the whole path end to end with a **clearly marked synthetic fixture stored outside `e2e/at-matrix/`**, then delete the synthetic cells. Phase 2 (`[!owner]`): deliver the scheduling packet — wave 1 is the 22 Tier C/D components × 2 pairings = 44 cells ≈ 21 h; state the three honest options for the 1.0 accessibility claim (narrow the claim to Tier A/B · narrow the pair set · move full AT coverage post-1.0) with what each option costs and what it forfeits. Phase 3 (after a named tester runs): ingest the records, regenerate, and file every defect the run found as a task with the cell that produced it.</task>

<motivation>The 08-28 benchmark found that almost no Vue library publishes screen-reader evidence at all, and that the European Accessibility Act has made that evidence a procurement gate. dzup-ui has already built more AT machinery than its competitors and published none of it, because the last mile is a human with NVDA and twenty-one hours. The ingestion path is what makes those hours count permanently rather than expiring into a chat log — and building it before the tester is booked means their time goes entirely into running, not into formatting.</motivation>

<done_check>
  Run from ui/dzup-ui. Phase 1 and phase 3 have separate checks; a passing phase-1 check does not close the task.
  - `grep -rho '| unrun |' e2e/at-matrix/*.md | wc -l` → **534** means nothing has been executed. Any lower number means records exist: read them before doing anything.
  - `node -e "console.log(Object.keys(require('./package.json').scripts).filter(k=>k.includes('at:')).join(','))"` → an `at:ingest`-shaped lane exists.
  - `npx tsx packages/tooling/src/validators/at-scripts.ts; echo "exit $?"` → 0, and `validate:at-scripts` appears in the `validate:all` chain.
  - `ls docs/program-2026-09-22-architecture/reports/TASK-S1-O1-wave-1-schedule.md` → the scheduling packet exists with the three 1.0 options costed.
</done_check>

<discovery>
  1. Read `TASK-R2-O2-handoff.md`, `TASK-R2-O2-wave-1-runbook.md` and `at-pairing-decision-packet.md` in full. The pairing decision and the runbook are done; do not re-derive them.
  2. Read `packages/tooling/src/quality/at-matrix.ts` and `packages/tooling/src/validators/at-matrix.ts` — the resolver and the gate. Confirm by seeded regression that `CellState` includes `fail` and that an all-`fail` run resolves to `fail`, because that defect once published `pass` and is the single most damaging way this matrix can lie.
  3. Read one AT script from `e2e/at-matrix/` end to end (pick a Tier D component) and time yourself reading it. If a tester cannot follow it without repo context, the runbook needs a preamble — that is part of phase 1.
  4. Check whether any run record has already been submitted anywhere (`git log -- e2e/at-matrix/`); if one has, phase 3 is the live phase.
</discovery>

<requirements>
  <never_fill>An agent never writes a result into an AT cell, not even a placeholder, not even in a branch. The synthetic end-to-end proof lives outside `e2e/at-matrix/` and is deleted before the handoff.</never_fill>
  <append_only>Run records are append-only and carry tester, assistive technology + version, browser + version, OS, date, component, task id, per-step result and free-text observation. Ingestion never rewrites an existing record; a correction is a new record that supersedes by date.</append_only>
  <tier_obligations>Tier D obligations ⊇ Tier C ⊇ Tier B. Verify this by seeding a Tier D component with only Tier B tasks and asserting the gate fires.</tier_obligations>
  <honest_absence>After ingestion, the capability matrix must show executed cells as executed and everything else as `unrun` — never as `n/a`, never aggregated into a percentage.</honest_absence>
  <example>
    Run record shape (e2e/at-matrix/runs/&lt;component&gt;-&lt;pair&gt;-&lt;date&gt;.json):
    { "component": "DzFileUpload", "tier": "D", "pair": "nvda-firefox",
      "at": "NVDA 2026.2", "browser": "Firefox 141.0", "os": "Windows 11 26200",
      "tester": "&lt;name&gt;", "date": "2026-10-01",
      "steps": [ { "id": "t3", "expected": "announces file count and total size", "result": "fail",
                   "observed": "announces count only" } ],
      "verdict": "fail", "defects": ["D-AT-001"] }
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; seed and prove the three R2-O2 fixes still hold at HEAD.
  2. Write the record schema; implement `at:ingest` with schema validation, append-only semantics and a clear refusal on a malformed record.
  3. Prove the end-to-end path with the synthetic fixture (outside the matrix); regenerate the AT and capability matrices; confirm the cells moved; delete the synthetic.
  4. Write the scheduling packet: wave-1 component list, per-component time estimate, environment requirements, and the three 1.0 options with costs.
  5. Hand off. Phase 3 begins only when a named tester has produced records.
</steps>

<validation>
  npx tsx packages/tooling/src/validators/at-matrix.ts; echo "exit $?"
  npx tsx packages/tooling/src/validators/at-scripts.ts; echo "exit $?"
  yarn test packages/tooling/src/quality packages/tooling/src/validators; echo "exit $?"
  yarn generate:capability-matrix && npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"
  grep -rho '| unrun |' e2e/at-matrix/*.md | wc -l    # must still be 534 after phase 1
</validation>

<success_criteria>The three scaffold fixes re-proved by seeded regression at HEAD; `at:ingest` implemented with schema validation and append-only semantics, proved end to end and the synthetic removed; AT executed count unchanged at 534 `unrun` after phase 1; scheduling packet delivered with wave-1 list, hours and the three costed 1.0 options; no result cell written by an agent.</success_criteria>

<stop_conditions>Stop and report when a seeded regression shows a resolver defect has returned (fix it, and say which commit reintroduced it); when the runbook cannot be followed without repo knowledge (write the preamble, then stop for review); when phase 3 has no records to ingest — that is the expected state and the task ends `[!]` on a named tester, not `[ ]`.</stop_conditions>
```

---

## 🔴 Close the cells the machinery can fill

### [ ] TASK-S1-O2 — Capability-matrix close-out: 37 stale → 0, 441 unrun triaged 🔴 (after S0-O1)

_Gap: at `589be13` the generated capability matrix holds **37 stale** cells
(Tier B 10 · Tier C 26 · Tier D 1) and **441 unrun** cells (Tier A 65 · B 275 ·
C 100 · D 1) against 0 failures and 17 declared exceptions. The 08-28 roadmap's
N1 exit condition is "both capability matrices show **zero unexplained `unrun`
in Tier C/D**" — Tier C alone is 126 cells away from that, and a stale cell is
worse than an unrun one because it reports a result measured against source
that has since changed. The 08-11 quality spec's rule is the governing one: a
"not applicable" needs a reason and is not an empty checkbox. Nobody has ever
triaged the 441: some are genuinely not applicable, some need a lane that
exists and has not been pointed at them, and some need a lane that does not
exist. Until that split is written down, the number is uninterpretable.
Sources: 08-11 doc 06 §"Quality model" and doc 08; 08-28 doc 06 N1 exit
summary, doc 02 §3 (ratchets); `../program-2026-09-04/reports/TASK-R2-O1-handoff.md`._

```xml
<role>You are an evidence engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You run lanes that exist and classify what they cannot reach. You never mark a cell `n/a` without a reason, and you never delete a column to make a total look better.</role>

<task>Drive the capability matrix to a defensible state. (1) Eliminate the 37 stale cells: for each, identify the input that moved, re-run the owning lane, and re-generate — a stale cell that cannot be re-run becomes `unrun` with the reason, never `pass`. (2) Triage all 441 unrun cells into exactly three buckets with a written rule per bucket: **runnable-now** (a lane exists and simply has not been pointed at this component), **needs-a-lane** (no harness covers it — file one task per missing lane), and **not-applicable** (with the 08-11-compliant reason recorded in the exceptions file, not in the generator). (3) Execute the runnable-now bucket and re-measure. (4) Add a **staleness gate**: the validator already detects stale cells; make it fail when the stale count rises, and record the current value as the ratchet. (5) Publish a one-page matrix-state report: totals before and after, the three-bucket split with counts, the Tier C/D distance to the N1 exit condition, and the ranked list of missing lanes.</task>

<motivation>The capability matrix is the artifact the 08-28 reassessment holds up as the thing no competitor has — 144 rows of per-component evidence generated from four declared inputs. Its credibility rests entirely on the honesty of its empty cells. Right now 478 of them are uninterpretable: a reader cannot tell whether an unrun cell means "we have not got to it", "no harness exists" or "this does not apply". Splitting them is a day's work and converts the matrix from an impressive artifact into a usable plan.</motivation>

<done_check>
  Run from ui/dzup-ui. Requires TASK-S0-O1 to have bound the artifacts to HEAD.
  - `node -e "const c=require('./packages/core/docs/capability-matrix.json');const t=c.totals;const s=Object.values(t).reduce((a,x)=>a+x.stale,0);console.log('stale',s);process.exit(s===0?0:1)"` → 0.
  - `node -e "const c=require('./packages/core/docs/capability-matrix.json');const t=c.totals;console.log('C unrun',t.C.unrun,'D unrun',t.D.unrun)"` → every remaining Tier C/D unrun cell appears in the exceptions file with a reason.
  - `npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"` → 0, and the validator refuses a seeded stale-count increase.
  - `ls docs/program-2026-09-22-architecture/reports/TASK-S1-O2-matrix-state.md` → the three-bucket report exists with counts.
</done_check>

<discovery>
  1. Read the capability-matrix generator and its four declared inputs (`inputs` in the JSON names them). For each of the 37 stale cells, the generator can tell you which input's hash moved — extract that mapping first; it decides how much re-running is actually needed.
  2. Read the exceptions file format and the 17 existing exceptions. Your `not-applicable` bucket extends this file, with the same shape and the same reason discipline.
  3. Group the 441 unrun cells by column, not by component. Columns cluster: a whole column unrun usually means a missing lane, while scattered cells usually mean a lane that was not pointed at those components.
  4. Read `TASK-R2-O1-handoff.md` for what the browser sweeps already covered — do not re-run 24 Playwright projects to fill a cell an existing record can fill.
</discovery>

<requirements>
  <no_promotion>A cell only becomes `pass` from an actual run at the current commit. Re-labelling, inheriting from a sibling component, or copying from an earlier dirty run are all refused.</no_promotion>
  <reasons>Every `not-applicable` carries a reason of the 08-11 kind: what the column measures and why this component cannot exhibit it. "Not relevant" is not a reason.</reasons>
  <one_task_per_lane>Each `needs-a-lane` cluster becomes exactly one proposed task with the column, the component count, and an estimate — not one task per cell.</one_task_per_lane>
  <ratchet>Stale count ratchets to 0 and may never rise; unrun counts are recorded per tier per column as the new baseline. Prove the gate fires with a seeded increase.</ratchet>
  <example>
    Three-bucket report shape:

    | Column | Tier | unrun | runnable-now | needs-a-lane | not-applicable | Proposed task |
    |---|---|---:|---:|---:|---:|---|
    | manual-at | C | 84 | 0 | 0 | 0 | TASK-S1-O1 (human) |
    | perf-budget | B | 61 | 12 | 49 | 0 | TASK-S1-O4 extends the lane to Tier B |
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; publish the stale-cell → moved-input mapping.
  2. Re-run the owning lanes for the stale cells; regenerate; confirm stale = 0 or record why a cell became `unrun` instead.
  3. Triage the 441 by column into the three buckets; write the exceptions entries for the `not-applicable` bucket.
  4. Execute the runnable-now bucket; regenerate; re-measure.
  5. Add the staleness ratchet gate + seeded-increase spec; chain it if it is not already.
  6. Write the matrix-state report and hand off with the ranked missing-lane list.
</steps>

<validation>
  yarn generate:capability-matrix > /tmp/s1o2-gen.log 2>&1; echo "exit $?"
  npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"
  yarn test packages/tooling/src/validators; echo "exit $?"
  node -e "const c=require('./packages/core/docs/capability-matrix.json');console.log(JSON.stringify(c.totals,null,1))"
  yarn validate:all > /tmp/s1o2-validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>Stale cells 37 → 0 with every transition explained; all 441 unrun cells assigned to one of three buckets with a written rule; `not-applicable` entries carry 08-11-compliant reasons in the exceptions file; runnable-now bucket executed and re-measured; staleness ratchet gate proven by seeded increase; matrix-state report published with the Tier C/D distance to the N1 exit condition and a ranked missing-lane list.</success_criteria>

<stop_conditions>Stop and report when a stale cell's owning lane needs hardware or a platform the machine does not have (record `unrun — needs &lt;platform&gt;`, route to S1-O3); when triage would require deciding that a whole column does not apply to a tier (that is a quality-model change — raise it as a decision); when a re-run surfaces a component failure (file it, do not fix it here).</stop_conditions>
```

---

## 🟢 Capture what the lanes cannot capture here

### [ ] TASK-S1-O3 — Visual-regression capture on the authoritative platform, and the CI gate 🟢

_Gap: the visual lane is built (`e2e/visual/`, committed baselines, a pilot run
of 24/24) but it is **stopped on a measured platform blocker**: the committed
baselines were captured on `linux` while the pilot runs on `win32`, and a
baseline is not transferable between platforms — font rasterisation and
scrollbar metrics differ enough to fail every comparison. The 2026-09-04 R2-O6
packet completed every platform-independent deliverable and stopped there,
honestly, rather than committing baselines that would be wrong for whoever runs
next. 08-28 doc 05 lists "visual regression scope/workflow unowned" as gap 4,
and the 08-11 per-change matrix requires a visual pilot for the tokens /
recipes / parts change class. The decision this needs is small — which platform
is authoritative — and the engineering after it is mechanical. Sources: 08-11
doc 08 §"Per-change validation matrix" (tokens row); 08-28 doc 05 §C gap 4,
doc 06 N1-O6; `../program-2026-09-04/reports/TASK-R2-O6-handoff.md`,
`TASK-R2-O6-evidence-kind-proposal.md`, `TASK-R2-O6-chromatic-finish-or-retire.md`._

```xml
<role>You are a visual-testing engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You make the baselines reproducible on one declared platform, and you make a mismatch loud.</role>

<task>Finish the visual lane. (1) Decide and record the authoritative capture platform from the evidence R2-O6 already assembled — the decision is "which platform will the gate run on", and the answer must match whatever runner the repository will realistically use. (2) Make the platform explicit in the harness: baselines live under a platform-keyed directory, and a comparison on a different platform **fails with a clear message** rather than producing hundreds of diffs. (3) Re-capture the baselines on the authoritative platform for the declared scope. (4) Decide and implement the scope: per-component for Tier B+ is the 08-11 default, but a surface-level scope is acceptable if written down with what it gives up. (5) Wire the visual result into the capability matrix as its declared fifth input so a visual cell is evidence, not a side artifact. (6) Add the review workflow: what a reviewer sees when a baseline changes, how an intentional change is accepted, and who may accept it.</task>

<motivation>08-28 doc 05 names this gap precisely: the lane exists as two specs with committed snapshots and no scope, no review workflow and no owner. The cost of leaving it there is that every token, recipe or parts change ships with no visual evidence at all, which is the one change class where unit tests are structurally blind. The platform decision is what unlocks it, and R2-O6 already did the work of proving why it must be made explicitly.</motivation>

<done_check>
  Run from ui/dzup-ui.
  - `ls e2e/visual/__screenshots__/ 2>/dev/null | head` or the equivalent baseline directory → baselines are stored under a **platform-keyed** path.
  - `grep -rn 'process.platform' e2e/visual/ | head -3` → the harness reads the running platform and compares it against the declared authoritative one.
  - `yarn test:e2e:visual > /tmp/vis.log 2>&1; echo "exit $?"` → 0 on the authoritative platform, or a single clear refusal naming the platform mismatch on any other.
  - `node -e "const c=require('./packages/core/docs/capability-matrix.json');console.log(Object.keys(c.inputs))"` → a visual input is declared.
</done_check>

<discovery>
  1. Read `TASK-R2-O6-handoff.md`, the evidence-kind proposal and the finish-or-retire memo. The platform finding, the scope options and the Chromatic-versus-self-hosted analysis are all done.
  2. Determine the realistic runner: read the workflow files and check whether any CI runner is configured at all. A baseline captured for a runner that will never exist is waste — if there is no runner, the authoritative platform is the maintainer's, stated as such.
  3. Inventory the current baselines: how many, captured when, on what. Any baseline whose platform is unknown is discarded, not migrated.
  4. Read how the capability matrix declares its inputs so the visual input follows the existing pattern.
</discovery>

<requirements>
  <one_platform>Exactly one authoritative platform. Cross-platform baselines are not attempted — that is a known-unsolvable problem at this scale and the 08-11 spec does not ask for it.</one_platform>
  <loud_mismatch>A run on a non-authoritative platform produces one refusal naming both platforms, not a diff storm. Prove it by running on the wrong platform deliberately.</loud_mismatch>
  <scope_written>The chosen scope (per-component Tier B+ or surface-level) is recorded with what it does not cover. An unwritten scope is how this lane became unowned the first time.</scope_written>
  <review_workflow>Documented: what a reviewer sees, how an intentional change is accepted, who may accept, and where the acceptance is recorded. Baseline replacement stays an owner action.</review_workflow>
  <example>
    Baseline path shape: `e2e/visual/__screenshots__/&lt;platform&gt;/&lt;project&gt;/&lt;test&gt;-&lt;n&gt;.png`
    Refusal message shape: `visual: baselines are authoritative on "linux"; this run is on "win32". Re-run on linux, or re-declare the authoritative platform in e2e/visual/platform.json (owner action).`
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; record the authoritative-platform decision with its reason.
  2. Implement platform keying + the loud mismatch refusal; prove the refusal by running on the wrong platform.
  3. Discard unknown-platform baselines; re-capture for the declared scope on the authoritative platform.
  4. Declare the visual input in the capability matrix generator; regenerate; confirm the cells populate.
  5. Write the review workflow; hand off with baseline counts, scope, and what the scope excludes.
</steps>

<validation>
  yarn test:e2e:visual > /tmp/s1o3-visual.log 2>&1; echo "exit $?"
  yarn generate:capability-matrix && npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"
  npx tsx packages/tooling/src/validators/visual-baselines.ts; echo "exit $?"
  yarn validate:all > /tmp/s1o3-validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>Authoritative platform decided and recorded with a reason; baselines platform-keyed; a wrong-platform run produces exactly one refusal (proved); baselines re-captured for the declared scope; visual declared as a capability-matrix input and its cells populated; review workflow documented with the acceptance authority named.</success_criteria>

<stop_conditions>Stop and report when the realistic runner cannot be determined (deliver the keying and the refusal, leave the capture blocked on the decision); when re-capture would produce more baseline bytes than the repository should carry (propose the surface-level scope with numbers); when a diff reveals a genuine visual regression (file it as a defect with the screenshot).</stop_conditions>
```

---

### [ ] TASK-S1-O4 — Performance contract: stale cells → 0, leak / long-task / memory captured 🟢 (after S0-O1)

_Gap: 08-11 doc 06 §"Performance and reliability contract" specifies eight
measured scenarios — per-entry gzip/brotli and retained-module size; Core-only
and Core-plus-one-optional-peer startup and hydration; Tier C dataset scenarios
(mount, first usable render, scroll, selection/edit, filter/sort, layout,
teardown); p50/p95 interaction latency and peak/retained memory; long-task
count and animation-frame stability; optional-engine load separated from
wrapper overhead; and no listener/observer/portal leakage after repeated
mount/unmount. The variance policy that makes any of this a gate rather than a
number was solved properly in P5-05 (median + max(3σ, 5 %), ≥5 runs, downward
ratchet, 35 samples per metric) and 08-28 doc 01 §A6 directs both repos to
adopt it verbatim rather than reinvent it. The 2026-09-04 R2-O7 packet built
all four remaining lanes (leak, long-task, memory, hydration) and captured
them, but left one residual it could not close: the perf cells in the
capability matrix are **stale**, because the baselines carry no `sourceCommit`
and the runtime gate is opt-in behind `DZUP_PERF_GATE` after three false
regressions. Sources: 08-11 doc 06 §"Performance and reliability contract";
08-28 doc 01 §A6, doc 02 §3; `../program-2026-09-04/reports/TASK-R2-O7-handoff.md`._

```xml
<role>You are a performance engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-22-architecture/README.md §5. You measure on a quiet machine, you bind measurements to a commit, and you never widen a threshold to make a lane pass.</role>

<task>Close the performance contract. (1) Give `packages/core/perf/baselines.json` a `sourceCommit`, a hardware profile and a capture date through its generator — hand-editing the JSON is refused — so a perf cell can be bound like every other artifact. (2) Re-capture all lanes at HEAD on a quiet machine under the P5-05 variance policy (≥5 runs, median + max(3σ, 5 %)), and record the sample count per metric. (3) Drive the capability matrix's perf cells from the bound baselines so their staleness is detectable, and re-measure the stale count. (4) Audit the eight doc-06 scenarios against what the lanes actually measure; for each gap, either extend the existing lane or file one task with the scenario named — do not silently narrow the contract. (5) Re-evaluate the `DZUP_PERF_GATE` opt-in: the three false regressions that caused it are a variance problem with a known policy answer, so state whether the policy as implemented would have suppressed them, and recommend keeping the gate opt-in or making it default with evidence either way.</task>

<motivation>08-11 doc 06 is explicit that budgets start as reported baselines and become non-regression gates once variance is measured — and that a budget increase needs a recorded user benefit and an owner, because "raise the budget" is the default wrong response to a regression. The variance work is done and is the best artifact in either repository on this subject. What is missing is binding: an unbound baseline cannot be compared against, so the gate stays optional, so the lane measures without protecting anything.</motivation>

<done_check>
  Run from ui/dzup-ui. Requires TASK-S0-O1.
  - `node -e "const b=require('./packages/core/perf/baselines.json');console.log('sourceCommit',b.sourceCommit,'profile',!!b.hardwareProfile)"` → a sourceCommit equal to HEAD and a hardware profile are present.
  - `node -e "const c=require('./packages/core/docs/capability-matrix.json');console.log('perf stale',Object.values(c.totals).reduce((a,t)=>a+t.stale,0))"` → the perf contribution to the stale count is 0.
  - `ls docs/program-2026-09-22-architecture/reports/TASK-S1-O4-scenario-audit.md` → the eight-scenario audit exists with a verdict per scenario.
  - `DZUP_PERF_GATE=1 yarn test:perf > /tmp/perf.log 2>&1; echo "exit $?"` → runs to completion and reports sample counts per metric.
</done_check>

<discovery>
  1. Read `TASK-R2-O7-handoff.md` and the baseline directory it produced. The four lanes exist; you are binding and auditing them, not rebuilding them.
  2. Read the P5-05 variance policy as implemented (`packages/core/perf/` plus its validator) and confirm the three false regressions it was written to suppress are in fact suppressed by it — that is a re-run, not an argument.
  3. Transcribe 08-11 doc 06's eight scenarios into a checklist before measuring anything; the audit is against that list, not against what the lanes happen to produce.
  4. Note the machine state: a contended machine produces variance the policy will read as a regression. Record load before and after each capture.
</discovery>

<requirements>
  <generator_only>All stamping happens in the generator. A hand-edited baselines file is a finding, not a fix.</generator_only>
  <downward_only>Thresholds move down only. A threshold increase requires a recorded user benefit and a named owner, per doc 06 — without both, the task stops and reports.</downward_only>
  <sample_discipline>≥5 runs per metric; record the sample count, the median, and the computed max(3σ, 5 %) band per metric. A metric with fewer than 5 samples is reported as unmeasured, not as a number.</sample_discipline>
  <scenario_honesty>The audit states, per scenario, `covered` / `partially covered (what is missing)` / `not covered (proposed task)`. Redefining a scenario so the current lane covers it is refused.</scenario_honesty>
  <example>
    Audit row shape:
    | # | doc-06 scenario | Lane | Verdict | Evidence / proposed task |
    |---|---|---|---|---|
    | 7 | optional-engine load separated from wrapper overhead | — | not covered | TASK-S1-O4-a: split the dynamic-import cost from mount cost for the 4 optional-peer components |
  </example>
</requirements>

<steps>
  1. Complete &lt;discovery&gt;; transcribe the eight scenarios and confirm the variance policy suppresses the three historical false regressions.
  2. Add stamping to the baselines generator; re-capture at HEAD with recorded machine load and sample counts.
  3. Point the capability matrix's perf input at the bound baselines; regenerate; confirm the perf stale contribution is 0.
  4. Write the scenario audit with a verdict per scenario and one proposed task per gap.
  5. Write the `DZUP_PERF_GATE` recommendation with the evidence; hand off with the ratchet table old → new.
</steps>

<validation>
  yarn generate:perf-baselines > /tmp/s1o4-gen.log 2>&1; echo "exit $?"
  DZUP_PERF_GATE=1 yarn test:perf > /tmp/s1o4-perf.log 2>&1; echo "exit $?"
  yarn generate:capability-matrix && npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"
  node -e "const b=require('./packages/core/perf/baselines.json');console.log('sourceCommit',b.sourceCommit)"
  yarn validate:all > /tmp/s1o4-validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>Baselines carry sourceCommit = HEAD, a hardware profile and a capture date, all written by the generator; every metric records its sample count (≥5) and its variance band; perf contribution to the capability-matrix stale count is 0; the eight-scenario audit is published with a verdict and a proposed task per gap; the `DZUP_PERF_GATE` recommendation is evidence-backed; no threshold raised.</success_criteria>

<stop_conditions>Stop and report when the machine is too contended to produce ≥5 stable samples (record the load and the attempt, mark the metrics unmeasured); when a re-capture shows a genuine regression against the recorded baseline (file it as a defect — do not raise the threshold); when a doc-06 scenario cannot be measured with this repository's own packages alone (record it `not covered — out of scope here`, with the reason; do not reach into another repository to measure it).</stop_conditions>
```
