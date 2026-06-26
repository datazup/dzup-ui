# Templates — Investigation, Display Design & Implementation Tasks

> **Status:** Specification + task backlog. **No implementation yet.**
> **Owner:** dzup-ui team · **Last updated:** 2026-06-23
> **Scope:** The **Templates** offering of the dzup-ui ecosystem — the full-page / full-app *starters* built from the **free** `@dzup-ui/core` components, surfaced from the landing page's Ecosystem grid (`apps/landing`). This document is the result of reviewing the landing page, deciding how the Templates section should behave when a visitor clicks it, cataloguing the ready-made templates we will ship, and breaking the work into implementation tasks.
> **Companion doc:** [`docs/landing.md`](./landing.md) (the landing-page spec; §4.6a "Ecosystem" introduces Blocks / Templates / Animations).
> **Pro extension:** §1–§9 specify the **free** templates. [§10](#10-pro-templates-paid-tier) adds an *additive* **pro** template tier built from `@dzup-ui-pro/pro` (the enterprise components shown in `dzup-ui-pro/apps/storybook`), surfaced in the same gallery with a "Pro" badge.

---

## 0. How to read this document

The brief asked for two things: (1) an **investigation** of how Templates should be implemented and displayed, and (2) a set of **tasks** written so an agent (or person) can later execute them to the highest possible quality.

§1–§7 are the **investigation and design**. §8 is the **task backlog**.

The tasks in §8 are written following Anthropic's prompt-engineering guidance (see [Anthropic — Prompt engineering overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)). Each task is a self-contained prompt that applies these techniques:

- **Be clear, direct and contextual** — every task states *why* it exists and *who* the reader is before *what* to do.
- **Give a role** (`<role>`) — sets the executor's expertise and bar.
- **Structure with tags** — `<context>`, `<task>`, `<inputs>`, `<constraints>`, `<deliverables>`, `<acceptance_criteria>`, `<example>`.
- **Provide examples (multishot)** — each authoring task points at a concrete reference file already in the repo to imitate.
- **Let the model think** (`<thinking>` step) before it writes code.
- **Chain complex prompts** — large work (24 templates) is decomposed into one reusable *authoring* prompt + per-template spec rows + small batches, rather than one mega-task.
- **Define success criteria** — every task ends with objective, checkable acceptance criteria.

Do **not** implement from this doc yet. Its purpose is to be a precise brief so the eventual build gets the best possible result.

---

## 1. Investigation — current state

### 1.1 What exists today

The landing app (`apps/landing`, Vite + Vue 3 + vue-router) renders an **Ecosystem** section near the bottom of the home page:

- `apps/landing/src/components/EcosystemGrid.vue` renders a 3-column grid of tiles from the `ECOSYSTEM` array in `apps/landing/src/data.ts`.
- The six tiles are **Blocks, Templates, Animations, Icons, Themes, Figma kit**. Each has `icon`, `title`, `blurb`, `meta`, and `status: 'planned'`.
- Every tile is **non-interactive**: it shows a "Planned" `DzBadge` and has **no link, no route, no click handler**. (`EcosystemGrid.vue` renders `<li class="lp-card tile">` — there is no `<a>` or `router-link`.)
- The top nav (`TopNav.vue`) links **"Ecosystem"** to `{ path: '/', hash: '#ecosystem' }` — it only scrolls to the grid; there is no per-offering page.
- Routing (`router.ts`) has exactly two routes: `/` (HomePage) and `/pro` (ProPage), plus a catch-all redirect to `/`. **There is no `/templates` route.**

The **Templates** tile specifically (`data.ts` lines ~93–99):

```ts
{
  icon: 'LayoutTemplate',
  title: 'Templates',
  blurb: 'Full-page and full-app starters — dashboards, admin panels, landing pages, settings flows — wired and themed out of the box.',
  meta: 'Dashboards · Landing · Auth',
  status: 'planned',
}
```

### 1.2 Conclusion of the investigation

**Clicking "Templates" does nothing today.** To make it real we need: (a) a place for it to go, (b) a way to display a catalogue of templates, (c) a way to preview each template live, and (d) the templates themselves. The landing app already establishes every pattern we need to do this without inventing new infrastructure:

| Need | Existing pattern to reuse |
|---|---|
| A dedicated page for an offering | `pages/ProPage.vue` + a route in `router.ts` (the `/pro` precedent) |
| A section shell (eyebrow → title → lede) | `components/Section.vue` |
| A responsive card grid with deep-links | `components/ComponentGallery.vue` (tiles, `lp-card`, hover, staggered `--reveal-delay`) |
| Live composition from free components | `components/ShowcaseDashboard.vue` (a real dashboard built only from `@dzup-ui/core`) |
| Light/dark theming + FOUC safety | `composables/useTheme.ts`, `ThemeToggle.vue`, the `index.html` IIFE |
| Scroll reveal | `composables/useScrollReveal.ts` (`v-reveal`) |
| Centralised links/config | `config.ts` (`LINKS`, `storybookDocs()`) |

> **Note on free vs pro.** Per `docs/landing.md` §4.6a, some ecosystem offerings (Blocks, Templates) are paid in comparable libraries (PrimeVue, Tailwind Plus). The brief here is explicit: **these Templates are built from the *free* `@dzup-ui/core` components and are themselves free.** Keep the word "Pro" reserved strictly for the paid tier (Ant Design cautionary note in `landing.md` §2.1). Templates carry a **"Free"** badge, never "Pro".

---

## 2. How "Templates" should behave when clicked — the decision

### 2.1 Options considered

| Option | What it is | Pros | Cons |
|---|---|---|---|
| **A. Storybook deep-link** | Templates tile links into Storybook stories (like the component gallery does) | Cheapest; reuses docs infra | Storybook's manager/iframe chrome is wrong for "full-page app starters"; no marketing framing; no viewport/device switching; weak previews |
| **B. In-app gallery + detail routes** *(recommended)* | New `/templates` index route + `/templates/:slug` detail route inside `apps/landing`, each template a real Vue page rendered live | Full control of layout, live re-theming, device/viewport preview, "view code"; on-brand; no Storybook chrome | More to build than a link |
| **C. Separate deployed preview app per template** | Each template is its own deployable mini-app | Cleanest isolation | Heavy ops; over-engineered for static starters; duplicates tooling |

### 2.2 Decision

**Adopt Option B**, with the live preview **isolated in an `<iframe>` that points at a chromeless preview route**. This is the pattern Tailwind Plus / shadcn blocks use and it gives us three things a plain in-page render can't:

1. **Real responsive preview** — the iframe width can be set to phone / tablet / desktop so visitors see the template reflow, without media queries fighting the landing page's own layout.
2. **Style isolation** — the template renders against the token CSS only, not the landing page's section/`lp-*` styles, so previews look exactly like a consumer's app.
3. **Independent theme** — the preview can be toggled light/dark independently of the marketing page.

So, when a visitor clicks **Templates**:

```
Ecosystem grid "Templates" tile
        │  (click — now a router-link, no longer inert)
        ▼
/templates                      ← Templates GALLERY (index)
  • hero strip: "N free templates, built from core"
  • category filter (All · Dashboards · Auth · Marketing · Commerce · Content)
  • responsive grid of template cards (thumbnail + name + category + "Free" badge + stack)
        │  (click a card)
        ▼
/templates/:slug                ← Template DETAIL / PREVIEW
  • title + description + component list ("Built with: DzAppShell, DzTable, …")
  • LIVE preview pane (iframe → /templates/:slug/preview)
      – device toggle: mobile / tablet / desktop
      – theme toggle: light / dark (independent)
      – "Open fullscreen" → /templates/:slug/preview in a new tab
  • "View source" (link to the template's source file on GitHub) + copy-path
  • prev / next template

/templates/:slug/preview        ← CHROMELESS full render (the iframe target & fullscreen target)
```

The Ecosystem **Templates** tile becomes a `router-link` to `/templates`. The other five tiles stay "Planned" until their own offering is built. The top-nav "Ecosystem" link keeps scrolling to `#ecosystem`; optionally add a direct "Templates" entry later.

---

## 3. Information architecture & routing

Add to `apps/landing/src/router.ts` (mirror the `/pro` precedent — lazy-load the pages):

```ts
{ path: '/templates', name: 'templates', component: () => import('./pages/TemplatesPage.vue') },
{ path: '/templates/:slug', name: 'template-detail', component: () => import('./pages/TemplateDetailPage.vue'), props: true },
{ path: '/templates/:slug/preview', name: 'template-preview', component: () => import('./pages/TemplatePreviewPage.vue'), props: true },
```

- `/templates/:slug` and `/templates/:slug/preview` must **404-redirect to `/templates`** when `slug` is unknown (resolve against the registry, else `router.replace('/templates')`).
- The **preview route uses a bare layout** (no `TopNav`/`Footer`). The app shell (`App.vue`) renders `TopNav`/`Footer` around `<router-view>`; gate them off for `route.name === 'template-preview'` (e.g. `v-if="!isPreview"`), so the iframe content is chromeless.
- `scrollBehavior` already handles hashes; keep it.

---

## 4. Data model

Create `apps/landing/src/templates/registry.ts` (sibling concept to `data.ts`, but templates are richer than the flat `ECOSYSTEM` items, so they get their own module). Each template is described by metadata; the **rendered page** is a lazy-loaded component.

```ts
import type { Component } from 'vue'

export type TemplateCategory =
  | 'dashboards' | 'auth' | 'marketing' | 'commerce' | 'content' | 'utility'

export interface TemplateMeta {
  /** URL slug, e.g. 'analytics-dashboard'. Unique. */
  slug: string
  /** Display name, e.g. 'Analytics Dashboard'. */
  name: string
  /** One-line description for the card + detail header. */
  blurb: string
  /** Primary category (drives the filter). */
  category: TemplateCategory
  /** The @dzup-ui/core components this template is built from (for the "Built with" list). */
  stack: string[]
  /** lucide icon key (icons.ts) for the card when no thumbnail is ready. */
  icon: string
  /** Optional static thumbnail (screenshot) path; falls back to a live mini-render. */
  thumbnail?: string
  /** Lazy import of the full-page template component (the chromeless render). */
  load: () => Promise<{ default: Component }>
  /** Path to the source file, for "View source" deep-links. */
  source: string
  /** 'free' for all of these (reserve 'pro' for the paid tier). */
  tier: 'free'
  /** Optional: marks the 3–4 best templates to feature first on the gallery. */
  featured?: boolean
}

export const TEMPLATE_CATEGORIES: { key: TemplateCategory; label: string }[] = [
  { key: 'dashboards', label: 'Dashboards & Apps' },
  { key: 'auth', label: 'Auth & Account' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'commerce', label: 'Commerce' },
  { key: 'content', label: 'Content' },
  { key: 'utility', label: 'Utility' },
]

export const TEMPLATES: TemplateMeta[] = [ /* one entry per §6 catalogue row */ ]

export function getTemplate(slug: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.slug === slug)
}
```

Each template's render lives at `apps/landing/src/templates/<slug>/<Name>.vue`. Co-locate any sample data the template needs (`<slug>/data.ts`) so templates are self-contained and copy-pasteable.

---

## 5. The preview experience (UX spec)

The detail page (`/templates/:slug`) is the conversion surface — it must *show, don't tell*, exactly like the landing page's live showcase.

- **Preview pane:** an `<iframe>` whose `src` is `/templates/:slug/preview`. Default device = desktop (100% width). A `DzSegmented` device switcher sets the iframe's rendered width: `mobile` 390px · `tablet` 768px · `desktop` 100%. Animate width changes. Center narrower widths on a tinted "stage".
- **Theme:** a light/dark toggle scoped to the preview. Implement by passing `?theme=dark` to the preview route and setting `data-theme` on the iframe document's `<html>` (the preview page reads the query param on mount). This is independent of the marketing page's theme.
- **Fullscreen:** "Open fullscreen" opens `/templates/:slug/preview` in a new tab (real, shareable URL).
- **Built with:** render `stack` as a row of `DzBadge variant="outline"` chips; each links to that component's Storybook docs via `storybookDocs()` from `config.ts`.
- **View source:** a `DzButton variant="outline"` linking to the template's `source` on GitHub, plus a `DzCopyButton` to copy the source path.
- **Prev / next:** navigate within the same category, then across categories, so visitors can browse the whole set.
- **Performance:** the iframe should lazy-load (`loading="lazy"`); on the gallery, prefer static `thumbnail` screenshots over live iframes per card (24 live iframes would be heavy). One live iframe on the detail page is fine.
- **Accessibility:** the iframe needs a `title`; device/theme toggles are real buttons with labels; honour `prefers-reduced-motion` for the width animation; the gallery grid is a `<ul>`/`<li>` with card-cover links (reuse the `ComponentGallery` `tile-link-cover` technique).

---

## 6. The template catalogue (what we will ship)

**24 ready-made templates** across 6 categories, every one built **only from free `@dzup-ui/core` components**. The count gives the gallery a strong headline ("24 free templates"). Components named below are all confirmed exports of `@dzup-ui/core` (see Appendix A). The flagship reference already exists in spirit as `ShowcaseDashboard.vue`.

### 6.1 Dashboards & Apps (8)

| Done | slug | Name | Built with (free core components) |
|---|---|---|---|
| [ ] | `analytics-dashboard` | Analytics Dashboard ⭐ | DzAppShell, DzSidebar(+Item/Section/Header/Footer), DzStatCard, DzCard, DzTable, DzProgress, DzBadge, DzSegmented, DzSearchInput, DzAvatar |
| [ ] | `admin-crm` | Admin / CRM | DzAppShell, DzSidebar, DzDataGrid(+Header/Body/Pagination), DzPagination, DzSearchInput, DzDropdownMenu, DzAvatar, DzBadge, DzTabs, DzButton |
| [ ] | `project-board` | Project / Task Board | DzAppShell, DzCard, DzList(+Item), DzCheckbox, DzAvatarGroup, DzTag, DzProgress, DzTabs, DzBadge |
| [ ] | `app-settings` | App Settings | DzAppShell, DzTabs, DzFormField, DzInput, DzSwitch, DzSelect, DzRadioGroup, DzDivider, DzButton |
| [ ] | `user-profile` | User Profile | DzCard, DzAvatar, DzDescriptions(+Item), DzTabs, DzBadge, DzTimeline(+Item), DzButton |
| [ ] | `billing-plans` | Billing & Plans | DzCard, DzTable, DzBadge, DzButton, DzProgress, DzMeterGroup, DzAlert, DzSegmented |
| [ ] | `team-members` | Team Members | DzDataGrid, DzAvatar, DzBadge, DzDropdownMenu, DzDialog(+Content/Title), DzMultiSelect, DzButton |
| [ ] | `inbox-notifications` | Inbox / Notifications | DzAppShell, DzList(+Item), DzAvatar, DzBadge, DzTabs, DzEmpty, DzButton |

### 6.2 Auth & Account (5)

| Done | slug | Name | Built with |
|---|---|---|---|
| [ ] | `sign-in` | Sign In ⭐ | DzCard, DzFormField, DzInput, DzPasswordInput, DzCheckbox, DzButton, DzDivider |
| [ ] | `sign-up` | Sign Up | DzCard, DzFormField, DzInput, DzPasswordInput, DzCheckbox, DzButton, DzDivider |
| [ ] | `reset-password` | Forgot / Reset Password | DzCard, DzFormField, DzInput, DzButton, DzResult |
| [ ] | `verify-otp` | OTP / 2FA Verify | DzCard, DzOtpInput, DzButton, DzCountdown, DzText |
| [ ] | `onboarding-wizard` | Onboarding Wizard | DzStepper(+Item), DzFormField, DzInput, DzSelect, DzRadioGroup, DzProgress, DzButton |

### 6.3 Marketing (4)

| Done | slug | Name | Built with |
|---|---|---|---|
| [ ] | `saas-landing` | SaaS Landing ⭐ | DzButton, DzCard, DzBadge, DzAvatar, DzAccordion(+Item/Trigger/Content), DzCarousel(+Slide/Dots), DzImage |
| [ ] | `pricing` | Pricing Page | DzCard, DzBadge, DzSegmented, DzButton, DzTable, DzTooltip(+Content/Trigger) |
| [ ] | `feature-product` | Feature / Product | DzCard, DzTabs, DzImage, DzImageComparison, DzBadge |
| [ ] | `changelog-roadmap` | Changelog / Roadmap | DzTimeline(+Item), DzBadge, DzCard, DzTag, DzText |

### 6.4 Commerce (4)

| Done | slug | Name | Built with |
|---|---|---|---|
| [x] | `product-listing` | Product Listing | DzImageCard, DzBadge, DzRating, DzSelect, DzCheckboxGroup, DzRangeSlider, DzPagination |
| [x] | `product-detail` | Product Detail ⭐ | DzBreadcrumb, DzImage, DzRating, DzBadge, DzNumberInput, DzButton, DzTag, DzTabs, DzAccordion, DzCard, DzAvatar |
| [x] | `checkout` | Checkout | DzStepper, DzFormField, DzInput, DzSelect, DzRadioGroup, DzNumberInput, DzCheckbox, DzAlert, DzCard, DzBadge, DzButton |
| [x] | `order-tracking` | Order Tracking | DzResult, DzStepper, DzTimeline, DzDescriptions, DzCard, DzBadge, DzDivider, DzButton |

> Note: `checkout` and `order-tracking` are deliberately re-skinned away from the
> headphone storefront's indigo — emerald and teal respectively — by remapping
> `--dz-primary` to another semantic token at the template root (token-only, no
> raw hex, correct in light + dark). They form a browse → view → buy → track
> journey with the two product pages.

### 6.5 Content (6)

| Done | slug | Name | Built with |
|---|---|---|---|
| [x] | `blog-index` | Blog Index | DzImageCard, DzTag, DzPagination, DzAvatar, DzSearchInput |
| [x] | `blog-post` | Blog Post / Article ⭐ | DzHeading, DzText, DzBlockquote, DzCodeBlock, DzAnchor, DzImage, DzImageCard, DzAvatar, DzTag, DzDivider, DzCard |
| [x] | `help-center` | Help Center / FAQ | DzSearchInput, DzCard, DzAccordion(+Item/Trigger/Content), DzAlert, DzTag, DzBadge, DzAvatar, DzButton |
| [x] | `changelog` | Changelog / Releases | DzTimeline(+Item), DzCard, DzBadge, DzTag, DzCodeBlock, DzDivider, DzButton |
| [x] | `docs-guide` | Docs / Guide | DzBreadcrumb(+Item), DzAnchor, DzAlert, DzCodeBlock, DzSearchInput, DzBadge, DzDivider, DzButton |
| [x] | `newsroom` | Newsroom / Press | DzCard, DzList(+Item), DzBadge, DzAvatar, DzDivider, DzButton, DzHeading, DzText |

### 6.6 Utility (4)

| Done | slug | Name | Built with |
|---|---|---|---|
| [x] | `states-pack` | Empty & Error States | DzEmpty, DzResult, DzCard, DzButton, DzHeading, DzText |
| [x] | `not-found` | 404 — Page Not Found | DzResult, DzCard, DzButton, DzDivider, DzText |
| [x] | `system-status` | System Status | DzAlert, DzCard, DzBadge, DzProgress, DzTimeline, DzDivider, DzHeading, DzText, DzButton |
| [x] | `maintenance` | Scheduled Maintenance | DzCard, DzProgress, DzInput, DzButton, DzBadge, DzDivider, DzHeading, DzText |

> ⭐ = **featured** (`featured: true`) — the strongest first impression for the gallery's lead row. Build these first as the canonical references (T2 below).

---

## 7. Visual & quality bar (applies to every template)

Carry the same rules the library and landing page already enforce — a template that breaks these is not "beautiful and functional", it's off-brand:

- **Token-only styling.** Never raw hex / hardcoded Tailwind colors — only `var(--dz-*)` (ADR-04). Layout CSS (grid/flex/spacing) is fine in `<style scoped>`; **color, radius, shadow, font** come from tokens.
- **Built from `@dzup-ui/core`** wherever a component exists; drop to raw markup only for pure layout scaffolding.
- **Light & dark verified.** Every template must look right in both themes (the preview toggle is the proof).
- **Responsive.** Must reflow cleanly at mobile (390px) and desktop. The detail-page device switcher will expose any breakage.
- **Accessible (WCAG AA).** Semantic landmarks, one logical heading order per template, keyboard reachable, visible focus, labelled controls — inherited from core components when used correctly.
- **Realistic sample content.** Plausible names, numbers, copy (see `ShowcaseDashboard.vue`'s `rows`) — never lorem ipsum in hero positions.
- **Self-contained & copy-pasteable.** Co-locate sample data; no dependency on landing-page-only styles (`lp-*`).
- **Motion restrained**, `prefers-reduced-motion` honoured (landing.md §7).

---

## 8. Implementation tasks

Tasks are ordered. **T1 → T2 → T3 are foundational and sequential.** T4–T9 (the template batches) can run in parallel **after** T3 lands the reference templates and the preview shell. T10 is the closing QA gate.

Each task is a ready-to-use prompt. When executing one, paste it as the instruction and let the executor read the referenced files.

Mark a task `[x]` when its acceptance criteria are met. Checklist:

- [ ] **T1** — Foundation: registry, routing, clickable Templates tile
- [ ] **T2** — Templates gallery page (`/templates`)
- [ ] **T3** — Preview shell + detail page + 3 featured reference templates
- [ ] **T4** — Dashboards batch (7 templates)
- [ ] **T5** — Auth batch (4 templates)
- [ ] **T6** — Marketing batch (3 templates)
- [ ] **T7** — Commerce batch (3 templates)
- [ ] **T8** — Content batch (3 templates)
- [ ] **T9** — Utility batch (1 template)
- [ ] **T10** — QA, accessibility & build verification

---

### [x] T1 — Foundation: registry, routing, and the clickable Templates tile

```xml
<role>
You are a senior Vue 3 + TypeScript engineer working in the dzup-ui monorepo's
landing app (apps/landing). You follow the repo's existing conventions exactly.
</role>

<context>
The landing page's Ecosystem grid (apps/landing/src/components/EcosystemGrid.vue,
fed by ECOSYSTEM in apps/landing/src/data.ts) shows a "Templates" tile that is
currently inert ("Planned" badge, no link). We are turning Templates into a real,
free offering: a gallery of full-page starters built from @dzup-ui/core. This
task builds ONLY the foundation — data model, routes, and making the tile
clickable. It renders NO templates yet (those come in later tasks).
Read first: docs/templates.md §3, §4; apps/landing/src/router.ts;
apps/landing/src/data.ts; apps/landing/src/components/EcosystemGrid.vue;
apps/landing/src/pages/ProPage.vue; apps/landing/src/config.ts.
</context>

<task>
1. Create apps/landing/src/templates/registry.ts implementing the TemplateMeta
   interface, TemplateCategory union, TEMPLATE_CATEGORIES, an EMPTY (for now)
   TEMPLATES array, and getTemplate(slug). Match the JSDoc/comment density of
   data.ts.
2. Add three lazy routes to router.ts (/templates, /templates/:slug,
   /templates/:slug/preview) per docs/templates.md §3, including the
   unknown-slug → /templates redirect guard.
3. In App.vue, suppress TopNav and Footer when route.name === 'template-preview'
   so the preview render is chromeless.
4. In data.ts, give the Templates ECOSYSTEM item a way to be interactive: add an
   optional `href?: string` to EcosystemItem and set it to '/templates' on the
   Templates item only. In EcosystemGrid.vue, render items WITH an href as a
   router-link (whole-card cover link, reuse ComponentGallery's tile-link-cover
   technique) and items WITHOUT one exactly as today ("Planned", inert). Replace
   the Templates "Planned" badge with a "Free" badge (tone="success").
</task>

<constraints>
- TypeScript strict; no `any`. Use `.ts` extensions in relative imports (repo rule).
- Token-only styling; no raw colors; no new color literals.
- Do NOT touch the other five Ecosystem tiles' behaviour.
- Do NOT create template pages or gallery UI here — keep scope to foundation.
- vue-tsc must pass (`yarn typecheck`). ESLint cannot run locally — do not rely on it.
</constraints>

<deliverables>
registry.ts, edited router.ts, edited App.vue, edited data.ts, edited
EcosystemGrid.vue. A short note of any deviation from §3/§4.
</deliverables>

<acceptance_criteria>
- Clicking the Templates tile navigates to /templates (which may render a stub).
- The other five tiles are unchanged and still inert.
- /templates/<unknown> redirects to /templates.
- Visiting a /preview route shows no TopNav/Footer.
- `yarn typecheck` passes with 0 errors.
</acceptance_criteria>

<thinking>
Before writing code, restate the EcosystemItem type change and confirm it is
backwards-compatible with the five inert tiles. Confirm how App.vue currently
lays out router-view and where to gate the chrome.
</thinking>
```

---

### [x] T2 — The Templates gallery page (`/templates`)

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and UI designer building the
marketing-grade gallery index for dzup-ui Templates.
</role>

<context>
T1 has landed registry.ts, routing, and the clickable tile. Now build the gallery
that lists all templates with a category filter. Reuse existing landing patterns —
do not invent new layout primitives.
Read first: docs/templates.md §2.2, §5, §6; apps/landing/src/components/
ComponentGallery.vue (the closest pattern: Section + lp-card grid + cover links +
staggered --reveal-delay); apps/landing/src/components/Section.vue;
apps/landing/src/templates/registry.ts; apps/landing/src/config.ts.
</context>

<task>
Create apps/landing/src/pages/TemplatesPage.vue:
- A Section header: eyebrow "Templates", title "{N} free templates, built from
  core" (N = TEMPLATES.length), a lede, and a "Free · MIT" note.
- A category filter using DzSegmented (All + the TEMPLATE_CATEGORIES labels),
  driven by a ref; filtering is client-side over TEMPLATES.
- A responsive card grid (3 / 2 / 1 cols like ComponentGallery). Each card:
  template name, category label, a "Free" DzBadge, the stack as small muted
  text, an icon or thumbnail, and a whole-card router-link to
  /templates/:slug (tile-link-cover technique). Featured templates first.
- Empty-filter safety: if a category has no templates, show DzEmpty.
</task>

<constraints>
- Token-only styling; mirror ComponentGallery's CSS structure and class naming.
- Use @dzup-ui/core components (DzBadge, DzText, DzSegmented, DzEmpty) — not raw markup — for anything a component covers.
- Cards must be keyboard-navigable with visible focus (copy tile-link-cover focus style).
- No live iframes on the gallery (perf) — icon/thumbnail only.
- vue-tsc clean.
</constraints>

<deliverables>
TemplatesPage.vue, plus any icon additions to apps/landing/src/icons.ts needed
for the category/template icons.
</deliverables>

<acceptance_criteria>
- /templates lists all registered templates; count in the title is derived, not hardcoded.
- The DzSegmented filter narrows the grid live; "All" shows everything.
- Each card links to its detail route; whole card is the click target; focus ring visible.
- Looks correct in light and dark, at 390px and desktop widths.
- `yarn typecheck` passes.
</acceptance_criteria>
```

---

### [x] T3 — Preview shell + detail page + the 3 featured reference templates

```xml
<role>
You are a senior Vue 3 + TypeScript engineer establishing the canonical preview
experience and the first three reference templates that all later templates copy.
</role>

<context>
This task creates the preview infrastructure AND the three featured (⭐) templates
that prove it end to end: analytics-dashboard, sign-in, saas-landing. Later batch
tasks (T4–T9) will imitate these. Get the quality bar right here.
Read first: docs/templates.md §5 (preview UX), §6 (catalogue rows for the 3
featured), §7 (quality bar); apps/landing/src/components/ShowcaseDashboard.vue
(the gold-standard live composition — imitate its realism and token use);
Section.vue; config.ts (storybookDocs, LINKS).
</context>

<task>
1. TemplatePreviewPage.vue (route /templates/:slug/preview): resolves the slug via
   getTemplate(), lazy-loads template.load(), renders it chromeless. Reads ?theme=
   from the query and applies data-theme to the document. Unknown slug → redirect
   to /templates.
2. TemplateDetailPage.vue (route /templates/:slug): the conversion surface per §5 —
   title, blurb, "Built with" badges linking to Storybook via storybookDocs(),
   a live <iframe src="/templates/:slug/preview"> with a DzSegmented device
   switcher (mobile 390 / tablet 768 / desktop 100%), an independent light/dark
   toggle (drives the iframe ?theme), an "Open fullscreen" link (new tab), a
   "View source" DzButton + DzCopyButton, and prev/next navigation within TEMPLATES.
3. Build the three featured templates as full-page chromeless components under
   apps/landing/src/templates/<slug>/<Name>.vue, each with co-located sample data,
   built ONLY from the free core components listed in their §6 rows, honouring §7.
4. Register all three in registry.ts TEMPLATES with correct metadata and featured: true.
</task>

<constraints>
- §7 quality bar is mandatory (token-only color/radius/shadow/font, light+dark,
  responsive, WCAG AA, realistic content, self-contained, restrained motion).
- Templates must NOT import landing-only lp-* styles; they stand alone.
- iframe must have a title; device width animation respects prefers-reduced-motion.
- vue-tsc clean. Validate via `vite build` for apps/landing (ESLint is unavailable locally).
</constraints>

<deliverables>
TemplatePreviewPage.vue, TemplateDetailPage.vue, three template folders with
components + data, updated registry.ts.
</deliverables>

<acceptance_criteria>
- /templates/analytics-dashboard shows the detail page with a working live preview.
- Device switcher reflows the preview; theme toggle re-skins ONLY the preview.
- "Open fullscreen" opens the chromeless render at its own URL.
- "Built with" badges deep-link to the right Storybook docs pages.
- All three templates pass §7 in both themes at mobile + desktop.
- `vite build` (apps/landing) succeeds; `yarn typecheck` passes.
</acceptance_criteria>

<example>
The analytics-dashboard template should read like ShowcaseDashboard.vue promoted to
a full page: an app shell with DzSidebar, a toolbar, a DzStatCard row, a chart card,
a DzTable of members, and a side column — all live @dzup-ui/core, all token-styled,
correct in light and dark.
</example>
```

---

### [x] T4–T9 — Template authoring batches (one batch per remaining category)

These six tasks share one **reusable authoring prompt**. For each, fill the
`<batch>` block with the category's catalogue rows from §6 and run it. Each batch
depends only on T3 (the shell + reference templates) and can run in parallel.

| Task | Batch | Templates (slugs) |
|---|---|---|
| **T4** | Dashboards (remaining) | admin-crm, project-board, app-settings, user-profile, billing-plans, team-members, inbox-notifications |
| **T5** | Auth (remaining) | sign-up, reset-password, verify-otp, onboarding-wizard |
| **T6** | Marketing (remaining) | pricing, feature-product, changelog-roadmap |
| **T7** | Commerce | product-listing, product-detail, checkout |
| **T8** | Content | blog-index, blog-post, docs-page |
| **T9** | Utility | states-pack |

**Reusable authoring prompt:**

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and product designer building
production-grade, free page templates for dzup-ui from the @dzup-ui/core library.
</role>

<context>
The Templates gallery, detail/preview shell, and three featured reference
templates already exist (docs/templates.md T2, T3). You are adding more templates
that must match those references exactly in structure, quality and registration.
Read first, every time:
- docs/templates.md §6 (your batch's rows: exact slug, name, blurb, category, stack)
  and §7 (the non-negotiable quality bar).
- apps/landing/src/templates/analytics-dashboard/ (or sign-in / saas-landing) as the
  structural reference to imitate.
- apps/landing/src/components/ShowcaseDashboard.vue for realism and token usage.
- apps/landing/src/templates/registry.ts for the registration shape.
- Appendix A of docs/templates.md to confirm a component name is a real core export
  before using it. If a needed component does not exist, choose the closest real one
  and note the substitution — never invent an import.
</context>

<batch>
<!-- Paste this batch's §6 rows here. For EACH template, list: slug, name, blurb,
     category, and the exact "Built with" component list. -->
</batch>

<task>
For each template in <batch>:
1. Create apps/landing/src/templates/<slug>/<Name>.vue — a full-page, chromeless
   component built ONLY from the listed free core components, with realistic
   co-located sample data (<slug>/data.ts when non-trivial).
2. Register it in registry.ts TEMPLATES with accurate metadata (slug, name, blurb,
   category, stack, icon, load, source, tier: 'free').
3. Verify it renders correctly via the existing /templates/<slug> detail preview in
   BOTH themes and at mobile (390px) + desktop.
</task>

<constraints>
- §7 quality bar is mandatory and checked per template.
- Token-only color/radius/shadow/font; layout CSS may be scoped; no raw colors.
- Use the real component for anything core covers; raw markup only for layout scaffold.
- Self-contained: no lp-* landing styles, no cross-template imports.
- TypeScript strict, `.ts` import extensions, vue-tsc clean.
- Validate with `vite build` (apps/landing). ESLint is unavailable locally.
</constraints>

<deliverables>
One folder per template (component + optional data), and the registry.ts additions.
A one-line-per-template self-check confirming light/dark + responsive were verified,
plus any component substitutions made.
</deliverables>

<acceptance_criteria>
- Every batch template appears on /templates, filters under the correct category,
  and previews live on its detail page.
- Each passes §7 in both themes at mobile + desktop.
- No invented imports; every import resolves from @dzup-ui/core (Appendix A).
- `vite build` succeeds; `yarn typecheck` passes.
</acceptance_criteria>

<thinking>
Before coding each template, sketch its layout in 3–5 bullets and map each region to
a specific core component from the stack. If a region has no matching component, decide
the closest real substitute and record it. Only then write the .vue file.
</thinking>
```

---

### [x] T10 — QA, accessibility & build verification (closing gate)

```xml
<role>
You are a meticulous quality engineer auditing the complete Templates feature
before it ships.
</role>

<context>
All 24 templates (§6), the gallery (T2), and the detail/preview shell (T3) are
implemented. Verify the whole feature against the spec and the quality bar.
Read first: docs/templates.md §5, §6, §7; the executed T1–T9 output.
</context>

<task>
1. Confirm TEMPLATES has all 24 slugs from §6, each with complete metadata and a
   working load() — no dead routes, no missing detail pages.
2. For each template: verify it renders in light AND dark, reflows at 390/768/desktop,
   has one logical heading order, keyboard-reachable controls with visible focus, and
   uses ONLY token-based color/radius/shadow/font (grep for raw hex / hardcoded
   Tailwind color classes inside src/templates — report any).
3. Verify the gallery count is derived, the category filter covers every template,
   DzEmpty shows for an empty filter, and prev/next traverses the full set.
4. Verify "Built with" badges deep-link to valid Storybook docs ids; "View source"
   paths resolve; "Open fullscreen" loads the chromeless render.
5. Run `yarn typecheck` and `vite build` (apps/landing); both must pass.
</task>

<deliverables>
A checklist report: per-template pass/fail on §7, a list of any raw-color or a11y
violations with file:line, and the typecheck/build results. Fix or file follow-ups
for every failure.
</deliverables>

<acceptance_criteria>
- 24/24 templates reachable, registered, and previewing in both themes.
- Zero raw-color violations inside src/templates.
- `yarn typecheck` = 0 errors; `vite build` (apps/landing) succeeds.
</acceptance_criteria>
```

---

## 9. Open decisions (confirm before building)

1. **Thumbnails:** static screenshots (sharper, need a capture step + committed images) vs live mini-renders on cards (zero assets, heavier). Recommendation: ship with icon placeholders (T2), add screenshots in a polish pass.
2. **"Copy the code" depth:** link to GitHub source only (cheap) vs an in-page source viewer with `DzCodeBlock` + `DzCopyButton` (stronger, more work). Recommendation: GitHub link now, in-page viewer later.
3. **Nav entry:** keep only the `#ecosystem` scroll, or add a top-level "Templates" nav link once the gallery exists. Recommendation: add it after T2.
4. **Pro templates later:** if a future paid tier adds premium templates, the `tier` field already exists — gate with a "Pro" badge then (keep "Pro" reserved for paid). **This is now specified in [§10](#10-pro-templates-paid-tier) — the pro-template catalogue and task backlog (T11–T14).**
5. **Storybook vs landing as the home for templates:** this doc commits to the landing app (Option B). Reconfirm before T1 if Storybook deep-linking (Option A) is preferred for cost reasons.

---

## 10. Pro templates (paid tier)

> **Added 2026-06-23.** §1–§9 above cover the **free** templates built from `@dzup-ui/core`. This section answers a follow-up question: *can we also ship **pro** templates built from the enterprise `@dzup-ui-pro/pro` components, surfaced in the same gallery but marked as a paid option?* The investigation below says **yes**, with no new infrastructure — only a small foundation delta and a "Pro" badge. The pro task backlog (T11–T14) follows the same prompt-authoring format as §8.

### 10.1 Feasibility — is this possible?

**Yes.** The blocker one might expect — "the landing app only depends on `@dzup-ui/core`, it can't see pro components" — does not apply here, because of how the monorepo is wired:

| Question | Finding | Source |
|---|---|---|
| Is the pro package reachable from `apps/landing`? | **Yes.** The repo root (`dzup-ui-workspace`) declares one Yarn workspace that includes **both** `dzup-ui/apps/*` **and** `dzup-ui-pro/packages/*`. So `@dzup-ui-pro/pro` resolves as a normal `workspace:*` dependency the landing app can add. | root `package.json` `workspaces` |
| What pro components exist? | **41 components across 8 families** — builders, business, communication, data-pro, editors, planning, visualization, workflow. Full list in **Appendix B**. | `dzup-ui-pro/packages/pro/src/components/*/index.ts` |
| Where are they documented? | Pro Storybook (`dzup-ui-pro/apps/storybook`), published at `/pro/` in Phase 2. Story ids follow `pro-<family>-<dzcomponent>` (e.g. `pro-planning-dzgantt`). | pro stories `title: 'Pro/Planning/DzGantt'` |
| Does the data model already allow it? | **Yes.** `TemplateMeta.tier` exists precisely for this (§4); today it is the literal `'free'`. Widening it to `'free' | 'pro'` is the only type change. | §4; §9 decision #4 |
| Does the gallery/preview infra need changes? | **No structural change.** The gallery, detail page, chromeless preview iframe, device + theme toggles (T1–T3) are tier-agnostic. Pro templates are just registry rows with `tier: 'pro'`, a Pro badge, and pro-Storybook deep-links. | §2.2, §3, §5 |

**Conclusion.** Pro templates are an *additive* extension of the free system, not a parallel build. They live in the **same** `apps/landing` gallery, render through the **same** preview shell, and reuse the **same** card/detail components — they only differ by (a) importing from `@dzup-ui-pro/pro`, (b) carrying a **"Pro"** badge instead of "Free", and (c) deep-linking "Built with" chips to the **pro** Storybook.

### 10.2 Free vs Pro — what changes

- **Badge.** Free templates carry a `DzBadge variant="solid" tone="success"` reading **"Free"**. Pro templates carry a `DzBadge variant="solid" tone="primary"` reading **"Pro"** (a visually distinct, premium-reading chip). The word "Pro" stays reserved for the paid tier (consistent with `landing.md` §2.1).
- **Dependency.** `apps/landing/package.json` gains `"@dzup-ui-pro/pro": "workspace:*"`. Pro templates may still use free `@dzup-ui/core` components for layout scaffolding (the pro components are built *on top of* core), so a pro template's "Built with" list mixes pro + core.
- **Docs deep-links.** Free "Built with" chips link via `storybookDocs()` → `/storybook/`. Pro chips link via a new `proStorybookDocs()` → `/pro/` (Phase 2 target; Phase 1 it resolves to the `/pro` coming-soon route).
- **Phase gating.** The Pro funnel is currently Phase 1 (`PRO_LIVE = false` in `config.ts`, `landing.md` §13). Pro template **previews still render live** (the components physically exist in the repo) — that *is* the conversion surface — but the detail page surfaces a Pro badge + an "Explore Pro / Join the waitlist" CTA (mirroring `landing.md`'s Phase-1 pro treatment) rather than implying the template is free to copy. Flip to a live "Get the source" affordance in Phase 2 alongside the rest of the pro funnel.
- **Filter.** The gallery filter gains the pro categories (§10.4) and a **tier toggle** (All · Free · Pro) so visitors can narrow to either tier.

### 10.3 Dependency on the free foundation

Pro tasks **T11–T14 depend on the free T1–T3** having landed (the registry, routing, gallery, and preview shell). They extend that foundation; they do not re-create it. Run the pro backlog after T3, in parallel with or after the free batches T4–T9.

### 10.4 The pro template catalogue (what we will ship)

**12 pro templates across 6 pro-flavoured categories**, each built from `@dzup-ui-pro/pro` (plus free core for scaffolding). Every component named below is a confirmed export (Appendix B). ⭐ = featured reference (build first).

Add these to the `TemplateCategory` union: `analytics`, `productivity`, `collaboration`, `editor`, `builder`, `automation`. Add matching `TEMPLATE_CATEGORIES` rows.

#### 10.4.1 Analytics (2)

| Done | slug | Name | Built with (pro + free core) |
|---|---|---|---|
| [ ] | `enterprise-analytics` | Enterprise Analytics ⭐ `Pro` | DzWorkspaceShell, DzChart, DzScorecard, DzSparkline, DzGauge, DzDataGridPro, DzHeatMap (+ DzCard, DzSegmented, DzBadge) |
| [ ] | `data-explorer` | Data Explorer / BI `Pro` | DzPivotTable, DzQueryBuilder, DzFilterBuilder, DzQuickFilter, DzVirtualTable, DzChart (+ DzButton, DzTabs) |

#### 10.4.2 Productivity (2)

| Done | slug | Name | Built with |
|---|---|---|---|
| [ ] | `project-planner` | Project Planner (Gantt) `Pro` | DzGantt, DzGanttTaskRow, DzScheduler, DzCalendar (+ DzAppShell, DzToolbar, DzBadge) |
| [ ] | `kanban-board` | Kanban Board `Pro` | DzKanban, DzKanbanColumn, DzKanbanCard (+ DzWorkspaceShell, DzAvatarGroup, DzTag) |

#### 10.4.3 Collaboration (2)

| Done | slug | Name | Built with |
|---|---|---|---|
| [ ] | `ai-assistant` | AI Assistant ⭐ `Pro` | DzAiAssistant, DzChat, DzChatMessage, DzAiMarkdown, DzAiCodeBlock, DzToolCallCard (+ DzButton, DzAvatar) |
| [ ] | `team-collaboration` | Team Collaboration `Pro` | DzComments, DzCommentItem, DzReactionPicker, DzNotificationCenter (+ DzAvatar, DzTabs, DzBadge) |

#### 10.4.4 Editors (2)

| Done | slug | Name | Built with |
|---|---|---|---|
| [ ] | `document-editor` | Document Editor `Pro` | DzRichTextEditor, DzMarkdownEditor, DzComments (+ DzToolbar, DzTabs) |
| [ ] | `code-workspace` | Code Workspace `Pro` | DzCodeEditor, DzDiffViewer, DzNotebook, DzNotebookCell, DzJsonEditor (+ DzSidebar, DzTabs) |

#### 10.4.5 Builder (3)

| Done | slug | Name | Built with |
|---|---|---|---|
| [ ] | `form-builder-studio` | Form Builder Studio `Pro` | DzFormBuilder, DzFormBuilderSection, DzFormBuilderField, DzSchemaForm (+ DzAppShell, DzButton) |
| [ ] | `dashboard-builder` | Dashboard Builder `Pro` | DzDashboardBuilder, DzDashboardWidget (+ DzAppShell, DzButton, DzSegmented) |
| [ ] | `report-builder` | Report Builder `Pro` | DzReportBuilder, DzReportBand, DzReportElement (+ DzToolbar, DzButton) |

#### 10.4.6 Automation (1)

| Done | slug | Name | Built with |
|---|---|---|---|
| [ ] | `workflow-designer` | Workflow Designer `Pro` | DzWorkflowDesigner, DzWorkflowNode, DzWorkflowEdge, DzWorkflowToolbar, DzApprovalFlow (+ DzAppShell, DzButton) |

> `Pro` in the Name column denotes a `tier: 'pro'` entry that renders the **"Pro"** badge on its card and detail header. ⭐ = `featured: true`, built first in T12 as the canonical references the rest copy.

### 10.5 Pro task backlog

Tasks follow the same prompt format as §8 and continue the numbering. Checklist:

- [ ] **T11** — Pro foundation: workspace dep, `tier` widening, "Pro" badge, pro-Storybook deep-links, tier filter
- [ ] **T12** — Pro preview proof + the 2 featured reference templates (`enterprise-analytics`, `ai-assistant`)
- [ ] **T13** — Pro authoring batches (remaining 10 templates)
- [ ] **T14** — Pro QA, licensing-state & build verification (closing gate)

---

### [ ] T11 — Pro foundation: dependency, tier widening, "Pro" badge & pro-Storybook links

```xml
<role>
You are a senior Vue 3 + TypeScript engineer working in the dzup-ui monorepo's
landing app (apps/landing). You follow the repo's existing conventions exactly
and respect the free/pro boundary.
</role>

<context>
The free Templates foundation (docs/templates.md T1–T3: registry, routing, gallery,
preview shell) is already in place. We are now ADDITIVELY enabling PRO templates:
full-page starters built from @dzup-ui-pro/pro, shown in the SAME gallery but marked
as a paid option. This task builds ONLY the pro foundation — dependency, type
widening, badge, pro-Storybook deep-links, and the tier filter. It renders NO pro
templates yet (those are T12/T13).
Key facts (verify before coding):
- The repo root package.json defines ONE Yarn workspace covering both dzup-ui/apps/*
  and dzup-ui-pro/packages/*, so @dzup-ui-pro/pro resolves as workspace:*.
- Pro Storybook is published at /pro/ in Phase 2; story ids are
  pro-<family>-<dzcomponent> (e.g. pro-planning-dzgantt). PRO_LIVE is false today.
Read first: docs/templates.md §4, §10.1, §10.2; apps/landing/package.json;
apps/landing/src/templates/registry.ts; apps/landing/src/config.ts;
apps/landing/src/pages/TemplatesPage.vue; docs/landing.md §13 (Phase 1/2 pro funnel).
</context>

<task>
1. Add "@dzup-ui-pro/pro": "workspace:*" to apps/landing/package.json dependencies.
2. In registry.ts: widen TemplateMeta.tier from 'free' to 'free' | 'pro'. Add the six
   pro categories (analytics, productivity, collaboration, editor, builder,
   automation) to the TemplateCategory union and TEMPLATE_CATEGORIES (with labels per
   §10.4). Do NOT add template rows yet.
3. In config.ts: add STORYBOOK_PRO_BASE ('/pro/') and a proStorybookDocs(storyId)
   helper mirroring storybookDocs(). Keep the Phase-1 reality (PRO_LIVE=false) in
   mind — document that Phase 1 these resolve to the /pro coming-soon route.
4. Gallery (TemplatesPage.vue) + card component: render the tier badge from
   meta.tier — tone="success" "Free" for free, tone="primary" "Pro" for pro. Add a
   tier toggle (All · Free · Pro) using DzSegmented alongside the category filter;
   filtering composes (tier AND category) client-side.
</task>

<constraints>
- TypeScript strict; no `any`. `.ts` extensions in relative imports (repo rule).
- Token-only styling; no raw colors. Keep the word "Pro" reserved for the paid tier.
- Do NOT import @dzup-ui-pro/pro into any FREE template or core path — only pro
  templates (T12+) may import it. Respect the free/pro boundary.
- Do NOT build pro template pages here — foundation only.
- vue-tsc must pass (yarn typecheck). ESLint cannot run locally — do not rely on it.
</constraints>

<deliverables>
Edited package.json, registry.ts, config.ts, TemplatesPage.vue (+ card component).
A short note on the Phase-1 (PRO_LIVE=false) handling you chose for pro deep-links.
</deliverables>

<acceptance_criteria>
- @dzup-ui-pro/pro resolves in apps/landing (yarn install clean; an import in a scratch
  file type-checks, then removed).
- registry.tier accepts 'pro'; the six pro categories exist with labels.
- The gallery shows a tier toggle; with zero pro rows yet, "Pro" yields DzEmpty.
- Free cards still show the "Free" badge unchanged.
- `yarn typecheck` passes with 0 errors.
</acceptance_criteria>

<thinking>
Before coding, restate the tier widening and confirm it is backwards-compatible with
the existing free rows (tier: 'free'). Confirm how the existing category filter is
implemented so the tier toggle composes with it rather than replacing it.
</thinking>
```

---

### [ ] T12 — Pro preview proof + the 2 featured reference templates

```xml
<role>
You are a senior Vue 3 + TypeScript engineer establishing the canonical PRO template
experience and the first two reference templates that all later pro templates copy.
</role>

<context>
T11 landed the pro foundation (dependency, tier, badge, pro-Storybook links, tier
filter). The free preview shell (TemplatePreviewPage / TemplateDetailPage, T3) already
exists and is tier-agnostic. This task proves a PRO template renders end-to-end through
that shell, and builds the two featured (⭐) pro references: enterprise-analytics and
ai-assistant. Later batches (T13) imitate these. Get the quality bar right here.
Read first: docs/templates.md §5, §7, §10.2, §10.4 (the two featured rows); Appendix B
(confirm every pro component name); apps/landing/src/templates/analytics-dashboard/
(the FREE flagship, for structure) and ShowcaseDashboard.vue (realism + token use);
config.ts (proStorybookDocs); the pro Storybook stories for DzChart, DzDataGridPro,
DzAiAssistant, DzChat under dzup-ui-pro/packages/pro/stories/ for correct prop usage.
</context>

<task>
1. Confirm the detail page (§5) correctly handles a tier:'pro' template: "Built with"
   chips for pro components deep-link via proStorybookDocs(); free-core chips still use
   storybookDocs(); the detail header shows the "Pro" badge; per §10.2, surface an
   "Explore Pro / Join the waitlist" CTA while PRO_LIVE is false instead of a plain
   free "copy source" affordance. Make the minimal edits to the existing shell to
   support this — do NOT fork it into a pro-only copy.
2. Build the two featured pro templates as full-page chromeless components under
   apps/landing/src/templates/<slug>/<Name>.vue with co-located realistic sample data,
   built from the pro (+ free core) components in their §10.4 rows, honouring §7:
   - enterprise-analytics: a DzWorkspaceShell app — KPI row of DzScorecard + DzSparkline,
     a DzChart panel, a DzGauge, a DzHeatMap, and a DzDataGridPro of records. Reads like
     ShowcaseDashboard.vue promoted to a full pro page.
   - ai-assistant: a DzAiAssistant / DzChat surface with DzChatMessage history,
     DzAiMarkdown + DzAiCodeBlock rendered responses, and a DzToolCallCard.
3. Register both in registry.ts TEMPLATES with tier:'pro', featured:true, correct
   category (analytics / collaboration), stack, icon, load, and source.
</task>

<constraints>
- §7 quality bar is mandatory (token-only color/radius/shadow/font, light+dark,
  responsive, WCAG AA, realistic content, self-contained, restrained motion).
- Pro components may be composed with free core for layout, but use the REAL pro
  component for anything it covers — never re-implement a pro component from scratch.
- No invented imports: every pro import resolves from @dzup-ui-pro/pro (Appendix B);
  confirm prop usage against the pro Storybook stories.
- Templates must NOT import landing-only lp-* styles; they stand alone.
- vue-tsc clean. Validate via `vite build` for apps/landing (ESLint unavailable locally).
</constraints>

<deliverables>
Minimal edits to TemplateDetailPage.vue for pro handling, two template folders
(component + data), updated registry.ts. A one-line self-check per template confirming
light/dark + responsive, plus any component substitutions.
</deliverables>

<acceptance_criteria>
- /templates/enterprise-analytics and /templates/ai-assistant show the detail page with
  a working live preview and a "Pro" badge.
- "Built with" pro chips deep-link to the right pro-Storybook docs ids; free-core chips
  link to the free Storybook.
- Device switcher reflows the preview; theme toggle re-skins ONLY the preview.
- Both templates pass §7 in both themes at mobile (390px) + desktop.
- `vite build` (apps/landing) succeeds; `yarn typecheck` passes.
</acceptance_criteria>

<example>
enterprise-analytics should read like ShowcaseDashboard.vue rebuilt with pro parts: a
DzWorkspaceShell frame, a row of DzScorecard cards with inline DzSparkline trends, a
primary DzChart, a DzGauge for an SLA/quota, a DzHeatMap for activity, and a
DzDataGridPro table — all live @dzup-ui-pro/pro, all token-styled, correct in both themes.
</example>
```

---

### [ ] T13 — Pro authoring batches (remaining 10 templates)

This task uses one **reusable pro authoring prompt**, run once per batch. Each batch
depends only on T12 (the pro references + pro-aware detail page) and can run in parallel.

| Batch | Templates (slugs) |
|---|---|
| Analytics + Productivity | data-explorer, project-planner, kanban-board |
| Collaboration + Editors | team-collaboration, document-editor, code-workspace |
| Builder + Automation | form-builder-studio, dashboard-builder, report-builder, workflow-designer |

**Reusable pro authoring prompt:**

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and product designer building
production-grade, PRO page templates for dzup-ui from the @dzup-ui-pro/pro library.
</role>

<context>
The Templates gallery, tier-aware detail/preview shell, and two featured pro reference
templates already exist (docs/templates.md T11, T12). You are adding more PRO templates
that must match those references exactly in structure, quality and registration.
Read first, every time:
- docs/templates.md §10.4 (your batch's rows: exact slug, name, category, stack),
  §10.2 (Pro badge + pro deep-link behaviour), and §7 (the non-negotiable quality bar).
- apps/landing/src/templates/enterprise-analytics/ (or ai-assistant/) as the structural
  reference to imitate.
- apps/landing/src/templates/registry.ts for the registration shape (tier:'pro').
- Appendix B of docs/templates.md to confirm a pro component name is a real export
  before using it; the matching pro Storybook story (dzup-ui-pro/packages/pro/stories/
  FAMILY/) to confirm its props. If a needed component does not exist, choose the closest
  real one and note the substitution — never invent an import.
</context>

<batch>
<!-- Paste this batch's §10.4 rows here. For EACH template, list: slug, name, category,
     and the exact "Built with" pro + free-core component list. -->
</batch>

<task>
For each template in <batch>:
1. Create apps/landing/src/templates/<slug>/<Name>.vue — a full-page, chromeless
   component built from the listed pro components (free core only for layout scaffold),
   with realistic co-located sample data (<slug>/data.ts when non-trivial).
2. Register it in registry.ts TEMPLATES with accurate metadata (slug, name, blurb,
   category, stack, icon, load, source, tier: 'pro').
3. Verify it renders correctly via the existing /templates/<slug> detail preview in
   BOTH themes and at mobile (390px) + desktop, with the "Pro" badge showing.
</task>

<constraints>
- §7 quality bar is mandatory and checked per template.
- Token-only color/radius/shadow/font; layout CSS may be scoped; no raw colors.
- Use the real pro component for anything it covers; raw markup only for layout scaffold.
- Self-contained: no lp-* landing styles, no cross-template imports.
- No invented imports; every pro import resolves from @dzup-ui-pro/pro (Appendix B),
  every free import from @dzup-ui/core (Appendix A). Confirm props against pro stories.
- TypeScript strict, `.ts` import extensions, vue-tsc clean.
- Validate with `vite build` (apps/landing). ESLint is unavailable locally.
</constraints>

<deliverables>
One folder per template (component + optional data), and the registry.ts additions.
A one-line-per-template self-check confirming light/dark + responsive + Pro badge, plus
any component substitutions made.
</deliverables>

<acceptance_criteria>
- Every batch template appears on /templates, filters under the correct pro category and
  the "Pro" tier, and previews live on its detail page with a "Pro" badge.
- Each passes §7 in both themes at mobile + desktop.
- No invented imports; every import resolves (Appendix A/B).
- `vite build` succeeds; `yarn typecheck` passes.
</acceptance_criteria>

<thinking>
Before coding each template, sketch its layout in 3–5 bullets and map each region to a
specific pro component from the stack (free core only for scaffolding). If a region has
no matching component, decide the closest real substitute and record it. Only then write
the .vue file.
</thinking>
```

---

### [ ] T14 — Pro QA, licensing-state & build verification (closing gate)

```xml
<role>
You are a meticulous quality engineer auditing the complete PRO Templates feature
before it ships.
</role>

<context>
All 12 pro templates (§10.4), the tier filter + "Pro" badge (T11), and the pro-aware
detail/preview shell (T12) are implemented. Verify the whole pro feature against the
spec and the quality bar, and confirm the free templates are unaffected.
Read first: docs/templates.md §5, §7, §10; the executed T11–T13 output.
</context>

<task>
1. Confirm TEMPLATES has all 12 pro slugs from §10.4, each tier:'pro', with complete
   metadata and a working load() — no dead routes, no missing detail pages.
2. For each pro template: verify it renders in light AND dark, reflows at
   390/768/desktop, has one logical heading order, keyboard-reachable controls with
   visible focus, and uses ONLY token-based color/radius/shadow/font (grep for raw hex /
   hardcoded Tailwind color classes inside its folder — report any).
3. Verify the gallery tier toggle (All · Free · Pro) and category filter compose
   correctly; pro cards show the "Pro" badge, free cards the "Free" badge; DzEmpty shows
   for an empty combination; prev/next traverses within the displayed set.
4. Verify "Built with" pro chips deep-link to valid pro-Storybook ids
   (pro-<family>-<dzcomponent>) and free-core chips to the free Storybook; confirm the
   Phase-1 pro CTA (PRO_LIVE=false) renders the waitlist/explore affordance, not a plain
   free "copy source".
5. Confirm the free/pro boundary holds: @dzup-ui-pro/pro is imported ONLY by pro
   templates, never by free templates or core paths (grep src/templates).
6. Run `yarn typecheck` and `vite build` (apps/landing); both must pass.
</task>

<deliverables>
A checklist report: per-template pass/fail on §7, a list of any raw-color / a11y /
boundary violations with file:line, the pro deep-link audit, and the typecheck/build
results. Fix or file follow-ups for every failure.
</deliverables>

<acceptance_criteria>
- 12/12 pro templates reachable, registered as tier:'pro', previewing in both themes.
- Tier toggle + category filter compose correctly; badges correct per tier.
- Zero raw-color violations and zero free→pro import-boundary violations.
- `yarn typecheck` = 0 errors; `vite build` (apps/landing) succeeds.
</acceptance_criteria>
```

---

## Appendix A — Free `@dzup-ui/core` components available to templates

Confirmed exports (from `packages/core/src/components/*/index.ts`). Templates must draw from this set; do not invent names.

- **Buttons:** DzButton, DzButtonGroup, DzCopyButton, DzFab, DzIconButton, DzSpeedDial, DzSplitButton(+Action/Menu), DzToggleButton
- **Cards:** DzCard, DzCardBody, DzCardFooter, DzCardHeader, DzImageCard, DzStatCard
- **Data:** DzAccordion(+Content/Item/Trigger), DzCalendar, DzDataView, DzInfiniteScroll, DzAnimatedNumber, DzCountdown, DzChip, DzCodeBlock, DzDataGrid(+Body/Header/Pagination), DzDescriptions(+Item), DzList(+Item), DzOrderList, DzTable(+Body/Cell/Header/Row), DzTag, DzTimeline(+Item), DzTree(+Item)
- **Feedback:** DzAlert, DzBadge, DzEmpty, DzNotification, DzProgress, DzScrollProgress, DzMeterGroup, DzResult, DzRunStatusBadge, DzSkeleton, DzSpinner, DzToast(+Provider/Viewport), DzErrorBoundary, DzAsyncBoundary, DzBlockUI, DzTokenProgressBar
- **Forms:** DzCheckbox(+Group), DzCascader, DzColorPicker, DzCombobox, DzMention, DzDatePicker, DzDateRangePicker, DzFileUpload, DzFloatLabel, DzFormDescription, DzFormField, DzFormLabel, DzFormMessage, DzKnob, DzListbox, DzMultiSelect, DzPersonaSelector, DzRadio(+Group), DzRating, DzRangeSlider, DzSelect, DzSlider, DzSwitch, DzTagsInput, DzTimePicker, DzTransfer, DzFieldArray, DzInplace, DzTreeSelect
- **Inputs:** DzInput, DzInputGroup, DzInputMask, DzNumberInput, DzOtpInput, DzPasswordInput, DzSearchInput, DzTextarea
- **Layout:** DzAffix, DzAppShell, DzAspectRatio, DzCollapse, DzDeferredContent, DzPanel, DzContainer, DzDivider, DzFlex, DzGrid, DzMasonry, DzResizable(+Handle/Panel), DzScrollArea, DzSpacer, DzSplitter(+Handle/Panel), DzStack, DzToolbar
- **Media:** DzAvatar(+Group), DzCarousel(+Dots/Next/Previous/Slide), DzIcon, DzImage, DzImageComparison, DzLightbox, DzQRCode, DzWatermark
- **Navigation:** DzAnchor, DzBackTop, DzColorModeToggle, DzBreadcrumb(+Item/Separator), DzMegaMenu, DzMenu(+Item/Separator), DzPagination, DzSegmented, DzSidebar(+Footer/Header/Item/Section), DzStepper(+Item), DzTabs(+TabList/TabTrigger/TabContent)
- **Overlays:** DzCommandPalette, DzConfirmDialog, DzContextMenu(+Content/Item/Separator/Trigger), DzDialog(+Close/Content/Description/Overlay/Title/Trigger), DzDropdownMenu(+Content/Item/Separator/Trigger), DzPopover(+Content/Trigger), DzPopconfirm, DzSheet(+Close/Content/Description/Title/Trigger), DzTour, DzTooltip(+Content/Trigger)
- **Typography:** DzBlockquote, DzCaption, DzCode, DzKbd, DzHeading, DzText, DzVisuallyHidden, DzRelativeTime

---

## Appendix B — Pro `@dzup-ui-pro/pro` components available to pro templates

Confirmed exports (from `dzup-ui-pro/packages/pro/src/components/*/index.ts`) — **41 components across 8 families**. Pro templates (§10.4) must draw from this set; do not invent names. Pro components may be composed with the free `@dzup-ui/core` set (Appendix A) for layout scaffolding. Pro Storybook story ids follow `pro-<family>-<dzcomponent>` (e.g. `pro-planning-dzgantt`).

- **builders:** DzDashboardBuilder, DzDashboardWidget, DzFormBuilder, DzFormBuilderField, DzFormBuilderSection, DzSchemaForm, DzReportBand, DzReportBuilder, DzReportElement
- **business:** DzWorkspaceShell, DzAuditLog, DzNotificationCenter, DzFileManager, DzRibbon
- **communication:** DzAiAssistant, DzAiCodeBlock, DzAiMarkdown, DzToolCallCard, DzChat, DzChatMessage, DzCommentItem, DzComments, DzReactionPicker
- **data-pro:** DzDataGridPro, DzDataLineage, DzFilterBuilder, DzPivotTable, DzQueryBuilder, DzQuickFilter, DzVirtualTable
- **editors:** DzCodeEditor, DzJsonEditor, DzMarkdownEditor, DzRichTextEditor, DzPdfViewer, DzSpreadsheet, DzDiffViewer, DzSignaturePad, DzImageEditor, DzNotebook, DzNotebookCell
- **planning:** DzCalendar(+DayView/WeekView/MonthView), DzGantt, DzGanttTaskRow, DzKanban, DzKanbanCard, DzKanbanColumn, DzMindMap, DzScheduler, DzCronEditor
- **visualization:** DzChart, DzChartDataTable, DzDiagramEditor, DzHeatMap, DzTreeMap, DzOrgChart, DzSparkline, DzGauge, DzScorecard, DzGeoMap, DzWhiteboard, DzSankeyDiagram, DzNetworkGraph, DzFunnelChart, DzStockChart, DzSchemaDesigner, DzBarcode
- **workflow:** DzWorkflowDesigner, DzWorkflowEdge, DzWorkflowNode, DzWorkflowToolbar, DzApprovalFlow

> **Note.** `@dzup-ui-pro/pro` is reachable from `apps/landing` only because the repo root declares a single Yarn workspace spanning both `dzup-ui/*` and `dzup-ui-pro/*` (§10.1). Pro templates must import pro components via the package name `@dzup-ui-pro/pro` (workspace dependency), never via a relative path into the sibling package.
