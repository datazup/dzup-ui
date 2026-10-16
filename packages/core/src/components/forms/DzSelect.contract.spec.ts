import type { DzSelectItem } from './DzSelect.types.ts'
/**
 * DzSelect — Contract Spec v1 conformance tests.
 *
 * Verifies props, events, slots, data attributes, and ARIA compliance.
 */
import { expectAnatomy } from '@dzup-ui/testing'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { anatomy } from './DzSelect.anatomy.ts'
import DzSelect from './DzSelect.vue'

const mockItems: DzSelectItem[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
]

/**
 * Wait for a condition rather than a fixed sleep (UI-DZUP-UI-TEST-M-03): Reka's
 * content lands a tick or two after mount.
 */
async function settle(assertion: () => void): Promise<void> {
  await vi.waitFor(assertion, { timeout: 5000, interval: 10 })
}

/** Mount an open, searchable select with the panel inline, and wait for its search box. */
async function openSearchable(props: Record<string, unknown> = {}) {
  const wrapper = mount(DzSelect, {
    props: { items: mockItems, searchable: true, defaultOpen: true, portalDisabled: true, ...props },
    attachTo: document.body,
  })
  await settle(() => expect(wrapper.find('[data-dz-search-input]').exists()).toBe(true))
  return wrapper
}

/** Type into the search box the way a template's `@input` sees it, and wait for the list to follow. */
async function typeQuery(wrapper: ReturnType<typeof mount>, query: string, expectOptions: number): Promise<void> {
  const input = wrapper.get<HTMLInputElement>('[data-dz-search-input]').element
  input.value = query
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await settle(() => expect(wrapper.findAll('[role="option"]')).toHaveLength(expectOptions))
}

describe('dzSelect — Contract Spec v1', () => {
  // ── Props ──

  // Each prop test asserts the prop's observable effect, not that the mount
  // survived it (UI-DZUP-UI-TEST-M-09): a mapping change must turn these red.

  it('renders a combobox trigger from the required items prop', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    const trigger = wrapper.get('[data-part="trigger"]')
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('maps every canonical size to its own trigger metrics', () => {
    // Spelled out in full (not templated) so the token-reference gate can check
    // every name, and so a remapped size fails here.
    const expected = {
      xs: ['h-[var(--dz-input-xs-height)]', 'px-[var(--dz-input-xs-padding-x)]', 'text-[length:var(--dz-input-xs-font-size)]'],
      sm: ['h-[var(--dz-input-sm-height)]', 'px-[var(--dz-input-sm-padding-x)]', 'text-[length:var(--dz-input-sm-font-size)]'],
      md: ['h-[var(--dz-input-md-height)]', 'px-[var(--dz-input-md-padding-x)]', 'text-[length:var(--dz-input-md-font-size)]'],
      lg: ['h-[var(--dz-input-lg-height)]', 'px-[var(--dz-input-lg-padding-x)]', 'text-[length:var(--dz-input-lg-font-size)]'],
      xl: ['h-[var(--dz-input-xl-height)]', 'px-[var(--dz-input-xl-padding-x)]', 'text-[length:var(--dz-input-xl-font-size)]'],
    } as const
    const sizes = Object.keys(expected) as (keyof typeof expected)[]
    for (const size of sizes) {
      const wrapper = mount(DzSelect, {
        props: { items: mockItems, size },
      })
      const classes = wrapper.get('[data-part="trigger"]').classes()
      for (const cls of expected[size])
        expect(classes, size).toContain(cls)
      // No other size's metrics leak in.
      for (const other of sizes.filter(s => s !== size))
        expect(classes, `${size} vs ${other}`).not.toContain(expected[other][0])
    }
  })

  it('maps every canonical variant to its own trigger surface', () => {
    const expected = {
      outline: { has: ['border', 'border-[var(--dz-border)]'], lacks: ['bg-[var(--dz-muted)]', 'border-b'] },
      filled: { has: ['bg-[var(--dz-muted)]', 'border-transparent'], lacks: ['border-[var(--dz-border)]', 'border-b'] },
      underlined: { has: ['border-b', 'rounded-none', 'dz-focus-ring-underline'], lacks: ['bg-[var(--dz-muted)]'] },
    } as const
    for (const [variant, { has, lacks }] of Object.entries(expected)) {
      const wrapper = mount(DzSelect, {
        props: { items: mockItems, variant: variant as keyof typeof expected },
      })
      const classes = wrapper.get('[data-part="trigger"]').classes()
      for (const cls of has)
        expect(classes, `${variant} has ${cls}`).toContain(cls)
      for (const cls of lacks)
        expect(classes, `${variant} lacks ${cls}`).not.toContain(cls)
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

  it('renders a search box in the open panel only when searchable', async () => {
    const searchable = await openSearchable()
    expect(searchable.find('[data-dz-search-input]').exists()).toBe(true)
    searchable.unmount()

    const plain = mount(DzSelect, {
      props: { items: mockItems, defaultOpen: true, portalDisabled: true },
      attachTo: document.body,
    })
    await settle(() => expect(plain.findAll('[role="option"]')).toHaveLength(mockItems.length))
    expect(plain.find('[data-dz-search-input]').exists()).toBe(false)
    plain.unmount()
  })

  it('puts searchPlaceholder on the search box', async () => {
    const wrapper = await openSearchable({ searchPlaceholder: 'Find...' })
    expect(wrapper.get('[data-dz-search-input]').attributes('placeholder')).toBe('Find...')
    wrapper.unmount()
  })

  it('renders noResultsText when the query matches nothing', async () => {
    const wrapper = await openSearchable({ noResultsText: 'Nothing' })
    await typeQuery(wrapper, 'zzzzz', 0)
    await settle(() => expect(wrapper.find('[data-dz-no-results]').exists()).toBe(true))
    expect(wrapper.get('[data-dz-no-results]').text()).toContain('Nothing')
    wrapper.unmount()
  })

  it('filters with filterFn instead of the default substring match', async () => {
    const customFilter = (option: { label: string, value: string }, query: string): boolean => {
      return option.value === query
    }
    const wrapper = await openSearchable({ filterFn: customFilter })
    // The default filter would keep Banana for 'ban'; the exact-match filter keeps nothing.
    await typeQuery(wrapper, 'ban', 0)
    await typeQuery(wrapper, 'banana', 1)
    expect(wrapper.get('[role="option"]').text()).toContain('Banana')
    wrapper.unmount()
  })

  // ── CSS containment ──

  it('has contain: layout style on trigger element', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    const trigger = wrapper.find('[class~="[contain:layout_style]"]')
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
    await settle(() => expect(wrapper.find('[data-part="item"]').exists()).toBe(true))

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
    await settle(() => expect(document.body.querySelector('[data-part="content"] [data-part="item"]')).not.toBeNull())

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
    await settle(() => expect(wrapper.find('[data-part="empty"]').exists()).toBe(true))
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
    await settle(() => expect(wrapper.find('[data-dz-search-input]').exists()).toBe(true))

    const search = wrapper.find('[data-dz-search-input]')
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
    await settle(() => expect(wrapper.find('[data-part="item"]').exists()).toBe(true))

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
   * Reka teleports the panel to the body, so each case has to start from a clean
   * document: without a reset the first three assertions read rows left behind by
   * the case before them, which is how a passing suite can be measuring nothing.
   *
   * The reset used to be a `document.body` wipe, on the belief that "an unmounted
   * wrapper does not always take the teleported node with it". Measured
   * (RESIDUAL-18): the cases here never unmounted at all — nothing tracked the
   * wrappers — so the teleported rows survived because the component was still
   * mounted, not because unmounting fails to remove a Teleport's children. It does
   * remove them, and `enableAutoUnmount` is the whole reset.
   */
  enableAutoUnmount(afterEach)

  /**
   * jsdom has no pointer-capture APIs, so Reka's trigger cannot be clicked
   * open. `defaultOpen` is how the rest of this component's suite does it, and
   * the portal's content lands a tick or two after mount, so this waits for it.
   */
  async function open(props: Record<string, unknown>) {
    const wrapper = mount(DzSelect, {
      props: { items: [], ...props, defaultOpen: true },
      attachTo: document.body,
    })
    await settle(() => expect(document.querySelector('[data-part="content"]')).not.toBeNull())
    await flushPromises()
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
