import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * useInView — reactive IntersectionObserver wrapper (generalises the observer in
 * `useScrollReveal.ts`).
 *
 * Observers are shared per unique `(rootMargin, threshold)` signature so a page
 * full of demos attaches only a handful of `IntersectionObserver`s rather than
 * one per element. By default it fires once and unobserves on first intersect
 * (the scroll-reveal pattern). When `IntersectionObserver` is unavailable
 * (SSR / very old browsers) the element is treated as in view immediately so
 * content is never blocked.
 */

/** Options accepted by {@link useInView}. */
export interface UseInViewOptions {
  /** Margin around the root, e.g. `'0px 0px -10% 0px'`. */
  rootMargin?: string
  /** Visibility ratio(s) that trigger a callback. */
  threshold?: number | number[]
  /** Reveal once then stop observing (default `true`). */
  once?: boolean
}

/** Per-element callback registry, keyed weakly so detached nodes are collectable. */
const callbacks = new WeakMap<Element, (isInView: boolean) => void>()

/** Shared observers keyed by their serialized option signature. */
const observers = new Map<string, IntersectionObserver>()

function optionsKey(rootMargin: string, threshold: number | number[]): string {
  return `${rootMargin}|${JSON.stringify(threshold)}`
}

function getObserver(rootMargin: string, threshold: number | number[]): IntersectionObserver | null {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return null

  const key = optionsKey(rootMargin, threshold)
  let observer = observers.get(key)
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          callbacks.get(entry.target)?.(entry.isIntersecting)
        }
      },
      { rootMargin, threshold },
    )
    observers.set(key, observer)
  }
  return observer
}

/**
 * Observe `elRef`'s element and report whether it is in view.
 *
 * @param elRef - template ref to the element to observe.
 * @param options - see {@link UseInViewOptions}.
 * @returns a reactive `isInView` ref.
 */
export function useInView(
  elRef: Ref<HTMLElement | null | undefined>,
  options: UseInViewOptions = {},
): Ref<boolean> {
  const { rootMargin = '0px 0px -10% 0px', threshold = 0.05, once = true } = options
  const isInView = ref(false)

  let observed: Element | null = null
  let observer: IntersectionObserver | null = null

  function unobserve(): void {
    if (observed) {
      observer?.unobserve(observed)
      callbacks.delete(observed)
      observed = null
    }
  }

  function observe(el: HTMLElement): void {
    unobserve()
    observer = getObserver(rootMargin, threshold)
    if (!observer) {
      // No IntersectionObserver → treat as in view immediately.
      isInView.value = true
      return
    }
    callbacks.set(el, (inView) => {
      isInView.value = inView
      if (inView && once) unobserve()
    })
    observer.observe(el)
    observed = el
  }

  onMounted(() => {
    if (elRef.value) observe(elRef.value)
  })

  watch(elRef, (el) => {
    if (el) observe(el)
    else unobserve()
  })

  onBeforeUnmount(unobserve)

  return isInView
}
