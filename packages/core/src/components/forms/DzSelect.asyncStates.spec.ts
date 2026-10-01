/**
 * The six async-options states, measured on a real control (TASK-S3-O2).
 *
 * The runnable half of `packages/core/stories/forms/AsyncOptionsStates.stories.ts`.
 * That page is where a reader *sees* the six states; this file is where they are
 * measured. The two are not interchangeable: a story's `play()` only runs under
 * the browser lane, and a state a story claims to cover without exercising is
 * worse evidence than none.
 *
 * Nothing here is new behaviour. The seam is `useAsyncOptions` (renderer contract
 * C9, TASK-FORM-OSS-03) and the row is `DzOptionsState`; both shipped before this
 * task. `useAsyncOptions.spec.ts` already covers the composable in isolation and
 * `DzSelect.contract.spec.ts` covers three of the states through the control.
 * What had **no** coverage anywhere, at any level, was the control-level
 * behaviour of the three states a schema-driven form actually fails on:
 *
 *   - an **empty result**, including the inference that `ready` with nothing to
 *     show is the same state as `empty` (the composable's own rule, never
 *     asserted through a control);
 *   - a **dependent option set clearing** when its parent changes — the host puts
 *     the state back to `loading` with an empty collection and the control must
 *     drop the stale list rather than keep rendering it;
 *   - a **superseded request's answer being discarded** — nothing anywhere had
 *     ever put two of a *control's* requests in flight, so the `AbortSignal`
 *     fence was unit-tested on the composable and undemonstrated on a control.
 *
 * `DzSelect` is the subject because it is the only control that requests on
 * `open`, on `search` **and** on retry, so it is the only one that can create two
 * requests in flight without the test reaching inside it.
 */

import type { LoadOptionsRequest } from '@dzup-ui/contracts'
import type { DzSelectItem } from './DzSelect.types.ts'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import DzSelect from './DzSelect.vue'

const PEOPLE: DzSelectItem[] = [
  { label: 'Ada Lovelace', value: 'ada' },
  { label: 'Alan Turing', value: 'alan' },
]

/**
 * Mount an open select, driven by a host.
 *
 * `defaultOpen` so the panel and its portalled content exist without a pointer
 * interaction, `attachTo` so the portal has a document to render into, and the
 * settle delay the contract spec uses for the same reason — Reka's portal content
 * appears a tick or two after mount.
 */
async function openDriven(props: Record<string, unknown> = {}) {
  const wrapper = mount(DzSelect, {
    props: { items: [], optionsState: 'idle', ...props, defaultOpen: true },
    attachTo: document.body,
  })
  await wrapper.vm.$nextTick()
  await new Promise(resolve => setTimeout(resolve, 100))
  return wrapper
}

/** The one row the control shows instead of its list. */
function row(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-part="options-state"]')
}

/** What the row's polite live region currently says. */
function announcement(): string {
  return row()?.querySelector('[data-part="options-message"]')?.textContent?.trim() ?? ''
}

function requestsOf(wrapper: ReturnType<typeof mount>): LoadOptionsRequest[] {
  return (wrapper.emitted('loadOptions') ?? []).map(args => (args as [LoadOptionsRequest])[0])
}

/** Type into the portalled search box the way a template's `@input` sees it. */
async function search(wrapper: ReturnType<typeof mount>, query: string): Promise<void> {
  const input = document.querySelector<HTMLInputElement>('[data-dz-search-input]')
  expect(input, 'searchable select renders a search box').not.toBeNull()
  input!.value = query
  input!.dispatchEvent(new Event('input', { bubbles: true }))
  await wrapper.vm.$nextTick()
}

/**
 * Teardown through Vue, not through the DOM (RESIDUAL-18). The listbox portals to
 * `document.body` and every assertion here queries the document, so a `document.body`
 * wipe looked like the reset; it left each select mounted with its async loader
 * in flight. Unmounting cancels the subscription and removes the portalled list.
 */
enableAutoUnmount(afterEach)

// ---------------------------------------------------------------------------
// State 1 — loading
// ---------------------------------------------------------------------------

describe('state 1 — loading', () => {
  it('renders the loading row instead of the list, and announces it', async () => {
    const wrapper = await openDriven({ optionsState: 'loading' })
    expect(row()).not.toBeNull()
    expect(row()!.getAttribute('data-options-state')).toBe('loading')
    expect(announcement()).toBe('Loading options')
    // Instead of, not above: the two must never both be on screen.
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(0)
    wrapper.unmount()
  })

  it('asks the host with a live signal it can fence on', async () => {
    const wrapper = await openDriven()
    const requests = requestsOf(wrapper)
    expect(requests.length).toBeGreaterThan(0)
    expect(requests[0]!.reason).toBe('open')
    expect(requests[0]!.signal.aborted).toBe(false)
    wrapper.unmount()
  })
})

// ---------------------------------------------------------------------------
// State 2 — empty result
// ---------------------------------------------------------------------------

describe('state 2 — empty result', () => {
  it('renders the empty row with its own message, not a blank panel', async () => {
    const wrapper = await openDriven({ optionsState: 'empty' })
    expect(row()!.getAttribute('data-options-state')).toBe('empty')
    expect(announcement()).toBe('No options found')
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(0)
    wrapper.unmount()
  })

  /**
   * The inference, asserted through a control for the first time. A host that
   * says `ready` with nothing to show means the same thing as one that says
   * `empty`, and a control that rendered a blank panel for the first and a
   * message for the second would be two controls.
   *
   * **FINDING `D-S3O2-5`, recorded rather than fixed.** The row renders and says
   * the right thing, but `data-options-state` publishes the **raw** state
   * (`'ready'`), not the row the control is actually showing (`'empty'`) —
   * `DzOptionsState` is passed `useAsyncOptions().state`, while the decision to
   * render at all comes from `.row`. So a consumer styling
   * `[data-options-state="empty"]` gets nothing in exactly the case the seam
   * infers. Pinned here as it behaves, with the contradiction visible, because
   * changing a published `data-*` value on seven controls is not an additive
   * change and is an owner decision (see `TASK-S3-O2-decisions.md`).
   */
  it('treats a `ready` state with an empty collection as empty — but publishes `ready`', async () => {
    const wrapper = await openDriven({ optionsState: 'ready', items: [] })
    expect(row(), 'the empty row renders').not.toBeNull()
    expect(announcement()).toBe('No options found')
    // The contradiction, pinned so it cannot change silently either way.
    expect(row()!.getAttribute('data-options-state')).toBe('ready')
    wrapper.unmount()
  })

  it('replaces the empty row with the list once the host has something', async () => {
    const wrapper = await openDriven({ optionsState: 'empty' })
    expect(row()).not.toBeNull()
    await wrapper.setProps({ optionsState: 'ready', items: PEOPLE })
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(row()).toBeNull()
    wrapper.unmount()
  })
})

// ---------------------------------------------------------------------------
// State 3 — error with retry
// ---------------------------------------------------------------------------

describe('state 3 — error with retry', () => {
  it('prefers the host\'s message over the generic one', async () => {
    const wrapper = await openDriven({ optionsState: 'error', optionsError: 'The directory did not answer' })
    expect(row()!.getAttribute('data-options-state')).toBe('error')
    expect(announcement()).toBe('The directory did not answer')
    wrapper.unmount()
  })

  it('falls back to the catalog message when the host names no reason', async () => {
    const wrapper = await openDriven({ optionsState: 'error' })
    expect(announcement()).toBe('Could not load options')
    wrapper.unmount()
  })

  it('emits BOTH retry-options and a fresh load-options, so a host listening to either reloads', async () => {
    const wrapper = await openDriven({ optionsState: 'error' })
    const before = requestsOf(wrapper).length
    const retry = row()!.querySelector<HTMLButtonElement>('[data-part="options-retry"]')
    expect(retry).not.toBeNull()
    expect(retry!.textContent?.trim()).toBe('Try again')
    retry!.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('retryOptions')).toBeTruthy()
    expect(requestsOf(wrapper).length).toBe(before + 1)
    wrapper.unmount()
  })

  it('offers no retry when the host says it retries itself', async () => {
    const wrapper = await openDriven({ optionsState: 'error', optionsRetryable: false })
    expect(row()!.querySelector('[data-part="options-retry"]')).toBeNull()
    wrapper.unmount()
  })
})

// ---------------------------------------------------------------------------
// State 4 — dependency-change clearing
// ---------------------------------------------------------------------------

describe('state 4 — a dependent option set clearing when its parent changes', () => {
  /**
   * The cascading load, from the control's side. The host owns the decision — a
   * control does not know which other field it depends on — so what is asserted
   * here is that the control honours the host's clearing instead of keeping a
   * stale list on screen.
   */
  it('drops the stale list and shows the loading row again', async () => {
    const wrapper = await openDriven({ optionsState: 'ready', items: PEOPLE })
    expect(row()).toBeNull()
    expect(document.body.textContent).toContain('Ada Lovelace')

    // The host's half of a cascading load: empty the collection and go back to
    // loading, because the parent field changed.
    await wrapper.setProps({ optionsState: 'loading', items: [] })
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(row()!.getAttribute('data-options-state')).toBe('loading')
    expect(announcement()).toBe('Loading options')
    // Gone from the DOM, not merely unselected — a stale option a user can still
    // click is the defect this asserts against.
    expect(document.body.textContent).not.toContain('Ada Lovelace')
    wrapper.unmount()
  })

  it('renders the new option set and nothing of the old one', async () => {
    const wrapper = await openDriven({ optionsState: 'ready', items: PEOPLE })
    await wrapper.setProps({ optionsState: 'loading', items: [] })
    await new Promise(resolve => setTimeout(resolve, 50))
    await wrapper.setProps({ optionsState: 'ready', items: [{ label: 'Grace Hopper', value: 'grace' }] })
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(row()).toBeNull()
    expect(document.body.textContent).toContain('Grace Hopper')
    expect(document.body.textContent).not.toContain('Ada Lovelace')
    wrapper.unmount()
  })

  /**
   * A host that clears the collection but forgets the state gets the same row,
   * because `ready`-with-nothing is `empty`. Asserted so the cascading case
   * cannot silently render a blank panel when a host is sloppy — this is the
   * sloppy-host path, and it is the one a real cascading form takes most often.
   *
   * Second instance of finding `D-S3O2-5`: the message is right, the published
   * `data-options-state` is the raw `ready`.
   */
  it('shows the empty row rather than a blank panel when a host clears without resetting the state', async () => {
    const wrapper = await openDriven({ optionsState: 'ready', items: PEOPLE })
    await wrapper.setProps({ items: [] })
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(row(), 'the empty row renders').not.toBeNull()
    expect(announcement()).toBe('No options found')
    expect(document.body.textContent).not.toContain('Ada Lovelace')
    expect(row()!.getAttribute('data-options-state')).toBe('ready')
    wrapper.unmount()
  })
})

// ---------------------------------------------------------------------------
// State 5 — stale-response discard
// ---------------------------------------------------------------------------

describe('state 5 — a superseded request\'s answer is discarded', () => {
  /**
   * The failure this prevents is the one every remote-search field has shipped at
   * least once: the answer to "a" arrives after the answer to "ab" and the user
   * sees results for a query they have already finished typing.
   *
   * The invariant is asserted, not a request count: *every request but the newest
   * is aborted*. A count would bind this to how many times `DzSelect` happens to
   * ask and would go red on any change to that, while saying nothing about the
   * fence.
   */
  it('aborts every request but the newest, and gives each its own signal', async () => {
    const wrapper = await openDriven({ searchable: true })
    await search(wrapper, 'a')
    await search(wrapper, 'ab')

    const requests = requestsOf(wrapper)
    expect(requests.length).toBeGreaterThanOrEqual(3)
    const aborted = requests.filter(r => r.signal.aborted)
    expect(aborted).toHaveLength(requests.length - 1)
    expect(requests.at(-1)!.signal.aborted).toBe(false)
    // Distinct signals, so a host cannot conflate two requests.
    expect(new Set(requests.map(r => r.signal)).size).toBe(requests.length)
    wrapper.unmount()
  })

  it('carries the query and the reason, so a host can tell which answer it is producing', async () => {
    const wrapper = await openDriven({ searchable: true })
    await search(wrapper, 'a')
    await search(wrapper, 'ab')
    const requests = requestsOf(wrapper)
    expect(requests.at(-1)!.reason).toBe('search')
    expect(requests.at(-1)!.query).toBe('ab')
    expect(requests.at(-2)!.query).toBe('a')
    wrapper.unmount()
  })

  /**
   * The discard itself, from the host's side. A host that fences on the signal —
   * which is the whole point of shipping one — never applies the abandoned
   * answer, so the control never renders it.
   */
  it('lets a fencing host refuse the abandoned answer, and the control never shows it', async () => {
    const wrapper = await openDriven({ searchable: true })
    await search(wrapper, 'a')
    await search(wrapper, 'ab')
    const requests = requestsOf(wrapper)
    const abandoned = requests.at(-2)!

    // Exactly what `createTrackingHost().answer()` does in the story.
    const applied = abandoned.signal.aborted
      ? false
      : (await wrapper.setProps({ optionsState: 'ready', items: [{ label: 'STALE', value: 'stale' }] }), true)

    expect(applied).toBe(false)
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(document.body.textContent).not.toContain('STALE')
    // Still waiting, and still saying so. Third instance of finding `D-S3O2-5`:
    // the row is the loading row and announces the loading message, while
    // `data-options-state` publishes the raw `idle` the host never moved off.
    expect(announcement()).toBe('Loading options')
    expect(row()!.getAttribute('data-options-state')).toBe('idle')
    wrapper.unmount()
  })

  it('aborts what is in flight when the control unmounts, so a host is not left holding a dead signal', async () => {
    const wrapper = await openDriven()
    const latest = requestsOf(wrapper).at(-1)!
    expect(latest.signal.aborted).toBe(false)
    wrapper.unmount()
    expect(latest.signal.aborted).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// State 6 — the accessible announcement of each
// ---------------------------------------------------------------------------

describe('state 6 — every state is announced, and announced politely', () => {
  it('is one polite live region, not an alert', async () => {
    const wrapper = await openDriven({ optionsState: 'loading' })
    expect(row()!.getAttribute('role')).toBe('status')
    expect(row()!.getAttribute('aria-live')).toBe('polite')
    wrapper.unmount()
  })

  /**
   * The same element, re-texted across all three states — so an AT announces a
   * change rather than the arrival of a new node, which is what a polite live
   * region is for. A component that unmounted and remounted the region per state
   * would pass every other assertion here and announce nothing reliably.
   */
  it('announces each state in the same region, with the catalog\'s words', async () => {
    const wrapper = await openDriven({ optionsState: 'loading' })
    const first = row()
    expect(announcement()).toBe('Loading options')

    await wrapper.setProps({ optionsState: 'empty' })
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(announcement()).toBe('No options found')
    expect(row()).toBe(first)

    await wrapper.setProps({ optionsState: 'error', optionsError: 'The directory did not answer' })
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(announcement()).toBe('The directory did not answer')
    expect(row()).toBe(first)

    wrapper.unmount()
  })

  it('names the retry control, so it is reachable by its accessible name', async () => {
    const wrapper = await openDriven({ optionsState: 'error' })
    const retry = row()!.querySelector<HTMLButtonElement>('[data-part="options-retry"]')
    expect(retry!.textContent?.trim()).toBe('Try again')
    expect(retry!.getAttribute('type')).toBe('button')
    wrapper.unmount()
  })

  it('removes the region once there is a list to read instead', async () => {
    const wrapper = await openDriven({ optionsState: 'loading' })
    expect(row()).not.toBeNull()
    await wrapper.setProps({ optionsState: 'ready', items: PEOPLE })
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(row()).toBeNull()
    wrapper.unmount()
  })

  /**
   * The additive guarantee, restated here because every assertion above depends
   * on it: a select with a plain `items` array renders none of this.
   */
  it('renders nothing of the seam for a static control', async () => {
    const wrapper = mount(DzSelect, {
      props: { items: PEOPLE, defaultOpen: true },
      attachTo: document.body,
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(row()).toBeNull()
    expect(wrapper.emitted('loadOptions')).toBeUndefined()
    wrapper.unmount()
  })
})
