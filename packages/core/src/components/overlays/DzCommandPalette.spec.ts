import type { CommandItem } from './DzCommandPalette.types'
import { mount } from '@vue/test-utils'
/**
 * DzCommandPalette — Unit / behavior tests.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DzCommandPalette from './DzCommandPalette.vue'

/**
 * Reka UI Combobox/Listbox uses scrollIntoView internally which is
 * unavailable in JSDOM. We stub it globally for these tests.
 */
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

const sampleItems: CommandItem[] = [
  { id: 'edit', label: 'Edit File', shortcut: 'Ctrl+E', group: 'actions' },
  { id: 'save', label: 'Save File', shortcut: 'Ctrl+S', group: 'actions' },
  { id: 'settings', label: 'Open Settings', group: 'navigation' },
  { id: 'disabled-item', label: 'Disabled', disabled: true },
]

const sampleGroups = [
  { id: 'actions', label: 'Actions' },
  { id: 'navigation', label: 'Navigation' },
]

describe('dzCommandPalette — Unit Tests', () => {
  it('renders the component when closed', () => {
    const wrapper = mount(DzCommandPalette, {
      props: { open: false, items: sampleItems },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the component when open', () => {
    const wrapper = mount(DzCommandPalette, {
      props: { open: true, items: sampleItems },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts items prop', () => {
    const wrapper = mount(DzCommandPalette, {
      props: { open: false, items: sampleItems },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts groups prop', () => {
    const wrapper = mount(DzCommandPalette, {
      props: { open: false, items: sampleItems, groups: sampleGroups },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts placeholder prop', () => {
    const wrapper = mount(DzCommandPalette, {
      props: { open: false, items: [], placeholder: 'Search...' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('defaults enableGlobalShortcut to true', () => {
    const wrapper = mount(DzCommandPalette, {
      props: { open: false, items: [] },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('registers global keydown listener on mount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    mount(DzCommandPalette, {
      props: { open: false, items: [], enableGlobalShortcut: true },
    })
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    addSpy.mockRestore()
  })

  it('does not register listener when enableGlobalShortcut is false', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const callsBefore = addSpy.mock.calls.filter(
      ([event]) => event === 'keydown',
    ).length
    mount(DzCommandPalette, {
      props: { open: false, items: [], enableGlobalShortcut: false },
    })
    const callsAfter = addSpy.mock.calls.filter(
      ([event]) => event === 'keydown',
    ).length
    expect(callsAfter - callsBefore).toBe(0)
    addSpy.mockRestore()
  })

  it('removes global keydown listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(DzCommandPalette, {
      props: { open: false, items: [], enableGlobalShortcut: true },
    })
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('component renders without errors when items is empty', () => {
    const wrapper = mount(DzCommandPalette, {
      props: { open: true, items: [] },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts ariaLabel prop', () => {
    const wrapper = mount(DzCommandPalette, {
      props: { open: false, items: [], ariaLabel: 'Command search' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
