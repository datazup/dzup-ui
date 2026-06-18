import { mount } from '@vue/test-utils'
/**
 * DzVisuallyHidden — Unit and behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzVisuallyHidden from './DzVisuallyHidden.vue'

describe('dzVisuallyHidden', () => {
  describe('polymorphic rendering', () => {
    it('defaults to <span> (inline)', () => {
      const wrapper = mount(DzVisuallyHidden, {
        slots: { default: 'Inline label' },
      })
      expect(wrapper.element.tagName).toBe('SPAN')
    })

    it('renders <div> for block content', () => {
      const wrapper = mount(DzVisuallyHidden, {
        props: { as: 'div' },
        slots: { default: 'Block content' },
      })
      expect(wrapper.element.tagName).toBe('DIV')
    })

    it('renders <a> when wrapping a link (skip-link usage)', () => {
      const wrapper = mount(DzVisuallyHidden, {
        props: { as: 'a' },
        slots: { default: 'Skip to main content' },
      })
      expect(wrapper.element.tagName).toBe('A')
    })
  })

  describe('hiding technique', () => {
    it('applies sr-only by default', () => {
      const wrapper = mount(DzVisuallyHidden, {
        slots: { default: 'Text' },
      })
      expect(wrapper.classes()).toContain('sr-only')
    })

    it('does not set any inline display:none', () => {
      const wrapper = mount(DzVisuallyHidden, {
        slots: { default: 'Text' },
      })
      expect(wrapper.element.style.display).not.toBe('none')
    })

    it('keeps slot text content present in the DOM', () => {
      const wrapper = mount(DzVisuallyHidden, {
        slots: { default: 'Save document' },
      })
      expect(wrapper.text()).toBe('Save document')
    })
  })

  describe('focusable reveal (skip-link pattern)', () => {
    it('does not add reveal classes when focusable is false (default)', () => {
      const wrapper = mount(DzVisuallyHidden, {
        slots: { default: 'Text' },
      })
      expect(wrapper.classes().join(' ')).not.toContain('not-sr-only')
    })

    it('adds focus + focus-within reveal classes when focusable', () => {
      const wrapper = mount(DzVisuallyHidden, {
        props: { focusable: true },
        slots: { default: 'Skip to content' },
      })
      const classes = wrapper.classes().join(' ')
      expect(classes).toContain('focus:not-sr-only')
      expect(classes).toContain('focus-within:not-sr-only')
      // Still hidden until focused.
      expect(wrapper.classes()).toContain('sr-only')
    })
  })

  describe('attribute fall-through', () => {
    it('forwards arbitrary attributes to the rendered element', () => {
      const wrapper = mount(DzVisuallyHidden, {
        attrs: { 'data-testid': 'sr', 'role': 'status' },
        slots: { default: 'Live message' },
      })
      expect(wrapper.attributes('data-testid')).toBe('sr')
      expect(wrapper.attributes('role')).toBe('status')
    })
  })

  describe('slot content', () => {
    it('renders rich slot content', () => {
      const wrapper = mount(DzVisuallyHidden, {
        slots: { default: '<span>Page</span> <em>2</em> of 10' },
      })
      expect(wrapper.find('em').text()).toBe('2')
      expect(wrapper.text()).toContain('Page')
    })
  })
})
