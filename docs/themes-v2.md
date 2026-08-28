# dzup-ui — Themes v2: The Atelier (`/themes` on `apps/landing`)

> **Status:** Specification + execution log. The `<task>` blocks below are the build.
> **Owner:** dzup-ui team · **Authored:** 2026-08-28 · **Baseline:** `main` @ `58195f6` (clean tree)
> **Scope:** the `/themes` route of `apps/landing` — `pages/ThemesPage.vue`, new
> surfaces under `src/components/themes/`, and the `src/motion` primitives they
> consume. The designer engine is **out of bounds for behavior changes**:
> `composables/useThemeDesigner.ts` (its public API, singleton semantics, serialize
> round-trip), `components/ThemeRecipeController.ts` (live-site apply + persistence +
> FOUC cache), and the token-owned recipe contract in `@dzup-ui/tokens`
> (`theme-recipe.ts`) are read, never rewritten. `ThemePreviewCluster.vue` may gain
> presentation polish but its component roster and local-state independence stay.
>
> **Goal (from the product owner):** the current page looks nice and works well — v2
> must make it **more interactive in a more interesting way**: more **3D**, more
> **animated**, with **added imagery** — while staying inside the token theme and
> describing what the page actually is (a live OKLCH theme editor whose output is
> real `--dz-*` variables applied to real components).
>
> **Method:** a fresh sweep of this checkout — `ThemesPage.vue` (1102 lines),
> `useThemeDesigner.ts` (466), `ThemePreviewCluster.vue` (287),
> `ThemeRecipeController.ts` (112), the recipe contract, the a11y/interaction/copy
> guardrails — every claim below carries a `file:line` or a command result.
>
> **Relationship to other docs:** the fifth sibling of
> [`landing-v2.md`](./landing-v2.md) ("Depth & Play", home, TASK-LV2-01..10),
> [`blocks-v2.md`](./blocks-v2.md) ("Depth on the Shelf", `/blocks`, TASK-BV2-01..08),
> [`templates-v2.md`](./templates-v2.md) ("The Showroom", `/templates`,
> TASK-TV2-01..07) and [`animations-v2.md`](./animations-v2.md) ("The Theatre",
> `/animations`, TASK-AV2-01..07) — all fully landed; same design language, same
> principles, same motion module. Numbering: `TASK-THV2-*`, distinct from all prior
> series.
>
> **Preservation decision (mirrors blocks/templates/animations-v2):** no
> `/themes-classic` route. The owner is happy with the page and wants it *enhanced*,
> not replaced. Every v2 layer below is **additive**: decoration is `aria-hidden`
> and sits behind or beside the existing DOM, pointer effects attach only on fine
> pointers, and reduced motion (either gate — see Part 2) renders a page
> behaviorally identical to today's. Reverting any task is deleting its layer.
>
> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Part 1 — Analysis of the current `/themes` page (measured 2026-08-28)

The page is: a static hero (eyebrow · h1 · lede · Copy-share-link + Reset + a bare
"Open share URL" anchor) over a two-column workspace — a sticky control rail
(presets, per-palette OKLCH hue/chroma sliders with ramp strips, shape & type,
runtime preferences, an experimental "from image" picker) beside a stage (live WCAG
contrast table, split light/dark preview of a real-component cluster, CSS/JSON
export block). All logic lives in the `useThemeDesigner` singleton; the page is
control surface + layout only (`ThemesPage.vue:25-34`).

| # | Finding | Evidence |
|---|---|---|
| 1 | **The page imports zero motion.** `ThemesPage.vue`'s imports are core components + lucide icons + the designer composable — not one primitive from the `src/motion` barrel (34 components, 5 directives, 12+ composables that every landed sibling dogfoods). The only movement on the whole route is native CSS hover color transitions (`.preset`, `:753`). The page that performs the system's *look* is the last page with none of the system's *motion*. | `ThemesPage.vue:1-23`; `motion/index.ts` |
| 2 | **The page's superpower is whispered, never performed.** Every edit re-themes the ENTIRE live site: `ThemeRecipeController` watches the same singleton and applies the recipe to `document.documentElement`, persists it, and primes the FOUC cache (`ThemeRecipeController.ts:92-108`). The visitor is repainting the very page they are standing on — and the only acknowledgment is an `xs`/muted footnote under "Runtime" (`ThemesPage.vue:495-497`). The hero neither states nor shows it. | `ThemeRecipeController.ts:92-108`; `ThemesPage.vue:495-497` |
| 3 | **No atmosphere at all — and this page could light itself for free.** The siblings each *added* an accent-driven atmosphere layer (BV2-01, TV2-01, AV2-01: category → `@property` washes). `/themes` has none — flat `--dz-background` to the fold — yet it is the one page where the accent needs NO click and NO extra state: the recipe already lands on `documentElement`, so `var(--dz-primary)` here IS the design being mixed, continuously, in both themes. An atmosphere reading it would follow every slider drag through the exact pipeline the page sells. | `ThemesPage.vue:646-651` (no layer); `ThemeRecipeController.ts:97-98` |
| 4 | **A hero with no numbers and no entrance.** Static text + two buttons (`:302-331`). The system underneath is quantifiable and every number is derivable at render time: 7 editable palettes (`DESIGNER_INTENTS`), 7 × 11 = 77 live ramp shades (`× SHADE_STEPS`), 16 live WCAG pairs (`LIGHT_PAIRS`+`DARK_PAIRS`, `useThemeDesigner.ts:317-337`), 7 curated presets, 6 font stacks. `DzCountUp`/`DzWordReveal`/`DzGradientText` sit unused one import away — and `DzGradientText` could be painted in the visitor's own primary. | `ThemesPage.vue:302-331`; `useThemeDesigner.ts:59-67,317-337,366-374` |
| 5 | **The instruments are inert.** Preset buttons transition border/background color only (`:753`); applying one snaps the entire page's paint with zero choreography. Ramp strips repaint with no acknowledgment (`:392-399`). Slider thumbs are static white dots; nothing marks the moment of change. The `<details>` "Status & accent palettes" pops open unanimated (`:402`). This is the mixing desk of the design system and it has no tactile response at all. | `ThemesPage.vue:341-354,392-399,402-444,753` |
| 6 | **The showcase is flat.** The split light/dark preview — the page's centrepiece — is two bordered divs with a static radial tint (`:988-997`). No entrance, no elevation, no response to a theme apply; a preset click repaints both panels instantly with nothing to draw the eye to the *reveal*. Note the constraint that shapes any 3D here: the panels are full of interactive components (inputs, switch, rating, focusable table — `ThemePreviewCluster.vue:66-205`), and the AV2-03 lesson is law — **interactive surfaces never tilt under the pointer**. | `ThemesPage.vue:566-579,988-997` |
| 7 | **The win condition looks identical to failure.** The contrast readout is a static table: plain-text ratios, badges that swap with no transition (`:525-563`). Getting a palette to "All pairs pass AA" is the page's game loop — the moment the last pair flips green is the most satisfying event on the route, and today it renders exactly like every other frame. | `ThemesPage.vue:525-563`; `useThemeDesigner.ts:339-347` |
| 8 | **"From image" — the one true imagery feature — is a buried afterthought.** Last control group in the rail (`:501-519`): a plain file-input label, no drag-and-drop, no preview of the picked image, no visualization of the extraction. Yet `applyImagePalette` already computes everything a performance needs (dominant-hue bins, the winning OKLCH — `:246-296`). This is where the owner's "added imagery" ask lands truthfully: the visitor's own image, visibly becoming their palette. | `ThemesPage.vue:219-296,501-519` |
| 9 | **The page ends at a `<pre>`.** Export block → footer (`:626-631`). Home, `/blocks`, `/templates` and `/animations` all close with a designed finale; the visitor who just built a theme they like is handed no "now ship it" moment — the share affordance is back up in the hero. | `ThemesPage.vue:582-643` |
| 10 | **The double motion gate is different on this page.** The recipe's own "Motion preview" control (`:491-494`) lands as `[data-motion-preview='reduced']` on the root (`theme-recipe.ts:434`), which force-stills ALL CSS animation/transitions site-wide (`tailwind.css:254-261`) — but NOT JS-driven motion (rAF parallax, count-ups, beam travel, tilt directives gate on the OS query only). Every JS-driven v2 primitive must additionally thread the designer's `motion` ref (`motion.value === 'reduced'`) into its disabled path, or the page's own reduced-motion demo becomes a lie. | `theme-recipe.ts:431-435`; `tailwind.css:251-261`; `ThemesPage.vue:122-125` |
| 11 | **Perf + state constraints that bound every task:** `/themes` is a lazy route chunk (`router.ts:283-295`); the designer is a **module-level singleton** shared with `ThemeRecipeController` and persisted to localStorage (`useThemeDesigner.ts:189-201`, `ThemeRecipeController.ts:50-68`) — decoration must READ the singleton/tokens, never fork state into a second hue map; specs that mutate palettes leak into the next spec unless they `reset()`. Entry budget: 240 kB gzip initial JS (~208.12 used, animations-v2 ledger) — everything here stays in the lazy chunk. | `router.ts:283-295`; `useThemeDesigner.ts:189-201` |
| 12 | **Guardrails that must stay green (features, not obstacles):** `/themes` is in the per-page axe suite (`pages.a11y.spec.ts:112`) and the interaction sweep (`pages.interactions.spec.ts:113`); `ThemesPage.copy.spec.ts` pins the clipboard flows — blocked-clipboard `role="alert"` + exactly ONE polite live region for copy outcomes (any new live region must not double-announce); `useThemeDesigner.spec.ts` pins the serialize round-trip and ramp math; `nav.spec.ts:48,58` pins the nav links; `yarn validate:tokens` polices color literals. | listed files |

**Found healthy, preserve untouched:** the singleton + `ThemeRecipeController`
wiring (live-site apply, URL > storage precedence, FOUC cache); the
`varsFor('light'|'dark')` nested `data-theme` split-preview mechanism; the
copy/failure UX with its decay windows and single polite region (TASK-FREE3-07);
the preview-export-link lockstep guarantee; the OKLCH contrast math; the
`?theme=` round-trip; every control's markup semantics and aria-labels; the
`.preset`/slider/ramp DOM structure (v2 decorates it, never restructures it).

---

## Part 2 — Design direction: "The Atelier"

One sentence: **this page is the paint studio of the design system — let the paint
the visitor mixes light the room they are standing in, put their palette physically
in their hands, make every instrument answer their touch, and celebrate the moment
the mix passes AA.**

What makes `/themes` different from its landed siblings (and why v2 diverges where
it does): on `/blocks`, `/templates` and `/animations` the accent came from a
category the visitor *clicks*; here the accent is the theme the visitor is
*mixing* — continuous, live, and theirs. So v2 adds **no second source of color
truth**: every new layer reads `var(--dz-*)` (or `shadeCss()` from the singleton)
and therefore repaints itself through the exact pipeline the page sells. "Added
imagery" on this page means two truthful things: the visitor's own uploaded image
(the from-image lab becomes a performance) and the palette itself made physical —
3D paint-chip cards, live ramps, swatches at depth. No stock art, no PNGs, zero
asset bytes.

Principles (inherited from landing-v2 Part 2 and the three landed siblings; task
blocks do not repeat them):

1. **Depth is transform-only.** `perspective` + `rotateX/rotateY/translateZ/scale`
   + shadow/glow. No layout-affecting animation, no filters on large areas, no
   per-frame JS where CSS can drive.
2. **Decoration is invisible to the tree.** Every added layer is
   `aria-hidden="true"`, `pointer-events: none` unless it *is* the control, and
   additive — existing DOM, roles, names and focus order do not change.
3. **Pointer effects attach only on fine pointers** (the directives already gate
   this); touch gets the calm page.
4. **Reduced motion = today's page — and the gate is double HERE too:** the OS
   `prefers-reduced-motion` query AND the recipe's own `motion: 'reduced'`
   preview (`data-motion-preview` stills CSS for free; JS-driven primitives must
   be disabled via the designer's `motion` ref — Finding #10). The page's Motion
   segmented control is itself a demo of the accessibility story; it must calm
   every layer v2 adds.
5. **Every number is derived** — from `DESIGNER_INTENTS`, `SHADE_STEPS`,
   `PRESETS`, `FONT_CHOICES`, `contrastLight/Dark` lengths at render time; never
   hand-typed (repo rule).
6. **Token-only color.** `var(--dz-*)` / `--lp-*` derivations, `shadeCss()`, and
   `color-mix` only — which on this page is not just compliance but the whole
   point: token-driven decoration follows the visitor's edits automatically.
7. **Nothing joins the critical path.** `/themes` is a lazy chunk; within it,
   heavy decoration mounts post-paint or in-view; no new deps; no asset bytes.

Known traps this build inherits (from the landed siblings — do not rediscover):

- A `position: fixed; z-index: -1` layer needs `isolation: isolate` on the page
  root or the shell background paints over it (BV2-01).
- `@property` at-rules need an **UNSCOPED** `<style>` block (scoped blocks strip
  at-rules); name registered properties `--thv2-*` — never reuse `--bv2-*` /
  `--tv2-*` / `--av2-*`, four atmosphere pages can be alive in one SPA session.
- **Paint containment / `overflow: hidden` FLATTENS `transform-style:
  preserve-3d`** (AV2-03): the preview panels have `overflow: hidden`
  (`ThemesPage.vue:997`) — any 3D planes must live on wrappers that do not clip,
  or clip themselves per-part.
- **Interactive surfaces never tilt.** `v-tilt`/`v-glare` are reserved for
  `aria-hidden` decorative objects (the paint chips); the preview panels, the
  control rail and every button stay untransformed under the pointer (AV2-03).
- Parallax children size with `width`/`calc()`, never `transform: scale` —
  `tokens.css` forces `transform: none !important` on `.dz-parallax-layer` under
  reduced motion (TV2-02).
- jsdom has no `Element.animate` — if any new layer (or a primitive it mounts)
  calls it on a real interaction, specs need the minimal animate stub from
  `AnimationsPage.v2.spec.ts`'s `beforeAll` (AV2 trap).
- DzButton `as="a"` renders `role="button"` — query button, not link, in specs.
- Specs drive OS reduced motion via `provideMotionPreference(true)` (the
  matchMedia read is a module singleton frozen by the first test in a file);
  the RECIPE gate is driven by setting `designer.motion.value = 'reduced'` —
  and because the designer is ALSO a module singleton, **every spec that touches
  it must `reset()` (and restore `motion`) in `afterEach`** or state leaks into
  the next spec file mount.
- Narrow vitest runs are `npx vitest run <root-relative path>` **from the repo
  root** (`yarn workspace @dzup-ui/landing test <file>` runs the whole suite).
- Components using `useTheme` need a `DzThemeProvider` wrapper in specs; the
  copy spec's testing-library scaffold (`ThemesPage.copy.spec.ts:22-40`) is the
  mount pattern for this page.
- Prefer logical properties for new offsets; RTL is a real mode here — the page
  itself ships a Direction control.
- `yarn lint` must end fully clean (this checkout's baseline);
  `yarn typecheck:apps` covers apps/landing at 0 errors — any error is yours.

---

## Part 3 — Tasks

Execution is **synchronous**: one task lands (code + tests + validation) before the
next starts. The execution log in Part 4 is updated as each task changes state.

Shared validation block — every task's `<validation>` means, unless it says
otherwise:

```
yarn typecheck:apps                                  # vue-tsc over apps/landing — 0 errors
npx vitest run <touched spec paths, root-relative>   # from the repo root
yarn validate:tokens                                 # no raw colors anywhere
yarn lint                                            # fully clean baseline on this checkout
```

The full landing suite, the production build + `check:bundle`, and e2e run once, in
TASK-THV2-08 — not per task.

---

## [x] TASK-THV2-01 — Your light on the walls: an atmosphere painted by the mix

```xml
<role>
You are the landing app's motion/visual engineer. Three siblings landed the
atmosphere pattern (BV2-01, TV2-01, AV2-01: registered @property washes recolored
by a click-selected category). You are porting it to the one page where the accent
requires NO selection state: ThemeRecipeController applies the visitor's recipe to
documentElement live (ThemeRecipeController.ts:92-108), so var(--dz-primary) and
var(--dz-secondary) on this page ALREADY ARE the design being mixed — in both
themes, updated on every slider tick. The atmosphere's only job is to read them
and glow.
</role>

<task>
Add an aria-hidden, fixed-position, full-height atmosphere layer to ThemesPage —
two large soft radial washes whose hues are the LIVE `--dz-primary` and
`--dz-secondary` semantic tokens, so dragging the primary hue slider visibly
re-lights the page margins in real time and applying a preset sweeps the room to
its color. Tint the hero eyebrow to match. Smooth the transition for discrete
jumps (preset apply, reset, share-link load) via registered `--thv2-accent` /
`--thv2-accent-2` properties with a short color transition — continuous slider
drags retarget through the same transition and feel liquid.
</task>

<requirements>
  <layer>One `.thv2-atmosphere` div, `position: fixed; inset: 0; z-index: -1;
    pointer-events: none`, `aria-hidden="true"`, first child of `.themes-page`.
    The page root gets `isolation: isolate` (WITHOUT it the shell background
    paints over the layer — the exact BV2-01 trap). Two washes built from
    `color-mix(in oklch, var(--thv2-accent) X%, transparent)` (and `-2`);
    whisper-quiet in light AND dark (dark needs a lower mix % — mirror the
    `[data-theme='dark']` override the siblings use). The existing page content
    keeps its stacking (audit: the control rail is sticky; ensure it and the
    stage paint above the layer).</layer>
  <hue>`--thv2-accent` and `--thv2-accent-2` registered via UNSCOPED
    `@property { syntax: '<color>'; inherits: true; initial-value: transparent }`
    blocks, assigned in CSS as `--thv2-accent: var(--dz-primary)` (and a
    secondary-ish source for `-2` — use `var(--dz-secondary)` if the semantic
    token exists in the built tokens; verify, else derive via color-mix of
    primary toward a neighbor). Registered properties interpolate on
    computed-value change, so a `transition: --thv2-accent 400ms, --thv2-accent-2
    400ms` on the layer smooths BOTH slider drags and preset jumps with zero JS
    and zero designer-state duplication. Do NOT read the designer singleton for
    color here — the tokens are the single source (Principle 6).</hue>
  <eyebrow>The hero eyebrow (`.lp-eyebrow`) picks up a subtle `--thv2-accent`
    tint (color or border), matching the sibling pages' cue.</eyebrow>
  <motion>A color fade is not motion — it may persist under reduced motion, but
    add the `prefers-reduced-motion` block dropping the transition to instant
    (sibling convention). `[data-motion-preview='reduced']` already forces
    transitions instant globally — no extra handling, but verify no error when
    the Motion control is toggled.</motion>
  <specs>New `ThemesPage.v2.spec.ts` using the copy spec's scaffold
    (`ThemesPage.copy.spec.ts:22-40`: real router with /themes route, render,
    stubbed clipboard where needed). Assert: the layer exists exactly once, is
    aria-hidden, and is the first child of the page root; the eyebrow carries
    the tint class/style hook. `afterEach`: `useThemeDesigner().reset()` — the
    singleton leaks (Part 2 trap).</specs>
</requirements>

<constraints>
Token-only color. No new deps. No designer-state reads for decoration color —
CSS var references only, so the layer stays correct in both themes and under
future presets for free. The only DOM changes are the layer div and a class/tint
hook on the eyebrow.
</constraints>

<success_criteria>
- Dragging the Primary hue slider from 0° to 360° visibly sweeps the page
  margins' glow through the spectrum, live, in light and dark; applying the Rose
  preset softly fades the room to rose in ~400ms.
- Reset and share-link loads re-light correctly; the layer never intercepts
  clicks; sticky rail and stage render above it.
- New spec green; axe `/themes` pass unchanged; <validation> green.
</success_criteria>
```

---

## [x] TASK-THV2-02 — Overture: a hero painted in the visitor's own mix

```xml
<role>
You are the landing app's motion/visual engineer. The hero is static text with no
numbers, no entrance and no depth (Finding #4), on the page whose whole product is
"your color, everywhere" — a superpower the copy never states (Finding #2). The
sibling heroes (BV2-02, TV2-02, AV2-02 — AnimationsHeroField.vue is the freshest
precedent, including the post-paint mount gate and aria-hidden+inert container)
got parallax depth fields. This page's twist: the field is built from the palette
itself — 3D paint-chip cards whose colors are the LIVE ramp — and the headline is
painted in the visitor's primary.
</role>

<task>
Create `src/components/themes/ThemesHeroField.vue` and upgrade the hero: (a) a
parallax depth field flanking the hero on wide viewports — 4–6 aria-hidden "paint
chips" floating at different depths: small card-like swatches showing live ramp
colors (via `shadeCss()` or direct `--dz-colors-*` vars so they repaint as the
visitor mixes), one chip carrying a mini 5-step ramp strip, one a rounded-radius
demo square, one an "Aa" type specimen — each with soft shadows, a slow idle
float, and `v-tilt` on one or two hero chips (they are decorative — tilt is safe
here); (b) headline: give the h1 a one-time `DzWordReveal` entrance and wrap a key
phrase in an animated `DzGradientText` whose gradient derives from
`var(--dz-primary)` → so the visitor literally repaints the headline as they mix;
(c) a derived stats row under the lede — three `DzCountUp` figures: editable
palettes (`DESIGNER_INTENTS.length`), live ramp shades (`DESIGNER_INTENTS.length *
SHADE_STEPS.length`), live WCAG checks (`contrastLight.value.length +
contrastDark.value.length`) — counting up on first view; (d) one sentence of hero
copy stating the superpower truthfully: the theme applies live to the whole site
and travels with the exported recipe.
</task>

<requirements>
  <field>ONE `aria-hidden="true"` + `inert` container, `pointer-events: none`
    EXCEPT nothing needs pointer events (v-tilt tracks on the container's
    parent? — no: keep the whole field pointer-transparent and drive tilt from
    pointer position via the directive on chips ONLY if the directive supports
    listening without receiving events; if it requires pointer events on the
    element, give ONLY the tilting chips `pointer-events: auto` — they are
    aria-hidden decoration, never focusable, so this is safe; decide by reading
    the directive first and note the decision). Absolutely positioned against
    the hero, `overflow: clip` on the positioning context, logical inset
    properties, hidden below ~1100px (media query — field absent, page identical
    to today). DzParallax layers at 2–3 depths with subtle rates (mirror
    AnimationsHeroField values); size children with width/clamp(), NEVER
    transform scale (TV2-02 trap). Slow CSS idle float; disabled under reduced
    motion. JS-driven pieces (parallax, tilt) must respect BOTH gates: OS
    (self-gating) and the recipe's motion ref — pass a `reduce` prop computed as
    `osReduced || motion === 'reduced'` and thread it into every primitive's
    disabled path (Finding #10).</field>
  <mount>The field mounts post-paint (mirror AnimationsHeroField's defer gate) so
    LCP is untouched. Zero asset bytes — everything is DOM + tokens.</mount>
  <headline>The h1's visible text, heading level and DOM id/anchor behavior must
    not change for the accessible tree (DzWordReveal renders the same string;
    verify its reduced-motion state is the full heading instantly, both gates).
    DzGradientText's gradient stops come from `var(--dz-primary)` +
    `color-mix` derivations — never a literal.</headline>
  <stats>Numbers computed in setup scope FROM the imports
    (`DESIGNER_INTENTS`, `SHADE_STEPS`, the contrast computeds) — NEVER typed.
    The row is real content (NOT aria-hidden): a `<dl>` or labelled group,
    axe-clean, tabular-nums. DzCountUp fires in-view once; reduced motion
    (either gate) renders final numbers immediately. Keep the lede and all
    three hero actions exactly as they are.</stats>
  <copy>The superpower sentence must claim only what ThemeRecipeController does:
    live application to this site + persistence + the share link. No claims
    about npm packages or consumer apps beyond the exported variables.</copy>
  <specs>`ThemesHeroField.spec.ts` + additions to `ThemesPage.v2.spec.ts`:
    field container is aria-hidden + inert; stats equal the derived values
    (compute expectations FROM the same imports, not literals); reduced-motion
    path via `provideMotionPreference(true)` renders final numbers immediately;
    the RECIPE gate path (`designer.motion.value = 'reduced'`, then reset in
    afterEach) also renders final numbers; the h1 still resolves to the same
    text content.</specs>
</requirements>

<constraints>
Token-only color (chips read ramp vars — zero hardcoded hues). No edits to
useThemeDesigner. No new deps. Nothing in the field is focusable or announced.
The two hero buttons and the share anchor keep their exact markup and handlers.
</constraints>

<success_criteria>
- Wide viewport: paint chips float at visibly different depths beside the hero,
  answer pointer movement (parallax + a tilting chip), and REPAINT live as the
  visitor drags hue sliders; narrow viewport: today's hero plus stats.
- The headline reveals word-by-word once, its gradient phrase painted in the
  current primary; three true numbers count up and match the derived values.
- Reduced motion (either gate): static field or none, instant heading, instant
  numbers — behaviorally today's page.
- No horizontal scrollbar at any width; new specs + <validation> green; axe
  pass unchanged.
</success_criteria>
```

---

## [x] TASK-THV2-03 — The mixing desk: instruments that answer the hand

```xml
<role>
You are the landing app's motion/visual engineer. The control rail is the mixing
desk of the design system and it is inert (Finding #5). The sibling toolbars
(BV2-04, TV2-05, AV2-04) landed the micro-interaction language: press springs,
one-shot accent pulses, choreographed state changes. Port it to controls that are
mostly native inputs — decorating the existing DOM, never restructuring it
(Finding #12's guardrails pin the semantics).
</role>

<task>
Micro-interactions across the control rail: (a) preset buttons get a press spring
(transform-only), their swatch dot gets a hover pop, and the JUST-APPLIED preset
fires a one-shot ring pulse in its own swatch color (`--sw` is already on the
button); (b) ramp strips acknowledge change — when a palette's hue/chroma
changes, its ramp runs a quick left-to-right shimmer sweep (a moving highlight
overlay, one-shot, retriggered per change with a small debounce so slider drags
read as one continuous shimmer, not a strobe); (c) slider thumbs grow slightly
and gain a soft halo in the palette's current 500 shade while active/dragging
(`:active`/`:focus-visible` CSS on the existing `.range` thumbs); (d) the
"Status & accent palettes" disclosure animates open/closed smoothly (grid-rows
or height technique on a wrapper — the `<details>` element stays for semantics);
(e) the swatch next to each palette label cross-fades its color (short
transition) instead of snapping.
</task>

<requirements>
  <presets>Spring is `:active` scale + settle transition, transform-only. The
    applied pulse is a one-shot animation on a pseudo-element reading
    `var(--sw)`; trigger by tracking the designer's `recipe.preset` (watch it —
    the singleton exposes `recipe`) or a local click flag; it must also fire
    when a preset arrives via share-link deserialize ONLY if trivial —
    otherwise click-only is fine (note the choice). Reduced motion (both
    gates): no spring, no pulse — CSS side is covered by the global stills;
    ensure no JS-driven class keeps toggling.</presets>
  <ramps>The shimmer overlay is aria-hidden, absolutely positioned inside
    `.ramp` (which already clips — `overflow: hidden`, `:858`), animated via
    transform translateX only. Watch `palettes[intent]` (deep) per control OR
    one watcher on `recipe.palettes` mapping to the changed intent — keep it
    cheap; debounce ~150ms so a drag retriggers at most a few times per
    second. Under either motion gate: no shimmer (guard the class toggle on
    the same dual-gate computed from THV2-02).</ramps>
  <sliders-disclosure>CSS-only where possible. The disclosure animation must
    not break open/close semantics or keyboard toggling; `details` content
    animation via the `::details-content` / grid-rows wrapper technique — pick
    what works across the support matrix and note it. No layout jump for
    sibling controls beyond the intended expansion.</sliders-disclosure>
  <specs>Extend `ThemesPage.v2.spec.ts`: preset buttons keep their click →
    `apply()` behavior (spy or assert recipe.preset changes); the applied
    preset carries the pulse class after click and loses it after the
    animation window (vi.useFakeTimers); ramp shimmer class appears after a
    palette mutation and NOT when the dual-gate computed is reduced (drive the
    recipe gate via `designer.motion.value = 'reduced'`); disclosure still
    opens/closes (toggle event). Always `reset()` the singleton in
    afterEach.</specs>
</requirements>

<constraints>
Zero DOM restructuring of controls: same elements, same aria-labels, same
v-model bindings — only classes, pseudo-elements and small aria-hidden overlay
spans may be added. No changes to useThemeDesigner. Token-only color (`--sw`,
`shadeCss`, `--dz-*`). No new deps. The rail must stay smooth while dragging a
slider at 60Hz — no watcher may do layout work per tick (class toggles and CSS
vars only).
</constraints>

<success_criteria>
- Pressing a preset springs it and pulses a ring in its own color while the
  whole page fades to the palette (THV2-01's wash included); dragging a hue
  slider makes its ramp shimmer as the shades flow, the thumb grows with a
  halo in the palette's color, and the label swatch glides between hues.
- The advanced disclosure glides open. Everything is instant/still under
  either motion gate; all existing control semantics and specs unchanged.
- Specs + <validation> green; axe + interaction sweeps unchanged.
</success_criteria>
```

---

## [x] TASK-THV2-04 — The easel: a showcase with presence and an apply reveal

```xml
<role>
You are the landing app's motion/visual engineer. The split light/dark preview —
the page's centrepiece — is two flat bordered divs (Finding #6). They are full of
interactive components, so the AV2-03 law applies: NO pointer tilt on the panels.
Presence must come from entrance choreography, elevation, a live accent, and a
designed "apply" moment instead.
</role>

<task>
Upgrade the showcase: (a) scroll entrance — the two panels rise+fade in with a
slight stagger (light, then dark) on first view, via the established
fail-open scroll-entrance mechanism (AV2-05 precedent: `v-animate-on-scroll`,
once, both gates); (b) a subtle 3D presentation at rest: give the split a shared
`perspective` and each panel a BARELY perceptible opposing rotateY (≤1.5°, outer
edges receding — an open book / easel pair), flattening to 0° on hover/focus-
within so interaction is always on a flat surface; disabled under either motion
gate and below the two-column breakpoint (`:1096` puts them single-column —
rotation off there); (c) an "apply sweep": when a preset is applied (same trigger
contract as THV2-03) a soft light band sweeps across BOTH panels once —
aria-hidden overlay, transform-only — turning the repaint into a reveal; (d) the
panel labels' dots (`.pp-dot--light/dark`) each gain a live primary ring so the
chrome itself shows the mix; (e) hover elevation: panels lift slightly
(translateY + shadow deepen, the site-generic hover) — flat, no tilt.
</task>

<requirements>
  <entrance>Reuse the AV2-05 pattern exactly: `v-animate-on-scroll`, once,
    fail-open (content visible without IO), capped stagger, no entrance under
    either gate. The panels' inline `:style="lightVars/darkVars"` bindings and
    `data-theme` attributes are untouched.</entrance>
  <rake>The rotateY rest state must not clip content or blur text
    (keep the angle tiny; add `transform-style: flat` — no preserve-3d needed,
    and the panels' `overflow: hidden` would flatten it anyway, AV2-03 trap);
    transition to flat on `:hover` and `:focus-within` (keyboard users get the
    flat surface too). Verify DzSelect/popover-style children inside the
    cluster still position correctly with the transform present (a transformed
    ancestor becomes a containing block — if any child popover/portal
    misplaces, drop the rake on that panel or portal the child; test the
    Segmented/Input/Rating interactions in the built page and note the
    result).</rake>
  <sweep>The sweep overlay lives once per panel, aria-hidden, pointer-events
    none, inside the existing `overflow: hidden`; one-shot class triggered by
    the same preset-apply signal as THV2-03 (share one tiny composable or
    provide/inject flag rather than duplicating watchers — note the shape).
    No sweep on slider drags (too frequent) — preset/reset/deserialize only.
    Silent under either gate.</sweep>
  <specs>Extend `ThemesPage.v2.spec.ts`: panels carry the entrance directive
    binding when motion allowed and not under `provideMotionPreference(true)`;
    sweep overlays exist aria-hidden (one per panel) and gain the run class on
    preset click; rake class present at rest, absent under the recipe gate
    (`designer.motion.value = 'reduced'`); `data-theme` and `:style` bindings
    unchanged (assert both panels still receive their vars maps). Singleton
    reset in afterEach.</specs>
</requirements>

<constraints>
No pointer tilt on the panels, ever. ThemePreviewCluster's roster and local
state stay (presentation-only classes inside it are allowed if needed for the
sweep, but prefer page-level overlays). The nested `data-theme` + `varsFor`
mechanism is untouchable. Token-only color. No new deps.
</constraints>

<success_criteria>
- Scrolling to the showcase, light then dark panel rise into place; at rest on
  a wide viewport they sit like a subtly opened book, flattening the moment
  the pointer or focus enters; applying a preset sends one soft light band
  across both panels as they repaint; label dots wear the current primary.
- Every component inside both panels remains fully usable (type in the input,
  toggle the switch, rate, tab through) with zero positioning glitches.
- Either motion gate: today's flat, instant panels. Specs + <validation>
  green; axe + interaction sweeps unchanged.
</success_criteria>
```

---

## [x] TASK-THV2-05 — The gauges: contrast instruments that live, and a win worth winning

```xml
<role>
You are the landing app's motion/visual engineer. The contrast table is the
page's game loop and it renders its win condition identically to failure
(Finding #7). The sibling recipe for animated numbers with clean SR output is
landed (AV2-04 / TV2-04: visual layer aria-hidden, DzVisuallyHidden plain text,
at most one polite utterance). Sixteen ratios update on every slider tick — so
choose instruments that stay cheap at 60Hz: emphasize CHANGE and STATE FLIPS,
not continuous rolling on all 16 rows.
</role>

<task>
(a) Ratio tick: each `.a11y-ratio` gets a one-shot emphasis on value change (a
brief scale/brightness tick via a retriggered CSS animation — cheap, no
per-digit odometer on rows); (b) badge flips pop: when a pair's badge state
changes (AA ↔ AA Large ↔ Fail), the badge does a small scale-in pop — state
change only, not every recompute; (c) the headline badge ("All pairs pass AA" /
"N below AA") becomes the one animated number: `DzCountUp`/`DzOdometer` on N
with the TV2-04 SR recipe if a rolling visual is used, plus a pop on flip;
(d) the celebration: when `failingCount` transitions from >0 to 0 through user
interaction (not on mount, not on route return), fire a single, small, tasteful
one-shot burst (`DzBurst` — read its API first; if it needs Web Animations,
note the jsdom stub for specs) anchored to the Accessibility header, plus a
brief success glow on the a11y bar border. Once per transition; re-arms only
after failingCount rises above 0 again.
</task>

<requirements>
  <perf>No watcher may allocate or touch layout per slider tick beyond class
    toggles. The per-row tick uses a keyed class retrigger with a short
    debounce (share the THV2-03 debounce helper if one emerged). 16 rows × 60Hz
    must stay flat in the profiler.</perf>
  <sr>The ratio texts and badges are NOT live regions today — keep it that
    way (no new announcements; the visual ticks are aria-transparent). If an
    odometer visual is used for the headline N, its digits are aria-hidden
    with a DzVisuallyHidden plain sentence, and NO aria-live (the badge is
    not live today; do not add announcement spam to a 60Hz surface).</sr>
  <celebration>Dual-gate stilled (OS + recipe motion): under either gate the
    win renders as the badge flip + static glow only, no burst. Mount guard:
    initialize the previous-failing-count AFTER first compute so a page
    opened on an all-passing theme does not celebrate. The burst layer is
    aria-hidden, pointer-events none, self-removing.</celebration>
  <specs>Extend `ThemesPage.v2.spec.ts`: drive `palettes.primary` to a
    failing config (find one in the spec by scanning hues, or reuse
    useThemeDesigner.spec.ts's known-failing fixture if it has one) then back
    to passing, assert the celebration class/element appears exactly once and
    does NOT appear on a fresh mount with a passing theme; badge pop class
    appears on state flip and not on a same-state recompute; under either
    motion gate no burst element renders. Fake timers for the one-shot
    windows; singleton reset in afterEach.</specs>
</requirements>

<constraints>
The contrast MATH and pair definitions are untouchable (useThemeDesigner owns
them). No changes to badge text or the table's DOM order — decoration only.
Token-only color (`--dz-success*` family for the glow). No new deps.
</constraints>

<success_criteria>
- Dragging hue across a boundary makes the affected ratios tick and their
  badges pop exactly on the flip; fixing the last failing pair fires one small
  burst and a success glow — visibly THE moment of the page; wrecking and
  re-fixing the palette celebrates again.
- SR output is unchanged from today (no new utterances). Either motion gate:
  today's static table with the state flip only.
- Specs + <validation> green; axe pass unchanged; no measurable input lag
  while dragging sliders.
</success_criteria>
```

---

## [x] TASK-THV2-06 — The darkroom: "from image" becomes a performance

```xml
<role>
You are the landing app's motion/visual engineer. The one true imagery feature —
derive a palette from the visitor's own image — is a buried plain file input
(Finding #8), while applyImagePalette already computes everything a show needs
(dominant-hue bins → winning OKLCH, ThemesPage.vue:246-296). You are giving the
owner's "added imagery" ask its truthful home: the visitor's image, visibly
becoming their theme.
</role>

<task>
Extract the feature into `src/components/themes/ThemeImageLab.vue` (mounted in
the same control-group slot; the extraction logic moves with it, unchanged) and
stage it: (a) the picker becomes a real drop zone — drag-and-drop + click-to-
browse + paste support if trivial; dragover state lights the zone's dashed
border in `var(--dz-primary)`; (b) after a pick, show a small thumbnail of the
image (object URL, revoked on replace/unmount) beside the result; (c) the
extraction performs: 4–6 small aria-hidden dots colored by the sampled dominant
bins fly from the thumbnail to the Primary palette swatch/control (transform-
only, one-shot, ~600ms), then the primary control's ramp shimmer (THV2-03)
fires — the image visibly pours into the palette; (d) status text becomes a
polite `aria-live` region ("Applied primary from image · hue 213° · chroma
0.16") — the ONLY new live region, and verify it cannot double-speak with the
copy-status region (they announce disjoint events); (e) keep the "Experimental"
badge and the client-side privacy note.
</task>

<requirements>
  <extraction>onImagePick/applyImagePalette move verbatim (same sampling, same
    clamps, same palette writes) — the performance is presentation ONLY. To
    color the flying dots, surface the top sampled bins from the existing loop
    (tiny pure refactor: return them alongside the winner; unit-testable).</extraction>
  <dropzone>Keyboard accessible: the existing label+input pattern stays the
    focusable path; drag-and-drop is additive (dragenter/over/leave/drop with
    proper preventDefault; files validated by type as today via accept +
    a type check on drop). The zone is one labelled control, not a new
    landmark.</dropzone>
  <flight>Dots are aria-hidden, pointer-events none, absolutely positioned in
    a page-level (or lab-level) overlay; endpoints measured via
    getBoundingClientRect at fire time; transform-only animation; skipped
    entirely under either motion gate (result still applies instantly —
    the FEATURE never degrades, only the show). If jsdom lacks needed APIs
    (gBCR returns zeros) the flight simply doesn't assert positions in specs —
    assert presence/absence and gating classes only.</flight>
  <specs>`ThemeImageLab.spec.ts`: renders the labelled input; a fake File via
    the input applies a palette (stub Image/canvas as needed — or test the
    extracted pure sampling helper directly with a synthetic ImageData);
    status region is polite and updates; dragover toggles the lit class; under
    either motion gate no flight dots mount. Page spec: the lab mounts once in
    the rail; the old inline section is gone; copy-status region count on the
    page is still exactly one FOR COPY EVENTS (the lab's region is separate —
    assert both exist with their own text, and that a copy action does not
    write into the lab's region). Singleton reset in afterEach.</specs>
</requirements>

<constraints>
No behavior change to sampling or palette writes; no upload anywhere (stays
fully client-side — the privacy note must remain true). Object URLs always
revoked. Token-only color for chrome (the dots' colors are sampled DATA, set
via inline style — that is data visualization, not theme styling; keep the
existing oklch-string pattern the page already uses for tracks/swatches).
No new deps.
</constraints>

<success_criteria>
- Dragging an image over the zone lights it; dropping shows the thumbnail,
  flies its colors into the Primary control, shimmers the ramp, re-lights the
  whole room (THV2-01) in the image's hue, and announces the result politely.
- Keyboard/SR path: unchanged picking flow, one clean announcement, working
  result. Either motion gate: instant apply, no flight, still announced.
- Specs + <validation> green; axe pass unchanged.
</success_criteria>
```

---

## [x] TASK-THV2-07 — The private view: a finale that ships the theme

```xml
<role>
You are the landing app's motion/visual engineer. The page ends at a `<pre>`
(Finding #9). Every sibling closes designed, and this page has the strongest
closing argument in the app: the visitor has just MADE something. The finale's
art is the architecture drawn live — recipe → --dz-* variables → this very site
— by the gallery's own beam primitive, lit in the visitor's mix.
</role>

<task>
Create `src/components/themes/ThemesFinale.vue` and mount it after the export
block: a full-width band containing (a) an aria-hidden art panel where DzBeam
draws animated connections between three labelled nodes — "your recipe" →
"--dz-* variables" → "every component" — the beams and node accents reading
`var(--dz-primary)` so the diagram is painted in the visitor's theme; a small
DzOrbit ring decorates the middle node; (b) truthful derived copy ("One recipe ·
N palettes · M shades · exported as CSS variables — already applied to the page
you're reading."); (c) three actions: Copy share link (reuse the page's existing
copyText/'share' key so labels + the polite region behave identically), Download
.css (reuse download()), and a "Browse components" link (LINKS.components — the
convention the sibling finales use; verify the constant); (d) the band enters
with the standard scroll reveal.
</task>

<requirements>
  <art>ONE aria-hidden + inert container, pointer-events none. Read DzBeam's
    API first — endpoints resolve via parentElement.querySelector, so beams
    must be DIRECT children of the container holding both endpoints
    (connections-primitives memory / AV2-06 precedent). Beams idle only while
    in view (useInView) and still completely under EITHER motion gate (thread
    the dual-gate computed into the disabled path). Node labels are real text
    for sighted users; the panel stays aria-hidden with the meaningful claim
    in the copy.</art>
  <copy>All numbers derived from DESIGNER_INTENTS/SHADE_STEPS imports. The
    "already applied" claim is exactly what ThemeRecipeController does — keep
    it precise; no npm-package claims.</copy>
  <actions>DzButtons consistent with the hero pair; the share button MUST
    share the hero's copied/copyFailed keys and status region (one source of
    truth — pass handlers down as props or lift them; do not duplicate the
    clipboard plumbing, ThemesPage.copy.spec.ts pins its behavior).</actions>
  <specs>`ThemesFinale.spec.ts`: derived numbers rendered (computed from the
    same imports in the spec); art panel aria-hidden + inert; actions
    reachable by role (DzButton as="a" → role button — AV2 trap) and share
    click calls the passed handler. Page spec: finale mounts exactly once,
    after the export block; the copy spec still passes untouched (share key
    reuse must not double-fire or double-announce — one click, one polite
    utterance).</specs>
</requirements>

<constraints>
The finale sits INSIDE the page (before the shared Footer — untouched). No new
routes, no nav changes. Token-only color. No new deps. Compact — a coda, not a
second hero.
</constraints>

<success_criteria>
- The page now ends with a lit diagram in the visitor's own primary, drawing
  recipe → variables → components while visible, frozen off-screen and under
  either gate; three clear actions, with share behaving byte-identically to
  the hero's (including failure UX).
- Copy states only true, derived facts. Specs + <validation> green; the copy
  spec and axe pass unchanged.
</success_criteria>
```

---

## [x] TASK-THV2-08 — Verification sweep, budgets, and the record

```xml
<role>
You are the release engineer for this backlog. Seven visual tasks have landed
individually green; your job is proving the route — and the whole app — is green
as a system, measuring the cost, and writing the record so the next agent doesn't
rediscover anything.
</role>

<task>
Run the full verification matrix, fix anything the sweep surfaces (regressions
introduced by THV2-01..07 only — pre-existing failures are recorded, not fixed),
then write the Part 4 ledger in docs/themes-v2.md and update project memory.
</task>

<matrix>
  1. `yarn typecheck:apps` and `yarn typecheck` — 0 errors.
  2. Full landing suite: `yarn workspace @dzup-ui/landing test` — fully green
     (the 1 known win32 failure lives in the CORE suite, not here).
  3. `yarn lint` — fully clean (this checkout's baseline).
  4. `yarn validate:tokens` — clean.
  5. Production build: `yarn workspace @dzup-ui/landing build`, then
     `yarn workspace @dzup-ui/landing check:bundle` — entry budget honored;
     record the ThemesPage route chunk before/after (baseline `58195f6`) and
     confirm ~0 delta on the critical path (everything is lazy).
  6. e2e (built preview): at minimum `e2e/flows.spec.ts` and
     `e2e/visual.spec.ts` (baselines cover `/` — confirm no baseline churn).
  7. Manual matrix in the dev/preview server: light/dark × fine/coarse pointer
     × reduced motion (BOTH gates — OS emulation AND the page's Motion
     segmented control) on /themes; RTL spot-check (the page's own Direction
     control!) for every new absolutely-positioned layer; no horizontal
     overflow at 360/768/1280/1680px; `?theme=` share round-trip still lands
     correctly and re-lights the atmosphere; every preview-cluster component
     remains fully usable; slider drag stays smooth with the profiler open.
</matrix>

<record>
  Part 4 ledger: per-task status flips to [x] with one measured line each; a
  cost table (route chunk JS/CSS gzip deltas); traps encountered; the
  validation transcript summary. Then update the auto-memory: a new
  `themes-v2-the-atelier.md` memory (pattern: the landed sibling memories)
  indexed from MEMORY.md, cross-linking [[animations-v2-the-theatre]] and
  [[themes-designer-page]].
</record>

<success_criteria>
- Every matrix row green (or a pre-existing failure explicitly recorded as
  such with evidence it predates this work).
- Ledger written; memory saved; doc statuses accurate.
</success_criteria>
```

---

## Part 4 — Execution log

| Task | Status | Landed |
|---|---|---|
| THV2-01 your light (atmosphere) | `[x]` | 2026-08-28 |
| THV2-02 overture (hero) | `[x]` | 2026-08-28 |
| THV2-03 mixing desk (controls) | `[x]` | 2026-08-28 |
| THV2-04 easel (showcase) | `[x]` | 2026-08-28 |
| THV2-05 gauges (contrast + win) | `[x]` | 2026-08-28 |
| THV2-06 darkroom (from image) | `[x]` | 2026-08-28 |
| THV2-07 private view (finale) | `[x]` | 2026-08-28 |
| THV2-08 verification + record | `[x]` | 2026-08-28 |

### Ledger (measured 2026-08-28, win32)

- **THV2-01** — `.thv2-atmosphere` fixed full-height washes reading the LIVE
  `--dz-primary`/`--dz-secondary` semantic tokens through registered
  `@property --thv2-accent/-2` (UNSCOPED block; 400ms color transition smooths
  preset jumps AND slider drags — registered properties interpolate on
  computed-value change, even when the value is a `var()` reference).
  `.themes-page` got `isolation: isolate` (BV2-01 trap); eyebrow tinted.
  ZERO designer-state reads for decoration color — the tokens are the single
  source, so share-links/persistence re-light the room for free. Specs: 4
  (`ThemesPage.v2.spec.ts`).
- **THV2-02** — `components/themes/ThemesHeroField.vue`: 5 aria-hidden paint
  chips (live primary mini-ramp, "Aa" specimen on the primary solid following
  the font choice, radius demo square following the radius slider, elevation
  card following the shadow slider, secondary ramp bar) on 3 DzParallax
  depths, width via `calc()` (never transform scale — TV2-02 trap), idle
  float + slow rotateY sway composing the parallax vars, post-paint defer
  gate, partial ≤1360px, gone ≤1100px. **RECORDED DECISION:** `inert` blocks
  pointer events for the whole subtree, so per-chip `v-tilt` was dropped in
  favour of viewport-sourced parallax (window listeners) — the field stays
  truly inert. H1: DzStagger word cascade + ANIMATED DzGradientText whose
  default stops read `--dz-colors-primary/secondary-*` — on THIS page those
  ARE the live regenerated ramp, so the headline repaints as the visitor
  mixes with zero extra styling. Stats `<dl>` via DzCountUp: 7 palettes / 77
  shades / 16 WCAG checks — ALL derived (`DESIGNER_INTENTS × SHADE_STEPS`,
  contrast array lengths). Superpower sentence added to the lede. **The dual
  motion gate wired ONCE:** the page installs `provideMotionPreference`
  driven by the recipe's `motion` ref, so every `useReducedMotion()` consumer
  (parallax, count-ups, stagger, gradient, beams, burst) honours the page's
  own control AND the OS query. Specs: 4 (field) + 3 (page).
- **THV2-03** — presets: press spring + hover dot pop + one-shot applied ring
  pulse reading `var(--sw)`, fired from a `recipe.preset` watcher (so
  share-link deserializes pulse too; 'custom' excluded — drags never pulse);
  ramp shimmer sweep per palette change (7 per-intent watchers → 250ms floor
  → keyed one-shot overlay inside `.ramp`'s existing clip, transform-only);
  slider thumbs grow + halo in the palette's own 500 shade (`--thumb` bound
  inline; `:active`/`:focus-visible` CSS only); label swatches cross-fade;
  the `<details>` disclosure animates via `interpolate-size` +
  `::details-content` (RECORDED: progressive enhancement — unsupporting
  browsers snap exactly like today; semantics untouched). JS retriggers all
  guarded by the shared `decorReduced` computed. Specs: 4.
- **THV2-04** — showcase: `v-animate-on-scroll` rise+fade (fail-open, once,
  no-op enterClass under either gate) with the dark panel trailing 120ms via
  `animation-delay` on its enter class; rest-state "open book" rake
  (opposing rotateY 1.2°, `transform-style: flat` — no preserve-3d, the
  panels' `overflow: hidden` would flatten it anyway per AV2-03), flattening
  on hover AND focus-within, off ≤1040px and under either gate
  (`.thv2-still` page class + the OS media query); preset-apply light sweep
  across both panels (same watcher as the preset pulse — one trigger, never
  on drags); `.pp-dot` live primary rings resolving through each panel's own
  scoped vars. Verified in real Chromium: every cluster component fully
  usable, no positioning glitches at 1.2°. Specs: 5 (incl. the finale/lab
  wiring rows).
- **THV2-05** — per-row ratio tick (keyed one-shot class, 250ms floor) +
  badge pop on STATE flips only (previous-state map SEEDED by an
  `immediate` watcher run — without seeding, the first real change seeds
  instead of ticking); headline badge pops on failing-count change.
  **RECORDED DEVIATION:** no DzCountUp/DzOdometer on the headline —
  DzAnimatedNumber hardwires an `aria-live="polite"` region, which on a
  surface recomputed at slider-drag rate would be announcement spam; the
  pop replaces the roll and the contrast surface keeps ZERO live regions
  (asserted). The win (`failingCount` >0 → 0, watcher-only so a fresh
  all-passing mount never fires) triggers one DzBurst on the header icon +
  a one-shot success border glow; re-arms on the next failure. Specs: 4.
- **THV2-06** — `components/themes/ThemeImageLab.vue` + pure
  `themeImageSampling.ts`: extraction moved VERBATIM (same bins, skips,
  clamps, palette writes) with one pure addition — ranked `topBins` for the
  show. Drop zone (dragenter/over/leave/drop + type check; the label+input
  pair stays the keyboard path), thumbnail with revoked object URLs, 5-dot
  sampled-colour flight thumbnail → Primary swatch (gBCR at fire time,
  transform-only, self-skipping under either gate AND when endpoints can't
  measure — the APPLY never degrades), after which THV2-03's ramp shimmer
  fires by itself. Status became the page's SECOND polite region —
  deliberately WITHOUT `role="status"` so the copy contract's
  `[aria-live][role="status"]` selector keeps a unique match (asserted both
  ways: copy events never write into the lab region). Specs: 7 (lab, incl.
  a full pick-to-apply pipeline over a faked 2d context) + 2 (page).
- **THV2-07** — `components/themes/ThemesFinale.vue`: aria-hidden + inert
  art panel — two DzBeam paths (direct children of the endpoints' container
  — the DzBeam trap) drawing `your recipe → --dz-* variables → every
  component` with a DzOrbit on the middle node, all reading the live
  `--dz-primary`; in-view idle cap + dual-gate stills. Derived copy
  (7 palettes · 77 shades · "already applied to the page you're reading" —
  exactly what ThemeRecipeController does). Actions: share = the HERO's
  clipboard plumbing passed down as props/emits (one source of truth; the
  copy spec runs untouched), Download .css, Browse components.
  **RECORDED:** the finale's share button wears a DISTINCT visible label
  ("Share this theme") because the copy spec queries by role+accessible
  name and two "Copy share link" buttons would be ambiguous — same key,
  same handler, same single polite announcement. Specs: 5 (finale) + 1
  (page).
- **THV2-08 matrix** — `yarn typecheck` + `yarn typecheck:apps`: 0 errors.
  Full landing suite: **71 files / 2760 tests, all green** (baseline
  67/2723 → +37 tests, zero regressions). `yarn lint`: clean.
  `yarn validate:tokens`: clean. Build green; `check:bundle` budgets all
  PASS. **Cost (gzip, baseline `58195f6` rebuilt and measured on the same
  machine):** ThemesPage route chunk JS 6.49 → 9.64 kB (+3.15), CSS
  2.05 → 4.45 kB (+2.40) — all lazy; initial-load JS 208.12 → 208.18 kB
  (**+0.06 kB on the critical path**); initial payload 245.82 → 245.88 kB;
  ZERO asset bytes (no images — the "imagery" is live tokens + the
  visitor's own upload). e2e (built preview, chromium): 11/11 —
  `flows.spec.ts` 6, `visual.spec.ts` 4 (baselines untouched),
  `theme-recipe.spec.ts` 1 (the /themes persistence/share/axe flow).
  Scripted browser matrix (real Chromium on the built preview): 16 cells —
  light/dark × ltr/rtl × 360/768/1280/1680px — no horizontal overflow, no
  console errors, atmosphere/finale/lab present everywhere, hero field
  correctly absent ≤1100px and present ≥1280px; interaction pass: Rose
  preset fires both panel sweeps and lands the ramp override on `:root`,
  Motion=Reduced sets `.thv2-still`, the `?theme=` share round-trip
  re-applies the ramp on a fresh load. NOT run: the core package suite (no
  `packages/*` runtime file touched; its known win32 baseline stands) and
  the CI coverage gate (CI's own invocation — the free3-12 memory).
- **Traps encountered:** (1) registered `@property` color transitions DO
  interpolate `var()`-sourced values — the mechanism THV2-01 leans on; no
  JS hue plumbing needed. (2) `inert` blocks pointer events subtree-wide —
  a directive needing pointer events on the element (v-tilt) cannot live
  inside a truly inert decoration field. (3) `useReducedMotion()` called in
  the SAME component that calls `provideMotionPreference` sees only the OS
  query (inject can't read own provides) — page-local JS gates need an
  explicit `os || recipe` computed. (4) A `[contrastLight, contrastDark]`
  watcher must run `immediate` to SEED previous-value maps or the first
  real change seeds instead of animating. (5) DzAnimatedNumber hardwires a
  polite live region — never mount it on a surface that updates at slider
  rate. (6) The copy spec's role+name queries make duplicate button labels
  a test failure — new CTAs that reuse a handler need distinct visible
  labels. (7) The designer singleton leaks across spec files — every
  v2 spec resets it (and thereby restores `motion`) in `afterEach`.
