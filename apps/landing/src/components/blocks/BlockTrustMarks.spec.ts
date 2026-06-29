/**
 * BlockTrustMarks — the trust-mark UI is itself accessible, and honest (Task I3).
 *
 * Two things this guards, both required by docs/blocks.md §3.6:
 *   1. The marks render with a *text* label (never colour alone) and an AT-readable
 *      description of what each certifies, and the badge group passes axe.
 *   2. A block carrying known a11y debt renders NO marks — absence is the signal,
 *      so the catalog never shows a mark its CI can't back.
 */

import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import BlockTrustMarks from './BlockTrustMarks.vue'
import { CERTIFICATIONS, KNOWN_A11Y_DEBT } from '../../blocks/certifications.ts'

/** A block known to carry a11y debt (uncertified) — there is at least one. */
const DEBT_ID = Object.keys(KNOWN_A11Y_DEBT)[0]!

describe('BlockTrustMarks', () => {
  it('renders one labelled badge per certification for a certified block', () => {
    const { getByRole } = render(BlockTrustMarks, { props: { blockId: 'hero-centered' } })
    const group = getByRole('list', { name: /verified in ci/i })
    const items = group.querySelectorAll('li')
    expect(items).toHaveLength(CERTIFICATIONS.length)
    // Each mark carries its visible text label (not colour-only) ...
    for (const mark of CERTIFICATIONS) {
      expect(group.textContent).toContain(mark.label)
      // ... and the full guarantee, available to assistive tech.
      expect(group.textContent).toContain(mark.certifies)
    }
  })

  it('exposes what each mark certifies via the badge title (sighted hover)', () => {
    const { container } = render(BlockTrustMarks, { props: { blockId: 'hero-centered' } })
    const titles = [...container.querySelectorAll('[title]')].map((el) => el.getAttribute('title'))
    for (const mark of CERTIFICATIONS) {
      expect(titles).toContain(mark.certifies)
    }
  })

  it('has no a11y violations itself', async () => {
    const { container } = render(BlockTrustMarks, { props: { blockId: 'hero-centered' } })
    const results = await axe(container)
    // Assert directly (rather than the vitest-axe matcher, whose type augmentation
    // isn't in scope under the landing tsconfig): the mark must be fully clean.
    expect(results.violations).toEqual([])
  })

  it('renders nothing for a block with known a11y debt (no unbacked mark)', () => {
    const { container } = render(BlockTrustMarks, { props: { blockId: DEBT_ID } })
    expect(container.querySelector('ul')).toBeNull()
    expect(container.textContent?.trim()).toBe('')
  })
})
