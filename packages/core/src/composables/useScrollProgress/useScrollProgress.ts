/**
 * useScrollProgress — Track how far a scroll container has been scrolled (0–100).
 *
 * Watches a scroll container (defaults to `window`, but accepts an element, an
 * element-returning getter, or a CSS selector string) and reports the scroll
 * position as a clamped 0–100 percentage. Reuses the same listener strategy as
 * `useScrollToTop`: a single passive, `requestAnimationFrame`-throttled scroll
 * handler plus a `resize` listener, with an additional `ResizeObserver` so the
 * percentage recomputes when the scrollable content grows or shrinks.
 *
 * SSR-safe: no `window`/`document` access at module scope — listeners attach on
 * mount and detach before unmount.
 *
 * @module @dzup-ui/core/composables/useScrollProgress
 */

import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/** A scroll container, or a way to resolve one. */
export type ScrollProgressTarget = HTMLElement | Window | string | null | undefined

/** Options for the useScrollProgress composable */
export interface UseScrollProgressOptions {
  /**
   * Returns the scroll container. May yield an element, the `window`, a CSS
   * selector string, or `null`/`undefined` to fall back to `window`.
   */
  target?: () => ScrollProgressTarget
  /** Called whenever the clamped 0–100 progress value changes. */
  onChange?: (value: number) => void
}

/** Return value of the useScrollProgress composable */
export interface UseScrollProgressReturn {
  /** Scroll position as a clamped percentage in `[0, 100]`. */
  progress: Ref<number>
  /** Force a synchronous re-measure of `progress`. */
  update: () => void
}

/** Resolve a target descriptor to a concrete scroll source. */
function resolveTarget(target: ScrollProgressTarget): HTMLElement | Window {
  if (typeof target === 'string') {
    if (typeof document === 'undefined')
      return window
    return document.querySelector<HTMLElement>(target) ?? window
  }
  return target ?? window
}

/** Read the scroll metrics for a window or element target. */
function readMetrics(source: HTMLElement | Window): {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
} {
  if (source instanceof HTMLElement) {
    return {
      scrollTop: source.scrollTop,
      scrollHeight: source.scrollHeight,
      clientHeight: source.clientHeight,
    }
  }
  const doc = document.documentElement
  return {
    scrollTop: window.scrollY ?? window.pageYOffset ?? 0,
    scrollHeight: doc.scrollHeight,
    clientHeight: window.innerHeight,
  }
}

/**
 * Tracks scroll position as a 0–100 percentage of a container's scrollable range.
 *
 * @param options - Scroll container resolver and change callback.
 */
export function useScrollProgress(options: UseScrollProgressOptions = {}): UseScrollProgressReturn {
  const progress = ref(0)

  function getSource(): HTMLElement | Window {
    return resolveTarget(options.target?.())
  }

  function update(): void {
    const { scrollTop, scrollHeight, clientHeight } = readMetrics(getSource())
    const scrollable = scrollHeight - clientHeight
    // Nothing to scroll → treat as 0% rather than dividing by zero.
    const next = scrollable > 0
      ? Math.min(Math.max((scrollTop / scrollable) * 100, 0), 100)
      : 0
    if (next !== progress.value) {
      progress.value = next
      options.onChange?.(next)
    }
  }

  let rafId = 0
  function scheduleUpdate(): void {
    if (rafId)
      return
    rafId = requestAnimationFrame(() => {
      rafId = 0
      update()
    })
  }

  let listenTarget: HTMLElement | Window | null = null
  let resizeObserver: ResizeObserver | null = null

  function attach(): void {
    listenTarget = getSource()
    listenTarget.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })

    // Recompute when the scrollable content itself changes size.
    if (typeof ResizeObserver !== 'undefined') {
      const observed = listenTarget instanceof HTMLElement
        ? listenTarget
        : document.documentElement
      resizeObserver = new ResizeObserver(scheduleUpdate)
      resizeObserver.observe(observed)
    }
  }

  function detach(): void {
    listenTarget?.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
    listenTarget = null
    resizeObserver?.disconnect()
    resizeObserver = null
  }

  onMounted(() => {
    attach()
    update()
  })

  onBeforeUnmount(() => {
    detach()
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  })

  // Re-bind to a possibly-new target and re-measure when the target changes.
  watch(
    () => options.target?.(),
    () => {
      detach()
      attach()
      update()
    },
  )

  return { progress, update }
}
