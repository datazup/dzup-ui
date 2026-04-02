import { mount } from '@vue/test-utils'
/**
 * DzIcon — Contract conformance tests (Contract Spec v1).
 *
 * Validates that the component's public API shape (props, accessibility)
 * matches the canonical contract.
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

describe('dzIcon — Contract Spec v1', () => {
  describe('props', () => {
    it('renders the provided icon component', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon },
      })
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('applies default size (md)', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon },
      })
      const classes = wrapper.classes()
      expect(classes).toContain('h-5')
      expect(classes).toContain('w-5')
    })

    it('accepts size prop and applies correct dimensions', () => {
      const sizeMap = {
        xs: ['h-3', 'w-3'],
        sm: ['h-4', 'w-4'],
        md: ['h-5', 'w-5'],
        lg: ['h-6', 'w-6'],
        xl: ['h-8', 'w-8'],
      } as const

      for (const [size, expectedClasses] of Object.entries(sizeMap)) {
        const wrapper = mount(DzIcon, {
          props: { icon: StubIcon, size: size as keyof typeof sizeMap },
        })
        for (const cls of expectedClasses) {
          expect(wrapper.classes()).toContain(cls)
        }
      }
    })

    it('accepts strokeWidth prop', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon, strokeWidth: 3 },
      })
      expect(wrapper.attributes('stroke-width')).toBe('3')
    })

    it('accepts id prop', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon, id: 'icon-search' },
      })
      expect(wrapper.attributes('id')).toBe('icon-search')
    })
  })

  describe('accessibility', () => {
    it('is decorative by default (aria-hidden="true", no role)', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon },
      })
      expect(wrapper.attributes('aria-hidden')).toBe('true')
      expect(wrapper.attributes('role')).toBeUndefined()
    })

    it('becomes meaningful when ariaLabel is provided', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon, ariaLabel: 'Search' },
      })
      expect(wrapper.attributes('aria-hidden')).toBeUndefined()
      expect(wrapper.attributes('aria-label')).toBe('Search')
      expect(wrapper.attributes('role')).toBe('img')
    })
  })

  describe('class merging (ADR-10)', () => {
    it('merges consumer class with internal classes via cn()', () => {
      const wrapper = mount(DzIcon, {
        props: { icon: StubIcon },
        attrs: { class: 'text-red-500' },
      })
      expect(wrapper.classes()).toContain('text-red-500')
    })
  })
})
