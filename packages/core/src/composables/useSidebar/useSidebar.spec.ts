/**
 * useSidebar — Unit tests.
 */
import type { UseSidebarOptions, UseSidebarReturn } from './useSidebar.ts'
import { mount } from '@vue/test-utils'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { useSidebar } from './useSidebar.ts'

/**
 * Helper: mount a test component that calls useSidebar and exposes its return.
 */
function mountSidebar(options: UseSidebarOptions = {}) {
  let sidebarReturn: UseSidebarReturn

  const TestComponent = defineComponent({
    setup() {
      sidebarReturn = useSidebar(options)
      return { sidebar: sidebarReturn }
    },
    render() {
      return h('div', [
        h('button', { class: 'toggle', onClick: () => sidebarReturn.toggle() }, 'Toggle'),
        h('nav', { style: { width: sidebarReturn.sidebarWidth.value } }, 'Sidebar'),
      ])
    },
  })

  const wrapper = mount(TestComponent, { attachTo: document.body })
  return { wrapper, getSidebar: () => wrapper.vm.sidebar as UseSidebarReturn }
}

/**
 * Default matchMedia mock for jsdom (which lacks matchMedia).
 * Tests that need custom matchMedia behavior stub it themselves.
 */
function stubDefaultMatchMedia(): void {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('useSidebar', () => {
  beforeEach(() => {
    localStorage.clear()
    stubDefaultMatchMedia()
  })

  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  // ---- Return shape ----

  it('returns the expected API shape', () => {
    const { wrapper, getSidebar } = mountSidebar()
    const sidebar = getSidebar()

    expect(sidebar.collapsed).toBeDefined()
    expect(sidebar.mobileOpen).toBeDefined()
    expect(sidebar.isMobile).toBeDefined()
    expect(sidebar.sidebarWidth).toBeDefined()
    expect(typeof sidebar.toggle).toBe('function')
    expect(typeof sidebar.expand).toBe('function')
    expect(typeof sidebar.collapse).toBe('function')
    expect(typeof sidebar.toggleMobile).toBe('function')
    expect(typeof sidebar.openMobile).toBe('function')
    expect(typeof sidebar.closeMobile).toBe('function')

    wrapper.unmount()
  })

  // ---- Default values ----

  it('starts expanded by default', () => {
    const { wrapper, getSidebar } = mountSidebar()
    expect(getSidebar().collapsed.value).toBe(false)
    wrapper.unmount()
  })

  it('starts with mobile overlay closed by default', () => {
    const { wrapper, getSidebar } = mountSidebar()
    expect(getSidebar().mobileOpen.value).toBe(false)
    wrapper.unmount()
  })

  it('uses default widths', () => {
    const { wrapper, getSidebar } = mountSidebar()
    const sidebar = getSidebar()

    // Expanded by default → expandedWidth
    expect(sidebar.sidebarWidth.value).toBe('16rem')

    sidebar.collapse()
    expect(sidebar.sidebarWidth.value).toBe('4rem')

    wrapper.unmount()
  })

  it('respects defaultCollapsed option', () => {
    const { wrapper, getSidebar } = mountSidebar({ defaultCollapsed: true })
    expect(getSidebar().collapsed.value).toBe(true)
    wrapper.unmount()
  })

  it('respects defaultMobileOpen option', () => {
    const { wrapper, getSidebar } = mountSidebar({ defaultMobileOpen: true })
    expect(getSidebar().mobileOpen.value).toBe(true)
    wrapper.unmount()
  })

  it('respects custom widths', () => {
    const { wrapper, getSidebar } = mountSidebar({
      collapsedWidth: '3rem',
      expandedWidth: '20rem',
    })
    const sidebar = getSidebar()

    expect(sidebar.sidebarWidth.value).toBe('20rem')

    sidebar.collapse()
    expect(sidebar.sidebarWidth.value).toBe('3rem')

    wrapper.unmount()
  })

  // ---- Toggle / Expand / Collapse ----

  it('toggle() flips collapsed state', () => {
    const { wrapper, getSidebar } = mountSidebar()
    const sidebar = getSidebar()

    expect(sidebar.collapsed.value).toBe(false)
    sidebar.toggle()
    expect(sidebar.collapsed.value).toBe(true)
    sidebar.toggle()
    expect(sidebar.collapsed.value).toBe(false)

    wrapper.unmount()
  })

  it('expand() sets collapsed to false', () => {
    const { wrapper, getSidebar } = mountSidebar({ defaultCollapsed: true })
    const sidebar = getSidebar()

    expect(sidebar.collapsed.value).toBe(true)
    sidebar.expand()
    expect(sidebar.collapsed.value).toBe(false)

    wrapper.unmount()
  })

  it('collapse() sets collapsed to true', () => {
    const { wrapper, getSidebar } = mountSidebar()
    const sidebar = getSidebar()

    expect(sidebar.collapsed.value).toBe(false)
    sidebar.collapse()
    expect(sidebar.collapsed.value).toBe(true)

    wrapper.unmount()
  })

  // ---- Mobile open / close / toggle ----

  it('toggleMobile() flips mobileOpen state', () => {
    const { wrapper, getSidebar } = mountSidebar()
    const sidebar = getSidebar()

    expect(sidebar.mobileOpen.value).toBe(false)
    sidebar.toggleMobile()
    expect(sidebar.mobileOpen.value).toBe(true)
    sidebar.toggleMobile()
    expect(sidebar.mobileOpen.value).toBe(false)

    wrapper.unmount()
  })

  it('openMobile() sets mobileOpen to true', () => {
    const { wrapper, getSidebar } = mountSidebar()
    const sidebar = getSidebar()

    sidebar.openMobile()
    expect(sidebar.mobileOpen.value).toBe(true)

    wrapper.unmount()
  })

  it('closeMobile() sets mobileOpen to false', () => {
    const { wrapper, getSidebar } = mountSidebar({ defaultMobileOpen: true })
    const sidebar = getSidebar()

    sidebar.closeMobile()
    expect(sidebar.mobileOpen.value).toBe(false)

    wrapper.unmount()
  })

  // ---- sidebarWidth computed ----

  it('sidebarWidth reflects collapsed state dynamically', () => {
    const { wrapper, getSidebar } = mountSidebar()
    const sidebar = getSidebar()

    expect(sidebar.sidebarWidth.value).toBe('16rem')
    sidebar.collapse()
    expect(sidebar.sidebarWidth.value).toBe('4rem')
    sidebar.expand()
    expect(sidebar.sidebarWidth.value).toBe('16rem')

    wrapper.unmount()
  })

  // ---- localStorage persistence ----

  it('persists collapsed state to localStorage when storageKey is provided', async () => {
    const { wrapper, getSidebar } = mountSidebar({ storageKey: 'test-sidebar' })
    const sidebar = getSidebar()

    sidebar.collapse()
    await nextTick()
    expect(localStorage.getItem('test-sidebar')).toBe('true')

    sidebar.expand()
    await nextTick()
    expect(localStorage.getItem('test-sidebar')).toBe('false')

    wrapper.unmount()
  })

  it('restores collapsed state from localStorage on mount', () => {
    localStorage.setItem('test-sidebar', 'true')

    const { wrapper, getSidebar } = mountSidebar({ storageKey: 'test-sidebar' })
    expect(getSidebar().collapsed.value).toBe(true)

    wrapper.unmount()
  })

  it('uses defaultCollapsed when localStorage has no value', () => {
    const { wrapper, getSidebar } = mountSidebar({
      storageKey: 'test-sidebar',
      defaultCollapsed: false,
    })
    expect(getSidebar().collapsed.value).toBe(false)

    wrapper.unmount()
  })

  it('does not write to localStorage when storageKey is not provided', async () => {
    const { wrapper, getSidebar } = mountSidebar()
    const sidebar = getSidebar()

    sidebar.collapse()
    await nextTick()
    expect(localStorage.length).toBe(0)

    wrapper.unmount()
  })

  // ---- Keyboard shortcut ----

  it('registers Ctrl+B keyboard shortcut to toggle', async () => {
    const { wrapper, getSidebar } = mountSidebar()
    const sidebar = getSidebar()

    expect(sidebar.collapsed.value).toBe(false)

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }),
    )
    expect(sidebar.collapsed.value).toBe(true)

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }),
    )
    expect(sidebar.collapsed.value).toBe(false)

    wrapper.unmount()
  })

  it('registers Cmd+B keyboard shortcut to toggle', async () => {
    const { wrapper, getSidebar } = mountSidebar()
    const sidebar = getSidebar()

    expect(sidebar.collapsed.value).toBe(false)

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'b', metaKey: true }),
    )
    expect(sidebar.collapsed.value).toBe(true)

    wrapper.unmount()
  })

  it('does not toggle on B key without modifier', () => {
    const { wrapper, getSidebar } = mountSidebar()
    const sidebar = getSidebar()

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'b' }),
    )
    expect(sidebar.collapsed.value).toBe(false)

    wrapper.unmount()
  })

  it('cleans up keyboard listener on unmount', () => {
    const removeListenerSpy = vi.spyOn(document, 'removeEventListener')
    const { wrapper } = mountSidebar()

    wrapper.unmount()

    expect(removeListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeListenerSpy.mockRestore()
  })

  // ---- matchMedia cleanup ----

  it('cleans up matchMedia listener on unmount', () => {
    const removeListenerFn = vi.fn()
    const addListenerFn = vi.fn()
    const mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: addListenerFn,
      removeEventListener: removeListenerFn,
    })
    vi.stubGlobal('matchMedia', mockMatchMedia)

    const { wrapper } = mountSidebar()

    expect(addListenerFn).toHaveBeenCalledWith('change', expect.any(Function))

    wrapper.unmount()

    expect(removeListenerFn).toHaveBeenCalledWith('change', expect.any(Function))

    vi.unstubAllGlobals()
  })

  // ---- isMobile detection ----

  it('isMobile reflects matchMedia state', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | undefined
    const mockMatchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
        changeHandler = handler
      },
      removeEventListener: vi.fn(),
    })
    vi.stubGlobal('matchMedia', mockMatchMedia)

    const { wrapper, getSidebar } = mountSidebar()
    const sidebar = getSidebar()

    expect(sidebar.isMobile.value).toBe(true)

    // Simulate viewport resize above breakpoint
    if (changeHandler) {
      changeHandler({ matches: false } as MediaQueryListEvent)
    }
    expect(sidebar.isMobile.value).toBe(false)

    wrapper.unmount()
    vi.unstubAllGlobals()
  })

  it('uses custom mobileBreakpoint in matchMedia query', () => {
    const mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    vi.stubGlobal('matchMedia', mockMatchMedia)

    const { wrapper } = mountSidebar({ mobileBreakpoint: 1024 })

    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 1024px)')

    wrapper.unmount()
    vi.unstubAllGlobals()
  })
})
