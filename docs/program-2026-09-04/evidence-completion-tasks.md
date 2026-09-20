# dzup-ui — Evidence-completion tasks (R2)

> Part of the [Architecture Review Program 2026-09-04](./README.md). Every
> prompt assumes the `<repo_conventions>` block in [README §5](./README.md#5-how-these-tasks-are-written)
> and the check-first protocol in [README §4](./README.md#4-how-to-run-a-task--the-check-first-protocol).
>
> **Sources:** 08-11 reassessment doc 06 (quality/a11y/security spec — the
> per-tier evidence rules, the WCAG 2.2 list, the manual AT matrix, the URL/DOM
> policy, the performance contract) and doc 08 (browser + AT matrix by tier);
> 08-28 roadmap N1-O1…O6 and their handoffs
> (`../program-2026-09/reports/N1-O*-handoff.md`, `N0-05-rebind-handoff.md`);
> the N1-O1 defect register (11 defects reported, not fixed); the N1-O5
> security findings (no URL policy, 54 measured deviations); the 1.0 exit memo
> criterion C9. Every number below is bound to `main` @ `99b963a`.
>
> **The rule that governs this file:** the machinery exists — run it, persist
> what it produces, fix what it measured. A task that finds itself designing
> a second harness has drifted; stop and re-read the existing one. An agent
> never fills a manual AT result cell.
>
> **Ordering:** R2-O1 after TASK-R1-O1 (nothing re-runs on a tree that
> stamps the wrong commit). R2-O2's schema fixes before any human runs a cell.
> R2-O3 and R2-O4 are independent and can run in parallel. R2-O5 ends in an
> owner design decision. R2-O6 after R2-O1 (platform decision). R2-O7 after
> TASK-R1-O1.

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[x] found-done` · `[!]` blocked on owner decision
> **Priority:** 🔴 · 🟠 · 🟢

---

## 🔴 Make the built evidence citable

### [~] TASK-R2-O1 — Re-run the built evidence from the committed tree and persist the browser record 🔴

> **2026-09-19 — five of six deliverables done and measured; one is owner-only.**
> Handoff: [`./reports/TASK-R2-O1-handoff.md`](./reports/TASK-R2-O1-handoff.md).
> The tracked artifact (`e2e/matrix/browser-evidence.json`), the degradation gate
> (proven by a seeded regression: 26 violations, exit 1, each naming
> component/engine/condition), all **24** projects re-run at `2d51eec`
> (**1,431 passed / 8 skipped / 0 failed per engine, exit 0 each**), the visual
> pilot (24/24), the stamped security corpus (403/403) and the regenerated
> capability matrix (**browser cells 89 `unrun` → 88 `pass` + 1 declared-unrun**;
> `validate:capability-matrix` **exit 1 → exit 0**) are all landed.
>
> `[~]` and not `[x]` for one reason, stated rather than papered over: the task
> says to re-run **"from the clean committed tree"**, and at `2d51eec` there is
> no clean tree — 420 uncommitted paths belong to R2-O2/O3/O4/O5 and R3/R5, and
> committing is the owner's. Every artifact is therefore stamped
> `sourceCommit: 2d51eec` **plus `worktreeDirty: true` and `dirtyPathCount`**,
> and full commit-binding is routed as owner action **D127**. The degradation
> gate is **inert until HEAD carries the ledger** and goes live on that commit.
>
> This prompt's `<done_check>` is the fifth defective one in this programme
> (**D124**): check 3 greps the same file that declares the platform and compares
> the value with itself — `win32`, `linux` and `solaris` all pass it — while
> checks 1 and 4 can only be satisfied by `git add` / `git commit`, which the
> prompt's own `<authority>` reserves to the owner. Also corrected here: the gap
> note's "18 projects / 3,168" is stale (R2-O5 made it **24 projects**; the
> reconciled figure is **4,293 attributed executions**), and the report is
> N0-05's finding **X3/D5**, not "F4".

_Gap: N1-O2 ran the 12 Firefox/WebKit projects (176 outcomes, harness defect
H1 fixed) and N1-O3 drove measured failures 46 → 0 with 1,056/1,056 × 3
engines — but on a **dirty worktree**; the commit came after (`e0d1707`) and
the "then re-run from the committed tree" half is unrecorded. The only
chromium record, `test-results/matrix-report.json`, is git-ignored (N0-05 F4),
so a fresh clone has no browser evidence at all; the visual pilot's committed
baselines are `linux` while the pilot ran on `win32` (N1-O6); the security
corpus (v1.0.0, 34 fixtures, 15 declarers, 372 tests) has no commit-bound
run either. Sources: OSS-R2, `../program-2026-09/reports/N1-O2-firefox-webkit-handoff.md`,
`N1-O3-wcag-fixes-handoff.md`, `N0-05-rebind-handoff.md` F4, `N1-O6-visual-regression-handoff.md`._

```xml
<role>You are an evidence engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. You run lanes that exist and make their output travel with the commit; you build no second harness.</role>

<task>Make the browser, visual and security evidence admissible at a commit: (1) turn the matrix report into a tracked generated artifact (or a checked-in summary the capability matrix reads) stamped with sourceCommit; (2) add a degradation gate so a browser cell moving `pass → unrun` or `pass → fail` fails validate:capability-matrix — prove it with a seeded regression; (3) re-run the three engine sweeps (18 projects: 3 engines × 6 conditions, ~50 min, expected 3,168/3,168) from the clean committed tree; (4) run the visual pilot on the authoritative platform and record which platform that is; (5) re-run the security corpus and stamp its output; (6) regenerate the capability matrix so browser/security/visual cells cite the commit.</task>

<motivation>The 08-11 release stop conditions include "evidence bound to a different commit" and "tarball ≠ reviewed build". Every green lane in N1 was run on a tree that no longer exists; a fresh clone today cannot reproduce a single browser cell. Persisting the record is what makes N1's work evidence rather than a memory.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `git ls-files | grep -E 'matrix-report|browser-evidence' | head -1` → a tracked artifact exists and `node -e "console.log(require('./<that file>').sourceCommit)"` equals `git rev-parse HEAD` (7 chars).
  - `npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"` → 0, and its output shows 0 browser cells `unrun` for chromium/firefox/webkit at Tier B+.
  - `grep -rn '"platform"' e2e/visual/ | head -1` names the authoritative platform and matches the committed baselines' platform.
  - `git log -1 --format=%h -- packages/core/security/coverage.json` is at or after the current HEAD's sweep, and the file carries `sourceCommit`.
</done_check>

<discovery>
  1. Read N0-05 F4 (why the report is ignored) and the capability-matrix generator's browser input; decide whether the tracked artifact is the full report or a per-component summary (prefer the summary: smaller diffs, same truth).
  2. Read N1-O2's harness note (H1) and the engine-exceptions file; the re-run must reproduce 3,168/3,168 or explain every delta.
  3. Read N1-O6's platform finding (`linux` committed vs `win32` pilot) and pick the authoritative platform with the CI runner in mind; record the choice as an owner-visible line (it becomes TASK-R2-O6's input).
  4. Note the harness hazard from memory: browser lanes write nothing until they finish — never conclude "hung" from an empty log; budget ~50 min for the three sweeps on a quiet machine.
</discovery>

<requirements>
  <artifact>The tracked artifact is generated, stamped (sourceCommit, engine versions, date), and read by the capability-matrix generator; provenance fields are excluded from byte comparisons.</artifact>
  <degradation_gate>A committed cell that was `pass` and is now `unrun` or `fail` fails the validator with the component, engine and condition named; a seeded regression (edit one cell in a scratch copy) proves the gate fires.</degradation_gate>
  <no_fake>If a sweep cannot run (engine missing, machine contended), the cells stay `unrun` with the reason; nothing is copied from the earlier dirty run.</no_fake>
  <example>
    Summary row shape:
    | component | tier | engine | condition | result | sourceCommit | date |
    |---|---|---|---|---|---|---|
    | DzDialog | B | webkit | rtl | pass | 99b963a | 2026-09-05 |
  </example>
</requirements>

<steps>
  1. Complete <discovery>; land the artifact + generator input + degradation gate (with seeded proof) before any sweep.
  2. Run the three sweeps from the clean tree; capture to files; reconcile against 3,168 and the exceptions file.
  3. Run the visual pilot on the authoritative platform; re-run the security corpus; stamp both.
  4. Regenerate the capability matrix; run validate:capability-matrix; hand off with per-engine counts and every delta explained.
</steps>

<validation>
  yarn test:e2e:matrix > /tmp/matrix.log 2>&1; echo "exit $?"            # ~50 min; read the code directly, never through a pipe
  yarn test:e2e:visual:pilot > /tmp/visual.log 2>&1; echo "exit $?"
  yarn test packages/testing packages/core/security; echo "exit $?"
  yarn generate:capability-matrix && npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"
</validation>

<success_criteria>Tracked browser artifact stamped with HEAD; degradation gate proven; 3 engines × 6 conditions re-run at the committed tree with every delta from 3,168 explained; visual pilot and security corpus stamped; capability matrix browser/security/visual cells cite the commit; a fresh clone can read every cited artifact.</success_criteria>

<stop_conditions>Stop and report when a sweep reproduces a failure N1-O3 recorded as fixed (component regression — route to TASK-R2-O3 with the cell); when the artifact would exceed a sane repo size (propose the summary form); when the platform choice needs CI infrastructure the repo does not have.</stop_conditions>
```

---

## 🟠 Execute the human-only evidence; fix what was measured

### [~] TASK-R2-O2 — AT matrix: fix the schema, then wave 1 🟠 `[!owner tester + cadence]`

> **2026-09-18 — phase 1 done, phase 2 owed to a human.** Schema fixed and
> proved (`CellState` gains `fail`; all-fail → `fail` by seeded regression),
> tier-differentiated pairings in contracts, task column, `DzSidebar` and
> `DzCommandPalette` corrected, `validate:at-scripts` chained. Wave 1 is
> **blocked on a named tester (D112)**. AT cells executed **0/534 — unchanged,
> and an agent never moves it.**
> See [`./reports/TASK-R2-O2-handoff.md`](./reports/TASK-R2-O2-handoff.md),
> [`./reports/at-pairing-decision-packet.md`](./reports/at-pairing-decision-packet.md),
> [`./reports/TASK-R2-O2-wave-1-runbook.md`](./reports/TASK-R2-O2-wave-1-runbook.md).

_Gap: 0 of 534 AT cells executed (22 Tier C/D components scripted: 126
steps, 397 expectations — N1-O4). Before a human runs one cell, the scaffold
has defects that would falsify the first results: `CellState` has no `fail`,
so the `at-manual` cell resolver publishes `pass` for an all-`fail` run (N2-D2
added only a generator tripwire); the row schema has no per-task result
column; pairs are not tier-differentiated (Tier D carries Tier B's
obligations); `DzSidebar` declares the APG `treeview` pattern wrongly;
`DzCommandPalette` owes a task it has no surface for; `validate:at-scripts` is
not a validate:all link; and the pairing tables disagree (doc 06 five pairs,
OSS six incl. `jaws-chrome`, Pro five). 1.0 criterion C9 (132 sessions ≈ 75 h)
is the long pole; the memo names three honest options. Sources: OSS-R3,
CAND-23, `../program-2026-09/reports/N1-O4-at-matrix-handoff.md`,
`1-0-exit-criteria-2026-09.md` §4._

```xml
<role>You are an accessibility evidence engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. You prepare the matrix so a person's run is recorded truthfully; you never fill a result cell.</role>

<task>Phase 1 (agent): fix the AT scaffold — add `fail` to `CellState` and make the `at-manual` resolver return it for any failed step; add the per-task result column to the append-only run record; make pairs tier-differentiated (Tier D ≥ Tier C ≥ Tier B obligations); correct `DzSidebar`'s APG declaration; add the `tasksFor()` opt-out `DzCommandPalette` needs; chain `validate:at-scripts` into validate:all; write the pairing-table decision packet (one table for doc 06 / OSS / Pro). Phase 2 (`[!owner]`): prepare wave 1 — `nvda-firefox` + `jaws-chrome` over the 22 Tier C/D components = 44 cells ≈ 21 h — with a runbook per component, and the C9 options memo (narrow the claim to Tier A/B · narrow the pair set · move C9 post-1.0). Phase 3 (after a named tester runs): ingest the run records, regenerate the AT matrix and capability matrix, file every defect with a task id.</task>

<motivation>Publishing an AT matrix whose resolver turns failures into passes would be worse than publishing none. Fixing the schema first costs a day; a human session recorded against a broken schema costs the session. Criterion C9 is the only 1.0 criterion no engineering shortens — the options memo is how the owner decides what 1.0 honestly claims.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `grep -n "fail" packages/contracts/src/*quality*.ts packages/tooling/src/**/at-*.ts 2>/dev/null | grep -i cellstate | head -1` → `fail` is a `CellState` value, and a spec asserts an all-fail run resolves to `fail`.
  - `grep -c 'validate:at-scripts' package.json` → ≥ 2 (script + validate:all chain).
  - `ls docs/program-2026-09-04/reports/ | grep -i 'at-pairing'` → the pairing decision packet exists.
  - `grep -rn 'tester' e2e/at-matrix/runs/ 2>/dev/null | wc -l` → > 0 means wave 1 has started; `yarn validate:at-matrix; echo "exit $?"` → 0 and the executed-cell count in the capability matrix > 0 → phase 3 done.
</done_check>

<discovery>
  1. Read N1-O4's handoff §findings for the exact resolver defect, the `DzSidebar` and `DzCommandPalette` items, and the 22-component list with step counts; read N2-D2 §3 for the tripwire it added (do not duplicate it — replace it with the real fix).
  2. Read the OSS scaffold format (e2e/at-matrix/*.md, index.json) and Pro's `docs/qa/at/README.md` run-record format; the pairing decision must let both repos share one vocabulary.
  3. Read 1-0-exit-criteria-2026-09.md §4 for the three C9 options and their consequences for the component-status ladder.
</discovery>

<requirements>
  <schema>`CellState` gains `fail`; a cell with any failed step is `fail`; a cell with no run is `unrun`; `pass` requires every step passed. Regenerate index.json; validate:at-matrix stays green (provenance excluded from byte comparison).</schema>
  <run_record>
    <example>
      | component | pair | task | result | AT version | browser version | tester | date | commit | notes |
      |---|---|---|---|---|---|---|---|---|---|
      | DzCombobox | nvda-firefox | 3 (select with arrow keys) | fail | NVDA 2026.1 | Firefox 143 | (name) | 2026-09-10 | 99b963a | announces "blank" on ArrowDown |
    </example>
    Append-only; an agent may add the row template, never a result.
  </run_record>
  <pairs>Tier-differentiated obligations declared in the quality tiers (contracts), not in the scaffold; the pairing packet proposes one table with a recommendation and lists what each repo changes.</pairs>
  <wave_1>Runbook per component (pre-filled environment rows, the 126 steps grouped by task, expected announcements), time estimate, and the order (Tier D first). Owner names the tester and cadence.</wave_1>
  <no_fill>No result cell is ever written by an agent. If asked, refuse and record the refusal.</no_fill>
</requirements>

<steps>
  1. Complete <discovery>; fix the schema with a spec that fails today (all-fail → pass) and passes after.
  2. Fix `DzSidebar`'s APG declaration and the opt-out; add the task column; chain validate:at-scripts.
  3. Write the pairing packet and the C9 options memo; prepare the wave-1 runbook; hand off — `[!owner tester + cadence]`.
  4. After runs arrive: ingest, regenerate AT + capability matrices, file defects (component · task · AT · severity · task id), report executed cells 0/534 → n/534.
</steps>

<validation>
  yarn validate:at-scripts && yarn validate:at-matrix; echo "exit $?"      # read directly
  yarn test packages/tooling/src/**/at-* packages/contracts; echo "exit $?"
  yarn generate:at-matrix && yarn generate:capability-matrix && npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"
</validation>

<success_criteria>Schema fix proven by a regression spec; validate:at-scripts chained; pairing packet and C9 memo written; wave-1 runbook complete for 22 components; after runs: executed cells 0 → ≥ 44 with tester/AT/browser/date/commit on every row, no fabricated row, defects filed.</success_criteria>

<stop_conditions>Stop at the runbook until a tester is named. Stop and report when a run record arrives without tester or versions (reject it, do not ingest); when a component's script cannot be executed because its story does not expose the task (route to TASK-R5-O5's keyboard contract).</stop_conditions>
```

---

### [x] TASK-R2-O3 — Close the N1-O1 defect register (D8 controlled/uncontrolled first) 🟠

_Gap: N1-O1 reported 11 component defects it did not fix. The highest:
**D8** — `useDualModel` silently ignores external writes after the first user
edit across 7 controls, a violation of doc 03's rule that a component never
switches controlled/uncontrolled mode ambiguously; **D7** — `useFocusTrap`
never restores focus on release; **D4** — nested interactive elements inside a
combobox (`DzCascader`, `DzTreeSelect`); plus D1/D2/D3/D5/D9/D10/D11 and
**E6** (SSR emits a lowercase `arialabel` attribute — needs an SSR-side gate).
`storybook:test` runs 1,437/1,440 with 3 pre-existing failures (`DzFormField`
/ `DzFormParts` `role="alert"`, `Localisation` `:options`). Sources: CAND-04,
OSS-R16, `../program-2026-09/reports/N1-O1-story-dod-handoff.md` §defects._

```xml
<role>You are a component engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. Every fix is a defect fix with a regression spec that fails before and passes after — never a test edit.</role>

<task>Close the register in severity order: D8 (all 7 controls share the composable — one fix, seven regression specs asserting an external `modelValue` write after a user edit is honoured), D7 (focus restored to the trigger on trap release, with a spec), D4 (no nested interactive elements inside the combobox listbox — restructure or ARIA-own the child), then D1, D2, D3, D5, D9, D10, D11 as the handoff describes them, E6 (an SSR gate that fails on any lowercased ARIA attribute in server output), and the 3 pre-existing storybook:test failures. Each fix names the defect id in its spec title.</task>

<motivation>These are measured defects in shipped components, found by machinery this program paid for and left on a list. D8 is a contract violation the docs site now publishes as "controlled/uncontrolled: supported" on seven pages. Fixing them is cheaper than any evidence task that would later re-find them.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `grep -rln 'D8\|external write after' packages/core/src --include='*.spec.ts' | wc -l` → ≥ 7 (one regression spec per control) and `grep -n 'useDualModel' packages/core/src/composables/*.ts | head -1` shows the fix commit after `99b963a`.
  - `grep -rn 'D7' packages/core/src/composables/*focus*.spec.ts | head -1` → a restore-focus spec exists.
  - `yarn storybook:test > /tmp/sb.log 2>&1; echo "exit $?"` → 0 (1,440/1,440).
  - `grep -n 'D8\|D7\|D4\|E6' ../program-2026-09/EXECUTION-STATUS.md docs/program-2026-09-04/EXECUTION-STATUS.md | grep -ci fixed` → ≥ 4.
</done_check>

<discovery>
  1. Read N1-O1's defect table in full; for each id record component(s), reproduction, and the spec file that should own the regression.
  2. Read `useDualModel` and its 7 consumers; write the failing spec for one control first, confirm it fails at HEAD, then fix the composable.
  3. Read `useFocusTrap` and the overlay components that use it; confirm the restore path is absent, not conditional.
  4. For the 3 storybook:test failures, read the stories: decide whether the story or the component is wrong (a `role="alert"` on a form-field error is a component contract question — check the FORM-OSS renderer contract before changing either).
</discovery>

<requirements>
  <regression_first>Every defect: failing spec at HEAD → fix → passing spec; the spec title contains the defect id (e.g. `D8: honours external modelValue write after user edit`).</regression_first>
  <no_api_change>Fixes stay inside the existing props/emits; if a fix needs a public change (D4 may), stop and route it through VERSIONING.md with a `minor` changeset and an owner note.</no_api_change>
  <ssr_gate>E6 becomes a validate:* link or a `test:ssr` assertion that scans server output for `arialabel|ariadescribedby|…` and fails; seeded proof.</ssr_gate>
  <stories>A story is changed only when the story is wrong; a component contract change goes through its `.contract.spec.ts`.</stories>
</requirements>

<steps>
  1. Complete <discovery>; publish the defect table with owner spec paths in the handoff before editing.
  2. D8 → D7 → D4, each with regression specs; run the focused suites after each.
  3. D1/D2/D3/D5/D9/D10/D11 in the handoff's order; E6 gate; the 3 story failures.
  4. Full ladder; hand off with the register (id · component · fix · spec path · state).
</steps>

<validation>
  yarn test packages/core/src/composables packages/core/src/components/<touched families>; echo "exit $?"   # read directly
  yarn test:ssr; echo "exit $?"
  yarn storybook:test > /tmp/sb.log 2>&1; echo "exit $?"
  yarn validate:story-dod && yarn typecheck && yarn lint; echo "exit $?"
  yarn test:e2e -- --project=chromium-default <touched components>
</validation>

<success_criteria>11 defects + E6 each closed with a named regression spec (or routed with a reason); storybook:test 1,437 → 1,440; no public API changed without a changeset; EXECUTION-STATUS records each id as fixed with its spec path.</success_criteria>

<stop_conditions>Stop and report when a fix requires a breaking prop change (VERSIONING `minor`, owner note); when D4's restructuring conflicts with the APG combobox pattern the contract spec pins; when a storybook failure reveals a renderer-contract ambiguity (route to TASK-R3-O3).</stop_conditions>
```

---

### [x] TASK-R2-O4 — URL policy for the six navigation sinks, and the CSP posture 🟠

_Gap: there is **no URL policy anywhere in `packages/core/src`** — six
navigation components (`DzButton`, `DzAnchor`, `DzBreadcrumb`, `DzMenu`,
`DzSidebar`, `DzMegaMenu` and their compound items) pass nine hostile schemes
to a live `href`; the security corpus measured **54 deviations**, ceiling
54, severity high (N1-O5 S1/S2). N1-O5 routed the fix to N5-02, which closed
only the ARIA props. Adjacent findings: `securityBoundary` is single-valued so
`DzQRCode` cannot declare both (S5); compound sub-parts are sinks but not
matrix rows (S4); 78 static `style=` attributes and 38 `:style` bindings block
any CSP claim and no browser has verified one; `security/coverage.json` is a
generator input the owner has not confirmed. The fix is breaking — legal now
as a `minor` under VERSIONING.md. Sources: CAND-03, OSS-R5, OSS-R18,
`../program-2026-09/reports/N1-O5-security-corpus-handoff.md`,
`packages/core/security/url-boundary.threat-model.md` §2a._

```xml
<role>You are a security-minded component engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. A rejected URL is a rejected URL — never a rewritten one that looks safe.</role>

<task>Step 0 (decision inputs, with a recommendation): the scheme allowlist (`http`, `https`, `mailto`, `tel`, relative, and fragment), the rejection shape (omit `href` and render as non-link vs `javascript:void(0)` — recommend omit), and the escape-hatch location (a provider-level `urlPolicy` with an explicit allow function, never a per-instance boolean). Then implement one URL policy in the provider/contracts layer, apply it to the six components and their compound items, emit a structured rejection (dev warning + `data-state="url-rejected"`), make the corpus deviations ratchet 54 → 0, make `securityBoundary` set-valued, decide sub-part rows (or a documented parent-covers rule), and add one strict-CSP browser lane that renders `DzThemeProvider` + `DzFileUpload` under a real CSP header without dropped styles. Changeset `minor`.</task>

<motivation>The docs site publishes a measured security deviation on six component pages until this lands. A URL policy is the one M4 item the OSS corpus proved absent rather than assumed; every consumer that renders user-supplied links through these components inherits the gap. The CSP lane closes a claim that has never been verified in a browser.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `grep -rln 'urlPolicy\|isSafeUrl\|allowedSchemes' packages/core/src/providers packages/contracts/src | head -1` → a provider-level policy exists.
  - `node -e "console.log(require('./packages/core/security/coverage.json').deviations ?? 'inspect')"` → 0 (or the ratchet board the handoff names reads 0).
  - `grep -n 'securityBoundary' packages/contracts/src/*.ts | grep -c '\[\]'` → ≥ 1 (set-valued).
  - `ls e2e/ | grep -i csp` → a strict-CSP lane exists and `yarn test:e2e -- --project=<csp project>` passes.
</done_check>

<discovery>
  1. Read url-boundary.threat-model.md §2a and N1-O5's S1–S6 findings; list the nine schemes and the exact assertion that measured 54.
  2. Read the six components and their item sub-components; inventory every `href`/`to` sink and how it reaches the DOM.
  3. Read ADR-20 and DzProvider.types.ts to place the policy (a new provider prop is an ADR-20 amendment — note it for TASK-R0-O2).
  4. Inventory the 78 static `style=` and 38 `:style` sites (grep); classify each (recipe-movable · required dynamic · test-only).
</discovery>

<requirements>
  <policy>One implementation; default allowlist as recommended; rejection omits the attribute and emits a dev-only console warning naming the component and the rejected scheme; consumers extend via the provider only. No component-level opt-out boolean.</policy>
  <breaking>Changeset `minor`; migration note in the changeset body; the corpus fixtures become the regression suite.</breaking>
  <matrix>`securityBoundary` becomes a set in the quality tiers; the capability matrix renders sets; sub-parts either get rows or the parent-covers rule is written into the tier docs — with the owner's confirmation of `security/coverage.json` as an input recorded.</matrix>
  <csp_lane>A Playwright project serving one page with `Content-Security-Policy: default-src 'self'; style-src 'self' 'nonce-…'` that mounts `DzThemeProvider` + `DzFileUpload` and asserts computed styles equal the non-CSP run; the 78/38 inventory is attached with dispositions.</csp_lane>
</requirements>

<steps>
  1. Complete <discovery>; write the decision-input table with recommendations (owner may override before step 2 — proceed on the recommendation if no answer, and say so).
  2. Implement the policy + provider seam + rejection; apply to the six components; corpus green; ratchet 54 → 0.
  3. Set-valued boundary + sub-part decision; regenerate quality/capability matrices.
  4. CSP lane + inventory; validation ladder; changeset; handoff.
</steps>

<validation>
  yarn test packages/core/src/components/navigation packages/core/security; echo "exit $?"     # read directly
  yarn test packages/testing                                                                  # corpus
  yarn validate:quality-tiers && yarn generate:capability-matrix && npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"
  yarn test:e2e -- --project=<csp project>; echo "exit $?"
  yarn typecheck && yarn lint && yarn validate:release-policy
</validation>

<success_criteria>Deviations 54 → 0 with the corpus as regression; six components reject the nine schemes by omission; provider escape hatch documented; `securityBoundary` set-valued and rendered; CSP lane green with the style inventory dispositioned; `minor` changeset present.</success_criteria>

<stop_conditions>Stop and report when a component's link rendering cannot omit `href` without breaking an APG role contract (record the alternative); when the CSP lane shows `DzThemeProvider`'s `<style>` tag is dropped under nonce enforcement (that is an ADR-20 defect — report, do not weaken the header); when a static `style=` site cannot move to a recipe without a public change.</stop_conditions>
```

---

### [x] TASK-R2-O5 — WCAG 2.5.7 resize affordance, the missing WCAG lanes, and the Baseline statement 🟠 *(was `[!owner design]`; D117 / D118 / D121 taken by the owner 2026-09-19 and implemented the same day)*

_Gap: N1-O3 drove target-size and reflow to 0 but left **2.5.7 Dragging
Movements open on three resize surfaces** — `DzResizable`, `DzSplitter`,
`DzTable` column resize — because no APG pattern gives a non-drag alternative
(`packages/core/docs/wcag-deviations.json`: 10 entries, 3 open surfaces); six
of its geometry changes were never reviewed by a designer. The matrix runs 6
conditions (default / forced-colors / reduced-motion / rtl / touch / zoom-400)
but **no lane** for 1.4.4 text resize at 200 %, 1.4.12 text-spacing overrides,
or 3.3.8 accessible authentication (`DzPasswordInput`, `DzOtpInput` paste
behaviour). The evidence pages' "Baseline Widely Available" statement claims
nothing because the repo declares no `browserslist` or build target (N2-D2
F-2). Sources: OSS-R4, CAND-24, CAND-25, `../program-2026-09/reports/N1-O3-wcag-fixes-handoff.md`
G5, `N2-D2-evidence-pages-handoff.md` F-2._

```xml
<role>You are an accessibility engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. Where the standard gives no pattern you propose one for the owner; you do not invent an interaction and ship it.</role>

<task>(1) Propose one single-pointer, non-drag affordance for the three resize surfaces — keyboard-plus-click-to-set (click a handle, then arrow keys / Home / End with announced sizes) or a numeric size input in a context menu — with a sketch of each, the APG precedents it borrows from, and a recommendation; after the owner picks, implement it in the shared resize composable and assert it in the matrix lane; ratchet `wcag-deviations.json` open surfaces 3 → 0. (2) Add matrix conditions `text-200` (1.4.4) and `spacing` (1.4.12), run them on 3 engines, triage into the exceptions file with reasons. (3) Audit `DzPasswordInput` and `DzOtpInput` against 3.3.8 (paste allowed, no cognitive test) and record the result per component. (4) Present the six unreviewed geometry changes (before/after screenshots exist in N1-O3) for design review and record the outcome. (5) Draft the browser-support statement backed by a declared tier (`browserslist` or build target) for the owner.</task>

<motivation>2.5.7 is the WCAG 2.2 criterion the EAA makes a procurement gate, and it is open on the three surfaces every data-heavy consumer uses. The two missing lanes are the only 2.2 AA items the matrix cannot currently measure; the support statement is published on every evidence page and currently claims nothing.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `node -e "const d=require('./packages/core/docs/wcag-deviations.json');console.log(d.filter(x=>x.criterion==='2.5.7'&&x.state==='open').length)"` → 0.
  - `grep -c "text-200\|spacing" e2e/matrix/conditions.spec.ts` → ≥ 2 and the Playwright config lists projects for them.
  - `ls docs/program-2026-09-04/reports/ | grep -i '3-3-8\|auth-paste'` → an audit note exists (or the handoff has the per-component table).
  - `ls browserslist .browserslistrc 2>/dev/null || grep -n 'target' packages/core/vite.config.* | head -1` → a declared tier exists and `apps/docs` evidence pages cite it.
</done_check>

<discovery>
  1. Read wcag-deviations.json and N1-O3's G5 section (the exact drag operations per surface) and its before/after screenshots inventory.
  2. Read the resize composable(s) the three surfaces share; check `DzSlider`'s keyboard model (already 2.5.7-compliant) as the closest in-repo precedent.
  3. Read e2e/matrix/conditions.spec.ts and the 6 existing conditions to add two more in the same shape; note zoom-400 already exists (1.4.10), text-200 is a different mechanism (font-size, not viewport).
  4. Read N2-D2 F-2 and the evidence-page generator for where the support statement is rendered.
</discovery>

<requirements>
  <proposal>
    <example>
      | Surface | Drag op | Proposed alternative | APG precedent | Cost |
      |---|---|---|---|---|
      | DzSplitter | move gutter | focus gutter → Arrow ±16 px, Shift+Arrow ±64 px, Home/End collapse/expand, live-region "Panel A 320 px" | window-splitter pattern | shared composable, 1 day |
    </example>
    Owner picks; implement only the picked design.
  </proposal>
  <lanes>Conditions are matrix projects like the existing six; failures are triaged per component into engine-exceptions with a reason, never masked; results feed the capability matrix.</lanes>
  <audit>3.3.8 per component: paste allowed · no transcription task · alternative available; recorded in the a11y section of the component's evidence.</audit>
  <statement>The support statement claims exactly what the matrix runs (3 engines, versions) plus the declared tier; nothing about browsers no lane measures.</statement>
</requirements>

<steps>
  1. Complete <discovery>; write the proposal table; hand off for the design pick — `[!owner design]`.
  2. After the pick: implement in the shared composable; matrix assertion; ratchet 3 → 0.
  3. Add the two conditions; run on 3 engines; triage.
  4. 3.3.8 audit; geometry design-review record; support statement + declared tier.
</steps>

<validation>
  yarn test packages/core/src/components/layout packages/core/src/components/data; echo "exit $?"      # read directly
  yarn test:e2e -- --project=chromium-text-200 --project=chromium-spacing (and firefox/webkit)
  yarn validate:docs-pages && yarn generate:capability-matrix && npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"
</validation>

<success_criteria>2.5.7 open surfaces 3 → 0 with a lane assertion; two new conditions on 3 engines with every failure triaged; 3.3.8 recorded for both credential inputs; six geometry changes reviewed with an outcome each; support statement backed by a declared tier and rendered on the evidence pages.</success_criteria>

<stop_conditions>Stop at the proposal until the owner picks. Stop and report when the picked affordance needs a new public prop (VERSIONING `minor`); when a text-200 failure is a token defect rather than a component defect (route to TASK-R5-O7); when the support tier the owner wants exceeds what any lane measures.</stop_conditions>
```

---

## 🟢 Lanes that complete the contract

### [~] TASK-R2-O6 — Visual-regression rollout and the CI gate 🟢

> **2026-09-19 — `[~]`, with a measured blocker.** `<done_check>` **0 of 4 by
> intent**; clause 2 can never fail (**D136**) and clause 4 can never pass
> (**D137**). Every platform-independent deliverable landed: the
> [Chromatic finish-or-retire packet](./reports/TASK-R2-O6-chromatic-finish-or-retire.md),
> the [`visual-baseline` EvidenceKind proposal](./reports/TASK-R2-O6-evidence-kind-proposal.md),
> the fifth-input verification plus a coverage-note fix (**D138**), the measured
> runtime budget (**286 snapshots in 182 s — no sharding**) and the CI-gate
> analysis. **The capture half is stopped, not skipped.** The container route
> works and is deterministic, but installing two font packages inside the same
> image changed **20 of 24** baselines and **10 of them dimensionally**, and
> `ci.yml` runs a bare `ubuntu-latest` — so no baseline captured anywhere today
> is CI evidence until the lane's container is pinned (**O6-D2**). Coverage
> stays **8 of 144**, deliberately. `continue-on-error` at `ci.yml:531` was left
> in place: comparison mode on linux fails **24 of 24** today, measured.
> Full detail: [`./reports/TASK-R2-O6-handoff.md`](./reports/TASK-R2-O6-handoff.md).

_Gap: N1-O6 decided the scope and built a per-component lane, but coverage is
**8 of 144** (pilot `buttons`, 16 baselines, `maxDiffPixels: 0`), 136
components are not covered, the authoritative baseline platform is undecided
(committed `linux` vs pilot `win32`), the CI visual step runs with
`continue-on-error: true`, and Chromatic is tokenless and non-blocking —
finish or retire is an owner call, as is `visual-baseline` as an
`EvidenceKind`. Depends on TASK-R2-O1 (platform decision). Sources: OSS-R7,
R-032, `../program-2026-09/reports/N1-O6-visual-regression-{memo,handoff}.md`._

```xml
<role>You are a visual-QA engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. A visual baseline is evidence only on the platform it was captured on; a diff is a finding, never an auto-accept.</role>

<task>Roll the visual lane out from the 8-component pilot to every Tier B+ component (then Tier A) on the authoritative platform TASK-R2-O1 recorded; capture baselines per theme and per condition the memo scoped; make the CI visual step blocking (remove `continue-on-error`) once the lane is deterministic; prepare the Chromatic finish-or-retire packet and the `visual-baseline` EvidenceKind proposal for the owner; wire coverage into the capability matrix as the fifth input the memo designed.</task>

<motivation>Anatomy and `ui` rollouts (TASK-R5-O2) and the 2.5.7 geometry work change pixels on purpose; without a blocking visual lane, an unintended pixel change is invisible until a consumer reports it. The memo did the design; only the rollout and the gate are missing.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `ls e2e/visual/baselines/ | wc -l` (or the path the memo names) → covers ≥ 89 Tier B+ components; the handoff's coverage ratchet reads ≥ 89/144.
  - `grep -n 'continue-on-error' .github/workflows/*.yml | grep -i visual | wc -l` → 0.
  - `ls docs/program-2026-09-04/reports/ | grep -i chromatic` → the finish-or-retire packet exists.
  - `npx tsx packages/tooling/src/validators/capability-matrix.ts` output shows visual cells `pass`/`fail` (not `unrun`) for Tier B+.
</done_check>

<discovery>
  1. Read N1-O6's memo (scope: per-component vs surface-level; conditions) and handoff (platform finding, `maxDiffPixels: 0`, 50/50 accepted); read TASK-R2-O1's platform decision.
  2. Read e2e/visual/ pilot spec and `visual:accept`; the rollout reuses the pilot's story selection rule.
  3. Measure runtime for the pilot ×18 to budget the full run; decide sharding.
</discovery>

<requirements>
  <determinism>Baselines captured on the authoritative platform only; fonts, animations (reduced-motion forced) and time-dependent content pinned; a flaky story is excluded with a reason, never retried into green.</determinism>
  <rollout_order>Tier D → C → B → A; per family; each slice's diffs reviewed and accepted by the `visual:accept` flow with the reason in the commit-ready message (owner accepts baselines — prepare, do not run `visual:accept` on non-pilot families without the owner's line).</rollout_order>
  <ci_gate>Blocking step only when the lane runs green three times on the platform; otherwise report why not.</ci_gate>
  <packets>Chromatic: finish (token, blocking) vs retire (delete config) with costs; EvidenceKind proposal with the schema change.</packets>
</requirements>

<steps>
  1. Complete <discovery>; write the rollout plan with runtime budget.
  2. Roll out by tier; capture; review diffs; record accepted/unaccepted per component.
  3. Wire coverage into the capability matrix; remove `continue-on-error` when deterministic.
  4. Write the two owner packets; hand off with coverage 8 → n/144.
</steps>

<validation>
  yarn test:e2e:visual > /tmp/visual.log 2>&1; echo "exit $?"     # read directly; lanes print nothing until done
  yarn validate:visual-baselines; echo "exit $?"
  yarn generate:capability-matrix && npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"
</validation>

<success_criteria>Visual coverage 8 → ≥ 89 (Tier B+) on the authoritative platform; lane deterministic (3 consecutive green runs) and blocking in CI; capability matrix reads visual cells; Chromatic and EvidenceKind packets written.</success_criteria>

<stop_conditions>Stop and report when a diff reveals an unintended regression (file it with the component and the commit range — do not accept); when the lane cannot be made deterministic for a family (exclude with reason); when the full run exceeds the CI budget (propose sharding, do not drop tiers).</stop_conditions>
```

---

### [~] TASK-R2-O7 — Performance contract completion: leak, long-task, memory, hydration 🟢

> **State at 2026-09-19** (see [`reports/TASK-R2-O7-handoff.md`](./reports/TASK-R2-O7-handoff.md)).
> All four lanes are **built, verified and captured over 5 runs** — 33 → **212**
> metrics proposed, leak clean on 22/22 components at tolerance 0. The one
> remaining deliverable, "stale perf cells 11 → 0", is **structurally
> unavailable to an agent**: a perf cell is stale iff the baseline's
> `sourceCommit` predates the component's, so only writing
> `packages/core/perf/baselines.json` can clear it, and README §5 `<authority>`
> withholds baseline replacement. Captured to a proposal instead and routed as
> **O7-D1**. The gap note's "11 stale perf cells" is stale — the measured count
> at `2d51eec` is **22**. Defects raised: **D131–D135**.

_Gap: `packages/core/perf/baselines.json` holds 33 metrics under the variance
policy (median + max(3σ, 5 %), ≥5 runs, downward ratchet) and
`validate:bundle-budget` gates size — but doc 06 §Performance also requires
memory, long-task and mount/unmount leak lanes and a Core-only vs Core+Pro
startup/hydration comparison, none of which exist; 11 perf cells in the
capability matrix are legitimately stale until a ≥5-run capture (N0-05 F5).
Depends on TASK-R1-O1. Sources: CAND-26, R-039, `../program-2026-09/reports/N0-05-rebind-handoff.md` F5._

```xml
<role>You are a performance engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. A number becomes a budget only after ≥5 runs on a quiet machine; a budget only ever ratchets down.</role>

<task>Add four lanes to the existing perf harness (`perf:capture`, `test:perf`, `DZUP_PERF_GATE`): (1) leak — 50 mount/unmount cycles per Tier C component asserting stable listener, observer, portal-node and detached-node counts; (2) long tasks — >50 ms tasks during a scripted interaction per Tier C component; (3) memory — heap delta after the cycle lane; (4) hydration — Core-only vs Core+Pro (using the Pro tarball fixture) time-to-interactive on the Nuxt fixture. Capture ≥5 runs, record under the variance policy, re-run the 11 stale perf cells, regenerate the capability matrix.</task>

<motivation>The tier rule says Tier C components carry a performance obligation, and the matrix currently marks 11 of their cells stale with nothing to refresh them. Leaks and long tasks are the two failure classes a size budget cannot see; the hydration comparison is what the Pro program will measure against.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `node -e "const b=require('./packages/core/perf/baselines.json');console.log(Object.keys(b.metrics??b).filter(k=>/leak|longTask|memory|hydration/i.test(k)).length)"` → ≥ 4.
  - `npx tsx packages/tooling/src/validators/capability-matrix.ts` output shows 0 stale perf cells.
  - `grep -n 'runs' packages/core/perf/baselines.json | head -1` shows ≥ 5 runs for the new metrics.
</done_check>

<discovery>
  1. Read packages/core/perf/ (harness, baselines, the variance policy from P5-05) and N0-05 F5 for the 11 stale cells and why.
  2. Read the Tier C list from quality-matrix.json (21 components) — the lane scope.
  3. Read packages/nuxt fixtures for the Core-only and Core+Pro tarball cases (TASK-R3-O1 may still be pending for Pro registration — measure what exists and say so).
</discovery>

<requirements>
  <policy>Reuse the P5-05 capture and threshold code; new metrics follow the same schema; no threshold is written before 5 runs; thresholds ratchet down only; gate stays behind DZUP_PERF_GATE until stable.</policy>
  <leak_assertion>Counts before and after 50 cycles must be equal within a documented tolerance of 0 for listeners/observers/portal nodes; any growth is a defect with the component named.</leak_assertion>
  <quiet_machine>Runs recorded with machine profile; a contended run is discarded, not baked in.</quiet_machine>
</requirements>

<steps>
  1. Complete <discovery>; add the four lanes in the harness's style with one seeded failure each.
  2. Capture ≥5 runs; record; re-run the 11 stale cells; regenerate.
  3. Hand off with per-component results and any leak found (as findings for TASK-R2-O3's register style).
</steps>

<validation>
  yarn perf:capture > /tmp/perf.log 2>&1; echo "exit $?"          # read directly
  DZUP_PERF_GATE=1 yarn test:perf; echo "exit $?"
  yarn generate:capability-matrix && npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"
</validation>

<success_criteria>Four new lanes with ≥5-run baselines under the variance policy; stale perf cells 11 → 0; any leak or long-task breach filed as a defect with component and metric; matrix perf cells cite the commit.</success_criteria>

<stop_conditions>Stop and report when a lane cannot run in under 30 min total (propose sampling); when the Core+Pro hydration case has no Pro registration yet (TASK-R3-O1) — record Core-only and say so; when a leak is found in a Reka primitive rather than a Dz component (upstream finding, not a fix here).</stop_conditions>
```
