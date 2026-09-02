import type { DefaultTheme } from 'vitepress'
/**
 * VitePress configuration for the dzup-ui documentation site (TASK-N2-D1).
 *
 * The framework decision and the alternatives it was weighed against are in
 * `docs/program-2026-09/reports/N2-D1-docs-site-handoff.md` §2.
 *
 * Two things here are load-bearing:
 *
 * 1. **The sidebar is generated.** `.vitepress/generated/nav.json` is written by
 *    `yarn generate:docs-pages` from `packages/core/docs/component-meta.json`.
 *    A hand-maintained component list is the drift this program has now found
 *    six times; there is not going to be a seventh in the docs site.
 * 2. **The fingerprint check.** The generated pages record the SHA-256 of the
 *    artifact they were rendered from. If the artifact has moved since, this
 *    config throws and `vitepress build` fails — a *second* staleness axis from
 *    the freshness gate in the generator, and a much cheaper one (a hash, not a
 *    20-second re-extraction). Between them: the artifact cannot disagree with
 *    source, and the pages cannot disagree with the artifact.
 *
 *    **TASK-N2-D2 widened it to the evidence artifacts.** The evidence layer
 *    reads the quality matrix, the capability matrix, the AT scaffold index, the
 *    WCAG deviation register and the two optional lane records, and any of them
 *    moving after a render leaves the site publishing a measurement that has
 *    since changed. Each is fingerprinted, and an artifact that has appeared or
 *    vanished counts as a change too — the absence of a lane record is itself
 *    rendered on the page, so it has to invalidate the render.
 *
 *    (That sentence was written with markdown emphasis around "appearing" and
 *    "disappearing"; `jsdoc/no-multi-asterisks --fix` ate the opening asterisk
 *    of the second one and left the text broken. Rewritten without emphasis.)
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '../../..')
const NAV_PATH = resolve(HERE, 'generated/nav.json')
const ARTIFACT_PATH = resolve(REPO_ROOT, 'packages/core/docs/component-meta.json')

interface DocsNav {
  artifactSha256: string
  schemaVersion: string
  extractor: string
  sourceCommit: string
  publicComponents: number
  compoundParts: number
  groups: Array<{ key: string, text: string, items: Array<{ text: string, link: string }> }>
  evidenceSha256: Record<string, string>
  evidence?: { cells: number, unrunCells: number, atCells: number, atExecuted: number }
}

function loadNav(): DocsNav {
  if (!existsSync(NAV_PATH)) {
    throw new Error(
      'apps/docs/.vitepress/generated/nav.json is missing. The site\'s navigation and its 144 '
      + 'component pages are generated: run `yarn generate:docs-pages` (or `yarn workspace '
      + '@dzup-ui/docs generate`) before building.',
    )
  }
  const nav = JSON.parse(readFileSync(NAV_PATH, 'utf8')) as DocsNav

  if (!existsSync(ARTIFACT_PATH)) {
    throw new Error(
      'packages/core/docs/component-meta.json is missing. Every API fact on this site is a '
      + 'projection of it; there is nothing to build without it. Run `yarn generate:component-meta`.',
    )
  }
  const actual = createHash('sha256').update(readFileSync(ARTIFACT_PATH, 'utf8'), 'utf8').digest('hex')
  if (actual !== nav.artifactSha256) {
    throw new Error(
      'The generated docs pages are STALE.\n'
      + `  pages were rendered from component-meta.json sha256 ${nav.artifactSha256}\n`
      + `  the artifact on disk is now              sha256 ${actual}\n`
      + 'Every prop, event and slot table on this site would describe the previous extraction. '
      + 'Run `yarn generate:docs-pages`.',
    )
  }

  // The evidence artifacts (TASK-N2-D2). Every state on every evidence section
  // and every evidence page is a projection of these; if one has moved since the
  // render, the site would publish a measurement that is no longer the
  // measurement. An artifact that has APPEARED since is caught too, because its
  // absence is what the page currently prints.
  for (const [path, expected] of Object.entries(nav.evidenceSha256 ?? {})) {
    const abs = resolve(REPO_ROOT, path)
    if (!existsSync(abs)) {
      throw new Error(
        `The generated evidence pages are STALE: ${path} was read at render time and is now gone.\n`
        + 'The pages describe measurements from an artifact that no longer exists. Run '
        + '`yarn generate:docs-pages`.',
      )
    }
    const actual = createHash('sha256').update(readFileSync(abs, 'utf8'), 'utf8').digest('hex')
    if (actual !== expected) {
      throw new Error(
        `The generated evidence pages are STALE.\n`
        + `  pages were rendered from ${path} sha256 ${expected}\n`
        + `  the artifact on disk is now${' '.repeat(Math.max(1, path.length - 22))}sha256 ${actual}\n`
        + 'Every evidence state on this site would describe the previous measurement. '
        + 'Run `yarn generate:docs-pages`.',
      )
    }
  }
  return nav
}

const nav = loadNav()

const componentSidebar: DefaultTheme.SidebarItem[] = [
  { text: 'All components', link: '/components/' },
  ...nav.groups.map(group => ({
    text: group.text,
    collapsed: true,
    items: group.items,
  })),
]

const evidenceSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Evidence',
    items: [
      { text: 'Overview', link: '/evidence/' },
      { text: 'Accessibility conformance', link: '/evidence/accessibility' },
      { text: 'Assistive-technology matrix', link: '/evidence/at-matrix' },
      { text: 'Browser support', link: '/evidence/browser-support' },
      { text: 'Capability matrix', link: '/evidence/capability-matrix' },
      { text: 'Styling posture', link: '/evidence/styling-posture' },
    ],
  },
]

const guideSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Guide',
    items: [
      { text: 'Getting started', link: '/guide/getting-started' },
      { text: 'Styling contract', link: '/guide/styling-contract' },
      { text: 'Design tokens', link: '/guide/tokens' },
      { text: 'Theme builder', link: '/guide/theme-builder' },
      { text: 'For AI agents', link: '/guide/agents' },
      { text: 'How this site is built', link: '/guide/how-this-site-is-built' },
    ],
  },
  ...evidenceSidebar,
]

/**
 * TASK-N2-D3 — keep `@vue/repl`'s editor CSS out of the site's shared stylesheet.
 *
 * VitePress 1.6.4 builds with Vite's `cssCodeSplit` **disabled**, so every
 * stylesheet reachable from the module graph is emitted into the single
 * `style.css` that every page downloads — including CSS behind a dynamic
 * `import()`. And `@vue/repl/dist/vue-repl.js` and `codemirror-editor.js` each
 * carry `import './<name>.css'` **inside the library**, so simply not importing
 * the stylesheet from application code does nothing: it arrives with the JS.
 *
 * Measured: that put **+18,515 B of code-editor CSS on all 158 pages**, 150 of
 * which have no editor. This resolver replaces those two ids with an empty
 * stub; the real stylesheets are copied to `public/playground/repl/` by
 * `scripts/sync-playground-assets.mjs` and `<link>`ed at launch time by
 * `theme/playground.ts`, so a reader who never opens a playground never fetches
 * them.
 *
 * The two are a matched pair. If the stub is ever removed, remove the `<link>`
 * injection with it, or the editor loads its CSS twice.
 */
function replCssOutOfSharedStylesheet(): { name: string, enforce: 'pre', resolveId: (id: string) => string | null } {
  const stub = resolve(HERE, 'repl-css-stub.css')
  return {
    name: 'dzup:repl-css-out-of-shared-stylesheet',
    enforce: 'pre',
    resolveId(id: string) {
      return /@vue[/\\]repl[/\\]dist[/\\](?:vue-repl|codemirror-editor)\.css$/.test(id)
        || /^\.\/(?:vue-repl|codemirror-editor)\.css$/.test(id)
        ? stub
        : null
    },
  }
}

export default defineConfig({
  title: 'dzup-ui',
  description:
    'Contract-first Vue 3 components, documented from generated metadata. Every prop, event and '
    + 'slot table on this site is extracted from source — none of it is hand-typed.',
  lang: 'en-GB',
  cleanUrls: true,

  // Hand-written per-component prose is merged INTO the generated pages by the
  // generator; the source files must not also become pages of their own.
  srcExclude: ['**/_usage/**'],

  // A dead internal link is a defect, so it fails the build. Nothing here links
  // off-site by path.
  ignoreDeadLinks: false,

  vite: {
    plugins: [replCssOutOfSharedStylesheet()],
  },

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/components/' },
      { text: 'Evidence', link: '/evidence/' },
      {
        text: `${nav.publicComponents} public · ${nav.compoundParts} parts`,
        items: [
          { text: `extractor: ${nav.extractor}`, link: '/guide/how-this-site-is-built' },
          { text: `metadata schema ${nav.schemaVersion}`, link: '/guide/how-this-site-is-built' },
          ...(nav.evidence === undefined
            ? []
            : [
                // Deliberately in the header: the unrun count is the number a
                // reader is least likely to go looking for and most needs.
                {
                  text: `${nav.evidence.unrunCells} of ${nav.evidence.cells} evidence cells unrun`,
                  link: '/evidence/capability-matrix',
                },
                {
                  text: `AT cells executed: ${nav.evidence.atExecuted} of ${nav.evidence.atCells}`,
                  link: '/evidence/at-matrix',
                },
              ]),
        ],
      },
    ],

    sidebar: {
      '/components/': componentSidebar,
      '/guide/': guideSidebar,
      '/evidence/': evidenceSidebar,
      '/': guideSidebar,
    },

    // Built in, offline, MiniSearch-backed — no extra dependency and no network
    // service. It indexes rendered page text, which is why every component page
    // prints its family as text rather than only carrying it in front matter.
    search: {
      provider: 'local',
      options: {
        // Component names are what people actually search for, so a heading
        // match outranks a body match. Without the boost, "overlays" surfaces
        // every compound part whose name contains the word before it surfaces
        // the Overlays family listing.
        miniSearch: {
          searchOptions: { boost: { title: 4, titles: 2, text: 1 }, fuzzy: 0.2, prefix: true },
        },
      },
    },

    outline: { level: [2, 3], label: 'On this page' },

    footer: {
      message:
        'Generated from packages/core/docs/component-meta.json. Locally built, not deployed — '
        + 'this site publishes the tip of main and is not versioned.',
      copyright: `metadata sourceCommit ${nav.sourceCommit.slice(0, 12)}`,
    },
  },
})
