import { mount } from '@vue/test-utils'
/**
 * DzText — Unit and behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzText from './DzText.vue'

describe('dzText', () => {
  describe('dynamic element rendering', () => {
    it('defaults to <p> element', () => {
      const wrapper = mount(DzText, {
        slots: { default: 'Paragraph' },
      })
      expect(wrapper.element.tagName).toBe('P')
    })

    it('renders <span> when as="span"', () => {
      const wrapper = mount(DzText, {
        props: { as: 'span' },
        slots: { default: 'Inline' },
      })
      expect(wrapper.element.tagName).toBe('SPAN')
    })

    it('renders <label> when as="label"', () => {
      const wrapper = mount(DzText, {
        props: { as: 'label' },
        slots: { default: 'Label text' },
      })
      expect(wrapper.element.tagName).toBe('LABEL')
    })

    it('renders <strong> when as="strong"', () => {
      const wrapper = mount(DzText, {
        props: { as: 'strong' },
        slots: { default: 'Important' },
      })
      expect(wrapper.element.tagName).toBe('STRONG')
    })

    it('renders <em> when as="em"', () => {
      const wrapper = mount(DzText, {
        props: { as: 'em' },
        slots: { default: 'Emphasized' },
      })
      expect(wrapper.element.tagName).toBe('EM')
    })

    it('renders <small> when as="small"', () => {
      const wrapper = mount(DzText, {
        props: { as: 'small' },
        slots: { default: 'Fine print' },
      })
      expect(wrapper.element.tagName).toBe('SMALL')
    })

    it('renders <div> when as="div"', () => {
      const wrapper = mount(DzText, {
        props: { as: 'div' },
        slots: { default: 'Block' },
      })
      expect(wrapper.element.tagName).toBe('DIV')
    })
  })

  describe('size variants', () => {
    it('applies size classes for all sizes', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
      for (const size of sizes) {
        const wrapper = mount(DzText, {
          props: { size },
          slots: { default: 'Text' },
        })
        expect(wrapper.classes().length).toBeGreaterThan(0)
      }
    })
  })

  describe('tone variants', () => {
    it('applies default tone', () => {
      const wrapper = mount(DzText, {
        props: { tone: 'default' },
        slots: { default: 'Default' },
      })
      expect(wrapper.classes().join(' ')).toContain('text-')
    })

    it('applies muted tone', () => {
      const wrapper = mount(DzText, {
        props: { tone: 'muted' },
        slots: { default: 'Muted' },
      })
      expect(wrapper.classes().join(' ')).toContain('text-')
    })

    it('applies success tone', () => {
      const wrapper = mount(DzText, {
        props: { tone: 'success' },
        slots: { default: 'Success' },
      })
      expect(wrapper.classes().join(' ')).toContain('text-')
    })

    it('applies warning tone', () => {
      const wrapper = mount(DzText, {
        props: { tone: 'warning' },
        slots: { default: 'Warning' },
      })
      expect(wrapper.classes().join(' ')).toContain('text-')
    })

    it('applies danger tone', () => {
      const wrapper = mount(DzText, {
        props: { tone: 'danger' },
        slots: { default: 'Danger' },
      })
      expect(wrapper.classes().join(' ')).toContain('text-')
    })
  })

  describe('weight variants', () => {
    it('applies weight classes for all weights', () => {
      const weights = ['light', 'normal', 'medium', 'semibold', 'bold'] as const
      for (const weight of weights) {
        const wrapper = mount(DzText, {
          props: { weight },
          slots: { default: 'Text' },
        })
        expect(wrapper.classes().join(' ')).toContain('font-')
      }
    })
  })

  describe('truncation', () => {
    it('does not truncate by default', () => {
      const wrapper = mount(DzText, {
        slots: { default: 'Normal text' },
      })
      expect(wrapper.classes()).not.toContain('truncate')
    })

    it('applies truncate when enabled', () => {
      const wrapper = mount(DzText, {
        props: { truncate: true },
        slots: { default: 'Long text' },
      })
      expect(wrapper.classes()).toContain('truncate')
    })
  })

  describe('alignment', () => {
    it('applies text-left', () => {
      const wrapper = mount(DzText, {
        props: { align: 'left' },
        slots: { default: 'Left' },
      })
      expect(wrapper.classes()).toContain('text-left')
    })

    it('applies text-center', () => {
      const wrapper = mount(DzText, {
        props: { align: 'center' },
        slots: { default: 'Center' },
      })
      expect(wrapper.classes()).toContain('text-center')
    })

    it('applies text-right', () => {
      const wrapper = mount(DzText, {
        props: { align: 'right' },
        slots: { default: 'Right' },
      })
      expect(wrapper.classes()).toContain('text-right')
    })
  })

  describe('slot content', () => {
    it('renders rich slot content', () => {
      const wrapper = mount(DzText, {
        slots: { default: '<a href="#">Link</a> and text' },
      })
      expect(wrapper.find('a').text()).toBe('Link')
    })
  })
})
