import { mount } from '@vue/test-utils'
/**
 * DzFloatLabel — Contract Spec v1 conformance tests.
 *
 * Verifies the public API: the wrapped-control slot, the label slot/prop,
 * variant data attributes, the floated data attribute, and consumer class
 * merging.
 */
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import DzFloatLabel from './DzFloatLabel.vue'

describe('dzFloatLabel — Contract Spec v1', () => {
  // ── Renders ──

  it('renders without errors', () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      slots: { default: () => h('input') },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the default slot (the wrapped control)', () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      slots: { default: () => h('input', { 'data-testid': 'control' }) },
    })
    expect(wrapper.find('[data-testid="control"]').exists()).toBe(true)
  })

  it('renders the label from the `label` prop', () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      slots: { default: () => h('input') },
    })
    expect(wrapper.find('label').text()).toBe('Email')
  })

  it('renders a custom #label slot', () => {
    const wrapper = mount(DzFloatLabel, {
      slots: {
        default: () => h('input'),
        label: () => h('span', { 'data-testid': 'lbl' }, 'Custom'),
      },
    })
    expect(wrapper.find('[data-testid="lbl"]').text()).toBe('Custom')
  })

  it('omits the label element when no label is supplied', () => {
    const wrapper = mount(DzFloatLabel, { slots: { default: () => h('input') } })
    expect(wrapper.find('label').exists()).toBe(false)
  })

  // ── Data attributes ──

  it('reflects the variant via data-variant (default `over`)', () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      slots: { default: () => h('input') },
    })
    expect(wrapper.attributes('data-variant')).toBe('over')
  })

  it('honors the variant prop', () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email', variant: 'on' },
      slots: { default: () => h('input') },
    })
    expect(wrapper.attributes('data-variant')).toBe('on')
  })

  it('sets data-floated when filled', () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email', filled: true },
      slots: { default: () => h('input') },
    })
    expect(wrapper.attributes('data-floated')).toBe('')
  })

  it('is not floated by default with an empty control', () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      slots: { default: () => h('input') },
    })
    expect(wrapper.attributes('data-floated')).toBeUndefined()
  })

  // ── Label association ──

  it('associates the label with the control via for/id', async () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      slots: { default: () => h('input') },
    })
    // The id is wired on mount; the label's `for` updates on the next tick.
    await nextTick()
    const id = wrapper.find('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
  })

  // ── Class merging ──

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      attrs: { class: 'custom-class' },
      slots: { default: () => h('input') },
    })
    expect(wrapper.attributes('class')).toContain('custom-class')
  })
})
