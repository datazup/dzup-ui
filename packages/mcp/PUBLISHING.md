# Publishing `@dzup-ui/mcp`

Two steps: publish the npm package, then register it in the public MCP registry so clients can discover it.

## 1. Publish to npm

The package builds to `dist/` with `tsc` and publishes via the repo's Changesets flow (see `.changeset/`).

```sh
# from the repo root
yarn validate:mcp                         # surface freshness, version coherence, per-tool evidence
yarn workspace @dzup-ui/mcp build
yarn workspace @dzup-ui/mcp test
node packages/mcp/scripts/e2e-smoke.mjs   # end-to-end sanity over real JSON-RPC

# release (Changesets) — versions + publishes every package with a pending changeset
yarn release
```

> **The version is no longer typed in three places.** `src/index.ts` reads it
> from `package.json` at runtime, so `serverInfo.version` is whatever npm
> shipped. `server.json` still carries its own copy because the MCP registry
> schema requires one — `yarn validate:mcp` fails when it drifts from
> `package.json`, from the CHANGELOG, or from the generated surface artifact.
> Bump it in `server.json` in the same commit as the Changesets version bump.

`files` in `package.json` ships only `dist/`, `server.json` and `README.md`. The `bin` entry (`dzup-ui-mcp` → `dist/index.js`) is what `npx -y @dzup-ui/mcp` runs.

Smoke-test the published artifact before announcing:

```sh
npx -y @dzup-ui/mcp   # should print "dzup-ui MCP server running (registry: https://dzup-ui.com …)" on stderr
```

## 2. Register in the public MCP registry

The catalog at <https://registry.modelcontextprotocol.io> is what lets MCP clients surface the server for one-click install. It reads the `server.json` in this folder.

Before first publish, confirm the identity fields in `server.json`:

- `name` — currently **`io.github.datazup/mcp`**. It must live under a namespace
  you control: either `io.github.<org>/<repo-name>` (verified by a GitHub OAuth
  login for that org) or a domain you own, e.g. `dev.dzup-ui/mcp` (verified by a
  DNS TXT record). **`io.github.datazup/mcp` has not been verified against the
  `datazup` GitHub org** — do that, or change it, before the first
  `mcp-publisher publish`.
- `repository.url` — must match `package.json`'s. `yarn validate:mcp` compares them.

Then publish the manifest with the official CLI:

```sh
# install the publisher CLI (see https://github.com/modelcontextprotocol/registry)
brew install mcp-publisher      # or: go install .../cmd/mcp-publisher@latest

cd packages/mcp
mcp-publisher login github      # or `mcp-publisher login dns` for a domain namespace
mcp-publisher publish           # validates + submits server.json
```

Keep `version` in `server.json` in step with `package.json` on every release, and re-run `mcp-publisher publish` so the registry entry points at the latest npm version.

## Roadmap after MVP

- Expose live component demos / screenshots as MCP **resources**.
- Add an `animations` sub-registry tool (`/r/animations/registry.json`).
- Submit to client-specific directories (Cursor, Smithery, etc.) once the registry entry is live.
