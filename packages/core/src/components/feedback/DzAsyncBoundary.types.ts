import type { ComponentPublicInstance } from 'vue'

/** Props for the DzAsyncBoundary component */
export interface DzAsyncBoundaryProps {
  /**
   * Called for every error the boundary catches — a rejected `<Suspense>` child
   * (`info` is `"Suspense"`, `instance` is `null`) and a synchronous render
   * error from any descendant. Optional; the boundary shows the `error` slot
   * and stops propagation either way.
   */
  onError?: (err: unknown, instance: ComponentPublicInstance | null, info: string) => void
  /**
   * Milliseconds to wait after the default slot suspends before emitting
   * `timeout`. The timer is cleared when the child resolves. `undefined` (the
   * default) never times out; the event is a notification only — nothing about
   * the rendering changes when it fires.
   */
  timeout?: number
  /**
   * Declared and accepted, but **not read by the component**: there is no code
   * path in `DzAsyncBoundary.vue` that uses it, so setting it has no effect
   * today. Owner decision D52 (TASK-R5-O8) settles whether to implement the
   * intended "wait this long before showing the loading slot" behaviour or to
   * withdraw the prop.
   */
  delay?: number
}

/** Events emitted by DzAsyncBoundary */
export interface DzAsyncBoundaryEmits {
  /** Emitted once when the default slot has been suspended for `timeout` ms. Carries no payload and changes nothing on screen. */
  timeout: []
}

/** Slot definitions for DzAsyncBoundary */
export interface DzAsyncBoundarySlots {
  /** The async content. Rendered inside `<Suspense>`; while it suspends the `loading` slot shows in its place. */
  default?: () => unknown
  /** Shown while the default slot is suspended. A `DzSpinner` when this slot is not filled. */
  loading?: () => unknown
  /** Replaces the content once an error is caught. Receives the error and a `reset` callback that clears it. */
  error?: (props: { error: unknown, reset: () => void }) => unknown
}
