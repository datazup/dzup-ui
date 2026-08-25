import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The landing **shell** must mirror with the writing direction (TASK-APP-1).
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 * `TASK-OSS-P4-05` made the component library right-to-left correct: 55 physical
 * `left`/`right` declarations across 26 variants files became logical, `DzTable`
 * stopped aligning every cell against the wrong edge, and `useTabs` stopped
 * hard-coding ArrowRight as "next". The landing app inherited none of it,
 * because the landing app does not use the library for its own chrome — it
 * hand-rolls the nav, the banner, the category tabs, the search bar and the
 * command palette in scoped CSS.
 *
 * The gap was invisible for a specific and slightly awkward reason: the app's
 * RTL certification (`e2e/block-responsive.spec.ts`) drives
 * `/blocks/preview/<id>?dir=rtl`, an **isolated preview route**. Only
 * `BlockPreviewPage.vue` and `templates/previewCustomiser.ts` ever call
 * `document.documentElement.setAttribute('dir', …)`. No ordinary landing route
 * can render right-to-left at all, so 27 physical declarations sat in the shell
 * with nothing able to notice.
 *
 * ── What this checks ────────────────────────────────────────────────────────
 * Every `<style>` block outside `src/blocks/` and `src/templates/` (which are
 * deliberately copy-pasteable snippet sources, governed separately) must use
 * logical properties — unless the file:line is in {@link DELIBERATE}, where a
 * physical value is the correct answer and the entry says why.
 *
 * This is a **ratchet, not a wall**: adding a genuinely physical declaration is
 * allowed, and costs one line of justification here.
 */

const SHELL_ROOT = resolve(import.meta.dirname)

/** Copy-pasteable snippet sources. Governed by the block responsive certification. */
const EXCLUDED_TREES = ['blocks', 'templates']

/**
 * Physical properties with a logical equivalent that changes meaning under
 * `dir="rtl"`.
 *
 * Deliberately not "any declaration containing left or right": `clip-path`,
 * `background-position` and transform functions take physical coordinates by
 * definition, and a rule that flagged them would be switched off within a week.
 * Same reasoning as the library's own `PHYSICAL_UTILITY` in
 * `@dzup-ui/testing`'s `rtl.ts`.
 */
const PHYSICAL_DECLARATION
  = /^\s*(?:left|right|margin-left|margin-right|padding-left|padding-right|border-left|border-right|text-align:\s*(?:left|right))\s*:/

/**
 * Physical on purpose — `file:line` → the reason.
 *
 * Three kinds, and the distinction is what keeps this list honest:
 *
 *  - **Centring.** `left: 50%` paired with `translateX(-50%)` is an axis
 *    midpoint, not a reading edge. It is identical in both directions.
 *  - **Decorative composition.** An aurora blob, a beam anchor or a glass
 *    highlight is a picture. Mirroring it would mirror the artwork, which is
 *    the library's own `mirrors: 'none'` case (ADR-19 / TASK-OSS-P4-05).
 *  - **JavaScript-driven geometry.** A drag handle or a sliding indicator whose
 *    offset comes from `getBoundingClientRect()` reads physical pixels. Making
 *    the CSS logical while the maths stays physical would put the two in
 *    disagreement — worse than either alone.
 */
const DELIBERATE: Record<string, string> = {
  // JavaScript-driven geometry
  'components/blocks/BlockCategoryNav.vue:231':
    'sliding tab indicator, positioned by translateX() from getBoundingClientRect',
  'components/blocks/BlockPreview.vue:1124':
    'resize handle pinned to the frame edge; the drag maths is physical px',
  'components/blocks/BlockPreview.vue:1133':
    'the same handle, pulled half its width outward so the grip straddles the edge',
  'components/blocks/BlockPreview.vue:1167':
    'the width readout, aligned to the physical handle above',
  'gallery/demos/TabsIndicatorSlideDemo.vue:114':
    'demo of a sliding indicator — the physical origin is the thing being demonstrated',
  'motion/components/DzCompare.vue:275':
    'comparison divider sitting at a pointer-driven x offset',

  // Centring
  'components/Hero.vue:141': 'centred with translateX(-50%)',
  'gallery/demos/AnimatedBeamDemo.vue:91': 'centred with translateX(-50%)',
  'motion/components/DzCircularText.vue:113': 'centred with translateX(-50%)',
  'motion/components/DzOrbit.vue:189': 'orbit centre',
  'motion/components/DzOrbit.vue:208': 'orbit centre',

  // Full-cover overlay origins
  'motion/components/DzBentoReveal.vue:198': 'full-cover overlay origin',
  'motion/components/DzCursor.vue:162': 'full-cover overlay origin',
  'motion/components/DzLens.vue:177': 'full-cover overlay origin',
  'motion/components/DzNativePopover.vue:237': 'full-cover overlay origin',
  'motion/components/DzSpotlight.vue:144': 'full-cover overlay origin',

  // Decorative composition
  'gallery/demos/AnimatedBeamDemo.vue:75': 'beam anchor — artwork, not text flow',
  'gallery/demos/AnimatedBeamDemo.vue:80': 'beam anchor — artwork, not text flow',
  'gallery/demos/AnimatedBeamDemo.vue:86': 'beam anchor — artwork, not text flow',
  'gallery/demos/GlassSurfaceDemo.vue:63': 'glass highlight blob — artwork',
  'gallery/demos/GlassSurfaceDemo.vue:69': 'glass highlight blob — artwork',
  'gallery/demos/GlassSurfaceDemo.vue:75': 'glass highlight blob — artwork',
  'motion/components/DzAurora.vue:57': 'aurora blob — artwork',
  'motion/components/DzAurora.vue:71': 'aurora blob — artwork',
}

function shellVueFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      if (dir === SHELL_ROOT && EXCLUDED_TREES.includes(name))
        continue
      shellVueFiles(path, out)
    }
    else if (name.endsWith('.vue')) {
      out.push(path)
    }
  }
  return out
}

function physicalDeclarations(): { key: string, declaration: string }[] {
  const found: { key: string, declaration: string }[] = []
  for (const path of shellVueFiles(SHELL_ROOT)) {
    const rel = relative(SHELL_ROOT, path).replaceAll('\\', '/')
    readFileSync(path, 'utf8').split('\n').forEach((line, index) => {
      if (PHYSICAL_DECLARATION.test(line))
        found.push({ key: `${rel}:${index + 1}`, declaration: line.trim() })
    })
  }
  return found
}

describe('the landing shell mirrors with the writing direction', () => {
  it('uses logical properties everywhere a physical one is not justified', () => {
    const undeclared = physicalDeclarations().filter(d => !(d.key in DELIBERATE))

    expect(
      undeclared.map(d => `${d.key}  ${d.declaration}`),
      'A physical left/right in the app shell does not mirror under dir="rtl". '
      + 'Use the logical equivalent (margin-inline-start, inset-inline-end, '
      + 'border-inline-start, text-align: start/end), or add the file:line to '
      + 'DELIBERATE above with the reason it is physical on purpose.',
    ).toEqual([])
  })

  it('keeps the deliberate list honest — every entry still points at a physical declaration', () => {
    const present = new Set(physicalDeclarations().map(d => d.key))
    const stale = Object.keys(DELIBERATE).filter(key => !present.has(key))

    expect(
      stale,
      'These DELIBERATE entries no longer match a physical declaration — the line '
      + 'moved or the property became logical. Delete them, or the list starts '
      + 'excusing declarations nobody has looked at.',
    ).toEqual([])
  })

  it('holds the count, so the shell cannot drift back one line at a time', () => {
    // 27 declarations were made logical by TASK-APP-1; 24 remain, all justified.
    // Lower this when more are converted. Never raise it without a DELIBERATE
    // entry explaining the new one.
    expect(physicalDeclarations().length).toBeLessThanOrEqual(24)
  })
})
