import { mount } from '@vue/test-utils'
/**
 * DzCopyButton — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzCopyButton from './DzCopyButton.vue'

describe('dzCopyButton — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCopyButton, { props: { value: 'copy me' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzCopyButton, { props: { value: 'text', size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzCopyButton, { props: { value: 'text', tone } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical variant values', () => {
    const variants = ['solid', 'outline', 'ghost', 'text', 'link'] as const
    for (const variant of variants) {
      const wrapper = mount(DzCopyButton, { props: { value: 'text', variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('renders label prop', () => {
    const wrapper = mount(DzCopyButton, { props: { value: 'text', label: 'Copy code' } })
    expect(wrapper.text()).toContain('Copy code')
  })

  it('forwards ariaLabel', () => {
    const wrapper = mount(DzCopyButton, {
      props: { value: 'text', ariaLabel: 'Copy to clipboard' },
    })
    expect(wrapper.html()).toContain('Copy to clipboard')
  })

  it('is disabled when disabled=true', () => {
    const wrapper = mount(DzCopyButton, { props: { value: 'text', disabled: true } })
    expect(wrapper.html()).toMatch(/disabled|data-disabled|aria-disabled/)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzCopyButton, { props: { value: 'text' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })
})
