# Animations Gallery — Final QA Note (Task 10)

> Companion to [`animations.md`](./animations.md) §7. Records the cross-cutting
> accessibility / theme / performance audit of `/animations` and the
> Ecosystem "Animations" tile go-live. **Scope of audit:** all 32 free effects
> across 8 categories, the gallery shell (`AnimationsPage` + `AnimationCard`),
> and the entry point (tile + route + nav).
> **Last run:** 2026-06-23 · **Build:** `yarn workspace @dzup-ui/landing build` — passing.

## Verdict

Gallery is **go-live**. All 32 demos honour reduced motion via both paths, render
correctly token-only in light + dark, are keyboard-reachable with a visible
`--dz-ring`, and the off-screen loop cap added in this pass keeps the full page
smooth with every demo mounted. One performance gap was found and fixed (below).

## What changed in this pass

- **Off-screen loop cap (perf fix).** All 32 cards mount at once, so the ~9
  infinite/ambient loops (aurora, marquee, grid, gradient sweep, border glow,
  border beam, ping, shimmer, caret) previously ran even while scrolled off
  screen. Added an **effect-agnostic** harness cap: `AnimationCard` observes its
  preview stage with `useInView({ once: false })` and tags it `.dz-stage-idle`
  while out of view; a global rule in `motion/tokens.css` pauses all descendant
  element/pseudo-element animations there (`animation-play-state: paused`) and
  drops the always-on `will-change` on the two continuous transform layers
  (`.dz-marquee__track`, `.dz-aurora__blob`). New effects are capped for free.
  A 160px rootMargin buffer resumes loops just before a card enters, so there is
  no visible frozen-then-starts frame. Entrance reveals are transition-based, so
  the pause never affects them.
- **Ecosystem tile.** Confirmed `Animations` is `status: 'available'`, meta
  `32 effects · 8 categories`, routes to `/animations`; nav link present in both
  the desktop nav and the mobile sheet (`TopNav.vue`). No change needed — already
  final.

## Matrix verified — {light, dark} × {motion on, reduced}

Reduced motion is driven two ways and both were checked: the OS
`prefers-reduced-motion: reduce` setting (handled centrally by the
`@media` block in `motion/tokens.css`) **and** the page-level "Reduce motion"
DzSwitch (handled by `useReducedMotion()` + `--reduced` modifier classes / the
`disabled` directive option). All 32 demos resolve their fallback on **either**.

| # | Category | Reduced-motion path | Notes |
|---|----------|--------------------|-------|
| 1 | Scroll | reactive (`DzReveal`/`DzStagger` read `useReducedMotion`) | fade-only, no transform/blur |
| 6 | Scroll (parallax) | demo computes `transform: none` when reduced | JS transform gated, not just `@media` |
| 7–11 | Text | reactive components + `--reduced` (highlight) | text stays in DOM, no layout shift |
| 12–14 | Numbers | demos watch `reduced` → set final value at once | no count/sweep when reduced |
| 15–18 | Backgrounds | `DzAurora` reactive; grid/glow demos apply `--reduced` | loops stop, static end-state |
| 17/20/22 | Spotlight/Tilt/Magnetic | directives gate on OS **and** `disabled: reduced` | pointer-only; flat on touch/keyboard |
| 19/21/23 | Hover | `--reduced` classes / reactive `DzBorderBeam` | no lift/sheen/beam when reduced |
| 24–26 | Lists | reactive `DzStagger`/`DzMarquee`/`DzFlip` | marquee → static wrapped row |
| 27–29 | Attention | `--reduced` (ping) / reactive `DzShimmer` / `DzToast` | static dot/placeholder; instant toast |
| 30–32 | Transitions | route/tabs/accordion swap to instant when reduced | no slide/glide/height sweep |

Light/dark: every demo and the shell are token-only (`var(--dz-*)`); surfaces,
text, borders and brand gradients shift correctly between themes. The code block
is intentionally always-dark (`--dz-colors-primary-900` bg) — AA in both themes.

## Keyboard / focus

- Replay, View code, Copy (`DzButton`) and the Reduce-motion `DzSwitch` are
  keyboard-reachable and inherit the core `--dz-ring` focus ring.
- Category nav chips are `<a href="#…">` with a `:focus-visible` `--dz-ring`
  outline; the Ecosystem tile is a single whole-tile `router-link` with a
  `:focus-visible` ring and an `aria-label`.
- No animation moves a focus target or traps focus: tilt/magnetic rotate/translate
  around the element's own box (click + focus land unchanged) and are pointer-only;
  marquee pauses on `:focus-within`; text effects keep the readable string in the
  DOM (`.dz-sr-only`) with decorative copies `aria-hidden`.

## Performance

- **Lazy chunks:** each demo is a `defineAsyncComponent` (own chunk).
- **Off-screen loops capped:** see the fix above — only on-screen cards run loops.
- **`will-change` discipline:** entrance reveals set it on entrance and clear it
  on `transitionend` (`v-reveal`, `DzReveal`, `DzStagger`); the two continuous
  transform layers keep it only while on-screen and animating (dropped when idle
  or reduced).
- **Transform/opacity/filter only:** ambient loops animate `transform`,
  `background-position`, or a registered `<angle>` (border glow/beam) — no
  looped layout properties.

## Residual / out of scope

- JS timers in `useTypewriter` keep ticking while off-screen (one lightweight
  `setTimeout`); not GPU work, left as-is. Could be paused on in-view later if a
  larger typewriter wall is ever added.
- Pro animation track (Task P0–P7, `@dzup-ui-pro/pro`) is a separate repo and not
  part of this free-catalog audit.
