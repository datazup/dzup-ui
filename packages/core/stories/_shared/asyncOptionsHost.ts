/**
 * A mocked remote option source for the async-options stories (TASK-R3-O3).
 *
 * Every selection control on the shared `useAsyncOptions` seam (renderer
 * contract C9) emits `load-options` and renders whatever `optionsState` the
 * host passes back. Core never fetches, so a story needs a *host* — this is
 * that host, with no network and no timers: a `play()` function (or a person
 * pressing the story's host buttons) decides when a load resolves or fails.
 *
 * It behaves like a well-written real host in the one way that matters: it
 * honours the request's `AbortSignal`. `resolve()` answers the latest request
 * and does nothing if the control has already superseded or cancelled it — so a
 * story that passes proves the control kept its latest request alive, not just
 * that the rows render.
 *
 * Create one at module level per story so its `render` and its `play` share it,
 * and call `reset()` in `setup` so a re-render starts clean.
 */

import type { AsyncOptionsState, LoadOptionsRequest } from '@dzup-ui/contracts'
import type { Ref } from 'vue'
import { expect, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'

export interface MockOptionsHost<T> {
  /** Bind to the control's `options-state`. */
  readonly state: Ref<AsyncOptionsState>
  /** Bind to the control's `options-error`. */
  readonly error: Ref<string | undefined>
  /** Bind to the control's option collection (`items`, `options`, `nodes`, `source`). */
  readonly items: Ref<T[]>
  /** How many `load-options` requests the control has emitted. */
  readonly requests: Ref<number>
  /** How many times the control's retry was pressed. */
  readonly retries: Ref<number>
  /** `@load-options` handler. */
  onLoadOptions: (request: LoadOptionsRequest) => void
  /** `@retry-options` handler. */
  onRetryOptions: () => void
  /** Answer the latest request with the dataset, filtered by its query. */
  resolve: () => void
  /** Fail the load in flight. */
  fail: (message?: string) => void
  /** A host-initiated refresh: loading, with nothing to show yet. */
  reload: () => void
  /** Back to the state a freshly mounted story starts from. */
  reset: () => void
}

export function createMockOptionsHost<T>(
  dataset: readonly T[],
  matches: (item: T, query: string) => boolean = () => true,
): MockOptionsHost<T> {
  const state = ref<AsyncOptionsState>('idle')
  const error = ref<string | undefined>(undefined)
  const items = ref([]) as Ref<T[]>
  const requests = ref(0)
  const retries = ref(0)
  let pending: LoadOptionsRequest | null = null

  return {
    state,
    error,
    items,
    requests,
    retries,
    onLoadOptions(request) {
      pending = request
      requests.value += 1
      error.value = undefined
      state.value = 'loading'
    },
    onRetryOptions() {
      retries.value += 1
    },
    resolve() {
      // A superseded or cancelled request gets no answer — as a real host fences.
      if (pending?.signal.aborted)
        return
      const query = pending?.query ?? ''
      items.value = dataset.filter(item => matches(item, query))
      state.value = items.value.length > 0 ? 'ready' : 'empty'
      pending = null
    },
    fail(message = 'The directory did not answer') {
      if (pending?.signal.aborted)
        return
      items.value = []
      error.value = message
      state.value = 'error'
      pending = null
    },
    reload() {
      pending = null
      items.value = []
      error.value = undefined
      state.value = 'loading'
    },
    reset() {
      pending = null
      state.value = 'idle'
      error.value = undefined
      items.value = []
      requests.value = 0
      retries.value = 0
    },
  }
}

/** Storybook's `step`, narrowed to what the walk uses. */
type Step = (label: string, run: () => Promise<void>) => unknown

export interface AsyncOptionsWalk {
  /** The mocked host the story binds (only its dataset-independent half is used). */
  host: Pick<MockOptionsHost<unknown>, 'requests' | 'retries' | 'resolve' | 'fail' | 'reload'>
  /**
   * Where the state row renders: the canvas for an in-tree panel, the document
   * body for a portalled one.
   */
  root: HTMLElement
  /** Open the control's panel, when it has one to open. */
  open?: () => Promise<void>
  /** Assert that at least one of the dataset's options is on screen. */
  expectOptions: () => Promise<void>
  /** The play context's `step`, so each phase is its own entry in the panel. */
  step: Step
}

/**
 * The `play()` every async-options story runs: loading → ready → error → retry,
 * against the mocked host.
 *
 * Phases are asserted on the shared row's own contract — `data-part` and
 * `data-options-state` from `DzOptionsState` — so the same walk proves the same
 * behaviour on every host of the `useAsyncOptions` seam.
 */
export async function walkAsyncOptionsStates({ host, root, open, expectOptions, step }: AsyncOptionsWalk): Promise<void> {
  const row = (): HTMLElement | null => root.querySelector<HTMLElement>('[data-part="options-state"]')

  await step('loading — the control asked the host and shows the loading row', async () => {
    if (open !== undefined)
      await open()
    await waitFor(() => expect(host.requests.value).toBeGreaterThan(0))
    await waitFor(() => expect(row()).toHaveAttribute('data-options-state', 'loading'))
    // The row is a polite live region, so the arrival of the answer is announced.
    await expect(row()).toHaveAttribute('role', 'status')
  })

  await step('ready — the host answers and the options replace the row', async () => {
    host.resolve()
    await waitFor(() => expect(row()).toBeNull())
    await expectOptions()
  })

  await step('error — a host refresh fails and the row says why', async () => {
    host.reload()
    await waitFor(() => expect(row()).toHaveAttribute('data-options-state', 'loading'))
    host.fail('The directory did not answer')
    await waitFor(() => expect(row()).toHaveAttribute('data-options-state', 'error'))
    await expect(row()!.querySelector('[data-part="options-message"]')).toHaveTextContent('The directory did not answer')
  })

  await step('retry — pressing it emits retry-options and a fresh request, then the list returns', async () => {
    const before = host.requests.value
    const retry = row()!.querySelector<HTMLElement>('[data-part="options-retry"]')
    await expect(retry).not.toBeNull()
    await userEvent.click(retry!)
    await waitFor(() => expect(host.retries.value).toBe(1))
    await waitFor(() => expect(host.requests.value).toBe(before + 1))
    await waitFor(() => expect(row()).toHaveAttribute('data-options-state', 'loading'))
    host.resolve()
    await waitFor(() => expect(row()).toBeNull())
    await expectOptions()
  })
}
