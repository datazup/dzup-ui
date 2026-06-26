/**
 * useInfiniteScroll — Fire a callback when a sentinel scrolls into view.
 *
 * Observes a single sentinel element with one IntersectionObserver and invokes
 * `onLoadMore` when it enters the viewport (or the optional scroll `root`),
 * subject to `disabled` / `loading` / `hasMore` guards. The guard fires the
 * callback at most once per intersection until the parent flips `loading` back
 * off, at which point — if the sentinel is still in view — the next page is
 * requested automatically.
 *
 * `direction` controls which edge of the observation box is grown by
 * `distance`, so the same composable drives both forward feeds (`'down'`) and
 * reverse/chat lists (`'up'`).
 *
 * Client-only: the observer is created on mount and is a no-op during SSR or
 * where `IntersectionObserver` is unavailable.
 *
 * @module @dzup-ui/core/composables/useInfiniteScroll
 */

import type { Ref } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/** Scroll direction the loader pages towards */
export type InfiniteScrollDirection = 'down' | 'up'

/** Options for the useInfiniteScroll composable */
export interface UseInfiniteScrollOptions {
  /** The sentinel element to observe (rendered after/before the items) */
  target: Ref<HTMLElement | null | undefined>
  /** Whether a load is currently in flight — suppresses further triggers */
  loading: Ref<boolean>
  /** Whether more items remain to be loaded */
  hasMore: Ref<boolean>
  /** Disables observation entirely */
  disabled?: Ref<boolean>
  /** Distance (px) ahead of the sentinel at which loading should begin */
  distance?: Ref<number>
  /** Paging direction — grows the matching edge of the observation box */
  direction?: Ref<InfiniteScrollDirection>
  /** Optional scroll container; defaults to the browser viewport */
  root?: Ref<Element | null | undefined>
  /** Invoked when the sentinel enters view and all guards pass */
  onLoadMore: () => void
}

/** Return value of the useInfiniteScroll composable */
export interface UseInfiniteScrollReturn {
  /** Whether the sentinel is currently intersecting the root */
  isIntersecting: Ref<boolean>
  /** Whether a `load-more` has fired and not yet been acknowledged */
  pending: Ref<boolean>
  /** Re-arm the guard and re-evaluate — used to recover from a failed load */
  retry: () => void
  /** (Re)connect the observer to the current target — called automatically */
  connect: () => void
  /** Disconnect the observer and reset tracked state */
  disconnect: () => void
}

/**
 * Composable that requests more items when a sentinel scrolls into view.
 *
 * @param options - Sentinel + reactive guards and the load callback
 * @returns Intersection state plus manual retry/connect/disconnect controls
 */
export function useInfiniteScroll(options: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const {
    target,
    loading,
    hasMore,
    disabled = ref(false),
    distance = ref(0),
    direction = ref<InfiniteScrollDirection>('down'),
    root = ref<Element | null>(null),
    onLoadMore,
  } = options

  const isIntersecting = ref(false)
  /** True once a load-more has fired, until the parent's loading cycle ends. */
  const pending = ref(false)
  let observer: IntersectionObserver | null = null
  /** The element + margin currently observed, to skip redundant reconnects. */
  let observedEl: Element | null = null
  let observedMargin = ''

  /**
   * Grow the edge the list pages towards so loading starts `distance` px early.
   * `'down'` insets the bottom; `'up'` insets the top.
   */
  const rootMargin = computed(() => {
    const d = Math.max(0, distance.value)
    return direction.value === 'up'
      ? `${d}px 0px 0px 0px`
      : `0px 0px ${d}px 0px`
  })

  /** Fire `onLoadMore` once if the sentinel is visible and all guards pass. */
  function maybeLoad(): void {
    if (!isIntersecting.value)
      return
    if (disabled.value || loading.value || !hasMore.value || pending.value)
      return
    pending.value = true
    onLoadMore()
  }

  /**
   * Tear down the observer. Intersection/pending state is preserved so a
   * benign reconnect (e.g. a parent re-render) does not drop a pending load.
   */
  function disconnect(): void {
    observer?.disconnect()
    observer = null
    observedEl = null
    observedMargin = ''
  }

  function connect(): void {
    if (typeof IntersectionObserver === 'undefined' || typeof document === 'undefined')
      return
    const el = target.value ?? null
    if (!el) {
      disconnect()
      isIntersecting.value = false
      return
    }
    // Nothing meaningful changed — keep the live observer and its state.
    if (observer && observedEl === el && observedMargin === rootMargin.value)
      return

    disconnect()
    observedEl = el
    observedMargin = rootMargin.value
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        if (!entry)
          return
        isIntersecting.value = entry.isIntersecting
        if (entry.isIntersecting) {
          maybeLoad()
        }
        else {
          // Leaving view re-arms the guard so the next entry can fire again.
          pending.value = false
        }
      },
      {
        root: root.value ?? null,
        rootMargin: rootMargin.value,
        threshold: 0,
      },
    )
    observer.observe(el)
  }

  // A completed load cycle (loading: true → false) acknowledges the pending
  // request; if the sentinel is still in view, page straight to the next chunk.
  watch(loading, (now, prev) => {
    if (prev && !now) {
      pending.value = false
      maybeLoad()
    }
  })

  /** Re-arm the guard and re-evaluate — recovers from a failed load. */
  function retry(): void {
    pending.value = false
    maybeLoad()
  }

  // Re-observe when the sentinel, root, margin, or direction changes (flush
  // post so the referenced DOM node exists).
  watch(
    [target, root, rootMargin],
    () => connect(),
    { flush: 'post' },
  )

  onMounted(connect)
  onBeforeUnmount(disconnect)

  return { isIntersecting, pending, retry, connect, disconnect }
}
