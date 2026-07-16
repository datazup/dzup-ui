/**
 * build-counts — derive every number the two apps publish about themselves, and
 * bake them into one generated module per app.
 *
 * The rule this script exists to enforce is already written down twice —
 * `src/config.ts` (`FACTS.freeComponents`: "Hand-maintained counts drift … never
 * replace it with a literal") and CLAUDE.md ("the count is glob-derived … never
 * edit a count by hand") — and was, before this script, honoured in exactly one
 * place. The landing head said 147 components, the ecosystem tile said 59
 * effects, the announcement bar said 90+ blocks, the Pro page promised 41
 * components over a list of 13, and `Introduction.mdx` published a family table
 * whose rows were wrong in 10 of 11 rows. None of those were derived; all of
 * them were wrong.
 *
 * So: ONE derivation, TWO generated modules, and `src/claims.spec.ts` reads the
 * shipped artifacts back off disk and fails if any of them disagrees.
 *
 * Written outputs (both committed, so a plain `vite build` / `storybook build`
 * needs no generation step to succeed — the spec is what keeps them honest):
 *   • `apps/landing/src/generated/counts.ts`
 *   • `apps/storybook/stories/_data/counts.generated.ts`
 *
 * Sources of truth, one per number:
 *   • catalog components + per-family breakdown — `.vue` files under
 *     `packages/core/src/components/<family>` (the same glob
 *     `packages/tokens/src/design-md.ts` runs for DESIGN.md, so the two agree
 *     by construction: 205).
 *   • documented components — one `Dz*.stories.ts` per component under
 *     `packages/core/stories/<family>`, excluding `*Parts.stories.ts` bundles
 *     (the same set `build-component-index.ts` projects into `COMPONENTS`: 139).
 *   • blocks / effects + categories / templates — the real `BLOCKS`, `CATALOG` +
 *     `CATEGORIES`, and `TEMPLATES` arrays, SSR-loaded through Vite (they use
 *     module-level `import.meta.glob`, which bare Node cannot resolve — same
 *     reason `build-registry.ts` spins up a Vite server).
 *   • story files — every `*.stories.ts` under the 11 family dirs.
 *
 * Wired ahead of `vite build` in the landing `build` script, and ahead of
 * `storybook build` in the Storybook one (see scripts/README.md).
 *
 * FAIL-LOUD, like the other registry generators: a zero anywhere means a source
 * dir moved, and a zeroed count would sail through as "the catalog shrank".
 * Exit non-zero and write nothing rather than publish a number we did not derive.
 *
 * Run with: `yarn build:counts` (from apps/landing).
 */

import { existsSync, readdirSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')
const REPO_ROOT = resolve(LANDING_ROOT, '..', '..')

const COMPONENTS_DIR = resolve(REPO_ROOT, 'packages', 'core', 'src', 'components')
const STORIES_DIR = resolve(REPO_ROOT, 'packages', 'core', 'stories')

const INDEX_HTML = resolve(LANDING_ROOT, 'index.html')
const LANDING_OUT = resolve(LANDING_ROOT, 'src', 'generated', 'counts.ts')
const STORYBOOK_OUT = resolve(
  REPO_ROOT,
  'apps',
  'storybook',
  'stories',
  '_data',
  'counts.generated.ts',
)

/**
 * The 11 component families, in the display order both apps use. `dir` is the
 * directory name under BOTH `src/components` and `stories` — the two trees are
 * parallel, which is what lets one family row carry both counts.
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

/** Both counts for one family, plus a few real component names to show. */
interface FamilyRow {
  key: string
  label: string
  /** `.vue` files in `packages/core/src/components/<key>` — the catalog size. */
  catalog: number
  /** Components in this family with a Storybook page of their own. */
  documented: number
  /** Real, deep-linkable component names from this family (documented ones). */
  examples: string[]
}

function read(dir: string, what: string, opts?: { recursive: true }): string[] {
  if (!existsSync(dir)) {
    throw new Error(
      `cannot count ${what} — \`${dir}\` does not exist. `
      + 'Counts are glob-derived and must not silently fall back to 0.',
    )
  }
  return readdirSync(dir, { recursive: opts?.recursive ?? false, encoding: 'utf-8' })
}

/** Components documented by a page of their own, by filename (the DESIGN.md rule). */
function documentedNames(family: string): string[] {
  return read(resolve(STORIES_DIR, family), `${family} stories`)
    .filter(
      name =>
        name.startsWith('Dz')
        && name.endsWith('.stories.ts')
        && !name.endsWith('Parts.stories.ts'),
    )
    .map(name => name.replace('.stories.ts', ''))
    .sort()
}

function familyRow(family: { dir: string, label: string }): FamilyRow {
  const vue = read(resolve(COMPONENTS_DIR, family.dir), `${family.dir} components`)
    .filter(name => name.endsWith('.vue'))
  const documented = documentedNames(family.dir)
  if (vue.length === 0 || documented.length === 0) {
    throw new Error(`family \`${family.dir}\` derived to 0 — did its directory move?`)
  }
  return {
    key: family.dir,
    label: family.label,
    catalog: vue.length,
    documented: documented.length,
    // First five, alphabetically — deterministic, and every name is a real page.
    examples: documented.slice(0, 5),
  }
}

/**
 * Every `*.stories.ts` in the core stories tree — the 11 families (`*Parts`
 * bundles included) PLUS `compositions/` and `_gallery/`. This is deliberately
 * the whole tree, not just the families: the only thing that quotes it is
 * `Accessibility.mdx`, whose backlog table reports a full audit run "across all
 * N story files", and the audit runs against every story Storybook loads.
 */
function countStoryFiles(): number {
  return read(STORIES_DIR, 'story files', { recursive: true }).filter(name =>
    name.endsWith('.stories.ts'),
  ).length
}

/** Sizes of the three landing registries, read from the real arrays. */
interface RegistrySizes {
  blocks: number
  effects: number
  effectCategories: number
  templates: number
}

/**
 * Load the registries through a throwaway Vite SSR server: `blocks/registry.ts`
 * and `gallery/catalog.ts` pair each entry with a lazily-imported component and
 * a module-level `import.meta.glob`, neither of which bare Node resolves. The
 * server runs in middleware mode (binds no port) and is always closed.
 */
async function loadRegistrySizes(): Promise<RegistrySizes> {
  const server = await createServer({
    root: LANDING_ROOT,
    logLevel: 'warn',
    appType: 'custom',
    server: { middlewareMode: true },
  })
  try {
    const blocks = (await server.ssrLoadModule('/src/blocks/registry.ts')) as {
      BLOCKS: unknown[]
    }
    const gallery = (await server.ssrLoadModule('/src/gallery/catalog.ts')) as {
      CATALOG: unknown[]
      CATEGORIES: unknown[]
    }
    const templates = (await server.ssrLoadModule('/src/templates/registry.ts')) as {
      TEMPLATES: unknown[]
    }
    const sizes: RegistrySizes = {
      blocks: blocks.BLOCKS.length,
      effects: gallery.CATALOG.length,
      effectCategories: gallery.CATEGORIES.length,
      templates: templates.TEMPLATES.length,
    }
    for (const [name, value] of Object.entries(sizes)) {
      if (value === 0)
        throw new Error(`registry \`${name}\` loaded empty — refusing to publish 0.`)
    }
    return sizes
  }
  finally {
    await server.close()
  }
}

/** Everything both apps are allowed to say about their own size. */
interface Counts extends RegistrySizes {
  catalogComponents: number
  documentedComponents: number
  families: number
  storyFiles: number
}

/** The shared body of both generated modules (identical types, identical values). */
function renderModule(counts: Counts, families: FamilyRow[], writtenTo: string): string {
  const header = `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by \`apps/landing/scripts/build-counts.ts\`, which runs from the landing
 * \`build\` script (and the Storybook one) ahead of the bundler. Every number
 * either app publishes about itself — the landing <head>, the feature grid, the
 * announcement bar, the comparison table, the Pro page, the Storybook docs —
 * reads from here.
 *
 * Hand-typed counts drift: this module exists because "147 components" was in the
 * meta description, the OpenGraph card AND the JSON-LD while the real figure was
 * ${counts.documentedComponents}. \`${writtenTo}\` is regenerated from the filesystem and the real
 * registries, and \`apps/landing/src/claims.spec.ts\` reads the shipped files back
 * off disk and fails the build if any published claim disagrees with it.
 */`
  const rows = families
    .map(
      f =>
        `  { key: '${f.key}', label: '${f.label}', catalog: ${f.catalog}, documented: ${f.documented}, `
        + `examples: [${f.examples.map(e => `'${e}'`).join(', ')}] },`,
    )
    .join('\n')

  return `${header}

/**
 * The two component counts, each with its rule stated — mirroring DESIGN.md,
 * which publishes both. Never print one without saying which it is.
 *
 * \`catalogComponents\` is the CATALOG size: every exported \`.vue\` component,
 * including compound sub-parts such as \`DzCardBody\`. \`documentedComponents\` is
 * the DOCUMENTED size: components with a dedicated Storybook page (compound
 * sub-parts are documented through their parent).
 */
export const CATALOG_COUNT_RULE
  = 'every exported \`.vue\` component, including compound sub-parts such as \`DzCardBody\`'

/** The rule behind \`documentedComponents\`. @see CATALOG_COUNT_RULE */
export const DOCUMENTED_COUNT_RULE
  = 'components with a dedicated Storybook page (compound sub-parts are documented through their parent)'

/** Both component counts for one family, and real names from it. */
export interface FamilyCount {
  /** Family dir, e.g. \`buttons\` — the key in both the source and stories trees. */
  key: string
  /** Display label, e.g. \`Buttons\`. */
  label: string
  /** \`.vue\` files in this family (the catalog rule). */
  catalog: number
  /** Components in this family with a docs page of their own. */
  documented: number
  /** Up to five real, deep-linkable component names from this family. */
  examples: string[]
}

/** Per-family breakdown, in display order. Sums to \`COUNTS.catalogComponents\`. */
export const FAMILY_COUNTS: FamilyCount[] = [
${rows}
]

/** Every published figure, derived. */
export const COUNTS = {
  /** Every exported \`.vue\` under \`packages/core/src/components\`. @see CATALOG_COUNT_RULE */
  catalogComponents: ${counts.catalogComponents},
  /** Components with a dedicated Storybook page. @see DOCUMENTED_COUNT_RULE */
  documentedComponents: ${counts.documentedComponents},
  /** Component families. */
  families: ${counts.families},
  /** Copy-paste blocks — \`BLOCKS.length\` in \`src/blocks/registry.ts\`. */
  blocks: ${counts.blocks},
  /** Animation effects — \`CATALOG.length\` in \`src/gallery/catalog.ts\`. */
  effects: ${counts.effects},
  /** Animation categories — \`CATEGORIES.length\` in \`src/gallery/catalog.ts\`. */
  effectCategories: ${counts.effectCategories},
  /** Full-page templates — \`TEMPLATES.length\` in \`src/templates/registry.ts\`. */
  templates: ${counts.templates},
  /** Story files across the 11 families, \`*Parts\` bundles included. */
  storyFiles: ${counts.storyFiles},
} as const
`
}

async function emit(path: string, source: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, source)
}

/**
 * Rewrite the four description strings in the static `index.html` head — the
 * `<meta name="description">`, the OpenGraph and Twitter cards, and the JSON-LD
 * `SoftwareApplication.description`. These are what search engines, social
 * previews and AI crawlers quote, and all four were hard-coded to a count that
 * had been wrong for months.
 *
 * The file is rewritten IN PLACE and committed (rather than templated with a
 * placeholder Vite fills in) so that what is on disk is what ships: `dev`,
 * `preview`, a bare `vite build` and every crawler that fetches the repo all see
 * the same, correct number — and `claims.spec.ts` can read the real artifact.
 *
 * Each replacement is anchored on the attribute that precedes it, so the titles
 * and the rest of the head are untouched. A pattern that matches nothing is a
 * FAIL: the head changed shape and the description silently stopped being
 * maintained, which is exactly the failure mode this script exists to end.
 */
async function rewriteIndexHtml(): Promise<void> {
  // Imported dynamically, and only once `counts.ts` is on disk: `src/lib/seo.ts`
  // composes its copy FROM that module, so a static import at the top of this
  // file would bind the previous (possibly stale) counts and bake them into the
  // head — the drift we are here to remove, one run behind.
  const { META_DESCRIPTION, SOCIAL_DESCRIPTION } = await import('../src/lib/seo.ts')

  const html = await readFile(INDEX_HTML, 'utf8')

  /** [what it is, the regex, the derived copy that replaces group 1]. */
  const rewrites: [string, RegExp, string][] = [
    ['meta description', /(<meta\s+name="description"\s+content=")[^"]*(")/, META_DESCRIPTION],
    ['og:description', /(<meta\s+property="og:description"\s+content=")[^"]*(")/, SOCIAL_DESCRIPTION],
    ['twitter:description', /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, SOCIAL_DESCRIPTION],
    ['JSON-LD description', /("description":\s*")[^"]*(")/, META_DESCRIPTION],
  ]

  let next = html
  for (const [what, pattern, copy] of rewrites) {
    if (!pattern.test(next)) {
      throw new Error(
        `index.html: no ${what} to rewrite. The head changed shape — fix the pattern, `
        + 'or the description will quietly stop tracking the real counts.',
      )
    }
    next = next.replace(pattern, `$1${copy}$2`)
  }

  if (next !== html)
    await writeFile(INDEX_HTML, next)
  console.log(`▸ index.html head rewritten from the derived counts${next === html ? ' (already current)' : ''}`)
}

async function main(): Promise<void> {
  const families = FAMILIES.map(familyRow)
  const sizes = await loadRegistrySizes()

  const counts: Counts = {
    ...sizes,
    catalogComponents: families.reduce((n, f) => n + f.catalog, 0),
    documentedComponents: families.reduce((n, f) => n + f.documented, 0),
    families: families.length,
    storyFiles: countStoryFiles(),
  }

  await emit(LANDING_OUT, renderModule(counts, families, 'src/generated/counts.ts'))
  await emit(
    STORYBOOK_OUT,
    renderModule(counts, families, 'apps/storybook/stories/_data/counts.generated.ts'),
  )
  await rewriteIndexHtml()

  console.log('▸ Counts baked into src/generated/counts.ts + storybook _data/counts.generated.ts')
  console.log(`    components : ${counts.catalogComponents} catalog / ${counts.documentedComponents} documented across ${counts.families} families`)
  console.log(`    ecosystem  : ${counts.blocks} blocks, ${counts.effects} effects in ${counts.effectCategories} categories, ${counts.templates} templates`)
  console.log(`    stories    : ${counts.storyFiles} story files`)
}

main().catch((error: unknown) => {
  // FAIL-LOUD: a count we could not derive must never be published.
  console.error(`✗ build-counts: ${(error as Error).message}`)
  process.exit(1)
})
