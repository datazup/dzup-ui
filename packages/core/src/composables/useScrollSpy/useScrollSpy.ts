/**
 * useScrollSpy — Track the section currently in view via IntersectionObserver.
 *
 * Observes a reactive list of element ids and reports the topmost one that is
 * intersecting the viewport (adjusted by `offsetTop`). Used by DzAnchor to drive
 * scrollspy active-link highlighting, but generic enough for any in-page TOC.
 *
 * Client-only: the observer is created on mount and is a no-op during SSR or
 * where `IntersectionObserver` is unavailable.
 *
 * @module @dzup-ui/core/composables/useScrollSpy
 */

import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/** Options for the useScrollSpy composable */
export interface UseScrollSpyOptions {
  /** Reactive list of element ids to observe (without the leading `#`) */
  targetIds: Ref<string[]>
  /**
   * Distance (px) from the top of the viewport treated as the "active" line.
   * Mirrors a sticky header height. Defaults to a `ref(0)`.
   */
  offsetTop?: Ref<number>
  /** Called whenever the active target changes due to scrolling */
  onActiveChange?: (id: string | null) => void
}

/** Return value of the useScrollSpy composable */
export interface UseScrollSpyReturn {
  /** Id of the section currently in view (`null` until resolved) */
  activeId: Ref<string | null>
  /** (Re)connect the observer to the current targets — called automatically */
  connect: () => void
  /** Disconnect the observer and clear tracked state */
  disconnect: () => void
}

/**
 * Composable that reports the section currently scrolled into view.
 *
 * @param options - Targets to observe and the active-line offset
 * @returns The reactive `activeId` plus manual connect/disconnect controls
 */
export function useScrollSpy(options: UseScrollSpyOptions): UseScrollSpyReturn {
  const { targetIds, offsetTop = ref(0), onActiveChange } = options

  const activeId = ref<string | null>(null)
  /** Per-target intersection state, keyed by element id */
  const intersecting = new Map<string, boolean>()
  let observer: IntersectionObserver | null = null

  /** Pick the first target (in document/list order) that is intersecting. */
  function resolveActive(): void {
    let next: string | null = null
    for (const id of targetIds.value) {
      if (intersecting.get(id)) {
        next = id
        break
      }
    }
    // Between sections nothing intersects — keep the last resolved value so the
    // active link does not flicker off while scrolling past a gap.
    if (next === null || next === activeId.value)
      return

    activeId.value = next
    onActiveChange?.(next)
  }

  function disconnect(): void {
    observer?.disconnect()
    observer = null
    intersecting.clear()
  }

  function connect(): void {
    disconnect()
    if (typeof IntersectionObserver === 'undefined' || typeof document === 'undefined')
      return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          intersecting.set(entry.target.id, entry.isIntersecting)
        resolveActive()
      },
      {
        // Shrink the observation box: inset the top by the offset and the bottom
        // far up, so a section becomes "active" as its heading nears the top.
        rootMargin: `-${offsetTop.value}px 0px -70% 0px`,
        threshold: 0,
      },
    )

    for (const id of targetIds.value) {
      const el = document.getElementById(id)
      if (el)
        observer.observe(el)
    }
  }

  onMounted(connect)
  onBeforeUnmount(disconnect)

  // Re-observe when the target set or offset changes (flush post so the DOM and
  // any newly-rendered targets exist).
  watch(
    [targetIds, offsetTop],
    () => connect(),
    { flush: 'post', deep: true },
  )

  return { activeId, connect, disconnect }
}
