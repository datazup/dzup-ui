import type { Directive, DirectiveBinding } from 'vue'

/**
 * v-tilt — pointer-driven 3D tilt directive (docs/animations.md §6.5, effect 20).
 *
 * The host rotates toward the pointer (rotateX/rotateY around its centre) with a
 * configurable perspective and an optional glare highlight. Transform/opacity
 * only — pointer position collapses to one `transform` write per frame via
 * `requestAnimationFrame`, regardless of pointer-event rate.
 *
 * Accessibility / touch guarantees (§6.5, §7):
 * - **Pointer-only.** Listeners are attached only on fine-pointer, hover-capable
 *   devices (`(hover: hover) and (pointer: fine)`); touch pointer events are
 *   ignored. Touch users get the resting, untilted state.
 * - **Reduced-motion.** Disabled when the OS sets `prefers-reduced-motion` OR the
 *   caller passes `disabled: true` (wire this to the page-level toggle via
 *   `useReducedMotion`). The directive stays import-free so it remains
 *   extractable; the gallery drives the live toggle through the `disabled` option.
 * - **Never moves the click/focus target.** Tilt is a rotation around the host's
 *   own centre — the element keeps its box, so clicks and keyboard focus land
 *   exactly as before. The optional glare overlay is `aria-hidden` and
 *   `pointer-events: none`.
 *
 * `will-change: transform` is set while engaged and cleared on leave/unmount.
 *
 * Usage:
 *   `<DzCard v-tilt>` — defaults (10° max, 600px perspective, no glare)
 *   `<DzCard v-tilt="{ max: 14, glare: true }">`
 *   `<DzCard v-tilt="{ disabled: reduced }">` — reactive page-level reduced-motion
 */

/** Options for {@link vTilt}; all optional. */
export interface TiltOptions {
  /** Maximum rotation in degrees on each axis (default `10`). */
  max?: number
  /** Perspective depth in px (default `--dz-anim-tilt-perspective`, 600). */
  perspective?: number
  /** Hover scale applied alongside the tilt (default `1`, i.e. none). */
  scale?: number
  /** Append a cursor-tracking glare highlight overlay (default `false`). */
  glare?: boolean
  /** Force the resting, untilted state (e.g. page-level reduced motion). */
  disabled?: boolean
}

interface TiltState {
  options: Required<Omit<TiltOptions, 'disabled'>>
  glare: HTMLElement | null
  frame: number
  nextX: number
  nextY: number
  attached: boolean
  onMove: (event: PointerEvent) => void
  onLeave: () => void
}

const DEFAULTS: Required<Omit<TiltOptions, 'disabled'>> = {
  max: 10,
  perspective: 600,
  scale: 1,
  glare: false,
}

const states = new WeakMap<HTMLElement, TiltState>()

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

function parseOptions(value: TiltOptions | undefined): Required<Omit<TiltOptions, 'disabled'>> {
  return {
    max: value?.max ?? DEFAULTS.max,
    perspective: value?.perspective ?? DEFAULTS.perspective,
    scale: value?.scale ?? DEFAULTS.scale,
    glare: value?.glare ?? DEFAULTS.glare,
  }
}

function restingTransform(perspective: number): string {
  return `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`
}

/** Whether tilt should run for this binding (touch / reduced-motion gate it off). */
function shouldRun(binding: DirectiveBinding<TiltOptions | undefined>): boolean {
  return !binding.value?.disabled && !prefersReduced() && canHover()
}

function applyFrame(el: HTMLElement, state: TiltState): void {
  state.frame = 0
  const rect = el.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  // Pointer position normalised to 0–1 across the host.
  const px = (state.nextX - rect.left) / rect.width
  const py = (state.nextY - rect.top) / rect.height
  const { max, perspective, scale } = state.options
  const rotateX = (0.5 - py) * 2 * max
  const rotateY = (px - 0.5) * 2 * max
  el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
  if (state.glare) {
    state.glare.style.setProperty('--dz-tilt-glare-x', `${px * 100}%`)
    state.glare.style.setProperty('--dz-tilt-glare-y', `${py * 100}%`)
  }
}

function createGlare(el: HTMLElement): HTMLElement {
  // Host must establish a stacking/positioning context for the absolute overlay.
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
  const glare = document.createElement('span')
  glare.className = 'dz-tilt__glare'
  glare.setAttribute('aria-hidden', 'true')
  el.appendChild(glare)
  return glare
}

function attach(el: HTMLElement, state: TiltState): void {
  if (state.attached) return
  el.classList.add('dz-tilt')
  if (state.options.glare && !state.glare) state.glare = createGlare(el)

  state.onMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return
    state.nextX = event.clientX
    state.nextY = event.clientY
    if (!state.frame) {
      // First move of an engagement: kill the return transition for a crisp track.
      el.style.transition = 'none'
      el.style.willChange = 'transform'
      state.glare?.classList.add('dz-tilt__glare--active')
    }
    if (!state.frame) state.frame = requestAnimationFrame(() => applyFrame(el, state))
  }

  state.onLeave = (): void => {
    if (state.frame) {
      cancelAnimationFrame(state.frame)
      state.frame = 0
    }
    // Spring back to rest with an eased transition, then drop the GPU hint.
    el.style.transition = `transform var(--dz-duration-normal, 200ms) var(--dz-ease-out, ease-out)`
    el.style.transform = restingTransform(state.options.perspective)
    state.glare?.classList.remove('dz-tilt__glare--active')
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

function detach(el: HTMLElement, state: TiltState): void {
  if (!state.attached) return
  el.removeEventListener('pointermove', state.onMove)
  el.removeEventListener('pointerleave', state.onLeave)
  if (state.frame) {
    cancelAnimationFrame(state.frame)
    state.frame = 0
  }
  // Reset to the untilted resting state.
  el.style.transform = ''
  el.style.transition = ''
  el.style.willChange = ''
  state.glare?.classList.remove('dz-tilt__glare--active')
  state.attached = false
}

export const vTilt: Directive<HTMLElement, TiltOptions | undefined> = {
  mounted(el, binding) {
    const state: TiltState = {
      options: parseOptions(binding.value),
      glare: null,
      frame: 0,
      nextX: 0,
      nextY: 0,
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
    // React to the page-level reduced-motion toggle flipping `disabled`.
    if (shouldRun(binding)) attach(el, state)
    else detach(el, state)
  },
  unmounted(el) {
    const state = states.get(el)
    if (!state) return
    detach(el, state)
    state.glare?.remove()
    states.delete(el)
  },
}
