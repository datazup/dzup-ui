import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * useSticky — track scroll progress (0→1) through an INTERNAL scroll container
 * (docs/animations.md §5.6, effect 53). The JS floor for the sticky / pinned
 * scroll effect: while a `position: sticky` panel is pinned inside `scrollerRef`,
 * this reports how far the container has scrolled through its own overflow, so a
 * demo can advance steps and fill a progress bar without the (compositor-only)
 * `animation-timeline: scroll()` CSS path.
 *
 * Distinct from {@link useScrollProgress}, which tracks an element through the
 * WINDOW viewport — here the timeline is the container's own `scrollTop`, so the
 * effect works self-contained inside a fixed-height card stage.
 *
 * rAF-throttled, passive `scroll`/`resize` listeners, SSR-safe (guards `window`).
 * Returns a reactive `progress` ref clamped to `[0, 1]`.
 */
export function useSticky(scrollerRef: Ref<HTMLElement | null | undefined>): Ref<number> {
  const progress = ref(0)
  let frame = 0
  let target: HTMLElement | null = null

  function compute(): void {
    frame = 0
    const el = target
    if (!el)
      return
    const max = el.scrollHeight - el.clientHeight
    if (max <= 0) {
      progress.value = 0
      return
    }
    const p = el.scrollTop / max
    progress.value = p < 0 ? 0 : p > 1 ? 1 : p
  }

  function onScroll(): void {
    if (frame)
      return
    frame = window.requestAnimationFrame(compute)
  }

  function start(el: HTMLElement): void {
    target = el
    if (typeof window === 'undefined')
      return
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    compute()
  }

  function stop(): void {
    if (target)
      target.removeEventListener('scroll', onScroll)
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', onScroll)
      if (frame)
        window.cancelAnimationFrame(frame)
    }
    frame = 0
    target = null
  }

  onMounted(() => {
    if (scrollerRef.value)
      start(scrollerRef.value)
  })

  watch(scrollerRef, (el) => {
    stop()
    if (el)
      start(el)
  })

  onBeforeUnmount(stop)

  return progress
}
