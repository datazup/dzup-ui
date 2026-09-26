# Admission — DZUP-UI-CHANGESET-AUDIT-20260926-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-CHANGESET-AUDIT-20260926-R1 |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `788f5ba40beb7bffe91b673c12e8eb8a4b22a4b1` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-changeset-audit-20260926` |
| Branch | `chore/changeset-audit-20260926` |
| Plan reference | Owner decision **D180**, taken 2026-09-26 (`docs/qa/owner-decisions-2026-09-26/ADMISSION.md`): (b) a deep audit of `the-six-cascade-layers-the-styling-contract-promised` (#33), (a) the first pass for the rest. Re-levelling proposal: `docs/program-2026-09-04/reports/publication-decision-packet-2026-09.md` §3 and §7 |
| Authorisation | Operator, 2026-09-26: "do proceed with the recommended work" |

## Why now

`changeset version` has not run. Every level must be right before it does,
because re-levelling after a publish cannot recall a version. #33 is the one
changeset whose first-pass error could run in the unsafe direction: a `patch`
that changes which consumer override wins would reach every `^` range
unannounced.

## Scope

1. **#33, measured.** Build the stylesheets at `99b963a` (the parent of
   `a01965f`, which added #33) and at the base, pack both as a consumer receives
   them, and render the same consumer overrides against each in real browsers.
   The matrix: consumer CSS unlayered, in each of the six ADR-19 layers, and in
   a layer of its own; placed before and after the library; the two library
   sheets in both emit orders; four properties, one owned by each kind of
   library rule (`dz-components`, the moved reset, `body`, a token). The level
   for #33 follows from the differences found, per `VERSIONING.md` §1 and §2.2.
   The second ground already recorded in the register (the `data-state` type
   widening, §2.1) is assessed on its own.
2. **The first pass for the rest.** Re-level the 13 changesets the publication
   packet lists: N5-01's 11 (#1–#4, #6–#9, #13's contracts half, #14, #15) and
   #20 and #23 from §3.2, `minor` → `patch`. The five contested (#18, #29, #32,
   #36 and #33 itself) keep their declared level except where step 1 changes #33.
3. **Record.** The report, the harness and its raw result; the register's D180
   row.

No publish, tag, `changeset version`, PR #3 merge, secret or production change.

## Allowed paths

- `docs/qa/changeset-audit-2026-09-26/` — `ADMISSION.md`, `REPORT.md`,
  `layer-precedence-diff.mjs`, `layer-precedence-diff.json`
- `docs/program-2026-09-04/reports/owner-decision-register-2026-09.md` (D180 row)
- `.changeset/<name>.md` for the 13 re-levelled changesets and #33

## Acceptance

1. The harness runs against both packed stages in Chromium and Firefox and
   writes every cell to `layer-precedence-diff.json`. WebKit is attempted; if
   the host cannot launch it, the report says so.
2. The report states each before/after difference and the level that follows.
3. `yarn validate:release-policy` and `yarn changeset status` exit 0 and the
   release plan is recorded.
4. `yarn lint` passes. CI on the landed commit is green.

## Authority

| Class | Granted |
|---|---|
| Candidate commit | yes |
| Local integration (ff `main`) | yes |
| Push `refs/heads/main` | yes |
| Cleanup of this packet's worktree, branch and the `99b963a` scratch clone | yes |
| Publish, tag, `changeset version`, secrets, PR #3 merge, production | **no** |

### Amendment 1 (same epoch, before landing)

CI run 36240779455 on `788f5ba` (packet DZUP-UI-OWNER-DECISIONS-20260926-R1)
failed one step: Validate, "Landing generated artifacts unchanged".
`apps/landing/src/generated/releases.ts` is generated from `.changeset/` by
`yarn workspace @dzup-ui/landing build:releases`, and that packet changed three
changesets without regenerating it. This packet changes 14 more, so it
regenerates the file once for both. All seven generators in that CI step were
re-run; only `releases.ts` changed. Added path:
`apps/landing/src/generated/releases.ts`. The regeneration ran a moment before
the lease amendment that covers the file was applied (the first amend was
refused on head drift after the commit); nothing else wrote to it.
