import type { UseSelectOptions, UseSelectReturn } from './useSelect.ts'
/**
 * useSelect — Unit tests.
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useSelect } from './useSelect.ts'

// ---------------------------------------------------------------------------
// Helper: mount composable inside a component
// ---------------------------------------------------------------------------

function mountUseSelect<T>(
  options: UseSelectOptions<T>,
  onSelect?: (item: T) => void,
) {
  let result: UseSelectReturn<T> | null = null

  const Comp = defineComponent({
    setup() {
      result = useSelect(options, onSelect)
      return () => h('div')
    },
  })

  const wrapper = mount(Comp)
  return { wrapper, result: result! }
}

/** Create a KeyboardEvent for testing */
function keydown(key: string, extras: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, bubbles: true, ...extras })
}

// ---------------------------------------------------------------------------
// Basic state
// ---------------------------------------------------------------------------

describe('useSelect — basic state', () => {
  const items = ['Apple', 'Banana', 'Cherry']

  it('returns all expected properties', () => {
    const { result } = mountUseSelect({ items })
    expect(result.isOpen).toBeDefined()
    expect(result.searchQuery).toBeDefined()
    expect(result.filteredItems).toBeDefined()
    expect(result.highlightedIndex).toBeDefined()
    expect(result.selectedItem).toBeDefined()
    expect(typeof result.open).toBe('function')
    expect(typeof result.close).toBe('function')
    expect(typeof result.select).toBe('function')
    expect(typeof result.highlightNext).toBe('function')
    expect(typeof result.highlightPrev).toBe('function')
    expect(typeof result.highlightFirst).toBe('function')
    expect(typeof result.highlightLast).toBe('function')
    expect(typeof result.onKeydown).toBe('function')
  })

  it('starts closed with no highlight', () => {
    const { result } = mountUseSelect({ items })
    expect(result.isOpen.value).toBe(false)
    expect(result.highlightedIndex.value).toBe(-1)
    expect(result.searchQuery.value).toBe('')
  })

  it('filteredItems returns all items when not searchable', () => {
    const { result } = mountUseSelect({ items })
    expect(result.filteredItems.value).toEqual(items)
  })

  it('selectedItem reflects modelValue', () => {
    const { result } = mountUseSelect({ items, modelValue: 'Banana' })
    expect(result.selectedItem.value).toBe('Banana')
  })

  it('selectedItem is undefined when modelValue not in items', () => {
    const { result } = mountUseSelect({ items, modelValue: 'Mango' })
    expect(result.selectedItem.value).toBeUndefined()
  })

  it('selectedItem is undefined when modelValue is undefined', () => {
    const { result } = mountUseSelect({ items })
    expect(result.selectedItem.value).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Open / Close
// ---------------------------------------------------------------------------

describe('useSelect — open/close', () => {
  const items = ['Apple', 'Banana', 'Cherry']

  it('open() sets isOpen to true', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    expect(result.isOpen.value).toBe(true)
  })

  it('open() highlights first item when nothing selected', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    expect(result.highlightedIndex.value).toBe(0)
  })

  it('open() highlights selected item if present', () => {
    const { result } = mountUseSelect({ items, modelValue: 'Cherry' })
    result.open()
    expect(result.highlightedIndex.value).toBe(2)
  })

  it('open() is idempotent', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.highlightedIndex.value = 2
    result.open() // should not reset
    expect(result.highlightedIndex.value).toBe(2)
  })

  it('close() sets isOpen to false', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.close()
    expect(result.isOpen.value).toBe(false)
  })

  it('close() resets search query and highlight', () => {
    const { result } = mountUseSelect({ items, searchable: true })
    result.open()
    result.searchQuery.value = 'app'
    result.highlightedIndex.value = 1
    result.close()
    expect(result.searchQuery.value).toBe('')
    expect(result.highlightedIndex.value).toBe(-1)
  })

  it('close() is idempotent', () => {
    const { result } = mountUseSelect({ items })
    result.close() // already closed
    expect(result.isOpen.value).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

describe('useSelect — selection', () => {
  const items = ['Apple', 'Banana', 'Cherry']

  it('select() calls onSelect callback', () => {
    const onSelect = vi.fn()
    const { result } = mountUseSelect({ items }, onSelect)
    result.open()
    result.select('Banana')
    expect(onSelect).toHaveBeenCalledWith('Banana')
  })

  it('select() closes the dropdown', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.select('Banana')
    expect(result.isOpen.value).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Highlight navigation
// ---------------------------------------------------------------------------

describe('useSelect — highlight navigation', () => {
  const items = ['Apple', 'Banana', 'Cherry']

  it('highlightNext() moves forward', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    expect(result.highlightedIndex.value).toBe(0)
    result.highlightNext()
    expect(result.highlightedIndex.value).toBe(1)
    result.highlightNext()
    expect(result.highlightedIndex.value).toBe(2)
  })

  it('highlightNext() wraps around to start', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.highlightedIndex.value = 2
    result.highlightNext()
    expect(result.highlightedIndex.value).toBe(0)
  })

  it('highlightPrev() moves backward', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.highlightedIndex.value = 2
    result.highlightPrev()
    expect(result.highlightedIndex.value).toBe(1)
  })

  it('highlightPrev() wraps around to end', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.highlightedIndex.value = 0
    result.highlightPrev()
    expect(result.highlightedIndex.value).toBe(2)
  })

  it('highlightFirst() moves to index 0', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.highlightedIndex.value = 2
    result.highlightFirst()
    expect(result.highlightedIndex.value).toBe(0)
  })

  it('highlightLast() moves to last index', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.highlightLast()
    expect(result.highlightedIndex.value).toBe(2)
  })

  it('highlight methods are safe with empty items', () => {
    const { result } = mountUseSelect({ items: [] })
    result.highlightNext()
    expect(result.highlightedIndex.value).toBe(-1)
    result.highlightPrev()
    expect(result.highlightedIndex.value).toBe(-1)
    result.highlightFirst()
    expect(result.highlightedIndex.value).toBe(-1)
    result.highlightLast()
    expect(result.highlightedIndex.value).toBe(-1)
  })
})

// ---------------------------------------------------------------------------
// Search / filtering
// ---------------------------------------------------------------------------

describe('useSelect — search filtering', () => {
  const items = ['Apple', 'Banana', 'Cherry', 'Apricot']

  it('filters items by search query when searchable', () => {
    const { result } = mountUseSelect({ items, searchable: true })
    result.searchQuery.value = 'ap'
    expect(result.filteredItems.value).toEqual(['Apple', 'Apricot'])
  })

  it('search is case-insensitive', () => {
    const { result } = mountUseSelect({ items, searchable: true })
    result.searchQuery.value = 'AP'
    expect(result.filteredItems.value).toEqual(['Apple', 'Apricot'])
  })

  it('does not filter when searchable is false', () => {
    const { result } = mountUseSelect({ items, searchable: false })
    result.searchQuery.value = 'ap'
    expect(result.filteredItems.value).toEqual(items)
  })

  it('empty search returns all items', () => {
    const { result } = mountUseSelect({ items, searchable: true })
    result.searchQuery.value = ''
    expect(result.filteredItems.value).toEqual(items)
  })

  it('whitespace-only search returns all items', () => {
    const { result } = mountUseSelect({ items, searchable: true })
    result.searchQuery.value = '   '
    expect(result.filteredItems.value).toEqual(items)
  })

  it('resets highlightedIndex when filtered items shrink', async () => {
    const { result } = mountUseSelect({ items, searchable: true })
    result.open()
    result.highlightedIndex.value = 3 // Apricot
    result.searchQuery.value = 'ch' // only Cherry
    await nextTick()
    expect(result.highlightedIndex.value).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Keyboard handler
// ---------------------------------------------------------------------------

describe('useSelect — onKeydown', () => {
  const items = ['Apple', 'Banana', 'Cherry']

  it('arrowDown opens when closed', () => {
    const { result } = mountUseSelect({ items })
    result.onKeydown(keydown('ArrowDown'))
    expect(result.isOpen.value).toBe(true)
  })

  it('arrowDown moves highlight when open', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.onKeydown(keydown('ArrowDown'))
    expect(result.highlightedIndex.value).toBe(1)
  })

  it('arrowUp opens when closed', () => {
    const { result } = mountUseSelect({ items })
    result.onKeydown(keydown('ArrowUp'))
    expect(result.isOpen.value).toBe(true)
  })

  it('arrowUp moves highlight when open', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.highlightedIndex.value = 2
    result.onKeydown(keydown('ArrowUp'))
    expect(result.highlightedIndex.value).toBe(1)
  })

  it('home moves to first item', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.highlightedIndex.value = 2
    result.onKeydown(keydown('Home'))
    expect(result.highlightedIndex.value).toBe(0)
  })

  it('end moves to last item', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.onKeydown(keydown('End'))
    expect(result.highlightedIndex.value).toBe(2)
  })

  it('home does nothing when closed', () => {
    const { result } = mountUseSelect({ items })
    result.onKeydown(keydown('Home'))
    expect(result.isOpen.value).toBe(false)
  })

  it('end does nothing when closed', () => {
    const { result } = mountUseSelect({ items })
    result.onKeydown(keydown('End'))
    expect(result.isOpen.value).toBe(false)
  })

  it('enter selects highlighted item when open', () => {
    const onSelect = vi.fn()
    const { result } = mountUseSelect({ items }, onSelect)
    result.open()
    result.highlightedIndex.value = 1
    result.onKeydown(keydown('Enter'))
    expect(onSelect).toHaveBeenCalledWith('Banana')
    expect(result.isOpen.value).toBe(false)
  })

  it('enter opens when closed', () => {
    const { result } = mountUseSelect({ items })
    result.onKeydown(keydown('Enter'))
    expect(result.isOpen.value).toBe(true)
  })

  it('space selects highlighted item when open', () => {
    const onSelect = vi.fn()
    const { result } = mountUseSelect({ items }, onSelect)
    result.open()
    result.highlightedIndex.value = 0
    result.onKeydown(keydown(' '))
    expect(onSelect).toHaveBeenCalledWith('Apple')
  })

  it('space opens when closed', () => {
    const { result } = mountUseSelect({ items })
    result.onKeydown(keydown(' '))
    expect(result.isOpen.value).toBe(true)
  })

  it('escape closes when open', () => {
    const { result } = mountUseSelect({ items })
    result.open()
    result.onKeydown(keydown('Escape'))
    expect(result.isOpen.value).toBe(false)
  })

  it('escape does nothing when closed', () => {
    const { result } = mountUseSelect({ items })
    result.onKeydown(keydown('Escape'))
    expect(result.isOpen.value).toBe(false)
  })

  it('enter does not select when highlightedIndex is -1', () => {
    const onSelect = vi.fn()
    const { result } = mountUseSelect({ items }, onSelect)
    result.open()
    result.highlightedIndex.value = -1
    result.onKeydown(keydown('Enter'))
    expect(onSelect).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Type-ahead search via keyboard
// ---------------------------------------------------------------------------

describe('useSelect — type-ahead', () => {
  const items = ['Apple', 'Banana', 'Cherry']

  it('single printable characters update searchQuery when searchable', () => {
    const { result } = mountUseSelect({ items, searchable: true })
    result.onKeydown(keydown('b'))
    expect(result.searchQuery.value).toBe('b')
    expect(result.isOpen.value).toBe(true)
  })

  it('accumulates typed characters', () => {
    const { result } = mountUseSelect({ items, searchable: true })
    result.onKeydown(keydown('b'))
    result.onKeydown(keydown('a'))
    expect(result.searchQuery.value).toBe('ba')
  })

  it('does not trigger type-ahead when not searchable', () => {
    const { result } = mountUseSelect({ items, searchable: false })
    result.onKeydown(keydown('b'))
    expect(result.searchQuery.value).toBe('')
  })

  it('ignores ctrl+key combinations', () => {
    const { result } = mountUseSelect({ items, searchable: true })
    result.onKeydown(keydown('a', { ctrlKey: true }))
    expect(result.searchQuery.value).toBe('')
  })

  it('ignores meta+key combinations', () => {
    const { result } = mountUseSelect({ items, searchable: true })
    result.onKeydown(keydown('a', { metaKey: true }))
    expect(result.searchQuery.value).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Object items with custom extractors
// ---------------------------------------------------------------------------

describe('useSelect — object items', () => {
  interface Fruit {
    id: number
    name: string
  }

  const fruits: Fruit[] = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
    { id: 3, name: 'Cherry' },
  ]

  it('uses custom itemLabel for filtering', () => {
    const { result } = mountUseSelect({
      items: fruits,
      itemLabel: f => f.name,
      searchable: true,
    })
    result.searchQuery.value = 'ban'
    expect(result.filteredItems.value).toEqual([{ id: 2, name: 'Banana' }])
  })

  it('uses custom itemValue for selectedItem matching', () => {
    const { result } = mountUseSelect({
      items: fruits,
      modelValue: { id: 2, name: 'Banana' },
      itemValue: f => f.id,
    })
    expect(result.selectedItem.value).toEqual({ id: 2, name: 'Banana' })
  })

  it('select() passes the full item to onSelect', () => {
    const onSelect = vi.fn()
    const { result } = mountUseSelect(
      { items: fruits, itemLabel: f => f.name },
      onSelect,
    )
    result.open()
    result.select(fruits[1]!)
    expect(onSelect).toHaveBeenCalledWith({ id: 2, name: 'Banana' })
  })
})

// ---------------------------------------------------------------------------
// Reactive items (MaybeRef)
// ---------------------------------------------------------------------------

describe('useSelect — reactive items', () => {
  it('responds to changes in reactive items ref', async () => {
    const itemsRef = ref(['Apple', 'Banana'])

    const { result } = mountUseSelect({ items: itemsRef })
    expect(result.filteredItems.value).toEqual(['Apple', 'Banana'])

    itemsRef.value = ['Apple', 'Banana', 'Cherry']
    await nextTick()
    expect(result.filteredItems.value).toEqual(['Apple', 'Banana', 'Cherry'])
  })

  it('responds to changes in reactive modelValue', async () => {
    const items = ['Apple', 'Banana', 'Cherry']
    const modelRef = ref<string | undefined>('Apple')

    const { result } = mountUseSelect({ items, modelValue: modelRef })
    expect(result.selectedItem.value).toBe('Apple')

    modelRef.value = 'Cherry'
    await nextTick()
    expect(result.selectedItem.value).toBe('Cherry')
  })
})
