import { mount } from '@vue/test-utils'
/**
 * DzAvatarGroup — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzAvatar from './DzAvatar.vue'
import DzAvatarGroup from './DzAvatarGroup.vue'

describe('dzAvatarGroup — Unit Tests', () => {
  it('renders a <div> with role="group"', () => {
    const wrapper = mount(DzAvatarGroup, {
      slots: { default: () => h(DzAvatar, { fallback: 'A' }) },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('group')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAvatarGroup, {
      attrs: { class: 'my-class' },
      slots: { default: () => h(DzAvatar, { fallback: 'A' }) },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('renders child avatars', () => {
    const wrapper = mount(DzAvatarGroup, {
      slots: {
        default: () => [
          h(DzAvatar, { fallback: 'A' }),
          h(DzAvatar, { fallback: 'B' }),
        ],
      },
    })
    expect(wrapper.findAllComponents(DzAvatar)).toHaveLength(2)
  })

  it('propagates size to child avatars via inject', () => {
    const wrapper = mount(DzAvatarGroup, {
      props: { size: 'lg' },
      slots: {
        default: () => h(DzAvatar, { fallback: 'A' }),
      },
    })
    const avatar = wrapper.findComponent(DzAvatar)
    // lg size class
    expect(avatar.classes().join(' ')).toContain('h-12')
  })

  it('sets aria-label when provided', () => {
    const wrapper = mount(DzAvatarGroup, {
      props: { ariaLabel: 'Team members' },
      slots: { default: () => h(DzAvatar, { fallback: 'A' }) },
    })
    expect(wrapper.attributes('aria-label')).toBe('Team members')
  })

  it('shows negative space overlap styling', () => {
    const wrapper = mount(DzAvatarGroup, {
      slots: { default: () => h(DzAvatar, { fallback: 'A' }) },
    })
    expect(wrapper.classes().join(' ')).toContain('-space-x-2')
  })
})
