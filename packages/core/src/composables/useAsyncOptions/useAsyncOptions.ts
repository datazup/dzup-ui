/**
 * useAsyncOptions — one async-options seam for every selection control
 * (TASK-FORM-OSS-03, renderer contract C9).
 *
 * Seven Core controls choose from a set of options and all seven took a static
 * array. A form renderer whose options come from a remote source had nowhere to
 * say "loading", "that failed", or "there is nothing to show", and no way to
 * cancel a request the user has already moved past.
 *
 * This is the control side of that seam, and it is deliberately small: it
 * decides *which* state to render, holds the abort controller, and emits the
 * request. It never performs one. No URL, no credential, no `fetch` — the host
 * owns execution, sequence fencing and caching (form spec 04 §5, spec 06). A
 * control that fetched its own options would be a control an application cannot
 * secure, and a builder preview could not render without hitting the network.
 *
 * **Abort is the part worth having.** Every request supersedes the previous
 * one, and the previous one's signal aborts before the next is emitted. A host
 * that honours the signal gets cancellation for free; a host that ignores it is
 * no worse off than before. Without this each control would grow its own
 * `latestRequestId` counter, which is the same fence written seven times.
 *
 * @example
 * ```ts
 * const async = useAsyncOptions({
 *   state: computed(() => props.optionsState),
 *   error: computed(() => props.optionsError),
 *   retryable: computed(() => props.optionsRetryable),
 *   hasOptions: computed(() => items.value.length > 0),
 *   emit: request => emit('loadOptions', request),
 * })
 *
 * // when the panel opens
 * async.request('open')
 * ```
 *
 * @module @dzup-ui/core/composables/useAsyncOptions
 */

import type { AsyncOptionsState, LoadOptionsReason, LoadOptionsRequest } from '@dzup-ui/contracts'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, onMounted, onScopeDispose, toValue } from 'vue'

export interface UseAsyncOptionsOptions {
  /** The `optionsState` prop. `undefined` means the options are static. */
  state?: MaybeRefOrGetter<AsyncOptionsState | undefined>
  /** The `optionsError` prop. */
  error?: MaybeRefOrGetter<string | undefined>
  /** The `optionsRetryable` prop. Defaults to true. */
  retryable?: MaybeRefOrGetter<boolean | undefined>
  /** Whether the control currently has options to show. */
  hasOptions?: MaybeRefOrGetter<boolean>
  /** Emits the control's `load-options` event. */
  emit: (request: LoadOptionsRequest) => void
  /**
   * Ask once on mount when the control is being driven and has nothing.
   *
   * Defaults to true. A control whose panel opens later can still ask again on
   * open; this covers the case a control cannot otherwise detect — a host that
   * renders it with `optionsState="idle"` and an empty array is asking for
   * options, and waiting for an interaction that may never come would leave the
   * panel empty forever.
   *
   * A host that already supplied options is never asked, so this cannot turn
   * into a request on every mount of a populated control.
   *
   * A control that also asks on open must not ask here as well: two requests
   * one tick apart means the composable aborts the first, and a host that
   * fences on the signal drops a response it had already started fetching.
   * `DzSelect` had exactly that duplicate until its own contract spec — which
   * asserts the first request is *not* aborted — caught it.
   */
  requestOnMount?: boolean
}

/** Which single row the control should render instead of its list, if any. */
export type AsyncOptionsRow = 'loading' | 'empty' | 'error' | null

export interface UseAsyncOptionsReturn {
  /**
   * Whether this control is being driven asynchronously at all.
   *
   * False when no `optionsState` was given, and then everything below is inert
   * — which is what keeps the seam additive for the static case.
   */
  readonly isAsync: ComputedRef<boolean>
  /** The resolved state, `'ready'` when the control is static. */
  readonly state: ComputedRef<AsyncOptionsState>
  /** The row to render in place of the list, or `null` to render the list. */
  readonly row: ComputedRef<AsyncOptionsRow>
  /** Whether an error row should offer a retry. */
  readonly canRetry: ComputedRef<boolean>
  /**
   * What a polite live region should currently say, or `''` for nothing.
   *
   * A string rather than a call, so the control renders it declaratively and it
   * is correct on the server too.
   */
  readonly announcement: ComputedRef<string>
  /**
   * Ask the host for options.
   *
   * Aborts the previous request first. Returns the request that was emitted, or
   * `null` when the control is not async and nothing was emitted.
   */
  request: (reason: LoadOptionsReason, query?: string) => LoadOptionsRequest | null
  /** Abort whatever is in flight without emitting a new request. */
  abort: () => void
}

/** Messages the control passes in, already resolved against the app catalog. */
export interface AsyncOptionsMessages {
  loading: string
  empty: string
  error: string
}

export function useAsyncOptions(
  options: UseAsyncOptionsOptions,
  messages?: MaybeRefOrGetter<AsyncOptionsMessages>,
): UseAsyncOptionsReturn {
  let controller: AbortController | null = null

  const isAsync = computed(() => toValue(options.state) !== undefined)
  const state = computed<AsyncOptionsState>(() => toValue(options.state) ?? 'ready')
  const hasOptions = computed(() => toValue(options.hasOptions) ?? false)

  /**
   * `empty` is inferred as well as accepted.
   *
   * A host that reports `ready` with nothing to show means the same thing as
   * one that reports `empty`, and a control that rendered an empty list for the
   * first and an empty row for the second would be two controls.
   */
  const row = computed<AsyncOptionsRow>(() => {
    if (!isAsync.value)
      return null
    switch (state.value) {
      case 'loading':
        return 'loading'
      case 'error':
        return 'error'
      case 'empty':
        return 'empty'
      case 'ready':
        return hasOptions.value ? null : 'empty'
      case 'idle':
        return hasOptions.value ? null : 'loading'
    }
  })

  const canRetry = computed(
    () => state.value === 'error' && (toValue(options.retryable) ?? true),
  )

  const announcement = computed(() => {
    if (!isAsync.value)
      return ''
    const catalog = toValue(messages)
    if (catalog === undefined)
      return ''
    switch (row.value) {
      case 'loading':
        return catalog.loading
      case 'empty':
        return catalog.empty
      case 'error':
        return toValue(options.error) ?? catalog.error
      case null:
        return ''
    }
  })

  function abort(): void {
    controller?.abort()
    controller = null
  }

  function request(reason: LoadOptionsReason, query = ''): LoadOptionsRequest | null {
    if (!isAsync.value)
      return null
    // Supersede before emitting: a host that honours the signal drops the
    // in-flight response rather than racing it against this one.
    abort()
    controller = new AbortController()
    const next: LoadOptionsRequest = { query, reason, signal: controller.signal }
    options.emit(next)
    return next
  }

  if (options.requestOnMount !== false) {
    onMounted(() => {
      if (isAsync.value && !hasOptions.value && state.value !== 'loading')
        request('open')
    })
  }

  // A control that unmounts mid-request should not leave the host holding a
  // signal that will never abort.
  onScopeDispose(abort)

  return { isAsync, state, row, canRetry, announcement, request, abort }
}
