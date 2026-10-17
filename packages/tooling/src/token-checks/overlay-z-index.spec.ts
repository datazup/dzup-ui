/**
 * Regression spec for the overlay stacking gate (UI-DZUP-UI-DESIGN-H-04, RF-02).
 *
 * Pins three things: every overlay slot resolves through the `--dz-*` layer
 * DESIGN.md names for it; the layer order the scale gives those slots is the
 * order the components need (a select inside a dialog, a toast over a
 * full-screen block); and no `fixed` surface regains a bare numeric z.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CURATED_LAYER_USAGE } from '../../../tokens/src/design-emit.ts'
import { Z_INDEX_SCALE } from '../../../tokens/src/primitives/z-index.ts'
import {
  checkSource,
  findAnchoredLine,
  FIXED_NUMERIC_Z_DEBT,
  OVERLAY_LAYERS,
  scanComponents,
} from './overlay-z-index.ts'

const REPO_ROOT = resolve(__dirname, '../../../..')

describe('overlay-z-index: every overlay slot names its layer', () => {
  for (const { file, anchor, layer } of OVERLAY_LAYERS) {
    it(`${file.split('/').pop()} [${anchor}] → ${layer}`, () => {
      const { line, error } = findAnchoredLine(readFileSync(resolve(REPO_ROOT, file), 'utf8'), anchor)
      expect(error).toBeUndefined()
      expect(line).toContain(`z-[var(${layer}`)
      expect(line).not.toMatch(/(?<![\w-])z-(?:\d+|\[\d+\])(?![\w-])/)
    })
  }
})

describe('overlay-z-index: the scale orders the surfaces the way they nest', () => {
  const z = (step: keyof typeof Z_INDEX_SCALE): number => Number(Z_INDEX_SCALE[step])

  it('a portaled listbox or menu opened inside a dialog paints above it', () => {
    expect(z('popover')).toBeGreaterThan(z('modal'))
  })

  it('a toast paints above a full-screen block and a tour mask', () => {
    expect(z('toast')).toBeGreaterThan(z('modal-backdrop'))
    expect(z('toast')).toBeGreaterThan(z('modal'))
  })

  it('a tooltip paints above a popover', () => {
    expect(z('tooltip')).toBeGreaterThan(z('popover'))
  })

  it('design.md says portaled menus live on popover and in-flow menus on dropdown', () => {
    expect(CURATED_LAYER_USAGE.popover).toMatch(/DzSelect/)
    expect(CURATED_LAYER_USAGE.dropdown).not.toMatch(/DzSelect/)
    expect(CURATED_LAYER_USAGE.dropdown).toMatch(/DzMegaMenu/)
  })
})

describe('overlay-z-index: no fixed surface carries a numeric z', () => {
  it('flags a numeric z on a fixed class string', () => {
    expect(checkSource(`const a = 'fixed inset-0 z-50'`, 'x.ts').map(v => v.match)).toEqual(['z-50'])
    expect(checkSource(`const a = "fixed z-[100] p-4"`, 'x.ts').map(v => v.match)).toEqual(['z-[100]'])
  })

  it('ignores token layers, negative z and non-fixed strings', () => {
    expect(checkSource(`'fixed z-[var(--dz-z-toast,1080)]'`, 'x.ts')).toEqual([])
    expect(checkSource(`'before:absolute before:-z-10'`, 'x.ts')).toEqual([])
    expect(checkSource(`'sticky top-0 z-10'`, 'x.ts')).toEqual([])
  })

  it('the repository matches the frozen debt list exactly (shrink-only)', () => {
    const found = scanComponents(REPO_ROOT).map(v => `${v.file}: ${v.match}`)
    expect(found).toEqual([...FIXED_NUMERIC_Z_DEBT])
  })
})
