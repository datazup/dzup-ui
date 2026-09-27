# Admission — DZUP-UI-OWNER-DECISIONS-20260926-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-OWNER-DECISIONS-20260926-R1 |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `e168748cabf8d441fa293eef585b96c1b1b13346` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-owner-decisions-20260926` |
| Branch | `chore/owner-decisions-20260926` |
| Plan reference | `docs/program-2026-09-04/README.md` §7 — TASK-R0-O1 (publish or freeze); register `docs/program-2026-09-04/reports/owner-decision-register-2026-09.md` |
| Authorisation | Operator, 2026-09-26: took the recommended option on eight decisions, then "do proceed with the recommended work" |

## The decisions (owner, 2026-09-26)

| Id | Taken |
|---|---|
| D174 | (a) swap all three manifests to `@lucide/vue ^1.47.0` now, with visual and AT re-baseline |
| D175 | (b) `minor` |
| D176 | keep `^20.19.0 \|\| >=22.13.0` (D160's option (a)); D160 is decided the same way |
| D177 | (a) remove `apps/sandbox` fully, including the Coolify resource `dzup-ui-sandbox-production` and its DNS record. The Coolify/DNS step is a production action and is confirmed again when executed |
| N5-01 D2 | release `@dzup-ui/codemods`; keep `@dzup-ui/compat` withheld |
| D180 | (b) deep audit for `the-six-cascade-layers-…` (#33), (a) the first pass for the rest |
| D181 | (a) the ADR-20 §4 correction is carried inside the TASK-R0-O2 acceptance |
| D182 | (b) amend `VERSIONING.md` §3 to require a codemod plus written migration notes, not a `warnDeprecated` in the withheld `compat` |
| D186 | (b) one `@dzup-ui/mcp` `minor` changeset naming the three behaviour changes |

The npm publish stays deferred (no `NPM_TOKEN`). PR #3 stays open.

## Scope

This packet records the decisions and executes the ones that are docs and
release configuration only:

- **Register and ledger.** The nine rows above, and D160, move from `open` to `decided
  2026-09-26`. `EXECUTION-STATUS.md` gets one appended pointer; it does not
  restate the register.
- **N5-01 D2.** `@dzup-ui/codemods` leaves the changesets `ignore` list and
  `release-policy.json`'s `withheld` list and joins `published`. Its
  `package.json` gains the `repository` field every other published package
  carries (npm provenance checks it). The two changesets that could not name
  codemods now name it. The release specs that pinned codemods as withheld
  follow.
- **D182.** `VERSIONING.md` §3 clause 2 becomes written migration notes in the
  changeset; clause 3 names the codemod in the now-released package. §5 is
  unchanged: codemods stays migration tooling without a stable API of its own.
- **D186.** One `@dzup-ui/mcp: minor` changeset.

Not in scope, each its own later packet: the #33 audit (D180), the icon swap
(D174/D175), the TASK-R2-O1 evidence re-run, the ADR acceptance text (D181),
the sandbox removal (D177). No publish, tag, secret, PR #3 merge or production
change.

## Allowed paths

- `docs/qa/owner-decisions-2026-09-26/ADMISSION.md`
- `docs/program-2026-09-04/reports/owner-decision-register-2026-09.md`
- `docs/program-2026-09-04/EXECUTION-STATUS.md` (one appended note)
- `packages/contracts/VERSIONING.md` (§3)
- `.changeset/the-mcp-server-answers-from-the-full-catalog-and-checks-its-input.md` (new)
- `.changeset/config.json` (`ignore`)
- `.changeset/nine-aria-props-that-did-nothing-are-gone.md`, `.changeset/pro-package-is-named-dzup-ui-pro-pro.md`
- `packages/tooling/scripts/release-policy.json`
- `packages/codemods/package.json` (`repository`)
- `packages/tooling/src/release/publish.ts` (comment), `publish.spec.ts`, `release.spec.ts`

## Acceptance

1. `yarn validate:release-policy` exits 0 and reports 7 published, 1 withheld.
2. `yarn validate:changelog` exits 0.
3. `yarn release:publish --dry-run` lists `@dzup-ui/codemods` among the packages and packs it.
4. `yarn vitest run packages/tooling/src/release` passes.
5. `yarn lint` passes on the touched files; `changeset status` accepts the new changeset.
6. CI on the landed commit is green.

## Authority

| Class | Granted |
|---|---|
| Candidate commit | yes |
| Local integration (ff `main`) | yes |
| Push `refs/heads/main` | yes (operator, "proceed with the recommended work") |
| Cleanup of this packet's worktree and branch | yes |
| Publish, tag, secrets, PR #3 merge, production | **no** |

### Amendment 1 (same epoch, before landing)

1. **Compiled specs in the tarball.** The first `release:publish --dry-run`
   packed 58 files for `@dzup-ui/codemods`, 21 of them compiled specs from
   `dist/transforms/__tests__`. They were harmless while the package was
   withheld and would now ship. A `!dist/**/__tests__` entry in `files` works
   for `yarn pack` but not for `npm pack` in the order the `jsonc/sort-array-values`
   lint rule requires, so the fix is at the source, the way `@dzup-ui/contracts`
   does it: `packages/codemods/tsconfig.build.json` (new) excludes the specs and
   `build` uses it. `tsconfig.json` still type-checks them. Both `yarn pack` and
   `npm pack` now list 37 files under `bin/` and `dist/`, none from `__tests__`.
   The packed tarball, installed with npm into an empty project, ran
   `dzup-codemod rename-props src` and stripped the removed ARIA props.
2. **A second spec pins the published list.**
   `packages/tooling/src/validators/published-imports.spec.ts` asserts the
   exact list; it gains `@dzup-ui/codemods`. `yarn validate:published-imports`
   passes with codemods in the inventory.

Added paths: `packages/codemods/tsconfig.build.json` (new),
`packages/tooling/src/validators/published-imports.spec.ts`.
