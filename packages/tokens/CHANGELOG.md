# @dzup-ui/tokens

## 0.2.0 (2026-08-10)

### Minor Changes

- New `DzPageHero` layout component + `.dz-prose` rich-content styles.

  **DzPageHero** — dark gradient hero band for top-level views (eyebrow,
  gradient h1, description, meta row, glass-treated actions cluster), extracted
  from docs-app's `DocsPageHero` so every app on the neural-indigo preset can
  share the band. Styling keys off the new `PAGE_HERO_TOKENS`
  (`--dz-page-hero-*`) in `@dzup-ui/tokens`, with `--dz-auth-brand-*` fallbacks.

  **.dz-prose** — typography for rendered rich content (markdown → sanitized
  HTML), ported from docs-app's `.docs-prose` and shipped unlayered in
  `dist/core.css` via base.css.

- de9cc6f: Add the public, versioned `ThemeRecipeV1` contract with strict validation and
  legacy migration, deterministic JSON and URL round trips, curated presets, and
  CSS-variable generation/application for palette, radius, shadow, density, font,
  mode, direction, and motion preferences. Include a framework-neutral Storybook
  preset and FOUC-cache helper so OSS and Pro catalogs share the same runtime axes.
- 6c5f522: Normalize the `warning` intent: every intent now exposes the same solid-fill state set (TASK-DS-10).

  `warning` was the only intent that shipped `-solid` / `-solid-hover`, so every
  consumer — `tv()` variants, the contrast gate, the story codemod — carried a
  `tone === 'warning'` branch, and each branch was a place to forget warning exists.

  **New tokens (additive; nothing was renamed or removed):**
  - `--dz-{intent}-solid` and `--dz-{intent}-solid-hover` for `primary`, `secondary`,
    `success`, `danger`, `info`. These resolve to the same primitive shades as
    `--dz-{intent}` / `--dz-{intent}-hover` (500/600 light, 400/300 dark), so **no
    published token changed color** and the swap is a visual no-op for those five.
  - `--dz-warning-hover`, which the intent was missing entirely.

  `--dz-warning-solid` / `--dz-warning-solid-hover` keep their exact values. They are
  no longer a bespoke pair — they are warning's members of a uniform family.

  **Why warning is shaped this way, and why the fill set has two states.** Near-black
  `--dz-warning-foreground` on `--dz-warning` (shade 500) measures **3.51:1** — below
  WCAG AA. A warning button therefore fills with shade 300 (8.44:1) and hovers to 400
  (5.87:1). The ramp affords no shade between 400 and 500, so a third, darker pressed
  step is not available at AA. The uniform fill set is `-solid` + `-solid-hover`; there
  is no `-solid-active` for any intent.

  **Behavior change.** `DzButton`, `DzToast` and `DzTabs` previously hovered solid
  `success` / `danger` / `info` fills with a `/90` alpha shortcut while `primary` used
  its designed `-hover` shade. All tones now hover to `--dz-{tone}-solid-hover` (the
  shade-600 step). This aligns them with `primary` and puts every hover fill under the
  contrast gate, which the alpha shortcut escaped.

  **`-active` reclassified.** `--dz-{intent}-active` is documented as a pressed _surface_
  color, not a text-bearing fill: no component puts `{intent}-foreground` on it, and
  `--dz-warning-active` could not carry it legibly. The contrast gate no longer asserts
  that pair (94 → 84 pairs), because it was gating a combination nothing renders.

  **Special cases removed:** `buildContrastPairs()` in `@dzup-ui/tooling`, the solid and
  outline compound variants across 15 `*.variants.ts` / `*.tokens.ts` files, and the
  `story-color-tokens` codemod all now loop over intents with no branch.

## 0.1.0 (2026-05-03)

### Minor Changes

- ddd50b7: Canonicalize sidebar color tokens and add the missing `--dz-appshell-sidebar-width` definition.
  - New canonical token names: `--dz-sidebar-foreground`, `--dz-sidebar-foreground-hover`, `--dz-sidebar-heading`, `--dz-sidebar-header-bg`, `--dz-sidebar-footer-bg`. These already existed at the semantic tier; they are now also emitted at the component default tier, fixing the cascade collision that prevented `@datazup/dzup-theme` and similar brand presets from cleanly overriding sidebar paint.
  - `--dz-sidebar-text` and `--dz-sidebar-text-hover` are kept as deprecated aliases that resolve to the canonical names. They will be removed in the next major.
  - `--dz-sidebar-section-title-color` now resolves through `--dz-sidebar-heading` instead of `--dz-muted-foreground` directly. Apps that override the heading token will see the change reflected in section titles automatically.
  - New token `--dz-appshell-sidebar-width: var(--dz-sidebar-width)` — fixes a four-week-old orphan: `DzAppShell.variants.ts` reads this token but no source file defined it. With this fix the existing `DzAppShell` `sidebarWidth` prop has the correct token plumbing for downstream variant rewrites.

  No existing component variants change in this release. Variant rewrites that consume the canonical names ship in a follow-up minor (Phase 2 / Phase 3 of the shell improvement plan in `apps/website-app/docs/analysis/dzup-ui-shell-improvement-pm-plan-2026-04-29.md`).

## 0.1.0-alpha.0 (2026-04-02)

### Features

- Initial alpha release of dzup-ui design token system
- CSS custom properties with `--dz-*` namespace
- Light and dark theme support via `data-theme` attribute
- Tailwind CSS 4 integration via `@theme` directive
- Generated artifacts: tokens.css, tokens.d.ts, tailwind-theme.js
- Token categories: colors, spacing, radius, shadows, typography, transitions
- Semantic color tokens (primary, success, warning, danger, info)
- Component-level token overrides
