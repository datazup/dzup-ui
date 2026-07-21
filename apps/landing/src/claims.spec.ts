/**
 * Every number this library publishes about itself, checked against the thing it
 * claims to count.
 *
 * `config.ts` has stated the rule since the day `FACTS.freeComponents` was fixed:
 * "Hand-maintained counts drift — this one used to read 147 while the real figure
 * was 139. Never replace it with a literal."* Nine other places ignored it. The
 * meta description, the OpenGraph card and the JSON-LD all told Google, X and
 * every AI crawler that dzup-ui has 147 components; the announcement bar promised
 * 90+ blocks over a registry of 87; the Pro page promised 41 components directly
 * above a list of 13; and `Introduction.mdx` published a family table that was
 * wrong in 10 of its 11 rows and totalled 163 against a real 205 — contradicting
 * `ComponentStatus.mdx`, two pages away, which said 205.
 *
 * This file is the gate that ends that. It has two halves, and it needs both:
 *
 *   1. **The generated module is true.** `generated/counts.ts` is checked against
 *      the live registries and the real source tree — not against another copy of
 *      itself. A generated number that nothing verifies is just a slower literal.
 *
 *   2. **The shipped artifacts say the generated number.** The published files —
 *      `index.html`, `data.ts`, `config.ts`, `compare.ts`, `ProPage.vue`, and the
 *      Storybook MDX — are READ BACK OFF DISK and the digits in them are matched
 *      against `COUNTS`. Comparing two constants to each other proves nothing;
 *      the failure mode being guarded is a literal typed into rendered copy, so
 *      the rendered copy is what gets read.
 *
 * If this fails: run `yarn workspace @dzup-ui/landing build:counts`, which
 * regenerates the module and rewrites the `index.html` head. If it still fails,
 * something re-typed a number into copy — put it back on `COUNTS`.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { BLOCKS } from './blocks/registry.ts'
import { ANNOUNCEMENT, FACTS } from './config.ts'
import { ECOSYSTEM, FAMILIES, FEATURES, PRO_COMPONENTS, PRO_FACTS } from './data.ts'
import { ROWS } from './data/compare.ts'
import { CATALOG, CATEGORIES } from './gallery/catalog.ts'
import { COMPONENTS } from './generated/components.ts'
import { COUNTS, FAMILY_COUNTS } from './generated/counts.ts'
import { META_DESCRIPTION, SOCIAL_DESCRIPTION } from './lib/seo.ts'
import { SITE_ORIGIN } from './origin.ts'
import { TEMPLATES } from './templates/registry.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')
const REPO_ROOT = resolve(LANDING_ROOT, '..', '..')

function read(...segments: string[]): string {
  return readFileSync(resolve(REPO_ROOT, ...segments), 'utf8')
}

const INDEX_HTML = read('apps', 'landing', 'index.html')
const DATA_TS = read('apps', 'landing', 'src', 'data.ts')
const CONFIG_TS = read('apps', 'landing', 'src', 'config.ts')
const COMPARE_TS = read('apps', 'landing', 'src', 'data', 'compare.ts')
const PRO_PAGE = read('apps', 'landing', 'src', 'pages', 'ProPage.vue')
const INTRODUCTION_MDX = read('apps', 'storybook', 'stories', 'Introduction.mdx')
// MDX with its authoring comments stripped — only what a reader actually sees.
// (Those comments are allowed to name the old, wrong numbers; the page is not.)
const INTRODUCTION_PROSE = INTRODUCTION_MDX.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
const ACCESSIBILITY_MDX = read('apps', 'storybook', 'stories', 'Accessibility.mdx')
const COMPONENT_STATUS_MDX = read('apps', 'storybook', 'stories', 'ComponentStatus.mdx')

/**
 * Half one: the generated module is a true projection of what it counts.
 *
 * Each assertion re-derives the number from the *thing itself* — the live
 * registry array, the real directory — so a stale `counts.ts` (someone added a
 * block and didn't rebuild) fails here rather than shipping a wrong claim.
 */
describe('generated counts match what they count', () => {
  it('components: catalog = every `.vue`, documented = every component with a story', () => {
    const families = readdirSync(resolve(REPO_ROOT, 'packages', 'core', 'src', 'components'))
    const vue = families.flatMap(family =>
      readdirSync(resolve(REPO_ROOT, 'packages', 'core', 'src', 'components', family))
        .filter(name => name.endsWith('.vue')),
    )
    expect(COUNTS.catalogComponents).toBe(vue.length)
    expect(COUNTS.documentedComponents).toBe(COMPONENTS.length)
    // The two are different numbers with different rules — never the same claim.
    expect(COUNTS.catalogComponents).toBeGreaterThan(COUNTS.documentedComponents)
  })

  it('the per-family breakdown sums to both totals', () => {
    expect(FAMILY_COUNTS).toHaveLength(COUNTS.families)
    const sum = (pick: (f: typeof FAMILY_COUNTS[number]) => number) =>
      FAMILY_COUNTS.reduce((total, family) => total + pick(family), 0)

    expect(sum(f => f.catalog)).toBe(COUNTS.catalogComponents)
    expect(sum(f => f.documented)).toBe(COUNTS.documentedComponents)

    // Per family, too: a table can total correctly with two rows wrong.
    for (const family of FAMILY_COUNTS) {
      const documented = COMPONENTS.filter(c => c.family === family.key)
      expect(documented.length, `${family.label}: documented`).toBe(family.documented)
      expect(family.examples.every(name => documented.some(c => c.name === name))).toBe(true)
    }
  })

  it('blocks, effects, categories and templates match their registries', () => {
    expect(COUNTS.blocks).toBe(BLOCKS.length)
    expect(COUNTS.effects).toBe(CATALOG.length)
    expect(COUNTS.effectCategories).toBe(CATEGORIES.length)
    expect(COUNTS.templates).toBe(TEMPLATES.length)
  })

  it('story files match the story tree', () => {
    const stories = readdirSync(resolve(REPO_ROOT, 'packages', 'core', 'stories'), {
      recursive: true,
      encoding: 'utf-8',
    }).filter(name => name.endsWith('.stories.ts'))
    expect(COUNTS.storyFiles).toBe(stories.length)
  })

  it('the Storybook copy of the generated module is identical to the landing one', () => {
    // Two apps, one derivation. They are written by the same script in the same
    // run; if they have diverged, one app's build regenerated and the other's
    // didn't, and the docs are quietly a release behind the site.
    const landing = read('apps', 'landing', 'src', 'generated', 'counts.ts')
    const storybook = read('apps', 'storybook', 'stories', '_data', 'counts.generated.ts')
    const body = (source: string) => source.slice(source.indexOf('export const CATALOG_COUNT_RULE'))
    expect(body(storybook)).toBe(body(landing))
  })
})

/**
 * Half two: the artifacts a visitor (or a crawler) actually sees.
 */
describe('index.html', () => {
  it('states the derived component count in all four descriptions', () => {
    const claimed = [...INDEX_HTML.matchAll(/(\d+) accessible, open-source Vue 3 components/g)]
    // meta description, og:description, twitter:description, JSON-LD.
    expect(claimed).toHaveLength(4)
    for (const [, n] of claimed) expect(Number(n)).toBe(COUNTS.documentedComponents)
  })

  it('ships exactly the copy `src/lib/seo.ts` composes', () => {
    // The head is rewritten from `seo.ts` by `build-counts.ts`. If they differ,
    // the file on disk was hand-edited and the next build would silently undo it.
    expect(INDEX_HTML).toContain(`content="${META_DESCRIPTION}"`)
    expect(INDEX_HTML).toContain(`content="${SOCIAL_DESCRIPTION}"`)
    expect(INDEX_HTML).toContain(`"description": "${META_DESCRIPTION}"`)
  })

  it('carries no hand-typed count anywhere else in the head', () => {
    // Take out the two derived descriptions and the HTML comments, and NOTHING in
    // the head may still be counting something. `147` is the specific literal that
    // shipped to Google, X and LinkedIn — in four places — for months.
    const head = INDEX_HTML.slice(0, INDEX_HTML.indexOf('</head>'))
      .replaceAll(META_DESCRIPTION, '')
      .replaceAll(SOCIAL_DESCRIPTION, '')
      .replace(/<!--[\s\S]*?-->/g, '')
    // `(?<!Vue )` — "the Vue 3 component library" is a name, not a count.
    const stray = [...head.matchAll(/(?<!Vue )\d+\+?\s+(?:components?|blocks?|effects?|templates?|families)/gi)]
    expect(stray.map(m => m[0])).toEqual([])
  })
})

describe('the landing copy', () => {
  it('the feature grid headline is the documented count', () => {
    const headline = FEATURES.find(f => f.title.includes('components'))
    expect(headline?.title).toBe(`${COUNTS.documentedComponents} components`)
    expect(headline?.body).toContain(`${COUNTS.families} families`)
  })

  it('the family tiles sum to the documented count they sit under', () => {
    // `ComponentGallery` renders these under a "{freeComponents} components,
    // {families} families" heading. They used to sum to 167 — matching neither
    // the headline (147), the real documented count (139), nor the catalog (205).
    const total = FAMILIES.reduce((sum, family) => sum + family.count, 0)
    expect(total).toBe(FACTS.freeComponents)
    expect(total).toBe(COUNTS.documentedComponents)
    expect(FAMILIES).toHaveLength(COUNTS.families)
  })

  it('the animations tile states the real effect and category counts', () => {
    const animations = ECOSYSTEM.find(item => item.title === 'Animations')
    expect(animations?.meta).toBe(`${CATALOG.length} effects · ${CATEGORIES.length} categories`)
  })

  it('the announcement bar states the real block count', () => {
    expect(ANNOUNCEMENT?.message).toContain(String(BLOCKS.length))
    // "90+" over 87 blocks. A rounded-up marketing number is still a claim.
    expect(ANNOUNCEMENT?.message).not.toMatch(/\d+\+/)
  })

  it('the comparison table cites our own count, exactly', () => {
    const components = ROWS.find(row => row.feature === 'Components')
    expect(components?.values.dzup).toContain(String(COUNTS.documentedComponents))
    // "~147 (free)": approximate is for the libraries we don't own the source of.
    expect(components?.values.dzup).not.toContain('~')
  })

  it('no count is typed into `data.ts`, `config.ts` or `compare.ts`', () => {
    // The values above could all be right and still be literals. Assert the
    // rendered copy INTERPOLATES — a digit next to one of these nouns is a bug.
    const typed = (source: string) =>
      [...source.matchAll(/(?<![\w-])(\d{2,3})\+?\s+(?:components?|blocks?|effects?|templates?|categor|famil)/gi)]
        .map(m => m[0])
    for (const [name, source] of [['data.ts', DATA_TS], ['config.ts', CONFIG_TS], ['compare.ts', COMPARE_TS]] as const) {
      // Prose in the file header may cite the OLD wrong numbers as the cautionary
      // tale they are; only code lines count. Strip block comments.
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
      expect(typed(code), `${name} contains a hand-typed count`).toEqual([])
    }
  })
})

describe('the Pro page', () => {
  it('derives both of its present-tense numbers from PRO_COMPONENTS', () => {
    expect(PRO_FACTS.announced).toBe(PRO_COMPONENTS.length)
    expect(PRO_FACTS.announcedFamilies).toBe(new Set(PRO_COMPONENTS.map(c => c.family)).size)
    expect(PRO_PAGE).toContain('PRO_FACTS.announced')
    expect(PRO_PAGE).toContain('PRO_FACTS.announcedFamilies')
  })

  it('never prints the roadmap target as a present-tense fact', () => {
    // The page promised "41 enterprise components" above a list of 13 in 7
    // families. The roadmap figure may still appear — but only as a roadmap, and
    // only interpolated. Checked against the rendered template, not the comments
    // above it (which are free to name the old numbers as the cautionary tale).
    const template = PRO_PAGE.slice(PRO_PAGE.indexOf('<template>'), PRO_PAGE.indexOf('</template>'))
    expect(template).not.toMatch(/\d+\s+(?:enterprise\s+)?components?/i)
    expect(template).not.toMatch(/\d+\s+families/i)
    if (template.includes('PRO_FACTS.planned'))
      expect(template).toMatch(/roadmap|planned/i)
  })
})

describe('the Storybook docs', () => {
  it('introduction generates its family table instead of typing it', () => {
    expect(INTRODUCTION_MDX).toContain('from \'./_data/counts.generated.ts\'')
    expect(INTRODUCTION_MDX).toContain('FAMILY_COUNTS.map')
    // The old table: a literal row per family, 10 of 11 wrong, totalling 163.
    expect(INTRODUCTION_PROSE).not.toMatch(/\['\*\*\w+\*\*', '\d+'/)
    expect(INTRODUCTION_PROSE).not.toContain('163')
  })

  it('introduction and ComponentStatus agree on the catalog size', () => {
    // These two pages contradicted each other: 163 vs 205. Both now read the
    // same generated module, so the only way to disagree is to type a number.
    for (const [name, mdx] of [
      ['Introduction.mdx', INTRODUCTION_MDX],
      ['ComponentStatus.mdx', COMPONENT_STATUS_MDX],
    ] as const) {
      expect(mdx, `${name}: catalog size`).toContain('COUNTS.catalogComponents')
      expect(mdx, `${name}: hard-coded catalog size`).not.toMatch(
        new RegExp(`\\b${COUNTS.catalogComponents}\\b\\s*\`?\\.?vue`, 'i'),
      )
    }
  })

  it('accessibility derives the story-file count in its backlog table', () => {
    expect(ACCESSIBILITY_MDX).toContain('COUNTS.storyFiles')
    // "across all 175 story files" — an audit that ran over 176.
    expect(ACCESSIBILITY_MDX).not.toMatch(/\d+ story files/)
  })
})

/**
 * Every origin this site publishes, checked against the one domain we own.
 *
 * The same failure mode as the counts above, in a different currency. The repo
 * declared a canonical origin in `origin.ts` and then hand-typed a DIFFERENT host
 * — a `.dev` variant of our name, which we do not own — into seven places. Two of
 * them were worse than cosmetic: the `homepage` field of the registry indexes
 * under `public/r/**`, which are *distributed* artifacts that consumers fetch with
 * `npx shadcn add`, and the `$schema` of every theme file the designer exports.
 * We were shipping a wrong address into other people's repositories.
 *
 * So: no file this app ships may contain that host, in code, in copy, in a
 * comment, or in a generated artifact. Not "no un-derived literal" — none at all.
 * A domain has no cautionary-tale exemption the way an old count does: the string
 * is either something we own or it is a link to a stranger. Anything needing an
 * absolute URL imports `SITE_ORIGIN`.
 *
 * If this fails: import `SITE_ORIGIN` from `src/origin.ts` instead of typing a
 * host. If it fails on a file under `public/`, that file is GENERATED — fix the
 * source it is built from and re-run `yarn workspace @dzup-ui/landing build:registry`
 * (and `build:animations-registry`), which rewrites `public/r/**` + `llms*.txt`.
 */
describe('the origin this site publishes', () => {
  // Assembled from parts so this spec is not itself a hit for the string it bans.
  const DEAD_HOST = ['dzup-ui', 'dev'].join('.')

  /** Text this app ships: authored source + the generated artifacts under public/. */
  const SHIPPED_TEXT = /\.(?:ts|tsx|vue|json|md|txt|html|css|xml)$/

  function walk(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = resolve(dir, entry.name)
      if (entry.isDirectory())
        return entry.name === 'node_modules' ? [] : walk(full)
      return SHIPPED_TEXT.test(entry.name) ? [full] : []
    })
  }

  const FILES = [
    ...walk(resolve(LANDING_ROOT, 'src')),
    ...walk(resolve(LANDING_ROOT, 'public')),
  ]

  it('scans the files it means to scan', () => {
    // A walk that silently matched nothing would make every assertion below pass
    // while checking air. Anchor it on files known to carry origins.
    expect(FILES.length).toBeGreaterThan(100)
    expect(FILES).toContain(resolve(LANDING_ROOT, 'src', 'origin.ts'))
    expect(FILES).toContain(resolve(LANDING_ROOT, 'public', 'r', 'registry.json'))
  })

  it(`no shipped file names the dead host`, () => {
    const offenders = FILES.filter(file => readFileSync(file, 'utf8').includes(DEAD_HOST))
      .map(file => file.slice(LANDING_ROOT.length + 1).split(sep).join('/'))
    expect(offenders, `these files name ${DEAD_HOST}; derive from SITE_ORIGIN`).toEqual([])
  })

  it('the published registry indexes carry the canonical origin', () => {
    // The artifact, read off disk — not the constant that was supposed to produce
    // it. This is the thing a consumer's shadcn CLI actually downloads.
    for (const index of ['r/registry.json', 'r/templates/registry.json', 'r/animations/registry.json']) {
      const published = JSON.parse(readFileSync(resolve(LANDING_ROOT, 'public', index), 'utf8'))
      expect(published.homepage, `${index}: homepage`).toBe(SITE_ORIGIN)
    }
  })
})
