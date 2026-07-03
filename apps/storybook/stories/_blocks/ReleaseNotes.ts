/**
 * Reusable MDX doc-blocks for the "What's New" / Releases page (TASK-APP-07).
 *
 * Renders the data emitted by `scripts/build-releases.mjs` (imported in
 * `Releases.mdx` from `_data/releases.generated.ts`) as grouped, colour-coded
 * release notes. Authored with `createElement` (no JSX) so it compiles without a
 * React-JSX transform in the Storybook Vite pipeline — same approach as
 * `DoDont` / `StatusBadge` / `DocTable`.
 *
 * Colour conventions mirror the badge accents used elsewhere in the docs
 * (`StatusBadge`, `DoDont`): each changelog category gets a distinct accent, and
 * the surrounding chrome uses `--dz-*` tokens so it adapts to light/dark. The
 * `HighlightsCallout` pulls deprecations and breaking changes to the very top so
 * they are impossible to miss.
 */
import { createElement as h, Fragment, type ReactNode } from 'react'
import type {
  Highlight,
  PendingChange,
  Release,
  ReleaseEntry,
} from '../_data/releases.generated.ts'

/** Per-category accent — keyed by the `### ` section name from the changelog. */
interface CategoryMeta {
  color: string
  icon: string
}

const CATEGORY: Record<string, CategoryMeta> = {
  Breaking: { color: '#b91c1c', icon: '💥' },
  Deprecated: { color: '#b45309', icon: '⚠️' },
  Removed: { color: '#b91c1c', icon: '🗑️' },
  Security: { color: '#7c3aed', icon: '🔒' },
  Added: { color: '#15803d', icon: '✨' },
  Changed: { color: '#1d4ed8', icon: '🔧' },
  Fixed: { color: '#0f766e', icon: '🐛' },
}

const FALLBACK: CategoryMeta = { color: '#6b7280', icon: '•' }

function metaFor(name: string): CategoryMeta {
  return CATEGORY[name] ?? FALLBACK
}

/** Tint a hex accent for use as a subtle background. */
function tint(color: string, pct = 10): string {
  return `color-mix(in oklch, ${color} ${pct}%, transparent)`
}

const CSS = `
.dz-releases { margin: 8px 0; color: var(--dz-foreground); }
.dz-releases ul { margin: 6px 0 0; padding-left: 20px; }
.dz-releases li { margin: 3px 0; line-height: 1.55; }
.dz-releases .dz-rel-author { color: var(--dz-muted-foreground); font-size: 0.85em; }
.dz-rel-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; border-radius: 6px; padding: 2px 8px; }
.dz-rel-inline-tag { display: inline-block; margin-left: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; border-radius: 4px; padding: 0 5px; vertical-align: middle; }
.dz-rel-release { border: 1px solid var(--dz-border); border-radius: 10px; padding: 14px 16px; margin: 14px 0; background: color-mix(in oklch, var(--dz-muted) 30%, transparent); }
.dz-rel-release > header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
.dz-rel-date { font-size: 16px; font-weight: 700; }
.dz-rel-count { color: var(--dz-muted-foreground); font-size: 12px; white-space: nowrap; }
.dz-rel-section { margin-top: 12px; }
.dz-rel-callout { border: 1px solid; border-radius: 10px; padding: 14px 16px; margin: 16px 0; }
.dz-rel-callout h3 { margin: 0 0 8px; font-size: 15px; }
.dz-rel-callout ul { margin: 0; padding-left: 18px; }
.dz-rel-callout li { margin: 6px 0; line-height: 1.5; }
.dz-rel-src { color: var(--dz-muted-foreground); font-size: 0.82em; }
`

/**
 * Emit the shared stylesheet. Rendered by each block (like `DocTable`); the
 * duplicate identical `<style>` tags are harmless and avoid a module-level
 * mount-guard that React could unmount on re-render.
 */
function Styles() {
  return h('style', { key: 'dz-rel-css' }, CSS)
}

/** A coloured category pill (Added / Changed / Fixed / Deprecated / …). */
export function SectionChip({ name }: { name: string }) {
  const m = metaFor(name)
  return h(
    'span',
    { className: 'dz-rel-chip', style: { color: m.color, background: tint(m.color, 12), border: `1px solid ${tint(m.color, 40)}` } },
    [h('span', { key: 'i', 'aria-hidden': 'true' }, m.icon), h('span', { key: 't' }, name)],
  )
}

function EntryItem({ entry }: { entry: ReleaseEntry }) {
  const tags: ReactNode[] = []
  if (entry.breaking)
    tags.push(h('span', { key: 'b', className: 'dz-rel-inline-tag', style: { color: CATEGORY.Breaking.color, border: `1px solid ${CATEGORY.Breaking.color}` } }, 'breaking'))
  if (entry.deprecated)
    tags.push(h('span', { key: 'd', className: 'dz-rel-inline-tag', style: { color: CATEGORY.Deprecated.color, border: `1px solid ${CATEGORY.Deprecated.color}` } }, 'deprecated'))

  return h('li', null, [
    h(Fragment, { key: 'txt' }, entry.text),
    ...tags,
    entry.author ? h('span', { key: 'a', className: 'dz-rel-author' }, ` — ${entry.author}`) : null,
  ])
}

/** One release: its date heading and every category section beneath it. */
export function ReleaseCard({ release }: { release: Release }) {
  return h('div', { className: 'dz-rel-release' }, [
    h('header', { key: 'h' }, [
      h('span', { key: 'd', className: 'dz-rel-date' }, release.date),
      h('span', { key: 'c', className: 'dz-rel-count' }, `${release.entryCount} change${release.entryCount === 1 ? '' : 's'}`),
    ]),
    ...release.sections.map(section =>
      h('div', { key: section.name, className: 'dz-rel-section' }, [
        h(SectionChip, { key: 'chip', name: section.name }),
        h('ul', { key: 'list' }, section.entries.map((e, i) => h(EntryItem, { key: i, entry: e }))),
      ]),
    ),
  ])
}

/** The full, most-recent-first release timeline. */
export function ReleaseList({ releases }: { releases: Release[] }) {
  return h('div', { className: 'dz-releases' }, [
    h(Styles, { key: 'css' }),
    ...releases.map((r, i) => h(ReleaseCard, { key: i, release: r })),
  ])
}

/**
 * Deprecations & breaking changes pulled to the top — the single most important
 * thing a docs visitor evaluating an upgrade needs to see.
 */
export function HighlightsCallout({ highlights }: { highlights: Highlight[] }) {
  if (highlights.length === 0) {
    const c = CATEGORY.Added
    return h('div', { className: 'dz-releases' }, [
      h(Styles, { key: 'css' }),
      h('div', { key: 'ok', className: 'dz-rel-callout', style: { borderColor: tint(c.color, 45), background: tint(c.color, 8) } }, [
        h('h3', { key: 't', style: { color: c.color } }, '✅ No deprecations or breaking changes announced'),
        h('p', { key: 'p', style: { margin: 0 } }, 'Every published API is on a supported track. Upgrade with confidence.'),
      ]),
    ])
  }

  const accent = CATEGORY.Deprecated.color
  return h('div', { className: 'dz-releases' }, [
    h(Styles, { key: 'css' }),
    h('div', { key: 'box', className: 'dz-rel-callout', style: { borderColor: tint(accent, 55), background: tint(accent, 8) } }, [
      h('h3', { key: 't', style: { color: accent } }, '⚠️ Deprecations & breaking changes'),
      h('ul', { key: 'l' }, highlights.map((hl, i) => {
        const m = metaFor(hl.kind === 'breaking' ? 'Breaking' : 'Deprecated')
        return h('li', { key: i }, [
          h('span', { key: 'k', className: 'dz-rel-inline-tag', style: { color: m.color, border: `1px solid ${m.color}` } }, hl.kind),
          ' ',
          h(Fragment, { key: 'txt' }, hl.text),
          h('span', { key: 's', className: 'dz-rel-src' }, ` (${hl.date})`),
        ])
      })),
    ]),
  ])
}

const LEVEL_COLOR: Record<PendingChange['level'], string> = {
  major: CATEGORY.Breaking.color,
  minor: CATEGORY.Added.color,
  patch: CATEGORY.Fixed.color,
}

/** Unreleased changes staged as `.changeset` entries but not yet versioned. */
export function PendingSection({ pending }: { pending: PendingChange[] }) {
  if (pending.length === 0)
    return null

  return h('div', { className: 'dz-releases' }, [
    h(Styles, { key: 'css' }),
    h('div', { key: 'box', className: 'dz-rel-release', style: { borderStyle: 'dashed' } }, [
      h('header', { key: 'h' }, [
        h('span', { key: 'd', className: 'dz-rel-date' }, 'Unreleased'),
        h('span', { key: 'c', className: 'dz-rel-count' }, `${pending.length} pending change${pending.length === 1 ? '' : 's'}`),
      ]),
      h('ul', { key: 'l' }, pending.map((p, i) => {
        const color = LEVEL_COLOR[p.level]
        return h('li', { key: i }, [
          h('span', { key: 'lvl', className: 'dz-rel-inline-tag', style: { color, border: `1px solid ${color}` } }, p.level),
          ' ',
          h('span', { key: 'pkg', className: 'dz-rel-author' }, `${p.packages.join(', ')}: `),
          h(Fragment, { key: 'sum' }, p.summary),
        ])
      })),
    ]),
  ])
}
