# @dzup-ui/mcp

## 0.2.0

### Minor Changes

- a0d8926: Ship `@dzup-ui/mcp` — a free, open-source Model Context Protocol server for the dzup-ui ecosystem (Task G5).

  Connect it in Cursor, Claude Code, Windsurf or VS Code with a single `npx -y @dzup-ui/mcp` and an assistant can browse every component, block, template and design token, then fetch the **real `.vue` source** and the `shadcn add` install command on request — "add a dzup-ui pricing block" now resolves to actual code.
  - **New package `packages/mcp`** — a thin, read-only, stdio MCP server over the STATIC catalog artifacts the landing site already generates (`/r/*.json`, `/r/tokens.json`, `/storybook/llms.txt`), so there is one source of truth and zero drift. Tools: `list_components`, `get_component`, `list_blocks`, `get_block`, `list_templates`, `get_template`, `list_tokens`, `get_install_command`, `search`. Configurable origin via `DZUP_UI_REGISTRY_URL` (defaults to the public site; accepts a local checkout for dev). Ships parser/registry unit tests plus an end-to-end JSON-RPC smoke test, and a `server.json` manifest for the public MCP registry.
  - **Landing `/ai` page** — "Use dzup-ui with your AI IDE": copy-paste MCP configs per client, the tool list and example prompts, wired into the top nav. New `dzupMcpConfig()` / `dzupMcpVscodeConfig()` / `dzupMcpClaudeCliCommand()` helpers in `blocks/config.ts` keep the page's snippets in lockstep with the shipped server.
