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

---

# Animations Gallery v2 — Final QA Note (Task N11)

> Companion to [`animations.md`](./animations.md) §3, §4 (native-first), §7. Records
> the v2 cross-cutting audit of `/animations` after the foundation (N0–N2), the v2
> effects (N3–N9) and the gallery UX upgrades (N10) landed. Extends — does not
> replace — the v1 audit above.
> **Scope of audit:** all **59 effects across 11 categories**, the gallery shell
> (`AnimationsPage` + `AnimationCard`), the motion foundation (`src/motion/`,
> `motion/tokens.css`), and the entry point (Ecosystem tile + route + nav).
> **Last run:** 2026-06-26 · **Build:** `yarn workspace @dzup-ui/landing build` — passing.

## Verdict

Gallery is **go-live for v2**. The full 59-effect catalog honours reduced motion via
both paths, falls back correctly where the native APIs are absent (content always
visible, never stranded at `opacity:0`), is keyboard-reachable with a visible
`--dz-ring`, and is correct + AA-contrast in light and dark. The off-screen loop cap
plus `content-visibility: auto` keep the now-larger gallery smooth. **One §7 gap was
found and fixed** (forced-colors on the two CSS ring utilities — below); the Ecosystem
tile count was corrected to the shipped totals.

## Shipped catalog — 59 effects · 11 categories

`scroll` (9) · `text` (7) · `numbers` (4) · `backgrounds` (8) · `hover` (11) ·
`lists` (4) · `attention` (3) · `feedback` (4) · `transitions` (4) · `connections` (2) ·
`surfaces` (3) = **59**. (The spec proposed 57 for the numbered effects 1–57; N2 added
two further demos — `auto-animate-list` and `presence-exit` — so the live total is 59.
The tile uses the actual shipped total, per the Task N11 brief.)

## What changed in this pass

- **forced-colors fallback for the glow + beam ring utilities (§7 fix).**
  `.dz-anim-border-glow` (effect 18) and `.dz-border-beam` (effect 23) paint their
  ring with a `conic-gradient` `background-image` on a `::before`. Under
  `@media (forced-colors: active)` Windows High Contrast forces `background-image` to
  `none`, so **both rings silently vanished** — exactly the failure §7 warns about,
  and the in-file comment already pointed to a "border-beam / border-glow rules for the
  pattern" that did not yet exist. Added the missing blocks in `motion/tokens.css`:
  under forced-colors each host gets `border: 1px solid CanvasText` and the `::before`
  background is cleared, so the card edge still reads. Mirrors the existing `.dz-glare`
  / `.dz-meteors` forced-colors fallbacks (system-colour keyword, token-safe).
  `DzBeam` (effect 37) already mapped its connector `stroke` to `CanvasText` — verified.
- **Ecosystem tile count.** `data.ts` Animations tile meta was the stale v1
  `32 effects · 8 categories`; corrected to **`59 effects · 11 categories`**. Confirmed
  `status: 'available'`, `href: '/animations'`, route registered (`router.ts`), and the
  nav link present in both the desktop nav and the mobile sheet (`TopNav.vue`).

## Matrix verified — {light, dark} × {motion on, reduced} × {native supported, native absent}

Reduced motion is still driven two ways, both checked: the OS
`prefers-reduced-motion: reduce` setting (the central `@media` block in
`motion/tokens.css`, now extended to cover the N0 parametric `.dz-animate-in/out`
utilities and every v2 effect's non-`dz-anim-`-prefixed loop classes — beam pulse,
orbit ring/counter, meteor streaks) **and** the page-level "Reduce motion" `DzSwitch`
(`useReducedMotion()`, reactive to OS *and* the override, so each effect's `--reduced`
class resolves on either). Spot-checks of the v2 additions:

| Category (v2) | Reduced-motion path | Native path / fallback |
|---|---|---|
| `connections` 37–38 | `DzBeam`/`DzOrbit` freeze to a static line / upright ring (`--reduced` + @media) | no native API; SVG `stroke-dashoffset` + CSS `rotate`, paused off-screen |
| `text` 39–40 | `DzCircularText` static curved text (sr-only string preserved); `DzTextFlip` first phrase, `aria-live` polite | — |
| `numbers` 41 | `DzOdometer` final number instantly, `tabular-nums` (no width jump) | — |
| `backgrounds` 42–45 | meteors/particles → static frame; glass/progressive-blur unaffected (static) | `prefers-reduced-transparency` raises opacity on `DzGlass` + progressive-blur |
| `hover` 46–51 | dock/glare/cursor/lens flat on touch+keyboard (`(hover:hover)` / `disabled`); compare = static "before" | card-stack swap via View Transitions, FLIP fallback |
| `scroll` 52–54 | bento/sticky/scroll-linked show all content static | scroll-driven `view()/scroll()` triple-gated; JS `useInView`/`useScrollProgress`/`useSticky` floor |
| `surfaces` 55–57 | morph/island/popover open instantly | View Transitions / `interpolate-size` / Popover + `@starting-style`, each `@supports`-gated with a FLIP/`<Transition>` floor |

**Native-fallback discipline (§4 native-first):** every scroll-driven rule in
`tokens.css` is triple-gated — `@supports (animation-timeline: …)` **+**
`@media (prefers-reduced-motion: no-preference)` **+** `:not(.*--reduced)` — and the
`from { opacity: 0 }` start frame lives **only inside `@supports`**, so a
non-supporting engine (Firefox) never paints a hidden cell. View-Transitions /
`@starting-style` / `interpolate-size` paths are feature-detected at runtime
(`supports*()` in `useViewTransition.ts`) with the v1 JS/FLIP/`<Transition>` path as
the guaranteed floor; custom `::view-transition-*` keyframes are gated under
`no-preference` so they never run under reduced motion.

## A11y — beyond reduced motion

- **forced-colors:** beam (`DzBeam` stroke), glare (`.dz-glare`), glow
  (`.dz-anim-border-glow`, fixed), beam-ring (`.dz-border-beam`, fixed) and meteors
  (`.dz-meteors__streak`) all keep a `CanvasText`/`border` fallback — none vanish.
- **prefers-reduced-transparency:** `DzGlass` swaps to an opaque raised surface and
  `.dz-progressive-blur` drops `backdrop-filter` for an opaque surface fade, so glassy
  content stays legible.
- **WCAG 2.2.2 (Pause/Stop/Hide):** every ambient loop > 5s (aurora, marquee, beam,
  orbit, particles, meteors, circular text) stops under reduced motion (OS *or* the
  page-level toggle = the global pause control) and is additionally paused off-screen
  by the `.dz-stage-idle` cap.
- **Keyboard / focus:** Replay button (reachable on hover *and* `:focus-visible`),
  the variant-matrix code **tabs** (APG roving tabindex owned locally — arrow/Home/End
  move selection+focus; not Reka's RovingFocusGroup, which would leave every tab
  `tabindex=-1`), per-card **permalink** button, the native-API badge (focusable),
  Copy, the **compare** slider (`role="slider"`, Arrow/Home/End, `aria-valuenow`), and
  the category + type filter chips (`aria-pressed`) are all reachable with a visible
  `--dz-ring`. Pointer-only effects (dock, glare, cursor, lens) overlay
  `pointer-events:none`, scale about their own centre, and never move a focus/click
  target. No animation traps focus.

## Performance

- **`content-visibility: auto` + `contain-intrinsic-size: auto 460px`** on each card
  skips off-screen render work for the larger catalog; `auto` remembers real sizes so
  the scrollbar doesn't jump.
- **Off-screen loop cap** (`.dz-stage-idle`) pauses all descendant animations and drops
  `will-change` on the continuous transform layers (now incl. orbit/beam/circular/
  meteor) while a card is scrolled away — the universal selector keeps it
  effect-agnostic, so new loops are capped for free.
- **Lazy chunks:** every demo is a `defineAsyncComponent` (own chunk).
- **`will-change` discipline:** set just-in-time on entrance / while looping on-screen,
  cleared when idle or reduced. Transform/opacity/filter/stroke + registered `<angle>`
  / `background-position` only — no looped layout properties.

## Residual / out of scope

- The permalink "highlight pulse" (`card-highlight`, 1.6s one-shot, user-triggered) is
  disabled under OS reduced motion but not under the page-level toggle; it is a single
  short pulse (not a >5s loop), so WCAG 2.2.2 does not apply — left as-is.
- `useTypewriter`'s lightweight off-screen `setTimeout` (v1 residual) is unchanged.
- This was a static + build-level audit (local ESLint is broken — memory
  `dzup-ui-local-env`; no headless browser available). The light/dark × motion ×
  native matrix was verified by reading the gated CSS/JS paths, not a live device
  sweep; a manual pass on a real browser + Windows High Contrast is recommended before
  a public launch.
- Pro animation track (P0–P7) remains separate and out of scope.
