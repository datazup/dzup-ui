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
import process from 'node:process'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { DEFAULT_REGISTRY_URL, RegistryClient } from './registry.js'
import {
  getBlock,
  getComponent,
  getInstallCommand,
  getTemplate,
  listBlocks,
  listComponents,
  listTemplates,
  listTokens,
  PACKAGE_MANAGERS,
  search,
} from './tools.js'

export const VERSION = '0.1.0'

const INSTRUCTIONS
  = 'dzup-ui is a free, Vue 3, token-driven component library (@dzup-ui/core) plus a shadcn-compatible catalog of copy-paste blocks, full-page templates and design tokens. '
    + 'Use list_components / get_component to learn a component\'s API before writing markup. '
    + 'Use list_blocks / list_templates to browse pre-composed sections, then get_block / get_template to fetch the REAL .vue source and the `shadcn add` install command. '
    + 'Prefer composing from these blocks over hand-rolling UI. All styling is via --dz-* tokens (list_tokens); never hardcode colors.'

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
      inputSchema: {
        family: z.string().optional().describe('Component family, e.g. "Buttons", "Forms", "Data"'),
        query: z.string().optional().describe('Free-text filter over name/description'),
      },
    },
    guard((a: { family?: string, query?: string }) => listComponents(client, a)),
  )

  server.registerTool(
    'get_component',
    {
      title: 'Get component API',
      description:
        'Get the full public API for one component: import path, frozen variant/size/tone taxonomy, props/emits/slots tables and a usage snippet.',
      inputSchema: {
        name: z.string().describe('Component name, e.g. "DzButton" or "button"'),
      },
    },
    guard((a: { name: string }) => getComponent(client, a)),
  )

  server.registerTool(
    'list_blocks',
    {
      title: 'List blocks',
      description:
        'List pre-composed UI blocks (heroes, pricing, navbars, forms…) built from @dzup-ui/core. Filter by category or free-text query.',
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe('Block category, e.g. "marketing", "forms", "commerce"'),
        query: z
          .string()
          .optional()
          .describe('Free-text filter over name/title/description/components'),
      },
    },
    guard((a: { category?: string, query?: string }) => listBlocks(client, a)),
  )

  server.registerTool(
    'get_block',
    {
      title: 'Get block source',
      description:
        'Fetch a block\'s real .vue source, its npm dependencies and the `shadcn add` install command. Use the result to drop the block into a project.',
      inputSchema: {
        name: z.string().describe('Block name from list_blocks, e.g. "pricing-3", "hero-centered"'),
      },
    },
    guard((a: { name: string }) => getBlock(client, a)),
  )

  server.registerTool(
    'list_templates',
    {
      title: 'List templates',
      description:
        'List full-page templates (dashboards, auth pages, settings, marketing pages…). Filter by category or free-text query.',
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe('Template category, e.g. "dashboards", "auth", "marketing"'),
        query: z
          .string()
          .optional()
          .describe('Free-text filter over name/title/description/components'),
      },
    },
    guard((a: { category?: string, query?: string }) => listTemplates(client, a)),
  )

  server.registerTool(
    'get_template',
    {
      title: 'Get template source',
      description:
        'Fetch a full-page template\'s real .vue source, its npm dependencies and the `shadcn add` install command.',
      inputSchema: {
        name: z.string().describe('Template name from list_templates, e.g. "analytics-dashboard"'),
      },
    },
    guard((a: { name: string }) => getTemplate(client, a)),
  )

  server.registerTool(
    'list_tokens',
    {
      title: 'List design tokens',
      description:
        'List the --dz-* design tokens (OKLCH colors, spacing, radii, shadows…) as light/dark CSS variables. Filter by theme or a name/value query.',
      inputSchema: {
        theme: z
          .enum(['light', 'dark'])
          .optional()
          .describe('Restrict to one theme; omit for both'),
        query: z
          .string()
          .optional()
          .describe('Filter tokens by name or value, e.g. "primary", "radius"'),
      },
    },
    guard((a: { theme?: 'light' | 'dark', query?: string }) => listTokens(client, a)),
  )

  server.registerTool(
    'get_install_command',
    {
      title: 'Get install command',
      description:
        'Get the exact terminal commands to install a block, template or the token theme into a project, for a chosen package manager.',
      inputSchema: {
        name: z.string().describe('Block/template name (ignored for type="tokens")'),
        type: z
          .enum(['block', 'template', 'tokens'])
          .optional()
          .describe('What to install (default: block)'),
        packageManager: z
          .enum(PACKAGE_MANAGERS)
          .optional()
          .describe('npm | pnpm | yarn | bun (default: npm)'),
      },
    },
    guard(
      (a: {
        name: string
        type?: 'block' | 'template' | 'tokens'
        packageManager?: (typeof PACKAGE_MANAGERS)[number]
      }) => getInstallCommand(client, a),
    ),
  )

  server.registerTool(
    'search',
    {
      title: 'Search catalog',
      description:
        'One free-text search across components, blocks and templates at once. Returns the top matches in each category with the tool to call next.',
      inputSchema: {
        query: z
          .string()
          .describe('What you are looking for, e.g. "pricing", "date picker", "sidebar"'),
      },
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
