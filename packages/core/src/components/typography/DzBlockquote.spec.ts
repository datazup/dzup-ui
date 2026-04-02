import { mount } from '@vue/test-utils'
/**
 * DzBlockquote — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzBlockquote from './DzBlockquote.vue'

describe('dzBlockquote — Unit Tests', () => {
  it('renders a <blockquote> element', () => {
    const wrapper = mount(DzBlockquote, { slots: { default: 'Quote text' } })
    expect(wrapper.element.tagName).toBe('BLOCKQUOTE')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzBlockquote, {
      attrs: { class: 'my-class' },
      slots: { default: 'text' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzBlockquote, {
      attrs: { 'data-testid': 'bq' },
      slots: { default: 'text' },
    })
    expect(wrapper.attributes('data-testid')).toBe('bq')
  })

  it('sets cite attribute when provided', () => {
    const wrapper = mount(DzBlockquote, {
      props: { cite: 'https://example.com' },
      slots: { default: 'text' },
    })
    expect(wrapper.attributes('cite')).toBe('https://example.com')
  })

  it('renders footer slot for attribution', () => {
    const wrapper = mount(DzBlockquote, {
      slots: {
        default: 'Quote',
        footer: 'Author Name',
      },
    })
    expect(wrapper.find('footer').exists()).toBe(true)
    expect(wrapper.find('footer').text()).toBe('Author Name')
  })

  it('does not render footer when no footer slot', () => {
    const wrapper = mount(DzBlockquote, { slots: { default: 'Quote' } })
    expect(wrapper.find('footer').exists()).toBe(false)
  })

  it('applies left border styling', () => {
    const wrapper = mount(DzBlockquote, { slots: { default: 'text' } })
    expect(wrapper.classes().join(' ')).toContain('border-l-4')
  })
})
