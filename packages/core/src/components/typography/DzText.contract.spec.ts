import { mount } from '@vue/test-utils'
/**
 * DzText — Contract conformance tests (Contract Spec v1).
 *
 * Validates that the component's public API shape (props, slots, rendering)
 * matches the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzText from './DzText.vue'

describe('dzText — Contract Spec v1', () => {
  describe('props', () => {
    it('renders with default props (as=p, size=md, tone=default)', () => {
      const wrapper = mount(DzText, {
        slots: { default: 'Hello' },
      })
      expect(wrapper.element.tagName).toBe('P')
      expect(wrapper.text()).toBe('Hello')
    })

    it('accepts as prop and renders correct element', () => {
      const elements = ['p', 'span', 'div', 'label', 'small', 'strong', 'em'] as const
      for (const as of elements) {
        const wrapper = mount(DzText, {
          props: { as },
          slots: { default: 'Text' },
        })
        expect(wrapper.element.tagName).toBe(as.toUpperCase())
      }
    })

    it('accepts size prop', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
      for (const size of sizes) {
        const wrapper = mount(DzText, {
          props: { size },
          slots: { default: 'Text' },
        })
        expect(wrapper.classes().join(' ')).toContain('text-')
      }
    })

    it('accepts tone prop', () => {
      const wrapper = mount(DzText, {
        props: { tone: 'muted' },
        slots: { default: 'Muted text' },
      })
      expect(wrapper.classes().join(' ')).toContain('text-')
    })

    it('accepts weight prop', () => {
      const wrapper = mount(DzText, {
        props: { weight: 'semibold' },
        slots: { default: 'Semibold' },
      })
      expect(wrapper.classes().join(' ')).toContain('font-')
    })

    it('accepts truncate prop', () => {
      const wrapper = mount(DzText, {
        props: { truncate: true },
        slots: { default: 'Long text' },
      })
      expect(wrapper.classes()).toContain('truncate')
    })

    it('accepts align prop', () => {
      const wrapper = mount(DzText, {
        props: { align: 'right' },
        slots: { default: 'Right' },
      })
      expect(wrapper.classes()).toContain('text-right')
    })

    it('accepts id prop', () => {
      const wrapper = mount(DzText, {
        props: { id: 'description' },
        slots: { default: 'Text' },
      })
      expect(wrapper.attributes('id')).toBe('description')
    })
  })

  describe('slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(DzText, {
        slots: { default: '<em>Emphasized</em>' },
      })
      expect(wrapper.find('em').text()).toBe('Emphasized')
    })
  })

  describe('class merging (ADR-10)', () => {
    it('merges consumer class with internal classes via cn()', () => {
      const wrapper = mount(DzText, {
        attrs: { class: 'mt-4' },
        slots: { default: 'Text' },
      })
      expect(wrapper.classes()).toContain('mt-4')
    })
  })
})
