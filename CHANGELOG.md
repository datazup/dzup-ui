# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-alpha.0] - 2026-03-28

Initial alpha release of dzup-ui vNext — a greenfield Vue 3 component library
rebuilt from scratch with Contract Spec v1, typed injection keys, ESM-only
distribution, and OKLCH design tokens.

### Added

#### Packages

- **@dzup-ui/core** (v0.1.0-alpha.0) — 146 foundational components across 11 families
- **@dzup-ui/pro** (v0.1.0-alpha.0) — 40 enterprise components across 8 families
- **@dzup-ui/tokens** (v0.1.0-alpha.0) — OKLCH design token system with Tailwind CSS 4
- **@dzup-ui/contracts** — Canonical public API type contracts
- **@dzup-ui/tooling** — Import boundary validator, token compliance checker, manifest generator
- **@dzup-ui/compat** — Migration adapters (old to new)
- **@dzup-ui/codemods** — Code transforms for migration

#### Core Components (146 across 11 families)

| Family | Count | Key Components |
|--------|-------|----------------|
| buttons | 7 | DzButton, DzIconButton, DzButtonGroup, DzSplitButton, DzFAB, DzSpeedDial |
| cards | 6 | DzCard, DzCardHeader, DzCardBody, DzCardFooter, DzStatCard, DzImageCard |
| data | 21 | DzDataGrid, DzTable, DzList, DzAccordion, DzTimeline, DzTree |
| feedback | 11 | DzAlert, DzBadge, DzProgress, DzSpinner, DzToast, DzNotification |
| forms | 20 | DzSelect, DzCheckbox, DzRadio, DzSwitch, DzDatePicker, DzMultiSelect, DzFileUpload |
| inputs | 7 | DzInput, DzTextarea, DzNumberField, DzOtpInput, DzSearchBox |
| layout | 15 | DzContainer, DzGrid, DzFlex, DzDivider, DzResizable, DzSplitter |
| media | 10 | DzAvatar, DzImage, DzCarousel, DzLightbox |
| navigation | 14 | DzTabs, DzBreadcrumb, DzPagination, DzMenu, DzStepper, DzSidebar |
| overlays | 30 | DzDialog, DzTooltip, DzPopover, DzDropdown, DzContextMenu, DzSheet |
| typography | 5 | DzHeading, DzText, DzCode, DzBlockquote |

#### Pro Components (40 across 8 families)

| Family | Count | Key Components |
|--------|-------|----------------|
| builders | 5 | DzFormBuilder, DzDashboardBuilder |
| business | 3 | DzAuditLog, DzComplianceTracker, DzInvoiceGenerator |
| communication | 5 | DzChat, DzComments |
| data-pro | 5 | DzPivotTable, DzFilterBuilder |
| editors | 4 | DzCodeEditor, DzRichTextEditor |
| planning | 10 | DzGanttChart, DzCalendar, DzScheduler, DzKanban |
| visualization | 4 | Charts, diagrams |
| workflow | 4 | DzWorkflowDesigner |

#### Composables

- **Core**: `useCollapse`, `useDataGrid`, `useDatePicker`, `useFormField`, `useToast`
- **Pro**: `useCalendar`, `useDashboardBuilder`, `useDataGridPro`, `useFilterBuilder`, `useFormBuilder`, `useGantt`, `useKanban`, `useScheduler`, `useWorkflowDesigner`

#### Design Tokens

- OKLCH color space with semantic aliases (light/dark themes)
- Tailwind CSS 4 integration via `@theme` directive
- CSS custom properties: `--dz-{category}-{element}-{property}`
- Token build artifacts committed (ADR-12)
- Theme persistence with localStorage + FOUC-preventing head script (ADR-15)

#### Architecture

- **Contract Spec v1**: All 186 components satisfy canonical prop groups (behavior, appearance, state, accessibility), typed events, and typed slots
- **Typed injection keys** (ADR-08): Compound component families use `InjectionKey<T>` with `DZ_{FAMILY}_KEY` naming
- **ESM-only** (ADR-11): No CJS output, `"type": "module"` everywhere
- **defineModel()** (ADR-16): All v-model components use `defineModel<T>()` — no manual prop+emit
- **Reka UI** (ADR-07): Headless primitives for Dialog, Select, Tabs, Menu, Combobox, Popover, Tooltip, Accordion
- **tailwind-variants (tv)**: Type-safe variant styling for all components
- **cn() merging** (ADR-10): Consumer class override on all components
- **Manifest-only exports** (ADR-01): Generated from `public-api.manifest.json`

#### Quality Infrastructure

- 227 test files, 2303 tests (all passing)
- 110 contract conformance specs
- 110 Storybook stories
- Import boundary validator (0 violations)
- Token compliance checker (0 raw color literals)
- ESLint with Vue/TypeScript rules (0 errors)
- vue-tsc typecheck (0 errors)
- CI pipeline (GitHub Actions): typecheck, lint, test, validate, build, storybook build, coverage

#### Tech Stack

- Vue 3.5+ with `<script setup lang="ts">`
- TypeScript 5.6+ (strict mode)
- Tailwind CSS 4
- Reka UI (headless primitives)
- @internationalized/date (date manipulation)
- @floating-ui/vue (positioning)
- @vue-dnd-kit/core (drag and drop)
- lucide-vue-next (icons)
- Vite (library mode build)
- Vitest (testing)
- Storybook 8.5 (documentation)
- Yarn 4 workspaces

### Package Sizes (npm pack)

| Package | Packed | Unpacked | Files |
|---------|--------|----------|-------|
| @dzup-ui/core | 200.6 kB | 1.3 MB | 803 |
| @dzup-ui/pro | 104.8 kB | 597.9 kB | 263 |
