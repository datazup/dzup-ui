# dzup-ui — Templates v2: The Showroom (`/templates` on `apps/landing`)

> **Status:** Specification + execution log. The `<task>` blocks below are the build.
> **Owner:** dzup-ui team · **Authored:** 2026-08-27 · **Baseline:** `main` @ `2513372` (clean tree)
> **Scope:** the `/templates` index route of `apps/landing` — `pages/TemplatesPage.vue`
> and any new `src/components/templates/` surfaces it mounts, plus the `src/motion`
> primitives they consume. `TemplateDetailPage.vue` is touched **only** where a task
> explicitly says so (TASK-TV2-06). `TemplatePreviewPage.vue`, the template SFCs under
> `src/templates/<slug>/`, the registry data model and the thumbnail pipeline are
> **never** edited — the catalogue's content is out of scope; only its showroom is
> being rebuilt.
>
> **Goal (from the product owner):** the current page looks nice and works well — v2
> must make it **more interactive in a more interesting way**: more **3D**, more
> **animated**, with **added imagery** — while staying inside the existing token theme
> and describing what the page actually is (a truthful gallery of free, full-page
> starters with real screenshots).
>
> **Method:** a fresh sweep of this checkout — `TemplatesPage.vue` (787 lines),
> `TemplateDetailPage.vue` (792), the registry (44 rows, 6 categories), the motion
> module barrel (34 components, 5 directives, 10 composables), the a11y/interaction/e2e
> guardrails — every claim below carries a `file:line` or a command result.
>
> **Relationship to other docs:** the third sibling of
> [`landing-v2.md`](./landing-v2.md) ("Depth & Play", home page, TASK-LV2-01..10) and
> [`blocks-v2.md`](./blocks-v2.md) ("Depth on the Shelf", `/blocks`, TASK-BV2-01..08),
> both fully landed — same design language, same principles, same motion module,
> applied to the templates gallery. Builds on [`templates.md`](./templates.md) (the
> catalogue + feature backlog that produced today's page; its IA, filter pipeline and
> thumbnail guarantees are inputs here, not open questions). Numbering: `TASK-TV2-*`,
> distinct from all prior series.
>
> **Preservation decision (mirrors blocks-v2, differs from landing-v2):** no
> `/templates-classic` route. The owner is happy with the page and wants it *enhanced*,
> not replaced. Every v2 layer below is **additive**: decoration is `aria-hidden` and
> sits behind or beside the existing DOM, pointer effects attach only on fine pointers,
> and reduced motion renders a page behaviorally identical to today's. Reverting any
> task is deleting its layer.
>
> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Part 1 — Analysis of the current `/templates` page (measured 2026-08-27)

The page is one `Section` (`surface bordered`, h1 header with a derived count in the
title) over a toolbar — debounced search, ⌘K quick-find button, sort select, category
`DzSegmented` with live counts, AND-composing tag chips, clear-filters — and a 3/2/1-col
card grid (`TemplatesPage.vue:309-478`). Every card shows a **real committed screenshot**
(light + dark WebP guaranteed per template by `check:previews` /
`scripts/check-template-previews.ts`), category-accented via a per-card
`--tile-accent-*` shade pair, with a whole-card cover link. One filter pipeline (query →
tags → category → sort) feeds grid and palette alike. 44 templates across 6 categories
(`registry.ts:105-112`), each category carrying a decorative accent
(`blue/violet/pink/emerald/amber/cyan`).

| # | Finding | Evidence |
|---|---|---|
| 1 | **Zero motion imports — and the one entrance it claims is dead code.** `src/motion` ships 34 components (`DzParallax`, `DzCountUp`, `DzOdometer`, `DzBorderBeam`, `DzSpotlight`, …) and 5 directives (`v-tilt`, `v-glare`, `v-magnetic`, `v-reveal`, `v-animate-on-scroll`) — all tested, reduced-motion-safe, already carrying `/` and `/blocks`. `TemplatesPage.vue` imports **none**. Worse: `tileStyle()` sets `--reveal-delay` per card "to keep the existing staggered entrance" (`TemplatesPage.vue:250,255`) but **no element carries `.reveal` or `v-reveal`** — the variable is consumed by nothing (`tailwind.css:226-238` requires the `.reveal` class). Cards pop in with no entrance at all. | `grep "motion" pages/TemplatesPage.vue` → 0 hits; `TemplatesPage.vue:255`; `tailwind.css:226` |
| 2 | **The hero is a text header sitting on a pile of unused imagery.** Eyebrow · h1 (`44 free templates, built from core`) · lede — the count is string-interpolated plain text (`TemplatesPage.vue:311`). The page *owns 88 committed screenshots* (44 × light/dark, build-guaranteed) and the hero shows zero of them. The blocks hero got a parallax postcard field + counted-up derived stats (BV2-02); this page — the only route whose imagery is real product screenshots — opens with none. | `TemplatesPage.vue:309-316`; `public/` thumbnail dir via `THUMBNAIL_DIR` |
| 3 | **Cards are flat tiles wearing the site-generic hover.** The tile is `lp-card lp-card--hover` — the same 3px lift + border tint every other card on the site uses (`tailwind.css:217-221`). The screenshot sits in a 16/10 framed box with a static accent wash; hover changes border color only (`TemplatesPage.vue:640-643`). No tilt, no glare, no depth layering, no glow — the richest card art on the site gets the least card treatment. `/blocks` cards got tilt + glare + live art (BV2-05). | `TemplatesPage.vue:425-447,640-643` |
| 4 | **Theme switch hard-swaps the screenshot `src`.** `thumbFor()` returns a different path per resolved theme (`TemplatesPage.vue:107-110`), so flipping theme rebinds `src` on 44 `<img>`s at once — the dark variant starts fetching *at flip time* and each image blanks/repaints with no crossfade. The paired-thumbnail feature (a real differentiator) visually stutters at the exact moment it should shine. | `TemplatesPage.vue:96-110` |
| 5 | **Filtering teleports; nothing choreographs.** Toggling a chip/segment re-renders the keyed `v-for` with no FLIP — surviving cards jump to new slots. The "Showing X of Y" count is plain text (`TemplatesPage.vue:392-394`), the empty state is a stock `DzEmpty` sentence (`:480-495`). `TransitionGroup` moves + `DzOdometer` exist and solved exactly this on `/blocks` (BV2-07). | `TemplatesPage.vue:397-478` |
| 6 | **The accent system stops at the card edge.** Each card is tinted by its category hue, but the *page* never changes: browsing Commerce (emerald) vs Auth (violet) re-lights nothing outside the tiles. `/blocks` promotes the active category's hue to fixed atmosphere washes (`--bv2-accent` + `.bv2-atmosphere`, BV2-01); `/templates` has richer per-category color data and uses none of it above card level. | `TemplatesPage.vue:252-259`; `BlocksIndexPage.vue:495-500` |
| 7 | **The toolbar is stock.** Quick-find is a plain outline button (an ideal `v-magnetic` candidate — the blocks pager proved the pattern, BV2-04), tag chips toggle with zero press feedback, the clear-filters button appears/disappears with no transition, and the result-count line pops in unanimated. | `TemplatesPage.vue:325-395` |
| 8 | **The detail page's only motion is the device-width tween.** `/templates/:slug` — the conversion surface every gallery card leads to — animates iframe width between device presets and nothing else (`TemplateDetailPage.vue:8,719`). The preview frame is flat (no glow, no beam, no mount rise — contrast `/blocks` previews after BV2-06), prev/next are plain outline buttons, and the "Built with" chips render as a static row. | `TemplateDetailPage.vue` (792 lines, 0 motion imports) |
| 9 | **Perf constraints that bound every task:** the entry budget is 240 kB gzip with ~208.09 kB used (blocks-v2 ledger); `/templates` is a **lazy route chunk** whose fetch is asserted by e2e (`e2e/flows.spec.ts:44-84`). Thumbnails are `loading="lazy"` + `decoding="async"` inside a CLS-reserved `aspect-ratio: 16/10` box (`TemplatesPage.vue:434-441,652-659`) — v2 must not add eager image bytes, must keep the reserved box, and heavy decoration mounts post-paint. | `check:bundle`; `flows.spec.ts:44` |
| 10 | **Guardrails that must stay green (features, not obstacles):** `/templates` + `/templates/:slug` in the per-page axe suite (`pages.a11y.spec.ts:113-114`, serious+critical + moderate rule-id pass) and in the interaction sweep (`pages.interactions.spec.ts:114-115`); route-announcer assertion navigates to `/templates` by name (`pages.a11y.spec.ts:404`); flows e2e drives TopNav → `/templates` → chunk fetch + the ⌘K palette; `router.head.spec.ts` pins per-template OG heads; `src/templates/interactions.spec.ts`, `render.spec.ts`, `rawSources.spec.ts`, `thumbnailCoverage.spec.ts` cover the catalogue; `shellDirection.spec.ts` keys deliberate physical CSS by `file:line`; `yarn validate:tokens` forbids raw colors; `motion/tokens.css` centrally stills every `dz-*` primitive under reduced motion. | listed files |

**Found healthy, preserve untouched:** the single filter pipeline and its
palette-parity haystack (`TemplatesPage.vue:113-137` — search and ⌘K can never
disagree); the thumbnail guarantee (`check:previews` fails the build on a missing
light/dark WebP — no fallback path needed); the whole-card **cover-link** pattern (one
real link, no nested interactives, `:aria-label` per card); the CLS-reserved preview
box; the debounce; the category counts reading off the pre-category filtered set; the
⌘K palette and its grouped rich items; `Free · MIT` trust framing.

---

## Part 2 — Design direction: "The Showroom"

One sentence: **this page is a showroom of finished pages — light the room in the
active category's color, put the product in the window, and let every screenshot sit in
a display that tilts, glows and answers the hand.**

What makes `/templates` different from `/blocks` (and why v2 diverges where it does):
`/blocks` sells *live* sections, so its card art is the block itself and its brand claim
is "never a screenshot". `/templates` is the opposite — its imagery **is** committed
screenshots, 88 of them, build-guaranteed in both themes. So here the screenshots are
the star: the hero floats them in a parallax depth field (the owner's "added images",
at zero new asset bytes), the cards frame them as lit display screens with real 3D
response, and the theme toggle cross-fades them instead of blinking.

Principles (inherited from landing-v2 Part 2 and blocks-v2; task blocks do not repeat
them):

1. **Depth is transform-only.** `perspective` + `rotateX/rotateY/translateZ/scale` +
   shadow/glow. No layout-affecting animation, no filters on large areas, no per-frame JS
   where CSS can drive.
2. **Decoration is invisible to the tree.** Every added layer is `aria-hidden="true"`,
   `pointer-events: none` unless it *is* the control, and additive — the existing DOM,
   roles, names and focus order do not change.
3. **Pointer effects attach only on fine pointers** (`matchMedia('(pointer: fine)')` —
   the directives already gate this); touch gets the calm page.
4. **Reduced motion = today's page.** Every effect stills to a state visually and
   behaviorally equivalent to the current build. `motion/tokens.css` handles `dz-*`
   primitives centrally; bespoke CSS carries its own `@media` block.
5. **Every number is derived.** Counts come from the registry/`import`ed data at render
   time — never hand-typed (the repo-wide rule).
6. **Token-only color.** `var(--dz-*)` / `--lp-*` derivations and `color-mix` only.
7. **Nothing joins the critical path.** `/templates` is already a lazy chunk; within it,
   anything heavy (parallax field, art layers) mounts post-paint or in-view.

Known traps this build inherits (from the landed siblings — do not rediscover):
a fixed `z-index: -1` layer needs `isolation: isolate` on the page root or the shell
paints over it; `tokens.css` forces `transform: none !important` on `.dz-parallax-layer`
under reduced motion, so postcards size with `width: calc(...)`, never transform scale;
`@property` at-rules need an **unscoped** style block; specs drive reduced motion via
`provideMotionPreference(true)` (the matchMedia read is a module singleton); narrow
vitest runs are `npx vitest run <root-relative path>` from the repo root (the workspace
`test` script pins `--root ../..` and runs everything); components using `useTheme` need
a `DzThemeProvider` wrapper in specs; `shellDirection.spec.ts` keys deliberate physical
CSS by `file:line` — prefer logical properties (`inset-inline-start`) for new offsets.

---

## Part 3 — Tasks

Execution is **synchronous**: one task lands (code + tests + validation) before the next
starts. The execution log in Part 4 is updated as each task changes state.

Shared validation block — every task's `<validation>` means, unless it says otherwise:

```
yarn typecheck:apps                                  # vue-tsc over apps/landing — 0 errors
npx vitest run <touched spec paths, root-relative>   # from the repo root
yarn validate:tokens                                 # no raw colors anywhere
yarn lint                                            # fully clean baseline on this checkout
```

The full landing suite, the production build + `check:bundle`, and e2e run once, in
TASK-TV2-07 — not per task.

---

## [x] TASK-TV2-01 — Ambient atmosphere: the showroom takes the category's light

```xml
<role>
You are the landing app's motion/visual engineer. /blocks already proved this exact
pattern (TASK-BV2-01, BlocksIndexPage.vue:210-222,495-500,759-812): the active
category's hue promoted from component tint to page atmosphere, interpolated via a
registered @property. You are porting the pattern to /templates, where the category
accents (registry.ts:105-112) are richer and currently stop at the card edge
(Finding #6). Pure CSS color — no layout, no JS per frame.
</role>

<task>
Add an aria-hidden, fixed-position atmosphere layer to TemplatesPage — two large, soft
radial gradient washes whose hue is the ACTIVE category's accent
(`--dz-colors-<accent>-500`) and which cross-fade smoothly when `activeCategory`
changes. When the category is 'all', the atmosphere settles to `var(--dz-primary)`.
Tint the Section's eyebrow to match (the same subtle cue blocks' hero eyebrow got).
</task>

<requirements>
  <layer>One `.tv2-atmosphere` div, `position: fixed; inset: 0; z-index: -1;
    pointer-events: none`, `aria-hidden="true"`, first child of the page root. The page
    root gets `isolation: isolate` — WITHOUT it the shell background paints over the
    layer (the exact trap BV2-01 hit). Washes built from `color-mix(in oklch,
    var(--tv2-accent) X%, transparent)`; whisper-quiet in light AND dark (dark needs a
    lower mix % — mirror the `[data-theme='dark']` override blocks uses).</layer>
  <hue>`--tv2-accent` registered via an UNSCOPED `@property { syntax: '<color>';
    inherits: true; initial-value: transparent }` block (scoped style blocks strip
    at-rules — BlocksIndexPage has the working precedent), with `transition:
    --tv2-accent 600ms` on the layer. Name it `--tv2-*`, NOT `--bv2-*` — both pages
    can be alive in one SPA session and must not fight over one registration. The
    value is set as an inline style on the page root from a computed over
    `activeCategory` + `TEMPLATE_CATEGORIES`.</hue>
  <motion>Color fade only — may persist under reduced motion, but add the
    `prefers-reduced-motion` block dropping the transition to instant anyway (matches
    the sibling pages).</motion>
  <perf>No JS per frame, no filters, no blend modes. Verify the layer sits behind the
    Section surface but the washes remain visible through/around it (the Section is
    `surface bordered` — an opaque `--dz-surface` panel; the washes read at the page
    margins and above/below the section, which is enough — blocks has the same
    geometry).</perf>
  <specs>A `TemplatesPage`-level spec asserting: the layer exists once and is
    aria-hidden; the page root's inline style carries the active category's accent var
    after switching `activeCategory`; 'all' resets it to the primary. Mount with the
    same router/provider scaffolding `pages.a11y.spec.ts` uses. Reset any URL state
    between mounts.</specs>
</requirements>

<constraints>
Token-only color. No new deps. Do not touch the filter pipeline, the grid, or any
existing markup semantics — the layer and one inline style binding on the root are the
only DOM changes.
</constraints>

<success_criteria>
- Selecting Commerce vs Auth visibly re-lights the page margins emerald vs violet in
  both themes; the change is a smooth ~600ms hue fade in Chromium.
- 'all' (and initial load) shows the neutral brand wash.
- New spec green; axe `/templates` pass unchanged; <validation> green.
</success_criteria>
```

---

## [x] TASK-TV2-02 — Hero depth field: floating template screenshots + counted-up truth

```xml
<role>
You are the landing app's motion/visual engineer. The blocks hero got
`BlocksHeroField.vue` (TASK-BV2-02): a DzParallax postcard field + derived DzCountUp
stats. You are building the templates twin — with one decisive upgrade: this page's
postcards are not abstract token art, they are the REAL committed screenshots the
build already guarantees (Finding #2). The hero must show the product.
</role>

<task>
Create `src/components/templates/TemplatesHeroField.vue` and mount it in TemplatesPage:
(a) a depth field of 4–6 floating "screenshot postcards" — real template thumbnails in
accent-tinted frames, distributed on DzParallax layers at different depths flanking the
Section header (visible on wide viewports, hidden below ~1100px); (b) a stats row under
the lede: three DzCountUp figures derived at import time — templates (TEMPLATES.length),
categories (TEMPLATE_CATEGORIES.length), and distinct core components used (unique
count across every row's `stack`) — each with a label, counting up on first
scroll-into-view.
</task>

<requirements>
  <postcards>Choose featured templates (`featured: true`) for the postcards; each card
    is a small rounded frame (token border/shadow/radius) containing its `<img>` —
    src via the SAME light/dark convention the grid uses (reuse/extract the
    `darkThumb` helper; theme from `useTheme().resolved`). Images are
    `loading="lazy"` + `decoding="async"` with explicit dimensions. The whole field is
    ONE `aria-hidden="true"` + `inert` container with `pointer-events: none`.</postcards>
  <depth>DzParallax layers (2–3 depths, subtle rates — mirror BlocksHeroField's
    values). Size postcards with `width: calc(...)`/`clamp()`, NEVER transform scale
    (tokens.css forces `transform: none !important` on `.dz-parallax-layer` under
    reduced motion — scaled-by-transform cards would snap to full size). A slow
    idle float (CSS keyframe, transform-only, disabled under reduced motion) keeps
    the field alive when the pointer is still.</depth>
  <placement>The field renders inside the Section's default slot (Section.vue has no
    header slot), absolutely positioned against the section box behind/flanking the
    centered header; the toolbar and grid stay above it (z-index audit against
    TV2-01's isolation context). It must not affect the header's layout, create
    horizontal overflow (clip with `overflow: clip` on the positioning context, and
    use logical inset properties), or intercept clicks.</placement>
  <stats>Numbers derived in module/setup scope from registry imports — NEVER typed
    (repo rule). DzCountUp fires in-view once; under reduced motion the final number
    renders immediately (the primitive already handles this — verify). The row is
    real content (NOT aria-hidden): `<dl>` or labelled group, axe-clean.</stats>
  <perf>The field mounts post-paint (`onMounted` + `requestIdleCallback`-style defer
    or the app's existing lazy-mount composable if one fits) so LCP is untouched.
    4–6 lazy small images at most; no new eager bytes in the route chunk beyond the
    component code itself.</perf>
  <specs>`TemplatesHeroField.spec.ts`: renders inside DzThemeProvider; postcard
    container is aria-hidden + inert; postcard imgs use featured slugs and swap to
    `-dark` variants when the provider resolves dark; stats equal the registry-derived
    values (compute the expected numbers in the spec FROM the registry import, not
    literals). Reduced-motion path via `provideMotionPreference(true)`.</specs>
</requirements>

<constraints>
Token-only color; the accent tint per postcard comes from its template's
category/`accent` mapping exactly like `tileStyle()` does. No edits to Section.vue, the
registry, or the thumbnail pipeline. Keep the existing h1 title text (with its
interpolated count) exactly as is — the stats row complements it, the title is pinned
by the a11y/head specs.
</constraints>

<success_criteria>
- Wide viewport: screenshots float at visibly different depths beside the header and
  answer scroll with parallax; narrow viewport: field absent, page identical to today.
- Stats count up from 0 on first view, agree with the registry, and match instantly
  under reduced motion.
- No horizontal scrollbar at any width; LCP element unchanged; new specs + <validation>
  green; axe `/templates` pass unchanged.
</success_criteria>
```

---

## [x] TASK-TV2-03 — Card v2: the lit display screen (tilt, glare, glow, theme crossfade)

```xml
<role>
You are the landing app's motion/visual engineer. Templates cards carry the site's best
imagery and the site's most generic hover (Finding #3), and the theme flip blinks all 44 screenshots (Finding #4). BlockCard v2 (TASK-BV2-05) proved v-tilt + v-glare on
`lp-card` tiles; you are giving the templates tile the full display-screen treatment
the screenshots deserve.
</role>

<task>
Upgrade the gallery tile in TemplatesPage.vue: (a) 3D tilt + glare on fine pointers;
(b) a hover state where the screenshot subtly zooms and the frame lights up in the
card's own accent (glow shadow + brighter wash) while chrome (badges, title, link)
lifts on separate translateZ planes; (c) replace the theme-driven `src` swap with a
two-layer light/dark crossfade so toggling theme melts every screenshot instead of
blinking it.
</task>

<requirements>
  <tilt>`v-tilt` (max ~4–5°, with glare — mirror BlockCard's options) on each `.tile`;
    the directive self-gates to fine pointers and reduced motion. The tile gets
    `transform-style: preserve-3d` and the grid (or tile wrapper) a `perspective` so
    translateZ planes actually read. Verify the tilt transform composes with the
    existing `.lp-card--hover` translateY lift (BlockCard resolved this — copy its
    approach) and that the cover-link hit area still spans the card.</tilt>
  <screen>On hover: the thumbnail scales to ~1.04 inside its overflow-hidden frame
    (transform-only, ~600ms ease-out); the frame's accent wash intensifies and an
    accent glow shadow appears (`box-shadow` from `color-mix(...var(--tile-accent)...)`)
    — the card should read as a screen switching on. Title/badges and the "View
    template" link get small `translateZ` offsets so the tilt produces real parallax
    between chrome and screenshot. All still under `prefers-reduced-motion` (the
    directive stops the tilt; add a CSS block stilling the zoom/glow transition).</screen>
  <crossfade>Render BOTH theme variants as stacked `<img>`s in the frame (absolute
    inset, same reserved box — CLS stays zero) with the inactive one at `opacity: 0`,
    transitioning ~400ms. Both are `loading="lazy"` so the browser still defers
    offscreen fetches; the visible layer keeps `width/height` attrs. Update
    `thumbFor`/`darkThumb` usage accordingly (extract a helper if TV2-02 hasn't
    already). The `alt=""` decorative contract and the aria-hidden preview box are
    unchanged. Check the interaction sweep and axe pass still hold (image count per
    card doubles — no role/name changes).</crossfade>
  <specs>Extend/add a TemplatesPage spec: each tile carries the tilt binding (assert
    the directive's data attribute/class or mounted hook effect); the preview frame
    contains exactly two imgs whose srcs are the light and `-dark` variants; toggling
    the theme provider flips which one is opacity-visible (assert via class/style,
    not getComputedStyle animation). Keep using the shared mount scaffolding +
    DzThemeProvider.</specs>
</requirements>

<constraints>
Token-only color. No layout-affecting hover (the grid must not reflow). Do not alter
the filter pipeline, card DOM order, cover-link semantics, or the `tileStyle()` accent
contract (TV2-01/02 read it). Entry chunk untouched (this is all inside the lazy route
chunk). Do not edit BlockCard or shared `tailwind.css` classes — new styles are scoped
to this page.
</constraints>

<success_criteria>
- Fine pointer: cards tilt toward the cursor with a moving glare; screenshot zooms and
  the card glows in its own category color; chrome floats above the screenshot.
- Theme toggle: all screenshots crossfade smoothly, no white blink, no layout shift.
- Touch/reduced motion: page behaves exactly as today (lift + border tint only).
- Specs + <validation> green; axe + interaction sweeps unchanged.
</success_criteria>
```

---

## [x] TASK-TV2-04 — Grid choreography: real entrance, FLIP filtering, odometer count, designed empty state

```xml
<role>
You are the landing app's motion/visual engineer. The grid's entrance is dead code and
its filtering teleports (Findings #1, #5). /blocks results mode (TASK-BV2-07) landed
the exact recipe: TransitionGroup FLIP + DzOdometer + a designed empty state. Port it
to the gallery grid that actually needs it most — this one re-sorts and re-filters
constantly (search, category, tags, sort).
</role>

<task>
(a) Wire the staggered scroll entrance for real: `v-reveal` on the tiles so the
existing per-card `--reveal-delay` finally drives the documented fade-rise. (b) Make
the grid a `TransitionGroup` so filter/sort changes FLIP surviving cards to their new
slots, fade-scale leavers out and enterers in. (c) Replace the plain "Showing X of Y"
text with a DzOdometer-driven count. (d) Redesign the empty state: keep DzEmpty as the
shell but add the top three most-frequent tags (frequency-derived from the registry,
never hand-picked) as one-tap suggestions alongside the existing clear-filters action.
</task>

<requirements>
  <entrance>`v-reveal` (barrel export) on each `<li>`, reusing the inline
    `--reveal-delay` stagger `tileStyle()` already emits. Confirm one entrance owner:
    the reveal must not double-fire with the TransitionGroup enter — reveal owns the
    initial scroll-in; TransitionGroup owns filter-time enter/leave (keyed changes
    after mount). If they collide on first render, gate the enter transition class to
    post-initial updates (the blocks results grid solved the same tension — read it
    first).</entrance>
  <flip>`<TransitionGroup tag="ul">` preserving the current `ul` classes/aria-label
    and `li` keys. `.v-move` uses transform-only ~350ms; leaving items
    `position: absolute` so movers glide (standard FLIP recipe; verify against the
    3/2/1-col grid — absolutely-positioned leavers need the grid item's box pinned,
    test at all three breakpoints). Under reduced motion all three transition classes
    drop to instant (CSS block).</flip>
  <count>DzOdometer for the number(s) in the result line; the surrounding sentence
    stays plain text. The line already only renders when filters are active — keep
    that, and keep it a polite live region ONLY if it already is one (do not add a
    new live region without checking the route announcer isn't enough — axe moderate
    pass is watching).</count>
  <empty>Suggested tags computed by frequency over `TEMPLATES` (ties broken by
    vocabulary order), rendered as the same chip visual the toolbar uses; clicking one
    replaces the failing filter state with just that tag (clearFilters() then
    toggleTag(key)). Suggestions must exclude tags already active (they just failed).
    DzEmpty's icon/title/copy stay.</empty>
  <specs>Extend the page spec: filtering to a subset removes/keeps the right keys
    inside a TransitionGroup-rendered list; the count renders via the odometer
    component; the empty state shows exactly three suggestion chips, none of which is
    an active tag, and clicking one yields a non-empty grid filtered to that tag.
    Entrance: tiles carry the reveal directive binding.</specs>
</requirements>

<constraints>
The filter pipeline computeds are read-only to this task — choreography wraps the
pipeline's OUTPUT; it never adds a second source of truth. Grid semantics (`ul`
aria-label, `li` keys, cover links) unchanged. Token-only color.
</constraints>

<success_criteria>
- Scrolling into the grid staggers cards up; toggling a tag glides survivors, fades
  leavers, and ticks the odometer; sort swaps visibly rearrange rather than teleport.
- An impossible filter combo lands on the designed empty state whose suggestions
  always rescue (each yields ≥1 result).
- Reduced motion: instant swaps, no FLIP, no stagger — today's behavior.
- Specs + <validation> green; axe + interaction sweeps unchanged.
</success_criteria>
```

---

## [x] TASK-TV2-05 — Toolbar presence: magnetic quick-find, springy chips, choreographed clear

```xml
<role>
You are the landing app's motion/visual engineer. The toolbar works perfectly and
feels inert (Finding #7). Small, tactile micro-interactions — the blocks pager's
v-magnetic (TASK-BV2-04) and the site's established spring language — make the
filtering surface feel hand-built without touching its logic.
</role>

<task>
Three micro-interactions on TemplatesPage's toolbar: (a) `v-magnetic` on the ⌘K
quick-find button; (b) a press/settle spring on the tag chips (active chips pop
slightly on toggle) plus a gentle accent ring pulse when a chip becomes active; (c)
animate the clear-filters button and the result-count line in/out (fade + small rise
via <Transition>) instead of popping.
</task>

<requirements>
  <magnetic>`v-magnetic` barrel export, modest strength (mirror the blocks pager
    values). The directive self-gates to fine pointers + reduced motion. Focus ring
    and hit area unchanged.</magnetic>
  <chips>Transform-only scale spring on the chip button wrapper (`.tag-chip`), driven
    by `:active`/toggle state with a token-duration transition; the activation pulse
    is a one-shot CSS animation on a pseudo-element (accent from `--dz-primary`,
    `color-mix` fade). No DzTag internals edited. Reduced motion: no pulse, no
    spring.</chips>
  <clear>`<Transition>` wrappers with transform+opacity classes; ensure the
    toolbar's height doesn't jump when the row appears (the elements already occupy
    conditional rows — if layout jump exists today, leave it; do not "fix" layout as
    a side effect).</clear>
  <specs>Interaction-level assertions only where cheap: quick-find carries the
    magnetic binding; toggling a chip toggles its aria-pressed (existing behavior —
    regression guard); clear button renders inside a transition wrapper. Do not
    attempt to assert CSS spring physics in jsdom.</specs>
</requirements>

<constraints>
No behavior changes: same clicks, same aria-pressed contract, same focus order, same
DzSegmented/DzSelect/DzSearchInput components untouched. Token-only color.
</constraints>

<success_criteria>
- The quick-find button leans toward a fine pointer and springs back; chips pop
  satisfyingly on toggle; clear-filters/result-count ease in and out.
- Touch/reduced motion: identical to today. Specs + <validation> green.
</success_criteria>
```

---

## [x] TASK-TV2-06 — Detail page stage presence (explicit scope exception)

```xml
<role>
You are the landing app's motion/visual engineer. Every gallery card funnels into
/templates/:slug, whose live iframe preview — the single most persuasive element in
the templates funnel — sits in a flat frame (Finding #8). TASK-BV2-06 landed the
exact stage-presence recipe on /blocks previews (accent glow, standalone
`.dz-border-beam` overlay with an intro lap, scroll-in rise) and TASK-BV2-04 the
magnetic pager. Port both, adapted to this page's device-switcher.
</role>

<task>
In TemplateDetailPage.vue only: (a) give the preview frame an accent glow (rest +
stronger hover) in the template's category/accent hue and a one-time `rise` mount
animation; (b) add a border-beam overlay that runs one intro lap on mount and runs
while hovered (paused at rest — mirror BV2-06's pattern and its reduced-motion
handling); (c) when the device preset changes, add a subtle 3D settle on the frame (a
brief rotateY/scale ease alongside the existing width tween — perspective on the
stage, transform-only); (d) `v-magnetic` + destination accent tint on the prev/next
buttons (mirror the blocks pager); (e) stagger-reveal the "Built with" chips row on
mount.
</task>

<requirements>
  <accent>The detail page must resolve the SAME accent `tileStyle()` uses (template
    `accent` ?? category accent) — extract that resolution into a small shared helper
    (e.g. `src/templates/accent.ts` or alongside the registry) used by both pages
    rather than duplicating the mapping; gallery behavior byte-identical.</accent>
  <beam>Reuse the standalone border-beam CSS approach BV2-06 established (read it
    first; if it landed as a reusable class/util, consume it — do not fork a second
    implementation). Overlay is aria-hidden, pointer-events none, respects reduced
    motion (no intro lap, no run).</beam>
  <device3d>The settle must not fight the width transition or the reduced-motion
    block that already stills it (TemplateDetailPage.vue:690,776) — extend those
    blocks. The iframe itself never transforms (only its frame) so the embedded page
    keeps crisp text.</device3d>
  <pager>v-magnetic on both buttons + a hover tint driven by the DESTINATION
    template's accent (each button knows its target from the existing prev/next
    computeds).</pager>
  <specs>Detail-page spec additions: frame carries the accent var + glow class; beam
    overlay exists, aria-hidden; pager buttons carry the magnetic binding and
    destination accent vars; chips row carries the stagger/reveal binding. Reduced
    motion via provideMotionPreference. The existing device-switcher and theme-toggle
    specs must pass unedited.</specs>
</requirements>

<constraints>
No changes to routes, head/OG logic (router.head.spec.ts is pinned), the iframe URL
contract (`?theme=`), the device presets, or TemplatePreviewPage. Token-only color.
Everything additive and deletable.
</constraints>

<success_criteria>
- The preview reads as a lit stage: glow in the template's hue, beam intro on arrival,
  beam run on hover, a satisfying settle when switching devices.
- Prev/next lean toward the pointer and tint toward where they'll take you.
- Reduced motion: today's page (width snap included). Specs + <validation> green; axe
  detail pass unchanged.
</success_criteria>
```

---

## [x] TASK-TV2-07 — Verification sweep, budgets, and the record

```xml
<role>
You are the release engineer for this backlog. Six visual tasks have landed
individually green; your job is proving the route — and the whole app — is green as a
system, measuring the cost, and writing the record so the next agent doesn't
rediscover anything.
</role>

<task>
Run the full verification matrix, fix anything the sweep surfaces (regressions
introduced by TV2-01..06 only — pre-existing failures are recorded, not fixed), then
write the Part 4 ledger in docs/templates-v2.md and update project memory.
</task>

<matrix>
  1. `yarn typecheck:apps` and `yarn typecheck` — 0 errors.
  2. Full landing suite: `yarn workspace @dzup-ui/landing test` (the win32 baseline for
     the CORE suite has 1 known interaction-contract failure; the landing suite must be
     fully green).
  3. `yarn lint` — fully clean (this checkout's baseline).
  4. `yarn validate:tokens` — clean.
  5. Production build: `yarn workspace @dzup-ui/landing build`, then
     `yarn workspace @dzup-ui/landing check:bundle` — entry budget honored; record the
     measured delta attributable to v2 (expect ~0: everything lives in the lazy route
     chunk; also record that chunk's before/after size from the build output).
  6. e2e (built preview): at minimum `e2e/flows.spec.ts` (TopNav→/templates chunk
     fetch + palette) and the visual spec (baselines only cover `/` — confirm no
     baseline churn).
  7. Manual matrix in the dev server: light/dark × fine/coarse pointer × reduced
     motion on /templates and one detail page; RTL spot-check (dir=rtl) for the new
     absolutely-positioned layers; no horizontal overflow at 360/768/1280/1680px.
</matrix>

<record>
  Part 4 ledger: per-task status flips to [x] with one measured line each; a cost
  table (entry chunk, templates route chunk, gzip deltas); traps encountered; the
  validation transcript summary. Then update the auto-memory: a new
  `templates-v2-the-showroom.md` memory (pattern: the landing-v2/blocks-v2 memories)
  indexed from MEMORY.md, cross-linking [[blocks-v2-depth-on-the-shelf]].
</record>

<success_criteria>
- Every matrix row green (or a pre-existing failure explicitly recorded as such with
  evidence it predates this work).
- Ledger written; memory saved; doc statuses accurate.
</success_criteria>
```

---

## Part 4 — Execution log

| Task | Status | Landed |
|---|---|---|
| TV2-01 atmosphere | `[x]` | 2026-08-27 |
| TV2-02 hero depth field | `[x]` | 2026-08-27 |
| TV2-03 card display screen | `[x]` | 2026-08-27 |
| TV2-04 grid choreography | `[x]` | 2026-08-27 |
| TV2-05 toolbar presence | `[x]` | 2026-08-27 |
| TV2-06 detail stage | `[x]` | 2026-08-27 |
| TV2-07 verification + record | `[x]` | 2026-08-27 |

### Ledger (measured 2026-08-27, win32)

- **TV2-01** — `.tv2-atmosphere` washes + UNSCOPED `@property --tv2-accent`
  (own name, never `--bv2-*`); `.templates-page` got `isolation: isolate` +
  `position: relative`; eyebrow tinted via `:deep(.lp-eyebrow)`. 'all' →
  `var(--dz-primary)`. Specs: 4 (`TemplatesPage.v2.spec.ts`).
- **TV2-02** — `components/templates/TemplatesHeroField.vue`: 5 featured-template
  screenshot postcards (REAL committed WebPs, zero new asset bytes) on 3
  DzParallax depths, width via `calc()`/`--pc-scale` (never transform scale),
  idle float, theme-aware src, aria-hidden + inert, post-paint gate; partial
  ≤1360px, gone ≤820px…1100px band per breakpoints. Stats `<dl>` (templates /
  categories / distinct stack components — all registry-derived) via DzCountUp.
  Shared `templates/thumbs.ts` extracted. Specs: 4 (field) + 2 (page).
- **TV2-03** — tiles: `v-tilt` (max 4.5°, scale 1.01, glare, `disabled: reduced`),
  `transform-style: preserve-3d` with chrome planes at translateZ 22/18/12px,
  hover screenshot zoom 1.04 in a clipped `.tile-shot`, accent glow shadow +
  "screen-on" wash overlay; theme flip is now a 400ms two-layer crossfade (88
  imgs, all still `loading="lazy"`, CLS box unchanged). Specs: 3.
- **TV2-04** — `v-reveal="i * 45"` finally delivers the staggered entrance (the
  old `--reveal-delay` fed a `.reveal` class nothing carried — deleted);
  `TransitionGroup tag="ul"` FLIP (move 320ms, absolute 150ms leavers) with
  **explicit `role="list"`** so list semantics survive test-utils' auto-stub;
  DzOdometer count with a DzVisuallyHidden plain-text SR layer; empty state
  gained 3 frequency-derived suggestion chips that exclude active tags. Specs: 4.
- **TV2-05** — quick-find `v-magnetic` (0.25/8); `.tag-chip` press spring +
  one-shot activation ring pulse (pseudo-element); clear button + result count in
  `tv2-fade` Transitions. Specs: 2.
- **TV2-06** — shared `templates/accent.ts` (`resolveTemplateAccent`) now feeds
  gallery tiles, hero field AND the detail page — one mapping. Detail stage:
  accent glow (rest/hover), `tpl-rise` mount, `.dz-border-beam` overlay
  (4s intro lap, hover-run, paused at rest, accent-tinted); device-switch
  `tpl-settle` (420ms rotateY ease ending at identity — iframe re-rasterizes
  crisp; JS-gated under reduced motion); `v-magnetic` pager with destination
  accent tint; built-with chips `v-reveal` stagger. Specs: 5
  (`TemplateDetailPage.v2.spec.ts`).
- **TV2-07 matrix** — `yarn typecheck` + `yarn typecheck:apps`: 0 errors.
  Landing suite: **63 files / 2696 tests, all green**. `yarn lint`: clean.
  `yarn validate:tokens`: clean. Build green; budgets: entry JS 153.54/175 kB,
  **initial load JS 208.11/240 kB** (blocks-v2 ledger read 208.09 on the same
  artifact set → **v2 cost ≈ +0.02 kB gzip on the critical path**), initial
  payload 245.82/285 kB. Route chunks (gzip, baseline `2513372` → v2):
  TemplatesPage JS 3.45 → 4.79 kB (+1.34), CSS 1.32 → 2.81 kB (+1.49);
  TemplateDetailPage JS 5.35 → 5.73 kB (+0.38), CSS 1.16 → 1.61 kB (+0.45) —
  all lazy, zero eager image bytes added. e2e (built preview, chromium):
  `flows.spec.ts` 6/6, `visual.spec.ts` 4/4 (baselines untouched — they only
  cover `/`). Browser smoke matrix (real Chromium, scripted): `/templates` +
  `/templates/analytics-dashboard` × light/dark × ltr/rtl × 360/768/1280/1680px
  — no horizontal overflow, no console errors, atmosphere present, hero field
  correctly absent ≤1100px, category switch retargets the accent (emerald
  verified). NOT run: the core package suite (no `packages/*` file touched;
  its known win32 baseline stands) and the CI coverage gate (CI's own
  invocation — see [[free3-12-landed]] for why local numbers don't transfer).
- **Traps encountered:** (1) `@vue/test-utils` auto-stubs `TransitionGroup` →
  the grid's `<ul>` became `<transition-group-stub>` in the a11y sweep and axe
  raised a serious `listitem` violation; fixed by declaring `role="list"` on the
  group (the ul's implicit role — harmless in real DOM, semantics-preserving
  under stubs). (2) A `Map` built from the closed `TemplateTag` union rejects
  `.get(string)` under strict checks — widen the key type to `string` when the
  lookup side iterates plain strings. (3) `grep -c "slug:"` over the registry
  overcounts (46 vs the real 44 rows) — every spec derives counts from the
  registry import, so nothing shipped the wrong number.
