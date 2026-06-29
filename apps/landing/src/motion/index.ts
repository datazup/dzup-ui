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
export { useSticky } from './useSticky.ts'

// Parametric enter/leave system (docs/animations.md §3.2) — typed builder for
// the `--dz-enter-*` custom props read by the `.dz-animate-in/out` utilities in
// tokens.css. Token-only foundation consumed by the entrance demos (Tasks N3–N9).
export { enterStyle } from './useEnter.ts'
export type { EnterCustomProperty, EnterStyle, EnterStyleOptions } from './useEnter.ts'

// Native-API foundation (docs/animations.md §3.1, §4 — Task N1) — a feature-
// detect + View Transitions wrapper that UPGRADES the route/tabs/accordion/toast
// transitions where the platform supports it, with the v1 JS/CSS paths as the
// guaranteed floor. SSR-safe detectors (guard document/CSS.supports).
export { startViewTransition } from './useViewTransition.ts'
export type { StartViewTransitionOptions } from './useViewTransition.ts'
export {
  supportsViewTransitions,
  supportsStartingStyle,
  supportsScrollTimeline,
  supportsInterpolateSize,
  supportsPopover,
} from './useViewTransition.ts'

// Scroll-reveal family (docs/animations.md §6.1) — directive + component wrappers
// over the shared `.dz-reveal` class system in tokens.css.
export { vReveal } from './directives/reveal.ts'
export { default as DzReveal } from './components/DzReveal.vue'
export { default as DzStagger } from './components/DzStagger.vue'

// Ergonomic layers (docs/animations.md §3.2, §3.4, §6 item 3 — Task N2).
// - v-animate-on-scroll: PrimeVue-style scroll-triggered enter/leave directive
//   that plays the parametric `.dz-animate-in/out` family (Task N0) on view.
// - v-auto-animate / useAutoAnimate: thin re-exports of @formkit/auto-animate's
//   one-line add/remove/move animator (respects reduced motion by default) — used
//   on the gallery bento + the "Auto-animate list" demo.
// - DzPresence: a Reka/Radix `data-[state]` presence bridge that keeps a closing
//   element mounted so a pure-CSS exit animation can play before unmount.
export { vAnimateOnScroll } from './directives/animateOnScroll.ts'
export type { AnimateOnScrollOptions } from './directives/animateOnScroll.ts'
export { useAutoAnimate, vAutoAnimate } from '@formkit/auto-animate/vue'
export { default as DzPresence } from './components/DzPresence.vue'

// Text-effect family (docs/animations.md §6.2) — gradient sweep, typewriter,
// word stagger, letter decode (highlight sweep is the `.dz-highlight-sweep`
// CSS utility in tokens.css).
export { default as DzGradientText } from './components/DzGradientText.vue'
export { default as DzTypewriter } from './components/DzTypewriter.vue'
export { default as DzWordReveal } from './components/DzWordReveal.vue'
export { default as DzTextDecode } from './components/DzTextDecode.vue'
// Text v2 (docs/animations.md §5.2, effects 39–40 — Task N4): circular text lays a
// string on a slowly-rotating ring; text flip cycles a phrase list with a vertical
// rotateX flip. Both keep the readable string in the DOM and degrade to static
// under reduced motion.
export { default as DzCircularText } from './components/DzCircularText.vue'
export { default as DzTextFlip } from './components/DzTextFlip.vue'
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
// Backgrounds v2 (docs/animations.md §5.4, effects 42–45 — Task N6): meteors (42)
// and progressive blur (44) are the `.dz-meteors` / `.dz-progressive-blur` CSS
// utilities in tokens.css; the particle field (43) is a self-pausing canvas and
// the glass surface (45) a frosted backdrop-filter panel, both with
// prefers-reduced-transparency + forced-colors fallbacks (§7).
export { default as DzParticles } from './components/DzParticles.vue'
export { default as DzGlass } from './components/DzGlass.vue'

// Numbers & data family (docs/animations.md §6.3) — in-view count-up over core's
// DzAnimatedNumber. Progress fill (13) and rating fill (14) compose useInView +
// useReducedMotion directly over core's DzProgress / DzRating, so they need no
// dedicated wrapper export.
export { default as DzCountUp } from './components/DzCountUp.vue'
// Numbers v2 (docs/animations.md §5.3, effect 41 — Task N5): the sliding-number
// odometer rolls each digit vertically to its target on a left-to-right stagger
// (transform-only, distinct from the count-up tween). Reduced motion → final
// number shown instantly, no roll; tabular-nums avoids any width jump.
export { default as DzOdometer } from './components/DzOdometer.vue'

// Hover micro-interactions family (docs/animations.md §6.5) — pointer-driven
// tilt (20) and magnetic (22) directives + the border-beam (23) component. Card
// lift + glow (19) and sheen sweep (21) are the `.dz-card-lift` / `.dz-sheen`
// CSS utilities in tokens.css.
export { vTilt } from './directives/tilt.ts'
export type { TiltOptions } from './directives/tilt.ts'
export { vMagnetic } from './directives/magnetic.ts'
export type { MagneticOptions } from './directives/magnetic.ts'
export { default as DzBorderBeam } from './components/DzBorderBeam.vue'

// Hover & 3D v2 (docs/animations.md §5.5, effects 46–51 — Task N7) — pointer-driven
// effects that all degrade to a flat/static state on touch + keyboard + reduced
// motion and never move a focus/click target:
// - DzDock (46): a row whose items magnify by pointer proximity (rAF, scale-only).
// - DzCardStack (47): a stack whose front card cycles to the back, morphing via the
//   View Transitions API (N1) where supported, FLIP (WAAPI) otherwise, instant when
//   reduced; keyboard-operable via a "Next" button.
// - v-glare (48): a pointer-tracked specular highlight overlay (the standalone gloss
//   half of v-tilt), driving the `.dz-glare` utility in tokens.css.
// - DzCursor (49): a smooth trailing blob confined to a host region (rAF, transform).
// - DzCompare (50): a before/after wipe with a draggable AND keyboard-operable
//   role="slider" handle (arrow keys, aria-valuenow); intro sweep off under reduced.
// - DzLens (51): a magnifier circle following the pointer over an image.
export { default as DzDock } from './components/DzDock.vue'
export { default as DzCardStack } from './components/DzCardStack.vue'
export { vGlare } from './directives/glare.ts'
export type { GlareOptions } from './directives/glare.ts'
export { default as DzCursor } from './components/DzCursor.vue'
export { default as DzCompare } from './components/DzCompare.vue'
export { default as DzLens } from './components/DzLens.vue'

// Lists, collections & attention family (docs/animations.md §6.6–6.7) — the
// infinite marquee (25), flip-on-change (26) and shimmer overlay (28) are
// components. Stagger list-in (24) reuses DzStagger; pulse/ping (27) is the
// `.dz-ping` CSS utility in tokens.css; toast slide-in (29) composes core's
// DzToast directly, so neither needs a dedicated wrapper export.
export { default as DzMarquee } from './components/DzMarquee.vue'
export { default as DzFlip } from './components/DzFlip.vue'
export { default as DzShimmer } from './components/DzShimmer.vue'

// Feedback & confirmation family (docs/animations.md §6.9, effects 33–36) —
// micro-confirmations of a discrete user action: the success-check draw (33),
// the celebratory confetti burst (34) and the like-pop spark (36) are components;
// error shake (35) is the `.dz-shake` CSS utility in tokens.css, so it needs no
// dedicated wrapper export.
export { default as DzSuccessCheck } from './components/DzSuccessCheck.vue'
export { default as DzConfetti } from './components/DzConfetti.vue'
export { default as DzBurst } from './components/DzBurst.vue'

// Connections family (docs/animations.md §5.1, effects 37–38) — the animated
// beam (37) draws + travels a light along an SVG path between two referenced
// elements (stroke-only); orbiting icons (38) spin slotted avatars/badges around
// a hub on one or more rings (transform-only), keeping each item upright.
export { default as DzBeam } from './components/DzBeam.vue'
export { default as DzOrbit } from './components/DzOrbit.vue'

// Scroll & layout v2 (docs/animations.md §5.6, effects 52–54 — Task N8) — modern
// scroll-driven effects that run on the compositor (animation-timeline:
// view()/scroll()) where supported and fall back to a JS floor (useInView /
// useScrollProgress / useSticky) everywhere else, always leaving content visible:
// - DzBentoReveal (52): a bento grid whose cells reveal with a shared spotlight +
//   per-cell stagger on view; native view() reveal or .dz-animate-in fallback.
// - useSticky (53): tracks an internal scroll container's 0→1 progress for the
//   sticky/pinned scroll demo (the JS floor for the scroll() progress bar).
// Scroll-linked transforms (54) is the `.dz-scroll-linked` CSS utility in
// tokens.css, composed with useScrollProgress in its demo (no dedicated export).
export { default as DzBentoReveal } from './components/DzBentoReveal.vue'

// Surfaces & overlays v2 (docs/animations.md §5.7, effects 55–57 — Task N9) —
// morphing/expanding overlay motion built on the native APIs from N1 (View
// Transitions, interpolate-size, the Popover API + @starting-style), each with a
// <Transition>/FLIP fallback and an instant reduced-motion path. All drive core
// overlays through their public API (no fork) and are extractable primitives:
// - DzMorph (55): a card expands into a core DzDialog sharing its position/size,
//   morphing via a shared view-transition-name (FLIP fallback); focus trap + Esc
//   stay with Reka's DzDialog.
// - DzIsland (56): a compact pill morphs to expanded content and back, sizing via
//   interpolate-size (FLIP fallback) with @starting-style content, announced politely.
// - DzNativePopover (57): a tooltip/menu surface using the Popover API + @starting-
//   style + allow-discrete, with a <Transition> (+ Esc/outside-click) fallback.
export { default as DzMorph } from './components/DzMorph.vue'
export { default as DzIsland } from './components/DzIsland.vue'
export { default as DzNativePopover } from './components/DzNativePopover.vue'
