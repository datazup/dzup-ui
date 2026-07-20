import type { Directive, DirectiveBinding } from 'vue'

/**
 * v-animate-on-scroll — scroll-triggered enter/leave directive (docs/animations.md
 * §3.2, §6 item 3 — Task N2).
 *
 * A PrimeVue-style `v-animateonscroll` for the dzup-ui motion system: it plays an
 * entrance whenever the host scrolls into view by adding the parametric
 * `.dz-animate-in` family from Task N0 (so the entrance is token-only and stacks
 * the orthogonal `.dz-fade-in` / `.dz-slide-in-from-*` composer utilities). When
 * `once` is `false` it also plays a leave (`.dz-animate-out` family) as the host
 * scrolls back out, then re-enters on the next intersection.
 *
 * It mirrors {@link useInView}'s shared-`IntersectionObserver` strategy (observers
 * are pooled per `(root, threshold)` signature so a page of demos attaches only a
 * handful) but is implemented directly rather than via the composable: directive
 * hooks run with no active component instance, so the lifecycle calls inside
 * `useInView` (`onMounted`/`watch`) can't be used here. The class system is the
 * single source of truth (`motion/tokens.css`); this directive only toggles
 * classes + `will-change`, so it stays free of landing-only imports (extractable).
 *
 * Accessibility (§7): under OS `prefers-reduced-motion` the end-state classes are
 * applied immediately on mount with no observer and no leave — the parametric
 * `.dz-animate-in` rule itself degrades to an opacity-only cross-fade in the
 * reduced-motion block of `tokens.css`, so nothing translates/rotates. SSR-safe:
 * with no `IntersectionObserver` the entrance is applied at once (content is never
 * left hidden). Transform/opacity only.
 *
 * Bound value (all optional):
 * - `enterClass` — class string added on intersect (default the `.dz-animate-in`
 *   fade + rise family).
 * - `leaveClass` — class string added on leave when `once` is `false` (default the
 *   matching `.dz-animate-out` family).
 * - `threshold` — visibility ratio that triggers (default `0.1`).
 * - `root` — scroll container to observe within (default the viewport).
 * - `once` — reveal once then stop observing (default `true`).
 *
 * Usage:
 *   `<section v-animate-on-scroll>`                       — default fade + rise
 *   `<div v-animate-on-scroll="{ once: false }">`         — replays on re-entry
 *   `<img v-animate-on-scroll="{ enterClass: 'dz-animate-in dz-zoom-in' }">`
 */

/** Options accepted by {@link vAnimateOnScroll} (the directive's bound value). */
export interface AnimateOnScrollOptions {
  /** Class(es) added when the host scrolls into view. */
  enterClass?: string
  /** Class(es) added when the host scrolls out of view (only when `once` is false). */
  leaveClass?: string
  /** Visibility ratio that triggers the entrance (default `0.1`). */
  threshold?: number
  /** Scroll container to observe within (default the viewport). */
  root?: Element
  /** Reveal once then stop observing (default `true`). */
  once?: boolean
}

/** Default entrance: the parametric fade + rise from Task N0 (token-only). */
const DEFAULT_ENTER = 'dz-animate-in dz-fade-in dz-slide-in-from-bottom'
/** Default exit (used only when `once` is false): the matching leave family. */
const DEFAULT_LEAVE = 'dz-animate-out dz-fade-out dz-slide-out-to-bottom'

/** Per-element state, keyed weakly so detached nodes stay collectable. */
interface ScrollState {
  enter: string[]
  leave: string[]
  once: boolean
  observer: IntersectionObserver | null
}
const states = new WeakMap<HTMLElement, ScrollState>()

/** Per-element intersection callbacks, keyed weakly (the shared-observer registry). */
const callbacks = new WeakMap<Element, (isIntersecting: boolean) => void>()
/** Observers for the default (viewport) root, keyed by threshold. */
const viewportObservers = new Map<number, IntersectionObserver>()
/** Observers for custom roots, keyed by root element then threshold. */
const rootObservers = new WeakMap<Element, Map<number, IntersectionObserver>>()

/** Whether the OS currently requests reduced motion (SSR-safe, like v-tilt). */
function prefersReduced(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Split a class string into a clean token list (`undefined` → `[]`). */
function toClassList(value: string | undefined): string[] {
  return value ? value.split(/\s+/).filter(Boolean) : []
}

/** Resolve (or create) the shared observer for a `(root, threshold)` signature. */
function getObserver(root: Element | undefined, threshold: number): IntersectionObserver | null {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined')
    return null

  const pool = root
    ? (rootObservers.get(root) ?? rootObservers.set(root, new Map()).get(root)!)
    : viewportObservers

  let observer = pool.get(threshold)
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) callbacks.get(entry.target)?.(entry.isIntersecting)
      },
      { root: root ?? null, threshold },
    )
    pool.set(threshold, observer)
  }
  return observer
}

/** Clear `will-change` once the entrance/exit settles, to free GPU layers (§5.3). */
function clearWillChangeAfter(el: HTMLElement): void {
  const done = (): void => {
    el.style.willChange = ''
    el.removeEventListener('animationend', done)
  }
  el.addEventListener('animationend', done)
}

/** Play the entrance: drop any leave classes, set the GPU hint, add enter classes. */
function enter(el: HTMLElement, state: ScrollState): void {
  if (state.leave.length)
    el.classList.remove(...state.leave)
  el.style.willChange = 'opacity, transform'
  el.classList.add(...state.enter)
  clearWillChangeAfter(el)
}

/** Play the exit: drop the enter classes, add leave classes (once === false only). */
function leave(el: HTMLElement, state: ScrollState): void {
  if (state.enter.length)
    el.classList.remove(...state.enter)
  el.style.willChange = 'opacity, transform'
  el.classList.add(...state.leave)
  clearWillChangeAfter(el)
}

export const vAnimateOnScroll: Directive<HTMLElement, AnimateOnScrollOptions | undefined> = {
  mounted(el, binding: DirectiveBinding<AnimateOnScrollOptions | undefined>) {
    const opts = binding.value ?? {}
    const state: ScrollState = {
      enter: toClassList(opts.enterClass ?? DEFAULT_ENTER),
      leave: toClassList(opts.leaveClass ?? DEFAULT_LEAVE),
      once: opts.once ?? true,
      observer: null,
    }
    states.set(el, state)

    // Reduced motion → show the entrance end-state immediately, no observer, no
    // leave. The `.dz-animate-in` rule self-degrades to an opacity-only cross-fade
    // under the reduced-motion block in tokens.css, so nothing translates.
    if (prefersReduced()) {
      el.classList.add(...state.enter)
      return
    }

    const observer = getObserver(opts.root, opts.threshold ?? 0.1)
    if (!observer) {
      // No IntersectionObserver (SSR / old browsers) → reveal at once so content
      // is never left hidden.
      enter(el, state)
      return
    }

    state.observer = observer
    callbacks.set(el, (isIntersecting) => {
      if (isIntersecting) {
        enter(el, state)
        if (state.once) {
          observer.unobserve(el)
          callbacks.delete(el)
        }
      }
      else if (!state.once) {
        leave(el, state)
      }
    })
    observer.observe(el)
  },
  unmounted(el) {
    const state = states.get(el)
    state?.observer?.unobserve(el)
    callbacks.delete(el)
    states.delete(el)
  },
}
