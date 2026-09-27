# Admission — DZUP-UI-VISUAL-GATE-FLIP-20260927-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-VISUAL-GATE-FLIP-20260927-R1 (TASK-R2-O6, the `<ci_gate>` rule) |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `e473e64a9d792af5038b5caf6fa77e5fce8655cd` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-visual-gate-flip-20260927` |
| Branch | `ci/visual-gate-flip-20260927` |
| Plan reference | `workspace-docs/repos/dzup-ui/docs/planning/dzup-ui-next-steps-2026-09-26.md` §1 item 1; `docs/qa/visual-lane-container-2026-09-26/ADMISSION.md` scope item 4 |
| Authorisation | Operator, 2026-09-27: "do proceed with the implementation" of those notes. The rule itself was admitted with the lane (O6-D2 b, owner 2026-09-26) |

## Authority classes

| Class | Granted |
|---|---|
| Candidate commit | yes, on the branch above |
| Local integration | yes, fast-forward of canonical `main` under the integration lane |
| Push | yes, `refs/heads/main` only, after `ls-remote` still equals the base |
| Cleanup | yes, this packet's own worktree and branch only |
| Production, publish, tag, secrets, branch protection | **no** |

## Outcome

A visual regression fails CI instead of being reported and ignored.

## Measured before any edit

The `Visual Snapshots (pinned container)` job, three consecutive pushes to
`main`, each log ending `58 passed` (the step outcome, not a
`continue-on-error` mask):

| # | Commit | CI run | Visual job |
|---|---|---|---|
| 1 | `bce1312` | 36268407552 | 108477851294 — 58 passed |
| 2 | `bf8d5bd` | 36269511350 | 108480895755 — 58 passed (the run was red on an unrelated `Validate` step, fixed in `e473e64`) |
| 3 | `e473e64` | 36301560614 | 108570262383 — 58 passed |

## Scope

1. `.github/workflows/ci.yml`: remove `continue-on-error: true` from the visual
   step; the report upload becomes `if: failure()`; the job comment states the
   three runs.
2. Record the flip in the TASK-R2-O6 note and the 09-22 residual row.

## Allowed paths

- `docs/qa/visual-gate-flip-2026-09-27/ADMISSION.md`
- `.github/workflows/ci.yml`
- `docs/program-2026-09-04/evidence-completion-tasks.md`
- `docs/program-2026-09-22-planning/EXECUTION-STATUS.md`

## Acceptance

1. `grep -n 'continue-on-error' .github/workflows/*.yml | grep -i visual | wc -l`
   → 0 (the R2-O6 `<done_check>` clause).
2. `ci.yml` parses as YAML, and the repo's workflow validator passes if one exists.
3. The pushed commit's CI run is green with the visual job blocking.

## Deferred

Waves 0–4 (coverage 8 → 89 of 144, owner accepts per family); O6-D1, O6-D3,
O6-D4, O6-D5; making the job a required check in branch protection (owner).
