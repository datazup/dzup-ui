import { mount } from '@vue/test-utils'
/**
 * DzContainer -- Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzContainer from './DzContainer.vue'

describe('dzContainer -- Unit Tests', () => {
  it('renders a <div> element by default', () => {
    const wrapper = mount(DzContainer, { slots: { default: 'Content' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('renders as a <main> element when as="main"', () => {
    const wrapper = mount(DzContainer, {
      props: { as: 'main' },
      slots: { default: 'Content' },
    })
    expect(wrapper.element.tagName).toBe('MAIN')
  })

  it('renders as a <header> element when as="header"', () => {
    const wrapper = mount(DzContainer, {
      props: { as: 'header' },
      slots: { default: 'Content' },
    })
    expect(wrapper.element.tagName).toBe('HEADER')
  })

  it('applies sm max-width class', () => {
    const wrapper = mount(DzContainer, {
      props: { maxWidth: 'sm' },
      slots: { default: 'Content' },
    })
    expect(wrapper.classes()).toContain('max-w-screen-sm')
  })

  it('applies 2xl max-width class', () => {
    const wrapper = mount(DzContainer, {
      props: { maxWidth: '2xl' },
      slots: { default: 'Content' },
    })
    expect(wrapper.classes()).toContain('max-w-screen-2xl')
  })

  it('applies full max-width class', () => {
    const wrapper = mount(DzContainer, {
      props: { maxWidth: 'full' },
      slots: { default: 'Content' },
    })
    expect(wrapper.classes()).toContain('max-w-full')
  })

  it('always has w-full class', () => {
    const wrapper = mount(DzContainer, { slots: { default: 'Content' } })
    expect(wrapper.classes()).toContain('w-full')
  })

  it('renders complex slot content', () => {
    const wrapper = mount(DzContainer, {
      slots: {
        default: () => [
          h('h1', 'Title'),
          h('p', 'Paragraph'),
        ],
      },
    })
    expect(wrapper.find('h1').text()).toBe('Title')
    expect(wrapper.find('p').text()).toBe('Paragraph')
  })

  it('forwards aria-describedby', () => {
    const wrapper = mount(DzContainer, {
      props: { ariaDescribedby: 'desc-1' },
      slots: { default: 'Content' },
    })
    expect(wrapper.attributes('aria-describedby')).toBe('desc-1')
  })

  it('forwards aria-labelledby', () => {
    const wrapper = mount(DzContainer, {
      props: { ariaLabelledby: 'label-1' },
      slots: { default: 'Content' },
    })
    expect(wrapper.attributes('aria-labelledby')).toBe('label-1')
  })
})
