import { mount } from '@vue/test-utils'
/**
 * DzFlex -- Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzFlex from './DzFlex.vue'

describe('dzFlex -- Unit Tests', () => {
  it('renders a <div> element by default', () => {
    const wrapper = mount(DzFlex, { slots: { default: '<div>Item</div>' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('applies flex-col for direction="column"', () => {
    const wrapper = mount(DzFlex, {
      props: { direction: 'column' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('flex-col')
  })

  it('applies flex-row-reverse for direction="row-reverse"', () => {
    const wrapper = mount(DzFlex, {
      props: { direction: 'row-reverse' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('flex-row-reverse')
  })

  it('applies flex-col-reverse for direction="column-reverse"', () => {
    const wrapper = mount(DzFlex, {
      props: { direction: 'column-reverse' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('flex-col-reverse')
  })

  it('applies items-center for align="center"', () => {
    const wrapper = mount(DzFlex, {
      props: { align: 'center' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('items-center')
  })

  it('applies items-baseline for align="baseline"', () => {
    const wrapper = mount(DzFlex, {
      props: { align: 'baseline' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('items-baseline')
  })

  it('applies justify-between for justify="between"', () => {
    const wrapper = mount(DzFlex, {
      props: { justify: 'between' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('justify-between')
  })

  it('applies justify-evenly for justify="evenly"', () => {
    const wrapper = mount(DzFlex, {
      props: { justify: 'evenly' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('justify-evenly')
  })

  it('does not apply flex-wrap when wrap is false', () => {
    const wrapper = mount(DzFlex, {
      props: { wrap: false },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).not.toContain('flex-wrap')
  })

  it('renders as <nav> when as="nav"', () => {
    const wrapper = mount(DzFlex, {
      props: { as: 'nav' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.element.tagName).toBe('NAV')
  })

  it('combines direction, align, justify, and gap', () => {
    const wrapper = mount(DzFlex, {
      props: {
        direction: 'column',
        align: 'center',
        justify: 'between',
        gap: 'lg',
      },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('flex-col')
    expect(wrapper.classes()).toContain('items-center')
    expect(wrapper.classes()).toContain('justify-between')
  })
})
