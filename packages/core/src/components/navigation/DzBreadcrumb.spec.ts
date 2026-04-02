import { mount } from '@vue/test-utils'
/**
 * DzBreadcrumb — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
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

describe('dzBreadcrumb — Unit Tests', () => {
  it('renders correct number of list items', () => {
    const wrapper = mountBreadcrumb()
    const listItems = wrapper.findAll('li')
    // 3 items + 2 separators = 5
    expect(listItems.length).toBe(5)
  })

  it('renders links as <a> elements', () => {
    const wrapper = mountBreadcrumb()
    const links = wrapper.findAll('a')
    expect(links.length).toBe(2)
  })

  it('renders first link pointing to /', () => {
    const wrapper = mountBreadcrumb()
    const links = wrapper.findAll('a')
    expect(links[0]!.attributes('href')).toBe('/')
  })

  it('renders second link pointing to /products', () => {
    const wrapper = mountBreadcrumb()
    const links = wrapper.findAll('a')
    expect(links[1]!.attributes('href')).toBe('/products')
  })

  it('renders current item as span', () => {
    const wrapper = mountBreadcrumb()
    const current = wrapper.find('[aria-current="page"]')
    expect(current.element.tagName).toBe('SPAN')
    expect(current.text()).toBe('Widget')
  })

  it('does not render link for current item', () => {
    const wrapper = mount(DzBreadcrumb, {
      slots: {
        default: () => h(DzBreadcrumbItem, { href: '/page', current: true }, () => 'Current'),
      },
    })
    // Current items should be span, not anchor, even with href
    const current = wrapper.find('[aria-current="page"]')
    expect(current.element.tagName).toBe('SPAN')
  })

  it('applies separator from parent context', () => {
    const wrapper = mount(DzBreadcrumb, {
      props: { separator: '>' },
      slots: {
        default: () => [
          h(DzBreadcrumbItem, { href: '/' }, () => 'Home'),
          h(DzBreadcrumbSeparator),
          h(DzBreadcrumbItem, { current: true }, () => 'Page'),
        ],
      },
    })
    const separator = wrapper.find('[aria-hidden="true"]')
    expect(separator.text()).toBe('>')
  })

  it('allows per-separator override', () => {
    const wrapper = mount(DzBreadcrumb, {
      props: { separator: '/' },
      slots: {
        default: () => [
          h(DzBreadcrumbItem, { href: '/' }, () => 'Home'),
          h(DzBreadcrumbSeparator, { separator: '|' }),
          h(DzBreadcrumbItem, { current: true }, () => 'Page'),
        ],
      },
    })
    const separator = wrapper.find('[aria-hidden="true"]')
    expect(separator.text()).toBe('|')
  })

  it('renders custom separator slot content', () => {
    const wrapper = mount(DzBreadcrumb, {
      slots: {
        default: () => [
          h(DzBreadcrumbItem, { href: '/' }, () => 'Home'),
          h(DzBreadcrumbSeparator, {}, () => h('span', { 'data-testid': 'custom-sep' }, '--')),
          h(DzBreadcrumbItem, { current: true }, () => 'Page'),
        ],
      },
    })
    const custom = wrapper.find('[data-testid="custom-sep"]')
    expect(custom.exists()).toBe(true)
    expect(custom.text()).toBe('--')
  })

  it('hides separators from screen readers', () => {
    const wrapper = mountBreadcrumb()
    const separators = wrapper.findAll('[aria-hidden="true"]')
    expect(separators.length).toBe(2)
    separators.forEach((sep) => {
      expect(sep.attributes('role')).toBe('presentation')
    })
  })

  it('renders disabled item as non-interactive', () => {
    const wrapper = mount(DzBreadcrumb, {
      slots: {
        default: () => [
          h(DzBreadcrumbItem, { href: '/page', disabled: true }, () => 'Disabled'),
        ],
      },
    })
    // Disabled link should render as span, not anchor
    const disabled = wrapper.find('[data-disabled]')
    expect(disabled.exists()).toBe(true)
    expect(disabled.element.tagName).toBe('SPAN')
  })

  it('merges custom class on DzBreadcrumbItem', () => {
    const wrapper = mount(DzBreadcrumb, {
      slots: {
        default: () => h(DzBreadcrumbItem, { href: '/', class: 'custom-item' }, () => 'Home'),
      },
    })
    const link = wrapper.find('a')
    expect(link.classes()).toContain('custom-item')
  })

  it('merges custom class on DzBreadcrumbSeparator', () => {
    const wrapper = mount(DzBreadcrumb, {
      slots: {
        default: () => [
          h(DzBreadcrumbItem, { href: '/' }, () => 'Home'),
          h(DzBreadcrumbSeparator, { class: 'custom-sep' }),
        ],
      },
    })
    const sep = wrapper.find('[aria-hidden="true"]')
    expect(sep.classes()).toContain('custom-sep')
  })

  it('renders correctly with single item (no separator needed)', () => {
    const wrapper = mount(DzBreadcrumb, {
      slots: {
        default: () => h(DzBreadcrumbItem, { current: true }, () => 'Home'),
      },
    })
    expect(wrapper.text()).toBe('Home')
    expect(wrapper.findAll('[aria-hidden="true"]').length).toBe(0)
  })
})
