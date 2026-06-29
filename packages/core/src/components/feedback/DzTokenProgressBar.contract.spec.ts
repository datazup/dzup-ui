import { mount } from '@vue/test-utils'
/**
 * DzTokenProgressBar — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzTokenProgressBar from './DzTokenProgressBar.vue'

describe('dzTokenProgressBar — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 50, total: 100 } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts zero usage', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 0, total: 100 } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts full usage', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 100, total: 100 } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts showWarning=false', () => {
    const wrapper = mount(DzTokenProgressBar, {
      props: { used: 95, total: 100, showWarning: false },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts showWarning=true', () => {
    const wrapper = mount(DzTokenProgressBar, {
      props: { used: 95, total: 100, showWarning: true },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders as a progressbar with aria-valuenow', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 50, total: 100 } })
    expect(wrapper.attributes('role')).toBe('progressbar')
    expect(wrapper.attributes('aria-valuenow')).toBe('50')
  })
})
