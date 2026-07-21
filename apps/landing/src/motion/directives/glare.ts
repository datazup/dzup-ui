import type { Directive, DirectiveBinding } from 'vue'

/**
 * v-glare — pointer-tracked specular highlight directive (docs/animations.md
 * §5.5, effect 48). A glossy reflection follows the pointer across the host's
 * surface via an `aria-hidden`, non-interactive overlay. This is the standalone
 * counterpart to `v-tilt`'s `glare` option — the gloss with no rotation — so it
 * can dress a flat `DzCard` / `DzImageCard` on its own.
 *
 * Opacity/`background-position` only — the pointer position collapses to one
 * write per frame via `requestAnimationFrame`, regardless of pointer-event rate.
 *
 * Accessibility / touch guarantees (§5.5, §7):
 * - **Pointer-only.** Listeners attach only on fine-pointer, hover-capable
 *   devices; touch pointer events are ignored. Touch users get a flat surface.
 * - **Reduced-motion.** Off when the OS sets `prefers-reduced-motion` OR the
 *   caller passes `disabled: true` (wire to the page-level toggle via
 *   `useReducedMotion`). Import-free so it stays extractable.
 * - **Never moves the click/focus target.** The glare is an absolutely-positioned
 *   overlay with `pointer-events: none`; the host box is untouched, so clicks and
 *   keyboard focus land exactly as before.
 *
 * Usage:
 *   <DzCard v-glare>…</DzCard>
 *   <DzImageCard v-glare="{ disabled: reduced }" :src="…" alt="…" />
 */

/** Options for {@link vGlare}; all optional. */
export interface GlareOptions {
  /** Force the flat, un-glared state (e.g. page-level reduced motion). */
  disabled?: boolean
}

interface GlareState {
  glare: HTMLElement | null
  frame: number
  nextX: number
  nextY: number
  attached: boolean
  onMove: (event: PointerEvent) => void
  onLeave: () => void
}

const states = new WeakMap<HTMLElement, GlareState>()

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

function shouldRun(binding: DirectiveBinding<GlareOptions | undefined>): boolean {
  return !binding.value?.disabled && !prefersReduced() && canHover()
}

function applyFrame(el: HTMLElement, state: GlareState): void {
  state.frame = 0
  if (!state.glare)
    return
  const rect = el.getBoundingClientRect()
  if (!rect.width || !rect.height)
    return
  const px = (state.nextX - rect.left) / rect.width
  const py = (state.nextY - rect.top) / rect.height
  state.glare.style.setProperty('--dz-glare-x', `${(px * 100).toFixed(2)}%`)
  state.glare.style.setProperty('--dz-glare-y', `${(py * 100).toFixed(2)}%`)
}

function createGlare(el: HTMLElement): HTMLElement {
  // Host must establish a positioning context for the absolute overlay.
  if (getComputedStyle(el).position === 'static')
    el.style.position = 'relative'
  const glare = document.createElement('span')
  glare.className = 'dz-glare'
  glare.setAttribute('aria-hidden', 'true')
  el.appendChild(glare)
  return glare
}

function attach(el: HTMLElement, state: GlareState): void {
  if (state.attached)
    return
  if (!state.glare)
    state.glare = createGlare(el)

  state.onMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch')
      return
    state.nextX = event.clientX
    state.nextY = event.clientY
    state.glare?.classList.add('dz-glare--active')
    if (!state.frame)
      state.frame = requestAnimationFrame(() => applyFrame(el, state))
  }

  state.onLeave = (): void => {
    if (state.frame) {
      cancelAnimationFrame(state.frame)
      state.frame = 0
    }
    state.glare?.classList.remove('dz-glare--active')
  }

  el.addEventListener('pointermove', state.onMove)
  el.addEventListener('pointerleave', state.onLeave)
  state.attached = true
}

function detach(el: HTMLElement, state: GlareState): void {
  if (!state.attached)
    return
  el.removeEventListener('pointermove', state.onMove)
  el.removeEventListener('pointerleave', state.onLeave)
  if (state.frame) {
    cancelAnimationFrame(state.frame)
    state.frame = 0
  }
  state.glare?.classList.remove('dz-glare--active')
  state.attached = false
}

export const vGlare: Directive<HTMLElement, GlareOptions | undefined> = {
  mounted(el, binding) {
    const state: GlareState = {
      glare: null,
      frame: 0,
      nextX: 0,
      nextY: 0,
      attached: false,
      onMove: () => {},
      onLeave: () => {},
    }
    states.set(el, state)
    if (shouldRun(binding))
      attach(el, state)
  },
  updated(el, binding) {
    const state = states.get(el)
    if (!state)
      return
    // React to the page-level reduced-motion toggle flipping `disabled`.
    if (shouldRun(binding))
      attach(el, state)
    else detach(el, state)
  },
  unmounted(el) {
    const state = states.get(el)
    if (!state)
      return
    detach(el, state)
    state.glare?.remove()
    states.delete(el)
  },
}
