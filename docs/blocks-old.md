# Blocks — Design, Investigation & Task Specification

> **Status:** **Phase A (display infrastructure) + Phase C (quality gates) shipped; MVP catalog
> authoring in progress.** The `/blocks` surface is live — route, registry, `BlockPreview`,
> index page, SEO, and the registry CI guard — with **1 of 48 free blocks authored**
> (`hero-centered`, the reference block from Task A7). The remaining catalog (Phase B) and the
> Pro tier (Phase D) are not yet built. See the **Shipped status** box below and §5/§7.
> **Owner:** dzup-ui team · **Last updated:** 2026-06-23
> **Scope:** The **Blocks** ecosystem offering for the landing app (`apps/landing`) — what happens when a visitor clicks the "Blocks" tile, how blocks are displayed, and the catalog of ready-made blocks composed from the **free** `@dzup-ui/core` components. **Now also covers a gated 🔒 Pro tier** composed from `@dzup-ui-pro/pro` components — feasibility & positioning in §3.7, catalog in §4.6, tasks in Phase D (§7).
> **Read first:** [`docs/landing.md`](./landing.md) (the landing-page spec; §4.6a "Ecosystem" introduces Blocks) and the root [`CLAUDE.md`](../CLAUDE.md) (architecture + the styling/contract rules every block must obey).

---

## 0. Shipped status (as of 2026-06-23)

The display infrastructure and quality gates are live; catalog authoring has begun. Validated
locally with `yarn typecheck` (0 errors), the landing app's `vite build` (success), and
`yarn test` (registry guard, 8 passing). ESLint is intentionally out of the loop (broken locally,
§3.6).

**Ecosystem "Blocks" tile:** **`status: 'available'`** in `apps/landing/src/data.ts`, linking to
`/blocks` (was `'planned'`). It now renders as an interactive "Explore" tile; the other ecosystem
tiles that remain unshipped keep their "Planned" treatment.

**Shipped block count per category** (free catalog; Pro catalog §4.6 = 0 shipped):

| Category | Shipped | Catalog target (§4) | MVP target (★) |
|---|---|---|---|
| Marketing  | **1** (`hero-centered`) | 17 | 10 |
| Application | 0 | 15 | 6 |
| Auth & Forms | 0 | 9 | 4 |
| Commerce | 0 | 6 | — |
| Content | 0 | 6 | — |
| **Total (free)** | **1** | **48 (rows) / 16 ★ MVP** | — |
| **Total (Pro 🔒)** | 0 | 36 | 16 ★ |

> The single shipped block (`hero-centered`) is the Task A7 reference block that proves the
> file → registry → index → preview → copy pipeline end-to-end. Phase B authoring (the rest of the
> ★ MVP and the full catalog) is the next increment.

---

## 1. Purpose & Context

The landing app already ships an **Ecosystem** section ("Beyond components") rendered by
`apps/landing/src/components/EcosystemGrid.vue`, fed by `ECOSYSTEM` in `apps/landing/src/data.ts`.
It announces six complementary offerings — **Blocks, Templates, Animations, Icons, Themes, Figma kit** —
each as a **non-interactive "Planned" tile**. Today, clicking "Blocks" does nothing.

This document specifies the first of those offerings to be built out: **Blocks**.

**What a "Block" is** (industry-standard definition, confirmed across PrimeVue, Tailwind Plus, shadcn,
Nuxt UI Pro): a **pre-composed UI section** — the unit *above a single component, below a full page*.
A hero, a pricing table, a navbar, a stat row, an auth card, a settings panel. The developer **copies
the markup and pastes it** into their app; because every block is built from the same `@dzup-ui/core`
components and `--dz-*` tokens, it drops in already themed, accessible, and light/dark-ready.

**Why Blocks first (over Templates / Animations):**
- Blocks are pure composition of components we already ship — **zero new runtime dependencies**, no new
  package, no motion library, no Figma tooling. The work is "assemble + document," not "invent."
- Blocks are the single highest-conversion ecosystem asset for component libraries — they answer the
  visitor's real question ("what can I *build* with this?") faster than the component gallery does.
- Blocks double as **living proof** that the 147 free components compose into beautiful product UI —
  reinforcing the landing page's "show, don't tell" thesis (`landing.md` §4.3).

**This document is a task spec, not an implementation.** Per the request, the goal is documentation good
enough that a later agent (or person) can implement each piece correctly on the first pass. The tasks in
§7 are written as **self-contained prompts** following Anthropic's prompt-engineering guidance (§6).

---

## 2. Review of the Current Landing Page (what exists today)

A walk of `apps/landing/` establishes exactly what Blocks must plug into.

### 2.1 App shape
- **Stack:** Vite + Vue 3 (`<script setup>`) + `vue-router` (`createWebHistory`), mirroring `apps/sandbox`.
  Routes live in `src/router.ts`: `/` → `HomePage`, `/pro` → `ProPage`, catch-all → `/`.
- **Home composition** (`src/pages/HomePage.vue`): `Hero → ShowcaseDashboard → FeatureGrid → ThemingDemo
  → ComponentGallery → EcosystemGrid (#ecosystem) → SocialProof → FreeVsPro → CommunityCTA`, each wrapped
  in `v-reveal` (scroll-reveal directive from `src/composables/useScrollReveal.ts`).
- **Theming:** `data-theme` on `<html>`, `useTheme` composable, FOUC IIFE in `index.html`. Light/dark is
  table-stakes — **every block must be verified in both** (`landing.md` §6.4).
- **Section primitive:** `src/components/Section.vue` provides `eyebrow / title / lede / heading-id`
  plus `surface` and `bordered` flags. Reuse it so Blocks pages read as one family with the home page.
- **Card primitive:** tiles use the `.lp-card` / `.lp-card--hover` classes already in the app stylesheet,
  with `--lp-hairline`, `--lp-brand`, `--lp-shadow-*`, `--reveal-delay` custom properties.

### 2.2 The Ecosystem tile (the thing we're activating)
`EcosystemGrid.vue` maps `ECOSYSTEM` (in `data.ts`) to tiles. The **Blocks** entry today:

```ts
{
  icon: 'Blocks',
  title: 'Blocks',
  blurb: 'Pre-composed sections — heroes, pricing, navbars, stat rows, auth forms — built from core components. Copy, paste, ship.',
  meta: 'Marketing · Application',
  status: 'planned',
}
```

Every tile renders a `<DzBadge>Planned</DzBadge>` and is non-interactive (`status: 'planned'` is the only
value the type allows). **Activating Blocks means:** extend the type to support a shipped/interactive
state, give the Blocks tile a link target, add the route + pages, and author the catalog.

> **Shipped (Task A2, done):** the snippet above is the *original* baseline. The `EcosystemItem` type now
> supports `status: 'planned' | 'available'` + an optional `href`, and the Blocks tile is
> `status: 'available'`, `href: '/blocks'` — it renders as an interactive "Explore" tile. See §0.

### 2.3 Proven composition pattern already in the repo
`ShowcaseDashboard.vue` is, in effect, **the first block** — a full analytics dashboard composed purely
from `@dzup-ui/core` (`DzStatCard`, `DzTable`, `DzCard`, `DzProgress`, `DzSegmented`, `DzInput`,
`DzSwitch`, `DzBadge`, `DzAvatar`). It is the **reference standard** for block quality: token-only styling,
real components, re-themes live, responsive collapse at `900px` / `520px`. Block authors should study it
before writing a single block.

### 2.4 How comparable libraries display Blocks (competitive research)

| Library | Browse model | Per-block view | Copy mechanism | Free/Paid |
|---|---|---|---|---|
| **PrimeVue Blocks** | Category index (Marketing / Application / E-commerce), 450+ blocks | Live preview + collapsible code, light/dark, responsive toggle | Copy code button | Paid |
| **Tailwind Plus** | Three catalogs (Marketing / Application UI / Ecommerce), nested categories | Live preview, **responsive viewport resizer**, HTML/Vue/React tabs | Copy + "open in playground" | Paid |
| **shadcn Blocks** | Flat gallery with category filter | Preview / **Code** tab, full-screen preview, viewport sizes | Copy + CLI `add` | Free |
| **Nuxt UI Pro** | Category index | Live preview + code panel | Copy | Paid |

**Patterns we adopt:**
1. **Category-indexed browse** — group blocks into a handful of top-level categories, each a section of
   cards (mirrors our existing `ComponentGallery` grid).
2. **Preview / Code toggle per block** — a live, interactive preview by default; one click reveals the
   source; one click copies it.
3. **Responsive viewport control** — let the visitor resize the preview (mobile / tablet / desktop) to
   prove blocks reflow. (shadcn / Tailwind Plus pattern.)
4. **Light/dark inheritance** — the preview re-themes with the global toggle; no per-block theme code.
5. **Never gate viewing.** Blocks are **free** (they only use free components). Show everything, copy
   everything. (Decision for §3.5 below — unlike Pro components, Blocks have no paywall in Phase 1.)

---

## 3. Investigation — How "Blocks" Should Be Displayed When Clicked

This section answers the three explicit questions: **how to implement it, how to display it, which blocks
we'll have.** It is the design rationale; §7 turns it into tasks.

### 3.1 Navigation model — a dedicated route, not an inline expand

**Recommendation: a top-level `/blocks` route (index) plus in-page category anchors**, with each block
addressable by hash (`/blocks#hero-split`). Reasons:

- A blocks catalog is large (40–50 blocks). Inlining it on the home page or in a dialog would bloat the
  page and break deep-linking/SEO. Comparable libraries all use a dedicated route.
- It mirrors the existing app: `/pro` is already a standalone route/page. `/blocks` is a sibling.
- It keeps the home-page Ecosystem tile as a **teaser** that routes into the full experience — the same
  "gallery → Storybook" bridge pattern `ComponentGallery` already uses.

**Route layout:**

| Route | Page | Content |
|---|---|---|
| `/blocks` | `BlocksIndexPage.vue` | Hero/intro + category nav + every category section with block cards |
| `/blocks#<category>` | (anchor) | Scrolls to a category (`marketing`, `application`, `auth`, …) |
| `/blocks#<block-id>` | (anchor) | Scrolls to an individual block card |

A separate detail route per block (`/blocks/:id`) is **not recommended for Phase 1** — the index-with-anchors
model is simpler, fully deep-linkable, and matches the page's existing single-scroll ergonomics. Revisit
only if per-block pages are needed for SEO later.

### 3.2 How a single block is displayed — the `BlockPreview` shell

Every block renders inside a shared **`BlockPreview`** wrapper that provides the chrome and interactions:

```
┌─ BlockPreview ──────────────────────────────────────────────┐
│  Title · short description                 [▢ viewport] [⤢]  │  ← header row
│  ┌─ Tabs: ( Preview | Code ) ───────────────────────────┐   │
│  │                                                        │   │
│  │   ‹ live, interactive block rendered here ›            │   │  ← Preview tab
│  │   — re-themes with global toggle                       │   │
│  │   — resizable to mobile / tablet / desktop widths      │   │
│  │                                                        │   │
│  │   ‹ syntax-highlighted source + Copy button ›          │   │  ← Code tab
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Built from our own components (dogfooding):**
- Tabs → `DzTabs` / `DzTabList` / `DzTabTrigger` / `DzTabContent` (Preview ↔ Code).
- Code panel → `DzCodeBlock` for syntax highlighting; **`DzCopyButton`** for "copy source".
- Viewport control → `DzSegmented` (Mobile / Tablet / Desktop) that sets the preview iframe/container
  `max-width`; full-screen toggle → `DzIconButton` + `DzDialog` or `DzSheet`.
- The live preview area: the actual block `.vue` rendered in a bordered, resizable container (reuse the
  "window frame" treatment from `ShowcaseDashboard.vue` for visual consistency).

**Source-of-truth for code display:** each block is a real `.vue` file under
`apps/landing/src/blocks/<category>/<BlockName>.vue`. Its **raw source** is imported as a string (Vite
`?raw` import) and fed to `DzCodeBlock`, so the copied code is exactly what renders — no drift between
preview and snippet.

### 3.3 Block registry (the data model)

A single typed registry drives the index, the category nav, deep-link ids, search/filtering, and the
preview. Proposed shape (extends the existing `data.ts` conventions):

```ts
export interface BlockDef {
  id: string                 // kebab, unique, used as the anchor (#hero-split)
  title: string              // "Split hero with media"
  description: string        // one line, what it is / when to use it
  category: BlockCategory    // 'marketing' | 'application' | 'auth' | 'commerce' | 'content'
  tags: string[]             // ['hero', 'cta'] — for filter/search
  components: string[]       // real Dz* names used (drives the "Built from" chips + validation)
  component: Component       // the live Vue block (defineAsyncComponent)
  source: string             // raw source string (Vite ?raw) shown in the Code tab
  responsive?: { mobile?: boolean }  // notes if a mobile variant differs
}
```

`components: string[]` is important: it lets a CI test assert that **every name maps to a real export of
`@dzup-ui/core`** (no invented components), and powers a "Built from N free components" line per block.

### 3.4 Where the files live

```
apps/landing/src/
  pages/
    BlocksIndexPage.vue        # the /blocks page: intro + category sections
  components/blocks/
    BlockPreview.vue           # the per-block shell (tabs, viewport, copy)
    BlockCard.vue              # index card linking/scrolling to a block
    BlockCategoryNav.vue       # sticky in-page category nav
  blocks/                      # the catalog — one .vue per block, grouped by category
    marketing/HeroCentered.vue
    marketing/HeroSplit.vue
    application/StatRow.vue
    auth/SignInCard.vue
    ...
  blocks/registry.ts           # BlockDef[] — imports each block + its ?raw source
```

### 3.5 Free vs Pro positioning

**Blocks are free in Phase 1.** They are composed entirely from free `@dzup-ui/core` components, so there
is no licensing basis to gate them, and free blocks are a powerful funnel into the library. The landing
spec (§4.6a) notes some ecosystem offerings *may* become paid later (PrimeVue/Tailwind Plus charge for
Blocks) — but that is a **future** decision. For now: **show everything, copy everything, no badge gate.**
Update the Ecosystem tile's `status` from `'planned'` to a shipped/interactive state (§7 Task A2).

> **Pro blocks (added):** the above governs the **free** catalog only. A separate, **gated Pro blocks
> tier** — composed from `@dzup-ui-pro/pro` components — is feasible and specified in **§3.7**
> (feasibility, positioning & gating), cataloged in **§4.6**, and built by **Phase D** (§7). Pro blocks
> **preview live but gate their source/copy behind the Pro license** and carry a **🔒 Pro** badge.

### 3.6 Quality bar (inherited, non-negotiable)

Every block is held to the same gates as the library (`CLAUDE.md` "Quality Gates" + "Quick Rules"):
- **Token-only styling** — only `var(--dz-*)`; **no raw hex, no hardcoded Tailwind color classes**, no
  `<style scoped>` color literals. Layout-only CSS (grid/flex/spacing) in `<style scoped>` is fine, as the
  existing landing components do; **all color/radius/shadow/spacing values come from tokens.**
- **Built from real `@dzup-ui/core` components** — no bespoke re-implementations of things we ship.
- **Accessible (WCAG AA)** — semantic landmarks/headings, keyboard reachable, visible focus (`--dz-ring`),
  AA contrast in both themes, labelled controls.
- **Responsive** — sensible reflow at the app's breakpoints (`900px`, `560px`/`520px` as used today).
- **Light + dark verified.**
- **`prefers-reduced-motion` honored** for any motion.
- **TypeScript-strict, `<script setup lang="ts">`, `.ts` import extensions** (repo convention).

> **Local-env caveat:** `yarn lint` is broken in this repo and ESLint cannot run locally
> (see `MEMORY.md` → "Lint config broken"). Validate blocks with **`vite build`** (landing) and
> **`yarn typecheck`** + Vitest, not ESLint. Bake this into every task's acceptance criteria.

### 3.7 Pro Blocks — feasibility, positioning & gating

**Question answered:** *Can we author blocks that compose the **Pro** components in
`dzup-ui-pro/apps/storybook` (package `@dzup-ui-pro/pro`), the same way the free catalog composes
`@dzup-ui/core`?* **Verdict: yes — it is feasible and worthwhile** — subject to three real constraints
that the tasks below bake in. Investigation basis: `dzup-ui-pro/packages/pro/src/components/**` and the
eight family `index.ts` barrels (the verified inventory is **Appendix C**); `dzup-ui-pro/CLAUDE.md`; the
landing app's `package.json`, `ProPage.vue`, `config.ts`, and `data.ts`.

**Why it works.** Pro components are real, buildable Vue SFCs exported from `@dzup-ui-pro/pro`, built to
the *same* architecture as core — Contract Spec v1, `tailwind-variants`, **token-only styling**, WCAG AA,
light/dark via the same `--dz-*` tokens (`dzup-ui-pro/CLAUDE.md`). They peer-depend on `@dzup-ui/core` +
`@dzup-ui/tokens`, so a Pro block can freely mix Pro components with free core chrome and everything
re-themes from one toggle. The display infrastructure built in Phase A (registry, `BlockPreview`,
viewport/copy, index page) is **tier-agnostic** and is reused unchanged — Pro blocks are *more data in the
same machine*, not a second machine.

**Constraint 1 — the dependency boundary (the only structural change).** The landing app
(`@dzup-ui/landing`) today depends on **only** `@dzup-ui/core` + `@dzup-ui/tokens`; `@dzup-ui-pro/pro`
lives in the **sibling repo** `dzup-ui-pro`. To render Pro blocks *live* in `/blocks`, the landing app must
take a dependency on `@dzup-ui-pro/pro` (sibling-repo wiring already exists in the other direction — Pro
consumes contracts via `portal:../dzup-ui/packages/contracts`, per `dzup-ui-pro/CLAUDE.md`). This is the
one new architectural decision; Task D1 owns it.

**Constraint 2 — Pro is pre-launch and paid, so Pro blocks are GATED.** `/pro` is a "coming soon" teaser
and `config.ts` ships `PRO_LIVE = false`. Free blocks are ungated by design (§3.5: *show everything, copy
everything*). **Pro blocks are the opposite of that, by design:** they **preview live** (the marketing
hook — "look what you can build") but **gate the Code tab and Copy behind the Pro license** — exactly how
PrimeVue Blocks, Tailwind Plus, and Nuxt UI Pro treat their paid blocks. Gating the source also avoids
leaking Pro SFCs through the `?raw` import. Until `PRO_LIVE` flips, Pro blocks render preview + a "Pro"
lock state over the code (or are hidden behind a feature flag — see §8 decision 9).

**Constraint 3 — same quality bar, plus Pro's own gates.** Every Pro block obeys the §3.6 bar **and** the
Pro repo's extra gates (`yarn validate:oss-surface`, contract/a11y/SSR suites). Validate Pro blocks with
the landing app's `yarn typecheck` + `vite build`; ESLint stays out of the loop (broken locally, §3.6).

**Hosting decision (recommended).** **Option A — one unified `/blocks` catalog** that contains both tiers:
free blocks ungated, Pro blocks badged **🔒 Pro** and code-gated. One catalog, one UX, the Pro badge is
the funnel into `/pro`. *Alternative* **Option B — a separate Pro showcase** hosted inside the Pro repo
(`dzup-ui-pro/apps/sandbox` or a Pro Storybook) and linked from the landing `/pro` page; cleaner
dependency boundary but a split browsing experience. This doc specifies **Option A**; revisit per §8.

**Registry & UI deltas for the Pro tier** (Task D1/D2 implement; everything else is reused):

```ts
export interface BlockDef {
  // …all existing fields from §3.3…
  tier?: 'free' | 'pro'        // default 'free'; 'pro' blocks badge + gate code/copy
  proComponents?: string[]     // real @dzup-ui-pro/pro export names used (validated by CI, Task D11)
}
```

- `category` gains the Pro categories from §4.6 (e.g. `'pro-analytics' | 'pro-data' | …`) **or** a parallel
  `BlockDef.tier` flag keeps the existing categories — Task D1 picks one; the doc assumes dedicated Pro
  category ids for a clean index grouping.
- `BlockCard` / `BlockPreview` render a `<DzBadge tone="primary">🔒 Pro</DzBadge>` for `tier: 'pro'`, and
  the Code tab shows a locked/upgrade affordance instead of source when `PRO_LIVE` is false or the viewer
  is unlicensed.
- The "Built from" chips list **both** free (`components[]`) and Pro (`proComponents[]`) names, the Pro
  ones visually marked.

---

## 4. The Block Catalog (which blocks we will have)

A deliberately generous, **48-block** catalog across five categories, every block mapped to **real**
`@dzup-ui/core` components from the inventory. The **★ MVP** column marks the ~16 blocks to ship first
(a complete, demo-able set spanning marketing + application + auth); the rest are fast-follows. Component
names below are verified against `packages/core/src/components/`.

> **Shipped delta — "Forms & Inputs" focus (2026-06-24).** The registry now has a **sixth** category,
> `forms` ("Forms & Inputs"), added to exhaustively exercise the **Inputs** (8/8) and **Forms** (31/31)
> component families. It ships the planned `contact-form`, `forgot-password`, `otp-verify`, plus
> `billing-form` (shipped id `payment-form`) and `filters-sidebar` (shipped id `filter-panel`); the
> planned `newsletter` (§4.1) and `profile-form` (§4.2) also shipped here. It adds **seven blocks not in
> the original catalog**, each retiring otherwise-uncovered controls: `booking-form` (DatePicker /
> TimePicker / NumberInput), `record-form` (Combobox / MultiSelect / Listbox), `category-picker`
> (TreeSelect / Cascader / DateRangePicker), `appearance-editor` (ColorPicker / Knob), `invoice-builder`
> (FieldArray / Inplace), `access-transfer` (Transfer / PersonaSelector / Mention), and `float-label-form`
> (FloatLabel). The `Done` checkboxes below are ticked for these; ids that differ from the plan are noted
> inline.

> **Shipped delta — "Data display" focus (2026-06-24).** The registry now has a **seventh** category,
> `data` ("Data display"), added to showcase the **Data** component family. It ships seven self-contained
> blocks, each composed primarily from Data-family components (with free chrome): `data-grid` (DzDataGrid —
> sortable / multi-select / paginated, with a `#cell` slot for avatars + status badges), `activity-timeline`
> (DzTimeline / DzTimelineItem), `detail-descriptions` (DzDescriptions / DzDescriptionsItem),
> `file-tree` (DzTree with per-node icons + selection), `collection-gallery` (DzDataView — list/grid toggle,
> sort, paginate), `leaderboard` (DzList / DzListItem + DzAnimatedNumber count-up), and `release-countdown`
> (DzCountdown + DzAnimatedNumber). Verified with the registry guard (Vitest), the landing `vue-tsc`
> typecheck (0 errors in the new files), and `vite build` (success); ESLint stays out of the loop (§3.6).

> **Shipped delta — "Layout" focus (2026-06-24).** The registry now has an eighth category, `layout`
> ("Layout"), added to exercise the **Layout** component family end-to-end. It ships seven self-contained
> blocks, each centered on a different Layout primitive (with free chrome): `bento-grid` (DzGrid spanning
> tiles + DzPanel + DzAspectRatio), `resizable-workspace` (DzResizable / DzResizablePanel /
> DzResizableHandle + DzScrollArea + DzToolbar — a draggable IDE shell), `masonry-gallery` (DzMasonry +
> DzAspectRatio), `sticky-aside` (DzAffix pinned table-of-contents + DzContainer + DzFlex + DzScrollArea),
> `toolbar-canvas` (DzToolbar start/center/end + DzFlex rail + DzSpacer + DzScrollArea + DzPanel inspector),
> `page-scaffold` (a whole page from DzContainer / DzGrid / DzFlex / DzStack / DzSpacer / DzDivider), and
> `collapsible-sections` (collapsible DzPanels + standalone DzCollapse). Across the set every Layout export
> is used: Grid, Flex, Stack, Container, Spacer, Divider, Panel, Toolbar, Resizable, ScrollArea, Masonry,
> AspectRatio, Affix and Collapse. Verified with the registry guard (Vitest, 244 passing), the landing
> `vue-tsc` typecheck (0 errors in the new files), and `vite build` (success); ESLint stays out of the loop
> (§3.6).

> **Shipped delta — "Overlays" focus (2026-06-25).** The registry now has a ninth category, `overlays`
> ("Overlays"), added to exercise the **Overlays** component family end-to-end. It ships nine self-contained
> blocks, each centered on a different overlay primitive (with free chrome): `command-menu` (DzCommandPalette
> — grouped, searchable, ⌘K), `account-menu` (DzDropdownMenu with header, icon/shortcut items, separators),
> `context-menu-board` (DzContextMenu right-click actions with a disabled item + destructive delete),
> `info-popovers` (DzPopover — a profile hover card + a non-modal filter panel with DzSwitch rows),
> `tooltip-toolbar` (per-side DzTooltips with DzKbd shortcuts over a DzIconButton toolbar), `create-dialog`
> (focus-trapped DzDialog modal form with DzDialogClose), `confirm-actions` (modal DzConfirmDialog incl. an
> async/loading confirm + inline DzPopconfirm row deletes), `detail-sheet` (a slide-out DzSheet record
> panel), and `product-tour` (DzTour spotlight onboarding over a mini dashboard). Across the set every
> Overlays export is exercised: CommandPalette, DropdownMenu, ContextMenu, Popover, Tooltip, Dialog,
> ConfirmDialog, Popconfirm, Sheet and Tour. Verified with the registry guard (Vitest, 280 passing), the
> landing `vue-tsc` typecheck (0 errors in the new files), and `vite build` (success); ESLint stays out of
> the loop (§3.6).

> **Shipped delta — "Media" focus (2026-06-25).** The registry now has a tenth category, `media` ("Media"),
> added to exercise the **Media** component family end-to-end. It ships six self-contained blocks, each
> centered on a different Media primitive (with free chrome): `media-gallery` (an asymmetric DzImage /
> DzAspectRatio grid opening a focus-trapped DzLightbox), `media-carousel` (a looping, autoplaying
> DzCarousel of DzImage slides with DzCarouselPrevious / DzCarouselNext / DzCarouselDots and gradient
> captions), `media-comparison` (a draggable, keyboard-operable DzImageComparison with before/after label
> chips, wired to `v-model:position`), `media-team` (a stacked DzAvatarGroup "+N" overflow over a DzAvatar
> roster with presence dots), `media-qr` (a DzQRCode handoff card with a centered `#logo` brand mark,
> error-level H, and an expire/refresh status flow), and `media-watermark` (a confidential DzImage draped in
> a tiled, rotated DzWatermark). Across the set every Media export is exercised: Image, AspectRatio (Layout),
> Lightbox, Carousel (+ Slide / Previous / Next / Dots), ImageComparison, Avatar, AvatarGroup, QRCode and
> Watermark. Verified with the registry guard (Vitest, 304 passing), the landing `vue-tsc` typecheck (0
> errors in the new files), and `vite build` (success); ESLint stays out of the loop (§3.6).

### 4.1 Marketing (14 blocks)

| Done | ★ | id | Block | Built from (real Dz* components) |
|---|---|---|---|---|
| [ ] | ★ | `nav-bar` | **Top navigation bar** — logo, links, search, theme toggle, CTA; mobile drawer | `DzButton`, `DzMenu`/`DzMegaMenu`, `DzSearchInput`, `DzColorModeToggle`, `DzSheet`, `DzIconButton` |
| [x] | ★ | `hero-centered` | **Centered hero** — eyebrow chip, H1, subhead, two CTAs | `DzBadge`, `DzHeading`, `DzText`, `DzButton` |
| [ ] | ★ | `hero-split` | **Split hero with media** — copy left, framed product image right | `DzHeading`, `DzText`, `DzButton`, `DzBadge`, `DzImage`, `DzAspectRatio` |
| [ ] |   | `logo-cloud` | **Logo cloud** — "trusted by" strip | `DzText`, `DzImage`/`DzIcon` |
| [ ] | ★ | `feature-grid` | **Feature grid** — 6 icon+title+blurb cards | `DzCard`, `DzIcon`, `DzHeading`, `DzText` |
| [ ] |   | `feature-alt` | **Alternating feature rows** — media+copy, mirrored | `DzImage`, `DzText`, `DzButton`, `DzBadge` |
| [ ] | ★ | `stats-band` | **Stats band** — 4 animated metrics | `DzStatCard`, `DzAnimatedNumber` |
| [ ] | ★ | `pricing-3` | **Three-tier pricing** — Free/Pro/Enterprise, "popular" highlight | `DzCard`, `DzBadge`, `DzButton`, `DzDivider`, `DzIcon` |
| [ ] |   | `pricing-table` | **Pricing comparison table** — feature matrix | `DzTable`, `DzBadge`, `DzIcon`, `DzButton` |
| [ ] | ★ | `testimonials` | **Testimonials grid** — quote cards with avatar + rating | `DzCard`, `DzAvatar`, `DzText`, `DzRating` |
| [ ] |   | `testimonial-quote` | **Single pull-quote** — big blockquote | `DzBlockquote`, `DzAvatar`, `DzText` |
| [ ] | ★ | `faq` | **FAQ accordion** | `DzAccordion`, `DzAccordionItem`, `DzAccordionTrigger`, `DzAccordionContent` |
| [ ] | ★ | `cta-band` | **CTA band** — headline + buttons on gradient | `DzHeading`, `DzText`, `DzButton` |
| [x] |   | `newsletter` | **Newsletter signup** — inline email capture (shipped id `newsletter-form`, `forms`) | `DzInput`, `DzButton`, `DzText` |
| [ ] | ★ | `footer` | **Multi-column footer** — link columns, social, theme toggle | `DzText`, `DzDivider`, `DzIconButton`, `DzColorModeToggle` |
| [ ] |   | `team-grid` | **Team grid** — member cards with socials | `DzCard`, `DzAvatar`, `DzText`, `DzIconButton` |
| [ ] |   | `banner` | **Announcement banner** — dismissible top bar | `DzAlert`/`DzBadge`, `DzIconButton` |

### 4.2 Application / Dashboard (13 blocks)

| Done | ★ | id | Block | Built from (real Dz* components) |
|---|---|---|---|---|
| [ ] | ★ | `app-shell` | **App shell** — sidebar + topbar + content slot | `DzAppShell`, `DzSidebar`, `DzSidebarItem`, `DzSidebarSection`, `DzBreadcrumb`, `DzAvatar`, `DzDropdownMenu` |
| [ ] | ★ | `page-header` | **Page header** — breadcrumb, title, status, actions | `DzBreadcrumb`, `DzHeading`, `DzBadge`, `DzButton` |
| [ ] | ★ | `stat-row` | **Stat card row** — 4 KPI cards with trend | `DzStatCard` |
| [ ] |   | `dashboard-grid` | **Dashboard widget grid** — mixed stat/chart/list cards | `DzCard`, `DzStatCard`, `DzProgress`, `DzMeterGroup` |
| [ ] | ★ | `table-card` | **Data table card** — toolbar + table + pagination | `DzCard`, `DzSearchInput`, `DzSegmented`, `DzTable`, `DzBadge`, `DzAvatar`, `DzPagination` |
| [ ] |   | `data-grid-filtered` | **Filterable data grid** — column grid with filter bar | `DzDataGrid`, `DzDataGridHeader`, `DzDataGridBody`, `DzDataGridPagination`, `DzMultiSelect`, `DzDatePicker` |
| [ ] |   | `filter-toolbar` | **Filter toolbar** — search + selects + view toggle | `DzSearchInput`, `DzSelect`, `DzMultiSelect`, `DzSegmented`, `DzButton` |
| [ ] | ★ | `empty-state` | **Empty state** — illustration, copy, primary action | `DzEmpty`, `DzButton` |
| [ ] |   | `activity-feed` | **Activity feed** — timeline of events | `DzTimeline`, `DzTimelineItem`, `DzAvatar`, `DzText`, `DzBadge` |
| [ ] |   | `notifications-panel` | **Notifications panel** — tabbed list with unread | `DzTabs`, `DzNotification`, `DzBadge`, `DzAvatar`, `DzButton` |
| [ ] | ★ | `settings-layout` | **Settings layout** — section nav + form panels | `DzTabs`/`DzSidebar`, `DzFormField`, `DzSwitch`, `DzSelect`, `DzButton`, `DzDivider` |
| [x] |   | `profile-form` | **Profile settings form** — avatar upload + fields (shipped in `forms`) | `DzFormField`, `DzInput`, `DzTextarea`, `DzFileUpload`, `DzButton` |
| [ ] |   | `kanban-column` | **Kanban column (static)** — board column of task cards | `DzCard`, `DzBadge`, `DzAvatar`, `DzTag` |
| [ ] |   | `command-launcher` | **Command palette launcher** — ⌘K trigger + palette | `DzCommandPalette`, `DzKbd`, `DzButton` |
| [ ] |   | `descriptions-panel` | **Detail / descriptions panel** — key/value record view | `DzDescriptions`, `DzDescriptionsItem`, `DzBadge` |

### 4.3 Auth & Forms (9 blocks)

| Done | ★ | id | Block | Built from (real Dz* components) |
|---|---|---|---|---|
| [ ] | ★ | `sign-in` | **Sign-in card** — email/password, remember, social, links | `DzCard`, `DzFormField`, `DzInput`, `DzPasswordInput`, `DzCheckbox`, `DzButton`, `DzDivider` |
| [ ] | ★ | `sign-up` | **Sign-up card** — name/email/password + strength meter | `DzFormField`, `DzInput`, `DzPasswordInput`, `DzProgress`, `DzCheckbox`, `DzButton` |
| [ ] | ★ | `auth-split` | **Two-column auth** — form left, brand panel right | layout + `DzImage`, `DzHeading`, `DzText`, the `sign-in` form |
| [x] |   | `forgot-password` | **Forgot password** — email + confirmation state | `DzFormField`, `DzInput`, `DzFormMessage`, `DzButton`, `DzCard` |
| [x] |   | `otp-verify` | **OTP verification** — code entry + resend countdown | `DzOtpInput`, `DzButton`, `DzText` |
| [ ] | ★ | `wizard` | **Multi-step form wizard** — stepper + step bodies + nav | `DzStepper`, `DzStepperItem`, `DzFormField`, `DzInput`, `DzButton` |
| [x] |   | `contact-form` | **Contact form** — name/email/message + validation (shipped in `forms`) | `DzFormField`, `DzInput`, `DzTextarea`, `DzSelect`, `DzButton` |
| [x] |   | `billing-form` | **Billing / payment form** — card fields with masks (shipped id `payment-form`, `forms`) | `DzFormField`, `DzInput`, `DzInputMask`, `DzInputGroup`, `DzSelect`, `DzButton` |
| [x] |   | `filters-sidebar` | **Search filters sidebar** — facets for a results page (shipped id `filter-panel`, `forms`) | `DzSearchInput`, `DzCheckboxGroup`, `DzRangeSlider`, `DzRadioGroup`, `DzSwitch`, `DzButton` |

### 4.4 Commerce (6 blocks — fast-follow)

| Done | id | Block | Built from (real Dz* components) |
|---|---|---|---|
| [ ] | `product-grid` | **Product card grid** — image, price, rating, add | `DzImageCard`, `DzBadge`, `DzRating`, `DzButton` |
| [ ] | `product-detail` | **Product detail** — gallery, price, options, tabs | `DzCarousel`, `DzCarouselSlide`, `DzRating`, `DzButton`, `DzTabs`, `DzBadge` |
| [ ] | `cart-summary` | **Cart summary** — line items, qty, totals | `DzList`, `DzListItem`, `DzNumberInput`, `DzButton`, `DzDivider` |
| [ ] | `checkout-summary` | **Checkout order summary** — review + promo | `DzDescriptions`, `DzInput`, `DzButton`, `DzDivider` |
| [ ] | `category-header` | **Category header** — title, sort, view toggle | `DzHeading`, `DzSelect`, `DzSegmented`, `DzBreadcrumb` |
| [ ] | `order-status` | **Order status tracker** — step timeline | `DzStepper`/`DzTimeline`, `DzBadge`, `DzText` |

### 4.5 Content (6 blocks — fast-follow)

| Done | id | Block | Built from (real Dz* components) |
|---|---|---|---|
| [ ] | `blog-list` | **Blog post list** — image cards with tags/author | `DzImageCard`, `DzBadge`, `DzAvatar`, `DzText` |
| [ ] | `article-header` | **Article header** — title, meta, author, tags | `DzHeading`, `DzText`, `DzAvatar`, `DzTag`, `DzRelativeTime` |
| [ ] | `prose` | **Prose / rich content** — typographic article body | `DzHeading`, `DzText`, `DzBlockquote`, `DzCode`, `DzDivider` |
| [ ] | `code-showcase` | **Code showcase** — snippet with copy | `DzCodeBlock`, `DzCopyButton`, `DzTabs` |
| [ ] | `toc-aside` | **Table-of-contents aside** — sticky anchor nav | `DzAnchor`, `DzText` |
| [ ] | `faq-2col` | **Two-column FAQ** — grouped questions | `DzAccordion`, `DzHeading`, `DzText` |

> **Catalog total:** 48 blocks (14 marketing + 15 application + 9 auth/forms + 6 commerce + 6 content — the
> marketing/application rows include a couple of bonus entries beyond the ★ MVP). **MVP = the 16 ★ blocks.**

---

## 4.6 The Pro Block Catalog 🔒

> **🔒 Pro tier.** Every block in this section is a **Pro block** — it composes one or more
> `@dzup-ui-pro/pro` components (verified in **Appendix C**), optionally with free `@dzup-ui/core` chrome.
> All carry the **🔒 Pro** badge, **preview live but gate their source/copy** behind the Pro license
> (§3.7), and are built in **Phase D** (§7). The **★** column marks the **Pro MVP** to ship first with the
> Pro launch. Component names are verified against `dzup-ui-pro/packages/pro/src/components/` and its
> family barrels. Names in *italics with no prefix* (e.g. *DzCard*) are free `@dzup-ui/core` chrome; all
> `Dz*` names without italics are **Pro** components.

A **36-block** Pro catalog across **seven Pro categories** mapped to the eight Pro families.

### 4.6.1 Analytics & BI — `pro-analytics` (6 blocks)

| Done | ★ | 🔒 | id | Block | Built from (Pro + *free chrome*) |
|---|---|---|---|---|---|
| [ ] | ★ | 🔒 | `analytics-overview` | **Analytics overview** — KPI scorecards + chart + sparklines | `DzScorecard`, `DzChart`, `DzSparkline`, `DzGauge`, *DzCard*, *DzGrid* |
| [ ] | ★ | 🔒 | `kpi-scorecards` | **KPI scorecard row** — metrics with delta + status band | `DzScorecard`, `DzSparkline`, *DzGrid* |
| [ ] | ★ | 🔒 | `chart-card` | **Chart card** — chart with data-table toggle | `DzChart`, `DzChartDataTable`, *DzCard*, *DzSegmented* |
| [ ] |   | 🔒 | `funnel-conversion` | **Conversion funnel** — staged funnel with rates | `DzFunnelChart`, *DzCard*, *DzText* |
| [ ] |   | 🔒 | `geo-distribution` | **Geographic distribution** — choropleth + markers | `DzGeoMap`, *DzCard*, *DzBadge* |
| [ ] |   | 🔒 | `activity-heatmap` | **Activity heatmap** — calendar-style intensity grid | `DzHeatMap`, *DzCard* |

### 4.6.2 Data Workspaces — `pro-data` (6 blocks)

| Done | ★ | 🔒 | id | Block | Built from (Pro + *free chrome*) |
|---|---|---|---|---|---|
| [ ] | ★ | 🔒 | `data-grid-pro` | **Enterprise data grid** — grouping, toolbar, export | `DzDataGridPro`, *DzCard*, *DzSearchInput*, *DzButton* |
| [ ] | ★ | 🔒 | `query-builder-panel` | **Visual query builder** — rules + results table | `DzQueryBuilder`, `DzVirtualTable`, *DzButton* |
| [ ] |   | 🔒 | `pivot-analysis` | **Pivot analysis** — drag-zone pivot table | `DzPivotTable`, *DzCard* |
| [ ] |   | 🔒 | `filter-builder-bar` | **Advanced filter bar** — filter builder + quick filters | `DzFilterBuilder`, `DzQuickFilter`, *DzButton* |
| [ ] |   | 🔒 | `data-lineage` | **Data lineage explorer** — upstream/downstream graph | `DzDataLineage`, *DzCard* |
| [ ] |   | 🔒 | `virtual-table-card` | **Virtualized table card** — 100k-row scroller | `DzVirtualTable`, *DzCard*, *DzSearchInput* |

### 4.6.3 Planning & Scheduling — `pro-planning` (6 blocks)

| Done | ★ | 🔒 | id | Block | Built from (Pro + *free chrome*) |
|---|---|---|---|---|---|
| [ ] | ★ | 🔒 | `kanban-board` | **Kanban board** — columns, cards, drag handles | `DzKanban`, `DzKanbanColumn`, `DzKanbanCard`, *DzAvatar*, *DzBadge* |
| [ ] | ★ | 🔒 | `gantt-timeline` | **Project Gantt** — task bars, dependencies, view modes | `DzGantt`, `DzGanttTaskRow`, *DzButton*, *DzSegmented* |
| [ ] | ★ | 🔒 | `calendar-scheduler` | **Calendar** — month/week/day views with events | `DzCalendar`, `DzCalendarMonthView`, `DzCalendarWeekView`, *DzButton*, *DzSegmented* |
| [ ] |   | 🔒 | `resource-scheduler` | **Resource scheduler** — timeline by resource | `DzScheduler`, *DzAvatar* |
| [ ] |   | 🔒 | `cron-schedule-editor` | **Cron editor** — schedule builder + human summary | `DzCronEditor`, *DzFormField*, *DzText* |
| [ ] |   | 🔒 | `mind-map-board` | **Mind map** — radial node canvas | `DzMindMap`, *DzCard* |

### 4.6.4 Communication & AI — `pro-comms` (5 blocks)

| Done | ★ | 🔒 | id | Block | Built from (Pro + *free chrome*) |
|---|---|---|---|---|---|
| [ ] | ★ | 🔒 | `ai-assistant-panel` | **AI assistant** — chat thread, tool calls, markdown | `DzAiAssistant`, `DzToolCallCard`, `DzAiMarkdown`, `DzAiCodeBlock` |
| [ ] | ★ | 🔒 | `chat-workspace` | **Team chat** — message list, composer, reactions | `DzChat`, `DzChatMessage`, `DzReactionPicker`, *DzAvatar* |
| [ ] | ★ | 🔒 | `notification-center` | **Notification center** — grouped, unread, actions | `DzNotificationCenter`, *DzBadge*, *DzTabs* |
| [ ] |   | 🔒 | `comments-thread` | **Comments thread** — nested replies + reactions | `DzComments`, `DzCommentItem`, `DzReactionPicker`, *DzAvatar* |
| [ ] |   | 🔒 | `chat-message-stream` | **Message stream** — standalone message rows | `DzChatMessage`, `DzReactionPicker`, *DzAvatar* |

### 4.6.5 Editors & Documents — `pro-editors` (7 blocks)

| Done | ★ | 🔒 | id | Block | Built from (Pro + *free chrome*) |
|---|---|---|---|---|---|
| [ ] | ★ | 🔒 | `code-editor-pane` | **Code editor** — language + theme, toolbar | `DzCodeEditor`, *DzSegmented*, *DzButton* |
| [ ] | ★ | 🔒 | `rich-text-editor` | **Rich text editor** — formatting toolbar | `DzRichTextEditor`, *DzCard* |
| [ ] |   | 🔒 | `markdown-editor-split` | **Markdown editor** — split source/preview | `DzMarkdownEditor` |
| [ ] |   | 🔒 | `spreadsheet-grid` | **Spreadsheet** — editable cells, formulas | `DzSpreadsheet`, *DzToolbar* |
| [ ] |   | 🔒 | `diff-review` | **Diff review** — side-by-side change review | `DzDiffViewer`, *DzButton* |
| [ ] |   | 🔒 | `notebook-doc` | **Notebook** — code/markdown cells with outputs | `DzNotebook`, `DzNotebookCell` |
| [ ] |   | 🔒 | `json-editor-panel` | **JSON editor** — tree view + validation | `DzJsonEditor`, *DzCard* |

### 4.6.6 Builders & Workflow — `pro-builders` (4 blocks)

| Done | ★ | 🔒 | id | Block | Built from (Pro + *free chrome*) |
|---|---|---|---|---|---|
| [ ] | ★ | 🔒 | `form-builder-studio` | **Form builder studio** — palette, canvas, live preview | `DzFormBuilder`, `DzFormBuilderField`, `DzFormBuilderSection`, `DzSchemaForm` |
| [ ] | ★ | 🔒 | `dashboard-builder-studio` | **Dashboard builder** — widget palette + drag grid | `DzDashboardBuilder`, `DzDashboardWidget` |
| [ ] | ★ | 🔒 | `workflow-designer-canvas` | **Workflow designer** — node/edge canvas + toolbar | `DzWorkflowDesigner`, `DzWorkflowNode`, `DzWorkflowEdge`, `DzWorkflowToolbar` |
| [ ] |   | 🔒 | `report-builder-studio` | **Report builder** — banded report designer | `DzReportBuilder`, `DzReportBand`, `DzReportElement` |

### 4.6.7 Enterprise Shell & Governance — `pro-enterprise` (5 blocks)

| Done | ★ | 🔒 | id | Block | Built from (Pro + *free chrome*) |
|---|---|---|---|---|---|
| [ ] | ★ | 🔒 | `workspace-shell` | **Workspace shell** — sidebar + topbar + ribbon + content | `DzWorkspaceShell`, `DzRibbon`, `DzNotificationCenter`, *DzAvatar*, *DzBreadcrumb* |
| [ ] | ★ | 🔒 | `file-manager` | **File manager** — tree + grid/list + preview | `DzFileManager` |
| [ ] |   | 🔒 | `audit-log-viewer` | **Audit log** — severity-tagged activity timeline | `DzAuditLog`, *DzBadge*, *DzSearchInput* |
| [ ] |   | 🔒 | `approval-flow-panel` | **Approval flow** — multi-step approval tracker | `DzApprovalFlow`, *DzBadge*, *DzAvatar* |
| [ ] |   | 🔒 | `command-ribbon` | **Command ribbon** — Office-style tabbed toolbar | `DzRibbon` |

> **Pro catalog total:** 36 blocks (6 analytics + 6 data + 6 planning + 5 comms + 7 editors + 4 builders +
> 5 enterprise). **Pro MVP = the 16 ★ blocks** — one or two demo-able blocks per Pro category, spanning all
> eight Pro families. Combined free + Pro catalog: **84 blocks**.

---

## 5. Phasing

| Phase | Deliverable | Tasks | Status |
|---|---|---|---|
| **P0 — this doc** | Investigation + task spec approved | — | ✅ Done |
| **P1 — Display infrastructure** | `/blocks` route, registry, `BlockPreview` (tabs/viewport/copy), index page, Ecosystem tile activated, nav + SEO | A1–A7 | ✅ Done |
| **P2 — MVP catalog** | The 16 ★ blocks authored, registered, verified light/dark + responsive | B1–B3 (★ subsets) | 🚧 In progress — 1/16 (`hero-centered`) |
| **P3 — Full catalog** | Remaining marketing/application/auth blocks | B1–B3 (remainder) | ⬜ Not started |
| **P4 — Commerce + Content** | Categories 4.4 + 4.5 | B4–B5 | ⬜ Not started |
| **P5 — Quality + polish** | a11y/responsive/reduced-motion audit, registry CI test, build validation, changelog | C1–C3 | ✅ Done (C1–C3) |
| **P6 — Pro blocks** 🔒 | Pro dependency + registry tier, gated `BlockPreview`, Pro catalog (§4.6) authored + badged, Pro CI guard | D1–D11 | ⬜ Not started |

> **P6 sequencing.** Phase D depends on Phase A infrastructure (registry, `BlockPreview`, index) being in
> place — it *extends*, never forks it. Within P6, do **D1 → D2 → D3** before any authoring (D4–D10), and
> author each category's **★ Pro MVP** first. Phase D can land independently of the free catalog's P3–P5,
> and its public visibility is feature-flagged until the Pro launch (`PRO_LIVE`, §3.7 / §8 decision 9).

---

## 6. How These Tasks Are Written (Anthropic prompt-engineering conventions)

The tasks in §7 are authored as **prompts**, applying Anthropic's prompt-engineering guidance
(docs.anthropic.com → *Build with Claude → Prompt engineering*). Each task uses these techniques so a
later agent can execute it with minimal ambiguity:

1. **Be clear and direct** — each task states the exact goal, the files to touch, and the definition of done.
2. **Give a role / context** — a `<context>` block tells the agent who it is and why the work matters.
3. **Use XML tags to structure** — `<context>`, `<task>`, `<steps>`, `<constraints>`, `<example>`,
   `<acceptance_criteria>`, `<output>` separate instruction from data and keep parsing unambiguous.
4. **Provide examples (multishot)** — concrete reference files (`ShowcaseDashboard.vue`) and, where useful,
   a skeleton, anchor the expected shape and quality.
5. **Let the model think** — steps are explicit and ordered; tasks ask the agent to plan/inventory before
   writing code.
6. **Specify the output format** — every task ends with an exact deliverable + how it will be verified.
7. **Constrain to prevent drift** — the repo's hard rules (token-only, real components, no ESLint locally)
   are restated in every code task so they can't be missed.

**How to use a task:** copy its body (the `<context>…</output>` block) as the prompt for an implementation
agent. Keep tasks small enough to verify independently; do them in dependency order (A before B before C).

---

## 7. Tasks

Checkboxes track status. **Dependency order: A → B → C.** Each task is a standalone prompt.

### Phase A — Display infrastructure

#### [x] Task A1 — Define the Block registry data model

```
<context>
You are a Vue 3 + TypeScript engineer on the dzup-ui landing app (apps/landing). The app announces a
"Blocks" ecosystem offering that is not yet built. Before any block or page exists, the catalog needs a
single typed registry that will drive the index page, category nav, deep-link anchors, the live preview,
and a CI completeness test. Read docs/blocks.md §3.3 and §4 first; study apps/landing/src/data.ts and
apps/landing/src/config.ts for the established data-module conventions.
</context>

<task>
Create the Block registry types and a registry module, with NO block content yet (an empty but correctly
typed array plus the category metadata). This is the schema other tasks fill in.
</task>

<steps>
1. Add a new file apps/landing/src/blocks/registry.ts.
2. Define and export: type BlockCategory = 'marketing' | 'application' | 'auth' | 'commerce' | 'content';
   interface BlockDef (id, title, description, category, tags[], components[], component, source,
   responsive?) exactly per docs/blocks.md §3.3; and an ordered CATEGORIES array of
   { id: BlockCategory, label, blurb }.
3. Export const BLOCKS: BlockDef[] = [] (filled by later tasks) and a helper
   blocksByCategory(category): BlockDef[].
4. Add a typed env declaration for Vite "?raw" string imports in apps/landing/src/env.d.ts if not present.
</steps>

<constraints>
- TypeScript strict; `<script setup>` not relevant here (plain .ts module).
- Use `.ts` extensions in relative imports (repo convention).
- `component` field typed as Vue's `Component`; load blocks lazily with defineAsyncComponent in later tasks.
- Do not invent component names; `components: string[]` holds real Dz* export names only.
</constraints>

<acceptance_criteria>
- `yarn typecheck` passes (0 errors).
- registry.ts exports BlockCategory, BlockDef, CATEGORIES, BLOCKS, blocksByCategory.
- No runtime block imports yet; the module is importable with an empty BLOCKS array.
</acceptance_criteria>

<output>
The new file apps/landing/src/blocks/registry.ts (+ any env.d.ts edit), and a one-paragraph note in your
reply summarizing the exported surface.
</output>
```

#### [x] Task A2 — Activate the Ecosystem "Blocks" tile + add the route

```
<context>
You are working in apps/landing. The Ecosystem grid (src/components/EcosystemGrid.vue, data src/data.ts)
renders six "Planned" tiles; "Blocks" must become the first interactive one, routing to a new /blocks page.
Read docs/blocks.md §2.2, §3.1, §3.5. The router is src/router.ts; /pro is the existing precedent for a
standalone page.
</context>

<task>
Make the "Blocks" ecosystem tile a working link to a new /blocks route, without disturbing the other five
"Planned" tiles.
</task>

<steps>
1. In src/data.ts, widen EcosystemItem.status to 'planned' | 'available' and add an optional `href?: string`.
   Set the Blocks item to status 'available', href '/blocks'. Leave the others as 'planned'.
2. In src/components/EcosystemGrid.vue, render 'available' tiles as router-links (whole-tile clickable, with
   a visible focus ring on --dz-ring) showing an "Explore" affordance instead of the "Planned" DzBadge;
   keep 'planned' tiles exactly as they are today (non-interactive, "Planned" badge).
3. Create a placeholder page src/pages/BlocksIndexPage.vue (a Section with eyebrow "Ecosystem", title
   "Blocks", lede from the spec) — real content lands in Task A3.
4. Register `{ path: '/blocks', name: 'blocks', component: BlocksIndexPage }` in src/router.ts.
5. Add a "Blocks" link to the top nav (src/components/TopNav.vue) pointing at /blocks.
</steps>

<constraints>
- Token-only styling; no raw colors; reuse .lp-card classes and Section.vue.
- Keyboard reachable, visible focus, aria-labels on the tile link.
- Do not change the visual treatment of the five still-"Planned" tiles.
</constraints>

<acceptance_criteria>
- Clicking the Blocks tile (and the new nav link) navigates to /blocks and renders the placeholder page.
- The other five tiles are unchanged. `yarn typecheck` passes; `vite build` succeeds.
- Verified in light and dark.
</acceptance_criteria>

<output>
Edited data.ts, EcosystemGrid.vue, router.ts, TopNav.vue and new BlocksIndexPage.vue. Note the before/after
of the Blocks tile in your reply.
</output>
```

#### [x] Task A3 — Build the Blocks index page (category browse)

```
<context>
You are in apps/landing. With the route live (Task A2) and the registry typed (Task A1), build the /blocks
index: an intro plus one section per category, each listing its blocks as cards that scroll to the live
preview. Mirror src/components/ComponentGallery.vue (grid of .lp-card tiles, staggered --reveal-delay) and
reuse Section.vue and the BlockCard/BlockCategoryNav components (this task creates the latter two).
Read docs/blocks.md §3.1, §3.2, §4.
</context>

<task>
Implement BlocksIndexPage.vue with a sticky category nav and category sections driven entirely by the
registry, plus BlockCard.vue and BlockCategoryNav.vue. Each block renders inside BlockPreview (Task A4) —
if A4 is not yet merged, stub the preview area and wire it after.
</task>

<steps>
1. src/components/blocks/BlockCategoryNav.vue — sticky in-page nav listing CATEGORIES; active-section
   highlight via IntersectionObserver; anchors to #<category>.
2. src/components/blocks/BlockCard.vue — index card (title, description, "Built from N components" chips
   from BlockDef.components); links/scrolls to the block's #id.
3. src/pages/BlocksIndexPage.vue — hero intro (Section) + for each category a titled section iterating
   blocksByCategory(category) into BlockCard, then the live BlockPreview per block.
4. Honor prefers-reduced-motion for the reveal/scroll behaviors (reuse useScrollReveal / router
   scrollBehavior already in the app).
</steps>

<constraints>
- Token-only styling; reuse Section.vue, .lp-card, existing grid breakpoints (900px / 560px).
- One H1 on the page; logical heading order; category sections use <section> with aria-labelledby.
- Drive everything from the registry — no hardcoded block lists in the template.
</constraints>

<acceptance_criteria>
- /blocks shows every registered block grouped by category; empty categories render nothing.
- Category nav scrolls to sections; deep links (/blocks#<id>) scroll to the block.
- Responsive + light/dark verified; `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
New BlocksIndexPage.vue, BlockCard.vue, BlockCategoryNav.vue. Screenshot-free written verification of the
three acceptance points.
</output>
```

#### [x] Task A4 — Build the BlockPreview shell (preview / code / viewport / copy)

```
<context>
You are in apps/landing. This is the heart of the Blocks UX: the shared wrapper that renders each block
live, lets the visitor switch to source and copy it, and resize the preview across viewport widths. Dogfood
our own components for the chrome. Read docs/blocks.md §3.2. Reference ShowcaseDashboard.vue for the
"window frame" treatment and token usage.
</context>

<task>
Implement src/components/blocks/BlockPreview.vue. Props: a BlockDef (or its fields). It renders a header
(title, description, viewport segmented control, full-screen toggle) and a DzTabs with "Preview" and
"Code" tabs.
</task>

<steps>
1. Preview tab: render BlockDef.component live inside a bordered, resizable container whose max-width is set
   by a DzSegmented (Mobile ~390px / Tablet ~768px / Desktop 100%). The block re-themes with the global
   toggle automatically (no theme code here).
2. Code tab: render BlockDef.source in DzCodeBlock (language vue/ts) with a DzCopyButton that copies the
   exact source string.
3. Full-screen: a DzIconButton opens the live preview in a DzDialog or DzSheet at full width.
4. Tabs via DzTabs/DzTabList/DzTabTrigger/DzTabContent; ensure the code panel is scrollable and the copy
   button has an accessible label + success feedback.
</steps>

<constraints>
- Build the chrome from real components: DzTabs, DzCodeBlock, DzCopyButton, DzSegmented, DzIconButton,
  DzDialog/DzSheet. No raw colors; token-only; layout CSS in <style scoped> is fine.
- Keyboard: tabs and controls fully operable; visible focus; viewport control labelled (aria-label).
- The preview container must not let the resized block break the page layout (contain overflow).
</constraints>

<example>
Skeleton (illustrative — adapt, don't copy blindly):
  <DzTabs v-model="tab">
    <DzTabList> <DzTabTrigger value="preview">Preview</DzTabTrigger>
                <DzTabTrigger value="code">Code</DzTabTrigger> </DzTabList>
    <DzTabContent value="preview">
      <DzSegmented v-model="vw" :items="viewports" aria-label="Preview width" />
      <div class="preview-frame" :style="{ maxWidth: vwWidth }"><component :is="block.component" /></div>
    </DzTabContent>
    <DzTabContent value="code">
      <DzCopyButton :value="block.source" /> <DzCodeBlock :code="block.source" language="vue" />
    </DzTabContent>
  </DzTabs>
</example>

<acceptance_criteria>
- Preview renders live and interactive; Code shows the block's real source; Copy copies it verbatim.
- Viewport control resizes the preview; full-screen works; all controls keyboard-operable.
- Light/dark + `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
src/components/blocks/BlockPreview.vue, plus a note on which Dz* components you used for the chrome.
</output>
```

#### [x] Task A5 — Wire raw-source imports + the "Built from" component chips

```
<context>
You are in apps/landing. Blocks must show their exact source in the Code tab with zero drift from what
renders. Vite's `?raw` import gives the source string. Each block also advertises which free components it
uses. Read docs/blocks.md §3.2–§3.3.
</context>

<task>
Establish the convention and helper for importing each block's component + raw source into the registry,
and render BlockDef.components as chips on the index card and/or preview header.
</task>

<steps>
1. In registry.ts, for each block register both `component: defineAsyncComponent(() => import('./<cat>/<X>.vue'))`
   and `source: (await import('./<cat>/<X>.vue?raw')).default` — or a small helper that pairs them so adding
   a block is one entry. (Prefer a static import map so Vite can analyze it.)
2. Ensure env.d.ts declares `*.vue?raw` as `{ default: string }`.
3. Render components[] as small chips ("DzButton", "DzCard", …) on BlockCard and/or BlockPreview header,
   styled with tokens (reuse the .tile-count / badge treatment).
</steps>

<constraints>
- The source shown MUST equal the file that renders (no transformation).
- Keep the per-block registration boilerplate minimal and consistent.
- Token-only chip styling.
</constraints>

<acceptance_criteria>
- A sample block shows its real source in the Code tab and its component chips on the card.
- `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
Updated registry.ts pattern (documented with a comment block showing how to add a block), env.d.ts, and the
chip rendering. Include the "how to add a block" snippet in your reply.
</output>
```

#### [x] Task A6 — SEO, meta, and cross-links for /blocks

```
<context>
You are in apps/landing. /blocks is a primary marketing surface and must be SEO-clean and linked from the
right places. Read docs/landing.md §8 (SEO/meta) and §4.6a. index.html holds the head; the app already
sets a title.
</context>

<task>
Add per-route document title + meta description for /blocks, an Open Graph/Twitter title, and ensure the
top nav + footer + Ecosystem tile all link to it.
</task>

<steps>
1. Set document.title and meta description on /blocks navigation (a tiny router afterEach or per-page head
   composable — keep it dependency-free; do not add a head library unless the app already uses one).
2. Add a "Blocks" entry to the footer resources/links (src/components/Footer.vue) and confirm TopNav links it.
3. Add an OG title/description fallback in index.html if a generic one is not already present.
</steps>

<constraints>
- No new dependencies unless already in package.json.
- Token-only styling for any visible link additions.
</constraints>

<acceptance_criteria>
- Navigating to /blocks updates the tab title + meta description; navigating away restores the home values.
- Footer + nav + ecosystem tile all reach /blocks. `vite build` passes.
</acceptance_criteria>

<output>
Edited router/head wiring, Footer.vue, index.html. Note how title/meta is set without a new dependency.
</output>
```

#### [x] Task A7 — Author one reference block end-to-end (`hero-centered`)

```
<context>
You are in apps/landing. Before batch-authoring the catalog, build ONE complete block through the whole
pipeline (file → registry → index → preview → copy) to validate the infrastructure and set the quality
bar every other block follows. Read docs/blocks.md §3.6 (quality bar) and §4.1. Study ShowcaseDashboard.vue.
</context>

<task>
Create the `hero-centered` block (centered marketing hero), register it, and verify it renders in the
index, previews live, shows correct source, and copies cleanly.
</task>

<steps>
1. Create apps/landing/src/blocks/marketing/HeroCentered.vue: eyebrow DzBadge, DzHeading (H-level
   appropriate to embedding — see note), DzText subhead, two DzButton CTAs. Token-only background treatment.
2. Register it in registry.ts with id 'hero-centered', category 'marketing', tags ['hero','cta'],
   components ['DzBadge','DzHeading','DzText','DzButton'], component + source per Task A5.
3. Verify it appears under Marketing on /blocks, previews live, code matches, copy works, both themes,
   responsive down to 390px.
</steps>

<constraints>
- Token-only; no raw colors; real components only.
- Heading note: a block is embedded in a page, so use a heading level/`as` that won't violate document
  outline when previewed; prefer DzHeading with an explicit level and keep the block self-contained.
- Self-contained: no external data, no props required to render the demo (use realistic placeholder copy).
</constraints>

<acceptance_criteria>
- hero-centered is fully functional end-to-end (preview + code + copy + responsive + light/dark).
- `yarn typecheck` + `vite build` pass.
- This block reads as a sibling of ShowcaseDashboard in quality and token usage.
</acceptance_criteria>

<output>
HeroCentered.vue + registry entry. In your reply, confirm each acceptance point and flag any infrastructure
gap discovered (feed it back into A1–A6).
</output>
```

### Phase B — Authoring the catalog

> Each Phase-B task authors a **batch of blocks for one category**. They share one prompt template; the
> per-task differences are the category, the block list (from §4), and any category-specific notes. Author
> the **★ MVP blocks first** within each batch (do P2 = the ★ subset of B1–B3 before the remainders).
> **Do not start Phase B until Task A7 proves the pipeline.**

**Shared authoring template (apply per block in the batch):**

```
<context>
You are a Vue 3 + TypeScript engineer authoring ready-made UI blocks for the dzup-ui landing app, composed
purely from free @dzup-ui/core components. Each block is a self-contained .vue file that drops into a user's
app and looks beautiful out of the box because it uses the same tokens and components as the library.
Read docs/blocks.md §3.6 (the non-negotiable quality bar) and §4 (the catalog). Your gold-standard
reference is apps/landing/src/components/ShowcaseDashboard.vue.
</context>

<task>
Author the block "<TITLE>" (id <ID>, category <CATEGORY>) using ONLY these real components: <COMPONENT LIST
FROM §4>. Create the .vue file at src/blocks/<category>/<Name>.vue and register it in registry.ts.
</task>

<steps>
1. Compose the block from the listed components with realistic, self-contained placeholder content (no
   required props, no external data, no network).
2. Make it genuinely good: thoughtful spacing, hierarchy, and states — a developer should want to copy it.
3. Register it (id, title, description, category, tags, components[], component, source per Task A5).
4. Verify on /blocks: previews live, code matches, copy works, responsive, light + dark.
</steps>

<constraints>
- ONLY var(--dz-*) tokens for color/radius/shadow/spacing; NO raw hex, NO hardcoded Tailwind color classes,
  NO color literals in <style scoped>. Layout-only scoped CSS (grid/flex) is allowed.
- ONLY the listed real Dz* components (verify each exists in packages/core/src/components/). No bespoke
  re-implementations of shipped components.
- WCAG AA: semantic structure, labelled controls, keyboard reachable, visible focus (--dz-ring), AA contrast
  in both themes. Honor prefers-reduced-motion for any motion.
- `<script setup lang="ts">`, `.ts` import extensions. The block must render with zero required props.
- Validate with `yarn typecheck` + `vite build` (ESLint is broken locally — do NOT rely on it; see
  docs/blocks.md §3.6 caveat).
</constraints>

<acceptance_criteria>
- The block renders live, previews/copies correctly, reflows responsively, and is verified in light + dark.
- Uses only the listed real components and only token-based styling.
- `yarn typecheck` (0 errors) + `vite build` (success).
</acceptance_criteria>

<output>
The block .vue file + registry entry. In your reply, list the components used and confirm the token-only +
both-theme checks.
</output>
```

> For each B-task: instantiate the shared template once per block in the checklist, substituting `<TITLE>`,
> `<ID>`, `<CATEGORY>`, and the component list from §4. Keep each block a separate, independently
> verifiable commit/PR where practical. Tick a block's box once it is authored, registered, and verified
> (preview + code + copy + responsive + light/dark). `★` = MVP (do these first within each batch).

#### [ ] Task B1 — Marketing blocks (§4.1)

- [ ] ★ `nav-bar`
- [x] ★ `hero-centered` *(delivered by Task A7 — shipped)*
- [ ] ★ `hero-split`
- [ ] ★ `feature-grid`
- [ ] ★ `stats-band`
- [ ] ★ `pricing-3`
- [ ] ★ `testimonials`
- [ ] ★ `faq`
- [ ] ★ `cta-band`
- [ ] ★ `footer`
- [ ] `logo-cloud`
- [ ] `feature-alt`
- [ ] `pricing-table`
- [ ] `testimonial-quote`
- [ ] `newsletter`
- [ ] `team-grid`
- [ ] `banner`

#### [ ] Task B2 — Application blocks (§4.2)

- [ ] ★ `app-shell`
- [ ] ★ `page-header`
- [ ] ★ `stat-row`
- [ ] ★ `table-card`
- [ ] ★ `empty-state`
- [ ] ★ `settings-layout`
- [ ] `dashboard-grid`
- [ ] `data-grid-filtered`
- [ ] `filter-toolbar`
- [ ] `activity-feed`
- [ ] `notifications-panel`
- [ ] `profile-form`
- [ ] `kanban-column`
- [ ] `command-launcher`
- [ ] `descriptions-panel`

#### [ ] Task B3 — Auth & form blocks (§4.3)

- [ ] ★ `sign-in`
- [ ] ★ `sign-up`
- [ ] ★ `auth-split`
- [ ] ★ `wizard`
- [ ] `forgot-password`
- [ ] `otp-verify`
- [ ] `contact-form`
- [ ] `billing-form`
- [ ] `filters-sidebar`

#### [ ] Task B4 — Commerce blocks (§4.4, fast-follow)

- [ ] `product-grid`
- [ ] `product-detail`
- [ ] `cart-summary`
- [ ] `checkout-summary`
- [ ] `category-header`
- [ ] `order-status`

#### [ ] Task B5 — Content blocks (§4.5, fast-follow)

- [ ] `blog-list`
- [ ] `article-header`
- [ ] `prose`
- [ ] `code-showcase`
- [ ] `toc-aside`
- [ ] `faq-2col`

### Phase C — Quality & release

#### [x] Task C1 — Accessibility, responsive & reduced-motion audit

```
<context>
You are a quality engineer auditing the shipped Blocks (all of /blocks) against the library's WCAG AA bar.
Read docs/blocks.md §3.6 and docs/landing.md §8. The library targets WCAG AA in both themes.
</context>

<task>
Audit every block + the BlockPreview shell + the index page for accessibility, responsiveness, and motion.
</task>

<steps>
1. For each block: check semantic structure, heading order when embedded, labelled controls, keyboard
   reachability, visible focus, and AA color contrast in BOTH light and dark.
2. Resize each preview to mobile/tablet/desktop; confirm no overflow, no broken layout.
3. Confirm any motion honors prefers-reduced-motion (reveals reduce to a fade; no parallax/auto-motion).
4. File concrete fixes (or apply them) per block; produce a checklist table (block × check).
</steps>

<constraints>
- Verify in both themes; do not regress token-only styling.
- Fixes must stay within real components + tokens.
</constraints>

<acceptance_criteria>
- A per-block audit table with pass/fail per dimension; all MVP blocks pass.
- Any failures fixed or ticketed with the exact file + line.
</acceptance_criteria>

<output>
The audit table + a list of fixes applied. Flag anything that needs a core-component change separately.
</output>
```

#### [x] Task C2 — Registry completeness test (CI guard)

```
<context>
You are a quality engineer adding a Vitest guard so the Blocks registry can't drift from reality. Read
docs/blocks.md §3.3. @dzup-ui/core exports the real component names; the landing app depends on it
(workspace:*).
</context>

<task>
Add a Vitest test that validates the registry: unique ids, non-empty required fields, every category in
CATEGORIES used or intentionally empty, and — critically — every name in each block's components[] is a
real export of @dzup-ui/core.
</task>

<steps>
1. Add apps/landing/src/blocks/registry.spec.ts (or the app's test location).
2. Assert: ids unique + kebab-case; title/description/source non-empty; category ∈ BlockCategory; each
   components[] entry is a key of the @dzup-ui/core module exports.
3. Wire it into the app's test script if not auto-discovered.
</steps>

<constraints>
- No ESLint reliance (broken locally). Use Vitest only.
- The test must fail loudly if a block references a non-existent component.
</constraints>

<acceptance_criteria>
- `yarn test` (or the package's vitest run) passes with the registry as-is and fails if a fake component
  name is introduced (demonstrate by temporarily adding one, then reverting).
</acceptance_criteria>

<output>
The spec file + confirmation of both the passing and the deliberately-failing run.
</output>
```

#### [x] Task C3 — Build validation, changelog & docs sync

```
<context>
You are finishing the Blocks feature in apps/landing. The repo validates the landing app with `vite build`
and uses Changesets for versioning. Read docs/blocks.md §3.6 and CLAUDE.md (Tooling, Quality Gates).
</context>

<task>
Run the full local validation, add a changeset/changelog entry, and reconcile docs/blocks.md statuses with
what actually shipped.
</task>

<steps>
1. Run `yarn typecheck`, the app's `vite build`, and `yarn test`; fix any failures.
2. Add a changeset describing the Blocks ecosystem feature (apps/landing) if the app participates in
   versioning; otherwise note why it doesn't.
3. Update docs/blocks.md: tick completed task checkboxes, set the Ecosystem "Blocks" tile status note, and
   record the final shipped block count per category.
</steps>

<constraints>
- Do not commit/push unless asked. ESLint is not part of validation here (broken locally).
</constraints>

<acceptance_criteria>
- typecheck + build + test all green locally; docs/blocks.md reflects reality; changeset added or its
  absence justified.
</acceptance_criteria>

<output>
A short release note (what shipped, block counts), the validation results, and the doc updates.
</output>
```

### Phase D — Pro blocks 🔒

> Phase D adds the **gated Pro tier** (§3.7, catalog §4.6). It **reuses** all Phase-A infrastructure —
> registry, `BlockPreview`, index page, viewport/copy — and only *extends* it: a Pro dependency, a `tier`
> flag, code-gating, and the Pro catalog. **Do D1 → D2 → D3 before authoring (D4–D10).** Author each
> category's **★ Pro MVP** first. Every Pro block previews live but **gates its source behind the license.**

#### [ ] Task D1 — Add the Pro dependency + extend the registry for the Pro tier

```
<context>
You are a Vue 3 + TypeScript engineer on the dzup-ui landing app (apps/landing). The free Blocks catalog
(Phases A–C) is live. We now add a gated **Pro** tier whose blocks compose @dzup-ui-pro/pro components.
Read docs/blocks.md §3.7 (feasibility/positioning/gating) and §4.6 (the Pro catalog). Today apps/landing
depends ONLY on @dzup-ui/core + @dzup-ui/tokens (see its package.json); @dzup-ui-pro/pro lives in the
sibling repo dzup-ui-pro (package @dzup-ui-pro/pro, exports verified in docs/blocks.md Appendix C). This is
the one structural change Phase D needs.
</context>

<task>
Wire @dzup-ui-pro/pro into apps/landing and extend the Block registry to support tier:'pro' blocks, with NO
Pro block content yet (schema + Pro category metadata only). This is the foundation D2–D10 build on.
</task>

<steps>
1. Add @dzup-ui-pro/pro to apps/landing/package.json using the repo's sibling-repo wiring convention
   (workspace:* if the apps share a workspace; otherwise the portal:/link convention the Pro repo already
   uses for contracts — see dzup-ui-pro/CLAUDE.md). Run an install and confirm a Pro component imports.
2. In src/blocks/registry.ts: add `tier?: 'free' | 'pro'` (default 'free') and `proComponents?: string[]`
   to BlockDef exactly per docs/blocks.md §3.7. Extend BlockCategory with the seven Pro category ids from
   §4.6 (`pro-analytics`, `pro-data`, `pro-planning`, `pro-comms`, `pro-editors`, `pro-builders`,
   `pro-enterprise`) and add their entries to CATEGORIES (label + blurb).
3. Add a helper `proBlocks()` / ensure blocksByCategory still works; add `isPro(block): boolean`.
4. Confirm Vite can resolve and tree-shake @dzup-ui-pro/pro from the landing app (one throwaway import in a
   scratch file, then remove it).
</steps>

<constraints>
- TypeScript strict; `.ts` import extensions; do not break the existing free registry or its CI test (C2).
- No Pro blocks authored yet — BLOCKS still contains only free entries; Pro categories may be empty.
- Keep the dependency addition minimal and documented (a comment noting why the sibling dep is needed).
</constraints>

<acceptance_criteria>
- `yarn typecheck` + `vite build` pass with @dzup-ui-pro/pro resolvable from apps/landing.
- BlockDef exposes `tier` + `proComponents`; CATEGORIES includes the 7 Pro categories; free catalog
  unaffected (C2 test still green).
</acceptance_criteria>

<output>
Edited package.json + registry.ts. In your reply: the exact dependency wiring used and why, and the new
registry surface (tier, proComponents, Pro categories).
</output>
```

#### [ ] Task D2 — Make BlockPreview Pro-aware: badge + gated code/copy

```
<context>
You are in apps/landing. Pro blocks must look enticing (live preview) but NOT give their source away for
free (§3.7 gating; PRO_LIVE in src/config.ts is false pre-launch). Extend the existing BlockPreview (Task
A4) and BlockCard (Task A3/A5) rather than forking them. Read docs/blocks.md §3.2, §3.7. Reference how the
free chips render so the Pro badge sits consistently.
</context>

<task>
Add Pro affordances to the shared shell: a 🔒 Pro badge on Pro blocks, and a locked Code tab (and disabled
Copy) for tier:'pro' blocks when the viewer is unlicensed / PRO_LIVE is false — preview stays fully live.
</task>

<steps>
1. In BlockCard.vue and BlockPreview.vue: when `block.tier === 'pro'`, render `<DzBadge tone="primary">`
   with a lock glyph + "Pro". Render proComponents[] chips alongside components[] chips, visually marked.
2. In BlockPreview.vue: keep the Preview tab fully live for Pro blocks. For the Code tab, when
   `!PRO_LIVE` (or an injected `hasProLicense` is false), replace the source view with an upgrade/lock
   panel (DzEmpty or a small card: "Pro block — view source with dzup-ui Pro", link to /pro) and disable
   DzCopyButton; do NOT import the raw Pro source string in that state (avoid leaking it into the bundle).
3. Drive the gate from one place (a `usePro()` composable or a prop) so flipping PRO_LIVE / a real license
   check later is a one-line change.
</steps>

<constraints>
- Reuse DzTabs/DzSegmented/DzDialog chrome from Task A4; token-only; keyboard-operable; visible focus.
- The lock state must be accessible (announced, not just visual) and must not break the Preview tab.
- Free blocks render exactly as before (no badge, ungated code) — no regression.
</constraints>

<acceptance_criteria>
- A Pro block shows the 🔒 Pro badge, a live preview, and a locked Code tab with Copy disabled while
  PRO_LIVE is false; a free block is unchanged.
- Flipping PRO_LIVE (or hasProLicense) to true reveals the Pro source/copy. `yarn typecheck` + `vite build`
  pass; verified light + dark.
</acceptance_criteria>

<output>
Edited BlockPreview.vue + BlockCard.vue (+ any usePro composable). Note how the gate is centralized and how
source-leak is prevented when locked.
</output>
```

#### [ ] Task D3 — Author one reference Pro block end-to-end (`kanban-board`)

```
<context>
You are in apps/landing. Before batch-authoring the Pro catalog, build ONE complete Pro block through the
whole pipeline (file → registry tier:'pro' → index → gated preview → badge) to validate the Pro
infrastructure and set the Pro quality bar. Read docs/blocks.md §3.6 (quality bar), §3.7 (gating), §4.6.3.
Pro components import from @dzup-ui-pro/pro (Appendix C); study a Pro story for realistic usage, e.g.
dzup-ui-pro/packages/pro/stories/planning/DzKanban.stories.ts.
</context>

<task>
Create the `kanban-board` Pro block (full kanban board), register it with tier:'pro', and verify it renders
in the index with the 🔒 Pro badge, previews live, and shows the locked Code state while PRO_LIVE is false.
</task>

<steps>
1. Create apps/landing/src/blocks/pro-planning/KanbanBoard.vue composing DzKanban + DzKanbanColumn +
   DzKanbanCard from @dzup-ui-pro/pro, with free DzAvatar/DzBadge chrome and realistic, self-contained
   placeholder board data (no required props, no network).
2. Register it: id 'kanban-board', category 'pro-planning', tier 'pro', tags ['kanban','board','planning'],
   proComponents ['DzKanban','DzKanbanColumn','DzKanbanCard'], components ['DzAvatar','DzBadge'], component +
   source per Task A5 (but the raw source must NOT be bundled in the locked state — Task D2).
3. Verify: appears under "Planning" (Pro) on /blocks with the Pro badge; previews live and interactive;
   Code tab shows the lock while PRO_LIVE=false and the real source when toggled true; both themes;
   responsive.
</steps>

<constraints>
- Token-only; no raw colors; only real Pro/free components (verify each in the Pro/core barrels).
- Self-contained demo; honor prefers-reduced-motion for any drag affordance animation.
- `<script setup lang="ts">`, `.ts` import extensions. Validate with `yarn typecheck` + `vite build`
  (ESLint broken locally — §3.6).
</constraints>

<acceptance_criteria>
- kanban-board is fully functional end-to-end (live preview + Pro badge + gated code + responsive +
  light/dark). `yarn typecheck` + `vite build` pass.
- Reads as a sibling of ShowcaseDashboard in quality and token usage.
</acceptance_criteria>

<output>
KanbanBoard.vue + registry entry. In your reply confirm each acceptance point and flag any Pro
infrastructure gap discovered (feed it back into D1–D2).
</output>
```

> **Phase-D shared authoring template (apply per Pro block in a batch).** Identical in spirit to the
> Phase-B template, with the Pro deltas folded in: Pro components, the Pro source, and the gate.

```
<context>
You are a Vue 3 + TypeScript engineer authoring ready-made **Pro** UI blocks for the dzup-ui landing app,
composed from @dzup-ui-pro/pro components (plus free @dzup-ui/core chrome). Each block is a self-contained
.vue file that drops into a licensed user's app and looks beautiful out of the box because it uses the same
tokens and components as the library. Read docs/blocks.md §3.6 (quality bar), §3.7 (Pro gating), and §4.6
(the Pro catalog). Gold-standard reference: apps/landing/src/components/ShowcaseDashboard.vue, and the
relevant Pro story under dzup-ui-pro/packages/pro/stories/<family>/.
</context>

<task>
Author the Pro block "<TITLE>" (id <ID>, category <PRO-CATEGORY>, tier 'pro') using these real components:
Pro: <PRO COMPONENT LIST FROM §4.6>; free chrome (optional): <FREE LIST>. Create the .vue file at
src/blocks/<pro-category>/<Name>.vue and register it with tier:'pro' in registry.ts.
</task>

<steps>
1. Compose the block from the listed Pro components (+ free chrome) with realistic, self-contained
   placeholder content — no required props, no external data, no network.
2. Make it genuinely good: thoughtful spacing, hierarchy, states — a developer should want to buy Pro for it.
3. Register it (id, title, description, category, tier:'pro', tags, components[], proComponents[], component,
   source per Task A5) — ensure the raw source is not bundled in the locked state (Task D2).
4. Verify on /blocks: 🔒 Pro badge shows; previews live; Code tab is locked while PRO_LIVE=false and shows
   the real source when toggled; responsive; light + dark.
</steps>

<constraints>
- ONLY var(--dz-*) tokens for color/radius/shadow/spacing; NO raw hex, NO hardcoded Tailwind color classes,
  NO color literals in <style scoped>. Layout-only scoped CSS (grid/flex) is allowed.
- ONLY the listed real components: Pro names must be exports of @dzup-ui-pro/pro (verify in the family
  barrels / Appendix C); free names must be exports of @dzup-ui/core. No bespoke re-implementations.
- WCAG AA: semantic structure, labelled controls, keyboard reachable, visible focus (--dz-ring), AA contrast
  both themes. Honor prefers-reduced-motion.
- `<script setup lang="ts">`, `.ts` import extensions; renders with zero required props.
- Validate with `yarn typecheck` + `vite build` (ESLint broken locally — §3.6).
</constraints>

<acceptance_criteria>
- The block renders live, shows the Pro badge + gated code, reflows responsively, verified light + dark.
- Uses only the listed real Pro/free components and only token-based styling.
- `yarn typecheck` (0 errors) + `vite build` (success).
</acceptance_criteria>

<output>
The block .vue file + registry entry. In your reply, list the Pro + free components used and confirm the
token-only, gating, and both-theme checks.
</output>
```

> For each D-task below: instantiate the shared Pro template once per block in the checklist, substituting
> `<TITLE>`, `<ID>`, `<PRO-CATEGORY>`, and the component lists from §4.6. Keep each block independently
> verifiable. Tick a block once authored, registered (tier:'pro'), and verified (live preview + Pro badge +
> gated code + responsive + light/dark). `★` = Pro MVP (do these first within each batch).

#### [ ] Task D4 — Analytics & BI Pro blocks (§4.6.1)

- [ ] ★ `analytics-overview`
- [ ] ★ `kpi-scorecards`
- [ ] ★ `chart-card`
- [ ] `funnel-conversion`
- [ ] `geo-distribution`
- [ ] `activity-heatmap`

#### [ ] Task D5 — Data Workspace Pro blocks (§4.6.2)

- [ ] ★ `data-grid-pro`
- [ ] ★ `query-builder-panel`
- [ ] `pivot-analysis`
- [ ] `filter-builder-bar`
- [ ] `data-lineage`
- [ ] `virtual-table-card`

#### [ ] Task D6 — Planning & Scheduling Pro blocks (§4.6.3)

- [ ] ★ `kanban-board` *(delivered by Task D3 — tick when merged)*
- [ ] ★ `gantt-timeline`
- [ ] ★ `calendar-scheduler`
- [ ] `resource-scheduler`
- [ ] `cron-schedule-editor`
- [ ] `mind-map-board`

#### [ ] Task D7 — Communication & AI Pro blocks (§4.6.4)

- [ ] ★ `ai-assistant-panel`
- [ ] ★ `chat-workspace`
- [ ] ★ `notification-center`
- [ ] `comments-thread`
- [ ] `chat-message-stream`

#### [ ] Task D8 — Editors & Documents Pro blocks (§4.6.5)

- [ ] ★ `code-editor-pane`
- [ ] ★ `rich-text-editor`
- [ ] `markdown-editor-split`
- [ ] `spreadsheet-grid`
- [ ] `diff-review`
- [ ] `notebook-doc`
- [ ] `json-editor-panel`

#### [ ] Task D9 — Builders & Workflow Pro blocks (§4.6.6)

- [ ] ★ `form-builder-studio`
- [ ] ★ `dashboard-builder-studio`
- [ ] ★ `workflow-designer-canvas`
- [ ] `report-builder-studio`

#### [ ] Task D10 — Enterprise Shell & Governance Pro blocks (§4.6.7)

- [ ] ★ `workspace-shell`
- [ ] ★ `file-manager`
- [ ] `audit-log-viewer`
- [ ] `approval-flow-panel`
- [ ] `command-ribbon`

#### [ ] Task D11 — Pro registry CI guard + gating test

```
<context>
You are a quality engineer extending the registry guard (Task C2) to cover the Pro tier. Read
docs/blocks.md §3.7 and §4.6. @dzup-ui-pro/pro exports the real Pro component names; apps/landing now
depends on it (Task D1).
</context>

<task>
Extend the Vitest registry guard so Pro blocks can't drift: every name in a Pro block's proComponents[] is
a real export of @dzup-ui-pro/pro, every tier:'pro' block sits in a `pro-*` category, and the code-gate
holds (locked source not bundled while PRO_LIVE is false).
</task>

<steps>
1. In registry.spec.ts (or a sibling spec): for each block with tier === 'pro', assert each proComponents[]
   entry is a key of the @dzup-ui-pro/pro module exports, and its category starts with 'pro-'.
2. Assert free blocks have no proComponents and tier defaults to 'free'; ids remain globally unique + kebab.
3. Add a guard/test that the locked Code state does not eagerly import the Pro `?raw` source (e.g. assert
   the gating composable is the only path to the source, or that the raw import is dynamic).
4. Demonstrate the test fails if a fake Pro component name is introduced, then revert.
</steps>

<constraints>
- Vitest only (ESLint broken locally). Test must fail loudly on a non-existent Pro component or a
  mis-categorized Pro block.
</constraints>

<acceptance_criteria>
- `yarn test` passes with the registry as-is and fails on a deliberately-fake Pro component name or a
  tier/category mismatch (show both runs).
</acceptance_criteria>

<output>
The extended spec + confirmation of the passing and deliberately-failing runs.
</output>
```

---

## 8. Open Decisions (confirm before/while building)

1. **Per-block route vs anchors** — spec recommends index + anchors (§3.1). Confirm we don't need
   `/blocks/:id` pages for SEO in Phase 1.
2. **Code language tabs** — show only `.vue` source, or also a Tailwind-HTML variant? (Phase 1: `.vue` only.)
3. **Copy payload** — copy just the `<template>`, or the whole SFC (script+template+style)? Recommend the
   **whole SFC** so it drops in working; revisit if too heavy.
4. **Viewport widths** — confirm mobile/tablet breakpoints for the preview resizer (proposed 390 / 768 / full).
5. **Free vs paid (future)** — Blocks are free now (§3.5); decide if/when a Pro blocks tier is introduced.
   *(Resolved in principle: the Pro tier is specified in §3.7/§4.6/Phase D; remaining sub-decisions below.)*
6. **Block count for launch** — confirm the 16 ★ MVP set is the right launch scope vs a smaller first cut.
7. **Pro hosting model** — §3.7 recommends **Option A** (one unified `/blocks` catalog, Pro blocks badged +
   code-gated) over **Option B** (a separate Pro showcase in the `dzup-ui-pro` repo). Confirm Option A and
   the consequent `apps/landing → @dzup-ui-pro/pro` dependency (Task D1).
8. **Pro gating depth** — confirm Pro blocks **preview live + lock the code/copy** (this doc's assumption),
   vs. a softer "blurred code" tease, vs. hiding Pro blocks entirely until purchase.
9. **Pro visibility pre-launch** — while `PRO_LIVE` is false, do we (a) show Pro blocks with a locked-code
   "coming with Pro" state (recommended — builds the funnel), or (b) hide the Pro categories behind a flag
   until the Pro launch? §5 P6 assumes feature-flagged visibility.
10. **Pro source distribution** — when `PRO_LIVE` flips, is the Pro block source shown in-page to licensed
    users only, or delivered via the Pro package/CLI? Affects whether `?raw` source ships to the client.

---

### Appendix A — Component inventory the catalog draws from (verified)

All block component references in §4 are real, verified against `packages/core/src/components/`:

- **buttons:** DzButton, DzButtonGroup, DzCopyButton, DzFab, DzIconButton, DzSpeedDial, DzSplitButton, DzToggleButton
- **cards:** DzCard, DzCardBody, DzCardFooter, DzCardHeader, DzImageCard, DzStatCard
- **data:** DzAccordion(+Item/Trigger/Content), DzAnimatedNumber, DzCalendar, DzChip, DzCodeBlock, DzCountdown, DzDataGrid(+Header/Body/Pagination), DzDataView, DzDescriptions(+Item), DzList(+Item), DzTable(+Header/Body/Row/Cell), DzTag, DzTimeline(+Item), DzTree
- **feedback:** DzAlert, DzBadge, DzEmpty, DzMeterGroup, DzNotification, DzProgress, DzResult, DzSkeleton, DzSpinner, DzToast
- **forms:** DzCheckbox(+Group), DzColorPicker, DzCombobox, DzDatePicker, DzDateRangePicker, DzFileUpload, DzFormField/Label/Message/Description, DzMultiSelect, DzRadio(+Group), DzRangeSlider, DzRating, DzSelect, DzSlider, DzSwitch, DzTagsInput, DzTimePicker, DzTransfer, DzTreeSelect
- **inputs:** DzInput, DzInputGroup, DzInputMask, DzNumberInput, DzOtpInput, DzPasswordInput, DzSearchInput, DzTextarea
- **layout:** DzAppShell, DzAspectRatio, DzCollapse, DzContainer, DzDivider, DzFlex, DzGrid, DzMasonry, DzPanel, DzResizable, DzScrollArea, DzSpacer, DzSplitter, DzStack, DzToolbar
- **media:** DzAvatar(+Group), DzCarousel(+Slide/Dots/Next/Previous), DzIcon, DzImage, DzImageComparison, DzLightbox, DzQRCode, DzWatermark
- **navigation:** DzAnchor, DzBackTop, DzBreadcrumb(+Item/Separator), DzColorModeToggle, DzMegaMenu, DzMenu(+Item/Separator), DzPagination, DzSegmented, DzSidebar(+Header/Footer/Item/Section), DzStepper(+Item), DzTabs(+List/Trigger/Content)
- **overlays:** DzCommandPalette, DzConfirmDialog, DzContextMenu, DzDialog(+Trigger/Content/Title/Description/Overlay/Close), DzDropdownMenu(+Trigger/Content/Item/Separator), DzPopconfirm, DzPopover, DzSheet, DzTooltip, DzTour
- **typography:** DzBlockquote, DzCaption, DzCode, DzHeading, DzKbd, DzRelativeTime, DzText, DzVisuallyHidden

### Appendix B — Reference facts

- **Library scope:** 147 free components across 11 families (CLAUDE.md / landing.md Appendix A).
- **Existing reference block:** `apps/landing/src/components/ShowcaseDashboard.vue` — the quality benchmark.
- **Validation in this repo:** `yarn typecheck` + `vite build` + Vitest. **ESLint is broken locally**
  (MEMORY.md → "Lint config broken") — never gate on it.
- **Hard rules:** token-only styling (ADR-04), real components only, contracts-first, `.ts` import
  extensions, `<script setup lang="ts">` (CLAUDE.md "Quick Rules").

### Appendix C — Pro component inventory the Pro catalog draws from (verified)

All Pro component references in §4.6 are real, verified against the family barrels in
`dzup-ui-pro/packages/pro/src/components/*/index.ts` (package **`@dzup-ui-pro/pro`**; peer-deps
`@dzup-ui/core` + `@dzup-ui/tokens`). Per `dzup-ui-pro/CLAUDE.md` the headline figure is **41 components
across 8 families** (the barrels also export sub-parts, listed below in parentheses):

- **builders:** DzDashboardBuilder, DzDashboardWidget, DzFormBuilder, DzFormBuilderField,
  DzFormBuilderSection, DzSchemaForm, DzReportBuilder, DzReportBand, DzReportElement
- **business:** DzWorkspaceShell, DzAuditLog, DzNotificationCenter, DzFileManager, DzRibbon
- **communication:** DzAiAssistant, DzAiMarkdown, DzAiCodeBlock, DzToolCallCard, DzChat, DzChatMessage,
  DzComments, DzCommentItem, DzReactionPicker
- **data-pro:** DzDataGridPro, DzVirtualTable, DzPivotTable, DzQueryBuilder, DzFilterBuilder, DzQuickFilter,
  DzDataLineage
- **editors:** DzCodeEditor, DzJsonEditor, DzMarkdownEditor, DzRichTextEditor, DzSpreadsheet, DzDiffViewer,
  DzPdfViewer, DzNotebook (+DzNotebookCell), DzSignaturePad, DzImageEditor
- **planning:** DzCalendar (+DzCalendarMonthView/WeekView/DayView), DzGantt (+DzGanttTaskRow), DzKanban
  (+DzKanbanColumn/DzKanbanCard), DzScheduler, DzMindMap, DzCronEditor
- **visualization:** DzChart, DzChartDataTable, DzSparkline, DzGauge, DzScorecard, DzFunnelChart,
  DzStockChart, DzHeatMap, DzTreeMap, DzOrgChart, DzGeoMap, DzNetworkGraph, DzSankeyDiagram,
  DzDiagramEditor, DzSchemaDesigner, DzWhiteboard, DzBarcode
- **workflow:** DzWorkflowDesigner (+DzWorkflowNode/DzWorkflowEdge/DzWorkflowToolbar), DzApprovalFlow

> **Pro reference facts.** Stories live at `dzup-ui-pro/packages/pro/stories/<family>/` — study the
> relevant one before authoring a Pro block (realistic data + intended composition). Pro adds its own gates
> beyond §3.6: `yarn validate:oss-surface` (proves Pro still works against built OSS exports), plus
> contract/a11y/SSR suites (`dzup-ui-pro/CLAUDE.md`). From the landing app, still validate Pro blocks with
> `yarn typecheck` + `vite build`.

</content>
</invoke>
