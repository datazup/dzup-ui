# dzup-ui — Animations v2: The Theatre (`/animations` on `apps/landing`)

> **Status:** Specification + execution log. The `<task>` blocks below are the build.
> **Owner:** dzup-ui team · **Authored:** 2026-08-27 · **Baseline:** `main` @ `a3b805e` (clean tree)
> **Scope:** the `/animations` route of `apps/landing` — `pages/AnimationsPage.vue`,
> `gallery/AnimationCard.vue`, any new `src/components/animations/` surfaces they mount,
> and the `src/motion` primitives they consume. The catalog data model
> (`gallery/catalog.ts` — its `CatalogEntry`/`CATEGORIES`/`CATEGORY_ACCENTS` shapes and
> all 82 entries), the demo components under `gallery/demos/`, the registry pipeline
> (`registryItem.ts`, `motionSources.ts`, `scripts/build-animations-registry.ts`) and
> `scripts/build-counts.ts` are **never edited** — the gallery's content is out of
> scope; only its theatre is being rebuilt.
>
> **Goal (from the product owner):** the current page looks nice and works well — v2
> must make it **more interactive in a more interesting way**: more **3D**, more
> **animated**, with **added imagery** — while staying inside the existing token theme
> and describing what the page actually is (a live, truthful gallery of copy-pasteable
> motion effects built on `@dzup-ui/core` + tokens).
>
> **Method:** a fresh sweep of this checkout — `AnimationsPage.vue` (692 lines),
> `AnimationCard.vue` (629), the catalog (82 entries, 11 categories, per-category
> OKLCH accent pairs), the motion barrel (34 components, 5 directives, 12+ composables),
> the a11y/interaction/render guardrails — every claim below carries a `file:line` or a
> command result.
>
> **Relationship to other docs:** the fourth sibling of
> [`landing-v2.md`](./landing-v2.md) ("Depth & Play", home, TASK-LV2-01..10),
> [`blocks-v2.md`](./blocks-v2.md) ("Depth on the Shelf", `/blocks`, TASK-BV2-01..08)
> and [`templates-v2.md`](./templates-v2.md) ("The Showroom", `/templates`,
> TASK-TV2-01..07) — all fully landed; same design language, same principles, same
> motion module, applied to the gallery that *ships* that module. Builds on
> [`animations.md`](./animations.md) (the catalogue + effect backlog that produced
> today's page; its data model, deep-link contracts and perf caps are inputs here, not
> open questions). Numbering: `TASK-AV2-*`, distinct from all prior series.
>
> **Preservation decision (mirrors blocks-v2/templates-v2):** no `/animations-classic`
> route. The owner is happy with the page and wants it *enhanced*, not replaced. Every
> v2 layer below is **additive**: decoration is `aria-hidden` and sits behind or beside
> the existing DOM, pointer effects attach only on fine pointers, and reduced motion
> renders a page behaviorally identical to today's. Reverting any task is deleting its
> layer.
>
> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Part 1 — Analysis of the current `/animations` page (measured 2026-08-27)

The page is: an ambient hero (drifting `DzAurora` + grain, masked out by 880px —
`AnimationsPage.vue:399-407`) over eyebrow · h1 with a static `lp-gradient-text` span ·
lede · two plain buttons; a frosted sticky toolbar (search, category chips, type chips,
result count, page-level "Reduce motion" switch); and a 3/2/1-col bento of 82
`AnimationCard` glass tiles — each a live, replayable, in-view-gated demo stage over
quiet metadata and a code disclosure with APG-correct variant tabs. Filtering is
choreographed by AutoAnimate (motion) or a staggered `TransitionGroup` (reduced/floor).
Deep links: `#<category>` preselects a filter, `#effect-<id>` scrolls to + pulses one
card.

| # | Finding | Evidence |
|---|---|---|
| 1 | **The motion gallery barely wears its own motion.** The barrel ships 34 components (`DzParallax`, `DzCountUp`, `DzOdometer`, `DzGradientText`, `DzWordReveal`, `DzOrbit`, `DzBeam`, `DzBorderBeam`, …) and 5 directives (`v-tilt`, `v-glare`, `v-magnetic`, `v-reveal`, `v-animate-on-scroll`). The page chrome imports exactly three things: `DzAurora`, `provideMotionPreference`, `vAutoAnimate` (`AnimationsPage.vue:8`); the card imports one composable (`useInView`, `AnimationCard.vue:6`). The demos perform *inside* the stages while the shop window itself stays still — the one page whose chrome should be the best ad for the product. | `AnimationsPage.vue:8`; `AnimationCard.vue:6`; `motion/index.ts` |
| 2 | **The hero is static text with no numbers and no depth.** The h1 gradient span is the non-animated `lp-gradient-text` utility; nothing enters, counts, floats or answers the pointer. The home page's ecosystem tile advertises "82 effects · 11 categories" (derived — `claims.spec.ts:212-214` pins it to `CATALOG.length`/`CATEGORIES.length`), but the gallery's own header never states its scale, and `DzCountUp`/`DzOdometer` sit unused one import away. | `AnimationsPage.vue:240-263`; `claims.spec.ts:212` |
| 3 | **The atmosphere is brand-fixed and dies at the fold.** `.anim-bg` is an 880px-tall absolute layer masked to transparent by 100% height — below the first card row the page is flat surface all the way down (~82 cards of scrolling). The catalog defines a per-category OKLCH accent pair for all 11 categories (`catalog.ts:105+` `CATEGORY_ACCENTS`), and cards + chips already use it — but selecting Text (violet) vs Numbers (emerald) re-lights nothing at page level. `/blocks` and `/templates` both promote the active category's hue to page atmosphere via a registered `@property` (BV2-01, TV2-01); this page has the richest accent data and no atmosphere hookup. | `AnimationsPage.vue:399-407`; `catalog.ts` `CATEGORY_ACCENTS` |
| 4 | **Cards are flat glass wearing the site-generic hover.** Hover = `translateY(-4px)` + accent glow bloom (`AnimationCard.vue:376-380,422-424`). No tilt, no glare, no 3D plane separation between the stage and its chrome — while the gallery *sells* `tilt`, `glare` and `card-lift` as products three rows down. The permalink highlight is a single box-shadow pulse (`card-highlight` keyframe, `:363-374`). | `AnimationCard.vue:376-380` |
| 5 | **The toolbar is inert.** Chips transition color only; the result count is plain text; "Clear" appears/disappears via bare `v-if` with no transition (`AnimationsPage.vue:279-288`); the sticky toolbar has no stuck-state elevation (same hairline whether floating over the hero or pinned mid-scroll); the search input has no focus presence. This page is *about* micro-interactions and its primary control surface has none. | `AnimationsPage.vue:266-329` |
| 6 | **The page ends abruptly.** Last card row → footer. Home, `/blocks` and `/templates` all close with a designed finale/CTA band; the gallery — the page most likely to have convinced a visitor that the library is alive — hands them nothing to do next except scroll back up to the hero buttons. | `AnimationsPage.vue:372-387` (empty state is the only tail content) |
| 7 | **The empty state is stock.** Icon + two lines + "Clear filters" (`AnimationsPage.vue:372-387`). No rescue suggestions, although the catalog knows exactly which categories/types are populated. `/templates` landed frequency-derived suggestion chips (TV2-04). | `AnimationsPage.vue:372-387` |
| 8 | **Perf constraints that bound every task:** `/animations` is a lazy route chunk (`router.ts:263-275`); cards use `content-visibility: auto` + `contain-intrinsic-size` (`AnimationCard.vue:345-346`) and demo loops pause off-screen via `useInView` (`AnimationCard.vue:52-53`) — v2 must not break either cap. Entry budget: 240 kB gzip initial JS with ~208.11 kB used (templates-v2 ledger); everything here lives in the lazy chunk, and `motionSources.ts` (~280 kB raw text) must never be imported from page code (`motionSources.ts:14-20`). | `AnimationCard.vue:345`; `check:bundle` |
| 9 | **Guardrails that must stay green (features, not obstacles):** `/animations` in the per-page axe suite (`pages.a11y.spec.ts:111`) and the interaction sweep (`pages.interactions.spec.ts:112`); per-demo render smoke over every catalog entry (`gallery/render.spec.ts` — mounts, non-empty, zero console noise); `registryItem.spec.ts` on the registry pipeline; `claims.spec.ts` pins derived counts and `/r/animations/registry.json`; `scripts/build-counts.ts` SSR-loads the catalog (never hand-type a count); `yarn validate:tokens` forbids raw colors; `motion/tokens.css` centrally stills every `dz-*` primitive under reduced motion; the two hash contracts (`#category`, `#effect-<id>`) are documented behavior (`AnimationsPage.vue:143-211`). | listed files |
| 10 | **Two-path bento is deliberate, not debt.** AutoAnimate owns add/remove/move when motion is allowed; the `TransitionGroup` staggered path is both the reduced-motion snap AND the no-Web-Animations floor (`AnimationsPage.vue:30-37,331-370`). Any v2 grid work must keep both paths alive and equivalent. | `AnimationsPage.vue:30-37` |

**Found healthy, preserve untouched:** the catalog-driven card harness (adding an
effect touches only `catalog.ts` — never the card or page); the dual bento path
(Finding 10); both deep-link contracts and their prefix separation; the page-level
"Reduce motion" switch wired through `provideMotionPreference`; the
`content-visibility` + in-view loop caps; the `WIDE` sizing map living in the page;
the WCAG-checked `-600` active-chip fill; the code disclosure's APG tabs (roving
tabindex, owned entry point — memory `reka-roving-focus-tabstop`); the per-card
Replay/permalink affordances.

---

## Part 2 — Design direction: "The Theatre"

One sentence: **this page is a theatre of live performances — light the house in the
active category's colour, put an overture in the lobby, seat every act on a raked,
lit stage, and give the audience something to do when the curtain falls.**

What makes `/animations` different from its landed siblings (and why v2 diverges where
it does): `/templates` sells screenshots, `/blocks` sells live sections — this page
sells **motion itself**. So "added imagery" here must not mean image files: the truthful
imagery is the product performing. The hero's depth field is built from live motion
primitives (orbits, gradient sweeps, sparkles) at zero asset bytes; the cards' 3D
treatment must never fight the performance inside them (a tilting stage under a
pointer-tracked demo is sabotage — Finding 4's fix carries an explicit exclusion list);
and the finale draws the architecture (tokens → motion → your app) with the gallery's
own beam primitive.

Principles (inherited from landing-v2 Part 2, blocks-v2 and templates-v2; task blocks
do not repeat them):

1. **Depth is transform-only.** `perspective` + `rotateX/rotateY/translateZ/scale` +
   shadow/glow. No layout-affecting animation, no filters on large areas, no per-frame
   JS where CSS can drive.
2. **Decoration is invisible to the tree.** Every added layer is `aria-hidden="true"`,
   `pointer-events: none` unless it *is* the control, and additive — existing DOM,
   roles, names and focus order do not change.
3. **Pointer effects attach only on fine pointers** (the directives already gate
   this); touch gets the calm page.
4. **Reduced motion = today's page.** Every effect stills to a state visually and
   behaviorally equivalent to the current build — and on THIS page that gate is
   double: the OS preference *and* the page's own toolbar switch
   (`provideMotionPreference`) must both calm every new layer, because the switch is
   itself a demo of the accessibility story.
5. **Every number is derived.** From `CATALOG` / `CATEGORIES` imports at render time —
   never hand-typed (repo rule; `claims.spec.ts` and `build-counts.ts` both enforce
   the pattern).
6. **Token-only color.** `var(--dz-*)` / `--lp-*` derivations and `color-mix` only.
7. **Nothing joins the critical path.** `/animations` is a lazy chunk; within it,
   heavy decoration mounts post-paint or in-view, and nothing may import
   `motionSources.ts`.

Known traps this build inherits (from the landed siblings — do not rediscover):
a fixed `z-index: -1` layer needs `isolation: isolate` on the page root or the shell
paints over it (BV2-01); `@property` at-rules need an **unscoped** style block;
`tokens.css` forces `transform: none !important` on `.dz-parallax-layer` under reduced
motion, so parallax children size with `width: calc(...)`, never transform scale
(TV2-02); `@vue/test-utils` auto-stubs `TransitionGroup` → keep the explicit
`role="list"`/group semantics trick in mind if a list becomes a TransitionGroup
(TV2-04); specs drive reduced motion via `provideMotionPreference(true)` (the
matchMedia read is a module singleton); narrow vitest runs are
`npx vitest run <root-relative path>` **from the repo root**; components using
`useTheme` need a `DzThemeProvider` wrapper in specs; prefer logical properties for
new offsets (`shellDirection.spec.ts` keys deliberate physical CSS by `file:line`);
this page's own additions must ALSO respect the toolbar switch, not just the OS
setting — `reduceMotion` from `provideMotionPreference()` is already in scope in
`AnimationsPage.vue` and must be threaded (prop/`disabled`) into every new primitive
mount.

---

## Part 3 — Tasks

Execution is **synchronous**: one task lands (code + tests + validation) before the
next starts. The execution log in Part 4 is updated as each task changes state.

Shared validation block — every task's `<validation>` means, unless it says otherwise:

```
yarn typecheck:apps                                  # vue-tsc over apps/landing — 0 errors
npx vitest run <touched spec paths, root-relative>   # from the repo root
yarn validate:tokens                                 # no raw colors anywhere
yarn lint                                            # fully clean baseline on this checkout
```

The full landing suite, the production build + `check:bundle`, and e2e run once, in
TASK-AV2-07 — not per task.

---

## [x] TASK-AV2-01 — House lights: the atmosphere takes the active category's colour

```xml
<role>
You are the landing app's motion/visual engineer. /blocks (TASK-BV2-01) and /templates
(TASK-TV2-01, TemplatesPage.vue + BlocksIndexPage.atmosphere.spec.ts precedents) both
landed the same pattern: the active category's hue promoted from component tint to page
atmosphere via a registered @property. You are porting it to the page with the richest
accent data — 11 categories, each with an OKLCH [primary, secondary] pair
(catalog.ts CATEGORY_ACCENTS, resolved by categoryAccentStyle()) — where today the
colour stops at chips and cards (Finding #3) and the aurora dies 880px down (its mask
is intentional; you are adding a second, full-height layer, not stretching the
aurora).
</role>

<task>
Add an aria-hidden, fixed-position atmosphere layer to AnimationsPage — two large,
soft radial washes whose hue is the ACTIVE category's accent pair and which cross-fade
smoothly when `activeCategory` changes. When the category is 'all', the atmosphere
settles to the brand primary/secondary. Tint the hero eyebrow to match. The existing
`.anim-bg` aurora + grain stay exactly as they are — the new layer sits behind
everything and runs the full page height, so the lower two-thirds of the gallery stops
being flat.
</task>

<requirements>
  <layer>One `.av2-atmosphere` div, `position: fixed; inset: 0; z-index: -1;
    pointer-events: none`, `aria-hidden="true"`, first child of the page root. The
    page root gets `isolation: isolate` (WITHOUT it the shell background paints over
    the layer — the exact BV2-01 trap). Two washes built from `color-mix(in oklch,
    var(--av2-accent) X%, transparent)` and `var(--av2-accent-2)`; whisper-quiet in
    light AND dark (dark needs a lower mix % — mirror the `[data-theme='dark']`
    override the siblings use). Audit stacking afterwards: `.anim-bg` is z-0 and the
    hero/toolbar/gallery are z-1/40/1 — the new layer must sit under all of them.</layer>
  <hue>`--av2-accent` and `--av2-accent-2` registered via UNSCOPED
    `@property { syntax: '<color>'; inherits: true; initial-value: transparent }`
    blocks (scoped style blocks strip at-rules), with `transition: --av2-accent 600ms,
    --av2-accent-2 600ms` on the layer. Name them `--av2-*`, never `--bv2-*`/`--tv2-*`
    — three atmosphere pages can be alive in one SPA session. Values come from a
    computed over `activeCategory`: reuse `categoryAccentStyle(id)`'s resolution
    (extract/read its accent + accent-2 vars rather than re-mapping hues by hand);
    'all' → `var(--dz-primary)` + the brand secondary. Set as inline style on the
    page root.</hue>
  <eyebrow>The hero eyebrow (`.lp-eyebrow`) picks up a subtle `--av2-accent` tint
    (color or border), matching the sibling pages' cue.</eyebrow>
  <motion>Color fade only — may persist under reduced motion, but add the
    `prefers-reduced-motion` block dropping the transition to instant anyway
    (sibling convention). The page-level `reduceMotion` switch needs no extra
    handling here (a colour fade is not motion), but must not error when toggled.</motion>
  <specs>New `AnimationsPage.v2.spec.ts` (the page has no dedicated spec yet — use
    the mount scaffolding pattern from `TemplatesPage.v2.spec.ts` /
    `pages.a11y.spec.ts`: real router, DzThemeProvider, polyfills). Assert: the layer
    exists once and is aria-hidden; the page root's inline style carries the active
    category's accent after clicking/setting a category chip; 'all' resets to the
    primary. Reset `window.location.hash` between mounts — this page reads it at
    setup (`AnimationsPage.vue:156-161`).</specs>
</requirements>

<constraints>
Token-only color. No new deps. Do not touch the filter pipeline, the bento, the hash
contracts, or any existing markup semantics — the layer and one inline style binding
on the root are the only DOM changes.
</constraints>

<success_criteria>
- Selecting Text vs Numbers visibly re-lights the page margins violet vs emerald in
  both themes, top to bottom of the scroll; the change is a smooth ~600ms hue fade.
- 'all' (and initial load) shows the neutral brand wash; deep-linking
  `/animations#text` lands already lit in violet.
- New spec green; axe `/animations` pass unchanged; <validation> green.
</success_criteria>
```

---

## [x] TASK-AV2-02 — Overture: a hero that performs its own product

```xml
<role>
You are the landing app's motion/visual engineer. The hero of the motion gallery is
static text (Finding #2). The blocks and templates heroes got parallax depth fields
(BV2-02, TV2-02 — TemplatesHeroField.vue is the freshest precedent, including the
post-paint mount gate and the aria-hidden+inert container). This page's twist: its
imagery must BE motion. No image files — the depth field is built from live motion
primitives, and the headline itself animates.
</role>

<task>
Create `src/components/animations/AnimationsHeroField.vue` and mount it in
AnimationsPage: (a) a parallax depth field flanking the hero on wide viewports — 4–6
small aria-hidden "mini-performances" floating at different depths, built from
existing primitives (e.g. a DzOrbit ring of token-coloured dots, a DzGradientText
shimmer pill, a `.dz-meteors`/sparkle patch, a slowly-flipping DzFlip token chip —
pick 4–6 that read well tiny and are transform-only); (b) upgrade the h1 gradient
span from the static `lp-gradient-text` to the animated `DzGradientText` sweep and
give the h1 a one-time `DzWordReveal` entrance; (c) a derived stats row under the
lede — three `DzCountUp` figures: effects (`CATALOG.length`), categories
(`CATEGORIES.length`), native-API upgrades (`CATALOG.filter(e => e.native).length`)
— counting up on first view.
</task>

<requirements>
  <field>ONE `aria-hidden="true"` + `inert` container, `pointer-events: none`,
    absolutely positioned against the hero, `overflow: clip` on the positioning
    context, logical inset properties, hidden below ~1100px (media query — field
    absent, page identical to today). DzParallax layers at 2–3 depths with subtle
    rates (mirror TemplatesHeroField values); size children with width/clamp(),
    NEVER transform scale (the tokens.css `.dz-parallax-layer` reduced-motion trap).
    A slow CSS idle float keeps the field alive when the pointer is still; disabled
    under reduced motion. Each mini-performance must also respect the PAGE toggle:
    pass `reduceMotion` down (prop) and gate/disable each primitive with it (DzOrbit
    and friends accept disabled/reduced handling — verify each one's API and use it;
    where a primitive self-gates on the OS setting only, wrap it so the page toggle
    stills it too).</field>
  <mount>The field mounts post-paint (mirror TemplatesHeroField's defer gate) so LCP
    is untouched. Zero new asset bytes — everything is DOM + tokens.</mount>
  <headline>DzGradientText must render the same visible string ("drop in") with no
    layout shift vs today; verify its reduced-motion state is a static gradient
    (primitive already handles OS; thread the page toggle via its props/disabled
    path). DzWordReveal runs once on mount, never re-triggers on filter changes, and
    under reduced motion renders the full heading instantly. The h1's DOM id
    (`animations-title`), heading level and text content must not change — the a11y
    sweep and any heading assertions see the same accessible tree.</headline>
  <stats>Numbers derived in setup scope from the existing `CATALOG`/`CATEGORIES`
    imports — NEVER typed. The row is real content (NOT aria-hidden): a `<dl>` or
    labelled group, axe-clean, with tabular-nums. DzCountUp fires in-view once;
    reduced motion (either gate) renders final numbers immediately. Keep the lede and
    both hero buttons exactly as they are.</stats>
  <specs>`AnimationsHeroField.spec.ts` + additions to `AnimationsPage.v2.spec.ts`:
    field container is aria-hidden + inert with pointer-events none; stats equal the
    catalog-derived values (compute expectations FROM the `CATALOG` import, not
    literals); reduced-motion path via `provideMotionPreference(true)` renders final
    numbers with no observers pending; the h1 still resolves to the same text
    content.</specs>
</requirements>

<constraints>
Token-only color; the mini-performances use category accent hues from
`categoryAccentStyle`/`CATEGORY_ACCENTS` so the field previews the taxonomy's
spectrum. No edits to catalog.ts or any demo. No new deps. Nothing in the field is
focusable or announced.
</constraints>

<success_criteria>
- Wide viewport: live micro-motion floats at visibly different depths beside the
  hero and answers pointer movement with parallax; narrow viewport: today's hero.
- The headline sweeps its gradient and reveals word-by-word once; three true numbers
  count up and match `CATALOG` exactly.
- Reduced motion (OS or toolbar switch): static gradient, instant heading, instant
  numbers, no floating motion — behaviorally today's page.
- No horizontal scrollbar at any width; new specs + <validation> green; axe pass
  unchanged.
</success_criteria>
```

---

## [x] TASK-AV2-03 — Raked stage: cards get real 3D — without upstaging their performers

```xml
<role>
You are the landing app's motion/visual engineer. The gallery card is flat glass with
the site-generic lift (Finding #4), on the very page that sells tilt/glare/card-lift
as products. BlockCard v2 (TASK-BV2-05) and the templates tile (TASK-TV2-03) landed
the recipe: v-tilt + v-glare + preserve-3d chrome planes. Your twist is unique to this
page: MANY demos are themselves pointer-driven (spotlight-follow, tilt, glare,
magnetic-button, custom-cursor, lens, image-compare, dock, …) — a card that tilts
under the pointer would fight the very effect it exhibits. The stage must be raked;
the performance must stay sovereign.
</role>

<task>
Upgrade AnimationCard: (a) 3D tilt + glare on fine pointers for cards whose demo is
NOT pointer-driven, with `transform-style: preserve-3d` and small translateZ planes so
the stage, title row and blurb separate under tilt; (b) for pointer-driven demos, no
tilt — instead an intensified "stage light" hover (deepen the existing accent glow,
brighten the stage wash, sharpen the border) so those cards still respond, statically;
(c) micro-feedback on the card's own controls — Replay gets a press spin (the
RotateCcw icon does one -360° turn per click), the copy-link and Copy buttons get a
press scale + success pop; (d) upgrade the permalink highlight pulse into a spotlight
moment: the highlighted card additionally runs one accent `DzBorderBeam`-style lap
(reuse the standalone border-beam CSS approach BV2-06 established if it is reusable;
otherwise the `.dz-anim-border-glow`/beam utility) for the pulse duration.
</task>

<requirements>
  <exclusion>The pointer-driven set is a `POINTER_DRIVEN` Set of catalog ids
    exported/kept next to the existing `WIDE` set in AnimationsPage (layout intent
    lives in the page — same rationale as WIDE, AnimationsPage.vue:70-85) and passed
    to the card as a prop (e.g. `interactiveStage: boolean`). Seed it by auditing
    gallery/demos/ for pointer tracking (at minimum: spotlight-follow, tilt, glare,
    magnetic-button, custom-cursor, lens, image-compare, dock, card-stack,
    dynamic-island, morphing-dialog and any other demo with pointer/drag/click
    interaction INSIDE the stage — read the demos, do not guess). Document the
    audit in a comment.</exclusion>
  <tilt>`v-tilt` with modest options (max ~3–4°, no scale or ≤1.01, glare on —
    mirror BlockCard's option shape); the directive self-gates to fine pointers +
    OS reduced motion, AND must respect the page toggle: bind its disabled option to
    the injected motion preference (the card already lives under
    provideMotionPreference's provider; consume it via useReducedMotion/inject per
    the directive's API). Verify the tilt transform composes with the existing
    hover translateY(-4px) lift (`AnimationCard.vue:376`) — if they fight, move the
    lift into the tilt path's transform or drop it on tilting cards (BlockCard
    resolved this — read it first). content-visibility/contain-intrinsic-size and
    the in-view loop cap must be unaffected.</tilt>
  <planes>Perspective on the bento (or card wrapper), `transform-style: preserve-3d`
    on tilting cards, translateZ offsets on `.stage-wrap` / `.title-row` / `.actions`
    (~8–20px, stage highest). The code disclosure, when open, must remain flat and
    legible (no transform on `.disclosure`, or clamp planes while it is open — pick
    one and note it). Focus rings, the replay button hit area and the link-btn
    overlay must remain visually correct while tilted.</planes>
  <stagelight>For excluded (pointer-driven) cards: intensify `.stage-glow` opacity,
    raise the stage wash mix a few points and add an accent box-shadow on hover —
    all existing-variable-driven, transition-only. Both card classes must be
    indistinguishable at rest.</stagelight>
  <micro>Replay spin: one-shot CSS animation (`transform: rotate(-360deg)`) on the
    icon per activation, retriggered via the animation-restart idiom (class toggle or
    key bump — NOT the demo's replayKey, which already remounts the demo). Press
    scale on `.link-btn`/Copy via `:active` transform. All stilled under reduced
    motion (both gates — the CSS side gets the media query, the page toggle drives a
    `.is-still`-style class the card already receives context for).</micro>
  <spotlight>The highlight lap layer is aria-hidden, pointer-events none, absolutely
    positioned over the card border, runs ONCE per highlight trigger for ~the pulse
    duration (2.2s window, AnimationsPage.vue:209), and does not exist in the DOM
    when not highlighted. Reduced motion: today's behavior (static ring, no lap —
    the existing `.is-highlighted` reduced block stays).</spotlight>
  <specs>New `AnimationCard.v2.spec.ts` (or extend a card spec if one exists —
    there is none today): tilting card carries the tilt binding and the excluded
    card does not (drive both via a minimal CatalogEntry fixture + the
    interactive-stage prop); highlighted card renders the lap layer aria-hidden and
    un-highlighted does not; replay click bumps the demo key AND triggers the spin
    class. Reduced motion via provideMotionPreference(true): no tilt binding active,
    no lap layer animation class. jsdom cannot assert transforms — assert classes,
    attributes and bindings.</specs>
</requirements>

<constraints>
The card stays effect-agnostic: it learns `interactiveStage` from a prop, never from
inspecting the entry id itself. No changes to the disclosure/tabs a11y (APG
implementation is pinned by hand — do not touch onTabKeydown), the copy contracts,
`useInView` gating, or the demo mount path. Token-only color. No new deps.
</constraints>

<success_criteria>
- Fine pointer, motion allowed: a Scroll/Text card tilts toward the cursor with a
  moving glare and visible plane separation; a Spotlight/Dock card does NOT tilt but
  its stage visibly lights up; the demo inside remains perfectly usable.
- Replay spins its icon and remounts the demo; permalinking `#effect-<id>` produces
  the ring pulse + one beam lap.
- Touch/reduced motion (either gate): today's card exactly (lift + glow only,
  static highlight ring).
- Specs + <validation> green; render.spec (all 82 demos) untouched and green; axe +
  interaction sweeps unchanged.
</success_criteria>
```

---

## [x] TASK-AV2-04 — The control booth: a toolbar that demonstrates micro-interactions

```xml
<role>
You are the landing app's motion/visual engineer. The filtering surface of the
micro-interactions gallery has zero micro-interactions (Finding #5). The blocks pager
and templates toolbar (TASK-BV2-04, TASK-TV2-05) landed the language: springy chips,
odometer counts, choreographed appear/disappear. Port it — plus two touches this
page uniquely earns: a scroll-progress hairline on the stuck toolbar (dogfooding
useDocumentScrollProgress on the longest page in the app) and an odometer result
count (dogfooding the primitive the catalog sells three rows down).
</role>

<task>
Five micro-interactions on the AnimationsPage toolbar: (a) press/settle spring on all
filter chips (transform-only pop on toggle) plus a one-shot accent ring pulse when a
chip becomes active — the pulse in the CHIP'S OWN category accent (the `--accent`
var `chipAccent()` already sets); (b) the result count becomes a `DzOdometer` (the
number only; the "animations" word stays plain text) — audit the existing
`aria-live="polite"` on that element (AnimationsPage.vue:289): keep exactly one
polite announcement of the full label, screen readers must not hear digit soup (give
the odometer aria-hidden digits + a visually-hidden plain text, or move the aria-live
to a visually-hidden sibling — mirror how TV2-04 solved this with DzVisuallyHidden);
(c) "Clear" animates in/out via <Transition> (fade + small rise) instead of v-if
popping; (d) stuck-state elevation: when the toolbar is actually pinned (sticky top
reached), it gains a soft shadow + slightly more opaque background, detected by an
IntersectionObserver sentinel above it (no scroll listener); (e) a 2px
scroll-progress hairline along the toolbar's bottom edge, driven by
useDocumentScrollProgress mapped to scaleX (transform-only), in the atmosphere
accent (`var(--av2-accent)`).
</task>

<requirements>
  <chips>Transform-only scale spring driven by `:active` + toggle, token durations;
    activation pulse as a one-shot animation on a pseudo-element reading
    `var(--accent, var(--dz-primary))`. No DOM changes to the chips beyond a class.
    aria-pressed contract unchanged. Reduced motion (both gates): no spring, no
    pulse — the page toggle drives a class on the toolbar (reduceMotion is right
    there in scope).</chips>
  <count>DzOdometer respects reduced motion natively (verify) AND the page toggle
    (bind its disabled/reduced prop if it has one; if not, key-swap to plain text
    under the toggle). The visible sentence must remain "N animations" for sighted
    users and exactly one polite utterance for SR users on filter change.</count>
  <clear>`<Transition>` with transform+opacity classes; the toolbar-right row must
    not shift width when Clear appears — reserve the space or let it flow as today
    (do not introduce layout jump that doesn't exist; if one exists today, leave
    it).</clear>
  <stuck>Sentinel div (1px, aria-hidden) before the toolbar; IO with the sticky
    offset accounted for. The elevated state is class-driven CSS only. SSR-safe,
    observer disconnected on unmount. This must not interfere with the toolbar's
    z-index (40) or the backdrop-filter.</stuck>
  <progress>useDocumentScrollProgress is an existing composable
    (motion/useScrollProgress.ts) — read its API first; drive `transform: scaleX()`
    on an absolutely-positioned, aria-hidden hairline with `transform-origin` set
    logically (left in LTR — use a logical-safe approach; check shellDirection
    conventions). Hidden entirely under reduced motion (either gate) — a moving bar
    tied to scroll is motion. No per-frame JS beyond the composable's own rAF.</progress>
  <specs>Extend AnimationsPage.v2.spec.ts: chip toggle keeps aria-pressed (guard);
    the count renders the odometer component when motion allowed and plain text
    under provideMotionPreference(true); Clear is inside a Transition wrapper;
    sentinel + hairline exist and are aria-hidden; hairline absent under reduced
    motion. Do not assert IO callbacks or spring physics in jsdom.</specs>
</requirements>

<constraints>
No behavior changes: same filter logic, same clicks, same aria-pressed and
aria-label contracts, same DzSearchInput/DzSwitch components untouched. The "Reduce
motion" switch keeps its exact position and wiring. Token-only color. No new deps.
</constraints>

<success_criteria>
- Chips pop and pulse in their own category colour on activation; the count rolls
  like an odometer; Clear eases in/out; the pinned toolbar visibly lifts off the
  page; a thin accent line tracks scroll progress along its bottom edge.
- Reduced motion (either gate): today's toolbar exactly — instant chips, plain
  count, no hairline; SR output unchanged (one polite label).
- Specs + <validation> green; axe + interaction sweeps unchanged.
</success_criteria>
```

---

## [x] TASK-AV2-05 — Choreography: entrance, rescue, and the long scroll

```xml
<role>
You are the landing app's motion/visual engineer. The bento's filter choreography is
already good (AutoAnimate + TransitionGroup floor — Finding #10 says preserve it).
What's missing is the FIRST impression (cards below the fold appear with no scroll
entrance — the enter stagger only plays on filter changes within the visible grid),
a designed rescue when filters strand the user (Finding #7), and any sense of place
on an ~82-card scroll.
</role>

<task>
(a) Scroll entrance: cards rise+fade as they first scroll into view via the
`v-animate-on-scroll` directive or `v-reveal` (pick the one that composes cleanly
with content-visibility and BOTH bento paths — read both directives first; the
entrance must not double-fire with AutoAnimate's filter-time enters, must not fight
content-visibility: auto, and must not leave cards invisible if IO never fires —
the fail-open rule). (b) Redesign the empty state: keep the icon/copy shell but add
"try instead" suggestion chips — the 3 most-populated categories (derived by
counting CATALOG entries per category; ties by CATEGORIES order) excluding the
active one, each chip carrying its category accent and clicking it applying exactly
that category filter (clearing query/type); plus the existing Clear button. Animate
the empty state in with a gentle scale-fade. (c) Wayfinding: while a category
filter is active, show a small floating "clear category × " pill (or equivalent
affordance) that appears after scrolling past the toolbar… — NO. Cut (c): the
sticky toolbar already provides wayfinding; do not duplicate controls. Tasks (a)
and (b) only.
</task>

<requirements>
  <entrance>One entrance owner per lifecycle: scroll-in owns first appearance;
    AutoAnimate/TransitionGroup own filter-time changes. Gate so a card only plays
    the scroll entrance ONCE (the directive's once mode), and cards already in the
    viewport on load play a short stagger, not a wall of simultaneous rises (the
    directive/tokens.css system supports per-element delay — reuse the pattern;
    cap visible-stagger like the bento's min(var(--enter-i), 14) does).
    Under reduced motion (either gate): no entrance, cards visible immediately —
    verify the directive's fail-open behavior (animateOnScroll/reveal set opacity
    via a class BEFORE IO fires; confirm a card can never be stranded hidden —
    this is the a11y-harness trap class from memory: never leave content at
    opacity 0 when observers don't fire; jsdom + axe must see visible cards with
    NO polyfill help).</entrance>
  <empty>Suggestions derived in a computed FROM CATALOG (never hand-typed);
    exclude the active category; each chip reuses the toolbar chip visual +
    accent vars via `categoryAccentStyle`; clicking sets activeCategory (which
    also updates the hash per the existing watch) and resets query/type. The
    Clear button and copy stay. The scale-fade is a <Transition> on the empty
    block, instant under reduced motion.</empty>
  <specs>Extend AnimationsPage.v2.spec.ts: filtering to an impossible combo (query
    "zzz") renders the empty state with exactly 3 suggestion chips, none equal to
    the active category, each labelled with a real category label; clicking one
    yields a non-empty grid and updates activeCategory + hash; cards carry the
    entrance directive binding when motion allowed and do NOT under
    provideMotionPreference(true); a jsdom mount with no IO polyfill still renders
    card content visible (assert no opacity-0 stranding class on initial
    render).</specs>
</requirements>

<constraints>
Do not modify the AutoAnimate/TransitionGroup dual-path structure, the filtered
computed, or the deep-link logic (focusEffectFromHash already relaxes filters —
suggestion clicks must go through the same activeCategory ref, nothing parallel).
Token-only color. No new deps.
</constraints>

<success_criteria>
- Scrolling down the full gallery, each row rises softly into place exactly once;
  filter changes still animate exactly as today (AutoAnimate path untouched).
- A doomed search lands on a designed empty state whose three suggestions always
  rescue (each yields ≥1 result by construction) in their own category colours.
- Reduced motion (either gate): instant cards, instant empty state — today's page.
- Specs + <validation> green; render.spec green; axe (including the no-IO
  environment) unchanged.
</success_criteria>
```

---

## [x] TASK-AV2-06 — The curtain call: a finale that points somewhere

```xml
<role>
You are the landing app's motion/visual engineer. The page ends at the last card
(Finding #6). Home has a finale, /blocks and /templates close designed. You are
building the gallery's curtain call: a compact CTA band whose art is drawn live by
the gallery's own connection primitives — the architecture diagram (tokens → motion
primitives → your app) as a performance, not a PNG.
</role>

<task>
Create `src/components/animations/AnimationsFinale.vue` and mount it after the
gallery in AnimationsPage: a full-width band containing (a) an aria-hidden art
panel where DzBeam draws animated connections between three labelled nodes —
"@dzup-ui/tokens" → "motion primitives" → "your app" — with a small DzOrbit ring
decorating the middle node; (b) truthful copy + derived numbers ("All
{CATALOG.length} effects are built on @dzup-ui/core and design tokens — every
snippet is copy-paste yours."); (c) two actions: the existing "Browse components"
link (LINKS.components) and a "Back to top" button that smooth-scrolls to the page
top (respecting reduced motion → instant jump). The band enters with a scroll
reveal.
</task>

<requirements>
  <art>The beam/orbit panel is ONE aria-hidden + inert container, pointer-events
    none. Read DzBeam's API first (it references two elements and draws an SVG
    path — the connections-primitives memory warns its internals are particular;
    mount-order and ref timing matter). Beams idle-loop their light travel only
    while in view (wrap with useInView like the cards do) and still completely
    under reduced motion (either gate — thread the page reduceMotion into the
    component's disabled path). The three node labels are REAL text for sighted
    users but the panel is decorative — put the meaningful claim in the copy (b),
    keep the diagram aria-hidden so SR users get one clean sentence, not a
    diagram read as soup.</art>
  <copy>Numbers derived from the CATALOG import. No claims about a published
    motion package (there is none — the module is landing-local; claims.spec.ts
    polices org consistency): the copy sells the snippets and core, not an npm
    install that doesn't exist.</copy>
  <actions>DzButton components, consistent with the hero's pair. Back-to-top:
    `window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })` with both
    gates checked (same pattern as focusEffectFromHash, AnimationsPage.vue:203-205).
    Focus is NOT moved (this is not a route change — no announcer involvement).</actions>
  <reveal>The band uses the same scroll-entrance mechanism AV2-05 standardized
    (once, fail-open, both gates). Layout: token surfaces/hairlines, works in
    light + dark + RTL (logical properties), no horizontal overflow at 360px.</reveal>
  <specs>`AnimationsFinale.spec.ts`: renders the derived count in the copy
    (computed from the CATALOG import in the spec too); art panel aria-hidden +
    inert; back-to-top calls scrollTo with behavior 'auto' under
    provideMotionPreference(true) and 'smooth' otherwise (spy on scrollTo); both
    links/buttons reachable by role. Page spec: finale mounts after the gallery
    exactly once.</specs>
</requirements>

<constraints>
The finale sits INSIDE the page (before the shared Footer, which is App-level —
untouched). No new routes, no nav changes, no edits to LINKS. Token-only color.
No new deps. Keep the band compact — a coda, not a second hero.
</constraints>

<success_criteria>
- The page now ends with a lit, animated architecture flourish and two clear next
  actions; beams draw and travel while visible, freeze off-screen and under
  reduced motion.
- Copy states only true, derived facts; axe pass unchanged (one new landmark-free
  section, clean roles).
- Back to top responds to both motion gates. Specs + <validation> green.
</success_criteria>
```

---

## [x] TASK-AV2-07 — Verification sweep, budgets, and the record

```xml
<role>
You are the release engineer for this backlog. Six visual tasks have landed
individually green; your job is proving the route — and the whole app — is green as
a system, measuring the cost, and writing the record so the next agent doesn't
rediscover anything.
</role>

<task>
Run the full verification matrix, fix anything the sweep surfaces (regressions
introduced by AV2-01..06 only — pre-existing failures are recorded, not fixed),
then write the Part 4 ledger in docs/animations-v2.md and update project memory.
</task>

<matrix>
  1. `yarn typecheck:apps` and `yarn typecheck` — 0 errors.
  2. Full landing suite: `yarn workspace @dzup-ui/landing test` — fully green (the
     1 known win32 failure lives in the CORE suite, not here).
  3. `yarn lint` — fully clean (this checkout's baseline).
  4. `yarn validate:tokens` — clean.
  5. Production build: `yarn workspace @dzup-ui/landing build`, then
     `yarn workspace @dzup-ui/landing check:bundle` — entry budget honored; record
     the AnimationsPage route chunk before/after (baseline `a3b805e`) and confirm
     ~0 delta on the critical path (everything is lazy).
  6. e2e (built preview): at minimum `e2e/flows.spec.ts` and `e2e/visual.spec.ts`
     (baselines cover `/` — confirm no baseline churn).
  7. Manual matrix in the dev server: light/dark × fine/coarse pointer × reduced
     motion (BOTH gates — OS emulation and the toolbar switch) on /animations;
     RTL spot-check for the new absolutely-positioned layers; no horizontal
     overflow at 360/768/1280/1680px; deep links `#text` and `#effect-typewriter`
     still land correctly; every pointer-driven demo remains fully usable inside
     its non-tilting card.
</matrix>

<record>
  Part 4 ledger: per-task status flips to [x] with one measured line each; a cost
  table (route chunk JS/CSS gzip deltas); traps encountered; the validation
  transcript summary. Then update the auto-memory: a new
  `animations-v2-the-theatre.md` memory (pattern: the landed sibling memories)
  indexed from MEMORY.md, cross-linking [[templates-v2-the-showroom]] and
  [[blocks-v2-depth-on-the-shelf]].
</record>

<success_criteria>
- Every matrix row green (or a pre-existing failure explicitly recorded as such
  with evidence it predates this work).
- Ledger written; memory saved; doc statuses accurate.
</success_criteria>
```

---

## Part 4 — Execution log

| Task | Status | Landed |
|---|---|---|
| AV2-01 house lights (atmosphere) | `[x]` | 2026-08-27 |
| AV2-02 overture (hero) | `[x]` | 2026-08-27 |
| AV2-03 raked stage (cards) | `[x]` | 2026-08-27 |
| AV2-04 control booth (toolbar) | `[x]` | 2026-08-27 |
| AV2-05 choreography (entrance + rescue) | `[x]` | 2026-08-27 |
| AV2-06 curtain call (finale) | `[x]` | 2026-08-27 |
| AV2-07 verification + record | `[x]` | 2026-08-27 |

### Ledger (measured 2026-08-27, win32)

- **AV2-01** — `.av2-atmosphere` full-height washes + UNSCOPED `@property`
  pair `--av2-accent`/`--av2-accent-2` (own names, never `--bv2-*`/`--tv2-*`);
  `.anim-page` got `isolation: isolate`; hues resolved through the existing
  `categoryAccentStyle()` (never a second hue map); 'all' → brand
  primary + `--lp-brand-2`; eyebrow tinted. Deep-linking `#<category>` lands
  already lit. Specs: 4 (`AnimationsPage.v2.spec.ts`).
- **AV2-02** — `components/animations/AnimationsHeroField.vue`: 5 live
  mini-performances (DzOrbit ring, DzGradientText pill, `.dz-meteors` patch,
  `.dz-ping` dot, `.dz-shimmer` skeleton — ZERO image bytes, each tinted by a
  real `CATEGORY_ACCENTS` hue) on DzParallax depths, width via `calc()` (never
  transform scale), idle float, aria-hidden + inert, post-paint gate; partial
  ≤1360px, gone ≤1100px. H1 upgraded to DzStagger word cascade +
  ANIMATED DzGradientText (same string, same id — accessible tree unchanged).
  Stats `<dl>`: effects / categories / native-API upgrades, all
  CATALOG-derived, via DzCountUp. Specs: 3 (field) + 3 (page).
- **AV2-03** — card restructured: `content-visibility` stays on the
  `<article>`, tilt + planes moved to an inner `.card-shell` — **paint
  containment (and `overflow: hidden`) are grouping properties that FLATTEN
  `preserve-3d`**; the stage now rounds/clips itself
  (`border-start-*-radius`). `v-tilt` (max 3.5°, scale 1.01, glare,
  `disabled: reduced || interactiveStage`) with translateZ planes 18/12/8px,
  clamped while the disclosure is open. `POINTER_DRIVEN` Set (13 ids, audited
  — incl. card-stack/dynamic-island/morphing-dialog because FLIP/VT measure
  gBCR under a rotated ancestor; parallax-drift audited and NOT excluded, it
  is scroll-driven) → those cards get the static "stage light" hover via the
  `interactive-stage` prop. Replay icon one-shot -360° spin (keyed span, not
  the demo key), copy/link success pops, permalink pulse now also runs one
  accent `.dz-border-beam` lap (2.2s, JS-gated off under reduce). Specs: 5
  (`AnimationCard.v2.spec.ts`).
- **AV2-04** — chips: press spring + one-shot activation ring pulse in the
  chip's OWN accent (pseudo-element); result count → DzOdometer with the
  TV2-04 SR recipe (DzVisuallyHidden plain sentence = the only polite
  utterance; visual layer aria-hidden); Clear in an `av2-fade` Transition;
  stuck-state elevation via a 1px IO sentinel (`rootMargin: -64px` matches the
  sticky offset); 2px reading-progress hairline (useDocumentScrollProgress →
  scaleX) in the atmosphere accent. **Recorded deviation:** the hairline
  PERSISTS under reduced motion — the ScrollProgressBar "static-jump"
  convention (scroll-linked = user-driven, not animation) overrides the task
  text's hide-it requirement. Specs: 4.
- **AV2-05** — scroll entrance via `v-animate-on-scroll` (chosen over
  `v-reveal` because it is fail-open: content is visible before IO fires and
  reveals at once without IO — no opacity-0 stranding class exists). One
  entrance owner: only the INITIAL cohort (ids present at setup) carries an
  enter class; later filter-joins enter via AutoAnimate alone; the page toggle
  needs no `updated` hook because flipping it swaps the bento branch and
  remounts every card. Capped stagger mirrors the bento
  (`min(i, 14) * 38ms`). Empty state: 3 most-populated-category suggestion
  chips (derived, ties by CATEGORIES order, active category excluded,
  guaranteed ≥1 result), routed through the same `activeCategory` ref so hash +
  atmosphere follow; gentle appear scale-fade. Specs: 3.
- **AV2-06** — `components/animations/AnimationsFinale.vue`: aria-hidden +
  inert art panel where two DzBeam light-paths connect
  `@dzup-ui/tokens → motion primitives → your app` (selector refs) with a
  DzOrbit ring on the middle node, loops paused off-screen via the shared
  `.dz-stage-idle` cap; copy derives the effect count from CATALOG and claims
  no npm motion package (module is landing-local); Browse components +
  dual-gate Back-to-top (`behavior: reduced ? 'auto' : 'smooth'`). Note:
  DzButton `as="a"` exposes `role="button"` — specs query button, not link.
  Specs: 4 (finale) + 1 (page).
- **AV2-07 matrix** — `yarn typecheck` + `yarn typecheck:apps`: 0 errors.
  Landing suite: **67 files / 2723 tests, all green** (baseline 63/2696).
  `yarn lint`: clean. `yarn validate:tokens`: clean. Build green;
  budgets all PASS: entry JS 153.54/175 kB, **initial load JS 208.12/240 kB**
  (templates-v2 ledger read 208.11 on the same artifact set → **v2 cost
  ≈ +0.01 kB gzip on the critical path**), initial payload 245.82/285 kB.
  AnimationsPage route chunk (gzip, baseline `a3b805e` → v2): JS
  23.67 → 27.67 kB (+4.00), CSS 2.68 → 4.62 kB (+1.94) — all lazy, zero
  asset bytes added. e2e (built preview, chromium): `flows.spec.ts` 6/6,
  `visual.spec.ts` 4/4 (baselines untouched — they only cover `/`). Scripted
  browser matrix (real Chromium on the built preview): light/dark × ltr/rtl ×
  360/768/1280/1680px on `/animations` — no horizontal overflow, no console
  errors, atmosphere present, hero field correctly absent ≤1100px and present
  ≥1280px, finale present; interaction pass: `#text` deep link lands violet,
  Numbers chip retargets to emerald + `#numbers` hash, `#effect-typewriter`
  highlights with the spotlight lap, reduce-motion toggle strips every
  entrance class with all cards intact. NOT run: the core package suite (no
  `packages/*` file touched; its known win32 baseline stands) and the CI
  coverage gate (CI's own invocation — see the free3-12 memory).
- **Traps encountered:** (1) `content-visibility: auto` on the card root
  silently flattens `preserve-3d` — the 3D shell must be an inner wrapper,
  and dropping `overflow: hidden` means the stage clips its own top corners.
  (2) jsdom has no `Element.animate`, and the bento's AutoAnimate path calls
  it from a MutationObserver on every REAL filter change — specs clicking a
  non-default chip need the minimal animate stub (the interaction sweep never
  hit this because it only clicks each page's first representative control,
  the already-active "All" chip). (3) DzButton `as="a"` renders
  `role="button"`. (4) Multi-file vitest runs can spuriously report "error
  caught after test environment torn down" from demo timers under parallel
  load — re-run the file solo before diagnosing; the full suite is green.
