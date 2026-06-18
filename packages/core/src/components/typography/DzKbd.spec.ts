import { mount } from '@vue/test-utils'
/**
 * DzKbd — Unit / behavior tests.
 */
import { afterEach, describe, expect, it } from 'vitest'
import DzKbd from './DzKbd.vue'

/** Override the jsdom navigator to simulate a platform; returns a restore fn. */
function mockPlatform(platform: string, userAgent = ''): () => void {
  const origPlatform = Object.getOwnPropertyDescriptor(navigator, 'platform')
  const origUa = Object.getOwnPropertyDescriptor(navigator, 'userAgent')
  Object.defineProperty(navigator, 'platform', { value: platform, configurable: true })
  Object.defineProperty(navigator, 'userAgent', { value: userAgent, configurable: true })
  return () => {
    if (origPlatform)
      Object.defineProperty(navigator, 'platform', origPlatform)
    if (origUa)
      Object.defineProperty(navigator, 'userAgent', origUa)
  }
}

let restore: (() => void) | undefined
afterEach(() => {
  restore?.()
  restore = undefined
})

describe('dzKbd — slot vs keys', () => {
  it('renders a single chip wrapping slot content', () => {
    const wrapper = mount(DzKbd, { slots: { default: 'Esc' } })
    const chips = wrapper.findAll('kbd kbd')
    expect(chips).toHaveLength(1)
    expect(chips[0]!.text()).toBe('Esc')
  })

  it('renders one chip per key from the keys prop', () => {
    const wrapper = mount(DzKbd, { props: { keys: ['a', 'b', 'c'], platformAware: false } })
    expect(wrapper.findAll('kbd kbd')).toHaveLength(3)
  })

  it('keys prop takes precedence over the default slot', () => {
    const wrapper = mount(DzKbd, {
      props: { keys: ['x'], platformAware: false },
      slots: { default: 'IGNORED' },
    })
    expect(wrapper.text()).not.toContain('IGNORED')
    expect(wrapper.text()).toContain('x')
  })
})

describe('dzKbd — platform-aware mapping', () => {
  it('maps mod → ⌘ and uppercases letters on macOS', () => {
    restore = mockPlatform('MacIntel')
    const wrapper = mount(DzKbd, { props: { keys: ['mod', 'k'] } })
    const chips = wrapper.findAll('kbd kbd').map(c => c.text())
    expect(chips).toEqual(['⌘', 'K'])
  })

  it('maps mod → Ctrl on non-mac platforms', () => {
    restore = mockPlatform('Win32')
    const wrapper = mount(DzKbd, { props: { keys: ['mod', 'k'] } })
    const chips = wrapper.findAll('kbd kbd').map(c => c.text())
    expect(chips).toEqual(['Ctrl', 'K'])
  })

  it('maps alt to ⌥ on mac and Alt elsewhere', () => {
    restore = mockPlatform('MacIntel')
    let wrapper = mount(DzKbd, { props: { keys: ['alt'] } })
    expect(wrapper.find('kbd kbd').text()).toBe('⌥')
    restore()
    restore = mockPlatform('Win32')
    wrapper = mount(DzKbd, { props: { keys: ['alt'] } })
    expect(wrapper.find('kbd kbd').text()).toBe('Alt')
  })

  it('detects macOS via userAgent when platform is empty', () => {
    restore = mockPlatform('', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
    const wrapper = mount(DzKbd, { props: { keys: ['mod'] } })
    expect(wrapper.find('kbd kbd').text()).toBe('⌘')
  })

  it('does not map synthetic keys when platformAware is false', () => {
    restore = mockPlatform('MacIntel')
    const wrapper = mount(DzKbd, { props: { keys: ['mod', 'k'], platformAware: false } })
    const chips = wrapper.findAll('kbd kbd').map(c => c.text())
    expect(chips).toEqual(['mod', 'k'])
  })
})

describe('dzKbd — accessibility', () => {
  it('spells out the combo in words via aria-label on macOS', () => {
    restore = mockPlatform('MacIntel')
    const wrapper = mount(DzKbd, { props: { keys: ['mod', 'k'] } })
    expect(wrapper.attributes('aria-label')).toBe('Command K')
  })

  it('spells out the combo in words via aria-label on Windows', () => {
    restore = mockPlatform('Win32')
    const wrapper = mount(DzKbd, { props: { keys: ['mod', 'shift', 'p'] } })
    expect(wrapper.attributes('aria-label')).toBe('Control Shift P')
  })

  it('hides individual chips from assistive tech in keys mode', () => {
    const wrapper = mount(DzKbd, { props: { keys: ['ctrl', 'a'], platformAware: false } })
    for (const chip of wrapper.findAll('kbd kbd'))
      expect(chip.attributes('aria-hidden')).toBe('true')
  })

  it('does not set aria-label in slot mode', () => {
    const wrapper = mount(DzKbd, { slots: { default: 'Esc' } })
    expect(wrapper.attributes('aria-label')).toBeUndefined()
  })
})

describe('dzKbd — separators & sizing', () => {
  it('renders a separator between chips by default', () => {
    const wrapper = mount(DzKbd, { props: { keys: ['ctrl', 'a'], platformAware: false } })
    expect(wrapper.text().replace(/\s+/g, '')).toBe('ctrl+a')
  })

  it('omits separators when separator is empty', () => {
    const wrapper = mount(DzKbd, {
      props: { keys: ['ctrl', 'a'], platformAware: false, separator: '' },
    })
    expect(wrapper.text().replace(/\s+/g, '')).toBe('ctrla')
  })

  it('reflects size via the data-size attribute', () => {
    const wrapper = mount(DzKbd, { props: { size: 'lg' }, slots: { default: 'K' } })
    expect(wrapper.attributes('data-size')).toBe('lg')
  })

  it('defaults to md size', () => {
    const wrapper = mount(DzKbd, { slots: { default: 'K' } })
    expect(wrapper.attributes('data-size')).toBe('md')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzKbd, { attrs: { class: 'my-class' }, slots: { default: 'K' } })
    expect(wrapper.classes()).toContain('my-class')
  })
})
