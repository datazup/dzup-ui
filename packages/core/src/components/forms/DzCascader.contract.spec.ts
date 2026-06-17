import { mount } from '@vue/test-utils'
/**
 * DzCascader — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzCascader from './DzCascader.vue'

const options = [
  {
    label: 'China',
    value: 'cn',
    children: [
      { label: 'Zhejiang', value: 'zj', children: [{ label: 'Hangzhou', value: 'hz' }] },
    ],
  },
  { label: 'USA', value: 'us', children: [{ label: 'California', value: 'ca' }] },
]

describe('dzCascader — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCascader, { props: { options } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a trigger button', () => {
    const wrapper = mount(DzCascader, { props: { options } })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzCascader, { props: { options, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all input variant values', () => {
    const variants = ['outline', 'filled', 'underlined'] as const
    for (const variant of variants) {
      const wrapper = mount(DzCascader, { props: { options, variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCascader, {
      props: { options },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  it('renders the placeholder while empty', () => {
    const wrapper = mount(DzCascader, { props: { options, placeholder: 'Pick region' } })
    expect(wrapper.text()).toContain('Pick region')
  })

  it('renders an error message with role="alert"', () => {
    const wrapper = mount(DzCascader, { props: { options, error: 'Required' } })
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Required')
  })

  it('reflects disabled state on the trigger', () => {
    const wrapper = mount(DzCascader, { props: { options, disabled: true } })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
