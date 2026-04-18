/**
 * DzTokenProgressBar — Unit / behavior tests.
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DzTokenProgressBar from './DzTokenProgressBar.vue'

describe('dzTokenProgressBar — Unit Tests', () => {
  it('renders a progressbar role', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 0, total: 100 } })
    expect(wrapper.attributes('role')).toBe('progressbar')
  })

  it('sets aria-valuenow to the used value', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 42, total: 100 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('42')
  })

  it('sets aria-valuemin to 0 and aria-valuemax to total', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 10, total: 5000 } })
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('5000')
  })

  it('sets aria-label to "Token usage"', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 1, total: 10 } })
    expect(wrapper.attributes('aria-label')).toBe('Token usage')
  })

  it('bar fill reflects percent width (50%)', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 50, total: 100 } })
    const bar = wrapper.element.children[0] as HTMLElement
    expect(bar.style.width).toBe('50%')
  })

  it('clamps percent to 100 when used > total', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 200, total: 100 } })
    const bar = wrapper.element.children[0] as HTMLElement
    expect(bar.style.width).toBe('100%')
  })

  it('handles zero total gracefully (no div-by-zero)', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 5, total: 0 } })
    const bar = wrapper.element.children[0] as HTMLElement
    expect(bar.style.width).toBe('0%')
  })

  it('uses normal state below 70 %', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 50, total: 100 } })
    expect(wrapper.attributes('data-state')).toBe('normal')
    expect(wrapper.attributes('data-warn')).toBeUndefined()
    expect(wrapper.attributes('data-danger')).toBeUndefined()
  })

  it('applies warn state + class at exactly 70 %', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 70, total: 100 } })
    expect(wrapper.attributes('data-state')).toBe('warn')
    expect(wrapper.attributes('data-warn')).toBe('')
    const bar = wrapper.element.children[0] as HTMLElement
    expect(bar.classList.contains('dz-progress-warn')).toBe(true)
    expect(bar.style.backgroundColor).toContain('--dz-progress-amber')
  })

  it('applies danger state + class at exactly 90 %', () => {
    const wrapper = mount(DzTokenProgressBar, { props: { used: 90, total: 100 } })
    expect(wrapper.attributes('data-state')).toBe('danger')
    expect(wrapper.attributes('data-danger')).toBe('')
    const bar = wrapper.element.children[0] as HTMLElement
    expect(bar.classList.contains('dz-progress-danger')).toBe(true)
    expect(bar.style.backgroundColor).toContain('--dz-progress-red')
  })

  it('showWarning=false keeps state=normal even at high usage', () => {
    const wrapper = mount(DzTokenProgressBar, {
      props: { used: 95, total: 100, showWarning: false },
    })
    expect(wrapper.attributes('data-state')).toBe('normal')
  })

  it('exposes slot props with percent/state', () => {
    const wrapper = mount(DzTokenProgressBar, {
      props: { used: 80, total: 100 },
      slots: {
        default: `<template #default="{ percent, state }">
          <span data-testid="label">{{ percent }}-{{ state }}</span>
        </template>`,
      },
    })
    expect(wrapper.find('[data-testid="label"]').text()).toBe('80-warn')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTokenProgressBar, {
      props: { used: 10, total: 100 },
      attrs: { class: 'my-token-bar' },
    })
    expect(wrapper.classes()).toContain('my-token-bar')
  })
})
