# @dzup-ui/mcp

**Use dzup-ui from your AI coding tool.** A [Model Context Protocol](https://modelcontextprotocol.io) server that exposes the whole [dzup-ui](https://dzup-ui.dev) ecosystem — **158 Vue 3 components, 88 blocks, 44 full-page templates and the `--dz-*` design tokens** — to Cursor, Claude Code, Windsurf and any other MCP client.

Ask *"add a dzup-ui pricing block"* and the assistant browses the catalog, fetches the **real `.vue` source**, and gives you the exact `shadcn add` install command — grounded in the same registry the website ships, so it never hallucinates a prop or a component that doesn't exist.

```jsonc
// works everywhere — see per-client setup below
{
  "mcpServers": {
    "dzup-ui": { "command": "npx", "args": ["-y", "@dzup-ui/mcp"] }
  }
}
```

No install, no API key, no account. `npx` fetches and runs it on demand.

---

## Tools

| Tool | What it does |
| --- | --- |
| `list_components` | List `@dzup-ui/core` components (filter by family / query) |
| `get_component` | Full API for one component — import, taxonomy, props/emits/slots, usage snippet |
| `list_blocks` | Browse pre-composed blocks (heroes, pricing, navbars, forms…) by category / query |
| `get_block` | A block's **real `.vue` source** + npm deps + `shadcn add` command |
| `list_templates` | Browse full-page templates (dashboards, auth, settings…) |
| `get_template` | A template's real source + deps + install command |
| `list_tokens` | The `--dz-*` OKLCH design tokens as light/dark CSS variables |
| `get_install_command` | Exact terminal commands for a block/template/tokens, per package manager |
| `search` | One query across components, blocks and templates |

Everything is read-only. The server fetches static artifacts (`/r/*.json`, `/storybook/llms.txt`) the site already generates — **one source of truth**, always in sync with what's published.

---

## Connect it

### Cursor

Create `.cursor/mcp.json` in your project (or edit the global one via **Settings → MCP → Add**):

```json
{
  "mcpServers": {
    "dzup-ui": { "command": "npx", "args": ["-y", "@dzup-ui/mcp"] }
  }
}
```

Then in the chat: *"List the dzup-ui form components, then add the `contact-form` block."*

### Claude Code

One command:

```sh
claude mcp add dzup-ui -- npx -y @dzup-ui/mcp
```

…or add it to `.mcp.json` at your project root (shareable, checked into git):

```json
{
  "mcpServers": {
    "dzup-ui": { "command": "npx", "args": ["-y", "@dzup-ui/mcp"] }
  }
}
```

Verify with `/mcp` inside Claude Code.

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json` (or **Settings → Cascade → MCP → Add server → View raw config**):

```json
{
  "mcpServers": {
    "dzup-ui": { "command": "npx", "args": ["-y", "@dzup-ui/mcp"] }
  }
}
```

### VS Code (GitHub Copilot / Agent mode)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "dzup-ui": { "type": "stdio", "command": "npx", "args": ["-y", "@dzup-ui/mcp"] }
  }
}
```

### Any other MCP client

The server speaks MCP over **stdio**. Run `npx -y @dzup-ui/mcp` as the command with no arguments.

---

## Configuration

| Env var | Default | Purpose |
| --- | --- | --- |
| `DZUP_UI_REGISTRY_URL` | `https://dzup-ui.dev` | Origin the catalog is read from. Point it at a preview deploy, or at a **local repo checkout** during development (see below). |

Against a preview deploy:

```json
{
  "mcpServers": {
    "dzup-ui": {
      "command": "npx",
      "args": ["-y", "@dzup-ui/mcp"],
      "env": { "DZUP_UI_REGISTRY_URL": "https://preview.dzup-ui.dev" }
    }
  }
}
```

Against a local checkout (reads `apps/landing/public` + `apps/storybook/public` directly — build the registry first with `yarn workspace @dzup-ui/landing build:registry` and the component docs with the storybook build):

```sh
DZUP_UI_REGISTRY_URL=/path/to/dzup-ui npx -y @dzup-ui/mcp
```

---

## Try it end-to-end

```sh
# unit + parser tests
yarn workspace @dzup-ui/mcp test

# build, then drive the server over real JSON-RPC (initialize → tools/list → tools/call)
yarn workspace @dzup-ui/mcp build
node packages/mcp/scripts/e2e-smoke.mjs

# poke it interactively with the official inspector
yarn workspace @dzup-ui/mcp inspect
```

---

## How it works

```
AI client (Cursor/Claude Code/Windsurf)
    │  MCP over stdio
    ▼
@dzup-ui/mcp  ──fetch──▶  https://dzup-ui.dev
                          ├─ /r/registry.json            (blocks index)
                          ├─ /r/<id>.json                (block source + deps)
                          ├─ /r/templates/registry.json  (templates index)
                          ├─ /r/templates/<id>.json      (template source)
                          ├─ /r/tokens.json              (design tokens)
                          └─ /storybook/llms.txt(-full)  (component API)
```

The server adds no second copy of the catalog: it reads the shadcn-compatible registry and the `llms.txt` API docs the site publishes, so upgrading dzup-ui upgrades what the assistant sees.

## Scope

**MVP (shipped):** browse + get-source + install-command + tokens, across components, blocks and templates.

**Follow-up:** live component demos / screenshots as MCP resources, an `animations` sub-registry tool, and registration in the public MCP server registry for one-click discovery.

## License

MIT — free and open source, like the rest of dzup-ui.
