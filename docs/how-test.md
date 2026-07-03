# How to test `new-features.md` in the browser

> **Companion to [`new-features.md`](./new-features.md).** That doc specifies 18 tasks
> (TASK-APP-01 → TASK-APP-18) across the two public apps. This doc tells you how to
> **manually verify each one in a browser** — what to run, where to click, and what
> "working" looks like.
> **Last updated:** 2026-07-03 · **Scope:** free tier, both apps.

Every task in `new-features.md` is marked `[x]` done. Use this guide to confirm that
claim by hand. Each task below lists: **Where** (URL/page), **Do** (the interaction),
and **Expect** (the pass condition, taken from the task's `<success_criteria>`).

---

## 0. Start the two dev servers

Everything is verified against the running dev servers, not the source. Open two
terminals from the repo root (`dzup-ui/`).

### Storybook (Part A — TASK-APP-01…09)

```bash
yarn workspace @dzup-ui/storybook dev
# → http://localhost:6006
```

This first runs `build:releases`, `build:playground`, and `build:llms` (so the
Releases page, the StackBlitz/REPL playground template, and `llms.txt` are generated),
then serves Storybook on **:6006**.

### Landing (Part B — TASK-APP-10…18)

```bash
yarn workspace @dzup-ui/landing dev
# → http://localhost:5173  (Vite default)
```

> ⚠️ Some landing features read **build-time generated data** (live star/download
> counts, the shadcn registry JSON, the sitemap). `vite` dev serves what's in
> `public/` already; to test those against fresh data run the full build first:
> ```bash
> yarn workspace @dzup-ui/landing build   # runs build:registry, build:stats, build:sitemap, … then vite build
> yarn workspace @dzup-ui/landing preview  # serve dist/ → http://localhost:4173
> ```
> Test build-artifact tasks (10, 11, 16) against **`preview`** (dist), and interactive
> UI tasks against **`dev`**.

### Theme toggle (used all over)

Both apps theme via the `data-theme` attribute on `<html>`. **Every visual check below
should be repeated in light *and* dark:**
- **Storybook:** the sun/moon toolbar control (top toolbar) — `@storybook/addon-themes`.
- **Landing:** the theme toggle in the nav (and, for TASK-APP-15, the "re-theme the
  page" control in the hero).

---

## Part A — `apps/storybook` (http://localhost:6006)

### TASK-APP-01 — Visual regression (Chromatic, light × dark) · CI, not interactive
**Where:** N/A in the local browser — this is a CI check.
**Do:** Confirm the plumbing rather than a UI. In `apps/storybook/package.json` there is
a `chromatic` script; `.github/workflows` has a Chromatic job (non-blocking). The promote
-to-required note lives in `storybook-decisions.md`.
**Expect:** Nothing renders in the browser. A green local signal is that
`yarn workspace @dzup-ui/storybook build` completes cleanly (Chromatic snapshots the
static build in both theme modes in CI). No project token locally → nothing to click.

### TASK-APP-02 — Enforced accessibility (a11y `todo` → `error`)
**Where:** any story → **Accessibility** addon panel (bottom); and the
**Guides → Accessibility** MDX page.
**Do:**
1. Open a P0-family story (Buttons, Forms, Inputs, Overlays, Navigation). Open the
   **Accessibility** panel and read the Violations/Passes/Incomplete tabs.
2. Open **Accessibility.mdx** and read the enforced-vs-audit family table.
**Expect:** P0 families show **0 violations** against the WCAG 2.2 AA ruleset. The MDX
page describes an *enforced* pipeline (not "report-only") and lists which families run at
`test:'error'`. (The actual CI gate is proven by `yarn workspace @dzup-ui/storybook
test-storybook` going green/red, not in the browser.)

### TASK-APP-03 — Component maturity dashboard
**Where:** **Guides → Component Status** (`ComponentStatus.mdx`), pinned high in the
sidebar; also linked from **Introduction**.
**Do:** Open the page. Scan the summary counts and the matrix.
**Expect:** Summary counts per status (e.g. "… stable · … beta · … experimental · 0
deprecated") and a sortable matrix with a row per component showing **Family · Status
badge · Tests (play ✓) · A11y (enforced ✓) · Design (Figma ↗)**. Data is live (derived
from tags), renders in light + dark, and any `deprecated` components appear in a separate
migration list.

### TASK-APP-04 — Interactive design-token browser
**Where:** **Guides → Design Tokens** (`DesignTokens.mdx`) — the embedded **Token
Browser** canvas (`DzTokenBrowser` story).
**Do:**
1. Type `radius` in the search box.
2. Toggle the theme (sun/moon) with the browser open.
3. Click a card's copy buttons.
**Expect:** Typing `radius` filters to radius tokens; each card shows a **live resolved
value** (via `getComputedStyle`) that **changes when you flip the theme**; copy buttons
copy both `--dz-name` and `var(--dz-name)`. Tier/category filters work.

### TASK-APP-05 — Figma integration (`@storybook/addon-designs`)
**Where:** a seeded flagship story (DzButton / DzCard / DzInput) → **Design** panel; plus
a `<Figma>` embed inside one family MDX page.
**Do:** Open DzButton, click the **Design** tab/panel. Open a story with no `design`
param.
**Expect:** Seeded stories render a Figma frame in the Design panel; unseeded stories show
a friendly "design link coming soon" (no error). The family MDX page shows the design frame
beside the live component.

### TASK-APP-06 — Live REPL + "Open in StackBlitz"
**Where:** **Guides → Getting Started** (`GettingStarted.mdx`) "Try it now" section (the
`DzRepl` block), plus 1–2 family pages; the **Open in StackBlitz** action
(`OpenInStackblitz` block) on examples.
**Do:**
1. In the embedded REPL, edit the `<DzButton>` markup (e.g. change the label or `tone`).
2. Click **Open in StackBlitz** on an example.
**Expect:** The REPL **re-renders live** as you type, importing from `@dzup-ui/core`. The
StackBlitz button opens a runnable Vite + Vue 3 project with the example source injected.
(The REPL is lazy-loaded — first open may take a moment.)

### TASK-APP-07 — In-Storybook "What's New" / Releases
**Where:** **Guides → Releases** (`Releases.mdx`, generated from `CHANGELOG.md` by
`build:releases`).
**Do:** Open the page; scan the grouped sections.
**Expect:** The most recent N releases render with **Added / Changed / Fixed / Deprecated
/ Breaking** visually distinguished (StatusBadge/DoDont styling), deprecations pulled
forward. Cross-linked from Introduction and the dashboard footer.

### TASK-APP-08 — `llms.txt` for the component API
**Where:** the static build output — **http://localhost:6006/llms.txt** and
**/llms-full.txt** (generated by `build:llms`). Against a production build they sit at
`storybook-static/llms.txt`.
**Do:** Navigate directly to those two URLs.
**Expect:** Well-formed Markdown: per-component import path, frozen variant/size/tone
taxonomy, key props/emits/slots, and (in `-full`) usage snippets. Cross-linked from the
landing `llms.txt`.

### TASK-APP-09 — Branded manager + "when to use X vs Y" guides
**Where:** the whole manager chrome; and **Guides → Choosing Components**
(`ChoosingComponents.mdx`).
**Do:** Look at the sidebar top (logo/brand title) and the browser-tab favicon. Open the
Choosing Components page.
**Expect:** dzup-ui logo/brand title in the manager, a proper favicon, brand colors from
tokens, consistent in light/dark. The guide covers at least Switch vs Checkbox, Button vs
IconButton vs Link, Dialog vs Sheet vs Popover, Select vs Combobox vs Listbox, Toast vs
Alert vs Notification — each with a one-line rule, a decision table, and Do/Don't pairs.

---

## Part B — `apps/landing` (http://localhost:5173 dev, :4173 preview)

### TASK-APP-10 — Live GitHub stars + npm downloads
**Where:** home page → **Social Proof** section. Requires build-time data →
test against **`preview`** (dist) after `yarn … landing build`.
**Do:** Scroll to Social Proof; watch the numbers on scroll-in.
**Expect:** Real star + weekly-download numbers (not placeholders) with a count-up on
scroll (instant if `prefers-reduced-motion`). Component count (147) and family count (11)
sit alongside. To test the failure path: the build must still succeed with a stale/last-
known value if the fetch fails (see `build:stats`).

### TASK-APP-11 — shadcn registry + `npx shadcn add` + copy-code
**Where:** a block detail page **`/blocks/:id`** (e.g. `/blocks/<any-id>`) and block cards;
plus the registry JSON under **`/r/`** (build output).
**Do:**
1. On a block page, use the **package-manager tabs** (npm/pnpm/yarn/bun) and the
   **copy-command** + **Copy code** buttons.
2. Navigate to `/r/registry.json` and `/r/<block>.json` (after a build).
3. Real end-to-end: in a scratch Vite+Vue project run
   `npx shadcn add http://localhost:4173/r/<block>.json`.
**Expect:** Copy buttons put the right command / SFC source on the clipboard; the registry
JSON conforms to the shadcn `registry-item` schema; the `shadcn add` command pulls a
working block into the scratch project.

### TASK-APP-12 — Global ⌘K command palette
**Where:** **any page** (mounted globally in `App.vue` as `GlobalCommandPalette`).
**Do:** Press **⌘K** (macOS) / **Ctrl+K** (Win/Linux). Type `button`. Arrow-key down,
press **Enter**. Press **Esc** to close.
**Expect:** Palette opens from anywhere; `button` surfaces the **component** (→ Storybook),
relevant **blocks** (→ `/blocks/:id`), and **templates** (→ `/templates/:slug`), grouped
with icons. Enter routes to the right destination. Empty query shows recent/popular. Focus
is trapped; Esc closes. Works in both themes.

### TASK-APP-13 — Theme Designer (`/themes`) with export + shareable URL
**Where:** **`/themes`** (linked from the EcosystemGrid "Themes" tile and the nav).
**Do:**
1. Change the **primary** OKLCH hue; adjust radius / density / shadow.
2. Watch the light|dark preview and the **WCAG contrast** badges.
3. Click **Copy/Download CSS** and **JSON**.
4. Copy the **share URL**, open it in a new tab.
**Expect:** The real-component preview re-themes instantly with a live **AA/fail** contrast
readout; export produces a `--dz-*` CSS file and JSON tokens; the shared URL reproduces the
exact theme. (Optional experimental "theme from image" may be present.)

### TASK-APP-14 — MCP server for AI IDEs
**Where (browser part):** the **`/ai`** page ("Use dzup-ui with your AI IDE"). The server
itself lives in `packages/mcp`.
**Do:** Open `/ai`; copy the MCP config snippets for Cursor / Claude Code / Windsurf.
Real test (outside the browser): connect the server in an MCP client and ask it to list
components / fetch a block's source.
**Expect:** `/ai` renders copy-paste MCP config. In a connected client, the assistant can
**list components** and **fetch a block's real source + install command**, backed by the
registry/`llms.txt` artifacts.

### TASK-APP-15 — Light/dark split showcase + page re-theme
**Where:** home page → showcase section; the re-theme control in **hero/nav**.
**Do:** View the side-by-side **light | dark** split of the live dashboard (toggle/stack on
mobile). Click the "re-theme the entire page" control.
**Expect:** Both panels are live real components (not screenshots), clearly labeled. The
control transitions the whole page's colors **smoothly** (an instant swap when
`prefers-reduced-motion` is set) — no layout jump.

### TASK-APP-16 — Sitemap, robots.txt & JSON-LD
**Where:** build output — **`/sitemap.xml`** and **`/robots.txt`** (test against
`preview`/dist); JSON-LD in page `<head>`.
**Do:**
1. Open `/sitemap.xml` and `/robots.txt` directly.
2. On a block/template detail page, open DevTools → Elements → `<head>` and find the
   `<script type="application/ld+json" data-dz-jsonld>`.
**Expect:** `sitemap.xml` lists all indexable routes (home, /blocks + 90 detail, /templates
+ 46 detail, /themes, /pro, …) with canonical URLs and **excludes** `/blocks/preview/*`.
`robots.txt` allows crawl, points to the sitemap, disallows `/preview`. Detail pages emit a
**BreadcrumbList** JSON-LD; the site-wide **SoftwareApplication** entity is in `index.html`.

### TASK-APP-17 — Announcement banner + Open in StackBlitz (blocks/templates)
**Where:** thin bar above the nav (config-driven); StackBlitz action on `/blocks/:id` and
`/templates/:slug`.
**Do:**
1. If an announcement is configured in `config.ts`, see the bar; click **dismiss**; reload
   → it stays hidden (localStorage keyed by id). Bump the id → it re-shows.
2. On a block/template page click **Open in StackBlitz** and **Copy code**.
**Expect:** Banner is accessible (role, keyboard-dismissible) and hidden entirely when no
announcement is configured. StackBlitz opens a runnable project with the item's source.

### TASK-APP-18 — Compare page + Core Web Vitals budget
**Where:** **`/compare`**; the perf budget is a CI/build check.
**Do:** Open `/compare`; read the feature matrix. For perf, run the bundle budget check:
`yarn workspace @dzup-ui/landing check:bundle` (and Lighthouse CI in the pipeline).
**Expect:** An honest, **dated + sourced** matrix vs PrimeVue / Nuxt UI / Vuetify / Element
Plus (component count, a11y, tokens, TypeScript, license, framework), built with
DocTable/DzTable, neutral claims. The bundle-size budget passes; Lighthouse asserts LCP <
2.5s, CLS < 0.1.

---

## Quick coverage map

| Task | Surface | Interactive in browser? | Fastest check |
| ---- | ------- | ----------------------- | ------------- |
| 01 Chromatic | CI | ✗ | `storybook build` green |
| 02 a11y gate | SB a11y panel + Accessibility.mdx | ◑ | panel shows 0 violations on P0 families |
| 03 Maturity dashboard | Guides → Component Status | ✓ | matrix renders with live counts |
| 04 Token browser | Guides → Design Tokens | ✓ | search "radius", flip theme |
| 05 Figma designs | Design panel | ✓ | DzButton Design tab renders frame |
| 06 REPL + StackBlitz | Getting Started | ✓ | edit `<DzButton>`, see re-render |
| 07 Releases | Guides → Releases | ✓ | grouped changelog renders |
| 08 llms.txt (docs) | `:6006/llms.txt` | ✓ (URL) | valid Markdown loads |
| 09 Brand + guides | manager chrome + Choosing Components | ✓ | logo + decision guides |
| 10 Live stars/downloads | Social Proof (preview) | ✓ | real numbers count up |
| 11 shadcn registry | `/blocks/:id` + `/r/*.json` | ✓ | `npx shadcn add <url>` works |
| 12 ⌘K palette | any page | ✓ | ⌘K → type "button" → Enter |
| 13 Theme Designer | `/themes` | ✓ | re-theme + contrast + export + share URL |
| 14 MCP server | `/ai` + MCP client | ◑ | `/ai` config; client lists components |
| 15 Split showcase | home showcase + hero | ✓ | light\|dark split, page re-theme |
| 16 Sitemap/robots/JSON-LD | `/sitemap.xml`, `/robots.txt`, `<head>` (preview) | ✓ (URL) | files present, breadcrumb JSON-LD |
| 17 Banner + StackBlitz | above nav + detail pages | ✓ | dismiss persists; StackBlitz opens |
| 18 Compare + CWV | `/compare` + CI | ◑ | matrix renders; bundle budget passes |

✓ fully browser-testable · ◑ partly (browser + a CI/client step) · ✗ CI-only

## Reminders while testing

- **Always check light *and* dark** (ADR-15 / token-only styling is the headline claim).
- **Keyboard + focus:** the palette (12), banner (17), and any overlay must be keyboard-
  reachable with visible focus rings and Esc-to-close (WCAG 2.2 AA).
- **`prefers-reduced-motion`:** count-ups (10), page re-theme (15), and route transitions
  must degrade to instant. Toggle it in DevTools → Rendering → "Emulate CSS
  prefers-reduced-motion".
- **Build-artifact tasks (10, 11, 16)** only reflect fresh data after
  `yarn workspace @dzup-ui/landing build`; test them against `vite preview`, not `dev`.
- **Don't claim a task passes without the clean build** (`storybook build` for Part A,
  `vite build` for Part B) per `new-features.md` `<validation>` — ESLint can't run locally.
```
