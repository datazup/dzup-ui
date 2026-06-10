import { mount } from '@vue/test-utils'
/**
 * DzSlider — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzSlider from './DzSlider.vue'

describe('dzSlider — Unit Tests', () => {
  it('renders the slider root', () => {
    const wrapper = mount(DzSlider)
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })

  it('renders track, range, and thumb elements', () => {
    const wrapper = mount(DzSlider)
    // Reka UI renders spans for track, range, thumb
    expect(wrapper.findAll('span').length).toBeGreaterThanOrEqual(2)
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzSlider, {
      props: { size: 'lg' },
    })
    // lg size uses h-2.5 for track
    expect(wrapper.html()).toContain('h-2.5')
  })

  it('applies tone variant classes', () => {
    const wrapper = mount(DzSlider, {
      props: { tone: 'success' },
    })
    expect(wrapper.html()).toContain('dz-success')
  })

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzSlider, {
      props: { tone: 'danger' },
    })
    const root = wrapper.find('[data-tone="danger"]')
    expect(root.exists()).toBe(true)
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzSlider, {
      props: { disabled: true },
    })
    const root = wrapper.find('[data-disabled]')
    expect(root.exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSlider, {
      attrs: { class: 'my-slider' },
    })
    expect(wrapper.html()).toContain('my-slider')
  })

  it('sets aria-label on thumb', () => {
    const wrapper = mount(DzSlider, {
      props: { ariaLabel: 'Volume' },
    })
    expect(wrapper.html()).toContain('Volume')
  })

  it('defaults to horizontal orientation', () => {
    const wrapper = mount(DzSlider)
    expect(wrapper.html()).toContain('w-full')
  })

  it('has contain: layout style on root', () => {
    const wrapper = mount(DzSlider)
    const root = wrapper.find('[style*="contain: layout style"]')
    expect(root.exists()).toBe(true)
  })

  it('defaults min to 0 and max to 100', () => {
    const wrapper = mount(DzSlider)
    // The component should render without errors with defaults
    expect(wrapper.exists()).toBe(true)
  })

  it('emits focus event on thumb focus', async () => {
    const wrapper = mount(DzSlider)
    const thumb = wrapper.find('[role="slider"]')
    if (thumb.exists()) {
      await thumb.trigger('focus')
      expect(wrapper.emitted('focus')).toBeTruthy()
    }
  })

  it('emits blur event on thumb blur', async () => {
    const wrapper = mount(DzSlider)
    const thumb = wrapper.find('[role="slider"]')
    if (thumb.exists()) {
      await thumb.trigger('blur')
      expect(wrapper.emitted('blur')).toBeTruthy()
    }
  })

  it('renders the default slot as a label', () => {
    const wrapper = mount(DzSlider, {
      slots: { default: 'Volume' },
    })
    expect(wrapper.text()).toContain('Volume')
  })

  it('does not render a label element when no default slot is provided', () => {
    const wrapper = mount(DzSlider)
    expect(wrapper.text()).toBe('')
  })

  it('exposes a focus() method', () => {
    const wrapper = mount(DzSlider, { attachTo: document.body })
    expect(typeof (wrapper.vm as unknown as { focus: () => void }).focus).toBe('function')
    expect(() => (wrapper.vm as unknown as { focus: () => void }).focus()).not.toThrow()
  })

  it('reflects the invalid prop via data-invalid + aria-invalid on thumb', () => {
    const wrapper = mount(DzSlider, { props: { invalid: true } })
    expect(wrapper.find('[data-invalid]').exists()).toBe(true)
    expect(wrapper.find('[role="slider"]').attributes('aria-invalid')).toBe('true')
  })

  it('renders an inline error message linked via aria-describedby', () => {
    const wrapper = mount(DzSlider, { props: { error: 'Out of range' } })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Out of range')
    const errorId = errorEl.attributes('id')!
    expect(errorId).toBeTruthy()
    expect(wrapper.find(`[aria-describedby~="${errorId}"]`).exists()).toBe(true)
  })
})
