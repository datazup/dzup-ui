# dzup-ui fresh release-evidence bundle — admission

Date: 2026-09-24. Owner: Claude Code session
`session_01G3dYK3JZAU4a7YFwGBzfDv`.

Packet: `DZUP-UI-RELEASE-EVIDENCE-20260924-R1`. Base:
`cb51c7dfe0b55172c5562e6ae1f303c50b6ef766` (`refs/heads/main`, CI run
`36030382070` all green).

## Why now

PR #3 ("chore: version packages") would be the first npm publish of every
`@dzup-ui/*` package; all six names return 404 from the registry today. The only
release bundle on file, `docs/qa/release/2026-09-21-527dbd1/`, is
`admissible: false`: it was cut from a dirty tree, 206 of its files have
changed since, and its API diff predates the `ariaInvalid` removal. Its own
ledger says a fresh bundle must be cut from a clean tree before a publish
decision rests on one. The operator authorized that cut in session on
2026-09-24 ("do proceed with recommended next steps").

## Change

Run `bash scripts/release-rehearsal.sh` unmodified, in a clean Storage
worktree, at the commit that adds this file (the base plus this document
only). The rehearsal runs every gate, the API diff, the supply-chain evidence
and the report into `docs/qa/release/<utc-date>-<short-sha>/`, then that bundle
is committed.

The bundle's own output directory is untracked while the rehearsal writes it,
and the release binding (`packages/tooling/src/release/binding.ts`) counts every
untracked path as dirt. Left alone, the bundle would stamp itself inadmissible
for containing itself. The run therefore excludes **only its own output
directory** from `git status`, through a process-scoped
`core.excludesFile` (`GIT_CONFIG_COUNT`), not a repository change. Any other
path a gate writes still makes the bundle inadmissible.

## Allowed paths

- `docs/qa/release-evidence-2026-09-24/ADMISSION.md`
- `docs/qa/release/<utc-date>-<short-sha>/**` (the bundle the rehearsal writes;
  the lease covers `docs/qa/release/**` because the short sha is not known until
  this file is committed)

## Acceptance

1. Every rehearsal gate exits 0 and the bundle reads `admissible: true`, bound
   to one commit.
2. The API diff's treatment of the `ariaInvalid` removal is recorded as it is:
   nothing has been published and no admissible surface was ever recorded, so a
   default diff cannot classify it as a change. Whether it appears is a finding,
   not something to force.
3. Nothing is published, tagged, signed or dispatched.

## Authority

Candidate commit, local integration onto `main`, and push of the paths above:
granted (reused within scope). Tag, version bump, npm publish, merging PR #3,
production: **not granted**. PR #3 remains the operator's decision.

## Deferred

- Re-measuring the DzCombobox / DzMultiSelect browser-matrix cells. The ledger
  records one run per engine and condition (24 projects, win32, ~20 min each); a
  two-component re-run would overwrite whole-project provenance. It needs its
  own packet.
- Recording an admissible API-surface baseline
  (`release:api-surface:record`). It belongs to the commit that is actually
  published.

## Outcome (2026-09-24, same session)

Bundle: [`../release/2026-09-24-0a47569/`](../release/2026-09-24-0a47569/),
cut from `0a47569` (this admission's commit) with `git status --porcelain`
empty. **Admissible: true.** All 15 rehearsal gates exit 0 (logs in the
bundle). Content digest `2269125b…aef6b` over 3,647 files.

What the bundle says, for the PR #3 decision:

1. **API diff.** `@dzup-ui/contracts` has fidelity `none` (no published
   version, no admissible snapshot), so the `ariaInvalid` removal is not
   classified: `grep -c ariaInvalid api-diff.json` is 0. It is declared by the
   changeset `aria-invalid-is-a-validation-prop-and-only-validation-props-carry-it.md`
   (contracts `minor`). Since nothing has been published, no consumer can be
   broken by it; acceptance item 2 is met as a recorded finding.
2. **Stop condition `unexplained-api-diff` (core).** `generate:exports` would
   drop five composable barrel lines (`useAffix`, `useCalendar`,
   `useInfiniteScroll`, `useScrollSpy`, `useScrollToTop`) and add two
   (`useCountdown`, `useIntersection`). The publish itself does not run the
   generator. The barrel and the manifest disagree, and which one is right is
   the owner decision TASK-R0-O1 still holds.
3. **Vulnerabilities: 8 high, 11 moderate, 1 low, all reached via
   `@dzup-ui/mcp`.** They are keyed to this repository's lockfile: `fast-uri`
   3.1.0 through `ajv`, `ip-address` 10.1.0/10.2.0 through `socks` and
   `express-rate-limit`, and `hono` / `@hono/node-server`. The declared ranges
   admit patched versions, so a fresh consumer install may resolve past them.
   The lockfile refresh is its own packet.
4. **No OSS rollback policy** (report section 8). The `npm deprecate` path is
   stated only in the generated report.
5. **Nuxt fixtures are staged, not built.** Gate 13 packs four tarballs and
   stages six fixtures outside the repository ("ready"). `core-pro` is
   `unrun`. No fixture app is installed or built by this gate.
6. **Report text defect.** Report section 8's "Ranked next work" is fixed text
   in `packages/tooling/src/release/report.ts`. It still reads "every artifact
   here is stamped `admissible: false`" and "nothing in section 3 has ever run
   on CI". Both are false for this bundle. Not fixed here.
7. **Changesets.** The bundle counts 40 pending; PR #3's body lists 41. That is
   not reconciled here.
