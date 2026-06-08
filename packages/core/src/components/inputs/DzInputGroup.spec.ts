import { mount } from '@vue/test-utils'
/**
 * DzInputGroup — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzInput from './DzInput.vue'
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

describe('dzInputGroup — context propagation (ADR-08)', () => {
  it('propagates disabled to a grouped DzInput', () => {
    const wrapper = mount(DzInputGroup, {
      props: { disabled: true },
      slots: { default: () => h(DzInput) },
    })
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true)
  })

  it('does not disable a grouped DzInput when the group is enabled', () => {
    const wrapper = mount(DzInputGroup, {
      slots: { default: () => h(DzInput) },
    })
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(false)
  })

  it('propagates size to a grouped DzInput', () => {
    const wrapper = mount(DzInputGroup, {
      props: { size: 'lg' },
      slots: { default: () => h(DzInput) },
    })
    // lg height token appears on the input wrapper when size cascades down
    expect(wrapper.html()).toContain('--dz-input-lg-height')
  })

  it('lets an explicit child size override the group size', () => {
    const wrapper = mount(DzInputGroup, {
      props: { size: 'lg' },
      slots: { default: () => h(DzInput, { size: 'sm' }) },
    })
    expect(wrapper.html()).toContain('--dz-input-sm-height')
    expect(wrapper.html()).not.toContain('--dz-input-lg-height')
  })

  it('renders the grouped DzInput seamlessly (no own border)', () => {
    const wrapper = mount(DzInputGroup, {
      slots: { default: () => h(DzInput) },
    })
    // Seamless field strips its own box; the group root owns the border
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.html()).toContain('border-0')
  })
})
