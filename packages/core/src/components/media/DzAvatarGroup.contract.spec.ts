import { mount } from '@vue/test-utils'
/**
 * DzAvatarGroup — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzAvatarGroup from './DzAvatarGroup.vue'

describe('dzAvatarGroup — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzAvatarGroup, { slots: { default: '<div>Avatars</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzAvatarGroup, { props: { size }, slots: { default: '<div>Avatars</div>' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzAvatarGroup, {
      props: { ariaLabel: 'Team members' },
      slots: { default: '<div>Avatars</div>' },
    })
    expect(wrapper.html()).toContain('Team members')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzAvatarGroup, {
      slots: { default: '<div data-testid="child">Avatar</div>' },
    })
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAvatarGroup, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Avatars</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
