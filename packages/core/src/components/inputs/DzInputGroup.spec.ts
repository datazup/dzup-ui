import { mount } from '@vue/test-utils'
/**
 * DzInputGroup — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzInputGroup from './DzInputGroup.vue'

describe('dzInputGroup — Unit Tests', () => {
  it('renders a <div> element', () => {
    const wrapper = mount(DzInputGroup, {
      slots: { default: '<input />' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('renders prefix addon when slot is provided', () => {
    const wrapper = mount(DzInputGroup, {
      slots: {
        prefix: 'https://',
        default: '<input />',
      },
    })
    expect(wrapper.text()).toContain('https://')
  })

  it('renders suffix addon when slot is provided', () => {
    const wrapper = mount(DzInputGroup, {
      slots: {
        default: '<input />',
        suffix: '.com',
      },
    })
    expect(wrapper.text()).toContain('.com')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzInputGroup, {
      slots: { default: '<input data-testid="input" />' },
    })
    expect(wrapper.find('[data-testid="input"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzInputGroup, {
      attrs: { class: 'my-class' },
      slots: { default: '<input />' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzInputGroup, {
      props: { disabled: true },
      slots: { default: '<input />' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('sets id when provided', () => {
    const wrapper = mount(DzInputGroup, {
      props: { id: 'group-1' },
      slots: { default: '<input />' },
    })
    expect(wrapper.attributes('id')).toBe('group-1')
  })

  it('does not render prefix span when no prefix slot', () => {
    const wrapper = mount(DzInputGroup, {
      slots: { default: '<input />' },
    })
    // Only the input wrapper div + the input itself
    expect(wrapper.findAll('span')).toHaveLength(0)
  })
})
