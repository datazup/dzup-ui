import { mount } from '@vue/test-utils'
/**
 * DzRangeSlider — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzRangeSlider from './DzRangeSlider.vue'

describe('dzRangeSlider — Unit Tests', () => {
  it('renders the slider root', () => {
    const wrapper = mount(DzRangeSlider)
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })

  it('renders two thumb elements', () => {
    const wrapper = mount(DzRangeSlider)
    const thumbs = wrapper.findAll('[role="slider"]')
    expect(thumbs.length).toBe(2)
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzRangeSlider, {
      props: { size: 'lg' },
    })
    expect(wrapper.html()).toContain('h-2.5')
  })

  it('applies tone variant classes', () => {
    const wrapper = mount(DzRangeSlider, {
      props: { tone: 'success' },
    })
    expect(wrapper.html()).toContain('dz-success')
  })

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzRangeSlider, {
      props: { tone: 'danger' },
    })
    const root = wrapper.find('[data-tone="danger"]')
    expect(root.exists()).toBe(true)
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzRangeSlider, {
      props: { disabled: true },
    })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzRangeSlider, {
      attrs: { class: 'my-range' },
    })
    expect(wrapper.html()).toContain('my-range')
  })

  it('sets aria-label on both thumbs', () => {
    const wrapper = mount(DzRangeSlider, {
      props: { ariaLabel: 'Price' },
    })
    const thumbs = wrapper.findAll('[role="slider"]')
    if (thumbs.length === 2) {
      expect(thumbs[0]!.attributes('aria-label')).toContain('minimum')
      expect(thumbs[1]!.attributes('aria-label')).toContain('maximum')
    }
  })

  it('defaults to horizontal orientation', () => {
    const wrapper = mount(DzRangeSlider)
    expect(wrapper.html()).toContain('w-full')
  })

  it('has contain: layout style on root', () => {
    const wrapper = mount(DzRangeSlider)
    expect(wrapper.find('[style*="contain: layout style"]').exists()).toBe(true)
  })

  it('emits focus event on thumb focus', async () => {
    const wrapper = mount(DzRangeSlider)
    const thumbs = wrapper.findAll('[role="slider"]')
    if (thumbs.length > 0) {
      await thumbs[0]!.trigger('focus')
      expect(wrapper.emitted('focus')).toBeTruthy()
    }
  })

  it('emits blur event on thumb blur', async () => {
    const wrapper = mount(DzRangeSlider)
    const thumbs = wrapper.findAll('[role="slider"]')
    if (thumbs.length > 0) {
      await thumbs[0]!.trigger('blur')
      expect(wrapper.emitted('blur')).toBeTruthy()
    }
  })
})
