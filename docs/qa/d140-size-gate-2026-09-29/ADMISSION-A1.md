# Admission amendment A1 — DZUP-UI-D140-SIZE-GATE-20260929-R1

| Field | Value |
|---|---|
| Amends | [`ADMISSION.md`](./ADMISSION.md) (base `7c23198`), landed as `9cb0b02` |
| Base | `9cb0b02e005b54ead55b89a3aefb2e30daeebcbd` (`refs/heads/main`, local = origin) |
| Worktree / branch | unchanged (`dzup-ui-d140-size-gate-20260929`, `d140-size-gate-20260929`) |
| Reason | Acceptance 4 (CI green) is blocked, and the new size gate cannot run in CI |

## Blocker

CI run [36605155404](https://github.com/datazup/dzup-ui/actions/runs/36605155404)
on `9cb0b02` fails in *Validate → Landing generated artifacts unchanged*. The
Build job, which now holds the size gate, is skipped. The base `7c23198` failed
on the same step (run 36586557715); `b8d35b5` passed.

Attribution: `7c23198` (CT-KITS-R1-20260929-AMENDMENT-A1) added a
`@dzup-ui/tokens` changeset but did not regenerate
`apps/landing/src/generated/releases.ts`. In a clean Storage clone of
`9cb0b02`, the CI step's generators change only that file: one new `PENDING`
entry, the tokens declarations changeset. At admission no `ui/dzup-ui` writer
lease was active, and that lane's worktree sits at its merged head.

## Scope and allowed paths

Regenerate with `yarn workspace @dzup-ui/landing build:releases` and commit the
output.

- `apps/landing/src/generated/releases.ts` (generator output only)
- `docs/qa/d140-size-gate-2026-09-29/ADMISSION-A1.md`, `EVIDENCE.md`

Authority classes are unchanged from `ADMISSION.md`.

## Acceptance

The CI step's generators leave no diff, and the pushed head's CI, Chromatic
and Release runs are green.
