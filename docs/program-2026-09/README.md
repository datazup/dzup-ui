# dzup-ui — System Program 2026-09 (task prompts)

> What must be done next in `ui/dzup-ui` (OSS/core), derived from the
> **2026-08-28 program reassessment**
> (`workspace-docs/repos/ui/docs/architecture/dzup-ui-program-reassessment-2026-08-28/`),
> which re-verified every number against the local checkouts, challenged the
> 08-11 plan against external 2026 state-of-the-art research, and produced the
> dependency-ordered roadmap **N0→N6**. Every task below is a **ready-to-run
> prompt** for a coding agent. Companion Pro program:
> `ui/dzup-ui-pro/docs/program-2026-09/README.md`. Predecessor program (P0–P5,
> substantially complete): [`../program-2026-08/README.md`](../program-2026-08/README.md).
>
> Review date: **2026-08-29**. Baseline: `main` @ `51dec93` (clean worktree).
> Re-verify at session start (§2).

---

## 1. What the source documentation says (review summary)

| Document (under `workspace-docs/repos/ui/docs/architecture/dzup-ui-program-reassessment-2026-08-28/`) | Verdict for OSS |
|---|---|
| `README.md` | **Headline:** the OSS foundation program is effectively complete (P0–P5 minus P5-02) and delivered more than planned. What remains on OSS is **evidence execution, not construction**: run the Firefox/WebKit lanes, execute AT cells, author the 51 story gaps, fix the measured WCAG 2.2 failures (28 target-size, 18 reflow). |
| `01-plan-challenge.md` | The 08-11 principles stand (five-layer styling contract, generated truth, evidence by risk tier, admission gates). Three strategic blind spots become new OSS packets: **AGENT** (`@dzup-ui/mcp` ships ungoverned; llms.txt has no freshness gate), **DOCS** (Storybook demoted with no public docs-site replacement funded), **TOKENS** (DTCG export named by ADR-19's stop condition, never scheduled — spec stable since 2025.10, no major Vue competitor ships one). Smaller amendments: "restyleable by contract, not unstyled" statement; Nuxt 3 is EOL → target Nuxt 4; Vue 3.6-RC CI lane; 0.x semver statement. |
| `02-capability-matrix-oss.md` | The per-capability state table this program's tasks cite. Key `implemented-gap`/`partial` rows: browser matrix (12 FF/WebKit projects configured, unrun; 46 measured failures ratcheted), AT matrix (534 cells, 0 executed), Story DoD (51 tier-required, 0 authored), i18n (one locale), MCP (ungoverned), docs surfaces (no versioned site), release engineering (17 unreleased changesets, no 0.x statement). |
| `04-competitive-benchmark.md` | External research: per-component published a11y evidence is the credible 2026 bar (EAA in force); official MCP + llms.txt + machine-readable registries are table stakes; DTCG first-mover window open; docs norm = generated prop tables + inline playgrounds + theme builder (ThemeRecipe's URL serialization is the hard part, already built). |
| `05-gap-analysis-code-vs-plan.md` §A | Task-level status: P0–P5 done except **P5-02**; FORM-OSS and REC/SK lanes done. §A4 lists exactly what OSS still owes — reproduced as the N1-O tasks here. Generated evidence artifacts record `sourceCommit 8d80bc39`, 15 commits behind HEAD → re-bind first (N0-05). |
| `06-roadmap-2026-09.md` | The authoritative ordering. OSS-owned packets: **N0-05** (re-bind evidence) → **N1-O1…O6** (run what was built) ∥ **N2** (TOKENS-01, AGENT-01…04, DOCS-01…03, N2-S1 styling rollout) → **N5** (release policy + toolchain hygiene). The amended admission rule applies: nothing releases while admission debt is open. |

**Net conclusion for OSS:** construction is done; credibility is not. The three
lanes are (a) *execute and publish the evidence the machinery already
produces*, (b) *build the consumer/agent surface* (DTCG, governed MCP, docs
site) on top of the generated artifacts, and (c) *state the release policy* so
breaking fixes (the 6 ARIA-prop gaps) become legal.

## 2. Custody facts verified on 2026-08-28 (re-verify at session start)

| Repo | Branch | HEAD | Worktree |
|---|---|---|---|
| `ui/dzup-ui` | `main` | `51dec93` | **clean** |
| `ui/dzup-ui-pro` (context for cross-repo tasks) | `esmir` | `6c04972`, 22 ahead / 4 behind `origin/main` | **dirty** — the entire graph program is uncommitted. Do not touch it from OSS tasks; Pro custody is Pro program N0. |

Generated OSS evidence artifacts (ownership / quality / capability / RTL / AT)
record `sourceCommit 8d80bc39` — 15 commits and 94 core-src file changes behind
HEAD. **TASK-N0-05 re-binds them and runs before any N1 task quotes a number.**

Quick re-verification (read-only):

```bash
git -C ui/dzup-ui status --short --branch | head
git -C ui/dzup-ui log -1 --format='%h %s'
node -e "console.log(require('./ui/dzup-ui/packages/core/docs/capability-matrix.json').sourceCommit ?? 'inspect manually')"
node -v
```

## 3. How these tasks are written

Same method as the 2026-08 program: each task is a prompt authored per
Anthropic's prompting best practices — role · motivation · discovery phase
where repo state is uncertain · XML-tagged requirements/steps · measurable
success criteria · explicit stop conditions. Copy one prompt block verbatim
into an agent. Every prompt assumes the conventions below.

```xml
<repo_conventions source="ui/dzup-ui/CLAUDE.md + ADR-18/19/20 + program-reassessment-2026-08-28 — authoritative, overrides defaults">
  <packages>contracts (types, zero runtime deps) → tokens → core (tokens + contracts) → compat/codemods/nuxt/mcp/testing/tooling. compat never imported by stable core. Core NEVER imports Pro runtime source; Pro depends inward on Core contracts. mcp is a PUBLIC package and is governed like one (AGENT-01).</packages>
  <file_layout dir="packages/core/src/components/{family}/">
    Dz{Name}.vue · Dz{Name}.types.ts (extend Base*Props from @dzup-ui/contracts) · Dz{Name}.tokens.ts · Dz{Name}.variants.ts (tv()) ·
    Dz{Name}.contract.spec.ts · Dz{Name}.spec.ts · anatomy file per ADR-19 where declared · family index.ts. Stories NOT colocated: packages/core/stories/{family}/Dz{Name}.stories.ts.
  </file_layout>
  <styling>tv() in .variants.ts. NO &lt;style scoped&gt;. NO raw color literals; every CSS value references var(--dz-*). Five-layer contract per ADR-19: DTCG-compatible tokens → reachable component tokens → typed tv() recipes → stable data-part/data-state → typed `ui` overrides. Cascade layers: library CSS always loses to consumer CSS. dzup-ui is restyleable by contract, NOT unstyled — headless consumers use Reka directly, outside the support contract.</styling>
  <generated_authority>Generated artifacts are the truth: packages/core/manifests/component-ownership.manifest.json (1,327 entries, schema 1.1.0) · public-api.manifest.json · packages/contracts quality tiers → quality-matrix.json (144/144 tiered A55/B67/C21/D1) · packages/core/docs/capability-matrix.json (144 rows × 1,661 evidence cells) · rtl matrix · AT matrix scaffold (89 files, 534 cells) · perf baselines (packages/core/perf/baselines.json). A generator reports; it never decides public API. Ratchets move one way only: anatomy non-declaring ceiling 137↓ · story-DoD open 51↓ · browser measured failures 46↓ · unclassified 29↓ · perf thresholds ↓.</generated_authority>
  <evidence_rules>Any document or handoff that quotes a metric must bind it to a commit. A green local run is "locally qualified" — never CI, release, or production evidence. Stale/unrun cells stay visible; never collapse evidence into aggregate test counts. AT matrix rows are append-only run records with tester/AT/browser/date.</evidence_rules>
  <validation>
    Narrowest owning command first, then widen. 29 validate:* scripts exist; `yarn validate:all` chains typecheck + lint + 26 validators. Key lanes: yarn typecheck · yarn lint (--max-warnings 0) · yarn test · yarn validate:story-dod · validate:ownership · validate:tokens · validate:rtl · validate:exports · validate:boundaries · yarn build · yarn storybook:build · yarn test:e2e (18 Playwright projects: 3 engines × 6 conditions) · perf lanes gated behind DZUP_PERF_GATE.
    Report tooling failures and component failures SEPARATELY.
  </validation>
  <maturity_levels>specified → implemented → focused-validated → aggregate-qualified → browser/AT-qualified → packaged → released. Never collapse levels into "done".</maturity_levels>
  <authority>No commit, push, CI dispatch, baseline replacement, package publication, registry mutation, deployment, entitlement or production action is authorized by any prompt here. ADR-19/20 are load-bearing but still Proposed — acceptance is an owner decision (TASK-N5-05 prepares the packet). Preserve all unrelated dirty work in ui/dzup-ui, ui/dzup-ui-pro, and workspace-docs. Do not rebuild workspace-docs/indexes/document-catalog.jsonl.</authority>
  <handoff>End every task with: implemented files + API effect · focused validation output · aggregate qualification (what ran, what is still red and why) · ratchet movements (old → new) · unresolved owner decisions · ranked next packet. Update workspace-docs/repos/ui/docs only with facts bound to the exact source commit used.</handoff>
</repo_conventions>
```

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on owner decision
> **Priority:** 🔴 blocks other work / active risk · 🟠 trust & quality · 🟢 growth & polish

## 4. Task files and dependency order

```text
N0-05  Re-bind stale generated evidence artifacts             evidence-execution-tasks.md
  └─> N1-O1…O6  Run what was built (stories, FF/WebKit lanes,  evidence-execution-tasks.md
       WCAG fixes, AT cells, security corpus, visual-regression)
N2  Consumer & agent surface (parallel with N1)               consumer-agent-surface-tasks.md
  ├─ N2-T1  DTCG export (first-mover window)
  ├─ N2-A1…A4  govern MCP · metadata pipeline · llms gate · registry eval
  ├─ N2-D1…D3  docs site · evidence pages · playground/theme builder
  └─ N2-S1  anatomy + `ui` adoption rollout
N5  Release engineering & toolchain hygiene (after N1 starts) release-and-toolchain-tasks.md
  ├─ N5-01 0.x policy + changelog reconciliation → N5-02 ARIA-prop gap closure
  ├─ N5-03 toolchain currency (Vue 3.6 lane, Nuxt 4, Vitest 4, tsdown)
  ├─ N5-04 peer & runtime hygiene [!owner]
  └─ N5-05 ADR-19/20 acceptance packets [!owner]
```

| File | Contents |
|---|---|
| [`evidence-execution-tasks.md`](./evidence-execution-tasks.md) | TASK-N0-05 + TASK-N1-O1…O6 — re-bind, then run and publish the evidence the P5 machinery built. |
| [`consumer-agent-surface-tasks.md`](./consumer-agent-surface-tasks.md) | TASK-N2-T1, TASK-N2-A1…A4, TASK-N2-D1…D3, TASK-N2-S1 — DTCG, governed MCP + metadata pipeline, docs site, styling-contract rollout. |
| [`release-and-toolchain-tasks.md`](./release-and-toolchain-tasks.md) | TASK-N5-01…05 — release policy, ARIA-prop breaking fixes, toolchain currency, peer hygiene, ADR acceptance packets. |

## 5. Explicitly **not** tasked (and why)

- New component families for catalog size; a blanket unstyled mode; a second
  styling engine — standing refusals, re-affirmed by the reassessment.
- Any Graph work in OSS — Pro-owned (`@dzup-ui-pro/graph`), see the Pro program.
- Collaboration/CRDT primitives — recorded refusal until demand evidence exists.
- A Figma kit — deferred `[!owner]` until DOCS-01 ships.
- Repeating the two rejected mobile-performance experiments without a new
  hypothesis.
- Pro custody (graph commit, esmir merge-back) — Pro program N0, owner-executed.
- Commit/push/CI dispatch/publication — owner authority, every time.
