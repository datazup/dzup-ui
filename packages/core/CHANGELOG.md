# @dzup-ui/core

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

- Initial alpha release of dzip-ui core component library
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
