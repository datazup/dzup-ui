# dzup-ui `@dzup-ui/mcp` lockfile advisory refresh — admission

Date: 2026-09-24. Owner: Claude Code session
`session_01G3dYK3JZAU4a7YFwGBzfDv`.

Packet: `DZUP-UI-MCP-LOCKFILE-20260924-R1`. Base:
`89909c401abb5e26a1da24948c26b8bdfc95051e` (`refs/heads/main`, CI run
`36056447216` all green).

## Why now

The admissible release bundle `docs/qa/release/2026-09-24-0a47569/`
(`supply-chain.md`, "Vulnerabilities") reports 8 high, 11 moderate and 1 low
advisories, all reached through `@dzup-ui/mcp` →
`@modelcontextprotocol/sdk`. Every one is pinned by `yarn.lock`, not by a
declared range: the ranges already admit a fixed release.

| Package | Locked | Range(s) in lockfile | Fixed, in range |
|---|---|---|---|
| `fast-uri` | 3.1.0 | `^3.0.1` | 3.1.8 |
| `ip-address` | 10.1.0, 10.2.0 | `^10.0.1`, `^10.2.0` | 10.7.2 |
| `hono` | 4.12.27 | `^4.11.4` | 4.13.9 |
| `@hono/node-server` | 1.19.14 | `^1.19.9` | 1.19.17 |
| `qs` | 6.15.3 | `^6.14.0`, `^6.15.2` | 6.16.0 |

PR #3 would be the first npm publish. A consumer resolves fresh versions
anyway, but the repository's own install, tests and release evidence run on the
locked ones, and the bundle a publish decision rests on reports them. The
operator authorized this packet on 2026-09-24 ("do proceed improvement and
implementation as recommended").

## Change

`yarn up -R fast-uri ip-address hono @hono/node-server qs` — re-resolve those
five descriptors within their existing ranges. No `package.json` edit, no
`resolutions` entry, no range change.

## Allowed paths

- `docs/qa/mcp-lockfile-2026-09-24/ADMISSION.md`
- `yarn.lock`

## Acceptance

1. The `yarn.lock` diff touches only the five packages above (their entries
   and checksums).
2. `yarn install --immutable` exits 0.
3. `yarn npm audit --all --recursive --environment production` no longer lists
   any advisory against `fast-uri`, `ip-address`, `hono`, `@hono/node-server`
   or `qs`.
4. `yarn typecheck:all`, `yarn build` and `yarn test` exit 0; the `@dzup-ui/mcp`
   tests pass.
5. GitHub CI on the pushed commit is green.

## Authority

Candidate commit, local integration into `refs/heads/main` and push are
granted within this scope. No tag, version bump, npm publish, PR #3 merge or
production change.

## Deferred

- Recutting the release bundle: it follows the operator's decision on the core
  export list (TASK-R0-O1) and runs on the commit that would be published.
- OSS rollback policy and the stale "Ranked next work" text in
  `packages/tooling/src/release/report.ts`: separate packets.
