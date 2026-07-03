# Blocks — Best-in-Class `/blocks` Upgrade (Design, Research & Task Specification)

> **Status:** **Display infrastructure + free catalog are LIVE.** `/blocks` ships a typed registry,
> `BlockPreview` shell (Preview/Code tabs · 3-width viewport · copy · fullscreen · "built from" chips),
> a category-indexed index page with sticky nav + deep-links, a Vitest registry guard, and SEO meta —
> with **75 free blocks authored across 10 categories**. This document specifies the **next increment:
> the features that move `/blocks` from "good copy-paste gallery" to *best-in-class for 2025–2026*.**
> **Owner:** dzup-ui team · **Last updated:** 2026-06-25
> **Scope:** Elevating the existing `/blocks` surface in `apps/landing` — discovery, preview fidelity,
> code-delivery sophistication, AI-native distribution (registry / `llms.txt` / MCP), in-browser theming,
> trust signals, and filling the two empty catalog categories (commerce, content).
> **Supersedes:** [`blocks-old.md`](./blocks-old.md) — the original "build the gallery + catalog" spec
> (Phases A–D). That doc's *Phase D (Pro blocks 🔒)* is **carried forward unchanged** here (§9); this doc
> does **not** re-open Phases A–C, which shipped.
> **Read first:** [`blocks-old.md`](./blocks-old.md) (origin spec, catalog tables, Appendices A–C),
> [`docs/landing.md`](./landing.md) (landing-page spec), and the root [`CLAUDE.md`](../CLAUDE.md)
> (architecture + the styling/contract rules every block and every UI surface must obey).
>
> **This is a task spec, not an implementation.** Per the request, the goal is documentation good enough
> that a later agent (or person) implements each piece correctly on the first pass. Tasks in §8/§9 are
> written as **self-contained prompts** following Anthropic's prompt-engineering guidance (§7).

---

## 0. Current state — what `/blocks` actually has today (verified)

A walk of `apps/landing/` (2026-06-25) establishes the real baseline this upgrade builds on. **Do not
rebuild any of this; extend it.**

**Registry** — `src/blocks/registry.ts`. `BlockDef` = `{ id, title, description, category, tags[],
components[], component, source, responsive? }`. `component`/`source` are wired via two `import.meta.glob`
passes over `./<category>/*.vue` (lazy `defineAsyncComponent` + eager `?raw`), paired by `loadBlock(path)`
and registered through `defineBlock(entry)`. Helpers: `blocksByCategory(category)`. **No `tier` /
`proComponents` field yet** (Pro is §9). `BlockCategory` = 12 ids: `marketing`, `application`, `layout`,
`media`, `data`, `feedback`, `overlays`, `buttons`, `auth`, `forms`, `commerce`, `content`.

**Catalog** — **75 authored blocks** registered, matching the `.vue` files 1:1:

| Category | Shipped | | Category | Shipped |
|---|---|---|---|---|
| marketing | 10 | | overlays | 9 |
| application | 6 | | buttons | 5 |
| layout | 7 | | auth | 6 |
| media | 6 | | forms | 13 |
| data | 7 | | feedback | 6 |
| | | | **commerce** | **0 ← empty** |
| | | | **content** | **0 ← empty** |

**`BlockPreview` shell** — `src/components/blocks/BlockPreview.vue`. Has: Preview/Code tabs (`DzTabs`),
a 3-width viewport `DzSegmented` (Mobile 390 / Tablet 768 / Desktop 100%, hidden on Code), `DzCopyButton`
(copies the exact `source`), fullscreen via `DzDialog size="full"`, a "Built from N components" chip row,
and category-accent theming (`--lp-cat-500`). **Does NOT have:** per-preview light/dark, RTL, draggable
resize, framework/language tabs, TS/JS toggle, CLI/registry install, any "open in" handoff, or a theme editor.

**Index** — `src/pages/BlocksIndexPage.vue` renders one category at a time (mount/unmount per category =
perf win), with a sticky `BlockCategoryNav.vue` (roving-tabindex APG tabs, animated pill), `BlockCard.vue`
(title · description · component chips · hash link), directional slide transitions, pager, and deep-links
(`#<category>` and legacy `#<block-id>`). **Does NOT have:** search, tag filter, ⌘K palette, or
component reverse-lookup.

**Tests** — `src/blocks/registry.spec.ts` (Vitest) asserts unique kebab ids, non-empty
title/description/source, valid category, and that **every `components[]` name is a real `@dzup-ui/core`
export**. No rendering / a11y / visual tests.

**Routing & SEO** — `/blocks` route in `src/router.ts` with per-route `meta.head` (title + description →
`<title>`, description, OG, Twitter). No per-block routes, no OG images.

**Validation in this repo:** `yarn typecheck` + the landing `vite build` + Vitest. **ESLint is broken
locally** (`MEMORY.md` → "Lint config broken"; sibling `eslint.config.shared.js` absent) — **never gate on
it.** Bake `typecheck` + `vite build` (+ Vitest where a guard exists) into every task's acceptance criteria.

---

## 1. What "best-in-class" means in 2025–2026 (research synthesis)

Two research sweeps fed this spec: a **competitive teardown** of the leading block galleries, and a scan of
**next-level patterns** the frontier is adopting. The headline finding: *a blocks gallery is no longer a
human-only docs site — it is an API for both humans and AI agents.* Vercel frames the shadcn registry
exactly this way ("an API for AI systems, not just a documentation site"), and almost every differentiator
below bends toward that.

### 1.1 How the leaders present & deliver blocks

| Library | Browse model | Per-block viewing | Code delivery | Free/Paid |
|---|---|---|---|---|
| **Tailwind Plus** | Category index, 500+ (Marketing/App/Ecom) | Live preview, responsive resizer, fullscreen | **HTML / React / Vue code tabs** + Copy | Paid |
| **shadcn/ui Blocks** | Category tabs + registry directory | Preview↔code, **resizer**, **file tree**, open in isolated tab | **`npx shadcn add @reg/x`**, **Open in v0**, **MCP** install | Free (MIT) |
| **PrimeVue Blocks** | Category index, 350+ | Live preview + code | Copy-paste | Free + license |
| **Nuxt UI Pro** | 10 full templates (Vue/Nuxt) | Live preview, deploy buttons, light/dark shots | Components/sections used directly; **`llms.txt`/`llms-full.txt`** | Free-in-dev, pay-to-deploy |
| **CoreUI** | Admin template + components | Demos across **Bootstrap/React/Angular/Vue** | Same API per framework | Free MIT + Pro |
| **Bootstrap** | Official Examples (Heroes/Footers/Dashboard…) | Static example pages, view-source | Copy from source | Free MIT |
| **Flowbite Blocks** | Filterable (Marketing/App/Publisher/Ecom), 459 | **Configurator** + real-time preview, **dark toggle** per block | Tailwind HTML + framework variants | MIT + Pro (Figma) |
| **Preline / HyperUI / Meraki / TailGrids** | Free Tailwind galleries (200–600+) | Preview + copy, **dark + RTL** baseline | Zero-install copy-paste; TailGrids adds CLI | MIT + Pro |
| **v0 / 21st.dev** | AI marketplaces | Prompt→UI, click-to-edit | **`npx shadcn add`** of generated output; **Magic MCP** (`/ui` in IDE) | Freemium |

### 1.2 The 12 features that distinguish a best-in-class gallery (ranked by impact)

1. **Multi-framework / multi-form code output** from one block (Vue SFC + framework-neutral HTML; optionally
   template-only vs full-SFC, TS vs JS) — Tailwind Plus's moat.
2. **CLI / registry install** — a shadcn-compatible `registry.json` + `/r/<id>.json` so `npx shadcn-vue add
   <url>` drops the block into a user's project. Turns copy-paste into AI-installable distribution.
3. **MCP server / registry endpoint** — agents in Cursor/Claude/Windsurf "find me a pricing section" and
   install it. The 2026 AI-native distribution layer; *free* once the registry exists.
4. **Preview↔code toggle + copy** per block — universal (we have this).
5. **Responsive viewport resizer** — presets **plus** drag-to-resize with a live px readout (we have presets only).
6. **Per-block light/dark toggle** — independent of the site theme (we have neither per-block).
7. **Open-in-isolated-tab / fullscreen standalone route** — chrome-free inspection, also the iframe src + OG source.
8. **Searchable, filterable index** — full-text + tags + **"blocks using DzTable"** reverse-lookup, and a ⌘K palette.
9. **Per-block dependency manifest** — visible "Built from" + generated import statements + npm install line.
10. **"Open in v0" / AI-edit handoff** — one URL to remix a block with your tokens preloaded.
11. **In-browser theming/customizer** — change brand color / radius / density and see *all* previews
    re-theme, with the same tokens serialized into the copied code (token-system flagship; tweakcn is the exemplar).
12. **Trust signals** — per-block "WCAG AA / verified light-dark / RTL-tested / responsive" marks, ideally CI-backed.

### 1.3 Frontier patterns worth adopting (and how, on our Vite + Vue 3 stack)

- **Registry-as-distribution** — `shadcn-vue build` reads a `registry.json` and emits per-item JSON to
  `public/r/`; our Vite app already serves static assets. Schema fields per item: `name`, `type:
  registry:block`, `title`, `description`, `files[]`, `registryDependencies[]` (our `components[]`),
  `dependencies[]` (npm, e.g. `@dzup-ui/core`). Namespaced registries (`@dzup/hero-split`) and
  `${ENV_VAR}` install-time auth headers exist for private/Pro tiers.
- **AI-readable docs** — Nuxt UI's `llms.txt` (≈5K-token index) + `llms-full.txt` (full impl) + per-block
  `.md` endpoints; markdown is ~6× cheaper than HTML for the same content. "Copy as prompt for Cursor/Claude"
  becomes a one-click action returning clean markdown + the dependency manifest.
- **Token theme editor** — because our system is already CSS-variable-driven (`--dz-*`), an editor only
  mutates a scoped root; the browser re-themes live with no recompile, and the *same* token values serialize
  into the copied snippet's `:root{}` — single-source guarantee. tweakcn (React/MIT) is the reference model.
- **Preview fidelity** — iframe isolation for full-section blocks (true responsive + own dark/RTL scope),
  inline for atoms; draggable handle + breakpoint presets + device width readout; `dir="rtl"` on the iframe
  root; a deep-linkable `/blocks/preview/:id?theme=&dir=&w=` route that doubles as iframe src, "open in new
  tab", and the OG-image render source.
- **Discoverability** — `cmdk`-style ⌘K palette (we ship `DzCommandPalette` — dogfood it); faceted search
  off existing fields; reverse-lookup off `components[]`; deep-linkable per-block SEO pages + auto OG images.
- **Performance** — `IntersectionObserver` to mount/hydrate previews on scroll; code-split the catalog;
  defer the syntax highlighter and theme editor until opened. (We already mount one category at a time;
  this extends that to within-category lazy mounting for the 13-block `forms` deck.)
- **Trust** — per-block axe-core run in CI stamping a real "WCAG AA" badge (don't slap a decorative one);
  visual-regression snapshots across themes/dirs feeding "verified light/dark · RTL · responsive" marks.

---

## 2. The gap — current → best-in-class

| Best-in-class feature (§1.2) | Today | This doc |
|---|---|---|
| Preview↔code + copy + fullscreen | ✅ shipped | — |
| Viewport presets | ✅ (presets only) | **F3** adds drag + px readout |
| Category-indexed browse + deep-link | ✅ shipped | — |
| Search / tag filter / reverse-lookup | ❌ | **E1–E4** |
| ⌘K command palette | ❌ | **E2** |
| Lazy preview hydration | ⚠️ per-category only | **E5** |
| Per-block light/dark | ❌ | **F1** |
| RTL toggle | ❌ | **F2** |
| Standalone per-block route | ⚠️ dialog only | **F4** |
| Template-vs-SFC / TS-vs-JS / import gen | ❌ | **F5** |
| Dependency manifest (imports + install) | ⚠️ chips only | **F6** |
| shadcn-vue registry (`npx … add`) | ❌ | **G1** |
| `llms.txt` + per-block `.md` | ❌ | **G2** |
| Copy-as-prompt / copy-as-markdown | ❌ | **G3** |
| Open in v0 | ❌ | **G4** |
| MCP server | ✅ shipped (G5 — config + docs) | — |
| In-browser token theme editor | ❌ | **H1** |
| Commerce + Content catalog | ❌ empty | **I1–I2** |
| CI-backed a11y / trust badges | ❌ | **I3** |
| Per-block SEO pages + OG images | ❌ | **I4** |

---

## 3. Design decisions (rationale behind the tasks)

These resolve the "how", so the §8 tasks can stay focused on execution. Open questions are in §10.

### 3.1 Browse model stays category-indexed; search is an overlay, not a replacement
The one-category-at-a-time deck is a deliberate perf decision and reads well. **Search/filter is an
additional mode**, not a rebuild: when a query or tag is active, the index switches to a flat "results"
grid spanning all categories; clearing it restores the category deck. The ⌘K palette is a *navigation*
shortcut layered on top (jump to a block/category/component), independent of the on-page filter.

### 3.2 Code delivery: enrich the existing Code tab, don't fork it
The Code tab already shows the verbatim `?raw` SFC. We add **toggles within that tab** — *Full SFC ↔
Template-only*, *TS ↔ JS* — and an **auto-generated import line** derived from `components[]`. Template-only
and JS variants are **derived deterministically** from the canonical SFC at runtime (strip `<script>`/types),
so there is still one source of truth and zero drift. Multi-*framework* (React) output is explicitly
**out of scope** (high-effort, low-ROI for a Vue library) — the framework-neutral story is the registry (G1).

### 3.3 Distribution: ship a shadcn-vue-compatible registry — it unlocks #2, #3, #10 at once
Adopting the shadcn-vue registry schema is the highest-leverage single decision: it gives `npx shadcn-vue
add <url>` install, MCP installability, and "Open in v0" essentially for free, and it formalizes the
dependency manifest. The registry JSON is **generated from the existing `BLOCKS` array at build time** (a
small script), emitted to `apps/landing/public/r/`, and served as static assets — no new runtime, no new
service. `registryDependencies` = `components[]`; `dependencies` = `["@dzup-ui/core","@dzup-ui/tokens"]`.

### 3.4 Theming: the token editor themes preview AND copied code from one state
Our `--dz-*` token system makes this the flagship differentiator. A small reactive theme store (brand
color / radius / density) binds CSS variables on the preview root **and** serializes the same overrides into
the copied snippet (a `:root{}` block or a registry `theme` item). Scope it to a global toolbar affecting all
live previews so it's discovered once and applies everywhere.

### 3.5 Preview fidelity: iframe for section-blocks, keep inline for atoms
Full-section blocks (heroes, app-shells, dashboards) get **iframe isolation** so per-preview light/dark, RTL,
and true responsive resize don't leak into the page and sticky/fixed layouts behave honestly. Small atoms
(buttons, badges) can stay inline. The standalone route `/blocks/preview/:id` is the iframe `src`, the
"open in new tab" target, and the OG-image source — one route, three uses.

### 3.6 Trust signals must be earned, not decorative
A "WCAG AA" badge only ships if an **axe-core run per block in CI** backs it (extends `registry.spec.ts` or a
new Vitest+jsdom suite). "Verified light/dark · RTL · responsive" marks come from the same CI, not a manual claim.

**Implemented (Task I3).** `src/blocks/a11y.spec.ts` mounts every `BLOCKS` entry with zero props under each
audited theme and runs `axe-core` (WCAG 2.0/2.1 A+AA tags), failing loudly on any `serious`/`critical`
violation. `BlockCard`/`BlockPreview` render `BlockTrustMarks`, whose badges map 1:1 to what that suite proves —
the marks and the checks share one source of truth, `src/blocks/certifications.ts`, and a meta-test there forbids
drift. Each mark certifies exactly:

| Mark | Certifies | Backed by |
|------|-----------|-----------|
| **Accessible** | Zero serious/critical axe violations (unnamed controls, missing alts, broken ARIA, bad roles). | every CI run of the suite |
| **Light + dark** | The above audit runs under *both* `light` and `dark` (`AUDITED_THEMES`). | the suite's per-theme loop |

Deliberately **not** shipped: a "Responsive" mark — reflow at the `900px`/`560px` breakpoints needs a real layout
engine, which jsdom lacks, so no Vitest check can honestly back it (it's a Playwright-viewport follow-up). And
contrast (`color-contrast`) is axe-`incomplete` under jsdom, so it is verified via the preview's light/dark toggle,
not claimed by the marks. Blocks with known **core-component** a11y debt (`KNOWN_A11Y_DEBT`) render *no* marks and
are tracked by a bounded-debt check (fails on any *new* rule) rather than wearing a badge the CI can't back.

### 3.7 The non-negotiable quality bar (inherited — applies to blocks AND new UI)
Every block and every new gallery surface obeys the library's gates (`CLAUDE.md`):
- **Token-only styling** — only `var(--dz-*)`; no raw hex, no hardcoded Tailwind color classes, no color
  literals in `<style scoped>`. Layout-only scoped CSS (grid/flex/spacing) is fine.
- **Built from real `@dzup-ui/core` components** — no bespoke re-implementations of shipped components.
- **WCAG AA** — semantic landmarks/headings, keyboard reachable, visible focus (`--dz-ring`), AA contrast in
  both themes, labelled controls. **Honor `prefers-reduced-motion`** for any motion.
- **Responsive** — sensible reflow at the app breakpoints (`900px`, `560px`/`520px`).
- **Light + dark verified.**
- **TypeScript-strict, `<script setup lang="ts">`, `.ts` import extensions.**
- **Validate with `yarn typecheck` + landing `vite build` (+ Vitest where a guard exists). Never ESLint.**

---

## 4. Where new files live (extends `blocks-old.md` §3.4)

```
apps/landing/
  public/
    r/                              # G1: generated shadcn-vue registry (registry.json + <id>.json)
    llms.txt  llms-full.txt          # G2: generated AI-readable index (+ /r/<id>.md per block)
  scripts/
    build-registry.ts                # G1/G2: generates public/r/* and llms*.txt from BLOCKS
  src/
    blocks/
      registry.ts                    # extend: derive search index, manifest helpers (no schema fork)
      registry.spec.ts               # extend: G1 manifest validity; I3 a11y guard
      commerce/  content/            # I1/I2: fill the two empty categories
    composables/
      useBlockSearch.ts              # E1: search/filter/reverse-lookup over BLOCKS
      useBlockTheme.ts               # H1: reactive token-override store for previews + copy
      useBlockCodeView.ts            # F5: SFC↔template, TS↔JS, import generation
    components/blocks/
      BlockPreview.vue               # extend: F1 light/dark, F2 RTL, F3 drag, F5 code toggles, G3/G4 actions
      BlockCard.vue                  # extend: F6 manifest, I3 trust marks
      BlockCommandPalette.vue        # E2: ⌘K jump-to-block (DzCommandPalette)
      BlockSearchBar.vue             # E3: search + tag filter bar
      BlockThemeToolbar.vue          # H1: brand/radius/density editor
      BlockManifest.vue              # F6: imports + npm install + registry-add line
    pages/
      BlocksIndexPage.vue            # extend: E3 results mode; E2 palette mount
      BlockPreviewPage.vue           # F4: /blocks/preview/:id standalone full-bleed route
      BlockDetailPage.vue            # I4: /blocks/:id SEO page (optional, see §10)
```

---

## 5. Phasing & priority

Ordered by the research's impact×effort (low-effort/high-impact first). **Each phase is independently
shippable**; do tasks within a phase in listed order. Phase letters continue from `blocks-old.md` (A–D used).

| Phase | Theme | Tasks | Priority |
|---|---|---|---|
| **E — Discovery & browse** | search, tags, ⌘K, reverse-lookup, lazy hydration | E1–E5 | **P0** |
| **F — Preview fidelity & code delivery** | light/dark, RTL, drag-resize, standalone route, code toggles, manifest | F1–F6 | **P0–P1** |
| **G — Distribution & AI-native** | registry, llms.txt, copy-as-prompt, open-in-v0, MCP | G1–G5 | **P1** |
| **H — In-browser theming** | token editor (preview + copied code) | H1 | **P2** |
| **I — Catalog completion & trust** | commerce + content blocks, a11y CI badges, SEO pages | I1–I4 | **P1–P2** |
| **(§9) D — Pro blocks 🔒** | carried forward from `blocks-old.md` unchanged | D1–D11 | gated |

> **Sequencing notes.** **G1 (registry) is the lever** — do it early; it underpins G3/G4/G5 and F6's
> install line. **F4 (standalone route)** unblocks F1/F2/F3 iframe fidelity and I4's OG images. **H1**
> depends on F4's iframe root for per-preview token scoping. **I3** depends on the catalog being stable.

---

## 6. (reserved)

---

## 7. How these tasks are written (Anthropic prompt-engineering conventions)

The tasks in §8/§9 are authored as **prompts**, applying Anthropic's prompt-engineering guidance
(docs.anthropic.com → *Build with Claude → Prompt engineering*), so a later agent executes each with minimal
ambiguity:

1. **Be clear and direct** — each task states the exact goal, the files to touch, and the definition of done.
2. **Give role / context** — a `<context>` block says who the agent is, what already exists, and why it matters.
3. **Use XML tags to structure** — `<context>`, `<task>`, `<steps>`, `<constraints>`, `<example>`,
   `<acceptance_criteria>`, `<output>` separate instruction from data and keep parsing unambiguous.
4. **Provide examples (multishot)** — concrete reference files (`ShowcaseDashboard.vue`, the existing
   `BlockPreview.vue`) and skeletons anchor the expected shape and quality.
5. **Let the model think** — steps are explicit and ordered; tasks ask the agent to inventory/plan before coding.
6. **Specify the output format** — every task ends with an exact deliverable + how it will be verified.
7. **Constrain to prevent drift** — the repo's hard rules (token-only, real components, no ESLint locally,
   extend-don't-fork the existing infra) are restated in every code task so they can't be missed.

**How to use a task:** copy its fenced `<context>…</output>` body as the prompt for an implementation agent.
Keep tasks small enough to verify independently; do them in the phase order of §5. Tick a checkbox once the
task's acceptance criteria are met. (The `/run-tasks` orchestrator consumes exactly this format — one fenced
prompt block per `####` task heading.)

---

## 8. Tasks

Checkboxes track status. Phase order: **E → F → G → H → I**. Each task is a standalone prompt.

### Phase E — Discovery & browse

#### [x] Task E1 — Search/filter/reverse-lookup data model (`useBlockSearch`)

```
<context>
You are a Vue 3 + TypeScript engineer on the dzup-ui landing app (apps/landing). The /blocks index
(src/pages/BlocksIndexPage.vue) browses 75 blocks one category at a time via a registry
(src/blocks/registry.ts: BlockDef = { id, title, description, category, tags[], components[], component,
source }). There is currently NO search, NO tag filter, and NO way to find "blocks that use DzTable". Before
building any search UI (E2/E3/E4), create the headless data layer they all share. Read docs/blocks.md §0,
§3.1; study registry.ts (BLOCKS, blocksByCategory) for conventions.
</context>

<task>
Create src/composables/useBlockSearch.ts: a headless, dependency-free composable that filters the BLOCKS
registry by free-text query, by tag, and by component name, and exposes the inverse "blocks using <Dz*>"
lookup. UI is built in later tasks — this task ships data + tests only.
</task>

<steps>
1. Add useBlockSearch(): expose reactive `query` (string) and `activeTags` (string[]) refs, and computed
   `results: BlockDef[]` that matches query against title/description/id/tags/components (case-insensitive
   substring; simple ranking — title hits before description/component hits is enough, no fuzzy lib).
2. Export derived helpers off the registry (in registry.ts or the composable): `allTags(): string[]`
   (unique, sorted), `allComponents(): string[]` (unique union of every block's components[]), and
   `blocksUsingComponent(name): BlockDef[]`.
3. Keep it framework-light: no new npm dependency; pure computed/ref. Memoize the unique-tag/component lists.
4. Add src/composables/useBlockSearch.spec.ts (Vitest): query matches expected blocks; tag filter narrows;
   blocksUsingComponent('DzButton') returns only blocks whose components[] includes it; empty query returns
   all blocks in registry order.
</steps>

<constraints>
- TypeScript strict; `.ts` import extensions; no new runtime dependency.
- Do not modify BlockDef's shape or the existing registry guard (registry.spec.ts) — derive, don't restructure.
- Pure/headless: no DOM, no component imports. The composable must be unit-testable without mounting.
</constraints>

<acceptance_criteria>
- `yarn typecheck` passes; the new Vitest spec passes.
- useBlockSearch exposes query, activeTags, results; allTags/allComponents/blocksUsingComponent work.
- No regression to registry.spec.ts.
</acceptance_criteria>

<output>
src/composables/useBlockSearch.ts (+ spec, + any registry.ts helper exports). In your reply, list the exact
exported surface and the matching rules you implemented.
</output>
```

#### [x] Task E2 — ⌘K command palette to jump to any block (dogfood DzCommandPalette)

```
<context>
You are in apps/landing. /blocks has 75 blocks across 10 categories but no fast way to jump to one. The
library ships DzCommandPalette (verified in @dzup-ui/core overlays) — dogfood it. The registry
(src/blocks/registry.ts) and useBlockSearch (Task E1) provide the data. Read docs/blocks.md §3.1; study an
existing overlay block (src/blocks/overlays/*.vue) that uses DzCommandPalette for the intended API.
</context>

<task>
Add a global ⌘K / Ctrl+K command palette on /blocks that searches blocks, categories, and components, and on
select navigates to that block's deep link (#<id>, opening its category) or scrolls to it. Build it from
DzCommandPalette.
</task>

<steps>
1. Create src/components/blocks/BlockCommandPalette.vue using DzCommandPalette. Source its items from the
   registry via useBlockSearch: grouped "Blocks" (title + category + component chips), "Categories", and
   "Components" (selecting a component filters to blocksUsingComponent — defer the filtered view to E3/E4 or
   navigate to the first match for now).
2. Open on ⌘K (mac) / Ctrl+K, close on Esc; trap focus; restore focus to the trigger on close (rely on
   DzCommandPalette's built-in a11y — do not re-implement). Add a visible "⌘K" affordance/button in the
   /blocks hero or nav.
3. On select of a block: navigate to its category deck + scroll its preview into view (reuse the existing
   deep-link logic in BlocksIndexPage.vue — extract a shared helper if needed rather than duplicating it).
4. Mount the palette once in BlocksIndexPage.vue.
</steps>

<constraints>
- Build ONLY from real components (DzCommandPalette + chrome); token-only styling; no raw colors.
- Keyboard-complete and accessible; honor prefers-reduced-motion for any open/close animation.
- Reuse BlocksIndexPage's existing scroll/deep-link logic — do not fork navigation behavior.
</constraints>

<acceptance_criteria>
- ⌘K/Ctrl+K opens the palette anywhere on /blocks; typing filters blocks/categories/components live.
- Selecting a block navigates + scrolls to it; Esc closes and restores focus.
- `yarn typecheck` + `vite build` pass; verified light + dark.
</acceptance_criteria>

<output>
BlockCommandPalette.vue + the mount/trigger wiring. Note the DzCommandPalette API you used and how select →
navigation reuses existing logic.
</output>
```

#### [x] Task E3 — Search + tag filter bar on the index (results mode)

```
<context>
You are in apps/landing. BlocksIndexPage.vue browses one category at a time (mount/unmount per category — a
deliberate perf choice). We are ADDING a search/tag-filter mode, not replacing the category deck (docs/blocks.md
§3.1). useBlockSearch (Task E1) supplies query/tags/results. Read docs/blocks.md §3.1, §3.7; study
BlockSearchBar's siblings (BlockCategoryNav.vue, BlockCard.vue) for styling conventions and BlocksIndexPage.vue
for the deck/transition logic.
</context>

<task>
Add a search input + tag-filter chips above the category nav. When a query or tag is active, replace the
single-category deck with a flat "results" grid of BlockCards spanning ALL categories; when cleared, restore
the category deck exactly as today.
</task>

<steps>
1. Create src/components/blocks/BlockSearchBar.vue: a DzSearchInput bound to useBlockSearch().query plus
   tag chips from allTags() that toggle activeTags. Show a result count and a "clear" affordance.
2. In BlocksIndexPage.vue: compute `isFiltering = query || activeTags.length`. When true, hide the category
   deck + pager and render results (BlockCard grid → each opening its BlockPreview, reusing existing preview
   mounting). When false, render the existing deck unchanged.
3. Preserve deep-links: an incoming #<category>/#<id> with no active query still opens the deck as today;
   a search does not clobber the URL hash unless a block is selected.
4. Keep it responsive (reuse the 900/560 breakpoints) and honor prefers-reduced-motion on the mode switch.
</steps>

<constraints>
- Token-only; reuse DzSearchInput, BlockCard, the existing grid/breakpoints; no raw colors.
- Do NOT regress the category deck, its transitions, or deep-linking when no filter is active.
- Drive everything from useBlockSearch/the registry — no hardcoded block or tag lists.
</constraints>

<acceptance_criteria>
- Typing a query or toggling a tag shows a flat cross-category results grid with a live count; clearing
  restores the category deck and pager unchanged.
- Deep-links still work with no active filter. `yarn typecheck` + `vite build` pass; light + dark verified.
</acceptance_criteria>

<output>
BlockSearchBar.vue + BlocksIndexPage.vue edits. Note how results mode coexists with the deck without
regressing it.
</output>
```

#### [x] Task E4 — Component reverse-lookup ("blocks using DzTable")

```
<context>
You are in apps/landing. Each block advertises its components[] (real Dz* names) and renders them as chips on
BlockCard/BlockPreview. blocksUsingComponent(name) exists from Task E1. Read docs/blocks.md §1.2 (#8/#9),
§3.1. We want a developer who likes a component to discover every block that uses it.
</context>

<task>
Make the "Built from" component chips actionable: clicking a chip filters the index to blocks using that
component (via the Task E3 results mode), and add a small "N blocks use this" affordance.
</task>

<steps>
1. In BlockCard.vue and BlockPreview.vue, make each component chip a button that sets useBlockSearch into a
   component filter (reuse the activeTags/results mechanism or a dedicated `activeComponent` ref — pick one and
   keep it consistent) and shows the results grid (Task E3).
2. Show a count next to/inside each chip group ("DzTable · used in 6 blocks") sourced from
   blocksUsingComponent length; keep it subtle.
3. Ensure the chip is keyboard-operable (real button, visible focus) and announces its action (aria-label
   "Show blocks using DzTable").
</steps>

<constraints>
- Token-only chip styling (reuse the existing chip treatment); no raw colors.
- Reuse E1/E3 plumbing — do not add a parallel filtering path.
- Chips must remain readable as provenance even though they're now interactive.
</constraints>

<acceptance_criteria>
- Clicking a component chip shows all blocks using that component; the count is correct.
- Chips are keyboard-operable with visible focus and accessible labels. `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
Edited BlockCard.vue / BlockPreview.vue (+ any useBlockSearch addition). Note the single filtering path used.
</output>
```

#### [x] Task E5 — Lazy-hydrate previews within a category (IntersectionObserver)

```
<context>
You are in apps/landing. BlocksIndexPage mounts one category at a time, but a large category (forms = 13
blocks) still mounts every live BlockPreview at once. Best-in-class galleries hydrate previews on scroll
(docs/blocks.md §1.3 "Performance"). Read docs/blocks.md §0, §3.5; study how the page currently mounts a
category's stack.
</context>

<task>
Lazy-mount each block's live preview as it scrolls near the viewport, showing a lightweight placeholder
(DzSkeleton) until then, so a 13-block category is cheap to render.
</task>

<steps>
1. Add a small useLazyMount composable (or reuse an existing IntersectionObserver helper if the app has one)
   that flips a per-card `shouldRender` flag when the card enters a rootMargin-expanded viewport, then
   unobserves.
2. In the category stack, wrap each BlockPreview so it renders a DzSkeleton placeholder of roughly the right
   height until shouldRender is true.
3. Fallback for no-IntersectionObserver / reduced environments: render eagerly (never hide content). Ensure
   deep-linking to a below-the-fold block still scrolls correctly (force-mount the targeted block).
</steps>

<constraints>
- No layout shift jank: placeholders approximate final height; token-only DzSkeleton styling.
- Do not break deep-links to off-screen blocks (force-render the hash target).
- prefers-reduced-motion: no skeleton shimmer if disabled (DzSkeleton should already respect this — verify).
</constraints>

<acceptance_criteria>
- Scrolling a large category lazily mounts previews; initial render is measurably lighter (note the before/after
  count of mounted previews).
- Deep-linking to any block still scrolls to and renders it. `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
The lazy-mount helper + the category-stack edit. Note how the hash-target force-mount works.
</output>
```

### Phase F — Preview fidelity & code delivery

#### [x] Task F1 — Per-preview light/dark toggle

```
<context>
You are in apps/landing. BlockPreview.vue re-themes with the GLOBAL site toggle only; there is no way to
check a single block in the opposite theme without flipping the whole site. Best-in-class galleries offer a
per-preview light/dark toggle (docs/blocks.md §1.2 #6). Read docs/blocks.md §0, §3.5; study how the app sets
data-theme (src/composables/useTheme.ts / the FOUC IIFE) and BlockPreview.vue's header controls.
</context>

<task>
Add a per-preview light/dark toggle to the BlockPreview header that themes ONLY that preview's container,
independent of (and defaulting to) the global theme.
</task>

<steps>
1. Add a small theme control (DzColorModeToggle or a DzSegmented light/dark, matching the existing header
   control style) to BlockPreview's header, defaulting to the global theme.
2. Scope the override by setting data-theme (and any required token root class) on the preview container/root
   ONLY, so the surrounding page is unaffected. If the preview is iframe-isolated (after Task F4), set it on
   the iframe documentElement instead.
3. Ensure the toggle resets/follows the global theme sensibly when the user changes the site theme (decide
   and document: per-preview override persists until reset, OR follows global until explicitly overridden —
   prefer "follows global until overridden").
</steps>

<constraints>
- Token-only; reuse the app's theming mechanism (do not invent a second theming path).
- The override must not leak to the page or other previews; verify both themes render AA-contrast.
- Control is labelled (aria-label "Preview theme") and keyboard-operable.
</constraints>

<acceptance_criteria>
- Toggling one preview's theme changes only that preview; the page and other previews are unaffected.
- `yarn typecheck` + `vite build` pass; verified that both states hit AA contrast.
</acceptance_criteria>

<output>
BlockPreview.vue edit. Note where you scoped data-theme and the global-vs-override behavior you chose.
</output>
```

#### [x] Task F2 — RTL toggle in BlockPreview

```
<context>
You are in apps/landing. Blocks are only ever previewed LTR. RTL support is a baseline trust signal in modern
galleries (docs/blocks.md §1.2, §1.3). The library's components use logical properties via tokens, so most
blocks should flip cleanly. Read docs/blocks.md §3.5; study BlockPreview.vue header controls.
</context>

<task>
Add an LTR/RTL toggle to the BlockPreview header that sets dir on the preview root only, so developers can
verify a block mirrors correctly.
</task>

<steps>
1. Add a labelled LTR/RTL control to the header (consistent with the viewport/theme controls).
2. Set dir="rtl"/"ltr" on the preview container root (or the iframe documentElement after Task F4) only.
3. Spot-note in the per-block audit (Task I3 later) any block that visibly breaks in RTL so it can be fixed,
   but do NOT fix blocks in this task — this task ships the toggle only.
</steps>

<constraints>
- Token-only; the dir change must not affect the surrounding page or other previews.
- Control labelled (aria-label "Text direction") and keyboard-operable; honor prefers-reduced-motion.
</constraints>

<acceptance_criteria>
- Toggling RTL mirrors only that preview; page unaffected. `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
BlockPreview.vue edit. List any blocks observed to break in RTL (for Task I3), without fixing them here.
</output>
```

#### [x] Task F3 — Upgrade the viewport resizer: drag handle + live px readout

```
<context>
You are in apps/landing. BlockPreview offers 3 fixed width presets (Mobile 390 / Tablet 768 / Desktop 100%)
via DzSegmented. Best-in-class galleries add a draggable handle with a live pixel readout (docs/blocks.md §1.2
#5, §1.3). Read docs/blocks.md §0, §3.5; study BlockPreview.vue's preview-frame max-width logic.
</context>

<task>
Add a draggable resize handle on the preview frame's right edge that sets an arbitrary width, with a live
"<n>px" readout, while keeping the existing presets as quick-set buttons that update the same width state.
</task>

<steps>
1. Replace the fixed maxWidth with a reactive `width` state; the existing DzSegmented presets set it to
   390/768/full; add a drag handle that updates it on pointer drag (clamp min ~320px, max = container width).
2. Show the current width as a "<n>px" label near the handle/header; update live while dragging.
3. Pointer + keyboard: the handle is focusable and resizable with Arrow keys (±10px, ±50px with Shift),
   role="separator" aria-orientation="vertical" with aria-valuenow/min/max; respect prefers-reduced-motion.
4. Contain overflow so a narrow width never breaks the page layout (keep the existing containment).
</steps>

<constraints>
- Token-only; reuse the existing preview-frame container; no raw colors.
- Drag must be smooth (rAF / pointer events), keyboard-operable, and accessible.
- Presets and drag write to ONE width state (no divergence between them).
</constraints>

<acceptance_criteria>
- Dragging resizes the preview with a live px readout; presets still snap; keyboard resize works.
- No page-layout breakage at min width. `yarn typecheck` + `vite build` pass; light + dark verified.
</acceptance_criteria>

<output>
BlockPreview.vue edit. Note the width state model and the handle's a11y attributes.
</output>
```

#### [x] Task F4 — Standalone per-block preview route (`/blocks/preview/:id`)

```
<context>
You are in apps/landing. Fullscreen is currently a DzDialog overlay. Best-in-class galleries also offer a
deep-linkable standalone full-bleed route that doubles as the "open in new tab" target, the iframe src for
isolated previews, and the OG-image render source (docs/blocks.md §1.2 #7, §3.5, §1.3). Read docs/blocks.md
§3.5, §4; study src/router.ts (route + meta.head pattern) and registry.ts.
</context>

<task>
Add a route /blocks/preview/:id that renders ONLY the block component full-bleed, reading optional
?theme=light|dark, ?dir=ltr|rtl, ?w=<px> query params, and add an "open in new tab" affordance to
BlockPreview that links to it.
</task>

<steps>
1. Create src/pages/BlockPreviewPage.vue: resolve the block by :id from the registry (404/redirect to /blocks
   if unknown), render its component centered/full-bleed with no site chrome, applying theme/dir/width from
   query params.
2. Register the route in src/router.ts with a minimal meta.head (noindex is fine for the bare preview; the
   indexable page is Task I4).
3. In BlockPreview.vue, add a labelled "Open in new tab" DzIconButton linking to /blocks/preview/<id> (carry
   the current viewport width / theme / dir as query params).
4. This route is also the intended iframe src for F1/F2/F3 isolation and the OG source for I4 — keep it
   self-contained and param-driven.
</steps>

<constraints>
- Token-only; the page applies global token CSS but no nav/footer chrome.
- Unknown :id must not crash — redirect to /blocks. Params validated/clamped.
- Keep it dependency-free (reuse the registry + existing theming).
</constraints>

<acceptance_criteria>
- /blocks/preview/<id>?theme=dark&dir=rtl&w=420 renders that block alone, dark, RTL, 420px wide.
- "Open in new tab" from a preview opens the matching standalone view. `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
BlockPreviewPage.vue + router + BlockPreview "open in new tab" wiring. Note the param contract (theme/dir/w).
</output>
```

#### [x] Task F5 — Code-tab toggles: Full SFC ↔ Template-only, TS ↔ JS, generated imports

```
<context>
You are in apps/landing. BlockPreview's Code tab shows the verbatim ?raw SFC and copies it. Best-in-class
galleries let you choose Full-SFC vs Template-only and TS vs JS, and show the import line a consumer needs
(docs/blocks.md §1.2 #1/#9, §3.2). All variants must derive deterministically from the one canonical SFC — no
second source of truth. Read docs/blocks.md §3.2; study BlockPreview.vue's Code tab + DzCodeBlock/DzCopyButton.
</context>

<task>
Add a useBlockCodeView composable + Code-tab controls that transform the canonical SFC source into: Full SFC
vs Template-only, and TS vs JS, plus an auto-generated import statement from components[]. Copy copies the
currently-shown variant.
</task>

<steps>
1. Create src/composables/useBlockCodeView.ts: given a BlockDef.source, derive (a) template-only (extract the
   <template> block), (b) a JS variant (strip lang="ts" + obvious type annotations from <script setup> — keep
   it best-effort and clearly correct for our block style, do not attempt a full TS→JS compile), and (c) an
   import line: `import { <components[]> } from '@dzup-ui/core'`.
2. In BlockPreview.vue Code tab, add two small DzSegmented toggles (SFC|Template, TS|JS); DzCodeBlock shows
   the selected variant; DzCopyButton copies that exact variant; show the generated import line above it.
3. Unit-test useBlockCodeView (Vitest): template extraction, JS stripping on a sample SFC, import generation.
</steps>

<constraints>
- One source of truth: all variants derive from BlockDef.source at runtime; never store a second copy.
- Token-only; reuse DzCodeBlock/DzCopyButton/DzSegmented; controls labelled + keyboard-operable.
- Be honest about the JS variant's scope (annotation-stripping, not a compiler) in a code comment.
</constraints>

<acceptance_criteria>
- Toggling SFC/Template and TS/JS updates the shown + copied code; the import line matches components[].
- useBlockCodeView spec passes; `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
useBlockCodeView.ts (+ spec) + BlockPreview Code-tab edits. Note the derivation rules and JS-variant limits.
</output>
```

#### [x] Task F6 — Dependency manifest: imports + npm install + registry-add line

```
<context>
You are in apps/landing. Blocks show "Built from N components" chips, but not the concrete imports, the npm
package, or the one-command install. Best-in-class galleries surface a full dependency manifest (docs/blocks.md
§1.2 #9, §3.3). This pairs with the registry (Task G1) — once G1 exists, show its `npx shadcn-vue add` line
too. Read docs/blocks.md §3.2, §3.3; study BlockCard.vue / BlockPreview.vue chip rendering.
</context>

<task>
Create a BlockManifest component that, for a given block, shows: the components[] it uses (linked to E4
reverse-lookup), the generated import statement (from Task F5), and the install line(s) — `npm i @dzup-ui/core`
and (when Task G1 has shipped) the `npx shadcn-vue add <registry-url>/<id>.json` command, each copyable.
</task>

<steps>
1. Create src/components/blocks/BlockManifest.vue rendering: "Built from" chips (reuse the existing chip
   styling, keep E4 interactivity), the import line, and copyable install commands via DzCopyButton.
2. Mount it in BlockPreview (e.g. under the Code tab or in the header detail) and/or BlockCard — pick the
   spot that reads cleanly and is consistent across blocks.
3. Make the registry-add line conditional on G1 (a single config flag/const), so this task ships cleanly
   before or after G1 without showing a dead command.
</steps>

<constraints>
- Token-only; reuse chips + DzCopyButton; no raw colors.
- The manifest is derived from BlockDef (components[]) — no per-block hand-authored manifest data.
- Copyable commands must be exact and correct for this repo's package names (@dzup-ui/core, @dzup-ui/tokens).
</constraints>

<acceptance_criteria>
- A block shows its components, import line, and `npm i` command; the registry-add line appears only when G1
  is enabled. All copy actions copy the exact text.
- `yarn typecheck` + `vite build` pass; light + dark verified.
</acceptance_criteria>

<output>
BlockManifest.vue + its mount. Note where it lives and how the G1-conditional install line is gated.
</output>
```

### Phase G — Distribution & AI-native

#### [x] Task G1 — Generate a shadcn-vue-compatible registry from the BLOCKS array

```
<context>
You are a Vue 3 + TypeScript build engineer on the dzup-ui landing app (apps/landing). The highest-leverage
distribution upgrade is a shadcn-vue-compatible registry: static JSON that lets `npx shadcn-vue add <url>`
install a block into a consumer's project, and that AI agents/IDEs can read (docs/blocks.md §1.2 #2, §1.3,
§3.3). The data already exists in src/blocks/registry.ts (BLOCKS: id, title, description, category, source,
components[]). Read docs/blocks.md §3.3, §4; the shadcn-vue registry schema (registry.json + registry-item.json:
name, type 'registry:block', title, description, files[], registryDependencies[], dependencies[]).
</context>

<task>
Add a build-time script that generates a shadcn-vue-compatible registry from BLOCKS into
apps/landing/public/r/: a registry.json index + one <id>.json per block, served as static assets. No runtime
service.
</task>

<steps>
1. Create apps/landing/scripts/build-registry.ts: import BLOCKS, and for each block emit public/r/<id>.json
   with { name:<id>, type:'registry:block', title, description, files:[{ path:'<id>.vue', content:<source>,
   type:'registry:block' }], registryDependencies:<components[]>, dependencies:['@dzup-ui/core',
   '@dzup-ui/tokens'] }. Emit public/r/registry.json listing all items.
2. Wire it into the landing build (a prebuild step or an npm script `build:registry`) so public/r/* is
   regenerated from the registry — never hand-edited. Document the consumer command:
   `npx shadcn-vue add https://<landing-host>/r/<id>.json`.
3. Add a Vitest guard (extend registry.spec.ts or a sibling) asserting every BLOCKS entry has a corresponding
   generated item shape (or that the generator runs cleanly over the registry) and that registryDependencies
   equal components[].
4. Confirm the JSON validates against the shadcn-vue registry-item schema (note the schema version used).
</steps>

<constraints>
- Generated, not hand-authored: public/r/* is a build artifact derived from BLOCKS.
- TypeScript strict; `.ts` extensions; no new RUNTIME dependency (a dev-only generator dep is fine if needed).
- Do not change BlockDef or break the existing registry guard.
</constraints>

<acceptance_criteria>
- Running the generator produces public/r/registry.json + one valid <id>.json per block; counts match BLOCKS.
- `npx shadcn-vue add <url>/r/<id>.json` would install the block's SFC (verify the JSON shape; a live install
  is out of scope). `yarn typecheck` + `vite build` + Vitest pass.
</acceptance_criteria>

<output>
build-registry.ts + the build wiring + guard. In your reply: the exact item JSON shape, the consumer command,
and the schema version targeted.
</output>
```

#### [x] Task G2 — Generate `llms.txt`, `llms-full.txt`, and per-block `.md`

```
<context>
You are in apps/landing. AI assistants discover libraries via llms.txt (a concise token-efficient index) and
llms-full.txt (full detail), plus per-page markdown — Nuxt UI is the Vue-ecosystem exemplar (docs/blocks.md
§1.3). The registry generator (Task G1) already walks BLOCKS; extend that build. Read docs/blocks.md §1.3,
§3.3; the llmstxt.org convention.
</context>

<task>
Extend the build to generate apps/landing/public/llms.txt (a structured index of all blocks: title, one-line
description, deep link, components), apps/landing/public/llms-full.txt (the same plus each block's source),
and per-block markdown at public/r/<id>.md.
</task>

<steps>
1. In build-registry.ts (or a sibling generator sharing the BLOCKS walk): emit llms.txt — a markdown index
   grouped by category with each block as `- [<title>](/blocks#<id>): <description> — built from <components>`.
2. Emit llms-full.txt — the index plus each block's fenced SFC source.
3. Emit public/r/<id>.md per block: title, description, components, deep link, and the fenced SFC — the
   payload for the Task G3 "copy as markdown" action.
4. Document how a consumer points an assistant at it (`@docs https://<host>/llms.txt`).
</steps>

<constraints>
- Generated from BLOCKS at build; never hand-authored. Token-efficient markdown (no HTML).
- Keep llms.txt concise (index only); push bulk into llms-full.txt and the per-block .md files.
</constraints>

<acceptance_criteria>
- The build emits llms.txt, llms-full.txt, and one <id>.md per block; counts match BLOCKS; links resolve to
  /blocks#<id>. `vite build` succeeds.
</acceptance_criteria>

<output>
The generator additions + sample excerpts of llms.txt and one <id>.md. Note the consumer `@docs` usage.
</output>
```

#### [x] Task G3 — "Copy as markdown" / "Copy as AI prompt" per block

```
<context>
You are in apps/landing. Developers increasingly paste a block's docs into Cursor/Claude/ChatGPT. A one-click
"copy as markdown" (the block's /r/<id>.md, Task G2) and "copy as AI prompt" (a ready-made instruction
referencing llms.txt) are low-effort, high-reach actions (docs/blocks.md §1.2 #10, §1.3). Read docs/blocks.md
§1.3, §3.2; study BlockPreview.vue's header/copy controls.
</context>

<task>
Add two actions to BlockPreview: "Copy as markdown" (copies the block's markdown payload) and "Copy as
prompt" (copies a prompt like: "Using dzup-ui docs at <host>/llms.txt, generate this block: <title> —
<description>. It is built from <components>."), each with success feedback.
</task>

<steps>
1. Add a small actions menu (DzDropdownMenu) or two DzIconButtons in the BlockPreview header: "Copy as
   markdown", "Copy as prompt" (and, after G4, "Open in v0").
2. Build the markdown payload from the same data as Task G2 (reuse a shared formatter so /r/<id>.md and the
   copy action never diverge); build the prompt string from title/description/components + the llms.txt URL.
3. Accessible labels + copied confirmation (reuse DzCopyButton's feedback pattern).
</steps>

<constraints>
- Token-only; reuse DzDropdownMenu/DzIconButton/DzCopyButton; no raw colors.
- The markdown must match the generated /r/<id>.md byte-for-byte (shared formatter).
- Keyboard-operable; announced success.
</constraints>

<acceptance_criteria>
- Both actions copy the correct payloads with confirmation; the markdown equals the generated .md.
- `yarn typecheck` + `vite build` pass; light + dark verified.
</acceptance_criteria>

<output>
BlockPreview header actions + the shared markdown/prompt formatter. Note the shared-formatter guarantee.
</output>
```

#### [x] Task G4 — "Open in v0" handoff per block

```
<context>
You are in apps/landing. "Open in v0" hands a registry item to v0 for AI remixing with your design tokens
preloaded — a strong discoverability signal (docs/blocks.md §1.2 #10, §1.3). It depends on the registry JSON
existing (Task G1). v0 is React-centric, so for a Vue lib treat this as "remix the idea", not a 1:1 import.
Read docs/blocks.md §1.3; v0's open URL contract (https://v0.dev/chat/api/open?url=<registry-item-json-url>).
</context>

<task>
Add an "Open in v0" button to BlockPreview that links to v0 with the block's registry item JSON URL (Task G1).
</task>

<steps>
1. Compute the v0 open URL from the block id + the configured registry host: 
   https://v0.dev/chat/api/open?url=<host>/r/<id>.json.
2. Add an "Open in v0" action (next to the Task G3 actions); open in a new tab with rel="noopener".
3. Gate it on the same G1-enabled flag as Task F6's registry-add line so it never renders a dead link.
</steps>

<constraints>
- Token-only; reuse the existing action affordances; labelled + keyboard-operable.
- Only render when G1 (registry) is enabled and a registry host is configured.
</constraints>

<acceptance_criteria>
- A block shows "Open in v0" linking to the correct v0 URL with its registry JSON; hidden when G1 disabled.
- `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
The "Open in v0" wiring + the URL it produces for a sample block. Note the gating flag.
</output>
```

#### [x] Task G5 — MCP exposure for the registry (documentation + config)

```
<context>
You are in apps/landing. With a shadcn-compatible registry (Task G1), AI agents/IDEs can browse and install
blocks by natural language via MCP — turning /blocks into an agent-callable API (docs/blocks.md §1.2 #3,
§1.3). The shadcn CLI exposes `registry:mcp` pointed at a registry URL; this task is config + docs, not a new
server. Read docs/blocks.md §1.3 (MCP); the shadcn MCP/registry docs.
</context>

<task>
Document (and provide copy-paste config for) pointing an MCP-capable assistant at the dzup-ui blocks registry,
and add a short "Use with AI" section to the /blocks page linking llms.txt + the MCP config.
</task>

<steps>
1. Add a docs snippet (in docs/blocks.md and/or an apps/landing doc) with the MCP server config pointing at
   <host>/r/registry.json (e.g. the `npx shadcn registry:mcp` env/URL form), plus the `shadcn view/search/list`
   discovery commands.
2. Add a small "Use with AI" affordance on /blocks (links: llms.txt, registry.json, copy MCP config) — built
   from existing components, token-only.
3. Verify the registry URL/JSON the MCP config references actually resolves (depends on G1/G2 being built).
</steps>

<constraints>
- No new runtime service authored here; this is configuration + a small UI affordance + docs.
- Token-only for any UI; copyable config is exact.
</constraints>

<acceptance_criteria>
- The MCP config + discovery commands are documented and copyable; the "Use with AI" affordance links the
  real registry/llms endpoints. `vite build` passes.
</acceptance_criteria>

<output>
The docs snippet + the "Use with AI" UI. Note the exact MCP config and that the registry URL resolves.
</output>
```

### Phase H — In-browser theming

#### [x] Task H1 — Token theme editor: re-theme previews AND copied code

```
<context>
You are in apps/landing. This is the flagship differentiator for a token-based system: because every block is
styled by --dz-* CSS variables, an in-app editor that changes brand color / radius / density re-themes every
live preview instantly AND serializes the SAME tokens into the copied code — a single-source guarantee
(docs/blocks.md §1.2 #11, §1.3, §3.4; tweakcn is the reference). Read docs/blocks.md §3.4, §3.5; study how
the app sets tokens (@dzup-ui/tokens, the theme root) and BlockPreview's copy path (Task F5).
</context>

<task>
Add a BlockThemeToolbar + useBlockTheme store that overrides a few key tokens (brand/primary color, radius
scale, density/spacing) on all block previews, and injects the same overrides into copied snippets as a
`:root{}` block (or a registry `theme` item).
</task>

<steps>
1. Create src/composables/useBlockTheme.ts: a reactive store of token overrides (e.g. --dz-primary, a radius
   scale, a density toggle). Provide computed inline-style/CSS-vars to bind on preview roots.
2. Create src/components/blocks/BlockThemeToolbar.vue: a color picker (DzColorPicker), radius slider
   (DzSlider/DzRangeSlider), density DzSegmented — all writing to useBlockTheme. Place it as a global /blocks
   toolbar (one instance themes all previews).
3. Bind the overrides on every BlockPreview's preview root (and, if iframe-isolated after F4, postMessage the
   vars to the iframe documentElement). On copy (Task F5 path), prepend a `:root { --dz-primary: …; … }` block
   reflecting the current overrides so the copied code looks identical to the themed preview.
4. Provide a "reset to defaults" action and ensure no override produces sub-AA contrast (or warn when it does).
</steps>

<constraints>
- Token-only; build the editor from real components (DzColorPicker/DzSlider/DzSegmented); no raw colors.
- ONE state drives both the preview vars and the copied :root{} — never compute them separately.
- Editor fully keyboard-operable + labelled; honor prefers-reduced-motion; default state = the library's
  shipped tokens (no override).
</constraints>

<acceptance_criteria>
- Changing brand color / radius / density re-themes every live preview instantly; copying a block includes a
  :root{} reflecting the current tokens so pasted code matches the preview.
- Reset restores defaults. `yarn typecheck` + `vite build` pass; verified light + dark.
</acceptance_criteria>

<output>
useBlockTheme.ts + BlockThemeToolbar.vue + the BlockPreview binding/copy edits. Note the single-source path
from editor → preview vars → copied :root{}.
</output>
```

### Phase I — Catalog completion & trust

#### [x] Task I1 — Author the Commerce category (fill the empty `commerce`)

```
<context>
You are a Vue 3 + TypeScript engineer authoring ready-made UI blocks for the dzup-ui landing app, composed
purely from free @dzup-ui/core components. The `commerce` category is declared in the registry but has ZERO
blocks. Author the catalog from blocks-old.md §4.4. Each block is a self-contained .vue file that drops into a
user's app and looks beautiful out of the box. Read docs/blocks.md §3.7 (quality bar), blocks-old.md §4.4;
gold-standard reference apps/landing/src/components/ShowcaseDashboard.vue and any shipped block (e.g.
src/blocks/marketing/HeroCentered.vue) for the registry pattern.
</context>

<task>
Author these 6 commerce blocks and register each in registry.ts (category 'commerce'), using ONLY the real
components listed in blocks-old.md §4.4:
- product-grid (DzImageCard, DzBadge, DzRating, DzButton)
- product-detail (DzCarousel, DzCarouselSlide, DzRating, DzButton, DzTabs, DzBadge)
- cart-summary (DzList, DzListItem, DzNumberInput, DzButton, DzDivider)
- checkout-summary (DzDescriptions, DzInput, DzButton, DzDivider)
- category-header (DzHeading, DzSelect, DzSegmented, DzBreadcrumb)
- order-status (DzStepper/DzTimeline, DzBadge, DzText)
</task>

<steps>
1. For each: create src/blocks/commerce/<Name>.vue with realistic, self-contained placeholder content (no
   required props, no external data, no network); register it (id, title, description, category 'commerce',
   tags, components[], component+source via the existing defineBlock/loadBlock pattern).
2. Make each genuinely good — thoughtful spacing, hierarchy, states — a developer should want to copy it.
3. Verify on /blocks: previews live, code matches, copy works, responsive, light + dark; registry.spec.ts
   still passes (component names must be real @dzup-ui/core exports — verify each in packages/core).
</steps>

<constraints>
- ONLY var(--dz-*) tokens for color/radius/shadow/spacing; NO raw hex, NO hardcoded Tailwind color classes,
  NO color literals in <style scoped>. Layout-only scoped CSS is allowed.
- ONLY the listed real components (verify each exists). No bespoke re-implementations.
- WCAG AA, labelled controls, keyboard reachable, visible focus, both themes; honor prefers-reduced-motion.
- `<script setup lang="ts">`, `.ts` extensions; zero required props. Validate with `yarn typecheck` +
  `vite build` + Vitest (ESLint is broken locally — never rely on it).
</constraints>

<acceptance_criteria>
- 6 commerce blocks authored, registered, and verified (preview + code + copy + responsive + light/dark).
- registry.spec.ts passes (all component names real). `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
The 6 .vue files + registry entries. In your reply list the components used per block and confirm token-only +
both-theme checks.
</output>
```

#### [x] Task I2 — Author the Content category (fill the empty `content`)

```
<context>
You are a Vue 3 + TypeScript engineer authoring ready-made UI blocks for the dzup-ui landing app, composed
purely from free @dzup-ui/core components. The `content` category is declared in the registry but has ZERO
blocks. Author the catalog from blocks-old.md §4.5. Read docs/blocks.md §3.7 (quality bar), blocks-old.md
§4.5; reference ShowcaseDashboard.vue and a shipped block for the registry pattern.
</context>

<task>
Author these 6 content blocks and register each in registry.ts (category 'content'), using ONLY the real
components listed in blocks-old.md §4.5:
- blog-list (DzImageCard, DzBadge, DzAvatar, DzText)
- article-header (DzHeading, DzText, DzAvatar, DzTag, DzRelativeTime)
- prose (DzHeading, DzText, DzBlockquote, DzCode, DzDivider)
- code-showcase (DzCodeBlock, DzCopyButton, DzTabs)
- toc-aside (DzAnchor, DzText)
- faq-2col (DzAccordion, DzHeading, DzText)
</task>

<steps>
1. For each: create src/blocks/content/<Name>.vue with realistic, self-contained placeholder content; register
   it (id, title, description, category 'content', tags, components[], component+source via the existing pattern).
2. Make each genuinely good and copy-worthy.
3. Verify on /blocks: previews live, code matches, copy works, responsive, light + dark; registry.spec.ts passes.
</steps>

<constraints>
- ONLY var(--dz-*) tokens; NO raw hex/Tailwind colors/scoped color literals (layout-only scoped CSS OK).
- ONLY the listed real components (verify each). No bespoke re-implementations.
- WCAG AA, labelled, keyboard reachable, visible focus, both themes; honor prefers-reduced-motion.
- `<script setup lang="ts">`, `.ts` extensions; zero required props. Validate with `yarn typecheck` +
  `vite build` + Vitest (never ESLint).
</constraints>

<acceptance_criteria>
- 6 content blocks authored, registered, and verified (preview + code + copy + responsive + light/dark).
- registry.spec.ts passes. `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
The 6 .vue files + registry entries. List components used per block and confirm token-only + both-theme checks.
</output>
```

#### [x] Task I3 — CI-backed trust signals (a11y guard + per-block marks)

```
<context>
You are a quality engineer on apps/landing. Best-in-class galleries show EARNED trust marks — "WCAG AA",
"verified light/dark", "responsive" — backed by CI, not decoration (docs/blocks.md §1.2 #12, §3.6). The repo
validates with Vitest (registry.spec.ts already guards component names). Read docs/blocks.md §3.6, §3.7;
study registry.spec.ts.
</context>

<task>
Add an automated per-block accessibility check (axe-core via Vitest + jsdom/happy-dom) that renders each block
and asserts no critical a11y violations, and render an "Accessible" / "Light+Dark" / "Responsive" mark on
BlockCard/BlockPreview that reflects the check's coverage.
</task>

<steps>
1. Add a Vitest suite (e.g. src/blocks/a11y.spec.ts) that mounts each BLOCKS entry's component (zero required
   props) and runs axe-core (or vitest-axe) asserting no `critical`/`serious` violations; fail loudly listing
   the block id + rule on violation.
2. Fix or ticket any block that fails (small fixes inline within tokens/real components; larger ones noted with
   file+line). Use Task F2's RTL observations as input where relevant.
3. Add a subtle "Accessible" trust mark to BlockCard/BlockPreview (token-only badge) — present only because the
   CI check exists; do not show a mark a check doesn't back. Document what each mark certifies.
</steps>

<constraints>
- Vitest only (ESLint broken locally). The a11y suite must fail when a block has a critical violation.
- Token-only marks; reuse DzBadge/chip styling; accessible (the mark itself must be labelled, not color-only).
- Add the test dep (axe-core/vitest-axe) as a dev dependency only.
</constraints>

<acceptance_criteria>
- `yarn test` runs the per-block a11y suite and passes for the catalog (or fails loudly on a seeded violation —
  demonstrate by temporarily breaking one block, then reverting).
- The trust mark renders and is itself accessible. `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
The a11y spec + the trust-mark UI + any block fixes. Note what each mark certifies and the pass/seeded-fail runs.
</output>
```

#### [x] Task I4 — Deep-linkable per-block SEO pages + OG images (optional, see §10)

```
<context>
You are in apps/landing. Today blocks are anchors on one /blocks page; best-in-class galleries also give each
block an indexable route with its own title/description/structured data and a social OG image
(docs/blocks.md §1.2 #7, §1.3, §3.5). The standalone preview route (Task F4) is the OG render source. This is
optional pending the §10 decision on per-block routes. Read docs/blocks.md §1.3, §3.5; study router.ts
meta.head and Task F4's BlockPreviewPage.
</context>

<task>
Add an indexable route /blocks/:id (BlockDetailPage) rendering the block's preview + manifest + code with
per-block title/description/OG meta, and generate an OG image per block from the Task F4 standalone preview.
</task>

<steps>
1. Create src/pages/BlockDetailPage.vue: resolve :id from the registry (redirect unknown to /blocks), render
   the BlockPreview + BlockManifest + a short "what it is / when to use it" intro; set per-block meta.head
   (title "<Block> — dzup-ui Blocks", description, OG title/description/image).
2. Register /blocks/:id in router.ts; ensure /blocks (index) still owns the catalog and links each BlockCard
   to its detail route in addition to the in-page anchor (decide which is primary per §10).
3. Generate an OG image per block at build (screenshot/Satori-style of the /blocks/preview/:id route, Task F4)
   into public/og/<id>.png; reference it from the detail route meta.
4. Ensure no duplicate-content penalty between /blocks#<id> and /blocks/:id (canonical link).
</steps>

<constraints>
- Token-only; reuse BlockPreview/BlockManifest; no new heavy runtime dependency (build-time OG gen only).
- Unknown :id redirects to /blocks. Set canonical links to avoid duplicate content.
- Keep the existing index + anchors working (do not break deep-links).
</constraints>

<acceptance_criteria>
- /blocks/<id> renders the block with correct per-block title/description/OG image; unknown ids redirect.
- OG images generate at build; canonical links set. `yarn typecheck` + `vite build` pass.
</acceptance_criteria>

<output>
BlockDetailPage.vue + router + OG generation. Note the canonical strategy and which link (anchor vs route) is
primary.
</output>
```

---

## 9. Phase D — Pro blocks 🔒 (carried forward from `blocks-old.md`, unchanged)

The **gated Pro tier** is fully specified in [`blocks-old.md`](./blocks-old.md): feasibility & gating
(§3.7), the 36-block Pro catalog across 7 Pro categories (§4.6), and **Tasks D1–D11** (§7, Phase D). It is
**unchanged by this document** and remains the canonical source for Pro work. Key points restated so this doc
is self-sufficient:

- **Pro blocks compose `@dzup-ui-pro/pro` components** (sibling repo `dzup-ui-pro`; verified inventory in
  `blocks-old.md` Appendix C). The landing app takes a dependency on `@dzup-ui-pro/pro` (Task **D1**).
- **Registry deltas:** `BlockDef` gains `tier?: 'free' | 'pro'` (default `'free'`) and `proComponents?:
  string[]`; `BlockCategory` gains the 7 `pro-*` ids (Task **D1**).
- **Gating:** Pro blocks **preview live but lock the Code tab/copy** behind the license (`PRO_LIVE` in
  `config.ts`), badged **🔒 Pro** (Task **D2**); the raw Pro source must not be bundled while locked.
- **Reference Pro block** `kanban-board` end-to-end (Task **D3**); per-category authoring (**D4–D10**);
  Pro registry CI guard (**D11**).

> **Interaction with this doc's upgrades.** Phase E–I features are **tier-agnostic and reused** by Pro
> blocks once D1 lands: search/⌘K (E) index Pro blocks too (respecting the lock), the manifest/registry
> (F6/G1) must **gate Pro source** (emit Pro items only to licensed/`PRO_LIVE` consumers, or via a
> namespaced/private registry with `${ENV_VAR}` auth headers — see §1.3), and trust marks (I3) apply equally.
> When implementing G1 with Pro present, **do not emit Pro block source into the public `/r/*` JSON.**

> **Sequencing.** Free best-in-class (E–I) and Pro (D) are independent. The `/run-tasks` free runner skips
> this `🔒 Pro` section by design (it keys off the heading); enable Pro with `-Tier pro|all`.

---

## 10. Open decisions (confirm before/while building)

1. **Per-block routes (Task I4)** — add indexable `/blocks/:id` pages, or keep the single-page index +
   anchors (today's model)? Recommend **adding `/blocks/:id` for SEO + OG sharing** while keeping the index as
   the primary browse surface (anchor links remain). Confirm before building I4.
2. **Multi-framework code output** — this doc scopes code delivery to **Vue SFC + template-only + TS/JS
   variants** (Task F5) and treats the framework-neutral story as the **registry** (G1). Confirm React output
   stays **out of scope** (high-effort, low-ROI for a Vue library).
3. **Registry host** — `npx shadcn-vue add` and "Open in v0" need a stable public URL for `/r/<id>.json`.
   Confirm the landing app's production host (and whether a CDN path is preferred) before G1/G4.
4. **iframe vs inline previews** — adopt **iframe isolation for full-section blocks** (enables honest
   per-preview light/dark, RTL, responsive — F1/F2/F3) and keep small atoms inline? Confirm the cut line, as
   it affects F1–F4 and H1.
5. **Theme editor scope (H1)** — limit overrides to **brand color / radius / density**, or expose more tokens?
   Recommend starting with those three (highest signal, lowest contrast-risk) and expanding later.
6. **Trust marks (I3)** — which marks do we commit to backing with CI now (Accessible is the clear P0;
   light/dark + RTL + responsive need visual-regression infra)? Confirm the initial set so we don't ship a
   decorative badge.
7. **MCP (G5)** — ship now as **docs + config** pointed at the generated registry, or defer until a hosted
   registry endpoint is confirmed? Recommend docs+config alongside G1 so it's ready when the host is.
8. **Pro source in the registry (§9)** — confirm that the public `/r/*` registry and `llms*.txt` include
   **free blocks only**, with Pro distribution handled via a gated/namespaced registry post-`PRO_LIVE`.

---

### Appendix A — Research sources (selected)

Competitive teardown and frontier-pattern research (2025–2026). Full citations were captured during research;
the highest-signal sources:

- **shadcn registry / CLI 3.0 / MCP** — ui.shadcn.com/docs/{registry,cli,mcp}, changelog 2025-08; shadcn-vue
  registry docs (shadcn-vue.com/docs/registry/*) — the registry-as-distribution + MCP model (Tasks G1/G5).
- **Tailwind Plus** — tailwindcss.com/plus/ui-blocks — multi-framework code tabs, resizer, 500+ catalog.
- **Nuxt UI (Pro)** — ui.nuxt.com — `llms.txt`/`llms-full.txt` exemplar (Task G2); free-in-dev licensing.
- **Flowbite / Preline / HyperUI / Meraki / TailGrids** — configurator + dark/RTL baseline; Figma parity.
- **tweakcn** — tweakcn.com (+ GitHub jnsahaj/tweakcn) — token theme editor model (Task H1).
- **v0 / 21st.dev** — v0.app/docs/design-systems, 21st.dev/magic — Open-in-v0 + Magic MCP (Tasks G4/G5).
- **PrimeVue Theme Designer** — primevue.org/designer — real-time token editing reference (H1).
- **llmstxt.org**, **cmdk** (⌘K palette pattern), **MDN Lazy loading / IntersectionObserver** (Tasks E2/E5).

### Appendix B — Reference facts (inherited)

- **Library scope:** 147–155 free components across 11 families (`CLAUDE.md`). Verified core inventory in
  `blocks-old.md` Appendix A; verified Pro inventory in `blocks-old.md` Appendix C.
- **Quality benchmark block:** `apps/landing/src/components/ShowcaseDashboard.vue`.
- **Validation:** `yarn typecheck` + landing `vite build` + Vitest. **ESLint is broken locally** — never gate on it.
- **Hard rules:** token-only styling (ADR-04), real components only, contracts-first, `.ts` import extensions,
  `<script setup lang="ts">` (`CLAUDE.md` "Quick Rules").
