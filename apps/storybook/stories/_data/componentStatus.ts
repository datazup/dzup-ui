/**
 * Live component-status matrix data (TASK-APP-06).
 *
 * The maturity taxonomy already exists in `_shared/status.ts` and is applied per
 * component as a `status:*` Storybook tag on each story `meta`. The other trust
 * signals — a `play()` interaction test, per-family a11y enforcement (TASK-APP-02),
 * and a Figma `design` parameter (TASK-APP-05) — are likewise declared inline in
 * the story files. This helper aggregates all four into a single matrix so the
 * `ComponentStatus.mdx` dashboard never drifts from the real stories.
 *
 * **Why parse raw source instead of importing the modules?** Executing all ~165
 * story modules into one docs chunk would pull in every component + icon import
 * for a page that only needs metadata. Vite's `import.meta.glob(..., '?raw')`
 * (same pattern as `apps/landing/src/templates/rawSources.ts`) hands us each file
 * as *text*, eagerly, so the matrix builds synchronously at render with no runtime
 * component cost. The signals we read are simple, stable literals (`title`,
 * `status:*` tag, `play:`, `design: {`, `a11yError`), so a targeted scan is robust.
 */
import {
  STATUS_BADGES,
  type ComponentStatus,
} from '../../../../packages/core/stories/_shared/status.ts'

// Vite injects `import.meta.glob`; the Storybook tsconfig doesn't pull in
// `vite/client` types, so narrow `import.meta` to just the shape we use.
const viteMeta = import.meta as unknown as {
  glob: (pattern: string, opts: { query: string, import: string, eager: true }) => Record<string, string>
}

/** Every core story file as raw text, keyed by its glob-relative path. */
const RAW_SOURCES = viteMeta.glob('../../../../packages/core/stories/**/*.stories.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** One component's row in the status matrix. */
export interface StatusRow {
  /** Component name — the last segment of the story `title` (e.g. `DzButton`). */
  component: string
  /** Family — the second `title` segment (e.g. `Buttons`). */
  family: string
  /** Declared maturity, or `undefined` if the file carries no `status:*` tag. */
  status: ComponentStatus | undefined
  /** True when at least one story in the file defines a `play()` interaction test. */
  hasPlay: boolean
  /** True when the file opts its stories into a11y CI-gating (`a11yError`). */
  a11yEnforced: boolean
  /** Figma URL from a `design` parameter, if one is wired. */
  design?: string
  /** Migration guidance — only populated for `deprecated` components. */
  migration?: string
}

/** Canonical family order — mirrors `preview.ts` storySort. Unknowns append. */
const FAMILY_ORDER = [
  'Buttons', 'Inputs', 'Forms', 'Cards', 'Data', 'Feedback',
  'Layout', 'Navigation', 'Overlays', 'Media', 'Typography', 'Compositions',
]

function match1(source: string, re: RegExp): string | undefined {
  const m = source.match(re)
  return m?.[1]
}

/** Parse one story file's raw text into a matrix row, or `null` if untitled. */
function parseRow(source: string): StatusRow | null {
  const title = match1(source, /title:\s*['"]([^'"]+)['"]/)
  if (!title)
    return null
  const segments = title.split('/')
  // Only aggregate real component stories: `Core/<Family>/<Component>`.
  if (segments[0] !== 'Core' || segments.length < 3)
    return null

  const family = segments[1]!
  const component = segments[segments.length - 1]!

  const statusValue = match1(source, /status:(experimental|beta|stable|deprecated)/) as
    | ComponentStatus
    | undefined
  const status = statusValue && statusValue in STATUS_BADGES ? statusValue : undefined

  // A `play:` on any story (meta or export) means the file ships an interaction test.
  const hasPlay = /\bplay\s*:\s*(?:async\b|\()/.test(source)

  // Family a11y enforcement is opted-in by spreading `a11yError` (or an inline
  // `a11y: { test: 'error' }`) into the story meta parameters.
  const a11yEnforced = /\ba11yError\b/.test(source)
    || /a11y:\s*\{[^}]*test:\s*['"]error['"]/.test(source)

  // Figma link via the design addon convention: `design: { type: 'figma', url }`.
  const design = match1(source, /design:\s*\{[^}]*url:\s*['"]([^'"]+)['"]/)

  // Migration path for a deprecated component: a `migration:` parameter string,
  // else the text after an `@deprecated` JSDoc tag, else a generic pointer.
  let migration: string | undefined
  if (status === 'deprecated') {
    migration = match1(source, /migration:\s*['"]([^'"]+)['"]/)
      ?? match1(source, /@deprecated\s+([^\n*]+?)\s*(?:\n|\*\/)/)?.trim()
      ?? 'See the component docs page for the replacement.'
  }

  return { component, family, status, hasPlay, a11yEnforced, design, migration }
}

/** The full matrix, sorted by canonical family then component name. */
export const STATUS_ROWS: StatusRow[] = Object.values(RAW_SOURCES)
  .map(parseRow)
  .filter((r): r is StatusRow => r !== null)
  .sort((a, b) => {
    const fa = FAMILY_ORDER.indexOf(a.family)
    const fb = FAMILY_ORDER.indexOf(b.family)
    const ra = fa === -1 ? FAMILY_ORDER.length : fa
    const rb = fb === -1 ? FAMILY_ORDER.length : fb
    return ra - rb || a.family.localeCompare(b.family) || a.component.localeCompare(b.component)
  })

/** Ordered list of the families actually present in the matrix. */
export const FAMILIES: string[] = [...new Set(STATUS_ROWS.map(r => r.family))]

/** All statuses in badge order, for stable summary/legend rendering. */
export const STATUS_ORDER: ComponentStatus[] = ['stable', 'beta', 'experimental', 'deprecated']

/** Count of components per status (undeclared components counted separately). */
export const STATUS_COUNTS: Record<ComponentStatus, number> = {
  experimental: 0,
  beta: 0,
  stable: 0,
  deprecated: 0,
}
for (const row of STATUS_ROWS) {
  if (row.status)
    STATUS_COUNTS[row.status] += 1
}

/** Number of components with a `status:*` tag missing entirely. */
export const UNTAGGED_COUNT: number = STATUS_ROWS.filter(r => !r.status).length

/** Per-family rollup: total plus a per-status breakdown and a11y enforcement. */
export interface FamilySummary {
  family: string
  total: number
  byStatus: Record<ComponentStatus, number>
  /** True only when every component in the family is a11y-enforced. */
  a11yEnforced: boolean
}

export const FAMILY_SUMMARIES: FamilySummary[] = FAMILIES.map((family) => {
  const rows = STATUS_ROWS.filter(r => r.family === family)
  const byStatus: Record<ComponentStatus, number> = {
    experimental: 0,
    beta: 0,
    stable: 0,
    deprecated: 0,
  }
  for (const row of rows) {
    if (row.status)
      byStatus[row.status] += 1
  }
  return {
    family,
    total: rows.length,
    byStatus,
    a11yEnforced: rows.length > 0 && rows.every(r => r.a11yEnforced),
  }
})

/** Deprecated components, with their migration path — the built-in upgrade guide. */
export const DEPRECATED_ROWS: StatusRow[] = STATUS_ROWS.filter(r => r.status === 'deprecated')

/** Total number of components in the matrix. */
export const TOTAL_COUNT: number = STATUS_ROWS.length
