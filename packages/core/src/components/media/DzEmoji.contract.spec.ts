import { mount } from '@vue/test-utils'
/**
 * DzEmoji — Contract conformance tests (Contract Spec v1).
 *
 * Validates that the component's public API shape (props, accessibility)
 * matches the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzEmoji from './DzEmoji.vue'

describe('dzEmoji — Contract Spec v1', () => {
  describe('props', () => {
    it('renders the provided emoji', () => {
      const wrapper = mount(DzEmoji, {
        props: { emoji: '🎉' },
      })
      expect(wrapper.text()).toBe('🎉')
    })

    it('applies default size (md → text-2xl)', () => {
      const wrapper = mount(DzEmoji, {
        props: { emoji: '🎉' },
      })
      expect(wrapper.classes()).toContain('text-2xl')
    })

    it('accepts size prop and applies correct type scale', () => {
      const sizeMap = {
        xs: 'text-sm',
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl',
        xl: 'text-5xl',
      } as const

      for (const [size, expected] of Object.entries(sizeMap)) {
        const wrapper = mount(DzEmoji, {
          props: { emoji: '🎉', size: size as keyof typeof sizeMap },
        })
        expect(wrapper.classes()).toContain(expected)
      }
    })

    it('accepts id prop', () => {
      const wrapper = mount(DzEmoji, {
        props: { emoji: '🎉', id: 'emoji-party' },
      })
      expect(wrapper.attributes('id')).toBe('emoji-party')
    })
  })

  describe('accessibility', () => {
    it('is decorative by default (aria-hidden="true", no role)', () => {
      const wrapper = mount(DzEmoji, {
        props: { emoji: '🎉' },
      })
      expect(wrapper.attributes('aria-hidden')).toBe('true')
      expect(wrapper.attributes('role')).toBeUndefined()
      expect(wrapper.attributes('aria-label')).toBeUndefined()
    })

    it('becomes meaningful when label is provided', () => {
      const wrapper = mount(DzEmoji, {
        props: { emoji: '🎉', label: 'Party popper' },
      })
      expect(wrapper.attributes('aria-hidden')).toBeUndefined()
      expect(wrapper.attributes('role')).toBe('img')
      expect(wrapper.attributes('aria-label')).toBe('Party popper')
    })
  })

  describe('class merging (ADR-10)', () => {
    it('merges consumer class with internal classes via cn()', () => {
      const wrapper = mount(DzEmoji, {
        props: { emoji: '🎉' },
        attrs: { class: 'ml-2' },
      })
      expect(wrapper.classes()).toContain('ml-2')
      expect(wrapper.classes()).toContain('inline-block')
    })
  })
})
