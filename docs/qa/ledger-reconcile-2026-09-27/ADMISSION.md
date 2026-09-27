# Admission — DZUP-UI-LEDGER-RECONCILE-20260927-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-LEDGER-RECONCILE-20260927-R1 |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `bf8d5bd3b9922e19100f5697e2db95aab47a5e8d` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-ledger-reconcile-20260927` |
| Branch | `chore/ledger-reconcile-20260927` |
| Plan reference | `workspace-docs/repos/dzup-ui/docs/planning/dzup-ui-next-steps-2026-09-26.md` §1, items 1–2 ("ready now, no new owner decision") |
| Authorisation | Operator, 2026-09-27: "do proceed with the implementation" of those notes |

## Authority classes

| Class | Granted |
|---|---|
| Candidate commit | yes, on the branch above |
| Local integration | yes, fast-forward of canonical `main` under the integration lane |
| Push | yes, `refs/heads/main` only, after `ls-remote` still equals the base |
| Cleanup | yes, this packet's own worktree and branch only |
| Production, publish, tag, secrets, PR #3, workflow dispatch | **no** |

## Outcome

`main` is green again, and the two execution ledgers and the owner-decision
register stop reporting as open the things that were done on 2026-09-26.

## Measured before any edit (at the base)

- **CI on `bf8d5bd` is red** (run 36269511350). The only failing job is
  `Validate (boundaries + tokens)`, step "Landing generated artifacts
  unchanged". The sibling's DzStatCard commit added a changeset without
  running `build:releases`, so `apps/landing/src/generated/releases.ts` is
  missing one pending entry (10 lines). Every other job passed.
- **Visual lane, run 2 of 3:** the `visual` job on `bf8d5bd` reports
  `58 passed`. Run 1 was `bce1312` (run 36268407552, 58 passed).
- **Stale rows, each checked against the repository:**

  | Row | Says | Measured |
  |---|---|---|
  | 09-04 ledger `TASK-R0-O2` | blocked on the owner's signature and the Node floor (D188) | `4885d0e` accepted ADR-18/19/20; the floor was decided with D160/D176 and recorded in `dd8efad` |
  | 09-04 ledger `TASK-R1-O6` | blocked on D174–D178 | D174/D175 executed `63c1325`, D177 `cc13194`, D176 decided (floor kept); **D178 still open** |
  | 09-04 ledger `TASK-R1-O4` | blocked on the owner's dispatch for step 4 | **still true.** `min-peer.yml` has 0 runs; `vue-next.yml` last ran on schedule 2026-09-21. Push CI runs green on GitHub, but step 4 is the dispatch. Not changed. |
  | 09-22 residual `apps/sandbox` | `[!]` owner | removed in `cc13194` (D177) |
  | 09-22 residual Firefox/WebKit | `[~]` | 09-04 `TASK-R2-O1` is COMPLETE (2026-09-22); re-run at clean `3ee3d5f` in `843ffad`/`6cbc6f1` |
  | 09-22 residual "remote CI state unknown" | `[!]` owner dispatch | state is known: CI green on `bce1312` (run 36268407552). The dispatch half stays on `TASK-R1-O4` |
  | Register D188 | open | owner accepted all three on 2026-09-26, after the floor decision, in one change (`4885d0e`) |
  | Register D154 | open | `yarn npm audit --recursive --environment production` in `packages/mcp` at the base: **0 advisories** (control run without `--environment`: 7 dev-only packages, so the command does audit the tree). Option (a) is executed; the severity threshold named in the row is still the owner's |

## Scope

1. Regenerate `apps/landing/src/generated/releases.ts` with `build:releases`.
2. Update the rows above. No other row, and no totals table, changes. A4-D1
   and D178 stay `open`: recording them is the owner's act.

## Allowed paths

- `docs/qa/ledger-reconcile-2026-09-27/ADMISSION.md`
- `apps/landing/src/generated/releases.ts`
- `apps/landing/public/feed.xml` (written by the same generator; unchanged if identical)
- `docs/program-2026-09-04/EXECUTION-STATUS.md`
- `docs/program-2026-09-22-planning/EXECUTION-STATUS.md`
- `docs/program-2026-09-04/reports/owner-decision-register-2026-09.md`

## Acceptance

1. `build:releases` leaves no diff after the commit.
2. The pushed commit's CI run is green, including `Validate (boundaries + tokens)`.
3. That run's `visual` job passes. It is visual run 3; the `continue-on-error`
   flip is a separate packet that cites all three runs.

## Deferred

The visual gate flip (next packet); O6-D1/D3/D4/D5; A4-D1 and every release
blocker in the notes §2; the `TASK-R1-O4` dispatch.
