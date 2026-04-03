/**
 * Accessibility tests for the typography family.
 *
 * Tests DzHeading, DzText, DzCode, DzBlockquote, and DzCaption for
 * WCAG 2.1 AA compliance using vitest-axe.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import DzBlockquote from '../../src/components/typography/DzBlockquote.vue'
import DzCaption from '../../src/components/typography/DzCaption.vue'
import DzCode from '../../src/components/typography/DzCode.vue'
import DzHeading from '../../src/components/typography/DzHeading.vue'
import DzText from '../../src/components/typography/DzText.vue'

describe('typography family — Accessibility', () => {
  // ---------------------------------------------------------------------------
  // DzHeading
  // ---------------------------------------------------------------------------

  describe('dzHeading', () => {
    const levels = [1, 2, 3, 4, 5, 6] as const

    for (const level of levels) {
      it(`has no a11y violations with level=${level}`, async () => {
        const { container } = render(DzHeading, {
          props: { level },
          slots: { default: `Heading ${level}` },
        })
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
    }

    it(`renders correct semantic element for each level`, () => {
      for (const level of levels) {
        const { container } = render(DzHeading, {
          props: { level },
          slots: { default: `H${level}` },
        })
        const heading = container.querySelector(`h${level}`)
        expect(heading).toBeTruthy()
      }
    })
  })

  // ---------------------------------------------------------------------------
  // DzText
  // ---------------------------------------------------------------------------

  describe('dzText', () => {
    it('has no a11y violations with paragraph text', async () => {
      const { container } = render(DzText, {
        slots: { default: 'This is a paragraph of text.' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when rendered as span', async () => {
      const { container } = render(DzText, {
        props: { as: 'span' },
        slots: { default: 'Inline text' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations with muted tone', async () => {
      const { container } = render(DzText, {
        props: { tone: 'muted' },
        slots: { default: 'Muted text' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzCode
  // ---------------------------------------------------------------------------

  describe('dzCode', () => {
    it('has no a11y violations with inline code', async () => {
      const { container } = render(DzCode, {
        slots: { default: 'const x = 42' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('renders as <code> element', () => {
      const { container } = render(DzCode, {
        slots: { default: 'npm install' },
      })
      const code = container.querySelector('code')
      expect(code).toBeTruthy()
    })
  })

  // ---------------------------------------------------------------------------
  // DzBlockquote
  // ---------------------------------------------------------------------------

  describe('dzBlockquote', () => {
    it('has no a11y violations with blockquote content', async () => {
      const { container } = render(DzBlockquote, {
        slots: { default: 'The only way to do great work is to love what you do.' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('renders as <blockquote> element', () => {
      const { container } = render(DzBlockquote, {
        slots: { default: 'A quote' },
      })
      const bq = container.querySelector('blockquote')
      expect(bq).toBeTruthy()
    })
  })

  // ---------------------------------------------------------------------------
  // DzCaption
  // ---------------------------------------------------------------------------

  describe('dzCaption', () => {
    it('has no a11y violations with caption text', async () => {
      const { container } = render(DzCaption, {
        slots: { default: 'Figure 1: Architecture diagram' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
