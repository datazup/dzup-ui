/**
 * check-template-previews — the build guard that makes a missing template preview
 * a BUILD FAILURE (FREE2-09).
 *
 * The Templates gallery sells the site's most valuable artifacts (full pages that
 * took the longest to build), so every card must show a real screenshot of the
 * template in BOTH themes — never a generic Lucide glyph. Before this guard,
 * `TemplatesPage.vue` caught a missing image at runtime with an `onerror` → icon
 * fallback: a finished template could quietly render an empty-looking card, and a
 * newly-added template with no thumbnail shipped that way undetected.
 *
 * This replaces that silent runtime fallback with a loud build-time check: for
 * EVERY template in the registry, assert both
 *   • `public/templates/thumbnails/<slug>.webp`       (light)
 *   • `public/templates/thumbnails/<slug>-dark.webp`  (dark)
 * exist on disk. A miss fails the build and names the gap + the fix. That
 * guarantee is what let the gallery drop its icon fallback entirely.
 *
 * Why a Vite SSR load: `src/templates/registry.ts` pairs each entry with its
 * `?raw` source via module-level `import.meta.glob`, which only a Vite transform
 * resolves — so, exactly like build-sitemap.ts, we spin up Vite in middleware mode
 * and `ssrLoadModule` the registry to read the real slugs (loaders never run).
 *
 * Run with `yarn check:previews` (from apps/landing); wired into the `build`
 * chain ahead of `vite build`. Pixels themselves are produced by the separate,
 * heavy `yarn thumbnails` (Playwright) — this only checks they are present.
 */

import type { TemplateMeta } from '../src/templates/registry.ts'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')
const THUMBS_DIR = resolve(LANDING_ROOT, 'public', 'templates', 'thumbnails')

/** Load the real registry via a throwaway Vite SSR server (see file header). */
async function loadTemplates(): Promise<TemplateMeta[]> {
  const server = await createServer({
    root: LANDING_ROOT,
    logLevel: 'warn',
    appType: 'custom',
    server: { middlewareMode: true },
  })
  try {
    const mod = (await server.ssrLoadModule('/src/templates/registry.ts')) as {
      TEMPLATES: TemplateMeta[]
    }
    return mod.TEMPLATES
  }
  finally {
    await server.close()
  }
}

async function main(): Promise<void> {
  const templates = await loadTemplates()
  if (templates.length === 0)
    throw new Error('Registry has no templates — refusing to pass a preview check over nothing.')

  const missing: string[] = []
  for (const template of templates) {
    for (const variant of ['', '-dark'] as const) {
      const file = resolve(THUMBS_DIR, `${template.slug}${variant}.webp`)
      if (!existsSync(file))
        missing.push(`${template.slug}${variant}.webp (${variant === '-dark' ? 'dark' : 'light'})`)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `${missing.length} template preview(s) missing — every template needs a light AND dark `
      + `thumbnail:\n  - ${missing.join('\n  - ')}\n`
      + `Generate them with \`yarn thumbnails --missing\` (fills only the gaps), then commit `
      + `public/templates/thumbnails/.`,
    )
  }

  console.log(
    `✓ check-template-previews: all ${templates.length} templates have light + dark thumbnails `
    + `(${templates.length * 2} files).`,
  )
}

main().catch((error: unknown) => {
  console.error(`\n✗ check-template-previews failed: ${(error as Error).message}\n`)
  process.exitCode = 1
})
