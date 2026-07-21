/**
 * Build-time raw-source resolver for the template Code tab (docs/templates.md
 * §2 #7). Vite's `import.meta.glob(..., { query: '?raw' })` turns every template
 * file into a lazily-imported text chunk, so the detail page can show the real,
 * highlighted source without a hand-maintained per-slug map and without bundling
 * 25 templates' worth of text into the page (each `load()` pulls its own chunk).
 *
 * Keying: the glob lives in `templates/`, so its keys are dir-relative
 * (`./analytics-dashboard/AnalyticsDashboard.vue`). We normalise them to the
 * repo-root form the registry stores in `TemplateMeta.source`
 * (`apps/landing/src/templates/analytics-dashboard/AnalyticsDashboard.vue`) so a
 * template resolves purely from its `source` path. A miss (unknown/renamed file)
 * returns no entry rather than throwing — the page degrades to "source
 * unavailable" instead of crashing.
 */

/** The repo-root prefix every registry `source` path carries. */
const SOURCE_ROOT = 'apps/landing/src/templates/'

/**
 * Lazy raw text of every template `.vue` and co-located `.ts` (one dir deep, so
 * `registry.ts`/this file are excluded). Each value is a thunk returning the
 * file's text — calling it loads that file's `?raw` chunk on demand.
 */
const rawGlob = import.meta.glob('./*/*.{vue,ts}', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

/** Glob keys normalised to the registry's repo-root `source` shape. */
const BY_SOURCE: Record<string, () => Promise<string>> = Object.fromEntries(
  Object.entries(rawGlob).map(([rel, load]) => [rel.replace(/^\.\//, SOURCE_ROOT), load]),
)

/** A code-tab language label DzCodeBlock can hint highlighting from. */
export type RawLanguage = 'vue' | 'typescript'

/** One resolved source file ready to render in a DzCodeBlock. */
export interface TemplateRawFile {
  /** Bare filename for the block header, e.g. `AnalyticsDashboard.vue`. */
  filename: string
  /** Language hint for syntax highlighting + the header label. */
  language: RawLanguage
  /** Loads the file's raw text (its own `?raw` chunk) on demand. */
  load: () => Promise<string>
}

/** The bare filename (last path segment) of a `/`-separated source path. */
function basename(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1)
}

/**
 * Resolve the source files to show for a template, given its registry `source`
 * path. Returns the template `.vue` first, then a co-located `data.ts` when one
 * exists (siblings share the directory). An empty array means the source could
 * not be resolved — callers should render a safe "unavailable" fallback.
 */
export function resolveTemplateSources(source: string): TemplateRawFile[] {
  const files: TemplateRawFile[] = []

  const vue = BY_SOURCE[source]
  if (vue)
    files.push({ filename: basename(source), language: 'vue', load: vue })

  // Sibling data file: swap the final path segment for `data.ts`.
  const dataPath = source.replace(/[^/]+$/, 'data.ts')
  const data = BY_SOURCE[dataPath]
  if (data)
    files.push({ filename: 'data.ts', language: 'typescript', load: data })

  return files
}
