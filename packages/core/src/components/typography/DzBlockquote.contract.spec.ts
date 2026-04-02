import { mount } from '@vue/test-utils'
/**
 * DzBlockquote — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzBlockquote from './DzBlockquote.vue'

describe('dzBlockquote — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzBlockquote, { slots: { default: 'A great quote.' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders as a blockquote element', () => {
    const wrapper = mount(DzBlockquote, { slots: { default: 'Quote' } })
    expect(wrapper.element.tagName.toLowerCase()).toBe('blockquote')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzBlockquote, { slots: { default: 'To be or not to be.' } })
    expect(wrapper.text()).toContain('To be or not to be.')
  })

  it('renders footer slot', () => {
    const wrapper = mount(DzBlockquote, {
      slots: { default: 'Quote', footer: '<span data-testid="footer">- Author</span>' },
    })
    expect(wrapper.find('[data-testid="footer"]').exists()).toBe(true)
  })

  it('accepts cite prop', () => {
    const wrapper = mount(DzBlockquote, {
      props: { cite: 'Shakespeare' },
      slots: { default: 'Quote' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzBlockquote, {
      attrs: { class: 'custom-class' },
      slots: { default: 'Quote' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
