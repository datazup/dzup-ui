/**
 * useFloating — Composable wrapping @floating-ui/vue for consistent positioning.
 *
 * Provides a unified API for floating element positioning used by
 * DzTooltip, DzPopover, DzDropdownMenu and other overlay components.
 * SSR-safe: positioning only runs in the browser.
 *
 * @module @dzup-ui/core/composables/useFloating
 */

import type { Placement } from '@floating-ui/vue'
import type { ComputedRef, Ref } from 'vue'
import {
  flip as flipMiddleware,
  offset as offsetMiddleware,
  shift as shiftMiddleware,
  useFloating as useFloatingUI,
} from '@floating-ui/vue'
import { computed, ref } from 'vue'

/** Placement options for the floating element */
export type FloatingPlacement
  = | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end'

/** Options for the useFloating composable */
export interface UseFloatingOptions {
  /** Where to place the floating element relative to the reference */
  placement?: FloatingPlacement
  /** Offset distance in pixels from the reference element */
  offset?: number
  /** Whether to flip placement when insufficient space */
  flip?: boolean
  /** Whether to shift along the axis to stay in view */
  shift?: boolean
}

/** Return value of the useFloating composable */
export interface UseFloatingReturn {
  /** Ref to bind to the reference (trigger) element */
  referenceRef: Ref<HTMLElement | null>
  /** Ref to bind to the floating element */
  floatingRef: Ref<HTMLElement | null>
  /** Computed CSS styles to apply to the floating element */
  floatingStyles: ComputedRef<Record<string, string>>
  /** The resolved placement after middleware adjustments */
  placement: Ref<string>
  /** Manually trigger a position recalculation */
  update: () => void
}

/**
 * Wraps `@floating-ui/vue` with sensible defaults for dzup-ui overlay components.
 *
 * @param options - Positioning configuration
 * @returns Refs, styles, and controls for the floating element
 */
export function useFloating(options?: UseFloatingOptions): UseFloatingReturn {
  const {
    placement: initialPlacement = 'bottom',
    offset: offsetValue = 8,
    flip: enableFlip = true,
    shift: enableShift = true,
  } = options ?? {}

  const referenceRef = ref<HTMLElement | null>(null)
  const floatingRef = ref<HTMLElement | null>(null)

  // Build middleware array based on options
  const middleware = [
    offsetMiddleware(offsetValue),
    ...(enableFlip ? [flipMiddleware()] : []),
    ...(enableShift ? [shiftMiddleware()] : []),
  ]

  const { floatingStyles: rawStyles, placement: resolvedPlacement, update } = useFloatingUI(
    referenceRef,
    floatingRef,
    {
      placement: initialPlacement as Placement,
      middleware,
    },
  )

  // Convert CSSProperties to Record<string, string> for consistent typing
  const floatingStyles = computed<Record<string, string>>(() => {
    const styles = rawStyles.value
    const result: Record<string, string> = {}
    if (typeof styles === 'object' && styles !== null) {
      for (const [key, value] of Object.entries(styles)) {
        if (typeof value === 'string') {
          result[key] = value
        }
        else if (typeof value === 'number') {
          result[key] = `${value}px`
        }
      }
    }
    return result
  })

  // Expose placement as a string ref
  const placementRef = computed(() => resolvedPlacement.value as string)

  return {
    referenceRef,
    floatingRef,
    floatingStyles,
    placement: placementRef as unknown as Ref<string>,
    update,
  }
}
