# dzup-ui — System Program 2026-08 (task prompts)

> What can be done next in `ui/dzup-ui` (OSS/core), derived from a review of the
> durable UI documentation in `workspace-docs/repos/ui/docs` as of commit
> `3681f415` (2026-08-10) **plus** the later 2026-08-11 system reassessment that
> sits on top of it. Every task below is a **ready-to-run prompt** for a coding
> agent. Companion Pro program: `ui/dzup-ui-pro/docs/program-2026-08/README.md`.
>
> Review date: **2026-08-20**. Reviewer verified the findings against the local
> checkouts (see §2) before writing the tasks.

---

## 1. What the source documentation says (review summary)

| Document (under `workspace-docs/repos/ui/docs/`) | Verdict after review |
|---|---|
| `planning/dzup-ui-theme-recipe-packets-0-6-continuation-2026-08-09.md` | **Closed.** ThemeRecipe packets 0–6 (contract, consumer integration, persistence, Storybook, pairwise browser matrix 72/72, Lighthouse + output budgets) are recorded as implemented and locally qualified. The ledger's own last line: *"No successor feature/refactor prompt is recommended; stop and close this session."* Remaining items are governance custody, not features. |
| `planning/NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-oss-coverage-and-sk1.md` | **Largely historical.** The OSS CI recovery (HeroSplit CLS ≤ 0.1, coverage policy, `test:prepare` guard) is recorded as implemented on `fix/blocks-gallery-ui-ux`. It **reserves SK-1** (shared-kit consumer helper), then SK-2, APP-1, AR-2 as separate post-recovery packets — those are still open and are tasks here (§4, file `oss-recovery-and-shared-kit-tasks.md`). |
| `architecture/dzup-form-system-2026-08-08/README.md` | **Specified, not implemented.** `DzupFormDocument` (dataSchema / uiSchema / runtime refs / host registries). Owned by Pro; OSS owns the *controls* the renderer must be able to drive. The 2026-08-11 reassessment **overrides** its "breaking removal, no adapter" premise: consumer discovery + an adapter/deprecation decision are now mandatory first. OSS-side tasks are in `form-controls-readiness-tasks.md`; the Pro-side program is in the Pro docs. |
| `architecture/dzup-graph-flow-system-2026-08-08/README.md` | **Specified, not implemented.** Pro-only (`@dzup-ui-pro/graph`). No OSS work until the Pro engine spike decides; OSS may receive primitive fixes only. Not tasked here. |
| `architecture/dzup-ui-system-reassessment-2026-08-11/` (newer than the list the review started from) | **Authoritative successor program.** Reopens the *system* (not the closed packets) as a dependency-ordered plan P0→P8. Its OSS-owned findings: **H1** the Nuxt module and resolver advertise a nonexistent `@dzup-ui/pro` package and classify Pro components from a stale handwritten list; **M1** the enforced Story DoD is green but its report lists 366 non-enforced gaps; **M2** no single provider for locale/direction/portals/motion/defaults; **M3** root README version drift and the Nuxt package has no real unit suite; **H3** only a minority of Core components expose stable part attributes. |

**Net conclusion for OSS:** the component catalog is not the gap. The gap is
*consumer trust*: correct Core + Pro integration, generated (not handwritten)
inventories, a public five-layer styling contract, one provider, and
evidence per risk tier. That is what the tasks below implement.

## 2. Custody facts verified on 2026-08-20 (re-verify at session start)

| Repo | Branch | Local HEAD | Relation to the docs |
|---|---|---|---|
| `ui/dzup-ui` | `main` | `ae89240` (2026-08-11), 3 commits ahead of `origin/main` `a959c6c` | `a959c6c` **is** the reassessment baseline, so H1/M1–M3 findings apply to this checkout. `packages/tokens/src/theme-recipe.ts` exists → ThemeRecipe work is present. Worktree is **dirty** (many deleted `.changeset/*.md` staged, plus other changes) — preserve it. |
| `ui/dzup-ui-pro` | `esmir` | `e7d5610` (2026-08-18) | **290 commits behind `origin/main`.** The neutral models, ADR-13, manifest-parity/QA-baseline/token-reachability validators, and Pro ThemeRecipe work live on `origin/main`, not on `esmir`. Any OSS task that consumes a *Pro manifest* (P0/P1) must read it from a Pro checkout that contains it. See Pro `program-2026-08/README.md` §2. |

Quick re-verification commands (read-only):

```bash
git -C ui/dzup-ui status --short --branch | head
grep -rn "@dzup-ui/pro" ui/dzup-ui/packages/nuxt/src ui/dzup-ui/packages/core/src   # H1 still present?
node -v                                                                             # engine floor evidence
```

## 3. How these tasks are written

Each task is a prompt authored per Anthropic's
[Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
and [Define success criteria](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests):

- a **role** line that sets expertise and points at the shared conventions;
- **context/motivation** explaining *why* (Claude generalises better from the reason than from the rule);
- **explicit, sequential steps** and instructions phrased as *what to do*;
- **XML tags** (`<task>`, `<requirements>`, `<steps>`, `<success_criteria>`, `<stop_conditions>`) so instructions, data, and acceptance are unambiguous;
- `<example>` blocks where a concrete shape prevents drift;
- a **thinking/discovery phase** before edits for tasks that depend on unknown repo state;
- measurable **success criteria** and explicit **stop conditions** (authority boundaries the agent must not cross).

Copy one prompt block verbatim into an agent. Every prompt assumes the shared
conventions below — re-read them before starting any task.

```xml
<repo_conventions source="ui/dzup-ui/CLAUDE.md + workspace-docs reassessment — authoritative, overrides defaults">
  <packages>contracts (types, zero runtime deps) → tokens → core (depends on tokens + contracts) → compat/codemods/nuxt/mcp/testing/tooling. compat is never imported by stable core. Core NEVER imports Pro runtime source; Pro depends inward on Core contracts.</packages>
  <file_layout dir="packages/core/src/components/{family}/">
    Dz{Name}.vue · Dz{Name}.types.ts (extend Base*Props from @dzup-ui/contracts) · Dz{Name}.tokens.ts · Dz{Name}.variants.ts (tv()) ·
    Dz{Name}.contract.spec.ts (Contract Spec v1) · Dz{Name}.spec.ts · index.ts. Stories NOT colocated: packages/core/stories/{family}/Dz{Name}.stories.ts.
  </file_layout>
  <styling>tv() in .variants.ts. NO &lt;style scoped&gt;. NO raw color literals. Every CSS value references var(--dz-*) (ADR-04, ADR-17). Dark mode keys off [data-theme="dark"].</styling>
  <generated_authority>Public inventories are GENERATED from entry barrels + Contract Spec v1 metadata (packages/core/manifests/public-api.manifest.json via `yarn generate:exports`). A generator may report "unclassified"; it must never silently add, remove, or re-own a public symbol. Handwritten lists (PRO_COMPONENTS, prefix heuristics, README counts) are drift and must be replaced by generated data, not refreshed.</generated_authority>
  <validation>
    Narrowest owning command first, then widen. Root scripts: yarn typecheck · yarn typecheck:all · yarn lint (--max-warnings 0) · yarn test (runs test:prepare first) · yarn test:coverage ·
    yarn validate:boundaries · validate:exports · validate:dts · validate:peers · validate:contract-parity · validate:story-status · validate:story-dod · validate:tokens · validate:bundle-budget · validate:licenses · yarn validate:all ·
    yarn build · yarn storybook:build · yarn storybook:test · yarn test:e2e (Playwright: chromium/firefox/webkit) · yarn test:e2e:landing.
    Report tooling failures and component failures SEPARATELY. A green local run is "locally qualified"; it is not CI, release, or production evidence.
  </validation>
  <maturity_levels>Record each packet as one of: specified → implemented → focused-validated → aggregate-qualified → browser/AT-qualified → packaged (tarball fixture) → released (separate authority). Never collapse levels into "done".</maturity_levels>
  <authority>No commit, push, CI dispatch, baseline replacement, package publication, registry mutation, deployment, or production action is authorized by any prompt here. Preserve all unrelated dirty work in ui/dzup-ui, ui/dzup-ui-pro, and workspace-docs. Do not rebuild workspace-docs/indexes/document-catalog.jsonl.</authority>
  <handoff>End every task with: implemented files + API effect · focused validation output · aggregate qualification (what ran, what is still red and why) · unresolved owner decisions · ranked next packet. Update workspace-docs/repos/ui/docs only with facts bound to the exact source commit used.</handoff>
</repo_conventions>
```

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on owner decision
> **Priority:** 🔴 P0 (foundation / blocks other work) · 🟠 P1 (trust & quality) · 🟢 P2 (polish)

## 4. Task files and dependency order

```text
OSS-P0  Core ownership manifest + authority                 foundation-tasks.md §P0
  ├─> OSS-P1  Core + Pro integration repair (Nuxt/resolver) foundation-tasks.md §P1   (needs Pro P0 manifest)
  ├─> OSS-P2  Runnable gates, README/Nuxt test debt          foundation-tasks.md §P2
  └─> OSS-P3  Public styling system (parts/states/DTCG/cookbook)  foundation-tasks.md §P3
          └─> OSS-P4  DzProvider: locale/direction/portal/motion/defaults  foundation-tasks.md §P4
                  └─> OSS-P5  Evidence by risk tier (Story DoD 366, 3-engine lanes, AT matrix, perf baselines)  foundation-tasks.md §P5
                          └─> FORM-OSS  Core control readiness for the Pro Form renderer   form-controls-readiness-tasks.md
REC/SK  OSS recovery freeze → SK-1 → SK-2 → APP-1 → AR-2 (independent lane)   oss-recovery-and-shared-kit-tasks.md
```

| File | Contents |
|---|---|
| [`foundation-tasks.md`](./foundation-tasks.md) | TASK-OSS-P0-01…P5-06 — the reassessment's OSS-owned packets as prompts. |
| [`oss-recovery-and-shared-kit-tasks.md`](./oss-recovery-and-shared-kit-tasks.md) | TASK-REC-01, TASK-SK-1/2, TASK-APP-1, TASK-AR-2 — the lane reserved by the 08-10 next-session prompt. |
| [`form-controls-readiness-tasks.md`](./form-controls-readiness-tasks.md) | TASK-FORM-OSS-01…04 — what Core must guarantee before Pro's `DzFormRenderer` can use its controls without forking. |

## 5. Explicitly **not** tasked (and why)

- New component families "to grow the catalog" — the reassessment refuses admission.
- A blanket unstyled mode, a second styling engine, mass CSS-variable renames — P3 stop conditions.
- Removing the beta `FormSchema`/`DzSchemaForm` exports — blocked until the Pro P6 consumer census.
- Any Graph work in OSS — admitted only after Pro P7's engine spike.
- Re-running the two rejected mobile-performance experiments (below-fold deferral; CSS route split) — the ThemeRecipe ledger forbids repeating them without a new shell/bootstrap hypothesis and distribution evidence.
- Commit/push/CI/publication — owner authority, every time.
