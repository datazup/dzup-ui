# Storybook Sprint 0 — Decision Record

> Companion to [`tasks.md`](./tasks.md). Captures the "evaluate and document"
> outcomes for the optional Sprint 0 tasks (0.5, 0.11, 0.15) plus the rollout
> notes for the deferred infrastructure pieces.

## TASK-0.5 — `DzThemeProvider` global decorator

**Decision: do _not_ wrap all stories in `DzThemeProvider`.** Use the
`withThemeByDataAttribute` decorator alone.

**Rationale**

- Theming is driven entirely by the `data-theme` attribute and the `var(--dz-*)`
  cascade. `withThemeByDataAttribute({ attributeName: 'data-theme' })` already sets
  exactly that attribute, which is everything core components need.
- No core component injects/consumes a theme **context**; the tokens CSS handles
  light/dark purely via CSS. A `DzThemeProvider` wrapper would add a second source
  of truth for the same attribute and risk fighting the toolbar (both would try to
  own `data-theme`).
- Keeping the provider out of the global decorator avoids a hard dependency from
  every story onto a context component, keeping stories closer to how consumers use
  the primitives.

**Revisit if** a future component requires the theme **context** (not just the
attribute) — e.g. reading the resolved theme in JS. At that point, add
`DzThemeProvider` as an _inner_ decorator (mounted **below** `withThemeByDataAttribute`
so the attribute still wins) and have the provider read, not set, `data-theme`.

## TASK-0.11 — Visual regression

**Decision (superseded by TASK-APP-01): adopt Chromatic now, capturing every
story in light × dark.** Wire it as a **non-blocking** CI check first, then
promote to required once baselines are stable (TASK-X.5).

> **History.** Sprint 0 chose "Playwright snapshots first, Chromatic later"
> because Chromatic needs a project token + account (out of scope for a no-account
> Sprint 0), while the repo already ran Playwright. In practice neither was wired,
> and local Playwright snapshots carry Mac-vs-Linux baseline flake. TASK-APP-01
> resolves the gap by going straight to Chromatic: it snapshots in an isolated
> server environment (no OS baseline flake), is free for public repos, and — via
> its **modes** feature — captures each story in both themes in one run, which
> also proves the token system holds in dark mode.

**Why Chromatic (not Playwright snapshots)**

- Isolated, consistent render environment — removes the Mac-vs-Linux baseline
  flake that plagues committed local screenshots.
- Free for open-source; Storybook-native; parallelized with a review UI and
  permalinks.
- **Modes** capture light + dark from the existing `withThemeByDataAttribute`
  global in one run (no duplicated stories).

**What shipped (TASK-APP-01)**

1. `chromatic` devDependency + a `chromatic` script in `apps/storybook/package.json`
   (`chromatic --build-script-name build --exit-zero-on-changes`). The project
   token is read from the `CHROMATIC_PROJECT_TOKEN` env var / CI secret — never
   committed.
2. `parameters.chromatic.modes = { light: { theme: 'light' }, dark: { theme:
   'dark' } }` in `.storybook/preview.ts`, applied **globally** so every story is
   captured in both themes. Each mode flips the `theme` global that
   `withThemeByDataAttribute` already owns. Stories opt out of a mode with their
   own `parameters.chromatic.modes` and out of snapshots with
   `parameters.chromatic.disableSnapshot`.
3. Non-determinism sweep — snapshots disabled (with an explanatory comment) on the
   inherently non-deterministic stories:
   - **`DzCountdown`** (meta) — live drift-corrected timers, every story ticks.
   - **`DzRelativeTime`** (meta) — `Date.now()`-relative phrases refreshed by an
     age-adaptive timer.
   - **`DzAnimatedNumber`** (meta) — count-up tween on mount + `Math.random()`
     re-rolls.
   - **`DzCarousel` → Autoplay, Real World: Testimonials** and
     **`DzCarouselParts` → Dots Only** (per-story) — autoplay auto-advances the
     active slide.
   Heavy stories (e.g. `DzDataGrid` "Performance: 1,000 Rows") keep their existing
   `loader` lazy datasets (TASK-X.7) so snapshots stay cheap; `onlyChanged`
   (TurboSnap) further caps the per-run snapshot count.
4. A dedicated **`.github/workflows/chromatic.yml`** job runs on PRs (and `main`),
   `continue-on-error: true`, and posts the build/review + published-Storybook
   links to the job summary. `fetch-depth: 0` enables baseline detection +
   TurboSnap.

## TASK-0.15 — Figma / design reference

**Original decision (Sprint 0): defer `@storybook/addon-designs`; reserve a
`design` parameter convention.** Do not add the addon until Figma frames exist to
link.

- When design sources are available, embed per-component via the `design`
  parameter:
  ```ts
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/file/…' } }
  ```
- Adopting the convention now (even unused) means turning on the addon later is a
  one-line `main.ts` change with zero story rewrites.

**Update (TASK-APP-03 — addon switched on).** The reserved convention is now live.
As predicted, switch-on was a single `addons` line — zero story rewrites.

1. `@storybook/addon-designs` (`^11.1.3`, peer-compatible with Storybook 10) added
   to `apps/storybook/package.json` and registered last in `.storybook/main.ts`
   `addons`. It renders a **Design** panel next to the Controls/A11y panels.
2. The `design` parameter is documented in **Contributing → "Design reference"** as
   *required-when-available* and seeded in the story template
   (`_shared/Dz.stories.template.ts`, with a `REPLACE_ME` URL reminder).
3. **Graceful degradation:** stories without `parameters.design` show the addon's
   built-in "design link coming soon" empty state — not an error — so the rollout
   is opt-in per component with no big-bang rewrite.
4. **Flagship seeds** prove the wiring: `DzButton`, `DzCard`, `DzInput` carry
   `parameters.design` Figma URLs (placeholder `node-id`s until the canonical frames
   land — swap the `dzup-ui-design-system` file/node when they do).
5. **MDX embed:** `Buttons.mdx` imports the `<Figma>` block from
   `@storybook/addon-designs/blocks` and embeds the family frame so design + live
   docs sit together on the Overview page.

This feeds the maturity dashboard's **Design** column (a component counts as
"design-linked" once its `meta` carries `parameters.design`).

### Update 2026-07-10 (TASK-DS-07) — scoped back: no Figma library exists

**Decision: Path B.** The placeholder seeds are removed and the documentation now
says plainly that no component links a Figma frame. Confirmed with the maintainer
on 2026-07-10: there is no maintained Figma library for dzup-ui and none is in
progress.

**Why the previous state was worse than doing nothing.** Points 4 and 5 above
described seeds that never worked. `addon-designs` parses a Figma URL with
`/figma\.com\/([\w-]+)\/([0-9a-zA-Z]{22,128})/` — the file key must be 22+
*alphanumeric* characters. `dzup-ui-design-system` is 21 characters and contains
hyphens, so it never matched; the addon fell through to a plain iframe of a URL
that does not resolve. All three "flagship seeds" and the `Buttons.mdx` embed
rendered a broken frame, not a design. Meanwhile `Contributing.mdx` told authors
"Do not point it at a placeholder file; an empty panel is the honest signal" — a
rule the repo itself broke in the three most-visited stories.

A blank Design panel reads as *scope*. A broken iframe reads as *neglect*. Half of
~139 components showing the first and three showing the second was the one state
not worth staying in.

**What changed:**

- `parameters.design` deleted from `DzButton`, `DzCard`, `DzInput` stories. (In
  `DzCard` the surrounding `parameters` block survives — it carries `a11yError`.)
- The `<Figma>` embed and its import deleted from `Buttons.mdx`, along with the
  "Design source" section that claimed the family "is specified in Figma."
- `_shared/Dz.stories.template.ts` no longer seeds a `REPLACE_ME` URL. The
  convention survives as a comment showing the shape to add when a frame exists.
- **Contributing → "Design reference"** now leads with the ground truth ("there is
  no Figma library for dzup-ui today"), and states that the code — variants,
  tokens, stories — is the source of truth.
- **ComponentStatus** explains that its Design column reads `—` for every component
  by design, rather than leaving a fully-empty column to read as an unfilled gap.

**What was deliberately kept.** `@storybook/addon-designs` stays installed and the
`design` parameter stays wired through `componentStatus.ts`. The original Sprint-0
reasoning still holds: the convention costs nothing while unused, and keeping it
means the first real frame is a one-line story change rather than a migration. The
dashboard column is the coverage tracker Path A would have needed — it simply reads
zero today.

**Revisit when:** a Figma library ships. At that point Path A becomes available —
seed the flagships first, add `design` to the story template, and the Design column
starts counting without any further plumbing.

### Update 2026-07-16 (TASK-FREE-12) — addon removed; the column is gone

**Decision: uninstall.** The "deliberately kept" paragraph above did not survive
contact with the cost. `@storybook/addon-designs` was mounting an empty Design panel
on **all 1,393 stories** and adding weight to every build, to display a parameter
that zero stories carried and — per the 2026-07-10 finding above — that nothing was
going to fill. "The convention costs nothing while unused" was the load-bearing
claim, and it was false: an addon is not free, and a permanently-empty panel is
itself an assertion that a design source exists somewhere.

**What changed:**

- `@storybook/addon-designs` removed from `apps/storybook/package.json` and from the
  `addons` array in `.storybook/main.ts`.
- The **Design** column removed from the ComponentStatus matrix, along with the
  `design` field and its regex in `stories/_data/componentStatus.ts`. A column that
  reads `—` for every row reports the absence of a thing, not the state of one; the
  page now says so explicitly instead of rendering it.
- **Contributing → "Design reference"** now states the addon is not installed and
  documents the two-line path to bring it back.
- `_shared/Dz.stories.template.ts` drops the reserved-parameter comment block.

**Why this is not a reversal of Sprint 0.** Sprint 0 said "do not add the addon
until Figma frames exist to link." That was right. TASK-APP-03 added it anyway on
the theory that switch-on should be pre-paid; three years of an empty panel is a
worse price than the one-line change it was avoiding. This restores the Sprint-0
position — with the switch-on cost now measured rather than assumed.

**Revisit when:** a Figma library ships. Re-add the dependency and the `addons` line,
re-add the `design` field to `componentStatus.ts`, and seed the flagships. The
convention's *shape* is still documented in Contributing; only the unused machinery
is gone.

## TASK-X.4 — Public vs app-specific triage (Feedback components)

**Decision (Sprint 6 scope):** classify the five flagged feedback components as
follows. The Sprint-3 half (`DzPersonaSelector`) was resolved earlier (public).

| Component | Verdict | Where it lives |
|-----------|---------|----------------|
| `DzRunStatusBadge` | **Public, app-specific** | `Core/Feedback/App-Specific/*`, `status:experimental`. Exported from `@dzup-ui/core`; fully implemented. |
| `DzTokenProgressBar` | **Public, app-specific** | `Core/Feedback/App-Specific/*`, `status:experimental`. Exported; fully implemented. |
| `GovernanceBadge` | **Excluded** | Unimplemented stub (placeholder `<span data-stub>`), **not exported** from `@dzup-ui/core`. No story. |
| `TeamMemberBadge` | **Excluded** | Same — unimplemented stub, not exported. No story. |

**Rationale**

- `DzRunStatusBadge` / `DzTokenProgressBar` are real, exported, and tested-by-story,
  but they encode datazup product vocabulary (run-orchestration statuses, LLM token
  budgets). Documenting them under a clearly labelled **App-Specific** sidebar group
  keeps them discoverable without implying they are portable design-system
  primitives. Marked `experimental` because their contracts are product-driven.
- `GovernanceBadge` / `TeamMemberBadge` are stubs (their `.vue` files carry
  `// TODO: implement …` and render an empty `<span data-stub>`). They have no
  contract, no types graduation, and are absent from the public barrel. Writing
  stories now would document a non-existent API, so they are **excluded** until they
  reach Contract Spec v1 — at which point they likely also belong under App-Specific.

**Revisit when** the two stubs are implemented (add types/variants/contract spec),
or if the design system decides to fully exclude product-specific components from
the published Storybook (then move the App-Specific group behind a build flag).

---

## Sprint 12 — Cross-Cutting & Hardening

### TASK-X.1 — Compositions library

`Core/Compositions/*` now holds **five** compositions. `WorkspaceForm` was ported
during Sprint 3; Sprint 12 adds the remaining two flagship screens:

| Story | Families exercised | Notes |
|-------|--------------------|-------|
| `AppShellDashboard` | layout + navigation + cards + feedback | Full app screen built from real `DzAppShell` + `DzSidebar` + `DzStatCard` + `DzGrid` + `DzCard` (vs. the `DzAppShell` "Real World: Dashboard" story, which uses inline `<div>`s to keep the layout primitive self-contained). Interactive sidebar collapse with an awaited `play()`. |
| `SettingsPage` | navigation + cards + forms | `DzTabs` section rail → `DzCard` panels → `DzFormField`/`DzInput`/`DzSelect`/`DzSwitch`/`DzTextarea`. `play()` switches all three tabs. |

`DzSidebarItem` takes its icon via the **`#icon` slot** (not an `icon` prop) — the
composition uses `<template #icon><component :is="…" /></template>`.

### TASK-X.2 — Token & theming docs interactivity

- `DesignTokens.mdx`: added a `<Typeset>` type-scale ramp fed from `var(--dz-text-*)`
  in the `--dz-font-sans` family, plus live spacing bars (width `var(--dz-spacing-*)`).
  Radius/shadow swatches were already token-driven.
- `Theming.mdx` / `DesignTokens.mdx`: semantic + primitive `<ColorPalette>` already
  read live from `var(--dz-*)` (Sprint 0, TASK-0.14).
- `Media.mdx`: the icon set is shown via `<Canvas of={DzIconStories.IconGallery} />`.
  **Why not the React `<IconGallery>` block:** this is a Vue Storybook; the
  `@storybook/addon-docs` `<IconGallery>`/`<IconItem>` blocks render in React and
  cannot host `lucide-vue-next` components. Embedding the live Vue `DzIcon` gallery
  story keeps the doc in sync with the icons the library actually ships (which is the
  goal of the task) without hand-copying SVG paths into the MDX.

### TASK-X.6 — Sidebar taxonomy polish

`preview.ts` `storySort` now orders `Core` families by family-sprint order and pins
each family's `Overview` MDX to the top via `['Overview', '*']`, so opening a family
lands on its overview rather than the first component alphabetically. Verified
`Core/<Family>/<Component>` title convention across all 12 families + compositions,
and `showRoots: true` in `manager.ts`.

### TASK-X.7 — Performance budget

- **Lazy heavy stories:** `DzDataGrid` "Performance: 1,000 Rows" now builds its
  dataset inside a story `loader` (`makeLargeData()`), so the 1k-row cost is paid only
  when that story is viewed — not at story-file import (which also covers the
  lightweight `Default`/`With Sorting` stories and the autodocs page). `DzCommandPalette`
  is already lazy in the meaningful sense: its overlay/list content only mounts when the
  palette opens (portalled on demand), and its sample item set is small.
- **Build baseline (June 2026, local `storybook build`):**
  - Build time: ~2 min (Vite preview bundle).
  - `storybook-static/` total: **~13 MB** (assets ~6.5 MB), 112 story chunks.
  - Largest chunks are vendor: `iframe` runtime ~2.16 MB (gzip 669 kB) and `axe`
    (a11y) ~580 kB (gzip 160 kB) — both expected for a Storybook build and outside
    story-author control.
- **Follow-up (CI) — DONE (non-blocking metric).** `apps/storybook/scripts/check-bundle-size.mjs`
  (`yarn workspace @dzup-ui/storybook check:size`) walks `storybook-static/` and
  reports total on-disk size, the `assets/` subtotal, JS-chunk count, and the
  largest artifacts (raw + gzip). It runs in the `storybook` CI job right after
  `storybook build` and writes a shields.io size badge into the uploaded artifact.
  It is **non-blocking** (always exits 0) so a size change never fails the build —
  the "track first, budget later" step. Promote to an enforced budget once a
  baseline is trusted by passing `--max-mb <n>` (exits 1 when the total exceeds
  the cap). Current build measures **~21 MB on disk** (assets ~13 MB, ~398 JS
  chunks) — larger than the ~13 MB June 2026 baseline because the docs build now
  also bakes the `@vue/repl` playground, the bundled `@dzup-ui/core` sandbox, the
  CodeMirror editor, and the generated `llms.txt`/releases artifacts added by the
  TASK-APP-06/07/08 work; the largest chunks remain the expected vendor ones
  (Storybook `iframe`/manager runtime, `axe`). Build time stays visible as the CI
  step duration.

### TASK-X.3 / TASK-X.5 / TASK-X.8 — gated on infrastructure

- **TASK-X.3 (a11y `error` gate): IN PROGRESS — 1 of 11 families enforced
  (2026-07-09, TASK-DS-06).** The rollout is per-family: spread `a11yError` into a
  family's story metas once its audit is clean. The blocker named below (TASK-0.9)
  is resolved — the Vitest browser runner works, and the audit has now been run for
  real across all 175 story files.

  **Cards is enforced** (`packages/core/stories/cards/*.stories.ts`, 4 files,
  0 violations). The global default stays `'todo'`; the remaining 10 families are
  report-only against a measured backlog (Buttons 0, Overlays 1, Compositions 3,
  Media 3, Typography 3, Feedback 13, Layout 14, Inputs 26, Navigation 36, Data 39,
  Forms 82 failing stories).

  Choosing Cards over Typography followed the task's own instruction, and the data
  agreed: Cards had 3 failing stories to Typography's 9. **Buttons audits at 0 and
  is the obvious next notch** — it was excluded here only because the task said to
  start narrow and not with buttons.

  Driving Cards to zero required one **component** fix, not a story patch:
  `DzText`, `DzCaption`, `DzRelativeTime` and `DzStatCard` rendered
  `--dz-{intent}` as a text colour (3.69–4.38:1 in light — below AA). They now use
  `--dz-{intent}-muted-foreground` (7.31–10.25:1). That single fix also cleared 6
  of Typography's 9.

  The per-family recipe is written down in `apps/storybook/stories/Accessibility.mdx`
  so the next family is a checklist, not a rediscovery.
- **TASK-X.5 (visual-regression gate):** Chromatic now runs non-blocking on PRs
  (TASK-APP-01 / `.github/workflows/chromatic.yml`). **Promote to a required
  check once baselines are trusted:**
  1. Create the Chromatic project and add `CHROMATIC_PROJECT_TOKEN` as a repo
     secret (Settings → Secrets and variables → Actions). Never commit it.
  2. Merge one PR to establish the baseline on `main`; run the workflow a few
     times to confirm it is flake-free across light **and** dark (no unexpected
     diffs on unchanged stories — chase any remaining non-determinism into
     `disableSnapshot` / a scoped `modes` opt-out first).
  3. In Chromatic project settings, enable **"UI Review"** and set the PR check to
     required; optionally turn on **"Auto-accept changes on `main`"** so baselines
     advance on merge.
  4. Flip the workflow to blocking: remove `continue-on-error: true` from the job
     and drop `exitZeroOnChanges: true` from the `chromaui/action` step so a
     pending/denied visual review fails the check.
  5. Add **"Visual Regression (Chromatic)"** to the branch-protection required
     status checks for `main` (mirrors the a11y `error`-gate rollout in TASK-X.3).
- **TASK-X.8 (deploy):** needs a hosting target (internal Pages / Chromatic
  permalinks) + repo secrets. The static build is verified to come out clean
  (`storybook-static/`); publishing + the README link are the remaining steps.

---

## Deferred infrastructure — follow-up notes

These Sprint 0 tasks are **scaffolded in-repo** but need a one-time network install
or external account to go green. None are code-complete blockers for the rest of the
sprint.

### TASK-0.9 — Vitest addon (Playwright browser)

Scaffolded: `apps/storybook/vitest.config.ts`, `.storybook/vitest.setup.ts`,
`@storybook/addon-vitest` + `@vitest/browser` + `playwright` in `package.json`, and
the `storybook-test` CI job.

First-time local setup (needs network):

```bash
yarn install
yarn workspace @dzup-ui/storybook exec playwright install chromium
yarn workspace @dzup-ui/storybook test-storybook
```

The in-Storybook **test widget** appears once `@storybook/addon-vitest` is installed
and the Vitest server is running.

### TASK-0.10 — Coverage

Enabled in `apps/storybook/vitest.config.ts` (`test.coverage`, v8). Published by the
`storybook-test` CI job as the `storybook-coverage` artifact. Treated as a
barometer, **not** a 100% gate.

### TASK-0.12 — CI build job

The `storybook` build job already existed; Sprint 0 adds the `storybook-test` job
(play() + a11y + coverage). Both publish artifacts.
