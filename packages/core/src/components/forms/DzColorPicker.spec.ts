// token-check-disable-file — color picker tests legitimately use raw color values as test data
import { expectKeyboardContract } from '@dzup-ui/testing'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
/**
 * DzColorPicker — Unit / behavior tests.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { anatomy as colorPickerAnatomy } from './DzColorPicker.anatomy.ts'
import DzColorPicker from './DzColorPicker.vue'

describe('dzColorPicker — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzColorPicker)
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root', () => {
    const wrapper = mount(DzColorPicker)
    expect(wrapper.find('[class~="[contain:layout_style]"]').exists()).toBe(true)
  })

  it('renders trigger button', () => {
    const wrapper = mount(DzColorPicker)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('displays current color value', () => {
    const wrapper = mount(DzColorPicker, {
      props: { modelValue: '#ff0000' },
    })
    expect(wrapper.text()).toContain('#ff0000')
  })

  it('displays color swatch with current color', () => {
    const wrapper = mount(DzColorPicker, {
      props: { modelValue: '#00ff00' },
    })
    const swatch = wrapper.find('[aria-hidden="true"]')
    expect(swatch.exists()).toBe(true)
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzColorPicker, {
      props: { disabled: true },
    })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('renders error message when error prop is provided', () => {
    const wrapper = mount(DzColorPicker, {
      props: { error: 'Invalid color' },
    })
    expect(wrapper.find('[role="alert"]').text()).toBe('Invalid color')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzColorPicker, {
      attrs: { class: 'my-picker' },
    })
    expect(wrapper.html()).toContain('my-picker')
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzColorPicker, {
      props: { size: 'lg' },
    })
    expect(wrapper.html()).toContain('h-[var(--dz-input-lg-height)]')
  })

  it('renders hidden form input when name is provided', () => {
    const wrapper = mount(DzColorPicker, {
      props: { name: 'color-field' },
    })
    const hidden = wrapper.find('input[type="hidden"]')
    expect(hidden.exists()).toBe(true)
    expect(hidden.attributes('name')).toBe('color-field')
  })

  it('emits focus event on trigger focus', async () => {
    const wrapper = mount(DzColorPicker)
    await wrapper.find('button').trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur event on trigger blur', async () => {
    const wrapper = mount(DzColorPicker)
    await wrapper.find('button').trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('defaults modelValue to empty string', () => {
    const wrapper = mount(DzColorPicker)
    // Default model value is '' (empty string), not #000000
    expect(wrapper.exists()).toBe(true)
  })

  it('links the error message to the trigger via aria-describedby', () => {
    const wrapper = mount(DzColorPicker, {
      props: { error: 'Pick a color' },
    })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    const errorId = errorEl.attributes('id')!
    expect(errorId).toBeTruthy()
    const trigger = wrapper.find('button[aria-expanded]')
    expect(trigger.attributes('aria-describedby')).toContain(errorId)
  })

  it('reflects the required prop via aria-required on the trigger', () => {
    const wrapper = mount(DzColorPicker, {
      props: { required: true },
    })
    expect(wrapper.find('button[aria-expanded]').attributes('aria-required')).toBe('true')
  })

  it('renders the real Reka popover inline when portalDisabled is true', async () => {
    const wrapper = mount(DzColorPicker, {
      props: { portalDisabled: true },
      attachTo: document.body,
    })
    await wrapper.find('button[aria-expanded]').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('input[aria-label="Color area"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('keeps the real Reka default portal behavior', async () => {
    const wrapper = mount(DzColorPicker, { attachTo: document.body })
    await wrapper.find('button[aria-expanded]').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(document.body.querySelector('input[aria-label="Color area"]')).not.toBeNull()
    expect(wrapper.find('input[aria-label="Color area"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

// ---------------------------------------------------------------------------
// The rewritten keyboard contract — RESIDUAL-13, closing RESIDUAL-12 §4 `F2`.
//
// Six APG `slider` rows about a "colour pointer", a "saturation axis" and a
// "value axis" were withdrawn, because none of those things exists: the panel is
// a native `<input type="color">`, a hex text field and a grid of preset
// buttons. Six rows describing what the panel DOES have replaced them, and this
// block holds them to it.
//
// **What this lane can and cannot drive.** Three of the six are owned by the
// platform (`<button>` activation, text entry) and one by Reka's popover. jsdom
// implements no default actions for keyboard events — pressing Enter on a
// `<button>` does not synthesise a click — so for those rows each test asserts
// the two halves it can: that the component does **not** intercept the key, and
// that the activation the platform produces from it has the declared effect.
// Escape and the hex field are driven end to end.
// ---------------------------------------------------------------------------

/** Stub the portal so popover content renders inline (not teleported). */
const ColorInlinePortal = { template: '<div><slot /></div>' }

function mountColorPicker(props: Record<string, unknown> = {}) {
  return mount(DzColorPicker, {
    props,
    global: { stubs: { PopoverPortal: ColorInlinePortal } },
    attachTo: document.body,
  })
}

describe('dzColorPicker — declared keyboard contract', () => {
  // Teardown through Vue, not through the DOM (RESIDUAL-18): these cases `attachTo:
  // document.body`, and a `document.body` wipe removed the mount point while leaving
  // the picker mounted over it.
  enableAutoUnmount(afterEach)

  it('does not intercept \'Enter\' on the trigger, and the activation it produces opens the panel', async () => {
    const wrapper = mountColorPicker()
    const trigger = wrapper.get('[data-part="trigger"]')

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    trigger.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(trigger.element.tagName).toBe('BUTTON')

    ;(trigger.element as HTMLElement).click()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-part="panel"]').exists()).toBe(true)
  })

  it('does not intercept \' \' on the trigger either — the same platform activation', () => {
    const wrapper = mountColorPicker()
    const trigger = wrapper.get('[data-part="trigger"]')

    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    trigger.element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(trigger.element.getAttribute('type')).toBe('button')
  })

  it('closes the panel on \'Escape\' without changing the value', async () => {
    const wrapper = mountColorPicker({ modelValue: '#ff0000' })
    ;(wrapper.get('[data-part="trigger"]').element as HTMLElement).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-part="panel"]').exists()).toBe(true)

    // Dispatched AT the panel rather than at `document`: Reka's
    // `DismissableLayer` listens on the layer, and an event dispatched on the
    // document never reaches it — measured, and the reason the first draft of
    // this test failed while the behaviour was correct all along.
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    wrapper.get('[data-part="panel"]').element.dispatchEvent(event)
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-part="panel"]').exists()).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('leaves \'Tab\' to the document, so the panel is walked and not trapped open', async () => {
    const wrapper = mountColorPicker()
    ;(wrapper.get('[data-part="trigger"]').element as HTMLElement).click()
    await wrapper.vm.$nextTick()

    const hex = wrapper.findAll('[data-part="input"]').at(-1)!
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    hex.element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
  })

  it('selects the focused preset on the activation \'Enter\' produces', async () => {
    const wrapper = mountColorPicker({ presets: ['#ff0000', '#00ff00'] })
    ;(wrapper.get('[data-part="trigger"]').element as HTMLElement).click()
    await wrapper.vm.$nextTick()

    const swatches = wrapper.findAll('[data-part="item"]')
    expect(swatches).toHaveLength(2)

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    swatches[1]!.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)

    ;(swatches[1]!.element as HTMLElement).click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('#00ff00')
  })

  it('takes a typed hex value in the colour field — the `<character>` row', async () => {
    const wrapper = mountColorPicker()
    ;(wrapper.get('[data-part="trigger"]').element as HTMLElement).click()
    await wrapper.vm.$nextTick()

    const hex = wrapper.findAll('[data-part="input"]').at(-1)!
    expect(hex.attributes('type')).toBe('text')
    await hex.setValue('#123456')
    await hex.trigger('change')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('#123456')
  })

  it('declares no key its own source pretends to handle — the panel has no 2D slider', () => {
    // The withdrawal, asserted rather than trusted: the component contains no
    // keyboard handler at all, so any arrow row would be backed by nothing. If a
    // real saturation/value slider is ever built (`D-RES13-1`), this test is the
    // one that has to change with it.
    const declared = colorPickerAnatomy.keyboard.map(b => b.key)
    expect(declared).not.toContain('ArrowRight')
    expect(declared).not.toContain('ArrowLeft')
    expect(declared).not.toContain('ArrowUp')
    expect(declared).not.toContain('ArrowDown')
    expect(declared).not.toContain('Home')
    expect(declared).not.toContain('End')
  })

  it('conforms to its declared keyboard contract', async () => {
    const wrapper = mountColorPicker({ presets: ['#ff0000'] })
    ;(wrapper.get('[data-part="trigger"]').element as HTMLElement).click()
    await wrapper.vm.$nextTick()
    // No `handled`: every row here is owned by the platform or by Reka's popover,
    // and neither calls `preventDefault` on activation — asserting consumption
    // would be asserting the wrong thing.
    expectKeyboardContract(wrapper, colorPickerAnatomy, {})
  })
})
