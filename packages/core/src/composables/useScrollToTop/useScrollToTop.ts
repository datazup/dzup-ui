/**
 * useScrollToTop — Track scroll distance and smooth-scroll back to the top.
 *
 * Watches a scroll container (defaults to `window`), reports whether it has
 * scrolled past a configured threshold, and exposes a `scrollToTop` action that
 * animates back to the origin over a configurable duration. The animation is
 * skipped (an instant jump) when the user prefers reduced motion or `duration`
 * is non-positive.
 *
 * Scroll handling is throttled via `requestAnimationFrame`. SSR-safe: no
 * `window`/`document` access at module scope — listeners attach on mount.
 *
 * @module @dzup-ui/core/composables/useScrollToTop
 */

import type { MaybeRefOrGetter, Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

/** Options for the useScrollToTop composable */
export interface UseScrollToTopOptions {
  /** Scroll distance (px) past which `visible` flips to `true`. Defaults to 400. */
  visibilityHeight?: MaybeRefOrGetter<number>
  /** Returns the scroll container. Defaults to `window` when omitted/null. */
  target?: () => HTMLElement | Window | null | undefined
  /** Smooth-scroll duration (ms). `<= 0` jumps instantly. Defaults to 400. */
  duration?: MaybeRefOrGetter<number>
}

/** Return value of the useScrollToTop composable */
export interface UseScrollToTopReturn {
  /** Whether the container is scrolled past `visibilityHeight`. */
  visible: Ref<boolean>
  /** Smooth-scroll the container back to the top. */
  scrollToTop: () => void
  /** Force a synchronous re-evaluation of `visible`. */
  update: () => void
}

const DEFAULT_VISIBILITY_HEIGHT = 400
const DEFAULT_DURATION = 400

/** easeInOutQuad — symmetric acceleration/deceleration in [0, 1]. */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2
}

/**
 * Tracks scroll position and provides a smooth scroll-to-top action.
 *
 * @param options - Visibility threshold, scroll container, and scroll duration.
 */
export function useScrollToTop(options: UseScrollToTopOptions = {}): UseScrollToTopReturn {
  const visible = ref(false)

  function getTarget(): HTMLElement | Window {
    return options.target?.() ?? window
  }

  function getScrollTop(target: HTMLElement | Window): number {
    if (target instanceof HTMLElement)
      return target.scrollTop
    return window.scrollY ?? window.pageYOffset ?? 0
  }

  function setScrollTop(target: HTMLElement | Window, y: number): void {
    if (target instanceof HTMLElement)
      target.scrollTop = y
    else
      window.scrollTo(0, y)
  }

  function prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  }

  function update(): void {
    const threshold = toValue(options.visibilityHeight) ?? DEFAULT_VISIBILITY_HEIGHT
    visible.value = getScrollTop(getTarget()) >= threshold
  }

  function scrollToTop(): void {
    const target = getTarget()
    const start = getScrollTop(target)
    if (start <= 0)
      return

    const duration = toValue(options.duration) ?? DEFAULT_DURATION
    if (duration <= 0 || prefersReducedMotion()) {
      setScrollTop(target, 0)
      update()
      return
    }

    const startTime = performance.now()
    function step(now: number): void {
      const progress = Math.min((now - startTime) / duration, 1)
      setScrollTop(target, Math.round(start * (1 - easeInOutQuad(progress))))
      if (progress < 1)
        requestAnimationFrame(step)
      else
        update()
    }
    requestAnimationFrame(step)
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

  function attach(): void {
    listenTarget = getTarget()
    listenTarget.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })
  }

  function detach(): void {
    listenTarget?.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
    listenTarget = null
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

  // Re-bind to a possibly-new target and re-measure when inputs change.
  watch(
    () => [options.target?.(), toValue(options.visibilityHeight)],
    () => {
      detach()
      attach()
      update()
    },
  )

  return { visible, scrollToTop, update }
}
