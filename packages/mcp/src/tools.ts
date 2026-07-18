/**
 * Tool implementations — pure(ish) functions that read the catalog through a
 * RegistryClient and return a markdown string for the MCP text result.
 *
 * They are deliberately separated from the server wiring in `index.ts` so the
 * whole surface can be unit-tested against a fake reader without a transport.
 * Each returns `{ text, isError? }`; `index.ts` maps that to a `content` block.
 */

import type { RegistryClient, RegistryIndexItem, RegistryItem } from './registry.js'

export interface ToolResult {
  text: string
  isError?: boolean
}

/** The package managers we can print an install one-liner for. */
export const PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'] as const
export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

/** `dlx`-style runner prefix per manager (how `shadcn` is meant to be invoked). */
const DLX: Record<PackageManager, string> = {
  npm: 'npx',
  pnpm: 'pnpm dlx',
  yarn: 'yarn dlx',
  bun: 'bunx',
}

/** `add`/`install` verb per manager for the runtime npm deps. */
const ADD: Record<PackageManager, string> = {
  npm: 'npm i',
  pnpm: 'pnpm add',
  yarn: 'yarn add',
  bun: 'bun add',
}

/** `<pm> shadcn add <url>` — the one-liner that drops a block/template into a project. */
export function shadcnAddCommand(url: string, pm: PackageManager = 'npm'): string {
  return `${DLX[pm]} shadcn@latest add ${url}`
}

/** Case-insensitive substring match of `q` against any of the haystack strings. */
function matches(q: string | undefined, ...haystack: Array<string | undefined>): boolean {
  if (!q)
    return true
  const needle = q.toLowerCase()
  return haystack.some(h => (h ?? '').toLowerCase().includes(needle))
}

function itemComponents(item: RegistryIndexItem): string[] {
  return item.meta?.components ?? []
}

// ── Components ────────────────────────────────────────────────────────────────

export async function listComponents(
  client: RegistryClient,
  args: { family?: string, query?: string } = {},
): Promise<ToolResult> {
  const all = await client.components()
  const rows = all.filter(
    c =>
      matches(args.family, c.family)
      && matches(args.query, c.name, c.description, c.family, c.details),
  )
  if (!rows.length) {
    return { text: `No components matched (family=${args.family ?? '—'}, query=${args.query ?? '—'}). ${all.length} components total.` }
  }
  const byFamily = new Map<string, typeof rows>()
  for (const c of rows) {
    const list = byFamily.get(c.family) ?? []
    list.push(c)
    byFamily.set(c.family, list)
  }
  const parts: string[] = [
    `# dzup-ui components (${rows.length}${rows.length === all.length ? '' : ` of ${all.length}`})`,
    '',
    'Import every component as a named export of `@dzup-ui/core`. Use `get_component` for a component\'s full props/emits/slots and a usage snippet.',
    '',
  ]
  for (const [family, list] of byFamily) {
    parts.push(`## ${family}`)
    for (const c of list) parts.push(`- **${c.name}** — ${c.description}`)
    parts.push('')
  }
  return { text: parts.join('\n').trimEnd() }
}

export async function getComponent(
  client: RegistryClient,
  args: { name: string },
): Promise<ToolResult> {
  const section = await client.component(args.name)
  if (!section) {
    const all = await client.components()
    const near = all
      .filter(c => c.name.toLowerCase().includes(args.name.replace(/^dz/i, '').toLowerCase()))
      .slice(0, 8)
      .map(c => c.name)
    return {
      text: `Component "${args.name}" not found.${near.length ? ` Did you mean: ${near.join(', ')}?` : ' Use list_components to browse.'}`,
      isError: true,
    }
  }
  return { text: section }
}

// ── Blocks & templates (shared shape) ─────────────────────────────────────────

async function listRegistry(
  index: { items: RegistryIndexItem[] },
  kind: 'block' | 'template',
  args: { category?: string, query?: string },
): Promise<ToolResult> {
  const rows = index.items.filter(
    it =>
      matches(args.category, ...(it.categories ?? []))
      && matches(args.query, it.name, it.title, it.description, ...(itemComponents(it))),
  )
  if (!rows.length) {
    return { text: `No ${kind}s matched (category=${args.category ?? '—'}, query=${args.query ?? '—'}). ${index.items.length} ${kind}s total.` }
  }
  const parts: string[] = [
    `# dzup-ui ${kind}s (${rows.length}${rows.length === index.items.length ? '' : ` of ${index.items.length}`})`,
    '',
    `Use \`get_${kind}\` with a name to fetch the real source + install command.`,
    '',
  ]
  for (const it of rows) {
    const cats = (it.categories ?? []).join(', ')
    const tier = typeof it.meta?.tier === 'string' ? ` · ${it.meta.tier}` : ''
    parts.push(`- **${it.name}** — ${it.title ?? it.name}${cats ? ` _(${cats}${tier})_` : ''}`)
    if (it.description)
      parts.push(`  - ${it.description}`)
    const comps = itemComponents(it)
    if (comps.length)
      parts.push(`  - built from: ${comps.join(', ')}`)
  }
  return { text: parts.join('\n') }
}

export async function listBlocks(
  client: RegistryClient,
  args: { category?: string, query?: string } = {},
): Promise<ToolResult> {
  return listRegistry(await client.blocksIndex(), 'block', args)
}

export async function listTemplates(
  client: RegistryClient,
  args: { category?: string, query?: string } = {},
): Promise<ToolResult> {
  return listRegistry(await client.templatesIndex(), 'template', args)
}

/** Render a resolved registry item as source + deps + install command. */
function renderItem(
  item: RegistryItem,
  url: string,
  kind: 'block' | 'template',
): ToolResult {
  const parts: string[] = [
    `# ${item.title ?? item.name} (${kind})`,
    '',
    item.description ?? '',
    '',
    `- **Install:** \`${shadcnAddCommand(url)}\``,
    `- **Registry item:** ${url}`,
  ]
  const deps = item.dependencies ?? []
  if (deps.length)
    parts.push(`- **npm dependencies:** ${deps.join(', ')} — \`${ADD.npm} ${deps.join(' ')}\``)
  const comps = itemComponents(item)
  if (comps.length)
    parts.push(`- **Components used:** ${comps.join(', ')}`)
  parts.push('')
  for (const file of item.files ?? []) {
    parts.push(`## ${file.target ?? file.path}`)
    parts.push('')
    parts.push('```vue')
    parts.push((file.content ?? '').replace(/\n+$/, ''))
    parts.push('```')
    parts.push('')
  }
  return { text: parts.join('\n').trimEnd() }
}

export async function getBlock(
  client: RegistryClient,
  args: { name: string },
): Promise<ToolResult> {
  try {
    const item = await client.block(args.name)
    return renderItem(item, client.blockUrl(args.name), 'block')
  }
  catch {
    return { text: `Block "${args.name}" not found. Use list_blocks to browse available blocks.`, isError: true }
  }
}

export async function getTemplate(
  client: RegistryClient,
  args: { name: string },
): Promise<ToolResult> {
  try {
    const item = await client.template(args.name)
    return renderItem(item, client.templateUrl(args.name), 'template')
  }
  catch {
    return { text: `Template "${args.name}" not found. Use list_templates to browse available templates.`, isError: true }
  }
}

// ── Tokens ────────────────────────────────────────────────────────────────────

export async function listTokens(
  client: RegistryClient,
  args: { theme?: 'light' | 'dark', query?: string } = {},
): Promise<ToolResult> {
  const tokens = await client.tokens()
  const themes: Array<'light' | 'dark'> = args.theme ? [args.theme] : ['light', 'dark']
  const parts: string[] = [
    `# dzup-ui design tokens`,
    '',
    tokens.description ?? 'The --dz-* OKLCH design-token set as light/dark CSS variables.',
    '',
    `- **Install the full theme:** \`${shadcnAddCommand(client.tokensUrl())}\``,
    '',
    'Tokens are applied as `--dz-*` CSS custom properties under a `data-theme` element. Names below omit the leading `--`.',
    '',
  ]
  let total = 0
  for (const theme of themes) {
    const vars = tokens.cssVars?.[theme] ?? {}
    const entries = Object.entries(vars).filter(([k, v]) => matches(args.query, k, v))
    total += entries.length
    parts.push(`## ${theme} (${entries.length})`)
    parts.push('')
    parts.push('| Token | Value |')
    parts.push('| --- | --- |')
    for (const [k, v] of entries) parts.push(`| \`--${k}\` | \`${v}\` |`)
    parts.push('')
  }
  if (total === 0) {
    return { text: `No tokens matched query="${args.query ?? ''}".` }
  }
  return { text: parts.join('\n').trimEnd() }
}

// ── Install command ───────────────────────────────────────────────────────────

export async function getInstallCommand(
  client: RegistryClient,
  args: { name: string, type?: 'block' | 'template' | 'tokens', packageManager?: PackageManager },
): Promise<ToolResult> {
  const pm = args.packageManager ?? 'npm'
  const type = args.type ?? 'block'
  let url: string
  if (type === 'tokens')
    url = client.tokensUrl()
  else if (type === 'template')
    url = client.templateUrl(args.name)
  else url = client.blockUrl(args.name)

  const runtime = `${ADD[pm]} @dzup-ui/core @dzup-ui/tokens`
  const parts = [
    `Install the ${type} "${args.name}" into a Vue 3 project:`,
    '',
    '```sh',
    `# 1. install the runtime packages (once per project)`,
    runtime,
    '',
    `# 2. add the ${type} — drops the .vue file(s) into your project`,
    shadcnAddCommand(url, pm),
    '```',
    '',
    `Registry item: ${url}`,
  ]
  return { text: parts.join('\n') }
}

// ── Unified search ────────────────────────────────────────────────────────────

export async function search(
  client: RegistryClient,
  args: { query: string },
): Promise<ToolResult> {
  const [blocks, templates, components] = await Promise.all([
    client.blocksIndex(),
    client.templatesIndex(),
    client.components(),
  ])
  const q = args.query
  const blockHits = blocks.items.filter(it =>
    matches(q, it.name, it.title, it.description, ...itemComponents(it)),
  )
  const templateHits = templates.items.filter(it =>
    matches(q, it.name, it.title, it.description, ...itemComponents(it)),
  )
  const componentHits = components.filter(c => matches(q, c.name, c.description, c.family))

  const parts: string[] = [`# Search "${q}"`, '']
  const section = (title: string, lines: string[]) => {
    parts.push(`## ${title} (${lines.length})`)
    parts.push(...(lines.length ? lines : ['_none_']))
    parts.push('')
  }
  section('Components', componentHits.slice(0, 25).map(c => `- **${c.name}** (${c.family}) — ${c.description} · \`get_component\``))
  section('Blocks', blockHits.slice(0, 25).map(it => `- **${it.name}** — ${it.title ?? ''} · \`get_block\``))
  section('Templates', templateHits.slice(0, 25).map(it => `- **${it.name}** — ${it.title ?? ''} · \`get_template\``))
  return { text: parts.join('\n').trimEnd() }
}
