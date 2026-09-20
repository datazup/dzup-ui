import { describe, expect, it } from 'vitest'
import {
  buildInventory,
  classifyBound,
  classifyStatic,
  readInventory,
} from '../../tooling/src/security/inline-style-inventory.ts'

/**
 * The inline-`style` inventory is a **gate**, not a note (TASK-R2-O4).
 *
 * TASK-N1-O5 recorded 78 static `style=` files and 38 `:style` files as finding
 * F-C1 and moved on, which is the right call for a fixture packet and the wrong
 * state to leave a measurement in: a number in a report goes stale the day after
 * it is written, and the next agent re-derives it by hand — the failure mode
 * this program has already paid for three times (D27's hand-typed 19, which had
 * undercounted by four times).
 *
 * So the artifact is regenerated from source and pinned here, and the pin fails
 * in **both directions**: a new inline style raises a count and is refused, and
 * a removed one makes the pin stale and is refused until the ceiling is lowered.
 * That is the same shape `security-deviations.json` runs on, for the same
 * reason.
 */

describe('inline-style inventory', () => {
  const artifact = readInventory()
  const measured = buildInventory()

  it('is fresh — the artifact and the source agree, site for site', () => {
    expect(measured.sites).toEqual(artifact.sites)
  })

  it('still measures what TASK-N1-O5 measured, which is what makes it comparable', () => {
    // F-C1's two numbers, re-derived by a different program at a different
    // commit. They agree, so the classification below is a classification OF
    // that finding rather than a second, differently-scoped count.
    expect(artifact.totals.staticFiles).toBe(78)
    expect(artifact.totals.boundFiles).toBe(38)
  })

  it('holds every disposition at or below its ceiling', () => {
    // Downward-only. Lower a number here when the sites go away; raising one is
    // how a CSP claim quietly stops being true.
    const ceilings = {
      'recipe-movable': 78,
      'layout-static': 3,
      'custom-property': 0,
      'required-dynamic': 19,
      'unclassified-binding': 33,
    } as const

    for (const [disposition, ceiling] of Object.entries(ceilings)) {
      expect(
        artifact.totals.byDisposition[disposition as keyof typeof ceilings],
        `${disposition} rose above its ceiling — every site here is dropped by a strict `
        + '`style-src`, so a new one is a CSP claim getting less true.',
      ).toBeLessThanOrEqual(ceiling)
    }
  })

  it('gives every site a file, a line and a disposition', () => {
    for (const site of artifact.sites) {
      expect(site.file, site.source).toMatch(/^packages\/core\/src\/.+\.vue$/)
      expect(site.line, site.file).toBeGreaterThan(0)
      expect(['static', 'bound'], site.file).toContain(site.kind)
    }
  })

  it('classifies a containment attribute as recipe-movable — the case that was proved to matter', () => {
    // `DzFileUpload` carried `style="contain: layout style"`, a strict CSP
    // dropped it, and what it dropped was the containment the hostile corpus
    // relies on to keep a 4 096-character file name inside the component box.
    // The remedy is in the repo already: `[contain:layout_style]` in the recipe.
    expect(classifyStatic('contain: layout style')).toBe('recipe-movable')
    expect(classifyStatic('width: 100%')).toBe('layout-static')
  })

  it('does not claim a disposition it cannot see', () => {
    expect(classifyBound('rootStyle')).toBe('unclassified-binding')
    expect(classifyBound('{ \'--dz-anchor-indent\': indent }')).toBe('custom-property')
    // The `$` and the `{` are split so this file contains no literal `${` in a
    // plain string: the scanner's input IS a template literal from another
    // file, quoted verbatim, and `no-template-curly-in-string` cannot tell the
    // difference between quoting one and forgetting a backtick.
    expect(classifyBound(`{ clipPath: \`inset(0 0 0 $${'{pct}'}%)\` }`)).toBe('required-dynamic')
  })

  it('confirms DzFileUpload is out of the static half, which is where N1-O5 left it', () => {
    const upload = artifact.sites.filter(
      s => s.file.endsWith('DzFileUpload.vue') && s.kind === 'static',
    )
    expect(upload).toEqual([])
  })
})
