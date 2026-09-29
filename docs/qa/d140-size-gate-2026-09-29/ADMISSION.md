# Admission — DZUP-UI-D140-SIZE-GATE-20260929-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-D140-SIZE-GATE-20260929-R1 (owner decisions D135 (a), D140, O7-D1 size half) |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `7c23198aa32fc3c06488ca0d3f91cec84d53dfaf` (`refs/heads/main`, local = origin, 2026-09-29) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-d140-size-gate-20260929` |
| Branch | `d140-size-gate-20260929` |
| Plan reference | D135 and D140 (`docs/program-2026-09-04/reports/owner-decision-register-2026-09.md`), O7-D1 (`TASK-R2-O7-handoff.md`); previous packet `docs/qa/d135-size-budgets-2026-09-29/` |
| Authorisation | Operator (owner), 2026-09-29: accepted the recommendation — "do prepare tmux to complete any work has to be done". |

## Owner decisions recorded

- **D135 (a) / D140: adopt.** A blocking check fails when any of the 22
  budgeted components' tree-shaken size exceeds its `size:*` threshold. It does
  not depend on `DZUP_PERF_GATE`.
- **O7-D1, size half: adopt.** The 10 `size:*` baselines that pass are
  re-recorded at the base, in the same packet.
- **O7-D1, runtime half: defer.** Runtime metrics are machine-dependent and need
  a quiet declared host. Nothing runtime is touched.
- **Leaner ICU plural formatter: decline.** Only DzMention and DzDataView of the
  22 budgeted bundles carry it. Dropping `select`/`selectordinal` support would
  silently break consumer messages at runtime.

## Authority classes

| Class | Granted |
|---|---|
| Candidate commit | yes, on the branch above |
| Local integration | yes, fast-forward of canonical `main` under the integration lane |
| Push | yes, `refs/heads/main` only, after `ls-remote` still equals the base (else rebase and re-gate) |
| Cleanup | yes, this packet's own worktree and branch only |
| Baseline rewrite | **yes, the 10 passing `size:*` entries only** |
| Runtime baselines, npm publish, tag, workflow dispatch, secrets, branch protection, production, PR #3 | **no** |

## Scope

1. `packages/tooling/src/perf/size-gate.ts`: measure every `size:*` metric in
   `packages/core/perf/baselines.json` with `measureExportSizes` and exit
   non-zero naming each component over its threshold. A pure comparison
   function is unit-tested in `size-gate.spec.ts`. Script `perf:size-gate`.
2. `.github/workflows/ci.yml`: a blocking "Per-export size gate" step beside
   the informational per-component size report. It joins `validate:all` only
   if it costs under ~30 s.
3. Rewrite the 10 passing `size:*` entries from `measureExportSizes` at the
   base with `toBaseline`, `sourceCommit` = base. The 12 D135 entries and all
   runtime entries stay byte-identical.
4. Regenerate readers: capability-matrix → component-meta → docs-pages → llms,
   then copy component-meta to `apps/landing/public/r/`.
5. Record the four decisions in the owner-decision register. Correct the
   `perf-bench.spec.ts` comment that says nothing asserts a `size:*` metric.

## Allowed paths

- `docs/qa/d140-size-gate-2026-09-29/ADMISSION.md`, `EVIDENCE.md`
- `packages/tooling/src/perf/size-gate.ts`, `size-gate.spec.ts`
- `packages/tooling/src/perf-bench.spec.ts` (comment only)
- `package.json` (scripts only), `.github/workflows/ci.yml`
- `packages/core/perf/baselines.json`
- `docs/program-2026-09-04/reports/owner-decision-register-2026-09.md`
- Generated: `packages/core/docs/{capability-matrix.json,component-meta.json,llms-full.txt}`,
  `apps/storybook/stories/_data/capability.generated.ts`,
  `apps/landing/public/r/component-meta.json`, `apps/docs/**` (generator
  output only; a subtree claim because the docs-pages generator rewrites
  ~150 files under it)

## Acceptance

1. Negative control: with one threshold lowered in a scratch copy of the
   baselines, the gate exits non-zero and names that component. On the real
   tree it exits 0 with all 22 within budget.
2. The 10 rewritten entries equal `toBaseline` of `measureExportSizes` at the
   base; the other 23 entries are byte-identical.
3. In a fresh Storage worktree: `yarn install --immutable` →
   `yarn tokens:generate` → `yarn build` → `yarn typecheck`, `yarn lint`,
   unit tests, `yarn validate:all` pass; regeneration leaves no diff.
4. The pushed commit's CI, Chromatic and Release workflows are green.

## Deferred

- Runtime baselines (O7-D1 runtime half): need a quiet declared host.
- A leaner ICU formatter: declined, see above.
