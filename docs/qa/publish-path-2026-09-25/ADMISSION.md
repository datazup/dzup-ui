# Admission — DZUP-UI-PUBLISH-PATH-20260925-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-PUBLISH-PATH-20260925-R1 |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `23c84ab9615cd085e1b14033af64d23089c6492a` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-publish-path-20260925` |
| Branch | `chore/publish-path-20260925` |
| Plan reference | `docs/program-2026-09-04/README.md` §7 — TASK-R0-O1 (publish or freeze); follow-ups deferred by `docs/qa/release-decisions-2026-09-25/ADMISSION.md` |
| Authorisation | Operator, 2026-09-25: "do proceed with the recommended and implementation as improvements" |

## Why now

Merging release PR #3 runs `changesets/action`'s publish step, `yarn release`
= `yarn build && changeset publish`. Measured on the base:

1. **Core would be published uninstallable.** `@changesets/cli` 2.30.0
   (`getPublishTool`) publishes with `npm publish <dir>` for every package
   manager except pnpm. npm copies `workspace:*` verbatim. `npm pack` of
   `packages/core` gives `"@dzup-ui/contracts": "workspace:*"` and
   `"@dzup-ui/tokens": "workspace:*"` in the tarball's `package.json`, so every
   consumer install fails with `EUNSUPPORTEDPROTOCOL`. The release bundle checks
   `yarn pack` tarballs, which rewrite the protocol, so it never saw this path.
2. **Two withheld packages would be published as `latest`.** `changeset publish`
   publishes every non-`private` package missing from the registry and does
   not read `ignore` (`publishPackages` filters on `private` only).
   `@dzup-ui/compat` and `@dzup-ui/codemods` (0.1.0-alpha.0, npm 404) would ship,
   against `release-policy.json`'s `withheld` list and the open owner decision
   N5-01-D2.
3. **The Yarn token is never set.** `release.yml` sets `NODE_AUTH_TOKEN`
   (read by npm through setup-node's `.npmrc`). `yarn npm publish` reads
   `YARN_NPM_AUTH_TOKEN`.
4. **Publish is not gated by the release validators.** The job runs build and
   test only. The version commit is never validated by CI, because the bot's PR
   triggers no workflows.
5. **The manifest name lists omit 436 symbols.** This is the last release stop
   condition (`manifest-omission`) in bundle `2026-09-25-3c3f94a`.

## Scope

- **Publish path.** `release:publish` (`packages/tooling/src/release/publish.ts`)
  publishes exactly `release-policy.json`'s `published` list, in dependency
  order. Each package goes through `yarn workspace <name> npm publish
  --access public --tolerate-republish`, so `workspace:*` is rewritten and a
  re-run skips versions already on the registry. `--provenance` and `--tag`
  are passed through. `release` = `yarn build && yarn release:publish
  --provenance && changeset tag`. `changeset tag` prints the `New tag:` lines
  that `changesets/action` parses to push tags and create GitHub releases.
  `publish-prerelease.yml` uses the same entry point.
- **Release gates in `release.yml`.** `validate:changelog`,
  `validate:release-policy`, `validate:mcp`, `validate:engines` and a
  `release:publish --dry-run` run after the tests and before `changesets/action`.
  `YARN_NPM_AUTH_TOKEN` is set from the existing `NPM_TOKEN` secret.
- **Manifest names.** The 436 names are added to the documented lists: components
  to their family entry, `use*` functions to the composable entry whose
  directory defines them, `DZ_*_KEY` to `injectionKeys`, `*Variants` to
  `variants`, other runtime values to `runtimeExports`, and types to `types`.
  The generator output does not change, because only `utilities` names feed it.
- **Comment corrections.** `release-policy.json` `$published` (publish does not
  read `ignore`), and `validate-min-runtime.yml`'s drift narrative, which is
  obsolete since 3c3f94a.

Not in scope: publishing, tagging, merging PR #3, secrets, npm trusted-publisher
configuration, and owner decision N5-01-D2 (compat/codemods stay withheld).

## Allowed paths

- `docs/qa/publish-path-2026-09-25/ADMISSION.md`
- `packages/tooling/src/release/publish.ts` (new), `publish.spec.ts` (new)
- `package.json` (scripts only)
- `.github/workflows/release.yml`, `.github/workflows/publish-prerelease.yml`
- `.github/workflows/validate-min-runtime.yml` (comments only)
- `packages/tooling/scripts/release-policy.json` (`$published` text only)
- `packages/core/manifests/public-api.manifest.json`

## Acceptance

1. `publish.spec.ts` passes. It covers order (contracts and tokens before core,
   core before nuxt), exclusion of withheld packages, and refusal when a
   `published` package is `private`.
2. `yarn release:publish --dry-run` in the worktree names exactly the six
   `published` packages, in dependency order, and exits 0.
3. `yarn generate:exports:core` leaves `packages/core/src/index.ts` export
   lines unchanged, and `yarn release:api-diff` reports 0 undocumented, 0
   undelivered, drift clean, and no stop conditions.
4. `yarn build`, `CI=1 DOCS_SIZE_ALLOW_MISSING_DIST=1 yarn validate:all`,
   `yarn test`, `typecheck:tooling` and `lint` exit 0.
5. After push, GitHub CI on the landed `main` concludes `success`, and
   `Release` rebuilds PR #3 with the new gates passing.

## Authority

| Class | Granted |
|---|---|
| Candidate commit | yes |
| Local integration (canonical fast-forward under the integration lane) | yes |
| Push `refs/heads/main` | yes |
| Cleanup of this packet's worktree and branch | yes |
| npm publish, tag, PR #3 merge, secrets, npm settings, production | **no** — operator |

## Deferred (operator)

- Confirm that `NPM_TOKEN` is a granular automation token scoped to `@dzup-ui`
  with a short expiry. After the first publish, configure npm trusted
  publishing (OIDC) for the six packages; Yarn 4.16 supports the token
  exchange. Then remove the token.
- Before merging PR #3, run CI on its head with `workflow_dispatch` on branch
  `changeset-release/main`, or have `changesets/action` use a GitHub App token
  so that release PRs trigger CI.
- After the first publish, record the API baseline once with
  `yarn release:api-surface:record`. `release:api-diff` then runs at snapshot
  fidelity instead of comparing against the manifest.
- N5-01-D2 (publish compat/codemods or not).
