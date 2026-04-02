import { mount } from '@vue/test-utils'
/**
 * DzCaption — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzCaption from './DzCaption.vue'

describe('dzCaption — Unit Tests', () => {
  it('renders a <small> element', () => {
    const wrapper = mount(DzCaption, { slots: { default: 'caption' } })
    expect(wrapper.element.tagName).toBe('SMALL')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCaption, {
      attrs: { class: 'my-class' },
      slots: { default: 'text' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzCaption, {
      attrs: { 'data-testid': 'cap' },
      slots: { default: 'text' },
    })
    expect(wrapper.attributes('data-testid')).toBe('cap')
  })

  it('applies muted tone by default', () => {
    const wrapper = mount(DzCaption, { slots: { default: 'text' } })
    expect(wrapper.classes().join(' ')).toContain('text-[var(--dz-muted-foreground)]')
  })

  it('applies danger tone classes', () => {
    const wrapper = mount(DzCaption, {
      props: { tone: 'danger' },
      slots: { default: 'text' },
    })
    expect(wrapper.classes().join(' ')).toContain('text-[var(--dz-danger)]')
  })

  it('applies success tone classes', () => {
    const wrapper = mount(DzCaption, {
      props: { tone: 'success' },
      slots: { default: 'text' },
    })
    expect(wrapper.classes().join(' ')).toContain('text-[var(--dz-success)]')
  })

  it('sets id attribute when provided', () => {
    const wrapper = mount(DzCaption, {
      props: { id: 'cap-1' },
      slots: { default: 'text' },
    })
    expect(wrapper.attributes('id')).toBe('cap-1')
  })
})
