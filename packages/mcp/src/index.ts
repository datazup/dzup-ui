#!/usr/bin/env node
/**
 * @dzup-ui/mcp — a Model Context Protocol server that exposes the dzup-ui
 * ecosystem (components, blocks, templates, design tokens and install commands)
 * to AI coding tools such as Cursor, Claude Code and Windsurf.
 *
 * It is a thin, read-only layer over the STATIC catalog artifacts the landing
 * site already generates (see `registry.ts`), so there is exactly one source of
 * truth. Runs over stdio — the transport every MCP client speaks.
 *
 * Config: point it at a different origin (a preview deploy, or a local repo
 * checkout for development) with the `DZUP_UI_REGISTRY_URL` env var. Defaults to
 * the public site.
 *
 *   npx -y @dzup-ui/mcp
 *   DZUP_UI_REGISTRY_URL=http://localhost:4173 npx -y @dzup-ui/mcp
 */

import type { ToolResult } from './tools.js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { DEFAULT_REGISTRY_URL, REGISTRY_ID_MAX_LENGTH, REGISTRY_ID_RE, RegistryClient } from './registry.js'
import {
  getBlock,
  getComponent,
  getComponentExample,
  getComponentMetadata,
  getInstallCommand,
  getTemplate,
  listBlocks,
  listComponents,
  listTemplates,
  listTokens,
  PACKAGE_MANAGERS,
  search,
  searchComponents,
} from './tools.js'

/**
 * The version this server reports to every client in `initialize`.
 *
 * READ from `package.json`, never typed here (TASK-N2-A1). It used to be the
 * literal `'0.1.0'`, and it stayed that literal through the 0.2.0 release: every
 * Cursor / Claude Code / Windsurf session was told it was talking to 0.1.0 while
 * npm shipped 0.2.0, and nothing in the repo compared the two.
 *
 * `../package.json` is correct from BOTH layouts — `src/index.ts` and the
 * emitted `dist/index.js` are each exactly one directory below the package
 * root — and `package.json` is always present in an npm tarball regardless of
 * the `files` field. No fallback: a package whose own manifest is unreadable is
 * broken, and a default here would restore the silent-drift failure mode this
 * replaces.
 *
 * `import.meta.dirname` rather than `new URL(…, import.meta.url)`: the specs run
 * under the repo-root Vitest config, whose SSR transform does not give a
 * dependency module a `file:` `import.meta.url`, and `readFileSync(URL)` throws
 * `The URL must be of scheme file`. `import.meta.dirname` is defined in both
 * environments and in every Node this package's `engines` admits (>=20.11).
 */
export const VERSION: string = (
  JSON.parse(readFileSync(join(import.meta.dirname, '../package.json'), 'utf8')) as { version: string }
).version

const INSTRUCTIONS
  = 'dzup-ui is a free, Vue 3, token-driven component library (@dzup-ui/core) plus a shadcn-compatible catalog of copy-paste blocks, full-page templates and design tokens. '
    + 'Use search_components / get_component_metadata to learn a component\'s API before writing markup, and get_component_example for real usage source taken verbatim from its Storybook story. '
    + 'list_components / get_component answer from the published docs index and cover fewer components. '
    + 'Use list_blocks / list_templates to browse pre-composed sections, then get_block / get_template to fetch the REAL .vue source and the `shadcn add` install command. '
    + 'Prefer composing from these blocks over hand-rolling UI. All styling is via --dz-* tokens (list_tokens); never hardcode colors.'

/**
 * Bounded free text (TASK-N2-A1).
 *
 * Every filter argument is echoed back into the tool's own output ("No blocks
 * matched (category=…)"), which is text the assistant then reads as if the
 * dzup-ui server had said it. The cap is not about memory; it is about how much
 * caller-supplied prose this server is willing to re-emit under its own name.
 */
const FREE_TEXT_MAX_LENGTH = 200

function freeText() {
  return z.string().max(FREE_TEXT_MAX_LENGTH)
}

/** A registry item id, rejected at the protocol boundary. See `REGISTRY_ID_RE`. */
function registryId() {
  return z
    .string()
    .max(REGISTRY_ID_MAX_LENGTH)
    .regex(REGISTRY_ID_RE, 'must be lowercase kebab-case, e.g. "hero-centered"')
}

/**
 * A component symbol as it is exported from `@dzup-ui/core` (`Dz`-prefix optional).
 *
 * The explicit `[A-Za-z]` classes are NOT redundant and must not be collapsed to
 * an `i` flag. Zod emits this regex verbatim as the `pattern` of the JSON Schema
 * published in `tools/list`, and JSON Schema's `pattern` keyword has **no flags**
 * — an `i`-flagged source becomes a case-SENSITIVE lowercase-only pattern on the
 * wire, so a client validating `{"name":"DzButton"}` locally would reject it.
 * `regexp/use-ignore-case` cannot see that; `yarn validate:mcp` did, by diffing
 * the published schema.
 */
function componentName() {
  return z
    .string()
    .max(64)
    // eslint-disable-next-line regexp/use-ignore-case -- see above: this regex is published as a flagless JSON Schema `pattern`.
    .regex(/^[A-Za-z][A-Za-z0-9]*$/, 'must be a component name such as "DzButton" or "button"')
}

/*
 * Why every `inputSchema` below is `z.object({…}).strict()` and not a bare shape
 * (TASK-N2-A1).
 *
 * `registerTool` accepts a raw Zod shape, and the SDK wraps it in a default
 * (strip-mode) object. The JSON Schema it then publishes in `tools/list` says
 * `"additionalProperties": false` — but a strip-mode object SILENTLY DROPS
 * unknown keys rather than rejecting them. The advertised contract and the
 * enforced contract disagreed for every tool in this package: a client could
 * send `{ family: 'Buttons', writeTo: '/etc/passwd' }` and get a 200-shaped
 * result, which is precisely the read the schema told it was impossible.
 *
 * Passing an explicit `.strict()` object makes the enforcement match the
 * advertisement. The emitted JSON Schema is byte-identical either way — verified
 * against `tools/list` — so this is not a contract change; it is the contract
 * beginning to hold. `tools.contract.spec.ts` C3 pins it.
 */

/** Register every dzup-ui tool on a server, reading through `client`. */
export function registerTools(server: McpServer, client: RegistryClient): void {
  const text = (r: ToolResult) => ({
    content: [{ type: 'text' as const, text: r.text }],
    isError: r.isError,
  })
  /** Wrap a tool fn so transport/registry failures surface as an MCP error, not a crash. */
  const guard
    = <A>(fn: (a: A) => Promise<ToolResult>) =>
      async (args: A) => {
        try {
          return text(await fn(args))
        }
        catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          return {
            content: [
              {
                type: 'text' as const,
                text: `Failed to reach the dzup-ui registry (${client.base}): ${message}`,
              },
            ],
            isError: true,
          }
        }
      }

  server.registerTool(
    'list_components',
    {
      title: 'List components',
      description:
        'List @dzup-ui/core components with a one-line summary, optionally filtered by family (e.g. "Buttons", "Forms") or a free-text query. Start here to discover what exists.',
      inputSchema: z.object({
        family: freeText().optional().describe('Component family, e.g. "Buttons", "Forms", "Data"'),
        query: freeText().optional().describe('Free-text filter over name/description'),
      }).strict(),
    },
    guard((a: { family?: string, query?: string }) => listComponents(client, a)),
  )

  server.registerTool(
    'get_component',
    {
      title: 'Get component API',
      description:
        'Get the full public API for one component: import path, frozen variant/size/tone taxonomy, props/emits/slots tables and a usage snippet.',
      inputSchema: z.object({
        name: componentName().describe('Component name, e.g. "DzButton" or "button"'),
      }).strict(),
    },
    guard((a: { name: string }) => getComponent(client, a)),
  )

  server.registerTool(
    'list_blocks',
    {
      title: 'List blocks',
      description:
        'List pre-composed UI blocks (heroes, pricing, navbars, forms…) built from @dzup-ui/core. Filter by category or free-text query.',
      inputSchema: z.object({
        category: freeText()
          .optional()
          .describe('Block category, e.g. "marketing", "forms", "commerce"'),
        query: freeText()
          .optional()
          .describe('Free-text filter over name/title/description/components'),
      }).strict(),
    },
    guard((a: { category?: string, query?: string }) => listBlocks(client, a)),
  )

  server.registerTool(
    'get_block',
    {
      title: 'Get block source',
      description:
        'Fetch a block\'s real .vue source, its npm dependencies and the `shadcn add` install command. Use the result to drop the block into a project.',
      inputSchema: z.object({
        name: registryId().describe('Block name from list_blocks, e.g. "pricing-3", "hero-centered"'),
      }).strict(),
    },
    guard((a: { name: string }) => getBlock(client, a)),
  )

  server.registerTool(
    'list_templates',
    {
      title: 'List templates',
      description:
        'List full-page templates (dashboards, auth pages, settings, marketing pages…). Filter by category or free-text query.',
      inputSchema: z.object({
        category: freeText()
          .optional()
          .describe('Template category, e.g. "dashboards", "auth", "marketing"'),
        query: freeText()
          .optional()
          .describe('Free-text filter over name/title/description/components'),
      }).strict(),
    },
    guard((a: { category?: string, query?: string }) => listTemplates(client, a)),
  )

  server.registerTool(
    'get_template',
    {
      title: 'Get template source',
      description:
        'Fetch a full-page template\'s real .vue source, its npm dependencies and the `shadcn add` install command.',
      inputSchema: z.object({
        name: registryId().describe('Template name from list_templates, e.g. "analytics-dashboard"'),
      }).strict(),
    },
    guard((a: { name: string }) => getTemplate(client, a)),
  )

  server.registerTool(
    'list_tokens',
    {
      title: 'List design tokens',
      description:
        'List the --dz-* design tokens (OKLCH colors, spacing, radii, shadows…) as light/dark CSS variables. Filter by theme or a name/value query.',
      inputSchema: z.object({
        theme: z
          .enum(['light', 'dark'])
          .optional()
          .describe('Restrict to one theme; omit for both'),
        query: freeText()
          .optional()
          .describe('Filter tokens by name or value, e.g. "primary", "radius"'),
      }).strict(),
    },
    guard((a: { theme?: 'light' | 'dark', query?: string }) => listTokens(client, a)),
  )

  server.registerTool(
    'get_install_command',
    {
      title: 'Get install command',
      description:
        'Get the exact terminal commands to install a block, template or the token theme into a project, for a chosen package manager.',
      inputSchema: z.object({
        name: z
          .string()
          .max(REGISTRY_ID_MAX_LENGTH)
          .describe('Block/template name (ignored for type="tokens")'),
        type: z
          .enum(['block', 'template', 'tokens'])
          .optional()
          .describe('What to install (default: block)'),
        packageManager: z
          .enum(PACKAGE_MANAGERS)
          .optional()
          .describe('npm | pnpm | yarn | bun (default: npm)'),
      }).strict(),
    },
    guard(
      (a: {
        name: string
        type?: 'block' | 'template' | 'tokens'
        packageManager?: (typeof PACKAGE_MANAGERS)[number]
      }) => getInstallCommand(client, a),
    ),
  )

  // ── Component metadata (TASK-N2-A2) ──────────────────────────────────────
  //
  // Three tools over ONE generated artifact (`/r/component-meta.json`), which
  // `yarn generate:component-meta` extracts from the real `.vue`/`.types.ts`
  // sources with `vue-component-meta`. Extraction is a generate-time cost; the
  // server only reads the file.
  //
  // These reach all 144 public components. So, since TASK-N2-A3, do
  // `list_components` and `get_component`: the storybook `llms*.txt` projection
  // they read is now rendered from this same artifact by `yarn generate:llms`,
  // rather than from `public-api.manifest.json`, which omitted 43 of them
  // (TASK-N2-A1 finding F-1). The three tools here remain the structured
  // answer — typed prop tables and verbatim examples rather than markdown prose.

  server.registerTool(
    'search_components',
    {
      title: 'Search component metadata',
      description:
        'Search every @dzup-ui/core component by name, family, risk tier or free text over its props, events and slots. Answers from the generated metadata artifact, so it covers all 144 public components plus their compound parts.',
      inputSchema: z.object({
        query: freeText()
          .optional()
          .describe('Free text matched against name, family, prop/event/slot names and descriptions'),
        family: freeText()
          .optional()
          .describe('Component family, e.g. "buttons", "forms", "data", "providers"'),
        tier: z
          .enum(['A', 'B', 'C', 'D'])
          .optional()
          .describe('Risk tier from the quality matrix (A = highest evidence bar)'),
      }).strict(),
    },
    guard((a: { query?: string, family?: string, tier?: 'A' | 'B' | 'C' | 'D' }) =>
      searchComponents(client, a)),
  )

  server.registerTool(
    'get_component_metadata',
    {
      title: 'Get component metadata',
      description:
        'Get one component\'s complete machine-extracted API: props with resolved types, declared defaults and descriptions; events with payload types; slots with slot-prop types; exposed members; plus its family, risk tier, ADR-19 anatomy parts and evidence-cell state.',
      inputSchema: z.object({
        name: componentName().describe('Component name, e.g. "DzButton" or "button"'),
      }).strict(),
    },
    guard((a: { name: string }) => getComponentMetadata(client, a)),
  )

  server.registerTool(
    'get_component_example',
    {
      title: 'Get component usage example',
      description:
        'Get real usage source for a component, taken verbatim from its Storybook story — never synthesised. Returns the story\'s markup and its full source. A component with no story returns an explicit "no example published" rather than invented code.',
      inputSchema: z.object({
        name: componentName().describe('Component name, e.g. "DzButton" or "button"'),
        story: componentName()
          .optional()
          .describe('A specific story export name; omit for the component\'s primary example'),
      }).strict(),
    },
    guard((a: { name: string, story?: string }) => getComponentExample(client, a)),
  )

  server.registerTool(
    'search',
    {
      title: 'Search catalog',
      description:
        'One free-text search across components, blocks and templates at once. Returns the top matches in each category with the tool to call next.',
      inputSchema: z.object({
        query: freeText()
          .describe('What you are looking for, e.g. "pricing", "date picker", "sidebar"'),
      }).strict(),
    },
    guard((a: { query: string }) => search(client, a)),
  )
}

/** Build a fully-wired server (used by both `main` and tests). */
export function createServer(client = new RegistryClient()): McpServer {
  const server = new McpServer(
    { name: 'dzup-ui', version: VERSION },
    { instructions: INSTRUCTIONS },
  )
  registerTools(server, client)
  return server
}

async function main(): Promise<void> {
  const client = new RegistryClient()
  const server = createServer(client)
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error(
    `dzup-ui MCP server running (registry: ${client.base}, default: ${DEFAULT_REGISTRY_URL})`,
  )
}

// Run only when invoked as a binary, not when imported by tests.
const invokedDirectly = process.argv[1] && /(?:^|[/\\])index\.(?:js|ts)$/.test(process.argv[1])
if (invokedDirectly) {
  main().catch((err) => {
    console.error('dzup-ui MCP server failed to start:', err)
    process.exit(1)
  })
}
