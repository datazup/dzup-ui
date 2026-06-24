import type { Directive, DirectiveBinding } from 'vue'

/**
 * v-magnetic — pointer-driven magnetic directive (docs/animations.md §6.5,
 * effect 22). While a fine pointer hovers the host, the element eases toward the
 * cursor by a fraction of the offset from its centre (clamped to a small radius),
 * then springs back to rest on leave.
 *
 * Transform/opacity only — the offset collapses to one `translate3d` write per
 * frame via `requestAnimationFrame`. The return uses an eased (bouncy) transition.
 *
 * Accessibility / touch guarantees (§6.5, §7):
 * - **Pointer-only.** Attached only on fine-pointer, hover-capable devices; touch
 *   pointer events are ignored. Touch users get the static element.
 * - **Reduced-motion.** Off when the OS sets `prefers-reduced-motion` OR the caller
 *   passes `disabled: true` (wire to the page-level toggle via `useReducedMotion`).
 *   Import-free so it stays extractable; the gallery drives the live toggle.
 * - **Never breaks the click target.** The offset is clamped to a few px and the
 *   element stays under the pointer, so clicks land normally; it eases back to its
 *   exact original box on leave. Keyboard focus is untouched (pointer-only).
 *
 * `will-change: transform` is set while engaged and cleared on leave/unmount.
 *
 * Usage:
 *   `<DzButton v-magnetic>` — defaults (0.4 strength, 18px clamp)
 *   `<DzButton v-magnetic="{ strength: 0.5, radius: 24 }">`
 *   `<DzButton v-magnetic="{ disabled: reduced }">` — reactive reduced-motion
 */

/** Options for {@link vMagnetic}; all optional. */
export interface MagneticOptions {
  /** Fraction of the pointer offset the element follows (default `0.4`). */
  strength?: number
  /** Maximum offset from rest in px on each axis (default `18`). */
  radius?: number
  /** Force the static, un-magnetised state (e.g. page-level reduced motion). */
  disabled?: boolean
}

interface MagneticState {
  options: Required<Omit<MagneticOptions, 'disabled'>>
  frame: number
  nextX: number
  nextY: number
  engaged: boolean
  attached: boolean
  onMove: (event: PointerEvent) => void
  onLeave: () => void
}

const DEFAULTS: Required<Omit<MagneticOptions, 'disabled'>> = {
  strength: 0.4,
  radius: 18,
}

const states = new WeakMap<HTMLElement, MagneticState>()

/** Whether the OS currently requests reduced motion (SSR-safe). */
function prefersReduced(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Whether the device has a fine, hover-capable pointer (SSR-safe). */
function canHover(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function parseOptions(value: MagneticOptions | undefined): Required<Omit<MagneticOptions, 'disabled'>> {
  return {
    strength: value?.strength ?? DEFAULTS.strength,
    radius: value?.radius ?? DEFAULTS.radius,
  }
}

function clamp(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value))
}

function shouldRun(binding: DirectiveBinding<MagneticOptions | undefined>): boolean {
  return !binding.value?.disabled && !prefersReduced() && canHover()
}

function applyFrame(el: HTMLElement, state: MagneticState): void {
  state.frame = 0
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const { strength, radius } = state.options
  const dx = clamp((state.nextX - cx) * strength, radius)
  const dy = clamp((state.nextY - cy) * strength, radius)
  el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
}

function attach(el: HTMLElement, state: MagneticState): void {
  if (state.attached) return

  state.onMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return
    state.nextX = event.clientX
    state.nextY = event.clientY
    if (!state.engaged) {
      state.engaged = true
      // Kill the spring-back transition while tracking for a crisp follow.
      el.style.transition = 'none'
      el.style.willChange = 'transform'
    }
    if (!state.frame) state.frame = requestAnimationFrame(() => applyFrame(el, state))
  }

  state.onLeave = (): void => {
    state.engaged = false
    if (state.frame) {
      cancelAnimationFrame(state.frame)
      state.frame = 0
    }
    // Spring back to the exact rest position with a bouncy ease.
    el.style.transition = `transform var(--dz-duration-normal, 200ms) var(--dz-ease-bounce, cubic-bezier(0.68, -0.55, 0.27, 1.55))`
    el.style.transform = 'translate3d(0, 0, 0)'
    const done = (): void => {
      el.style.willChange = ''
      el.removeEventListener('transitionend', done)
    }
    el.addEventListener('transitionend', done)
  }

  el.addEventListener('pointermove', state.onMove)
  el.addEventListener('pointerleave', state.onLeave)
  state.attached = true
}

function detach(el: HTMLElement, state: MagneticState): void {
  if (!state.attached) return
  el.removeEventListener('pointermove', state.onMove)
  el.removeEventListener('pointerleave', state.onLeave)
  if (state.frame) {
    cancelAnimationFrame(state.frame)
    state.frame = 0
  }
  state.engaged = false
  el.style.transform = ''
  el.style.transition = ''
  el.style.willChange = ''
  state.attached = false
}

export const vMagnetic: Directive<HTMLElement, MagneticOptions | undefined> = {
  mounted(el, binding) {
    const state: MagneticState = {
      options: parseOptions(binding.value),
      frame: 0,
      nextX: 0,
      nextY: 0,
      engaged: false,
      attached: false,
      onMove: () => {},
      onLeave: () => {},
    }
    states.set(el, state)
    if (shouldRun(binding)) attach(el, state)
  },
  updated(el, binding) {
    const state = states.get(el)
    if (!state) return
    state.options = parseOptions(binding.value)
    if (shouldRun(binding)) attach(el, state)
    else detach(el, state)
  },
  unmounted(el) {
    const state = states.get(el)
    if (!state) return
    detach(el, state)
    states.delete(el)
  },
}
