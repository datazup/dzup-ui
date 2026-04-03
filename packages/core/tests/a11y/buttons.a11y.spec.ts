/**
 * Accessibility tests for the buttons family.
 *
 * Uses vitest-axe to run axe-core against rendered components and assert
 * zero WCAG 2.1 AA violations.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { defineComponent, h } from 'vue'
import DzButton from '../../src/components/buttons/DzButton.vue'
import DzIconButton from '../../src/components/buttons/DzIconButton.vue'

// Minimal icon component stub for DzIconButton tests
const StubIcon = defineComponent({
  name: 'StubIcon',
  render() {
    return h('svg', { 'aria-hidden': 'true', 'viewBox': '0 0 24 24' }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
    ])
  },
})

describe('buttons family — Accessibility', () => {
  // ---------------------------------------------------------------------------
  // DzButton variants
  // ---------------------------------------------------------------------------

  describe('dzButton', () => {
    const variants = ['solid', 'outline', 'ghost', 'text', 'link'] as const

    for (const variant of variants) {
      it(`has no a11y violations with variant="${variant}"`, async () => {
        const { container } = render(DzButton, {
          props: { variant },
          slots: { default: 'Click me' },
        })
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
    }

    it('has no a11y violations when disabled', async () => {
      const { container } = render(DzButton, {
        props: { disabled: true },
        slots: { default: 'Disabled button' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when loading', async () => {
      const { container } = render(DzButton, {
        props: { loading: true },
        slots: { default: 'Loading...' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations with aria-label', async () => {
      const { container } = render(DzButton, {
        props: { ariaLabel: 'Save document' },
        slots: { default: 'Save' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('sets aria-disabled when disabled', () => {
      const { getByRole } = render(DzButton, {
        props: { disabled: true },
        slots: { default: 'Disabled' },
      })
      const button = getByRole('button')
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('sets aria-busy when loading', () => {
      const { getByRole } = render(DzButton, {
        props: { loading: true },
        slots: { default: 'Loading' },
      })
      const button = getByRole('button')
      expect(button).toHaveAttribute('aria-busy', 'true')
    })

    it('renders with type="button" by default (prevents accidental form submit)', () => {
      const { getByRole } = render(DzButton, {
        slots: { default: 'Click' },
      })
      const button = getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('renders as <a> with role="button" when href is provided', async () => {
      const { container, getByRole } = render(DzButton, {
        props: { href: '/test' },
        slots: { default: 'Link button' },
      })
      const link = getByRole('button')
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', '/test')

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzIconButton
  // ---------------------------------------------------------------------------

  describe('dzIconButton', () => {
    it('has no a11y violations with aria-label', async () => {
      const { container } = render(DzIconButton, {
        props: { icon: StubIcon, ariaLabel: 'Add item' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has accessible name from aria-label', () => {
      const { getByRole } = render(DzIconButton, {
        props: { icon: StubIcon, ariaLabel: 'Delete item' },
      })
      const button = getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Delete item')
    })

    it('hides the icon from assistive technology', () => {
      const { container } = render(DzIconButton, {
        props: { icon: StubIcon, ariaLabel: 'Edit' },
      })
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('has no a11y violations when disabled', async () => {
      const { container } = render(DzIconButton, {
        props: { icon: StubIcon, ariaLabel: 'Disabled action', disabled: true },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when loading', async () => {
      const { container } = render(DzIconButton, {
        props: { icon: StubIcon, ariaLabel: 'Loading action', loading: true },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
