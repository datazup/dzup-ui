import { flushPromises, mount } from '@vue/test-utils'
/**
 * DzAffix — Behaviour tests.
 *
 * Layout measurement is driven by a mocked `getBoundingClientRect` on the
 * placeholder root and a synchronous `requestAnimationFrame`, so scroll/resize
 * re-measures resolve deterministically.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DzAffix from './DzAffix.vue'

/** Mutable rect returned by the mocked root measurement. */
let rootRect: Partial<DOMRect>

function mountAffix(props: Record<string, unknown> = {}) {
  const wrapper = mount(DzAffix, {
    props,
    slots: { default: '<div data-testid="content">Pinned</div>' },
    attachTo: document.body,
  })
  // Override the root measurement *after* the initial (un-affixed) mount.
  ;(wrapper.element as HTMLElement).getBoundingClientRect = () =>
    rootRect as DOMRect
  return wrapper
}

async function fireScroll(): Promise<void> {
  window.dispatchEvent(new Event('scroll'))
  await flushPromises()
}

describe('dzAffix — behaviour', () => {
  beforeEach(() => {
    // Default rect: fully within view, not past any threshold.
    rootRect = { top: 100, bottom: 150, left: 20, width: 200, height: 50 }
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is not affixed while the content sits below the top threshold', async () => {
    const wrapper = mountAffix({ offsetTop: 0 })
    await fireScroll()
    expect(wrapper.attributes('data-affixed')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('pins to the top once scrolled past offsetTop', async () => {
    const wrapper = mountAffix({ offsetTop: 16 })
    // Scrolled up: the natural top is now above the 16px threshold.
    rootRect = { ...rootRect, top: 4 }
    await fireScroll()

    expect(wrapper.attributes('data-affixed')).toBe('')
    expect(wrapper.emitted('change')).toEqual([[true]])

    const content = wrapper.find('[data-testid="content"]').element.parentElement!
    expect(content.style.position).toBe('fixed')
    expect(content.style.top).toBe('16px')
  })

  it('maintains a placeholder of the original size while affixed (no layout jump)', async () => {
    const wrapper = mountAffix({ offsetTop: 0 })
    rootRect = { ...rootRect, top: -10 }
    await fireScroll()

    expect(wrapper.attributes('data-affixed')).toBe('')
    // The placeholder root holds the captured natural size.
    expect(wrapper.element.style.width).toBe('200px')
    expect(wrapper.element.style.height).toBe('50px')
  })

  it('unpins and clears the placeholder when scrolled back', async () => {
    const wrapper = mountAffix({ offsetTop: 0 })

    rootRect = { ...rootRect, top: -10 }
    await fireScroll()
    expect(wrapper.attributes('data-affixed')).toBe('')

    rootRect = { ...rootRect, top: 100 }
    await fireScroll()
    expect(wrapper.attributes('data-affixed')).toBeUndefined()
    expect(wrapper.element.style.width).toBe('')
    expect(wrapper.emitted('change')).toEqual([[true], [false]])
  })

  it('pins to the bottom when offsetBottom is set', async () => {
    const wrapper = mountAffix({ offsetBottom: 24 })
    // Natural bottom (850) is below the viewport bottom (800) minus offset.
    rootRect = { top: 800, bottom: 850, left: 20, width: 200, height: 50 }
    await fireScroll()

    expect(wrapper.attributes('data-affixed')).toBe('')
    const content = wrapper.find('[data-testid="content"]').element.parentElement!
    expect(content.style.position).toBe('fixed')
    // bottom = innerHeight(800) - containerBottom(800) + offset(24)
    expect(content.style.bottom).toBe('24px')
  })

  it('re-measures on window resize', async () => {
    const wrapper = mountAffix({ offsetTop: 0 })
    rootRect = { ...rootRect, top: -5 }
    window.dispatchEvent(new Event('resize'))
    await flushPromises()
    expect(wrapper.attributes('data-affixed')).toBe('')
  })

  it('removes scroll/resize listeners on unmount', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = mountAffix({ offsetTop: 0 })
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    removeSpy.mockRestore()
  })
})
