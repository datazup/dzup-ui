/**
 * useIntersection — Observe a single element and report viewport intersection.
 *
 * A thin, reactive wrapper around a single-element `IntersectionObserver`. It
 * invokes `onChange` whenever the target's intersection state flips and tracks
 * the latest value in `isIntersecting`. With `once`, the observer disconnects
 * itself after the first intersection — the common "reveal then forget" case.
 *
 * Client-only: the observer is created on mount and is a no-op during SSR or on
 * engines without `IntersectionObserver`. Consumers should branch on
 * `isSupported` to fall back to immediate behaviour in those environments.
 *
 * Unlike {@link useInfiniteScroll}, this composable carries no paging or loading
 * semantics — it is the lower-level primitive both it and DzDeferredContent can
 * build on.
 *
 * @module @dzup-ui/core/composables/useIntersection
 */

import type { Ref } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/** Options for the useIntersection composable */
export interface UseIntersectionOptions {
  /** The element to observe */
  target: Ref<Element | null | undefined>
  /** Optional scroll container; defaults to the browser viewport */
  root?: Ref<Element | null | undefined>
  /** Margin grown around the root before computing intersections */
  rootMargin?: Ref<string>
  /** Visibility ratio(s) at which `onChange` fires */
  threshold?: Ref<number | number[]>
  /** Stop observing after the first intersection */
  once?: Ref<boolean>
  /** Invoked whenever the intersection state changes */
  onChange: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void
}

/** Return value of the useIntersection composable */
export interface UseIntersectionReturn {
  /** Whether the target is currently intersecting the root */
  isIntersecting: Ref<boolean>
  /** Whether `IntersectionObserver` is available in this environment */
  isSupported: boolean
  /** (Re)connect the observer to the current target — called automatically */
  connect: () => void
  /** Disconnect the observer and reset tracked state */
  disconnect: () => void
}

/**
 * Observe an element and react to it entering / leaving the viewport.
 *
 * @param options - Target element, reactive observer options, and the callback
 * @returns Intersection state plus manual connect/disconnect controls
 */
export function useIntersection(options: UseIntersectionOptions): UseIntersectionReturn {
  const {
    target,
    root = ref<Element | null>(null),
    rootMargin = ref('0px'),
    threshold = ref<number | number[]>(0),
    once = ref(false),
    onChange,
  } = options

  const isSupported
    = typeof IntersectionObserver !== 'undefined' && typeof document !== 'undefined'

  const isIntersecting = ref(false)
  let observer: IntersectionObserver | null = null
  /** The element currently observed, to skip redundant reconnects. */
  let observedEl: Element | null = null

  /** Serialise the observer options so a change can be detected cheaply. */
  const observerKey = computed(() =>
    `${rootMargin.value}|${JSON.stringify(threshold.value)}`,
  )
  let observedKey = ''

  /** Tear down the observer. */
  function disconnect(): void {
    observer?.disconnect()
    observer = null
    observedEl = null
    observedKey = ''
  }

  function connect(): void {
    if (!isSupported)
      return
    const el = target.value ?? null
    if (!el) {
      disconnect()
      isIntersecting.value = false
      return
    }
    // Nothing meaningful changed — keep the live observer and its state.
    if (observer && observedEl === el && observedKey === observerKey.value)
      return

    disconnect()
    observedEl = el
    observedKey = observerKey.value
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        if (!entry)
          return
        isIntersecting.value = entry.isIntersecting
        onChange(entry.isIntersecting, entry)
        if (entry.isIntersecting && once.value)
          disconnect()
      },
      {
        root: root.value ?? null,
        rootMargin: rootMargin.value,
        threshold: threshold.value,
      },
    )
    observer.observe(el)
  }

  // Re-observe when the target, root, or observer options change (flush post so
  // the referenced DOM node exists).
  watch(
    [target, root, observerKey],
    () => connect(),
    { flush: 'post' },
  )

  onMounted(connect)
  onBeforeUnmount(disconnect)

  return { isIntersecting, isSupported, connect, disconnect }
}
