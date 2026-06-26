import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * useScrollProgress — track an element's progress through the viewport as a
 * 0→1 value (docs/animations.md §6.1, effect 6). Drives scroll parallax: the
 * element reads `0` the moment its top edge reaches the bottom of the viewport
 * and `1` once its bottom edge has passed the top, so a layer can be translated
 * by `progress * travel` for a parallax drift.
 *
 * rAF-throttled, passive scroll/resize listeners, and SSR-safe (guards
 * `window`). Returns a reactive `progress` ref clamped to `[0, 1]`. Callers cap
 * the travel and disable the transform under reduced motion.
 */
export function useScrollProgress(elRef: Ref<HTMLElement | null | undefined>): Ref<number> {
  const progress = ref(0)
  let frame = 0
  let target: HTMLElement | null = null

  function compute(): void {
    frame = 0
    const el = target
    if (!el || typeof window === 'undefined') return
    const viewport = window.innerHeight || document.documentElement.clientHeight
    const rect = el.getBoundingClientRect()
    const total = viewport + rect.height
    if (total <= 0) {
      progress.value = 0
      return
    }
    const traveled = (viewport - rect.top) / total
    progress.value = traveled < 0 ? 0 : traveled > 1 ? 1 : traveled
  }

  function onScroll(): void {
    if (frame) return
    frame = window.requestAnimationFrame(compute)
  }

  function start(el: HTMLElement): void {
    target = el
    if (typeof window === 'undefined') return
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    compute()
  }

  function stop(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
    frame = 0
    target = null
  }

  onMounted(() => {
    if (elRef.value) start(elRef.value)
  })

  watch(elRef, (el) => {
    stop()
    if (el) start(el)
  })

  onBeforeUnmount(stop)

  return progress
}
