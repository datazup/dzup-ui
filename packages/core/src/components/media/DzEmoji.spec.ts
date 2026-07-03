import { mount } from '@vue/test-utils'
/**
 * DzEmoji — Unit and behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzEmoji from './DzEmoji.vue'

describe('dzEmoji', () => {
  describe('rendering', () => {
    it('renders a span as the root element', () => {
      const wrapper = mount(DzEmoji, { props: { emoji: '🎉' } })
      expect(wrapper.element.tagName).toBe('SPAN')
    })

    it('renders the emoji text content', () => {
      const wrapper = mount(DzEmoji, { props: { emoji: '❤️' } })
      expect(wrapper.text()).toBe('❤️')
    })

    it('renders multi-codepoint emoji (ZWJ sequences) intact', () => {
      const family = '👨‍👩‍👧‍👦'
      const wrapper = mount(DzEmoji, { props: { emoji: family, label: 'Family' } })
      expect(wrapper.text()).toBe(family)
    })
  })

  describe('size variants', () => {
    it('applies xs size (text-sm)', () => {
      const wrapper = mount(DzEmoji, { props: { emoji: '🎉', size: 'xs' } })
      expect(wrapper.classes()).toContain('text-sm')
    })

    it('applies md size (text-2xl) by default', () => {
      const wrapper = mount(DzEmoji, { props: { emoji: '🎉' } })
      expect(wrapper.classes()).toContain('text-2xl')
    })

    it('applies xl size (text-5xl)', () => {
      const wrapper = mount(DzEmoji, { props: { emoji: '🎉', size: 'xl' } })
      expect(wrapper.classes()).toContain('text-5xl')
    })
  })

  describe('accessibility', () => {
    it('marks as decorative by default', () => {
      const wrapper = mount(DzEmoji, { props: { emoji: '🎉' } })
      expect(wrapper.attributes('aria-hidden')).toBe('true')
      expect(wrapper.attributes('role')).toBeUndefined()
      expect(wrapper.attributes('aria-label')).toBeUndefined()
    })

    it('marks as meaningful when label is set', () => {
      const wrapper = mount(DzEmoji, {
        props: { emoji: '🎉', label: 'Celebration' },
      })
      expect(wrapper.attributes('aria-hidden')).toBeUndefined()
      expect(wrapper.attributes('role')).toBe('img')
      expect(wrapper.attributes('aria-label')).toBe('Celebration')
    })
  })

  describe('class merging', () => {
    it('includes select-none base class', () => {
      const wrapper = mount(DzEmoji, { props: { emoji: '🎉' } })
      expect(wrapper.classes()).toContain('select-none')
    })

    it('merges custom classes', () => {
      const wrapper = mount(DzEmoji, {
        props: { emoji: '🎉' },
        attrs: { class: 'opacity-50' },
      })
      expect(wrapper.classes()).toContain('opacity-50')
      expect(wrapper.classes()).toContain('inline-block')
    })

    it('does not leak a raw class attribute duplicate', () => {
      const wrapper = mount(DzEmoji, {
        props: { emoji: '🎉' },
        attrs: { class: 'mt-1' },
      })
      // cn() merges — the consumer class appears exactly once
      const classAttr = wrapper.attributes('class') ?? ''
      const occurrences = classAttr.split(/\s+/).filter(c => c === 'mt-1').length
      expect(occurrences).toBe(1)
    })
  })
})
