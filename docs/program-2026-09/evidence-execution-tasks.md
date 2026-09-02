# dzup-ui — Evidence execution tasks (roadmap N0-05 + N1-O1…O6)

> Part of the [System Program 2026-09](./README.md). Every prompt assumes the
> `<repo_conventions>` block in [README.md §3](./README.md#3-how-these-tasks-are-written).
>
> **Source:** reassessment `05-gap-analysis-code-vs-plan.md` §A4 and
> `06-roadmap-2026-09.md` §N1 (OSS half). The rule that governs this file:
> **the machinery exists — do not build second machinery.** Every task here
> runs, executes, fixes, or publishes through gates and formats that P5
> already shipped. A task that finds itself designing a new harness has
> drifted; stop and re-read the existing one.
>
> **Ordering:** N0-05 first (nothing may quote a number bound to the stale
> `8d80bc39` artifacts). N1-O1/O2/O3 can then run in parallel by separate
> owners; N1-O4 needs a named human `[!owner]`; N1-O5/O6 are independent.

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on owner decision
> **Priority:** 🔴 · 🟠 · 🟢

---

## 🔴 Re-binding

### [x] TASK-N0-05 — Re-bind the generated evidence artifacts to current HEAD

_Gap: roadmap N0-05. The ownership / quality / capability / RTL / AT artifacts
record `sourceCommit 8d80bc39` — 15 commits and 94 core-src file changes behind
`main` @ `51dec93`. Every number the N1 tasks ratchet against must be bound to
the commit actually being worked on, per the reassessment's re-binding rule._

```xml
<role>You are a design-system tooling engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09/README.md §3 — especially <evidence_rules>: a metric without a commit binding is not evidence.</role>

<task>Regenerate every generated evidence artifact at current HEAD, verify determinism, and report exactly which cells/ratchets moved between 8d80bc39 and HEAD — without replacing any browser/perf baseline that requires a fresh run rather than a regeneration.</task>

<motivation>The 2026-08-25 recovery freeze declared all pre-freeze qualification numbers unbound; the 08-28 reassessment re-bound the documents but the in-repo generated artifacts still carry the old sourceCommit. N1-O1…O6 ratchet numbers downward; ratcheting against stale artifacts would either mask regressions or manufacture phantom ones.</motivation>

<discovery>
  1. Enumerate every generated artifact and its generator script: component-ownership.manifest.json, public-api.manifest.json, quality-matrix.json, packages/core/docs/capability-matrix.json (and its Storybook MDX rendering), the RTL matrix, the AT matrix index (89 files), perf baselines. Record which embed a sourceCommit and which are commit-agnostic.
  2. Distinguish artifacts that are pure regenerations (deterministic from source) from artifacts that record RUN results (browser matrix results, perf baselines, AT cells). Only the first class is regenerated here; the second class is re-run by N1-O2/O4 and must not be overwritten with empty results.
  3. Run `git diff --stat 8d80bc39..HEAD -- packages/core/src` to know which components changed; these are the rows most likely to move.
</discovery>

<steps>
  1. Complete <discovery>; write the artifact classification (regenerate vs re-run) into the handoff before regenerating anything.
  2. Regenerate the pure-regeneration class via their owning scripts (generate:ownership, quality/capability matrix generators, RTL matrix). Run each generator twice; diff to prove determinism.
  3. Diff each regenerated artifact against its previous committed state; summarize row-level changes (symbols added/removed/reclassified, tier changes, capability-cell state changes, new stale cells).
  4. Verify every ratchet ceiling still holds (unclassified 29, anatomy 137, story-DoD 51, browser failures 46) — if a ceiling is now violated by regeneration, report it as a real regression, do not raise the ceiling.
  5. Run yarn validate:all and report red gates separately from the regeneration result.
</steps>

<success_criteria>All regenerable artifacts carry sourceCommit = current HEAD; two consecutive generator runs are byte-identical; no run-result artifact (browser/perf/AT) was emptied or overwritten; every ratchet movement is listed old → new with the causing commit range; validate:all status reported honestly.</success_criteria>

<stop_conditions>Stop and report when a generator no longer runs at HEAD (that is a defect to fix first, separately); when regeneration would delete run records; when a ratchet ceiling is violated and the fix would require editing the ceiling upward.</stop_conditions>
```

---

## 🔴 Run what was built

### [x] TASK-N1-O1 — Author the 51 tier-required Story DoD items (P5-02 close-out)

_Gap: P5-02, the only open foundation task. The Story DoD triage reduced 366
advisory gaps to **51 tier-required items across 32 components, 0 authored**;
the ratchet is wired. This is the last construction-shaped task on OSS._

```xml
<role>You are a component engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09/README.md §3. Stories live in packages/core/stories/{family}/, never colocated.</role>

<task>Author every one of the 51 tier-required Story DoD items across the 32 components the triage flagged, driving the story-DoD ratchet from 51 to 0, without touching component source except where writing the story exposes a real defect (report those separately, fix only trivial ones).</task>

<motivation>Story DoD by tier is the contract that a component's risk tier is matched by demonstrable states in Storybook — the browser matrix, the a11y sweeps, and the future docs site (DOCS-02) all sample stories. 51 open items means 32 components claim a tier whose evidence surface does not exist. The triage already decided WHICH stories are required; this task only writes them.</motivation>

<discovery>
  1. Read the story-DoD validator and its report to get the exact list: component, family, tier, required story kind (state/keyboard/a11y scenario), and the reason it is tier-required.
  2. Read 3–4 existing stories for components of the same tier (e.g. a Tier C data component, a Tier B overlay) to copy the established story shape, play-function conventions, and status badges.
  3. Check which of the 32 components have anatomy declarations or `ui`-prop pilots — their stories should exercise data-part/data-state where declared.
</discovery>

<requirements>
  <fidelity>Each story must demonstrate the specific required scenario (e.g. keyboard-only interaction, error/disabled/loading state, RTL where flagged), not a generic default render. Play functions assert, they do not just perform.</fidelity>
  <no_gaming>Do not weaken the DoD rule, re-triage an item to advisory, or lower a component's tier to shrink the list. If an item is genuinely impossible (component cannot reach the state), report it with evidence for an owner decision — do not except it yourself.</no_gaming>
  <budget>Storybook build must stay within the 25 MB budget (currently 23.50 MB). If new stories push it over, report — do not delete other stories.</budget>
</requirements>

<steps>
  1. Complete <discovery>; group the 51 items by family and work family-by-family.
  2. Author stories; run the focused story-DoD validator after each family to watch the ratchet fall.
  3. Run yarn storybook:build and yarn storybook:test; run the chromium matrix lane for changed components only if it samples stories.
  4. Ratchet the story-DoD ceiling down to the final count (target 0).
</steps>

<validation>
  yarn validate:story-dod        # ratchet: 51 → 0
  yarn validate:story-status
  yarn storybook:build           # within 25 MB budget
  yarn storybook:test
  yarn typecheck && yarn lint
</validation>

<success_criteria>Story-DoD tier-required open count is 0 (or every residual has an evidence-backed impossibility report); 32 components gained their required stories; Storybook builds within budget; no component source changed except reported trivial fixes; no DoD rule weakened.</success_criteria>

<stop_conditions>Stop and report when a required story cannot be written without changing a component's public API; when the Storybook budget would be exceeded; when an item's requirement contradicts the component's contract spec.</stop_conditions>
```

---

### [x] TASK-N1-O2 — Run the 12 configured Firefox/WebKit matrix projects and triage per-engine failures

_Gap: N1-O2 / capability matrix "browser evidence" row. 18 Playwright projects
exist (3 engines × 6 conditions) with 144 targets; **only chromium has run**
(89 in lane, 46 measured failures ratcheted). The 12 Firefox/WebKit projects
are configured and have never executed._

```xml
<role>You are a browser-quality engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09/README.md §3. Build on e2e/matrix/ and the existing playwright.config — do not start a second harness.</role>

<task>Execute the 12 Firefox and WebKit matrix projects against all 144 targets, triage every failure into (a) real component defect, (b) engine-specific limitation with an upstream reference, or (c) harness/environment defect, and record the results in the same ratcheted, commit-bound format the chromium lane uses.</task>

<motivation>The reassessment's external research puts the browser-support norm at a "Baseline Widely Available" statement backed by evidence. dzup-ui built an 18-project matrix and ran a third of it — the capability matrix shows the unrun cells honestly, but honest absence is still absence. Firefox/WebKit divergence concentrates exactly where dzup-ui's risk sits: focus handling, scroll anchoring, forced-colors, and overlay positioning.</motivation>

<discovery>
  1. Read the matrix runner, the 18 project definitions, the exceptions/ratchet file format the chromium lane used for its 46 measured failures, and how results feed the capability matrix's browser-lane input.
  2. Confirm Playwright browser binaries for firefox/webkit are installable in this environment (npx playwright install firefox webkit); record versions in the run metadata.
  3. Check how long the chromium lane takes and plan sharding — run per-condition projects sequentially if needed; do not reduce target coverage to save time.
</discovery>

<requirements>
  <run_integrity>Every run records sourceCommit, browser versions, and dirty-worktree status. A run from a dirty worktree is not admissible as evidence.</run_integrity>
  <triage>Every failure gets exactly one classification with evidence. Engine-specific limitations go into the exceptions file with story/target id, engine, reason, upstream issue link where one exists, and are counted in a per-engine ratchet — never silently skipped. Real defects are ratcheted like the chromium 46 (fixes belong to N1-O3 or their own follow-up; do not mass-fix here).</triage>
  <matrix_feed>After the runs, regenerate the capability matrix so the previously-unrun Firefox/WebKit cells show run results (pass/fail/excepted), and confirm stale-cell detection reflects the new state.</matrix_feed>
</requirements>

<steps>
  1. Complete <discovery>; install engines; verify one smoke target per engine before the full sweep.
  2. Run the 6 Firefox projects, then the 6 WebKit projects; capture full reports under the harness's output convention.
  3. Triage every failure per <requirements>; write the per-engine failure/exception counts into the ratchet files.
  4. Regenerate the capability matrix; run yarn validate:all; hand off with per-engine totals: in-lane / passed / failed-defect / excepted-engine / harness-defect.
</steps>

<success_criteria>All 12 projects executed against their full target set at a clean worktree; zero unclassified failures; ratchets initialized for both engines; capability matrix browser cells updated from "unrun" to real states; chromium ratchet (46) untouched by this task.</success_criteria>

<stop_conditions>Stop and report when an engine cannot launch in this environment (report exact error — do not fake results); when a failure count is so large that triage exceeds the session (hand off partial triage with the untriaged remainder explicitly listed); when triage would require editing component source beyond a trivial fix.</stop_conditions>
```

---

### [x] TASK-N1-O3 — Fix the measured WCAG 2.2 failures (28 target-size, 18 reflow) and audit drag surfaces against 2.5.7

_Gap: N1-O3. The chromium matrix measured **28 components failing 2.5.8 Target
Size (24×24)** and **18 failing 1.4.10 Reflow at 320 px** — ratcheted at 46,
unfixed. External research (04 §2) names 2.5.8, 1.4.10 and 2.5.7 Dragging
Movements as the WCAG 2.2 items hitting component libraries hardest; the EAA
makes them procurement gates._

```xml
<role>You are an accessibility-focused component engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09/README.md §3: token-only styling, tv() variants, no scoped styles — a11y fixes go through the same styling contract as everything else.</role>

<task>Drive the browser-matrix measured-failure ratchet from 46 toward 0 by fixing the 28 target-size and 18 reflow failures at the token/variant level, and audit every drag-capable OSS surface (DzOrderList, DzSlider, DzSplitter, and any others the tier metadata flags) against WCAG 2.5.7, recording a keyboard/single-pointer alternative for each.</task>

<motivation>These are the only measured (not hypothetical) WCAG failures in the repo, found by machinery this program paid for. Target-size failures usually share root causes (small icon-button paddings, dense-mode hit areas) so token-level fixes fan out; reflow failures at 320 px are layout-contract defects that the docs site will otherwise publish as evidence against the library.</motivation>

<discovery>
  1. Read the matrix failure report for the exact component/condition pairs and the assertion that failed. Cluster the 28 target-size failures by shared token/variant root cause before fixing any single component.
  2. For each reflow failure, reproduce at 320 px in Storybook; determine whether the defect is component CSS, story fixture width, or a genuine content-cannot-reflow case (WCAG allows exceptions for data tables/toolbars — document any claimed exception against the actual SC text).
  3. Enumerate drag-capable components from the tier/quality metadata; read each one's keyboard path (the reassessment already fixed useTabs arrow keys and 55 physical-direction lines — pattern-match those fixes).
</discovery>

<requirements>
  <fix_level>Prefer fixes in tokens/variants (e.g. minimum hit-area tokens, density floor) over per-component one-offs. A fix must not change a frozen variant taxonomy or a public prop.</fix_level>
  <visual_risk>Target-size fixes change geometry. Re-run the chromium lane for every touched component and capture before/after screenshots for the handoff; flag any visible layout shift for owner review rather than deciding it is acceptable.</visual_risk>
  <dragging_2_5_7>For every drag surface: verify a keyboard or single-pointer alternative exists for each drag operation (reorder, resize, connect). Where one is missing, implement it if it fits the existing interaction contract; otherwise report it as a scoped follow-up with the exact missing operation. Record the audit as a table in the handoff (component · drag op · alternative · state).</dragging_2_5_7>
</requirements>

<steps>
  1. Complete <discovery>; publish the failure clustering in the handoff before editing.
  2. Fix cluster-by-cluster; after each cluster run the focused specs + the chromium matrix targets for the touched components; ratchet down.
  3. Run the 2.5.7 audit; implement in-contract alternatives; write the audit table.
  4. Full validation ladder; report the final ratchet value and any residual failures with reasons.
</steps>

<validation>
  yarn test <touched packages/paths>
  yarn test:e2e -- --project=<chromium matrix projects for touched components>
  yarn validate:tokens && yarn validate:story-dod
  yarn typecheck && yarn lint
</validation>

<success_criteria>Measured-failure ratchet moves 46 → ≤ a stated residual with per-item reasons (target 0); no frozen variant taxonomy or public prop changed; every drag surface has a recorded 2.5.7 disposition; geometry changes documented with before/after evidence.</success_criteria>

<stop_conditions>Stop and report when a fix requires a breaking API change (route to TASK-N5-02's lane); when a reflow fix would require abandoning token-only styling; when a 2.5.7 alternative needs a new interaction pattern with no APG precedent — that is a design decision, not an agent call.</stop_conditions>
```

---

## 🟠 Execute and publish

### [!] TASK-N1-O4 — Execute manual AT-matrix cells for Tier C/D `[!owner: named tester + cadence]`

_Gap: N1-O4 / P5-04's own success criterion. The AT matrix scaffold exists (89
files + index, 534 cells) with **0 cells executed**. Automation cannot do the
screen-reader runs; this task prepares and consumes them. Tier C (21
components) + Tier D (1: `DzFileUpload`) first — the EAA-era audit targets._

```xml
<role>You are a quality engineer in ui/dzup-ui coordinating a manual assistive-technology run. Follow <repo_conventions> — especially the append-only AT record format. You prepare, script, and record; a named human performs the AT sessions.</role>

<task>Prepare executable AT test scripts for the 22 Tier C/D components from the existing matrix scaffold, support a human tester through the first execution wave (NVDA + one of VoiceOver/JAWS at minimum), record results in the append-only format, and wire executed-cell counts back into the capability matrix.</task>

<motivation>534 honest-but-empty cells is the single biggest credibility gap the competitive benchmark found (published SR/AT matrices: dzup-ui ❌ while Telerik ✅). The scaffold format was built in P5-04; the missing ingredient is execution with a named owner and cadence — an owner decision this task must surface, not assume.</motivation>

<discovery>
  1. Read the AT matrix index and 3–4 scaffold files to confirm the cell schema (component × AT × browser × scenario) and the append-only run-record format.
  2. Cross-reference the 22 Tier C/D components with their APG patterns from the quality matrix; each script step should map to an APG-expected announcement/behavior.
  3. Determine which AT/browser pairings the scaffold declares required for Tier C vs D.
</discovery>

<requirements>
  <scripts>For each component: a step-by-step script (setup story URL, keystrokes, expected announcement/behavior per step) a tester can follow without knowing the codebase. Derive expected behavior from the component's contract spec + APG pattern, not from what the component currently does.</scripts>
  <records>Results are append-only: tester, AT + version, browser + version, date, sourceCommit, per-step pass/fail/notes. A failed step creates a defect entry, never a silent re-run.</records>
  <owner_gate>Executing cells requires a named human owner and a recurring cadence. If none is assigned, complete the scripts + dry-run one component yourself with a screen reader if the environment allows, then mark the task [!] with a concrete proposal (which cells, per what cadence, estimated hours) for the owner.</owner_gate>
</requirements>

<steps>
  1. Complete <discovery>; generate/author scripts for all 22 components.
  2. Dry-run the scripts against 2 components to remove ambiguity from the wording.
  3. Execute or coordinate execution of the first wave; append records; file defects for failures.
  4. Regenerate the capability matrix so executed-cell counts replace "unrun"; hand off with the executed/remaining split and the cadence proposal.
</steps>

<success_criteria>22/22 Tier C/D components have executable scripts; at least the dry-run components carry real appended records; every failure became a tracked defect; capability matrix reflects executed counts; a written cadence proposal exists for the owner.</success_criteria>

<stop_conditions>Stop when no AT is available in the environment and no human tester is assigned — deliver the scripts + proposal and mark [!]. Never fabricate a run record; an empty cell is honest, an invented one is corruption.</stop_conditions>
```

---

### [x] TASK-N1-O5 — Security corpus: un-except `DzFileUpload` and cover the 13 `SecurityBoundary` declarers

_Gap: N1-O5. The tier rule requires a security corpus for Tier D; the only
Tier-D component (`DzFileUpload`) has **excepted both** of its obligations
(url-policy, csp-fixture). 13 components declare the orthogonal
`SecurityBoundary` axis with no corpus behind it. The corpus format must be
shareable with Pro's QUAL-04 (TASK-N1-P1 in the Pro program)._

```xml
<role>You are a security-minded component engineer in ui/dzup-ui. Defensive scope only: build fixtures and gates that PROVE components neutralize hostile input; never widen what components accept.</role>

<task>Build the OSS security-fixture corpus: define a reusable corpus format (shared by design with Pro's QUAL-04), implement DzFileUpload's url-policy and csp-fixture obligations (removing its two exceptions), and add corpus-driven specs for the 13 SecurityBoundary-declaring components covering their declared boundary.</task>

<motivation>A tier rule whose only member is excepted from it is a rule that does not exist. The corpus format decision echoes into Pro (14 ad-hoc DOMPurify sites, LLM-adjacent chat/editor components), so the format is designed once here: versioned fixture files with case id, category (URL scheme abuse, HTML injection, CSS injection, oversized/degenerate input), payload, and the REQUIRED neutralization outcome.</motivation>

<discovery>
  1. Read DzFileUpload's exception entries: what exactly was excepted and why. Read the component's URL handling and preview rendering paths.
  2. Enumerate the 13 SecurityBoundary declarers from the quality matrix and what boundary each declares (e.g. renders consumer HTML, builds URLs, injects styles).
  3. Check how Pro's program describes its planned sink registry (ui/dzup-ui-pro/docs/program-2026-09/evidence-repayment-tasks.md TASK-N1-P1) so the corpus schema is consumable there — coordinate the SCHEMA only; do not implement Pro code.
</discovery>

<requirements>
  <corpus>packages/testing (or tooling) hosts the corpus schema + fixture files; fixtures are data, loaded by specs — no payload strings inline in test code. Categories per component derive from its declared boundary; every fixture states the expected safe outcome (stripped/escaped/rejected), not just "does not crash".</corpus>
  <file_upload>Implement the url-policy check (allowed schemes/origins for previews and links) and the CSP fixture (component functions under a strict CSP with no unsafe-inline) as real specs; delete the two exception entries; ratchet accordingly.</file_upload>
  <no_offense>Fixtures demonstrate neutralization. Do not add exploit tooling, working payload generators, or anything beyond minimal representative attack strings established in public test suites (e.g. cure53-style markup cases).</no_offense>
</requirements>

<steps>
  1. Complete <discovery>; write the corpus schema and get it stable first.
  2. Implement DzFileUpload obligations; remove exceptions.
  3. Add corpus specs per SecurityBoundary declarer, tightest boundary first.
  4. Validation ladder; hand off with the per-component boundary → fixture-count table and the schema pointer for Pro.
</steps>

<validation>
  yarn test packages/core --run <touched spec paths>
  yarn validate:story-dod && yarn validate:tokens
  yarn typecheck && yarn lint
</validation>

<success_criteria>DzFileUpload has zero security exceptions and passing url-policy/CSP specs; all 13 declarers have corpus-driven specs bound to their declared boundary; the corpus schema is documented and referenced by the Pro program; no component's accepted input surface widened.</success_criteria>

<stop_conditions>Stop and report when a component's declared boundary turns out to be false (it does NOT neutralize a category it declares) — that is a defect report with severity, not a silent fix, if the fix would change public behavior; when honoring an obligation requires a new runtime dependency (owner decision).</stop_conditions>
```

---

### [x] TASK-N1-O6 — Visual-regression ownership: decide scope and wire it in as the capability matrix's fifth input

_Gap: N1-O6. Visual regression is 2 specs (gallery, theme-recipe matrix) with
committed snapshots — no per-component scope, no review workflow, no plan
ownership. External norm: Playwright `toHaveScreenshot()` self-hosted, or
Chromatic/Argos for Storybook libraries._ 🟢

```xml
<role>You are a quality engineer in ui/dzup-ui. Follow <repo_conventions>. This task produces a decided design + a working first slice, not a full sweep.</role>

<task>Propose and implement the visual-regression strategy: choose scope (per-component story snapshots vs surface-level pages), define the snapshot review/update workflow and its authority rule (who may accept a changed baseline), implement the mechanism for one pilot family, and register visual evidence as the fifth input to the capability-matrix generator.</task>

<motivation>Target-size and reflow fixes (TASK-N1-O3) change geometry with no gate to catch unintended visual drift. The capability matrix has four inputs (ownership, quality, browser lanes, AT index); visual evidence is the missing fifth, and adding it while cells are few is cheap.</motivation>

<requirements>
  <decision_first>Write a short options memo (self-hosted Playwright vs Chromatic vs Argos; per-story vs per-surface; light+dark × LTR minimum) with a recommendation, into docs/program-2026-09/reports/. Implement the recommendation for ONE family (suggest: buttons — small, stable) unless the memo argues otherwise.</decision_first>
  <authority>Baseline acceptance is an explicit act with a recorded reason — mirror the perf-baseline downward-ratchet spirit: a changed snapshot needs a stated cause, never a bulk --update-snapshots.</authority>
  <matrix_input>Extend the capability-matrix generator to accept the visual-evidence input (per-component: covered/not-covered/stale) with the same staleness detection as the other four.</matrix_input>
</requirements>

<steps>
  1. Write the memo; pick the pilot family.
  2. Implement snapshots for the pilot family in both themes; document the update workflow next to the config.
  3. Wire the fifth matrix input; regenerate the capability matrix; confirm non-pilot components show "not-covered", not "unknown".
  4. Validation ladder; hand off with rollout order for remaining families.
</steps>

<success_criteria>Decision memo exists with a recommendation; pilot family has deterministic passing snapshots in both themes; a snapshot change without a recorded reason fails; capability matrix carries the fifth input; rollout plan ranked.</success_criteria>

<stop_conditions>Stop when snapshots are non-deterministic in this environment (fonts/rendering) and record the exact source of nondeterminism instead of loosening thresholds past 0.1 % without a memo entry; when the choice requires a paid service decision — mark [!owner].</stop_conditions>
```
