import { mount } from '@vue/test-utils'
/**
 * DzVisuallyHidden — Contract conformance tests (Contract Spec v1).
 *
 * Validates the component's public API shape (props, slots, rendering) and the
 * core accessibility guarantee: content stays in the DOM / accessibility tree.
 */
import { describe, expect, it } from 'vitest'
import DzVisuallyHidden from './DzVisuallyHidden.vue'

describe('dzVisuallyHidden — Contract Spec v1', () => {
  describe('props', () => {
    it('renders as <span> by default', () => {
      const wrapper = mount(DzVisuallyHidden, {
        slots: { default: 'Hidden label' },
      })
      expect(wrapper.element.tagName).toBe('SPAN')
      expect(wrapper.text()).toBe('Hidden label')
    })

    it('accepts polymorphic as prop and renders the requested element', () => {
      const elements = ['span', 'div', 'p', 'label', 'a', 'li', 'output'] as const
      for (const as of elements) {
        const wrapper = mount(DzVisuallyHidden, {
          props: { as },
          slots: { default: 'Content' },
        })
        expect(wrapper.element.tagName).toBe(as.toUpperCase())
      }
    })

    it('accepts focusable prop', () => {
      const wrapper = mount(DzVisuallyHidden, {
        props: { focusable: true },
        slots: { default: 'Skip to content' },
      })
      expect(wrapper.classes().join(' ')).toContain('not-sr-only')
    })

    it('accepts id prop', () => {
      const wrapper = mount(DzVisuallyHidden, {
        props: { id: 'sr-label' },
        slots: { default: 'Label' },
      })
      expect(wrapper.attributes('id')).toBe('sr-label')
    })
  })

  describe('slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(DzVisuallyHidden, {
        slots: { default: '<strong>Important</strong>' },
      })
      expect(wrapper.find('strong').text()).toBe('Important')
    })
  })

  describe('accessibility contract', () => {
    it('keeps content in the accessibility tree (uses sr-only clip technique, not display:none)', () => {
      const wrapper = mount(DzVisuallyHidden, {
        slots: { default: 'Announced text' },
      })
      // Present in the DOM and readable by accessible-name computation.
      expect(wrapper.text()).toBe('Announced text')
      // Uses the clip technique, not display utilities that drop it from the tree.
      expect(wrapper.classes()).toContain('sr-only')
      expect(wrapper.classes()).not.toContain('hidden')
      expect(wrapper.element.style.display).not.toBe('none')
    })

    it('is not aria-hidden (content must remain announced)', () => {
      const wrapper = mount(DzVisuallyHidden, {
        slots: { default: 'Announced text' },
      })
      expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    })
  })

  describe('class merging (ADR-10)', () => {
    it('merges consumer class with internal classes via cn()', () => {
      const wrapper = mount(DzVisuallyHidden, {
        attrs: { class: 'custom-class' },
        slots: { default: 'Text' },
      })
      expect(wrapper.classes()).toContain('custom-class')
      expect(wrapper.classes()).toContain('sr-only')
    })
  })
})
