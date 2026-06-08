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

**Decision: start with Playwright snapshots against the built Storybook; keep
Chromatic as the managed option.** Wire it as a **non-blocking** CI check first,
then promote to required once baselines are stable (TASK-X.5).

**Why Playwright-first**

- The repo already runs Playwright (`playwright.config.ts`, the `e2e` CI job) and
  installs Chromium — no new vendor/account is required to get a baseline.
- Chromatic is the better long-term managed service (parallelized, review UI,
  permalinks) but needs a project token + account setup, which is out of scope for a
  no-account Sprint 0.

**Rollout**

1. Build Storybook (`yarn storybook:build`) → static `storybook-static/`.
2. A Playwright spec serves the static build and snapshots the **gallery / matrix /
   dark-mode** stories (the highest-signal, lowest-flake states).
3. Add as a CI job that uploads diffs as artifacts but does **not** fail the build.
4. When stable, flip to required and/or migrate to Chromatic with the same baseline
   story set.

## TASK-0.15 — Figma / design reference

**Decision: defer `@storybook/addon-designs`; reserve a `design` parameter
convention.** Do not add the addon until Figma frames exist to link.

- When design sources are available, embed per-component via the `design`
  parameter:
  ```ts
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/file/…' } }
  ```
- Adopting the convention now (even unused) means turning on the addon later is a
  one-line `main.ts` change with zero story rewrites.

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
- **Follow-up (CI):** wire a size check on `storybook-static/` (bundlesize covers
  `packages/*/dist` today, not the SB build). Track build time + total size as a
  non-blocking CI metric first, promote to a budget once a baseline is trusted.

### TASK-X.3 / TASK-X.5 / TASK-X.8 — gated on infrastructure

- **TASK-X.3 (a11y `error` gate):** the rollout is per-family — set
  `parameters: { a11y: { test: 'error' } }` on a family's stories once its audit is
  clean. This **cannot be validated locally** until the Vitest addon install lands
  (TASK-0.9 — needs `yarn install` + `playwright install chromium`). Left global at
  `'todo'`; flipping families to `'error'` without being able to run the audit would
  risk red CI on states never actually scanned. Ready to roll out family-by-family
  once TASK-0.9 is green.
- **TASK-X.5 (visual-regression gate):** unchanged — promote to required once
  baselines are stable (depends on TASK-0.10/0.11).
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
