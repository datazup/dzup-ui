# dzup-ui — App Experience Upgrades (Storybook + Landing)

> **Status:** Proposal / specification. The `<task>` blocks below are the build.
> **Owner:** dzup-ui team · **Last updated:** 2026-07-02
> **Scope:** Take the two public-facing **apps** — `apps/storybook` (the free component
> docs) and `apps/landing` (the marketing front door) — from *good* to
> **best-in-class and unique for 2025–26**. This doc is **not** a component backlog:
> new components live in [`features.md`](./features.md) / [`features-2.md`](./features-2.md)
> (38 shipped). Here the product *is the app* — the docs experience and the marketing
> site — and the goal is to make dzup-ui feel as professional and memorable as the
> best design systems on the web.
>
> **Free tier only.** Everything here ships in the open `dzup-ui` repo with no license
> gate. The **Pro funnel** (pricing page, PRO badges, license enforcement, waitlist
> backend) is deliberately **out of scope** — it is already specified in
> [`landing.md`](./landing.md) §5 / §11 (Phase 2). Where a task touches the free↔pro
> boundary it stops at the free side.
>
> **Companion docs:** [`landing.md`](./landing.md) (landing spec & section order),
> [`storybook-decisions.md`](./storybook-decisions.md) (what is already scaffolded in
> Storybook), [`animations.md`](./animations.md) (motion gallery), [`tasks.md`](./tasks.md)
> (Storybook Sprint 0). Read these before starting — several tasks *complete* work those
> docs began rather than starting from zero.

---

## How these tasks are written

Each task is a **ready-to-run prompt** for a coding agent, authored per Anthropic's
[prompt-engineering guidance](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct):
a clear role, the motivation/context behind the work, sequential numbered steps,
`<example>` snippets, XML-tagged structure, defined success criteria, and instructions
phrased as _what to do_ rather than what to avoid. Copy a prompt block verbatim into an
agent to execute it.

Unlike the component tasks in `features.md`, these touch **app code** (`apps/storybook`,
`apps/landing`) and **tooling/CI**, not `packages/core` components. The shared conventions
below apply to every task; re-read them before starting.

```xml
<repo_conventions source="CLAUDE.md + landing.md + storybook-decisions.md — authoritative">
  <apps>
    apps/storybook — Storybook 10.3.4, @storybook/vue3-vite. Config in .storybook/{main,manager,preview,vitest.setup}.ts.
      Installed addons: @storybook/addon-docs, @storybook/addon-a11y (currently test:'todo' = report-only),
      @storybook/addon-themes (data-theme light/dark toolbar), @storybook/addon-vitest (browser play() tests via Playwright).
      Guide MDX in apps/storybook/stories/*.mdx; reusable doc blocks in apps/storybook/stories/_blocks/ (StatusBadge, DoDont, DocTable, ColorScale).
      Component stories live in packages/core/stories/{family}/Dz{Name}.stories.ts with shared helpers in packages/core/stories/_shared/.
    apps/landing — Vite + Vue 3 + vue-router marketing site. Sections in src/components/, blocks in src/blocks/ (90, ?raw source paired),
      templates in src/templates/ (46), motion in src/motion/ (33 components + directives), gallery demos in src/gallery/.
      Registry build: scripts/build-registry.ts → public/r/ + public/llms.txt + public/llms-full.txt. OG images: scripts/shoot-og.mts.
      Static facts/links in src/config.ts (FACTS, LINKS, STORYBOOK_BASE); content data in src/data.ts.
  </apps>
  <styling>
    Token-only, exactly like core (ADR-04): all CSS values reference var(--dz-*). NO raw hex, NO hardcoded Tailwind color classes.
    Both apps import @dzup-ui/tokens/css then @dzup-ui/core base styles. Light/dark via the data-theme attribute on <html> with the
    FOUC-safe IIFE in index.html (ADR-15). Build UI from real @dzup-ui/core components wherever one fits, so a11y & theming are inherited.
  </styling>
  <a11y>WCAG 2.2 AA. Keyboard reachable, visible focus rings (--dz-ring), semantic landmarks, honor prefers-reduced-motion. Verify light AND dark.</a11y>
  <validation>
    ESLint CANNOT run locally in this repo ([[dzup-ui-local-env]]). Validate the docs side with `storybook build`
    (from apps/storybook) and the landing side with `vite build` (from apps/landing). Do not claim a task passes without a clean build.
    Storybook play()/a11y tests: `yarn workspace @dzup-ui/storybook test-storybook` (needs `playwright install chromium` once).
  </validation>
  <scope>Free tier. Never gate a demo, never add a paywall, never introduce a parallel token/color system. Reserve the word "Pro" strictly for the paid tier (landing.md §4.8).</scope>
</repo_conventions>
```

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done
> **Priority:** 🔴 P0 (high-value, expected of a serious library) · 🟠 P1 (strong differentiator) · 🟢 P2 (polish/unique flourish)

---

# Part A — `apps/storybook`: make the docs best-in-class

The Storybook is already strong (rich MDX guides, custom doc blocks, status taxonomy,
play() tests, a11y addon). These tasks close the gap to the reference design-system docs
(Polaris, Carbon, Spectrum, Nuxt UI) and add features few Vue libraries ship.

## 🔴 P0 — Quality pipeline the audience can see

### [x] TASK-APP-01 — Activate visual regression (Chromatic OSS, light × dark modes)

_Gap: `storybook-decisions.md` TASK-0.11 chose "Playwright snapshots first, Chromatic
later" but neither is wired. Every reference design system runs visual regression;
Chromatic is **free for open-source** and Storybook-native — the best available deal._

```xml
<role>You are a design-system infra engineer. Follow <repo_conventions> from docs/new-features.md exactly.</role>

<task>Wire Chromatic visual-regression testing into apps/storybook, snapshotting each story across the light and dark themes, as a non-blocking CI check first.</task>

<motivation>The library ships 173 stories with zero automated visual coverage — unintended color/spacing/layout regressions ship undetected. Chromatic runs snapshots in an isolated server environment (no Mac-vs-Linux baseline flake that plagues local Playwright snapshots) and is free for public repos. Using its "modes" feature we snapshot every story in both themes in one run, which also proves the token system holds in dark mode.</motivation>

<requirements>
  <setup>Add chromatic as a devDependency and a `chromatic` script in apps/storybook/package.json. Configure the Chromatic project token via a CI secret (CHROMATIC_PROJECT_TOKEN), never committed.</setup>
  <modes>Define Chromatic modes for `light` and `dark` that set the data-theme global (reuse the @storybook/addon-themes global already in preview.ts). Apply globally so every story is captured in both themes; allow per-story opt-out via parameters.chromatic.modes for noisy/animated stories.</modes>
  <stability>Disable snapshots on inherently non-deterministic stories (live countdowns, random data, autoplay motion) via parameters.chromatic.disableSnapshot. For DzDataGrid "1,000 Rows" and other heavy stories, keep the existing lazy loaders so snapshots stay cheap.</stability>
  <ci>Add a GitHub Actions job that runs `chromatic` on PRs, uploads the diff/review link, and is NON-blocking initially (continue-on-error). Document in storybook-decisions.md how to promote it to a required check once baselines are trusted (mirror the TASK-X.5 rollout note).</ci>
</requirements>

<steps>
  1. Install chromatic; add scripts and the CI job (.github/workflows).
  2. Add `chromatic` modes for light/dark in .storybook/preview.ts (or a modes file) using the existing theme global.
  3. Sweep stories for non-determinism; add disableSnapshot where needed and document why in a comment.
  4. Run `storybook build` to confirm the static build is clean, then run a first Chromatic baseline.
  5. Update storybook-decisions.md TASK-0.11/TASK-X.5 with the chosen approach and the promote-to-required checklist.
</steps>

<success_criteria>Chromatic runs on PRs, captures every non-excluded story in light + dark, posts a review link, and does not fail the build. `storybook build` stays green.</success_criteria>
```

---

### [x] TASK-APP-02 — Enforce accessibility (flip a11y `todo` → `error`, WCAG 2.2 AA, CI gate)

_Gap: `@storybook/addon-a11y` runs report-only (`test: 'todo'` in preview.ts). Violations
are visible but never fail a build. Reference systems gate CI on a11y. This completes
`storybook-decisions.md` TASK-X.3, which was blocked only on the Vitest addon install
(now present)._

```xml
<role>You are an accessibility engineer for the dzup-ui design system. Follow <repo_conventions> exactly.</role>

<task>Turn the Storybook a11y audit into an enforced, CI-gating check, family by family, targeting WCAG 2.2 AA.</task>

<motivation>dzup-ui claims "WCAG AA" as a headline selling point but nothing enforces it — a11y regressions can ship. The addon is already installed and the Vitest browser runner already works, so this is a configuration + audit-and-fix task, not new infrastructure. The a11y addon runs Deque axe-core, which catches ~57% of WCAG issues automatically; gating on it makes the claim real.</motivation>

<requirements>
  <ruleset>Configure the a11y addon `config.runOnly` (or tags) to include WCAG 2.2 AA rules, not just the axe defaults (which stop at 2.1). Set the global to `test: 'error'` as the target end-state.</ruleset>
  <rollout>Roll out per family: audit a family's stories, fix real violations in the component or story, and only then flip that family to `error`. Where a "violation" is a documented false positive (e.g. intentional low-contrast decorative text), disable that specific rule at the story level with an explanatory comment — never blanket-disable.</rollout>
  <ci>Ensure the storybook-test CI job (Vitest browser) fails when an a11y check fails on an `error`-level family. Publish the a11y results as a CI artifact.</ci>
  <docs>Update apps/storybook/stories/Accessibility.mdx: change the wording from "report-only" to describe the enforced pipeline, and add a short table of which families are enforced vs still in audit.</docs>
</requirements>

<steps>
  1. Set the WCAG 2.2 AA ruleset in .storybook/preview.ts a11y parameters.
  2. Pick the cleanest family first (e.g. buttons); run the audit, fix findings, flip to error.
  3. Repeat family by family; track progress in Accessibility.mdx.
  4. Make the CI job block on error-level failures; upload the report artifact.
  5. Run `yarn workspace @dzup-ui/storybook test-storybook` to confirm green, and `storybook build`.
</steps>

<success_criteria>At least the P0 families (buttons, forms, inputs, overlays, navigation) audit clean and run at `test: 'error'`; CI fails on new violations there; Accessibility.mdx reflects the real state.</success_criteria>
```

---

### [x] TASK-APP-03 — Component maturity dashboard (status × tests × a11y × Figma)

_Gap: status badges exist per component but there is no single **inventory** view. Polaris,
Carbon, and Spectrum all ship a maturity matrix — it reads as "professional" and is now
trivial with Storybook's tag system._

```xml
<role>You are a Vue + Storybook docs engineer. Follow <repo_conventions> exactly.</role>

<task>Build a "Component Status" MDX dashboard page in apps/storybook/stories/ that renders a live matrix of every component with its maturity, test, a11y, and design-link signals.</task>

<motivation>A young library earns trust by being honest and legible about maturity. The status taxonomy (experimental | beta | stable | deprecated) already exists in packages/core/stories/_shared/status.ts and is applied as `status:*` tags, so the data is present — it just isn't aggregated anywhere. A single matrix page turns scattered badges into a credibility asset and a roadmap-at-a-glance.</motivation>

<requirements>
  <data>Derive the component list and status from the story index / status tags (avoid hand-maintained lists that drift). For each component show: family, status badge (reuse the _blocks/StatusBadge.ts block), whether it has a play() interaction test, whether its family is a11y-enforced (from TASK-APP-02), and whether a Figma design link exists (from TASK-APP-05's `design` parameter).</data>
  <summary>At the top, render counts per status (e.g. "132 stable · 24 beta · 7 experimental · 0 deprecated") and per family, using the DocTable block for the full matrix (sortable/scrollable on mobile is already handled by DocTable).</summary>
  <deprecations>List any `deprecated` components separately with their migration path, so the page doubles as an upgrade guide.</deprecations>
  <placement>Add it to the Guides group, pinned high in storySort so it is easy to find. Link to it from Introduction.mdx.</placement>
</requirements>

<steps>
  1. Write a small build/runtime helper that reads the status tags and test/a11y signals into a matrix data structure.
  2. Author ComponentStatus.mdx rendering the summary counts + the DocTable matrix + the deprecations section.
  3. Wire storySort + an Introduction.mdx link.
  4. Run `storybook build` and confirm the page renders with live data in light and dark.
</steps>

<example name="matrix row">
  Component | Family | Status | Tests | A11y | Design
  DzButton  | buttons | 🟢 stable | play ✓ | enforced ✓ | Figma ↗
</example>
```

## 🟠 P1 — Signature docs features few Vue libraries ship

### [x] TASK-APP-04 — Interactive design-token browser

_Gap: tokens are shown as static swatches in DesignTokens.mdx / ColorPalette.mdx. The 2025
Design Systems Report puts token adoption at 84%; a **searchable, copyable** token browser
is now expected. Ours can be uniquely good because our tokens are OKLCH and three-tier._

```xml
<role>You are a Vue + Storybook docs engineer. Follow <repo_conventions> exactly.</role>

<task>Build an interactive Design Token Browser in Storybook: a searchable, filterable, copy-to-clipboard view of every --dz-* token, reading live values from the running theme.</task>

<motivation>Consumers constantly need "what is the exact token for this color/space/radius?" Today they read prose tables and eyeball swatches. A live browser that reads getComputedStyle for each --dz-* custom property shows the *actual* resolved value in the current theme (so it updates when the theme toolbar flips light↔dark) and lets them copy the token name or value in one click. Because our system is three-tier (primitive → semantic → component), grouping and cross-linking those tiers is a differentiator over flat token lists.</motivation>

<requirements>
  <source>Enumerate tokens from @dzup-ui/tokens (the canonical source) grouped by tier and family (color, spacing, radius, shadow, typography, motion). Read resolved values live via getComputedStyle on a probe element so light/dark values are real, not hardcoded.</source>
  <ui>A search box (filter by token name), tier/category filters, and a grid of token cards. Each card: token name, a live preview (swatch / spacing bar / radius corner / shadow box / type sample), the resolved value, and copy buttons for both `--dz-name` and `var(--dz-name)`. Build the UI from @dzup-ui/core components (DzInput, DzChip, DzCard, DzCopyButton) so it is token-only and themable.</ui>
  <token_usage>Where feasible, show which components consume a given component-tier token (e.g. --dz-button-md-height → DzButton) by scanning the *.tokens.ts files. If that scan is too heavy for a doc page, expose it as an optional detail and note the limitation.</token_usage>
  <placement>Render as a story (so it lives in the Vitest/play pipeline) embedded into a Guides/DesignTokens "Browser" tab via <Canvas>.</placement>
</requirements>

<steps>
  1. Build a DzTokenBrowser demo component under packages/core/stories/_gallery/ (or apps/storybook local stories) fed by the tokens package.
  2. Implement live value resolution + search/filter + copy.
  3. Embed it in DesignTokens.mdx via <Canvas of={...} />; keep the existing static reference tables below it.
  4. Run `storybook build`; verify live values change with the theme toolbar.
</steps>

<success_criteria>Typing "radius" filters to radius tokens; each card shows the live resolved value; copy works; values update when the theme switches.</success_criteria>
```

---

### [x] TASK-APP-05 — Figma integration via `@storybook/addon-designs`

_Gap: `storybook-decisions.md` TASK-0.15 reserved the `design` parameter convention but
deferred the addon "until Figma frames exist". Adopting the addon now (even sparsely
populated) makes design-source-of-truth visible next to the live component._

```xml
<role>You are a Storybook docs engineer. Follow <repo_conventions> exactly.</role>

<task>Install @storybook/addon-designs and adopt the `design` parameter convention across component stories, embedding Figma frames in a Design panel and MDX pages.</task>

<motivation>storybook-decisions.md already reserved `parameters.design = { type: 'figma', url }` so that "turning on the addon later is a one-line main.ts change with zero story rewrites." This task performs that one-line change plus the rollout. Showing the design frame beside the code is a hallmark of mature systems and feeds the maturity dashboard's "Design" column (TASK-APP-03).</motivation>

<requirements>
  <install>Add @storybook/addon-designs to apps/storybook/package.json and register it in .storybook/main.ts addons.</install>
  <convention>Document the `design` parameter in Contributing.mdx as a required-when-available field; add it to the story template in packages/core/stories/_shared/Dz.stories.template.ts.</convention>
  <graceful>Where no Figma frame exists yet, the component simply omits the parameter — the Design panel then shows a friendly "design link coming soon" rather than an error. Seed a few flagship components (DzButton, DzCard, DzInput) with real or placeholder frame URLs to prove the wiring.</graceful>
  <mdx>Demonstrate the <Figma /> doc block inside one family MDX page so design + live component sit together.</mdx>
</requirements>

<steps>
  1. Install + register the addon.
  2. Add the design parameter to the story template and Contributing.mdx guidance.
  3. Seed flagship stories with design URLs; confirm the Design panel renders.
  4. Add a <Figma> embed to one family MDX page.
  5. Run `storybook build`.
</steps>
```

---

### [x] TASK-APP-06 — Live code playground + "Open in StackBlitz" on every example

_Gap: examples show source via `<Source>` but there is no editable playground and no
one-click fork. PrimeVue and Nuxt UI both ship "open in StackBlitz". Embedding the official
Vue SFC REPL (`@vue/repl`) inside docs is rare for Vue libraries and highly memorable._

```xml
<role>You are a Vue tooling + Storybook docs engineer. Follow <repo_conventions> exactly.</role>

<task>Add two ways to try components without local setup: (1) an embedded, editable Vue REPL doc block for key guide pages, and (2) an "Open in StackBlitz" button on component examples.</task>

<motivation>The shortest path from "interesting" to "adopted" is letting a visitor edit real code and see it run. @vue/repl is the official SFC playground component (it powers play.vuejs.org) and can be embedded directly in an MDX doc page — very few Vue component libraries do this. For full-project forking, a prebuilt StackBlitz template deep-linked from each example gives a one-click real environment. Both are free and self-contained.</motivation>

<requirements>
  <repl>Create a reusable MDX doc block (apps/storybook/stories/_blocks/) that mounts @vue/repl preconfigured to import from @dzup-ui/core + @dzup-ui/tokens, seeded with a small editable example. Ensure it respects the current Storybook theme. Add it to GettingStarted.mdx as a "Try it now" section and to 1–2 family pages.</repl>
  <stackblitz>Add an "Open in StackBlitz" action to the docs toolbar or example blocks that deep-links a prebuilt StackBlitz starter (Vite + Vue 3 + @dzup-ui/core) with the story's source injected. Keep the starter template in the repo (e.g. apps/storybook/playground-template/) so it stays in sync with the current major version.</stackblitz>
  <perf>Lazy-load the REPL (dynamic import) so it never costs the docs bundle unless a user opens that page; honor prefers-reduced-motion for any editor animations.</perf>
</requirements>

<steps>
  1. Add @vue/repl; build the DzRepl doc block with dzup-ui imports preconfigured.
  2. Embed it in GettingStarted.mdx and one family page.
  3. Build the StackBlitz starter template + the deep-link action.
  4. Run `storybook build`; verify the REPL compiles a dzup-ui example live and the StackBlitz link opens a working project.
</steps>

<success_criteria>A visitor edits `<DzButton>` markup in the page and sees it re-render; the StackBlitz button opens a runnable project importing @dzup-ui/core.</success_criteria>
```

---

### [x] TASK-APP-07 — In-Storybook "What's New" / changelog page

_Gap: `CHANGELOG.md` (77 KB, Changesets-generated) exists at the repo root but is invisible
inside the docs. Users should see recent additions, breaking changes, and deprecations
without leaving Storybook._

```xml
<role>You are a Storybook docs engineer. Follow <repo_conventions> exactly.</role>

<task>Surface the changelog inside Storybook as a "What's New" / Releases MDX page generated from CHANGELOG.md + .changeset entries.</task>

<motivation>The repo already produces a rich CHANGELOG.md via Changesets, but a docs visitor has no way to see "what changed recently" or "what's deprecated." A Releases page gives version context, highlights breaking changes, and — paired with the maturity dashboard (TASK-APP-03) — tells an honest evolution story that mature libraries always show.</motivation>

<requirements>
  <generation>Render the most recent N releases from CHANGELOG.md (parse or import it at build time). Prefer a build step that transforms CHANGELOG.md into the MDX/page content so it never drifts from the source of truth.</generation>
  <highlights>Visually distinguish Added / Changed / Fixed / Deprecated / Breaking sections (reuse DoDont/StatusBadge styling conventions and token colors). Pull deprecations forward so they are easy to spot.</highlights>
  <placement>Add "Releases" to the Guides group; link from Introduction.mdx and the footer of the maturity dashboard.</placement>
</requirements>

<steps>
  1. Add a build step (script) that reads CHANGELOG.md and emits the page content.
  2. Author Releases.mdx (or a generated equivalent) with grouped, highlighted sections.
  3. Wire storySort + cross-links.
  4. Run `storybook build`.
</steps>
```

## 🟢 P2 — Polish & unique flourishes

### [x] TASK-APP-08 — Ship `llms.txt` for the component API (AI discoverability of the docs)

_The landing site already serves `llms.txt`; the **docs** don't. Making the component API
machine-ingestible means Claude Code / Cursor / Copilot generate correct dzup-ui code —
one of the strongest low-effort adoption levers for 2025–26._

```xml
<role>You are a docs-tooling engineer. Follow <repo_conventions> exactly.</role>

<task>Generate an llms.txt (and llms-full.txt) for the component library API and serve it from the Storybook build.</task>

<motivation>AI coding tools increasingly discover libraries via llms.txt. apps/landing already ships one for blocks; the component API itself (props, variants, tokens, import paths) is not exposed. A structured Markdown index of every component's public API materially raises the odds that AI assistants recommend and correctly use dzup-ui — a compounding, near-zero-cost adoption channel.</motivation>

<requirements>
  <content>For each component, emit: import path, the frozen variant/size/tone taxonomy (from contracts), key props/emits/slots (from the *.types.ts interfaces), and a minimal usage snippet. Include the global conventions (token-only styling, data-theme theming, defineModel v-model).</content>
  <generation>Generate from source (contracts + types), not by hand, so it never drifts. Emit both a concise llms.txt (index + summaries) and llms-full.txt (with snippets).</generation>
  <serve>Output into the Storybook static build so it is reachable at /storybook/llms.txt (and cross-linked from the landing llms.txt).</serve>
</requirements>

<steps>
  1. Write a generator that walks packages/core + contracts and emits the two files.
  2. Hook it into the storybook build output.
  3. Cross-link from apps/landing/public/llms.txt.
  4. Verify both files build and validate as well-formed Markdown.
</steps>
```

---

### [x] TASK-APP-09 — Brand the Storybook manager (logo, theme, favicon) + "when to use X vs Y" guides

_Gap: the manager UI is near-stock (no logo), and while Do/Don't blocks exist, there is no
systematic "decision guide" for similar components (Switch vs Checkbox, Button vs
IconButton, Dialog vs Sheet). Both are cheap professionalism wins._

```xml
<role>You are a Storybook docs + brand engineer. Follow <repo_conventions> exactly.</role>

<task>Give the Storybook manager a dzup-ui brand identity and add "when to use which" decision guides for commonly-confused component pairs.</task>

<motivation>A branded manager (logo, brand colors from tokens, favicon) makes the docs feel like a product rather than a default Storybook. Separately, the most common real-world question is "which of these similar components do I use?" — decision guides answer it once, authoritatively, and reduce misuse. The DoDont doc block already exists to build them from.</motivation>

<requirements>
  <brand>Configure a manager theme in .storybook/manager.ts (brandTitle, brandImage/logo, brand colors derived from --dz-* values) and set a proper favicon. Keep it consistent in light/dark.</brand>
  <guides>Add a "Choosing components" guide page (or per-family sections) covering at least: Switch vs Checkbox, Button vs IconButton vs Link, Dialog vs Sheet vs Popover, Select vs Combobox vs Listbox, Toast vs Alert vs Notification. Each: a one-line rule, a small decision table (DocTable), and paired Do/Don't examples (DoDont).</guides>
</requirements>

<steps>
  1. Add the manager brand theme + favicon; verify against a fresh `storybook dev` and `storybook build`.
  2. Author the decision-guide page(s) using DocTable + DoDont.
  3. Cross-link the guides from the relevant family Overview pages.
</steps>
```

---

# Part B — `apps/landing`: make the front door professional and unique

The landing app is ~70% of the way to the reference sites (hero, live showcase, theming
demo, 90 blocks, 46 templates, motion, `llms.txt`, OG images). These tasks add the missing
credibility markers and the **AI-native distribution** layer that defines 2025–26 —
the single biggest differentiator available to a free library.

## 🔴 P0 — Credibility & distribution

### [x] TASK-APP-10 — Live GitHub stars + npm downloads in social proof

_Gap: `src/config.ts` `FACTS.githubStars` and `FACTS.npmDownloads` are hardcoded `null`;
`SocialProof.vue` falls back to static text. Every mature library surfaces live numbers;
hiding them is a documented anti-pattern (landing.md §2.2)._

```xml
<role>You are a Vue + Vite front-end engineer on the dzup-ui landing app. Follow <repo_conventions> exactly.</role>

<task>Populate GitHub stars and npm weekly downloads with real numbers in SocialProof.vue, fetched at build time with a safe runtime fallback.</task>

<motivation>Social proof only works with real numbers, and config.ts already reserves the fields (githubStars/npmDownloads = null). Fetching them at build time (baked into the static site) avoids per-visit API calls and rate-limit thrash, while a small runtime refresh keeps them fresh. This turns a placeholder into a trust signal on the highest-traffic page.</motivation>

<requirements>
  <fetch>At build time (a script invoked from the landing `build`), fetch star count from the GitHub API and weekly downloads from the npm registry download-counts API; write the numbers into a generated data module or into config.ts FACTS. Cache/guard against network failure so a build never breaks if an API is down (fall back to the last known value or the static count).</fetch>
  <display>Render the numbers in SocialProof.vue with an accessible label and a subtle count-up on scroll-in (reuse the existing motion CountUp component; honor prefers-reduced-motion). Keep the component count (147) and family count (11) alongside.</display>
  <badges>Optionally add shields.io-style badges (stars, npm version, bundle size, license) to the README and footer for parity with the site.</badges>
</requirements>

<steps>
  1. Write the fetch script; wire it into apps/landing package.json `build` before `vite build`.
  2. Update SocialProof.vue to read the real values with CountUp.
  3. Add a graceful fallback path and test it by simulating a failed fetch.
  4. Run `vite build`; confirm real numbers render in light and dark.
</steps>

<success_criteria>The live site shows real star + download counts; a network failure during build degrades gracefully instead of erroring.</success_criteria>
```

---

### [x] TASK-APP-11 — shadcn-compatible registry + `npx shadcn add` install + copy-code on blocks

_Gap: `scripts/build-registry.ts` already emits `public/r/`, but blocks/components aren't
installable via the shadcn CLI, and block cards lack a copy-code button. Positioning
dzup-ui as a **registry** (not just an npm package) is the defining 2025–26 distribution
pattern — `npx shadcn add @dzup-ui/<item>` pulls a block straight into a project._

```xml
<role>You are a Vue + DX engineer building distribution for the dzup-ui landing app. Follow <repo_conventions> exactly.</role>

<task>Make the existing registry shadcn-CLI-compatible so blocks/templates/tokens install via `npx shadcn add`, and add copy-code affordances to every block.</task>

<motivation>shadcn's registry format (registry.json + per-item registry-item.json) is now the lingua franca for "add this UI to my project" — its CLI distributes components, blocks, tokens, and hooks across React, Svelte, AND Vue. We already build public/r/ artifacts and pair each block with its ?raw source; conforming that output to the registry-item schema lets users run one command to pull a dzup-ui block in. Combined with a per-block "Copy code" button and a hero install command, this is the highest-leverage adoption upgrade available and still rare for Vue libraries.</motivation>

<requirements>
  <registry>Extend scripts/build-registry.ts to emit a top-level registry.json and per-item registry-item.json conforming to the shadcn registry schema (name, type, files, dependencies, registryDependencies, cssVars/tokens). Serve them under public/r/ so `npx shadcn add <url>` resolves.</registry>
  <cli_ux>On each block detail page (/blocks/:id) and card, show the exact install command (e.g. `npx shadcn add https://<domain>/r/<id>.json`) with a copy button, plus a "Copy code" button that copies the block's SFC source (already available as ?raw). Add a package-manager tab set (npm/pnpm/yarn/bun) for the command.</cli_ux>
  <hero>Confirm/extend the hero install command (already `npm i @dzup-ui/core`) with the same multi-package-manager copy tabs for consistency.</hero>
  <spike>If Vue SFC blocks can't be cleanly expressed in the registry schema for a target project, document the limitation and ship what works (e.g. source + dependency manifest) rather than blocking.</spike>
</requirements>

<steps>
  1. Study one existing public/r/ artifact and the shadcn registry-item schema; map the fields.
  2. Extend build-registry.ts to emit conformant registry.json + registry-item.json.
  3. Add copy-command + copy-code UI (with PM tabs) to block cards/detail pages using DzCopyButton + DzTabs.
  4. Verify `npx shadcn add <url>` pulls a block into a scratch Vite+Vue project; run `vite build`.
</steps>

<success_criteria>`npx shadcn add <registry-url>/r/<block>.json` adds a working block to a fresh project; every block page shows a copy-command and copy-code button.</success_criteria>
```

---

### [x] TASK-APP-12 — Global ⌘K command palette (components + blocks + templates)

_Gap: a `BlockCommandPalette` exists but only searches blocks. A single ⌘K palette that
searches components, blocks, and templates from anywhere is a signature 2025–26 landing
feature and dramatically improves navigation of a large catalog._

```xml
<role>You are a Vue front-end engineer on the dzup-ui landing app. Follow <repo_conventions> exactly.</role>

<task>Add a site-wide ⌘K / Ctrl+K command palette that fuzzy-searches components (→ Storybook), blocks (→ /blocks/:id), and templates (→ /templates/:slug) from any page.</task>

<motivation>The catalog is large (147 components, 90 blocks, 46 templates) and a block-only palette already proves the pattern. Elevating it to a global, cross-catalog search — the shadcn/Linear ⌘K convention — is exactly what visitors reach for and is memorable. Build it from @dzup-ui/core's own DzCommandPalette so it dogfoods the library and inherits its a11y.</motivation>

<requirements>
  <scope>Index three sources: FAMILIES/components (deep-link into Storybook via config.ts helpers), the block registry, and the template registry. Group results by type with icons; show a small preview or family/category meta per result.</scope>
  <ux>Global keyboard shortcut (⌘K / Ctrl+K) mounted in App.vue; fuzzy match on title + tags + category; keyboard navigable; Enter routes. Recent/most-popular items when the query is empty. Fully accessible (focus trap, aria, Esc to close) — inherited from DzCommandPalette.</ux>
  <reuse>Reuse the existing useBlockSearch fuzzy logic; extend it to the other two sources rather than duplicating.</reuse>
</requirements>

<steps>
  1. Build a unified search index (components + blocks + templates) from the existing data/registries.
  2. Mount DzCommandPalette globally in App.vue with the ⌘K shortcut.
  3. Wire result routing to Storybook / block / template destinations.
  4. Run `vite build`; verify keyboard flow and both themes.
</steps>

<success_criteria>Pressing ⌘K anywhere opens the palette; typing "button" surfaces the component, relevant blocks, and templates; Enter navigates correctly.</success_criteria>
```

## 🟠 P1 — Differentiating experiences

### [x] TASK-APP-13 — Full interactive Theme Designer page (`/themes`) with export + shareable URL

_Gap: `ThemingDemo.vue` offers 6 presets + hue/chroma/radius sliders + copy-CSS on the home
page. The `Themes` ecosystem tile is "planned". A dedicated designer — modeled on tweakcn —
with WCAG contrast checking, full token control, and shareable URLs is the highest-impact
unique landing feature and fills the ecosystem slot._

```xml
<role>You are a Vue front-end engineer building a theming tool for the dzup-ui landing app. Follow <repo_conventions> exactly.</role>

<task>Build a full-page Theme Designer at /themes: live editing of the semantic token set with a real component preview, live WCAG contrast checking, and one-click export (CSS + JSON) plus a shareable URL.</task>

<motivation>Our whole system is an OKLCH three-tier token model — the perfect substrate for a visual theme editor, and tweakcn/Nuxt UI prove the demand. The home ThemingDemo is a teaser; a dedicated /themes page (the "Themes" ecosystem offering) lets users design a complete theme against a live cluster of real components, verify accessibility as they go, and export --dz-* variables to drop into their app. Shareable URLs make themes spreadable. This is memorable, on-brand, and free.</motivation>

<requirements>
  <controls>OKLCH color pickers for the semantic aliases (primary, secondary, success, warning, danger, info, neutral surfaces/foregrounds) plus radius, spacing density, shadow intensity, and font selection — all writing to --dz-* on a scoped preview root, live.</controls>
  <preview>A rich preview built from real @dzup-ui/core components (buttons, inputs, cards, alerts, table, chart-like panel) that re-renders instantly, viewable in light AND dark side by side.</preview>
  <a11y_check>Compute and display WCAG contrast ratios for key foreground/background pairs as the user edits (pass/fail AA badges), so users can't ship an inaccessible theme unknowingly.</a11y_check>
  <export>Buttons to copy/download the theme as a .css file of --dz-* custom properties and as JSON tokens. Encode the current theme in the URL (query/hash) so a link reproduces it; add a few curated preset themes as starting points.</export>
  <stretch>Optional "theme from image/prompt": derive a palette from an uploaded image's dominant colors. Mark clearly as experimental; keep it free and client-side.</stretch>
</requirements>

<steps>
  1. Add the /themes route + page; lift the existing ThemingDemo logic into a fuller editor.
  2. Implement OKLCH controls writing live --dz-* on a scoped root; build the light/dark split preview from core components.
  3. Add live WCAG contrast readouts.
  4. Implement CSS + JSON export and URL encode/decode; wire curated presets.
  5. Link /themes from the EcosystemGrid "Themes" tile (flip planned → available) and the nav.
  6. Run `vite build`; verify export output actually re-themes a scratch page.
</steps>

<success_criteria>A user picks a primary hue, sees the whole preview re-theme with a live AA/fail contrast readout, downloads a CSS file, and shares a URL that reproduces the exact theme.</success_criteria>
```

---

### [x] TASK-APP-14 — MCP server for AI IDEs (browse + install + source)

_Gap: none exists. An MCP server exposing components, blocks, tokens, and install commands
lets developers "connect Cursor / Claude Code / Windsurf to dzup-ui." Still rare for Vue
libraries → strong differentiation, and it compounds with the registry (TASK-APP-11) and
`llms.txt` (TASK-APP-08)._

```xml
<role>You are a TypeScript engineer building an MCP server for the dzup-ui ecosystem. Follow <repo_conventions> exactly.</role>

<task>Build and document a free, open-source MCP (Model Context Protocol) server that exposes dzup-ui components, blocks, templates, tokens, and install commands to AI coding tools.</task>

<motivation>AI IDEs increasingly consume libraries through MCP servers (the shadcn MCP server already supports Vue and is a forkable reference). Shipping one lets a developer say "add a dzup-ui pricing block" in Cursor/Claude Code and have it fetch the real source + dependencies. This is AI-native distribution — the top differentiator identified in research — and it reuses the registry data we already generate.</motivation>

<requirements>
  <tools>Expose MCP tools/resources: list components (with API summary), get component source/props, list blocks/templates, get block source + install command, list design tokens. Back them by the existing registry artifacts (public/r/, llms.txt) so there is one source of truth.</tools>
  <packaging>Ship as a small runnable server (e.g. an npx-able package under the monorepo, tooling package, or apps/) with a README showing how to connect it from Cursor, Claude Code, and Windsurf. MVP = browse + get-source + install-command; note fuller scope (demos, directory) as follow-up.</packaging>
  <discovery>Add a landing section / docs page ("Use dzup-ui with your AI IDE") with copy-paste MCP config, and register the server in the public MCP registry for discovery.</discovery>
</requirements>

<steps>
  1. Scaffold the MCP server reading the registry/llms artifacts.
  2. Implement the MVP tools (list/get/install/tokens).
  3. Write connection docs for Cursor/Claude Code/Windsurf + a landing "AI IDE" section.
  4. Test end-to-end from at least one MCP client; publish + register.
</steps>

<success_criteria>Connecting the server in an MCP client lets the assistant list dzup-ui components and fetch a block's real source + install command.</success_criteria>
```

---

### [x] TASK-APP-15 — Live light/dark split-view showcase ("click to re-theme the page")

_Gap: `ShowcaseDashboard.vue` re-themes with the toggle but there is no side-by-side
light/dark proof and no memorable "re-theme the whole page" moment. Both are cheap, high-impact._

```xml
<role>You are a Vue front-end engineer on the dzup-ui landing app. Follow <repo_conventions> exactly.</role>

<task>Add a side-by-side light/dark split view to the showcase and a prominent "re-theme the entire page" control in the hero/nav.</task>

<motivation>"Show, don't tell" is universal for component-library landings, and seamless theming is our headline claim. A labeled light|dark split of the live dashboard makes the proof instant, and a single control that visibly re-themes the whole page (colors transitioning smoothly) is the kind of moment visitors screenshot. Both build on the existing showcase and theme composable.</motivation>

<requirements>
  <split>Render the showcase dashboard twice in scoped data-theme="light" and data-theme="dark" containers, clearly labeled, side by side on desktop and as a toggle/stack on mobile. Keep it fully live (real components), not screenshots.</split>
  <retheme>A hero/nav control that transitions the page theme with a short color transition (not a hard flip); reuse useTheme + the FOUC-safe attribute. Respect prefers-reduced-motion (instant swap when reduced).</retheme>
  <perf>Transform/opacity/color transitions only; no layout thrash. Ensure the doubled render stays within the performance budget (lazy/simplified variant on small screens).</perf>
</requirements>

<steps>
  1. Wrap the showcase in scoped light/dark containers with labels + responsive behavior.
  2. Add the animated page re-theme control; wire to useTheme.
  3. Verify reduced-motion + both-theme correctness; run `vite build`.
</steps>
```

## 🟢 P2 — SEO, discovery & polish

### [x] TASK-APP-16 — Sitemap, robots.txt & per-page structured data

_Gap: the landing analysis found no `sitemap.xml` or `robots.txt`, though per-route meta/OG
and `noindex` on previews already exist. Complete the SEO foundation so the large catalog
(90 blocks + 46 templates) is fully crawlable._

```xml
<role>You are a Vue + Vite SEO engineer on the dzup-ui landing app. Follow <repo_conventions> exactly.</role>

<task>Generate a sitemap.xml and robots.txt at build time and add JSON-LD structured data to key pages.</task>

<motivation>The site already sets per-route titles, descriptions, canonicals, OG images, and noindex on preview routes — but without a sitemap, crawlers may miss the 90 block and 46 template detail pages. A generated sitemap + robots.txt + SoftwareApplication/BreadcrumbList JSON-LD closes the loop and improves both classic SEO and AI-SEO (alongside the existing llms.txt).</motivation>

<requirements>
  <sitemap>A build step enumerates all indexable routes (home, /blocks, /blocks/:id ×90, /templates, /templates/:slug ×46, /themes, /pro) — excluding noindex preview routes — into public/sitemap.xml with canonical URLs.</sitemap>
  <robots>Emit public/robots.txt allowing crawl and pointing to the sitemap; disallow the /preview routes.</robots>
  <structured_data>Add JSON-LD (SoftwareApplication for the library, BreadcrumbList on detail pages) via the existing per-route head mechanism.</structured_data>
</requirements>

<steps>
  1. Add the sitemap/robots generation step to the landing build.
  2. Inject JSON-LD through the head resolver used by block/template detail routes.
  3. Run `vite build`; validate sitemap.xml and robots.txt in dist.
</steps>
```

---

### [x] TASK-APP-17 — Dismissible announcement banner + "Open in StackBlitz" for blocks & templates

_Gap: `landing.md` §4.0 specifies an optional announcement banner (not built), and blocks/
templates have live previews but no one-click "fork this" like the docs will get in
TASK-APP-06. Two small, high-utility additions._

```xml
<role>You are a Vue front-end engineer on the dzup-ui landing app. Follow <repo_conventions> exactly.</role>

<task>Add (1) a config-driven dismissible announcement banner above the nav, and (2) an "Open in StackBlitz" action on block and template detail pages.</task>

<motivation>Mature libraries use a thin announcement bar to surface releases/news and drive repeat traffic; landing.md already reserves it. Separately, letting a visitor open any block or template in a live StackBlitz project (the source is already available as ?raw) removes the last friction between "I like this" and "it runs in my editor." Both are cheap and reuse existing data.</motivation>

<requirements>
  <banner>A thin, dismissible bar driven by a single config entry (message + link + id). Persist dismissal in localStorage keyed by id so a new announcement re-shows. Hidden entirely when no announcement is configured. Accessible (role, dismiss button, keyboard).</banner>
  <stackblitz>On /blocks/:id and /templates/:slug, an "Open in StackBlitz" button that injects the item's source into a prebuilt Vite+Vue+@dzup-ui/core starter (share the starter template with TASK-APP-06 if built). Copy-code button alongside.</stackblitz>
</requirements>

<steps>
  1. Build the AnnouncementBanner component fed by config.ts; wire dismissal persistence.
  2. Add the StackBlitz action + copy-code to block/template detail pages.
  3. Run `vite build`; verify dismissal persistence and that StackBlitz opens a runnable project.
</steps>
```

---

### [x] TASK-APP-18 — Honest "Compare" page (dzup-ui vs peers) + Core Web Vitals budget

_Two credibility flourishes: a transparent feature-comparison page (a proven conversion
asset) and a performance budget that lets the site advertise excellent Core Web Vitals —
which OSS sites often fail, so beating it is a real differentiator._

```xml
<role>You are a Vue front-end + performance engineer on the dzup-ui landing app. Follow <repo_conventions> exactly.</role>

<task>Add a "Compare" page with an honest feature matrix vs peer libraries, and add a Core Web Vitals / bundle-size budget to CI with a visible score.</task>

<motivation>An honest comparison table (dzup-ui vs PrimeVue / Nuxt UI / others: component count, accessibility, tokens, TypeScript, license, framework) helps evaluators decide and signals confidence — done tastefully, not disparagingly. Separately, best-in-class landings advertise excellent Core Web Vitals; wiring a Lighthouse/bundle budget into CI both keeps the site fast and earns a badge we can show. Both reinforce "professional."</motivation>

<requirements>
  <compare>A /compare page (or home section) with a factual feature matrix sourced from public docs, built with DocTable/DzTable, clearly dated and citing sources. Keep claims accurate and neutral; avoid unverifiable superlatives.</compare>
  <perf>Add a CI step (Lighthouse CI or equivalent) asserting LCP < 2.5s, CLS < 0.1, and a bundle-size budget for the landing build; publish the score as an artifact/badge. Fix any regressions the first run surfaces (font loading, lazy demos, image sizes).</perf>
</requirements>

<steps>
  1. Compile the comparison data with sources; build the /compare page.
  2. Add the Lighthouse/bundle-size CI job with thresholds; address initial findings.
  3. Surface the score badge in the footer/README.
  4. Run `vite build`; confirm the page and the CI check.
</steps>
```

---

## Summary — task map

| #  | Task | App | Type | Priority | Builds on |
| -- | ---- | --- | ---- | -------- | --------- |
| 01 | Visual regression (Chromatic, light×dark) | storybook | Quality/CI | 🔴 P0 | storybook-decisions TASK-0.11 |
| 02 | Enforce a11y (todo→error, WCAG 2.2 AA gate) | storybook | Quality/CI | 🔴 P0 | storybook-decisions TASK-X.3 |
| 03 | Component maturity dashboard | storybook | Docs | 🔴 P0 | status.ts tags |
| 04 | Interactive design-token browser | storybook | Docs | 🟠 P1 | DesignTokens.mdx |
| 05 | Figma integration (addon-designs) | storybook | Docs | 🟠 P1 | storybook-decisions TASK-0.15 |
| 06 | Live REPL + Open in StackBlitz | storybook | DX | 🟠 P1 | — |
| 07 | In-docs "What's New"/changelog | storybook | Docs | 🟠 P1 | CHANGELOG.md |
| 08 | llms.txt for the component API | storybook | AI/discovery | 🟢 P2 | landing llms.txt |
| 09 | Brand manager + "when to use X vs Y" guides | storybook | Brand/Docs | 🟢 P2 | DoDont block |
| 10 | Live GitHub stars + npm downloads | landing | Credibility | 🔴 P0 | config.ts FACTS |
| 11 | shadcn registry + `npx shadcn add` + copy-code | landing | Distribution | 🔴 P0 | build-registry.ts |
| 12 | Global ⌘K command palette | landing | Discovery | 🔴 P0 | BlockCommandPalette |
| 13 | Full Theme Designer (/themes) + export | landing | Differentiator | 🟠 P1 | ThemingDemo.vue |
| 14 | MCP server for AI IDEs | landing | AI/distribution | 🟠 P1 | registry, llms.txt |
| 15 | Light/dark split showcase + page re-theme | landing | Differentiator | 🟠 P1 | ShowcaseDashboard.vue |
| 16 | Sitemap + robots.txt + JSON-LD | landing | SEO | 🟢 P2 | per-route head |
| 17 | Announcement banner + Open in StackBlitz | landing | Polish | 🟢 P2 | landing.md §4.0 |
| 18 | Compare page + Core Web Vitals budget | landing | Credibility/perf | 🟢 P2 | — |

> **The through-line:** the single biggest 2025–26 differentiator for a *free* library is
> **AI-native distribution** — TASK-APP-08 (`llms.txt` for the API), TASK-APP-11 (shadcn
> registry + CLI), and TASK-APP-14 (MCP server) reinforce each other and are still rare for
> Vue libraries. Ship those three together and dzup-ui reads as ahead of its peers, not
> merely on par.

> **Deliberately out of scope (Pro funnel — see [`landing.md`](./landing.md) §5/§11, Phase 2):**
> the pricing page, per-seat license enforcement / watermarking, PRO sidebar badges and
> upgrade banners, and the pro-waitlist backend. Those belong to the paid tier and are
> already specified elsewhere. Everything above ships free.

## Sources

- **Storybook 10 / testing:** [Storybook 9 release (testing overhaul)](https://storybook.js.org/blog/storybook-9/) · [Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon) · [Interaction testing](https://storybook.js.org/docs/writing-tests/interaction-testing) · [Accessibility testing](https://storybook.js.org/docs/writing-tests/accessibility-testing) · [Doc blocks](https://storybook.js.org/docs/writing-docs/doc-blocks)
- **Visual regression:** [Chromatic (free for OSS)](https://www.chromatic.com/) · [Chromatic vs Playwright](https://www.chromatic.com/compare/playwright) · [Chromatic modes](https://www.chromatic.com/docs/modes/)
- **Tokens / Figma / themes:** [storybook-design-token](https://github.com/UX-and-I/storybook-design-token) · [@storybook/addon-designs](https://github.com/storybookjs/addon-designs) · [@storybook/addon-themes](https://storybook.js.org/docs/essentials/themes)
- **AI-native distribution:** [shadcn registry](https://ui.shadcn.com/docs/registry/examples) · [shadcn CLI](https://ui.shadcn.com/docs/cli) · [shadcn MCP (supports Vue)](https://ui.shadcn.com/docs/mcp) · [shadcn-ui-mcp-server (Vue)](https://github.com/Jpisnice/shadcn-ui-mcp-server) · [shadcn llms.txt](https://ui.shadcn.com/llms.txt) · [llms.txt spec](https://llmstxt.org/)
- **Theme editor:** [tweakcn](https://tweakcn.com/) · [Nuxt UI theming](https://ui.nuxt.com/) · [Nuxt UI v4 (Pro merged to free)](https://nuxt.com/blog/nuxt-ui-v4)
- **Playgrounds:** [Vue SFC Playground](https://play.vuejs.org/) · [vuejs/repl](https://github.com/vuejs/repl) · [PrimeVue playground](https://primevue.org/playground/)
- **Docs / do-&-don't references:** [Best design-system docs sites (Backlight)](https://backlight.dev/mastery/the-best-design-system-documentation-sites) · Shopify Polaris · IBM Carbon · Adobe Spectrum
- **Motion / landing:** [Aceternity UI](https://ui.aceternity.com/) · [Magic UI](https://magicui.design/)
- **Method:** [Anthropic — Prompt engineering: Be clear and direct](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct)
