/**
 * useTabs — Unit tests.
 */
import { describe, expect, it } from 'vitest'
import { useTabs } from './useTabs.ts'

describe('useTabs', () => {
  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------

  it('returns all expected properties', () => {
    const result = useTabs()

    expect(result.activeTab).toBeDefined()
    expect(result.tabs).toBeDefined()
    expect(typeof result.setTab).toBe('function')
    expect(typeof result.registerTab).toBe('function')
    expect(typeof result.unregisterTab).toBe('function')
    expect(typeof result.onKeydown).toBe('function')
  })

  it('initializes activeTab from modelValue', () => {
    const { activeTab } = useTabs({ modelValue: 'tab-2' })
    expect(activeTab.value).toBe('tab-2')
  })

  it('initializes activeTab as empty string when no modelValue', () => {
    const { activeTab } = useTabs()
    expect(activeTab.value).toBe('')
  })

  // -------------------------------------------------------------------------
  // Tab registration
  // -------------------------------------------------------------------------

  it('registers tabs and exposes them via tabs ref', () => {
    const { tabs, registerTab } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2' })

    expect(tabs.value).toHaveLength(2)
    expect(tabs.value[0]).toBeDefined()
    expect(tabs.value[0]!.id).toBe('tab-1')
    expect(tabs.value[1]).toBeDefined()
    expect(tabs.value[1]!.id).toBe('tab-2')
  })

  it('auto-activates first enabled tab when no activeTab is set', () => {
    const { activeTab, registerTab } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1', disabled: true })
    registerTab({ id: 'tab-2', label: 'Tab 2' })

    expect(activeTab.value).toBe('tab-2')
  })

  it('does not auto-activate if activeTab is already set', () => {
    const { activeTab, registerTab } = useTabs({ modelValue: 'tab-2' })

    registerTab({ id: 'tab-1', label: 'Tab 1' })

    expect(activeTab.value).toBe('tab-2')
  })

  it('updates existing tab on re-registration with same id', () => {
    const { tabs, registerTab } = useTabs()

    registerTab({ id: 'tab-1', label: 'Old Label' })
    registerTab({ id: 'tab-1', label: 'New Label' })

    expect(tabs.value).toHaveLength(1)
    expect(tabs.value[0]?.label).toBe('New Label')
  })

  // -------------------------------------------------------------------------
  // Tab unregistration
  // -------------------------------------------------------------------------

  it('removes a tab by id', () => {
    const { tabs, registerTab, unregisterTab } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2' })
    unregisterTab('tab-1')

    expect(tabs.value).toHaveLength(1)
    expect(tabs.value[0]?.id).toBe('tab-2')
  })

  it('activates next enabled tab when active tab is unregistered', () => {
    const { activeTab, registerTab, unregisterTab } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2' })
    expect(activeTab.value).toBe('tab-1')

    unregisterTab('tab-1')
    expect(activeTab.value).toBe('tab-2')
  })

  it('sets activeTab to empty string when all tabs are removed', () => {
    const { activeTab, registerTab, unregisterTab } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    unregisterTab('tab-1')

    expect(activeTab.value).toBe('')
  })

  // -------------------------------------------------------------------------
  // setTab
  // -------------------------------------------------------------------------

  it('sets active tab by id', () => {
    const { activeTab, registerTab, setTab } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2' })
    setTab('tab-2')

    expect(activeTab.value).toBe('tab-2')
  })

  it('ignores setTab for disabled tabs', () => {
    const { activeTab, registerTab, setTab } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2', disabled: true })
    setTab('tab-2')

    expect(activeTab.value).toBe('tab-1')
  })

  it('ignores setTab for unregistered tab id', () => {
    const { activeTab, registerTab, setTab } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    setTab('nonexistent')

    expect(activeTab.value).toBe('tab-1')
  })

  // -------------------------------------------------------------------------
  // Keyboard navigation — horizontal
  // -------------------------------------------------------------------------

  function createKeyboardEvent(key: string): KeyboardEvent {
    return new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  }

  it('navigates to next tab on ArrowRight (horizontal)', () => {
    const { activeTab, registerTab, onKeydown } = useTabs({ orientation: 'horizontal' })

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2' })
    registerTab({ id: 'tab-3', label: 'Tab 3' })

    expect(activeTab.value).toBe('tab-1')

    onKeydown(createKeyboardEvent('ArrowRight'))
    expect(activeTab.value).toBe('tab-2')

    onKeydown(createKeyboardEvent('ArrowRight'))
    expect(activeTab.value).toBe('tab-3')
  })

  it('navigates to previous tab on ArrowLeft (horizontal)', () => {
    const { activeTab, registerTab, setTab, onKeydown } = useTabs({ orientation: 'horizontal' })

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2' })
    registerTab({ id: 'tab-3', label: 'Tab 3' })
    setTab('tab-3')

    onKeydown(createKeyboardEvent('ArrowLeft'))
    expect(activeTab.value).toBe('tab-2')
  })

  it('wraps around from last to first on ArrowRight', () => {
    const { activeTab, registerTab, setTab, onKeydown } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2' })
    setTab('tab-2')

    onKeydown(createKeyboardEvent('ArrowRight'))
    expect(activeTab.value).toBe('tab-1')
  })

  it('wraps around from first to last on ArrowLeft', () => {
    const { activeTab, registerTab, onKeydown } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2' })

    onKeydown(createKeyboardEvent('ArrowLeft'))
    expect(activeTab.value).toBe('tab-2')
  })

  it('skips disabled tabs during navigation', () => {
    const { activeTab, registerTab, onKeydown } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2', disabled: true })
    registerTab({ id: 'tab-3', label: 'Tab 3' })

    expect(activeTab.value).toBe('tab-1')

    onKeydown(createKeyboardEvent('ArrowRight'))
    expect(activeTab.value).toBe('tab-3')
  })

  it('navigates to first tab on Home', () => {
    const { activeTab, registerTab, setTab, onKeydown } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2' })
    registerTab({ id: 'tab-3', label: 'Tab 3' })
    setTab('tab-3')

    onKeydown(createKeyboardEvent('Home'))
    expect(activeTab.value).toBe('tab-1')
  })

  it('navigates to last tab on End', () => {
    const { activeTab, registerTab, onKeydown } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2' })
    registerTab({ id: 'tab-3', label: 'Tab 3' })

    onKeydown(createKeyboardEvent('End'))
    expect(activeTab.value).toBe('tab-3')
  })

  it('home skips disabled first tab', () => {
    const { activeTab, registerTab, setTab, onKeydown } = useTabs()

    registerTab({ id: 'tab-1', label: 'Tab 1', disabled: true })
    registerTab({ id: 'tab-2', label: 'Tab 2' })
    registerTab({ id: 'tab-3', label: 'Tab 3' })
    setTab('tab-3')

    onKeydown(createKeyboardEvent('Home'))
    expect(activeTab.value).toBe('tab-2')
  })

  // -------------------------------------------------------------------------
  // Keyboard navigation — vertical
  // -------------------------------------------------------------------------

  it('navigates with ArrowDown/ArrowUp in vertical orientation', () => {
    const { activeTab, registerTab, onKeydown } = useTabs({ orientation: 'vertical' })

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2' })
    registerTab({ id: 'tab-3', label: 'Tab 3' })

    expect(activeTab.value).toBe('tab-1')

    onKeydown(createKeyboardEvent('ArrowDown'))
    expect(activeTab.value).toBe('tab-2')

    onKeydown(createKeyboardEvent('ArrowUp'))
    expect(activeTab.value).toBe('tab-1')
  })

  it('ignores ArrowLeft/ArrowRight in vertical orientation', () => {
    const { activeTab, registerTab, onKeydown } = useTabs({ orientation: 'vertical' })

    registerTab({ id: 'tab-1', label: 'Tab 1' })
    registerTab({ id: 'tab-2', label: 'Tab 2' })

    onKeydown(createKeyboardEvent('ArrowRight'))
    expect(activeTab.value).toBe('tab-1')

    onKeydown(createKeyboardEvent('ArrowLeft'))
    expect(activeTab.value).toBe('tab-1')
  })

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  it('handles keyboard navigation with no tabs registered', () => {
    const { activeTab, onKeydown } = useTabs()

    onKeydown(createKeyboardEvent('ArrowRight'))
    expect(activeTab.value).toBe('')
  })

  it('handles keyboard navigation with all tabs disabled', () => {
    const { activeTab, registerTab, onKeydown } = useTabs({ modelValue: 'tab-1' })

    registerTab({ id: 'tab-1', label: 'Tab 1', disabled: true })
    registerTab({ id: 'tab-2', label: 'Tab 2', disabled: true })

    onKeydown(createKeyboardEvent('ArrowRight'))
    expect(activeTab.value).toBe('tab-1')
  })
})
