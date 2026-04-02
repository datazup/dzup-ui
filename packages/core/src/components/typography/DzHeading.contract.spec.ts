import { mount } from '@vue/test-utils'
/**
 * DzHeading — Contract conformance tests (Contract Spec v1).
 *
 * Validates that the component's public API shape (props, slots, rendering)
 * matches the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzHeading from './DzHeading.vue'

describe('dzHeading — Contract Spec v1', () => {
  describe('props', () => {
    it('renders with default props (level=2, no size override)', () => {
      const wrapper = mount(DzHeading, {
        slots: { default: 'Hello' },
      })
      expect(wrapper.element.tagName).toBe('H2')
      expect(wrapper.text()).toBe('Hello')
    })

    it('accepts level prop and renders correct heading element', () => {
      for (const level of [1, 2, 3, 4, 5, 6] as const) {
        const wrapper = mount(DzHeading, {
          props: { level },
          slots: { default: `H${level}` },
        })
        expect(wrapper.element.tagName).toBe(`H${level}`)
      }
    })

    it('accepts size prop independently of level', () => {
      const wrapper = mount(DzHeading, {
        props: { level: 3, size: 'xl' },
        slots: { default: 'Title' },
      })
      expect(wrapper.element.tagName).toBe('H3')
      // Visual size classes should reflect 'xl', not level 3 default
      expect(wrapper.classes().join(' ')).toContain('text-')
    })

    it('accepts weight prop', () => {
      const wrapper = mount(DzHeading, {
        props: { weight: 'bold' },
        slots: { default: 'Bold' },
      })
      expect(wrapper.classes().join(' ')).toContain('font-')
    })

    it('accepts truncate prop', () => {
      const wrapper = mount(DzHeading, {
        props: { truncate: true },
        slots: { default: 'Very long heading text' },
      })
      expect(wrapper.classes()).toContain('truncate')
    })

    it('accepts align prop', () => {
      const wrapper = mount(DzHeading, {
        props: { align: 'center' },
        slots: { default: 'Centered' },
      })
      expect(wrapper.classes()).toContain('text-center')
    })

    it('accepts id prop', () => {
      const wrapper = mount(DzHeading, {
        props: { id: 'section-title' },
        slots: { default: 'Title' },
      })
      expect(wrapper.attributes('id')).toBe('section-title')
    })
  })

  describe('slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(DzHeading, {
        slots: { default: '<span>Rich content</span>' },
      })
      expect(wrapper.find('span').text()).toBe('Rich content')
    })
  })

  describe('class merging (ADR-10)', () => {
    it('merges consumer class with internal classes via cn()', () => {
      const wrapper = mount(DzHeading, {
        attrs: { class: 'my-custom-class' },
        slots: { default: 'Title' },
      })
      expect(wrapper.classes()).toContain('my-custom-class')
    })
  })
})
