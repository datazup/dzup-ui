# Templates — Best-in-Class Enhancement & Expansion Backlog

> **Status:** Specification + task backlog. The foundation and 24 free templates are **already shipped**; this doc is the plan to make `/templates` best-in-class.
> **Owner:** dzup-ui team · **Last updated:** 2026-06-25
> **Scope:** The **Templates** offering of the dzup-ui ecosystem — full-page / full-app *starters* built from the **free** `@dzup-ui/core` components, surfaced at `/templates` in `apps/landing`. This document reviews what currently ships, distils web + competitor research into a quality and breadth target, and breaks the remaining work into self-contained, executable tasks.
> **Predecessor:** [`docs/templates-old.md`](./templates-old.md) — the original investigation and the T1–T14 build backlog that produced the current gallery, detail/preview shell and the first 24 templates. Read it for the architectural decisions (Option B in-app gallery + iframe preview, the registry data model, routing) that this doc builds on rather than re-deciding.
> **Companion docs:** [`docs/landing.md`](./landing.md) (landing-page spec; §4.6a "Ecosystem"). Pro tier is in [§9](#9-pro-templates-paid-tier).

---

## 0. How to read & execute this document

This doc has two halves. **§1–§5 are the investigation and target** — the current state, the research, the catalogue we are growing into, and the non-negotiable quality bar. **§6–§9 are the task backlog.**

Tasks are written following Anthropic's prompt-engineering guidance ([Prompting best practices](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices)). Each runnable task is a **self-contained prompt** that applies these techniques:

- **Be clear, direct and contextual** — every task states *why* it exists and *who* reads it before *what* to do, and explains the motivation behind constraints (the model generalises from the "why").
- **Give a role** (`<role>`) — sets the executor's expertise and bar.
- **Structure with XML tags** — `<context>`, `<task>`, `<constraints>`, `<deliverables>`, `<acceptance_criteria>`, `<example>`, `<thinking>` so the model parses instructions, inputs and examples unambiguously.
- **Provide examples (multishot)** — each authoring task points at a concrete reference file already in the repo to imitate.
- **Let the model reason** (`<thinking>`) before it writes code, and **ask it to self-check** against the acceptance criteria before finishing.
- **Request "above and beyond"** explicitly — say "go beyond the basics", because vague prompts converge on generic output.
- **Define success criteria** — every task ends with objective, checkable acceptance criteria.

> **Execution note (for `/run-tasks`).** The orchestrator (`scripts/run-tasks.ps1`) runs each open task in a **fresh `claude -p` context**, strictly in order, ticking `[ ] → [x]` as each passes, and **stops on the first failure**. It selects a task by its heading checkbox and sends **the first fenced code block whose body opens with a prompt tag** (`<role>`, `<context>`, `<task>`, …) as the prompt. Therefore: (a) every task that must run headlessly carries its **own** self-contained prompt block; (b) tasks are **ordered so dependencies land first** (registry/data changes before the UI that reads them); (c) Pro tasks live under [§9](#9-pro-templates-paid-tier) (a `## … Pro … (paid tier)` section) and are **parsed but skipped** unless run with `-Tier pro|all`. Do not implement from this doc by hand unless you are executing a single task — the point is a precise brief so the eventual build gets the best result.

---

## 1. Current state — what already ships

The Templates feature is **live and production-ready** (built by templates-old.md T1–T10). Do not rebuild it; this backlog *extends* it.

**Infrastructure (all present, working):**

- `apps/landing/src/templates/registry.ts` — `TemplateMeta` model (`slug`, `name`, `blurb`, `category`, `stack`, `icon`, optional `thumbnail`, lazy `load`, `source`, `tier: 'free'`, `featured?`, decorative `accent?`), the six free `TEMPLATE_CATEGORIES` (each with a display label + spectrum accent), the `TEMPLATES` array (24 rows) and `getTemplate(slug)`.
- `router.ts` — `/templates`, `/templates/:slug`, `/templates/:slug/preview`, each guarded by `resolveTemplateSlug` (unknown slug → `/templates`). The preview route is chromeless (TopNav/Footer suppressed in `App.vue`).
- `pages/TemplatesPage.vue` — gallery: a `Section` header with a derived count, a **`DzSegmented` category filter**, a responsive 3/2/1-col card grid with **per-card spectrum accent tinting**, `DzEmpty` for an empty filter, whole-card cover links, and staggered scroll-reveal.
- `pages/TemplateDetailPage.vue` — the conversion surface: "Built with" `DzBadge` chips deep-linking to Storybook (`componentDocs()`), a **live `<iframe>` preview** with a **device switcher** (mobile 390 / tablet 768 / desktop 100%, animated, reduced-motion aware), an **independent light/dark toggle** (drives `?theme=`), **"Open fullscreen"** (new tab), **"View source"** (GitHub) + **`DzCopyButton`** for the path, and **prev/next** navigation with wraparound.
- `pages/TemplatePreviewPage.vue` — resolves the slug, lazy-loads `template.load()`, reads `?theme=` and applies `data-theme`, renders chromeless.

**The 24 shipped templates** (`tier: 'free'`, built only from `@dzup-ui/core`):

- **Dashboards & Apps (8):** analytics-dashboard ⭐, admin-crm, project-board, app-settings, user-profile, billing-plans, team-members, inbox-notifications
- **Auth (1):** sign-in ⭐
- **Marketing (1):** saas-landing ⭐
- **Commerce (4):** product-detail ⭐, product-listing, checkout (emerald re-skin), order-tracking (teal re-skin)
- **Content (6):** blog-post ⭐, blog-index, help-center, changelog, docs-guide, newsroom
- **Utility (4):** states-pack ⭐, not-found, system-status, maintenance

**Known gaps in the *experience*** (from the implementation audit): no gallery **search**, no **tags** or "New" badge, no **sort**, no **static thumbnails** (icons only — every card looks alike, scales poorly past ~30), no **in-page source/code viewer** (must leave for GitHub), no **per-template SEO** head, no **preview loading state**, no **in-preview theme/colour customisation** beyond light/dark, no **RTL** preview, and the gallery `<ul>` is unlabelled.

**Known gaps in the *catalogue*** (from the competitor benchmark): auth is 1-of-~6, there are **no app templates** (chat, calendar, file manager, tasks, data-table/CRUD list, invoice), marketing is one page (no pricing/feature/contact/about), and the error set lacks **500 / 403 / coming-soon**.

---

## 2. Research — what makes a template gallery best-in-class (2025–2026)

Synthesised from Tailwind Plus, shadcn/ui blocks + v0, Vercel templates, PrimeVue (PrimeBlocks/Sakai/Apollo), Nuxt UI v4, Vuetify, Flowbite, Preline, Origin UI, Magic UI and Aceternity. The patterns below are ranked by impact-to-effort for a small team; the ones we adopt become tasks in §7.

**Discovery (gallery index):**

1. **Static thumbnails, not a wall of icons** — a real screenshot per card lets visitors *recognise* a template at a glance. Universal across the field. (Live previews are reserved for the detail page; N live iframes in a grid is catastrophic for performance.) — *Vercel, shadcn, every theme gallery.*
2. **Paired light/dark thumbnails** — show the template in both themes on the card to advertise first-class dark mode before the click. — *Tailwind Plus, Nuxt UI.*
3. **⌘K command-palette search** — keyboard-first search is expected once a catalogue exceeds ~20 items. dzup-ui already ships `DzCommandPalette`. — *Magic UI, Aceternity, Flowbite, Nuxt UI.*
4. **Intent-based taxonomy with counts** — categories named the way users think ("I need a pricing page"), each showing how many templates it holds. — *Tailwind Plus, PrimeBlocks, Flowbite.*
5. **"New" / "Featured" badges** — surface fresh content so repeat visitors have a reason to return and active maintenance is visible. — *Magic UI, shadcn.*
6. **Sort** (featured / newest / A–Z) — once the catalogue is large. — *Vuetify store.*

**Per-template page:**

7. **Preview / Code tabs with copy** — toggle the live render against a syntax-highlighted source view with one-click copy and an explicit dependency list, so "what will this add to my app?" is answered in-page. dzup-ui ships `DzCodeBlock`, `DzCopyButton`, `DzTabs`. — *shadcn blocks, Aceternity.*
8. **Standalone fullscreen preview route** (already shipped) — a real, resizable, shareable URL; the truest responsive test. — *shadcn.*
9. **In-preview customisation (the differentiator)** — let visitors swap the **primary colour** and toggle **dark mode** live; the most persuasive thing they can do is re-skin the template and watch it hold together. Most indie libraries only toggle light/dark — doing colour well is a real edge, and dzup-ui's token architecture makes it cheap (remap `--dz-primary`). — *PrimeVue configurators.*
10. **RTL toggle in the preview toolbar** — rare in the field (only Flowbite) and a strong quality signal for international audiences. — *Flowbite.*
11. **"Built with these components" → docs** (already shipped) — proves the template is part of a coherent, documented system and routes browsers into the component docs. — *shadcn, PrimeVue.*
12. **Trust framing** — a prominent **"Free · MIT"** note removes adoption anxiety; "yours to keep". — *shadcn, Origin UI.*

**Performance & a11y (hygiene, do alongside):**

13. **Lazy-load previews + reserved space** — `loading="lazy"` (already on the detail iframe), explicit `aspect-ratio` on cards, skeleton/blur-up while thumbnails load → no layout shift.
14. **Pre-generated thumbnails** — screenshot templates at build time (Playwright) and commit optimised images; per-request generation does not scale.
15. **Accessible grid + previews** — grid as a labelled `<ul>/<li>`, real link/button per card (no nested interactives), arrow-key navigation, every preview iframe `title`d, theme/colour swaps announced via `aria-live`. No surveyed gallery did this well — another edge.

**Strategic / AI-native (2025→2026, mostly out of scope for now — see [§8](#8-open-decisions--strategic-ideas)):** registry + CLI distribution (`npx … add`), "Open in v0", an MCP server exposing templates to coding agents, `llms.txt` + "Copy page as Markdown / Copy for LLM". These shift the gallery from "a site you browse" to "a surface agents install from". Vue-native AI distribution is still underserved — high strategic value, but larger than this backlog. We adopt only the cheap slice now: a **"Copy for LLM"** affordance on the detail page (part of E4).

---

## 3. Catalogue benchmark — the breadth gap

Against PrimeVue, CoreUI, Ant Design Pro, MUI, Tailwind Plus, shadcn, Flowbite, Preline, Materio/Vuexy, Refine and Tremor, dzup-ui **leads** on content (newsroom, system-status, maintenance are uncommon) and is solid on commerce basics and core dashboards. The clear, near-universal gaps competitors standardise on:

- **Auth depth** — we ship 1 of ~6. Missing: **sign-up**, **forgot/reset password**, **OTP/2FA verify**, **onboarding/setup wizard** (and a split sign-in variant).
- **App templates** — we ship none of the "apps" every premium suite includes: **chat/messages**, **calendar/scheduler**, **file manager**, **tasks/to-do**, **data-table / CRUD list page**, **invoice**.
- **Marketing breadth** — one landing vs. the field's **pricing**, **feature**, **contact**, **about/FAQ**, **coming-soon**.
- **Error completeness** — we have 404 but not **500**, **403**, or a dedicated success/result page (CoreUI ships 500 even free).
- **Commerce completeness** — we have checkout but not **shopping-cart** or **order-history**.
- **Account depth** — app-settings exists but not a fuller multi-tab **account centre** (profile / security / notifications / billing).

§6 grows the free catalogue from **24 → ~42** to close these, all from `@dzup-ui/core`.

---

## 4. Information architecture — what changes, what stays

The shipped IA from templates-old.md §2–§5 stands. This backlog makes only **additive, backward-compatible** changes:

- **`registry.ts`** gains optional fields (`tags?: string[]`, `createdAt?: string`, `order?`/derived `isNew`) and ~18 new rows. The existing fields and the 24 rows are untouched.
- **`TemplatesPage.vue`** gains search, tag filtering, badges and sort *on top of* the existing category filter and accent tinting — the category filter is not replaced.
- **`TemplateDetailPage.vue`** gains a Preview/Code tab set, a customiser, an RTL toggle and SEO — *on top of* the existing toolbar.
- New templates follow the **exact** shipped pattern: `apps/landing/src/templates/<slug>/<Name>.vue` (+ co-located `data.ts`), registered in `TEMPLATES`, chromeless, self-contained.

No new routes, no new infrastructure, no breaking changes to the data model.

---

## 5. The quality bar (applies to every template and every UI change)

A template or change that breaks these is not "best-in-class", it is off-brand. This is the mandatory `<constraints>` every authoring task inherits.

- **Token-only styling (ADR-04).** Never raw hex or hardcoded Tailwind colours — only `var(--dz-*)`. Layout CSS (grid/flex/spacing) may live in `<style scoped>` inside a *template page* (templates are app code, not library components, so scoped styles are allowed there); **colour, radius, shadow, font come from tokens**. Re-skins (e.g. emerald checkout) remap a semantic token at the template root, never raw colour.
- **Built from `@dzup-ui/core`.** Use the real component wherever one exists (Appendix A); drop to raw markup only for pure layout scaffolding. Never invent an import — if a needed component does not exist, pick the closest real one and note the substitution.
- **Light & dark verified.** Correct in both themes — the preview toggle is the proof.
- **Responsive.** Reflows cleanly at 390 / 768 / desktop. The device switcher will expose breakage.
- **Accessible (WCAG AA).** Semantic landmarks, one logical heading order, keyboard reachable, visible focus, labelled controls — inherited from core components when used correctly.
- **Realistic sample content.** Plausible names, numbers and copy (see `ShowcaseDashboard.vue` / the shipped `*/data.ts`). Never lorem ipsum in hero positions.
- **Self-contained & copy-pasteable.** Co-locate sample data; no dependency on landing-only `lp-*` styles; no cross-template imports.
- **Distinctive, not "AI slop".** Per Anthropic's frontend guidance: commit to a cohesive aesthetic, use atmosphere/depth over flat fills, and reserve motion for high-impact moments (one orchestrated load with staggered reveals beats scattered micro-interactions). Honour `prefers-reduced-motion` (landing.md §7). Avoid clichéd purple-on-white gradients and predictable layouts — each template should feel designed for *its* job.
- **Don't over-engineer.** Build what the spec asks; no speculative abstractions, no config nobody requested.
- **Verify before done.** `yarn typecheck` = 0 errors and `vite build` (apps/landing) succeeds. ESLint cannot run locally — do not rely on it (see [[dzup-ui-local-env]]).

---

## 6. Free catalogue additions (§6 rows the §7 tasks build)

Every component named is a confirmed `@dzup-ui/core` export (Appendix A). ⭐ marks the new reference to build most carefully within its task. Categories reuse the existing six (new app templates fall under **Dashboards & Apps**).

### 6.1 Auth & Account (→ task C1)

| slug | Name | Built with |
|---|---|---|
| `sign-up` | Sign Up ⭐ | DzCard, DzFormField, DzInput, DzPasswordInput, DzCheckbox, DzButton, DzDivider, DzProgress *(password strength)* |
| `reset-password` | Forgot / Reset Password | DzCard, DzFormField, DzInput, DzButton, DzResult, DzAlert |
| `verify-otp` | OTP / 2FA Verify | DzCard, DzOtpInput, DzButton, DzCountdown, DzText, DzAlert |
| `onboarding-wizard` | Onboarding Wizard | DzStepper, DzFormField, DzInput, DzSelect, DzRadioGroup, DzCheckboxGroup, DzProgress, DzButton, DzCard |

### 6.2 Marketing (→ tasks C2, C3)

| slug | Name | Built with |
|---|---|---|
| `pricing` | Pricing Page ⭐ | DzCard, DzBadge, DzSegmented, DzButton, DzTable, DzTooltip, DzDivider |
| `feature-product` | Feature / Product | DzCard, DzTabs, DzImage, DzImageComparison, DzBadge, DzHeading, DzText |
| `contact` | Contact | DzCard, DzFormField, DzInput, DzTextarea, DzSelect, DzButton, DzAlert, DzDivider |
| `about-faq` | About & FAQ | DzHeading, DzText, DzAccordion, DzCard, DzAvatar, DzAvatarGroup, DzTimeline, DzDivider |

### 6.3 Utility & Errors (→ task C4)

| slug | Name | Built with |
|---|---|---|
| `error-500` | 500 — Server Error | DzResult, DzCard, DzButton, DzDivider, DzText |
| `error-403` | 403 — Access Denied | DzResult, DzCard, DzButton, DzText, DzAlert |
| `coming-soon` | Coming Soon | DzCard, DzCountdown, DzInput, DzButton, DzBadge, DzHeading, DzText, DzDivider |

### 6.4 Communication & Productivity apps (→ tasks C5, C6)

| slug | Name | Built with |
|---|---|---|
| `chat-messages` | Chat / Messages ⭐ | DzAppShell, DzList, DzAvatar, DzBadge, DzScrollArea, DzTextarea, DzInput, DzButton, DzSearchInput, DzDropdownMenu |
| `calendar-scheduler` | Calendar / Scheduler | DzAppShell, DzCalendar, DzSegmented, DzBadge, DzPopover, DzButton, DzAvatarGroup, DzDialog |
| `file-manager` | File Manager | DzAppShell, DzSidebar, DzTree, DzDataView, DzBreadcrumb, DzDropdownMenu, DzContextMenu, DzButton, DzSearchInput, DzBadge |
| `tasks-todo` | Tasks / To-Do | DzAppShell, DzList, DzCheckbox, DzTag, DzBadge, DzInput, DzDropdownMenu, DzSegmented, DzButton |

### 6.5 Data & Commerce (→ tasks C7, C8)

| slug | Name | Built with |
|---|---|---|
| `data-table` | Data Table (CRUD list) ⭐ | DzAppShell, DzDataGrid, DzSearchInput, DzMultiSelect, DzDropdownMenu, DzPagination, DzDialog, DzButton, DzBadge, DzCheckbox |
| `invoice` | Invoice | DzCard, DzTable, DzDescriptions, DzDivider, DzBadge, DzButton, DzHeading, DzText |
| `shopping-cart` | Shopping Cart | DzCard, DzList, DzNumberInput, DzButton, DzBadge, DzAlert, DzInput, DzDivider, DzImage |
| `order-history` | Order History | DzCard, DzDataView, DzList, DzBadge, DzTag, DzPagination, DzSearchInput, DzButton |

### 6.6 Account (→ task C9)

| slug | Name | Built with |
|---|---|---|
| `account-settings` | Account Centre | DzAppShell, DzTabs, DzFormField, DzInput, DzSwitch, DzSelect, DzAvatar, DzButton, DzDivider, DzAlert, DzBadge, DzDescriptions |

> **Re-skin opportunities (token-only, optional but encouraged):** give a few new templates a distinct semantic colourway so the gallery reads as a spread of hues — e.g. `pricing` violet, `chat-messages` cyan, `calendar-scheduler` indigo — by remapping `--dz-primary` at the template root and setting the matching `accent` in the registry row. Never raw hex; correct in light + dark.

---

## 7. Task backlog (free tier)

**Order matters** (the orchestrator runs sequentially and stops on first failure). Run **E1 → E2 → E3 → E4 → E5 → E6** (experience; E1 is the data foundation the others read), then the catalogue batches **C1 → C9** (each depends only on the shipped shell + E1's registry fields and can otherwise run in any order), then **Q1** (closing QA gate).

Checklist:

- [ ] **E1** — Registry enrichment: `tags`, `isNew`/`createdAt`, sort order (foundation)
- [ ] **E2** — Gallery: ⌘K search + tag filter + "New"/"Featured" badges + sort
- [ ] **E3** — Gallery/detail polish: per-template SEO, preview loading skeleton, grid a11y, thumbnail rendering
- [ ] **E4** — Detail: Preview/Code tabs + in-page source viewer + copy-all + "Copy for LLM"
- [ ] **E5** — Detail: in-preview customiser (primary-colour presets) + RTL toggle
- [ ] **E6** — Build-time thumbnail screenshots (paired light/dark), wired into the gallery
- [ ] **C1** — Auth pack: sign-up, reset-password, verify-otp, onboarding-wizard
- [ ] **C2** — Marketing A: pricing, feature-product
- [ ] **C3** — Marketing B: contact, about-faq
- [ ] **C4** — Errors & utility: error-500, error-403, coming-soon
- [ ] **C5** — Communication apps: chat-messages, calendar-scheduler
- [ ] **C6** — Productivity apps: file-manager, tasks-todo
- [ ] **C7** — Data & commerce A: data-table, invoice
- [ ] **C8** — Data & commerce B: shopping-cart, order-history
- [ ] **C9** — Account centre: account-settings
- [ ] **Q1** — QA, accessibility & build verification (closing gate)

---

### [x] E1 — Registry enrichment: tags, recency, sort order

```xml
<role>
You are a senior Vue 3 + TypeScript engineer in the dzup-ui monorepo's landing app
(apps/landing). You follow the repo's existing conventions exactly and make minimal,
backward-compatible changes.
</role>

<context>
The Templates gallery (/templates) lists 24 templates from a flat registry. We are about
to add search, tag-filtering, "New" badges and sort to the gallery (task E2) and ~18 new
templates (tasks C1–C9). Those features need data that the registry does not yet carry.
This task ONLY widens the data model and backfills the 24 existing rows — it changes NO
UI. Keeping it separate means E2 and the C-tasks can rely on the fields existing.
Read first: docs/templates.md §1, §4, §6; apps/landing/src/templates/registry.ts (the
full file — note the existing fields, JSDoc density, and the accent spectrum);
apps/landing/src/data.ts (comment style to match).
</context>

<task>
Edit apps/landing/src/templates/registry.ts:
1. Add to the TemplateMeta interface, all OPTIONAL so existing rows stay valid:
   - `tags?: string[]` — lowercase, kebab-case facets for filtering/search, e.g.
     ['dashboard','data-table','dark-mode'] or ['auth','form','split-layout']. Document
     that tags are a controlled vocabulary (define and export a `TEMPLATE_TAGS` const of
     allowed tag keys + display labels so E2 can render a tag filter without a free-for-all).
   - `createdAt?: string` — ISO date 'YYYY-MM-DD' the template was added (for recency).
2. Add a derived helper `isNew(t: TemplateMeta, now?: Date): boolean` — true when
   `createdAt` is within the last 30 days. Pure, testable, no side effects.
3. Backfill all 24 existing rows with a sensible `tags` array (3–6 tags each, drawn from
   the controlled vocabulary you define — cover: category, dominant component/pattern,
   and notable traits like 'dark-mode','responsive','form-heavy','data-table','timeline')
   and a `createdAt` (use a plausible past date, e.g. the shipped templates predate today;
   you may cluster them in the weeks before 2026-06-25 — do NOT mark any of the 24 as new).
4. Keep getTemplate() and the existing exports working unchanged.
</task>

<constraints>
- TypeScript strict; no `any`. `.ts` extensions in relative imports (repo rule).
- 100% backward compatible: the 24 rows must still type-check and the gallery must still
  render exactly as before (you are not touching any .vue here).
- Do NOT use Date.now() in module top-level code; isNew() takes an injectable `now` for
  testability and defaults to a fresh Date() inside the function body only.
- Match the JSDoc/comment density already in registry.ts.
- vue-tsc must pass (`yarn typecheck`). ESLint cannot run locally — do not rely on it.
</constraints>

<deliverables>
Edited registry.ts (interface + TEMPLATE_TAGS + isNew + 24 backfilled rows). A short note
listing the tag vocabulary you settled on and why.
</deliverables>

<acceptance_criteria>
- TemplateMeta has optional `tags` and `createdAt`; TEMPLATE_TAGS and isNew() are exported.
- All 24 rows carry tags (from the vocabulary) and a createdAt; none are "new".
- `yarn typecheck` passes with 0 errors; the gallery is visually unchanged.
</acceptance_criteria>

<thinking>
Before coding, restate the three field additions and confirm each is optional and
backward-compatible. Decide the tag vocabulary (aim ~20–30 controlled tags) by scanning
the 24 rows' stacks and blurbs, then map each row to its tags. Only then edit the file.
</thinking>
```

---

### [x] E2 — Gallery: ⌘K search, tag filter, "New"/"Featured" badges, sort

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and UI designer improving the discovery
experience of the dzup-ui Templates gallery to a best-in-class bar.
</role>

<context>
E1 added `tags`, `createdAt`, isNew() and TEMPLATE_TAGS to the registry. The gallery
(apps/landing/src/pages/TemplatesPage.vue) today has only a DzSegmented CATEGORY filter
and accent-tinted cards. Research (docs/templates.md §2) shows the field's tables stakes
for a >20-item catalogue are: keyboard search (⌘K), tag filtering, "New"/"Featured"
badges and sort. dzup-ui already ships DzCommandPalette (overlays), DzSegmented, DzBadge,
DzTag, DzSelect, DzSearchInput, DzEmpty — use them; do not invent new primitives.
Read first: docs/templates.md §2 (discovery patterns), §5 (quality bar);
apps/landing/src/pages/TemplatesPage.vue (the full file — preserve its accent tinting,
cover-link technique and staggered reveal); apps/landing/src/templates/registry.ts;
the DzCommandPalette story under packages/core/stories/overlays/ to confirm its props.
</context>

<task>
Enhance TemplatesPage.vue. Go beyond the basics — this is the front door:
1. SEARCH: add a search affordance that filters by name, blurb and tags (case-insensitive,
   debounced). Wire a ⌘K / Ctrl+K keyboard shortcut that opens DzCommandPalette listing
   templates (grouped by category, each entry jumps to its detail route); typing filters.
   Also provide a visible DzSearchInput for non-keyboard users. The palette and the inline
   search must share the same filter predicate.
2. TAG FILTER: render the TEMPLATE_TAGS as a row of toggleable DzTag/DzBadge chips (or a
   DzMultiSelect) that AND-composes with the existing category filter. "Clear filters" resets.
3. BADGES: on each card show a "Featured" badge for `featured` rows and a "New" badge when
   isNew(t) is true. Keep the existing "Free" framing (a "Free · MIT" note in the header).
4. SORT: a DzSelect with Featured (default) / Newest / A–Z, applied after filtering.
5. EMPTY: keep DzEmpty for any filter combination that yields nothing, with a reset action.
6. Show per-category counts in the category filter labels or header.
</task>

<constraints>
- Token-only styling; mirror the existing card/grid CSS and class naming — do not regress
  the accent tinting, cover links, focus rings or staggered reveal.
- Use @dzup-ui/core components for anything they cover (palette, chips, select, badges).
- Keyboard-first: ⌘K opens the palette; the grid stays arrow/tab navigable with visible focus.
- No live iframes on the gallery (perf) — cards stay icon/thumbnail only.
- vue-tsc clean; `vite build` (apps/landing) succeeds.
</constraints>

<deliverables>
Edited TemplatesPage.vue (+ any small icons.ts additions). A note on how the shared filter
predicate is structured and how ⌘K is registered/cleaned up.
</deliverables>

<acceptance_criteria>
- ⌘K/Ctrl+K opens a working command-palette search; selecting an entry navigates to its detail.
- Tag chips + category filter + sort compose; "Featured" and "New" badges render correctly.
- Empty combinations show DzEmpty with a reset; "All" + no tags + no query shows everything.
- Looks correct in light & dark at 390px and desktop; `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<thinking>
Before coding, sketch the single computed filter pipeline (query → category → tags → sort)
and confirm the palette and inline search both feed it. Decide how to register the global
keydown listener and remove it on unmount. Only then edit the file.
</thinking>
```

---

### [x] E3 — Per-template SEO, preview loading skeleton, grid a11y, thumbnail rendering

```xml
<role>
You are a senior Vue 3 + TypeScript engineer focused on accessibility, SEO and perceived
performance for the dzup-ui Templates pages.
</role>

<context>
Three quality gaps remain on the shipped Templates pages (docs/templates.md §1, §2 #13/#15):
(a) the detail page sets no per-template SEO head, so social shares show the generic home
title; (b) the chromeless preview shows a blank frame while the template bundle lazy-loads;
(c) the gallery <ul> is unlabelled and cards have no reserved aspect-ratio; and the
`thumbnail` field exists in the registry but the gallery never renders paired light/dark
images with a graceful icon fallback (E6 will GENERATE the images — this task makes the
gallery READY to show them).
Read first: apps/landing/src/router.ts (how meta.head syncs OG/Twitter tags — follow that
pattern); apps/landing/src/pages/TemplateDetailPage.vue; TemplatePreviewPage.vue;
TemplatesPage.vue; registry.ts; and how useHead/meta is done elsewhere (HomePage route meta).
</context>

<task>
1. SEO: set a per-template document head on the detail route — title "{name} — dzup-ui
   Templates", description = blurb, and OG/Twitter tags — mirroring the existing meta.head
   mechanism in router.ts/App. If a template later has a thumbnail, use it as og:image.
2. PREVIEW LOADING: in TemplatePreviewPage.vue, show a tasteful loading state (DzSpinner or
   DzSkeleton from core) while the async template component resolves; render the template
   when ready; keep the unknown-slug redirect.
3. GALLERY A11Y + CLS: label the gallery <ul> (aria-label="Templates"), give each card a
   reserved aspect-ratio so thumbnails don't shift layout, and confirm the cover-link/focus
   pattern still passes keyboard + screen-reader use.
4. THUMBNAIL RENDERING: render `template.thumbnail` (and an optional dark variant) as a
   lazy <img> with the existing icon as the fallback when no thumbnail is set. Support a
   paired light/dark convention (e.g. `<thumb>.webp` + `<thumb>-dark.webp`) chosen by the
   current theme. No images exist yet — verify the icon fallback still renders for all 24.
</task>

<constraints>
- Token-only styling; no raw colors. Use core components (DzSpinner/DzSkeleton) for states.
- Do not regress the existing toolbar, device switcher, theme toggle or prev/next.
- Images must be loading="lazy" with width/height or aspect-ratio set (no CLS).
- vue-tsc clean; `vite build` (apps/landing) succeeds.
</constraints>

<deliverables>
Edited TemplateDetailPage.vue, TemplatePreviewPage.vue, TemplatesPage.vue (+ router/meta
wiring). A note on the thumbnail naming convention E6 must produce.
</deliverables>

<acceptance_criteria>
- Visiting /templates/<slug> sets a per-template title + description + OG/Twitter tags.
- The preview shows a loading state then the template; unknown slugs still redirect.
- The gallery <ul> is labelled; cards reserve space; all 24 still show their icon fallback.
- `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<thinking>
Restate the four sub-changes and confirm each is additive. Confirm exactly how meta.head is
read and synced today so the per-template head uses the same path. Decide the thumbnail
light/dark naming so E6 can target it. Only then edit.
</thinking>
```

---

### [x] E4 — Detail page: Preview/Code tabs, in-page source viewer, copy-all, "Copy for LLM"

```xml
<role>
You are a senior Vue 3 + TypeScript engineer building the code-access experience that turns
a template preview into something a visitor can actually adopt.
</role>

<context>
Today the detail page (apps/landing/src/pages/TemplateDetailPage.vue) only links out to
GitHub for source — visitors must leave the page to read code. The field's standard
(docs/templates.md §2 #7) is a Preview/Code tab set with syntax highlighting and one-click
copy. dzup-ui ships DzTabs, DzCodeBlock and DzCopyButton — use them. The template source
must be available to the page at build time. Vite supports importing a file's raw text via
`?raw` (e.g. `import src from '../templates/x/X.vue?raw'`); prefer `import.meta.glob` with
`{ query: '?raw', import: 'default' }` so all template sources resolve generically from the
registry `source`/`load` path without hand-maintaining a map.
Read first: docs/templates.md §2 (#7, #12); apps/landing/src/pages/TemplateDetailPage.vue;
registry.ts (the `source` path shape); the DzCodeBlock + DzTabs + DzCopyButton stories
under packages/core/stories/ to confirm props (language, copy slot, etc.).
</context>

<task>
Add a Preview / Code experience to the detail page. Go beyond a single file:
1. TABS: wrap the existing live preview in DzTabs — "Preview" (the current iframe + toolbar,
   unchanged) and "Code" (new).
2. CODE VIEWER: in the Code tab, load the template's source via import.meta.glob('?raw')
   keyed off the registry `source` path, and render it in DzCodeBlock with vue/ts syntax
   highlighting. If a template has a co-located data.ts, show it too (a sub-tab or a second
   block labelled by filename). Handle long files gracefully (scroll, not overflow).
3. COPY: a DzCopyButton to copy the full source; show the "Built with" dependency list near
   the code so "what will this add?" is answered in-page (reuse the existing chips).
4. COPY FOR LLM: add a "Copy for LLM" button that copies a prompt-friendly markdown bundle —
   a short header ("dzup-ui template: {name}, built with {stack}"), then the source in a
   fenced ```vue block (+ the data file if present) — so a visitor can paste it into an AI
   assistant. This is the cheap slice of the AI-native direction (docs/templates.md §8).
</task>

<constraints>
- Token-only styling; reuse existing detail-page class naming. Do not regress the toolbar,
  device switcher, theme toggle, fullscreen, view-source, copy-path or prev/next.
- Use DzCodeBlock/DzTabs/DzCopyButton — not a hand-rolled highlighter.
- The ?raw imports must be generic (driven by the registry), not a hardcoded per-slug map.
- vue-tsc clean; `vite build` (apps/landing) succeeds (confirm ?raw glob builds, not just dev).
</constraints>

<deliverables>
Edited TemplateDetailPage.vue (+ any tiny helper for resolving raw source from `source`).
A note on how import.meta.glob is keyed and how missing sources fail safely.
</deliverables>

<acceptance_criteria>
- The detail page has Preview/Code tabs; Code shows the real, highlighted template source
  (+ data file when present) for every template, resolved generically.
- "Copy" copies the full source; "Copy for LLM" copies the markdown bundle.
- Light/dark correct; `yarn typecheck` + `vite build` pass (raw imports resolve in build).
</acceptance_criteria>

<thinking>
Before coding, confirm how import.meta.glob('../templates/**/*.{vue,ts}', { query:'?raw' })
maps to a registry `source` path, and how to pick the right entry per slug. Decide the
DzTabs structure and where the existing toolbar lives. Only then edit.
</thinking>
```

---

### [x] E5 — Detail page: in-preview customiser (primary-colour presets) + RTL toggle

```xml
<role>
You are a senior Vue 3 + TypeScript engineer building the single most persuasive feature of
the gallery: live, in-preview customisation that proves dzup-ui templates are genuinely
themeable.
</role>

<context>
The preview already toggles light/dark independently (via ?theme= on the iframe). Research
(docs/templates.md §2 #9, #10) shows the strongest differentiator — and a gap across most
indie libraries — is letting visitors swap the PRIMARY COLOUR live and validate RTL. dzup-ui's
token architecture makes this cheap: the preview document's `--dz-primary` (and its
foreground/shade ramp) can be remapped to a decorative spectrum palette, and `dir="rtl"` can
be set on its <html>. The preview page must accept these as query params so the iframe
re-renders deterministically (same mechanism as ?theme=).
Read first: docs/templates.md §2 (#9, #10); apps/landing/src/pages/TemplateDetailPage.vue
(the toolbar + previewSrc computed); TemplatePreviewPage.vue (how ?theme is read/applied);
the @dzup-ui/tokens decorative spectrum + PALETTE_CONFIGS (how a palette maps to
--dz-colors-<name>-* and how --dz-primary is defined) so the remap is correct in light+dark.
</context>

<task>
1. PREVIEW PARAMS: extend TemplatePreviewPage.vue to read `?primary=<palette>` and `?dir=rtl`
   (in addition to ?theme). On mount/param-change, remap --dz-primary (+ foreground + the
   shades the primary ramp uses) to the chosen spectrum palette on the document root, and set
   `dir` on <html>. Default (no param) = the template's own colours, exactly as today.
2. TOOLBAR: in TemplateDetailPage.vue add to the preview toolbar — a compact primary-colour
   swatch picker (a row of DzSegmented/DzButton swatches or DzColorPicker presets drawn from
   the spectrum) and an LTR/RTL toggle. They drive the iframe src params (like the theme toggle).
   Keep all existing controls. Announce changes via aria-live.
3. RESET: a "Reset" control returns the preview to the template's native theme/colour/dir.
</task>

<constraints>
- Token-only: the remap sets CSS custom properties to var(--dz-colors-<palette>-*) values —
  NEVER raw hex. Must be correct in BOTH light and dark (resolve the right shade per theme).
- Only the PREVIEW re-skins; the marketing/detail page chrome is unaffected.
- Respect prefers-reduced-motion for any transition; controls are real buttons with labels.
- Do not regress device switcher, theme toggle, fullscreen, code tabs (E4) or prev/next.
- vue-tsc clean; `vite build` (apps/landing) succeeds.
</constraints>

<deliverables>
Edited TemplatePreviewPage.vue (param handling + token remap) and TemplateDetailPage.vue
(swatch picker + RTL toggle + reset). A note on which token properties the remap sets and how
light/dark shade selection works.
</deliverables>

<acceptance_criteria>
- Picking a primary colour live re-skins ONLY the preview, correct in light and dark; the
  template's components (buttons, badges, links, focus rings) all pick up the new primary.
- The RTL toggle flips the preview to dir="rtl" and the layout mirrors sensibly.
- "Reset" restores native theme/colour/LTR; fullscreen/open-in-new-tab preserve the params.
- `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<thinking>
Before coding, open the tokens package and confirm exactly which custom properties define
--dz-primary and its on-color/ramp, and how a decorative palette exposes per-shade values per
theme. Decide the minimal set of properties to remap so all core components follow. Confirm
the iframe re-render path for a new query param. Only then edit.
</thinking>
```

---

### [x] E6 — Build-time thumbnail screenshots (paired light/dark), wired into the gallery

```xml
<role>
You are a senior frontend build engineer adding a reproducible, committed thumbnail pipeline
so the Templates gallery shows real screenshots instead of icons.
</role>

<context>
The gallery currently shows a Lucide icon per card; the field standard (docs/templates.md §2
#1, #2, #14) is a static SCREENSHOT per template, ideally a light/dark pair, generated at
build time and committed (per-request generation does not scale; N live iframes is too heavy).
E3 already made the gallery render `template.thumbnail` (+ dark variant) with an icon
fallback. This task produces those images. Each template renders chromeless at
/templates/<slug>/preview?theme=light|dark — a headless browser can screenshot that route.
Read first: docs/templates.md §2 (#1, #2, #13, #14); apps/landing/src/pages/
TemplatePreviewPage.vue and registry.ts (slugs + the thumbnail naming convention E3 defined);
apps/landing/package.json + vite config (how the app builds/serves) and any existing scripts/.
This task may run shell commands (yarn, a headless browser); it is acceptable in this repo.
</context>

<task>
1. SCRIPT: add a Node script (e.g. apps/landing/scripts/shoot-thumbnails.mjs) that builds or
   serves the landing app, then uses a headless browser (Playwright — add as a devDependency)
   to load /templates/<slug>/preview?theme=light and ?theme=dark for every slug in TEMPLATES,
   screenshot at a consistent gallery aspect ratio (e.g. 1200×750), and write optimised WebP
   to a committed assets dir (e.g. src/templates/_thumbnails/<slug>.webp and <slug>-dark.webp),
   matching the naming convention from E3.
2. WIRE-UP: add a `yarn thumbnails` script in apps/landing/package.json. Populate the
   `thumbnail` field on the registry rows (or derive the path by convention so new templates
   are covered automatically — prefer convention-by-slug over hand-maintained paths).
3. GALLERY: confirm cards now show the paired light/dark screenshot per theme with the icon
   still used as fallback when an image is missing. No CLS (E3 reserved the aspect-ratio).
4. DOCS: document how to regenerate (`yarn thumbnails`) and when to re-run (after adding/
   changing a template) in a short README near the script.
</task>

<constraints>
- The pipeline must be reproducible and idempotent; images are committed artifacts.
- Keep image weight reasonable (WebP, sensible dimensions); lazy-loaded in the gallery.
- Do not change template source to suit the screenshotter; screenshot what ships.
- Token-only styling unaffected. vue-tsc clean; `vite build` (apps/landing) still succeeds.
- If a headless browser cannot run in this environment, FAIL LOUDLY with a clear message and
  leave the icon fallback intact — do not commit broken/empty images.
</constraints>

<deliverables>
The screenshot script, the `yarn thumbnails` wiring, generated+committed thumbnails for all
slugs, registry/convention wiring, and a short regeneration README. A note on the browser/
tooling chosen and the per-image weight.
</deliverables>

<acceptance_criteria>
- `yarn thumbnails` regenerates a light+dark WebP for every template, reproducibly.
- The gallery shows real screenshots (theme-matched) with icon fallback for any gap.
- Images are committed and lazy-loaded with no layout shift; `vite build` passes.
</acceptance_criteria>

<thinking>
Before coding, decide build-then-serve vs. preview-server, and confirm the chromeless preview
route renders standalone. Pick Playwright, define the viewport/output size, and the
slug→filename convention (matching E3). Only then write the script.
</thinking>
```

---

### [x] C1 — Auth pack: sign-up, reset-password, verify-otp, onboarding-wizard

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and product designer building production-grade,
free page templates for dzup-ui from the @dzup-ui/core library.
</role>

<context>
The Templates gallery, detail/preview shell and 24 reference templates already ship. dzup-ui
ships only 1 of ~6 auth pages competitors standardise on (docs/templates.md §3); this task
adds the four most common missing ones. They must match the shipped templates exactly in
structure, quality and registration.
Read first, every time:
- docs/templates.md §6.1 (your rows: exact slug, name, built-with) and §5 (the quality bar).
- apps/landing/src/templates/sign-in/ (the shipped auth flagship — imitate its split-screen
  structure, token use and realism) and registry.ts (the registration shape, incl. the
  `tags`/`createdAt` fields from E1).
- Appendix A of docs/templates.md to confirm a component name is a real core export before
  using it. If a needed component does not exist, choose the closest real one and note it.

<batch>
- sign-up — "Sign Up": a split-screen register page mirroring sign-in; form card with name,
  email, DzPasswordInput WITH a live DzProgress strength meter, terms DzCheckbox, social
  providers, and a marketing panel. Built with: DzCard, DzFormField, DzInput, DzPasswordInput,
  DzCheckbox, DzButton, DzDivider, DzProgress. (mark featured: true — this is the C1 reference)
- reset-password — "Forgot / Reset Password": a centered card with two states in one page —
  request (email + "Send reset link") and a sent confirmation (DzResult / DzAlert "check your
  inbox"), plus a back-to-sign-in link. Built with: DzCard, DzFormField, DzInput, DzButton,
  DzResult, DzAlert.
- verify-otp — "OTP / 2FA Verify": a centered card with a DzOtpInput, a DzCountdown resend
  timer, an explanatory DzText/DzAlert, and verify/back actions. Built with: DzCard,
  DzOtpInput, DzButton, DzCountdown, DzText, DzAlert.
- onboarding-wizard — "Onboarding Wizard": a multi-step setup using DzStepper — steps like
  Profile → Workspace → Invite team → Done, each a real form panel, with a DzProgress and
  prev/next; final step a success state. Built with: DzStepper, DzFormField, DzInput, DzSelect,
  DzRadioGroup, DzCheckboxGroup, DzProgress, DzButton, DzCard.
</batch>
</context>

<task>
For each template in <batch>, in order:
1. Create apps/landing/src/templates/<slug>/<Name>.vue — a full-page, chromeless component
   built ONLY from the listed free core components, with realistic co-located sample data
   (<slug>/data.ts when non-trivial). Make it genuinely good, not a stub — go beyond the basics.
2. Register it in registry.ts TEMPLATES with accurate metadata: slug, name, blurb, category
   ('auth'), stack, icon (a fitting Lucide key), load, source, tier: 'free', tags (from E1's
   vocabulary), createdAt (today, 2026-06-25, so it shows the "New" badge), and featured where
   noted.
3. Verify it renders correctly via /templates/<slug> in BOTH themes and at mobile (390px) +
   desktop.
</task>

<constraints>
- The §5 quality bar is mandatory and checked per template (token-only color/radius/shadow/
  font; light+dark; responsive; WCAG AA; realistic content; self-contained; restrained motion;
  distinctive, not "AI slop").
- Use the real component for anything core covers; raw markup only for layout scaffold.
- Self-contained: no lp-* landing styles, no cross-template imports. No invented imports.
- TypeScript strict, `.ts` import extensions, vue-tsc clean.
- Validate with `vite build` (apps/landing). ESLint is unavailable locally — do not rely on it.
</constraints>

<deliverables>
One folder per template (component + optional data) and the registry.ts additions. A
one-line-per-template self-check confirming light/dark + responsive were verified, plus any
component substitutions made.
</deliverables>

<acceptance_criteria>
- All four templates appear on /templates, filter under "Auth & Account", carry the "New"
  badge, and preview live on their detail pages in both themes at mobile + desktop.
- No invented imports; every import resolves from @dzup-ui/core (Appendix A).
- `vite build` succeeds; `yarn typecheck` passes.
</acceptance_criteria>

<thinking>
Before coding each template, sketch its layout in 3–5 bullets and map each region to a
specific core component from its stack. If a region has no matching component, decide the
closest real substitute and record it. Build sign-up first (the reference), then the rest.
</thinking>
```

---

### [x] C2 — Marketing A: pricing, feature-product

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and product designer building production-grade,
free marketing page templates for dzup-ui from the @dzup-ui/core library.
</role>

<context>
The Templates shell and 24 templates ship; marketing is under-served (one landing). This task
adds the two most-requested marketing pages (docs/templates.md §3). Match the shipped
templates exactly in structure, quality and registration.
Read first, every time:
- docs/templates.md §6.2 (your rows) and §5 (quality bar).
- apps/landing/src/templates/saas-landing/ (the shipped marketing flagship — imitate its
  conversion structure, token-painted media and realism) and registry.ts (registration shape
  incl. E1's tags/createdAt).
- Appendix A to confirm every component is a real core export before using it.

<batch>
- pricing — "Pricing Page" (featured: true — C2 reference): a monthly/annual DzSegmented
  toggle that updates prices live, 3 plan DzCards (one "Most popular" via DzBadge), a feature
  DzTable / comparison matrix with DzTooltip explainers, and an FAQ teaser. Consider an
  optional violet primary re-skin (token-only) + accent:'violet'. Built with: DzCard, DzBadge,
  DzSegmented, DzButton, DzTable, DzTooltip, DzDivider.
- feature-product — "Feature / Product": a deep-dive page — hero, alternating feature rows
  with DzImage, a DzTabs feature explorer, a before/after DzImageComparison, spec DzBadges,
  and a closing CTA. Built with: DzCard, DzTabs, DzImage, DzImageComparison, DzBadge,
  DzHeading, DzText.
</batch>
</context>

<task>
For each template in <batch>, in order:
1. Create apps/landing/src/templates/<slug>/<Name>.vue (full-page, chromeless), built ONLY
   from the listed core components, with realistic co-located sample data. Go beyond basics —
   working price toggle, real comparison data, plausible product copy.
2. Register in registry.ts with full metadata (category 'marketing'; tags from E1; createdAt
   2026-06-25; featured where noted; accent where re-skinned).
3. Verify via /templates/<slug> in both themes at 390px + desktop.
</task>

<constraints>
- §5 quality bar mandatory per template. Token-only; real component for anything core covers.
- Self-contained; no lp-* styles; no invented imports. TS strict; `.ts` extensions; vue-tsc clean.
- Validate with `vite build` (apps/landing). ESLint unavailable locally.
</constraints>

<deliverables>
Two template folders + registry additions. A one-line self-check per template (light/dark +
responsive) and any substitutions.
</deliverables>

<acceptance_criteria>
- Both appear under "Marketing", carry "New", preview live in both themes at mobile + desktop;
  the pricing monthly/annual toggle changes prices live.
- No invented imports; `vite build` + `yarn typecheck` pass.
</acceptance_criteria>

<thinking>
Sketch each layout in 3–5 bullets; map regions to components; decide the price-toggle data
model. Build pricing first. Only then write the .vue files.
</thinking>
```

---

### [x] C3 — Marketing B: contact, about-faq

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and product designer building production-grade,
free marketing page templates for dzup-ui from the @dzup-ui/core library.
</role>

<context>
Companion to C2; adds the contact and about/FAQ pages competitors standardise on
(docs/templates.md §3). Match the shipped templates exactly.
Read first, every time:
- docs/templates.md §6.2 (your rows) and §5 (quality bar).
- apps/landing/src/templates/saas-landing/ and help-center/ (shipped references for marketing
  structure and the FAQ accordion pattern) and registry.ts (registration shape incl. tags/createdAt).
- Appendix A to confirm every component is real.

<batch>
- contact — "Contact": a two-column page — a real contact form (DzFormField + DzInput +
  DzTextarea + DzSelect for topic + DzButton, with client-side validation and a DzAlert
  success state) beside a contact-details / map-placeholder / office-hours card. Built with:
  DzCard, DzFormField, DzInput, DzTextarea, DzSelect, DzButton, DzAlert, DzDivider.
- about-faq — "About & FAQ": a company page — mission heading, a story DzTimeline, a team grid
  (DzAvatar/DzAvatarGroup + DzCard), values cards, and a DzAccordion FAQ. Built with: DzHeading,
  DzText, DzAccordion, DzCard, DzAvatar, DzAvatarGroup, DzTimeline, DzDivider.
</batch>
</context>

<task>
For each template in <batch>: create apps/landing/src/templates/<slug>/<Name>.vue (full-page,
chromeless) built ONLY from the listed core components with realistic co-located data; register
in registry.ts (category 'marketing'; tags from E1; createdAt 2026-06-25); verify via
/templates/<slug> in both themes at 390px + desktop. Go beyond basics — working form validation,
a plausible company narrative.
</task>

<constraints>
- §5 quality bar mandatory. Token-only; real components; self-contained; no invented imports.
- TS strict; `.ts` extensions; vue-tsc clean; validate with `vite build` (apps/landing).
</constraints>

<deliverables>
Two template folders + registry additions; one-line self-check per template + any substitutions.
</deliverables>

<acceptance_criteria>
- Both appear under "Marketing", carry "New", preview live in both themes at mobile + desktop;
  the contact form validates and shows a success state client-side.
- No invented imports; `vite build` + `yarn typecheck` pass.
</acceptance_criteria>

<thinking>
Sketch each layout; map regions to components; decide the form validation model. Only then write.
</thinking>
```

---

### [x] C4 — Errors & utility: error-500, error-403, coming-soon

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and product designer building production-grade,
free utility page templates for dzup-ui from the @dzup-ui/core library.
</role>

<context>
dzup-ui ships 404 + states-pack + system-status + maintenance but lacks the 500/403/coming-soon
pages competitors standardise on (CoreUI ships 500 even free) — docs/templates.md §3. Match the
shipped templates exactly.
Read first, every time:
- docs/templates.md §6.3 (your rows) and §5 (quality bar).
- apps/landing/src/templates/not-found/ and maintenance/ (the shipped references — imitate the
  centered DzResult composition, the oversized glyph treatment and the notify-me card) and
  registry.ts (registration shape incl. tags/createdAt).
- Appendix A to confirm every component is real.

<batch>
- error-500 — "500 — Server Error": a centered DzResult (status error) with recovery actions
  (retry, status page, contact) and a card of next steps; a tasteful oversized "500" treatment.
  Built with: DzResult, DzCard, DzButton, DzDivider, DzText.
- error-403 — "403 — Access Denied": a centered DzResult with a DzAlert explaining the missing
  permission, request-access + sign-in-as-different-user actions. Built with: DzResult, DzCard,
  DzButton, DzText, DzAlert.
- coming-soon — "Coming Soon": a launch page — a DzCountdown to launch, a notify-me email
  capture (DzInput + DzButton with a client-side success state), a DzBadge status, brand and
  social. Built with: DzCard, DzCountdown, DzInput, DzButton, DzBadge, DzHeading, DzText, DzDivider.
</batch>
</context>

<task>
For each template in <batch>: create apps/landing/src/templates/<slug>/<Name>.vue (full-page,
chromeless) built ONLY from the listed core components with realistic data; register in
registry.ts (category 'utility'; tags from E1; createdAt 2026-06-25); verify via /templates/<slug>
in both themes at 390px + desktop.
</task>

<constraints>
- §5 quality bar mandatory. Token-only; real components; self-contained; no invented imports.
- TS strict; `.ts` extensions; vue-tsc clean; validate with `vite build` (apps/landing).
</constraints>

<deliverables>
Three template folders + registry additions; one-line self-check per template + any substitutions.
</deliverables>

<acceptance_criteria>
- All three appear under "Utility", carry "New", preview live in both themes at mobile + desktop;
  coming-soon's countdown ticks and the notify form shows a success state.
- No invented imports; `vite build` + `yarn typecheck` pass.
</acceptance_criteria>

<thinking>
Sketch each layout; map regions to components. Only then write.
</thinking>
```

---

### [x] C5 — Communication apps: chat-messages, calendar-scheduler

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and product designer building production-grade,
free APP templates for dzup-ui from the @dzup-ui/core library. These are full app surfaces —
the hardest, highest-value templates — so hold a high bar.
</role>

<context>
Every premium admin suite ships chat and calendar apps; dzup-ui ships neither
(docs/templates.md §3). Build them from free core only. Match the shipped app templates'
structure (DzAppShell frame, realistic data, token use).
Read first, every time:
- docs/templates.md §6.4 (your rows) and §5 (quality bar).
- apps/landing/src/templates/analytics-dashboard/ and inbox-notifications/ (the shipped
  app-shell references — imitate the DzAppShell + sidebar + main composition and realism) and
  registry.ts (registration shape incl. tags/createdAt).
- Appendix A to confirm every component is real; confirm DzCalendar's props against its story
  under packages/core/stories/data/.

<batch>
- chat-messages — "Chat / Messages" (featured: true — C5 reference): a messaging app —
  DzAppShell with a conversation list (DzList + DzAvatar + unread DzBadge + DzSearchInput) and a
  thread pane (message bubbles in a DzScrollArea with day separators and read receipts) and a
  composer (DzTextarea/DzInput + send DzButton + DzDropdownMenu for attach). Consider a cyan
  re-skin (token-only) + accent:'cyan'. Built with: DzAppShell, DzList, DzAvatar, DzBadge,
  DzScrollArea, DzTextarea, DzInput, DzButton, DzSearchInput, DzDropdownMenu.
- calendar-scheduler — "Calendar / Scheduler": a calendar app — DzAppShell with a DzCalendar
  month view of events (colour-coded via tokens), a DzSegmented month/week switcher, an event
  DzPopover, and a "new event" DzDialog. Consider an indigo re-skin + accent:'indigo'. Built
  with: DzAppShell, DzCalendar, DzSegmented, DzBadge, DzPopover, DzButton, DzAvatarGroup, DzDialog.
</batch>
</context>

<task>
For each template in <batch>, in order: create apps/landing/src/templates/<slug>/<Name>.vue
(full-page, chromeless) built ONLY from the listed core components with realistic co-located
sample data (conversations/messages; events across a month). Go well beyond a stub — these
should read like real apps. Register in registry.ts (category 'dashboards'; tags from E1;
createdAt 2026-06-25; featured/accent where noted). Verify via /templates/<slug> in both themes
at 390px + desktop (chat must reflow to a single pane on mobile).
</task>

<constraints>
- §5 quality bar mandatory per template. Token-only; real component for anything core covers;
  raw markup only for layout scaffold (message bubbles may be scaffold + tokens).
- Self-contained; no lp-* styles; no cross-template imports; no invented imports.
- TS strict; `.ts` extensions; vue-tsc clean; validate with `vite build` (apps/landing).
</constraints>

<deliverables>
Two template folders (component + data) + registry additions; one-line self-check per template
(light/dark + responsive) and any substitutions.
</deliverables>

<acceptance_criteria>
- Both appear under "Dashboards & Apps", carry "New", preview live in both themes at mobile +
  desktop; chat reflows to one pane on mobile; calendar shows a real month of colour-coded events.
- No invented imports (DzCalendar props match its story); `vite build` + `yarn typecheck` pass.
</acceptance_criteria>

<thinking>
Before coding each, sketch the app-shell layout in 3–5 bullets and map each region to a core
component. Decide the chat and calendar data models. Confirm DzCalendar's event API from its
story. Build chat-messages first. Only then write.
</thinking>
```

---

### [x] C6 — Productivity apps: file-manager, tasks-todo

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and product designer building production-grade,
free APP templates for dzup-ui from the @dzup-ui/core library.
</role>

<context>
File managers and task apps appear in every premium suite; dzup-ui ships neither
(docs/templates.md §3). Build from free core only, matching the shipped app templates.
Read first, every time:
- docs/templates.md §6.4 (your rows) and §5 (quality bar).
- apps/landing/src/templates/analytics-dashboard/ and project-board/ (shipped references for
  the app-shell frame and board/list patterns) and registry.ts (registration shape incl.
  tags/createdAt).
- Appendix A to confirm every component is real; confirm DzTree and DzDataView props against
  their stories under packages/core/stories/data/.

<batch>
- file-manager — "File Manager": DzAppShell with a folder DzTree sidebar, a DzBreadcrumb path,
  a main file area as DzDataView (grid/list toggle) of files/folders with type icons and size/
  modified badges, a DzContextMenu / row DzDropdownMenu of actions (rename/move/delete), a
  DzSearchInput, and a storage meter. Built with: DzAppShell, DzSidebar, DzTree, DzDataView,
  DzBreadcrumb, DzDropdownMenu, DzContextMenu, DzButton, DzSearchInput, DzBadge.
- tasks-todo — "Tasks / To-Do": DzAppShell with a "My day" task list — DzList of tasks with
  DzCheckbox completion, priority DzBadge, label DzTag, a quick-add DzInput, a DzSegmented
  view switcher (Today/Upcoming/Done) and a per-task DzDropdownMenu. Built with: DzAppShell,
  DzList, DzCheckbox, DzTag, DzBadge, DzInput, DzDropdownMenu, DzSegmented, DzButton.
</batch>
</context>

<task>
For each template in <batch>: create apps/landing/src/templates/<slug>/<Name>.vue (full-page,
chromeless) built ONLY from the listed core components with realistic co-located data (a folder
tree + files; a believable task list). Make checkboxes/quick-add/view-switch work client-side.
Register in registry.ts (category 'dashboards'; tags from E1; createdAt 2026-06-25). Verify via
/templates/<slug> in both themes at 390px + desktop.
</task>

<constraints>
- §5 quality bar mandatory. Token-only; real components; self-contained; no invented imports.
- TS strict; `.ts` extensions; vue-tsc clean; validate with `vite build` (apps/landing).
</constraints>

<deliverables>
Two template folders (component + data) + registry additions; one-line self-check per template
+ any substitutions.
</deliverables>

<acceptance_criteria>
- Both appear under "Dashboards & Apps", carry "New", preview live in both themes at mobile +
  desktop; tasks can be checked/added and views switched client-side; the file grid/list toggles.
- No invented imports (DzTree/DzDataView props match their stories); `vite build` + `yarn typecheck` pass.
</acceptance_criteria>

<thinking>
Sketch each app-shell layout; map regions to components; decide the tree/file and task data
models; confirm DzTree/DzDataView APIs from their stories. Only then write.
</thinking>
```

---

### [x] C7 — Data & commerce A: data-table, invoice

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and product designer building production-grade,
free templates for dzup-ui from the @dzup-ui/core library.
</role>

<context>
A generic CRUD data-table/list page is a foundational primitive shipped by Ant Design Pro,
Refine, Flowbite and CoreUI; an invoice page is in every premium suite. dzup-ui ships neither
(docs/templates.md §3). Build from free core only.
Read first, every time:
- docs/templates.md §6.5 (your rows) and §5 (quality bar).
- apps/landing/src/templates/admin-crm/ and team-members/ (shipped DzDataGrid references —
  imitate the grid + filter-bar + row-actions + dialog patterns) and order-tracking/ (for the
  descriptions/summary composition the invoice resembles) and registry.ts (registration shape).
- Appendix A to confirm every component is real; confirm DzDataGrid props against its story.

<batch>
- data-table — "Data Table (CRUD list)" (featured: true — C7 reference): DzAppShell with a
  records DzDataGrid — a filter bar (DzSearchInput + DzMultiSelect facets), column sort,
  row-select DzCheckbox with a bulk-action bar, row DzDropdownMenu (edit/delete), DzPagination,
  status DzBadges, and a "New record" DzDialog with a form. Built with: DzAppShell, DzDataGrid,
  DzSearchInput, DzMultiSelect, DzDropdownMenu, DzPagination, DzDialog, DzButton, DzBadge, DzCheckbox.
- invoice — "Invoice": a printable invoice — header with from/to DzDescriptions, a line-item
  DzTable with totals, status DzBadge, notes, and download/print/send DzButtons. Built with:
  DzCard, DzTable, DzDescriptions, DzDivider, DzBadge, DzButton, DzHeading, DzText.
</batch>
</context>

<task>
For each template in <batch>, in order: create apps/landing/src/templates/<slug>/<Name>.vue
(full-page, chromeless) built ONLY from the listed core components with realistic co-located
data (a believable record set with working filter/sort/pagination/bulk-select for data-table;
a complete invoice with correct arithmetic). Register in registry.ts (category 'dashboards' for
data-table, 'commerce' for invoice; tags from E1; createdAt 2026-06-25; featured where noted).
Verify via /templates/<slug> in both themes at 390px + desktop.
</task>

<constraints>
- §5 quality bar mandatory. Token-only; real components; self-contained; no invented imports.
- TS strict; `.ts` extensions; vue-tsc clean; validate with `vite build` (apps/landing).
</constraints>

<deliverables>
Two template folders (component + data) + registry additions; one-line self-check per template
+ any substitutions.
</deliverables>

<acceptance_criteria>
- data-table appears under "Dashboards & Apps" and invoice under "Commerce", both carry "New",
  preview live in both themes at mobile + desktop; data-table filters/sorts/paginates and
  bulk-selects client-side; invoice totals are arithmetically correct.
- No invented imports (DzDataGrid props match its story); `vite build` + `yarn typecheck` pass.
</acceptance_criteria>

<thinking>
Sketch each layout; map regions to components; decide the record and invoice data models;
confirm DzDataGrid's API from its story. Build data-table first. Only then write.
</thinking>
```

---

### [x] C8 — Data & commerce B: shopping-cart, order-history

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and product designer building production-grade,
free commerce templates for dzup-ui from the @dzup-ui/core library.
</role>

<context>
dzup-ui has checkout but not a cart or order-history page (docs/templates.md §3); together with
the shipped product-listing/detail/checkout/order-tracking they complete a browse → cart →
buy → track → re-order journey. Build from free core only.
Read first, every time:
- docs/templates.md §6.5 (your rows) and §5 (quality bar).
- apps/landing/src/templates/checkout/ (the shipped commerce flagship — imitate its line-item
  editing, promo code, live totals and emerald token re-skin) and order-tracking/ and
  blog-index/ (for the DzDataView list pattern) and registry.ts.
- Appendix A to confirm every component is real.

<batch>
- shopping-cart — "Shopping Cart": a cart page — editable line items (DzNumberInput qty,
  remove, DzImage thumb), a promo DzInput, a free-shipping nudge DzAlert, and a sticky order
  summary with live totals; an empty-cart state. Built with: DzCard, DzList, DzNumberInput,
  DzButton, DzBadge, DzAlert, DzInput, DzDivider, DzImage.
- order-history — "Order History": an account orders page — a searchable DzDataView/list of
  past orders with date, items, total, status DzBadge/DzTag, and view/reorder DzButtons, plus
  DzPagination. Built with: DzCard, DzDataView, DzList, DzBadge, DzTag, DzPagination,
  DzSearchInput, DzButton.
</batch>
</context>

<task>
For each template in <batch>: create apps/landing/src/templates/<slug>/<Name>.vue (full-page,
chromeless) built ONLY from the listed core components with realistic co-located data; make
cart quantity/promo/totals work client-side. Register in registry.ts (category 'commerce'; tags
from E1; createdAt 2026-06-25; consider matching the commerce emerald accent). Verify via
/templates/<slug> in both themes at 390px + desktop.
</task>

<constraints>
- §5 quality bar mandatory. Token-only (re-skins remap a semantic token, no raw hex); real
  components; self-contained; no invented imports.
- TS strict; `.ts` extensions; vue-tsc clean; validate with `vite build` (apps/landing).
</constraints>

<deliverables>
Two template folders (component + data) + registry additions; one-line self-check per template
+ any substitutions.
</deliverables>

<acceptance_criteria>
- Both appear under "Commerce", carry "New", preview live in both themes at mobile + desktop;
  cart quantity/promo/totals update live and show an empty state; order-history searches/paginates.
- No invented imports; `vite build` + `yarn typecheck` pass.
</acceptance_criteria>

<thinking>
Sketch each layout; map regions to components; decide the cart and orders data models. Only then write.
</thinking>
```

---

### [x] C9 — Account centre: account-settings

```xml
<role>
You are a senior Vue 3 + TypeScript engineer and product designer building a production-grade,
free account-management template for dzup-ui from the @dzup-ui/core library.
</role>

<context>
The shipped app-settings is a single settings surface; competitors ship a fuller multi-tab
ACCOUNT CENTRE (profile / security / notifications / billing) — docs/templates.md §3. Build a
distinct, richer template from free core only.
Read first:
- docs/templates.md §6.6 (your row) and §5 (quality bar).
- apps/landing/src/templates/app-settings/ and user-profile/ and billing-plans/ (shipped
  references for the tabbed settings, profile and billing patterns to combine) and registry.ts.
- Appendix A to confirm every component is real.

<batch>
- account-settings — "Account Centre": DzAppShell + DzTabs across Profile (avatar upload
  placeholder, name/bio DzFormFields), Security (password change, 2FA DzSwitch, active
  sessions DzDescriptions/list), Notifications (a matrix of DzSwitches), and Billing (current
  plan DzBadge, payment method, invoices snippet). Real form controls, a sticky save bar with
  a DzAlert confirmation. Built with: DzAppShell, DzTabs, DzFormField, DzInput, DzSwitch,
  DzSelect, DzAvatar, DzButton, DzDivider, DzAlert, DzBadge, DzDescriptions.
</batch>
</context>

<task>
Create apps/landing/src/templates/account-settings/AccountSettings.vue (full-page, chromeless)
built ONLY from the listed core components with realistic co-located data; make tab switching
and the save confirmation work client-side. Register in registry.ts (category 'dashboards';
tags from E1; createdAt 2026-06-25). Verify via /templates/account-settings in both themes at
390px + desktop. Go beyond basics — make it feel like a real account centre, not a form dump.
</task>

<constraints>
- §5 quality bar mandatory. Token-only; real components; self-contained; no invented imports.
- TS strict; `.ts` extensions; vue-tsc clean; validate with `vite build` (apps/landing).
</constraints>

<deliverables>
The template folder (component + optional data) + the registry.ts addition; a one-line
self-check (light/dark + responsive) + any substitutions.
</deliverables>

<acceptance_criteria>
- account-settings appears under "Dashboards & Apps", carries "New", previews live in both
  themes at mobile + desktop; tabs switch and the save bar confirms client-side.
- No invented imports; `vite build` + `yarn typecheck` pass.
</acceptance_criteria>

<thinking>
Sketch the four tabs and map each field/region to a core component; decide the settings data
model. Only then write.
</thinking>
```

---

### [x] Q1 — QA, accessibility & build verification (closing gate)

```xml
<role>
You are a meticulous quality engineer auditing the complete, enhanced Templates feature before
it ships.
</role>

<context>
The experience upgrades (E1–E6) and ~18 new free templates (C1–C9) are implemented on top of
the original 24. Verify the whole feature against the spec and the §5 quality bar, and confirm
nothing regressed.
Read first: docs/templates.md §1, §2, §5, §6, §7; the executed E1–E6 and C1–C9 output;
apps/landing/src/templates/registry.ts; the three Templates pages.
</context>

<task>
1. CATALOGUE: confirm TEMPLATES now has the original 24 plus every §6 slug (≈42 total), each
   with complete metadata, tags, createdAt, a working load(), and a resolvable source — no dead
   routes, no missing detail pages, no duplicate slugs.
2. PER-TEMPLATE: for each NEW template verify it renders in light AND dark, reflows at
   390/768/desktop, has one logical heading order, keyboard-reachable controls with visible
   focus, and uses ONLY token-based color/radius/shadow/font (grep src/templates for raw hex
   and hardcoded Tailwind color classes — report any with file:line).
3. GALLERY (E2/E3): ⌘K search opens and filters; tag chips + category + sort compose; "New" and
   "Featured" badges are correct; DzEmpty shows for empty combinations; per-category counts are
   right; the grid <ul> is labelled and cards reserve aspect-ratio (no CLS).
4. DETAIL (E3/E4/E5): per-template SEO head is set; Preview/Code tabs show real highlighted
   source + "Copy" + "Copy for LLM"; the primary-colour swatch re-skins ONLY the preview
   correctly in light+dark; the RTL toggle mirrors; reset/fullscreen preserve params; device
   switcher, theme toggle, built-with deep-links, view-source, copy-path and prev/next still work.
5. THUMBNAILS (E6): `yarn thumbnails` regenerates light+dark images for every slug; the gallery
   shows them theme-matched with icon fallback; images are committed and lazy-loaded.
6. BUILD: run `yarn typecheck` and `vite build` (apps/landing); both must pass.
</task>

<deliverables>
A checklist report: per-template pass/fail on §5, a list of any raw-color or a11y violations
with file:line, the gallery/detail/thumbnail feature audit, and the typecheck/build results.
Fix or file follow-ups for every failure.
</deliverables>

<acceptance_criteria>
- ≈42/42 templates reachable, registered, and previewing in both themes at mobile + desktop.
- Search, tag/category/sort filtering, badges, code tabs, colour customiser, RTL and thumbnails
  all function as specified; nothing from the original 24 regressed.
- Zero raw-color violations inside src/templates; `yarn typecheck` = 0 errors; `vite build` succeeds.
</acceptance_criteria>
```

---

## 8. Open decisions & strategic ideas

Confirm these before/around building; the AI-native items are deliberately **out of this backlog's scope** (larger than a landing-app task) but recorded so they aren't lost:

1. **Thumbnails timing.** E3 makes the gallery thumbnail-ready; E6 generates them with Playwright. If headless screenshots can't run in the unattended `/run-tasks` environment, run E6 attended (`-Attended`) or by hand — the icon fallback keeps the gallery shipping in the meantime.
2. **Catalogue size.** §6 grows free templates 24 → ~42. If that's too many for one push, the C-tasks are independent — run the highest-value first (recommend C1 auth, C5 chat/calendar, C7 data-table).
3. **In-preview customiser depth.** E5 ships primary-colour presets + RTL. A full theme generator that *exports* copy-paste CSS variables (tweakcn / PrimeVue Theme Designer style) is a bigger, separate feature — defer.
4. **AI-native distribution (high strategic value, separate project).** A Vue-native **shadcn-style registry + `npx … add` CLI**, an **"Open in v0"** deep-link, an **MCP server** exposing templates to coding agents, and **`llms.txt` + per-page Markdown**. Vue's AI-distribution rails are still underserved — a real chance to leapfrog — but this is its own initiative, not a landing-app task. (E4 ships the cheap slice: "Copy for LLM".)
5. **Nav entry.** Consider promoting "Templates" to a top-level nav link now that the gallery is rich (landing.md §13 / TopNav), instead of only the `#ecosystem` scroll.
6. **Pro templates.** The paid tier is specified in [§9](#9-pro-templates-paid-tier); it depends on the free foundation and is skipped by `/run-tasks` until `-Tier pro`.

---

## 9. Pro templates (paid tier)

> The full Pro investigation, catalogue (12 templates across analytics / productivity / collaboration / editors / builder / automation) and the T11–T14 task backlog are specified in [`docs/templates-old.md` §10](./templates-old.md). That spec stands unchanged: Pro templates are an **additive** extension built from `@dzup-ui-pro/pro`, surfaced in the **same** gallery with a **"Pro"** badge and pro-Storybook deep-links, gated behind the Phase-1 funnel (`PRO_LIVE=false`). They reuse every enhancement in this doc (search, tags, code tabs, customiser, thumbnails) for free once those land.
>
> **Execution note:** Pro tasks live under this `## … Pro … (paid tier)` heading so `/run-tasks` parses them as the Pro tier and **skips them by default** (`-Tier free`). Run them only with `-Tier pro|all`, and only after the free foundation + `@dzup-ui-pro/pro` are ready. When picking the Pro work up, port T11–T14 from templates-old.md §10 here (or run that file directly) and apply this doc's §5 quality bar and the experience features (E1–E6) to the Pro rows as well.

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

## Appendix B — Pro `@dzup-ui-pro/pro` components (for §9 Pro templates only)

Confirmed exports (from `dzup-ui-pro/packages/pro/src/components/*/index.ts`) — **41 components across 8 families**. Pro story ids follow `pro-<family>-<dzcomponent>`. Reachable from `apps/landing` because the repo root declares one Yarn workspace spanning both `dzup-ui/*` and `dzup-ui-pro/*`. Import via the package name `@dzup-ui-pro/pro`, never a relative path into the sibling package.

- **builders:** DzDashboardBuilder, DzDashboardWidget, DzFormBuilder, DzFormBuilderField, DzFormBuilderSection, DzSchemaForm, DzReportBand, DzReportBuilder, DzReportElement
- **business:** DzWorkspaceShell, DzAuditLog, DzNotificationCenter, DzFileManager, DzRibbon
- **communication:** DzAiAssistant, DzAiCodeBlock, DzAiMarkdown, DzToolCallCard, DzChat, DzChatMessage, DzCommentItem, DzComments, DzReactionPicker
- **data-pro:** DzDataGridPro, DzDataLineage, DzFilterBuilder, DzPivotTable, DzQueryBuilder, DzQuickFilter, DzVirtualTable
- **editors:** DzCodeEditor, DzJsonEditor, DzMarkdownEditor, DzRichTextEditor, DzPdfViewer, DzSpreadsheet, DzDiffViewer, DzSignaturePad, DzImageEditor, DzNotebook, DzNotebookCell
- **planning:** DzCalendar(+DayView/WeekView/MonthView), DzGantt, DzGanttTaskRow, DzKanban, DzKanbanCard, DzKanbanColumn, DzMindMap, DzScheduler, DzCronEditor
- **visualization:** DzChart, DzChartDataTable, DzDiagramEditor, DzHeatMap, DzTreeMap, DzOrgChart, DzSparkline, DzGauge, DzScorecard, DzGeoMap, DzWhiteboard, DzSankeyDiagram, DzNetworkGraph, DzFunnelChart, DzStockChart, DzSchemaDesigner, DzBarcode
- **workflow:** DzWorkflowDesigner, DzWorkflowEdge, DzWorkflowNode, DzWorkflowToolbar, DzApprovalFlow
