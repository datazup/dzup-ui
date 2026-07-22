/**
 * Code-tab source resolution for every template (TASK-FREE3-12).
 *
 * `resolveTemplateSources` maps a registry `source` path onto the lazily-globbed
 * `?raw` chunk that `/templates/:slug`'s **Code** tab renders. Its miss path is
 * deliberately silent — an unknown path returns `[]` and the page shows "source
 * unavailable" rather than throwing — which is the right behaviour at runtime and
 * exactly why it needs a test: rename or move a template file and every visitor
 * gets the fallback, with nothing red anywhere. `templates/render.spec.ts` would
 * stay green throughout (it mounts the component, which Vite resolves through a
 * different glob).
 *
 * So this suite drives the resolver off `TEMPLATES` itself and actually LOADS
 * each chunk: the assertion is that the text arrives and is the file the registry
 * points at (an SFC opens with a block tag; a `data.ts` sibling is real TS), not
 * merely that a thunk exists. That is what makes it a drift guard rather than a
 * shape check.
 *
 * Cost note: it loads ~75 raw chunks, which is why they are fetched in one
 * `Promise.all` per template rather than per assertion. Measured well under a
 * second in total — these are file reads through Vite's transform, no mounting.
 */

import { describe, expect, it } from 'vitest'
import { resolveTemplateSources } from './rawSources.ts'
import { TEMPLATES } from './registry.ts'

describe('resolveTemplateSources — registry paths resolve to real source', () => {
  it('has a non-empty registry to check', () => {
    // Same reason build-counts.ts refuses to bake a zero: a suite that iterates
    // an empty list passes by testing nothing.
    expect(TEMPLATES.length).toBeGreaterThan(0)
  })

  it.each(TEMPLATES.map(template => ({ slug: template.slug, source: template.source })))(
    'loads the source of "$slug"',
    async ({ slug, source }) => {
      const files = resolveTemplateSources(source)

      expect(
        files.length,
        `Template "${slug}" resolves no source for ${source} — the Code tab would `
        + 'show its "unavailable" fallback to every visitor.',
      ).toBeGreaterThan(0)

      const [vue, ...siblings] = files
      // The template's own SFC comes first, named after the file the registry points at.
      expect(vue!.filename).toBe(source.slice(source.lastIndexOf('/') + 1))
      expect(vue!.language).toBe('vue')
      // Co-located siblings are the data file, always second and always TS.
      for (const sibling of siblings) {
        expect(sibling.filename).toBe('data.ts')
        expect(sibling.language).toBe('typescript')
      }

      const texts = await Promise.all(files.map(async file => file.load()))
      texts.forEach((text, index) => {
        const file = files[index]!
        expect(text.length, `${slug}/${file.filename} loaded empty`).toBeGreaterThan(0)
        // Enough to prove the chunk is the FILE and not, say, a resolved module
        // object or an error page: an SFC has a block tag, a data module exports.
        if (file.language === 'vue')
          expect(text).toMatch(/<(template|script)[\s>]/)
        else expect(text).toMatch(/\bexport\b/)
      })
    },
  )

  it('returns nothing for an unknown path instead of throwing', () => {
    // The degradation contract the detail page relies on.
    expect(resolveTemplateSources('apps/landing/src/templates/not-a-template/Nope.vue')).toEqual([])
  })

  it('ignores a path outside the templates root', () => {
    // Keys are normalised onto the registry's repo-root prefix; a block path
    // must not accidentally resolve through the template glob.
    expect(resolveTemplateSources('apps/landing/src/blocks/auth/SignIn.vue')).toEqual([])
  })
})
