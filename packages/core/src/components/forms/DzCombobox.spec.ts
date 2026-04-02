import { mount } from '@vue/test-utils'
/**
 * DzCombobox — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzCombobox from './DzCombobox.vue'

const items = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
]

describe('dzCombobox — Unit Tests', () => {
  it('renders the combobox root', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })

  it('displays placeholder text', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, placeholder: 'Search...' },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Search...')
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, size: 'sm' },
    })
    expect(wrapper.html()).toContain('dz-button-sm-height')
  })

  it('applies variant classes (outline)', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, variant: 'outline' },
    })
    expect(wrapper.html()).toContain('border')
  })

  it('applies variant classes (filled)', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, variant: 'filled' },
    })
    expect(wrapper.html()).toContain('dz-muted')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, disabled: true },
    })
    const root = wrapper.find('[data-disabled]')
    expect(root.exists()).toBe(true)
  })

  it('sets data-invalid when invalid', () => {
    const wrapper = mount(DzCombobox, {
      props: { items, invalid: true },
    })
    const root = wrapper.find('[data-invalid]')
    expect(root.exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
      attrs: { class: 'my-combobox' },
    })
    expect(wrapper.html()).toContain('my-combobox')
  })

  it('emits focus on input focus', async () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    const input = wrapper.find('input')
    await input.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur on input blur', async () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    const input = wrapper.find('input')
    await input.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('has contain: layout style on anchor', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    const el = wrapper.find('[style*="contain: layout style"]')
    expect(el.exists()).toBe(true)
  })

  it('renders chevron icon', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('shows clear button when value is selected', () => {
    const wrapper = mount(DzCombobox, {
      props: {
        items,
        'modelValue': 'apple',
        'onUpdate:modelValue': () => {},
      },
    })
    const clearBtn = wrapper.find('[aria-label="Clear selection"]')
    expect(clearBtn.exists()).toBe(true)
  })

  it('does not show clear button when no value', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
    })
    const clearBtn = wrapper.find('[aria-label="Clear selection"]')
    expect(clearBtn.exists()).toBe(false)
  })
})
