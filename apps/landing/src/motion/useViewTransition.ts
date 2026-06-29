/**
 * Native-API foundation (docs/animations.md §3.1, §4 — Task N1).
 *
 * A tiny progressive-enhancement layer over the platform motion APIs the gallery
 * now reaches for first: the View Transitions API (SPA), `@starting-style` +
 * `transition-behavior: allow-discrete`, CSS scroll-driven animations, and
 * `interpolate-size: allow-keywords`. Each detector is SSR-safe — it guards
 * `document` / `CSS.supports` so importing this module never touches the DOM at
 * module-evaluation time — and `startViewTransition` always runs the DOM update,
 * so callers get a correct, visible result whether or not the API exists.
 *
 * These helpers UPGRADE existing effects (route/tabs transitions, accordion
 * height, toast entrance); the v1 JS/CSS paths remain the guaranteed floor.
 */

/** The subset of the `ViewTransition` object this layer relies on. */
interface ViewTransitionLike {
  /** Resolves when the update callback's returned promise settles (DOM updated). */
  readonly updateCallbackDone: Promise<void>
}

/** Signature of `document.startViewTransition` (typed locally so this compiles
 *  whether or not the DOM lib ships View Transitions types — Firefox configs). */
type StartViewTransitionFn = (callback: () => void | Promise<void>) => ViewTransitionLike

/**
 * Resolve `document.startViewTransition` when present, else `undefined`. Cast
 * through `unknown` so we neither depend on nor collide with the global DOM
 * typings, and bind it so `this` stays `document`. SSR-safe.
 */
function resolveStartViewTransition(): StartViewTransitionFn | undefined {
  if (typeof document === 'undefined') return undefined
  const doc = document as unknown as { startViewTransition?: StartViewTransitionFn }
  return typeof doc.startViewTransition === 'function'
    ? (doc.startViewTransition.bind(document) as StartViewTransitionFn)
    : undefined
}

/** Options for {@link startViewTransition}. */
export interface StartViewTransitionOptions {
  /**
   * Force the synchronous fallback (run `update()` with no transition). Pass the
   * resolved reduced-motion preference here so callers never animate against the
   * user's wishes, and so an unsupported browser degrades identically.
   */
  skip?: boolean
}

/**
 * `true` when the same-document View Transitions API is available (Chrome 111+,
 * Safari 18+, Firefox 144+). SSR-safe.
 */
export function supportsViewTransitions(): boolean {
  return resolveStartViewTransition() !== undefined
}

/**
 * `true` when `@starting-style` + `transition-behavior: allow-discrete` are
 * supported (they shipped together — Chrome 117+, Safari 17.5+, Firefox 129+).
 * `transition-behavior` is the reliable `CSS.supports` proxy for the pair. SSR-safe.
 */
export function supportsStartingStyle(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('transition-behavior', 'allow-discrete')
  )
}

/**
 * `true` when CSS scroll-driven animations (`animation-timeline: scroll()` /
 * `view()`) are supported (Chrome 115+, Safari 26+; Firefox behind a flag). Not
 * Baseline — always pair with a JS scroll fallback. SSR-safe.
 */
export function supportsScrollTimeline(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('animation-timeline', 'scroll()')
  )
}

/**
 * `true` when `interpolate-size: allow-keywords` is supported (Chromium only),
 * enabling true `height: 0 → auto` animation. Never load-bearing — pair with a
 * measured-dimension / `0fr→1fr` fallback. SSR-safe.
 */
export function supportsInterpolateSize(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('interpolate-size', 'allow-keywords')
  )
}

/**
 * `true` when the HTML Popover API (`popover` attribute + `popovertarget`,
 * top-layer rendering, native light-dismiss + Esc) is supported — Baseline since
 * 2024 (Chrome 114, Safari 17, Firefox 125). Pair with a `<Transition>` fallback
 * for older engines. SSR-safe (guards `HTMLElement`).
 */
export function supportsPopover(): boolean {
  return (
    typeof HTMLElement !== 'undefined' &&
    typeof HTMLElement.prototype === 'object' &&
    'popover' in HTMLElement.prototype
  )
}

/**
 * Run a DOM update inside a View Transition when supported and not skipped,
 * otherwise run it synchronously. The returned promise resolves once the DOM has
 * been updated (NOT when the animation ends), so callers — e.g. a router guard —
 * can sequence work after the swap regardless of which path was taken.
 *
 * ```ts
 * await startViewTransition(() => nextTick(), { skip: reduced.value })
 * ```
 *
 * @param update - mutates the DOM (or returns a promise that does, e.g. `nextTick`).
 * @param opts - `{ skip }` forces the synchronous fallback (reduced motion / unsupported).
 */
export function startViewTransition(
  update: () => void | Promise<void>,
  opts: StartViewTransitionOptions = {},
): Promise<void> {
  const start = opts.skip ? undefined : resolveStartViewTransition()
  if (!start) {
    // Synchronous floor: always run the update so content is never left hidden.
    return Promise.resolve(update())
  }
  return start(update).updateCallbackDone
}
