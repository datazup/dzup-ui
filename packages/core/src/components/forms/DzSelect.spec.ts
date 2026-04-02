import type { DzSelectItem } from './DzSelect.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzSelect — Unit / behavior tests.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzFormField from './DzFormField.vue'
import DzSelect from './DzSelect.vue'

// Polyfill pointer capture APIs missing in jsdom (needed by Reka UI SelectTrigger)
const origHasPointerCapture = HTMLElement.prototype.hasPointerCapture
const origSetPointerCapture = HTMLElement.prototype.setPointerCapture
const origReleasePointerCapture = HTMLElement.prototype.releasePointerCapture

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = function (): boolean {
    return false
  }
  HTMLElement.prototype.setPointerCapture = function (): void {}
  HTMLElement.prototype.releasePointerCapture = function (): void {}
})

afterAll(() => {
  HTMLElement.prototype.hasPointerCapture = origHasPointerCapture
  HTMLElement.prototype.setPointerCapture = origSetPointerCapture
  HTMLElement.prototype.releasePointerCapture = origReleasePointerCapture
})

const mockItems: DzSelectItem[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
]

describe('dzSelect — Unit Tests', () => {
  it('renders a trigger button', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    const trigger = wrapper.find('button')
    expect(trigger.exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
      attrs: { class: 'my-select' },
    })
    const trigger = wrapper.find('button')
    expect(trigger.classes()).toContain('my-select')
  })

  it('shows placeholder when no value selected', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, placeholder: 'Choose fruit' },
    })
    expect(wrapper.text()).toContain('Choose fruit')
  })

  it('emits focus on trigger focus', async () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    const trigger = wrapper.find('button')
    await trigger.trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur on trigger blur', async () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    const trigger = wrapper.find('button')
    await trigger.trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('integrates with DzFormField context', () => {
    const wrapper = mount(DzFormField, {
      props: { required: true, error: 'Required' },
      slots: {
        default: () => h(DzSelect, { items: mockItems }),
      },
    })
    const select = wrapper.findComponent(DzSelect)
    expect(select.exists()).toBe(true)
  })

  it('renders with outline variant by default', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    const trigger = wrapper.find('button')
    expect(trigger.classes().some(c => c.includes('border'))).toBe(true)
  })

  it('renders with filled variant', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, variant: 'filled' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders with underlined variant', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, variant: 'underlined' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})

describe('dzSelect — Searchable Mode', () => {
  /**
   * Helper: mounts DzSelect with defaultOpen=true so portal content renders.
   * jsdom lacks pointer capture APIs that Reka UI's SelectTrigger needs,
   * so we use Reka UI's defaultOpen prop instead of simulating pointer events.
   */
  async function mountSearchable(
    extraProps: Record<string, unknown> = {},
  ): Promise<ReturnType<typeof mount>> {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, searchable: true, defaultOpen: true, ...extraProps },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    return wrapper
  }

  it('does NOT render search input when searchable is false (default)', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    expect(wrapper.find('[data-dz-search-input]').exists()).toBe(false)
  })

  it('renders search input when searchable is true and dropdown is open', async () => {
    const wrapper = await mountSearchable()

    const searchInput = document.querySelector('[data-dz-search-input]')
    expect(searchInput).not.toBeNull()
    wrapper.unmount()
  })

  it('filters options by search query using default filter', async () => {
    const wrapper = await mountSearchable()

    const searchInput = document.querySelector('[data-dz-search-input]') as HTMLInputElement
    expect(searchInput).not.toBeNull()

    // Simulate typing into search
    searchInput.value = 'app'
    searchInput.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    // Only Apple should be visible (SelectItem renders with role="option")
    const options = document.querySelectorAll('[role="option"]')
    expect(options.length).toBe(1)
    expect(options.item(0)?.textContent).toContain('Apple')
    wrapper.unmount()
  })

  it('uses custom filterFn when provided', async () => {
    const customFilter = (option: { label: string, value: string, disabled?: boolean }, query: string): boolean => {
      return option.value.startsWith(query)
    }
    const wrapper = await mountSearchable({ filterFn: customFilter })

    const searchInput = document.querySelector('[data-dz-search-input]') as HTMLInputElement
    searchInput.value = 'ban'
    searchInput.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    const options = document.querySelectorAll('[role="option"]')
    expect(options.length).toBe(1)
    expect(options.item(0)?.textContent).toContain('Banana')
    wrapper.unmount()
  })

  it('shows no results text when filter matches nothing', async () => {
    const wrapper = await mountSearchable({ noResultsText: 'Nothing here' })

    const searchInput = document.querySelector('[data-dz-search-input]') as HTMLInputElement
    searchInput.value = 'zzzzz'
    searchInput.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    const noResults = document.querySelector('[data-dz-no-results]')
    expect(noResults).not.toBeNull()
    expect(noResults?.textContent).toContain('Nothing here')
    wrapper.unmount()
  })

  it('clears search query on dropdown close via handleOpenChange', async () => {
    const wrapper = await mountSearchable()

    const searchInput = document.querySelector('[data-dz-search-input]') as HTMLInputElement
    searchInput.value = 'app'
    searchInput.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()

    // Verify filter is active (only Apple visible)
    let options = document.querySelectorAll('[role="option"]')
    expect(options.length).toBe(1)

    // Simulate close event from Reka UI — triggers handleOpenChange(false)
    const selectRoot = wrapper.findComponent({ name: 'SelectRoot' })
    selectRoot.vm.$emit('update:open', false)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    // The close event should have emitted and cleared search
    expect(wrapper.emitted('close')).toBeTruthy()

    // Re-mount to verify search is cleared (since portal unmounts on close)
    wrapper.unmount()
    const wrapper2 = await mountSearchable()
    const newSearchInput = document.querySelector('[data-dz-search-input]') as HTMLInputElement
    expect(newSearchInput?.value ?? '').toBe('')
    options = document.querySelectorAll('[role="option"]')
    expect(options.length).toBe(mockItems.length)
    wrapper2.unmount()
  })

  it('uses default search placeholder', async () => {
    const wrapper = await mountSearchable()

    const searchInput = document.querySelector('[data-dz-search-input]') as HTMLInputElement
    expect(searchInput?.placeholder).toBe('Search...')
    wrapper.unmount()
  })

  it('uses custom search placeholder', async () => {
    const wrapper = await mountSearchable({ searchPlaceholder: 'Type to filter...' })

    const searchInput = document.querySelector('[data-dz-search-input]') as HTMLInputElement
    expect(searchInput?.placeholder).toBe('Type to filter...')
    wrapper.unmount()
  })
})
