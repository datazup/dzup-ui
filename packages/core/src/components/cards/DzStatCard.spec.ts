import { mount } from '@vue/test-utils'
/**
 * DzStatCard — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DzStatCard from './DzStatCard.vue'

describe('dzStatCard — Unit Tests', () => {
  it('renders a <div> element', () => {
    const wrapper = mount(DzStatCard, {
      props: { title: 'Users', value: 1234 },
    })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('renders title and value', () => {
    const wrapper = mount(DzStatCard, {
      props: { title: 'Revenue', value: '$12,450' },
    })
    expect(wrapper.text()).toContain('Revenue')
    expect(wrapper.text()).toContain('$12,450')
  })

  it('renders numeric value', () => {
    const wrapper = mount(DzStatCard, {
      props: { title: 'Users', value: 42 },
    })
    expect(wrapper.text()).toContain('42')
  })

  it('renders description when provided', () => {
    const wrapper = mount(DzStatCard, {
      props: { title: 'Sales', value: 100, description: 'vs. last month' },
    })
    expect(wrapper.text()).toContain('vs. last month')
  })

  it('renders trend value', () => {
    const wrapper = mount(DzStatCard, {
      props: { title: 'Revenue', value: 100, trend: 'up', trendValue: '+12%' },
    })
    expect(wrapper.text()).toContain('+12%')
  })

  it('renders icon component', () => {
    const IconComp = defineComponent({
      render() { return h('svg', { 'data-testid': 'icon' }) },
    })
    const wrapper = mount(DzStatCard, {
      props: { title: 'Revenue', value: 100, icon: IconComp },
    })
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
  })

  it('applies elevated variant by default', () => {
    const wrapper = mount(DzStatCard, {
      props: { title: 'Test', value: 0 },
    })
    expect(wrapper.classes().join(' ')).toContain('shadow')
  })

  it('applies outlined variant', () => {
    const wrapper = mount(DzStatCard, {
      props: { title: 'Test', value: 0, variant: 'outlined' },
    })
    expect(wrapper.classes().join(' ')).toContain('border')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzStatCard, {
      attrs: { class: 'my-class' },
      props: { title: 'Test', value: 0 },
    })
    expect(wrapper.classes()).toContain('my-class')
  })
})
