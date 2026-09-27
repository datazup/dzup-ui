# Admission — DZUP-UI-EVIDENCE-RERUN-20260926-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-EVIDENCE-RERUN-20260926-R1 (packet 4 of the 2026-09-26 owner-decision plan) |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Measured source | `3ee3d5f886435827138334b0ecc774d10275d47b`, clean worktree (`git status --porcelain` empty) |
| Base for the commit | `fb9689c039639eea8d5d009464b4372bfb92706b` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-evidence-rerun-20260926` |
| Branch | `chore/evidence-rerun-20260926` |
| Plan reference | TASK-R2-O1 (browser-matrix evidence). Complete on 2026-09-22 at `589be13`; this re-run is owed because the icon swap (D174/D175, `63c1325`) is a later commit to every component that imports an icon, which made their browser cells `stale` |
| Authorisation | Operator, 2026-09-26: "do proceed with the recommended work", then "do re-evaluate what should be done and proceed" |

## Why the measured commit is not the base

The sweep ran on `3ee3d5f`, the head that carried the icon swap. The three
commits after it (`dd8efad`, `cc13194`, `fb9689c`) change ADR text, delete
`apps/sandbox` and refresh one landing JSON copy; none touches
`packages/{core,tokens,contracts}/src`. The ledger is generated on the clean
`3ee3d5f` tree so each run's `sourceCommit` names the code that was measured.
The downstream projections are then regenerated on `fb9689c`.

## What changes in the evidence's standing

The 2026-09-22 ledger was generated from a worktree with uncommitted changes,
so it carries `admissibility: LOCALLY QUALIFIED ONLY`. This sweep ran on a
committed, clean tree, so the regenerated ledger is bound to a commit.

## WebKit on this host

WebKit 26.5 (Playwright `webkit-2311`) needs four host libraries this machine
lacks (libevent-2.1-7t64, libavif16, libmanette-0.2-0, libwoff1) and, through
them, libgav1-2, libhidapi-hidraw0 and libbacktrace0. They were not installed
system-wide. `apt-get download` fetched the Ubuntu packages into
`/data/storage/datazup-runtime/ninel/cache/webkit-hostlibs`; `dpkg -x`
unpacked them there, and they are symlinked into the bundle's own
`minibrowser-{wpe,gtk}/sys/lib` in the Storage Playwright cache (the bundle's
wrapper replaces `LD_LIBRARY_PATH` with that folder). Removing the symlinks
reverts it. No system package was installed.

## Scope

1. Sweeps (done before this admission): `e2e/matrix`, projects
   `matrix-{chromium,firefox,webkit}-*`, `STORYBOOK_E2E_STATIC=1
   STORYBOOK_E2E_PREBUILT=1`, reports in
   `/data/storage/datazup-runtime/ninel/evidence/evidence-rerun-20260926/`.
2. `yarn generate:browser-evidence --reset` from the three reports, with the
   probed engine versions and wall clocks, on the clean `3ee3d5f` tree.
3. On `fb9689c`: `generate:capability-matrix`, `generate:component-meta`,
   `generate:docs-pages`, `generate:llms`, then the landing generators.

## Allowed paths

`e2e/matrix/browser-evidence.json`, `packages/core/docs/capability-matrix.json`,
`packages/core/docs/component-meta.json`, `packages/core/docs/llms.txt`,
`packages/core/docs/llms-full.txt`,
`apps/storybook/stories/_data/capability.generated.ts`,
`apps/docs/components/**`, `apps/docs/evidence/**`,
`apps/docs/.vitepress/generated/nav.json`, `apps/docs/public/playground/seeds.json`,
`apps/landing/public/r/**`, `apps/landing/src/generated/**`,
`docs/qa/evidence-rerun-2026-09-26/**`.

## Acceptance

- Each engine: 0 failed.
- The ledger's `admissibility` is the clean text, and every run names `3ee3d5f`.
- `validate:capability-matrix` passes and reports 0 stale browser cells.
- `yarn validate:all` and the landing "generated artifacts unchanged" set pass.
- CI Validate is green.

## Authority

| Class | Granted |
|---|---|
| Candidate commit, local integration, push `refs/heads/main` | yes |
| Cleanup of this packet's worktree and branch | yes |
| Host package install (sudo) | not used |
| Publish, tag, secrets, PR #3 merge, production | **no** |
