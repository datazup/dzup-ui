# @dzup-ui/landing

## 0.1.0

### Minor Changes

- e47a96f: Ship the **Blocks** ecosystem surface in the landing app (`apps/landing`).

  This activates the previously "Planned" Blocks tile into a live `/blocks` catalog:
  - **Display infrastructure (Phase A):** new `/blocks` route + `BlocksIndexPage`, a typed
    block registry (`src/blocks/registry.ts`) that pairs each block's lazily-loaded component
    with its exact `?raw` source (zero preview/code drift), the `BlockPreview` shell
    (Preview/Code tabs, viewport resizer, copy), `BlockCard` + `BlockCategoryNav`, "Built from"
    component chips, and per-route SEO/meta. The Ecosystem tile is now `status: 'available'`
    linking to `/blocks`, with matching nav + footer links.
  - **Quality gates (Phase C):** a Vitest registry guard (`registry.spec.ts`) that fails loudly
    if a block advertises a `@dzup-ui/core` component that does not exist, plus the a11y /
    responsive / reduced-motion audit.
  - **Catalog (Phase B, in progress):** one reference block live — `hero-centered` (Marketing) —
    composed purely from free `@dzup-ui/core` components and `--dz-*` tokens, validating the
    end-to-end pipeline. The remaining MVP and full catalog blocks are fast-follows.

  No published `@dzup-ui/*` library package changes — this is a private app and is versioned for
  changelog purposes only (it is never published to npm).

- a0d8926: Ship `@dzup-ui/mcp` — a free, open-source Model Context Protocol server for the dzup-ui ecosystem (Task G5).

  Connect it in Cursor, Claude Code, Windsurf or VS Code with a single `npx -y @dzup-ui/mcp` and an assistant can browse every component, block, template and design token, then fetch the **real `.vue` source** and the `shadcn add` install command on request — "add a dzup-ui pricing block" now resolves to actual code.
  - **New package `packages/mcp`** — a thin, read-only, stdio MCP server over the STATIC catalog artifacts the landing site already generates (`/r/*.json`, `/r/tokens.json`, `/storybook/llms.txt`), so there is one source of truth and zero drift. Tools: `list_components`, `get_component`, `list_blocks`, `get_block`, `list_templates`, `get_template`, `list_tokens`, `get_install_command`, `search`. Configurable origin via `DZUP_UI_REGISTRY_URL` (defaults to the public site; accepts a local checkout for dev). Ships parser/registry unit tests plus an end-to-end JSON-RPC smoke test, and a `server.json` manifest for the public MCP registry.
  - **Landing `/ai` page** — "Use dzup-ui with your AI IDE": copy-paste MCP configs per client, the tool list and example prompts, wired into the top nav. New `dzupMcpConfig()` / `dzupMcpVscodeConfig()` / `dzupMcpClaudeCliCommand()` helpers in `blocks/config.ts` keep the page's snippets in lockstep with the shipped server.

### Patch Changes

- Updated dependencies [ca9c390]
  - @dzup-ui/core@0.2.0
