import { mount } from '@vue/test-utils'
/**
 * DzToolbar -- Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzToolbar from './DzToolbar.vue'

describe('dzToolbar -- Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (variant=flat, size=md, role=toolbar)', () => {
    const wrapper = mount(DzToolbar, { slots: { start: '<button>A</button>' } })
    expect(wrapper.classes()).toContain('dz-toolbar')
    expect(wrapper.attributes('role')).toBe('toolbar')
    expect(wrapper.attributes('data-variant')).toBe('flat')
    expect(wrapper.attributes('data-size')).toBe('md')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzToolbar, {
        props: { size },
        slots: { start: '<button>A</button>' },
      })
      expect(wrapper.attributes('data-size')).toBe(size)
    }
  })

  it('accepts all surface variant values', () => {
    const variants = ['flat', 'outlined', 'elevated'] as const
    for (const variant of variants) {
      const wrapper = mount(DzToolbar, {
        props: { variant },
        slots: { start: '<button>A</button>' },
      })
      expect(wrapper.attributes('data-variant')).toBe(variant)
    }
  })

  // -- Dynamic element --

  it('renders as the specified HTML element via "as" prop', () => {
    const wrapper = mount(DzToolbar, {
      props: { as: 'nav' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.element.tagName).toBe('NAV')
  })

  it('renders as div by default', () => {
    const wrapper = mount(DzToolbar, { slots: { start: '<button>A</button>' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  // -- a11y --

  it('exposes role="toolbar"', () => {
    const wrapper = mount(DzToolbar, { slots: { start: '<button>A</button>' } })
    expect(wrapper.attributes('role')).toBe('toolbar')
  })

  it('defaults aria-orientation to horizontal', () => {
    const wrapper = mount(DzToolbar, { slots: { start: '<button>A</button>' } })
    expect(wrapper.attributes('aria-orientation')).toBe('horizontal')
  })

  it('reflects orientation prop in aria-orientation', () => {
    const wrapper = mount(DzToolbar, {
      props: { orientation: 'vertical' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzToolbar, {
      props: { ariaLabel: 'Editor actions' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Editor actions')
  })

  // -- Class merging (ADR-10) --

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzToolbar, {
      attrs: { class: 'my-toolbar' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).toContain('my-toolbar')
  })

  // -- Attribute forwarding --

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzToolbar, {
      attrs: { 'data-testid': 'toolbar' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.attributes('data-testid')).toBe('toolbar')
  })

  // -- Slots --

  it('renders start slot content', () => {
    const wrapper = mount(DzToolbar, {
      slots: { start: '<span data-testid="s">Start</span>' },
    })
    expect(wrapper.find('[data-testid="s"]').exists()).toBe(true)
  })
})
