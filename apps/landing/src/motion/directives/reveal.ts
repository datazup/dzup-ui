import type { Directive, DirectiveBinding } from 'vue'

/**
 * v-reveal — scroll-reveal directive (docs/animations.md §6.1, effects 1, 3–5).
 *
 * Adds the `dz-reveal` class immediately (so the element starts in its hidden
 * pre-animation state) and toggles `dz-reveal--in` via a single shared
 * `IntersectionObserver` when the element scrolls into view. The shared class
 * system lives in `motion/tokens.css`; this directive only orchestrates classes
 * and `will-change` so it stays free of landing-only imports (extractable).
 *
 * Modifiers (compose freely):
 * - `.up` / `.down` / `.left` / `.right` — directional slide-in (effect 3)
 * - `.blur` — blur-in (effect 4)
 * - `.scale` — scale-in (effect 5)
 *
 * Value: an optional numeric stagger delay in ms, exposed to CSS as
 * `--reveal-delay` (preserves the original directive's behaviour).
 *
 * Transform/opacity/filter only — no layout thrash. Reduced motion is handled
 * centrally by the `@media (prefers-reduced-motion: reduce)` block in
 * `tokens.css`, which degrades the reveal to an opacity-only fade. Content is
 * never blocked: when `IntersectionObserver` is unavailable we reveal at once.
 *
 * Usage: `<section v-reveal>`, `<div v-reveal="80">` (80ms delay),
 * `<img v-reveal.left.blur>`.
 */

const MODIFIER_CLASSES: Record<string, string> = {
  up: 'dz-reveal--up',
  down: 'dz-reveal--down',
  left: 'dz-reveal--left',
  right: 'dz-reveal--right',
  blur: 'dz-reveal--blur',
  scale: 'dz-reveal--scale',
}

let observer: IntersectionObserver | null = null

/** Clear `will-change` once the reveal transition has played, to free GPU layers. */
function clearWillChangeAfterTransition(el: HTMLElement): void {
  const done = (): void => {
    el.style.willChange = ''
    el.removeEventListener('transitionend', done)
  }
  el.addEventListener('transitionend', done)
}

function reveal(el: HTMLElement): void {
  // will-change is set on entrance and cleared after (perf budget §5.3).
  el.style.willChange = 'opacity, transform, filter'
  el.classList.add('dz-reveal--in')
  clearWillChangeAfterTransition(el)
}

function getObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined')
    return null
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement)
            observer?.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    )
  }
  return observer
}

function applyModifiers(el: HTMLElement, binding: DirectiveBinding): void {
  for (const key of Object.keys(binding.modifiers)) {
    const cls = MODIFIER_CLASSES[key]
    if (cls)
      el.classList.add(cls)
  }
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (typeof binding.value === 'number' && binding.value > 0) {
      el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    }
    el.classList.add('dz-reveal')
    applyModifiers(el, binding)

    const io = getObserver()
    if (!io) {
      // No IntersectionObserver → reveal immediately so content is never hidden.
      reveal(el)
      return
    }
    io.observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
