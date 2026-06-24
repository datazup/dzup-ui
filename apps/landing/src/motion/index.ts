/**
 * @dzup-ui landing motion module (docs/animations.md §5).
 *
 * Self-contained barrel for the animation primitives that power the
 * `/animations` gallery. Authored with no landing-only imports so it can later
 * be lifted into a published `@dzup-ui/motion` package without rewrites.
 *
 * Note: `tokens.css` (keyframes + --dz-anim-* constants) is a side-effect import
 * wired from `src/main.ts`, not re-exported here.
 */

export { provideMotionPreference, useReducedMotion } from './useReducedMotion.ts'
export { useInView } from './useInView.ts'
export type { UseInViewOptions } from './useInView.ts'
export { useScrollProgress } from './useScrollProgress.ts'

// Scroll-reveal family (docs/animations.md §6.1) — directive + component wrappers
// over the shared `.dz-reveal` class system in tokens.css.
export { vReveal } from './directives/reveal.ts'
export { default as DzReveal } from './components/DzReveal.vue'
export { default as DzStagger } from './components/DzStagger.vue'

// Text-effect family (docs/animations.md §6.2) — gradient sweep, typewriter,
// word stagger, letter decode (highlight sweep is the `.dz-highlight-sweep`
// CSS utility in tokens.css).
export { default as DzGradientText } from './components/DzGradientText.vue'
export { default as DzTypewriter } from './components/DzTypewriter.vue'
export { default as DzWordReveal } from './components/DzWordReveal.vue'
export { default as DzTextDecode } from './components/DzTextDecode.vue'
export { useTypewriter } from './useTypewriter.ts'
export type { UseTypewriterOptions, UseTypewriterReturn } from './useTypewriter.ts'
export { useTextDecode } from './useTextDecode.ts'
export type { UseTextDecodeOptions, UseTextDecodeReturn } from './useTextDecode.ts'

// Backgrounds & hero family (docs/animations.md §6.4) — aurora drift (15) and
// the cursor-follow spotlight (17) are components; animated grid/dots (16) and
// gradient border glow (18) are the `.dz-anim-grid` / `.dz-anim-border-glow` CSS
// utilities in tokens.css.
export { default as DzAurora } from './components/DzAurora.vue'
export { default as DzSpotlight } from './components/DzSpotlight.vue'

// Numbers & data family (docs/animations.md §6.3) — in-view count-up over core's
// DzAnimatedNumber. Progress fill (13) and rating fill (14) compose useInView +
// useReducedMotion directly over core's DzProgress / DzRating, so they need no
// dedicated wrapper export.
export { default as DzCountUp } from './components/DzCountUp.vue'

// Hover micro-interactions family (docs/animations.md §6.5) — pointer-driven
// tilt (20) and magnetic (22) directives + the border-beam (23) component. Card
// lift + glow (19) and sheen sweep (21) are the `.dz-card-lift` / `.dz-sheen`
// CSS utilities in tokens.css.
export { vTilt } from './directives/tilt.ts'
export type { TiltOptions } from './directives/tilt.ts'
export { vMagnetic } from './directives/magnetic.ts'
export type { MagneticOptions } from './directives/magnetic.ts'
export { default as DzBorderBeam } from './components/DzBorderBeam.vue'

// Lists, collections & attention family (docs/animations.md §6.6–6.7) — the
// infinite marquee (25), flip-on-change (26) and shimmer overlay (28) are
// components. Stagger list-in (24) reuses DzStagger; pulse/ping (27) is the
// `.dz-ping` CSS utility in tokens.css; toast slide-in (29) composes core's
// DzToast directly, so neither needs a dedicated wrapper export.
export { default as DzMarquee } from './components/DzMarquee.vue'
export { default as DzFlip } from './components/DzFlip.vue'
export { default as DzShimmer } from './components/DzShimmer.vue'
