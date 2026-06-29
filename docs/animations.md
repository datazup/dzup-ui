# Animations v2 — "Best Version" Design, Research & Build Tasks

> **Status:** Proposal / specification for the **next iteration** of `/animations`.
> **No implementation yet** — this doc is the spec; the `<task>` blocks in §8 are the build.
> **Owner:** dzup-ui team · **Last updated:** 2026-06-25
> **Scope:** Take the shipped **Animations** gallery (`/animations` in `apps/landing`)
> from "good" to **best-in-class** for 2025–26. It (1) reviews what already ships,
> (2) folds in fresh web research — new native browser motion APIs and how rival
> component libraries present motion — and (3) lays out sequenced, prompt-style
> tasks to add the missing signature effects, modernise the foundation on native
> APIs, and upgrade the gallery's distribution/UX.
> **Supersedes:** [`animations-old.md`](./animations-old.md) — the v1 spec that
> shipped the first 36 effects + the 9-category gallery (Tasks 0–10, done). v1 is
> kept verbatim for history and for the **Pro track** (Tasks P0–P7), which this
> doc carries forward unchanged (§11).
> **Companion docs:** [`landing.md`](./landing.md) (§4.6a "Ecosystem", §7 "Motion
> & Animation"), [`animations-qa.md`](./animations-qa.md) (v1 go-live audit).
> **Authoring method:** the tasks follow Anthropic's prompt-engineering guidance
> (clear & direct · context/motivation · role · XML structure · examples · defined
> success criteria · say what to do, not only what to avoid). See Appendix B.

---

## 1. Purpose & what "best version" means

v1 answered the question *"what happens when you click the Animations tile?"* — it
shipped a live, filterable gallery of **36 copy-paste motion effects** built on
free `@dzup-ui/core` components and `--dz-*` tokens, each with a reduced-motion
fallback. That is already competitive with Aceternity UI / Magic UI / Motion-
Primitives on **breadth** and ahead of nearly all of them on **accessibility**.

"Best version" is not "more of the same." Two web-research sweeps (Appendix A)
make the gap precise. Best-in-class for 2025–26 means three things v1 does not yet
do:

1. **Modernise the foundation on native browser APIs.** v1 hand-rolls what the
   platform now does natively and more cheaply — `IntersectionObserver` reveals,
   FLIP route/tabs/accordion transitions, mount/unmount enter-exit. In 2025–26 the
   **View Transitions API**, **CSS scroll-driven animations**, **`@starting-style`
   + `transition-behavior: allow-discrete`**, and **`interpolate-size`** are
   shipping (most Baseline) and obsolete that JS. Adopting them as a progressive-
   enhancement layer cuts main-thread work and code, and *demonstrates* platform
   fluency a marketing gallery should show off.

2. **Add the signature effects everyone now expects.** Across Aceternity, Magic
   UI, Motion-Primitives, ReactBits, Cult UI (and their Vue ports Inspira UI / Vue
   Bits), a recognisable 2025 vocabulary has emerged that v1 lacks: **animated
   beam between elements**, **dock magnification**, **sliding number/odometer**,
   **bento reveals**, **morphing surfaces / dynamic island**, **meteors/particles**,
   **3D card stack/swap**, **custom cursor**, **circular/flip text**. These are the
   "wow" cards visitors screenshot.

3. **Upgrade distribution & gallery UX.** The galleries that win on adoption ship a
   **copy-paste-with-ownership** story (a shadcn-style registry), a **variant
   matrix** (pick SFC vs composable vs utility-class), **per-effect permalinks**,
   and increasingly an **MCP server** for AI IDEs. v1 has a single "View code" tab
   and category deep-links; this is the cheapest, highest-leverage upgrade.

The non-negotiable that stays constant: **every effect honours
`prefers-reduced-motion`, animates transform/opacity/filter only, is token-only,
and is correct in light + dark** (`landing.md` §6–7, CLAUDE.md ADR-04 / WCAG AA).
v2 *raises* the accessibility bar further (§7) — reduced-motion is the
differentiator none of the copy-paste galleries actually nail.

---

## 2. Where we are today (v1 — shipped)

A review of `apps/landing` establishes what v2 builds *on*. Do not re-invent any
of this.

### 2.1 The shipped gallery
- **Entry point:** the Ecosystem "Animations" tile is `status: 'available'`, meta
  `32 effects · 8 categories` (stale — the catalog grew to **36 effects · 9
  categories**; v2 corrects the count), routes to `/animations`; nav link present
  in desktop nav + mobile sheet (`TopNav.vue`).
- **Gallery page** (`src/pages/AnimationsPage.vue`): reworked from per-category
  stacked grids into a **single filterable "bento" gallery** — drifting aurora +
  grain backdrop, a frosted sticky toolbar with **live search**, **category** +
  **type** filter chips and the global **"Reduce motion"** `DzSwitch`, and a dense
  `TransitionGroup` bento where wide/ambient effects get a 2-col stage. Cards
  float in with a capped, staggered reveal on every filter change. Category
  deep-links (`/animations#text`) are preserved via the hash ↔ filter sync.
- **Demo harness** (`src/gallery/AnimationCard.vue`): effect-agnostic card —
  live preview stage · **Replay** · title + "type" badge · "Built with" component
  chips · a **"View code" → Copy** block (the `ThemingDemo` clipboard pattern). An
  off-screen loop cap (`.dz-stage-idle`, `useInView({ once: false })`) pauses
  ambient loops while scrolled away.
- **Catalog model** (`src/gallery/catalog.ts`): a typed `CatalogEntry`
  (`id · title · category · type · blurb · components[] · code · demo`), the
  `CATEGORIES` list, and **`CATEGORY_ACCENTS` / `categoryAccentStyle()`** — each
  category carries a decorative OKLCH accent pair drawn from the token spectrum.
  **Adding an effect = appending one entry + a demo component**, no harness change.

### 2.2 The motion module (`src/motion/`) — the primitive family
Authored landing-local but extraction-ready (barrel `index.ts`, no landing-only
imports inside primitives), per v1 Open Decision D-2. Already shipping:
- **Foundations:** `useReducedMotion` (reactive OS `matchMedia` **+** a
  page-level override via `provideMotionPreference`), `useInView` (shared
  `IntersectionObserver`, no-IO ⇒ in-view immediately), `useScrollProgress`.
- **Directives:** `v-reveal` (`.left/.right/.up/.down/.blur/.scale` + stagger),
  `v-tilt`, `v-magnetic`.
- **Components:** `DzReveal`, `DzStagger`, `DzGradientText`, `DzTypewriter`,
  `DzWordReveal`, `DzTextDecode`, `DzCountUp`, `DzAurora`, `DzSpotlight`,
  `DzBorderBeam`, `DzMarquee`, `DzFlip`, `DzShimmer`, `DzSuccessCheck`,
  `DzConfetti`, `DzBurst`.
- **Composables:** `useTypewriter`, `useTextDecode`.
- **CSS truth:** `src/motion/tokens.css` — `@keyframes`, `--dz-anim-*` constants,
  the global `@media (prefers-reduced-motion: reduce)` reset, and the off-screen
  loop-pause rule. CSS utilities live here: `.dz-highlight-sweep`, `.dz-anim-grid`,
  `.dz-anim-border-glow`, `.dz-card-lift`, `.dz-sheen`, `.dz-ping`, `.dz-shake`.

### 2.3 The shipped catalog — 36 effects · 9 categories
`scroll` (fade&rise, stagger, directional, blur-in, scale-in, parallax) ·
`text` (gradient sweep, typewriter, word stagger, letter decode, highlight sweep) ·
`numbers` (count-up, progress fill, rating fill) ·
`backgrounds` (aurora drift, animated grid/dots, spotlight follow, gradient border glow) ·
`hover` (card lift, 3D tilt, sheen sweep, magnetic button, border beam) ·
`lists` (stagger list-in, marquee strip, flip on change) ·
`attention` (pulse/ping, shimmer skeleton, toast slide-in) ·
`feedback` (success check, confetti burst, error shake, like pop) ·
`transitions` (route transition, tabs indicator slide, accordion height).

### 2.4 Motion tokens available today
From `packages/tokens/src/primitives/transitions.ts` (emitted as CSS vars):

| Group | Values |
|---|---|
| `--dz-duration-fast` / `-normal` / `-slow` / `-slower` | `150` / `200` / `300` / `500ms` |
| `--dz-ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--dz-ease-in` / `-out` / `-in-out` / `-bounce` | standard + overshoot curves |
| `--dz-transition-fast` / `-normal` / `-slow` | `duration + ease-default` shorthand |

> **Gap (addressed by Task N0):** there is **no semantic / asymmetric motion
> scale** (entering vs leaving) and **no parametric enter/leave system** — the two
> biggest things the competitor sweep says best-in-class libraries ship (MUI's
> `theme.transitions.create()` with asymmetric 225/195ms enter/leave; PrimeVue /
> `tw-animate-css` parametric `--enter-*` custom-prop keyframes). Net-new motion
> constants stay landing-local as `--dz-anim-*` for now (D-2); promotion to
> `@dzup-ui/tokens` is Open Decision D2-1.

> **Local-env note (carry from `landing.md` §9 / memory `dzup-ui-local-env`):**
> ESLint cannot run locally. Validate every change with
> **`yarn workspace @dzup-ui/landing build`** (Vite); for any `packages/*` change,
> `yarn typecheck` + Vitest. **Do not** rely on `yarn lint`.

---

## 3. Research — the 2025–26 state of the art

Two web sweeps on 2026-06-25 (full source list in Appendix A). The findings that
shape v2:

### 3.1 Native browser motion APIs maturing (the foundation modernisation)
Baseline labels follow W3C WebDX ("Newly available" = shipped in all three
engines).

| API | Baseline (mid-2026) | What it obsoletes | v2 verdict |
|---|---|---|---|
| **View Transitions — same-document (SPA)** | **Newly available** (2025-10) — Chrome 111, Safari 18, Firefox 144 (no *types* in FF) | Hand-rolled FLIP clone-and-animate; route/shared-element machinery | **Adopt** with feature-detect + `<Transition>` fallback |
| **View Transitions — cross-document (MPA)** | Chromium + Safari only (no Firefox) | JS that faked page-to-page transitions | Enhancement only |
| **`@starting-style` + `transition-behavior: allow-discrete`** | **Newly available** (2024-08) — Chrome 117, Safari 17.5, Firefox 129 | The double-rAF / `setTimeout` starting-class hack; `transitionend`→`display:none`; mount/unmount enter-exit libs | **Adopt** (safest newer feature) |
| **CSS scroll-driven animations** (`animation-timeline: scroll()/view()`) | Not Baseline — Chrome 115, Safari 26, **Firefox flag only** | scroll + rAF listeners, IO reveals, AOS/ScrollMagic/ScrollTrigger for common reveal/parallax/progress | **Progressive enhancement** behind `@supports`, JS reveal stays the floor |
| **`interpolate-size: allow-keywords` + `calc-size()`** | Chromium only | The "can't transition `height:auto`" problem; `max-height` guessing; JS `scrollHeight` | Enhancement, never load-bearing; `0fr→1fr` grid fallback |
| **Popover API + CSS Anchor Positioning** | Popover **Baseline**; anchor ≈ newly available 2026 (Firefox 147) | Floating-UI / Popper positioning + collision flip; manual top-layer/z-index; outside-click & Esc handlers | Popover entrance via `@starting-style` is safe; anchor positioning needs `@supports` fallback |
| **Scroll-snap events** (`scrollsnapchange/-ing`) | Chrome/Safari only | IO "which slide is centred" inference for carousels | Feature-detect + IO fallback |

**Performance corollary (web.dev / Chrome case studies):** CSS scroll-driven
animations run on the compositor — unaffected by a busy main thread, where JS
scroll listeners jank; one report saw scroll-handler CPU drop ~50% → ~2%. Pairing
this with **`content-visibility: auto` + `contain-intrinsic-size`** on a long
gallery skips offscreen layout/paint (a documented 232ms → 30ms initial render).

### 3.2 How rival libraries ship motion — four presentation models
The competitor sweep found these are **complementary layers, not competitors** —
the best offering combines all four.

| Model | Exemplars | Expression | Borrow |
|---|---|---|---|
| **Motion-token system** | MUI `theme.transitions.create()`, Vuetify SASS, Material easings | Named duration/easing scale, **asymmetric enter 225 / leave 195** | A real semantic scale (our biggest gap — Task N0) |
| **Parametric utility classes** | PrimeVue `tailwindcss-primeui`, `tailwindcss-animate` / `tw-animate-css` (shadcn) | Two generic `enter`/`leave` keyframes reading `--enter-opacity/scale/rotate/translate-*`, composed by orthogonal `fade-in-* / zoom-in-* / slide-in-from-*` | Parametric enter/leave system (Task N0) |
| **Transition components / directives** | Vuetify two-tier factory, Mantine, Chakra v3 `<Presence>`, PrimeVue `v-animateonscroll` / `v-ripple` | `<v-fade-transition>`, `transition="name"` prop, `v-animate-on-scroll` | `v-animate-on-scroll` directive; reduced-motion baked into the primitive (Task N2) |
| **Headless data-state** | Radix → **Reka UI** → Nuxt UI | `[data-state="open"]` CSS hooks + **measured-dimension vars** (`--reka-accordion-content-height`) + unmount suspension (`Presence`/`forceMount`) | We already sit on Reka — formalise the `data-[state]` convention + a `DzPresence` exit-animation bridge (Task N2) |
| **Copy-paste gallery / registry** | shadcn, Aceternity, Magic UI, Motion-Primitives, ReactBits | Copy source into your repo (you own it); namespaced registry CLI; **MCP server**; **variant matrix** (JS/TS × CSS/Tailwind) | Registry + variant matrix + permalinks + MCP (Task N10, Open Decision D2-3) |

**Accessibility leaders to match:** Bootstrap bakes reduced-motion into its core
transition mixin with a *meaningful-vs-decorative* split (decorative motion
disabled; spinners slowed, not removed). Vuetify/Mantine auto-respect
`prefers-reduced-motion` at the primitive. **Critical Vue footgun:** Motion for
Vue (`motion-v`) defaults `reducedMotion: "never"` — it **ignores** the OS setting
unless globally wrapped in `<MotionConfig reducedMotion="user">`. If v2 ever pulls
in `motion-v`, that wrap is mandatory.

### 3.3 Trendy effects v1 is missing (the catalog gap)
Surveyed Aceternity, Magic UI, Motion-Primitives, ReactBits (~130 components),
Cult UI; Vue ports Inspira UI / Vue Bits mirror the names. Clearly NEW vs our 36:

- **Animated beam between elements** — a light travels a path connecting two nodes
  (distinct from our border-beam, which loops one element's edge). *The* signature
  2025 effect.
- **macOS Dock magnification** — icons scale by pointer proximity. Table-stakes now.
- **Sliding number / odometer** — digit-roll physics (distinct from our count-up tween).
- **Spinning / circular text**, **text flip / rotate / morph / roll** (distinct
  from our typewriter & letter-decode).
- **Bento grid reveal / "Magic Bento"** — spotlight + tilt + per-cell stagger.
- **Dynamic Island / morphing surface** — a compact pill morphs to expanded content
  (Cult UI hallmark); **morphing dialog / popover** sharing layout.
- **Meteors / shooting stars / particle field** backgrounds.
- **3D card family** — card stack, card swap, glare/holo card (beyond hover-tilt).
- **Custom cursor / cursor-follow** — smooth trailing cursor / blob / spotlight.
- **Image comparison slider** and **lens / magnifier**.
- **Orbiting circles / icon cloud**, **sticky / pinned scroll + scroll-stack**,
  **progressive (scroll-edge) blur**, **glass surface**.

*Skipped as near-duplicates of what we own:* generic typewriter, infinite logo
slider (≈ marquee), magnetic, plain scramble (≈ letter-decode). *Out of scope for
v2:* WebGL/`ogl`-dependent shader/dither/ASCII backgrounds and physics toys
(Lanyard, Ballpit) — they break the zero-heavy-dependency, transform/opacity-only
contract.

### 3.4 Vue motion tooling landscape (2025–26)
- **Native `<Transition>` / `<TransitionGroup>`** — the most token-native baseline
  (enter/leave classes consume `--dz-*` directly). View Transitions *augments*, not
  replaces, this.
- **AutoAnimate** (`@formkit/auto-animate`, `v-auto-animate`) — one-line add/remove/
  move animation of direct children; **respects reduced-motion by default**. A
  cheap, safe win for the filtered bento and any list demo.
- **Motion for Vue** (`motion-v`, GA Mar 2025) — full React-port: springs,
  `layoutId` shared-element, `<AnimatePresence>`. Powerful but JS-in-template (not
  token-native) and the reduced-motion footgun above. **Opt-in only** if a spring
  effect genuinely needs it.
- **GSAP went 100% free (Apr 2025)** — all former Club plugins (ScrollTrigger,
  SplitText, MorphSVG, DrawSVG, Flip, MotionPath…) are free for commercial use; a
  design system is unambiguously in-licence. No official Vue hook — use
  `gsap.context()` + refs + `ctx.revert()` in `onUnmounted`, guarded by
  `gsap.matchMedia("(prefers-reduced-motion: reduce)")`. Reserve as a **power
  layer** for effects CSS can't do (Open Decision D2-2).
- **`@vueuse/motion`** — maintained but momentum moved to `motion-v`; treat as legacy.

### 3.5 Accessibility & performance advances to adopt
- **"Reduce, don't remove":** author the reduced experience as the baseline; add
  motion only under `(prefers-reduced-motion: no-preference)`. Prefer **opacity
  cross-fades** as the reduced fallback — WCAG 2.3.3 explicitly excludes
  opacity/colour/blur from "motion animation", which is *why* fades are safe.
- **WCAG 2.2.2 Pause/Stop/Hide (Level A)** independently requires a pause/stop
  control for any auto-starting motion lasting **> 5s** — `prefers-reduced-motion`
  alone does **not** satisfy it. The page-level Reduce-motion toggle helps; ambient
  loops should also expose a pause affordance or be ≤ 5s.
- **`prefers-reduced-transparency`** (Chrome/Edge 118+, ~71% global; Safari none) —
  raise opacity on `backdrop-filter` glass to keep it legible.
- **`forced-colors: active`** forces `box-shadow`, `text-shadow`, `background-image`
  to `none` — so glow/depth/gradient decorations **silently vanish**. Provide a
  `border` fallback under `@media (forced-colors: active)`.
- **`will-change` discipline:** just-in-time only (set before, clear on
  `animationend`); never bake into stylesheets (v1 already does this — keep it).
- **Compositor-only:** animate `transform`/`opacity` (filter/clip-path verify per
  browser); use FLIP / View Transitions to remap layout moves onto transforms.

---

## 4. Design direction for v2

Synthesising §3 into the principles every v2 task obeys (in addition to the v1
cross-cutting rules in §6 of `animations-old.md`):

1. **Native-first, JS-as-floor.** Reach for the platform API first (View
   Transitions, `@starting-style`, scroll-driven CSS, `interpolate-size`, Popover).
   Wrap each in `@supports` / a runtime feature-detect so the v1 JS path stays the
   guaranteed floor. The un-enhanced state must always be correct and visible
   (never leave content at `opacity:0` where the API is unsupported — Firefox).
2. **Layer the four presentation models.** A semantic **motion-token scale** at the
   base → **parametric enter/leave utilities** + an **`v-animate-on-scroll`
   directive** in the middle → the **Reka `data-[state]` convention** for headless
   integration → a **registry + variant-matrix gallery** for distribution.
3. **Accessibility is the moat.** Reduced-motion at the *source* of every
   primitive; add `prefers-reduced-transparency` + `forced-colors` branches so
   glass/glow/shader-ish effects are accessibility-complete — the thing no rival
   gallery nails.
4. **Primitive-first, snippet-second** (carried from v1). Each new effect is a
   reusable primitive (directive / composable / component / CSS utility) shown as a
   live demo — not a bespoke one-off.
5. **Token-only, transform/opacity/filter-only, light + dark.** Unchanged hard bar.
6. **Extraction-ready.** New primitives keep the `src/motion/` discipline (no
   landing-only imports) so the eventual `@dzup-ui/motion` package (D-2) can absorb
   them.

---

## 5. The v2 catalog — new effects

Below are the proposed additions, continuing v1's numbering (37+). Three existing
categories gain effects; three **new** categories are added (`connections`,
`surfaces`, plus `layout` folded into `scroll`). Type key: **D**irective /
**Comp**osable / **Cmp**onent / **CSS**. Every effect has a reduced-motion fallback
and (where relevant) a native-API path with a JS/CSS fallback.

### 5.1 Connections — `#connections` (new category)
| # | Name | What it does | Type | Pairs with | Reduced-motion fallback | Native path |
|---|---|---|---|---|---|---|
| 37 | **Animated beam** | A light gradient travels an SVG path connecting two referenced elements | Cmp `DzBeam` | `DzCard`, `DzAvatar` | static connector line | SVG `stroke-dashoffset` (no native API) |
| 38 | **Orbiting icons** | Logos/avatars orbit a centre on one or more rings | Cmp `DzOrbit` | `DzAvatar`, `DzBadge` | static ring of icons | CSS `offset-path` + scroll-driven optional |

### 5.2 Text — `#text` (extend)
| # | Name | What it does | Type | Pairs with | Fallback |
|---|---|---|---|---|---|
| 39 | **Circular text** | Text laid on a circular path that slowly rotates | Cmp `DzCircularText` | `DzText` | static curved text |
| 40 | **Text flip / rotate** | A word flips vertically through a rotating list (distinct from typewriter) | Cmp `DzTextFlip` | `DzHeading` | first phrase shown |

### 5.3 Numbers — `#numbers` (extend)
| # | Name | What it does | Type | Pairs with | Fallback |
|---|---|---|---|---|---|
| 41 | **Sliding number / odometer** | Digits roll vertically like an odometer to the target | Cmp `DzOdometer` | `DzStatCard` | final number shown |

### 5.4 Backgrounds — `#backgrounds` (extend)
| # | Name | What it does | Type | Pairs with | Fallback |
|---|---|---|---|---|---|
| 42 | **Meteors** | Diagonal shooting-star streaks cross the surface on offset loops | CSS util `.dz-meteors` | hero, `DzCard` | static (no streaks) |
| 43 | **Particle field** | A constellation of dots drifts; lines link near neighbours; reacts to pointer | Cmp `DzParticles` | hero | static dots |
| 44 | **Progressive blur** | A graduated blur fades a scroll edge (layered `backdrop-filter`) | CSS util `.dz-progressive-blur` | sticky headers, image edges | static gradient mask; honours `prefers-reduced-transparency` |
| 45 | **Glass surface** | A frosted, lightly-refractive panel over a busy backdrop | Cmp `DzGlass` | overlays, `DzCard` | solid raised surface; opacity raised under `prefers-reduced-transparency` |

### 5.5 Hover & 3D — `#hover` (extend) / `#surfaces`
| # | Name | What it does | Type | Pairs with | Fallback | Native path |
|---|---|---|---|---|---|---|
| 46 | **Dock magnification** | Items scale by pointer proximity, neighbours easing too | D `v-dock` / Cmp `DzDock` | `DzIconButton`, `DzAvatar` | no scaling; static row | rAF pointer; pointer-only |
| 47 | **Card stack / swap** | Stacked cards cycle the top card to the back | Cmp `DzCardStack` | `DzCard` | static top card | View Transitions for the swap, FLIP fallback |
| 48 | **Glare card** | A glossy reflection tracks the pointer across a card | D `v-glare` (or `v-tilt.glare` ext) | `DzCard`, `DzImageCard` | flat surface | rAF pointer; pointer-only |
| 49 | **Custom cursor** | A smooth trailing cursor / blob follows the pointer within a region | Cmp `DzCursor` | any surface | native cursor only | rAF; disabled on touch/keyboard |
| 50 | **Image comparison** | Drag a handle to wipe between before/after images | Cmp `DzCompare` | `DzImage` | static side-by-side or first image | keyboard-operable slider |
| 51 | **Lens / magnifier** | A magnified circle follows the pointer over an image | Cmp `DzLens` | `DzImage` | no lens (plain image) | rAF; pointer-only |

### 5.6 Scroll & layout — `#scroll` (extend)
| # | Name | What it does | Type | Pairs with | Fallback | Native path |
|---|---|---|---|---|---|---|
| 52 | **Bento reveal** | Bento cells reveal with a shared spotlight + per-cell stagger on view | Cmp `DzBentoReveal` | `DzCard` grid | all cells visible, no stagger | scroll-driven `view()` enhancement over JS reveal |
| 53 | **Sticky / pinned scroll** | A panel pins while its content advances through steps | Comp `useSticky` / CSS | feature sections | normal stacked flow | `position: sticky` + scroll-driven progress; JS `useScrollProgress` fallback |
| 54 | **Scroll-linked transforms** | Element transform/opacity bound to scroll position (modernised parallax) | CSS util / Comp | `DzAurora`, media | static end-state | `animation-timeline: view()` behind `@supports`; v1 `useScrollProgress` fallback |

### 5.7 Surfaces & overlays — `#surfaces` (new category)
| # | Name | What it does | Type | Pairs with | Fallback | Native path |
|---|---|---|---|---|---|---|
| 55 | **Morphing dialog** | A card expands into a dialog sharing its layout/position | Cmp `DzMorph` | `DzCard` → `DzDialog` | instant open/close (no morph) | View Transitions (`view-transition-name`); FLIP fallback |
| 56 | **Dynamic island** | A compact pill morphs to reveal expanded content, then back | Cmp `DzIsland` | `DzBadge`, `DzCard` | instant expand/collapse | `interpolate-size`/FLIP for size; `@starting-style` content |
| 57 | **Native popover entrance** | A tooltip/menu animates in via the Popover API + `@starting-style` | CSS util + Comp | `DzTooltip`, `DzMenu` | instant show/hide | Popover API + `@starting-style` + `allow-discrete`; `<Transition>` fallback |

> **Proposed v2 totals:** **+21 effects across 7 affected categories** → a full
> gallery of **57 effects · 11 categories** (`scroll · text · numbers ·
> backgrounds · hover · lists · attention · feedback · transitions · connections ·
> surfaces`). Surface this on the Ecosystem tile once shipped (Task N11) — replace
> the stale `32 effects · 8 categories` with the final count.

> **Catalog model extension (Task N10):** add an optional `variants?:
> { sfc?; composable?; css? }` (the variant matrix), an optional `native?:
> { api: string; supports: string }` badge (e.g. "View Transitions"), and a
> per-effect permalink id. Existing entries keep working (all fields optional) — a
> v1 entry with just `code` is still valid.

---

## 6. Infrastructure upgrades (foundation v2)

These are the cross-cutting modules the new effects (and the existing ones) build
on. Built in Tasks N0–N2 before the effect tasks.

1. **Semantic motion-token scale + parametric enter/leave** (Task N0). Add
   landing-local `--dz-anim-*` constants for **asymmetric enter/leave durations**
   (e.g. enter ~225ms / leave ~195ms) and **semantic easings** (`--dz-anim-ease-
   entrance` = decelerate, `--dz-anim-ease-exit` = accelerate, `--dz-anim-ease-
   emphasis`). Add a **parametric system**: two generic keyframes (`dz-enter` /
   `dz-leave`) that read `--dz-enter-opacity/scale/rotate/translate-x/translate-y`,
   composed by orthogonal utilities (`.dz-fade-in`, `.dz-zoom-in`, `.dz-slide-in-
   from-top`, …) — the `tailwindcss-animate` / PrimeVue model, but token-only and
   reduced-motion-gated at the source.
2. **Native-API helpers + adoption layer** (Task N1). A tiny `useViewTransition()`
   wrapper (feature-detect → `document.startViewTransition`, else run the callback
   synchronously) and `supportsScrollTimeline()` / `supportsStartingStyle()`
   detectors. Adopt them to *upgrade* existing effects behind feature-detection:
   route/tabs transitions → View Transitions; accordion height → `interpolate-size`
   with `0fr→1fr` fallback; toast/overlay enter-exit → `@starting-style`. The v1
   JS/FLIP paths remain as the fallback.
3. **Ergonomic layers** (Task N2). A PrimeVue-style **`v-animate-on-scroll`**
   directive (`{ enterClass, leaveClass, threshold, root, once }`) over `useInView`;
   **AutoAnimate** (`v-auto-animate`) wired into the bento + list demos; and the
   **Reka `data-[state]` convention** documented + a thin **`DzPresence`** wrapper
   bridging Reka `Presence`/`forceMount` to a `<Transition>` for CSS exit anims.

> All three keep the `src/motion/` rules (token-only, SSR-safe, no landing-only
> imports, extraction-ready) and are exported from `src/motion/index.ts`.

---

## 7. Accessibility & performance bar (carry + new)

Every v2 effect must pass the v1 bar (`animations-old.md` §7) **plus**:

- **Reduced-motion at the source** — gate on OS `prefers-reduced-motion` **and**
  the page-level toggle (`useReducedMotion`), resolving to an opacity cross-fade or
  the static end-state. Native-API effects must also skip their custom
  `::view-transition-*` / `@starting-style` keyframes under reduced motion.
- **Pause/Stop/Hide (WCAG 2.2.2)** — any ambient loop > 5s (meteors, particles,
  orbit, beam) either stops under reduced motion **or** exposes a pause affordance;
  the off-screen loop cap (`.dz-stage-idle`) already pauses while scrolled away —
  keep new loops inside it.
- **`prefers-reduced-transparency`** — `DzGlass` / progressive-blur raise opacity
  and reduce `backdrop-filter` so content stays legible.
- **`forced-colors: active`** — beam/glare/glow/meteor decorations add a `border`
  or `outline` fallback so they don't vanish in Windows High Contrast.
- **Pointer-only effects** (dock, glare, cursor, lens) — flat/static on touch and
  keyboard; never move a focus or click target out from under the user.
- **Native-API progressive enhancement** — the un-enhanced state is always correct
  and visible; custom keyframes live inside `@supports` / a runtime detect.
- **Perf** — transform/opacity/filter only; `will-change` just-in-time; consider
  `content-visibility: auto` + `contain-intrinsic-size` on the gallery grid for the
  now-larger catalog; validate with `yarn workspace @dzup-ui/landing build` + a
  manual scroll check in light **and** dark, motion on **and** reduced.

---

## 8. Implementation tasks

> **Authoring note — how these tasks are written.** Each `<task>` is a
> ready-to-run prompt following Anthropic's prompt-engineering guidance: a
> `<role>` to prime expertise; `<context>` with motivation and the exact files;
> `<objective>` stating the goal; `<requirements>` as explicit, ordered steps;
> `<constraints>` saying what to do (and the few hard "do nots"); checkable
> `<acceptance_criteria>` including the build command; `<references>` to real repo
> files and this spec; and an `<example>` where output shape matters (see
> Appendix B). Run **in order** (each builds on the previous). Hand one `<task>`
> block to an implementation agent verbatim. Do **not** implement from the prose
> above — that is the spec; these are the build.

### Task checklist (tick as each lands)

- [ ] **Task N0** — Motion-token scale v2 + parametric enter/leave utilities
- [ ] **Task N1** — Native-API foundation + modernise existing transitions
- [ ] **Task N2** — Ergonomic layers: `v-animate-on-scroll`, AutoAnimate, `DzPresence`
- [ ] **Task N3** — Connections: Animated beam + Orbiting icons (37–38)
- [ ] **Task N4** — Text v2: Circular text + Text flip (39–40)
- [ ] **Task N5** — Numbers v2: Sliding odometer (41)
- [ ] **Task N6** — Backgrounds v2: Meteors, Particles, Progressive blur, Glass (42–45)
- [ ] **Task N7** — 3D & pointer: Dock, Card stack, Glare, Cursor, Compare, Lens (46–51)
- [ ] **Task N8** — Scroll & layout: Bento reveal, Sticky scroll, Scroll-linked (52–54)
- [ ] **Task N9** — Surfaces: Morphing dialog, Dynamic island, Native popover (55–57)
- [ ] **Task N10** — Gallery UX v2: variant matrix, permalinks, native badge, registry groundwork
- [ ] **Task N11** — QA v2: a11y/native-fallback/perf audit; update tile counts; go-live

> **Dependencies:** N0–N2 are the foundation (do first, in order). N3–N9 (effects)
> depend on N0–N2 but are independent of each other and can run in parallel. N10
> depends on N0 (catalog model) and can run alongside the effect tasks. N11 is last.
> The **Pro track (P0–P7)** from `animations-old.md` §11 is unchanged and orthogonal.

### Conventions referenced by every task
- **Repo:** `dzup-ui/apps/landing` (Vite + Vue 3 `<script setup lang="ts">` +
  vue-router). Primitives in `src/motion/`; demos in `src/gallery/demos/`; catalog
  in `src/gallery/catalog.ts`; page in `src/pages/AnimationsPage.vue`.
- **Styling:** scoped `<style>` is allowed in the landing app, but **values must be
  `--dz-*` tokens** (raw hex only as `var(..., #fallback)`), per `landing.md` §6.1 /
  ADR-04. Motion durations/easings from §2.4 tokens; net-new constants as
  `--dz-anim-*` in `src/motion/tokens.css`.
- **Validation:** `yarn workspace @dzup-ui/landing build`. **Do not run
  `yarn lint`** (broken locally — memory `dzup-ui-local-env`). For any `packages/*`
  change: `yarn typecheck` + Vitest.
- **A11y/perf:** §7 of this doc applies to every task. TypeScript strict, no `any`,
  concise JSDoc on every export.
- **Catalog discipline:** adding an effect = appending a `CatalogEntry` + a demo
  component under `src/gallery/demos/`, with no change to `AnimationCard.vue`.

---

### [x] Task N0 — Motion-token scale v2 + parametric enter/leave utilities

```xml
<task id="N0" title="Add a semantic motion-token scale and a parametric enter/leave utility system">
<role>
You are a senior design-systems engineer who treats motion as a token-driven
language. You build small, composable CSS systems and you gate every animation on
prefers-reduced-motion at the source, never as an afterthought.
</role>

<context>
The dzup-ui animation gallery (apps/landing) ships 36 effects but its motion
vocabulary is thin: tokens are only --dz-duration-{fast,normal,slow,slower} and
--dz-ease-{default,in,out,in-out,bounce} (packages/tokens transitions.ts), with no
semantic/asymmetric scale and no reusable enter/leave system. A web survey of
best-in-class libraries (docs/animations.md §3.2) shows the two things they all
ship and we lack: (1) a semantic motion scale with ASYMMETRIC enter/leave
durations and entrance/exit easings (MUI theme.transitions / Material), and (2) a
PARAMETRIC enter/leave system — two generic keyframes reading CSS custom
properties, composed by orthogonal utilities (PrimeVue tailwindcss-primeui /
tailwindcss-animate / tw-animate-css). We will author both LANDING-LOCAL as
--dz-anim-* in src/motion/tokens.css (promotion to @dzup-ui/tokens is Open Decision
D2-1 — do NOT touch packages/tokens here). Read docs/animations.md §2.4, §3.2, §6,
§7 first.
</context>

<objective>
Extend src/motion/tokens.css with a semantic motion scale (--dz-anim-*) and a
token-only, reduced-motion-safe parametric enter/leave utility system, plus a typed
helper so demos can compose entrances without raw values. Nothing visual ships in
the gallery yet — this is the foundation Tasks N3–N9 consume.
</objective>

<requirements>
1. In src/motion/tokens.css add semantic constants (do not remove existing
   --dz-anim-* used today):
   - Durations: --dz-anim-duration-enter (~225ms), --dz-anim-duration-exit
     (~195ms), --dz-anim-duration-emphasis (~375ms), referencing the existing
     --dz-duration-* scale where they align.
   - Easings: --dz-anim-ease-entrance (decelerate, e.g. cubic-bezier(0,0,0.2,1)),
     --dz-anim-ease-exit (accelerate, e.g. cubic-bezier(0.4,0,1,1)),
     --dz-anim-ease-emphasis (standard/emphasised). Reuse --dz-ease-* where exact.
2. Parametric enter/leave system in the same file:
   - Two keyframes `dz-enter` and `dz-leave` that interpolate from/to
     transform: translate3d(var(--dz-enter-x,0), var(--dz-enter-y,0), 0)
     scale(var(--dz-enter-scale,1)) rotate(var(--dz-enter-rotate,0)) and
     opacity: var(--dz-enter-opacity,1).
   - Base classes `.dz-animate-in` / `.dz-animate-out` that run the keyframes with
     the enter/exit duration + easing tokens and `animation-fill-mode: both`.
   - Orthogonal composer utilities that only SET the custom props (so they stack):
     `.dz-fade-in` (opacity 0), `.dz-zoom-in` (scale .95), `.dz-slide-in-from-top`
     /-bottom/-left/-right (translate ±8–16px), `.dz-spin-in` (rotate). Provide
     matching `-out` variants used by `.dz-animate-out`.
3. Accessibility at the source: under `@media (prefers-reduced-motion: reduce)`,
   collapse .dz-animate-in/out to an opacity-only cross-fade (no transform/rotate)
   with a ~1ms-or-fast duration — extend the existing reduced-motion block rather
   than adding a competing one.
4. forced-colors: ensure none of these utilities rely on box-shadow/background-image
   for legibility (they don't animate those) — add a short comment noting the §7
   rule for effects that do.
5. Add a typed helper enterStyle(opts) in a new src/motion/useEnter.ts (exported
   from index.ts) that returns an inline-style object setting the --dz-enter-*
   custom props from {opacity?, scale?, x?, y?, rotate?} — so a demo can do
   :style="enterStyle({ y: 12, opacity: 0 })" :class="'dz-animate-in'". Concise
   JSDoc; no `any`.
6. Document the new tokens + utilities in a short comment block at the top of the
   relevant tokens.css section so later tasks discover them.
</requirements>

<constraints>
- Token-only: every value is a --dz-* token or a var(...,#fallback). Do NOT edit
  packages/tokens. Do NOT add runtime dependencies. transform/opacity only.
- Do not break the existing --dz-anim-* constants, the reduced-motion reset, or the
  off-screen loop-pause rule already in tokens.css.
</constraints>

<acceptance_criteria>
- `yarn workspace @dzup-ui/landing build` succeeds.
- A scratch element with class "dz-animate-in dz-fade-in dz-slide-in-from-top"
  animates opacity+translateY on mount; with OS reduced motion it cross-fades only
  (no translate).
- enterStyle({ y: 12, opacity: 0 }) returns { '--dz-enter-y': '12px',
  '--dz-enter-opacity': '0' } (or equivalent) and is exported from
  src/motion/index.ts.
- No raw colors; no packages/tokens diff.
</constraints>

<references>
- apps/landing/src/motion/tokens.css (keyframes, --dz-anim-*, reduced-motion block)
- packages/tokens/src/primitives/transitions.ts (existing scale — read only)
- docs/animations.md §2.4, §3.2, §6, §7; animations-old.md §5.3
</references>
</task>
```

---

### [x] Task N1 — Native-API foundation + modernise existing transitions

```xml
<task id="N1" title="Add View Transitions / @starting-style / interpolate-size helpers and adopt them behind feature detection">
<role>
You are a platform-fluent front-end engineer who reaches for native browser APIs
first and always ships a correct, visible fallback. You feature-detect, you never
leave content stuck at opacity:0 where an API is unsupported, and you keep custom
keyframes out of the reduced-motion path.
</role>

<context>
The gallery hand-rolls motion the platform now does natively (docs/animations.md
§3.1): route/tabs transitions via FLIP/measured DOM, accordion height via core's
keyframes, toast/overlay enter-exit via mount/unmount. In 2025–26 the View
Transitions API (SPA, Baseline), @starting-style + transition-behavior:
allow-discrete (Baseline), and interpolate-size: allow-keywords (Chromium) make
most of that unnecessary and cheaper. We will add a small detection+wrapper layer
and use it to UPGRADE existing effects as progressive enhancement — the current
JS/FLIP paths stay as the guaranteed floor. Read docs/animations.md §3.1, §4
(native-first), §6 item 2, §7 first. The existing route transition lives in
App.vue (effect 30), tabs indicator in the tabs demo (31), accordion height in the
accordion demo (32).
</context>

<objective>
Add src/motion/useViewTransition.ts (+ feature detectors) and use them to enhance
the route/tabs/accordion/toast transitions behind detection, with the existing
behaviour preserved wherever the API is absent or reduced motion is on.
</objective>

<requirements>
1. src/motion/useViewTransition.ts exporting:
   - startViewTransition(update: () => void | Promise<void>, opts?: { skip?:
     boolean }): runs document.startViewTransition(update) when supported AND not
     skipped (skip = reduced motion or unsupported), else awaits update()
     synchronously. Returns a thenable that resolves when the DOM is updated.
   - supportsViewTransitions(), supportsStartingStyle(), supportsScrollTimeline(),
     supportsInterpolateSize() — SSR-safe boolean detectors (guard document/CSS.supports).
   Export all from src/motion/index.ts with JSDoc.
2. Route transition (effect 30, App.vue): when supportsViewTransitions() and not
   reduced, drive route changes through startViewTransition and add scoped
   ::view-transition-old/new(root) keyframes (fade+slide) GATED inside
   @media (prefers-reduced-motion: no-preference); otherwise keep the existing
   <Transition name="route"> exactly as-is. Do not break /, /pro, /animations nav
   or scrollBehavior.
3. Accordion height (effect 32 demo): add an interpolate-size/calc-size() path
   behind @supports (interpolate-size: allow-keywords) for true height:auto
   animation, falling back to the existing core keyframe behaviour where
   unsupported. Reduced motion stays instant.
4. Toast / overlay entrance: add an @starting-style + transition-behavior:
   allow-discrete CSS path for at least the toast-slide-in demo (effect 29),
   behind @supports, with the current behaviour as fallback. Reduced motion =
   instant appear.
5. Each enhancement: the un-enhanced state is correct and visible; no content is
   left hidden where the API is missing; custom keyframes never run under reduced
   motion.
6. Update the affected catalog `code` snippets to show the native path + the
   @supports/feature-detect fallback so the copied code is honest.
</requirements>

<constraints>
- Progressive enhancement only — never regress an existing effect when an API is
  unsupported. Token-only; transform/opacity only in custom keyframes. No new
  runtime dependencies. Do not modify packages/core; drive core components via
  their public API.
</constraints>

<acceptance_criteria>
- `yarn workspace @dzup-ui/landing build` succeeds; /, /pro, /animations still
  navigate with working scroll behaviour.
- In a View-Transitions-capable browser, route changes morph; with reduced motion
  or in Firefox-without-types, they fall back to the existing fade+slide with no
  visual breakage.
- The accordion animates height:auto where interpolate-size is supported and the
  prior behaviour elsewhere; both are instant under reduced motion.
- Feature detectors are SSR-safe (no document access at import time).
</constraints>

<references>
- apps/landing/src/App.vue (route <Transition>), src/gallery/demos/AccordionHeightDemo.vue,
  ToastSlideInDemo.vue; src/motion/useReducedMotion.ts
- docs/animations.md §3.1, §4, §6, §7
</references>
</task>
```

---

### [x] Task N2 — Ergonomic layers: `v-animate-on-scroll`, AutoAnimate, `DzPresence`

```xml
<task id="N2" title="Add a scroll directive, AutoAnimate integration, and a Reka Presence exit-animation bridge">
<role>You are a Vue 3 DX engineer who turns repeated motion patterns into tiny, accessible, reduced-motion-safe primitives that read cleanly in templates.</role>

<context>
Competitor research (docs/animations.md §3.2, §3.4) highlights three ergonomic
layers we lack: PrimeVue's first-class v-animateonscroll directive; AutoAnimate
(@formkit/auto-animate) which animates list add/remove/move in one line and
respects reduced motion by default; and the Reka/Radix data-[state] convention with
a Presence/forceMount bridge for CSS exit animations (we already sit on Reka UI via
@dzup-ui/core). Build all three into src/motion, reusing useInView/useReducedMotion
from the existing foundation. Read docs/animations.md §3.2, §3.4, §6 item 3, §7.
</context>

<objective>
Ship v-animate-on-scroll (directive), wire AutoAnimate into the gallery's filtered
bento + a list demo, and add a DzPresence wrapper that bridges Reka Presence to a
<Transition> for CSS exit animations — each reduced-motion-safe and documented.
</objective>

<requirements>
1. src/motion/directives/animateOnScroll.ts — vAnimateOnScroll, bound value
   { enterClass?: string; leaveClass?: string; threshold?: number; root?: Element;
   once?: boolean }. Uses useInView; adds enterClass on intersect (and leaveClass
   on leave when once is false); under reduced motion applies the end-state class
   immediately with no transition. Default enterClass = the .dz-animate-in family
   from N0. Export vAnimateOnScroll from index.ts.
2. AutoAnimate: add @formkit/auto-animate as a landing dependency; expose its
   v-auto-animate (or a thin re-export) and apply it to the AnimationsPage bento
   container so filter changes animate via AutoAnimate when supported, keeping the
   current TransitionGroup as the fallback path / for the staggered enter. Confirm
   AutoAnimate is disabled/instant under reduced motion (it is by default — verify).
   Add ONE catalog demo "Auto-animate list" (category lists) showing add/remove/
   reorder of DzListItem with v-auto-animate.
3. DzPresence: a small wrapper around Reka's Presence (or forceMount pattern) that
   keeps a closing element mounted so a <Transition> can play its leave animation,
   then unmounts. Document the data-[state="open"|"closed"] convention and the
   --reka-*-content-height measured-dimension vars in a JSDoc block. Add ONE demo
   (category surfaces or transitions) showing a CSS-only exit animation via
   data-[state].
4. Reduced motion honoured in all three; SSR-safe; transform/opacity only.
</requirements>

<constraints>
- @formkit/auto-animate is the only new dependency permitted; no others. Token-only;
  no raw colors. Do not modify packages/core. Keep primitives free of landing-only
  imports (extraction-ready).
</constraints>

<acceptance_criteria>
- `yarn workspace @dzup-ui/landing build` succeeds.
- An element with v-animate-on-scroll="{ once: true }" reveals on scroll and is
  instant under reduced motion.
- Filtering the gallery animates item add/remove; with reduced motion items snap.
- The DzPresence demo plays a leave animation before unmount; instant under reduced
  motion. New catalog demos appear in their categories with Copy snippets.
</constraints>

<references>
- apps/landing/src/motion/useInView.ts, useReducedMotion.ts, index.ts;
  src/pages/AnimationsPage.vue (bento TransitionGroup); src/gallery/catalog.ts
- docs/animations.md §3.2, §3.4, §6, §7
</references>
</task>
```

---

### [x] Task N3 — Connections: Animated beam + Orbiting icons (effects 37–38)

```xml
<task id="N3" title="Build the animated-beam and orbiting-icons primitives and their demos">
<role>You are an SVG/CSS motion engineer who animates paths and orbits with stroke and transform only, and who keeps decorative motion invisible to assistive tech.</role>

<context>
Add the "Connections" category (docs/animations.md §5.1) — the signature 2025
effect set we lack. Build on N0's tokens and useReducedMotion/useInView. Register
demos in catalog.ts (add the 'connections' category to CATEGORIES and a
CATEGORY_ACCENTS pair). Read docs/animations.md §5.1, §5 (catalog model), §7.
</context>

<objective>
Deliver effects 37 Animated beam (DzBeam) and 38 Orbiting icons (DzOrbit) as
reusable, reduced-motion-safe primitives plus registered catalog demos built on
real @dzup-ui/core components (DzCard, DzAvatar, DzBadge).
</objective>

<requirements>
- DzBeam.vue: draws an SVG path between two referenced elements (template refs or
  selectors) and animates a gradient light along it via stroke-dashoffset (or an
  animated gradient stop), transform/opacity/stroke only. Props for curvature,
  duration, colour tokens, and a `reverse` direction. Reduced motion = static
  connector line. forced-colors: add a visible border/stroke fallback (§7).
- DzOrbit.vue: lays slotted items on one or more rings and rotates them on a slow
  loop (CSS transform rotate on the ring + counter-rotate items to keep them
  upright). Props for radius, speed, ring count. Reduced motion = static ring.
  Decorative ring container aria-hidden; slotted content remains accessible.
- Both honour the off-screen loop cap (sit inside .dz-stage so tokens.css pauses
  them when idle); will-change set on entrance and cleared.
- Add the 'connections' category + accent pair; register effects 37–38 with
  accurate "Built with" chips and correct, copy-pasteable `code` snippets.
</requirements>

<constraints>
- Token-only durations/easings (N0 + §2.4); --dz-anim-* for net-new. transform/
  opacity/stroke only. Do not modify packages/core. Keep primitives extractable.
</constraints>

<acceptance_criteria>
- Both demos animate on Replay and degrade to a static connector/ring under the
  Reduce-motion toggle and OS setting; loops pause off-screen.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark; the
  new "Connections" chip filters to exactly these effects.
</constraints>

<references>
- apps/landing/src/motion/ (DzBorderBeam.vue as a stroke-animation reference),
  index.ts; src/gallery/catalog.ts; packages/core DzCard, DzAvatar, DzBadge
- docs/animations.md §5.1, §5, §7
</references>
</task>
```

---

### [x] Task N4 — Text v2: Circular text + Text flip (effects 39–40)

```xml
<task id="N4" title="Build circular-text and text-flip primitives and demos">
<role>You are a typographic-motion engineer who keeps the readable string in the DOM for screen readers and animates with tokens, never causing layout shift.</role>

<context>
Extend the text category (docs/animations.md §5.2) with two trendy effects not
covered by the existing typewriter/letter-decode. Build on N0 tokens and
useReducedMotion. Read docs/animations.md §5.2, §7 and the v1 text-effect
accessibility rules (animations-old.md Task 4).
</context>

<objective>
Deliver effects 39 Circular text (DzCircularText) and 40 Text flip (DzTextFlip),
paired with DzText/DzHeading, each accessible and reduced-motion-safe.
</objective>

<requirements>
- DzCircularText.vue: lays a string of characters on a circular path (per-char
  rotate/translate) and slowly rotates the whole ring. The plain text must remain
  in the DOM and announced as one string (decorative per-char spans aria-hidden;
  include an sr-only copy of the full text). Reduced motion = static curved text.
- DzTextFlip.vue: cycles a list of phrases, each flipping vertically (rotateX) in/
  out on an interval; reserve height to avoid layout shift; pause on hover/focus.
  Reduced motion = first phrase shown statically. The active phrase is announced
  politely (aria-live) without spamming.
- Loops sit inside .dz-stage (off-screen cap); will-change cleared after.
- Register effects 39–40 in catalog.ts with correct snippets + chips.
</requirements>

<constraints>
- Accessibility first: text readable by assistive tech, no layout shift. Token-only
  colours/timings; transform/opacity only. No core changes; extractable primitives.
</constraints>

<acceptance_criteria>
- Both demos animate and degrade under reduced motion; screen-reader text stays
  correct and shift-free; loops pause off-screen and on hover/focus.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark.
</constraints>

<references>
- apps/landing/src/motion/DzTypewriter.vue, DzTextDecode.vue (accessible-text refs);
  src/gallery/catalog.ts; packages/core DzText, DzHeading
- docs/animations.md §5.2, §7
</references>
</task>
```

---

### [x] Task N5 — Numbers v2: Sliding odometer (effect 41)

```xml
<task id="N5" title="Build the sliding-number / odometer primitive and demo">
<role>You are an engineer who animates data tastefully, reuses existing components, and respects reduced motion and in-view triggering.</role>

<context>
The numbers category has a tween count-up (effect 12, DzCountUp over core's
DzAnimatedNumber). Add the distinct odometer style (docs/animations.md §5.3): each
digit rolls vertically to its target. Build on useInView/useReducedMotion (and
reuse DzCountUp/DzAnimatedNumber for the value logic where helpful). Read
docs/animations.md §5.3, §7.
</context>

<objective>
Deliver effect 41 Sliding number / odometer (DzOdometer): per-digit vertical roll
to a target value, triggered in-view, with formatting and a static-final reduced-
motion fallback.
</objective>

<requirements>
- DzOdometer.vue: renders the target number as per-digit columns; each digit column
  translateY-rolls from its current to its target digit on a staggered timing when
  isInView. Supports thousands separators and suffix/prefix (mirror DzCountUp's
  formatting). transform only (no layout reflow per frame). Reduced motion / OS
  setting = final number shown instantly, no roll. Tabular-nums to avoid width jump.
- Reuse useInView + useReducedMotion; trigger once per in-view (and on Replay).
- Register effect 41 in catalog.ts with snippet + chips (pair with DzStatCard).
</requirements>

<constraints>
- Reuse the existing number-formatting approach from DzCountUp where possible; do
  not duplicate it gratuitously. Token-only; transform/opacity only. No core changes.
</constraints>

<acceptance_criteria>
- The odometer rolls digits once when scrolled into view and on Replay; reduced
  motion shows the final number instantly with no width jump.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark.
</constraints>

<references>
- apps/landing/src/motion/DzCountUp.vue, useInView.ts; src/gallery/catalog.ts;
  packages/core DzAnimatedNumber, DzStatCard
- docs/animations.md §5.3, §7
</references>
</task>
```

---

### [x] Task N6 — Backgrounds v2: Meteors, Particles, Progressive blur, Glass (effects 42–45)

```xml
<task id="N6" title="Build meteors, particle field, progressive blur, and glass-surface effects and demos">
<role>You are a GPU-conscious motion engineer who keeps ambient loops cheap, reduced-motion-safe, and legible under reduced-transparency and forced-colors.</role>

<context>
Extend the backgrounds category (docs/animations.md §5.4) with four modern ambient
effects. These are the effects most likely to hit the new accessibility branches
(prefers-reduced-transparency, forced-colors) from §7 — handle them. Build on N0
tokens and the off-screen loop cap. Read docs/animations.md §5.4, §7.
</context>

<objective>
Deliver effects 42 Meteors (.dz-meteors CSS util), 43 Particle field (DzParticles),
44 Progressive blur (.dz-progressive-blur), 45 Glass surface (DzGlass) — paired
with hero/DzCard surfaces.
</objective>

<requirements>
- 42 Meteors: a CSS utility spawning N diagonal streaks (transform translate + a
  fading tail) on offset loops; static (no streaks) under reduced motion; forced-
  colors fallback so the surface still reads. Cap concurrent streaks.
- 43 DzParticles.vue: a constellation of dots that drift (transform) with optional
  near-neighbour link lines and gentle pointer reaction (rAF-throttled, pointer-
  only); static dots under reduced motion / touch / keyboard. Cap particle count
  for perf; sit inside .dz-stage so it pauses off-screen.
- 44 Progressive blur: a CSS utility layering a few backdrop-filter: blur() stops
  behind a mask gradient to fade a scroll edge. Under prefers-reduced-transparency,
  reduce blur and raise opacity (legibility); static under reduced motion.
- 45 DzGlass.vue: a frosted panel (backdrop-filter blur+saturate) over a busy
  backdrop; under prefers-reduced-transparency, fall back to a more opaque raised
  surface; under forced-colors, a solid surface + border.
- Token-only colours (--dz-colors-*). Register effects 42–45 in catalog.ts with
  snippets + chips.
</requirements>

<constraints>
- Loops pause/disable under reduced motion and off-screen; cap concurrent loops;
  clear will-change. transform/opacity/filter only — no looped layout properties.
  No core changes; no raw colors.
</constraints>

<acceptance_criteria>
- All four effects loop smoothly, stay GPU-cheap, and fully disable under reduced
  motion; glass + progressive blur stay legible under prefers-reduced-transparency;
  meteor/glass have a visible forced-colors fallback.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark.
</constraints>

<references>
- apps/landing/src/motion/DzAurora.vue, tokens.css (.dz-anim-grid, loop cap);
  src/gallery/catalog.ts; packages/core DzCard
- docs/animations.md §5.4, §7
</references>
</task>
```

---

### [x] Task N7 — 3D & pointer: Dock, Card stack, Glare, Cursor, Compare, Lens (effects 46–51)

```xml
<task id="N7" title="Build dock magnification, card stack, glare, custom cursor, image compare, and lens effects and demos">
<role>You are an interaction engineer who makes pointer-driven effects feel alive without harming touch, keyboard, or focus, and who FLIPs/View-Transitions layout moves rather than thrashing layout.</role>

<context>
Extend the hover category and add pointer/3D effects (docs/animations.md §5.5).
Several are pointer-only and MUST degrade to a sensible static state on touch and
keyboard, and must never move a focus/click target out from under the user. Build
on N0 tokens, useReducedMotion, and N1's startViewTransition for the card swap.
Read docs/animations.md §5.5, §7.
</context>

<objective>
Deliver effects 46 Dock (DzDock/v-dock), 47 Card stack/swap (DzCardStack), 48 Glare
card (v-glare), 49 Custom cursor (DzCursor), 50 Image compare (DzCompare), 51 Lens
(DzLens), paired with DzIconButton/DzAvatar/DzCard/DzImageCard/DzImage.
</objective>

<requirements>
- 46 Dock: items scale by pointer proximity with neighbours easing (transform
  scale/translate, rAF-throttled); pointer-only; flat static row on touch/keyboard
  and under reduced motion; focus/click targets unaffected.
- 47 Card stack/swap: stacked cards; the top card cycles to the back on click/auto.
  Use startViewTransition (N1) when supported, FLIP fallback otherwise; instant
  reorder under reduced motion. Keyboard-operable (button to advance).
- 48 Glare: a v-glare directive (or v-tilt glare extension) overlaying a pointer-
  tracked specular highlight; flat under reduced motion / touch.
- 49 DzCursor: a smooth trailing cursor/blob confined to a host region (transform
  only, rAF); hidden/native cursor on touch and keyboard; never traps the pointer.
- 50 DzCompare: a before/after wipe with a draggable AND keyboard-operable handle
  (role="slider", arrow keys, aria-valuenow); reduced motion = no auto-animation
  (manual still works); first image or side-by-side as the static baseline.
- 51 DzLens: a magnifier circle following the pointer over an image (transform/
  background-position); pointer-only; no lens under reduced motion / touch.
- Register effects 46–51 in catalog.ts with snippets + chips.
</requirements>

<constraints>
- Pointer-only effects degrade to static on touch + keyboard + reduced motion and
  never move focus/click targets. Token-only; transform/opacity/filter only. No core
  changes; reuse N1 startViewTransition for 47. Extractable primitives.
</constraints>

<acceptance_criteria>
- Each effect is smooth on pointer devices and inert/static otherwise; DzCompare is
  fully keyboard-operable; card-swap morphs where View Transitions is supported and
  FLIPs otherwise; all degrade under reduced motion.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark.
</constraints>

<references>
- apps/landing/src/motion/directives/tilt.ts, magnetic.ts; useViewTransition.ts (N1);
  src/gallery/catalog.ts; packages/core DzIconButton, DzAvatar, DzCard, DzImageCard, DzImage
- docs/animations.md §5.5, §7
</references>
</task>
```

---

### [x] Task N8 — Scroll & layout: Bento reveal, Sticky scroll, Scroll-linked (effects 52–54)

```xml
<task id="N8" title="Build bento-reveal, sticky/pinned scroll, and scroll-linked transform effects and demos">
<role>You are a scroll-motion engineer who prefers compositor-driven CSS scroll-driven animations and always ships a JS/IO fallback that leaves content visible.</role>

<context>
Extend the scroll category with modern scroll-driven effects (docs/animations.md
§5.6). CSS scroll-driven animations (animation-timeline: view()/scroll()) are a
real perf win but are NOT Baseline (Firefox flag only) — use them as progressive
enhancement behind @supports, with the existing JS useScrollProgress/useInView as
the floor. Build on N1's supportsScrollTimeline(). Read docs/animations.md §3.1,
§5.6, §7.
</context>

<objective>
Deliver effects 52 Bento reveal (DzBentoReveal), 53 Sticky/pinned scroll
(useSticky/CSS), 54 Scroll-linked transforms — each enhanced with scroll-driven CSS
where supported and a correct JS fallback elsewhere.
</objective>

<requirements>
- 52 DzBentoReveal: a bento grid whose cells reveal with a shared spotlight + per-
  cell stagger as they enter view. Use animation-timeline: view() behind @supports;
  fall back to useInView + the N0 .dz-animate-in utilities. Reduced motion = all
  cells visible, no stagger.
- 53 Sticky/pinned scroll: a section that pins (position: sticky) while its content
  advances through steps; progress via scroll-driven CSS where supported, else
  useScrollProgress. Reduced motion = normal stacked flow, no pin-driven motion.
- 54 Scroll-linked transforms: an element whose transform/opacity is bound to scroll
  position (modernised parallax). animation-timeline: scroll()/view() behind
  @supports; v1 useScrollProgress fallback. Reduced motion = static end-state.
- The un-enhanced state is always correct and visible (never opacity:0 where
  unsupported). Register effects 52–54 in catalog.ts with snippets + chips.
</requirements>

<constraints>
- Progressive enhancement only; the JS path is the guaranteed floor. transform/
  opacity only. Token-only. No core changes. Reuse N1 supportsScrollTimeline().
</constraints>

<acceptance_criteria>
- In a scroll-timeline-capable browser the effects run on the compositor; in Firefox
  (no support) they fall back via JS with content fully visible and correct.
- All three degrade to a static/normal-flow state under reduced motion.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark.
</constraints>

<references>
- apps/landing/src/motion/useScrollProgress.ts, useInView.ts, useViewTransition.ts
  (supportsScrollTimeline); src/gallery/catalog.ts; packages/core DzCard
- docs/animations.md §3.1, §5.6, §7
</references>
</task>
```

---

### [x] Task N9 — Surfaces: Morphing dialog, Dynamic island, Native popover (effects 55–57)

```xml
<task id="N9" title="Build morphing-dialog, dynamic-island, and native-popover-entrance effects and demos">
<role>You are a Vue transition + native-API specialist who morphs surfaces with View Transitions, animates entry/exit with @starting-style, and keeps overlays accessible (focus, Esc, announce).</role>

<context>
Add the "Surfaces" category (docs/animations.md §5.7) — morphing/expanding overlay
motion built on native APIs from N1 (View Transitions, @starting-style +
allow-discrete, interpolate-size, Popover API), each with a <Transition>/FLIP
fallback. Build on N1 helpers and useReducedMotion. Add the 'surfaces' category to
CATEGORIES + a CATEGORY_ACCENTS pair. Read docs/animations.md §3.1, §5.7, §7.
</context>

<objective>
Deliver effects 55 Morphing dialog (DzMorph), 56 Dynamic island (DzIsland), 57
Native popover entrance — paired with DzCard/DzDialog/DzBadge/DzTooltip/DzMenu.
</objective>

<requirements>
- 55 DzMorph: a card that expands into a DzDialog sharing its position/size. Use a
  shared view-transition-name + startViewTransition (N1) when supported; FLIP
  fallback otherwise; instant open/close under reduced motion. Dialog keeps focus
  trap + Esc (drive core DzDialog's public API; do not fork it).
- 56 DzIsland: a compact pill that morphs to expanded content and back. Size via
  interpolate-size/@supports (FLIP fallback); content via @starting-style; instant
  under reduced motion. Announce expanded content politely.
- 57 Native popover entrance: a tooltip/menu using the Popover API (popover attr +
  popovertarget) animated in via @starting-style + transition-behavior:
  allow-discrete, behind @supports; <Transition> fallback otherwise. Native focus/
  Esc/light-dismiss preserved; instant under reduced motion.
- Custom keyframes never run under reduced motion. Register effects 55–57 in
  catalog.ts (with a 'native' badge field per §5 model note) + snippets + chips.
</requirements>

<constraints>
- Progressive enhancement; correct fallback everywhere. Drive core overlays via
  public API — no core changes, no forking internals. Token-only; transform/opacity
  only in keyframes. Extractable primitives.
</constraints>

<acceptance_criteria>
- Where supported, the dialog/island morph and the popover animates natively; with
  reduced motion or no support, each falls back to an accessible instant/Transition
  path with focus + Esc intact.
- `yarn workspace @dzup-ui/landing build` succeeds; the new "Surfaces" chip filters
  to exactly these effects; correct in light + dark.
</constraints>

<references>
- apps/landing/src/motion/useViewTransition.ts (N1), useReducedMotion.ts;
  src/gallery/catalog.ts; packages/core DzDialog, DzCard, DzBadge, DzTooltip, DzMenu
- docs/animations.md §3.1, §5.7, §7
</references>
</task>
```

---

### [x] Task N10 — Gallery UX v2: variant matrix, permalinks, native badge, registry groundwork

```xml
<task id="N10" title="Upgrade the gallery harness: variant matrix tabs, per-effect permalinks, native-API badge, and registry-export groundwork">
<role>You are a Vue 3 UI engineer who builds clean, accessible demo harnesses and cares about shareability, dark mode, and not breaking existing data.</role>

<context>
Competitor galleries win adoption with copy-paste-with-ownership and DX niceties
(docs/animations.md §3.2): a variant matrix (pick SFC vs composable vs utility),
per-effect permalinks, a "native API" badge, and a registry/copy story. Upgrade the
existing harness (src/gallery/AnimationCard.vue, catalog.ts, pages/AnimationsPage.vue)
additively — all current 36 entries must keep working unchanged. Read
docs/animations.md §3.2, §5 (model extension), §3.5.
</context>

<objective>
Extend CatalogEntry and AnimationCard so an effect can offer multiple code variants
(tabs), carry a native-API badge, and be deep-linked by id; lay the groundwork for
a shadcn-style registry export. No behavioural regression to existing effects.
</objective>

<requirements>
1. Catalog model (catalog.ts): add OPTIONAL fields — `variants?: { sfc?: string;
   composable?: string; css?: string }` (the variant matrix; falls back to the
   existing `code` when absent), `native?: { api: string; supports: string }` (e.g.
   { api: 'View Transitions', supports: 'caniuse/feature-detected' }), and confirm
   each entry's `id` is URL-safe. All existing entries remain valid (new fields
   optional).
2. AnimationCard.vue: when `variants` is present, render the "View code" block as
   tabs (SFC / Composable / CSS) with the Copy button copying the active tab; when
   absent, render the single `code` block exactly as today. Tabs are keyboard-
   accessible with a visible --dz-ring. When `native` is present, render a small
   badge ("View Transitions", etc.) next to the type chip with a tooltip noting the
   fallback.
3. Per-effect permalink: give each card an id anchor (e.g. id="effect-<id>") and a
   "copy link" affordance (or make the title a link to /animations#effect-<id>); on
   load, if the hash matches an effect id, scroll it into view and briefly highlight
   it. Preserve the existing category-hash behaviour (don't break #text etc. — treat
   effect ids and category ids distinctly).
4. Registry groundwork: add a build-time or static export (e.g. a script or a JSON
   emitted at build) describing each effect as a registry item (id, files,
   dependencies) following the shadcn registry-item shape, WITHOUT wiring a CLI yet
   — this is the data foundation for Open Decision D2-3. Document it briefly.
5. content-visibility: apply content-visibility: auto + contain-intrinsic-size to
   the bento cards (now ~57) to keep the larger gallery fast (§3.5), verifying it
   does not break the off-screen loop cap or cause scrollbar jump.
</requirements>

<constraints>
- Additive only: all 36 existing entries and the current single-code path must work
  unchanged. Token-only; no raw colors. Do not modify packages/core. Keep the
  harness effect-agnostic (adding an effect needs no AnimationCard change).
</constraints>

<acceptance_criteria>
- An entry with `variants` shows working SFC/Composable/CSS tabs with per-tab Copy;
  an entry without it renders as before. The `native` badge shows where set.
- A deep link /animations#effect-<id> scrolls to and highlights that card; category
  deep-links still work.
- The registry export emits valid registry-item JSON for every effect.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark; tabs +
  permalink controls are keyboard-reachable with a visible --dz-ring.
</constraints>

<example>
<!-- Catalog entry gaining a variant matrix + native badge (shape, not literal) -->
{
  id: 'morphing-dialog', title: 'Morphing dialog', category: 'surfaces',
  type: 'component', native: { api: 'View Transitions', supports: 'feature-detected' },
  variants: { sfc: '<DzMorph .../>', composable: 'const vt = useViewTransition()...' },
  code: '<!-- fallback single snippet -->', demo: defineAsyncComponent(...),
}
</example>

<references>
- apps/landing/src/gallery/AnimationCard.vue, catalog.ts; src/pages/AnimationsPage.vue
  (hash sync); src/components/ThemingDemo.vue (copy pattern); src/config.ts (deep-link helpers)
- docs/animations.md §3.2, §3.5, §5
</references>
</task>
```

---

### [x] Task N11 — QA v2: a11y / native-fallback / perf audit; update counts; go-live

```xml
<task id="N11" title="Final v2 QA: reduced-motion + native-fallback + a11y + perf audit, tile counts, go-live">
<role>You are a meticulous quality engineer auditing motion for accessibility, native-API fallbacks, theme correctness, and performance across a large gallery.</role>

<context>
All v2 effects (Tasks N3–N9), the foundation (N0–N2), and the harness upgrades
(N10) are in. Do the cross-cutting audit and finalise the Ecosystem tile and the
gallery counts. The bar is docs/animations.md §7 (which extends v1's §7) plus the
native-API progressive-enhancement rule from §4. Read docs/animations.md §3, §4,
§7 and CLAUDE.md Quality Gates; mirror the v1 audit format in animations-qa.md.
</context>

<objective>
Verify the whole /animations gallery against the v2 accessibility, native-fallback,
theme, and performance requirements; fix gaps; update the tile/gallery counts to
the shipped catalog; and record the audit.
</objective>

<requirements>
- Reduced-motion audit: with prefers-reduced-motion: reduce (OS) AND the page
  toggle, EVERY effect (old + new) shows a sane static/opacity fallback and no
  looping motion or running native transitions.
- Native-fallback audit: in a browser WITHOUT View Transitions / scroll-timeline /
  interpolate-size / @starting-style (or via forced detection), every enhanced
  effect falls back correctly with content visible and no breakage; in a capable
  browser the native path runs.
- A11y audit: prefers-reduced-transparency (glass/progressive-blur legible),
  forced-colors (beam/glare/glow/meteor have visible fallbacks), keyboard/focus
  (Replay, code tabs, permalink, compare slider, dock/cursor pointer-only, category
  + type filters) all reachable with a visible --dz-ring; no animation moves a focus
  target or traps focus; WCAG 2.2.2 — ambient loops >5s stop under reduced motion or
  expose a pause.
- Light/dark audit: every effect + the shell correct and AA-contrast in both themes.
- Performance: scroll the full ~57-card gallery; confirm content-visibility +
  off-screen loop cap keep it smooth, lazy chunks load, will-change clears. Note and
  fix any jank.
- Update the EcosystemGrid Animations tile meta to the final counts ("57 effects ·
  11 categories" or the actual shipped totals) and confirm route + nav links.
- Record a v2 QA checklist (append to animations-qa.md or a sibling note).
</requirements>

<constraints>
- Token-only fixes; no core changes. Do not weaken any reduced-motion or native
  fallback to pass a visual check. Do not introduce raw colors.
</constraints>

<acceptance_criteria>
- `yarn workspace @dzup-ui/landing build` succeeds.
- Matrix verified: {light, dark} × {motion on, reduced} × {native supported, native
  absent} across all categories with no regressions.
- The Animations tile is live with correct counts and routes to the complete v2
  gallery; the QA note records what was verified.
</constraints>

<references>
- docs/animations.md §3, §4, §7; animations-qa.md (v1 audit format); CLAUDE.md
  Quality Gates; all Task N0–N10 deliverables; src/components/EcosystemGrid.vue, data.ts
</references>
</task>
```

---

## 9. Open decisions (confirm before/while building)

| ID | Decision | Recommendation |
|---|---|---|
| **D2-1** | Promote the new semantic motion scale (`--dz-anim-*`) to `@dzup-ui/tokens`? | **Keep landing-local for v2** (N0), consistent with v1 D-2. Promote to tokens only once the `@dzup-ui/motion` extraction (D-2) happens, so the public token contract changes once. |
| **D2-2** | Adopt a JS motion lib (Motion for Vue / GSAP) for any v2 effect? | **No for the catalog** — every effect in §5 is achievable with CSS + native APIs + tiny rAF. Reserve GSAP (now free) as an opt-in power layer only if a future effect needs SplitText/MorphSVG; if `motion-v` is ever added, the global `<MotionConfig reducedMotion="user">` wrap is **mandatory** (§3.2 footgun). |
| **D2-3** | Ship a real shadcn-style registry + CLI (and MCP server)? | **Groundwork only in v2** (N10 emits registry-item JSON). Wire the CLI / MCP server as a follow-up once the catalog is stable and the `@dzup-ui/motion` packaging (D-2) is decided. |
| **D2-4** | New categories — keep `connections` + `surfaces` separate, or fold in? | **Separate.** They are distinct visitor intents and keep the filter scannable. Re-evaluate if either stays at < 3 effects. |
| **D2-5** | View Transitions for the gallery's own filter/route motion? | Use for **route** changes (N1). For the **filtered bento**, AutoAnimate (N2) is simpler and reduced-motion-safe; revisit shared-element morphs only if a clear win appears. |
| **D2-6** | `interpolate-size` / scroll-timeline are Chromium/partial — risk? | **Acceptable as progressive enhancement only** (N1/N8): the JS/CSS fallback is always the floor and the un-enhanced state is always correct. Never load-bearing. |

---

## 10. Phased roadmap

| Phase | Deliverable | Tasks |
|---|---|---|
| **v1 (shipped)** | 36 effects · 9 categories, filterable bento gallery, a11y + perf audit | 0–10 (done; `animations-old.md`) |
| **v2.0 — Foundation** | Semantic motion scale + parametric utilities; native-API layer + modernised transitions; `v-animate-on-scroll` + AutoAnimate + `DzPresence` | N0, N1, N2 |
| **v2.1 — New catalog** | +21 signature effects across Connections, Text, Numbers, Backgrounds, 3D/pointer, Scroll/layout, Surfaces | N3, N4, N5, N6, N7, N8, N9 |
| **v2.2 — DX & distribution** | Variant matrix, per-effect permalinks, native badge, registry-item export, `content-visibility` | N10 |
| **v2.3 — Go-live** | a11y/native-fallback/perf audit; tile flips to the final v2 counts | N11 |
| **Pro track (parallel)** | Pro animation catalog on `@dzup-ui-pro/pro`, authored in the pro Storybook; landing gains Pro-badged teasers | P0–P7 (`animations-old.md` §11) |
| **Later** | `@dzup-ui/motion` extraction (D-2); registry CLI + MCP server (D2-3); promote tokens (D2-1) | — |

---

## 11. Pro track — carried forward

The **Pro Animations** track — motion built on the `@dzup-ui-pro/pro` enterprise
components (charts, grids, boards, workflow, AI), surfaced in the same gallery with
a **Pro** badge and deep-linked into the pro Storybook (the landing app cannot
import Pro) — is specified in full in **[`animations-old.md` §11](./animations-old.md)**
(feasibility §11.1, the one hard constraint §11.2, the ~19-effect Pro catalog
§11.4, the Pro badge §11.5, and Tasks **P0–P7** §11.6 with the checklist §11.7).
That spec is **unchanged by v2** and remains the source of truth for Pro.

Two v2 touch-points to honour when the Pro track runs:
- **Pro teaser cards reuse the N10 harness.** The `tier: 'free' | 'pro'` +
  `proStorybookId` model from §11.5 composes with N10's `variants` / `native` /
  permalink fields — a Pro entry simply omits `variants`/`demo` and sets `tier`.
- **Pro effects can use the same v2 foundation.** The Pro Storybook's own motion
  module (Task P1) should re-implement the N0 semantic scale + N1 native-API
  helpers (not just v1's) so a future `@dzup-ui/motion` extraction (D-2 / D2-1)
  absorbs both repos.

---

## Appendix A — research sources (2026-06-25)

**Native browser APIs & performance:** MDN (View Transitions API, `@starting-style`,
`transition-behavior`, `interpolate-size`/`calc-size()`, scroll-driven animations,
Popover API, CSS Anchor Positioning, `prefers-reduced-motion`,
`prefers-reduced-transparency`, `forced-colors`, `content-visibility`,
`will-change`); web.dev (scroll-driven animations, animation performance / "Animations
guide", `content-visibility`); Chrome for Developers + WebKit blog (View Transitions,
scroll-driven case studies); caniuse / W3C WebDX Baseline; W3C WAI WCAG 2.3.3 &
2.2.2.

**Vue tooling:** vuejs.org (`<Transition>` / `<TransitionGroup>`); motion.dev
(Motion for Vue, `MotionConfig reducedMotion`); auto-animate.formkit.com; gsap.com +
webflow.com/blog (GSAP free announcement, Apr 2025); `@vueuse/motion` docs.

**Competitor libraries:** PrimeVue (`animateonscroll`, `ripple`, `styleclass`,
`tailwind`, Volt animations; `tailwindcss-primeui`); Bootstrap 5.3 (utilities API,
accessibility/reduced-motion, options); CoreUI (spinners, Vue collapse, "animate in
Vue"); Vuetify 3 (styles/transitions, `v-*-transition` API); Radix Primitives +
Reka UI + Nuxt UI (animation guides, `Presence`, measured-dimension vars);
Tailwind / `tailwindcss-animate` / `tw-animate-css`; shadcn (Tailwind v4,
registry-item schema); Chakra v3 (`Presence`, animations), Mantine (`Transition`,
`useReducedMotion`), Ant Design (motion spec), MUI (transitions,
`theme.transitions.create()`).

**Effect galleries:** Aceternity UI, Magic UI (+ MCP), Motion-Primitives, ReactBits
(+ jsrepo), Cult UI; Vue ports Inspira UI and Vue Bits.

*(Full per-claim URLs are in the two research-agent reports captured in this
session's transcript; the lists above are the authoritative source set.)*

## Appendix B — prompt-engineering method (why the tasks look like this)

The `<task>` blocks in §8 follow Anthropic's current prompt-engineering guidance so
an implementation agent runs each with minimal ambiguity:
- **Be clear, direct & detailed** — each task states the objective, the exact files,
  numbered/ordered requirements, and the build command; "above-and-beyond" quality
  is requested explicitly, not left to inference.
- **Add context & motivation** — each `<context>` says *why* (the research gap, the
  files involved), which Anthropic notes lets the model generalise to the goal.
- **Assign a role** (`<role>`) — primes the right expertise and tone.
- **Structure with XML tags** (`<context>`, `<objective>`, `<requirements>`,
  `<constraints>`, `<acceptance_criteria>`, `<references>`, `<example>`) — consistent,
  descriptive tags keep the prompt parseable.
- **Provide examples where shape matters** (`<example>` in Task N10).
- **Say what to do, not only what to avoid** — constraints are phrased positively
  ("progressive enhancement only"; "drive core via its public API") with only the
  few genuinely-hard "do nots" (no `packages/core` edits, no raw colors).
- **Define success** — explicit, checkable `<acceptance_criteria>` incl. the
  `yarn workspace @dzup-ui/landing build` gate, so "done" is verifiable.
- **Sequence & ground** — tasks are ordered with stated dependencies and point back
  to concrete repo files and this spec, avoiding hallucinated APIs.
- **Tuned for current models** — instructions are specific without over-prompting
  (no "CRITICAL/you MUST" inflation), matching the latest Claude guidance to dial
  back aggressive language so tools/skills don't over-trigger.
```
