# @dzup-ui/core

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
