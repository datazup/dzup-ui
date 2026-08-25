import type { DzSelectItem } from './DzSelect.types.ts'
/**
 * DzSelect — Contract Spec v1 conformance tests.
 *
 * Verifies props, events, slots, data attributes, and ARIA compliance.
 */
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { anatomy } from './DzSelect.anatomy.ts'
import DzSelect from './DzSelect.vue'

const mockItems: DzSelectItem[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
]

describe('dzSelect — Contract Spec v1', () => {
  // ── Props ──

  it('renders with required items prop', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzSelect, {
        props: { items: mockItems, size },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical variant values', () => {
    const variants = ['outline', 'filled', 'underlined'] as const
    for (const variant of variants) {
      const wrapper = mount(DzSelect, {
        props: { items: mockItems, variant },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Data attributes ──

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, disabled: true },
    })
    // The trigger element within the component
    const trigger = wrapper.find('[data-disabled]')
    expect(trigger.exists()).toBe(true)
  })

  it('sets data-invalid when invalid', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, invalid: true },
    })
    const trigger = wrapper.find('[data-invalid]')
    expect(trigger.exists()).toBe(true)
  })

  // ── Searchable prop ──

  it('accepts searchable prop', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, searchable: true },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts searchPlaceholder prop', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, searchable: true, searchPlaceholder: 'Find...' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts noResultsText prop', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, searchable: true, noResultsText: 'Nothing' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts filterFn prop', () => {
    const customFilter = (option: { label: string, value: string }, query: string): boolean => {
      return option.value === query
    }
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, searchable: true, filterFn: customFilter },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // ── CSS containment ──

  it('has contain: layout style on trigger element', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    const trigger = wrapper.find('[style*="contain"]')
    expect(trigger.exists()).toBe(true)
  })
  // ── Anatomy (ADR-19) ──

  it('conforms to its declared anatomy while closed', () => {
    const wrapper = mount(DzSelect, { props: { items: mockItems } })

    expect(wrapper.attributes('data-part')).toBe('root')
    expect(wrapper.find('[data-part="trigger"]').exists()).toBe(true)
    expectAnatomy(wrapper, anatomy)
  })

  it('conforms while open, with the listbox rendered inline', async () => {
    // `portalDisabled` keeps the content inside the wrapper so one check covers
    // both halves; the portaled case is the next test.
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, defaultOpen: true, portalDisabled: true, searchable: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    for (const part of ['content', 'viewport', 'input', 'item', 'item-label'])
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)

    expectAnatomy(wrapper, anatomy)
    wrapper.unmount()
  })

  it('emits no undeclared part into the portal either', async () => {
    // The portaled content is outside the wrapper entirely, so nothing else in
    // this file sees it. An undeclared part there would be invisible.
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, defaultOpen: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    const content = document.body.querySelector('[data-part="content"]')
    expect(content).not.toBeNull()
    expectAnatomy(content!, anatomy, {
      // The portal root is the content, so the trigger side is not in this tree.
      absentParts: ['root', 'trigger', 'icon'],
    })
    wrapper.unmount()
  })

  it('names the empty state when there are no options', async () => {
    const wrapper = mount(DzSelect, {
      props: { items: [], defaultOpen: true, portalDisabled: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('[data-part="empty"]').exists()).toBe(true)
    expectAnatomy(wrapper, anatomy)
    wrapper.unmount()
  })

  it('keeps the legacy hooks alongside the new parts (dual-emit)', async () => {
    // `data-dz-search-input` and `data-dz-no-results` predate this contract and
    // stay for one minor series (ADR-19 §6) — removing them is a major.
    const wrapper = mount(DzSelect, {
      props: { items: [], defaultOpen: true, portalDisabled: true, searchable: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    const search = wrapper.find('[data-dz-search-input]')
    expect(search.exists()).toBe(true)
    expect(search.attributes('data-part')).toBe('input')
    wrapper.unmount()
  })

  // ── Per-part overrides (`ui`) ──

  it('reaches the portaled content, which no class could reach', async () => {
    const wrapper = mount(DzSelect, {
      props: {
        items: mockItems,
        defaultOpen: true,
        portalDisabled: true,
        ui: { content: 'max-h-40', item: 'py-3' },
      },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('[data-part="content"]').classes()).toContain('max-h-40')
    expect(wrapper.find('[data-part="item"]').classes()).toContain('py-3')
    wrapper.unmount()
  })

  it('keeps class on the trigger and sends ui.root to the wrapper', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, ui: { root: 'w-64' } },
      attrs: { class: 'shadow-lg' },
    })

    expect(wrapper.find('[data-part="trigger"]').classes()).toContain('shadow-lg')
    expect(wrapper.classes()).toContain('w-64')
    expect(wrapper.classes()).not.toContain('shadow-lg')
  })

  it('changes nothing when no ui is given', () => {
    const withUi = mount(DzSelect, { props: { items: mockItems, ui: {} } })
    const without = mount(DzSelect, { props: { items: mockItems } })

    expect(withUi.find('[data-part="trigger"]').classes())
      .toEqual(without.find('[data-part="trigger"]').classes())
  })
})

describe('dzSelect — renderer contract C9 async options', () => {
  const ITEMS = [{ label: 'Apple', value: 'apple' }]

  /**
   * Reka teleports the panel to the body, and an unmounted wrapper does not
   * always take the teleported node with it — so each case starts from a clean
   * document. Without this the first three assertions read rows left behind by
   * the case before them, which is how a passing suite can be measuring nothing.
   */
  afterEach(() => {
    document.body.innerHTML = ''
  })

  /**
   * jsdom has no pointer-capture APIs, so Reka's trigger cannot be clicked
   * open. `defaultOpen` is how the rest of this component's suite does it, and
   * the portal needs a tick plus a beat before its content is in the document.
   */
  async function open(props: Record<string, unknown>) {
    const wrapper = mount(DzSelect, {
      props: { items: [], ...props, defaultOpen: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    return wrapper
  }

  const stateRow = () => document.querySelector('[data-part="options-state"]')

  it('renders nothing of the seam for a static control', async () => {
    // The additive guarantee: a select with a plain items array is untouched.
    const wrapper = await open({ items: ITEMS })
    expect(document.querySelector('[data-part="options-state"]')).toBeNull()
    wrapper.unmount()
  })

  it('shows a loading row while the host is loading', async () => {
    const wrapper = await open({ optionsState: 'loading' })
    const row = stateRow()
    expect(row?.getAttribute('data-options-state')).toBe('loading')
    expect(row?.textContent).toContain('Loading options')
    wrapper.unmount()
  })

  it('shows an error row with the host’s message and a retry', async () => {
    const wrapper = await open({ optionsState: 'error', optionsError: 'Service is down' })
    const row = stateRow()
    expect(row?.textContent).toContain('Service is down')
    expect(document.querySelector('[data-part="options-retry"]')).not.toBeNull()
    wrapper.unmount()
  })

  it('omits retry when the host says it retries itself', async () => {
    const wrapper = await open({ optionsState: 'error', optionsRetryable: false })
    expect(document.querySelector('[data-part="options-retry"]')).toBeNull()
    wrapper.unmount()
  })

  it('announces the row politely, because it arrives after first paint', async () => {
    const wrapper = await open({ optionsState: 'loading' })
    const row = stateRow()
    expect(row?.getAttribute('role')).toBe('status')
    expect(row?.getAttribute('aria-live')).toBe('polite')
    wrapper.unmount()
  })

  it('emits load-options with an abortable signal when it opens empty', async () => {
    const wrapper = await open({ optionsState: 'idle' })
    const requests = wrapper.emitted('loadOptions')
    expect(requests).toBeTruthy()
    const request = requests![0]![0] as { reason: string, signal: AbortSignal }
    expect(request.reason).toBe('open')
    expect(request.signal.aborted).toBe(false)
    wrapper.unmount()
  })

  it('does not ask on open when the host already supplied options', async () => {
    const wrapper = await open({ optionsState: 'ready', items: ITEMS })
    expect(wrapper.emitted('loadOptions')).toBeUndefined()
    wrapper.unmount()
  })

  it('emits retry-options and a fresh request when retry is pressed', async () => {
    const wrapper = await open({ optionsState: 'error' })
    const before = (wrapper.emitted('loadOptions') ?? []).length
    const retry = document.querySelector('[data-part="options-retry"]') as HTMLButtonElement
    retry.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('retryOptions')).toBeTruthy()
    expect((wrapper.emitted('loadOptions') ?? []).length).toBe(before + 1)
    wrapper.unmount()
  })
})
