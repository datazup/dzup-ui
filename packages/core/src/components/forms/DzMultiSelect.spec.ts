import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
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

describe('dzMultiSelect — controlled and uncontrolled value ownership', () => {
  it.each([false, true])('tag removal, controlled=%s', async (controlled) => {
    const wrapper = mount(DzMultiSelect, { props: { items, modelValue: ['apple', 'banana'], ...(controlled ? { 'onUpdate:modelValue': () => {} } : {}) } })
    await wrapper.get('[aria-label="Remove Apple"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['banana']])
    expect(wrapper.find('[aria-label="Remove Apple"]').exists()).toBe(controlled)
    expect(wrapper.find('[aria-label="Remove Banana"]').exists()).toBe(true)
    await wrapper.setProps({ modelValue: ['cherry'] })
    expect(wrapper.find('[aria-label="Remove Cherry"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Remove Banana"]').exists()).toBe(false)
  })
})

describe('dzMultiSelect — Unit Tests', () => {
  it('renders the multi-select root', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items },
    })
    expect(wrapper.find('[class~="[contain:layout_style]"]').exists()).toBe(true)
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
    const el = wrapper.find('[class~="[contain:layout_style]"]')
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

// DZUP-UI-R11-05B-20261006-C1
describe('dzMultiSelect — declared keyboard actions', () => {
  it('navigates, toggles selection while open, dismisses and removes the last tag', async () => {
    const original = HTMLElement.prototype.scrollIntoView
    HTMLElement.prototype.scrollIntoView = () => {}
    const wrapper = mount(DzMultiSelect, { attachTo: document.body, props: { items, portalDisabled: true } })
    try {
      const input = wrapper.get('input')
      const press = async (key: string) => {
        await input.trigger('keydown', { key })
        await flushPromises()
        await new Promise(resolve => setTimeout(resolve, 30))
      }
      const active = () => document.getElementById(input.attributes('aria-activedescendant') ?? '')?.textContent?.trim()
      await press('ArrowDown')
      expect(input.attributes('aria-expanded')).toBe('true')
      expect(active()).toBe('Apple')
      await press('ArrowDown')
      expect(active()).toBe('Banana')
      await press('ArrowUp')
      expect(active()).toBe('Apple')
      await press('End')
      expect(active()).toBe('Cherry')
      await press('Home')
      expect(active()).toBe('Apple')
      await press('Enter')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['apple']])
      expect(input.attributes('aria-expanded')).toBe('true')
      await press('Enter')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
      await press('ArrowDown')
      await press('Enter')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['banana']])
      await press('Escape')
      expect(input.attributes('aria-expanded')).toBe('false')
      expect(wrapper.emitted('update:modelValue')).toHaveLength(3)
      await press('Backspace')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
      await press('ArrowUp')
      expect(input.attributes('aria-expanded')).toBe('true')
    }
    finally {
      wrapper.unmount()
      HTMLElement.prototype.scrollIntoView = original
    }
  })
})
