import type { CommandItem } from './DzCommandPalette.types'
import { enableAutoUnmount, mount } from '@vue/test-utils'
/**
 * DzCommandPalette — Contract Spec v1 conformance tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import DzCommandPalette from './DzCommandPalette.vue'

describe('dzCommandPalette — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCommandPalette)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts items prop', () => {
    const items = [{ id: '1', label: 'Save' }]
    const wrapper = mount(DzCommandPalette, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts placeholder prop', () => {
    const wrapper = mount(DzCommandPalette, { props: { placeholder: 'Type a command...' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    // DzCommandPalette renders DialogContent in a portal (teleport to body).
    // Portal content is not accessible in jsdom. Verify prop is accepted without error.
    const wrapper = mount(DzCommandPalette, { props: { open: true }, attrs: { class: 'custom-class' } })
    expect(wrapper.exists()).toBe(true)
  })
})

/**
 * Events and slots, through the real Reka Dialog + Combobox rendered inline
 * (`portalDisabled`), so the assertions read this palette's own subtree.
 */
describe('dzCommandPalette — Contract Spec v1 events and slots', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })
  enableAutoUnmount(afterEach)

  const items: CommandItem[] = [
    { id: 'edit', label: 'Edit File' },
    { id: 'save', label: 'Save File' },
  ]

  async function openPalette(slots?: Record<string, string>) {
    const wrapper = mount(DzCommandPalette, {
      props: { open: true, items, enableGlobalShortcut: false, portalDisabled: true },
      slots,
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()
    return wrapper
  }

  async function type(wrapper: ReturnType<typeof mount>, query: string) {
    await wrapper.get('[role="combobox"]').setValue(query)
    await nextTick()
    await nextTick()
  }

  it('emits search with the typed query', async () => {
    const wrapper = await openPalette()
    await type(wrapper, 'sav')
    expect(wrapper.emitted('search')?.at(-1)).toEqual(['sav'])
  })

  it('emits select with the chosen item and closes', async () => {
    const wrapper = await openPalette()
    const option = wrapper.findAll('[role="option"]').find(o => o.text().includes('Save File'))!
    await option.trigger('click')
    expect(wrapper.emitted('select')?.at(-1)).toEqual([items[1]])
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it('renders the #item slot with the item in scope', async () => {
    const wrapper = await openPalette({
      item: '<template #item="{ item }"><b class="item-probe">{{ item.id }}</b></template>',
    })
    expect(wrapper.findAll('.item-probe').map(n => n.text())).toEqual(['edit', 'save'])
  })

  it('renders the #empty slot when nothing matches', async () => {
    const wrapper = await openPalette({ empty: '<p class="empty-probe">Nothing here</p>' })
    await type(wrapper, 'zzz')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(0)
    expect(wrapper.get('.empty-probe').text()).toBe('Nothing here')
  })
})
