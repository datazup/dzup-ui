import { mount } from '@vue/test-utils'
/**
 * DzBreadcrumb — Contract Spec v1 conformance tests.
 *
 * Verifies props, slots, ARIA attributes, and compound context
 * for the Breadcrumb family.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h, inject } from 'vue'
import { DZ_BREADCRUMB_KEY } from './DzBreadcrumb.types.ts'
import DzBreadcrumb from './DzBreadcrumb.vue'
import DzBreadcrumbItem from './DzBreadcrumbItem.vue'
import DzBreadcrumbSeparator from './DzBreadcrumbSeparator.vue'

/** Helper to mount a complete breadcrumb */
function mountBreadcrumb(props: Record<string, unknown> = {}) {
  return mount(DzBreadcrumb, {
    props,
    slots: {
      default: () => [
        h(DzBreadcrumbItem, { href: '/' }, () => 'Home'),
        h(DzBreadcrumbSeparator),
        h(DzBreadcrumbItem, { href: '/products' }, () => 'Products'),
        h(DzBreadcrumbSeparator),
        h(DzBreadcrumbItem, { current: true }, () => 'Widget'),
      ],
    },
  })
}

describe('dzBreadcrumb — Contract Spec v1', () => {
  // ── Structure ──

  it('renders a <nav> element', () => {
    const wrapper = mountBreadcrumb()
    expect(wrapper.find('nav').exists()).toBe(true)
  })

  it('renders an ordered list inside the nav', () => {
    const wrapper = mountBreadcrumb()
    expect(wrapper.find('nav > ol').exists()).toBe(true)
  })

  // ── ARIA ──

  it('sets aria-label="Breadcrumb" by default', () => {
    const wrapper = mountBreadcrumb()
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Breadcrumb')
  })

  it('allows custom aria-label', () => {
    const wrapper = mountBreadcrumb({ ariaLabel: 'Page path' })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Page path')
  })

  it('sets aria-current="page" on current item', () => {
    const wrapper = mountBreadcrumb()
    const current = wrapper.find('[aria-current="page"]')
    expect(current.exists()).toBe(true)
    expect(current.text()).toBe('Widget')
  })

  it('renders links for non-current items with href', () => {
    const wrapper = mountBreadcrumb()
    const links = wrapper.findAll('a')
    expect(links.length).toBe(2)
    expect(links[0]!.attributes('href')).toBe('/')
    expect(links[1]!.attributes('href')).toBe('/products')
  })

  it('renders span for current item (no link)', () => {
    const wrapper = mountBreadcrumb()
    const currentItem = wrapper.find('[aria-current="page"]')
    expect(currentItem.element.tagName).toBe('SPAN')
  })

  // ── Separator ──

  it('renders separator between items', () => {
    const wrapper = mountBreadcrumb()
    const separators = wrapper.findAll('[aria-hidden="true"]')
    expect(separators.length).toBe(2)
  })

  it('uses default "/" separator', () => {
    const wrapper = mountBreadcrumb()
    const separators = wrapper.findAll('[aria-hidden="true"]')
    expect(separators[0]!.text()).toBe('/')
  })

  it('uses custom separator from prop', () => {
    const wrapper = mountBreadcrumb({ separator: '>' })
    const separators = wrapper.findAll('[aria-hidden="true"]')
    expect(separators[0]!.text()).toBe('>')
  })

  // ── Props ──

  it('accepts separator prop', () => {
    const wrapper = mountBreadcrumb({ separator: '|' })
    expect(wrapper.exists()).toBe(true)
  })

  it('forwards id to nav element', () => {
    const wrapper = mountBreadcrumb({ id: 'bc-nav' })
    expect(wrapper.find('nav').attributes('id')).toBe('bc-nav')
  })

  // ── Disabled item ──

  it('sets data-disabled on disabled breadcrumb item', () => {
    const wrapper = mount(DzBreadcrumb, {
      slots: {
        default: () => [
          h(DzBreadcrumbItem, { disabled: true }, () => 'Disabled'),
        ],
      },
    })
    const disabled = wrapper.find('[data-disabled]')
    expect(disabled.exists()).toBe(true)
  })

  it('sets aria-disabled on disabled breadcrumb item', () => {
    const wrapper = mount(DzBreadcrumb, {
      slots: {
        default: () => [
          h(DzBreadcrumbItem, { disabled: true }, () => 'Disabled'),
        ],
      },
    })
    const disabled = wrapper.find('[aria-disabled]')
    expect(disabled.exists()).toBe(true)
  })

  // ── Compound context (ADR-08) ──

  it('provides DZ_BREADCRUMB_KEY context to children', () => {
    let contextReceived = false
    const ContextChecker = defineComponent({
      setup() {
        const ctx = inject(DZ_BREADCRUMB_KEY, null)
        contextReceived = ctx !== null
        return () => h('div', 'checker')
      },
    })

    mount(DzBreadcrumb, {
      slots: {
        default: () => h(ContextChecker),
      },
    })

    expect(contextReceived).toBe(true)
  })

  // ── Slots ──

  it('renders default slot content', () => {
    const wrapper = mountBreadcrumb()
    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Products')
    expect(wrapper.text()).toContain('Widget')
  })

  // ── Class merging ──

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzBreadcrumb, {
      attrs: { class: 'my-breadcrumb' },
      slots: {
        default: () => h(DzBreadcrumbItem, { href: '/' }, () => 'Home'),
      },
    })
    expect(wrapper.find('nav').classes()).toContain('my-breadcrumb')
  })
})
