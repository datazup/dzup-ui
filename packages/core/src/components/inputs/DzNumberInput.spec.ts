import { mount } from '@vue/test-utils'
/**
 * DzNumberInput — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzNumberInput from './DzNumberInput.vue'

describe('dzNumberInput — Unit Tests', () => {
  it('renders an <input> with spinbutton role inside a wrapper div', () => {
    const wrapper = mount(DzNumberInput)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.find('input[role="spinbutton"]').exists()).toBe(true)
  })

  it('displays the model value in the input', () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 42 } })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('42')
  })

  it('displays empty string when model value is undefined', () => {
    const wrapper = mount(DzNumberInput)
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })

  it('increments by step value', async () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 5, step: 2 } })
    await wrapper.find('button[aria-label="Increase value"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([7])
  })

  it('decrements by step value', async () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 5, step: 2 } })
    await wrapper.find('button[aria-label="Decrease value"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
  })

  it('clamps to max on increment', async () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 9, max: 10, step: 5 } })
    await wrapper.find('button[aria-label="Increase value"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([10])
  })

  it('clamps to min on decrement', async () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 1, min: 0, step: 5 } })
    await wrapper.find('button[aria-label="Decrease value"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
  })

  it('does not increment past max (only the + button is disabled, not the input)', () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 10, max: 10 } })
    const incBtn = wrapper.find('button[aria-label="Increase value"]')
    const decBtn = wrapper.find('button[aria-label="Decrease value"]')
    // The + button is disabled via aria-disabled (not native disabled, which
    // would grey the whole input via the shell's :has(:disabled) rule)…
    expect(incBtn.attributes('aria-disabled')).toBe('true')
    // …while the - button and the input remain usable.
    expect(decBtn.attributes('aria-disabled')).toBeUndefined()
    expect(wrapper.find('input').attributes('disabled')).toBeUndefined()
  })

  it('does not decrement past min (only the - button is disabled, not the input)', () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 0, min: 0 } })
    const incBtn = wrapper.find('button[aria-label="Increase value"]')
    const decBtn = wrapper.find('button[aria-label="Decrease value"]')
    expect(decBtn.attributes('aria-disabled')).toBe('true')
    expect(incBtn.attributes('aria-disabled')).toBeUndefined()
    expect(wrapper.find('input').attributes('disabled')).toBeUndefined()
  })

  it('disables both buttons when disabled', () => {
    const wrapper = mount(DzNumberInput, { props: { disabled: true } })
    const incBtn = wrapper.find('button[aria-label="Increase value"]')
    const decBtn = wrapper.find('button[aria-label="Decrease value"]')
    expect(incBtn.attributes('aria-disabled')).toBe('true')
    expect(decBtn.attributes('aria-disabled')).toBe('true')
  })

  it('disables both buttons when readonly', () => {
    const wrapper = mount(DzNumberInput, { props: { readonly: true } })
    const incBtn = wrapper.find('button[aria-label="Increase value"]')
    const decBtn = wrapper.find('button[aria-label="Decrease value"]')
    expect(incBtn.attributes('aria-disabled')).toBe('true')
    expect(decBtn.attributes('aria-disabled')).toBe('true')
  })

  it('increments on ArrowUp keydown', async () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 5 } })
    await wrapper.find('input').trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('increment')).toHaveLength(1)
  })

  it('decrements on ArrowDown keydown', async () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 5 } })
    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('decrement')).toHaveLength(1)
  })

  it('merges consumer class via cn() on the input wrapper', () => {
    const wrapper = mount(DzNumberInput, {
      attrs: { class: 'w-32' },
    })
    // Consumer class is merged into the input wrapper via cn(attrs.class)
    expect(wrapper.html()).toContain('w-32')
  })

  it('sets name on the native input', () => {
    const wrapper = mount(DzNumberInput, { props: { name: 'quantity' } })
    expect(wrapper.find('input').attributes('name')).toBe('quantity')
  })

  it('sets placeholder on the native input', () => {
    const wrapper = mount(DzNumberInput, { props: { placeholder: '0' } })
    expect(wrapper.find('input').attributes('placeholder')).toBe('0')
  })

  it('renders prefix slot', () => {
    const wrapper = mount(DzNumberInput, {
      slots: {
        prefix: () => h('span', { 'data-testid': 'dollar' }, '$'),
      },
    })
    expect(wrapper.find('[data-testid="dollar"]').exists()).toBe(true)
  })

  it('uses custom id when provided', () => {
    const wrapper = mount(DzNumberInput, { props: { id: 'qty' } })
    expect(wrapper.find('input').attributes('id')).toBe('qty')
  })

  it('connects aria-describedby to the error element', () => {
    const wrapper = mount(DzNumberInput, { props: { id: 'qty', error: 'Invalid' } })
    expect(wrapper.find('input').attributes('aria-describedby')).toContain('qty-error')
  })

  it('starts from 0 when incrementing from undefined', async () => {
    const wrapper = mount(DzNumberInput)
    await wrapper.find('button[aria-label="Increase value"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
  })
})

describe('dzNumberInput — bound stepper disabled semantics are internally consistent', () => {
  // At a bound the stepper must present ONE coherent model: aria-disabled +
  // the disabled style class, NO native `disabled` attribute (which would grey
  // the whole input shell via :has(:disabled)), and an inert handler. Visual,
  // ARIA, and interactivity must all agree.

  it('at min: decrement is aria-disabled + styled disabled, not natively disabled, and inert', async () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 0, min: 0, step: 1 } })
    const decBtn = wrapper.find('button[aria-label="Decrease value"]')
    // ARIA + visual style agree …
    expect(decBtn.attributes('aria-disabled')).toBe('true')
    expect(decBtn.classes()).toContain('dz-disabled-button')
    // … and the native attribute is intentionally absent (keeps the input shell usable) …
    expect(decBtn.attributes('disabled')).toBeUndefined()
    // … and interactivity agrees: activation at the bound is a no-op.
    await decBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('decrement')).toBeUndefined()
  })

  it('at max: increment is aria-disabled + styled disabled, not natively disabled, and inert', async () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 10, max: 10, step: 1 } })
    const incBtn = wrapper.find('button[aria-label="Increase value"]')
    expect(incBtn.attributes('aria-disabled')).toBe('true')
    expect(incBtn.classes()).toContain('dz-disabled-button')
    expect(incBtn.attributes('disabled')).toBeUndefined()
    await incBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('increment')).toBeUndefined()
  })

  it('keeps the opposite stepper and the input fully usable while one bound is reached', async () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 0, min: 0, max: 10, step: 1 } })
    // The non-bound (increment) stepper carries no aria-disabled / native disabled …
    const incBtn = wrapper.find('button[aria-label="Increase value"]')
    expect(incBtn.attributes('aria-disabled')).toBeUndefined()
    // … and the input never inherits a disabled attribute from a bound.
    expect(wrapper.find('input').attributes('disabled')).toBeUndefined()
    // Stepping off the bound re-enables the previously-bounded decrement stepper.
    await incBtn.trigger('click')
    expect(wrapper.find('button[aria-label="Decrease value"]').attributes('aria-disabled')).toBeUndefined()
  })
})
