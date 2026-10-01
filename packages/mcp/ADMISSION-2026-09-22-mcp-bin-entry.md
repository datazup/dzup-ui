# `@dzup-ui/mcp` bin entry — admission

Date: 2026-09-22 (Europe/Sarajevo). Owner: Crush session
`56ffa061-0885-402d-9de9-bb23578afdf7`.

Packet: `DZUP-UI-MCP-BIN-ENTRY-FIX-20260922-R1` (in-repo task id `TASK-N2-A4`,
after the program reassessment's `TASK-N2-A1`…`A3`).

Operator authorized this packet in session on 2026-09-22 ("do review mcp dzup-ui
… how should we fix it", then "do proceed and fully implement and improve"). The
fix is a defect correction on the surface `TASK-N2-A1` governs; it changes no
tool, no schema and no catalog artifact.

## Where this record lives

In the audited repository rather than
`workspace-docs/repos/ui/docs/planning/`. The `workspace-docs` canonical checkout
is fenced by a non-released writer lease from an inactive session
(`codex/session-enrollment-corpus-docs-20260918`, expired 2026-09-18) and expiry
is not takeover authority, so the record travels with the packet instead. The
placement is a fallback, not a new convention: `workspace-docs` remains the
intended home, and its owner can move it there.

## Source and custody

- Repository: `ui/dzup-ui` (canonical checkout `/data/code/datazup/ai-internal-dev/ui/dzup-ui`).
- Live remote `refs/heads/main` at admission: `589be135654aefaac4b1069519f2fb56bb231172`.
  The canonical checkout is behind it at `527dbd150036b5f07bd69e672825ff14ec3a592d`
  (observed, not advanced: another lane owns it).
- Storage worktree: `worktrees/dzup-ui/dzup-ui-mcp-bin-entry-20260922-a1`,
  branch `crush/dzup-ui-mcp-bin-entry-20260922`, created from `589be135` by
  `storage-first-runtime.mjs worktree-add`. Custody claim
  `wtc_ce360656c5da7cc09f87e6782492de08d91865ed41036f1cba3b4b6df47e5c02`,
  owner `56ffa061-0885-402d-9de9-bb23578afdf7`.
- Writer lease `wcl_b4144b4868ab2b8b3f6b6114fb03212cc5668f95a926c4a17987186221a857c4`,
  TTL 3600 s, renewed every quarter-TTL.
- The concurrent `dzup-ui` lane (`crush/dzup-templates-dt1-20260922`) holds the
  path `docs/templates.md`; every path below is disjoint from it, and it was not
  touched.

## Finding

`.crush` in this workspace registered `@dzup-ui/mcp` and it failed to initialize:

```
MCP client failed to initialize  name=dzup-ui
error: connection closed: calling "initialize": client is closing: EOF
```

`packages/mcp/src/index.ts:401` gated `main()` on

```ts
process.argv[1] && /(?:^|[/\\])index\.(?:js|ts)$/.test(process.argv[1])
```

Node preserves the **invoked** path in `process.argv[1]`. npm installs the bin as
a symlink named after the bin key, so `node_modules/.bin/dzup-ui-mcp` — what
`npx -y @dzup-ui/mcp`, and therefore every documented client config, executes —
never matches. The process exits `0` in silence and the client sees EOF. The
published `0.2.0` tarball carries this; the defect is not workspace-local.

Reproduced before the fix, three ways: the workspace `.bin` symlink (exit 0, no
output), an isolated copy under `/tmp`, and the same path in the Storage
worktree. `node dist/index.js` (the path every existing lane used) worked, which
is why nothing caught it: the package's specs import the module,
`scripts/e2e-smoke.mjs` spawned `dist/index.js`, and `validate:mcp` only compared
the `bin` entry against `files`.

## Allowed paths

- `packages/mcp/src/index.ts`
- `packages/mcp/src/direct-invocation.spec.ts` (new)
- `packages/mcp/scripts/e2e-smoke.mjs`
- `packages/tooling/src/validators/mcp-surface.ts`
- `.changeset/*.md` (one new patch changeset)
- `packages/mcp/ADMISSION-2026-09-22-mcp-bin-entry.md` (this record)

No tool, schema, README table or `docs/mcp-tool-surface.json` change follows:
the tool surface is untouched, so `catalogVisibilityUnreachable` and
`toolsWithoutE2eSmoke` keep their ceilings.

## Change

1. `isDirectInvocation(entry, moduleDir)` resolves both sides with
   `realpathSync` and compares paths, so the shipped bin, `tsx src/index.ts` and
   a direct `dist/index.js` spawn all start the server, while imports and the
   test runner do not.
2. `packages/mcp/src/direct-invocation.spec.ts` builds the real
   `node_modules/.bin/<name>` layout on disk (6 cases).
3. `scripts/e2e-smoke.mjs` spawns the declared `bin` through that symlink
   instead of `dist/index.js`, and fails when the server exits without answering
   rather than waiting forever on a closed pipe.
4. `validate:mcp` gains clause F (`checkBinEntryStarts`): it symlinks the
   declared bin target into a temp dir and requires an `initialize` answer, with
   the symlink created by the check so a never-installed checkout is still
   verified. The clause is reported as skipped, not passed, when `dist` is
   absent. In CI it executes where a build precedes the chain
   (`validate-min-runtime.yml` runs `yarn build` then `yarn validate:all`);
   `ci.yml`'s pre-build `validate` job prints the skip honestly rather than
   passing by default.

## Acceptance, executed rather than inferred

| Check | Result |
| --- | --- |
| `packages/mcp` suite (`yarn workspace @dzup-ui/mcp test`) | 131 passed, 0 failed |
| New spec against the pre-fix source | 6 failed (RED) |
| `node packages/mcp/scripts/e2e-smoke.mjs`, pre-fix dist | exit 1 — "the bin entry exited (code 0) without answering JSON-RPC" |
| `yarn validate:mcp`, pre-fix dist | exit 1 — clause F names the failing invocation |
| Same three, post-fix | tests 131 passed · smoke exit 0 · `validate:mcp` exit 0 |
| `yarn workspace @dzup-ui/mcp typecheck` / `@dzup-ui/tooling typecheck` | exit 0 |
| `eslint` on the four changed files | clean |
| `yarn install` in the worktree, `yarn workspace @dzup-ui/mcp build` | exit 0 |
| `yarn validate:all` (full chain, worktree) | reaches `validate:mcp` green — see the two pre-existing failures below |

`validate:all` does not complete in this worktree, for reasons this packet does
not touch and cannot be attributed to it:

- `validate:boundaries` — 37 violations, all in `packages/tooling/*` importing
  `@dzup-ui/contracts`/`@dzup-ui/core`, none in a file this packet changed.
- `validate:component-meta` — `packages/core/docs/component-meta.json` is stale
  relative to the core sources. No core source or generated artifact is in this
  packet.

Both are reported, not fixed: the packet's authority covers the four files
above, and neither failure is reachable from the change.

The behavioural RED is the pre-fix bin invocation (exit 0, no reply), not a
synthetic mutation: the same command answers after the change.

## Authority classes

| Class | Granted |
| --- | --- |
| Bounded source edits in the paths above, local deterministic gates | yes |
| Candidate commit on the lane branch | yes |
| Push, integration onto `dzup-ui` `main`, tags, npm publish | no — operator-owned |
| Worktree removal | no — the lane ends committed and recoverable |

## Deferred

- Version bump and publish: the defect affects published `0.2.0`, so a patch
  release (`0.2.1`) is the user-visible fix. Bumping `package.json`,
  `server.json` (x2), `CHANGELOG.md` and the surface artifact belongs to the
  release lane; the changeset added here drives it.
- `scripts/generate-tool-surface.ts:566` and `mcp-surface.ts:511` carry the same
  filename-based entry guard. Both are invoked only through `yarn`/`tsx` with
  real paths, so neither is reachable through a bin shim today; they are
  reported, not changed, to keep this packet to the shipped defect.
- The workspace `.crushrc` picks the vendored `node_modules/.bin` copy when it
  exists; after this fix and a rebuild that copy works, so the Crush config needs
  no change.
