# dzup-ui — Architecture-Document Program 2026-09-22 (task prompts)

> What can still be done in `ui/dzup-ui` (OSS/core) **according to the
> architecture directory** — a complete re-read of all 42 files under
> `workspace-docs/repos/ui/docs/architecture/`: the Form System spec
> (`dzup-form-system-2026-08-08/`, README + 01–07 + meta-schema + example), the
> Graph & Flow spec (`dzup-graph-flow-system-2026-08-08/`, README + 01–13), the
> system reassessment (`dzup-ui-system-reassessment-2026-08-11/`, README + 01–09)
> and the program reassessment (`dzup-ui-program-reassessment-2026-08-28/`,
> README + 01–06) — each requirement checked against the code, `git`, the
> generated artifacts and the ledgers of the three programmes that have run
> since ([`program-2026-08`](../program-2026-08/README.md),
> [`program-2026-09`](../program-2026-09/README.md),
> [`program-2026-09-04`](../program-2026-09-04/README.md)).
>
> Everything already delivered is listed in §3 and **bypassed**; everything
> else is a **ready-to-run prompt** for a coding agent. Companion Pro program:
> [`ui/dzup-ui-pro/docs/program-2026-09-22-architecture/README.md`](../../../dzup-ui-pro/docs/program-2026-09-22-architecture/README.md).
>
> Review date: **2026-09-22**. Baseline: `main` @ `589be13`, **clean worktree
> (0 dirty paths)**, verified with `git`, not read from a custody table.
>
> **Sibling programmes, not successors.** Three programmes now hold open OSS
> work and they do not overlap:
> [`program-2026-09-04`](../program-2026-09-04/README.md) holds the R-series
> (its R0/R1/R2 residue is still the largest body of work);
> [`program-2026-09-22-planning`](../program-2026-09-22-planning/README.md) holds what the
> `docs/planning/` directory left open; **this** programme holds what the
> `docs/architecture/` documents specify and no packet ever built. Check all
> three ledgers before starting anything.
>
> **Re-verify §2 at session start and run each task's `<done_check>` before
> doing anything else (§4)** — this repository moves daily and a task may
> already be solved.

---

## 1. What the architecture documents say (review summary)

| Document set | Verdict for OSS (verified 2026-09-22 at `589be13`) |
|---|---|
| `dzup-ui-system-reassessment-2026-08-11/` (README, 01–09) | **Principles stand; most of the plan is built.** P0–P5, the FORM-OSS lane and the REC/SK lane closed in 2026-08; the 2026-09 and 2026-09-04 programmes delivered the five-layer styling contract to Tier B, the provider chain, the DTCG export, the docs site, MCP governance and the release-policy machinery. What the three *specification* documents still ask for and no packet has delivered: doc 08's **package-qualification matrix** — seven of twelve rows have no fixture (tree-shaking with the optional engine separated, min *and* current Vue/Reka peers, optional-peer absent/incompatible/installed, CSP + Trusted-Types consumer fixture, licence/entitlement failure behaviour, tarball file/export/API diff, SBOM + provenance + artifact hash) → **TASK-S2-O1**; doc 08's **eight-section release report** and its **eleven release stop conditions as an executable gate**, plus doc 06's **API-compatibility and deprecation machinery** (runtime dev warning, typed annotation, first-deprecated / earliest-removal metadata, codemod per deprecation, rollback) → **TASK-S2-O2**; doc 06's **task-based manual AT evidence by tier** → **TASK-S1-O1** (0 of 534 cells executed, unchanged since P5-04); doc 06's **eight performance scenarios** → **TASK-S1-O4**; doc 06's **internationalization contract** beyond one locale → **TASK-S5-O1**. Doc 03's `data-dz-part` / dotted-layer spellings and the `DzThemeProvider` deprecation window remain **superseded** by ADR-19/20 and are not re-tasked. |
| `dzup-ui-program-reassessment-2026-08-28/` (README, 01–06) | Every OSS packet it defined (N0-05, N1-O1…O6, N2-T1/A1…A4/D1…D3/S1, N5-01…05) landed, and the 2026-09-04 R-series closed or owner-blocked all 25 of its successors. Three of its facts are now stale in the direction that matters: the committed tree is green but **its evidence is not bound to HEAD** (every generated artifact stamps `527dbd1`, HEAD's parent) → **TASK-S0-O1**; the capability matrix still carries **37 stale and 441 unrun** cells, so the roadmap's own N1 exit condition ("zero unexplained `unrun` in Tier C/D") is 126 Tier-C cells away → **TASK-S1-O2**; and its N0-03 item — **ADR-18/19/20 accepted** — is still open while 104 anatomy files and the whole provider chain build on three `Proposed` decisions → **TASK-S0-O3**. Its N2 exit ("discover, install, style and verify a component from published surfaces alone") is unmeetable while the docs site is built and undeployed → **TASK-S2-O3**, and its N5-T1 toolchain moves are prepared but unscheduled → **TASK-S5-O2**. |
| `dzup-form-system-2026-08-08/` (README, 01–07, schema, example) | **Implemented in the commercial tier; nothing in this repository builds a form document, a renderer or a builder.** What the spec asks of `ui/dzup-ui` is the *primitive* layer its doc 04 §4 renderer table composes, and four obligations there are open: `DzGrid` has **no span API**, so a schema-driven grid layout cannot be expressed without a raw class — which is the very thing doc 03 §3 forbids a document to carry; `DzStack` has no `none\|xs\|sm\|md\|lg` gap vocabulary; the **async-options stories** for the seven seam controls were never authored, leaving cascading option loads — the behaviour schema-driven forms fail on most — with no story evidence; and the `DzMention` seam is unresolved. Two owner decisions ride along (`utility` ownership kind, `time` format profile). → **TASK-S3-O2**. Doc 06 §10 (UI/XSS safety) adds fixture classes this repository's security corpus lacks → **TASK-S3-O3**. |
| `dzup-graph-flow-system-2026-08-08/` (README, 01–13) | **Entirely out of scope for this repository. Nothing in `ui/dzup-ui` builds graph, and nothing here should** — doc 12 places the package, its renderer dependency and every domain preset in the commercial tier. Three obligations the spec nevertheless lays on the OSS primitives: doc 05's message catalog needs the Core provider chain (exists — ADR-20); doc 12's build controls require a Node `import()` gate over every published entry (built in 2026-09-04 R1-O2 — bypassed); and §15's "never `v-html` an untrusted label, never fetch a document-provided URL" adds corpus classes → **TASK-S3-O3**. The one live dependency in this repository is the **resolver's second tier**, which has had no manifest to resolve against since P1-02 → **TASK-S3-O1**. |
| Predecessor ledgers (`program-2026-08/`, `program-2026-09/`, `program-2026-09-04/` — 51 OSS handoff reports) | The 2026-09-04 lane is effectively closed: 13 rows `[x]`, 4 rows `[~]` each with a *named structural* residual, 8 rows `[!]` waiting on an owner. Nothing was abandoned. The residuals are of exactly four kinds, and they are this programme: (a) evidence that exists but is **bound to the wrong commit** (S0-O1, S1-O2); (b) lanes **built but never captured on an authoritative platform** (S1-O3, S1-O4); (c) evidence only a **human** can produce (S1-O1); (d) **owner decisions** whose engineering is complete (S0-O2, S0-O3, S2-O3, S2-O4, S3-O2, S5-O1, S5-O2). |

**Net conclusion for OSS.** Construction is finished. No task in this programme
adds a component, a family, a styling engine or an unstyled mode. The work is:
bind the evidence to HEAD so any number can be quoted at all (**S0**); execute
and capture what the machinery already produces, including the half only a
person can produce (**S1**); build the consumer-truth and release contracts the
08-11 documents specify and nothing implements (**S2**); finish the two
cross-repo seams (**S3**); and close the internationalization and toolchain
residue (**S5**).

## 2. Verified baseline (2026-09-22) — re-verify at session start

| Fact | Value at `589be13` |
|---|---|
| Branch / worktree | `main` @ **`589be13`** ("feat: land program-2026-09-04 R0/R1 — release-exit lane"), **clean — 0 dirty paths**, 0 ahead / 0 behind `origin/main`. Parent `527dbd1` (R2 lane), grandparent `2d51eec` (R3/R5 lane). |
| Package versions | `@dzup-ui/core` **0.2.0** · `tokens` 0.2.0 · `mcp` 0.2.0 · `contracts` 0.1.0 · `testing` 0.1.0 · `nuxt` / `compat` / `codemods` 0.1.0-alpha.0 · `tooling` 0.0.1 (private) |
| Apps | `apps/docs` (VitePress, built — `.vitepress/dist` present, **not deployed**) · `apps/landing` · `apps/storybook` · `apps/sandbox` (retired, still a workspace) |
| Release state | **38 pending changesets**; `packages/contracts/VERSIONING.md` (0.x: minor = breaking); `release-policy.json` `allowMajor: false`; **nothing published** |
| ADRs | **ADR-18, ADR-19, ADR-20 all `Proposed`** — verified in their own front matter. Acceptance packets exist (`../program-2026-09/reports/N5-05-adr-{19,20}-acceptance-packet.md`); engineering complete (2026-09-04 TASK-R0-O2); signature outstanding. `validate:adr-references` now ratchets `maxProposedCitedFromCode` = **3** |
| Generated authority | `component-ownership.manifest.json` **1,338 entries**, schema 1.1.0, **`sourceCommit 527dbd1`** — *one commit behind HEAD*. Kinds: type 885 · public-component 144 · recipe 143 · compound-part 65 · composable 41 · **unclassified 29** · token-module 18 · compat-alias 11 · internal 2. `quality-matrix.json` **144/144 tiered** (A 55 · B 67 · C 21 · D 1), `sourceCommit 527dbd1`. `capability-matrix.json` **144 rows**, `sourceCommit 527dbd1`, totals **fail 0 · stale 37** (B 10 · C 26 · D 1) **· unrun 441** (A 65 · B 275 · C 100 · D 1) **· excepted 17** |
| Styling contract | **all six ADR-19 cascade layers ship**: `@layer dz-reset, dz-tokens, dz-base, dz-components, dz-utilities, dz-overrides`. **104** `*.anatomy.ts` files; **90** `.types.ts` declare `ui?:` |
| Accessibility evidence | AT matrix **89 files / 534 cells / 0 executed** — every cell `unrun`, verified by grep, not by ledger. `wcag-deviations.json` present and schema'd. The capability matrix's browser input records **24 projects** (3 engines × 8 conditions) |
| i18n | `packages/core/src/i18n/locales/`: **`en.json` + `de.json`** — `de` is a scaffold awaiting a named translator (`[!owner]`) |
| Scale | 208 `.vue` under `packages/core/src/components/` · 484 spec files · 181 story files |
| Validation chain | `yarn validate:all` = **50 links** at HEAD. **COUNT IT, never quote it:** `node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"` |
| External precondition (the **only** one) | The resolver's second tier needs an ownership manifest published by the commercial package. **It does not exist**, so `includePro` resolves nothing and the `core-pro` tarball fixture cannot run. This is a yes/no probe, not a reason to inspect another repository — see the re-verification block below |
| Other checkouts | `workspace-docs` is dirty — preserve it. Any sibling checkout on the machine is **out of scope**: no task here reads its git state, its ledgers or its source |

Quick re-verification (read-only, ~15 s; **read exit codes directly, never through a pipe**):

```bash
git -C ui/dzup-ui status --short --branch | head -3
git -C ui/dzup-ui log -1 --format='%h %s'
cd ui/dzup-ui
node -e "const m=require('./packages/core/manifests/component-ownership.manifest.json');console.log('ownership sourceCommit',m.sourceCommit)"
node -e "const c=require('./packages/core/docs/capability-matrix.json');console.log('cap sourceCommit',c.sourceCommit);console.log(JSON.stringify(c.totals))"
grep -rho '| unrun |' e2e/at-matrix/*.md | wc -l    # 534 = nothing executed
node -e "console.log('validate:all links',require('./package.json').scripts['validate:all'].split('&&').length)"
grep -h -m1 -i 'status' docs/adr/ADR-1[89]-*.md docs/adr/ADR-20-*.md
# the one external precondition, as a yes/no probe — nothing else about a sibling checkout:
node -e "try{require.resolve('@dzup-ui-pro/pro/package.json');console.log('second-tier package resolvable')}catch{console.log('second-tier package NOT installed — TASK-S3-O1 runs its schema + fixture halves only')}"
```

If HEAD has moved, **every number in §2 is void** until you re-measure it.
Quote the commit you measured at, never this README.

## 3. Closed ledger — already done, **bypass** (cite, never redo)

| Programme | Tasks | Status | Proof |
|---|---|---|---|
| 2026-08 foundation | TASK-OSS-P0-01/02 · P1-01…04 · P2-01…03 · P3-01…04 · P4-01…05 · P5-01…06 | done | [`../program-2026-08/EXECUTION-STATUS.md`](../program-2026-08/EXECUTION-STATUS.md) |
| 2026-08 FORM-OSS / REC / SK | FORM-OSS-01…04 · REC-01 · SK-1 · SK-2 · APP-1 · AR-2 | done | `../program-2026-08/EXECUTION-STATUS-{FORM,REC}.md` |
| 2026-09 (N-series) | N0-05 · N1-O1/O2/O3/O5/O6 · N2-T1/A1/A2/A3/A4/D1/D2/D3/S1 · N5-01…05 | done | [`../program-2026-09/EXECUTION-STATUS.md`](../program-2026-09/EXECUTION-STATUS.md) + 28 reports |
| 2026-09-04 (R-series) | R1-O1 (green tree) · R1-O2 (consumer-truth gates: Node `import()`, pack freshness, i18n export) · R1-O3 (release-evidence bundle) | `[x]` | `../program-2026-09-04/reports/TASK-R1-O{1,2,3}-handoff.md` |
| 2026-09-04 | R2-O3 (defect register, D8) · R2-O4 (URL policy, six navigation sinks) · R2-O5 (WCAG 2.5.7 + missing lanes + Baseline statement) | `[x]` | `../program-2026-09-04/reports/TASK-R2-O{3,4,5}-handoff.md` |
| 2026-09-04 | R3-O2 (sanitizer provider seam) · R3-O3 (form-layout engineering) · R3-O4 (shared security-corpus format) | `[x]` | `../program-2026-09-04/reports/TASK-R3-O{2,3,4}-handoff.md` |
| 2026-09-04 | R5-O1 (ADR-19 pre-acceptance — **six layers ship**) · R5-O2 (anatomy/`ui`/rtl to Tier B) · R5-O3 (provider adoption) · R5-O5 (docs-page contract) · R5-O6 (composition contract) · R5-O7 (token gates + DTCG) · R5-O8 (metadata description debt) | `[x]` | `../program-2026-09-04/reports/TASK-R5-O*-handoff.md` |
| 2026-09-04 | R2-O1 · R2-O2 · R2-O6 · R2-O7 | `[~]` **residual only** | carried here as **S0-O1 / S1-O2** (from O1), **S1-O1** (O2), **S1-O3** (O6), **S1-O4** (O7) |
| 2026-09-04 | R0-O1 · R0-O2 · R1-O4 · R1-O5 · R1-O6 · R3-O1 · R5-O4 · R5-O9 | `[!]` **owner-blocked, engineering complete** | carried here as **S0-O2 / S0-O3 / S2-O4 / S2-O3 / S2-O1 / S3-O1 / S5-O1 / S5-O2** |
| 2026-09-22 planning ledger | PL-O1…O3 (dependency-graph split, `@dzup-ui/tooling` resolution export, landing Lighthouse baseline) | separate programme | [`../program-2026-09-22-planning/README.md`](../program-2026-09-22-planning/README.md) — do not duplicate |

Rule: if a task below asks for something a report above already records,
**cite the report and move on**. The `<done_check>` in every prompt exists so
the decision is mechanical, not a judgement.

## 4. How to run a task — the check-first protocol

Every prompt in this programme starts with a `<done_check>` block. Execute it
**before reading the rest of the prompt**.

1. **Re-verify the baseline (§2).** If HEAD moved, note the new commit; every
   number you quote later is bound to *that* commit, not to this README.
2. **Run the `<done_check>` commands exactly as written.**
   - *All checks pass* → record `[x] found-done <date> — <one-line evidence>`
     in [`EXECUTION-STATUS.md`](./EXECUTION-STATUS.md) and **move to the next
     task in dependency order**. Do not "improve" work a passing check covers.
   - *Some pass* → run **only** the residual steps; state which steps you
     skipped and why in the handoff.
   - *None pass* → run the task in full.
3. **A done_check can itself be wrong.** Four of the 2026-09-04 checks were
   defective — one compared a value with itself, two could only be satisfied by
   an action the same prompt forbade. If a check cannot decide the question it
   claims to decide, say so in the handoff, record the correction, and decide
   from the evidence instead. Never silently pass and never silently rerun.
4. **Never redo work a report records.** Handoffs under
   `../program-2026-09-04/reports/`, `../program-2026-09/reports/` and
   `../program-2026-08/` are authoritative for what was done; cite them by path.
5. **Record as you go.** Update `EXECUTION-STATUS.md` (status, date, commit
   observed, report path, ratchet movements) when a task ends, and keep a
   progress note in the handoff *while it runs* — long tasks cross context
   windows and the filesystem is the memory. **No commits: the owner commits.**
6. **A packet's stated gap is a hypothesis, not a fact.** Open the code before
   you believe it. Several 2026-09-04 gap notes were already closed when their
   task started, and this programme's §1 verdicts were written from a 2026-09-22
   measurement that will itself age.

## 5. How these tasks are written

Each task is a prompt authored per Anthropic's
[Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
and the [prompt-engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
("define success criteria before you tune a prompt"). The techniques used, in
the order the guide lists them: **be clear and direct** (numbered steps when
order matters; "implement", not "suggest"); **add context and motivation** (a
`<motivation>` block explains *why*, so the agent can generalise to cases the
prompt did not foresee); **examples** in `<example>` tags wherever an output
shape would otherwise drift; **XML structure** with identical tag names in
every prompt; **a role**; **let the model investigate before answering** (a
`<discovery>` phase whenever repo state is uncertain — never speculate about
code you have not opened); **self-check before finishing**
(`<success_criteria>` are measurable and re-run at the end); **avoid
over-engineering** (every prompt carries a scope boundary); **long-horizon
state** (progress notes, ledgers, ratchets); and **reversibility** (no commit,
push, publish, CI dispatch or baseline replacement is authorised — those are
owner actions, always marked `[!owner]`).

Prompt anatomy (identical in every task file):

```xml
<role>who the agent is, in which repo, following which conventions</role>
<task>the deliverable, in one paragraph, verbs first</task>
<motivation>why it matters — what breaks or stays unprovable without it</motivation>
<done_check>commands a fresh agent runs FIRST; README §4 decides what happens next</done_check>
<discovery>what to read/measure before editing (only when state is uncertain)</discovery>
<requirements>nested, named constraints — scope boundaries, formats, invariants</requirements>
<steps>numbered, dependency-ordered</steps>
<validation>the exact commands, narrowest first, read directly (never through a pipe)</validation>
<success_criteria>measurable, re-checked at the end; ratchet old → new</success_criteria>
<stop_conditions>when to stop and report instead of deciding</stop_conditions>
```

Every prompt assumes the conventions below (copy this block with the prompt
when running an agent outside this repository):

```xml
<repo_conventions source="ui/dzup-ui/CLAUDE.md + ADR-18/19/20 + packages/contracts/VERSIONING.md + program-2026-09-04 ledgers — authoritative, overrides defaults">
  <packages>contracts (types, zero runtime deps, 0.1.0) → tokens (0.2.0) → core (0.2.0; tokens + contracts) → compat/codemods/nuxt/mcp/testing/tooling. compat is never imported by stable core. Core NEVER imports Pro runtime source; Pro depends inward on Core contracts. mcp (0.2.0) is a PUBLIC package governed through packages/mcp/docs/mcp-tool-surface.json + validate:mcp. Release policy: packages/contracts/VERSIONING.md (0.x, minor = breaking; `major` refused by validate:release-policy until the deliberate 1.0 act); packages/tooling/scripts/release-policy.json is the data (published: contracts, core, mcp, nuxt, testing, tokens · withheld: compat, codemods · private: tooling, apps).</packages>
  <file_layout dir="packages/core/src/components/{family}/">
    Flat within each family — no per-component folder. Dz{Name}.vue · Dz{Name}.types.ts (extends Base*Props from @dzup-ui/contracts) · Dz{Name}.tokens.ts · Dz{Name}.variants.ts (tv()) · Dz{Name}.anatomy.ts (ADR-19: parts/states/tokens/rtl) · Dz{Name}.contract.spec.ts · Dz{Name}.spec.ts · ONE index.ts per family. Stories are NOT colocated: packages/core/stories/{family}/Dz{Name}.stories.ts. AT scripts: e2e/at-matrix/. Visual baselines: e2e/visual/. Docs pages are GENERATED into apps/docs from component-meta.json + anatomy + capability matrix — never hand-edit a generated page.
  </file_layout>
  <styling>tv() in .variants.ts (validate:tv-slots guards uncalled slot functions). NO &lt;style scoped&gt;. NO raw colour literals; every CSS value references var(--dz-*). `--dz-{intent}` is a fill/border colour, never a text colour — intent-coloured text uses `--dz-{intent}-muted-foreground`. Five-layer contract per ADR-19: DTCG tokens (dist/tokens.dtcg.json, ./dtcg subpath) → reachable component tokens → typed tv() recipes → stable data-part/data-state (spelling: `data-part`, NOT `data-dz-part`) → typed `ui` overrides. All six cascade layers ship. dzup-ui is restyleable by contract, NOT unstyled; consumers wanting headless use Reka directly, outside the support contract.</styling>
  <generated_authority>Generated artifacts are the truth and a generator reports, never decides: component-ownership.manifest.json (1,338, schema 1.1.0) · public-api.manifest.json · quality-matrix.json (144/144 tiered) · capability-matrix.json (144 rows) · component-meta.json · rtl-matrix.md · AT matrix (534 cells) · perf baselines (median + max(3σ, 5 %), ≥5 runs, downward only) · wcag-deviations.json · security coverage · llms{,-full}.txt · docs pages. Regeneration order when several are stale: ownership → quality → capability → component-meta → llms → docs-pages → playground seeds. Ratchets move one way only: anatomy non-declaring ↓ · story-DoD 0 · measured browser failures 0 · unclassified 29 ↓ · capability stale 37 → 0 · maxProposedCitedFromCode 3 ↓ · perf thresholds ↓.</generated_authority>
  <evidence_rules>Bind every quoted metric to a commit (an artifact's sourceCommit is stamped by construction — check it equals HEAD before quoting it). A green local run is "locally qualified" — never CI, release or production evidence. Stale and unrun cells stay visible; never collapse evidence into aggregate test counts. AT matrix rows are append-only run records with tester/AT/browser/date; **an agent NEVER fills a manual result cell** — a fabricated row is worse than an empty one. Maturity ladder: specified → implemented → focused-validated → aggregate-qualified → browser/AT-qualified → packaged → released. Never collapse two levels.</evidence_rules>
  <validation>Narrowest owning command first, then widen. `yarn validate:all` chains typecheck + lint + the validators; COUNT the links, never quote them. Run it END-TO-END and read the exit code DIRECTLY — a pipe returns the last stage's status, and the aggregate reported green over a stale artifact for three packets. Key lanes: yarn typecheck · yarn lint · yarn test · yarn validate:{ownership,tokens,tokens:dtcg,rtl,exports,boundaries,anatomy-parts,tv-slots,story-dod,at-matrix,at-scripts,capability-matrix,component-meta,llms,docs-pages,playground-parity,release-policy,mcp,form-readiness,hardcoded-strings,visual-baselines,adr-references} · yarn build · yarn storybook:build · yarn test:e2e (24 Playwright projects) · yarn test:e2e:visual · yarn test:nuxt-fixtures · perf lanes behind DZUP_PERF_GATE. Browser lanes write nothing until they finish — never conclude "hung" from an empty log. Report tooling failures and component failures SEPARATELY.</validation>
  <authority>No commit, push, CI dispatch, baseline replacement, package publication, registry mutation, deployment, domain/DNS change, entitlement or production action is authorised by any prompt. ADR-18/19/20 acceptance is an owner decision (packets exist). Preserve all unrelated dirty work in this repository and in workspace-docs — including the paths held by the sibling planning-ledger programme. Do not rebuild workspace-docs/indexes/document-catalog.jsonl.</authority>
  <repository_boundary>**Every task in this programme is `ui/dzup-ui` work: its files, commands, gates, artifacts and evidence are all in this repository.** A sibling checkout of the commercial tier may exist on the machine; it is out of scope. No task here reads its source, its git state or its ledgers, writes anything into it, or reports on its progress. Where the commercial tier is unavoidable it appears in exactly two forms: as a **published package** this repository consumes or must satisfy (`@dzup-ui-pro/pro` as a resolver target, a peer range, a tarball fixture), or as a **named external precondition with a yes/no probe**. Anything a task learns that belongs to the other tier is written in this repository's handoff as a finding, never pushed into another programme's ledger.</repository_boundary>
  <handoff>End every task with, in this order: implemented files + API effect · focused validation output · aggregate qualification (what ran, what is still red and why — pre-existing vs new) · ratchet movements (old → new) · owner decisions raised (numbered, with options and a recommendation) · ranked next packet. Write it to docs/program-2026-09-22-architecture/reports/&lt;TASK-ID&gt;-handoff.md and update EXECUTION-STATUS.md. Update workspace-docs/repos/ui/docs only with facts bound to the exact source commit used.</handoff>
</repo_conventions>
```

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[x] found-done` (done_check passed, nothing run) · `[!]` blocked on owner decision
> **Priority:** 🔴 blocks other work / active risk · 🟠 trust & quality · 🟢 growth & polish
> **`[!owner]`** — the task ends in an owner decision; the agent prepares, the owner decides and executes.

## 6. Task files and dependency order

```text
S0  Custody, truth and standing decisions           custody-and-release-tasks.md
 ├─ S0-O1 🔴 re-bind generated authority to HEAD + prove the tree green  ← FIRST: nothing quotes a number before this
 ├─ S0-O2 🔴 owner-decision register refresh + publication decision [!owner]
 └─ S0-O3 🟠 ADR-18/19/20 acceptance execution + Proposed-ADR gate [!owner]   (after S0-O1)
S1  Evidence execution                              evidence-execution-tasks.md
 ├─ S1-O1 🟠 AT matrix wave 1 — 0/534 executed [!owner tester]   (agent prepares + ingests only)
 ├─ S1-O2 🔴 capability matrix: 37 stale → 0, 441 unrun triaged into three buckets  (after S0-O1)
 ├─ S1-O3 🟢 visual regression: authoritative platform, capture, CI gate
 └─ S1-O4 🟢 performance contract: bind the baselines, audit the eight doc-06 scenarios  (after S0-O1)
S2  Consumer truth and release contracts            custody-and-release-tasks.md
 ├─ S2-O1 🟠 package-qualification matrix: the seven uncovered rows (08-11 doc 08)  (after S0-O1)
 ├─ S2-O2 🟠 release report + stop-condition gate + deprecation machinery (doc 06/08)
 ├─ S2-O3 🟢 docs site: size gate · validate:registry · deploy runbook [!owner deploys]
 └─ S2-O4 🟢 CI dispatch: min-runtime · nuxt-majors · vue-next · min-peer [!owner dispatches]
S3  Published-contract seams (all work in this repository)   contract-conformance-tasks.md
 ├─ S3-O1 🔴 publish the second-tier ownership schema + wire the resolver's second tier
 ├─ S3-O2 🟢 form-control primitives: DzGrid spans · DzStack gaps · async-options stories · DzMention [!owner]
 └─ S3-O3 🟢 security-corpus conformance runner in @dzup-ui/testing
S5  Spec conformance residue                        contract-conformance-tasks.md
 ├─ S5-O1 🟠 i18n: completeness gate · contribution path · plural rules · RTL route · typeface [!owner]
 └─ S5-O2 🟢 toolchain execution: Vue 3.6 · Nuxt 4 · Vitest 4 browser mode · tsdown/Vite 8 [!owner]
S6  Watch list / recorded refusals — §8, no tasks
```

| File | Contents |
|---|---|
| [`custody-and-release-tasks.md`](./custody-and-release-tasks.md) | TASK-S0-O1…O3, TASK-S2-O1…O4 — bind the evidence to HEAD, take the decisions that gate 1.0 and first publication, and build the consumer-truth and release contracts the 08-11 documents specify. |
| [`evidence-execution-tasks.md`](./evidence-execution-tasks.md) | TASK-S1-O1…O4 — execute and capture what the machinery produces: the human-only AT wave, the 478 stale/unrun capability cells, the visual baselines, the performance lanes. |
| [`contract-conformance-tasks.md`](./contract-conformance-tasks.md) | TASK-S3-O1…O3, TASK-S5-O1…O2 — the published-contract seams this repository owns, the form-control primitives, internationalization completeness and the toolchain migrations. |
| [`EXECUTION-STATUS.md`](./EXECUTION-STATUS.md) | Live ledger — one row per task; update it as §4 says. |

**Suggested execution order:** `S0-O1` → `S1-O2` (the tree and its evidence
become citable) → `S2-O1` and `S2-O2` in parallel under separate agents →
`S1-O3`, `S1-O4`, `S3-O3`, `S5-O1` → then the owner packets `S0-O2`, `S0-O3`,
`S1-O1`, `S2-O3`, `S2-O4`, `S3-O2`, `S5-O2`. **`S3-O1` runs now** — its schema,
fixture and diagnostic halves need no external input; only its live-integration
half waits on a published second-tier manifest, and that wait is recorded as a
skipped step, not as a dependency on someone else's schedule.

> **Run one task per agent.** A ten-way fan-out on this programme lost every
> agent's work. Give one agent one task, tell it to write its handoff
> incrementally, and let it finish before the next one starts.

## 7. Open owner decisions

The 2026-09-04 register
(`../program-2026-09-04/reports/owner-decision-register-2026-09.md`) holds the
full list; **TASK-S0-O2 refreshes and re-measures it**. The ones that gate a
release or another task, in the order they bite:

1. **A4-D1 publish-or-freeze** — packages 404 on npm, the domain does not
   resolve, 38 changesets are pending, and three registry descriptors describe
   artifacts nobody can install (S0-O2).
2. **`validate:changelog` vs `validate:mcp`** — one requires an ISO date in a
   changelog entry, the other forbids one; the first `changeset version` turns
   `validate:all` red (S0-O1 proves it with a snapshot probe; S0-O2 decides).
3. **ADR-18/19/20 signature** — packets ready, code complete, all three
   `Proposed` while 104 anatomy files and the provider chain build on them;
   `maxProposedCitedFromCode` is 3 and only an acceptance lowers it (S0-O3).
4. **A named AT tester and a cadence** — wave 1 is 44 cells ≈ 21 h; the full
   1.0 accessibility claim is 132 sessions ≈ 75 h. Three honest options exist
   and one must be chosen (S1-O1).
5. **Peer and dependency hygiene** — `lucide-vue-next` swap contract, `reka-ui`
   optional-peer posture, Node 20 drop, `apps/sandbox` removal (S2-O1).
6. **Docs deployment target, Baseline browser tier, `browserslist`** (S2-O3).
7. **CI dispatch** of `validate-min-runtime`, `nuxt-majors`, `vue-next` and the
   min-peer lane (S2-O4).
8. **`generate:exports` API drift** (would drop 5 composables, add 2) and the
   **29 unclassified** ownership symbols / schema 1.2.0 kinds (S0-O2).
9. **`DzGrid` span API**, the `utility` ownership kind, the `time` format
   profile (S3-O2).
10. **First translated locale** (`de` is a scaffold) and **Arabic typeface
    procurement** — AR-2 found zero fonts vendored (S5-O1).
11. **Toolchain cutover windows** — Vitest 4 browser mode, tsdown/Vite 8, the
    Vue 3.6 lane, the Nuxt 4 retarget (S5-O2).
12. **This repository's ADR number space** — `ADR-13` here is the date-math
    decision and the number is reused in the commercial tier for something
    else; naming was chosen over renumbering, and whether this repository keeps
    sharing the space is open (D187, S0-O2).

## 8. Explicitly **not** tasked (and why)

**Out of scope because it is not this repository's work** — it belongs to the
commercial tier and nothing here touches it, reports on it or waits on it:
the graph package and every domain preset; the form document, renderer and
builder; the commercial tier's custody, ADRs, manifests, evidence and release.
This programme states that boundary once, here, and never again.

**Out of scope by standing refusal:**

- **New component families for catalog size**, a **blanket unstyled mode**, a
  **second styling engine**, **mass CSS-variable renames** — re-affirmed by
  both reassessments (08-11 README "Non-goals"; 08-28 doc 06 N6).
- **Re-spelling doc 03's `data-dz-part` / dotted-layer / `DzThemeProvider`
  deprecation language** — superseded by ADR-19/20 decisions, not defects.
- **Collaboration / CRDT primitives** — recorded refusal until demand evidence
  exists (08-28 doc 05 §C row 15).
- **A Figma kit and Tokens Studio sync** — deferred `[!owner]` until the docs
  site is live; S2-O3 is its precondition.
- **Repeating the two rejected mobile-performance experiments** without a new
  hypothesis.
- **Filling any manual AT result cell by an agent** — see `<evidence_rules>`.
- **The planning-directory residuals** (PL-O1…O3) — sibling programme in this
  same repository:
  [`program-2026-09-22-planning`](../program-2026-09-22-planning/README.md).
- **Commit / push / CI dispatch / publication / DNS** — owner authority, every
  time.

**Watch list (quarterly, no task):** Storybook `addon-mcp` Vue parity · CSF
Factories Vue support (SB 11) · Context7 indexing of the `.md` endpoints ·
WCAG 3.0 (draft, not a target) · Vue 3.6 GA and Vapor interop (lane exists) ·
Nuxt Node-20 drop (ADR-18 amendment input) · PrimeVue v5 token-tier internals ·
MUI X in-grid AI assistant pattern (this repository's MCP package and neutral
token model are the head start).
