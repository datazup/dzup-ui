import type { ComponentPublicInstance, Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * useLazyMount — gate a heavy subtree on proximity to the viewport.
 *
 * A single per-element `IntersectionObserver` flips `shouldRender` to `true`
 * the first time the watched element nears a `rootMargin`-expanded viewport,
 * then unobserves (it never flips back — once mounted, content stays mounted).
 * Attach the returned `el` ref to a lightweight placeholder; swap in the real
 * subtree once `shouldRender` is set.
 *
 * Designed for `/blocks` (docs/blocks.md §1.3 "Performance"): a 13-block `forms`
 * category should not mount 13 live `BlockPreview`s at once. We mount each
 * preview a screen before it scrolls in, showing a DzSkeleton until then.
 *
 * Content is **never** hidden in degraded environments: with no `window` (SSR)
 * or no `IntersectionObserver`, or when `eager` is set (deep-link / palette
 * target), we render immediately rather than wait for an observer that will
 * never fire.
 */
export interface UseLazyMountOptions {
  /**
   * Expand the viewport so the subtree mounts *before* it scrolls into view,
   * hiding the mount cost behind the scroll. ~one screen ahead by default.
   */
  rootMargin?: string
  /** Intersection ratio that counts as "near" (0 = any pixel). */
  threshold?: number
  /**
   * Render immediately, skipping observation entirely. Read once on mount —
   * use it for the SSR/no-IO fallback and for an initial deep-link target whose
   * element must exist right away.
   */
  eager?: boolean
}

export interface UseLazyMount {
  /**
   * Callback ref — bind via `:ref="setEl"` to the element whose viewport
   * proximity gates the mount. A callback (not a bare ref) so it works cleanly
   * with `<script setup>` template-ref auto-unwrapping.
   */
  setEl: (node: Element | ComponentPublicInstance | null) => void
  /** `false` until the element nears the viewport; never flips back. */
  shouldRender: Ref<boolean>
}

export function useLazyMount(options: UseLazyMountOptions = {}): UseLazyMount {
  const { rootMargin = '600px 0px', threshold = 0, eager = false } = options
  const el = ref<HTMLElement | null>(null)
  const shouldRender = ref(false)

  let observer: IntersectionObserver | null = null

  function setEl(node: Element | ComponentPublicInstance | null): void {
    el.value = node instanceof HTMLElement ? node : null
    if (observer && el.value)
      observer.observe(el.value)
  }

  function disconnect(): void {
    observer?.disconnect()
    observer = null
  }

  function mountNow(): void {
    shouldRender.value = true
    disconnect()
  }

  onMounted(() => {
    // Eager / SSR / no-IO → render at once so content is never withheld.
    if (eager || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      mountNow()
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(entry => entry.isIntersecting))
          mountNow()
      },
      { rootMargin, threshold },
    )
    if (el.value)
      observer.observe(el.value)
  })

  onBeforeUnmount(disconnect)

  return { setEl, shouldRender }
}
