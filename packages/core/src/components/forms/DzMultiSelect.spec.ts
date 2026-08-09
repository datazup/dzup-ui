import { enableAutoUnmount, mount } from '@vue/test-utils'
/**
 * DzMultiSelect — Unit / behavior tests.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { multiSelectTokens } from './DzMultiSelect.tokens.ts'
import DzMultiSelect from './DzMultiSelect.vue'

const items = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
]

enableAutoUnmount(afterEach)

describe('dzMultiSelect — Unit Tests', () => {
  it('renders the multi-select root', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items },
    })
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })

  it('displays placeholder when no values are selected', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items, placeholder: 'Select items' },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Select items')
  })

  it('renders selected values as tags', () => {
    const wrapper = mount(DzMultiSelect, {
      props: {
        items,
        'modelValue': ['apple', 'banana'],
        'onUpdate:modelValue': () => {},
      },
    })
    expect(wrapper.text()).toContain('Apple')
    expect(wrapper.text()).toContain('Banana')
    const appleTag = wrapper.get('[aria-label="Remove Apple"]').element.parentElement
    expect(appleTag?.className).toContain('text-[var(--dz-primary-muted-foreground)]')
    expect(multiSelectTokens.tag.foreground).toBe('var(--dz-primary-muted-foreground)')
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items, size: 'lg' },
    })
    expect(wrapper.html()).toContain('dz-input-lg-height')
  })

  it('applies variant classes (outline)', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items, variant: 'outline' },
    })
    expect(wrapper.html()).toContain('border')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items, disabled: true },
    })
    const root = wrapper.find('[data-disabled]')
    expect(root.exists()).toBe(true)
  })

  it('sets data-invalid when invalid', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items, invalid: true },
    })
    const root = wrapper.find('[data-invalid]')
    expect(root.exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items },
      attrs: { class: 'my-multi' },
    })
    expect(wrapper.html()).toContain('my-multi')
  })

  it('emits focus on input focus', async () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items },
    })
    const input = wrapper.find('input')
    await input.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur on input blur', async () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items },
    })
    const input = wrapper.find('input')
    await input.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('has contain: layout style on anchor', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items },
    })
    const el = wrapper.find('[style*="contain: layout style"]')
    expect(el.exists()).toBe(true)
  })

  it('does not show placeholder when values are selected', () => {
    const wrapper = mount(DzMultiSelect, {
      props: {
        items,
        'placeholder': 'Select items',
        'modelValue': ['apple'],
        'onUpdate:modelValue': () => {},
      },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBeUndefined()
  })

  it('renders clear button when values are selected', () => {
    const wrapper = mount(DzMultiSelect, {
      props: {
        items,
        'modelValue': ['apple'],
        'onUpdate:modelValue': () => {},
      },
    })
    const clearBtn = wrapper.find('[aria-label="Clear all"]')
    expect(clearBtn.exists()).toBe(true)
  })

  it('removes the last tag on Backspace when the input is empty', async () => {
    const wrapper = mount(DzMultiSelect, {
      props: {
        items,
        'modelValue': ['apple', 'banana'],
        'onUpdate:modelValue': (v: string[]) => wrapper.setProps({ modelValue: v }),
      },
    })
    const input = wrapper.find('input')
    await input.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.props('modelValue')).toEqual(['apple'])
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('does not remove a tag on Backspace while the input has text', async () => {
    const wrapper = mount(DzMultiSelect, {
      props: {
        items,
        'modelValue': ['apple', 'banana'],
        'onUpdate:modelValue': (v: string[]) => wrapper.setProps({ modelValue: v }),
      },
    })
    const input = wrapper.find('input')
    await input.setValue('che')
    await input.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.props('modelValue')).toEqual(['apple', 'banana'])
  })

  it('renders an inline error message linked via aria-describedby', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items, 'modelValue': [], 'onUpdate:modelValue': () => {}, 'error': 'Pick at least one' },
    })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Pick at least one')
    const errorId = errorEl.attributes('id')!
    expect(errorId).toBeTruthy()
    expect(wrapper.find(`[aria-describedby~="${errorId}"]`).exists()).toBe(true)
  })

  it('renders real Reka options inline when portalDisabled is true', async () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items, portalDisabled: true },
      attachTo: document.body,
    })
    await wrapper.find('input').trigger('focus')
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(items.length)
    wrapper.unmount()
  })

  it('keeps the real Reka default portal behavior', async () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items },
      attachTo: document.body,
    })
    await wrapper.find('input').trigger('focus')
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(items.length)
    wrapper.unmount()
  })
})
