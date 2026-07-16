/**
 * AI-readable docs shaping — the pure transform from the `BLOCKS` catalog to the
 * markdown the build emits for assistants (docs/blocks.md §1.3, §3.3, Task G2).
 *
 * Three artifacts, all derived from the same `BlockDef[]`, following the
 * llmstxt.org convention (an H1, a `>` summary, then `##` sections):
 *   • `llms.txt`       — a concise, token-efficient INDEX: one bullet per block,
 *                        grouped by category, linking its live preview.
 *   • `llms-full.txt`  — the same index plus every block's fenced SFC source, so
 *                        an assistant can read the whole catalog in one fetch.
 *   • `r/<id>.md`      — one self-contained page per block (title, description,
 *                        components, deep link, fenced SFC) — also the payload
 *                        the Task G3 "copy as markdown" action serves.
 *
 * Like `registryItem.ts`, this module is intentionally runtime-free: it imports
 * `BlockDef` / `CategoryMeta` as *types* only (no `import.meta.glob`), so it
 * loads cleanly both in the bare Node generator and in the browser (the G3 copy
 * action reuses `blockMarkdown` so the served `.md` and the copied text can never
 * diverge). Callers pass the real `BLOCKS` / `CATEGORIES` values in.
 *
 * Markdown only, no HTML — markdown is ~6× cheaper than HTML per token
 * (docs/blocks.md §1.3), which is the whole point of the `llms.txt` convention.
 */

import type { BlockCategory, BlockDef, BlockSourceLookup, CategoryMeta } from './registry.ts'
import { REGISTRY_NAME } from './registryItem.ts'

/**
 * Root-relative deep link to a block — the per-block SEO page (`/blocks/<id>`),
 * which is also the URL the block's `<link rel="canonical">` declares. The two
 * must agree: AI crawlers are a first-class audience here, and pointing them at
 * the `/blocks#<id>` in-page anchor while canonicalising `/blocks/<id>` split
 * the block's identity across two URLs (TASK-FREE-08).
 */
export function blockDeepLink(id: string): string {
  return `/blocks/${id}`
}

/** Root-relative URL of a block's standalone markdown page (`/r/<id>.md`). */
export function blockMarkdownPath(id: string): string {
  return `/r/${id}.md`
}

/** Public-URL names of the two index files, served from `public/` verbatim. */
export const LLMS_TXT = 'llms.txt'
export const LLMS_FULL_TXT = 'llms-full.txt'

/** Catalog-wide one-line summary, rendered as the `>` blockquote under the H1. */
const CATALOG_SUMMARY
  = 'Ready-made UI blocks for Vue 3, composed purely from free @dzup-ui/core '
    + 'components and --dz-* design tokens — every block drops in already themed and '
    + 'accessible. Each entry links to its live preview and lists the real Dz* '
    + 'components it is built from.'

/**
 * Cross-link to the component-API index. These blocks are composed from
 * `@dzup-ui/core`; the library's own `llms.txt` (import paths, the frozen
 * variant/size/tone taxonomy, props/emits/slots) is generated separately and
 * served from the Storybook build at `/storybook/llms.txt`. Pointing assistants
 * at it lets them understand the primitives each block is built from.
 */
const COMPONENT_API_NOTE
  = 'These blocks are built from the @dzup-ui/core component library, whose full '
    + 'API (import paths, frozen variant/size/tone taxonomy, props/emits/slots) is '
    + 'documented at [/storybook/llms.txt](/storybook/llms.txt).'

/**
 * Pick a code-fence longer than any backtick run inside `source`, so an SFC that
 * itself contains ``` (rare, but possible in a template string) can never break
 * out of its fence. Minimum three, per CommonMark.
 */
function fence(source: string): string {
  let longest = 0
  for (const run of source.match(/`+/g) ?? []) {
    longest = Math.max(longest, run.length)
  }
  return '`'.repeat(Math.max(3, longest + 1))
}

/** The block's SFC wrapped in a `vue`-tagged fenced code block. */
function fencedSource(source: string): string {
  const f = fence(source)
  return `${f}vue\n${source.replace(/\n$/, '')}\n${f}`
}

/** `'## '.repeat`-style ATX heading prefix for a given level (clamped 1–6). */
function heading(level: number, text: string): string {
  return `${'#'.repeat(Math.min(6, Math.max(1, level)))} ${text}`
}

/** `[Title](/blocks/id): description — built from DzA, DzB` — one index bullet. */
export function blockIndexLine(block: BlockDef): string {
  const link = `[${block.title}](${blockDeepLink(block.id)})`
  return `- ${link}: ${block.description} — built from ${block.components.join(', ')}`
}

/** Blocks grouped in category order, skipping categories with no blocks. */
function groupByCategory(
  blocks: readonly BlockDef[],
  categories: readonly CategoryMeta[],
): Array<{ meta: CategoryMeta, blocks: BlockDef[] }> {
  const byCategory = new Map<BlockCategory, BlockDef[]>()
  for (const block of blocks) {
    const bucket = byCategory.get(block.category)
    if (bucket)
      bucket.push(block)
    else byCategory.set(block.category, [block])
  }
  return categories
    .map(meta => ({ meta, blocks: byCategory.get(meta.id) ?? [] }))
    .filter(group => group.blocks.length > 0)
}

/**
 * One block rendered as a markdown section: a `level`-deep heading, the
 * description, a metadata list (category, components, preview deep link) and the
 * fenced SFC. Shared by `r/<id>.md` (level 1, a standalone page) and
 * `llms-full.txt` (level 3, nested under its category).
 */
export function renderBlockSection(
  block: BlockDef,
  categoryLabel: string,
  level: number,
  getSource: BlockSourceLookup,
): string {
  return [
    heading(level, block.title),
    '',
    block.description,
    '',
    `- **Category:** ${categoryLabel}`,
    `- **Components:** ${block.components.join(', ')}`,
    `- **Preview:** ${blockDeepLink(block.id)}`,
    '',
    fencedSource(getSource(block)),
  ].join('\n')
}

/**
 * The standalone `r/<id>.md` page for one block — the payload the Task G3 "copy
 * as markdown" action serves, so it must be self-contained. `categories` is used
 * only to resolve the human category label.
 */
export function blockMarkdown(
  block: BlockDef,
  categories: readonly CategoryMeta[],
  getSource: BlockSourceLookup,
): string {
  const label = categories.find(c => c.id === block.category)?.label ?? block.category
  return `${renderBlockSection(block, label, 1, getSource)}\n`
}

/**
 * A ready-to-paste AI prompt for (re)generating one block (docs/blocks.md §1.3,
 * Task G3) — the payload the "copy as prompt" action serves. It points the
 * assistant at the catalog's `llms.txt` (so it can read the real `@dzup-ui/core`
 * docs) and restates the block's identity: title, description and the `Dz*`
 * components it is built from. `llmsTxtUrl` is the absolute URL the caller
 * resolves at runtime (the live origin in the browser). A trailing period on the
 * description is normalised so the sentence never doubles up its punctuation.
 */
export function blockPrompt(block: BlockDef, llmsTxtUrl: string): string {
  const description = block.description.replace(/[.\s]+$/, '')
  return (
    `Using dzup-ui docs at ${llmsTxtUrl}, generate this block: `
    + `${block.title} — ${description}. It is built from ${block.components.join(', ')}.`
  )
}

/**
 * `llms.txt` — the concise INDEX. H1 + summary blockquote + a usage note, then a
 * `##` section per non-empty category whose blurb introduces a bullet list of
 * its blocks. Deliberately carries no source (that bulk lives in `llms-full.txt`
 * and the per-block `.md` files), keeping this file cheap to load.
 */
export function llmsTxt(
  blocks: readonly BlockDef[],
  categories: readonly CategoryMeta[],
): string {
  const groups = groupByCategory(blocks, categories)
  const parts: string[] = [
    heading(1, `${REGISTRY_NAME} blocks`),
    '',
    `> ${CATALOG_SUMMARY}`,
    '',
    `${blocks.length} blocks across ${groups.length} categories. For each block's `
    + `full SFC source inline see [/${LLMS_FULL_TXT}](/${LLMS_FULL_TXT}); for a single `
    + `block fetch its markdown page at /r/<id>.md.`,
    '',
    COMPONENT_API_NOTE,
  ]
  for (const { meta, blocks: group } of groups) {
    parts.push(
      '',
      heading(2, meta.label),
      '',
      meta.blurb,
      '',
      group.map(block => blockIndexLine(block)).join('\n'),
    )
  }
  return `${parts.join('\n')}\n`
}

/**
 * `llms-full.txt` — the index expanded with every block's source. Same H1 +
 * summary, then a `##` section per category, each block a `###` subsection
 * carrying its metadata and fenced SFC (via `renderBlockSection`). One fetch
 * gives an assistant the entire catalog, code included.
 */
export function llmsFullTxt(
  blocks: readonly BlockDef[],
  categories: readonly CategoryMeta[],
  getSource: BlockSourceLookup,
): string {
  const groups = groupByCategory(blocks, categories)
  const parts: string[] = [
    heading(1, `${REGISTRY_NAME} blocks — full source`),
    '',
    `> ${CATALOG_SUMMARY}`,
    '',
    `${blocks.length} blocks across ${groups.length} categories, each with its `
    + `complete Vue SFC. For the index alone see [/${LLMS_TXT}](/${LLMS_TXT}).`,
    '',
    COMPONENT_API_NOTE,
  ]
  for (const { meta, blocks: group } of groups) {
    parts.push('', heading(2, meta.label), '', meta.blurb)
    for (const block of group) {
      parts.push('', renderBlockSection(block, meta.label, 3, getSource))
    }
  }
  return `${parts.join('\n')}\n`
}
