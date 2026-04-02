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

  it('does not increment past max', () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 10, max: 10 } })
    const btn = wrapper.find('button[aria-label="Increase value"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('does not decrement past min', () => {
    const wrapper = mount(DzNumberInput, { props: { modelValue: 0, min: 0 } })
    const btn = wrapper.find('button[aria-label="Decrease value"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('disables both buttons when disabled', () => {
    const wrapper = mount(DzNumberInput, { props: { disabled: true } })
    const incBtn = wrapper.find('button[aria-label="Increase value"]')
    const decBtn = wrapper.find('button[aria-label="Decrease value"]')
    expect((incBtn.element as HTMLButtonElement).disabled).toBe(true)
    expect((decBtn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('disables both buttons when readonly', () => {
    const wrapper = mount(DzNumberInput, { props: { readonly: true } })
    const incBtn = wrapper.find('button[aria-label="Increase value"]')
    const decBtn = wrapper.find('button[aria-label="Decrease value"]')
    expect((incBtn.element as HTMLButtonElement).disabled).toBe(true)
    expect((decBtn.element as HTMLButtonElement).disabled).toBe(true)
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
