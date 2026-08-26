import type { MaybeRefOrGetter, Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

/**
 * useParallax — pointer-driven parallax input (docs/landing-v2.md TASK-LV2-02).
 *
 * Tracks the pointer over a source element (or the whole viewport) and exposes a
 * normalised, clamped `{ x, y }` in -1..1, centred on the source. It is an
 * input primitive: it never writes a transform itself — `DzParallax` (or any
 * consumer) maps the values onto layers. Pairs with `--dz-anim-parallax-range`
 * in `tokens.css`.
 *
 * Contract (same as the pointer directives, `directives/tilt.ts`):
 * - **Pointer-only.** Attaches only on `(hover: hover) and (pointer: fine)`
 *   devices; touch users keep the resting `{0, 0}`.
 * - **Reduced-motion.** Never attaches when the OS requests reduced motion, and
 *   detaches (resetting to `{0, 0}`) when the reactive `disabled` option turns
 *   on — wire it to `useReducedMotion` for the page-level toggle.
 * - **One rAF write per frame.** Any number of pointer events collapse into a
 *   single reactive write per animation frame.
 * - **Leak-free & SSR-safe.** No `window` at import time; listeners and any
 *   pending frame are removed on unmount and on `stop()`.
 */

export interface ParallaxOptions {
  /**
   * Where pointer position is read from:
   * - `'self'` (default) — normalised against the target element's own box;
   * - `'viewport'` — normalised against the window, for hero-scale fields that
   *   should respond while the pointer is anywhere on screen.
   */
  source?: 'self' | 'viewport'
  /**
   * Reactive off-switch (e.g. `useReducedMotion()`); when it becomes `true` the
   * listeners detach and the output resets to the resting `{0, 0}`.
   */
  disabled?: MaybeRefOrGetter<boolean>
}

export interface ParallaxHandle {
  /** Normalised horizontal pointer offset, -1 (left edge) to 1 (right edge). */
  x: Readonly<Ref<number>>
  /** Normalised vertical pointer offset, -1 (top edge) to 1 (bottom edge). */
  y: Readonly<Ref<number>>
  /** Detach listeners and reset to resting; idempotent. */
  stop: () => void
}

/** Whether the OS currently requests reduced motion (SSR-safe). */
function prefersReduced(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Whether the device has a fine, hover-capable pointer (SSR-safe). */
function canHover(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function clamp(value: number): number {
  return Math.min(1, Math.max(-1, value))
}

export function useParallax(
  target: Ref<HTMLElement | null>,
  options: ParallaxOptions = {},
): ParallaxHandle {
  const x = ref(0)
  const y = ref(0)

  let attached = false
  let frame = 0
  let nextX = 0
  let nextY = 0

  function applyFrame(): void {
    frame = 0
    x.value = nextX
    y.value = nextY
  }

  function onMove(event: PointerEvent): void {
    if (options.source === 'viewport') {
      nextX = clamp((event.clientX / window.innerWidth) * 2 - 1)
      nextY = clamp((event.clientY / window.innerHeight) * 2 - 1)
    }
    else {
      const el = target.value
      if (!el)
        return
      const rect = el.getBoundingClientRect()
      if (!rect.width || !rect.height)
        return
      nextX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1)
      nextY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1)
    }
    // Collapse any number of pointer events into one reactive write per frame.
    if (!frame)
      frame = requestAnimationFrame(applyFrame)
  }

  function onLeave(): void {
    nextX = 0
    nextY = 0
    if (!frame)
      frame = requestAnimationFrame(applyFrame)
  }

  function listenTarget(): EventTarget | null {
    if (options.source === 'viewport')
      return typeof window === 'undefined' ? null : window
    return target.value
  }

  function attach(): void {
    if (attached || toValue(options.disabled ?? false) || prefersReduced() || !canHover())
      return
    const host = listenTarget()
    if (!host)
      return
    host.addEventListener('pointermove', onMove as EventListener)
    host.addEventListener('pointerleave', onLeave)
    attached = true
  }

  function detach(): void {
    if (!attached)
      return
    const host = listenTarget()
    host?.removeEventListener('pointermove', onMove as EventListener)
    host?.removeEventListener('pointerleave', onLeave)
    attached = false
  }

  function stop(): void {
    detach()
    if (frame) {
      cancelAnimationFrame(frame)
      frame = 0
    }
    nextX = 0
    nextY = 0
    x.value = 0
    y.value = 0
  }

  onMounted(attach)
  onBeforeUnmount(stop)

  if (options.disabled !== undefined) {
    watch(() => toValue(options.disabled!), (off) => {
      if (off)
        stop()
      else
        attach()
    })
  }

  return { x, y, stop }
}
