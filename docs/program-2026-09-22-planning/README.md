# dzup-ui — Planning-Ledger Program 2026-09-22 (task prompts)

> What can still be done in `ui/dzup-ui` (OSS/core) **according to the
> planning directory** — a complete read of all 39 files under
> `workspace-docs/repos/ui/docs/planning/` (606 KB: the 2026-08-08 Reka dedupe
> plan, the ThemeRecipe packets 0–6 ledger and its 30 closeouts, the
> neutral-model alignment plan and its 25 per-component prompts, the 08-11
> foundations handoff, the 08-25 OSS recovery freeze), each checked against
> the code, `git`, the generated artifacts and the ledgers of the three
> programmes that have run since
> ([`program-2026-08`](../program-2026-08/README.md),
> [`program-2026-09`](../program-2026-09/README.md),
> [`program-2026-09-04`](../program-2026-09-04/README.md)).
>
> **Everything already delivered is listed in
> [`planning-docs-disposition.md`](./planning-docs-disposition.md) and
> bypassed.** Everything else is a ready-to-run prompt in
> [`planning-residual-tasks.md`](./planning-residual-tasks.md). Companion Pro
> program: `ui/dzup-ui-pro/docs/program-2026-09-22-planning/README.md`.
> Sibling programme cut the same day from the *architecture* directory by a
> concurrent session: [`../program-2026-09-22-architecture/README.md`](../program-2026-09-22-architecture/README.md)
> — a different source corpus and different task ids; run each by its own README.
>
> Review date: **2026-09-22**. Baseline: `main` @ `589be13`, clean, 0/0 vs
> `origin/main`. **This is a companion to `program-2026-09-04`, not its
> successor** — that programme's R0/R1/R2 residue is still the main body of
> OSS work; this one holds only what the planning documents left open and no
> later programme picked up. **Re-verify §2 at session start and run each
> task's `<done_check>` before doing anything else (§4).**

---

## 1. What the planning documents say (review summary)

| Theme (files) | Verdict for OSS (verified 2026-09-22) |
|---|---|
| **Reka dedupe & overlay testability** — `DZUP_UI_REKA_DEDUPE_AND_OVERLAY_TESTABILITY_PLAN_2026-08-08.md`, `DZUP_UI_PORTAL_TESTABILITY_NEXT_SESSION_PROMPT_2026-08-08.md` | Done in-repo: `BasePortalProps` on all 14 direct portal owners (`9a93d9f`), `@dzup-ui/testing`, `createDzupResolution` with a required `mode` and a separate `dedupe` field (TASK-SK-1), two Playwright specs guarding one portal root + focus return (TASK-SK-2, 18/18 × 3 engines). `reka-ui` resolves to exactly one copy today. **Three things it left open are still open:** the helper sits in a `private: true` package with `exports` pointing at `src/*.ts`, so the page that tells external apps to import it describes an import nobody outside the workspace can make (→ TASK-PL-O2); the Vite 6/7 and plugin-vue 5/6 split it recorded as "owner decision 3" is unchanged — three apps on `vite@6.4.1`, every package on `7.3.5` (→ TASK-PL-O1); `vue` still resolves to three versions, one of them pulled by `@floating-ui/vue`, a direct dependency of `@dzup-ui/core` (→ TASK-PL-O1). The consumer-app half (reward-app dialogs, 13 other apps, the Arabic vendored core) is not this repository's to perform. |
| **ThemeRecipe packets 0–6** — `dzup-ui-theme-recipe-packets-0-6-continuation-2026-08-09.md` + the eleven 08-09 session prompts | OSS side complete: `ThemeRecipeV1` in `packages/tokens/src/theme-recipe.ts`, landing FOUC bootstrap, Storybook toolbar axes, 18 visual baselines (`fd5dd49`). The OSS items in its "separately tracked debt" are closed by later programmes (321 lint findings → TASK-R1-O1; visual-regression rollout → TASK-R2-O6 `[~]`). Nothing OSS-side remains. |
| **Neutral-model alignment** — the 08-10 plan + 25 prompts | Pro-owned end to end; zero OSS work. Each prompt ran its OSS-surface gate against built `dist/` without touching OSS source. |
| **System foundations 08-11** — `NEXT_SESSION_PROMPT_2026-08-11-dzup-ui-system-foundations.md` | Executed as TASK-OSS-P0-01/02 + P1-01…04 in August: exact-name ownership manifest, resolver without prefix heuristics, Nuxt module naming `@dzup-ui-pro/pro` (the only `@dzup-ui/pro` left in `packages/core/src` is a negative assertion in `resolver.spec.ts`). Nothing remains. |
| **OSS recovery freeze 08-25** — `NEXT_SESSION_PROMPT_2026-08-25-dzup-ui-oss-recovery-freeze.md`, `…08-10-dzup-ui-oss-coverage-and-sk1.md` | The seven recovery SHAs are in `main`; Groups A and B are committed (`main` clean at `589be13`, `validate:all` green per TASK-R1-O1). Of its §7 "what this does NOT establish": Firefox/WebKit → TASK-R2-O1 `[~]`; remote CI → TASK-R1-O4 `[!owner]`; **the landing Lighthouse CLS baseline was "not re-run and not replaced" and still has not been** — no `program-2026-09-04` handoff mentions Lighthouse, although `apps/landing/lighthouserc{,.mobile}.json` exist and CI runs them (→ TASK-PL-O3). |

**Net conclusion for OSS:** the planning directory is closed except for four
residuals — two dependency-graph facts the 08-08 plan measured and nobody
tasked, one unbound performance baseline, and the directory's own missing
disposition stamps. None adds a component or touches a public runtime
contract except through a `minor` changeset on `@dzup-ui/testing`
(TASK-PL-O2, if option B is taken).

## 2. Verified baseline (2026-09-22) — re-verify at session start

| Fact | Value at `589be13` |
|---|---|
| Branch / worktree | `main`, clean, 0 ahead / 0 behind `origin/main`. The last four commits landed program-2026-09-04's R3/R5, R2, R0/R1 lanes. |
| Dependency graph | `yarn why vite`: `apps/landing`, `apps/sandbox`, `apps/storybook` → `6.4.1` (`^6.1.0`); root, `core`, `compat`, `tokens`, `tooling` → `7.3.5` (`^7`); `@nuxt/vite-builder` → `7.3.6`. `yarn why @vitejs/plugin-vue`: the same three apps → `5.2.4`, everything else `6.0.7`. `yarn why vue`: every workspace → `3.5.31`; `@floating-ui/vue@1.1.11` and `@nuxt/devtools@3.4.2` → `3.5.39`; `@nuxt/nitro-server@4.4.5` → `3.5.42`. `yarn why reka-ui`: one copy, `2.9.2`. Storybook is `^10.5.1`. |
| Resolution helper | `packages/tooling/package.json`: `private: true`, version `0.0.1`, `exports["./resolution"]` → `./src/resolution/dzup-resolution.ts` (no build). `docs/resolution-external-consumers.md` instructs `import { createDzupResolution } from '@dzup-ui/tooling/resolution'`. `release-policy.json` lists `@dzup-ui/tooling` under `private`. |
| Landing performance | `apps/landing/lighthouserc.json`, `lighthouserc.mobile.json`, `src/lighthouserc.spec.ts` exist; `ci.yml:688–699` runs both via `treosh/lighthouse-ci-action@v12`; `grep -rli lighthouse docs/program-2026-09-04/reports/` → nothing. Last recorded numbers: 08-10 (hero-split CLS `0.000005` desktop 3/3, `0` mobile 3/3, on `fce7eef`). |
| program-2026-09-04 ledger | R1-O1/O2/O3 `[x]` · R1-O4/O5/O6 `[!]` · R0-O1/O2 `[!]` · R2-O1/O2/O6/O7 `[~]` · R2-O3/O4/O5 `[x]` · R3-O1 `[!]` (blocked on the Pro programme's TASK-R1-P4) · R3-O2/O3/O4 `[x]` · R5-O1…O3, O5…O8 `[x]` · R5-O4/O9 `[!]`. |
| Other repositories | `workspace-docs` `main` ahead 1 / behind 2176 of `origin/main`, dirty — preserve (TASK-PL-O4 edits it). Nothing about `ui/dzup-ui-pro` is tracked here; its state and its programme are in `ui/dzup-ui-pro/docs/program-2026-09-22-planning/README.md` §2. |

Quick re-verification (read-only; **read exit codes directly, never through a pipe**):

```bash
git -C ui/dzup-ui status --short --branch
git -C ui/dzup-ui log -1 --format='%h %s'
cd ui/dzup-ui && yarn why vite > "$TEMP/why-vite.log" 2>&1; echo "exit $?"; grep -c "vite@npm:6" "$TEMP/why-vite.log"
node -e "const p=require('./packages/tooling/package.json');console.log(p.private, p.exports['./resolution'])"
ls apps/landing/lighthouserc*.json
```

## 3. Closed ledger — already done, **bypass** (cite, never redo)

The full 39-row table is [`planning-docs-disposition.md`](./planning-docs-disposition.md).
The OSS-relevant rows, compressed:

| Planning packet | Status | Proof |
|---|---|---|
| UI-1 · UI-2 · UI-3a · UI-3b (portal contract, `@dzup-ui/testing`, 14/14 owners) | done | `8ecbe35`, `9a93d9f`; plan §"Completed batch" |
| SK-1 (`createDzupResolution`) · SK-2 (overlay-portals Playwright ×2) · REC-01 · APP-1 (in-repo half) · AR-2 | done | `../program-2026-08/EXECUTION-STATUS-REC.md`; TASK-R5-O4 (landing RTL, D62) |
| ThemeRecipe packets 0, 1, 3, 5, 6 (OSS half) | done | `packages/tokens/src/theme-recipe.ts`, `storybook-theme-recipe.ts`; `fd5dd49` |
| 08-11 foundations P0 / P1 | done | `../program-2026-08/EXECUTION-STATUS.md` (TASK-OSS-P0-01/02, P1-01…04) |
| 08-25 recovery Groups A / B | done, committed | `main` @ `589be13` clean; `../program-2026-09-04/reports/TASK-R1-O1-handoff.md` |
| 08-25 §7 residuals: Firefox/WebKit · remote CI | carried | TASK-R2-O1 `[~]` · TASK-R1-O4 `[!]` — run those rows, not a copy |
| 08-08 owner decision 4 (`apps/sandbox`) | carried | TASK-R1-O6 (D174–D178) |

Rule: if a task below asks for something a row above records, **cite the
proof and move on**. The `<done_check>` in every prompt makes the check
mechanical — but see §4 for why a check is not a verdict.

## 4. How to run a task — the check-first protocol

Every prompt starts with a `<done_check>` block. Execute it before reading the
rest of the prompt:

1. **Re-verify the baseline (§2).** If HEAD moved, every number you quote is
   bound to the commit you observe, not to this README.
2. **Run the `<done_check>` commands exactly as written**, then **confirm the
   signal by a second route** before believing it. Across program-2026-09-04
   the done-checks scored roughly 1 in 28 as written, and the one "pass" was
   usually a false pass (a `grep` through `| head` masking a non-zero exit; an
   artifact key that does not exist). A check that fails is usually a wrong
   check; a check that passes may be passing over nothing.
   - *All pass and the second route agrees* → record `[x] found-done <date> —
     <one-line evidence>` in `EXECUTION-STATUS.md`; move on. Do not "improve"
     work a passing check covers.
   - *Some pass* → run **only** the residual steps; say which you skipped.
   - *None pass* → run the task.
3. **Treat the `_Gap:_` preamble as a hypothesis, not a fact.** Every task in
   the predecessor programme falsified at least one premise at execution time.
   Test the premise first; re-cut the task around what you find; say so in
   the handoff.
4. **Never redo work a report records.** Handoffs under
   `../program-2026-09-04/reports/`, `../program-2026-09/reports/` and
   `../program-2026-08/` are authoritative; cite by path.
5. **Work solo and write incrementally.** Do not delegate to subagents (a
   ten-way fan-out on 2026-09-22 stalled with nothing on disk); write the
   handoff skeleton first and append as you go — the filesystem is the memory
   across context windows. Extract from large ledgers mechanically (`grep -n`),
   never by reading them end to end.
6. **Gates:** in this repository `yarn` works and `npx` is unsafe (`npx tsc`
   fetches a placeholder). Invoke by module path when in doubt; capture to a
   file and read the exit code — `cmd | tail` returns tail's status.
7. **Record as you go** in `EXECUTION-STATUS.md`; no commits — the owner
   commits.

## 5. How these tasks are written

Each task is a prompt authored per Anthropic's
[Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
and the [prompt-engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview),
which asks for a definition of success and a way to test it before any prompt
is tuned. The guide's techniques, applied by section: **be clear and direct**
(numbered steps when order matters; "implement", not "consider" — the guide's
golden rule is that a colleague with minimal context could follow it);
**add context to improve performance** (a `<motivation>` block says *why*, so
the agent can generalise instead of pattern-matching); **use examples
effectively** (`<example>` blocks wherever an output shape would otherwise
drift); **structure prompts with XML tags** (the same tag names in every
prompt); **give Claude a role**; **long-horizon reasoning and state tracking**
("emphasize incremental progress", structured state in the ledger, free-text
progress notes in the handoff); **balancing autonomy and safety** (local,
reversible actions are encouraged; anything hard to reverse or visible to
others is an owner action, marked `[!owner]`); **overeagerness** (every prompt
carries a scope boundary — no features, refactors or "improvements" beyond
what was asked); **avoid focusing on passing tests and hardcoding** (a guard
that is green on its own fixture is not a guard); **minimizing hallucinations
in agentic coding** (a `<discovery>` phase before any edit; never speculate
about code you have not opened); **subagent orchestration** (the guide warns
of overuse — here the rule is to work directly, §4.5).

Prompt anatomy (identical in every task file):

```xml
<role>who the agent is, in which repo, following which conventions</role>
<task>the deliverable, in one paragraph, verbs first</task>
<motivation>why it matters — what breaks or stays unprovable without it</motivation>
<done_check>commands a fresh agent runs FIRST; §4 decides what happens next</done_check>
<discovery>what to read/measure before editing</discovery>
<requirements>nested, named constraints — scope boundaries, formats, invariants</requirements>
<steps>numbered, dependency-ordered</steps>
<validation>the exact commands, narrowest first, read directly (never through a pipe)</validation>
<success_criteria>measurable, re-checked at the end; ratchet old → new</success_criteria>
<stop_conditions>when to stop and report instead of deciding</stop_conditions>
```

Every prompt assumes the `<repo_conventions>` block of
[`../program-2026-09-04/README.md` §5](../program-2026-09-04/README.md#5-how-these-tasks-are-written)
**verbatim** (packages, file layout, styling contract, generated authority,
evidence rules, validation, authority, handoff shape) — it is not repeated
here so it cannot drift — plus this delta:

```xml
<program_conventions program="2026-09-22" extends="program-2026-09-04 README §5 repo_conventions">
  <baseline>main @ 589be13 (clean). validate:all link count: COUNT IT with node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)" — never quote a number from a README.</baseline>
  <premises>The _Gap:_ preamble is a hypothesis. The done_check is a mechanical aid, not a verdict; confirm every pass by a second route.</premises>
  <execution>Solo agent; no subagents; handoff skeleton first, append incrementally; extract from ledgers with grep -n.</execution>
  <handoff>docs/program-2026-09-22-planning/reports/&lt;TASK-ID&gt;-handoff.md, sections in the 09-04 order: files + API effect · focused validation · aggregate qualification (pre-existing vs new red, separately) · ratchets · owner decisions (numbered, options, recommendation) · ranked next packet. Update EXECUTION-STATUS.md.</handoff>
  <authority>No commit, push, CI dispatch, baseline replacement, publication, registry mutation, deployment or dependency-major upgrade of a published package without its own changeset. Preserve unrelated dirty work in ui/dzup-ui, ui/dzup-ui-pro and workspace-docs. Do not rebuild workspace-docs/indexes/document-catalog.jsonl.</authority>
</program_conventions>
```

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[x] found-done` (done-check passed, nothing run) · `[!]` blocked on owner decision
> **Priority:** 🔴 blocks other work / active risk · 🟠 trust & quality · 🟢 growth & polish
> **`[!owner]`** — the task ends in an owner decision; the agent prepares, the owner decides/executes.

## 6. Task file and dependency order

```text
PL  Planning-ledger residuals                                       planning-residual-tasks.md
 ├─ PL-O1 🟠 workspace dependency-graph hygiene (Vite 7 / plugin-vue 6 for the apps · one Vue · a guard)
 ├─ PL-O2 🔴 consumer-resolution helper reachable outside the workspace · tooling seam decision [!owner]
 ├─ PL-O3 🟢 landing Lighthouse re-measure · CLS baseline promotion packet [!owner baseline]   (after PL-O1 — first paint changes with Vite 7)
 └─ PL-O4 🟢 disposition stamps on the 39 planning documents + README rewrite (workspace-docs)
```

| File | Contents |
|---|---|
| [`planning-docs-disposition.md`](./planning-docs-disposition.md) | The 39-row review: asked for · disposition · proof · residual → owner. |
| [`planning-residual-tasks.md`](./planning-residual-tasks.md) | TASK-PL-O1…O4 — the only OSS work the planning directory still owes. |
| [`EXECUTION-STATUS.md`](./EXECUTION-STATUS.md) | Live ledger — one row per task; update it as §4 says. |

Suggested execution order: **PL-O1 → PL-O2** (both touch the dependency graph
and the consumer story; O2's fixture is easier once the apps share one Vite
major), then **PL-O3** (measure after O1 lands, not before), and **PL-O4** at
any time by a separate agent — it edits only `workspace-docs`.

## 7. Owner decisions this program raises

1. **Tooling seam** — publish `@dzup-ui/tooling` (a `release-policy.json`
   edit), relocate the resolution helper into a published package (recommended:
   `@dzup-ui/testing/resolution`), or leave external consumers to copy it
   (TASK-PL-O2). The Pro repository has recorded the same seam request in
   its own programme; the option-A packet prepared here cites that ledger by
   path, and its facts stay there.
2. **`@floating-ui/vue` Vue duplicate** — a `resolutions` override in the
   root `package.json` versus a dependency bump; both are visible to
   consumers of `@dzup-ui/core` (TASK-PL-O1).
3. **Landing Lighthouse baseline** — which distribution becomes the recorded
   baseline, and whether the hero-split CLS budget assertion stays the
   binding gate (TASK-PL-O3).

Decisions carried unchanged from the planning documents to
program-2026-09-04: `apps/sandbox` (TASK-R1-O6), remote CI dispatch
(TASK-R1-O4), Firefox/WebKit evidence (TASK-R2-O1).

## 8. Explicitly **not** tasked (and why)

- **Consumer-application work the 08-08 plan named** — SK-2's app half
  (`MfaSetupModal`, `TemplatePicker`, `DzFileUploadModal`,
  `AppChatDrawerShell` live in reward-app), APP-1 across 14 apps, D3 stub
  removal, D5 / AR-2 Arabic vendored core, the `@datazup/dzup-theme`
  `dzupAliases` patch and `website-app`'s mode. Other repositories; the
  proposal for their owners is `docs/resolution-external-consumers.md`.
- **Re-running SK-1 / SK-2 / REC-01 / the 08-11 P0–P1 packets** — done;
  their proof is in §3.
- **Anything Pro-owned** — the Showcase, the model layer, the Pro validators
  and every 08-09 / 08-10 session prompt. Their disposition and residuals are
  in the Pro programme, not here.
- **A Nuxt-side Vue dedupe** — `@nuxt/devtools` and `@nuxt/nitro-server`
  carry their own Vue for their own tooling; not the library's graph.
- Commit / push / CI dispatch / publication / DNS — owner authority, every time.
