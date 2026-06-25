# Animations — Design, Spec & Implementation Tasks

> **Status:** Proposal / specification. **No implementation yet.**
> **Owner:** dzup-ui team · **Last updated:** 2026-06-23
> **Scope:** The **"Animations"** ecosystem offering on the landing page — what it
> is, what happens when a visitor clicks the *Animations* tile, how the gallery is
> displayed, the catalog of ready-made motion effects (all built on **free**
> `@dzup-ui/core` components and design tokens), and the sequenced, prompt-style
> tasks to build it.
> **Companion doc:** [`landing.md`](./landing.md) (§4.6a "Ecosystem — beyond
> components", §7 "Motion & Animation"). This doc is the deep dive that §4.6a
> defers ("detail later").
> **Pro extension:** §1–§10 describe the **free** catalog built on `@dzup-ui/core`.
> [§11 "Pro Animations"](#11-pro-animations--extending-the-gallery-with-pro-components)
> adds a **parallel Pro track** — motion built on the `@dzup-ui-pro/pro`
> enterprise components — with its own catalog and tasks (Task P0–P7), each
> effect flagged as a **Pro** option via a badge on the demo block.

---

## 1. Purpose & Context

The landing page (`apps/landing`) already renders an **Ecosystem** section —
*"Beyond components"* — a grid of six placeholder tiles: **Blocks, Templates,
Animations, Icons, Themes, Figma kit** (`src/components/EcosystemGrid.vue`, fed by
`ECOSYSTEM` in `src/data.ts`). Every tile is currently a **non-interactive
"Planned" placeholder**.

This document turns the **Animations** tile into a real, shippable offering:
clicking it opens a dedicated **animation gallery** — dzup-ui's answer to
Aceternity UI / Magic UI / Motion-Primitives — where each effect is a **live,
replayable demo built from our own free components and `--dz-*` tokens**, with
copy-paste code. It is the first Ecosystem tile to go from "Planned" to "Live",
and it establishes the pattern the other tiles (Blocks, Templates) will follow.

**Why Animations first?** Per `landing.md` §4.6a, drop-in motion is *"the
fastest-growing 2025–26 category"* in the component-library ecosystem, it is the
cheapest of the three lead offerings to build (no new business logic, just motion
over components we already ship), and it directly reinforces the page's own
selling points (§7: *"motion should feel like the product is responsive"*).

**Design principle (carried from `landing.md` §4.6a / §6):** every animation is
built on the **same tokens, accessibility bar, and component set** as
`@dzup-ui/core`. No new color system, no parallel motion language — *"universal
for our current design, not a parallel system."* Every effect must honour
`prefers-reduced-motion` and animate **transform/opacity only** (no layout
thrash), exactly as `landing.md` §7 mandates.

---

## 2. Review of the Current State (what exists today)

A review of `apps/landing` and `packages/` establishes what we build *on*:

### 2.1 The entry point (today: inert)
- `src/components/EcosystemGrid.vue` — renders `ECOSYSTEM` tiles. Each tile is a
  `<li class="lp-card tile">` with icon + title + blurb + meta + a **`Planned`
  `DzBadge`**. **No click handler, no link.**
- `src/data.ts` → `EcosystemItem` interface: `{ icon, title, blurb, meta, status:
  'planned' }`. The **Animations** entry uses icon `Sparkles`, meta `Motion ·
  Effects`. The `status` union is `'planned'` only — there is no "available" state
  and no route/href field yet.
- `src/router.ts` — routes are `'/'` (HomePage) and `'/pro'` (ProPage) plus a
  catch-all redirect. **No `/animations` route.**
- `src/components/TopNav.vue` — nav links include an *Ecosystem* anchor
  (`{ path: '/', hash: '#ecosystem' }`) and a *Pro* route link.

### 2.2 Motion infrastructure already in place (reuse, don't reinvent)
- **`src/composables/useScrollReveal.ts`** — a `v-reveal` directive backed by a
  single shared `IntersectionObserver`; adds `.reveal` then `.is-revealed`;
  supports a stagger delay via `--reveal-delay`; degrades for no-IO and
  reduced-motion. **This is the seed of the scroll-reveal primitive family.**
- **`src/tailwind.css`** — defines the `.reveal` / `.is-revealed` transition, a
  `prefers-reduced-motion: reduce` block, `.lp-card--hover` (lift + glow),
  `.lp-aurora` (static brand blobs), `.lp-gradient-text` (static gradient),
  `.lp-grain-layer`, and `--dz-landing-theme-transition`. Several of these are
  **static effects begging for an animated variant** (aurora drift, gradient pan).
- **`src/components/ThemingDemo.vue`** — the reference pattern for an
  **interactive, code-emitting demo**: live component cluster + a `<pre>` code
  block + a *"Copy"* button using `navigator.clipboard`. The animation gallery's
  per-demo "Copy code" affordance should mirror this exactly.
- **`src/components/Section.vue`** — shared eyebrow → title → lede layout; every
  gallery section header should use it.
- **`src/pages/ProPage.vue`** — the reference pattern for a **dedicated
  ecosystem detail route** (full-bleed section, back-to-home CTA, token-only
  scoped styles, `DzBadge`/`DzCard`/`DzButton`/`DzHeading`/`DzText`). The
  `AnimationsPage` shell should follow its structure.

### 2.3 Motion tokens (the vocabulary all animations must speak)
From `packages/tokens/src/primitives/transitions.ts` (emitted as CSS vars):

| Token group | Values |
|---|---|
| `--dz-duration-fast` / `-normal` / `-slow` / `-slower` | `150ms` / `200ms` / `300ms` / `500ms` |
| `--dz-ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--dz-ease-in` / `-out` / `-in-out` | standard curves |
| `--dz-ease-bounce` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` |
| `--dz-transition-fast` / `-normal` / `-slow` | duration + `ease-default` shorthand |

**Rule:** animation durations/easings reference these tokens. Net-new keyframe
durations (e.g. a 6s aurora drift) that fall outside the scale are allowed as
**animation-local** values but should be defined once as `--dz-anim-*` constants
(see Task 0), never sprinkled as raw magic numbers.

### 2.4 Core components that already carry motion (reuse as building blocks)
`packages/core/src/components/` already ships motion-adjacent components — the
catalog **composes these** rather than re-implementing them:
`DzAnimatedNumber` (count-up), `DzScrollProgress` (scroll-linked bar),
`DzCountdown`, `DzSkeleton` (shimmer), `DzSpinner`, `DzStatCard`, `DzCarousel`,
`DzAvatarGroup`, `DzProgress`, `DzRating`, `DzTabs`, `DzAccordion`, `DzToast`.

> **Local-env note (carry from `landing.md` §9):** ESLint cannot run locally in
> this repo (see memory `lint-config-broken`). Validate every animation change
> with **`vite build`** (landing) and, for anything that touches `packages/core`,
> **`yarn typecheck`** + Vitest. Do **not** rely on `yarn lint`.

---

## 3. Competitive Research — what an "Animations" offering looks like

| Source | Model | What we take |
|---|---|---|
| **Aceternity UI** | 200+ copy-paste React/Tailwind effects | The **gallery-of-live-demos** format; each effect is its own card with a preview + code; heavy on hero/background/text effects |
| **Magic UI** | ~150 components/effects, shadcn-aligned | **Categorisation** (Text, Buttons, Backgrounds, Device mocks, Special effects); a "registry" install story; tasteful defaults |
| **Motion-Primitives** | Headless motion components for React + Framer Motion | **Primitive-first** API (composable building blocks: reveal, stagger, text-roll, cursor) rather than one-off snippets — the more maintainable model |
| **PrimeVue** | First-party CSS `@keyframes` + `<Transition>` helpers | Motion shipped as **token-driven CSS utilities**, no JS dependency for the common cases — matches our token-only ethos |
| **Vueuse / `@vueuse/motion`** | Vue-native directive (`v-motion`) + composables | A credible Vue dependency *if* we need spring physics; otherwise CSS + `IntersectionObserver` covers ~90% (per `landing.md` §7/§10.6) |

**Takeaways that shape our design:**
1. **Primitive-first, snippet-second.** Ship a small set of reusable primitives
   (directives/composables/components) and present each as a demo — not 30
   bespoke one-off snippets. Cheaper to maintain, on-brand with our contract-first
   library.
2. **Gallery = live demos + copy code.** Never a static GIF. The preview *is* the
   proof, exactly like our `ThemingDemo`.
3. **Categorise.** Visitors scan by intent (text, scroll, hero, hover…).
4. **Reduced-motion is a feature, not an afterthought** — and we can *show it off*
   with a "Reduce motion" preview toggle, which competitors rarely do.
5. **CSS-first.** Default to CSS `@keyframes`/transitions + `IntersectionObserver`;
   reserve a JS motion lib for the few effects that genuinely need it. (Resolves
   `landing.md` §10.6 — see Open Decision D-1.)

---

## 4. UX — "What happens when you click *Animations*?"

### 4.1 Decision: a dedicated `/animations` route (gallery page)

**Recommended:** clicking the Animations tile **routes to `/animations`**, a
full gallery page in the landing app — mirroring the `ProPage` precedent and the
Aceternity/Magic UI format.

*Alternatives considered & rejected:*
- *Open a modal/`DzDialog` over the home page* — too small for a 30-demo gallery;
  no deep-linkable URL; poor SEO.
- *Deep-link into Storybook* (like the component gallery tiles) — Storybook is
  component **documentation**, not a curated, marketing-grade motion showcase;
  the effects are landing-app compositions, not single components.
- *Inline-expand the tile on the home page* — breaks the scannable Ecosystem grid
  and buries the content.

A route gives us a shareable URL (`/animations`), SEO meta, the same scroll-reveal
chrome as the rest of the site, and room to grow (per-effect anchors like
`/animations#text-effects`).

### 4.2 Making the tile interactive

`EcosystemGrid.vue` must render an **available** tile as a navigational element:
- Extend `EcosystemItem` with `status: 'planned' | 'available'` and an optional
  `to?: string` (internal route). The **Animations** item becomes
  `status: 'available', to: '/animations'`; the rest stay `'planned'`.
- An `available` tile renders as a `<router-link>` (or `DzCard` with `:to`),
  shows a **`New`/`Live`** `DzBadge` (tone `primary`) instead of the muted
  `Planned` badge, gains the `.lp-card--hover` lift, and exposes a clear affordance
  (e.g. an `ArrowRight` that slides on hover). `planned` tiles stay exactly as
  they are today (inert, muted badge).
- Add `/animations` to `router.ts` and an **Animations** link to `TopNav` (both
  desktop nav and the mobile sheet), placed next to *Ecosystem*.

### 4.3 The gallery page layout (`AnimationsPage.vue`)

```
┌────────────────────────────────────────────────────────────┐
│ Page hero (Section): eyebrow "Ecosystem · Animations"      │
│   title "Motion, ready to drop in"                         │
│   lede + 2 CTAs ("Browse components", "Back to home")      │
│   + a global "Reduce motion" preview toggle (DzSwitch)     │  ← demos respect it live
├────────────────────────────────────────────────────────────┤
│ Sticky category nav (anchor chips or DzTabs):              │
│   Scroll · Text · Numbers · Backgrounds · Hover · Lists ·  │
│   Attention · Transitions                                  │
├────────────────────────────────────────────────────────────┤
│ For each category → Section + responsive grid of           │
│   <AnimationCard> demo tiles                                │
└────────────────────────────────────────────────────────────┘
```

### 4.4 The demo-tile anatomy (`AnimationCard.vue`)

Each animation is one **`AnimationCard`** — the gallery's atomic unit:

```
┌──────────────────────────────────────────┐
│  [ LIVE PREVIEW STAGE ]            ⟳ Replay│  ← live, re-triggerable; respects reduced-motion
│                                            │
├──────────────────────────────────────────┤
│  Title              <DzBadge>Composable>  │  ← title + a "type" chip (directive/composable/component/css)
│  One-line description                      │
│  Built with: DzCard · DzButton  (chips)    │  ← which free components it pairs with
│  [ </> View code ]   [ Copy ]              │  ← toggles a mono code block (ThemingDemo pattern)
└──────────────────────────────────────────┘
```

Requirements for the harness:
- **Live + replayable.** A *Replay* control re-mounts/re-triggers the effect (e.g.
  bump a `:key`, or toggle the `.is-revealed` class) so reviewers see it on demand
  without scrolling away and back.
- **Reduced-motion aware.** When the page-level "Reduce motion" toggle is on (or
  the OS sets `prefers-reduced-motion: reduce`), every preview shows its **reduced
  fallback** (instant/opacity-only). This doubly serves as accessibility proof.
- **Copy code.** Reuse the `ThemingDemo` clipboard pattern: a `<pre><code>` usage
  snippet + a *Copy* `DzButton` with the `Copy`→`Check` swap.
- **Token-only, light + dark.** Every preview must look correct in both themes
  (`landing.md` §6.4).

---

## 5. Architecture — where the animation code lives

### 5.1 Recommendation: a landing-local `motion` module now, extractable later

Build the primitives inside the landing app under **`apps/landing/src/motion/`**,
authored as a **self-contained module** so it can later be lifted into a published
`@dzup-ui/motion` package (or a `motion` family in `core`) without rewrites.

*Rationale:*
- The deliverable **now** is the gallery showcase, which lives in `apps/landing`.
- `landing.md` §4.6a explicitly defers the free-vs-pro and packaging decision per
  offering ("decide free-vs-pro per offering when each is built out") — so we
  should **not** prematurely carve a public package or touch `core`'s contract.
- Authoring it as a clean module (barrel export, no landing-only imports inside
  primitives) keeps the extraction path open (Open Decision D-2).

### 5.2 Proposed module structure

```
apps/landing/src/motion/
  index.ts                  # barrel: re-export every primitive
  tokens.css                # @keyframes + --dz-anim-* constants (single source of motion truth)
  useReducedMotion.ts       # reactive prefers-reduced-motion + page-level override (provide/inject)
  useInView.ts              # IntersectionObserver composable (generalises useScrollReveal)
  useCountUp.ts             # rAF number tween (or thin wrapper over DzAnimatedNumber)
  useTypewriter.ts          # typing/erasing text composable
  useScrollProgress.ts      # 0→1 scroll progress for parallax (or wrap DzScrollProgress)
  directives/
    reveal.ts               # v-reveal (migrated + extended: direction/blur/scale/stagger modifiers)
    tilt.ts                 # v-tilt — pointer-driven 3D tilt
    magnetic.ts             # v-magnetic — element eases toward cursor
  components/
    DzReveal.vue            # component wrapper around v-reveal (slot)
    DzStagger.vue           # staggers its children into view
    DzGradientText.vue      # animated gradient sweep over text
    DzCountUp.vue           # in-view count-up (wraps DzAnimatedNumber/useCountUp)
    DzMarquee.vue           # infinite horizontal marquee (logo/badge strip)
    DzBorderBeam.vue        # light traveling a card's border
    DzShimmer.vue           # skeleton/loading shimmer overlay
    DzAurora.vue            # drifting brand-blob background
    DzSpotlight.vue         # cursor-follow radial spotlight
    DzTilt.vue              # component wrapper for v-tilt
gallery/                    # the showcase UI (consumes src/motion/*)
  AnimationsPage.vue
  AnimationCard.vue
  catalog.ts                # the data model: every demo's metadata (title, category, type, components, code snippet)
```

> The `Dz`-prefixed names here are **landing-local** until/unless extracted; they
> intentionally mirror core's naming so an extraction is a move, not a rename.
> Where core already ships the capability (`DzAnimatedNumber`, `DzScrollProgress`,
> `DzSkeleton`), the motion wrapper should **compose** it, not duplicate it.

### 5.3 Cross-cutting rules (apply to every primitive)
1. **Transform/opacity only** for animated properties; never animate
   width/height/top/left/`box-shadow` size in a loop (use `transform`/`filter`).
2. **`prefers-reduced-motion`** honoured centrally via `useReducedMotion` (JS) and
   a `@media (prefers-reduced-motion: reduce)` block in `tokens.css` (CSS). The
   page-level toggle overrides via a `provide`d ref so the gallery can *demo* the
   fallback.
3. **Token-only values** — durations/easings from §2.3; colors from `--dz-*`
   (`landing.md` §6.1 / ADR-04). Net-new motion constants live as `--dz-anim-*` in
   `tokens.css`.
4. **SSR/`window`-safe** — guard `window`/`IntersectionObserver`/`matchMedia`
   (the existing `useScrollReveal` already models this).
5. **No layout-blocking** — content is visible even if JS/IO is unavailable
   (reveal-on-first-observe fallback, as today).
6. **`will-change` discipline** — set on entrance, clear after, to avoid GPU-layer
   bloat across a 30-demo page.

---

## 6. The Animation Catalog (ready-made effects on free components)

Nine categories, **36 ready-made effects**. Each is built from `@dzup-ui/core`
components and `--dz-*` tokens, has a reduced-motion fallback, and is exposed as a
reusable primitive (`type`: **D**irective / **C**omposable / **Cmp**onent / **CSS**
utility).

### 6.1 Scroll reveals — `#scroll`
| # | Name | What it does | Type | Pairs with | Reduced-motion fallback |
|---|---|---|---|---|---|
| 1 | **Fade & rise** | Opacity 0→1, translateY 14px→0 on view (formalises today's `v-reveal`) | D `v-reveal` | any section | opacity-only, 0.2s |
| 2 | **Stagger children** | Cascades grid/list children with a per-index delay | Cmp `DzStagger` | `DzCard` grid, `DzList` | all appear, no delay |
| 3 | **Directional slide-in** | Enters from left/right/up/down (`v-reveal.left`) | D | feature rows | opacity-only |
| 4 | **Blur-in** | `filter: blur(8px)→0` + fade | D `v-reveal.blur` | hero media, `DzImage` | fade only |
| 5 | **Scale-in** | `scale(0.96)→1` + fade | D `v-reveal.scale` | `DzStatCard` | fade only |
| 6 | **Scroll parallax drift** | Background layer moves at fractional scroll speed | Comp `useScrollProgress` | `DzAurora`, hero | static (no transform) |

### 6.2 Text effects — `#text`
| # | Name | What it does | Type | Pairs with | Fallback |
|---|---|---|---|---|---|
| 7 | **Gradient sweep** | Animated `background-position` over `lp-gradient-text` | Cmp `DzGradientText` | `DzHeading` | static gradient |
| 8 | **Typewriter** | Types/erases a rotating phrase | Comp `useTypewriter` / Cmp | hero subhead | final text shown instantly |
| 9 | **Word stagger** | Splits to words, reveals each in sequence | Cmp (uses `DzStagger`) | `DzHeading` | whole line fades |
| 10 | **Letter decode** | Scramble→resolve characters on view | Comp | eyebrow/labels | plain text |
| 11 | **Highlight sweep** | Animated marker/underline grows behind text | CSS util | `DzText` emphasis | static highlight |

### 6.3 Numbers & data — `#numbers`
| # | Name | What it does | Type | Pairs with | Fallback |
|---|---|---|---|---|---|
| 12 | **Count-up** | Tweens 0→N when scrolled into view | Cmp `DzCountUp` (wraps `DzAnimatedNumber`) | `SocialProof`, `DzStatCard` | final number shown |
| 13 | **Progress fill** | `DzProgress` animates 0→value on view | Comp + `DzProgress` | metrics | value set instantly |
| 14 | **Rating fill** | `DzRating` fills star-by-star on view | Comp + `DzRating` | testimonials | final rating shown |

### 6.4 Backgrounds & hero — `#backgrounds`
| # | Name | What it does | Type | Pairs with | Fallback |
|---|---|---|---|---|---|
| 15 | **Aurora drift** | Animates the existing `.lp-aurora` blobs (slow translate/scale) | Cmp `DzAurora` | hero, CTA | static blobs (today) |
| 16 | **Animated grid/dots** | Subtle panning dot/grid pattern | CSS util | section backdrops | static pattern |
| 17 | **Spotlight follow** | Radial light follows the cursor over a surface | Cmp `DzSpotlight` | `DzCard` hero | static soft glow |
| 18 | **Gradient border glow** | Animated conic gradient ring around a card | CSS util / Cmp | `DzCard` feature | static brand border |

### 6.5 Hover micro-interactions — `#hover`
| # | Name | What it does | Type | Pairs with | Fallback |
|---|---|---|---|---|---|
| 19 | **Card lift + glow** | translateY + shadow/border on hover (formalises `.lp-card--hover`) | CSS util | `DzCard` | none (instant border) |
| 20 | **3D tilt** | Card tilts toward pointer with parallax depth | D `v-tilt` | `DzImageCard`, `DzCard` | no tilt |
| 21 | **Sheen sweep** | Light streak crosses a button/card on hover | CSS util | `DzButton`, `DzCard` | no sheen |
| 22 | **Magnetic button** | Button eases slightly toward the cursor | D `v-magnetic` | `DzButton` (CTA) | static |
| 23 | **Border beam** | A light dot travels the card's border continuously | Cmp `DzBorderBeam` | `DzCard` | static border |

### 6.6 Lists & collections — `#lists`
| # | Name | What it does | Type | Pairs with | Fallback |
|---|---|---|---|---|---|
| 24 | **Stagger list-in** | Items enter one-by-one on view | Cmp `DzStagger` | `DzAvatarGroup`, `DzList`, `DzMenu` | all visible |
| 25 | **Marquee strip** | Infinite horizontal scroll of logos/badges | Cmp `DzMarquee` | `DzBadge`, `DzImage` (logo wall) | static, wrapped row |
| 26 | **Flip on change** | Value swaps with a flip when data updates | Comp | `DzBadge`, `DzTag` | instant swap |

### 6.7 Attention & status — `#attention`
| # | Name | What it does | Type | Pairs with | Fallback |
|---|---|---|---|---|---|
| 27 | **Pulse / ping** | Expanding ring on a notification dot | CSS util | `DzBadge`, `DzNotification` | static dot |
| 28 | **Shimmer skeleton** | Sweeping highlight over loading placeholders | Cmp `DzShimmer` (wraps `DzSkeleton`) | `DzSkeleton` | static placeholder |
| 29 | **Toast slide-in** | Toasts enter/stack with a slide+fade | Comp + `DzToast` | `DzToast` | appear instantly |

### 6.8 Transitions — `#transitions`
| # | Name | What it does | Type | Pairs with | Fallback |
|---|---|---|---|---|---|
| 30 | **Route transition** | Fade+slide between landing routes | Comp (`<router-view>` `<Transition>`) | router | instant route swap |
| 31 | **Tabs indicator slide** | Active-tab underline glides between tabs | Comp + `DzTabs` | `DzTabs` | instant move |
| 32 | **Accordion height** | Smooth expand/collapse (grid-rows/`height` via FLIP) | Comp + `DzAccordion` | `DzAccordion` | instant open/close |

### 6.9 Feedback & confirmation — `#feedback`
Micro-confirmations that close the loop on a **discrete user action** (submit, tap,
like) — distinct from the ambient/system-driven Attention family (§6.7). Each is
triggered by a gesture, resolves once, and uses transform/opacity/stroke only.
Displayed on the gallery between Attention and Transitions.

| # | Name | What it does | Type | Pairs with | Reduced-motion fallback |
|---|---|---|---|---|---|
| 33 | **Success check** | SVG ring + tick draw in (stroke-dashoffset) with a small pop on completion | Cmp `DzSuccessCheck` | `DzButton`, forms/checkout | mark shown fully drawn instantly |
| 34 | **Confetti burst** | Celebratory multi-colour particle pop on a milestone action | Cmp `DzConfetti` (exposes `burst()`) | `DzButton` (CTA) | `burst()` is a no-op (no particles) |
| 35 | **Error shake** | Damped horizontal shake + red invalid state rejects bad input | CSS util `.dz-shake` | `DzInput`, `DzButton` | no shake; invalid/red state only |
| 36 | **Like pop** | Toggle pops in scale and radiates colour sparks on the rising edge | Cmp `DzBurst` | `DzToggleButton`, `DzIconButton` | pressed/colour state only |

> **Counts to surface on the Ecosystem tile once live:** "36 effects · 9
> categories" (replacing the `Motion · Effects` meta), mirroring the count-contrast
> framing used elsewhere on the page.

> **Pro catalog:** This §6 catalog is the **free** set. A parallel **Pro**
> catalog — motion built on the `@dzup-ui-pro/pro` enterprise components
> (charts, grids, boards, workflow, AI) — is specified in
> [§11.4](#114-the-pro-animation-catalog-effects-on-pro-components). Pro effects
> are surfaced in the same gallery with a **Pro** badge but, per §11.2, their
> *live* demos are authored in the pro Storybook (the landing app cannot import
> pro components).

---

## 7. Accessibility & Performance Requirements (non-negotiable)

Applies to **every** effect (from `landing.md` §7/§8 + WCAG AA gate in CLAUDE.md):
- **`prefers-reduced-motion: reduce`** → no transform/parallax/auto-loops; reduce
  to a quick opacity change or the static end-state. Verified per effect.
- **Transform/opacity/filter only** — zero layout thrash; no animating layout
  properties in a loop.
- **No motion blocks content** — text is readable and interactive even if the
  animation never runs (no-JS / no-IO path).
- **Keyboard & focus** — interactive demos (Replay, Copy, toggles) are keyboard
  reachable with visible `--dz-ring` focus; animations never trap focus or move
  focusable targets out from under the pointer/keyboard.
- **No infinite auto-motion above the fold** without a pause affordance; respect
  the reduced-motion toggle globally.
- **Performance budget** — the gallery page must stay smooth with all demos
  mounted: lazy-init below-the-fold demos via `IntersectionObserver`, cap
  concurrent looping animations, clear `will-change` after entrances. Validate
  with `vite build` and a manual scroll check in light **and** dark.

---

## 8. Implementation Tasks

> **Authoring note — how these tasks are written.** Each task below is a
> ready-to-run **prompt** following Anthropic's prompt-engineering guidance
> (*Be clear & direct · give context and motivation · assign a role · structure
> with XML tags · provide examples · state explicit success criteria*; see
> Anthropic's "Prompt engineering overview" and the "Be clear, direct, and
> detailed" / "Use XML tags" / "Multishot prompting" / "Define success" guides).
> Run them **in order** (each builds on the previous). Hand a single
> `<task>` block to an implementation agent verbatim. Do **not** implement from
> this doc directly — the doc is the spec; the tasks are the build.

### Task checklist (tick as each lands)

- [ ] **Task 0** — Scaffold the `motion` module + reduced-motion foundation
- [ ] **Task 1** — Make the Ecosystem "Animations" tile interactive + add the route
- [ ] **Task 2** — Build the gallery shell: `AnimationsPage` + `AnimationCard` + catalog model
- [ ] **Task 3** — Scroll-reveal primitives (effects 1–6)
- [ ] **Task 4** — Text-effect primitives (effects 7–11)
- [ ] **Task 5** — Numbers & data motion (effects 12–14)
- [ ] **Task 6** — Backgrounds & hero ambient (effects 15–18)
- [ ] **Task 7** — Hover micro-interactions (effects 19–23)
- [ ] **Task 8** — Lists, collections & attention (effects 24–29)
- [ ] **Task 9** — Transitions (effects 30–32)
- [x] **Task 10** — QA, accessibility & performance pass; finalize the tile

> **Pro track (separate repo).** The Pro animation tasks **P0–P7** — motion on
> `@dzup-ui-pro/pro` components, authored in `dzup-ui-pro/apps/storybook` with a
> **Pro** badge on the landing gallery — are specified in
> [§11.6](#116-pro-implementation-tasks-p0p7) with their own checklist
> ([§11.7](#117-pro-task-checklist)). They depend on the free Tasks 0–2 (the
> catalog model + `AnimationCard` harness that the Pro badge extends) but are
> otherwise independent and can run in parallel with Tasks 3–10.

### Conventions referenced by every task
- **Repo:** `apps/landing` (Vite + Vue 3 `<script setup lang="ts">` + vue-router).
- **Styling:** scoped `<style>` is allowed in the landing app, but **values must be
  `--dz-*` tokens** (raw hex only as a `var(..., #fallback)`), per `landing.md`
  §6.1 / ADR-04. Motion durations/easings from §2.3 tokens; net-new constants as
  `--dz-anim-*` in `src/motion/tokens.css`.
- **Validation:** `yarn workspace @dzup-ui/landing build` (Vite). **Do not run
  `yarn lint`** (broken locally — memory `lint-config-broken`). For `packages/core`
  changes: `yarn typecheck` + Vitest.
- **A11y:** §7 of this doc applies to every task.

---

### [x] Task 0 — Scaffold the `motion` module + reduced-motion foundation

```xml
<task id="0" title="Scaffold the landing motion module and reduced-motion foundation">
<role>
You are a senior Vue 3 + TypeScript engineer on a design-system team. You write
small, composable, SSR-safe primitives and you treat accessibility and design
tokens as hard constraints, not nice-to-haves.
</role>

<context>
We are adding an "Animations" gallery to the dzup-ui landing app
(apps/landing). Before any individual effect is built, we need the shared
foundation: a motion module, a single source of motion truth (keyframes +
constants), and a reduced-motion mechanism that the whole gallery can read AND
override (so we can demo the fallback live). The landing app already has a
v-reveal directive in src/composables/useScrollReveal.ts and motion tokens
(--dz-duration-*, --dz-ease-*) from @dzup-ui/tokens. Read docs/animations.md §2,
§5, §7 first.
</context>

<objective>
Create the apps/landing/src/motion/ module skeleton and its reduced-motion +
in-view foundations, with nothing visual yet.
</objective>

<requirements>
- Create src/motion/ with: index.ts (barrel), tokens.css (@keyframes + --dz-anim-*
  constants placeholder, plus a `@media (prefers-reduced-motion: reduce)` reset
  block), useReducedMotion.ts, useInView.ts.
- useReducedMotion(): returns a reactive boolean that is true when EITHER
  window.matchMedia('(prefers-reduced-motion: reduce)') matches OR a page-level
  override is on. Expose a provide/inject pair (e.g. provideMotionPreference /
  useReducedMotion) so AnimationsPage can force "reduced" for the demo toggle.
  Must be SSR-safe (guard window/matchMedia) and reactive to OS changes.
- useInView(elRef, options?): wraps IntersectionObserver (generalise the logic in
  useScrollReveal.ts — single shared observer, unobserve on first intersect,
  no-IO fallback = "in view immediately"). Returns a reactive `isInView` ref.
- Import src/motion/tokens.css from src/main.ts (after tailwind.css).
- TypeScript strict; no `any`. Add concise JSDoc to each export.
</requirements>

<constraints>
- Do NOT modify packages/core. Do NOT animate anything yet.
- Token-only; SSR/window-safe; no new runtime dependencies in this task.
</constraints>

<acceptance_criteria>
- `yarn workspace @dzup-ui/landing build` succeeds.
- useReducedMotion reacts to both the OS setting and the injected override.
- useInView reveals immediately when IntersectionObserver is unavailable.
- src/motion/index.ts re-exports useReducedMotion, useInView, and the provide
  helper.
</acceptance_criteria>

<references>
- apps/landing/src/composables/useScrollReveal.ts (observer + fallback pattern)
- apps/landing/src/tailwind.css (existing reduced-motion block to mirror)
- docs/animations.md §5.3 (cross-cutting rules), §2.3 (motion tokens)
</references>
</task>
```

---

### [x] Task 1 — Make the Ecosystem "Animations" tile interactive + add the route

```xml
<task id="1" title="Wire the Animations entry point: interactive tile, route, nav link">
<role>You are a Vue 3 + vue-router engineer who values minimal, pattern-consistent diffs.</role>

<context>
Today the Ecosystem grid (apps/landing/src/components/EcosystemGrid.vue, data in
src/data.ts) renders six non-interactive "Planned" tiles. We are promoting the
"Animations" tile to a live, clickable entry that routes to a new /animations
page. Follow the existing ProPage route precedent (src/pages/ProPage.vue,
src/router.ts) and the TopNav link pattern (src/components/TopNav.vue). Read
docs/animations.md §4.2.
</context>

<objective>
Make the Animations tile navigate to /animations; leave the other five tiles
exactly as they are.
</objective>

<requirements>
- Extend EcosystemItem in src/data.ts: `status: 'planned' | 'available'` and an
  optional `to?: string`. Set the Animations item to
  { status: 'available', to: '/animations' }; update its meta to reflect the
  catalog ("32 effects · 8 categories"). Leave the other items 'planned'.
- In EcosystemGrid.vue: an 'available' tile renders as a <router-link :to="item.to">
  (keep the .lp-card look), shows a primary-tone "New" DzBadge instead of the
  muted "Planned" badge, gains .lp-card--hover, and shows an ArrowRight affordance
  that translates on hover. 'planned' tiles are visually unchanged and inert.
  Keep it accessible (the whole tile is one link; aria-label includes the title).
- Add a placeholder route { path: '/animations', name: 'animations', component: ... }
  to src/router.ts pointing at a stub AnimationsPage.vue (real content comes in
  Task 2). Register an icon if needed in src/icons.ts.
- Add an "Animations" link to TopNav (desktop nav-links AND the mobile sheet),
  next to "Ecosystem".
</requirements>

<constraints>
- No raw colors; token-only scoped styles. Do not regress the existing five tiles.
- Keep the diff scoped to data.ts, EcosystemGrid.vue, router.ts, TopNav.vue, icons.ts,
  and a minimal AnimationsPage.vue stub.
</constraints>

<acceptance_criteria>
- Clicking the Animations tile navigates to /animations (stub renders).
- The other tiles remain inert with the muted "Planned" badge.
- `yarn workspace @dzup-ui/landing build` succeeds; keyboard focus reaches the tile
  link with a visible --dz-ring.
</acceptance_criteria>

<references>
- apps/landing/src/components/EcosystemGrid.vue, src/data.ts, src/router.ts,
  src/components/TopNav.vue, src/pages/ProPage.vue
- docs/animations.md §4.1–4.2
</references>
</task>
```

---

### [x] Task 2 — Build the gallery shell: `AnimationsPage` + `AnimationCard` + catalog model

```xml
<task id="2" title="Build the animation gallery shell and demo-card harness">
<role>You are a Vue 3 UI engineer who builds clean, reusable demo harnesses and cares about a11y and dark mode.</role>

<context>
With the route live (Task 1) and the motion foundation in place (Task 0), build
the gallery chrome that every effect will plug into. Mirror the interactive-demo
pattern of src/components/ThemingDemo.vue (live cluster + code block + Copy
button) and the page structure of src/pages/ProPage.vue. Use the shared
Section.vue for headers. Read docs/animations.md §4.3–4.4, §6 (categories).
</context>

<objective>
Ship AnimationsPage.vue (category-organised gallery), AnimationCard.vue (the
replayable demo tile), and gallery/catalog.ts (the metadata model) — with 1–2
placeholder demos wired end-to-end to prove the harness. The full catalog lands
in Tasks 3–9.
</objective>

<requirements>
- gallery/catalog.ts: a typed CatalogEntry { id; title; category; type:
  'directive'|'composable'|'component'|'css'; blurb; components: string[]; code:
  string; demo: <async component or key> }. Export CATEGORIES (id+label, per §6)
  and a CATALOG array (seeded with 1–2 entries).
- AnimationsPage.vue: page hero via Section (eyebrow "Ecosystem · Animations"),
  a "Browse components" + "Back to home" CTA pair, and a page-level "Reduce
  motion" DzSwitch that calls provideMotionPreference (Task 0) so all demos show
  their fallback. A sticky category nav (anchor chips or DzTabs) linking to each
  category section. Then one Section per category rendering a responsive grid of
  AnimationCard.
- AnimationCard.vue: a live PREVIEW STAGE (renders entry.demo), a "Replay" control
  that re-triggers the effect (bump an internal :key), title + a "type" DzBadge,
  blurb, "Built with" component chips (DzBadge per entry.components), and a
  "View code" toggle revealing a <pre><code>{{ entry.code }}</code></pre> with a
  Copy DzButton (reuse the ThemingDemo clipboard + Copy→Check pattern).
- Reduced motion: when the page toggle is on OR the OS prefers reduced motion,
  previews must render their reduced fallback.
- Verify the page in BOTH light and dark; token-only styling; responsive grids
  (3→2→1 cols like EcosystemGrid).
</requirements>

<constraints>
- No raw colors. Reuse Section.vue, DzBadge, DzButton, DzCard, DzSwitch, DzText,
  DzHeading from @dzup-ui/core. Do not modify packages/core.
- The harness must be effect-agnostic: adding a catalog entry must require no
  changes to AnimationCard.
</constraints>

<acceptance_criteria>
- /animations renders the hero, category nav, and seeded demos in their categories.
- Replay re-triggers a demo; Copy copies the snippet; the Reduce-motion toggle
  flips every demo to its fallback live.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark.
</acceptance_criteria>

<example>
<!-- Sketch of the AnimationCard data flow (not literal code) -->
<AnimationCard :entry="entry" v-for="entry in CATALOG" :key="entry.id">
  <!-- preview stage renders <component :is="entry.demo" :key="replayKey" /> -->
</AnimationCard>
</example>

<references>
- apps/landing/src/components/ThemingDemo.vue (copy-code pattern),
  src/components/Section.vue, src/pages/ProPage.vue
- docs/animations.md §4.3–4.4, §6
</references>
</task>
```

---

### [x] Task 3 — Scroll-reveal primitives (catalog §6.1, effects 1–6)

```xml
<task id="3" title="Build the scroll-reveal primitive family and its demos">
<role>You are a motion engineer who builds IntersectionObserver-based reveals that are buttery, accessible, and token-driven.</role>

<context>
Migrate and extend the existing v-reveal (src/composables/useScrollReveal.ts) into
the motion module as the scroll-reveal family, and add their gallery demos. Build
on useInView/useReducedMotion from Task 0 and register each demo in catalog.ts
(Task 2). Read docs/animations.md §6.1, §5.3, §7.
</context>

<objective>
Deliver effects 1–6: Fade & rise, Stagger children, Directional slide-in, Blur-in,
Scale-in, Scroll parallax drift — each as a reusable primitive + a registered
catalog demo built on real @dzup-ui/core components (DzCard grid, DzStatCard,
DzImage, DzList).
</objective>

<requirements>
- directives/reveal.ts: v-reveal with modifiers .left/.right/.up/.down (direction),
  .blur, .scale, and an optional numeric value for stagger delay (preserve current
  behaviour as the default). DzReveal.vue + DzStagger.vue component wrappers.
- DzStagger applies an incremental --reveal-delay to its children (generalise the
  existing --reveal-delay usage in EcosystemGrid).
- Parallax: useScrollProgress (or wrap core DzScrollProgress) driving a transform
  on a layer; cap the travel; disable under reduced motion.
- Every effect: transform/opacity/filter only; reduced-motion fallback = opacity
  or static end-state; will-change set on entrance and cleared after.
- Register effects 1–6 in catalog.ts with accurate "Built with" component chips
  and a correct, copy-pasteable `code` snippet each.
</requirements>

<constraints>
- Token-only durations/easings (§2.3) and --dz-anim-* for net-new values.
- Do not modify packages/core. Keep primitives free of landing-only imports so they
  stay extractable.
</constraints>

<acceptance_criteria>
- All six demos animate on scroll/Replay and degrade correctly under the
  Reduce-motion toggle and OS setting.
- `yarn workspace @dzup-ui/landing build` succeeds; smooth in light + dark.
- The old src/composables/useScrollReveal.ts usage (HomePage v-reveal) still works
  (re-export or migrate without breaking HomePage).
</acceptance_criteria>

<references>
- apps/landing/src/composables/useScrollReveal.ts, src/components/EcosystemGrid.vue
  (stagger delay), src/pages/HomePage.vue (v-reveal consumers)
- packages/core DzScrollProgress, DzStatCard, DzCard, DzList, DzImage
- docs/animations.md §6.1
</references>
</task>
```

---

### [x] Task 4 — Text-effect primitives (catalog §6.2, effects 7–11)

```xml
<task id="4" title="Build the text-effect primitives and demos">
<role>You are a typographic-motion engineer; you split text accessibly (visible text stays in the DOM for screen readers) and animate with tokens.</role>

<context>
Add the text-effect family to src/motion and register demos. The landing app
already has a static .lp-gradient-text in tailwind.css to evolve into an animated
variant. Read docs/animations.md §6.2, §7.
</context>

<objective>
Deliver effects 7–11: Gradient sweep, Typewriter, Word stagger, Letter decode,
Highlight sweep — paired with DzHeading/DzText.
</objective>

<requirements>
- DzGradientText.vue: animates background-position over the existing brand gradient;
  static gradient under reduced motion.
- useTypewriter.ts (+ optional DzTypewriter wrapper): types/erases a rotating list
  of phrases with configurable speed/pause; reduced motion shows the final/first
  phrase instantly. Must not cause layout shift (reserve height).
- Word stagger: a component using DzStagger to reveal words sequentially; the full
  line must remain selectable and announced as one string (no per-letter spans that
  break screen-reader reading — wrap words, mark decorative pieces aria-hidden).
- Letter decode: scramble→resolve on in-view; reduced motion = plain text.
- Highlight sweep: a CSS utility animating a marker/underline behind DzText.
- Register effects 7–11 in catalog.ts with correct snippets + component chips.
</requirements>

<constraints>
- Accessibility first: animated text must remain readable by assistive tech and
  must not trigger layout shift. Token-only colors/timings. No core changes.
</constraints>

<acceptance_criteria>
- All five demos animate and degrade under reduced motion; text stays
  screen-reader-correct and shift-free.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark.
</acceptance_criteria>

<references>
- apps/landing/src/tailwind.css (.lp-gradient-text), DzHeading, DzText
- docs/animations.md §6.2
</references>
</task>
```

---

### [x] Task 5 — Numbers & data motion (catalog §6.3, effects 12–14)

```xml
<task id="5" title="Build count-up / progress / rating in-view motion">
<role>You are an engineer who animates data tastefully and reuses existing components instead of reinventing them.</role>

<context>
Core already ships DzAnimatedNumber, DzProgress and DzRating. Build thin in-view
wrappers that trigger them when scrolled into view, and register demos. Consider
wiring count-up into the real SocialProof section as a bonus. Read
docs/animations.md §6.3, §2.4.
</context>

<objective>
Deliver effects 12–14: Count-up (wrap DzAnimatedNumber), Progress fill, Rating
fill — each triggering on in-view via useInView, with instant final-state fallback.
</objective>

<requirements>
- DzCountUp.vue: composes DzAnimatedNumber (or useCountUp if a custom tween is
  needed); starts when isInView; respects reduced motion (show final number).
  Supports number formatting (thousands separators, suffixes like "k"/"+").
- Progress fill + Rating fill: small wrappers that set DzProgress value / DzRating
  model from 0 to target when in view; reduced motion sets the final value at once.
- Register effects 12–14 in catalog.ts with snippets + chips.
</requirements>

<constraints>
- Reuse core components; do not reimplement number tweening if DzAnimatedNumber
  suffices. Token-only. No core changes.
</constraints>

<acceptance_criteria>
- Numbers/progress/rating animate once when scrolled into view and on Replay;
  reduced motion shows final values instantly.
- `yarn workspace @dzup-ui/landing build` succeeds.
</acceptance_criteria>

<references>
- packages/core DzAnimatedNumber, DzProgress, DzRating, DzStatCard;
  apps/landing/src/components/SocialProof.vue
- docs/animations.md §6.3
</references>
</task>
```

---

### [x] Task 6 — Backgrounds & hero ambient (catalog §6.4, effects 15–18)

```xml
<task id="6" title="Build animated background and hero ambient effects">
<role>You are a GPU-conscious motion engineer; you keep ambient loops cheap and reduced-motion-safe.</role>

<context>
Evolve the static .lp-aurora / grain backdrops in tailwind.css into animated,
opt-in effects, and add cursor-driven hero ambiance. Read docs/animations.md
§6.4, §7 (no infinite auto-motion above the fold without respecting reduced
motion), §5.3.
</context>

<objective>
Deliver effects 15–18: Aurora drift, Animated grid/dots, Spotlight follow,
Gradient border glow — paired with DzCard/hero surfaces.
</objective>

<requirements>
- DzAurora.vue: animates the existing aurora blobs (slow translate/scale loop,
  e.g. 14–20s); static under reduced motion (current look).
- Animated grid/dots: CSS utility with a slow background-position pan; static
  fallback.
- DzSpotlight.vue: a radial light that follows the pointer over a surface
  (transform/opacity only, rAF-throttled); static soft glow under reduced motion;
  no effect on touch/keyboard-only.
- Gradient border glow: animated conic-gradient ring around a DzCard; static brand
  border under reduced motion.
- Cap concurrent loops; clear will-change; lazy-init when in view. Register effects
  15–18 in catalog.ts with snippets + chips.
</requirements>

<constraints>
- Token-only colors (--dz-colors-primary-*/secondary-*). Loops must pause/disable
  under reduced motion. No core changes; no layout thrash.
</constraints>

<acceptance_criteria>
- Effects loop smoothly, stay GPU-cheap, and fully disable under reduced motion.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark.
</acceptance_criteria>

<references>
- apps/landing/src/tailwind.css (.lp-aurora, .lp-grain-layer), DzCard
- docs/animations.md §6.4
</references>
</task>
```

---

### [x] Task 7 — Hover micro-interactions (catalog §6.5, effects 19–23)

```xml
<task id="7" title="Build hover micro-interaction primitives and demos">
<role>You are an interaction engineer who makes hover states feel alive without harming a11y or touch users.</role>

<context>
Formalise the existing .lp-card--hover lift and add pointer-driven micro-
interactions, paired with DzButton/DzCard/DzImageCard. Read docs/animations.md
§6.5, §7.
</context>

<objective>
Deliver effects 19–23: Card lift + glow, 3D tilt (v-tilt), Sheen sweep, Magnetic
button (v-magnetic), Border beam (DzBorderBeam).
</objective>

<requirements>
- Card lift + glow: promote .lp-card--hover into a documented CSS utility demo.
- directives/tilt.ts (v-tilt): pointer-driven rotateX/rotateY with perspective and
  optional glare; rAF-throttled; disabled on touch and under reduced motion.
- directives/magnetic.ts (v-magnetic): element eases toward the cursor within a
  small radius, springs back on leave; disabled on touch/reduced motion.
- Sheen sweep: CSS utility — a light streak crosses a DzButton/DzCard on hover.
- DzBorderBeam.vue: a light dot travels the card border on a loop; static under
  reduced motion.
- Pointer-only effects must never move keyboard focus targets or break click
  targets. Register effects 19–23 in catalog.ts with snippets + chips.
</requirements>

<constraints>
- Touch + reduced-motion + keyboard users get a sensible static state. Token-only.
  No core changes.
</constraints>

<acceptance_criteria>
- Hover effects are smooth on pointer devices and inert/static otherwise; focus
  and click targets are unaffected.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark.
</acceptance_criteria>

<references>
- apps/landing/src/tailwind.css (.lp-card--hover), DzButton, DzCard, DzImageCard
- docs/animations.md §6.5
</references>
</task>
```

---

### [x] Task 8 — Lists, collections & attention (catalog §6.6–6.7, effects 24–29)

```xml
<task id="8" title="Build list/collection and attention effects and demos">
<role>You are a motion engineer building looping and entrance effects that stay performant and accessible.</role>

<context>
Add collection entrances, an infinite marquee, and status/attention motion, paired
with DzAvatarGroup, DzBadge, DzSkeleton, DzToast, DzNotification. Read
docs/animations.md §6.6–6.7, §7.
</context>

<objective>
Deliver effects 24–29: Stagger list-in, Marquee strip (DzMarquee), Flip on change,
Pulse/ping, Shimmer skeleton (DzShimmer), Toast slide-in.
</objective>

<requirements>
- Stagger list-in: reuse DzStagger over DzAvatarGroup/DzList/DzMenu items.
- DzMarquee.vue: infinite horizontal scroll of a logo/badge strip; duplicates
  content for seamless loop; pauses on hover; static wrapped row under reduced
  motion; uses transform translate only.
- Flip on change: a small component that flips a DzBadge/DzTag value when it
  updates; instant swap under reduced motion.
- Pulse/ping: CSS utility expanding-ring on a notification dot (DzBadge/
  DzNotification); static dot under reduced motion.
- DzShimmer.vue: a sweeping highlight over DzSkeleton placeholders; static under
  reduced motion.
- Toast slide-in: demo of DzToast entering/stacking with slide+fade; appears
  instantly under reduced motion.
- Register effects 24–29 in catalog.ts with snippets + chips.
</requirements>

<constraints>
- Looping effects must pause/disable under reduced motion and not pin the CPU.
  Token-only. No core changes.
</constraints>

<acceptance_criteria>
- All six demos run smoothly and degrade under reduced motion; marquee loops
  seamlessly and pauses on hover.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark.
</acceptance_criteria>

<references>
- packages/core DzAvatarGroup, DzBadge, DzTag, DzSkeleton, DzToast, DzNotification,
  DzList, DzMenu
- docs/animations.md §6.6–6.7
</references>
</task>
```

---

### [x] Task 9 — Transitions (catalog §6.8, effects 30–32)

```xml
<task id="9" title="Build route and component transition effects and demos">
<role>You are a Vue transition specialist; you use <Transition>/<TransitionGroup> and FLIP correctly and accessibly.</role>

<context>
Add page/route and component-level transitions, paired with the router, DzTabs and
DzAccordion. Read docs/animations.md §6.8, §7.
</context>

<objective>
Deliver effects 30–32: Route transition (fade+slide between landing routes), Tabs
indicator slide, Accordion height.
</objective>

<requirements>
- Route transition: wrap <router-view> in a <Transition> (fade+slide); honour
  reduced motion (instant swap) and scrollBehavior already in router.ts. Must not
  break existing routes (/, /pro, /animations).
- Tabs indicator slide: a demo where the DzTabs active-underline glides between
  tabs (animate transform of an indicator element); instant move under reduced
  motion.
- Accordion height: smooth expand/collapse using grid-template-rows or a measured
  height/FLIP (avoid animating `auto`); instant under reduced motion; demo with
  DzAccordion.
- Register effects 30–32 in catalog.ts with snippets + chips.
</requirements>

<constraints>
- Do not regress existing routing/scroll behaviour. Prefer reusing core component
  internals over forking them. Token-only. Avoid layout-thrash height animation
  (use transform/grid-rows/FLIP). No core changes.
</constraints>

<acceptance_criteria>
- Route changes animate (and are instant under reduced motion) without breaking
  navigation; tabs/accordion demos animate and degrade correctly.
- `yarn workspace @dzup-ui/landing build` succeeds; correct in light + dark.
</acceptance_criteria>

<references>
- apps/landing/src/router.ts, src/App.vue; packages/core DzTabs, DzAccordion
- docs/animations.md §6.8
</references>
</task>
```

---

### [x] Task 10 — QA, accessibility & performance pass; finalize the tile

> **Done (2026-06-23).** Audit + go-live recorded in
> [`animations-qa.md`](./animations-qa.md). Build passes; all 32 effects verified
> across {light, dark} × {motion on, reduced}; tile is live (`32 effects · 8
> categories` → `/animations`). One perf gap fixed: an effect-agnostic off-screen
> loop cap in `AnimationCard` + `motion/tokens.css` (`.dz-stage-idle`).

```xml
<task id="10" title="Final QA: reduced-motion audit, light/dark, performance, tile go-live">
<role>You are a meticulous quality engineer auditing motion for accessibility, theme correctness, and performance.</role>

<context>
All 32 effects (Tasks 3–9) are implemented and registered in catalog.ts. Do the
cross-cutting audit and finalize the Ecosystem tile's "live" state. Read
docs/animations.md §7 and the Quality Gates in CLAUDE.md.
</context>

<objective>
Verify the whole /animations gallery against the accessibility and performance
requirements, fix gaps, and confirm the Ecosystem "Animations" tile reflects the
shipped catalog.
</objective>

<requirements>
- Reduced-motion audit: with prefers-reduced-motion: reduce (OS) AND the page
  toggle, EVERY demo shows a sane static/opacity fallback and no looping motion.
- Light/dark audit: every demo correct and contrast-AA in both themes.
- Keyboard/focus audit: Replay, Copy, category nav, toggles all reachable with a
  visible --dz-ring; no animation moves focus targets or traps focus.
- Performance: scroll the full page with all demos mounted; confirm below-the-fold
  demos lazy-init, looping effects are capped, and will-change is cleared after
  entrances. Note any jank and fix.
- Update the EcosystemGrid Animations tile meta/badge to the final catalog counts
  (32 effects · 8 categories) and confirm the route + nav link.
- Produce a short QA checklist in this file's Appendix (or a sibling QA note)
  recording what was verified.
</requirements>

<constraints>
- Token-only fixes; no core changes. Do not weaken any reduced-motion fallback to
  pass a visual check.
</constraints>

<acceptance_criteria>
- `yarn workspace @dzup-ui/landing build` succeeds.
- Manual matrix verified: {light, dark} × {motion on, reduced} across all 8
  categories with no regressions.
- The Animations tile is live with correct counts and routes to a complete gallery.
</acceptance_criteria>

<references>
- docs/animations.md §7; CLAUDE.md Quality Gates; all Task 3–9 deliverables
</references>
</task>
```

---

## 9. Open Decisions (confirm before/while building)

| ID | Decision | Recommendation |
|---|---|---|
| **D-1** | CSS-only vs a JS motion lib (`@vueuse/motion`) | **Default CSS `@keyframes`/transitions + IntersectionObserver** (covers ~90%; zero new deps). Add `@vueuse/motion` *only* if spring physics for tilt/magnetic prove necessary — decide during Task 7. (Resolves `landing.md` §10.6.) |
| **D-2** | Keep animations landing-local vs extract to `@dzup-ui/motion` | **Landing-local now**, authored for extraction (§5.1). Revisit once 2–3 ecosystem offerings exist. |
| **D-3** | Free vs Pro for Animations | **Free** for the launch catalog (it sells the free library). The Pro "effects pack" is now **specified** as a parallel track in [§11](#11-pro-animations--extending-the-gallery-with-pro-components) — built on `@dzup-ui-pro/pro` and authored in the pro Storybook (the landing app cannot import pro; see §11.2). Ship the free catalog first; the Pro track (Task P0–P7) follows. |
| **D-4** | Category nav: anchor chips vs `DzTabs` | Lean **sticky anchor chips** (deep-linkable `/animations#text`); `DzTabs` is a fine alternative if filtering (not just jumping) is wanted. |
| **D-5** | Per-effect "open in Storybook/playground" link | Out of scope for v1; revisit if effects become a real package (D-2). |

---

## 10. Phased Roadmap

| Phase | Deliverable | Tasks |
|---|---|---|
| **0 — this doc** | Spec + tasks approved | — |
| **1 — Foundation** | Motion module, reduced-motion, in-view; tile interactive; gallery shell | 0, 1, 2 |
| **2 — Catalog** | All 32 effects across 8 categories, registered as live demos | 3, 4, 5, 6, 7, 8, 9 |
| **3 — Go-live** | A11y/theme/perf audit; tile flips to live with final counts | 10 |
| **4 — Pro track** | Pro animation catalog on `@dzup-ui-pro/pro` (charts, grids, boards, workflow, AI), authored in the pro Storybook; landing gallery gains **Pro**-badged teaser cards deep-linking into it (§11) | P0, P1, P2, P3, P4, P5, P6, P7 |
| **5 — Later** | Optional `@dzup-ui/motion` extraction (D-2); apply count-up/reveals to the home page itself | — |

---

## 11. Pro Animations — extending the gallery with Pro components

> **What this section adds.** §1–§10 specify the **free** catalog (32 effects on
> `@dzup-ui/core`). This section specifies a **parallel Pro track**: motion built
> on the **`@dzup-ui-pro/pro`** enterprise components (charts, data grids, boards,
> workflow, AI), surfaced in the same gallery with a **Pro** badge on each demo
> block, plus its own prompt-style tasks (P0–P7). It is the answer to the question
> *"can we also do animations with the Pro components?"* — **yes**, with one
> architectural constraint (§11.2) that the tasks below are written around.

### 11.1 Feasibility verdict (the review you asked for)

**Yes — Pro animations are buildable, and they are a strong offering.** A review of
the Pro workspace establishes it:

- **The motion vocabulary is shared.** `@dzup-ui-pro/pro` consumes the same
  `@dzup-ui/tokens` (so `--dz-duration-*`, `--dz-ease-*`, `--dz-transition-*` from
  §2.3 are all available) and follows the same conventions as core — token-only
  styling, `tailwind-variants`, Contract Spec v1, WCAG AA (`dzup-ui-pro/CLAUDE.md`).
  Every cross-cutting rule in §5.3 and every a11y rule in §7 applies **unchanged**.
- **Pro ships motion-rich, demo-worthy surfaces.** 41 components across 8 families
  (`builders`, `business`, `communication`, `data-pro`, `editors`, `planning`,
  `visualization`, `workflow`) — many are inherently animated: charts that can
  *draw on*, gauges that *sweep*, kanban cards that *reorder*, gantt bars that
  *grow*, workflow edges that *draw*, an AI assistant that *streams*. These make
  far richer "wow" demos than the free primitives.
- **Several already carry transitions today** (`grep` finds `transition-*` /
  `@keyframes` in `DzApprovalFlow`, `DzAuditLog`, `DzDataGridPro`, `DzWorkflow*`,
  `DzAiAssistant`, `DzCalendar`, …) — so the Pro track is mostly *formalising and
  showcasing* motion the components hint at, not inventing it.

### 11.2 The one hard constraint — where Pro demos can live

**The landing app cannot import Pro components.** This is the architectural fact
that shapes every Pro task:

- `apps/landing/package.json` depends on **only** `@dzup-ui/core` + `@dzup-ui/tokens`.
  It has **no** dependency on `@dzup-ui-pro/pro` (confirmed: zero references to
  `@dzup-ui-pro` / `pro/storybook` anywhere under `apps/landing`).
- Pro lives in a **separate repo/workspace** (`dzup-ui-pro/`, own `yarn.lock`,
  restricted GitHub npm registry). It is showcased in **`dzup-ui-pro/apps/storybook`**
  (`@dzup-ui-pro/storybook-pro`, dev port 6007), whose `.storybook/main.ts` aliases
  the sibling OSS `core`/`tokens`/`contracts` for local dev.
- The landing already treats Pro as **Phase-1 "coming soon" marketing**
  (`config.ts` → `PRO_LIVE = false`, `LINKS.pro = '/pro'`; `ProPage.vue` /
  `FreeVsPro.vue`). Wiring the landing to build against Pro would break that
  boundary (and the free-vs-pro packaging story `landing.md` §4.6a keeps separate).

**Therefore the Pro track splits across the two repos:**

| Where | What | Why |
|---|---|---|
| **`dzup-ui-pro/apps/storybook`** (Pro repo) | The **live, replayable Pro animation demos** — authored as Storybook stories + an MDX **"Animations"** gallery doc, reusing a `ProAnimationCard` harness that mirrors the free `AnimationCard` (preview stage · Replay · type/Pro badge · Built-with chips · Copy code). | The only place Pro components can be imported and rendered. |
| **`dzup-ui/apps/landing`** (`/animations` gallery) | A **Pro** category band of **teaser cards** — poster/preview + blurb + a **Pro** badge + an **"Open in Pro Storybook"** deep-link. **No live Pro component runs here**; the preview is a static poster, short video/`<canvas>` loop, or a free-token CSS mimic. | Landing can't import Pro, but it *can* advertise the Pro pack and route to it — exactly the `PRO_LIVE` coming-soon pattern already in `config.ts`. |

This mirrors how the gallery treats Storybook elsewhere (§4.1: "deep-link into
Storybook" was rejected for the *free* curated demos, but it is exactly right for
*Pro*, whose components are heavy and already documented in their own Storybook).

### 11.3 Pro motion reuse (don't reinvent the free foundation)

- **Reuse the free foundation conceptually**, re-implement minimally in Pro. The
  `useReducedMotion` / `useInView` / `tokens.css` foundation from **Task 0** is
  authored landing-local; the Pro Storybook needs the same primitives. Task **P1**
  stands up a small `dzup-ui-pro/apps/storybook/src/motion/` (or
  `packages/pro/src/composables/motion/` if it should ship) that re-implements the
  same three (SSR-safe `prefers-reduced-motion`, shared `IntersectionObserver`,
  `--dz-anim-*` constants) against the shared tokens — keeping the eventual
  `@dzup-ui/motion` extraction (D-2) able to absorb both.
- **Compose Pro components' existing motion**, don't fork it. Where a Pro component
  already animates (e.g. `DzApprovalFlow` step transitions, `DzWorkflowDesigner`
  edges), the demo drives its public props/events to *trigger* the motion rather
  than re-styling internals (Pro is `tailwind-variants` + token-only, like core —
  **no `<style scoped>`, no raw colors**; `dzup-ui-pro/CLAUDE.md`).
- **Validation differs from the free repo.** Pro tasks validate with
  `yarn workspace @dzup-ui-pro/storybook-pro build` (Storybook build) and, for any
  `packages/pro` change, `yarn typecheck` + Vitest **from the `dzup-ui-pro` repo**.
  As in the free repo, **do not rely on `yarn lint` locally** (memory
  `dzup-ui-local-env`).

### 11.4 The Pro animation catalog (effects on Pro components)

Five Pro categories, **~19 ready-made effects**, each built on `@dzup-ui-pro/pro`
components + shared `--dz-*` tokens, each with a reduced-motion fallback, each
flagged **Pro**. Type key as in §6 (**D**irective / **C**omposable / **Cmp**onent /
**CSS**). Category anchors are `#pro-*` so they can coexist with the free `#scroll`
etc. on the same page.

#### 11.4.1 Pro data & tables — `#pro-data`
| # | Name | What it does | Type | Pairs with (Pro) | Reduced-motion fallback |
|---|---|---|---|---|---|
| P1 | **Grid skeleton → data reveal** | Rows fade/stagger in as the grid swaps loading skeleton for data | Comp + Cmp | `DzDataGridPro`, `DzSkeleton` | rows appear instantly |
| P2 | **Virtual row fade** | Newly virtualised rows fade in on fast scroll | Comp | `DzVirtualTable` | instant rows |
| P3 | **Pivot expand/collapse** | Group rows expand with measured-height/FLIP (no `auto` thrash) | Comp | `DzPivotTable` | instant open/close |
| P4 | **Filter chip pop** | Filter chips scale+fade in/out as rules are added/removed | CSS util | `DzFilterBuilder`, `DzQuickFilter`, `DzQueryBuilder` | instant add/remove |

#### 11.4.2 Pro charts & visualization — `#pro-viz`
| # | Name | What it does | Type | Pairs with (Pro) | Fallback |
|---|---|---|---|---|---|
| P5 | **Series draw-on** | Lines/areas draw via `stroke-dashoffset`; bars grow from baseline on view | Comp | `DzChart` | final chart shown |
| P6 | **Sparkline trace** | Stroke draws left→right on in-view | Comp | `DzSparkline` | static line |
| P7 | **Gauge sweep** | Arc/needle eases 0→value | Comp | `DzGauge` | final value |
| P8 | **Funnel / Sankey flow** | Segments cascade in; Sankey ribbons fade along flow | Comp | `DzFunnelChart`, `DzSankeyDiagram` | final diagram |
| P9 | **Network settle** | Force layout eases to rest then idles; respects reduced motion (static layout) | Comp | `DzNetworkGraph` | pre-settled static layout |
| P10 | **Scorecard count + delta** | Count-up of the metric + delta arrow rise (composes the free Count-up #12) | Cmp | `DzScorecard`, `DzAnimatedNumber` | final number + static delta |

#### 11.4.3 Pro planning & boards — `#pro-planning`
| # | Name | What it does | Type | Pairs with (Pro) | Fallback |
|---|---|---|---|---|---|
| P11 | **Kanban card FLIP** | Cards animate to new positions on drag/drop/reorder (FLIP) | Comp | `DzKanban`, `DzKanbanCard` | instant reposition |
| P12 | **Gantt bar grow + dependency draw** | Bars grow from their start date; dependency arrows draw in | Comp | `DzGantt`, `DzGanttTaskRow` | final bars/arrows |
| P13 | **Calendar/Scheduler event slide** | Events slide/fade when the view or range changes | Comp | `DzCalendar`, `DzScheduler` | instant view swap |
| P14 | **MindMap branch expand** | Child nodes expand outward from their parent on toggle | Comp | `DzMindMap` | instant expand/collapse |

#### 11.4.4 Pro workflow & builders — `#pro-workflow`
| # | Name | What it does | Type | Pairs with (Pro) | Fallback |
|---|---|---|---|---|---|
| P15 | **Workflow edge draw + node drop** | Nodes drop/scale in; edges draw between them | Comp | `DzWorkflowDesigner`, `DzWorkflowNode`, `DzWorkflowEdge` | instant nodes/edges |
| P16 | **Approval step progress** | Active step pulses; the connector fills as the flow advances | CSS util + Comp | `DzApprovalFlow` | static current step |
| P17 | **Builder drop-in** | A dropped widget/field settles with scale+fade into the grid | Comp | `DzDashboardBuilder`, `DzFormBuilder` | instant placement |

#### 11.4.5 Pro AI & communication — `#pro-ai`
| # | Name | What it does | Type | Pairs with (Pro) | Fallback |
|---|---|---|---|---|---|
| P18 | **AI streaming type** | Assistant tokens stream in; tool-call cards expand as they resolve | Comp | `DzAiAssistant`, `DzToolCallCard`, `DzAiMarkdown` | full response shown instantly |
| P19 | **Chat message + typing dots** | Message bubbles slide+fade in; an animated typing indicator precedes a reply | Comp + CSS util | `DzChat`, `DzChatMessage` | instant message, static dots |

> **Counts to surface on the Pro band / teaser tile:** "19 Pro effects · 5
> categories", framed alongside the free "32 effects · 8 categories".

### 11.5 The "Pro" badge on the demo block

Both galleries share the `AnimationCard` anatomy from §4.4; Pro is one extra flag:

- **Catalog model.** Extend `CatalogEntry` (Task 2) with `tier: 'free' | 'pro'`
  (default `'free'`). The Pro entries set `tier: 'pro'` and add a `proStorybookId`
  (the deep-link target) instead of an in-app `demo` component.
- **The badge.** A Pro card renders a **`DzBadge` tone `primary`, variant `solid`,
  label "Pro"** in the card header (next to the existing `directive/composable/…`
  type chip) — the visual "this is a Pro option" marker you asked for. Mirror the
  primary-tone Pro badge already used in `FreeVsPro.vue` / `ProPage.vue` so it reads
  as the same Pro language across the site.
- **The block behaviour differs by tier** (per §11.2):
  - **`tier: 'free'`** → live, replayable in-app demo (unchanged from §4.4).
  - **`tier: 'pro'`** → a **teaser block**: poster/preview (static image, short
    muted autoplay loop, or token-only CSS mimic) + the **Pro** badge + a
    primary **"Open in Pro Storybook"** link (gated behind `PRO_LIVE`; until then
    it points at the `/pro` waitlist, matching today's Phase-1 wiring). **No Pro
    component is imported or executed in the landing app.**
- The *real* live version of each Pro effect is the Storybook story authored by
  Tasks P2–P6 in `dzup-ui-pro/apps/storybook`.

### 11.6 Pro implementation tasks (P0–P7)

> Same authoring rules as §8 (ready-to-run prompts; run **in order**; hand a single
> `<task>` block to an agent verbatim). **Pro tasks P0–P1 build on free Tasks 0–2.**
> Tasks **P0** runs in the **`dzup-ui` (landing)** repo; tasks **P1–P6** run in the
> **`dzup-ui-pro`** repo; **P7** touches both.

#### Pro conventions referenced by every Pro task
- **Landing-side repo:** `apps/landing` (`@dzup-ui/landing`) — **never import
  `@dzup-ui-pro/pro` here.** Pro shows up only as teaser data + badge + deep-link.
- **Pro-side repo:** `dzup-ui-pro/` — demos authored in `apps/storybook`
  (`@dzup-ui-pro/storybook-pro`); shared primitives in
  `apps/storybook/src/motion/` (or `packages/pro/src/composables/` if they should
  ship). Token-only, `tailwind-variants`, **no `<style scoped>` / no raw colors**
  (`dzup-ui-pro/CLAUDE.md`).
- **Validation:** landing → `yarn workspace @dzup-ui/landing build`. Pro →
  `yarn workspace @dzup-ui-pro/storybook-pro build` (+ `yarn typecheck` & Vitest in
  the Pro repo for `packages/pro` changes). **Do not run `yarn lint`** locally
  (memory `dzup-ui-local-env`).
- **A11y / motion rules:** §5.3 + §7 of this doc apply **unchanged** to every Pro
  effect (reduced-motion fallback, transform/opacity/filter only, keyboard/focus,
  no infinite above-the-fold motion without a pause/disable path).

---

#### [ ] Task P0 — Add the Pro tier to the gallery: badge, teaser cards, deep-link (landing repo)

```xml
<task id="P0" title="Add a Pro tier to the animation gallery: Pro badge, teaser cards, and deep-link">
<role>You are a Vue 3 + TypeScript engineer who respects package boundaries and ships minimal, pattern-consistent diffs.</role>

<context>
The free animation gallery (Tasks 0–2) renders live demos from @dzup-ui/core in
apps/landing. We now want to ALSO advertise a "Pro" animation pack built on
@dzup-ui-pro/pro — but the landing app must NOT depend on or import the Pro
package (apps/landing/package.json deps are @dzup-ui/core + @dzup-ui/tokens only;
Pro is a separate restricted-registry workspace). So Pro effects appear in the
gallery as BADGED TEASER CARDS that deep-link into the Pro Storybook, never as
live in-app demos. Follow the existing Phase-1 Pro wiring (src/config.ts PRO_LIVE,
LINKS.pro; the primary-tone Pro badge in FreeVsPro.vue / ProPage.vue). Read
docs/animations.md §11.2, §11.4–11.5 first.
</context>

<objective>
Extend the catalog model and AnimationCard so a catalog entry can be tier:'pro',
rendering a Pro badge + a poster + an "Open in Pro Storybook" link instead of a
live demo — with NO new dependency on @dzup-ui-pro/pro. Seed the five Pro
categories and 1–2 Pro teaser entries to prove the pattern.
</objective>

<requirements>
- Extend CatalogEntry (gallery/catalog.ts, Task 2): add `tier: 'free' | 'pro'`
  (default 'free'), and for Pro entries `proStorybookId: string` (deep-link target)
  + an optional `poster` (image path / short loop / 'css-mimic' marker). Pro
  entries have NO `demo` component.
- Add the five Pro categories from §11.4 to CATEGORIES with `#pro-*` ids
  (pro-data, pro-viz, pro-planning, pro-workflow, pro-ai), each marked so the page
  can group/badge them as a "Pro" band. Seed 1–2 Pro entries (e.g. P5 "Series
  draw-on", P11 "Kanban card FLIP") as teasers.
- Add a Pro deep-link helper to src/config.ts: PRO_STORYBOOK_BASE + a
  proStorybookStory(id) builder, mirroring storybookStory(). Gate live targets
  behind PRO_LIVE: while false, the link falls back to LINKS.pro (waitlist).
- AnimationCard.vue: when entry.tier === 'pro', render (a) a primary-tone solid
  DzBadge "Pro" in the header next to the type chip, (b) the poster in the preview
  stage instead of a live demo (no <component :is>), and (c) a primary
  "Open in Pro Storybook" DzButton/link (target from proStorybookStory). Free cards
  are unchanged. Adding a Pro entry must require NO change to AnimationCard.
- AnimationsPage.vue: render the Pro categories as a clearly delimited "Pro" band
  (e.g. a Section with an eyebrow "Ecosystem · Animations · Pro" and the Pro count
  "19 Pro effects · 5 categories"), after the free categories.
</requirements>

<constraints>
- DO NOT add @dzup-ui-pro/pro (or any Pro path) to apps/landing — no import, no
  dependency, no alias. Token-only styles; no raw colors. Do not regress the free
  demos or the existing five Ecosystem tiles.
- Reuse the existing Pro badge styling/tone from FreeVsPro.vue/ProPage.vue so the
  Pro language is consistent site-wide.
</constraints>

<acceptance_criteria>
- The gallery shows a Pro band whose cards carry a "Pro" badge, a poster preview,
  and an "Open in Pro Storybook" link (pointing at the waitlist while PRO_LIVE is
  false). No Pro component is imported.
- `yarn workspace @dzup-ui/landing build` succeeds; keyboard focus reaches the Pro
  link with a visible --dz-ring; correct in light + dark.
</acceptance_criteria>

<references>
- apps/landing/src/components/FreeVsPro.vue, src/pages/ProPage.vue (Pro badge + Pro
  link pattern), src/config.ts (STORYBOOK_BASE/storybookStory, PRO_LIVE, LINKS.pro)
- gallery/catalog.ts, AnimationCard.vue, AnimationsPage.vue (Task 2 deliverables)
- docs/animations.md §11.2, §11.4–11.5
</references>
</task>
```

---

#### [ ] Task P1 — Stand up the Pro Storybook motion foundation + Animations gallery doc (pro repo)

```xml
<task id="P1" title="Scaffold the Pro Storybook motion foundation and the Animations gallery harness">
<role>You are a senior Vue 3 + TypeScript engineer on the dzup-ui Pro team; SSR-safe, token-driven, accessibility-first.</role>

<context>
Work in the dzup-ui-pro repo. Pro components are showcased in
apps/storybook (@dzup-ui-pro/storybook-pro), which aliases the sibling OSS
core/tokens for local dev (.storybook/main.ts) and themes via data-theme
(.storybook/preview.ts). We need the Pro equivalent of the free Task 0/2
foundation: a reduced-motion + in-view module and a reusable ProAnimationCard
demo harness, plus an MDX "Animations" gallery doc — so each Pro effect (Tasks
P2–P6) plugs in uniformly. Motion tokens (--dz-duration-*, --dz-ease-*) come from
the shared @dzup-ui/tokens already imported in preview.ts. Read docs/animations.md
§11.2–11.3, §5.3, §7.
</context>

<objective>
Create apps/storybook/src/motion/ (useReducedMotion, useInView, tokens.css with
--dz-anim-* + a prefers-reduced-motion reset) and a ProAnimationCard story
component (preview stage · Replay · type + "Pro" badge · Built-with chips · Copy
code) that mirrors the free AnimationCard. Add an MDX "Animations" overview doc
and register one placeholder Pro demo story end-to-end.
</objective>

<requirements>
- apps/storybook/src/motion/: useReducedMotion.ts (reactive matchMedia +
  SSR-safe), useInView.ts (shared IntersectionObserver, no-IO = in-view immediately),
  tokens.css (@keyframes + --dz-anim-* constants + a
  `@media (prefers-reduced-motion: reduce)` reset). Import tokens.css from
  apps/storybook/src/tailwind.css or preview.ts.
- A ProAnimationCard.vue helper (under apps/storybook/src/) usable from stories:
  slot for the live preview, a Replay control (bump :key), title + type DzBadge +
  a primary "Pro" DzBadge, "Built with" chips, and a Copy-code block (mirror the
  free AnimationCard/ThemingDemo clipboard + Copy→Check pattern). Reuse DzBadge/
  DzButton from @dzup-ui/core (already aliased).
- An MDX doc at apps/storybook/stories/ (the main.ts globs `../stories/**/*.mdx`)
  titled "Animations" introducing the Pro catalog (§11.4) and how each story maps
  to a catalog id — this is the live counterpart the landing teasers deep-link to.
- One placeholder story (e.g. under packages/pro/stories/visualization or a new
  apps/storybook stories area) rendering ProAnimationCard around a trivial Pro
  component to prove the harness, with a stable story id for the landing deep-link.
- TypeScript strict; SSR/window-safe; concise JSDoc.
</requirements>

<constraints>
- Token-only; no raw colors; no `<style scoped>` in any shipped Pro component
  (apps/storybook helpers may use scoped styles with --dz-* values only). Do not
  duplicate number/observer logic the free Task 0 already proved — re-implement the
  same minimal shape so a later @dzup-ui/motion extraction can absorb both (D-2).
- Do not change Pro component public APIs.
</constraints>

<acceptance_criteria>
- `yarn workspace @dzup-ui-pro/storybook-pro build` succeeds; the "Animations" MDX
  doc and the placeholder ProAnimationCard story render in both themes.
- useReducedMotion reacts to the OS setting; useInView reveals immediately with no
  IntersectionObserver; Replay re-triggers; Copy copies the snippet.
</acceptance_criteria>

<references>
- dzup-ui-pro/apps/storybook/.storybook/main.ts (aliases, story globs),
  preview.ts (theme decorator); packages/pro/stories/** (story style)
- dzup-ui/apps/landing/src/components/ThemingDemo.vue (copy-code pattern, for parity)
- docs/animations.md §11.2–11.3, §4.4, §5.3
</references>
</task>
```

---

#### [ ] Task P2 — Pro data & tables motion (catalog §11.4.1, effects P1–P4)

```xml
<task id="P2" title="Build Pro data & table animations and their Storybook demos">
<role>You are a data-table motion engineer; you animate large collections without layout thrash and keep virtualisation smooth.</role>

<context>
Work in dzup-ui-pro. Build the data/table Pro effects as ProAnimationCard stories
(harness from P1), driving the real Pro components' public props/events. Read
docs/animations.md §11.4.1, §5.3, §7.
</context>

<objective>
Deliver P1 Grid skeleton→data reveal, P2 Virtual row fade, P3 Pivot expand/collapse,
P4 Filter chip pop — each as a registered Storybook demo with a copy-pasteable
snippet and a reduced-motion fallback.
</objective>

<requirements>
- P1: a DzDataGridPro demo that swaps DzSkeleton placeholders for data with a
  staggered row fade (transform/opacity only); reduced motion shows rows at once.
- P2: a DzVirtualTable demo where rows entering the viewport fade in; must not break
  virtualisation or scroll perf; reduced motion = instant.
- P3: a DzPivotTable demo expanding/collapsing groups via measured-height or FLIP
  (never animate `auto`/`height` naively); reduced motion = instant.
- P4: a filter-chip pop (scale+fade) on add/remove for DzFilterBuilder/DzQuickFilter
  (or DzQueryBuilder); reduced motion = instant.
- Each story uses ProAnimationCard with accurate "Built with" chips, the "Pro"
  badge, and a correct Copy snippet; each honours useReducedMotion from P1.
</requirements>

<constraints>
- Drive components via their public API; do not fork internals or add raw colors.
  Token-only timings (§2.3) + --dz-anim-* for net-new. No public-API changes.
</constraints>

<acceptance_criteria>
- All four demos animate on Replay/in-view and degrade under the OS reduced-motion
  setting; virtual scrolling stays smooth.
- `yarn workspace @dzup-ui-pro/storybook-pro build` succeeds; correct in light + dark.
</acceptance_criteria>

<references>
- packages/pro/src/components/data-pro/* (DzDataGridPro, DzVirtualTable,
  DzPivotTable, DzFilterBuilder, DzQuickFilter, DzQueryBuilder); P1 ProAnimationCard
- docs/animations.md §11.4.1
</references>
</task>
```

---

#### [ ] Task P3 — Pro charts & visualization motion (catalog §11.4.2, effects P5–P10)

```xml
<task id="P3" title="Build Pro chart & visualization animations and demos">
<role>You are a data-viz motion engineer; you draw-on charts with stroke/scale, never re-layout per frame, and respect reduced motion.</role>

<context>
Work in dzup-ui-pro. Build the visualization Pro effects as ProAnimationCard
stories (P1 harness). Several viz components accept data/animation props already;
prefer those over re-implementing. Read docs/animations.md §11.4.2, §6.3 (count-up
reuse), §7.
</context>

<objective>
Deliver P5 Series draw-on (DzChart), P6 Sparkline trace (DzSparkline), P7 Gauge
sweep (DzGauge), P8 Funnel/Sankey flow (DzFunnelChart/DzSankeyDiagram), P9 Network
settle (DzNetworkGraph), P10 Scorecard count + delta (DzScorecard).
</objective>

<requirements>
- P5: DzChart lines/areas draw via stroke-dashoffset and bars grow from baseline on
  in-view; reduced motion = final chart.
- P6: DzSparkline stroke draws left→right on in-view; reduced motion = static.
- P7: DzGauge arc/needle eases 0→value; reduced motion = final value.
- P8: DzFunnelChart segments cascade; DzSankeyDiagram ribbons fade along flow;
  reduced motion = final.
- P9: DzNetworkGraph force layout eases to rest then idles; reduced motion renders a
  pre-settled static layout (no running simulation).
- P10: DzScorecard count-up (compose @dzup-ui/core DzAnimatedNumber / free effect
  #12) + delta-arrow rise; reduced motion = final number, static delta.
- Each as a ProAnimationCard story with chips, "Pro" badge, Copy snippet, in-view
  trigger via P1 useInView.
</requirements>

<constraints>
- Reuse component animation props where they exist; transform/opacity/SVG-stroke
  only — no per-frame layout. Token-only; no raw colors. No public-API changes.
</constraints>

<acceptance_criteria>
- All six demos animate once on in-view/Replay and degrade to a static final state
  under reduced motion; no dropped frames on a normal laptop.
- `yarn workspace @dzup-ui-pro/storybook-pro build` succeeds; correct in light + dark.
</acceptance_criteria>

<references>
- packages/pro/src/components/visualization/* (DzChart, DzSparkline, DzGauge,
  DzFunnelChart, DzSankeyDiagram, DzNetworkGraph, DzScorecard); @dzup-ui/core
  DzAnimatedNumber; P1 ProAnimationCard
- docs/animations.md §11.4.2, §6.3
</references>
</task>
```

---

#### [ ] Task P4 — Pro planning & boards motion (catalog §11.4.3, effects P11–P14)

```xml
<task id="P4" title="Build Pro planning & board animations and demos">
<role>You are an interaction engineer who animates drag/drop and timelines with FLIP, accessibly and smoothly.</role>

<context>
Work in dzup-ui-pro. Build the planning Pro effects as ProAnimationCard stories
(P1 harness), driving DzKanban/DzGantt/DzCalendar/DzScheduler/DzMindMap public
APIs. Read docs/animations.md §11.4.3, §7 (no focus theft on reorder), §5.3.
</context>

<objective>
Deliver P11 Kanban card FLIP (DzKanban), P12 Gantt bar grow + dependency draw
(DzGantt), P13 Calendar/Scheduler event slide (DzCalendar/DzScheduler), P14 MindMap
branch expand (DzMindMap).
</objective>

<requirements>
- P11: cards animate to new positions on reorder/drag-drop using FLIP (transform
  only); reduced motion = instant reposition; never move keyboard focus out from
  under the user.
- P12: DzGantt bars grow from their start; dependency arrows draw in (stroke);
  reduced motion = final bars/arrows.
- P13: DzCalendar/DzScheduler events slide+fade when the range/view changes; reduced
  motion = instant view swap.
- P14: DzMindMap child nodes expand outward from the parent on toggle; reduced motion
  = instant.
- Each as a ProAnimationCard story with chips, "Pro" badge, Copy snippet, reduced-
  motion honoured via P1 useReducedMotion.
</requirements>

<constraints>
- FLIP/transform only — no animating layout properties per frame. Token-only; no raw
  colors. Drive via public API; no public-API changes. Drag demos must stay keyboard-
  and screen-reader-safe.
</constraints>

<acceptance_criteria>
- All four demos animate on interaction/Replay and degrade under reduced motion
  without breaking drag, keyboard, or focus.
- `yarn workspace @dzup-ui-pro/storybook-pro build` succeeds; correct in light + dark.
</acceptance_criteria>

<references>
- packages/pro/src/components/planning/* (DzKanban, DzGantt, DzCalendar,
  DzScheduler, DzMindMap); P1 ProAnimationCard
- docs/animations.md §11.4.3
</references>
</task>
```

---

#### [ ] Task P5 — Pro workflow & builders motion (catalog §11.4.4, effects P15–P17)

```xml
<task id="P5" title="Build Pro workflow & builder animations and demos">
<role>You are a node-graph motion engineer; you draw edges and settle nodes without thrashing layout, and you keep canvases accessible.</role>

<context>
Work in dzup-ui-pro. Build the workflow/builder Pro effects as ProAnimationCard
stories (P1 harness), driving DzWorkflowDesigner/DzApprovalFlow/DzDashboardBuilder/
DzFormBuilder. Some already ship transitions — compose, don't fork. Read
docs/animations.md §11.4.4, §7.
</context>

<objective>
Deliver P15 Workflow edge draw + node drop (DzWorkflowDesigner), P16 Approval step
progress (DzApprovalFlow), P17 Builder drop-in (DzDashboardBuilder/DzFormBuilder).
</objective>

<requirements>
- P15: nodes drop/scale in; edges draw between them (stroke-dashoffset); reduced
  motion = instant nodes/edges.
- P16: active step pulses and the connector fills as the flow advances (build on
  DzApprovalFlow's existing transitions); reduced motion = static current step.
- P17: a dropped widget/field settles with scale+fade into the builder grid;
  reduced motion = instant placement.
- Each as a ProAnimationCard story with chips, "Pro" badge, Copy snippet; reduced
  motion via P1.
</requirements>

<constraints>
- Compose existing component motion; transform/opacity/SVG-stroke only. Token-only;
  no raw colors. No public-API changes; canvas demos stay keyboard-navigable.
</constraints>

<acceptance_criteria>
- All three demos animate on Replay/interaction and degrade under reduced motion;
  no layout thrash on the canvas.
- `yarn workspace @dzup-ui-pro/storybook-pro build` succeeds; correct in light + dark.
</acceptance_criteria>

<references>
- packages/pro/src/components/workflow/* (DzWorkflowDesigner, DzWorkflowNode,
  DzWorkflowEdge, DzApprovalFlow); builders/* (DzDashboardBuilder, DzFormBuilder);
  P1 ProAnimationCard
- docs/animations.md §11.4.4
</references>
</task>
```

---

#### [ ] Task P6 — Pro AI & communication motion (catalog §11.4.5, effects P18–P19)

```xml
<task id="P6" title="Build Pro AI & communication animations and demos">
<role>You are a conversational-UI motion engineer; you stream text and animate chat without layout shift or breaking screen readers.</role>

<context>
Work in dzup-ui-pro. Build the AI/comms Pro effects as ProAnimationCard stories
(P1 harness), driving DzAiAssistant/DzChat. DzAiAssistant already supports streaming
markdown and tool-call cards — drive those. Read docs/animations.md §11.4.5, §7
(announce streamed content politely; no layout shift).
</context>

<objective>
Deliver P18 AI streaming type (DzAiAssistant + DzToolCallCard), P19 Chat message +
typing dots (DzChat + DzChatMessage).
</objective>

<requirements>
- P18: assistant tokens stream in and tool-call cards expand as they resolve (use
  the component's streaming API); reduced motion shows the full response instantly.
  No layout shift; streamed text announced via an aria-live polite region.
- P19: message bubbles slide+fade in; an animated typing indicator (3 dots) precedes
  a reply; reduced motion = instant message + static dots.
- Each as a ProAnimationCard story with chips, "Pro" badge, Copy snippet; reduced
  motion via P1.
</requirements>

<constraints>
- Animated/streamed text must remain screen-reader-correct and shift-free. Token-
  only; no raw colors. No public-API changes.
</constraints>

<acceptance_criteria>
- Both demos animate and degrade under reduced motion; streamed/typed text stays
  readable by assistive tech and causes no layout shift.
- `yarn workspace @dzup-ui-pro/storybook-pro build` succeeds; correct in light + dark.
</acceptance_criteria>

<references>
- packages/pro/src/components/communication/* (DzAiAssistant, DzToolCallCard,
  DzAiMarkdown, DzChat, DzChatMessage); P1 ProAnimationCard
- docs/animations.md §11.4.5
</references>
</task>
```

---

#### [ ] Task P7 — Pro QA + wire the landing teasers to the live Pro demos (both repos)

```xml
<task id="P7" title="Pro QA pass and connect the landing teaser cards to the live Pro Storybook demos">
<role>You are a meticulous quality engineer auditing cross-repo motion for accessibility, theme correctness, performance, and correct deep-links.</role>

<context>
All Pro effects (Tasks P2–P6) are live in dzup-ui-pro/apps/storybook, and the
landing gallery has Pro teaser cards (Task P0). Do the cross-cutting audit and
connect each landing teaser's proStorybookId to the matching live story. Read
docs/animations.md §7, §11.2, §11.5 and dzup-ui-pro/CLAUDE.md Quality Gates.
</context>

<objective>
Verify every Pro demo against the a11y/perf/theme bar, finalise the landing Pro
band (accurate counts, correct deep-links, gated by PRO_LIVE), and confirm no Pro
code leaked into the landing build.
</objective>

<requirements>
- Reduced-motion audit (Pro Storybook): with prefers-reduced-motion: reduce, EVERY
  Pro demo shows a sane static/final fallback and no running loops/simulations.
- Light/dark audit: every Pro demo correct and AA-contrast in both themes.
- Keyboard/focus audit: Replay/Copy and any interactive demo controls are reachable
  with a visible --dz-ring; drag/canvas demos don't trap or steal focus.
- Performance: charts/grids/graphs animate once and idle cheaply; network/force and
  marquee-like loops are capped or settle.
- Landing: set each Pro teaser's proStorybookId to the real story id from P2–P6;
  confirm the "Open in Pro Storybook" link resolves (and falls back to the waitlist
  while PRO_LIVE is false). Update the Pro band counts to "19 Pro effects · 5
  categories". Re-confirm apps/landing has NO @dzup-ui-pro dependency/import.
- Record a short Pro QA checklist in this doc's Appendix (or a sibling note).
</requirements>

<constraints>
- Token-only fixes; no Pro public-API changes; do not weaken any reduced-motion
  fallback to pass a visual check. Do not introduce a landing→Pro dependency.
</constraints>

<acceptance_criteria>
- `yarn workspace @dzup-ui-pro/storybook-pro build` AND
  `yarn workspace @dzup-ui/landing build` both succeed.
- Matrix verified: {light, dark} × {motion on, reduced} across all 5 Pro
  categories; every landing teaser deep-links to its live story; no Pro import in
  the landing bundle.
</acceptance_criteria>

<references>
- All Task P0–P6 deliverables; dzup-ui-pro/CLAUDE.md (Quality Gates);
  docs/animations.md §7, §11.2, §11.5
</references>
</task>
```

### 11.7 Pro task checklist (tick as each lands)

- [ ] **Task P0** — Pro tier in the gallery: badge + teaser cards + deep-link (landing)
- [ ] **Task P1** — Pro Storybook motion foundation + Animations gallery harness (pro)
- [ ] **Task P2** — Pro data & tables motion (P1–P4)
- [ ] **Task P3** — Pro charts & visualization motion (P5–P10)
- [ ] **Task P4** — Pro planning & boards motion (P11–P14)
- [ ] **Task P5** — Pro workflow & builders motion (P15–P17)
- [ ] **Task P6** — Pro AI & communication motion (P18–P19)
- [ ] **Task P7** — Pro QA + connect landing teasers to live demos (both repos)

---

### Appendix A — Reference facts used in this spec
- **Entry point today:** `apps/landing/src/components/EcosystemGrid.vue` +
  `ECOSYSTEM` in `src/data.ts` — Animations tile is an inert "Planned" placeholder
  (icon `Sparkles`, meta `Motion · Effects`).
- **Reuse:** `src/composables/useScrollReveal.ts` (`v-reveal`), `src/tailwind.css`
  (`.reveal`, `.lp-aurora`, `.lp-gradient-text`, `.lp-card--hover`, reduced-motion
  block), `src/components/ThemingDemo.vue` (copy-code pattern), `Section.vue`,
  `ProPage.vue` (route precedent).
- **Motion tokens:** `--dz-duration-{fast 150 / normal 200 / slow 300 / slower
  500}ms`, `--dz-ease-{default,in,out,in-out,bounce}`,
  `--dz-transition-{fast,normal,slow}` (`packages/tokens/src/primitives/transitions.ts`).
- **Core components reused:** `DzAnimatedNumber`, `DzScrollProgress`, `DzSkeleton`,
  `DzSpinner`, `DzStatCard`, `DzCarousel`, `DzAvatarGroup`, `DzProgress`,
  `DzRating`, `DzTabs`, `DzAccordion`, `DzToast`, `DzBadge`, `DzCard`, `DzButton`,
  `DzImage`/`DzImageCard`, `DzList`, `DzMenu`, `DzNotification`, `DzText`,
  `DzHeading`, `DzSwitch`.
- **Catalog size:** **32 effects across 8 categories** (Scroll, Text, Numbers,
  Backgrounds, Hover, Lists, Attention, Transitions).
- **Pro catalog (§11):** **19 effects across 5 categories** (Pro data, Pro viz,
  Pro planning, Pro workflow, Pro AI) on `@dzup-ui-pro/pro` (41 components, 8
  families). Authored in `dzup-ui-pro/apps/storybook` (`@dzup-ui-pro/storybook-pro`,
  dev port 6007); the landing app **does not** depend on `@dzup-ui-pro/pro`
  (deps are `@dzup-ui/core` + `@dzup-ui/tokens` only), so Pro effects appear as
  **Pro**-badged teaser cards that deep-link into the pro Storybook.
- **Hard constraints:** token-only values (ADR-04), `prefers-reduced-motion`
  honoured, transform/opacity/filter only, light + dark verified, WCAG AA;
  validate with `vite build` (ESLint is broken locally — memory
  `lint-config-broken`).

### Appendix B — Prompt-engineering method (why the tasks look like this)
The Task blocks in §8 follow Anthropic's prompt-engineering guidance so an
implementation agent can run each one with minimal ambiguity:
- **Be clear, direct & detailed** — each task states the objective, the exact files,
  and *why* (context/motivation), not just *what*.
- **Assign a role** (`<role>`) — primes the model for the right expertise.
- **Structure with XML tags** (`<context>`, `<objective>`, `<requirements>`,
  `<constraints>`, `<acceptance_criteria>`, `<references>`, `<example>`) — keeps the
  prompt parseable and unambiguous.
- **Provide examples** where shape matters (`<example>` in Task 2).
- **Define success** — explicit, checkable `<acceptance_criteria>` (incl. the build
  command) so "done" is verifiable.
- **Sequence & ground** — tasks are ordered with dependencies and point back to
  concrete repo files and this spec, avoiding hallucinated APIs.
```

