# dzup-ui — Architecture Review Program 2026-09-04 (task prompts)

> What can still be done in `ui/dzup-ui` (OSS/core), derived from a complete
> re-read of **every** architecture document under
> `workspace-docs/repos/ui/docs/architecture/` — the Form System spec
> (2026-08-08), the Graph & Flow spec (2026-08-08), the system reassessment
> (2026-08-11) and the program reassessment (2026-08-28) — checked requirement
> by requirement against the code, the generated artifacts and the execution
> ledgers of the two predecessor programs
> ([`program-2026-08`](../program-2026-08/README.md),
> [`program-2026-09`](../program-2026-09/README.md)). Everything already
> delivered is listed in §3 and **bypassed**; everything else is a
> **ready-to-run prompt** for a coding agent. Companion Pro program:
> `ui/dzup-ui-pro/docs/program-2026-09-04/README.md`.
>
> Review date: **2026-09-04**. Baseline: `main` @ `99b963a` (clean worktree).
> **Re-verify §2 at session start and run each task's `<done_check>` before
> doing anything else (§4)** — this repository moves daily and a task may
> already be solved.

---

## 1. What the source documentation says (review summary)

| Document set | Verdict for OSS (verified 2026-09-04) |
|---|---|
| `dzup-ui-system-reassessment-2026-08-11/` (README, 01–09) | The **principles** stand (five-layer styling contract, generated truth, evidence by risk tier, admission gates). The P0–P5 packets, the FORM-OSS lane and the REC/SK lane are **done**. What was never turned into a task lives in the three *specification* documents: **03** (DX/theming — cascade layers, `asChild` allowlist, `ui` merge-order contract, provider adoption, the 10-section docs-page contract), **06** (quality/a11y/i18n/security — URL policy on navigation sinks, plural/select formatter, 200 % text / spacing / auth-paste lanes, leak and long-task budgets, SBOM and API-diff per release) and **08** (validation/release matrix — Node `import()` of every published entry, CSS layer/import-order fixture, min-peer lane, 8-section release report). Those become the R5/R1/R2 tasks here. Doc 03's `data-dz-part` / dotted layer spellings and the `DzThemeProvider` deprecation window are **superseded** by ADR-19/20 and are not re-tasked. |
| `dzup-ui-program-reassessment-2026-08-28/` (README, 01–06) | Every OSS packet it defined (N0-05, N1-O1…O6, N2-T1/A1…A4/D1…D3/S1, N5-01…05) **landed** in `e0d1707`/`5773f65`/`99b963a` — except N1-O4 (manual AT), which needs a human. The roadmap's facts are now stale in three places that matter: the committed tree is **not green** (`validate:all` fails at link 16 with 12 stale capability cells; `yarn test` carries 2 inherited failures); the generated artifacts stamp `51dec93`, four commits and 143 source files behind HEAD; and the 1.0 exit memo the program produced ([`../program-2026-09/reports/1-0-exit-criteria-2026-09.md`](../program-2026-09/reports/1-0-exit-criteria-2026-09.md)) measures **2 of 7** roadmap criteria met and refines them into **C1–C15**, which this program tasks one by one. |
| `dzup-form-system-2026-08-08/` (README, 01–07, schema, example) | Pro-owned implementation (F1–F8 complete at unit level). The OSS half — the form-control renderer contract and readiness gate — is **green** (251 pass · 0 gap · 5 future · 47 unrun at `99b963a`). Residuals for OSS: `DzGrid` has no span API (Pro spans by raw class), `DzStack` vocabulary, un-authored async-options stories, the `DzMention` seam, and two owner decisions (`utility` ownership kind, `time` profile). → TASK-R3-O3. |
| `dzup-graph-flow-system-2026-08-08/` (README, 01–13) | Pro-owned (`@dzup-ui-pro/graph` 0.1.0-alpha.0, G0–G8 complete). Nothing is tasked in OSS for the graph itself. Two OSS-side dependencies surfaced: the graph and Forms both need the **Core provider chain** consumed from Pro (ADR-20 seam — exists), and the graph's release rehearsal found that `@dzup-ui/contracts` shipped invalid ESM (fixed in N5-03; a *gate* that imports every published entry under Node is still missing → TASK-R1-O2). |
| Predecessor ledgers (`program-2026-08/EXECUTION-STATUS*.md`, `program-2026-09/EXECUTION-STATUS*.md`, 28 handoff reports) | The handoffs are the richest source of open work: each ends with a "still owed" list and an owner-decision register (~125 open `[!owner]` items across N1/N2/N5). Highest-value residuals: **no URL policy** on six navigation components (54 measured deviations — routed to N5-02, which did only the ARIA props); defect **D8** (`useDualModel` ignores external writes after the first user edit, 7 controls) unfixed; the i18n catalog **unreachable from the published package**; docs site **built, not deployed, no size gate**; AT matrix **0/534 executed** with a cell-resolution defect that publishes `pass` for all-`fail`; only **3 of 6** ADR-19 cascade layers ship; `DataState` widening never performed; provider motion/direction/formats/testIds have **0** consumers; ADR-18/19/20 still **Proposed** with acceptance packets ready. |

**Net conclusion for OSS:** construction is finished, machinery exists for
everything, and the remaining work is of four kinds: (a) make the committed
tree and its evidence *truthfully* green and re-runnable (R1, R2); (b) execute
the human-only evidence and fix the measured defects the machinery found (R2);
(c) complete the contracts the 08-11 specs promised but no packet built (R5);
(d) take the owner decisions that gate 1.0 and publication (R0). Nothing here
adds a component.

## 2. Verified baseline (2026-09-04) — re-verify at session start

| Fact | Value at `99b963a` |
|---|---|
| Branch / worktree | `main`, clean at census time, 0 ahead / 0 behind `origin/main`. Later on 2026-09-04 a concurrent session (Pro TASK-N0-04 decision 2) modified `CLAUDE.md`, `packages/tooling/README.md`, `packages/tooling/scripts/adr-registry.json`, `apps/landing/vite/serve-storybook.ts` — treat any such dirty work as someone else's and preserve it. |
| Package versions | `@dzup-ui/core` **0.2.0** · `tokens` 0.2.0 · `mcp` 0.2.0 · `contracts` 0.1.0 · `testing` 0.1.0 · `nuxt` / `compat` / `codemods` 0.1.0-alpha.0 · `tooling` 0.0.1 (private) |
| Release policy | `packages/contracts/VERSIONING.md` (0.x: minor = breaking); `packages/tooling/scripts/release-policy.json` `allowMajor: false`; **20 pending changesets**; no `pre.json`; nothing published (npm 404, `dzup-ui.com` NXDOMAIN) |
| ADRs | ADR-18, ADR-19, ADR-20 all **Proposed**; acceptance packets in `../program-2026-09/reports/N5-05-adr-{19,20}-acceptance-packet.md`; ADR status is gated nowhere; `adr-registry.json` ceiling 14 undocumented |
| Generated authority | `component-ownership.manifest.json` 1,327 entries, schema 1.1.0, **`sourceCommit 51dec93`** (stale); `capability-matrix.json` 144 rows, **12 stale cells**; `quality-matrix.json` 144/144 tiered (A55/B67/C21/D1); AT scaffold 89 files / 534 cells / **0 executed**; 32 `*.anatomy.ts`; 27 `.types.ts` declare `ui?:`; anatomy ceiling **113**; story-DoD open **0**; measured browser failures **0**; unclassified 29 |
| Known-red at HEAD (pre-existing — report, never call the aggregate green over them) | `yarn validate:all` **exit 1 at link 16/37** (`validate:capability-matrix`, 12 stale cells); `yarn test` **2 failures** (`landing-token-fallbacks`, `story-dod-tiers countOpen`); `packages/tooling` `tsc` 7 errors; `eslint e2e/` 9 errors (outside the lint target); 12 committed build leftovers in `packages/core/src/providers/` |
| Cross-repo context | `ui/dzup-ui-pro` `esmir` @ `90b8917`, clean except untracked `docs/program-2026-09/reports/`; graph program and QUAL/REL layer **committed**; esmir **6 ahead / 7 behind `origin/main`** (merge-back is an unexecuted owner decision); Pro peers still `@dzup-ui/core@^0.1.0-alpha.0` (tarballs need `--legacy-peer-deps`); **no Pro component-ownership manifest** (blocks the resolver Pro tier, 1.0 criterion 7) |

Quick re-verification (read-only):

```bash
git -C ui/dzup-ui status --short --branch | head
git -C ui/dzup-ui log -1 --format='%h %s'
node -e "console.log(require('./ui/dzup-ui/packages/core/manifests/component-ownership.manifest.json').sourceCommit)"
cd ui/dzup-ui && npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "capability-matrix exit $?"
git -C ui/dzup-ui-pro status --short --branch | head -3; git -C ui/dzup-ui-pro log -1 --format='%h %s'
```

## 3. Closed ledger — already done, **bypass** (cite, never redo)

| Program | Tasks | Status | Proof |
|---|---|---|---|
| 2026-08 foundation | TASK-OSS-P0-01/02 · P1-01…04 · P2-01…03 · P3-01…04 · P4-01…05 · P5-01/03/04/05/06 | done | `../program-2026-08/EXECUTION-STATUS.md` |
| 2026-08 foundation | TASK-OSS-P5-02 (51 story-DoD items) | done via TASK-N1-O1 | `../program-2026-09/reports/N1-O1-story-dod-handoff.md` |
| 2026-08 FORM-OSS | TASK-FORM-OSS-01…04 | done (gate green 251/0/5/47) | `../program-2026-08/EXECUTION-STATUS-FORM.md` |
| 2026-08 REC/SK | REC-01 · SK-1 · SK-2 · APP-1 · AR-2 | done | `../program-2026-08/EXECUTION-STATUS-REC.md` |
| 2026-09 | TASK-N0-05 · N1-O1 · N1-O2 · N1-O3 · N1-O5 · N1-O6 | done (each handoff lists "still owed" items — tasked here) | `../program-2026-09/EXECUTION-STATUS.md`, `reports/N0-05-*`, `N1-O*-handoff.md` |
| 2026-09 | TASK-N1-O4 (manual AT execution) | **open — human tester** | carried forward as **TASK-R2-O2** |
| 2026-09 | TASK-N2-T1 · A1 · A2 · A3 · D1 · D2 · D3 · S1 | done (S1: 3 of 12 families) | `../program-2026-09/EXECUTION-STATUS-N2.md` |
| 2026-09 | TASK-N2-A4 (registry evaluation) | done — ends in owner decision A4-D1 | carried as **TASK-R0-O1** |
| 2026-09 | TASK-N5-01 · 02 · 03 · 04 · 05 | done (N5-04/05 end in owner decisions) | `../program-2026-09/EXECUTION-STATUS-N5.md` |

Rule: if a task below asks for something a report above already records,
**cite the report and move on**. The `<done_check>` in every prompt exists so
the check is mechanical, not a judgement.

## 4. How to run a task — the check-first protocol

Every prompt in this program starts with a `<done_check>` block. Execute it
before reading the rest of the prompt:

1. **Re-verify the baseline (§2).** If HEAD moved, note the new commit; every
   number you quote later is bound to *that* commit, not to this README.
2. **Run the `<done_check>` commands exactly as written.**
   - *All checks pass* → record `[x] found-done <date> — <one-line evidence>`
     in `EXECUTION-STATUS.md` and move to the next task in dependency order.
     Do not "improve" work a passing check covers.
   - *Some pass* → run **only** the residual steps; say which steps you
     skipped and why in the handoff.
   - *None pass* → run the task.
3. **Never redo work a report records.** Predecessor handoffs under
   `../program-2026-09/reports/` and `../program-2026-08/` are authoritative
   for what was done; cite them by path.
4. **Record as you go.** Update `EXECUTION-STATUS.md` (status, date, report
   path, ratchet movements) when the task ends, and keep a progress note in
   the handoff while it runs — long tasks cross context windows, and the
   filesystem is the memory. No commits: the owner commits.
5. **Handoff shape** is fixed by `<repo_conventions>` §5 below. Bind every
   metric to a commit; report tooling failures and component failures
   separately; never collapse maturity levels.

## 5. How these tasks are written

Each task is a prompt authored per Anthropic's
[Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
and the [prompt-engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
("define success criteria before you tune a prompt"). The techniques used, in
the order the guide lists them: **be clear and direct** (numbered steps when
order matters; "implement", not "suggest"); **add context and motivation** (a
`<motivation>` block explains *why* so the agent can generalise); **examples**
in `<example>` tags wherever an output shape would otherwise drift (ledger
rows, run records, decision sheets); **XML structure** with the same tag names
in every prompt; **a role**; **investigate before answering** (a `<discovery>`
phase whenever repo state is uncertain — never speculate about code you have
not opened); **self-check before finishing** (`<success_criteria>` are
measurable and re-run at the end); **avoid over-engineering** (every prompt
carries a scope boundary); **long-horizon state** (progress notes, ledgers,
ratchets — the filesystem is the memory across context windows); and
**reversibility** (no commit/push/publish/CI-dispatch/baseline replacement is
authorised — those are owner actions, always marked `[!owner]`).

Prompt anatomy (identical in every task file):

```xml
<role>who the agent is, in which repo, following which conventions</role>
<task>the deliverable, in one paragraph, verbs first</task>
<motivation>why it matters — what breaks or stays unprovable without it</motivation>
<done_check>commands/paths a fresh agent runs FIRST; the protocol in README §4 decides what happens next</done_check>
<discovery>what to read/measure before editing (only when state is uncertain)</discovery>
<requirements>nested, named constraints — scope boundaries, formats, invariants</requirements>
<steps>numbered, dependency-ordered</steps>
<validation>the exact commands, narrowest first, read directly (never through a pipe)</validation>
<success_criteria>measurable, re-checked at the end; ratchet old → new</success_criteria>
<stop_conditions>when to stop and report instead of deciding</stop_conditions>
```

Every prompt assumes the conventions below (copy the block with the prompt when
running an agent outside this repo):

```xml
<repo_conventions source="ui/dzup-ui/CLAUDE.md + ADR-18/19/20 + packages/contracts/VERSIONING.md + program-2026-09 ledgers — authoritative, overrides defaults">
  <packages>contracts (types, zero runtime deps, 0.1.0) → tokens (0.2.0) → core (0.2.0; tokens + contracts) → compat/codemods/nuxt/mcp/testing/tooling. compat never imported by stable core. Core NEVER imports Pro runtime source; Pro depends inward on Core contracts. mcp (0.2.0) is a PUBLIC package governed through packages/mcp/docs/mcp-tool-surface.json + validate:mcp. Release policy: packages/contracts/VERSIONING.md (0.x, minor = breaking, `major` refused by validate:release-policy R5 until the deliberate 1.0 act); packages/tooling/scripts/release-policy.json is the data (published: contracts, core, mcp, nuxt, testing, tokens · withheld: compat, codemods · private: tooling, apps).</packages>
  <file_layout dir="packages/core/src/components/{family}/">
    Dz{Name}.vue · Dz{Name}.types.ts (extend Base*Props from @dzup-ui/contracts) · Dz{Name}.tokens.ts · Dz{Name}.variants.ts (tv()) · Dz{Name}.anatomy.ts (ADR-19; parts/states/tokens/rtl) · Dz{Name}.contract.spec.ts · Dz{Name}.spec.ts · family index.ts. Stories NOT colocated: packages/core/stories/{family}/Dz{Name}.stories.ts. AT scripts: e2e/at-matrix/. Visual baselines: e2e/visual/. Docs pages are GENERATED into apps/docs from component-meta.json + anatomy + capability matrix — never hand-edit a generated page.
  </file_layout>
  <styling>tv() in .variants.ts (validate:tv-slots guards uncalled slot functions). NO &lt;style scoped&gt;. NO raw color literals; every CSS value references var(--dz-*). Five-layer contract per ADR-19: DTCG tokens (dist/tokens.dtcg.json, ./dtcg subpath) → reachable component tokens → typed tv() recipes → stable data-part/data-state (spelling: `data-part`, NOT `data-dz-part`) → typed `ui` overrides. Cascade layers shipped today: @layer dz-tokens, dz-base, dz-components (ADR-19 names six — the gap is TASK-R5-O1, not precedent). dzup-ui is restyleable by contract, NOT unstyled.</styling>
  <generated_authority>Generated artifacts are the truth and a generator reports, never decides: component-ownership.manifest.json (1,327, schema 1.1.0) · public-api.manifest.json · quality-matrix.json (144/144 tiered A55/B67/C21/D1, SecurityBoundary axis) · capability-matrix.json (144 rows) · component-meta.json (208 records) · rtl matrix · AT matrix (534 cells) · perf baselines (packages/core/perf/baselines.json, median + max(3σ, 5 %), ≥5 runs, downward only) · security/coverage.json · llms{,-full}.txt · docs pages. Regeneration order when several are stale: ownership → quality → capability → component-meta → llms → docs-pages → playground seeds. Ratchets move one way only: anatomy non-declaring 113↓ · story-DoD 0 · measured browser failures 0 · unclassified 29↓ · security deviations ceiling 54↓ · component-meta description debts ↓ · perf thresholds ↓.</generated_authority>
  <evidence_rules>Bind every quoted metric to a commit (an artifact's sourceCommit is stamped by construction — check it equals HEAD before quoting). A green local run is "locally qualified" — never CI, release, or production evidence. Stale/unrun cells stay visible; never collapse evidence into aggregate test counts. AT matrix rows are append-only run records with tester/AT/browser/date; an agent NEVER fills a manual result cell. Maturity ladder: specified → implemented → focused-validated → aggregate-qualified → browser/AT-qualified → packaged → released — never collapse.</evidence_rules>
  <validation>
    Narrowest owning command first, then widen. `yarn validate:all` chains typecheck + lint + 42 validators = **44 links** (verified 2026-09-19 against `package.json`; it was 37 when this README was written and 43 at HEAD `2d51eec` — the chain gained `validate:at-scripts` in the working tree. COUNT IT, never quote it: `node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"`); run it END-TO-END and read the exit code DIRECTLY (a pipe returns tail's status; the aggregate reported green over a stale artifact for three packets — S1-F10). Known-red at 99b963a: link 16 (capability-matrix, 12 stale cells), `yarn test` 2 inherited failures, tooling tsc 7, eslint e2e/ 9 — report them as pre-existing, do not fix them inside unrelated tasks, do not call the aggregate green over them. Key lanes: yarn typecheck · yarn lint · yarn test · yarn validate:{ownership,tokens,tokens:dtcg,rtl,exports,boundaries,anatomy-parts,tv-slots,story-dod,at-matrix,at-scripts,capability-matrix,component-meta,llms,docs-pages,playground-parity,release-policy,mcp,form-readiness,hardcoded-strings,visual-baselines} · yarn build · yarn storybook:build · yarn storybook:test · yarn test:e2e (18 Playwright projects: 3 engines × 6 conditions) · yarn test:e2e:visual · yarn test:nuxt-fixtures · perf lanes behind DZUP_PERF_GATE. Report tooling failures and component failures SEPARATELY.
  </validation>
  <authority>No commit, push, CI dispatch, baseline replacement, package publication, registry mutation, deployment, domain/DNS change, entitlement or production action is authorised by any prompt. ADR-18/19/20 acceptance is an owner decision (packets exist). Preserve all unrelated dirty work in ui/dzup-ui, ui/dzup-ui-pro and workspace-docs. Do not rebuild workspace-docs/indexes/document-catalog.jsonl. Do not check out or clean the Pro repository from an OSS task.</authority>
  <handoff>End every task with, in this order: implemented files + API effect · focused validation output · aggregate qualification (what ran, what is still red and why — pre-existing vs new) · ratchet movements (old → new) · owner decisions raised (numbered, with options and a recommendation) · ranked next packet. Write it to docs/program-2026-09-04/reports/&lt;TASK-ID&gt;-handoff.md and update EXECUTION-STATUS.md. Update workspace-docs/repos/ui/docs only with facts bound to the exact source commit used.</handoff>
</repo_conventions>
```

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[x] found-done` (done-check passed, nothing run) · `[!]` blocked on owner decision
> **Priority:** 🔴 blocks other work / active risk · 🟠 trust & quality · 🟢 growth & polish
> **`[!owner]`** — the task ends in an owner decision; the agent prepares, the owner decides/executes.

## 6. Task files and dependency order

```text
R0  Custody & standing decisions [!owner]                          release-exit-tasks.md
 ├─ R0-O1  publication decision packet + owner-decision register
 └─ R0-O2  ADR-18/19/20 acceptance execution            (after R5-O1, R1-O2)
R1  Release exit (1.0 criteria C1–C15, release evidence)           release-exit-tasks.md
 ├─ R1-O1 🔴 truthfully green committed tree             ← FIRST: nothing quotes a number before this
 ├─ R1-O2 🔴 consumer-truth gates (Node import() of every export · pack freshness · i18n catalog export)
 ├─ R1-O3  release evidence parity with Pro (API diff · SBOM · rehearsal report)   (after R1-O1)
 ├─ R1-O4  CI dispatch: min-runtime · nuxt-majors · vue-next · min-peer lane [!owner]
 ├─ R1-O5  docs site: size gate · validate:registry · deployment [!owner]
 └─ R1-O6  peer/dependency hygiene execution [!owner]
R2  Evidence completion                                            evidence-completion-tasks.md
 ├─ R2-O1 🔴 re-run built evidence from the committed tree; persist the browser record  (after R1-O1)
 ├─ R2-O2  AT matrix: schema fixes → wave 1 [!owner tester]
 ├─ R2-O3  defect register close-out (D8 controlled/uncontrolled first)
 ├─ R2-O4  URL policy for the six navigation sinks (+ CSP browser lane)
 ├─ R2-O5  WCAG 2.5.7 resize affordance · missing WCAG lanes · Baseline statement [!owner design]
 ├─ R2-O6  visual-regression rollout + CI gate                (after R2-O1)
 └─ R2-O7  performance contract completion (leak/long-task/memory)  (after R1-O1)
R3  Cross-repo & forms                                             contract-conformance-tasks.md
 ├─ R3-O1 🔴 consume the Pro ownership manifest → resolver Pro tier   (after Pro TASK-R1-P4)
 ├─ R3-O2  sanitizer provider seam in Core (ADR-20 amendment)  → unblocks Pro TASK-R5-P2
 ├─ R3-O3  form-layout residuals (DzGrid span [!owner], DzStack, async-options stories)
 └─ R3-O4  shared security-corpus format (with Pro TASK-R2-P9)
R5  Contract & spec conformance (08-11 docs 03/06/08)               contract-conformance-tasks.md
 ├─ R5-O1  ADR-19 pre-acceptance code work (cascade layers · DataState · layer-order fixture)
 ├─ R5-O2  anatomy + ui + rtl rollout to Tier B complete       (after R5-O1 vocabulary)
 ├─ R5-O3  provider adoption rollout (motion · direction · formats · testIds · defaults)
 ├─ R5-O4  i18n completeness (plural/select · first locale pack [!owner] · Arabic typeface [!owner])   (after R1-O2)
 ├─ R5-O5  docs-page contract completion (keyboard tables · parts/states/tokens · provider hooks)   (after R5-O2)
 ├─ R5-O6  composition contract (asChild allowlist · multi-root · ui merge order)
 ├─ R5-O7  token gates + DTCG follow-ons
 ├─ R5-O8  metadata description debt
 └─ R5-O9  toolchain migrations execution (Vitest 4 browser mode · tsdown/Vite 8)
R6  Watch list / recorded refusals — §8, no tasks
```

| File | Contents |
|---|---|
| [`release-exit-tasks.md`](./release-exit-tasks.md) | TASK-R0-O1…O2, TASK-R1-O1…O6 — the owner packets and the engineering that makes a 1.0 / first publication *legal*: green tree, consumer-truth gates, release evidence, CI dispatch, docs-site publication, peer hygiene. |
| [`evidence-completion-tasks.md`](./evidence-completion-tasks.md) | TASK-R2-O1…O7 — re-run and persist what P5 built, execute the human-only AT cells, fix the measured defects (D8, URL policy, 2.5.7), roll out visual and performance lanes. |
| [`contract-conformance-tasks.md`](./contract-conformance-tasks.md) | TASK-R3-O1…O4, TASK-R5-O1…O9 — cross-repo seams (Pro tier, sanitizer), form residuals, and the 08-11 spec requirements no packet ever built (cascade layers, anatomy/`ui` completion, provider adoption, i18n, docs contract, composition, token gates, metadata, toolchain). |
| [`EXECUTION-STATUS.md`](./EXECUTION-STATUS.md) | Live ledger — one row per task; update it as the protocol in §4 says. |

Suggested execution order: **R1-O1 → R1-O2 → R2-O1** (the tree and its
evidence become citable), then R2-O3/R2-O4/R5-O1/R5-O3 in parallel by separate
agents, then the owner packets R0-O1/R0-O2/R1-O4/R1-O5/R2-O2, then the rest by
priority.

## 7. Open owner decisions (consolidated by TASK-R0-O1)

The predecessor ledgers hold ~125 open `[!owner]` items. The ones that gate a
release or another task, in the order they bite:

1. **A4-D1 publish-or-freeze** — packages 404 on npm, the domain does not
   resolve, three registries ship 282 files that resolve nothing (TASK-R0-O1).
2. **N5-01 D1** — `validate:changelog` (needs an ISO date) and `validate:mcp`
   (forbids one) are mutually exclusive; the first `changeset version` turns
   `validate:all` red (TASK-R1-O1 proves it with a dry run; TASK-R0-O1 decides).
3. **ADR-18/19/20 acceptance** — packets ready; code must first ship the three
   missing cascade layers and widen `DataState` (TASK-R5-O1 → TASK-R0-O2).
4. **AT tester + cadence** (wave 1 = 44 cells ≈ 21 h) and which of the three
   honest 1.0 options for criterion C9 applies (TASK-R2-O2).
5. **WCAG 2.5.7 affordance** for pane/column resize — no APG precedent (TASK-R2-O5).
6. **URL-policy rejection shape and escape hatch** (TASK-R2-O4).
7. **CI dispatch** of `validate-min-runtime`, `nuxt-majors`, `vue-next` (TASK-R1-O4).
8. **Docs deployment target / Baseline browser tier / `browserslist`** (TASK-R1-O5, TASK-R2-O5).
9. **`generate:exports` API drift** (would drop 5 composables, add 2) and the
   29 unclassified symbols / schema 1.2.0 kinds (TASK-R0-O1).
10. **`lucide-vue-next` → `@lucide/vue`, Node 20 drop, `apps/sandbox` removal** (TASK-R1-O6).
11. **First non-`en` locale and the Arabic typeface** (TASK-R5-O4).
12. **`data-scope` equivalent, `DzGrid` span API, `utility` ownership kind, `time` profile** (TASK-R5-O1, TASK-R3-O3).

## 8. Explicitly **not** tasked (and why)

- New component families for catalog size; a blanket unstyled mode; a second
  styling engine — standing refusals, re-affirmed by both reassessments.
- Graph work in OSS — Pro-owned (`@dzup-ui-pro/graph`); see the Pro program.
- Re-spelling doc 03's `data-dz-part` / dotted-layer / `DzThemeProvider`
  deprecation language — superseded by ADR-19/20 decisions, not defects.
- Collaboration/CRDT primitives — recorded refusal until demand evidence exists.
- A Figma kit and Tokens Studio sync — deferred `[!owner]` until the docs site is live.
- Repeating the two rejected mobile-performance experiments without a new hypothesis.
- Filling any manual AT result cell by an agent — a fabricated row is worse than an empty one.
- Pro custody (merge-back execution, ADR-16, ownership manifest emission) — Pro program R0/R1.
- Commit / push / CI dispatch / publication / DNS — owner authority, every time.

**Watch list (quarterly, no task):** Storybook `addon-mcp` Vue parity ·
CSF Factories Vue support · Context7 indexing of the `.md` endpoints ·
WCAG 3.0 (draft, not a target) · Vue 3.6 GA and Vapor interop (lane exists) ·
Nuxt 4.4.6+ Node 20 drop (ADR-18 amendment input).
