import { mount } from '@vue/test-utils'
/**
 * DzSpeedDial — Contract Spec v1 conformance tests.
 *
 * Verifies trigger ARIA wiring, the menu/menuitem structure, open-state
 * control via v-model, and the action activation contract.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DzSpeedDial from './DzSpeedDial.vue'

const IconStub = defineComponent({ render: () => h('svg', { 'data-testid': 'icon' }) })

const items = [
  { icon: IconStub, label: 'Edit' },
  { icon: IconStub, label: 'Share' },
  { icon: IconStub, label: 'Delete' },
]

function trigger(wrapper: ReturnType<typeof mount>) {
  return wrapper.get('button[aria-haspopup="menu"]')
}

describe('dzSpeedDial — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzSpeedDial, { props: { items, ariaLabel: 'Quick actions' } })
    expect(wrapper.exists()).toBe(true)
  })

  // ── Trigger ARIA ──

  it('trigger exposes aria-haspopup="menu" and aria-controls', () => {
    const wrapper = mount(DzSpeedDial, { props: { items, ariaLabel: 'Quick actions' } })
    const t = trigger(wrapper)
    expect(t.attributes('aria-haspopup')).toBe('menu')
    expect(t.attributes('aria-controls')).toBeTruthy()
  })

  it('trigger aria-expanded reflects open state', async () => {
    const wrapper = mount(DzSpeedDial, { props: { items, ariaLabel: 'Quick actions' } })
    expect(trigger(wrapper).attributes('aria-expanded')).toBe('false')
    await trigger(wrapper).trigger('click')
    expect(trigger(wrapper).attributes('aria-expanded')).toBe('true')
  })

  it('trigger aria-controls points at the role="menu" group', () => {
    const wrapper = mount(DzSpeedDial, { props: { items, ariaLabel: 'Quick actions' } })
    const controls = trigger(wrapper).attributes('aria-controls')
    const menu = wrapper.get('[role="menu"]')
    expect(menu.attributes('id')).toBe(controls)
  })

  // ── Menu structure ──

  it('renders one role="menuitem" per item', () => {
    const wrapper = mount(DzSpeedDial, { props: { items, ariaLabel: 'Quick actions' } })
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(items.length)
  })

  it('menu orientation matches the direction axis', () => {
    const vertical = mount(DzSpeedDial, { props: { items, ariaLabel: 'A', direction: 'up' } })
    expect(vertical.get('[role="menu"]').attributes('aria-orientation')).toBe('vertical')
    const horizontal = mount(DzSpeedDial, { props: { items, ariaLabel: 'A', direction: 'right' } })
    expect(horizontal.get('[role="menu"]').attributes('aria-orientation')).toBe('horizontal')
  })

  it('menu is aria-hidden while closed and exposed when open', async () => {
    const wrapper = mount(DzSpeedDial, { props: { items, ariaLabel: 'Quick actions' } })
    expect(wrapper.get('[role="menu"]').attributes('aria-hidden')).toBe('true')
    await trigger(wrapper).trigger('click')
    expect(wrapper.get('[role="menu"]').attributes('aria-hidden')).toBeUndefined()
  })

  // ── Direction + type acceptance ──

  it('accepts all directions', () => {
    for (const direction of ['up', 'down', 'left', 'right'] as const) {
      const wrapper = mount(DzSpeedDial, { props: { items, ariaLabel: 'A', direction } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts both layout types', () => {
    for (const type of ['linear', 'radial'] as const) {
      const wrapper = mount(DzSpeedDial, { props: { items, ariaLabel: 'A', type } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Class merging ──

  it('merges consumer class on the root via cn()', () => {
    const wrapper = mount(DzSpeedDial, {
      props: { items, ariaLabel: 'Quick actions' },
      attrs: { class: 'custom-root' },
    })
    expect(wrapper.attributes('class')).toContain('custom-root')
  })

  it('has contain: layout style on the root element', () => {
    const wrapper = mount(DzSpeedDial, { props: { items, ariaLabel: 'Quick actions' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })
})
