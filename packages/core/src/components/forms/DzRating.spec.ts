import { mount } from '@vue/test-utils'
/**
 * DzRating — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzRating from './DzRating.vue'

/** Convenience: the per-star item spans (each carries a `title`). */
function stars(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('span[title]')
}

describe('dzRating — Unit Tests', () => {
  it('renders `count` star items (default 5)', () => {
    const wrapper = mount(DzRating)
    expect(stars(wrapper)).toHaveLength(5)
  })

  it('renders a custom count', () => {
    const wrapper = mount(DzRating, { props: { count: 10 } })
    expect(stars(wrapper)).toHaveLength(10)
  })

  // -- Value commit ---------------------------------------------------------

  it('commits the clicked value and emits update:value + change', async () => {
    const wrapper = mount(DzRating, { props: { value: 0 } })
    await stars(wrapper)[2]!.trigger('click')
    expect(wrapper.emitted('update:value')?.[0]).toEqual([3])
    expect(wrapper.emitted('change')?.[0]?.[0]).toBe(3)
  })

  it('fills overlays up to the committed value', () => {
    const wrapper = mount(DzRating, { props: { value: 3 } })
    const overlays = wrapper.findAll('span[title] > span:nth-child(2)')
    expect(overlays[0]!.attributes('style')).toContain('width: 100%')
    expect(overlays[2]!.attributes('style')).toContain('width: 100%')
    expect(overlays[3]!.attributes('style')).toContain('width: 0%')
  })

  it('renders a half-filled overlay for fractional values', () => {
    const wrapper = mount(DzRating, { props: { value: 2.5, allowHalf: true } })
    const overlays = wrapper.findAll('span[title] > span:nth-child(2)')
    expect(overlays[1]!.attributes('style')).toContain('width: 100%')
    expect(overlays[2]!.attributes('style')).toContain('width: 50%')
  })

  // -- allowClear -----------------------------------------------------------

  it('clears to 0 when clicking the currently selected value with allowClear', async () => {
    const wrapper = mount(DzRating, { props: { value: 3, allowClear: true } })
    await stars(wrapper)[2]!.trigger('click')
    expect(wrapper.emitted('update:value')?.[0]).toEqual([0])
  })

  it('does not clear without allowClear', async () => {
    const wrapper = mount(DzRating, { props: { value: 3 } })
    await stars(wrapper)[2]!.trigger('click')
    // Re-selecting the same value is a no-op (no emission).
    expect(wrapper.emitted('update:value')).toBeFalsy()
  })

  // -- Keyboard -------------------------------------------------------------

  it('ArrowRight increases by one step', async () => {
    const wrapper = mount(DzRating, { props: { value: 2 } })
    await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:value')?.[0]).toEqual([3])
  })

  it('ArrowLeft decreases by one step', async () => {
    const wrapper = mount(DzRating, { props: { value: 2 } })
    await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:value')?.[0]).toEqual([1])
  })

  it('ArrowRight advances by 0.5 when allowHalf', async () => {
    const wrapper = mount(DzRating, { props: { value: 2, allowHalf: true } })
    await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:value')?.[0]).toEqual([2.5])
  })

  it('Home jumps to 0 and End jumps to count', async () => {
    const wrapper = mount(DzRating, { props: { value: 3, count: 5 } })
    const slider = wrapper.find('[role="slider"]')
    await slider.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:value')?.[0]).toEqual([5])
    await slider.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:value')?.[1]).toEqual([0])
  })

  it('number keys set the value directly', async () => {
    const wrapper = mount(DzRating, { props: { value: 1 } })
    await wrapper.find('[role="slider"]').trigger('keydown', { key: '4' })
    expect(wrapper.emitted('update:value')?.[0]).toEqual([4])
  })

  it('clamps keyboard increase at count', async () => {
    const wrapper = mount(DzRating, { props: { value: 5, count: 5 } })
    await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:value')).toBeFalsy()
  })

  // -- Disabled / readonly --------------------------------------------------

  it('disabled: not focusable and ignores interaction', async () => {
    const wrapper = mount(DzRating, { props: { value: 2, disabled: true } })
    const slider = wrapper.find('[role="slider"]')
    expect(slider.attributes('tabindex')).toBe('-1')
    expect(slider.attributes('aria-disabled')).toBe('true')
    await stars(wrapper)[3]!.trigger('click')
    await slider.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:value')).toBeFalsy()
  })

  it('readonly: focusable but ignores interaction', async () => {
    const wrapper = mount(DzRating, { props: { value: 2, readonly: true } })
    const slider = wrapper.find('[role="slider"]')
    expect(slider.attributes('tabindex')).toBe('0')
    expect(slider.attributes('aria-readonly')).toBe('true')
    await stars(wrapper)[3]!.trigger('click')
    expect(wrapper.emitted('update:value')).toBeFalsy()
  })

  // -- Accessibility --------------------------------------------------------

  it('exposes slider semantics with a default accessible label', () => {
    const wrapper = mount(DzRating, { props: { value: 2 } })
    const slider = wrapper.find('[role="slider"]')
    expect(slider.attributes('aria-label')).toBe('Rating')
    expect(slider.attributes('aria-valuenow')).toBe('2')
    expect(slider.attributes('aria-valuetext')).toBe('2 of 5')
  })

  it('honors a custom aria-label', () => {
    const wrapper = mount(DzRating, { props: { ariaLabel: 'Product quality' } })
    expect(wrapper.find('[role="slider"]').attributes('aria-label')).toBe('Product quality')
  })

  it('reflects required via aria-required', () => {
    const wrapper = mount(DzRating, { props: { required: true } })
    expect(wrapper.find('[role="slider"]').attributes('aria-required')).toBe('true')
  })

  it('reflects invalid via data-invalid + aria-invalid', () => {
    const wrapper = mount(DzRating, { props: { invalid: true } })
    expect(wrapper.find('[data-invalid]').exists()).toBe(true)
    expect(wrapper.find('[role="slider"]').attributes('aria-invalid')).toBe('true')
  })

  it('renders an inline error message linked via aria-describedby', () => {
    const wrapper = mount(DzRating, { props: { error: 'Please rate this item' } })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Please rate this item')
    const errorId = errorEl.attributes('id')!
    expect(errorId).toBeTruthy()
    expect(wrapper.find(`[aria-describedby~="${errorId}"]`).exists()).toBe(true)
  })

  it('emits focus and blur events', async () => {
    const wrapper = mount(DzRating)
    const slider = wrapper.find('[role="slider"]')
    await slider.trigger('focus')
    await slider.trigger('blur')
    expect(wrapper.emitted('focus')).toBeTruthy()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('renders a hidden input when name is provided', () => {
    const wrapper = mount(DzRating, { props: { name: 'rating', value: 4 } })
    const input = wrapper.find('input[type="hidden"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('name')).toBe('rating')
    expect((input.element as HTMLInputElement).value).toBe('4')
  })

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzRating, { props: { tone: 'danger' } })
    expect(wrapper.find('[data-tone="danger"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzRating, { attrs: { class: 'my-rating' } })
    expect(wrapper.html()).toContain('my-rating')
  })

  it('exposes a focus() method', () => {
    const wrapper = mount(DzRating, { attachTo: document.body })
    expect(typeof (wrapper.vm as unknown as { focus: () => void }).focus).toBe('function')
    expect(() => (wrapper.vm as unknown as { focus: () => void }).focus()).not.toThrow()
  })
})
