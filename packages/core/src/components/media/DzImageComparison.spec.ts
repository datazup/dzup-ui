import { mount } from '@vue/test-utils'
/**
 * DzImageComparison — Unit / behavior tests.
 */
import { describe, expect, it, vi } from 'vitest'
import DzImageComparison from './DzImageComparison.vue'

/**
 * jsdom reports a zero-sized layout, so pointer-to-position math needs a real
 * rect. Stub the root's getBoundingClientRect with a 200×100 box at the origin.
 */
function stubRect(el: Element, rect: Partial<DOMRect> = {}): void {
  const base = { top: 0, left: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0 }
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    ...base,
    ...rect,
    toJSON: () => ({}),
  } as DOMRect)
}

/**
 * vue-test-utils' `trigger` builds a synthetic Event whose `clientX/Y` are
 * read-only, so we dispatch a real MouseEvent (which carries the coordinates)
 * to exercise the pointer math. `pointerId` is attached afterwards since the
 * MouseEvent constructor ignores it.
 */
function firePointer(
  el: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  coords: { clientX: number, clientY: number },
): void {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...coords })
  Object.defineProperty(event, 'pointerId', { value: 1 })
  el.dispatchEvent(event)
}

describe('dzImageComparison — Unit Tests', () => {
  it('defaults the divider position to 50', () => {
    const wrapper = mount(DzImageComparison)
    expect(wrapper.find('[role="slider"]').attributes('aria-valuenow')).toBe('50')
  })

  it('clips the after layer based on the position (horizontal)', () => {
    const wrapper = mount(DzImageComparison, { props: { position: 30 } })
    const after = wrapper.findAll('div')[1] // before, after, ...
    // after layer is the second child div; assert via its inline clip-path
    const clipped = wrapper.findAll('div').find(d => (d.attributes('style') ?? '').includes('clip-path'))
    expect(clipped?.attributes('style')).toContain('inset(0 70% 0 0)')
    expect(after).toBeTruthy()
  })

  it('clips along the vertical axis when orientation is vertical', () => {
    const wrapper = mount(DzImageComparison, { props: { position: 30, orientation: 'vertical' } })
    const clipped = wrapper.findAll('div').find(d => (d.attributes('style') ?? '').includes('clip-path'))
    expect(clipped?.attributes('style')).toContain('inset(0 0 70% 0)')
  })

  it('positions the divider via inline style', () => {
    const wrapper = mount(DzImageComparison, { props: { position: 25 } })
    const divider = wrapper.findAll('div').find(d => (d.attributes('style') ?? '').includes('left:'))
    expect(divider?.attributes('style')).toContain('left: 25%')
  })

  // ── Keyboard ──────────────────────────────────────────────────────────────

  it('nudges by step on ArrowRight / ArrowUp', async () => {
    const wrapper = mount(DzImageComparison, { props: { position: 50, step: 1 } })
    const slider = wrapper.find('[role="slider"]')
    await slider.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:position')?.at(-1)).toEqual([51])
    await slider.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('update:position')?.at(-1)).toEqual([52])
  })

  it('nudges down on ArrowLeft / ArrowDown', async () => {
    const wrapper = mount(DzImageComparison, { props: { position: 50 } })
    const slider = wrapper.find('[role="slider"]')
    await slider.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:position')?.at(-1)).toEqual([49])
  })

  it('jumps by 10 with Shift+Arrow', async () => {
    const wrapper = mount(DzImageComparison, { props: { position: 50 } })
    const slider = wrapper.find('[role="slider"]')
    await slider.trigger('keydown', { key: 'ArrowRight', shiftKey: true })
    expect(wrapper.emitted('update:position')?.at(-1)).toEqual([60])
  })

  it('goes to extremes with Home / End', async () => {
    const wrapper = mount(DzImageComparison, { props: { position: 50 } })
    const slider = wrapper.find('[role="slider"]')
    await slider.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:position')?.at(-1)).toEqual([0])
    await slider.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:position')?.at(-1)).toEqual([100])
  })

  it('clamps keyboard movement to the 0–100 range', async () => {
    const wrapper = mount(DzImageComparison, { props: { position: 0 } })
    const slider = wrapper.find('[role="slider"]')
    await slider.trigger('keydown', { key: 'ArrowLeft' })
    // already at 0, no change emitted
    expect(wrapper.emitted('update:position')).toBeUndefined()
  })

  // ── Pointer ───────────────────────────────────────────────────────────────

  it('click-to-set moves the divider to the pointer (horizontal)', () => {
    const wrapper = mount(DzImageComparison, { props: { position: 50 } })
    stubRect(wrapper.element)
    // 200px wide box; clientX 150 -> 75%
    firePointer(wrapper.element, 'pointerdown', { clientX: 150, clientY: 10 })
    expect(wrapper.emitted('update:position')?.at(-1)).toEqual([75])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([75])
  })

  it('dragging updates position while a pointer is captured', () => {
    const wrapper = mount(DzImageComparison, { props: { position: 50 } })
    stubRect(wrapper.element)
    firePointer(wrapper.element, 'pointerdown', { clientX: 100, clientY: 10 })
    firePointer(wrapper.element, 'pointermove', { clientX: 50, clientY: 10 })
    expect(wrapper.emitted('update:position')?.at(-1)).toEqual([25])
  })

  it('ignores pointer moves that did not start with a pointerdown', () => {
    const wrapper = mount(DzImageComparison, { props: { position: 50 } })
    stubRect(wrapper.element)
    firePointer(wrapper.element, 'pointermove', { clientX: 10, clientY: 10 })
    expect(wrapper.emitted('update:position')).toBeUndefined()
  })

  it('maps the pointer along the vertical axis when orientation is vertical', () => {
    const wrapper = mount(DzImageComparison, { props: { position: 50, orientation: 'vertical' } })
    stubRect(wrapper.element)
    // 100px tall box; clientY 20 -> 20%
    firePointer(wrapper.element, 'pointerdown', { clientX: 10, clientY: 20 })
    expect(wrapper.emitted('update:position')?.at(-1)).toEqual([20])
  })

  // ── Disabled ──────────────────────────────────────────────────────────────

  it('does not respond to pointer or keyboard when disabled', async () => {
    const wrapper = mount(DzImageComparison, { props: { position: 50, disabled: true } })
    stubRect(wrapper.element)
    firePointer(wrapper.element, 'pointerdown', { clientX: 150, clientY: 10 })
    await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:position')).toBeUndefined()
    expect(wrapper.find('[role="slider"]').attributes('tabindex')).toBe('-1')
  })

  // ── Labels & a11y ────────────────────────────────────────────────────────

  it('renders before/after caption chips when provided', () => {
    const wrapper = mount(DzImageComparison, {
      props: { beforeLabel: 'Before', afterLabel: 'After' },
    })
    expect(wrapper.text()).toContain('Before')
    expect(wrapper.text()).toContain('After')
  })

  it('exposes accessible slider attributes', () => {
    const wrapper = mount(DzImageComparison, { props: { position: 60, orientation: 'vertical' } })
    const slider = wrapper.find('[role="slider"]')
    expect(slider.attributes('aria-orientation')).toBe('vertical')
    expect(slider.attributes('aria-valuenow')).toBe('60')
    expect(slider.attributes('aria-label')).toContain('after image')
    expect(slider.attributes('aria-valuetext')).toContain('60%')
  })

  it('honors a custom aria-label', () => {
    const wrapper = mount(DzImageComparison, { props: { ariaLabel: 'Restoration comparison' } })
    expect(wrapper.find('[role="slider"]').attributes('aria-label')).toBe('Restoration comparison')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzImageComparison, { attrs: { class: 'my-class' } })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('renders a custom handle slot', () => {
    const wrapper = mount(DzImageComparison, {
      slots: { handle: '<span data-testid="grip">::</span>' },
    })
    expect(wrapper.find('[data-testid="grip"]').exists()).toBe(true)
  })
})
