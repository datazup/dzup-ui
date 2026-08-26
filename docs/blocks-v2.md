# dzup-ui — Blocks v2: Depth on the Shelf (`/blocks` on `apps/landing`)

> **Status:** Specification + execution log. The `<task>` blocks below are the build.
> **Owner:** dzup-ui team · **Authored:** 2026-08-26 · **Baseline:** `main` @ `2758a4b` (clean tree)
> **Scope:** the `/blocks` index route of `apps/landing` — `pages/BlocksIndexPage.vue` and
> the `src/components/blocks/` surfaces it mounts (`BlockCard`, `BlockCategoryNav`,
> `BlockPreview` chrome, `BlockSearchBar`, results mode), plus any `src/motion`
> primitives they consume. `BlockDetailPage` / `BlockPreviewPage` are touched only where
> a task explicitly says so. Block SFCs under `src/blocks/` are **never** edited — the
> catalog's content is out of scope; only its shelf is being rebuilt.
>
> **Goal (from the product owner):** the current page looks nice and works well — v2 must
> make it **more interactive in a more interesting way**: more **3D**, more **animated**,
> with **added imagery** — while staying inside the existing token theme and describing
> what the page actually is (a truthful catalog of live, copy-paste blocks).
>
> **Method:** a fresh sweep of this checkout — `BlocksIndexPage.vue` (794 lines), all ten
> `src/components/blocks/` components, the block registry, the motion module barrel, the
> e2e/a11y/perf guardrails — every claim below carries a `file:line` or a command result.
>
> **Relationship to other docs:** the sibling of [`landing-v2.md`](./landing-v2.md)
> ("Depth & Play", TASK-LV2-01..10, all landed): same design language, same principles,
> same motion module — applied to the catalog route instead of the home page. Builds on
> [`blocks.md`](./blocks.md) (the catalog architecture this page renders) and
> [`free-apps-review-3.md`](./free-apps-review-3.md) (budgets, axe ratchet, e2e).
> Numbering: `TASK-BV2-*`, distinct from all prior series.
>
> **Preservation decision (differs from landing-v2):** no `/blocks-classic` route. The
> home page got `/classic` because the owner explicitly wanted the old design reachable;
> here the owner is happy with the page and wants it *enhanced*, not replaced. Every v2
> layer below is **additive**: decoration is `aria-hidden` and sits behind or beside the
> existing DOM, pointer effects attach only on fine pointers, and reduced motion renders
> a page behaviorally identical to today's. Reverting any task is deleting its layer.
>
> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Part 1 — Analysis of the current `/blocks` page (measured 2026-08-26)

The page is a hero (eyebrow · H1 · lede · ⌘K palette) over a search/tag bar, a global
token editor, then a **deck**: a sticky category tab bar switching one category panel at
a time (cards grid + lazy live previews), a prev/next pager, and the "Use with AI"
callout (`BlocksIndexPage.vue:431-608`). Search/tag/component filters swap the deck for
a flat cross-category results grid (`BlocksIndexPage.vue:470-506`). 87 blocks across 12
categories (`src/generated/counts.ts:71`, `registry.ts:128-194`), each category carrying
a decorative accent hue exposed to descendants as `--lp-cat-500`
(`BlocksIndexPage.vue:166-170`).

| # | Finding | Evidence |
|---|---|---|
| 1 | **Functionally rich, visually flat — the shop still doesn't use its own goods.** `src/motion` ships 34 components (`DzParallax`, `DzBeam`, `DzBorderBeam`, `DzOrbit`, `DzOdometer`, `DzGradientText`, `DzCountUp`, `DzSpotlight`, …) and 5 directives (`v-tilt`, `v-glare`, `v-magnetic`, `v-reveal`, `v-animate-on-scroll`) — all tested, reduced-motion-safe. `/blocks` imports exactly **one**: `vReveal`, applied as a uniform staggered fade (`BlocksIndexPage.vue:17,540`). Landing v2 fixed this on the home page; the catalog route never got the treatment. | `grep "from '../motion" pages/BlocksIndexPage.vue components/blocks/*` → 1 hit |
| 2 | **The hero is three lines of static text.** Eyebrow, H1, lede, palette button — no depth, no imagery, no numbers (`BlocksIndexPage.vue:437-456`). The page *about* 87 pre-composed visual sections opens with zero visual evidence of them. The derived-counts machinery (blocks/categories/components, never hand-typed — `counts.ts`) is unused here. | `BlocksIndexPage.vue:437-456` |
| 3 | **Cards are text-only tiles.** `BlockCard` is title + description + chips + CLI + links inside a generic `lp-card lp-card--hover` lift (`BlockCard.vue:71`). No art area, no tilt, no glare — the product (a *visual* section) is invisible until the reader scrolls to the heavy preview below. Hover language is the same small lift every other card on the site uses. | `BlockCard.vue:71-148` |
| 4 | **The deck switch is a 2D slide.** The one-panel-at-a-time deck — the page's signature interaction — transitions with `translateX(±36px) scale(0.99)` + fade (`BlocksIndexPage.vue:733-758`). It reads as a swap, not as the "pages turning" the file comment promises (`:26-27`). No perspective, no depth, and the pager is two plain outline buttons. | `BlocksIndexPage.vue:733-758,566-598` |
| 5 | **The category accent system stops at chips.** Each category's `--lp-cat-500` hue tints tab pill, chips and preview wash — but the *page* never changes: background, hero and surroundings are identical whether you're browsing Marketing (violet) or Data (teal). Switching categories should feel like walking to a differently-lit aisle; today only 2px pills change. | `BlocksIndexPage.vue:121-131,166-170`; `BlockCategoryNav.vue:236-237` |
| 6 | **Category tabs are bare text.** No icons, no per-category block counts — 12 identical-looking labels distinguished only on activation (`BlockCategoryNav.vue:179-195`). The gliding pill indicator (`:171-177`) is the page's best micro-interaction and it's fighting alone. |
| 7 | **Results mode has no choreography.** Toggling a tag swaps deck↔results via a plain cross-fade; the results grid re-renders with no FLIP, the live count is plain text (`resultsLede`, `BlocksIndexPage.vue:113-119`), and the empty state is one sentence (`:117`). `DzOdometer` and `TransitionGroup` moves exist for exactly this. |
| 8 | **Zero imagery, and the imagery pipeline was never run.** `BLOCK_OG_IDS` is empty (`src/generated/ogImages.ts:13`) — `yarn og` (per-block screenshot cards, `scripts/shoot-og.mts`) exists but no block image is committed. **Decision: keep it that way on this page.** The brand claim is "never a screenshot" — blocks are *live*. v2's "added imagery" is therefore (a) live scaled-down block renders as card art (the product itself, zero repo bytes) and (b) token-built abstract block postcards in the hero. Committed screenshots stay a detail-page/SEO concern, out of scope. |
| 9 | **Perf history that constrains every task:** `/blocks` was one of the two worst mobile LCP routes (4.15 s) until TASK-FREE3-04 made `BlockPreview` async (`LazyBlockPreview.vue:49-60`). The entry chunk budget is 240 kB gzip with ~207.7 kB used (`scripts/check-bundle-budget.ts`, landing-v2 ledger). Nothing v2 adds may join the critical path: decoration mounts post-paint, art is lazy, and everything heavy stays inside the already-async chunks. |
| 10 | **Guardrails that must stay green (features, not obstacles):** per-block responsive containment e2e (`e2e/block-responsive.spec.ts:96-103` — every block, every viewport); `/blocks` in the per-page axe suite (`src/pages.a11y.spec.ts:109`, serious+critical + moderate rule-id pass); route-chunk fetch e2e (`e2e/flows.spec.ts:44`); component specs (`BlockCategoryNav.spec.ts`, `BlockPreview.spec.ts`, `useBlockSearch.spec.ts`, …); token-only colors (`yarn validate:tokens`); reduced-motion (`motion/tokens.css` central block); manual-activation APG tabs with RTL-aware arrows (`BlockCategoryNav.vue:84-127`). |

**Found healthy, preserve untouched:** the deck's mount economy (one category at a time +
`LazyBlockPreview` viewport gating); the scroll-settle loop and deep-link machinery
(`BlocksIndexPage.vue:262-348` — hard-won, do not disturb); the single-source
`useBlockSearch` filtering path; the `useBlockTheme` single-writer token editor; the APG
tabs semantics; the ⌘K palette; the AI callout; all `#<id>`/`#<category>`/`?component=`
deep links.

---

## Part 2 — Design direction: "Depth on the Shelf"

One sentence: **keep the calm, truthful catalog and light the room** — the active
category's hue becomes atmosphere, the deck turns in real 3D, the cards show the product
they sell, and every number the page states counts itself up from the registry.

Principles (inherited from landing-v2 Part 2; task blocks do not repeat them):

1. **Depth is transform-only.** `perspective` + `rotateX/rotateY/translateZ/scale`,
   compositor-friendly. No new filters/blend-modes on ancestors of text or of the live
   previews (the blank-page bug class; also `backdrop-filter` already exists on the
   sticky nav — don't stack more).
2. **The paint path is sacred.** The H1/lede paint immediately, in final position. All
   hero decoration is `aria-hidden`, paints behind text, and mounts post-paint
   (`onMounted`/idle). Card art and preview chrome effects live inside already-lazy
   subtrees. Zero new eager imports in the entry chunk.
3. **Reduced motion = today's page (or calmer).** Every effect degrades to at most an
   opacity fade under `prefers-reduced-motion: reduce`; pointer effects attach only on
   `(hover: hover) and (pointer: fine)`. Focus/click targets never *depend* on pointer
   position to be hittable.
4. **Reuse the motion module first** (`vTilt`, `vGlare`, `vMagnetic`, `DzParallax`,
   `DzOdometer`, `DzCountUp`, `DzBorderBeam`, `DzGradientText` all exist). New CSS
   effects that are blocks-specific stay in the components; anything generic goes to
   `src/motion`.
5. **Tokens only.** Colors via `--dz-*` / `--lp-*` (the category accent is always
   `var(--lp-cat-500)` or `--dz-colors-<accent>-<n>`); durations/eases via
   `--dz-duration-*` / `--dz-ease-*`. `yarn validate:tokens` stays green.
6. **Truth stays truthful.** No screenshots on this page; imagery is the live product or
   abstract token-built shapes. Every count shown is derived (registry /
   `generated/counts.ts`), never typed.
7. **Budgets are gates.** Entry gzip ≤ 240 kB, axe suites, block containment e2e,
   0-error `vue-tsc`, lint baseline (2 pre-existing warnings in
   `packages/tooling/scripts`, nothing else).
8. **The catalog's machinery is read-only.** Registry, search, theme store, scroll/deep
   -link logic, APG tab semantics: consumed, never rewritten.

Validation contract used by every task below (referenced as `<validation>`):

```
yarn workspace @dzup-ui/landing test     # full landing suite (incl. axe, interactions)
yarn typecheck:apps                      # 0 errors (baseline is 0)
yarn lint                                # baseline: 2 pre-existing warnings in
                                         # packages/tooling/scripts, nothing else
yarn validate:tokens                     # token-only styling gate
```

(Narrow spec iteration: `npx vitest run <root-relative path>` from the repo root —
`yarn workspace @dzup-ui/landing test <file>` runs the whole suite regardless.)

---

## Part 3 — Tasks

Execution is **synchronous**: one task lands (code + tests + validation) before the next
starts. The execution log in Part 4 is updated as each task changes state.

---

## [x] TASK-BV2-01 — Ambient atmosphere: the room takes the category's color

```xml
<role>
You are the landing app's motion/visual engineer. The page already computes a per-category
accent (`--lp-cat-500`) and hands it to chips and pills — you are promoting it to
atmosphere, so switching categories re-lights the whole page instead of re-tinting 2px
pills. This is the cheapest, highest-leverage depth cue on the page: pure CSS color, no
layout, no JS per frame.
</role>

<task>
Add an aria-hidden, fixed-position atmosphere layer to BlocksIndexPage — two large, soft
radial gradient washes (top-left behind the hero, right edge mid-page) whose hue is the
ACTIVE category's accent and which cross-fade smoothly when `active` changes, plus a
subtle matching tint on the hero eyebrow. In results mode (mixed categories) and on
non-deck states the atmosphere settles to the neutral brand primary.
</task>

<motivation>
Finding #5: the accent system stops at chips. `accentStyle`
(BlocksIndexPage.vue:166-170) already exposes `--lp-cat-500` per panel; the atmosphere
reuses the same computed hue at page level. Gradients don't interpolate via `transition`,
so the smooth hue change needs `@property` registration (a typed `<color>` custom
property IS interpolable) with a graceful no-@property fallback: the wash still renders,
the hue just snaps — behaviorally identical, visually acceptable.
</motivation>

<requirements>
  <layer>A single `.bv2-atmosphere` div, `position: fixed; inset: 0; z-index: -1;`
    (or first child with negative z-index inside the page root — verify against the
    page's stacking context), `pointer-events: none`, `aria-hidden="true"`. Two
    `radial-gradient` washes built from `color-mix(in oklch, var(--bv2-accent) X%,
    transparent)` at low opacity — must stay whisper-quiet in light AND dark themes
    (test both; dark needs a lower mix percentage).</layer>
  <hue>`--bv2-accent` registered via CSS `@property { syntax: '<color>'; inherits: true }`
    with `transition: --bv2-accent 600ms var(--dz-ease-out)` on the layer. Value driven
    from the template: the active section's `--dz-colors-<accent>-500` in deck mode,
    `var(--dz-primary)` in results mode. No raw color literals.</hue>
  <motion>The hue transition is a color fade, not movement — it may persist under
    reduced motion, but keep a `@media (prefers-reduced-motion: reduce)` block dropping
    the transition to instant anyway (cheapest possible compliance, matches the page's
    existing pattern).</motion>
  <perf>No JS per frame, no filters, no blend modes, no new elements per category. The
    layer must not create a containing block surprise for the sticky nav (verify sticky
    still sticks) and must not paint over the previews (z-index audit).</perf>
  <specs>A BlocksIndexPage-level spec (or new atmosphere spec) asserting: the layer is
    aria-hidden, exists once, and its inline style carries the active category's accent
    var; switching `active` updates it; results mode resets it to the primary.</specs>
</requirements>

<steps>
  1. Read the page root's stacking/paint order (App.vue transition wrapper, Section,
     sticky nav z-40) to place the layer safely.
  2. Implement layer + @property registration (unscoped `@property` at-rule needs a
     plain non-scoped style block or global CSS — verify vite/vue SFC handling; the
     existing `::view-transition` precedent used an UNSCOPED style block).
  3. Wire the accent computed; add the results-mode fallback.
  4. Specs; run <validation>.
</steps>

<success_criteria>
  - Browsing Marketing vs Data visibly re-lights the page in both themes; switching
    categories cross-fades the hue over ~600ms in Chromium.
  - No change to any existing spec; axe `/blocks` pass unchanged; sticky nav unaffected.
  - Full <validation> green.
</success_criteria>
```

---

## [x] TASK-BV2-02 — Hero depth field: floating block postcards + counted-up truth

```xml
<role>
You are the hero engineer who built HeroV2 (TASK-LV2-03) — same discipline here: the H1
and lede paint instantly in final position; everything added is aria-hidden decoration
behind/beside them, mounted after paint, parallax-driven on fine pointers only.
</role>

<task>
Give the /blocks hero a depth field and its numbers: (a) a DzParallax perspective stage
behind the hero text holding 4-6 abstract "block postcards" — small token-built skeleton
cards (header bar + text lines + button shapes, pure CSS boxes) at different depths,
each tinted by a REAL category accent, slowly drifting (CSS keyframes) and shifting with
pointer parallax; (b) a stat row under the lede — "{blocks} blocks · {categories}
categories · built from {components} components" — where every figure is DERIVED
(registry length / CATEGORIES length / count of distinct `components` names across
BLOCKS) and counts up in-view via DzCountUp.
</task>

<motivation>
Finding #2: the page about visual sections opens with no visuals and no numbers.
Postcards are honest imagery — abstract skeletons of what a block IS (hero, pricing,
auth card), not screenshots. Counts already exist derived (`generated/counts.ts`
blocks: 87) but the distinct-components figure must be computed from the registry at
runtime (cheap: it's metadata already in the entry chunk) so it can never drift.
DzParallax + DzCountUp exist in src/motion (landing-v2 built them) — this task only
consumes.
</motivation>

<requirements>
  <postcards>A `BlocksHeroField.vue` component in `src/components/blocks/`:
    aria-hidden, `pointer-events: none`, absolutely positioned behind the hero copy
    (verify H1 contrast is untouched — postcards stay outside the text column or at
    very low opacity behind it). Each postcard: `--lp-cat-500`-tinted border/header
    from real category accents, `translateZ`/scale for depth, an infinite slow float
    keyframe (staggered delays), and `data-depth` layers under DzParallax. Mounted
    `onMounted` (post-paint) — v-if on a mounted flag. Static (no float, no parallax)
    under reduced motion; parallax only attaches on fine pointers (DzParallax's own
    contract).</postcards>
  <stats>Stat figures from a single exported helper (e.g. `blocksStats()` in a small
    `src/blocks/stats.ts` or computed in-page from `BLOCKS`/`CATEGORIES`): no literal
    numbers in the template or specs (specs compare against the registry, mirroring the
    published-counts rule). DzCountUp animates in-view, renders the final number under
    reduced motion (its built-in behavior). Screen readers get the plain number
    (DzCountUp already handles this — verify).</stats>
  <perf>Zero new deps; postcards are ~6 divs + CSS. No layout shift: the hero's
    box must not change height when the field mounts (absolute positioning), and the
    stat row reserves its line from first paint (it renders numbers immediately, only
    the count-up is deferred).</perf>
  <specs>A `BlocksHeroField.spec.ts` (mount hidden/aria contract, postcard count,
    reduced-motion static branch via provideMotionPreference) and a stats spec asserting
    the three figures equal registry-derived truths.</specs>
</requirements>

<steps>
  1. Read HeroV2.vue + templateWall.ts for the established postcard/parallax patterns
     (and the provideMotionPreference spec trap from memory).
  2. Build BlocksHeroField + stat row; wire into BlocksIndexPage hero.
  3. Verify contrast + CLS in both themes at 360px/1280px widths.
  4. Specs; run <validation>.
</steps>

<success_criteria>
  - Hero shows drifting depth postcards that answer the pointer; text paints first and
    never moves; reduced motion shows a static, equally-composed hero.
  - Stat row counts up on first view; numbers provably derived (spec).
  - Full <validation> green, axe pass unchanged.
</success_criteria>
```

---

## [x] TASK-BV2-03 — Category nav: icons, counts, and a livelier pill

```xml
<role>
You are the a11y-minded component engineer who owns the APG tabs implementation in
BlockCategoryNav. Its keyboard/RTL semantics are correct and hard-won (BlockCategoryNav
.vue:84-127) — you are dressing the tabs, not touching activation logic.
</role>

<task>
Give each category tab an identity: a per-category lucide icon (declared alongside the
category metadata, one map in BlockCategoryNav or registry-adjacent — NOT hand-listed in
the template) and a small derived block-count badge; add a hover micro-interaction
(icon nudge + accent tint, transform-only); and let the existing pill indicator subtly
overshoot (a gentle spring-like cubic-bezier) so switching feels physical. Tab hit areas
and the manual-activation/roving-tabindex/RTL behavior are byte-identical.
</task>

<motivation>
Finding #6: 12 identical text labels. Icons + counts make the shelf scannable and honest
(counts from `blocksByCategory(id).length` — derived, like everything else). The pill
(:171-177) already glides; a slightly overshooting ease makes it feel sprung without any
JS. Counts also set up the pager task (BV2-04) to show destination context.
</motivation>

<requirements>
  <icons>One `CATEGORY_ICONS: Record<BlockCategory, Component>` map (lucide-vue-next
    imports — tree-shaken, already a dependency). Icons aria-hidden; the accessible name
    stays the label text. Choose icons that describe the category (marketing→megaphone,
    data→table, auth→lock, …).</icons>
  <counts>A `.cat-nav-count` badge per tab, `aria-hidden` with the accessible count in
    the tab's aria-label (`"Marketing, 13 blocks"`) OR visually-only if the axe pass
    prefers; tabular-nums; tinted by the tab accent. Derived from `blocksByCategory` —
    pass through props (page already computes sections with blocks) rather than
    re-importing the registry here.</counts>
  <motion>Hover: icon `translateY(-1px) scale(1.08)` + label tint (existing hover color
    rule), transitioned, `@media (prefers-reduced-motion: reduce)`→none. Pill: swap the
    transform/width ease for a mild overshoot bezier (e.g. cubic-bezier(0.34, 1.3,
    0.64, 1)) via the existing `--dz-ease-*` tokens if one fits, else a local constant
    with a comment; keep duration token-driven. Reduced motion already kills the pill
    transition (:289-293) — keep that.</motion>
  <specs>Extend BlockCategoryNav.spec.ts: icons render per category, counts match the
    passed sections' block lengths, aria-labels carry counts, keyboard behavior specs
    still pass untouched.</specs>
</requirements>

<steps>
  1. Read BlockCategoryNav.spec.ts to extend, not break, its harness.
  2. Add icon map + count badge + styles; thread counts from BlocksIndexPage's
     `sections` (CategorySection already carries `blocks`).
  3. Specs; run <validation>.
</steps>

<success_criteria>
  - Tabs show icon + label + count; hover nudges the icon; the pill lands with a
    perceptible soft overshoot; keyboard/RTL specs unchanged and green.
  - Full <validation> green; axe pass unchanged (tabs keep accessible names).
</success_criteria>
```

---

## [x] TASK-BV2-04 — The deck turns in 3D + a magnetic pager

```xml
<role>
You are the transition choreographer. The deck is the page's signature interaction and
its comment already promises "groups feel like pages turning" (BlocksIndexPage.vue:26) —
you are making the CSS keep that promise, without touching the state machine
(goTo/direction/out-in mode/after-enter hook are all load-bearing for the palette's
pending-scroll flow).
</role>

<task>
Upgrade the deck transition from 2D slide to a perspective page-turn: the deck container
gets `perspective`, and the panel enter/leave states combine the existing translateX
with a small `rotateY` (±4-6deg, origin on the entering edge) and `translateZ` dip, so
forward/back reads as turning a card over a surface. Then make the pager physical:
`v-magnetic` on both pager buttons (fine pointers only), destination-accent tint on
hover (the NEXT category's hue, from its accent), and the count ("3 / 12") ticking via a
tabular-nums micro-roll. Reduced motion keeps today's instant opacity swap exactly
(the existing block at :777-793 already zeroes transforms — extend it to the new ones).
</task>

<motivation>
Finding #4. All state logic stays: only the `.deck-fwd-*`/`.deck-back-*` CSS classes and
the pager presentation change. `v-magnetic` exists and self-gates on pointer/motion
(src/motion/directives/magnetic.ts). The destination tint reuses `accentVar` semantics
already established in the nav.
</motivation>

<requirements>
  <turn>`#blocks-deck` (or an inner wrapper) gains `perspective: 1200px`. Enter-from
    (fwd): `translateX(48px) rotateY(-5deg) translateZ(-24px)`, opacity 0; leave-to
    (fwd): mirrored negative; back variants mirrored. `transform-origin` set per
    direction. Durations/eases stay on the existing `--dz-duration-*`/`--dz-ease-*`
    tokens. The existing `overflow-x: clip` (:635-639) must still contain the turn —
    verify no horizontal scrollbar mid-flight and no clipped sticky elements.</turn>
  <pager>Both buttons wrapped/bound with v-magnetic (small strength — buttons, not
    toys); hover tints border/label toward the destination section's accent via a
    `--pager-accent` custom property computed from prev/nextSection. Disabled state
    untouched. The count gets `font-variant-numeric: tabular-nums` (already there,
    :697-701) plus a short slide-fade on change (Transition on the number,
    out-in, 120ms).</pager>
  <a11y>No new interactive elements; focus-visible outlines unchanged; v-magnetic never
    moves the button while it has keyboard focus (directive's contract — verify, don't
    assume: read magnetic.ts).</a11y>
  <specs>Page spec: transition classes applied per direction still correct (existing
    behavior), pager renders destination labels + accents. Directive behavior itself is
    covered by directives.spec.ts — don't retest it.</specs>
</requirements>

<steps>
  1. Read magnetic.ts contract; read how deck classes are asserted in existing specs
     (if at all) to extend safely.
  2. CSS for the 3D turn (both directions, both reduced-motion overrides).
  3. Pager magnetism + accent + count roll.
  4. Manual check: rapid tab-switching spam produces no stuck mid-turn state
     (out-in guards this; verify with the after-enter palette flow too).
  5. Specs; run <validation>.
</steps>

<success_criteria>
  - Forward/back category switches read as a shallow 3D page turn in Chromium; reduced
    motion is an instant swap; palette jump → deck switch → scroll flow still lands on
    the target block.
  - Pager buttons subtly follow the pointer and preview the destination's hue.
  - Full <validation> green.
</success_criteria>
```

---

## [x] TASK-BV2-05 — BlockCard v2: live postcard art, tilt and glare

```xml
<role>
You are the card engineer. BlockCard is the catalog's index tile and currently sells a
visual product with plain text (Finding #3). You are adding the product itself to the
tile — a live, miniaturized, non-interactive render of the block — plus a restrained
3D hover. The card's interactive anatomy (whole-card cover link + lifted chips/CLI/
permalink z-stack, BlockCard.vue:199-321) is precise; every new layer must slot into
that stack without stealing a single click.
</role>

<task>
Add an art area at the top of BlockCard: a fixed-aspect (16/10) viewport that lazily
mounts the block's own `component` scaled down (transform: scale ≈0.25 of a 1100px-wide
inert stage), non-interactive (`inert` + `aria-hidden` + `pointer-events: none`),
skeleton-shimmer while loading and a category-accent gradient as the resting fallback
(no-IO environments, SSR, data-saver). On fine pointers the whole card gets `v-tilt`
with glare (small max angle); the art layer gains a slightly stronger tilt response via
the directive's existing depth/parallax affordance IF it has one (read tilt.ts —
otherwise the single tilt is enough; do not fork the directive).
</task>

<motivation>
"Added imagery" that stays truthful: the image IS the block, rendered live — zero repo
bytes, zero screenshot drift, and it inherits the global theme toolbar re-theming for
free (a killer demo: recolor the brand and every card's art follows). Perf is the risk
and the design: the art mounts through the SAME `useLazyMount` viewport gate the page
already trusts (LazyBlockPreview), the component modules are the SAME lazy modules the
previews below will load anyway (no new bytes, earlier fetch of a subset), and `inert`
kills its tab stops and AT exposure. v-tilt/v-glare exist, self-gate on
touch/reduced-motion, and were built for exactly this card size.
</motivation>

<requirements>
  <art>New `BlockCardArt.vue`: container with `aspect-ratio: 16/10; overflow: hidden;
    border-radius` matching the card top; inner stage `width: 1100px` scaled by
    container-width/1100 (measure via ResizeObserver or CSS `container`-relative math —
    prefer pure CSS if possible, else the RO pattern from BlockCategoryNav:148-152);
    `inert` attribute + aria-hidden + pointer-events none on the stage; block component
    via `defineAsyncComponent` of `block.component` behind `useLazyMount`. Falls back to
    the accent gradient + a large ghost lucide icon when not yet mounted — that
    fallback IS the reduced-data/no-IO final state and must look intentional.</art>
  <tilt>`v-tilt` (with glare enabled per its API) on the card root — verify it composes
    with `lp-card--hover`'s existing translate (read tilt.ts + lp-card CSS; if both
    write transform, let the directive own transform and move the lift into the
    directive's rest state or drop the CSS lift on tilted cards). Max tilt small
    (≈4deg). Focus-visible outlines and all five interactive layers (cover link, chips,
    CLI tabs, copy, permalink) keep working — click-test each in the spec via
    z-index/stacking assertions where feasible.</tilt>
  <safety>The art must never create a scrollbar, never grow card height beyond the
    reserved aspect box (CLS 0), and never mount for `prefers-reduced-data` if the page
    has such handling precedent (check; if none, viewport-gating suffices). Blocks
    whose root is a full-page shell still render fine cropped — the 16/10 crop from the
    top is the accepted framing (same as OG cards' framing decision, shoot-og.mts).</safety>
  <specs>`BlockCardArt.spec.ts`: renders fallback before intersection; mounts inert +
    aria-hidden stage after (drive useLazyMount per its existing spec pattern); scale
    math sane. Extend BlockCard.spec if one exists (check) for the art slot presence;
    chips/permalink still clickable (existing specs must stay green untouched).</specs>
</requirements>

<steps>
  1. Read tilt.ts, useLazyMount.ts + its spec, and lp-card CSS (src/styles) first.
  2. Build BlockCardArt; wire into BlockCard above `.block-card-body`.
  3. Tilt integration + transform-conflict resolution.
  4. Perf sanity: category with most blocks (grep registry) scrolled end-to-end —
     confirm previews below still lazy-mount normally and interaction stays smooth.
  5. Specs; run <validation>.
</steps>

<success_criteria>
  - Cards open with real, live, theme-reactive miniatures of their blocks; touch and
    reduced-motion users get the static card with art (no tilt); keyboard users reach
    every control exactly as before (inert art adds zero tab stops).
  - Retheming via the toolbar visibly recolors card art. CLS 0 on the grid.
  - Full <validation> green; block-responsive e2e untouched and green (it drives
    /blocks/preview/:id, not the cards — verify no shared code path broke).
</success_criteria>
```

---

## [x] TASK-BV2-06 — BlockPreview stage presence: accent glow, border beam, scroll-in rise

```xml
<role>
You are the preview-chrome engineer. BlockPreview (1261 lines) is dense, correct and
heavily specced — viewport segmented control, per-preview theme pin, fullscreen dialog,
code tab. You are adding presence to its FRAME only: entrance, glow, and a border beam.
No prop, emit, tab, or control changes.
</role>

<task>
Three frame-level effects on the /blocks previews: (1) scroll-in rise — each preview's
stage enters with a translateY(24px)→0 + slight rotateX(2deg)→0 straighten as it first
intersects (v-animate-on-scroll or the page's vReveal with new depth support — prefer
the existing v-animate-on-scroll utility; read its API first); (2) a resting accent
glow — a soft box-shadow/outer wash derived from `--lp-cat-500` under the stage,
slightly stronger on `:hover`/`:focus-within`; (3) DzBorderBeam running once around the
stage border when the preview finishes mounting (a "this one is live now" pulse), and on
demand while the stage is hovered. All three are chrome-only (outside the block's own
DOM), aria-hidden, reduced-motion-degraded (no rise/beam; glow static).
</task>

<motivation>
The previews are the page's payload but they materialize silently from skeletons.
A one-shot beam marks the moment a preview becomes live (truthful: it fires on actual
mount), the glow ties each preview to its aisle's hue, and the rise gives the long
preview column rhythm. DzBorderBeam exists (motion barrel) and is stroke-only.
</motivation>

<requirements>
  <placement>Effects attach in BlockPreview around the existing stage container (find
    the stage wrapper class in its styles) — NOT inside the rendered block subtree and
    NOT on the fullscreen dialog. LazyBlockPreview's skeleton is untouched (its height
    parity contract with the real preview must hold — if the rise transform would
    affect layout, use transform-only so the box is identical).</placement>
  <beam>DzBorderBeam mounted aria-hidden, positioned over the stage border radius;
    a `mounted`-triggered single run (own state, e.g. plays for one duration then
    unmounts) + hover-gated continuous mode on fine pointers. Verify DzBorderBeam's API
    supports one-shot; if not, wrap with a timed v-if — do not modify the primitive
    unless trivially parameterizable (then do it in src/motion with its spec).</beam>
  <glow>Pure CSS: `box-shadow: 0 0 60px -20px color-mix(in oklch, var(--lp-cat-500,
    var(--dz-primary)) 35%, transparent)` order-of-magnitude; tuned per theme; no
    blend modes, no filter on ancestors of the live block.</glow>
  <specs>Extend BlockPreview.spec.ts minimally: beam element present + aria-hidden
    after mount, absent under reduced motion (provideMotionPreference(true) — the
    module-singleton trap from memory applies: set preference BEFORE first mount in the
    file, or use the provide pattern). Existing 30+ preview specs stay untouched.</specs>
</requirements>

<steps>
  1. Read BlockPreview's template/styles for the stage wrapper + BlockPreview.spec.ts
     harness; read DzBorderBeam + v-animate-on-scroll APIs.
  2. Implement glow (CSS), rise (directive on the stage), beam (component + one-shot).
  3. Specs; run <validation>.
</steps>

<success_criteria>
  - Scrolling a category: previews rise/straighten in; each newly-mounted preview runs
    one beam lap; hovering a preview shows a live beam + deeper glow in the category's
    hue. Reduced motion: previews simply appear with a static glow.
  - All existing BlockPreview/LazyBlockPreview specs green untouched; axe pass
    unchanged; full <validation> green.
</success_criteria>
```

---

## [x] TASK-BV2-07 — Results mode choreography: FLIP grid, odometer count, designed empty state

```xml
<role>
You are the search-experience engineer. useBlockSearch is the single filtering path
(shared instance, page-owned) and stays byte-identical — you are choreographing what the
READER sees when results change: items should visibly rearrange, the count should roll,
and a dead end should help instead of shrugging.
</role>

<task>
(1) Wrap the results grid in a TransitionGroup: entering cards fade/scale in with the
existing stagger, leaving cards fade out, and — the point — surviving cards FLIP to
their new grid positions (`move` class) when the filter narrows/widens. (2) Replace the
plain result count in resultsLede/BlockSearchBar's live count with DzOdometer so the
number rolls as filters change (aria: keep a plain-text count for AT — odometer visual
is aria-hidden with a visually-hidden real number, per DzOdometer's own contract —
verify). (3) Build a real empty state: token-styled illustration (abstract postcard
stack from BV2-02's visual language, reused/extracted if trivial), the existing
clear-filters guidance, plus up to three suggested popular tags (derived: most-used
tags across the catalog) that apply on click through the SAME search state.
</task>

<motivation>
Finding #7. The deck⇄results mode swap stays as-is (mode-fade, out-in) — this is about
churn WITHIN results mode, which today re-renders with no spatial continuity. FLIP moves
are native Vue (TransitionGroup move-class); DzOdometer exists; suggested tags reuse
`search.allTags()` + registry tag frequencies (derived, never hand-picked).
</motivation>

<requirements>
  <flip>TransitionGroup on the results `ul` (cards grid) only — NOT on the previews
    column (heavy live components must not animate positions; they keep the current
    keyed re-render). Move/enter/leave classes transform+opacity only, token durations;
    reduced motion: all three collapse to instant (extend the page's existing RM
    block). The `v-reveal` stagger on first entry must not double-animate with the
    TransitionGroup enter — pick one owner for entry (TransitionGroup) and drop
    v-reveal on these items if they conflict.</flip>
  <count>Count appears in two places (resultsLede sentence, search bar chip) — odometer
    the search bar one (it's the live one readers watch while toggling tags); the lede
    keeps plain text (it's a sentence; SRs read it). No hand-typed numbers in specs —
    compare against filtered registry lengths.</count>
  <empty>Empty state extends the current copy (BlocksIndexPage.vue:117) with: the
    illustration (aria-hidden), a "Clear filters" DzButton wired to the search state's
    existing clearing (find/reuse the search bar's clear path — one owner), and
    suggested tag buttons (top-3 by frequency EXCLUDING active ones) that call the same
    toggle used by BlockSearchBar. All buttons keyboard-first-class.</empty>
  <specs>useBlockSearch.spec.ts untouched. Page/searchbar specs: odometer renders with
    accessible plain count; empty state lists 3 derived suggestions and applying one
    exits the empty state; TransitionGroup classes present on the grid.</specs>
</requirements>

<steps>
  1. Read DzOdometer API + BlockSearchBar count markup + how clear currently works.
  2. TransitionGroup + stagger-ownership fix; verify no FLIP on previews column.
  3. Odometer + empty state (frequency helper next to the search composable or
     registry — derived, memoized).
  4. Specs; run <validation>.
</steps>

<success_criteria>
  - Toggling tags visibly rearranges surviving cards (FLIP), rolls the count, and a
    zero-result state offers working suggested tags; reduced motion: instant, still
    fully functional.
  - Full <validation> green; axe pass unchanged.
</success_criteria>
```

---

## [x] TASK-BV2-08 — Verification sweep, budgets, and the record

```xml
<role>
You are the release gatekeeper closing Blocks v2. Nothing here adds features: this task
proves the seven tasks above hold every gate the repo enforces, measures what v2 cost,
and writes the record so the next agent doesn't rediscover the build.
</role>

<task>
Run the full verification matrix, fix anything red, and record the results: full landing
suite; typecheck:apps; lint (baseline: 2 pre-existing warnings); validate:tokens; the
landing production build + `check-bundle-budget` (entry must stay ≤ 240 kB gzip — record
the delta v2 added); the /blocks axe pass; the blocks-related e2e specs if a browser is
available locally (block-responsive is the heavy one — at minimum run flows + block
-detail; note in the log which ran). Update this doc: every task checkbox, Part 4
execution log with measurements and deviations. Write/refresh the project memory for
Blocks v2 (what landed, the traps hit, the cost ledger).
</task>

<motivation>
Landing-v2's Part 4 ledger (entry +1.7 kB gzip for all of v2) is what makes the next
redesign's budget conversation short. Same discipline here — especially the entry-chunk
question, since BlocksIndexPage imports from the motion barrel and the registry is
entry-reachable (registry.ts:20-23): any accidental eager import of a heavy motion
component would show up exactly here.
</motivation>

<requirements>
  <gates>All of <validation>, plus: `yarn workspace @dzup-ui/landing build` then
    `tsx apps/landing/scripts/check-bundle-budget.ts` — record entry chunk before/after
    (git stash or the baseline number from landing-v2's ledger: 207.72 kB).</gates>
  <e2e>Best-effort locally (Playwright may be heavy): run at minimum
    `flows.spec.ts` + `block-detail.spec.ts`; record any skipped suite explicitly.
    The win32 pre-existing failure (interaction-contract.spec.ts, packages/core) is the
    known-green baseline — do not chase it.</e2e>
  <record>Part 4 table: per task — status, spec deltas, measurements, deviations from
    the spec blocks above (every deviation gets one line of why). Memory file:
    blocks-v2 summary + traps, linked to landing-v2-depth-and-play.</record>
</requirements>

<steps>
  1. Full gates; fix regressions synchronously.
  2. Build + budget + numbers.
  3. e2e best-effort; log coverage.
  4. Doc checkboxes + Part 4 + memory.
</steps>

<success_criteria>
  - Every gate green (or explicitly logged as environment-skipped with reason);
    entry budget delta recorded and ≤ budget; doc + memory accurate.
</success_criteria>
```

---

## Part 4 — Execution log

| Task | Status | Landed | Notes |
|------|--------|--------|-------|
| TASK-BV2-01 atmosphere | done | `.bv2-atmosphere` + `--bv2-accent` @property in BlocksIndexPage.vue; spec `BlocksIndexPage.atmosphere.spec.ts` (4) | isolation:isolate needed on the page root — a negative-z child is otherwise buried under `.landing-shell`'s opaque background |
| TASK-BV2-02 hero depth field | done | `BlocksHeroField.vue` (DzParallax postcard field, registry-derived accents) + derived `heroStats` row with DzCountUp in BlocksIndexPage; specs: `BlocksHeroField.spec.ts` (3) + stats derivation spec | tokens.css reduce block forces `transform: none !important` on parallax layers — postcard scale had to live in `width`, not transform |
| TASK-BV2-03 category nav | done | `CATEGORY_ICONS` map (typed on BlockCategory), derived count badges + aria-labels, icon hover nudge, pill overshoot bezier | Count badge gated on `blocks?.length > 0` so meta-only fixtures (keyboard specs) keep bare labels |
| TASK-BV2-04 3D deck + pager | done | perspective on `.blocks-deck` + rotateY/translateZ turn with edge-pivoted transform-origin; pager: v-magnetic (0.25/8px), `--pager-accent` destination tint, position-digit roll | Spec harness trap: the page mirrors category into the hash via replaceState and jsdom's location persists across tests — reset the hash before each mount |
| TASK-BV2-05 card art + tilt | done | `BlockCardArt.vue` (live inert miniature, 1100px stage scaled by RO, accent-gradient fallback) + v-tilt(max 4, scale 1.01, glare) on BlockCard; spec `BlockCardArt.spec.ts` (3) | Art copies would duplicate the preview's DOM identity — ids/for/name/aria-refs are STRIPPED via watch(frameEl)+MutationObserver (onMounted sees no frame: it appears a tick later behind the lazy gate's v-if) |
| TASK-BV2-06 preview presence | done | Accent glow on `.block-preview` (rest + hover/focus-within), `bp-rise` mount animation (mount IS the skeleton-swap moment), `.dz-border-beam` overlay on `.bp-frame` — intro lap on mount, hover-run on fine pointers, angle animation PAUSED at rest | Used the `.dz-border-beam` CSS utility standalone as an overlay instead of the wrapper component — no DOM restructuring of the heavily-specced preview |
| TASK-BV2-07 results choreography | done | TransitionGroup FLIP on the results grid (entry ownership moved off v-reveal), DzOdometer live count (SR keeps plain text), empty state: ghost postcard stack + composable-owned `clearAll` + top-3 frequency-derived suggested tags (suggestion REPLACES the dead-end filters — adding under AND semantics would stay empty) | `clearAll` moved INTO useBlockSearch so the bar's Clear and the empty state share one path |
| TASK-BV2-08 verification | done | Full matrix green — see the ledger below | RTL shell guard tripped once: 2 new physical `left`s (hero postcards → made logical) + 4 DELIBERATE keys shifted by inserted lines (re-pointed) |

### Ledger (measured 2026-08-26, win32)

- **Full landing suite:** 2672/2672 passed (60 files) — includes the /blocks axe matrix, interactions sweep, and the 21 new BV2 specs across 5 spec files.
- **`yarn typecheck:apps`:** 0 errors. **`yarn lint`:** clean (the 2 historical tooling warnings are gone from this checkout). **`yarn validate:tokens`:** green.
- **Bundle budget:** entry JS 153.51/175 kB, initial JS **208.09/240 kB gzip** — v2 added **+0.37 kB** to the initial payload (baseline 207.72, landing-v2 ledger). Everything heavy (card art, beams, postcards) lives in lazy chunks or pure CSS.
- **e2e (local, chromium + mobile-chrome):** flows 6/6, block-detail 2/2, overlay-portals 2/2, mobile 2/2 — all passed. Skipped locally: `block-responsive` (87-block containment sweep drives the untouched `/blocks/preview/:id` route; nothing in v2 changes it) and `visual.spec` hero histograms (home-page-only baselines).
- **Traps recorded** in each task row; memory file `blocks-v2-depth-on-the-shelf` links them.
