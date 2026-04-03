/**
 * Accessibility tests for the cards family.
 *
 * Tests DzCard, DzStatCard, and DzImageCard for WCAG 2.1 AA compliance
 * using vitest-axe.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import DzCard from '../../src/components/cards/DzCard.vue'
import DzImageCard from '../../src/components/cards/DzImageCard.vue'
import DzStatCard from '../../src/components/cards/DzStatCard.vue'

describe('cards family — Accessibility', () => {
  // ---------------------------------------------------------------------------
  // DzCard
  // ---------------------------------------------------------------------------

  describe('dzCard', () => {
    const variants = ['elevated', 'outlined', 'flat'] as const

    for (const variant of variants) {
      it(`has no a11y violations with variant="${variant}"`, async () => {
        const { container } = render(DzCard, {
          props: { variant },
          slots: { default: '<p>Card content</p>' },
        })
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
    }

    it('has no a11y violations with header and footer slots', async () => {
      const { container } = render(DzCard, {
        slots: {
          header: '<h3>Card Title</h3>',
          default: '<p>Card body content</p>',
          footer: '<p>Footer</p>',
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has role="button" and tabindex when clickable', () => {
      const { container } = render(DzCard, {
        props: { clickable: true },
        slots: { default: 'Clickable card' },
      })
      const card = container.firstElementChild!
      expect(card).toHaveAttribute('role', 'button')
      expect(card).toHaveAttribute('tabindex', '0')
    })

    it('has no a11y violations when clickable with aria-label', async () => {
      const { container } = render(DzCard, {
        props: { clickable: true },
        attrs: { 'aria-label': 'Open details' },
        slots: { default: 'Clickable card' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzStatCard
  // ---------------------------------------------------------------------------

  describe('dzStatCard', () => {
    it('has no a11y violations with label and value', async () => {
      const { container } = render(DzStatCard, {
        props: { label: 'Total Revenue', value: '$12,345' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations with trend indicator', async () => {
      const { container } = render(DzStatCard, {
        props: {
          label: 'Monthly Users',
          value: '1,234',
          trend: 'up',
          trendValue: '+12%',
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzImageCard
  // ---------------------------------------------------------------------------

  describe('dzImageCard', () => {
    it('has no a11y violations with alt text', async () => {
      const { container } = render(DzImageCard, {
        props: { src: '/test.jpg', alt: 'Test image' },
        slots: { default: '<p>Image card content</p>' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
