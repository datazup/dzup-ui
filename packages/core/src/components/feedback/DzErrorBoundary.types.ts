import type { ComponentPublicInstance } from 'vue'

/** Props for the DzErrorBoundary component */
export interface DzErrorBoundaryProps {
  /**
   * Called with every error the boundary catches, the component instance that
   * threw and Vue's `info` string. Optional; the boundary swaps in the
   * `fallback` slot and stops propagation either way.
   */
  onError?: (err: unknown, instance: ComponentPublicInstance | null, info: string) => void
}

/** Slot definitions for DzErrorBoundary */
export interface DzErrorBoundarySlots {
  /** The guarded content. Replaced by `fallback` the moment a descendant throws during render. */
  default?: () => unknown
  /** Rendered after an error is caught. Receives the error and a `reset` callback that clears it and restores the content. */
  fallback?: (props: { error: unknown, reset: () => void }) => unknown
}
