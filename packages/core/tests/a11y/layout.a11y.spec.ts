/**
 * Accessibility tests for the layout family.
 *
 * Tests DzDivider, DzGrid, DzFlex, DzStack, DzContainer, DzCollapse,
 * and DzScrollArea for WCAG 2.1 AA compliance using vitest-axe.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import DzCollapse from '../../src/components/layout/DzCollapse.vue'
import DzContainer from '../../src/components/layout/DzContainer.vue'
import DzDivider from '../../src/components/layout/DzDivider.vue'
import DzFlex from '../../src/components/layout/DzFlex.vue'
import DzGrid from '../../src/components/layout/DzGrid.vue'
import DzScrollArea from '../../src/components/layout/DzScrollArea.vue'
import DzStack from '../../src/components/layout/DzStack.vue'

describe('layout family — Accessibility', () => {
  // ---------------------------------------------------------------------------
  // DzDivider
  // ---------------------------------------------------------------------------

  describe('dzDivider', () => {
    it('has no a11y violations with horizontal orientation', async () => {
      const { container } = render(DzDivider, {
        props: { orientation: 'horizontal' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations with vertical orientation', async () => {
      const { container } = render(DzDivider, {
        props: { orientation: 'vertical' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has role="separator" by default', () => {
      const { container } = render(DzDivider)
      const divider = container.firstElementChild!
      expect(divider).toHaveAttribute('role', 'separator')
    })

    it('has role="none" when decorative', () => {
      const { container } = render(DzDivider, {
        props: { decorative: true },
      })
      const divider = container.firstElementChild!
      expect(divider).toHaveAttribute('role', 'none')
    })
  })

  // ---------------------------------------------------------------------------
  // DzGrid
  // ---------------------------------------------------------------------------

  describe('dzGrid', () => {
    it('has no a11y violations with grid layout', async () => {
      const { container } = render(DzGrid, {
        props: { cols: 3, gap: 'md' },
        slots: {
          default: '<div>Cell 1</div><div>Cell 2</div><div>Cell 3</div>',
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzFlex
  // ---------------------------------------------------------------------------

  describe('dzFlex', () => {
    it('has no a11y violations with flex layout', async () => {
      const { container } = render(DzFlex, {
        props: { gap: 'md' },
        slots: {
          default: '<span>Item 1</span><span>Item 2</span>',
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzStack
  // ---------------------------------------------------------------------------

  describe('dzStack', () => {
    it('has no a11y violations with stack layout', async () => {
      const { container } = render(DzStack, {
        props: { gap: 'md' },
        slots: {
          default: '<p>Row 1</p><p>Row 2</p>',
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzContainer
  // ---------------------------------------------------------------------------

  describe('dzContainer', () => {
    it('has no a11y violations with content', async () => {
      const { container } = render(DzContainer, {
        slots: { default: '<p>Contained content</p>' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzCollapse
  // ---------------------------------------------------------------------------

  describe('dzCollapse', () => {
    it('has no a11y violations when expanded', async () => {
      const { container } = render(DzCollapse, {
        props: { modelValue: true },
        slots: { default: '<p>Collapsible content</p>' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzScrollArea
  // ---------------------------------------------------------------------------

  describe('dzScrollArea', () => {
    it('has no a11y violations with scrollable content', async () => {
      const { container } = render(DzScrollArea, {
        slots: { default: '<div style="height:200px">Tall content</div>' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
