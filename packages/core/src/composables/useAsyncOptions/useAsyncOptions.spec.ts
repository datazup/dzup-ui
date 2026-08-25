/**
 * useAsyncOptions — unit tests (TASK-FORM-OSS-03).
 *
 * Two things carry the weight here. The first is that the seam is **inert**
 * when a control is not being driven asynchronously — that is what makes it
 * additive, and it is the assertion that would fail if someone made
 * `optionsState` default to something. The second is abort: every request
 * supersedes the last, and the last one's signal has to be aborted *before* the
 * next is emitted, or a host that fences on the signal races two live requests.
 */

import type { LoadOptionsRequest } from '@dzup-ui/contracts'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useAsyncOptions } from './useAsyncOptions.ts'

const MESSAGES = { loading: 'Loading…', empty: 'No matches', error: 'Could not load' }

function setup(overrides: Partial<Parameters<typeof useAsyncOptions>[0]> = {}) {
  const emitted: LoadOptionsRequest[] = []
  const api = useAsyncOptions(
    { emit: r => emitted.push(r), ...overrides },
    MESSAGES,
  )
  return { api, emitted }
}

describe('useAsyncOptions — a static control is untouched', () => {
  it('is not async when no optionsState is given', () => {
    const { api } = setup()
    expect(api.isAsync.value).toBe(false)
    expect(api.state.value).toBe('ready')
    expect(api.row.value).toBeNull()
    expect(api.announcement.value).toBe('')
  })

  it('emits nothing, so a static control cannot ask a host that is not listening', () => {
    const { api, emitted } = setup()
    expect(api.request('open')).toBeNull()
    expect(emitted).toEqual([])
  })

  it('renders the list rather than an empty row when it simply has no options', () => {
    // A static control with an empty array is a control with no options, not a
    // control reporting emptiness. Only the async path renders a row.
    const { api } = setup({ hasOptions: false })
    expect(api.row.value).toBeNull()
  })
})

describe('useAsyncOptions — which row', () => {
  it('shows a loading row while loading', () => {
    const { api } = setup({ state: 'loading' })
    expect(api.row.value).toBe('loading')
    expect(api.announcement.value).toBe('Loading…')
  })

  it('shows an error row, and prefers the host\'s message over the generic one', () => {
    const { api } = setup({ state: 'error', error: 'Search service is down' })
    expect(api.row.value).toBe('error')
    expect(api.announcement.value).toBe('Search service is down')

    const { api: generic } = setup({ state: 'error' })
    expect(generic.announcement.value).toBe('Could not load')
  })

  it('shows the list when ready with options', () => {
    const { api } = setup({ state: 'ready', hasOptions: true })
    expect(api.row.value).toBeNull()
    expect(api.announcement.value).toBe('')
  })

  it('treats ready-with-nothing as empty', () => {
    // A host reporting `ready` with no options means the same as one reporting
    // `empty`. Rendering an empty list for the first and a row for the second
    // would be two different controls.
    const { api } = setup({ state: 'ready', hasOptions: false })
    expect(api.row.value).toBe('empty')
    expect(api.announcement.value).toBe('No matches')
  })

  it('treats idle-with-nothing as loading, because a request is about to happen', () => {
    const { api } = setup({ state: 'idle', hasOptions: false })
    expect(api.row.value).toBe('loading')
  })

  it('keeps showing the previous options while a refresh is idle', () => {
    const { api } = setup({ state: 'idle', hasOptions: true })
    expect(api.row.value).toBeNull()
  })
})

describe('useAsyncOptions — retry', () => {
  it('offers retry on an error by default', () => {
    expect(setup({ state: 'error' }).api.canRetry.value).toBe(true)
  })

  it('does not offer retry when the host says it retries itself', () => {
    // Two competing paths to the same request is worse than none.
    expect(setup({ state: 'error', retryable: false }).api.canRetry.value).toBe(false)
  })

  it('never offers retry outside an error', () => {
    for (const state of ['idle', 'loading', 'ready', 'empty'] as const)
      expect(setup({ state }).api.canRetry.value, state).toBe(false)
  })
})

describe('useAsyncOptions — requests and abort', () => {
  it('emits the query and the reason', () => {
    const { api, emitted } = setup({ state: 'ready' })
    api.request('search', 'ad')
    expect(emitted).toHaveLength(1)
    expect(emitted[0]!.query).toBe('ad')
    expect(emitted[0]!.reason).toBe('search')
  })

  it('defaults the query to the empty string when the reason is not a search', () => {
    const { api, emitted } = setup({ state: 'ready' })
    api.request('open')
    expect(emitted[0]!.query).toBe('')
  })

  it('aborts the previous request before emitting the next', () => {
    const { api, emitted } = setup({ state: 'ready' })
    const first = api.request('search', 'a')!
    expect(first.signal.aborted).toBe(false)

    const second = api.request('search', 'ab')!
    // The order matters: a host fencing on the signal must see the abort before
    // it sees the new request, or it has two live requests to reconcile.
    expect(first.signal.aborted).toBe(true)
    expect(second.signal.aborted).toBe(false)
    expect(emitted).toHaveLength(2)
  })

  it('gives each request its own signal', () => {
    const { api } = setup({ state: 'ready' })
    expect(api.request('open')!.signal).not.toBe(api.request('open')!.signal)
  })

  it('abort() cancels without emitting anything', () => {
    const { api, emitted } = setup({ state: 'ready' })
    const request = api.request('open')!
    api.abort()
    expect(request.signal.aborted).toBe(true)
    expect(emitted).toHaveLength(1)
  })

  it('lets a host observe the abort', () => {
    const { api } = setup({ state: 'ready' })
    const onAbort = vi.fn()
    api.request('open')!.signal.addEventListener('abort', onAbort)
    api.request('open')
    expect(onAbort).toHaveBeenCalledTimes(1)
  })
})

describe('useAsyncOptions — reactivity', () => {
  it('follows a changing state', () => {
    const state = ref<'loading' | 'ready'>('loading')
    const { api } = setup({ state, hasOptions: true })
    expect(api.row.value).toBe('loading')
    state.value = 'ready'
    expect(api.row.value).toBeNull()
  })

  it('follows a control that gains options', () => {
    const hasOptions = ref(false)
    const { api } = setup({ state: 'ready', hasOptions })
    expect(api.row.value).toBe('empty')
    hasOptions.value = true
    expect(api.row.value).toBeNull()
  })
})
