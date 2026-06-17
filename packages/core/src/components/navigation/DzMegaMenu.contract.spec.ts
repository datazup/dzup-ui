import type { DzMegaMenuItem } from './DzMegaMenu.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzMegaMenu — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzMegaMenu from './DzMegaMenu.vue'

const items: DzMegaMenuItem[] = [
  {
    label: 'Products',
    items: [
      { label: 'Analytics', items: [{ label: 'Dashboards', href: '/dash' }] },
      { label: 'Data', items: [{ label: 'Pipelines', href: '/pipe' }] },
    ],
  },
  { label: 'Docs', href: '/docs' },
]

describe('dzMegaMenu — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzMegaMenu, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzMegaMenu, { props: { items } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('exposes the dz-mega-menu root class for token scoping', () => {
    const wrapper = mount(DzMegaMenu, { props: { items } })
    expect(wrapper.classes()).toContain('dz-mega-menu')
  })

  it('renders a role="menubar" surface', () => {
    const wrapper = mount(DzMegaMenu, { props: { items } })
    expect(wrapper.find('[role="menubar"]').exists()).toBe(true)
  })

  it('renders a role="menuitem" trigger per top-level item', () => {
    const wrapper = mount(DzMegaMenu, { props: { items } })
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(items.length)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzMegaMenu, { props: { items, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label to the menubar', () => {
    const wrapper = mount(DzMegaMenu, { props: { items, ariaLabel: 'Main navigation' } })
    expect(wrapper.find('[role="menubar"]').attributes('aria-label')).toBe('Main navigation')
  })

  it('applies exactly one roving tabindex=0 among triggers', () => {
    const wrapper = mount(DzMegaMenu, { props: { items } })
    const tabbable = wrapper.findAll('[data-mega-trigger]').filter(t => t.attributes('tabindex') === '0')
    expect(tabbable).toHaveLength(1)
  })

  it('sets aria-orientation on the menubar', () => {
    const wrapper = mount(DzMegaMenu, { props: { items, orientation: 'vertical' } })
    expect(wrapper.find('[role="menubar"]').attributes('aria-orientation')).toBe('vertical')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzMegaMenu, { props: { items }, attrs: { class: 'custom-class' } })
    expect(wrapper.classes()).toContain('custom-class')
  })

  it('marks panel triggers with aria-haspopup', () => {
    const wrapper = mount(DzMegaMenu, { props: { items } })
    const trigger = wrapper.get('[data-mega-trigger="0"]')
    expect(trigger.attributes('aria-haspopup')).toBe('true')
  })
})
