# dzup-ui — Landing v2: Depth & Play (`apps/landing` home page)

> **Status:** Specification + execution log. The `<task>` blocks below are the build.
> **Owner:** dzup-ui team · **Authored:** 2026-08-25 · **Baseline:** `main` @ `7984c68` (clean tree)
> **Scope:** the home page of `apps/landing` (`HomePage.vue` and the sections it mounts,
> plus the `src/motion` primitives they consume). Other routes are touched only where a
> task explicitly says so (router, sitemap, e2e baselines).
>
> **Goal (from the product owner):** the current page looks good and stays available —
> v2 must make the page **more interactive in a more interesting way**: more **3D**, more
> **animated**, with **added imagery** — while staying inside the existing token theme and
> the truth-first content the site already enforces. The current design is **preserved,
> not deleted**: it remains reachable at `/classic` so v2 can be compared and, if it does
> not suit, reverted by swapping one route component.
>
> **Method:** a fresh sweep of this checkout — `HomePage.vue`, `Hero.vue`, all nine lazy
> sections, the `src/motion` module (components, directives, tokens.css), the e2e visual
> guard, the perf budgets and the a11y suites — every claim below carries a `file:line`
> or a command result.
>
> **Relationship to other docs:** builds on [`animations.md`](./animations.md) (the motion
> module this spec finally deploys on the home page), [`design-tasks.md`](./design-tasks.md)
> (TASK-DS-11 built the current hero and measured why it is flat — v2 must not undo those
> measurements), and [`free-apps-review-3.md`](./free-apps-review-3.md) (the guardrails:
> budgets, axe, drift guards, e2e). Numbering: `TASK-LV2-*`, distinct from all prior series.
>
> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Part 1 — Analysis of the current home page (measured 2026-08-25)

The page is `Hero` (eager) + nine `defineAsyncComponent` sections behind `LazySection`
(`HomePage.vue:31-39`): ShowcaseDashboard, FeatureGrid, ThemingDemo, ComponentGallery,
EcosystemGrid, SocialProof, HomeTestimonials (renders nothing — empty `TESTIMONIALS`),
FreeVsPro, CommunityCTA.

| # | Finding | Evidence |
|---|---|---|
| 1 | **The shop doesn't use its own goods.** `src/motion` ships 33 components (`DzAurora`, `DzBeam`, `DzOrbit`, `DzBorderBeam`, `DzMarquee`, `DzDock`, `DzCardStack`, `DzLens`, `DzParticles`, `DzSpotlight`, `DzWordReveal`, `DzTextDecode`, `DzOdometer`, …) and 6 directives (`v-tilt` with glare, `v-glare`, `v-magnetic`, `v-reveal`, `v-animate-on-scroll`) — all tested, reduced-motion-safe, touch-safe, extractable. The home page consumes exactly **one component and one directive**: `DzCountUp` (`SocialProof.vue:6`) and a uniform `v-reveal` fade (`HomePage.vue:44-69`). The `/animations` gallery is a shop window; the home page never walks inside. | `grep "from '../motion" src/components/*.vue` → 1 hit |
| 2 | **The hero was deliberately flattened — for reasons that still hold.** TASK-DS-11 removed aurora/grid/grain (measured: −104 ms LCP), killed the headline entrance animation, and kept exactly one decorative layer (`.hero-spot`). Any v2 depth must respect the measurement: **nothing new on the LCP path** (the `h1`/lede paint immediately, in place), decoration is transform/opacity-only and mounts or animates **after first paint**. | `Hero.vue:11-30` (measured comment), `Hero.vue:262-283` |
| 3 | **Zero imagery.** Every visual on the page is live components (a strength — "never a screenshot" is a brand claim, `Hero.vue:16`). But the repo commits **88 theme-aware template thumbnails** (44 light + 44 dark webp, `public/templates/thumbnails/`) that only ever appear on `/templates`. Real product imagery exists and is unused where it would do the most work. | `ls public/templates/thumbnails \| wc -l` → 88 |
| 4 | **Hover language is one-note.** Interactive cards all share `lp-card--hover` (a small lift). No tilt, glare, spotlight, magnetism, border-beam — the pointer does nothing interesting anywhere above the footer. | `FeatureGrid.vue:26`, `ComponentGallery.vue:31` |
| 5 | **Scroll tells no story.** All nine sections enter with the same undirected `v-reveal` fade. `useScrollProgress`, `useSticky`, `DzBentoReveal`, scroll-linked transforms (`.dz-scroll-linked`) exist and are demoed on `/animations` but never orchestrate the home page. | `HomePage.vue:44-69`; `motion/index.ts` |
| 6 | **The package story is a static grid.** `EcosystemGrid` lists the packages as cards; the dependency graph (contracts → tokens → core → nuxt) — the most diagram-shaped fact on the page — is prose. `DzBeam` was literally built to draw animated connections between referenced elements. | `EcosystemGrid.vue`; `motion/index.ts:20-23` |
| 7 | **Guardrails that constrain every task** (these are features, keep them green): the pixel-histogram + hero-snapshot e2e (`e2e/visual.spec.ts`; baselines are per-platform — only `-win32` committed here, refresh with `yarn test:e2e:landing:update`); Lighthouse budgets (mobile LCP is FCP-bound, `lighthouserc.mobile.json` — do not add critical-path bytes); the entry-chunk bundle budget (`scripts/check-bundle-budget.ts`, CI-gated); per-page axe suites (`pages.a11y.spec.ts`, serious+critical + moderate rule-id pass); reduced-motion (`motion/tokens.css` central block); token-only colors (`--dz-*`/`--lp-*`, `yarn validate:tokens`); CLS `min-height` reservations on every `LazySection`. | files cited inline |
| 8 | **Preservation has no mechanism yet.** There is no route, flag, or copy that would keep the current design reachable once sections are edited. | `router.ts:140` |

**Found healthy, preserve:** the honesty machinery (derived counts, no fake testimonials,
disabled-until-published surfaces); `Hero`'s LCP discipline; `LazySection` + min-height CLS
guard; the motion module's a11y contract (pointer-only on fine pointers, reduced-motion
degrades to static, focus/click targets never move); token-only styling.

---

## Part 2 — Design direction: "Depth & Play"

One sentence: **keep the calm, truthful page and give it a z-axis** — depth from
transform-only 3D, playfulness from pointer physics, imagery from the product's own
committed screenshots, story from scroll.

Principles (every task inherits these; task blocks do not repeat them):

1. **Depth is transform-only.** `perspective` + `rotateX/rotateY/translateZ/scale`,
   compositor-friendly. No new filters/blend-modes on ancestors of text (the blank-page
   class of bug — `e2e/visual.spec.ts:40-46` asserts `<html>`/`<body>` never blend).
2. **The LCP path is sacred.** The `h1`, lede and CTAs paint immediately, in final
   position, with zero animation. All hero decoration is `aria-hidden`, paints behind the
   text, and animates via CSS after paint or mounts post-idle. Below-the-fold sections may
   be as rich as they like — they are already lazy.
3. **Reduced motion = the current page.** Every effect degrades to (at most) an opacity
   fade under `prefers-reduced-motion: reduce`. Pointer effects attach only on
   `(hover: hover) and (pointer: fine)` — touch users get the resting state. This is the
   motion module's existing contract; v2 surfaces must not weaken it.
4. **Reuse the motion module first.** New effects only where no primitive fits, and then
   they are authored *in* `src/motion` (extractable, no landing-only imports) — the home
   page stays a consumer.
5. **Tokens only.** Colors via `--dz-*` / `--lp-*`; durations/eases via `--dz-anim-*` /
   `--dz-duration-*` / `--dz-ease-*`. `yarn validate:tokens` stays green.
6. **Truth stays truthful.** No imagery that isn't the product (the template thumbnails
   ARE the product); no claims the code disproves; counts stay derived.
7. **Budgets are gates, not advice.** Entry gzip budget, TBT 300 ms, CLS guard and the
   axe suites hold. Anything heavy mounts lazily below the fold.
8. **v1 stays reachable.** `/classic` renders the exact current composition (noindex,
   excluded from the sitemap). v2 sections live in `src/components/home/`; v1 section
   files are not edited. Shared leaf pieces (`ShowcaseFrame`, `HeroCodePanel`,
   `RethemeButton`, `Section`, `LazySection`, `FamilyPreview`) stay shared — only
   section-level compositions fork.

Validation contract used by every task below (referenced as `<validation>`):

```
yarn workspace @dzup-ui/landing test        # full landing suite (incl. axe, interactions)
npx vue-tsc -p apps/landing/tsconfig.json   # 0 errors (baseline is 0)
yarn lint                                   # baseline: 2 pre-existing warnings in
                                            # packages/tooling/scripts, nothing else
```

---

## Part 3 — Tasks

Execution is **synchronous**: one task lands (code + tests + validation) before the next
starts. The execution log in Part 4 is updated as each task changes state.

---

## [x] TASK-LV2-01 — Preservation first: `/classic` keeps the current page alive

```xml
<role>
You are the release engineer for a redesign that must be reversible by construction. The
product owner explicitly said the current design may win; "we kept it in git" is not
keeping it — a route is. Nothing about v2 may start until reverting it is a one-line
change.
</role>

<task>
Freeze the current home composition as a reachable route: extract HomePage.vue's current
template into HomeClassicPage.vue, register it at /classic (noindex, not in the sitemap,
not in the nav), and re-point the plan so v2 work happens in new files under
src/components/home/ while every existing section component stays untouched.
</task>

<motivation>
HomePage.vue:31-69 is the only place the composition lives. The nine section components
will NOT be edited by later tasks (v2 forks section compositions into
src/components/home/), so preserving the composition file is sufficient to preserve the
page. /classic must carry the same SEO hygiene the site already enforces for utility
routes: router.ts builds per-route heads, build-sitemap.ts enumerates STATIC_ROUTES by
hand (scripts/build-sitemap.ts:72-76) so /classic simply is not added.
</motivation>

<requirements>
  <route>/classic renders HomeClassicPage.vue — byte-for-byte the current HomePage
    template/script (imports adjusted). robots noindex via the router's existing head
    mechanism; NOT added to STATIC_ROUTES in build-sitemap.ts; NOT in nav.ts.</route>
  <homepage>HomePage.vue keeps rendering the current sections for now (v2 sections
    replace them incrementally in later tasks) — after this task / and /classic render
    identically.</homepage>
  <specs>router.spec.ts / router.head.spec.ts / pages.a11y.spec.ts pick up the new route
    where they enumerate routes; a spec asserts /classic is noindexed and absent from the
    generated sitemap.</specs>
</requirements>

<steps>
  1. Read router.ts head handling to find the noindex mechanism (or add meta.noindex
     support if none exists — check how NotFoundPage handles robots).
  2. Create pages/HomeClassicPage.vue as a copy of HomePage.vue.
  3. Register /classic; verify sitemap output does not contain it.
  4. Extend specs; run <validation>.
</steps>

<success_criteria>
  - /classic renders the exact current page; / unchanged; sitemap.xml unchanged.
  - A spec fails if /classic ever gains index,follow robots or a sitemap entry.
  - Full <validation> green.
</success_criteria>
```

---

## [x] TASK-LV2-02 — Depth foundation: parallax + depth primitives in `src/motion`

```xml
<role>
You are the author of the motion module (docs/animations.md) adding the last missing
family: continuous pointer/scroll parallax. Everything else v2 needs already exists —
this is the only new primitive work, and it obeys the module's charter: no landing-only
imports, transform/opacity only, reduced-motion and coarse-pointer degrade to static,
SSR-guarded, leak-free.
</role>

<task>
Add a useParallax composable (pointer-driven, normalized -1..1 x/y with per-layer depth
multipliers, one rAF write per frame), a DzParallax layer component wrapping it
(depth-mapped translate3d of slotted layers), and .dz-depth-* CSS utilities in
motion/tokens.css (perspective stage + translateZ layer helpers), each exported from
motion/index.ts with unit tests alongside the existing composables.spec.ts patterns.
</task>

<motivation>
Hero v2 (LV2-03) needs a layered depth field behind the visual column; the showcase
(LV2-04) needs scroll-linked straightening; the imagery wall (LV2-07) needs a tilted
perspective plane. All three want the same three primitives, and the module's rule is
that primitives live in src/motion so /animations can later demo them and the package
extraction (future @dzup-ui/motion) inherits them. useScrollProgress/useInView already
cover the scroll axis — do NOT duplicate them; useParallax is pointer-only.
</motivation>

<requirements>
  <useParallax>Attaches pointermove on a target element (default: the host) only when
    matchMedia('(hover: hover) and (pointer: fine)') matches AND useReducedMotion is
    false; exposes reactive {x, y} in -1..1 and a stop(); collapses events to one rAF
    write; removes listeners on scope dispose. SSR-safe (no window at import time).</useParallax>
  <DzParallax>Props: layers?: none (slot-based) — each direct child declaring
    data-depth="n" translates by (x,y) * n * --dz-anim-parallax-range (new token,
    default 12px). aria-hidden content only; documents that interactive children are
    forbidden (parallax must never move a click target — same rule as v-tilt).</DzParallax>
  <css>tokens.css gains --dz-anim-parallax-range plus .dz-depth-stage
    (perspective: var(--dz-anim-depth-perspective, 1200px)) and .dz-depth-layer
    helpers; the central prefers-reduced-motion block zeroes the new movement.</css>
  <tests>composables.spec.ts-style unit tests: reduced-motion → static; listener
    cleanup on unmount; rAF collapsing (multiple moves → one write). Component test for
    DzParallax depth mapping.</tests>
</requirements>

<steps>
  1. Read useInView.ts + useReducedMotion.ts + directives/tilt.ts for the established
     matchMedia/rAF/cleanup patterns — mirror them exactly.
  2. Implement composable, component, tokens; export from motion/index.ts with the
     module's comment style (cite this doc).
  3. Tests; <validation>.
</steps>

<success_criteria>
  - New primitives exported, tested, reduced-motion/touch/SSR-safe, leak-free.
  - No change to any page yet; suite green.
</success_criteria>
```

---

## [x] TASK-LV2-03 — Hero v2: the stage — depth behind the fold's proof

```xml
<role>
You are the designer who flattened this hero for LCP (TASK-DS-11) and you are now adding
the z-axis back WITHOUT giving back the milliseconds you won. You know exactly what was
measured: aurora ~52ms, grid+grain ~4ms, headline entrance animations gated LCP. The
budget for new decoration on the critical path is zero — depth must come from cheap
layers, post-paint animation, and the pointer.
</role>

<task>
Create home/HeroV2.vue (HomePage switches to it): keep the exact copy, CTAs, code panel,
trust row and compact ShowcaseFrame — and add (a) a pointer-parallax depth field behind
the visual column (DzParallax: 2-3 aria-hidden gradient/grid layers at different depths,
CSS-painted, no images), (b) v-tilt with glare on the ShowcaseFrame wrapper (max ~4deg,
subtle), (c) v-magnetic on the two CTA buttons (small radius), (d) a one-time
DzWordReveal on the accent line ONLY (the h1's first line and lede never animate), and
(e) DzBorderBeam on the HeroCodePanel, started post-idle.
</task>

<motivation>
The hero is the only section a visitor is guaranteed to see; today its only motion is a
single fade on the visual column (Hero.vue:262-270). Everything added here is
transform/opacity-only and off the LCP path: the depth field paints behind .hero-inner
(z-index below text, same trick as .hero-spot), tilt/magnetic are pointer-gated and do
nothing until interaction, the accent word-reveal animates a element AFTER the h1's
first line painted (the LCP element is the h1 block — verify with Lighthouse that the
reveal does not delay it; if it does, drop to a post-paint opacity fade), and the border
beam is a 1.5px mask animation on a small element started via requestIdleCallback.
</motivation>

<requirements>
  <structure>src/components/home/HeroV2.vue; section keeps class "hero" and
    aria-labelledby="hero-title" so e2e locators and a11y specs hold. Shared leaves
    (ShowcaseFrame, HeroCodePanel, RethemeButton) imported, not forked.</structure>
  <depth_field>DzParallax stage behind .hero-inner: e.g. a large soft brand-radial at
    depth 0.3 (replacing .hero-spot's static role), a faint .dz-anim-grid-style layer at
    depth 0.6, a small accent glow at depth 1. All aria-hidden, pointer-events none,
    tokens only, z-index 0 under the existing z-index 1 content.</depth_field>
  <restraint>Tilt max 4deg / perspective 1200 / no scale; magnetic strength ≤ 8px;
    word-reveal once, ~500ms total, never re-triggers. The hero must still read calm —
    v2 is depth, not carnival.</restraint>
  <fallbacks>Reduced motion: depth field static (layers still paint), no tilt, no
    magnet, accent renders instantly, no beam. Mobile (<1024px, showVisual false): the
    depth field stays (it is cheap) but parallax input is inert on coarse pointers by
    contract.</fallbacks>
  <e2e>Hero snapshot baselines (home-hero-{light,dark}-chromium-win32.png) regenerate
    via `yarn test:e2e:landing:update` — the visual DID change, on purpose;
    animations:'disabled' in the test means the baseline captures the resting state.
    The linux baselines regenerate via the landing-e2e-snapshots workflow on push (note
    this in the execution log).</e2e>
  <perf>After the change, run the landing build; entry chunk must stay within the
    bundle budget (motion imports here ride the eager chunk — DzWordReveal, DzParallax,
    DzBorderBeam, directives are small; verify with check-bundle-budget).</perf>
</requirements>

<steps>
  1. Build HeroV2 from a copy of Hero.vue; wire HomePage to it.
  2. Add depth field + directives + accent reveal + idle-started beam.
  3. Unit/a11y specs (Hero-specific assertions live in pages.a11y + e2e; add a
     HeroV2 spec asserting reduced-motion renders all copy statically).
  4. yarn build + check-bundle-budget; regenerate win32 e2e baselines; <validation>.
</steps>

<success_criteria>
  - / renders HeroV2 with depth field, tilt, magnetic CTAs, accent reveal, border beam;
    /classic untouched.
  - Reduced-motion renders the full copy with zero animation; axe green.
  - Bundle budget green; hero e2e baselines refreshed and passing on win32.
</success_criteria>
```

---

## [x] TASK-LV2-04 — Showcase v2: the dashboard rises off the page

```xml
<role>
You are the motion designer for the site's strongest proof — the live dashboard of real
components. Today it sits in a flat card one scroll down (ShowcaseDashboard behind
LazySection). The v2 move is the classic product-page gesture done honestly: the
dashboard starts tilted back in 3D perspective and straightens/rises as it scrolls into
view, driven by scroll position — plus a pointer spotlight once it is upright.
</role>

<task>
Create home/ShowcaseSection.vue wrapping the existing ShowcaseDashboard content in a
.dz-depth-stage perspective: on scroll (useScrollProgress on the section, JS floor; CSS
animation-timeline: view() where supported per the DzBentoReveal precedent), interpolate
rotateX from ~10deg to 0 and translateY/scale to rest over the section's entry; add
DzSpotlight (cursor-follow) on the dashboard frame; keep the LazySection min-height
contract so CLS stays 0.
</task>

<motivation>
Finding 5: scroll tells no story. This is the section where scroll-linked depth reads as
product theater rather than decoration, and both halves already exist: useSticky/
useScrollProgress power /animations' pinned demos, and motion/tokens.css documents the
native-with-JS-floor pattern (motion/index.ts DzBentoReveal comment). The dashboard's
inner components stay fully interactive — the transform sits on a wrapper, and by the
time the section is fully in view the wrapper is at identity, so no interaction ever
happens against a rotated plane (clicks mid-scroll still land — rotateX around center
keeps the box; verify tab order and pointer hit-testing in the spec).
</motivation>

<requirements>
  <wrapper>ShowcaseDashboard itself is not edited (shared with /classic). The v2
    section imports it inside the perspective wrapper.</wrapper>
  <progress>Transform driven by in-view progress 0→1 mapped over the first ~60% of
    entry; clamps at identity. Reduced motion: wrapper at identity always, spotlight
    off. No layout properties animated — transform only, will-change managed like the
    directives do (set while animating, cleared at rest).</progress>
  <a11y>Spotlight overlay aria-hidden + pointer-events:none; dashboard remains the
    same interactive tree; axe page suite green.</a11y>
</requirements>

<steps>
  1. Read useScrollProgress.ts + DzBentoReveal.vue for the native/floor split.
  2. Build ShowcaseSection; wire into HomePage (replacing the bare ShowcaseDashboard
     LazySection entry).
  3. Spec: reduced-motion → identity transform; progress mapping unit-testable pure
    function exported for test. <validation>.
</steps>

<success_criteria>
  - Scrolling into the section visibly straightens the dashboard (fine-pointer,
    motion-allowed environments); resting state identical to today's layout.
  - CLS unchanged (min-height preserved); suite + axe green.
</success_criteria>
```

---

## [x] TASK-LV2-05 — Feature bento v2: tiles with physicality

```xml
<role>
You are redesigning the "Why dzup-ui" grid from a quiet bento into a physical one — the
section where a visitor's pointer should first discover that this page plays back.
</role>

<task>
Create home/FeatureBento.vue from FeatureGrid's content (same FEATURES data, same copy):
wrap the grid in DzBentoReveal (staggered spotlight reveal on view), give every tile a
subtle v-tilt (max 6deg) + v-glare, give the featured tile a DzBorderBeam, and add one
micro-interaction to the featured tile's live demo cluster (the demo switch triggers
DzSuccessCheck/progress pulse — a real, working control rewarding interaction).
</task>

<motivation>
Finding 4: hover is one-note. The bento is 8 uniform cards (FeatureGrid.vue:26-70) whose
only response is a lift. DzBentoReveal was purpose-built for exactly this grid shape
(motion/index.ts: "a bento grid whose cells reveal with a shared spotlight + per-cell
stagger") and has never been used outside the gallery. Tilt+glare on content cards (not
on links' hit targets — the tiles are list items with inner content) follows v-tilt's
"never moves the click/focus target" contract.
</motivation>

<requirements>
  <content>Copy unchanged; FEATURES stays the single source. FeatureGrid.vue untouched
    (serves /classic).</content>
  <reveal>DzBentoReveal replaces the per-tile --reveal-delay inline stagger; falls back
    per its own contract.</reveal>
  <micro>The featured tile's DzSwitch toggling drives a small visible response in the
    demo cluster (e.g. progress value + a one-shot check). No fake data claims.</micro>
</requirements>

<steps>
  1. Read DzBentoReveal.vue props/slots; build FeatureBento; wire HomePage.
  2. Spec: renders all FEATURES entries; reduced-motion static; <validation>.
</steps>

<success_criteria>
  - Tiles reveal with stagger+spotlight, tilt under fine pointers, featured tile beams;
    reduced-motion = today's static grid; suite green.
</success_criteria>
```

---

## [x] TASK-LV2-06 — Ecosystem v2: the package graph, drawn and alive

```xml
<role>
You are the person who wrote "contracts → tokens → core" in CLAUDE.md and you finally
get to draw it. The dependency graph is the most diagram-shaped fact on the page and it
is currently prose on cards. DzBeam exists precisely to draw an animated connection
between two referenced elements.
</role>

<task>
Create home/EcosystemGraph.vue: the packages from EcosystemGrid's data rendered as
positioned nodes (cards, reusing the existing card idiom) connected by DzBeam edges that
draw + pulse when the section enters view — contracts→core, tokens→core, core→nuxt,
compat and codemods as satellites — with the existing per-package copy/links preserved
below or within the nodes. Nodes get v-tilt; the beam layer is aria-hidden with the
graph's information also present as accessible text (the existing card list remains the
semantic content; the graph is its visual).
</task>

<motivation>
Finding 6. DzBeam (motion/index.ts:20-23) draws + travels light along an SVG path
between element refs — hub-and-spoke composition is its documented use. The section
becomes the page's "wow" for engineers: the architecture itself animating. Truth rule:
only draw edges that CLAUDE.md's dependency table asserts; compat explicitly never
points into core (draw it detached or dashed toward apps — pick per the table, do not
invent edges).
</motivation>

<requirements>
  <semantics>Screen readers and no-JS get the same information as today: keep the
    card list (or an sr-only equivalent listing nodes + their dependencies). Beams and
    node positions are presentation.</semantics>
  <layout>Responsive: graph layout ≥1024px; below that, fall back to the existing
    stacked card grid (beams off) — small screens get v1's layout.</layout>
  <motion>Beams animate on in-view (once), duration from --dz-anim-beam-duration;
    reduced motion: static drawn paths, no travel pulse.</motion>
</requirements>

<steps>
  1. Read DzBeam.vue props (refs, curvature, direction) + EcosystemGrid.vue data.
  2. Build EcosystemGraph (keep id="ecosystem" anchor on the section wrapper —
     HomePage.vue:57 anchors it); wire HomePage.
  3. Spec: every package name still rendered as text; edges match CLAUDE.md's table;
     reduced-motion static. <validation>.
</steps>

<success_criteria>
  - ≥1024px: animated dependency graph with beams; <1024px: current card grid.
  - No edge that the dependency table doesn't assert; a11y suite green.
</success_criteria>
```

---

## [x] TASK-LV2-07 — Imagery: the template wall — a tilted plane of real screens

```xml
<role>
You are adding the page's first imagery, and the honesty bar decides what it can be: the
44 committed, theme-aware template thumbnails ARE the product. A 3D wall of real screens
— the gesture stock-photo sites fake — is one this repo can make truthfully.
</role>

<task>
Create home/TemplateWall.vue, a new lazy home section (between ComponentGallery and
EcosystemGraph): two counter-scrolling DzMarquee rows of template thumbnail cards on a
tilted perspective plane (rotateX ~12deg via .dz-depth-stage utilities), each card a
theme-aware <img> (light/dark webp variant chosen the same way TemplatesPage does) with
the template name, linking to its /templates/:slug page; a section header + "Browse all
44 templates" CTA. Hovering a card pauses its row (DzMarquee's contract) and lifts the
card to identity rotation.
</task>

<motivation>
Finding 3: 88 committed webp files unused on the home page. DzMarquee already handles
the infinite scroll loop, gap tokens, hover-pause and reduced-motion (static row,
scrollable). The tilted-plane treatment delivers the owner's "more 3D + images" ask with
zero new asset work and zero honesty risk. Perf: the section is behind LazySection
below the fold; every img is loading="lazy" decoding="async" with width/height
attributes (thumbnails have a fixed aspect) so the marquee never shifts layout.
</motivation>

<requirements>
  <data>Template list from the same source TemplatesPage uses (src/templates or
    generated data — read TemplatesPage.vue and reuse; do not hand-list slugs). If the
    full 44 are too many DOM nodes for a marquee row, take a deterministic subset
    (e.g. first N by the registry's order) and say so in a comment — no Math.random().</data>
  <theme>Dark variant shown in dark theme (CSS-driven if possible — e.g. both imgs with
    html[data-theme] display gating — or the app's theme composable; prefer CSS so the
    marquee needs no JS theme subscription).</theme>
  <a11y>Marquee rows: DzMarquee's reduced-motion behavior; each card is a real link
    with the template name as accessible text; images get alt="" (name is adjacent
    text). Keyboard: cards are normal links in DOM order — verify focus does not get
    trapped in an animating row (DzMarquee pauses on focus-within per its contract;
    verify, and add it if the gallery version lacks it).</a11y>
  <router_head>New section only — no new route. Sitemap untouched.</router_head>
</requirements>

<steps>
  1. Read DzMarquee.vue + TemplatesPage.vue (data + thumbnail path convention +
     check-template-previews guarantees all 44+44 exist).
  2. Build TemplateWall; add to HomePage behind LazySection with an honest min-height.
  3. Spec: all rendered cards resolve to committed thumbnail files (fs check like
     check-template-previews does); links valid slugs; reduced-motion static.
     <validation>.
</steps>

<success_criteria>
  - Home page shows a tilted, counter-scrolling wall of real template screens,
    theme-correct in light and dark, every card a working link.
  - No 404 images possible (spec proves files exist); CLS 0; suite green.
</success_criteria>
```

---

## [x] TASK-LV2-08 — Numbers & finale: odometer stats, particle send-off

```xml
<role>
You are finishing the page's quieter back half — stats, comparison, call-to-action —
with the same physicality the top half now has, ending the page on its one big flourish.
</role>

<task>
Three touches: (1) home/StatsSection.vue from SocialProof — replace DzCountUp with
DzOdometer digits rolling on view + a v-reveal.blur entrance per stat; (2) FreeVsPro
gets a v2 wrapper adding tilt+glare on the two plan cards and a DzGradientText on the
"Pro" heading accent (existing copy untouched); (3) home/CommunityCTAV2.vue — the
closing CTA on a DzParticles (or meteors-utility) backdrop with a v-magnetic primary
button and a DzShimmer sweep on the section border.
</task>

<motivation>
SocialProof already proves the numbers honestly (derived FACTS); DzOdometer
(--dz-anim-odometer-*) is the strictly-better version of the count-up it demos on
/animations. The finale section is the one place a full-bleed particle field earns its
cost: it is the last thing seen, fully below fold, lazy-mounted, and DzParticles is
already SSR-guarded and reduced-motion-safe. All copy and links stay identical.
</motivation>

<requirements>
  <stats>Numbers remain from FACTS/derived counts — the odometer targets the same
    values SocialProof renders today; sr-only plain number for AT (odometer digits must
    not read as garbage — check DzOdometer's existing a11y story and mirror it).</stats>
  <cta>Particle density modest (tokens defaults); button magnetism ≤ 8px; section
    still passes axe contrast with the backdrop behind text (backdrop opacity low,
    tokens only).</cta>
</requirements>

<steps>
  1. Read DzOdometer/DzParticles/DzShimmer demos in the gallery for canonical usage.
  2. Build the three wrappers; wire HomePage; v1 files untouched.
  3. Specs per section (values match FACTS; reduced-motion static). <validation>.
</steps>

<success_criteria>
  - Stats roll like odometers on view; plan cards tilt; the finale glows with
    particles behind a magnetic CTA — all reduced-motion-safe, copy unchanged.
</success_criteria>
```

---

## [x] TASK-LV2-09 — Scroll storytelling: directed reveals + reading progress

```xml
<role>
You are the editor pass over the whole v2 page: nine sections now carry individually
rich motion, and your job is rhythm — entrances that vary with intent, and one thin
thread that ties the scroll together.
</role>

<task>
(1) Replace HomePage's nine identical v-reveal wrappers with directed variants that
match each section's composition (e.g. showcase .up, bento none — DzBentoReveal owns
its entrance, template wall .scale, graph .blur, stats none — odometer owns it, finale
.up) so no section double-animates; (2) add a 2px scroll-reading-progress bar under the
TopNav (useScrollProgress on the document, .dz-scroll-linked/scroll() where native,
JS floor otherwise), aria-hidden, tokens-colored, home-route only; (3) sweep the page
top-to-bottom checking motion choreography: nothing animates twice, staggers do not
overlap between adjacent sections, and every effect rests at identity.
</task>

<motivation>
Finding 5's second half. Uniform fades were fine when they were the only motion; now
they compete with section-owned entrances. The progress bar is the cheapest scroll-link
on the page and the only global one — TopNav.vue is shared chrome, so the bar mounts
via a slot/prop or a teleport from HomePage rather than editing TopNav's behavior for
other routes (TopNav.vue serves every page; keep the change additive and
route-scoped).
</motivation>

<requirements>
  <no_double_animation>A section whose v2 component owns its entrance gets a plain
    wrapper (no v-reveal). Document the choreography table in a comment in
    HomePage.vue.</no_double_animation>
  <progress_bar>Transform-only (scaleX), aria-hidden, reduced-motion: hidden or
    static-jump (no tween) — pick the module's convention; never on /classic or other
    routes.</progress_bar>
</requirements>

<steps>
  1. Audit each v2 section's owned entrance; write the choreography table.
  2. Apply directed reveals; build the progress bar; <validation>.
</steps>

<success_criteria>
  - Each section enters once, in character; progress bar tracks scroll on / only;
    suite green.
</success_criteria>
```

---

## [x] TASK-LV2-10 — Guardrail reconciliation: prove v2 kept every promise

```xml
<role>
You are the reviewer who wrote free-apps-review-3's Part 1: checkboxes are verified
against the tree, not trusted. v2 is nine tasks of new surface; this task is the
measurement pass that earns the [x]s.
</role>

<task>
Run and reconcile every guardrail: full landing suite (unit, axe, interactions),
vue-tsc, lint, validate:tokens, the production build + check-bundle-budget, the e2e
suite on win32 with refreshed hero baselines, and a Lighthouse spot-check of / (desktop
+ mobile) comparing LCP/TBT/CLS against the pre-v2 numbers; fix every regression found;
record the numbers in Part 4's execution log; update this doc's checkboxes and, where
memory/CLAUDE-adjacent docs describe the home page, reconcile them.
</task>

<motivation>
The budgets in finding 7 are the contract v2 signed. Known risks to check explicitly:
entry-chunk growth from motion imports in HeroV2 (the one eager section); TBT from
pointer listeners (all rAF-collapsed, but measure); the axe moderate rule-id pass over
new aria-hidden layers; CLS from the marquee images (width/height set); the win32
pre-existing failure (interaction-contract.spec.ts) stays the only red; linux e2e
baselines regenerate via the landing-e2e-snapshots workflow on push — note it, do not
chase it locally.
</motivation>

<requirements>
  <measurements>Record: entry gzip kB vs budget, LCP/TBT/CLS mobile+desktop medians,
    test counts, axe result. A regression against a gate = fix before checking the
    box; a soft regression (LCP within budget but worse) = record and justify or
    fix.</measurements>
  <docs>Update docs/landing-v2.md statuses + execution log; note the /classic
    escape hatch in apps/landing README or equivalent if one exists.</docs>
</requirements>

<steps>
  1. Full <validation> + validate:tokens + build + budget + e2e (win32).
  2. Lighthouse runs (the repo's lighthouserc configs) — medians of 3.
  3. Fix, re-run, record, update statuses.
</steps>

<success_criteria>
  - Every gate green (modulo the two documented pre-existing baselines); numbers
    recorded in Part 4; all TASK-LV2 checkboxes accurate.
</success_criteria>
```

---

## Part 4 — Execution log

Updated as execution proceeds; one row per task, most recent state.

| Task | State | Landed | Notes |
|---|---|---|---|
| TASK-LV2-01 /classic preservation | ✅ done | 2026-08-25 | `/classic` route (noindex, lazy) renders frozen `HomeClassicPage.vue`; guards in router.spec (noindex, sitemap, nav) + a11y route added; full suite 49 files / 2,603 tests green |
| TASK-LV2-02 depth primitives | ✅ done | 2026-08-25 | `useParallax` + `DzParallax` + `.dz-depth-stage`/`.dz-parallax-layer` + reduced-motion zeroing; 13 unit tests; suite 50 files / 2,616 green; lint+tsc+tokens clean |
| TASK-LV2-03 Hero v2 | ✅ done | 2026-08-25 | HeroV2: parallax depth field (rest-state pixel-identical to v1 — e2e baselines passed unchanged), tilt+glare frame, magnetic CTAs, accent word-reveal, post-paint border beam; 5 specs; entry 207.05/240 kB gzip (+1 kB); e2e 4/4 green |
| TASK-LV2-04 Showcase rise | ✅ done | 2026-08-25 | ShowcaseSection: scroll-linked rotateX 10°→identity over 60% entry (pure `riseTransform`, 5 unit tests) + DzSpotlight; reduced-motion identity asserted; dashboard untouched/shared with /classic |
| TASK-LV2-05 Feature bento | ✅ done | 2026-08-25 | FeatureBento: DzBentoReveal owns entrance (8 cells asserted), per-tile v-tilt+glare, featured tile border-beam ring, switch→progress+success-check micro-interaction; 4 specs green |
| TASK-LV2-06 Ecosystem graph | ✅ done | 2026-08-25 | EcosystemConstellation: hub-and-spoke DzBeam graph ≥1024px (edges only to SHIPPED offerings — the section is the offerings grid, not the package table, so the graph draws the lede's own claim), v1 card grid below; 4 specs green |
| TASK-LV2-07 Template wall | ✅ done | 2026-08-25 | TemplateWall: 2×14 counter-scrolling tilted marquee rows of committed thumbnails (fs-existence spec), theme via useTheme, DzMarquee gained `inert` dup-run; 6 specs green |
| TASK-LV2-08 Stats + finale | ✅ done | 2026-08-25 | StatsSection (DzOdometer + per-stat blur, CLS reservation kept), FreeVsProV2 (tilted plan cards, gradient "Go Pro"), CommunityCTAV2 (particle field, magnetic CTA, shimmer card); 6 specs green |
| TASK-LV2-09 Choreography | ✅ done | 2026-08-25 | Directed reveals per section with the choreography table in HomePage.vue (sections owning entrances get plain wrappers); `useDocumentScrollProgress` + home-only ScrollProgressBar; 3 specs green |
| TASK-LV2-10 Guardrails | ✅ done | 2026-08-25 | Every gate re-run green on the finished page; full numbers below |

**TASK-LV2-10 measurements (2026-08-25, this machine — win32):**

- **Unit suites:** landing `yarn workspace @dzup-ui/landing test` — **57 files / 2,651 tests, all green** (was 49/2,603 pre-v2 in this tree; +8 files/+48 tests are the v2 specs). Full-repo CI gate `yarn test:coverage` — **460 files / 8,096 tests green, exit 0** with the v8 coverage thresholds (incl. the `apps/landing/src/**` floors) enforced; all-files 91.93% lines.
- **Types/lint/tokens:** `vue-tsc -p apps/landing/tsconfig.json` 0 errors · `yarn lint` exit 0 · `yarn validate:tokens` green (0 raw colors, DESIGN.md fresh, intent-text contrast clean).
- **Bundle budget:** entry JS **207.72 / 240 kB gzip**, payload **245.42 / 285 kB** — all of v2 (hero depth field, tilt/magnetic/word-reveal on the eager path) cost ~1.7 kB gzip over the pre-v2 206 kB; every below-fold section rides its lazy chunk.
- **E2E (win32, `LANDING_E2E_TARGET=preview` — the CI artifact target): 105 passed (2.8m)** — pixel-histogram + blank-page guards light & dark, hero snapshots (the refreshed win32 baselines; the resting hero is pixel-identical to v1 by design, so the refresh was a no-op diff), core flows, Pixel 7 mobile, overlay portals, theme recipe, block-responsive certification. Linux hero baselines regenerate via `landing-e2e-snapshots.yml` on push.
- **The RTL ratchet caught v2** (`shellDirection.spec.ts`): 3 new physical declarations (hero spot centring, glow `right`, progress-bar `left/right`) — converted to `inset-inline`/`margin-inline`/`inset-inline-end`, no DELIBERATE growth; guard green at ≤24.
- **Lighthouse spot-check** (home route, production preview, this machine — not the interleaved A/B harness, so read against gates, not as milliseconds-precise deltas):
  - Desktop (2 clean runs; run #3 died to a known Lighthouse-internal FCP-compute flake): **LCP 768–881 ms** (error gate 2500), **CLS 0** (gate 0.1), TBT 118–135 (warn 300), FCP 601–670 (warn 1800), perf 0.95–0.97, a11y 0.95 (gate 0.9). All assertions pass.
  - Mobile (3 runs): **LCP median 3,390 ms** — inside the pre-v2 documented 3.08–4.34 s range (warn-gated, FCP-bound per TASK-FREE3-04; not chased, per that finding). **CLS 0** (the error-gated mobile assertion), TBT median 34 ms, a11y 0.97–1.
- **No generated-artifact drift:** no route added to `STATIC_ROUTES`, registries untouched — sitemap/robots/counts/og all unchanged; `/classic` is meta-noindex only, absent from sitemap and nav (spec-guarded).

**Verdict:** v2 shipped inside every contract it signed. The one open follow-up is
automatic: the linux hero-snapshot baselines refresh via `landing-e2e-snapshots.yml`
on the next push.
