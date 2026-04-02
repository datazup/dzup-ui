import { mount } from '@vue/test-utils'
/**
 * DzScrollArea — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzScrollArea from './DzScrollArea.vue'

describe('dzScrollArea — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzScrollArea, {
      slots: { default: '<p>Content</p>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mount(DzScrollArea, {
      slots: { default: '<p data-testid="inner">Content</p>' },
    })
    expect(wrapper.find('[data-testid="inner"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzScrollArea, {
      attrs: { class: 'h-72 w-48' },
      slots: { default: 'Content' },
    })
    expect(wrapper.classes()).toContain('h-72')
    expect(wrapper.classes()).toContain('w-48')
  })

  it('sets id when provided', () => {
    const wrapper = mount(DzScrollArea, {
      props: { id: 'scroll-1' },
      slots: { default: 'Content' },
    })
    expect(wrapper.attributes('id')).toBe('scroll-1')
  })

  it('sets aria-label when provided', () => {
    const wrapper = mount(DzScrollArea, {
      props: { ariaLabel: 'Scrollable content' },
      slots: { default: 'Content' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Scrollable content')
  })
})
