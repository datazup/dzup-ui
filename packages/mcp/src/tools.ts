/**
 * Tool implementations — pure(ish) functions that read the catalog through a
 * RegistryClient and return a markdown string for the MCP text result.
 *
 * They are deliberately separated from the server wiring in `index.ts` so the
 * whole surface can be unit-tested against a fake reader without a transport.
 * Each returns `{ text, isError? }`; `index.ts` maps that to a `content` block.
 */

import type { RegistryClient, RegistryIndexItem, RegistryItem } from './registry.js'
import { isRegistryId, REGISTRY_ID_MAX_LENGTH } from './registry.js'

export interface ToolResult {
  text: string
  isError?: boolean
}

/**
 * Refuse a name that is not a registry id, with the same wording every tool
 * uses (TASK-N2-A1).
 *
 * The zod schemas in `index.ts` reject these at the protocol boundary, so an
 * MCP client never reaches this. It exists because `registerTools`,
 * `createServer` and the whole of `./registry` are PUBLIC exports of this
 * package: a consumer calling `getBlock` directly gets the same guarantee as
 * one calling it over stdio, instead of the guarantee living only in the
 * transport wiring.
 */
function rejectBadId(name: unknown, kind: 'block' | 'template'): ToolResult | null {
  if (isRegistryId(name))
    return null
  // The rejected value is deliberately NOT echoed. Every other message in this
  // module quotes its argument back, which is fine for a value that passed
  // validation and wrong for one that did not: the caller's own text would be
  // re-emitted as part of an authoritative-looking answer from the dzup-ui
  // server, and the whole reason this check exists is that the caller's text is
  // not trustworthy. The caller already knows what it sent.
  return {
    text:
      `That is not a valid ${kind} name. `
      + `Names are lowercase kebab-case (a-z, 0-9 and single hyphens), at most ${REGISTRY_ID_MAX_LENGTH} characters — `
      + `e.g. "hero-centered". Use list_${kind}s to browse the real names.`,
    isError: true,
  }
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
  const bad = rejectBadId(args.name, 'block')
  if (bad)
    return bad
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
  const bad = rejectBadId(args.name, 'template')
  if (bad)
    return bad
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

/**
 * The install one-liner for a block, template or the token theme.
 *
 * Two properties this tool did NOT have before TASK-N2-A1, both of which matter
 * because its output is a ```sh block an assistant is instructed to hand a user
 * to run:
 *
 *   1. the name is validated as a registry id — an unvalidated name was
 *      interpolated straight into the `shadcn add <url>` line, so a name
 *      containing a space appended a second, arbitrary URL to a command that
 *      installs whatever it is pointed at;
 *   2. the item is CHECKED AGAINST THE GENERATED INDEX before a command is
 *      printed. It used to build the URL from a string template alone, so it
 *      would confidently emit an install command for a block that does not
 *      exist — the one tool in this package that answered without reading the
 *      catalog at all.
 */
export async function getInstallCommand(
  client: RegistryClient,
  args: { name: string, type?: 'block' | 'template' | 'tokens', packageManager?: PackageManager },
): Promise<ToolResult> {
  const pm = args.packageManager ?? 'npm'
  const type = args.type ?? 'block'
  let url: string
  if (type === 'tokens') {
    // Reading it proves the theme item exists rather than asserting it.
    await client.tokens()
    url = client.tokensUrl()
  }
  else {
    const bad = rejectBadId(args.name, type)
    if (bad)
      return bad
    const index = type === 'template' ? await client.templatesIndex() : await client.blocksIndex()
    if (!index.items.some(it => it.name === args.name)) {
      return {
        text: `${type === 'template' ? 'Template' : 'Block'} "${args.name}" is not in the dzup-ui registry (${index.items.length} ${type}s). Use list_${type}s to browse; no install command was produced.`,
        isError: true,
      }
    }
    url = type === 'template' ? client.templateUrl(args.name) : client.blockUrl(args.name)
  }

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

// ── Component metadata (TASK-N2-A2) ───────────────────────────────────────────
//
// Three tools, all answering from ONE artifact: the generated
// `component-meta.json` that `yarn generate:component-meta` extracts from the
// real `.vue` / `.types.ts` sources with `vue-component-meta`. Nothing here
// parses a component; nothing here synthesises an example.
//
// They deliberately do NOT replace `list_components` / `get_component`, which
// answer from the storybook `llms*.txt` projection in markdown. Those two used
// to be limited by `public-api.manifest.json`, which TASK-N2-A1 measured stale
// by 43 symbols (finding F-1). TASK-N2-A3 re-rendered that projection from THIS
// artifact, so all four tools now cover the same 144 public components; what
// differs is the shape of the answer — typed rows and verbatim story source
// here, prose there. Neither path reads `public-api.manifest.json` any more,
// and it was not regenerated to achieve that (constraint B3 still holds).

/** Cap on how many rows a search answer may contain. Bounded output, like every list tool. */
const META_SEARCH_LIMIT = 50

/** How a description came to exist, rendered for a reader that cares. */
function provenanceNote(source: string): string {
  return source === 'emits-interface' ? ' _(from the emits interface)_' : ''
}

export async function searchComponents(
  client: RegistryClient,
  args: { query?: string, family?: string, tier?: string } = {},
): Promise<ToolResult> {
  const artifact = await client.componentMeta()
  const all = artifact.components
  const rows = all.filter(
    c =>
      matches(args.family, c.family)
      && (args.tier === undefined || (c.tier ?? '').toLowerCase() === args.tier.toLowerCase())
      && matches(
        args.query,
        c.name,
        c.family,
        c.kind,
        c.parentComponent,
        c.status,
        ...c.props.map(p => `${p.name} ${p.description}`),
        ...c.slots.map(s => `${s.name} ${s.description}`),
        ...c.events.map(e => `${e.name} ${e.description}`),
      ),
  )
  if (!rows.length) {
    return {
      text:
        `No components matched (query=${args.query ?? '—'}, family=${args.family ?? '—'}, `
        + `tier=${args.tier ?? '—'}). ${all.length} components in the metadata artifact `
        + `(${artifact.totals.publicComponents} public, ${artifact.totals.compoundParts} compound parts).`,
    }
  }
  const shown = rows.slice(0, META_SEARCH_LIMIT)
  const parts: string[] = [
    `# Component search (${shown.length}${shown.length === rows.length ? '' : ` of ${rows.length} matched`}; ${all.length} total)`,
    '',
    'Call `get_component_metadata` for a full props/emits/slots record, or '
    + '`get_component_example` for real usage source from the component\'s Storybook story.',
    '',
  ]
  const byFamily = new Map<string, typeof shown>()
  for (const c of shown) {
    const list = byFamily.get(c.family) ?? []
    list.push(c)
    byFamily.set(c.family, list)
  }
  for (const family of [...byFamily.keys()].sort()) {
    parts.push(`## ${family}`)
    for (const c of byFamily.get(family)!) {
      const bits = [
        c.tier === undefined ? undefined : `tier ${c.tier}`,
        c.status,
        c.kind === 'compound-part' ? `part of ${c.parentComponent ?? '—'}` : undefined,
      ].filter(Boolean)
      parts.push(
        `- **${c.name}**${bits.length ? ` _(${bits.join(' · ')})_` : ''} — `
        + `${c.props.length} props, ${c.events.length} events, ${c.slots.length} slots`
        + `${c.stories.primary ? '' : ' · no published example'}`,
      )
    }
    parts.push('')
  }
  if (shown.length < rows.length)
    parts.push(`_${rows.length - shown.length} more matched; narrow the query._`)
  return { text: parts.join('\n').trimEnd() }
}

/** Markdown table rows, or an explicit `_none_`. Never an empty section. */
function metaTable(header: string[], rows: string[][]): string[] {
  if (!rows.length)
    return ['_none_', '']
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...rows.map(r => `| ${r.join(' | ')} |`),
    '',
  ]
}

/** Escape a cell so a type containing `|` cannot break the table. */
function cell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ')
}

export async function getComponentMetadata(
  client: RegistryClient,
  args: { name: string },
): Promise<ToolResult> {
  const record = await client.componentMetaFor(args.name)
  if (!record) {
    const artifact = await client.componentMeta()
    const needle = args.name.replace(/^dz/i, '').toLowerCase()
    const near = artifact.components
      .filter(c => c.name.toLowerCase().includes(needle))
      .slice(0, 8)
      .map(c => c.name)
    return {
      text:
        `Component "${args.name}" not found in the generated metadata artifact.`
        + `${near.length ? ` Did you mean: ${near.join(', ')}?` : ' Use search_components to browse.'}`,
      isError: true,
    }
  }

  const alt = record.subpaths.find(s => s !== '.')
  const parts: string[] = [
    `# ${record.name}`,
    '',
    `- **Import:** \`import { ${record.name} } from '@dzup-ui/core'\``
    + `${alt === undefined ? '' : ` (also \`@dzup-ui/core${alt.replace(/^\./, '')}\`)`}`,
    `- **Family:** ${record.family}${record.tier === undefined ? '' : ` · **Risk tier:** ${record.tier}`}`
    + `${record.status === undefined ? '' : ` · **Status:** ${record.status}`}`,
    `- **Kind:** ${record.kind}${record.parentComponent === undefined ? '' : ` of ${record.parentComponent}`}`,
    `- **Source:** \`${record.source}\``,
  ]
  if (record.anatomy.state === 'declared' && record.anatomy.parts.length) {
    parts.push(
      `- **Anatomy parts (ADR-19):** ${record.anatomy.parts.map(p => `\`${p}\``).join(', ')} — `
      + 'target them with the `ui` prop or `[data-part]`.',
    )
  }
  if (record.capability) {
    const cells = Object.entries(record.capability.cells).map(([state, n]) => `${n} ${state}`).join(', ')
    parts.push(
      `- **Evidence cells:** ${cells}`
      + `${record.capability.unrun.length ? ` · unrun: ${record.capability.unrun.join(', ')}` : ''}`,
    )
  }
  parts.push('')

  parts.push('## Props', '')
  parts.push(...metaTable(
    ['Prop', 'Type', 'Required', 'Default', 'Description'],
    record.props.map(p => [
      `\`${cell(p.name)}\``,
      `\`${cell(p.type)}\``,
      p.required ? 'yes' : 'no',
      p.default === null ? '—' : `\`${cell(p.default)}\``,
      cell(p.description) || '—',
    ]),
  ))
  if (record.globalPropCount > 0) {
    parts.push(
      `_Plus ${record.globalPropCount} global props Vue gives every component `
      + '(`key`, `ref`, `class`, `style`, native listeners…), not listed._',
      '',
    )
  }

  parts.push('## Events', '')
  parts.push(...metaTable(
    ['Event', 'Payload', 'Description'],
    record.events.map(e => [
      `\`${cell(e.name)}\``,
      `\`${cell(e.type)}\``,
      (cell(e.description) || (e.modelDerived ? '_synthesised by `defineModel`_' : '—'))
      + provenanceNote(e.descriptionSource),
    ]),
  ))

  parts.push('## Slots', '')
  parts.push(...metaTable(
    ['Slot', 'Slot props', 'Description'],
    record.slots.map(s => [
      `\`${cell(s.name)}\``,
      s.hasPayload ? `\`${cell(s.type)}\`` : '—',
      cell(s.description) || '—',
    ]),
  ))

  if (record.exposed.length) {
    parts.push('## Exposed (via template ref)', '')
    parts.push(...metaTable(
      ['Member', 'Type', 'Description'],
      record.exposed.map(x => [`\`${cell(x.name)}\``, `\`${cell(x.type)}\``, cell(x.description) || '—']),
    ))
  }

  parts.push(
    record.stories.primary === undefined
      ? '_No published Storybook story, so no usage example is available for this component._'
      : `Call \`get_component_example\` with \`${record.name}\` for real usage source `
        + `(story \`${record.stories.primary.id}\`).`,
  )
  return { text: parts.join('\n').trimEnd() }
}

export async function getComponentExample(
  client: RegistryClient,
  args: { name: string, story?: string },
): Promise<ToolResult> {
  const record = await client.componentMetaFor(args.name)
  if (!record) {
    return {
      text: `Component "${args.name}" not found in the generated metadata artifact. Use search_components to browse.`,
      isError: true,
    }
  }
  const primary = record.stories.primary
  if (primary === undefined || record.stories.file === undefined) {
    // The honest answer. An absent example is a fact about the catalog; a
    // fabricated one would be this server inventing source no lane has ever
    // run, in a package whose whole premise is that it reports only what the
    // repository generates.
    return {
      text:
        `${record.name} has no published Storybook story, so there is no real usage example to `
        + `return. Its full API is available from \`get_component_metadata\`. `
        + `This server never synthesises example markup.`,
      isError: true,
    }
  }
  if (args.story !== undefined && args.story !== primary.id) {
    const known = record.stories.stories.map(s => s.id)
    const hit = record.stories.stories.find(s => s.id === args.story)
    if (hit === undefined) {
      return {
        text: `${record.name} has no story "${args.story}". Stories: ${known.join(', ')}.`,
        isError: true,
      }
    }
    // The artifact publishes the SOURCE of the primary story only — one example
    // per component. Naming another story gets its location, never invented source.
    return {
      text:
        `# ${record.name} — story \`${hit.id}\`${hit.name === undefined ? '' : ` ("${hit.name}")`}\n\n`
        + `Source: \`${record.stories.file}\` lines ${hit.lines[0]}–${hit.lines[1]}.\n\n`
        + `Only the primary story's source is published in the metadata artifact. `
        + `The published example for ${record.name} is \`${primary.id}\` — call this tool without `
        + `\`story\` to get it.`,
    }
  }

  const parts: string[] = [
    `# ${record.name} — usage example`,
    '',
    `Real Storybook story \`${primary.id}\`${primary.name === undefined ? '' : ` ("${primary.name}")`} from `
    + `\`${record.stories.file}\` (lines ${primary.lines[0]}–${primary.lines[1]}), verbatim. Not synthesised.`,
    '',
  ]
  if (primary.template !== undefined)
    parts.push('## Markup', '', '```vue', primary.template.trim(), '```', '')
  parts.push('## Story source', '', '```ts', primary.source, '```', '')
  parts.push(
    `- **Import:** \`import { ${record.name} } from '@dzup-ui/core'\``,
    `- Other stories in the same file: ${
      record.stories.stories.filter(s => s.id !== primary.id).map(s => s.id).join(', ') || '_none_'
    }`,
  )
  return { text: parts.join('\n').trimEnd() }
}
