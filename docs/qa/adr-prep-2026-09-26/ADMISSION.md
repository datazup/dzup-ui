# Admission — DZUP-UI-ADR-PREP-20260926-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-ADR-PREP-20260926-R1 |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `3ee3d5f886435827138334b0ecc774d10275d47b` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-adr-prep-20260926` |
| Branch | `docs/adr-prep-20260926` |
| Plan reference | TASK-R0-O2 (ADR-18/19/20 acceptance); owner decisions **D176** and **D181**, taken 2026-09-26 (`docs/qa/owner-decisions-2026-09-26/ADMISSION.md`) |
| Authorisation | Operator, 2026-09-26: "do proceed with the recommended work" (packet 5: prepare the acceptance texts; accepting them is the owner's signature) |

## Scope

- **ADR-18 A6.** Record that D176 closes A1, and that the floor now has a green
  run, which discharges A2. The evidence is CI run 36240779455, job
  *validate-min-runtime*, on Node 20.19.0. Restate A4 (the Nuxt 4.4.5 pin) for
  the kept floor.
- **ADR-20 A9.** Record that D181 (a) is discharged by the existing A8.1, and
  that the floor decision does not change A8.1's reading.
- **`ACCEPTANCE.md`.** The exact edit that accepts each ADR: the `Status:` line,
  and `maxProposedCitedFromCode` in `packages/tooling/scripts/adr-registry.json`.
  The edit is not applied. Accepting an ADR is an owner act (D188), so this
  packet does not flip any status.

ADR-19 is not edited: it has no unmet precondition and needs only the signature.

## Allowed paths

- `docs/adr/ADR-18-runtime-floor-and-validator-runner.md` (appended A6)
- `docs/adr/ADR-20-provider-contract.md` (appended A9)
- `docs/qa/adr-prep-2026-09-26/**`

## Acceptance

`yarn validate:adr-references`, `yarn lint` and `yarn validate:all` exit 0, and
`maxProposedCitedFromCode` is still 3. CI is green on the landed commit.

## Authority

| Class | Granted |
|---|---|
| Candidate commit, local integration, push `refs/heads/main` | yes |
| Cleanup of this packet's worktree and branch | yes |
| Flipping an ADR's `Status:` line (acceptance) | **no** — owner |
| Publish, tag, secrets, PR #3 merge, production | **no** |
