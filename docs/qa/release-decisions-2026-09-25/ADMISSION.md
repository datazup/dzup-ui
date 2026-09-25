# Admission — DZUP-UI-RELEASE-DECISIONS-20260925-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-RELEASE-DECISIONS-20260925-R1 |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `09738ba788ecda3b8b59f8ff42d5eda418ec3a3b` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-release-decisions-20260925` |
| Branch | `chore/release-decisions-20260925` |
| Plan reference | `docs/program-2026-09-04/README.md` §7 — owner decisions A4-D1 / TASK-R0-O1 (export list, rollback policy) and N5-01-D1 (changelog system of record) |
| Owner decisions | Taken by the operator on 2026-09-25 ("do proceed with recommended decisions"), recorded below. This packet only applies them. |

## Why now

Release PR #3 (`changeset-release/main`, head `f61c872`) has never run CI: workflows
do not trigger on a PR opened with the bot `GITHUB_TOKEN`. Measured on its tree
(evidence `/data/storage/datazup-runtime/ninel/evidence/dzup-ui-pr3-probe-20260925/`):

- `validate:changelog` exits 1 — `changeset version` writes `## x.y.z`, the gate demands an ISO date;
- `validate:mcp` exits 1 — `@dzup-ui/mcp` becomes 0.2.1 while `server.json` (x2) and
  `docs/mcp-tool-surface.json` stay 0.2.0, and `server.json` ships in the tarball;
- `validate:release-policy` exits 1 — R9 (6 colliding headings, ceiling 1) and R1
  (`changeset status` on the release branch, an artifact of the branch).

Merging would publish, then turn `main` red. The release report also carries two
TASK-R0-O1 stop conditions (the `generate:exports` barrel drift) and cites a Pro
rollback document that does not exist.

## Decisions applied

1. **N5-01-D1 — the gate follows the tool.** A version heading is `## x.y.z`
   (Changesets' native shape); a date is optional. `version-packages` also syncs
   `@dzup-ui/mcp`'s `server.json` versions and regenerates its tool surface, so the
   release PR carries one version everywhere. `@dzup-ui/mcp` joins
   `validate:changelog` coverage (its exemption existed only because of the
   collision). The five published packages without a `repository` field get one.
2. **Core export list — keep what `index.ts` exports today (option A).**
   `public-api.manifest.json` gains `useAffix`, `useCalendar`, `useInfiniteScroll`,
   `useScrollSpy`, `useScrollToTop` and loses `useCountdown`, `useIntersection`.
   The shipped surface does not change.
3. **Rollback policy — one page**, `docs/release/rollback.md`: deprecate + superseding
   patch; `dist-tag` back to the last good version; unpublish only for a leaked
   secret inside npm's 72 h window; the npm-scope owner (operator) acts.

## Allowed paths

- `docs/qa/release-decisions-2026-09-25/ADMISSION.md`
- `package.json` (scripts only)
- `packages/{contracts,core,nuxt,testing,tokens}/package.json` (`repository` only)
- `packages/mcp/scripts/sync-server-version.ts` (new)
- `packages/tooling/scripts/validate-changelog.ts`
- `packages/tooling/scripts/validate-release-policy.ts`, `validate-release-policy.spec.ts`, `release-policy.json`
- `packages/core/manifests/public-api.manifest.json`
- `packages/core/src/index.ts` (comments only)
- `docs/release/rollback.md` (new)
- `packages/tooling/src/release/report.ts` (rollback + ranked-next-work text)

## Acceptance

1. `yarn typecheck:all`, `yarn lint`, `yarn test` exit 0 on the candidate.
2. `CI=1 DOCS_SIZE_ALLOW_MISSING_DIST=1 yarn validate:all` exits 0 after `yarn build`.
3. **Release simulation:** in a Storage clone of the candidate, `yarn version-packages`
   then commit to local `main`; `validate:changelog`, `validate:mcp` and
   `validate:release-policy` each exit 0, and `server.json` (x2) / the tool surface
   equal the bumped `package.json` version.
4. `yarn release:api-diff` on the candidate reports no `unexplained-api-diff` and no
   barrel-drift `manifest-omission` (no DROP, no ADD), and no undelivered symbols.
5. The packed `@dzup-ui/core` root surface is unchanged (same barrel export lines).

## Authority

| Class | Granted |
|---|---|
| Candidate commit | yes |
| Local integration (ff canonical `main`) | yes |
| Push `refs/heads/main` | yes — the operator asked for the decisions to be applied before the report recut |
| Cleanup (own worktree/branch) | yes |
| npm publish, tag, version bump, PR #3 merge, secrets, production | **no** — operator's |

## Deferred

- Release-bundle recut on the landed commit (next step, own commit after landing).
- Running release validators inside `release.yml` before publish (not decided).
- The 455 symbols the manifest name lists do not document (a stale document, not a
  generator action; not part of decision 2).
- Adding `useCountdown` / `useIntersection` to the public API (additive, later).
- `NPM_TOKEN` and npm scope ownership — operator to confirm.
