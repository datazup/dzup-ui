/**
 * useCollapse — Composable for animated expand/collapse behavior.
 *
 * Manages height transitions for collapsible content sections.
 *
 * @module @dzip-ui/core/composables/useCollapse
 */

import type { Ref } from 'vue'
import { nextTick, ref, watch } from 'vue'

/** Options for the useCollapse composable */
export interface UseCollapseOptions {
  /** Whether the section is expanded */
  expanded: Ref<boolean>
  /** Animation duration in milliseconds */
  duration?: number
}

/** Return value of the useCollapse composable */
export interface UseCollapseReturn {
  /** Reference to bind to the collapsible content element */
  contentRef: Ref<HTMLElement | null>
  /** Current height style value */
  contentStyle: Ref<Record<string, string>>
  /** Whether the collapse animation is currently running */
  isAnimating: Ref<boolean>
}

/**
 * Composable for managing animated expand/collapse transitions.
 *
 * @param options - Configuration for the collapse behavior
 * @returns Refs and styles to bind to the collapsible element
 */
export function useCollapse(options: UseCollapseOptions): UseCollapseReturn {
  const { expanded, duration = 200 } = options

  const contentRef = ref<HTMLElement | null>(null)
  const isAnimating = ref(false)
  const contentStyle = ref<Record<string, string>>({
    overflow: 'hidden',
    height: expanded.value ? 'auto' : '0px',
    transition: `height ${duration}ms ease-in-out`,
  })

  watch(expanded, async (isExpanded) => {
    const el = contentRef.value
    if (!el)
      return

    isAnimating.value = true

    if (isExpanded) {
      // Expanding: set from 0 to scrollHeight, then auto
      contentStyle.value = {
        overflow: 'hidden',
        height: '0px',
        transition: `height ${duration}ms ease-in-out`,
      }
      await nextTick()
      contentStyle.value = {
        overflow: 'hidden',
        height: `${el.scrollHeight}px`,
        transition: `height ${duration}ms ease-in-out`,
      }
      setTimeout(() => {
        contentStyle.value = {
          overflow: 'visible',
          height: 'auto',
          transition: `height ${duration}ms ease-in-out`,
        }
        isAnimating.value = false
      }, duration)
    }
    else {
      // Collapsing: set to scrollHeight first, then 0
      contentStyle.value = {
        overflow: 'hidden',
        height: `${el.scrollHeight}px`,
        transition: `height ${duration}ms ease-in-out`,
      }
      // Force a reflow before transitioning to 0
      void el.offsetHeight
      await nextTick()
      contentStyle.value = {
        overflow: 'hidden',
        height: '0px',
        transition: `height ${duration}ms ease-in-out`,
      }
      setTimeout(() => {
        isAnimating.value = false
      }, duration)
    }
  })

  return {
    contentRef,
    contentStyle,
    isAnimating,
  }
}
