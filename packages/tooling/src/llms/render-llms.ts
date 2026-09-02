/**
 * The GENERATED half of `llms.txt` / `llms-full.txt` (TASK-N2-A3).
 *
 * Pure functions: artifact in, markdown out. No filesystem, no `.vue`, no
 * `.types.ts`, no TypeScript program. Everything is read from
 * `packages/core/docs/component-meta.json`, which constraint **B9** makes the
 * single component-API extraction in this repository.
 *
 * WHAT THIS REPLACES, AND WHY IT MATTERS
 *
 * `apps/storybook/scripts/build-llms.mjs` was a **second extractor**: 567 lines
 * that parsed `packages/contracts/src/*.types.ts` and every component's
 * `*.types.ts` with its own TypeScript AST walker, resolved `extends` chains and
 * generic parameters by hand, and read each `.vue` header with regexes. It also
 * drove its component roster from `public-api.manifest.json`, which TASK-N2-A1
 * measured **stale by 43 public components** (finding F1) — and because
 * `@dzup-ui/mcp`'s `list_components` / `get_component` answer out of the file it
 * produced, those 43 were invisible to every MCP client in production.
 *
 * Rendering from the artifact instead fixes both at once: one extractor, and a
 * roster driven by the ownership manifest.
 *
 * THE THREE THINGS A RENDERER MUST NOT GET WRONG (N2-A2 handoff §13)
 *
 *   1. **Declared vs effective defaults.** 487 props declare `undefined`
 *      because the ADR-20 provider supplies the value at runtime. The column is
 *      labelled "Declared default"; `null` prints `—`, the literal prints
 *      `undefined`. This file never prints `solid` for `DzButton.variant`,
 *      because nothing generated says that.
 *   2. **Where an event description came from.** 253 of 253 are recovered from
 *      the `Dz*Emits` interface, not from the extractor. The 71 events Vue
 *      synthesises from `defineModel` are labelled as such — a fact, not an
 *      apology — and the 35 authored-but-undescribed print `—`.
 *   3. **Examples are verbatim or absent.** Never synthesised.
 *
 * FORMAT IS A CONTRACT, NOT A STYLE CHOICE. `@dzup-ui/mcp` parses these files:
 * `parseComponentIndex` reads `## <Family>` headings and `- **DzName** — desc`
 * bullets with indented `  - ` detail lines; `extractComponentSection` slices
 * `### DzName` sections out of the full document. `validate:llms` re-parses the
 * rendered output with those same expectations, so a format change that would
 * break a shipped MCP client fails the gate instead.
 *
 * @module @dzup-ui/tooling/llms/render-llms
 */

import type { ComponentMetaArtifact, ComponentMetaRecord } from '../meta/component-meta.ts'
import {
  BLOCKS_INDEX_URL,
  COMPOUND_EXAMPLE_TEMPLATE,
  CONVENTIONS,
  CONVENTIONS_INTRO,
  FAMILY_LABELS,
  FAMILY_ORDER,
  FIDELITY_NOTE,
  FULL_FOOTER,
  FULL_TITLE,
  FULL_URL,
  INDEX_FOOTER,
  INDEX_TITLE,
  INDEX_URL,
  INSTALL_TEMPLATE,
  NO_API_NOTE,
  NO_EXAMPLE_NOTE,
  NO_MEMBERS_NOTE,
  PACKAGE,
  SUMMARY,
} from './llms-content.ts'

// ── Small formatting helpers ────────────────────────────────────────────────

/** Inline code, or `—` for an empty value. Never renders an empty cell. */
function code(value: string | null | undefined): string {
  return value === null || value === undefined || value === '' ? '—' : `\`${value}\``
}

/**
 * Escape a value for one Markdown table cell. Pipes are escaped (union types
 * are full of them), fences and newlines are removed — a stray fence inside a
 * table corrupts every downstream parse, which is the failure the structural
 * clause of `validate:llms` exists to catch.
 */
function cell(text: string): string {
  return text
    .replace(/\r?\n/g, ' ')
    .replace(/```/g, '')
    .replace(/\|/g, '\\|')
    .replace(/\s+/g, ' ')
    .trim()
}

/** A GFM table, or `''` when there is nothing to tabulate. */
function table(headers: string[], rows: string[][]): string {
  if (rows.length === 0)
    return ''
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(r => `| ${r.join(' | ')} |`),
  ].join('\n')
}

/**
 * A fence longer than any backtick run inside `source`, so a snippet that
 * itself contains ``` cannot break out. Minimum three, per CommonMark — the
 * same rule `apps/landing/src/blocks/llmsText.ts` applies to block sources.
 */
function fenceFor(source: string): string {
  let longest = 0
  for (const run of source.match(/`+/g) ?? [])
    longest = Math.max(longest, run.length)
  return '`'.repeat(Math.max(3, longest + 1))
}

/** Fenced code block with a language tag, using a safe fence length. */
function fenced(lang: string, source: string): string {
  const f = fenceFor(source)
  return `${f}${lang}\n${source.replace(/\n+$/, '')}\n${f}`
}

// ── Derivations from the artifact (never from source) ───────────────────────

/**
 * Expand a printed prop type to its ADR-02 taxonomy members.
 *
 * Two shapes occur. A named alias (`ButtonVariant | undefined`) is looked up in
 * the artifact's `taxonomies` map, which the extractor resolves from
 * `@dzup-ui/contracts` through the checker's own program. An inline union
 * (`"button" | "submit" | "reset" | undefined`) is read straight out of the
 * printed type, which is itself extractor output — no source is parsed here.
 * Returns `null` when the type is neither.
 */
export function taxonomyMembers(
  type: string,
  taxonomies: Record<string, string[]>,
): string[] | null {
  const base = type.replace(/\s*\|\s*undefined\s*$/, '').replace(/\s*\|\s*null\s*$/, '').trim()
  const named = taxonomies[base]
  if (named)
    return named
  if (/^(?:"[^"]*"|'[^']*')(?:\s*\|\s*(?:"[^"]*"|'[^']*'))*$/.test(base)) {
    return [...base.matchAll(/["']([^"']*)["']/g)].map(m => m[1]!)
  }
  return null
}

/** `variant: … · size: … · tone: …`, or `''` when the component has no taxonomy props. */
export function taxonomyLine(
  record: ComponentMetaRecord,
  taxonomies: Record<string, string[]>,
): string {
  const parts: string[] = []
  for (const name of ['variant', 'size', 'tone'] as const) {
    const prop = record.props.find(p => p.name === name)
    if (!prop)
      continue
    const members = taxonomyMembers(prop.type, taxonomies)
    if (members && members.length > 0)
      parts.push(`${name}: ${members.map(v => `\`${v}\``).join(' ')}`)
  }
  return parts.join(' · ')
}

/**
 * The component's v-model bindings, derived from the artifact alone.
 *
 * A binding exists when the component emits `update:<x>` **and** declares a
 * prop named `<x>`. Requiring both is deliberate: `modelDerived` in the
 * artifact means "the event name starts with `update:`", which is not by itself
 * enough to promise a consumer that `v-model:<x>` binds to anything.
 */
export function modelBindings(record: ComponentMetaRecord): Array<{ name: string, type: string }> {
  const props = new Map(record.props.map(p => [p.name, p.type]))
  const out: Array<{ name: string, type: string }> = []
  for (const event of record.events) {
    if (!event.name.startsWith('update:'))
      continue
    const key = event.name.slice('update:'.length)
    const propType = props.get(key)
    if (propType === undefined)
      continue
    out.push({ name: key, type: propType })
  }
  return out
}

/** `v-model` for `modelValue`, `v-model:name` otherwise. */
function modelLabel(name: string): string {
  return name === 'modelValue' ? '`v-model`' : `\`v-model:${name}\``
}

/**
 * Prop names declared by the component itself — `declaredIn` equal to its own
 * `.types.ts`. Falls back to every prop when the extractor resolved no
 * declaring file (70 props catalog-wide), so a component is never listed as
 * having no props when it has some.
 */
export function ownPropNames(record: ComponentMetaRecord): string[] {
  const own = record.props.filter(p => p.declaredIn !== undefined && p.declaredIn === record.typesSource)
  return (own.length > 0 ? own : record.props).map(p => p.name)
}

/** How many of a component's props come from `@dzup-ui/contracts`. */
export function inheritedPropCount(record: ComponentMetaRecord): number {
  return record.props.filter(p => p.declaredIn?.startsWith('packages/contracts/') === true).length
}

/**
 * The event's description, or an explicit statement of why there is none.
 * Reads `descriptionSource`, per the N2-A2 handoff §13 rule.
 */
export function eventDescription(event: ComponentMetaRecord['events'][number]): string {
  if (event.description !== '')
    return event.description
  if (event.modelDerived)
    return 'synthesised by `defineModel` (ADR-16) — no authored description exists'
  return ''
}

// ── Sorting ─────────────────────────────────────────────────────────────────

/**
 * Families in curated order, each with its components sorted public-first then
 * by name. Determinism is a property of the output, so every ordering here is
 * total and locale-pinned.
 */
export function groupByFamily(
  components: readonly ComponentMetaRecord[],
): Array<{ key: string, label: string, components: ComponentMetaRecord[] }> {
  const byFamily = new Map<string, ComponentMetaRecord[]>()
  for (const c of components) {
    const bucket = byFamily.get(c.family)
    if (bucket)
      bucket.push(c)
    else byFamily.set(c.family, [c])
  }
  const keys = [
    ...FAMILY_ORDER.filter(k => byFamily.has(k)),
    ...[...byFamily.keys()].filter(k => !FAMILY_ORDER.includes(k)).sort((a, b) => a.localeCompare(b, 'en')),
  ]
  return keys.map(key => ({
    key,
    label: FAMILY_LABELS[key] ?? key,
    components: byFamily.get(key)!.sort((a, b) => {
      if (a.kind !== b.kind)
        return a.kind === 'public-component' ? -1 : 1
      return a.name.localeCompare(b.name, 'en')
    }),
  }))
}

// ── Shared header ───────────────────────────────────────────────────────────

/**
 * Conventions section. The two taxonomy bullets are generated from the
 * artifact; every other bullet is curated prose with no facts in it.
 */
function conventions(artifact: ComponentMetaArtifact): string[] {
  const size = artifact.taxonomies.CanonicalSize ?? []
  const tone = artifact.taxonomies.CanonicalTone ?? []
  return [
    '## Conventions',
    '',
    CONVENTIONS_INTRO,
    '',
    ...CONVENTIONS.map(c => `- ${c}`),
    `- **Frozen taxonomies (ADR-02)** — \`size\`, \`tone\` and each family's \`variant\` union are`
    + ` fixed contracts:`,
    `  - size: ${size.map(v => `\`${v}\``).join(' ')}`,
    `  - tone: ${tone.map(v => `\`${v}\``).join(' ')}`,
    '',
  ]
}

/** The stats line. Every number in it is read out of the artifact's own totals. */
function statsLine(artifact: ComponentMetaArtifact, families: number, other: string): string {
  const t = artifact.totals
  return (
    `${t.publicComponents} public components and ${t.compoundParts} compound sub-parts across `
    + `${families} families, extracted from source by \`${artifact.extractor}\`. ${other}`
  )
}

// ── The concise index ───────────────────────────────────────────────────────

/**
 * `llms.txt` — one bullet per component with its description, own prop names,
 * frozen taxonomy and v-model bindings. No tables, no snippets: this file is
 * the cheap one an agent loads first.
 */
export function renderIndex(artifact: ComponentMetaArtifact): string {
  const groups = groupByFamily(artifact.components)
  const lines: string[] = [
    `# ${INDEX_TITLE}`,
    '',
    `> ${SUMMARY}`,
    '',
    statsLine(
      artifact,
      groups.length,
      `This is the index; for full props / events / slots tables plus a usage snippet per `
      + `component see [${FULL_URL}](${FULL_URL}).`,
    ),
    '',
    ...conventions(artifact),
  ]

  for (const group of groups) {
    lines.push(`## ${group.label}`, '')
    for (const c of group.components) {
      const desc = c.description === '' ? '' : ` — ${c.description}`
      lines.push(`- **${c.name}**${desc}`)
      const detail: string[] = []
      if (c.kind === 'compound-part' && c.parentComponent !== undefined)
        detail.push(`part of \`${c.parentComponent}\``)
      const props = ownPropNames(c)
      if (props.length > 0)
        detail.push(`props: ${props.map(p => `\`${p}\``).join(', ')}`)
      const tax = taxonomyLine(c, artifact.taxonomies)
      if (tax !== '')
        detail.push(tax)
      const models = modelBindings(c)
      if (models.length > 0)
        detail.push(`v-model: ${models.map(m => modelLabel(m.name)).join(', ')}`)
      if (c.anatomy.state === 'declared' && c.anatomy.parts.length > 0)
        detail.push(`parts (ADR-19): ${c.anatomy.parts.map(p => `\`${p}\``).join(', ')}`)
      for (const d of detail)
        lines.push(`  - ${d}`)
    }
    lines.push('')
  }

  lines.push('---', '', INDEX_FOOTER, '')
  return lines.join('\n')
}

// ── The full document ───────────────────────────────────────────────────────

/**
 * Presentation knobs for {@link renderComponentSection}.
 *
 * Added by TASK-N2-D1, which reuses this function as the docs site's
 * per-component page rather than writing a second renderer (constraint **B9**,
 * and the N2-A3 handoff §14 seam, which asked for exactly this shape: "a
 * `level` parameter added here — one line, and preferable, because it keeps the
 * shape in one place").
 *
 * **Every default reproduces `llms-full.txt` byte for byte.** That is asserted
 * two ways: `render-llms.spec.ts` drives the defaults, and `validate:llms`
 * re-renders the committed documents and compares bytes.
 */
export interface ComponentSectionOptions {
  /** Heading level for the component's own heading. Default `3` — `### DzName`, as `llms-full.txt` uses. */
  level?: number
  /**
   * When a number, member groups render as headings at that level
   * (`## Props`) instead of the inline bold label (`**Props** (12):`).
   *
   * `llms-full.txt` keeps the bold label (default `null`) because the document
   * is one long list and `@dzup-ui/mcp`'s `extractComponentSection` slices it on
   * `###` boundaries — introducing `##` inside a component's own section would
   * change what a shipped MCP client parses. A standalone docs page has no such
   * constraint and wants real headings so the page can carry an outline.
   */
  memberHeadingLevel?: number | null
}

/** One component's `### DzName` section in `llms-full.txt`. */
export function renderComponentSection(
  record: ComponentMetaRecord,
  artifact: ComponentMetaArtifact,
  options: ComponentSectionOptions = {},
): string[] {
  const hash = '#'.repeat(options.level ?? 3)
  const memberLevel = options.memberHeadingLevel ?? null
  /** `**Props** (12):` by default, `## Props (12)` when a member heading level is set. */
  const group = (label: string, detail: string): string =>
    memberLevel === null
      ? `**${label}** (${detail}):`
      : `${'#'.repeat(memberLevel)} ${label} (${detail})`
  const lines: string[] = [`${hash} ${record.name}`, '']
  if (record.description !== '')
    lines.push(record.description, '')

  const meta: string[] = [
    `- **Install:** ${INSTALL_TEMPLATE.replace('{name}', record.name)}`,
  ]
  if (record.subpaths.length > 0) {
    meta.push(`- **Entry points:** ${record.subpaths
      .map(s => `\`${s === '.' ? PACKAGE : `${PACKAGE}${s.replace(/^\./, '')}`}\``)
      .join(', ')}`)
  }
  if (record.kind === 'compound-part' && record.parentComponent !== undefined)
    meta.push(`- **Compound part of:** \`${record.parentComponent}\``)
  if (record.tier !== undefined)
    meta.push(`- **Risk tier:** ${record.tier}${record.status === undefined ? '' : ` · **Status:** ${record.status}`}`)
  else if (record.status !== undefined)
    meta.push(`- **Status:** ${record.status}`)
  const tax = taxonomyLine(record, artifact.taxonomies)
  if (tax !== '')
    meta.push(`- **Taxonomy:** ${tax}`)
  const models = modelBindings(record)
  if (models.length > 0) {
    meta.push(`- **v-model:** ${models
      .map(m => `${modelLabel(m.name)} (\`${m.type}\`)`)
      .join(', ')}`)
  }
  if (record.anatomy.state === 'declared' && record.anatomy.parts.length > 0)
    meta.push(`- **Anatomy parts (ADR-19):** ${record.anatomy.parts.map(p => `\`${p}\``).join(', ')}`)
  lines.push(...meta, '')

  // Props — the one table where the declared/effective distinction is load-bearing.
  if (record.props.length > 0) {
    const inherited = inheritedPropCount(record)
    lines.push(
      group('Props', `${record.props.length}${inherited === 0 ? '' : `, of which ${inherited} inherited from \`@dzup-ui/contracts\``}`),
      '',
      table(
        ['Prop', 'Type', 'Required', 'Declared default', 'Description'],
        record.props.map(p => [
          code(p.name),
          code(cell(p.type)),
          p.required ? 'yes' : 'no',
          code(p.default === null ? null : cell(p.default)),
          cell(p.deprecated === undefined ? p.description : `**Deprecated:** ${p.deprecated}. ${p.description}`) || '—',
        ]),
      ),
      '',
    )
  }

  if (record.events.length > 0) {
    lines.push(
      group('Events', String(record.events.length)),
      '',
      table(
        ['Event', 'Payload', 'Description'],
        record.events.map(e => [
          code(e.name),
          code(cell(e.type)),
          cell(eventDescription(e)) || '—',
        ]),
      ),
      '',
    )
  }

  if (record.slots.length > 0) {
    lines.push(
      group('Slots', String(record.slots.length)),
      '',
      table(
        ['Slot', 'Slot props', 'Description'],
        record.slots.map(s => [
          code(s.name),
          s.hasPayload ? code(cell(s.type)) : '—',
          cell(s.description) || '—',
        ]),
      ),
      '',
    )
  }

  // `defineExpose` members: names and types only. All 26 in the catalog are
  // undocumented (N2-A2 finding F-2), so the description column is omitted
  // rather than rendered as empty cells.
  if (record.exposed.length > 0) {
    lines.push(
      group('Exposed on `ref`', String(record.exposed.length)),
      '',
      table(
        ['Member', 'Type'],
        record.exposed.map(x => [code(x.name), code(cell(x.type))]),
      ),
      '',
    )
  }

  // An empty member set is stated, never left silent — a section that simply
  // omits the tables reads as "this component takes nothing", which is a claim.
  // Which claim is true depends on whether the component declares an API at
  // all: `typesSource` present means it does and the extractor failed to read
  // it (an extraction gap); absent means it is a bare sub-part that really
  // declares nothing. Publishing the wrong one of those is the failure mode
  // this whole document exists to avoid, so they are different sentences.
  if (record.props.length === 0 && record.events.length === 0 && record.slots.length === 0)
    lines.push(record.typesSource === undefined ? NO_API_NOTE : NO_MEMBERS_NOTE, '')

  // Usage — verbatim story source, or an explicit absence.
  const primary = record.stories.primary
  if (primary?.template !== undefined && primary.template !== '') {
    lines.push(
      group('Usage', `from \`${record.stories.file}\`, story \`${primary.id}\``),
      '',
      fenced('vue', primary.template),
      '',
    )
  }
  else if (primary !== undefined) {
    lines.push(
      group('Usage', `verbatim story source from \`${record.stories.file}\`, story \`${primary.id}\``),
      '',
      fenced('ts', primary.source),
      '',
    )
  }
  else if (record.kind === 'compound-part' && record.parentComponent !== undefined) {
    lines.push(COMPOUND_EXAMPLE_TEMPLATE.replace('{parent}', record.parentComponent), '')
  }
  else {
    lines.push(NO_EXAMPLE_NOTE, '')
  }

  return lines
}

/** `llms-full.txt` — the index expanded to a full API section per component. */
export function renderFull(artifact: ComponentMetaArtifact): string {
  const groups = groupByFamily(artifact.components)
  const lines: string[] = [
    `# ${FULL_TITLE}`,
    '',
    `> ${SUMMARY}`,
    '',
    statsLine(
      artifact,
      groups.length,
      `Each carries its full props / events / slots tables and a usage snippet. For the index `
      + `alone see [${INDEX_URL}](${INDEX_URL}); the ready-made blocks catalog is at `
      + `[${BLOCKS_INDEX_URL}](${BLOCKS_INDEX_URL}).`,
    ),
    '',
    FIDELITY_NOTE,
    '',
    ...conventions(artifact),
  ]

  for (const group of groups) {
    lines.push(`## ${group.label}`, '')
    for (const c of group.components)
      lines.push(...renderComponentSection(c, artifact))
  }

  lines.push('---', '', FULL_FOOTER, '')
  return lines.join('\n')
}
