import { mount } from '@vue/test-utils'
/**
 * DzIcon — Unit and behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DzIcon from './DzIcon.vue'

/** Minimal stub icon component for testing */
const StubIcon = defineComponent({
  name: 'StubIcon',
  props: {
    strokeWidth: { type: Number, default: 2 },
  },
  setup(props) {
    return () => h('svg', { 'stroke-width': props.strokeWidth }, [h('circle')])
  },
})

describe('dzIcon', () => {
  describe('icon rendering', () => {
    it('renders the given component as the root element', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon },
      })
      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.find('circle').exists()).toBe(true)
    })
  })

  describe('size variants', () => {
    it('applies xs size (h-3 w-3)', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon, size: 'xs' },
      })
      expect(wrapper.classes()).toContain('h-3')
      expect(wrapper.classes()).toContain('w-3')
    })

    it('applies sm size (h-4 w-4)', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon, size: 'sm' },
      })
      expect(wrapper.classes()).toContain('h-4')
      expect(wrapper.classes()).toContain('w-4')
    })

    it('applies md size (h-5 w-5) by default', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon },
      })
      expect(wrapper.classes()).toContain('h-5')
      expect(wrapper.classes()).toContain('w-5')
    })

    it('applies lg size (h-6 w-6)', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon, size: 'lg' },
      })
      expect(wrapper.classes()).toContain('h-6')
      expect(wrapper.classes()).toContain('w-6')
    })

    it('applies xl size (h-8 w-8)', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon, size: 'xl' },
      })
      expect(wrapper.classes()).toContain('h-8')
      expect(wrapper.classes()).toContain('w-8')
    })
  })

  describe('stroke width', () => {
    it('uses default stroke width for md size (2)', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon },
      })
      expect(wrapper.attributes('stroke-width')).toBe('2')
    })

    it('uses reduced stroke width for xl size (1.5)', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon, size: 'xl' },
      })
      expect(wrapper.attributes('stroke-width')).toBe('1.5')
    })

    it('uses reduced stroke width for lg size (1.75)', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon, size: 'lg' },
      })
      expect(wrapper.attributes('stroke-width')).toBe('1.75')
    })

    it('allows explicit strokeWidth override', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon, strokeWidth: 3 },
      })
      expect(wrapper.attributes('stroke-width')).toBe('3')
    })
  })

  describe('accessibility', () => {
    it('marks as decorative by default', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon },
      })
      expect(wrapper.attributes('aria-hidden')).toBe('true')
      expect(wrapper.attributes('role')).toBeUndefined()
      expect(wrapper.attributes('aria-label')).toBeUndefined()
    })

    it('marks as meaningful when ariaLabel is set', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon, ariaLabel: 'Close dialog' },
      })
      expect(wrapper.attributes('aria-hidden')).toBeUndefined()
      expect(wrapper.attributes('role')).toBe('img')
      expect(wrapper.attributes('aria-label')).toBe('Close dialog')
    })
  })

  describe('class merging', () => {
    it('includes shrink-0 base class', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon },
      })
      expect(wrapper.classes()).toContain('shrink-0')
    })

    it('includes inline-block base class', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon },
      })
      expect(wrapper.classes()).toContain('inline-block')
    })

    it('merges custom classes', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon },
        attrs: { class: 'ml-2' },
      })
      expect(wrapper.classes()).toContain('ml-2')
      expect(wrapper.classes()).toContain('shrink-0')
    })
  })
})
