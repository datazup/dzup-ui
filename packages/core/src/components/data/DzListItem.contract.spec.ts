import { mount } from '@vue/test-utils'
/**
 * DzListItem — Contract Spec v1 conformance tests.
 *
 * DzListItem injects context from DzList. We test it both standalone (no
 * context — falls back to defaults) and inside DzList.
 */
import { describe, expect, it } from 'vitest'
import DzList from './DzList.vue'
import DzListItem from './DzListItem.vue'

describe('dzListItem — Contract Spec v1', () => {
  it('renders without errors standalone', () => {
    const wrapper = mount(DzListItem, {
      slots: { default: 'Item text' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders with role="listitem"', () => {
    const wrapper = mount(DzListItem, {
      slots: { default: 'Item' },
    })
    expect(wrapper.attributes('role')).toBe('listitem')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzListItem, {
      slots: { default: 'Hello item' },
    })
    expect(wrapper.text()).toContain('Hello item')
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzListItem, {
      props: { ariaLabel: 'Profile link' },
      slots: { default: 'Profile' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Profile link')
  })

  it('sets aria-disabled when disabled', () => {
    const wrapper = mount(DzListItem, {
      props: { disabled: true },
      slots: { default: 'Locked' },
    })
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('sets aria-selected and data-state when active', () => {
    const wrapper = mount(DzListItem, {
      props: { active: true },
      slots: { default: 'Active' },
    })
    expect(wrapper.attributes('aria-selected')).toBe('true')
    expect(wrapper.attributes('data-state')).toBe('active')
  })

  it('renders prefix and suffix slots', () => {
    const wrapper = mount(DzListItem, {
      slots: {
        default: 'Label',
        prefix: '<span data-testid="pre">▶</span>',
        suffix: '<span data-testid="suf">✓</span>',
      },
    })
    expect(wrapper.find('[data-testid="pre"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="suf"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzListItem, {
      attrs: { class: 'custom-class' },
      slots: { default: 'Item' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  it('renders inside DzList without errors', () => {
    const wrapper = mount(DzList, {
      slots: {
        default: `<DzListItem>Nested</DzListItem>`,
      },
    })
    expect(wrapper.text()).toContain('Nested')
  })
})
