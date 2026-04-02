import { mount } from '@vue/test-utils'
/**
 * DzNotification — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzNotification from './DzNotification.vue'

describe('dzNotification — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzNotification, { props: { title: 'Info' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays title text', () => {
    const wrapper = mount(DzNotification, { props: { title: 'Success!' } })
    expect(wrapper.text()).toContain('Success!')
  })

  it('displays description text', () => {
    const wrapper = mount(DzNotification, {
      props: { title: 'Info', description: 'Details here' },
    })
    expect(wrapper.text()).toContain('Details here')
  })

  it('accepts canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzNotification, { props: { title: 'Info', tone } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('renders close button when closable=true', () => {
    const wrapper = mount(DzNotification, {
      props: { title: 'Info', closable: true },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('emits close when closed', async () => {
    const wrapper = mount(DzNotification, {
      props: { title: 'Info', closable: true },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('renders actions slot', () => {
    const wrapper = mount(DzNotification, {
      props: { title: 'Info' },
      slots: { actions: '<button data-testid="action">Undo</button>' },
    })
    expect(wrapper.find('[data-testid="action"]').exists()).toBe(true)
  })

  it('renders icon slot', () => {
    const wrapper = mount(DzNotification, {
      props: { title: 'Info' },
      slots: { icon: '<span data-testid="icon">!</span>' },
    })
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzNotification, {
      props: { title: 'Info' },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
