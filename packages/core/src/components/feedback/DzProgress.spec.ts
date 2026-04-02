import { mount } from '@vue/test-utils'
/**
 * DzProgress — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzProgress from './DzProgress.vue'

describe('dzProgress — Unit Tests', () => {
  it('renders a <div> element for bar variant', () => {
    const wrapper = mount(DzProgress)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzProgress, {
      attrs: { class: 'my-progress' },
    })
    expect(wrapper.classes()).toContain('my-progress')
  })

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzProgress, {
      attrs: { 'data-testid': 'upload-bar' },
    })
    expect(wrapper.attributes('data-testid')).toBe('upload-bar')
  })

  it('clamps value to 0 minimum', () => {
    const wrapper = mount(DzProgress, { props: { value: -10 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
  })

  it('clamps value to max', () => {
    const wrapper = mount(DzProgress, { props: { value: 150, max: 100 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('100')
  })

  it('calculates percentage correctly with custom max', () => {
    const wrapper = mount(DzProgress, { props: { value: 50, max: 200 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('25')
  })

  it('renders bar fill element with correct width', () => {
    const wrapper = mount(DzProgress, { props: { value: 60, max: 100 } })
    const bar = wrapper.element.children[0] as HTMLElement
    expect(bar.style.width).toBe('60%')
  })

  it('renders indeterminate bar with 50% width', () => {
    const wrapper = mount(DzProgress, { props: { indeterminate: true } })
    const bar = wrapper.element.children[0] as HTMLElement
    expect(bar.style.width).toBe('50%')
  })

  it('applies tone class to bar fill', () => {
    const wrapper = mount(DzProgress, { props: { value: 50, tone: 'success' } })
    const bar = wrapper.element.children[0] as HTMLElement
    expect(bar.className).toContain('bg-[var(--dz-success)]')
  })

  it('renders circular SVG with two circle elements', () => {
    const wrapper = mount(DzProgress, { props: { variant: 'circular', value: 50 } })
    const circles = wrapper.findAll('circle')
    expect(circles).toHaveLength(2)
  })

  it('circular variant applies animate-spin when indeterminate', () => {
    const wrapper = mount(DzProgress, {
      props: { variant: 'circular', indeterminate: true },
    })
    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('animate-spin')
  })

  it('circular variant does not apply animate-spin when determinate', () => {
    const wrapper = mount(DzProgress, {
      props: { variant: 'circular', value: 50 },
    })
    const svg = wrapper.find('svg')
    expect(svg.classes()).not.toContain('animate-spin')
  })

  it('renders at 0% when value is 0', () => {
    const wrapper = mount(DzProgress, { props: { value: 0 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
    const bar = wrapper.element.children[0] as HTMLElement
    expect(bar.style.width).toBe('0%')
  })

  it('renders at 100% when value equals max', () => {
    const wrapper = mount(DzProgress, { props: { value: 100 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('100')
    const bar = wrapper.element.children[0] as HTMLElement
    expect(bar.style.width).toBe('100%')
  })
})
