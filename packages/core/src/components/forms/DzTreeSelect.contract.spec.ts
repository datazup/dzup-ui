import type { TreeNode } from './DzTreeSelect.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzTreeSelect — Contract Spec v1 conformance tests.
 *
 * Verifies props, ARIA combobox pattern, data attributes, and containment.
 */
import { describe, expect, it } from 'vitest'
import DzTreeSelect from './DzTreeSelect.vue'

const mockNodes: TreeNode[] = [
  {
    key: 'fruit',
    label: 'Fruit',
    children: [
      { key: 'apple', label: 'Apple' },
      { key: 'banana', label: 'Banana' },
    ],
  },
  { key: 'veg', label: 'Vegetable', disabled: true },
]

function trigger(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('[role="combobox"]')
}

describe('dzTreeSelect — Contract Spec v1', () => {
  // ── Props ──

  it('renders with required nodes prop', () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all InputVariant values', () => {
    const variants = ['outline', 'filled', 'underlined'] as const
    for (const variant of variants) {
      const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes, variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all selection modes', () => {
    const modes = ['single', 'multiple', 'checkbox'] as const
    for (const selectionMode of modes) {
      const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes, selectionMode } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── ARIA combobox pattern ──

  it('exposes a role="combobox" trigger', () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes } })
    expect(trigger(wrapper).exists()).toBe(true)
  })

  it('sets aria-haspopup and aria-controls on the trigger', () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes } })
    const el = trigger(wrapper)
    expect(el.attributes('aria-haspopup')).toBe('tree')
    expect(el.attributes('aria-controls')).toBeTruthy()
  })

  it('reflects collapsed state via aria-expanded=false by default', () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes } })
    expect(trigger(wrapper).attributes('aria-expanded')).toBe('false')
  })

  it('forwards aria-label to the trigger', () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes: mockNodes, ariaLabel: 'Category select' },
    })
    expect(trigger(wrapper).attributes('aria-label')).toBe('Category select')
  })

  // ── Data attributes / state ──

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes, disabled: true } })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('sets data-invalid when invalid', () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes, invalid: true } })
    expect(wrapper.find('[data-invalid]').exists()).toBe(true)
  })

  it('sets aria-invalid when invalid', () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes, invalid: true } })
    expect(trigger(wrapper).attributes('aria-invalid')).toBe('true')
  })

  // ── CSS containment ──

  it('has contain: layout style on the trigger element', () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes } })
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })

  // ── Class merging ──

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes: mockNodes },
      attrs: { class: 'my-tree-select' },
    })
    expect(trigger(wrapper).classes()).toContain('my-tree-select')
  })
})

describe('dzTreeSelect — renderer contract C1 value', () => {
  it('reads a value bound with the legacy v-model:value', () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes, value: 'apple' } })
    expect(wrapper.html()).toBeTruthy()
    expect(wrapper.text()).toContain('Apple')
  })

  it('reads a value bound with the default v-model', () => {
    const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes, modelValue: 'apple' } })
    expect(wrapper.text()).toContain('Apple')
  })
})
