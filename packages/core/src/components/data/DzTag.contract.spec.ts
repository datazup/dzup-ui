import { mount } from '@vue/test-utils'
/**
 * DzTag — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzTag from './DzTag.vue'

describe('dzTag — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzTag, { slots: { default: 'Label' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzTag, {
      props: { tone: 'success' },
      slots: { default: 'Active' },
    })
    expect(wrapper.attributes('data-tone')).toBe('success')
  })

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzTag, {
      props: { disabled: true },
      slots: { default: 'Tag' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzTag, { slots: { default: 'Tag' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('renders close button when closable=true', () => {
    const wrapper = mount(DzTag, {
      props: { closable: true },
      slots: { default: 'Tag' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('emits close when close button is clicked', async () => {
    const wrapper = mount(DzTag, {
      props: { closable: true },
      slots: { default: 'Tag' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits focus event', async () => {
    const wrapper = mount(DzTag, {
      props: { closable: true },
      slots: { default: 'Tag' },
    })
    await wrapper.trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzTag, {
      props: { closable: true },
      slots: { default: 'Tag' },
    })
    await wrapper.trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('renders prefix slot', () => {
    const wrapper = mount(DzTag, {
      slots: { default: 'Tag', prefix: '<span data-testid="prefix">*</span>' },
    })
    expect(wrapper.find('[data-testid="prefix"]').exists()).toBe(true)
  })

  it('accepts canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzTag, {
        props: { tone },
        slots: { default: 'tag' },
      })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTag, {
      attrs: { class: 'custom-class' },
      slots: { default: 'Tag' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
