# ADR-18, ADR-19, ADR-20 — ready for the owner's acceptance

Prepared 2026-09-26 by DZUP-UI-ADR-PREP-20260926-R1. **Nothing here has been
applied.** Accepting an ADR is the owner's act (owner decision D188).

## Preconditions

| ADR | Unmet precondition | Evidence |
|---|---|---|
| ADR-18 — runtime floor | **none** | The floor was decided 2026-09-26: D176 keeps `^20.19.0 \|\| >=22.13.0` (A6). The floor has a green run: CI 36240779455, *validate-min-runtime*, Node 20.19.0, `validate:all` and 10,633 tests (A6) |
| ADR-19 — styling contract | **none** | Its prerequisite packet is discharged (the ADR's own *Prerequisite packet* section). Its six cascade layers ship, and the D180 audit measured them (`docs/qa/changeset-audit-2026-09-26/REPORT.md`) |
| ADR-20 — provider contract | **none** | The §4 correction is A8.1, which discharges D181 (A9). A8.7 lists four open questions, none of which blocks acceptance |

D188's recommendation was to sign ADR-19 and ADR-20 first and hold ADR-18
until the floor was decided. The floor is now decided, so all three can be
signed in one change.

## The edit

For each ADR accepted, in one commit:

1. Replace its `Status:` line.

   ```
   - **Status:** Accepted (owner, <YYYY-MM-DD>; proposed by <the existing
     proposal text>)
   ```

2. Lower `maxProposedCitedFromCode` in `packages/tooling/scripts/adr-registry.json`
   by one per ADR accepted: 3 becomes 0 when all three are accepted. The gate
   requires the ceiling to equal the measured count, so a Status flip without
   the ceiling change fails `yarn validate:adr-references`, and so does the
   reverse.
3. Run `yarn validate:adr-references` and `yarn validate:all`.

Criterion **C1** ("ADR-18, ADR-19, ADR-20 carry `Accepted` in the ADR file
itself") moves 0/3 → 3/3.
