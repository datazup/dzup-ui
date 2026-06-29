/**
 * Blocks distribution config — the single switch for the shadcn-vue registry.
 *
 * `REGISTRY_ENABLED` gates every surface that prints the `npx shadcn-vue add …`
 * command (Task F6's BlockManifest, Task G3's block actions). It flipped to
 * `true` in the change that landed the registry generator (Task G1,
 * `apps/landing/scripts/build-registry.ts`), which emits `public/r/<id>.json`,
 * so those surfaces now show the install one-liner. One flag, no per-surface
 * edits (docs/blocks.md §3.3).
 */
export const REGISTRY_ENABLED = true

/**
 * Root-relative path under the site origin where the generated registry items
 * are served as static assets — `public/r/` maps to `/r/` at runtime. Kept
 * origin-relative so the absolute install URL resolves against whatever host the
 * gallery is deployed to (mirrors router.ts's `absoluteImage`).
 */
export const REGISTRY_PATH = '/r'

/**
 * The stable, public host that serves the generated registry items
 * (`<host>/r/<id>.json`). External consumers that fetch the registry from THEIR
 * side — the shadcn-vue CLI and v0's "Open in v0" handoff (Task G4) — need an
 * absolute, publicly-reachable URL, not a root-relative path. Left empty until
 * the production host is confirmed (docs/blocks.md §10, open decision #3); set it
 * to the canonical origin (e.g. `'https://ui.dzup.dev'`) once chosen. While
 * empty we fall back to the live `window.location.origin`, so local/preview
 * deployments still resolve a working URL.
 */
export const REGISTRY_HOST = ''

/**
 * Resolve the absolute origin that serves the registry: the explicitly
 * configured `REGISTRY_HOST` when set, otherwise the live page origin. Empty
 * only when neither is available (SSR/prerender with no configured host) — a
 * sentinel callers treat as "no host configured" and hide host-dependent links.
 */
export function registryHost(): string {
  if (REGISTRY_HOST) return REGISTRY_HOST
  return typeof window === 'undefined' ? '' : window.location.origin
}

/**
 * Absolute URL of a block's generated registry item JSON (`<host>/r/<id>.json`,
 * Task G1). Empty when no registry host resolves, so callers can hide a link
 * rather than emit a dead one.
 */
export function registryItemUrl(id: string): string {
  const host = registryHost()
  return host ? `${host}${REGISTRY_PATH}/${id}.json` : ''
}

/**
 * Absolute URL of the generated registry index (`<host>/r/registry.json`, Task
 * G1) — the entry point an MCP-capable assistant (Task G5) and the shadcn CLI's
 * `registry:mcp` server read to browse the whole catalog. Empty when no host
 * resolves.
 */
export function registryIndexUrl(): string {
  const host = registryHost()
  return host ? `${host}${REGISTRY_PATH}/registry.json` : ''
}

/**
 * Absolute URL of the AI-readable docs index (`<host>/llms.txt`, Task G2) — what
 * a consumer points an assistant at via `@docs`. Empty when no host resolves.
 */
export function llmsTxtUrl(): string {
  const host = registryHost()
  return host ? `${host}/llms.txt` : ''
}

/**
 * The shadcn registry namespace for the catalog — what namespaced discovery
 * commands resolve against (`npx shadcn view @dzup-ui/<id>`). Mirrors the
 * registry `name` stamped into `registry.json` (`registryItem.ts`), prefixed per
 * the shadcn namespaced-registry convention.
 */
export const REGISTRY_NAMESPACE = '@dzup-ui'

/** The MCP server key under `mcpServers` in the copy-paste config below. */
const MCP_SERVER_KEY = 'dzup-ui'

/**
 * Placeholder origin used in copyable config/commands when no live host is
 * resolvable (SSR/prerender with `REGISTRY_HOST` unset) — so the snippet is
 * still shown, with an obvious slot for the deployer to fill in, rather than a
 * dead empty URL.
 */
const HOST_PLACEHOLDER = 'https://<landing-host>'

/** The origin for copyable text — the resolved host, else an obvious placeholder. */
function copyHost(): string {
  return registryHost() || HOST_PLACEHOLDER
}

/**
 * The exact, copy-paste MCP server config (Task G5) that points an MCP-capable
 * assistant (Claude, Cursor, Windsurf…) at the dzup-ui blocks registry. It runs
 * the shadcn CLI's built-in `registry:mcp` server — NO new service is authored
 * here — with `REGISTRY_URL` set to the generated `registry.json` index. Drop
 * this into the assistant's MCP config (e.g. `.cursor/mcp.json`,
 * `.mcp.json`/`claude_desktop_config.json`). Always returns a complete snippet,
 * substituting the deployment origin (or an obvious placeholder when unresolved).
 */
export function mcpServerConfig(): string {
  const registryUrl = `${copyHost()}${REGISTRY_PATH}/registry.json`
  return JSON.stringify(
    {
      mcpServers: {
        [MCP_SERVER_KEY]: {
          command: 'npx',
          args: ['shadcn@latest', 'registry:mcp'],
          env: { REGISTRY_URL: registryUrl },
        },
      },
    },
    null,
    2,
  )
}

/**
 * The "Open in v0" handoff URL (docs/blocks.md §1.2 #10, §1.3, Task G4). v0
 * fetches the block's registry item JSON and remixes it with the `--dz-*` design
 * tokens preloaded; v0 is React-centric, so for this Vue library it's a
 * "remix the idea" handoff, not a 1:1 import. v0's contract is
 * `https://v0.dev/chat/api/open?url=<registry-item-json-url>` (the item URL is
 * encoded so the query parser receives it intact). Empty when no registry host
 * is configured, so callers can hide the action instead of linking nowhere.
 */
export function v0OpenUrl(id: string): string {
  const itemUrl = registryItemUrl(id)
  return itemUrl ? `https://v0.dev/chat/api/open?url=${encodeURIComponent(itemUrl)}` : ''
}

/**
 * The shadcn CLI discovery one-liners (Task G5) for browsing the catalog from a
 * terminal once the `@dzup-ui` namespace is registered in `components.json`
 * (`{"registries":{"@dzup-ui":"<host>/r/{name}.json"}}`): `list` enumerates every
 * block, `search` free-text filters them, `view` prints one block's item JSON.
 * Shared by the "Use with AI" UI and the docs so the two never drift; `sampleId`
 * is the block used in the `view` example.
 */
export function registryDiscoveryCommands(sampleId = 'hero-centered'): string {
  return [
    `npx shadcn list ${REGISTRY_NAMESPACE}`,
    `npx shadcn search ${REGISTRY_NAMESPACE} pricing`,
    `npx shadcn view ${REGISTRY_NAMESPACE}/${sampleId}`,
  ].join('\n')
}

/**
 * The runtime packages every block needs: the components (`@dzup-ui/core`) and
 * the `--dz-*` token CSS (`@dzup-ui/tokens`). This is the source of truth for
 * both the manual install line below and the registry item `dependencies[]` that
 * Task G1 will emit — keep the two in lockstep.
 */
export const BLOCK_DEPENDENCIES = ['@dzup-ui/core', '@dzup-ui/tokens'] as const

/** `npm i @dzup-ui/core @dzup-ui/tokens` — the copy-paste manual install. */
export const npmInstallCommand = `npm i ${BLOCK_DEPENDENCIES.join(' ')}`

/**
 * The consumer one-liner that installs a single block via the shadcn-vue CLI,
 * resolved to an ABSOLUTE URL against the current origin (a developer pastes it
 * into their own terminal, so a root-relative path would not work). Only
 * meaningful when `REGISTRY_ENABLED` — callers gate on that flag first.
 */
export function registryAddCommand(id: string): string {
  return `npx shadcn-vue add ${registryItemUrl(id)}`
}
