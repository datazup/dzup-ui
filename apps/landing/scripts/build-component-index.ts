/**
 * build-component-index — bake the searchable component catalog into
 * `src/generated/components.ts` at build time.
 *
 * The site-wide ⌘K palette (src/components/GlobalCommandPalette.vue) fuzzy-searches
 * every `@dzup-ui/core` component and deep-links each into Storybook. The single
 * authoritative "one docs page per component" list is the set of Storybook story
 * files in `packages/core/stories/<family>/Dz*.stories.ts` — NOT the public-API
 * manifest (which enumerates compound sub-parts like `DzTabTrigger` that have no
 * page of their own, and lags behind newly-authored components). So we read the
 * story files directly and project them into a typed module the app imports.
 *
 * For each `Dz<Name>.stories.ts` we take the `title: 'Core/<Family>/<DzName>'`
 * meta as the source of truth: its last segment is the component's display name
 * and the whole title kebab-cases to the exact Storybook story id
 * (`core-<family>-<dzname>`) that `storybookDocs()` links to — the same scheme the
 * Ecosystem family tiles already use in `src/data.ts`. Compound "…Parts" story
 * files and any non-`Core/<Family>/Dz…` titles (galleries, compositions) are
 * skipped, so the catalog stays one row per real, deep-linkable component.
 *
 * Wired ahead of `vite build` in the landing `build` script (see scripts/README.md).
 *
 * FAIL-LOUD, like the block registry generators: an empty catalog (e.g. the
 * stories dir moved) exits non-zero and writes nothing, rather than shipping a
 * palette with no components in it.
 *
 * Run with: `yarn build:component-index` (from apps/landing).
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')

/** `@dzup-ui/core` stories root — the source of truth for per-component pages. */
const STORIES_DIR = resolve(LANDING_ROOT, '..', '..', 'packages', 'core', 'stories')

/** Generated module the app imports — committed; see `src/generated/README.md`. */
const OUT_FILE = resolve(LANDING_ROOT, 'src', 'generated', 'components.ts')

/**
 * The 11 component families (docs/landing.md §4.6) — each a sub-directory of the
 * stories root. Order here is the display order in the palette's Components group.
 * Labels mirror `FAMILIES` in `src/data.ts`.
 */
const FAMILIES: { dir: string, label: string }[] = [
  { dir: 'buttons', label: 'Buttons' },
  { dir: 'inputs', label: 'Inputs' },
  { dir: 'forms', label: 'Forms' },
  { dir: 'cards', label: 'Cards' },
  { dir: 'data', label: 'Data' },
  { dir: 'feedback', label: 'Feedback' },
  { dir: 'layout', label: 'Layout' },
  { dir: 'navigation', label: 'Navigation' },
  { dir: 'overlays', label: 'Overlays' },
  { dir: 'media', label: 'Media' },
  { dir: 'typography', label: 'Typography' },
]

/** A component row in the generated catalog. */
interface ComponentRow {
  /** `Dz*` display name, e.g. `DzButton`. */
  name: string
  /** Family key (the stories sub-dir), e.g. `buttons`. */
  family: string
  /** Human family label, e.g. `Buttons`. */
  familyLabel: string
  /** Storybook story id, e.g. `core-buttons-dzbutton` — feeds `storybookDocs()`. */
  storyId: string
}

/** Kebab-case a Storybook title into its story id, exactly as Storybook does. */
function toStoryId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Extract the `Core/<Family>/<DzName>` title from a story module's source, or
 * `null` when it is not a single-component story (a "…Parts" bundle, a gallery,
 * or a composition). Matches the first `title:` string literal.
 *
 * A family may nest a sub-group before the component segment — e.g.
 * `Core/Feedback/App-Specific/DzRunStatusBadge`. The component is always the
 * LAST segment, so intermediate groups are matched non-greedily rather than
 * assumed absent (assuming they were absent silently dropped two real
 * components out of the palette).
 */
function readComponentTitle(source: string): { name: string, title: string } | null {
  const match = source.match(/title:\s*['"](Core\/(?:[A-Za-z0-9-]+\/)+?(Dz[A-Za-z0-9]+))['"]/)
  if (!match)
    return null
  const title = match[1]
  const name = match[2]
  if (!title || !name)
    return null
  // Guard: skip compound sub-part bundles (their name ends in `Parts`).
  if (name.endsWith('Parts'))
    return null
  return { name, title }
}

async function collectFamily(family: { dir: string, label: string }): Promise<ComponentRow[]> {
  const dir = resolve(STORIES_DIR, family.dir)
  let entries: string[]
  try {
    entries = await readdir(dir)
  }
  catch {
    return []
  }
  const rows: ComponentRow[] = []
  const seen = new Set<string>()
  for (const file of entries.sort()) {
    // Only per-component story modules; the "…Parts" bundles are skipped here and
    // again by name in readComponentTitle (belt and suspenders).
    if (!file.endsWith('.stories.ts') || file.endsWith('Parts.stories.ts'))
      continue
    const source = await readFile(resolve(dir, file), 'utf8')
    const parsed = readComponentTitle(source)
    if (!parsed || seen.has(parsed.name))
      continue
    seen.add(parsed.name)
    rows.push({
      name: parsed.name,
      family: family.dir,
      familyLabel: family.label,
      storyId: toStoryId(parsed.title),
    })
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name))
}

/** Render the generated module source. */
function render(rows: ComponentRow[]): string {
  const body = rows
    .map(
      r =>
        `  { name: '${r.name}', family: '${r.family}', familyLabel: '${r.familyLabel}', storyId: '${r.storyId}' },`,
    )
    .join('\n')
  return `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by \`apps/landing/scripts/build-component-index.ts\`, which runs from the
 * landing \`build\` script ahead of \`vite build\`. One row per \`@dzup-ui/core\`
 * component that has its own Storybook docs page, projected from the story files
 * in \`packages/core/stories/<family>/Dz*.stories.ts\`.
 *
 * Powers the site-wide ⌘K palette's Components group; \`storyId\` deep-links into
 * Storybook via \`storybookDocs()\` in \`../config.ts\`.
 */

/** One searchable, Storybook-deep-linkable component. */
export interface ComponentEntry {
  /** \`Dz*\` display name, e.g. \`DzButton\`. */
  name: string
  /** Family key (stories sub-dir), e.g. \`buttons\`. */
  family: string
  /** Human family label, e.g. \`Buttons\`. */
  familyLabel: string
  /** Storybook story id, e.g. \`core-buttons-dzbutton\`. */
  storyId: string
}

/** The full component catalog, sorted by family (display order) then name. */
export const COMPONENTS: ComponentEntry[] = [
${body}
]
`
}

async function main(): Promise<void> {
  const grouped = await Promise.all(FAMILIES.map(collectFamily))
  const rows = grouped.flat()

  if (rows.length === 0) {
    throw new Error(
      `No component stories found under ${STORIES_DIR}. Did the stories dir move?`,
    )
  }

  await mkdir(dirname(OUT_FILE), { recursive: true })
  await writeFile(OUT_FILE, render(rows))

  const perFamily = FAMILIES.map(
    f => `${f.label} ${rows.filter(r => r.family === f.dir).length}`,
  ).join(', ')
  console.log(`▸ Component index baked into src/generated/components.ts (${rows.length} components)`)
  console.log(`    ${perFamily}`)
}

main().catch((error: unknown) => {
  // FAIL-LOUD: a missing catalog must not silently ship an empty palette.
  console.error(`✗ build-component-index: ${(error as Error).message}`)
  process.exit(1)
})
