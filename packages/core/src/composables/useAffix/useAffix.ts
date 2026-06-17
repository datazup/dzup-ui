/**
 * useAffix — Composable that pins an element to the viewport once it would
 * scroll past a configured threshold.
 *
 * The referenced root element stays in normal flow and acts as a size
 * placeholder; its slotted content is switched to `position: fixed` while
 * affixed so the surrounding layout never shifts. Measurements are taken
 * relative to a scroll container (defaults to `window`) and recomputed on
 * scroll / resize, throttled via `requestAnimationFrame`.
 *
 * SSR-safe: no `window`/`document` access at module scope.
 *
 * @module @dzup-ui/core/composables/useAffix
 */

import type { ComponentPublicInstance, ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

/** Options for the useAffix composable */
export interface UseAffixOptions {
  /** Pin distance from the top of the scroll container (px). */
  offsetTop?: MaybeRefOrGetter<number | undefined>
  /** Pin distance from the bottom of the scroll container (px). */
  offsetBottom?: MaybeRefOrGetter<number | undefined>
  /** Returns the scroll container. Defaults to `window` when omitted/null. */
  target?: () => HTMLElement | Window | null | undefined
  /** Invoked whenever the affixed state flips. */
  onChange?: (affixed: boolean) => void
}

/** Captured size of the placeholder, in CSS pixels. */
interface PlaceholderSize {
  width: number
  height: number
}

/** Resolved fixed-positioning geometry for the affixed content. */
interface FixedGeometry {
  top?: number
  bottom?: number
  left: number
  width: number
}

/** Return value of the useAffix composable */
export interface UseAffixReturn {
  /** Whether the content is currently pinned. */
  affixed: Ref<boolean>
  /** Function ref to attach to the placeholder root element. */
  setRootRef: (el: Element | ComponentPublicInstance | null) => void
  /** Inline style for the placeholder root (holds space while affixed). */
  rootStyle: ComputedRef<Record<string, string>>
  /** Inline style for the slotted content wrapper (fixed while affixed). */
  contentStyle: ComputedRef<Record<string, string>>
  /** Force a synchronous re-measure. */
  update: () => void
}

/**
 * Pins an element past a scroll threshold while keeping its footprint stable.
 *
 * @param options - Threshold offsets, scroll container, and change callback.
 */
export function useAffix(options: UseAffixOptions = {}): UseAffixReturn {
  const rootEl = ref<HTMLElement | null>(null)
  const affixed = ref(false)
  const placeholderSize = ref<PlaceholderSize | null>(null)
  const fixedGeometry = ref<FixedGeometry | null>(null)

  function setRootRef(el: Element | ComponentPublicInstance | null): void {
    rootEl.value = el as HTMLElement | null
  }

  function getTarget(): HTMLElement | Window {
    return options.target?.() ?? window
  }

  function viewportHeight(): number {
    return window.innerHeight || document.documentElement.clientHeight
  }

  function getContainerBounds(target: HTMLElement | Window): { top: number, bottom: number } {
    if (!(target instanceof HTMLElement)) {
      return { top: 0, bottom: viewportHeight() }
    }
    const rect = target.getBoundingClientRect()
    return { top: rect.top, bottom: rect.bottom }
  }

  function update(): void {
    const el = rootEl.value
    if (!el)
      return

    const offsetTop = toValue(options.offsetTop)
    const offsetBottom = toValue(options.offsetBottom)
    // Top pinning is the default behaviour when no offset is configured.
    const useTop = offsetTop != null || offsetBottom == null

    const container = getContainerBounds(getTarget())
    const rect = el.getBoundingClientRect()

    let nextAffixed: boolean
    if (useTop) {
      nextAffixed = rect.top - container.top < (offsetTop ?? 0)
    }
    else {
      nextAffixed = rect.bottom > container.bottom - (offsetBottom ?? 0)
    }

    if (nextAffixed) {
      // Capture the natural size only when entering the affixed state, before
      // the placeholder takes on an explicit (non-collapsing) size.
      if (!affixed.value || placeholderSize.value == null) {
        placeholderSize.value = { width: rect.width, height: rect.height }
      }
      const size = placeholderSize.value
      if (useTop) {
        fixedGeometry.value = {
          top: container.top + (offsetTop ?? 0),
          left: rect.left,
          width: size.width,
        }
      }
      else {
        fixedGeometry.value = {
          bottom: viewportHeight() - container.bottom + (offsetBottom ?? 0),
          left: rect.left,
          width: size.width,
        }
      }
    }
    else {
      placeholderSize.value = null
      fixedGeometry.value = null
    }

    if (nextAffixed !== affixed.value) {
      affixed.value = nextAffixed
      options.onChange?.(nextAffixed)
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

  function attach(): void {
    listenTarget = getTarget()
    listenTarget.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })
    // When pinned to a scroll container, page-level scrolling still moves it.
    if (listenTarget !== window) {
      window.addEventListener('scroll', scheduleUpdate, { passive: true })
    }
  }

  function detach(): void {
    listenTarget?.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
    if (listenTarget && listenTarget !== window) {
      window.removeEventListener('scroll', scheduleUpdate)
    }
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

  // Re-measure (and re-bind to a possibly-new target) when inputs change.
  watch(
    () => [toValue(options.offsetTop), toValue(options.offsetBottom)],
    () => update(),
  )

  const rootStyle = computed((): Record<string, string> => {
    if (affixed.value && placeholderSize.value) {
      return {
        width: `${placeholderSize.value.width}px`,
        height: `${placeholderSize.value.height}px`,
      }
    }
    return {}
  })

  const contentStyle = computed((): Record<string, string> => {
    if (affixed.value && fixedGeometry.value) {
      const geo = fixedGeometry.value
      const style: Record<string, string> = {
        'position': 'fixed',
        'left': `${geo.left}px`,
        'width': `${geo.width}px`,
        'z-index': 'var(--dz-affix-z-index, 10)',
      }
      if (geo.top != null)
        style.top = `${geo.top}px`
      if (geo.bottom != null)
        style.bottom = `${geo.bottom}px`
      return style
    }
    return {}
  })

  return { affixed, setRootRef, rootStyle, contentStyle, update }
}
