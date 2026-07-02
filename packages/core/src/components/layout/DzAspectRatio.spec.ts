import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
/**
 * DzAspectRatio — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzAspectRatio from './DzAspectRatio.vue'

/**
 * Read the rendered root element's bound `style` object from the component's
 * vnode subtree. JSDOM's CSSOM does not implement the `aspect-ratio` CSS
 * property and silently drops it from the serialized `style` attribute (a
 * div with only `aspect-ratio` renders with no `style` attribute at all), so
 * asserting against `wrapper.attributes('style')` is unreliable under jsdom.
 * The vnode binding is the source of truth before jsdom serialization.
 */
function rootStyleBinding(wrapper: VueWrapper): Record<string, unknown> {
  const vm = wrapper.vm as unknown as {
    $: { subTree: { props?: { style?: Record<string, unknown> } } }
  }
  return vm.$.subTree.props?.style ?? {}
}

describe('dzAspectRatio — Unit Tests', () => {
  it('renders a <div> element', () => {
    const wrapper = mount(DzAspectRatio, { slots: { default: 'content' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('sets aspect-ratio: 1 by default', () => {
    const wrapper = mount(DzAspectRatio, { slots: { default: 'content' } })
    expect(rootStyleBinding(wrapper)['aspect-ratio']).toBe('1')
  })

  it('applies custom aspect ratio', () => {
    const wrapper = mount(DzAspectRatio, {
      props: { ratio: 16 / 9 },
      slots: { default: 'content' },
    })
    expect(rootStyleBinding(wrapper)['aspect-ratio']).toBe(`${16 / 9}`)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAspectRatio, {
      attrs: { class: 'my-class' },
      slots: { default: 'content' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzAspectRatio, {
      attrs: { 'data-testid': 'ar' },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-testid')).toBe('ar')
  })

  it('renders slot content', () => {
    const wrapper = mount(DzAspectRatio, {
      slots: { default: '<img alt="test" />' },
    })
    expect(wrapper.find('img').exists()).toBe(true)
  })

  it('sets id when provided', () => {
    const wrapper = mount(DzAspectRatio, {
      props: { id: 'ar-1' },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('id')).toBe('ar-1')
  })
})
