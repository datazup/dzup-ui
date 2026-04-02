import { mount } from '@vue/test-utils'
/**
 * DzCard — Contract Spec v1 conformance tests.
 *
 * Validates that the component's public API (props, events, slots, data attributes)
 * matches the canonical contract defined in the component specification.
 */
import { describe, expect, it } from 'vitest'
import DzCard from './DzCard.vue'
import DzCardBody from './DzCardBody.vue'
import DzCardFooter from './DzCardFooter.vue'
import DzCardHeader from './DzCardHeader.vue'

describe('dzCard contract', () => {
  describe('props', () => {
    it('renders with default variant "elevated"', () => {
      const wrapper = mount(DzCard)
      expect(wrapper.attributes('data-variant')).toBe('elevated')
    })

    it('accepts variant prop with all canonical values', () => {
      const variants = ['elevated', 'outlined', 'flat'] as const
      for (const variant of variants) {
        const wrapper = mount(DzCard, { props: { variant } })
        expect(wrapper.attributes('data-variant')).toBe(variant)
      }
    })

    it('accepts padding prop with all canonical values', () => {
      const paddings = ['none', 'sm', 'md', 'lg'] as const
      for (const padding of paddings) {
        const wrapper = mount(DzCard, { props: { padding } })
        expect(wrapper.exists()).toBe(true)
      }
    })

    it('accepts hoverable prop', () => {
      const wrapper = mount(DzCard, { props: { hoverable: true } })
      expect(wrapper.classes().join(' ')).toContain('cursor-pointer')
    })

    it('accepts clickable prop', () => {
      const wrapper = mount(DzCard, { props: { clickable: true } })
      expect(wrapper.classes().join(' ')).toContain('cursor-pointer')
    })
  })

  describe('events', () => {
    it('emits click when clickable card is clicked', async () => {
      const wrapper = mount(DzCard, { props: { clickable: true } })
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('does not emit click when non-clickable card is clicked', async () => {
      const wrapper = mount(DzCard)
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeUndefined()
    })
  })

  describe('slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(DzCard, {
        slots: { default: 'Card content' },
      })
      expect(wrapper.text()).toContain('Card content')
    })

    it('renders header slot', () => {
      const wrapper = mount(DzCard, {
        slots: { header: 'Header text' },
      })
      expect(wrapper.text()).toContain('Header text')
    })

    it('renders footer slot', () => {
      const wrapper = mount(DzCard, {
        slots: { footer: 'Footer text' },
      })
      expect(wrapper.text()).toContain('Footer text')
    })

    it('renders actions slot', () => {
      const wrapper = mount(DzCard, {
        slots: { actions: 'Action buttons' },
      })
      expect(wrapper.text()).toContain('Action buttons')
    })

    it('renders media slot', () => {
      const wrapper = mount(DzCard, {
        slots: { media: '<img src="test.jpg" alt="test" />' },
      })
      expect(wrapper.find('img').exists()).toBe(true)
    })
  })

  describe('data attributes', () => {
    it('sets data-state to "static" by default', () => {
      const wrapper = mount(DzCard)
      expect(wrapper.attributes('data-state')).toBe('static')
    })

    it('sets data-state to "interactive" when clickable', () => {
      const wrapper = mount(DzCard, { props: { clickable: true } })
      expect(wrapper.attributes('data-state')).toBe('interactive')
    })

    it('sets data-variant reflecting current variant', () => {
      const wrapper = mount(DzCard, { props: { variant: 'outlined' } })
      expect(wrapper.attributes('data-variant')).toBe('outlined')
    })
  })

  describe('accessibility', () => {
    it('has no role by default', () => {
      const wrapper = mount(DzCard)
      expect(wrapper.attributes('role')).toBeUndefined()
    })

    it('has role="button" when clickable', () => {
      const wrapper = mount(DzCard, { props: { clickable: true } })
      expect(wrapper.attributes('role')).toBe('button')
    })

    it('has tabindex="0" when clickable', () => {
      const wrapper = mount(DzCard, { props: { clickable: true } })
      expect(wrapper.attributes('tabindex')).toBe('0')
    })

    it('does not have tabindex when not clickable', () => {
      const wrapper = mount(DzCard)
      expect(wrapper.attributes('tabindex')).toBeUndefined()
    })
  })
})

describe('dzCardHeader contract', () => {
  it('renders default slot', () => {
    const wrapper = mount(DzCardHeader, {
      slots: { default: 'Header content' },
    })
    expect(wrapper.text()).toContain('Header content')
  })

  it('renders actions slot', () => {
    const wrapper = mount(DzCardHeader, {
      slots: { actions: 'Header actions' },
    })
    expect(wrapper.text()).toContain('Header actions')
  })
})

describe('dzCardBody contract', () => {
  it('renders default slot', () => {
    const wrapper = mount(DzCardBody, {
      slots: { default: 'Body content' },
    })
    expect(wrapper.text()).toContain('Body content')
  })
})

describe('dzCardFooter contract', () => {
  it('renders default slot', () => {
    const wrapper = mount(DzCardFooter, {
      slots: { default: 'Footer content' },
    })
    expect(wrapper.text()).toContain('Footer content')
  })
})
