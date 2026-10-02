import { expectKeyboardContract } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
/**
 * DzCheckboxGroup — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzCheckbox from './DzCheckbox.vue'
import { anatomy as checkboxGroupAnatomy } from './DzCheckboxGroup.anatomy.ts'
import DzCheckboxGroup from './DzCheckboxGroup.vue'

describe('dzCheckboxGroup — Unit Tests', () => {
  const mountGroup = (props: Record<string, unknown> = {}) =>
    mount(DzCheckboxGroup, {
      props: { 'modelValue': [], 'onUpdate:modelValue': () => {}, ...props },
      slots: {
        default: () => [
          h(DzCheckbox, { value: 'a' }, { default: () => 'Option A' }),
          h(DzCheckbox, { value: 'b' }, { default: () => 'Option B' }),
          h(DzCheckbox, { value: 'c' }, { default: () => 'Option C' }),
        ],
      },
    })

  it('renders checkbox options within a group', () => {
    const wrapper = mountGroup()
    expect(wrapper.findAllComponents(DzCheckbox)).toHaveLength(3)
  })

  it('has role="group" on root element', () => {
    const wrapper = mountGroup()
    expect(wrapper.attributes('role')).toBe('group')
  })

  it('has vertical layout by default', () => {
    const wrapper = mountGroup()
    expect(wrapper.attributes('data-orientation')).toBe('vertical')
    expect(wrapper.classes()).toContain('flex-col')
  })

  it('supports horizontal orientation', () => {
    const wrapper = mountGroup({ orientation: 'horizontal' })
    expect(wrapper.attributes('data-orientation')).toBe('horizontal')
    expect(wrapper.classes()).toContain('flex-row')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mountGroup({ disabled: true })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('does not set data-disabled when not disabled', () => {
    const wrapper = mountGroup({ disabled: false })
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mountGroup()
    expect(wrapper.classes()).toContain('[contain:layout_style]')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { modelValue: [] },
      attrs: { class: 'custom-group' },
      slots: {
        default: () => h(DzCheckbox, { value: 'a' }, { default: () => 'A' }),
      },
    })
    expect(wrapper.classes()).toContain('custom-group')
  })

  it('forwards aria-label to root element', () => {
    const wrapper = mountGroup({ ariaLabel: 'Fruit selection' })
    expect(wrapper.attributes('aria-label')).toBe('Fruit selection')
  })

  it('forwards aria-labelledby to root element', () => {
    const wrapper = mountGroup({ ariaLabelledby: 'group-label' })
    expect(wrapper.attributes('aria-labelledby')).toBe('group-label')
  })

  it('forwards aria-describedby to root element', () => {
    const wrapper = mountGroup({ ariaDescribedby: 'group-desc' })
    expect(wrapper.attributes('aria-describedby')).toBe('group-desc')
  })

  it('forwards aria-invalid to root element', () => {
    const wrapper = mountGroup({ ariaInvalid: true })
    expect(wrapper.attributes('aria-invalid')).toBe('true')
  })

  it('omits aria-invalid when not invalid', () => {
    const wrapper = mountGroup()
    expect(wrapper.attributes('aria-invalid')).toBeUndefined()
  })

  it('forwards id to root element', () => {
    const wrapper = mountGroup({ id: 'my-group' })
    expect(wrapper.attributes('id')).toBe('my-group')
  })

  it('marks checked checkbox when value is in modelValue', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { 'modelValue': ['a'], 'onUpdate:modelValue': () => {} },
      slots: {
        default: () => [
          h(DzCheckbox, { value: 'a' }, { default: () => 'A' }),
          h(DzCheckbox, { value: 'b' }, { default: () => 'B' }),
        ],
      },
    })
    const checkboxes = wrapper.findAllComponents(DzCheckbox)
    expect(checkboxes.at(0)?.attributes('data-state')).toBe('checked')
    expect(checkboxes.at(1)?.attributes('data-state')).toBe('unchecked')
  })

  it('disables all children when group is disabled', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { modelValue: [], disabled: true },
      slots: {
        default: () => h(DzCheckbox, { value: 'a' }, { default: () => 'A' }),
      },
    })
    const checkbox = wrapper.findComponent(DzCheckbox)
    expect(checkbox.attributes('data-disabled')).toBe('')
  })
})

// ---------------------------------------------------------------------------
// RESIDUAL-13, closing RESIDUAL-12 §4 `F11` for this component's one
// `undetermined` row. `DzCheckboxGroup` is a `<div role="group">` and a
// `<slot />`, so `validate:anatomy-keyboard` cannot see who receives the declared
// Space — the checkboxes are the application's. A spec mounted with real children
// can, which is the whole of the mechanism.
// ---------------------------------------------------------------------------

describe('dzCheckboxGroup — the declared Space, asserted where source cannot reach', () => {
  const mountGroup = (props: Record<string, unknown> = {}) =>
    mount(DzCheckboxGroup, {
      props: { 'modelValue': [], 'onUpdate:modelValue': () => {}, ...props },
      slots: {
        default: () => [
          h(DzCheckbox, { value: 'a' }, { default: () => 'Option A' }),
          h(DzCheckbox, { value: 'b' }, { default: () => 'Option B' }),
        ],
      },
      attachTo: document.body,
    })

  it('renders children whose own platform behaviour is the declared Space', () => {
    const wrapper = mountGroup()
    // `platform: [' ']` is the runtime half: it looks at the RENDERED tree —
    // the consumer's children included — and fails unless something in it owns
    // Space natively. `handled` would be the wrong assertion: Reka's
    // `CheckboxRoot` prevents `enter` only, because Space on a `<button>` IS the
    // activation and preventing it would break the toggle.
    expectKeyboardContract(wrapper, checkboxGroupAnatomy, { platform: [' '] })
    wrapper.unmount()
  })

  it('gives every box its own tab stop, which is what the Tab row says', () => {
    const wrapper = mountGroup()
    const boxes = wrapper.findAll('[role="checkbox"]')
    expect(boxes).toHaveLength(2)
    for (const box of boxes)
      expect(box.attributes('disabled')).toBeUndefined()

    // The row itself, asserted rather than described (RESIDUAL-15, closing the
    // `Tab` half of RESIDUAL-14 §4.2). `expect: 'each'` is the direction that
    // matters: the old citation for this row was `RovingFocusItem.js`, which is
    // the mechanism that makes a group ONE tab stop — the opposite of what the
    // sentence promises. `platform: ['Tab']` cannot say this; see `tabStops`.
    expectKeyboardContract(wrapper, checkboxGroupAnatomy, {
      tabStops: { of: '[role="checkbox"]', expect: 'each' },
    })
    wrapper.unmount()
  })

  it('toggles the focused box through the activation Space produces', async () => {
    const wrapper = mountGroup()
    const box = wrapper.findAll('[role="checkbox"]')[1]!

    // jsdom synthesises no click from Space, so the two halves are asserted: the
    // group does not intercept the key, and the activation it produces toggles.
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    box.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)

    ;(box.element as HTMLElement).click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['b'])
    wrapper.unmount()
  })

  it('does not answer Space for a disabled group', async () => {
    const wrapper = mountGroup({ disabled: true })
    const box = wrapper.findAll('[role="checkbox"]')[0]!

    ;(box.element as HTMLElement).click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})
