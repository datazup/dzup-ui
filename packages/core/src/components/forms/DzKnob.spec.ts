import { mount } from '@vue/test-utils'
/**
 * DzKnob — Unit / behavior tests.
 */
import { describe, expect, it, vi } from 'vitest'
import DzKnob from './DzKnob.vue'

/** Stub the SVG's geometry so pointer math is deterministic in jsdom. */
function stubSvgRect(wrapper: ReturnType<typeof mount>): void {
  const svg = wrapper.find('svg').element
  svg.getBoundingClientRect = vi.fn(() => ({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })) as unknown as typeof svg.getBoundingClientRect
}

/**
 * Dispatch a pointer event with concrete coordinates. VTU's `trigger` builds a
 * MouseEvent whose `clientX`/`clientY` are read-only getters, so we construct
 * the event directly (the constructor honors the coordinate options).
 */
function dispatchPointer(
  wrapper: ReturnType<typeof mount>,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  init: { clientX: number, clientY: number },
): void {
  const svg = wrapper.find('svg').element
  svg.dispatchEvent(new MouseEvent(type, { bubbles: true, ...init }))
}

describe('dzKnob — Unit Tests', () => {
  it('renders the range and value arcs', () => {
    const wrapper = mount(DzKnob, { props: { value: 50 } })
    expect(wrapper.findAll('path')).toHaveLength(2)
  })

  it('omits the value arc when the value is at the minimum', () => {
    const wrapper = mount(DzKnob, { props: { value: 0, min: 0, max: 100 } })
    // Only the range arc renders when there is nothing to fill.
    expect(wrapper.findAll('path')).toHaveLength(1)
  })

  // -- Value label / template ----------------------------------------------

  it('shows the value label by default', () => {
    const wrapper = mount(DzKnob, { props: { value: 42 } })
    expect(wrapper.text()).toContain('42')
  })

  it('applies the valueTemplate to the label and aria-valuetext', () => {
    const wrapper = mount(DzKnob, { props: { value: 30, valueTemplate: '{value}%' } })
    expect(wrapper.text()).toContain('30%')
    expect(wrapper.find('[role="slider"]').attributes('aria-valuetext')).toBe('30%')
  })

  it('hides the value label when showValue is false', () => {
    const wrapper = mount(DzKnob, { props: { value: 42, showValue: false } })
    expect(wrapper.text()).not.toContain('42')
  })

  // -- Keyboard -------------------------------------------------------------

  it('ArrowRight increases by one step', async () => {
    const wrapper = mount(DzKnob, { props: { value: 50 } })
    await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:value')?.[0]).toEqual([51])
  })

  it('ArrowLeft decreases by one step', async () => {
    const wrapper = mount(DzKnob, { props: { value: 50 } })
    await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:value')?.[0]).toEqual([49])
  })

  it('honors a custom step', async () => {
    const wrapper = mount(DzKnob, { props: { value: 50, step: 5 } })
    await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('update:value')?.[0]).toEqual([55])
  })

  it('PageUp jumps by a tenth of the range', async () => {
    const wrapper = mount(DzKnob, { props: { value: 20, min: 0, max: 100 } })
    await wrapper.find('[role="slider"]').trigger('keydown', { key: 'PageUp' })
    expect(wrapper.emitted('update:value')?.[0]).toEqual([30])
  })

  it('Home jumps to min and End jumps to max', async () => {
    const wrapper = mount(DzKnob, { props: { value: 40, min: 0, max: 100 } })
    const slider = wrapper.find('[role="slider"]')
    await slider.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:value')?.[0]).toEqual([100])
    await slider.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:value')?.[1]).toEqual([0])
  })

  it('clamps keyboard increase at max', async () => {
    const wrapper = mount(DzKnob, { props: { value: 100, min: 0, max: 100 } })
    await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:value')).toBeFalsy()
  })

  it('clamps keyboard decrease at min', async () => {
    const wrapper = mount(DzKnob, { props: { value: 0, min: 0, max: 100 } })
    await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:value')).toBeFalsy()
  })

  // -- Pointer drag ---------------------------------------------------------

  it('commits a value from a pointer at the top of the dial (midpoint)', async () => {
    const wrapper = mount(DzKnob, { props: { value: 0, min: 0, max: 100 } })
    stubSvgRect(wrapper)
    // Top of a 270° gauge (12 o'clock) is the halfway point of the sweep.
    dispatchPointer(wrapper, 'pointerdown', { clientX: 50, clientY: 0 })
    expect(wrapper.emitted('update:value')?.[0]).toEqual([50])
  })

  it('snaps pointer-derived values to the step', async () => {
    const wrapper = mount(DzKnob, { props: { value: 0, min: 0, max: 100, step: 10 } })
    stubSvgRect(wrapper)
    dispatchPointer(wrapper, 'pointerdown', { clientX: 50, clientY: 0 })
    const emitted = wrapper.emitted('update:value')?.[0]?.[0] as number
    expect(emitted % 10).toBe(0)
  })

  it('ignores pointer movement when no drag is in progress', async () => {
    const wrapper = mount(DzKnob, { props: { value: 0 } })
    stubSvgRect(wrapper)
    dispatchPointer(wrapper, 'pointermove', { clientX: 50, clientY: 0 })
    expect(wrapper.emitted('update:value')).toBeFalsy()
  })

  // -- Disabled / readonly --------------------------------------------------

  it('disabled: not focusable and ignores interaction', async () => {
    const wrapper = mount(DzKnob, { props: { value: 50, disabled: true } })
    const slider = wrapper.find('[role="slider"]')
    expect(slider.attributes('tabindex')).toBe('-1')
    expect(slider.attributes('aria-disabled')).toBe('true')
    await slider.trigger('keydown', { key: 'ArrowRight' })
    stubSvgRect(wrapper)
    dispatchPointer(wrapper, 'pointerdown', { clientX: 50, clientY: 0 })
    expect(wrapper.emitted('update:value')).toBeFalsy()
  })

  it('readonly: focusable but ignores interaction', async () => {
    const wrapper = mount(DzKnob, { props: { value: 50, readonly: true } })
    const slider = wrapper.find('[role="slider"]')
    expect(slider.attributes('tabindex')).toBe('0')
    expect(slider.attributes('aria-readonly')).toBe('true')
    await slider.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:value')).toBeFalsy()
  })

  // -- Accessibility --------------------------------------------------------

  it('exposes slider semantics with a default accessible label', () => {
    const wrapper = mount(DzKnob, { props: { value: 25 } })
    const slider = wrapper.find('[role="slider"]')
    expect(slider.attributes('aria-label')).toBe('Knob')
    expect(slider.attributes('aria-valuenow')).toBe('25')
  })

  it('honors a custom aria-label', () => {
    const wrapper = mount(DzKnob, { props: { ariaLabel: 'Volume' } })
    expect(wrapper.find('[role="slider"]').attributes('aria-label')).toBe('Volume')
  })

  it('reflects required via aria-required', () => {
    const wrapper = mount(DzKnob, { props: { required: true } })
    expect(wrapper.find('[role="slider"]').attributes('aria-required')).toBe('true')
  })

  it('reflects invalid via data-invalid + aria-invalid', () => {
    const wrapper = mount(DzKnob, { props: { invalid: true } })
    expect(wrapper.find('[data-invalid]').exists()).toBe(true)
    expect(wrapper.find('[role="slider"]').attributes('aria-invalid')).toBe('true')
  })

  it('renders an inline error message linked via aria-describedby', () => {
    const wrapper = mount(DzKnob, { props: { error: 'Out of range' } })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Out of range')
    const errorId = errorEl.attributes('id')!
    expect(errorId).toBeTruthy()
    expect(wrapper.find(`[aria-describedby~="${errorId}"]`).exists()).toBe(true)
  })

  it('emits focus and blur events', async () => {
    const wrapper = mount(DzKnob)
    const slider = wrapper.find('[role="slider"]')
    await slider.trigger('focus')
    await slider.trigger('blur')
    expect(wrapper.emitted('focus')).toBeTruthy()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('renders a hidden input when name is provided', () => {
    const wrapper = mount(DzKnob, { props: { name: 'level', value: 60 } })
    const input = wrapper.find('input[type="hidden"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('name')).toBe('level')
    expect((input.element as HTMLInputElement).value).toBe('60')
  })

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzKnob, { props: { tone: 'success' } })
    expect(wrapper.find('[data-tone="success"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzKnob, { attrs: { class: 'my-knob' } })
    expect(wrapper.html()).toContain('my-knob')
  })

  it('exposes a focus() method', () => {
    const wrapper = mount(DzKnob, { attachTo: document.body })
    expect(typeof (wrapper.vm as unknown as { focus: () => void }).focus).toBe('function')
    expect(() => (wrapper.vm as unknown as { focus: () => void }).focus()).not.toThrow()
  })
})
