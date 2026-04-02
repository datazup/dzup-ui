import { mount } from '@vue/test-utils'
/**
 * DzStatCard — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzStatCard from './DzStatCard.vue'

describe('dzStatCard — Contract Spec v1', () => {
  const requiredProps = { title: 'Revenue', value: '$12,450' }

  it('renders without errors', () => {
    const wrapper = mount(DzStatCard, { props: requiredProps })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays title text', () => {
    const wrapper = mount(DzStatCard, { props: requiredProps })
    expect(wrapper.text()).toContain('Revenue')
  })

  it('displays value text', () => {
    const wrapper = mount(DzStatCard, { props: requiredProps })
    expect(wrapper.text()).toContain('$12,450')
  })

  it('sets data-variant attribute', () => {
    const wrapper = mount(DzStatCard, { props: { ...requiredProps, variant: 'outlined' } })
    expect(wrapper.attributes('data-variant')).toBe('outlined')
  })

  it('defaults variant to elevated', () => {
    const wrapper = mount(DzStatCard, { props: requiredProps })
    expect(wrapper.attributes('data-variant')).toBe('elevated')
  })

  it('displays trend value when provided', () => {
    const wrapper = mount(DzStatCard, {
      props: { ...requiredProps, trend: 'up' as const, trendValue: '+12.5%' },
    })
    expect(wrapper.text()).toContain('+12.5%')
  })

  it('renders icon slot', () => {
    const wrapper = mount(DzStatCard, {
      props: requiredProps,
      slots: { icon: '<span data-testid="icon">I</span>' },
    })
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
  })

  it('renders value slot', () => {
    const wrapper = mount(DzStatCard, {
      props: requiredProps,
      slots: { value: '<span data-testid="value">Custom</span>' },
    })
    expect(wrapper.find('[data-testid="value"]').exists()).toBe(true)
  })

  it('renders footer slot', () => {
    const wrapper = mount(DzStatCard, {
      props: { ...requiredProps, trendValue: 'x' },
      slots: { footer: '<span data-testid="footer">Footer</span>' },
    })
    expect(wrapper.find('[data-testid="footer"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzStatCard, {
      props: requiredProps,
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
