# @dzup-ui/core

## 0.2.0 (2026-08-10)

### Minor Changes

- ca9c390: Add `DzEmoji` — an accessible emoji primitive in the **media** family.

  Renders an emoji glyph with a consistent type-scale (`xs`–`xl`) and correct
  screen-reader semantics: decorative by default (`aria-hidden="true"`), or
  meaningful (`role="img"` + `aria-label`) when a `label` is provided. Solves the
  inconsistent announcement of raw emoji characters across assistive tech.

- New `DzPageHero` layout component + `.dz-prose` rich-content styles.

  **DzPageHero** — dark gradient hero band for top-level views (eyebrow,
  gradient h1, description, meta row, glass-treated actions cluster), extracted
  from docs-app's `DocsPageHero` so every app on the neural-indigo preset can
  share the band. Styling keys off the new `PAGE_HERO_TOKENS`
  (`--dz-page-hero-*`) in `@dzup-ui/tokens`, with `--dz-auth-brand-*` fallbacks.

  **.dz-prose** — typography for rendered rich content (markdown → sanitized
  HTML), ported from docs-app's `.docs-prose` and shipped unlayered in
  `dist/core.css` via base.css.

- 573f2ae: Add a shared portal-placement contract and expose it on `DzDialogContent`,
  `DzConfirmDialog`, `DzSheetContent`, `DzPopoverContent`, `DzTooltipContent`,
  `DzDropdownMenuContent`, `DzContextMenuContent`, `DzSelect`, `DzMultiSelect`,
  `DzCombobox`, `DzCommandPalette`, and `DzLightbox`. Dialog content now identifies and
  supports customizing its single owned overlay, while production portal defaults
  remain unchanged.

  Publish `@dzup-ui/testing` with guarded DOM test-environment support so
  consumers can mount real Reka-backed components instead of replacing portals or
  design-system components with stubs.

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

### Patch Changes

- 64359ea: Repair form-control semantics in `DzDatePicker`, `DzTimePicker`, and `DzTransfer`.
  - `DzDatePicker` now forwards required state to Reka's native form input instead
    of placing an unsupported `aria-required` attribute on a `role="group"`.
  - `DzTimePicker` exposes its trigger as a combobox and renders its clear action
    as a sibling control, avoiding nested interactive content while preserving
    focus after clearing.
  - `DzTransfer` now owns its options with labelled multiselect listboxes and uses
    keyboard-operable options with a non-interactive visual selection indicator.

  The landing catalog's light/dark accessibility audit now certifies every block,
  so the two resolved debt exceptions and their unbacked trust-mark fallback are
  removed.

- 6c5f522: Fix `DzCodeBlock`'s language chip failing WCAG AA.

  The chip (`bash`, `vue`, …) inherited the header's `--dz-muted-foreground` and sat
  on a 10%-opacity `--dz-foreground` fill, measuring **3.64:1** — below the 4.5:1
  required for text. It carries real information, so it now takes the full
  `--dz-foreground` colour, and the pair passes.

  Found with an axe pass over the landing hero, which renders two code blocks above
  the fold. `yarn validate:tokens` does not catch this: the `intent-text-contrast`
  gate is scoped to `--dz-{intent}` text on `{intent}-muted` fills, and this pair is
  neither.

- 6c5f522: Fix `DzDropdownMenu`'s `defaultOpen` prop, which was declared but had no effect.

  Two defects, both required for an uncontrolled menu to open on mount:
  - `defaultOpen` was never forwarded to Reka's `DropdownMenuRoot`.
  - `defineModel<boolean | undefined>('open')` declared `open` as a **Boolean** prop
    with no default, so Vue boolean-cast the unbound value to `false`. Reka read that
    as "controlled, and closed", which pinned the menu shut and made `defaultOpen`
    unreachable even once forwarded. The model now declares `default: undefined`, so
    `open` stays undefined until a consumer binds `v-model:open`.

  Click-to-open was unaffected (the local `defineModel` fed the new value back), so
  this only changes menus that relied on `defaultOpen`, which previously could not
  open at all. `DzDropdownMenuProps` doc comments were also corrected — `modal` was
  described as "controlled open state".

- d3047a8: Fix export targets that the build never emitted.

  `package.json` declared `"./styles": "./dist/core.css"`, and the README told consumers to
  `@import "@dzup-ui/core/styles"` — but no build step ever produced a CSS file, so the import
  failed to resolve for anyone installing the package. `src/index.ts` now side-effect-imports
  `./styles/base.css` and the Vite lib build pins the extracted asset to `dist/core.css`
  (`build.lib.cssFileName`). The JS entry itself stays CSS-free, so `./styles` remains opt-in and
  safe to import under SSR.

  The same class of bug hit every per-family subpath: `./buttons`, `./cards`, `./data`,
  `./feedback`, `./forms`, `./inputs`, `./layout`, `./media`, `./navigation`, `./overlays`,
  `./typography` and `./providers` all shipped an `index.d.ts` with no `index.js` beside it —
  Rollup inlines re-export-only barrels under `preserveModules`, so no chunk was emitted and the
  subpath resolved to nothing. Each barrel is now an explicit build entry.

  `yarn validate:exports` now asserts that **every** target in an `exports` map exists on disk,
  including plain-string and non-JS (`.css`/`.json`) targets, which it previously never walked.

- f794441: Give standalone time-picker combobox triggers an accessible name derived from their placeholder while preserving explicit ARIA and form-field labelling.
- df5ba54: Fix `DzPageHero` title gradient rendering as a solid bar: use `background-image`
  instead of the `background` shorthand, which reset `background-clip` to
  `border-box` and defeated `bg-clip-text` in consumer builds.
- Updated dependencies
- Updated dependencies [573f2ae]
- Updated dependencies [de9cc6f]
- Updated dependencies [6c5f522]
  - @dzup-ui/tokens@0.2.0
  - @dzup-ui/contracts@0.1.0

## 0.1.0 (2026-05-03)

### Minor Changes

- ddd50b7: Canonicalize sidebar color tokens and add the missing `--dz-appshell-sidebar-width` definition.
  - New canonical token names: `--dz-sidebar-foreground`, `--dz-sidebar-foreground-hover`, `--dz-sidebar-heading`, `--dz-sidebar-header-bg`, `--dz-sidebar-footer-bg`. These already existed at the semantic tier; they are now also emitted at the component default tier, fixing the cascade collision that prevented `@datazup/dzup-theme` and similar brand presets from cleanly overriding sidebar paint.
  - `--dz-sidebar-text` and `--dz-sidebar-text-hover` are kept as deprecated aliases that resolve to the canonical names. They will be removed in the next major.
  - `--dz-sidebar-section-title-color` now resolves through `--dz-sidebar-heading` instead of `--dz-muted-foreground` directly. Apps that override the heading token will see the change reflected in section titles automatically.
  - New token `--dz-appshell-sidebar-width: var(--dz-sidebar-width)` — fixes a four-week-old orphan: `DzAppShell.variants.ts` reads this token but no source file defined it. With this fix the existing `DzAppShell` `sidebarWidth` prop has the correct token plumbing for downstream variant rewrites.

  No existing component variants change in this release. Variant rewrites that consume the canonical names ship in a follow-up minor (Phase 2 / Phase 3 of the shell improvement plan in `apps/website-app/docs/analysis/dzup-ui-shell-improvement-pm-plan-2026-04-29.md`).

### Patch Changes

- f17af15: Add Storybook play() interaction assertions to overlay, navigation, and form stories.
  - `DzDropdownMenu` — Interactive + Accessibility stories: open/select/dismiss and aria-disabled verification
  - `DzContextMenu` — Accessibility story: right-click open, aria-disabled check, Escape dismiss
  - `DzDialogParts` — Default + Accessibility stories: portal open/close, aria-modal, aria-labelledby/describedby, focus return on Escape
  - `DzTabsParts` — Default + Accessibility stories: tab activation, panel swap, roving tabindex, ArrowRight navigation, disabled trigger aria-disabled
  - `DzSwitch` — Interactive + Accessibility stories: click toggle (aria-checked), Space key, Tab focus movement
  - `DzCheckboxGroup` — Interactive + Accessibility stories: multi-select, toggle off, Space key, Tab focus independence
  - `DzRadioGroup` — Interactive + Accessibility stories: exclusive selection, ArrowDown roving tabindex

- Updated dependencies [ddd50b7]
  - @dzup-ui/tokens@0.1.0

## 0.1.0-alpha.1 (2026-04-03)

### Features

- Keyboard navigation composables for Calendar, Gantt, Kanban, Diagram components
- File size extractions: DzDiagramEditor, DzTreeMap, useWorkflowDesigner decomposed
- Contributing guide (CONTRIBUTING.md)
- Playwright E2E test setup with visual regression and keyboard navigation tests
- Performance benchmarks for DataGrid, Accordion, Tabs
- Tree-shaking validation script
- Bundle size budget enforcement with CI integration
- Consumer integration test app validating DX

### Migration

- 3 new compat adapters: DzTabsCompat, DzCheckboxCompat, DzRadioCompat
- 3 more compat adapters: DzSwitchCompat, DzAccordionCompat, DzTooltipCompat (11 total)
- 2 new codemods: rename-slots, rename-components (5 total)
- extractTemplate() bugfix: handles nested `<template #slot>` correctly

### Accessibility

- axe-core accessibility tests for complex components
- DzChartDataTable: screen reader data table for Chart.js visualizations

## 0.1.0-alpha.0 (2026-04-02)

### Features

- Initial alpha release of dzup-ui core component library
- 11 component families: buttons, cards, data, feedback, forms, inputs, layout, media, navigation, overlays, typography
- 146 Vue 3 components with TypeScript strict mode
- Tailwind CSS 4 integration with design token system
- Reka UI headless primitives for interactive components (Dialog, Select, Tabs, Menu, etc.)
- tailwind-variants (tv) for type-safe variant styling
- Full v-model support via defineModel() (Vue 3.4+)
- WCAG AA accessibility compliance with ARIA attributes and keyboard navigation
- SSR-safe components (onMounted for DOM access)
- Contract Spec v1 compliance for all public APIs
- 2300+ unit and contract tests
