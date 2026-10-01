import { expectKeyboardContract } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
/**
 * DzRadioGroup + DzRadio — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzRadio from './DzRadio.vue'
import { anatomy as radioGroupAnatomy } from './DzRadioGroup.anatomy.ts'
import DzRadioGroup from './DzRadioGroup.vue'

describe('dzRadioGroup — Unit Tests', () => {
  const mountGroup = (props: Record<string, unknown> = {}) =>
    mount(DzRadioGroup, {
      props: { 'modelValue': '', 'onUpdate:modelValue': () => {}, ...props },
      slots: {
        default: () => [
          h(DzRadio, { value: 'a' }, { default: () => 'Option A' }),
          h(DzRadio, { value: 'b' }, { default: () => 'Option B' }),
          h(DzRadio, { value: 'c' }, { default: () => 'Option C' }),
        ],
      },
    })

  it('renders radio options within a group', () => {
    const wrapper = mountGroup()
    expect(wrapper.findAllComponents(DzRadio)).toHaveLength(3)
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

  it('has contain: layout style on root element', () => {
    const wrapper = mountGroup()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      attrs: { class: 'custom-radio-group' },
      slots: {
        default: () => h(DzRadio, { value: 'a' }, { default: () => 'A' }),
      },
    })
    expect(wrapper.classes()).toContain('custom-radio-group')
  })
})

describe('dzRadio — Unit Tests', () => {
  it('renders a label element as root', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      slots: {
        default: () => h(DzRadio, { value: 'a' }, { default: () => 'Option A' }),
      },
    })
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.element.tagName).toBe('LABEL')
  })

  it('renders label text from default slot', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      slots: {
        default: () => h(DzRadio, { value: 'a' }, { default: () => 'My Option' }),
      },
    })
    expect(wrapper.text()).toContain('My Option')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      slots: {
        default: () => h(DzRadio, { value: 'a', disabled: true }, { default: () => 'A' }),
      },
    })
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.attributes('data-disabled')).toBe('')
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      slots: {
        default: () => h(DzRadio, { value: 'a' }, { default: () => 'A' }),
      },
    })
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.attributes('style')).toContain('contain: layout style')
  })
})

// ---------------------------------------------------------------------------
// RESIDUAL-13, closing RESIDUAL-12 §4 `F11` for this component's one
// `undetermined` row. `DzRadioGroup` renders `RadioGroupRoot` and a `<slot />`;
// the radios are the application's, so source cannot see who receives the
// declared Space. The arrows are Reka's `RovingFocusGroup` and were already
// backed — Space is the one the slot hid.
// ---------------------------------------------------------------------------

describe('dzRadioGroup — the declared Space, asserted where source cannot reach', () => {
  const mountGroup = (props: Record<string, unknown> = {}) =>
    mount(DzRadioGroup, {
      props: { 'modelValue': '', 'onUpdate:modelValue': () => {}, ...props },
      slots: {
        default: () => [
          h(DzRadio, { value: 'a' }, { default: () => 'Option A' }),
          h(DzRadio, { value: 'b' }, { default: () => 'Option B' }),
        ],
      },
      attachTo: document.body,
    })

  it('renders children whose own platform behaviour is the declared Space', () => {
    const wrapper = mountGroup()
    // Measured in Reka's own dist: `RadioGroupItem` prevents `enter` only, so
    // `handled: [' ']` would be false while the behaviour is correct. `platform`
    // asserts the true thing — a node in the rendered tree owns Space itself.
    expectKeyboardContract(wrapper, radioGroupAnatomy, { platform: [' '] })
    wrapper.unmount()
  })

  /**
   * "Move out of the group; the group is one tab stop." RESIDUAL-14 §4.2 left this
   * `undetermined` — the radios are the consumer's `<slot />` content — and
   * RESIDUAL-15 asserts it here, which is where the mechanism is visible.
   *
   * **The selector is the group's whole focusable surface, not the radios**, and
   * that is a measurement rather than a preference. Reka builds "one tab stop" on
   * the ROOT: `RovingFocusGroup.js` renders
   * `tabindex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0` on the
   * group, and `RovingFocusItem.js` renders `isCurrentTabStop ? 0 : -1` on each
   * item — so at rest the radiogroup is `0` and every radio is `-1`. Measured in
   * this component: `radiogroup=0 | radio=-1 | radio=-1`. Asserting over
   * `[role="radio"]` alone would read **zero** tab stops and call a correct
   * implementation broken; the union reads exactly one, which is the row.
   *
   * **The ticks are load-bearing.** `focusableItemsCount` is `0` during the root's
   * first render because the items register in their own `onMounted`, so the
   * synchronous DOM carries `radiogroup=-1` and the group looks unreachable.
   * Measured: `NONE-SYNC radiogroup=-1|radio=-1|radio=-1` →
   * `NONE-TICK radiogroup=0|radio=-1|radio=-1`.
   */
  it('is one tab stop, which is what the Tab row says', async () => {
    const wrapper = mountGroup()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expectKeyboardContract(wrapper, radioGroupAnatomy, {
      tabStops: { of: '[role="radiogroup"],[role="radio"]', expect: 'one' },
    })
    wrapper.unmount()
  })

  it('selects the focused radio through the activation Space produces', async () => {
    const wrapper = mountGroup()
    const radio = wrapper.findAll('[role="radio"]')[1]!

    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    radio.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)

    ;(radio.element as HTMLElement).click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('b')
    wrapper.unmount()
  })

  it('does not answer Space for a disabled group', async () => {
    const wrapper = mountGroup({ disabled: true })
    const radio = wrapper.findAll('[role="radio"]')[0]!

    ;(radio.element as HTMLElement).click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})
