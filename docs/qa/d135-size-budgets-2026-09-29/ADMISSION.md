# Admission — DZUP-UI-D135-SIZE-BUDGETS-20260929-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-D135-SIZE-BUDGETS-20260929-R1 (owner decision D135, the budget half) |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `70647fba7b7fe49ddf39fc39fe33dbe4391ade68` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-d135-size-budgets-20260929` |
| Branch | `d135-size-budgets-20260929` |
| Plan reference | D135 (`docs/program-2026-09-04/reports/owner-decision-register-2026-09.md`, `TASK-R2-O7-handoff.md` §D135 and O7-D1); the measurements are in `docs/qa/d135-quality-tiers-treeshake-2026-09-29/EVIDENCE.md` |
| Authorisation | Operator (owner), 2026-09-29: "do raise the new measurement as you recommend". The recommendation was to raise the budgets that remain breached after the quality-tiers cut to their current measurements. |

## Owner decision recorded

**D135: adopt the current per-export sizes as budgets for the 12 `size:*`
metrics still breached at the base.** The 10 that pass keep their existing,
tighter baselines, and no runtime metric is touched. Sizes are deterministic
builds, so the quiet-machine caveat of O7-D1 (c) applies to runtime metrics
only.

The same message asked to load the ICU formatter "only when a message needs
plurals". Measurement at the base shows that is a no-op, so nothing is changed
for it:

- the formatter is already tree-shaken out of every bundle except the five
  components that call `useComponentMessageFormat` (DzCountdown, DzDataView,
  DzMention, DzRating, DzTagsInput);
- every message those five format is a plural message (`messages.ts`
  253–256, 269, 271, 288, 310, 327–328);
- DzDataView formats on first render, so an asynchronous load would leave its
  status line empty on first paint and in SSR.

The earlier statement that the formatter costs "~2.5 KB in every component with
text" was wrong. It is in 2 of the 22 budgeted bundles.

## Authority classes

| Class | Granted |
|---|---|
| Candidate commit | yes, on the branch above |
| Local integration | yes, fast-forward of canonical `main` under the integration lane |
| Push | yes, `refs/heads/main` only, after `ls-remote` still equals the base (or a rebase re-gated on the new base) |
| Cleanup | yes, this packet's own worktree and branch only |
| Baseline rewrite | **yes, the 12 breached `size:*` entries only** (owner, above) |
| A `size` arm in the perf gate (D135 (a) / D140) | **no** — not requested |
| Production, publish, tag, secrets, branch protection | **no** |

## Scope

1. Rewrite the 12 `size:*` entries in `packages/core/perf/baselines.json` from
   `measureExportSizes` at the base, using `toBaseline` (the capture tool's own
   threshold formula), with `sourceCommit` set to the base.
2. Regenerate what reads the file, in the repository's order:
   capability-matrix → component-meta → docs-pages → llms. Then copy
   component-meta to the landing app.
3. Record the D135 decision in the owner-decision register.

## Allowed paths

- `docs/qa/d135-size-budgets-2026-09-29/ADMISSION.md`, `EVIDENCE.md`
- `packages/core/perf/baselines.json`
- `docs/program-2026-09-04/reports/owner-decision-register-2026-09.md`
- Generated: `packages/core/docs/{capability-matrix.json,component-meta.json,llms-full.txt}`,
  `apps/storybook/stories/_data/capability.generated.ts`,
  `apps/landing/public/r/component-meta.json`, `apps/docs/**` (generator output only)

## Acceptance

1. Each of the 12 new medians equals `measureExportSizes` at the base.
   Threshold = median × 1.05. The other 21 metrics (10 sizes, 11 runtime) are
   byte-identical.
2. After the rewrite, all 22 `size:*` measurements are at or under their
   thresholds.
3. `yarn typecheck`, `yarn lint`, `yarn validate:all` pass; the generated
   artifacts leave no diff after regeneration.
4. The pushed commit's CI run is green.

## Deferred

- The gate that asserts `size:*` thresholds (D135 (a) / D140). Until it lands,
  nothing enforces these budgets.
- Refreshing the 10 passing size baselines and the runtime metrics (O7-D1).
