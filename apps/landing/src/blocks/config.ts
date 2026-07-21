/**
 * Blocks distribution config — the single switch for the shadcn registry.
 *
 * `REGISTRY_ENABLED` gates every surface that prints the `npx shadcn@latest add …`
 * command (Task F6's BlockManifest, Task G3's block actions). It flipped to
 * `true` in the change that landed the registry generator (Task G1,
 * `apps/landing/scripts/build-registry.ts`), which emits `public/r/<id>.json`,
 * so those surfaces now show the install one-liner. One flag, no per-surface
 * edits (docs/blocks.md §3.3).
 */
import { SITE_ORIGIN } from '../origin.ts'

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
 * side — the shadcn CLI and v0's "Open in v0" handoff (Task G4) — need an
 * absolute, publicly-reachable URL, not a root-relative path.
 *
 * ── Decision: pinned to the canonical origin (was `''`) ─────────────────────
 * docs/blocks.md §10 open decision #3 is hereby closed: the host is `SITE_ORIGIN`.
 * This used to be empty, which meant "resolve from `window.location.origin` at
 * runtime". That is right exactly once — on production — and wrong everywhere
 * else, because these URLs are not for us: every one of them is COPIED OUT of the
 * page and pasted into someone else's terminal or handed to v0's servers. A
 * visitor reading the gallery on a Netlify deploy-preview copied
 * `npx shadcn@latest add https://deploy-preview-42--dzup-ui.netlify.app/r/hero-centered.json`,
 * which rots the moment the preview is torn down; on localhost they copied a URL
 * only their own machine could ever resolve, and v0 — which fetches the item from
 * ITS side — could never resolve either. The registry is a published artifact
 * with one canonical address, so the command that installs it names that address
 * regardless of which host happens to be rendering the page.
 *
 * The runtime fallback in `registryHost()` below is kept, not dead: blanking this
 * constant is still how a fork points the copy-paste commands at its own origin.
 */
export const REGISTRY_HOST = SITE_ORIGIN

/**
 * Resolve the absolute origin that serves the registry: the explicitly
 * configured `REGISTRY_HOST` when set, otherwise the live page origin. Empty
 * only when neither is available (SSR/prerender with no configured host) — a
 * sentinel callers treat as "no host configured" and hide host-dependent links.
 * With `REGISTRY_HOST` pinned above, the fallback and the empty sentinel are
 * unreachable in this repo's configuration; they remain the contract for a fork
 * that blanks it.
 */
export function registryHost(): string {
  if (REGISTRY_HOST)
    return REGISTRY_HOST
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
 * The published npm package for the dedicated dzup-ui MCP server
 * (`packages/mcp`, Task G5). Unlike `mcpServerConfig()` above — which wires the
 * shadcn CLI's GENERIC `registry:mcp` at the blocks registry — this is a
 * first-party server that also exposes the component API, templates and design
 * tokens, and is run with a single `npx -y @dzup-ui/mcp` (no env needed; it
 * defaults to the public site). The `/ai` docs page renders per-client configs
 * from these helpers so the copy-paste snippets can never drift.
 */
export const DZUP_MCP_PACKAGE = '@dzup-ui/mcp'

/** The stdio launch command every MCP client uses, as `[command, ...args]`. */
export const DZUP_MCP_COMMAND = ['npx', '-y', DZUP_MCP_PACKAGE] as const

/** The canonical `{ mcpServers: { "dzup-ui": … } }` block (Cursor, Claude Code, Windsurf). */
export function dzupMcpConfig(): string {
  return JSON.stringify(
    {
      mcpServers: {
        [MCP_SERVER_KEY]: {
          command: DZUP_MCP_COMMAND[0],
          args: [...DZUP_MCP_COMMAND.slice(1)],
        },
      },
    },
    null,
    2,
  )
}

/** VS Code / Copilot use `servers` with an explicit `type: "stdio"`. */
export function dzupMcpVscodeConfig(): string {
  return JSON.stringify(
    {
      servers: {
        [MCP_SERVER_KEY]: {
          type: 'stdio',
          command: DZUP_MCP_COMMAND[0],
          args: [...DZUP_MCP_COMMAND.slice(1)],
        },
      },
    },
    null,
    2,
  )
}

/** The one-line Claude Code CLI registration. */
export function dzupMcpClaudeCliCommand(): string {
  return `claude mcp add ${MCP_SERVER_KEY} -- ${DZUP_MCP_COMMAND.join(' ')}`
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

/**
 * Extra runtime npm packages a block/template SFC may import beyond the base two
 * (`@dzup-ui/core` + `@dzup-ui/tokens`). Detected from the SFC source so the
 * emitted registry item's `dependencies[]` lists EVERYTHING the copied file needs
 * to build in a fresh project — otherwise `shadcn add`-ing a block that imports,
 * say, `lucide-vue-next` would drop in a `.vue` that fails to resolve its icons.
 * `vue` is a peer every Vue project already has, so it is intentionally omitted.
 */
export const OPTIONAL_DEPENDENCIES = ['lucide-vue-next', '@formkit/auto-animate'] as const

/**
 * The npm `dependencies[]` for a given SFC source: the base packages plus any
 * `OPTIONAL_DEPENDENCIES` the source actually imports (matched on the quoted
 * specifier, so a substring in a comment does not false-positive). Order is
 * stable — base first, optionals in declared order — for clean diffs.
 */
export function sourceDependencies(source: string): string[] {
  const extra = OPTIONAL_DEPENDENCIES.filter(
    pkg => source.includes(`'${pkg}'`) || source.includes(`"${pkg}"`),
  )
  return [...BLOCK_DEPENDENCIES, ...extra]
}

/**
 * The four package managers we print copy-paste commands for. Kept as a const
 * tuple so the UI (the PM tab set) and every command helper below iterate the
 * SAME ordered set — a developer picks their manager once and every snippet on
 * the page matches. `npm` is first (the default tab).
 */
export const PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'] as const
export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

/**
 * Per-manager `add`/`install` verb for a runtime dependency. `npm` uses `i`; the
 * others their native add verb. Source of truth for the hero + manifest install
 * snippets (mirrors the on-disk lockfiles a consumer already has).
 */
const PM_ADD: Record<PackageManager, string> = {
  npm: 'npm i',
  pnpm: 'pnpm add',
  yarn: 'yarn add',
  bun: 'bun add',
}

/**
 * Per-manager one-off runner (`dlx`) prefix for executing a CLI package WITHOUT
 * a global install — how `shadcn` is meant to be invoked. npm→`npx`,
 * pnpm→`pnpm dlx`, yarn→`yarn dlx`, bun→`bunx`.
 */
const PM_DLX: Record<PackageManager, string> = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
  bun: 'bunx',
}

/**
 * The copy-paste manual install for the runtime packages, for a given manager
 * (defaults to npm). e.g. `pnpm add @dzup-ui/core @dzup-ui/tokens`. The hero and
 * BlockManifest render one per `PACKAGE_MANAGERS` tab.
 */
export function installCommand(pm: PackageManager = 'npm'): string {
  return `${PM_ADD[pm]} ${BLOCK_DEPENDENCIES.join(' ')}`
}

/** `npm i @dzup-ui/core @dzup-ui/tokens` — the default (npm) manual install. */
export const npmInstallCommand = installCommand('npm')

/**
 * The consumer one-liner that installs a single block from the registry via the
 * shadcn CLI, resolved to an ABSOLUTE URL against the current origin (a developer
 * pastes it into their own terminal, so a root-relative path would not work).
 *
 * Targets the canonical, framework-agnostic `shadcn` CLI (`npx shadcn@latest
 * add <url>`) — the emitted items conform to the ui.shadcn.com registry-item
 * schema (`registryItem.ts`), so a plain `shadcn add` resolves them; there is no
 * dependency on the `shadcn-vue` fork. Only meaningful when `REGISTRY_ENABLED` —
 * callers gate on that flag first. Pass `pm` for the pnpm/yarn/bun equivalents.
 */
export function registryAddCommand(id: string, pm: PackageManager = 'npm'): string {
  return `${PM_DLX[pm]} shadcn@latest add ${registryItemUrl(id)}`
}

/**
 * `shadcn add` for an ABSOLUTE item URL (not resolved through a block id) — used
 * for the tokens theme and templates, whose URLs the caller already holds.
 */
export function registryAddUrlCommand(url: string, pm: PackageManager = 'npm'): string {
  return `${PM_DLX[pm]} shadcn@latest add ${url}`
}

/** All four PMs mapped to their value produced by `fn` — the shape `PmCommandTabs` renders. */
function byPackageManager(fn: (pm: PackageManager) => string): Record<PackageManager, string> {
  return Object.fromEntries(PACKAGE_MANAGERS.map(pm => [pm, fn(pm)])) as Record<
    PackageManager,
    string
  >
}

/** Per-PM manual install commands (`{ npm, pnpm, yarn, bun }`) for the hero + manifest. */
export function installCommands(): Record<PackageManager, string> {
  return byPackageManager(installCommand)
}

/** Per-PM `shadcn add <block>` commands (`{ npm, pnpm, yarn, bun }`) for the CLI tab set. */
export function registryAddCommands(id: string): Record<PackageManager, string> {
  return byPackageManager(pm => registryAddCommand(id, pm))
}
