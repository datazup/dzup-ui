/**
 * `validate:rtl` — the gate's own tests (TASK-R5-O2, closing N2-S1 **S1-D3**).
 *
 * S1-D3 was not "the regex is too narrow". It was that the two cases the
 * widening confuses — a real physical inset and the symmetric centring idiom —
 * are indistinguishable *once the source has been tokenised*, so widening the
 * pattern without changing the scan would have traded a false negative for a
 * false positive. These tests pin both halves of the fix, and the first one is
 * the assertion that would have caught the defect the rollout found:
 * `DzDialog`'s close control pinned `right-[var(--dz-spacing-4)]` while its
 * anatomy declared `mirrors: 'layout'`, green for as long as the gate existed.
 */

import { describe, expect, it } from 'vitest'
import { checkRtlDeclarations, physicalUtilitiesIn, rtlSourcesFor } from './rtl.ts'

describe('physicalUtilitiesIn — the S1-D3 widening', () => {
  it('reports a physical inline-end inset — the DzDialog close defect', () => {
    const source = `close: 'absolute right-[var(--dz-spacing-4)] top-[var(--dz-spacing-4)]',`

    const found = physicalUtilitiesIn(source)

    expect(found).toHaveLength(1)
    expect(found[0]?.utility).toBe('right-[var(--dz-spacing-4)]')
  })

  it('reports the fixed spelling as clean', () => {
    const source = `close: 'absolute inset-e-[var(--dz-spacing-4)] top-[var(--dz-spacing-4)]',`

    expect(physicalUtilitiesIn(source)).toEqual([])
  })

  it('does NOT report the centring idiom — a fractional inset is symmetric', () => {
    const source = `content: 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',`

    expect(physicalUtilitiesIn(source)).toEqual([])
  })

  it('still reports a real `left-1`, which a tokeniser cannot tell from `left-1/2`', () => {
    // This is the whole reason the scan moved from tokens to lines: splitting
    // on `[\w-]+` turns `left-1/2` into `left-1`, and the two are then the same
    // string. Line-scanning keeps the `/2` in view.
    expect(physicalUtilitiesIn(`item: 'absolute left-1 top-0',`)).toHaveLength(1)
  })

  it('reports the margin and padding utilities the original pattern covered', () => {
    expect(physicalUtilitiesIn(`header: 'ml-4 pr-2',`).map(hit => hit.utility))
      .toEqual(['ml-4', 'pr-2'])
  })

  it('does not report a word that merely ends in a side name', () => {
    // `bottom-right` is a variant KEY, not a utility: the side name is not
    // preceded by a separator, so it must not match.
    expect(physicalUtilitiesIn(`'bottom-right': 'fixed bottom-0',`)).toEqual([])
  })

  it('honours the rtl-physical-ok marker for the whole file', () => {
    const source = `// rtl-physical-ok — author-named corners\nposition: 'fixed right-0',`

    expect(physicalUtilitiesIn(source)).toEqual([])
  })
})

describe('rtlSourcesFor — the S1-F4a widening stays fixed', () => {
  it('returns the template as well as the variants file', () => {
    const sources = rtlSourcesFor([
      'packages/core/src/components/overlays/DzDialog.vue',
      'packages/core/stories/overlays/DzDialog.stories.ts',
    ])

    expect(sources).toContain('packages/core/src/components/overlays/DzDialog.vue')
    expect(sources).toContain('packages/core/src/components/overlays/DzDialog.variants.ts')
  })
})

describe('the catalogue itself', () => {
  it('has no component declaring mirrors: layout while using a physical utility', () => {
    // The aggregate claim, asserted here so a regression fails in `yarn test`
    // and not only in `yarn validate:all`.
    expect(checkRtlDeclarations()).toEqual([])
  })
})
