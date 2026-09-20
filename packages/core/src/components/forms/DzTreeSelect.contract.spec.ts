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

/**
 * N1-O1 defects **D4** and **D10** — recorded, NOT fixed here.
 *
 * **D4**: in multiple-selection mode each chip's remove control is a
 * `role="button"` span rendered INSIDE the `<button role="combobox">` trigger —
 * axe's `nested-interactive` rule and the HTML button content model. Same shape
 * and same routing as `DzCascader`'s clear control (owner decision **D98**).
 *
 * **D10**: the component declares one focus mechanism and operates another. It
 * is built as a `role="combobox"` that keeps DOM focus and publishes the active
 * node through `aria-activedescendant` (its own source comment says so), and
 * the popover then moves DOM focus onto the tree's roving `tabindex="0"` row.
 * The trigger advertises an `aria-activedescendant` it does not own, which APG
 * forbids. Both resolutions are real changes with real costs — owner decision
 * **D99**. The contradiction is pinned here so it cannot be resolved by accident
 * or drift unnoticed.
 */
describe('dzTreeSelect — D4/D10: recorded defects', () => {
  it('defect D4 -- a multiple-selection chip still carries its remove control inside the combobox', () => {
    const wrapper = mount(DzTreeSelect, {
      props: { nodes: mockNodes, selectionMode: 'multiple', value: ['apple'] },
    })

    const nested = wrapper.element.querySelectorAll('[role="combobox"] [role="button"]')
    expect(
      nested.length,
      'D4 appears to have MOVED. 0 means the remove control left the combobox '
      + 'button and the defect is fixed — delete this test and close D98.',
    ).toBe(1)
  })

  it('defect D10 -- the trigger still declares aria-activedescendant', () => {
    // Half of the contradiction, asserted from the declaring side. The other
    // half — that DOM focus lands on the tree row instead — is measured in
    // DzTreeSelect.spec.ts and in the Keyboard story's play function.
    const wrapper = mount(DzTreeSelect, { props: { nodes: mockNodes, defaultOpen: true } })

    expect(
      trigger(wrapper).attributes(),
      'D10 appears to have MOVED. If `aria-activedescendant` is gone the '
      + 'component chose "focus moves into the popup" — delete this test and '
      + 'close D99.',
    ).toHaveProperty('aria-activedescendant')
  })
})
