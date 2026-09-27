# `@dzup-ui/mcp` entry fix landing and registry hardening — admission

Date: 2026-09-24 (Europe/Sarajevo). Owner: Claude Code session
`session_01G3dYK3JZAU4a7YFwGBzfDv`.

Packet: `DZUP-UI-MCP-ENTRY-HARDENING-20260924-R1`.

The operator authorized this packet in session on 2026-09-24. They asked for a
drift review of `ui/dzup-ui`, then said "do proceed with the recommended actions
… after verified all working do commit and merge on main branch and push". That
grants candidate commit, local integration onto `main` and push for the paths
below. It grants no tag, npm publish or production authority.

The record sits beside `ADMISSION-2026-09-22-mcp-bin-entry.md` for the same
reason that record gives. Its placement is a fallback, not a new convention.

## Why this packet exists

The 2026-09-24 drift review found two pieces of `@dzup-ui/mcp` work that only
one copy held and that were missing from `main`:

1. Commit `05e5bb4` (`DZUP-UI-MCP-BIN-ENTRY-FIX-20260922-R1`, admitted in
   `ADMISSION-2026-09-22-mcp-bin-entry.md`) exists only on the local branch
   `crush/dzup-ui-mcp-bin-entry-20260922`. The branch was never pushed and is
   4 commits behind `main`. Published `0.2.0` still ships the defect it fixes:
   the installed bin exits 0 without starting the server.
2. The canonical checkout held uncommitted changes, dated 2026-09-22, to
   `packages/mcp/src/{registry.ts,tools.ts,tools.spec.ts}`. They had no branch
   and no admission, and no other copy of them existed.

## Source and custody

- Repository: `ui/dzup-ui`. The live remote `refs/heads/main` and the local
  `main` were both `59ce2055ee50ff9786dd56099fc9e83391a1a1a9` when this packet
  was admitted.
- Storage worktree: `worktrees/dzup-ui/dzup-ui-mcp-entry-hardening-20260924-a1`
  on branch `claude/dzup-ui-mcp-entry-hardening-20260924`, based on `59ce2055`.
  Custody claim
  `wtc_7eeaaab63d1d1c56f6e30cd796747477d422c5a613cefc4bf09157c97f23e9b7`.
- Writer lease
  `wcl_91c34b3f2ccf22a9a31f923484f2c2562c5f016383af5647c25c991ff865095b`, TTL
  3600 s, covering exactly the allowed paths.
- `05e5bb4` was cherry-picked, not adopted. Its Crush-owned worktree and
  branch were only read, so its custody claim (valid until 2026-09-25) is
  untouched.
- The canonical checkout's uncommitted diff was saved before any mutation as
  `evidence/dzup-ui-mcp-hardening-20260924/canonical-uncommitted-mcp.patch`
  (sha256 `fed53b36e0e4f41699f86a3717da30c89e679103a72f11deb4eac8c60152a8b8`).
  It was verified with `git apply --check -R` and applied unchanged here.

## Allowed paths

- `.changeset/the-mcp-server-starts-when-a-client-runs-it.md` (from `05e5bb4`)
- `.changeset/the-mcp-server-reports-registry-failures-instead-of-hiding-them.md`
- `packages/mcp/ADMISSION-2026-09-22-mcp-bin-entry.md` (from `05e5bb4`)
- `packages/mcp/ADMISSION-2026-09-24-mcp-hardening.md`
- `packages/mcp/scripts/e2e-smoke.mjs`
- `packages/mcp/src/direct-invocation.spec.ts`
- `packages/mcp/src/index.ts`
- `packages/mcp/src/registry.ts`
- `packages/mcp/src/tools.ts`
- `packages/mcp/src/tools.spec.ts`
- `packages/tooling/src/validators/mcp-surface.ts`

## Change

- The entry-point fix from `05e5bb4`, unchanged. Its rationale is in
  `ADMISSION-2026-09-22-mcp-bin-entry.md`.
- `registry.ts`: every HTTP registry read is aborted after 15 s
  (`AbortSignal.timeout`).
- `tools.ts`: `get_block` and `get_template` return "not found" only when
  `isNotFoundError` matches (404, "not found" or "no such"). Any other error is
  re-thrown to the server's guard. `search_components` treats missing `props`,
  `slots`, `events` and `stories` as empty.
- `tools.spec.ts`: 14 cases covering the above. The three NUL bytes in the file
  were already in the committed version; they are deliberate test inputs.

## Acceptance, executed rather than inferred

The gates ran from the Storage worktree through `storage-first-runtime.mjs exec`.
`packages/mcp/node_modules/.bin/dzup-ui-mcp` resolves to this worktree's `dist`,
not the canonical build.

| Check | Result |
| --- | --- |
| `packages/mcp` vitest | 145 passed, 0 failed (131 before this packet, plus 14 new) |
| `tsc --noEmit`: `packages/mcp/tsconfig.json`, `tsconfig.test.json`, `packages/tooling/tsconfig.json` | exit 0, exit 0, exit 0 |
| `packages/mcp` build (`tsc -p tsconfig.json`) | exit 0 |
| `node packages/mcp/scripts/e2e-smoke.mjs` against this worktree's build | exit 0, all checks passed |
| Same smoke against the canonical pre-fix build (measured by accident first) | "the bin entry exited (code 0) without answering JSON-RPC" |
| `yarn validate:mcp` (`tsx packages/tooling/src/validators/mcp-surface.ts`) | exit 0; the declared `bin` answered `initialize` |
| `eslint` on the seven changed source files | clean |

## Authority classes

| Class | Granted |
| --- | --- |
| Bounded source edits in the paths above, local deterministic gates | yes |
| Candidate commit on the lane branch | yes |
| Local integration onto `ui/dzup-ui` `main` | yes, operator 2026-09-24 |
| Push of `refs/heads/main` | yes, operator 2026-09-24 |
| Tags, version bump, npm publish, production | no |
| Removing other owners' worktrees or branches | no |

## Deferred

- The `0.2.1` version bump and npm publish that ship both fixes belong to the
  release lane. The two changesets drive it.
- The filename-based entry guards in `scripts/generate-tool-surface.ts` and
  `mcp-surface.ts`, which the 2026-09-22 admission lists as deferred.
- Closing out `crush/dzup-ui-mcp-bin-entry-20260922` and its worktree. Once this
  packet lands they are superseded by `main` (the change is equivalent, not the
  same patch id). Their Crush owner, or a signed archive-retirement disposition,
  closes them.
