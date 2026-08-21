# Landing Page — Design & Specification

> **Status:** Proposal / specification. **No implementation yet.**
> **Owner:** dzup-ui team · **Last updated:** 2026-06-22
> **Scope:** Public marketing/landing page for the dzup-ui component library, the entry point that funnels visitors into the **free** components (Storybook) today and the **Pro** components (`@dzup-ui-pro/pro`) later.

---

## 1. Purpose & Context

Today the only public surface for dzup-ui is **Storybook** (`apps/storybook`), which is excellent as *documentation* but is not a *front door*. Storybook opens on an MDX `Introduction` page — useful for someone who already knows what dzup-ui is, but it does no marketing work: no hero, no value proposition, no visual showcase, no clear "free vs pro" story, no conversion path.

Every comparable library (PrimeVue, Vuetify, MUI, CoreUI, Tailwind, shadcn/ui, Nuxt UI) sits behind a **dedicated landing page** at the root domain that:

1. States what the library is in one line and quantifies its scope.
2. Shows the components working (live, light + dark) before asking for anything.
3. Routes visitors into the docs/component browser — **for us, Storybook**.
4. Presents the **free → pro** choice and funnels commercial intent toward the paid tier.

This document specifies that page: how it should be structured, what it should contain, where it should live in the repo, how it stays visually consistent with our existing design tokens, and how the free/pro funnel should work now (free-only) and later (free + pro).

**The plan, restated:** the landing page is the production front door. From it, a visitor can reach **free components** (today: `dzup-ui/apps/storybook`) and — once it exists — **pro components** (`dzup-ui-pro/apps/storybook`). For the first release, *all* component CTAs point at the free Storybook. The pro path is designed in now (badges, a "Pro" section, a placeholder route) but wired to a "coming soon" / waitlist state until the pro Storybook is published.

---

## 2. Competitive Research

We analyzed nine libraries spanning the full monetization spectrum. The findings below drive every recommendation in this document.

### 2.1 Libraries reviewed

| Library | Model | What we take from it |
|---|---|---|
| **PrimeVue** | Free core + paid periphery (Blocks, Templates, Theme Designer) | Live app mockup below the hero; ambient (non-intrusive) upsell; live re-theming controls in the header |
| **Nuxt UI Pro** *(now merged/free as of v4)* | Was: free atoms + paid layout blocks | **Deploy-time license gate** ("free in dev, pay to deploy"); explicit free-count vs pro-count contrast; dedicated `Pro` + `Pricing` nav items |
| **Vuetify** | Free core + paid templates/snips/subscription | Sponsor strip under hero; visual component gallery; "more than components — an ecosystem" framing |
| **shadcn/ui** | Fully free, docs-first | Minimal hero (2 CTAs); page *is* a live demo; copy-paste theming with a "Copy code" CSS-variable output |
| **CoreUI** | Open-core, badge-driven | Persistent **"PRO" badges in the left nav**; per-page upgrade banner; **demos never blurred** — gate is on the package, not on viewing |
| **MUI / MUI X** | Open-core (Core free → X Pro/Premium) | Canonical pricing page (3–4 per-dev tiers, "Free forever", feature matrix, monthly-equivalent pricing); badges at component *and* API-method granularity; license enforced via watermark, not blur |
| **Tailwind Plus** | Free framework + paid assets | "See everything, pay to use the code"; one-time lifetime pricing; closing "move even faster with Plus" hand-off section |
| **Ant Design** | Fully free (no funnel) | Cautionary: "Pro" naming that *doesn't* mean paid causes positioning confusion — reserve "Pro" strictly for the paid tier |
| **Bootstrap** | Free framework; first-party themes store **sunset 2025** | Cautionary: a half-committed marketplace gets out-competed and abandoned — either commit to open-core or stay free + sponsored |

### 2.2 Patterns common to *every* component-library landing page

1. **One-line positioning headline + a subhead that quantifies scope** (component count, framework, accessibility).
2. **Exactly 2–3 hero CTAs:** a primary "Get Started" (→ install/docs) and a secondary "Browse Components" (→ the component browser; for us, Storybook).
3. **A live product showcase immediately below the hero** — a real dashboard/app built from the components, shown in **both light and dark**. "Show, don't tell" is universal.
4. **A breadth statement** — a feature grid or value-prop bullets touting: component count, accessibility (WCAG/ARIA), theming, TypeScript, framework support.
5. **Theming + dark mode as a first-class, *interactive* selling point.**
6. **Social proof — GitHub stars first** (every library surfaces the star count in the header), plus npm downloads and/or community size. (CoreUI and Bootstrap *hide* their numbers — a documented anti-pattern. We should show ours.)
7. **A docs-first funnel** — the page pushes to install/docs/components, never a signup wall or "request a demo."
8. **A footer** with docs/resources columns, community/social links, and license/legal attribution.

### 2.3 The canonical section order

```
(optional) announcement banner
1. Hero            → headline · subhead · 2 CTAs · live theme control
2. Live showcase   → real dashboard/app mockup, light + dark
3. Feature grid    → count · a11y · theming · TS · framework support
4. Theming demo    → interactive, with copy-paste output
5. Component gallery→ visual breadth, each tile links into Storybook
6. Social proof     → stars · downloads · community
7. Free → Pro       → the upsell fork (ambient, mid-page)
8. Community / CTA   → Discord / GitHub
9. Footer
```

### 2.4 Free → Pro funnel — the proven mechanics

- **Lead with free, convert downstream.** The hero sells the free product's strength; pricing lives one click away (top-level `Pricing` nav item) — never a hard sell in the hero.
- **Offer an explicit "browse free / explore pro" fork.** CoreUI's three-CTA hero is the model: a dominant "Explore Pro" plus confident free paths ("Browse Components", "View Templates").
- **Split free atoms vs paid blocks/templates,** communicated as a count contrast ("147 free components · 41 pro components").
- **Mark pro items with a persistent badge in the component-tree nav** + a per-page upgrade banner. (MUI/CoreUI.)
- **Never blur or lock demos.** Pro demos run fully, with visible code; the gate is on the *package/license key*, enforced at deploy via a watermark — not on viewing. Desire first, friction at deploy. (MUI's watermark + 30-day no-key trial; Nuxt UI Pro's deploy-time gate are the strongest patterns.)
- **One-time, per-developer, lifetime pricing** is the dominant model, anchored **$199–$999**, tiered by seat count (Solo / Team / Org). Subscriptions are reserved for tooling/SaaS. Always show a "Free forever" tier first.

---

## 3. Where the Landing Page Should Live

### 3.1 The question

The user explicitly asked: *where does this part go — `dzup-ui` or `dzup-ui-pro`?*

**Recommendation: it lives in `dzup-ui` (the OSS repo), as a new standalone app: `dzup-ui/apps/landing`.**

Rationale:

- The landing page is the **public, open, marketing front door**. It must be reachable by everyone, including people who will never pay. The OSS repo is public; `dzup-ui-pro` is a private/commercial repo behind a license. Marketing material cannot live behind the paywall.
- It is the page that *sells* pro, so it cannot itself *be* pro.
- It needs to import and render real `@dzup-ui/core` components for the live showcase — those already live in `dzup-ui` with zero auth.
- The repo already establishes the pattern: `dzup-ui/apps/` contains `storybook` and `sandbox`. A third sibling, `apps/landing`, fits the monorepo conventions exactly (Yarn 4 workspaces, Vite, Vue 3, the shared `data-theme` FOUC script).

### 3.2 Why not put it inside Storybook?

Storybook *can* render a custom MDX intro or a themed manager, and that's fine for a "welcome" doc. But a marketing landing page needs: full-bleed layouts, scroll-driven animation, a hero, custom routing, SEO meta tags, and a deploy independent of the docs build. Fighting Storybook's manager/preview iframe split to get all that is more work than a 1-file Vite app. **Keep Storybook as the component *documentation*; build the landing as its own app that *links to* Storybook.**

### 3.3 Recommended app structure

A small Vite + Vue 3 + vue-router app, mirroring `apps/sandbox` (which already proves the pattern — router, `useTheme` composable, FOUC script, token CSS import):

```
dzup-ui/apps/landing/
  index.html            # FOUC theme script (copy from sandbox/storybook), SEO meta
  package.json          # @dzup-ui/landing — depends on core + tokens (workspace:*)
  vite.config.ts        # @tailwindcss/vite + workspace aliases (mirror sandbox)
  tailwind.css          # imports @dzup-ui/tokens/css + core base styles
  src/
    main.ts
    router.ts           # '/', and a stubbed '/pro' route (coming-soon for now)
    App.vue             # shell: TopNav + <router-view> + Footer
    composables/
      useTheme.ts        # reuse sandbox's theme composable (data-theme switch)
    components/
      TopNav.vue
      Hero.vue
      ShowcaseDashboard.vue   # live demo built from @dzup-ui/core
      FeatureGrid.vue
      ThemingDemo.vue          # interactive re-theme + "copy CSS variables"
      ComponentGallery.vue     # tiles → deep-link into Storybook stories
      SocialProof.vue
      FreeVsPro.vue            # the upsell fork
      CommunityCTA.vue
      Footer.vue
    pages/
      HomePage.vue
      ProPage.vue              # "coming soon" / waitlist for now
```

### 3.4 Deployment topology

The landing page is the root; Storybook is a sub-path. Recommended public layout:

| URL | Serves | Source |
|---|---|---|
| `dzup-ui.com/` (or chosen domain) | **Landing page** | `apps/landing` build |
| `dzup-ui.com/storybook/` | **Free component docs** | `apps/storybook` build (`storybook build`) |
| `dzup-ui.com/pro/` *(later)* | **Pro component docs** | `dzup-ui-pro/apps/storybook` build |
| `dzup-ui.com/pricing` *(later)* | **Pricing page** | a route in `apps/landing` |

Both the landing app and Storybook output static files, so any static host (Netlify / Vercel / GitHub Pages / Cloudflare Pages) can serve `landing` at `/` and mount the Storybook static build under `/storybook`. The cross-links are then plain URLs — no coupling between the two builds.

> **Local-env note:** ESLint cannot run locally in this repo; validate the landing build the same way we validate Storybook — with `storybook build` for the docs side and `vite build` for the landing app. See `[[dzup-ui-local-env]]`.

### 3.5 Free now, Pro later — the phased wiring

- **Phase 1 (now):** every component CTA on the landing page points at the **free Storybook** (`/storybook/`). The `Free vs Pro` section renders, the Pro column shows the real pro component list (from `dzup-ui-pro` README: Kanban, Gantt, Calendar, Scheduler, DataGridPro, editors, charts, FormBuilder, PageBuilder, Chat, etc.) with a **"Coming soon"** badge and a waitlist/contact CTA instead of a live link. The `/pro` route exists but renders a "coming soon" page.
- **Phase 2 (later):** flip the Pro CTAs to point at the published pro Storybook (`/pro/`) and the pricing page. No structural change needed — only the targets of links and the state of badges change. This is why the Pro section is designed in from day one.

---

## 4. Page Specification (section by section)

The page follows the canonical order from §2.3, adapted to our free-now/pro-later reality.

### 4.0 Announcement banner *(optional, dismissible)*
- Thin bar above the nav. E.g. *"147 components now stable · Pro components coming soon →"*.
- Dismiss state persisted in `localStorage`. Hidden by default if no announcement.

### 4.1 Top navigation
- **Left:** dzup-ui wordmark/logo.
- **Center/right links:** `Components` (→ Storybook), `Docs` (→ Storybook Getting Started), `Themes` (→ theming demo / Storybook Theming), `Pro` (→ `/pro`), `Pricing` *(later)*.
- **Right utilities:** GitHub star button (live count), theme toggle (light/dark/system), search *(optional, later)*.
- Sticky, with a subtle background blur + border that appears on scroll.

### 4.2 Hero
- **Eyebrow/chip:** small badge, e.g. *"Open source · MIT · Vue 3"*.
- **Headline (H1):** one line. Working draft: **"The Vue 3 component library for serious products."** (Alt: *"147 accessible Vue 3 components. One token system. Light & dark out of the box."*)
- **Subhead:** quantifies scope — *"147 open-source components across 11 families, built on Tailwind CSS 4, an OKLCH token system, and Reka UI accessible primitives. Enterprise components available in Pro."*
- **CTAs (2, max 3):**
  - Primary → **"Browse components"** → `/storybook/`
  - Secondary → **"Get started"** → Storybook Getting Started
  - *(later)* tertiary → "Explore Pro" → `/pro`
- **Live theme control** in the hero or header so the entire page re-themes on click (PrimeVue pattern) — reinforces the theming selling point immediately.
- **Background:** subtle, token-driven gradient (primary hue 260 → secondary hue 290) with a faint grid or dot pattern; respects `prefers-reduced-motion`.

### 4.3 Live showcase ("show, don't tell")
- The single highest-leverage element. A **real, composed dashboard** built from `@dzup-ui/core` — e.g. an app shell with sidebar nav, stat cards, a data table, a chart-like panel, form controls, badges, an alert/toast.
- Rendered **live** (actual components, not screenshots) so it re-themes with the toggle and proves the components in one glance, in both **light and dark**.
- Optionally framed in a browser/window chrome mock with a light/dark split or toggle.

### 4.4 Feature grid
- 6–8 cards, each: icon + title + one sentence. Content drawn from real library facts:
  - **147 components** across 11 families
  - **Accessible** — WCAG AA, Reka UI primitives, keyboard + ARIA
  - **OKLCH design tokens** — three-tier (primitive → semantic → component)
  - **Light / dark / system** — `data-theme` switch, FOUC-safe (ADR-15)
  - **TypeScript-first** — strict mode, full inference, contract types
  - **Tailwind CSS 4** — `tailwind-variants`, no raw colors
  - **SSR-safe, ESM-only** — tree-shakeable, Nuxt module available
  - **Themeable** — swap tokens, not component code

### 4.5 Interactive theming demo
- A compact, interactive panel: pick a primary hue / surface / radius and watch a cluster of components update live (shadcn/PrimeVue pattern).
- Include a **"Copy CSS variables"** button that outputs the `--dz-*` custom properties to paste — cheap to build, strong differentiator, and on-brand with our token system.
- Link out to **Storybook → Guides/Theming** and **Guides/Design Tokens** for the full story.

### 4.6 Component gallery
- A responsive grid of family tiles (Buttons, Inputs, Forms, Cards, Data, Feedback, Layout, Navigation, Overlays, Media, Typography), each with a tiny live preview + the family's component count.
- **Each tile deep-links into the matching Storybook story** (e.g. `/storybook/?path=/docs/buttons-overview--docs`). Storybook is our "component browser"; the gallery is the bridge to it.

### 4.6a Ecosystem — "beyond components" *(implemented as placeholders; detail later)*

Every mature library sells more than the raw components — it sells the things you *build* with them. This section announces those complementary offerings and reserves their place in the page; each tile is a "Planned" placeholder for now, to be elaborated (real counts, live previews, deep-links/routes) per offering later.

**Competitive research (what "similar" libraries ship around the core):**

| Offering | Who does it | What it is |
|---|---|---|
| **Blocks** | PrimeVue (450+ Blocks: landing/marketing/application), Tailwind Plus (Marketing/Application/Ecommerce UI blocks), shadcn Blocks, Nuxt UI Pro | Pre-composed, copy-paste *sections* made of several components — heroes, pricing tables, navbars, stat rows, auth forms. The unit above a component, below a page. |
| **Templates** | PrimeVue Templates (paid, ~$19+), Tailwind Plus Templates, Vuetify | Full-page / full-app *starters* — dashboards, admin panels, landing pages, settings/auth flows — wired and themed. |
| **Animations** | shadcn ecosystem: Aceternity UI (200+ effects), Magic UI, Motion-Primitives | Drop-in *motion* — scroll reveals, text/number transitions, hero effects — the fastest-growing 2025–26 category. Must honour `prefers-reduced-motion`. |
| **Icons** | Most systems ship/curate an icon set | A curated icon set wired to the tokens (we already build on lucide). |
| **Themes** | PrimeVue Theme Designer, shadcn themes | Token *theme presets* + a visual editor; complements our interactive theming demo (§4.5) and exports `--dz-*` variables. |
| **Figma kit** | MUI, Tailwind Plus, Untitled UI, etc. | A design kit mirroring components + OKLCH tokens so design and code stay in lockstep. |

**Key principle (carried from §6):** every ecosystem offering is built on the **same tokens, accessibility bar and component set** as `@dzup-ui/core`, so it stays visually identical to the library it extends — "universal for our current design," not a parallel system. The named three (**Blocks, Templates, Animations**) lead the grid; Icons / Themes / Figma kit follow as the "and similar" set.

**Implementation (now):** `apps/landing/src/components/EcosystemGrid.vue`, fed by `ECOSYSTEM` in `src/data.ts`, rendered after the component gallery on the home page under the `#ecosystem` anchor (linked from the top nav). Mirrors the gallery/feature-grid patterns (`Section` + `lp-card` tiles, staggered scroll-reveal, token-only styling). Each tile shows icon + title + blurb + category meta + a "Planned" badge; tiles are non-interactive until their offering ships. **Reserve the funnel framing for later:** like Pro, some of these may become paid (PrimeVue/Tailwind Plus charge for Blocks/Templates) — decide free-vs-pro per offering when each is built out.

### 4.7 Social proof
- A row of hard numbers — **GitHub stars** (live), **npm downloads**, **component count**, **community size** — plus, when available, a logo wall.
- Per research: *show* the numbers (avoid the CoreUI/Bootstrap anti-pattern of hiding them).

### 4.8 Free → Pro (the upsell fork)
- A two-column split, ambient (not a hard banner):
  - **Left — "Start free":** 147 MIT components, full Storybook docs, theming, accessibility. CTA → `/storybook/`.
  - **Right — "Go Pro":** 41 enterprise components (Kanban, Gantt, Calendar, Scheduler, DataGridPro, editors, charts, FormBuilder, PageBuilder, Chat, …), priority support. CTA → `/pro` (Phase 1: "Join the waitlist" / "Notify me"; Phase 2: "Explore Pro" + pricing).
- Use a **count contrast** ("147 free · 41 pro") and a clear visual distinction (Pro side carries the brand accent + a "Pro" badge).
- **Reserve the word "Pro" strictly for the paid tier** (Ant Design cautionary note) — do not use "Pro" for any free scaffold.

### 4.9 Community / closing CTA
- GitHub + Discord/community links, contribution invite, and a final "Get started" CTA → Storybook.

### 4.10 Footer
- Columns: **Docs** (Getting Started, Components, Theming, Accessibility, Contributing — all → Storybook), **Pro** (Components, Pricing, License, Contact — Phase 2), **Resources** (GitHub, Changelog, npm, Nuxt module), **Community** (Discord, X/Twitter, Discussions).
- Bottom row: MIT license attribution for OSS, copyright, links to `dzup-ui-pro` commercial license.

---

## 5. Pricing Page *(Phase 2 — specified now, built later)*

When Pro ships, add a `/pricing` route to `apps/landing` following the MUI/CoreUI playbook:

- **3–4 per-developer tiers**, first tier **"Free forever" ($0)**, e.g. Free · Solo · Team · Enterprise.
- **One-time, per-seat, lifetime** pricing anchored **$199–$999** (Solo ≈ $249, Team ≈ $499, Org ≈ $999), unlimited projects/end-users — matching the dominant model in §2.4.
- Show **monthly-equivalent** under any annual figure; mark the middle tier **"Most popular"**.
- A **feature-comparison matrix** grouped by component/feature with per-tier checkmarks (doubles as a spec sheet that teaches the upgrade value).
- Trust accelerators: 30-day money-back guarantee, educational/non-profit discount, volume discount at 25+ seats.
- **License enforcement (recommended): deploy-time / watermark, never blur.** Let developers use Pro freely in development; enforce at production build with a watermark + console warning and a 30-day no-key trial. Lowest friction, highest conversion (Nuxt UI Pro + MUI X patterns).

In-docs (pro Storybook), mark pro components with a **persistent "PRO" badge in the sidebar** (we already render status badges in `manager.ts` — extend that mechanism) plus a per-page upgrade banner. Keep demos fully working.

---

## 6. Visual Design Language (must match the existing app)

The landing page **must reuse the existing design-token system** so it is visually identical to the components it showcases. No new color system, no parallel tokens.

### 6.1 Color
- Import `@dzup-ui/tokens/css` and use **only `var(--dz-*)`** values — never raw hex/Tailwind colors (per ADR-04, the same rule the components follow).
- Palette is **OKLCH**. Brand axis: **primary = hue 260** (indigo/blue), **secondary = hue 290** (violet). Full status ramps exist (success 145, warning 92, danger 25, info 230).
- Key semantic tokens to build with:
  - Surfaces: `--dz-background`, `--dz-surface`, `--dz-surface-raised`
  - Text: `--dz-foreground`, `--dz-muted-foreground`
  - Brand: `--dz-primary`, `--dz-primary-hover`, `--dz-primary-foreground`, `--dz-primary-muted`
  - Lines/focus: `--dz-border`, `--dz-ring`
- Hero/section gradients should be composed from `--dz-colors-primary-*` and `--dz-colors-secondary-*` so they shift correctly between light and dark.

### 6.2 Typography
- **Sans:** `--dz-font-sans` → **Inter** (`'Inter', ui-sans-serif, system-ui, …`).
- **Mono:** `--dz-font-mono` → **JetBrains Mono** (for code snippets / the "copy CSS variables" block).
- Type scale via `--dz-text-*` (`xs .75rem` → `4xl 2.25rem`). Hero H1 may step above `4xl` with a `clamp()` for fluid sizing, but body/sub-heads stay on the token scale.

### 6.3 Radius, shadow, spacing
- **Radius:** `--dz-radius-*` — cards `lg` (0.625rem), dialogs `xl` (0.875rem), pills/badges `full`. Match component radii so embedded demos blend in.
- **Shadow:** `--dz-shadow-*` (xs → 2xl). Dark mode automatically uses higher-opacity shadow overrides — use the tokens, don't hardcode.
- **Spacing:** `--dz-spacing-*` scale (0.25rem step). Generous section padding (PrimeVue/shadcn breathing room).

### 6.4 Light / dark theming
- Use the **`data-theme` attribute on `<html>`** mechanism (light/dark), identical to Storybook's `withThemeByDataAttribute` and the sandbox app.
- Include the **FOUC-prevention IIFE** in `index.html` (copy verbatim from `apps/sandbox/index.html` / canonical `@dzup-ui/core/providers` script, ADR-15) so the theme is set before paint.
- Reuse the sandbox's `useTheme` composable for the toggle and `localStorage` persistence (`dz-theme` key).
- **Every section must be verified in both light and dark** — the live showcase is the headline proof of this.

---

## 7. Motion & Animation

Modern but restrained — motion should feel like the product is *responsive*, not decorative.

- **Scroll-reveal:** sections fade-and-rise (translateY ~16px → 0, opacity 0 → 1) on enter via `IntersectionObserver`. Stagger grid children ~60–80ms.
- **Hero:** a gentle entrance (headline → subhead → CTAs staggered ~80ms) and a slow, subtle gradient/parallax drift in the background.
- **Live theme switch:** animate the color transition (short `transition` on background/border/color) so toggling light↔dark feels smooth rather than a hard flip.
- **Hover micro-interactions:** feature/gallery cards lift (`--dz-shadow-sm` → `--dz-shadow-md`) and translate ~2px; CTAs use the components' own hover tokens.
- **Component gallery previews:** a small live interaction on hover (e.g. a button ripple, a switch toggling) to prove interactivity.
- **Performance & a11y:** transform/opacity only (no layout thrash); **honor `prefers-reduced-motion: reduce`** — disable parallax/auto-motion and reduce reveals to a simple fade. Keep total motion budget small; never block content on animation.
- Implementation can be CSS transitions/`@keyframes` + `IntersectionObserver`; a tiny library (e.g. `@vueuse/motion`) is acceptable but not required. Decide at implementation time.

---

## 8. Responsive & Accessibility

- **Responsive:** mobile-first. Hero stacks; multi-column grids collapse to 1–2 columns; the live dashboard showcase becomes a simplified/scrollable variant on small screens; nav collapses to a sheet/drawer (reuse `DzSheet`).
- **Accessibility (WCAG AA — same bar as the library):**
  - Semantic landmarks (`header`/`nav`/`main`/`footer`), one H1, logical heading order.
  - All interactive elements keyboard-reachable with visible focus rings (`--dz-ring`).
  - Color contrast AA in both themes (OKLCH ramps are designed for this; verify the gradient text overlays).
  - Respect `prefers-reduced-motion` (see §7).
  - Build the page from real `@dzup-ui/core` components where possible so it inherits their a11y.
- **SEO/meta:** title, description, Open Graph/Twitter card images, canonical URL, sitemap. (Storybook can't do this well — another reason the landing is its own app.)

---

## 9. Implementation Notes (for the later build — not now)

- New workspace app `dzup-ui/apps/landing` (Vite + Vue 3 + vue-router), modeled on `apps/sandbox`: workspace deps `@dzup-ui/core` + `@dzup-ui/tokens` (`workspace:*`), `@tailwindcss/vite`, the same Vite workspace aliases as `.storybook/main.ts`.
- Import order in `tailwind.css`: `@dzup-ui/tokens/css` → `@dzup-ui/core` base styles → app utilities (matches Storybook `preview.ts`).
- Cross-links to Storybook are plain relative URLs (`/storybook/?path=/docs/...`); no build coupling.
- The `/pro` route and `FreeVsPro` Pro column are built in Phase 1 but render "coming soon"/waitlist; Phase 2 flips link targets only.
- **Validation in this repo:** ESLint can't run locally (`[[dzup-ui-local-env]]`). Validate with `vite build` (landing) and `storybook build` (docs). Add the landing build to CI alongside the Storybook build.
- Keep the FOUC theme IIFE in `index.html` synced with the canonical `@dzup-ui/core/providers` script (don't fork it).

---

## 10. Open Decisions (to confirm before building)

1. **Domain & hosting** — what public domain, which static host, and the `/storybook` sub-path mount. (Affects all cross-link URLs.)
2. **Hero copy** — final headline/subhead wording and the eyebrow chip text.
3. **Live showcase scope** — which dashboard composition best represents the library (and how much to simplify on mobile).
4. **Pro Phase-1 CTA** — waitlist (collect emails) vs a plain "coming soon" with a contact link. Waitlist implies a form/backend.
5. **Pricing** — confirm tier names, seat counts, and price points before the `/pricing` page is built (Phase 2).
6. **Animation library** — hand-rolled CSS + `IntersectionObserver` vs `@vueuse/motion`.

---

## 11. Phased Roadmap

| Phase | Deliverable |
|---|---|
| **0 — this doc** | Specification approved |
| **1 — Landing (free)** | `apps/landing` with Hero, live showcase, feature grid, theming demo, component gallery (→ free Storybook), social proof, Free-vs-Pro (Pro = coming soon), community, footer. Deployed at `/`, Storybook at `/storybook/`. |
| **2 — Pro funnel** | Publish pro Storybook at `/pro/`; build `/pricing`; flip Pro CTAs live; add PRO badges + upgrade banners + license enforcement in the pro docs. |
| **3 — Polish** | SEO/OG images, optional search, blog/changelog feed, logo wall / testimonials as they become available. |

---

### Appendix A — Reference facts used in this spec

- **Library scope:** 147 (README) / 163 (Storybook intro, incl. sub-parts) Vue 3 component files across **11 families**: Buttons, Cards, Data, Feedback, Forms, Inputs, Layout, Media, Navigation, Overlays, Typography.
- **Pro scope:** 41 components across 8 families (builders, business, communication, data-pro, editors, planning, visualization, workflow) — Kanban, Gantt, Calendar, Scheduler, DataGridPro, CodeEditor, RichTextEditor, Chart, WorkflowDesigner, FormBuilder, PageBuilder, Chat, NotificationCenter, …
- **Stack:** Vue 3.5+ (`<script setup>`), TypeScript strict, Tailwind CSS 4, `tailwind-variants`, Reka UI, OKLCH tokens, Storybook 10, Vite, Yarn 4 workspaces.
- **Design tokens:** OKLCH; primary hue 260, secondary 290; Inter + JetBrains Mono; radius/shadow/spacing scales; light/dark via `data-theme` with FOUC-safe init (ADR-15); token-only styling (ADR-04).
</content>
</invoke>
