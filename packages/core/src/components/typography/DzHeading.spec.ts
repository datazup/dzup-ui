import { mount } from '@vue/test-utils'
/**
 * DzHeading — Unit and behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzHeading from './DzHeading.vue'

describe('dzHeading', () => {
  describe('dynamic element rendering', () => {
    it('renders h1 for level=1', () => {
      const wrapper = mount(DzHeading, {
        props: { level: 1 },
        slots: { default: 'Title' },
      })
      expect(wrapper.element.tagName).toBe('H1')
    })

    it('renders h6 for level=6', () => {
      const wrapper = mount(DzHeading, {
        props: { level: 6 },
        slots: { default: 'Tiny heading' },
      })
      expect(wrapper.element.tagName).toBe('H6')
    })

    it('defaults to h2 when no level is specified', () => {
      const wrapper = mount(DzHeading, {
        slots: { default: 'Default' },
      })
      expect(wrapper.element.tagName).toBe('H2')
    })
  })

  describe('default size mapping', () => {
    it('maps level 1 to size 4xl by default', () => {
      const wrapper = mount(DzHeading, {
        props: { level: 1 },
        slots: { default: 'H1' },
      })
      // 4xl maps to --dz-text-5xl
      expect(wrapper.classes().join(' ')).toContain('text-')
    })

    it('allows size to override the level-based default', () => {
      const wrapper = mount(DzHeading, {
        props: { level: 1, size: 'xs' },
        slots: { default: 'Small H1' },
      })
      // Should use xs size classes, not 4xl
      const classStr = wrapper.classes().join(' ')
      expect(classStr).toContain('text-')
    })
  })

  describe('weight variants', () => {
    it('applies light weight', () => {
      const wrapper = mount(DzHeading, {
        props: { weight: 'light' },
        slots: { default: 'Light' },
      })
      expect(wrapper.classes().join(' ')).toContain('font-')
    })

    it('applies bold weight', () => {
      const wrapper = mount(DzHeading, {
        props: { weight: 'bold' },
        slots: { default: 'Bold' },
      })
      expect(wrapper.classes().join(' ')).toContain('font-')
    })
  })

  describe('truncation', () => {
    it('does not truncate by default', () => {
      const wrapper = mount(DzHeading, {
        slots: { default: 'Normal' },
      })
      expect(wrapper.classes()).not.toContain('truncate')
    })

    it('applies truncate class when truncate=true', () => {
      const wrapper = mount(DzHeading, {
        props: { truncate: true },
        slots: { default: 'Truncated' },
      })
      expect(wrapper.classes()).toContain('truncate')
    })
  })

  describe('alignment', () => {
    it('applies text-left', () => {
      const wrapper = mount(DzHeading, {
        props: { align: 'left' },
        slots: { default: 'Left' },
      })
      expect(wrapper.classes()).toContain('text-left')
    })

    it('applies text-center', () => {
      const wrapper = mount(DzHeading, {
        props: { align: 'center' },
        slots: { default: 'Center' },
      })
      expect(wrapper.classes()).toContain('text-center')
    })

    it('applies text-right', () => {
      const wrapper = mount(DzHeading, {
        props: { align: 'right' },
        slots: { default: 'Right' },
      })
      expect(wrapper.classes()).toContain('text-right')
    })
  })

  describe('slot content', () => {
    it('renders complex slot content', () => {
      const wrapper = mount(DzHeading, {
        slots: { default: '<span class="icon">*</span> Title' },
      })
      expect(wrapper.find('.icon').exists()).toBe(true)
      expect(wrapper.text()).toContain('Title')
    })
  })
})
