# Publishing `@dzup-ui/mcp`

Two steps: publish the npm package, then register it in the public MCP registry so clients can discover it.

## 1. Publish to npm

The package builds to `dist/` with `tsc` and publishes via the repo's Changesets flow (see `.changeset/`).

```sh
# from the repo root
yarn workspace @dzup-ui/mcp build
yarn workspace @dzup-ui/mcp test
node packages/mcp/scripts/e2e-smoke.mjs   # end-to-end sanity over real JSON-RPC

# release (Changesets) — versions + publishes every package with a pending changeset
yarn release
```

`files` in `package.json` ships only `dist/`, `server.json` and `README.md`. The `bin` entry (`dzup-ui-mcp` → `dist/index.js`) is what `npx -y @dzup-ui/mcp` runs.

Smoke-test the published artifact before announcing:

```sh
npx -y @dzup-ui/mcp   # should print "dzup-ui MCP server running (registry: https://dzup-ui.com …)" on stderr
```

## 2. Register in the public MCP registry

The catalog at <https://registry.modelcontextprotocol.io> is what lets MCP clients surface the server for one-click install. It reads the `server.json` in this folder.

Before first publish, replace the placeholders in `server.json`:

- `name` — must live under a namespace you control. Either `io.github.<org>/<repo-name>` (verified by a GitHub OAuth login for that org) or a domain you own, e.g. `dev.dzup-ui/mcp` (verified by a DNS TXT record). The `io.github.dzup-ui/mcp` value is a placeholder — set it to the real, verifiable namespace.
- `repository.url` — the real GitHub URL.

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
