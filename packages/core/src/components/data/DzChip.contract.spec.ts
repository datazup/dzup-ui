import { mount } from '@vue/test-utils'
/**
 * DzChip — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzChip from './DzChip.vue'

describe('dzChip — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzChip, { slots: { default: 'Vue 3' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzChip, {
      props: { tone: 'primary' },
      slots: { default: 'Vue 3' },
    })
    expect(wrapper.attributes('data-tone')).toBe('primary')
  })

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzChip, {
      props: { disabled: true },
      slots: { default: 'Vue 3' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzChip, { slots: { default: 'Vue 3' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('has role="status"', () => {
    const wrapper = mount(DzChip, { slots: { default: 'Vue 3' } })
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('renders close button when closable=true', () => {
    const wrapper = mount(DzChip, {
      props: { closable: true },
      slots: { default: 'Vue 3' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('emits close when close button is clicked', async () => {
    const wrapper = mount(DzChip, {
      props: { closable: true },
      slots: { default: 'Vue 3' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does NOT emit close when disabled', async () => {
    const wrapper = mount(DzChip, {
      props: { closable: true, disabled: true },
      slots: { default: 'Vue 3' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('emits focus event', async () => {
    const wrapper = mount(DzChip, {
      props: { closable: true },
      slots: { default: 'Vue 3' },
    })
    await wrapper.trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzChip, {
      props: { closable: true },
      slots: { default: 'Vue 3' },
    })
    await wrapper.trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('renders prefix slot', () => {
    const wrapper = mount(DzChip, {
      slots: { default: 'Vue 3', prefix: '<span data-testid="prefix">*</span>' },
    })
    expect(wrapper.find('[data-testid="prefix"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzChip, {
      attrs: { class: 'custom-class' },
      slots: { default: 'Vue 3' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  it('accepts canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzChip, {
        props: { tone },
        slots: { default: 'chip' },
      })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })
})
