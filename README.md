# dzip-ui

**Enterprise-grade Vue 3 component library with 187+ components.**

![npm version](https://img.shields.io/npm/v/@dzup-ui/core?label=%40dzup-ui%2Fcore)
![build status](https://img.shields.io/github/actions/workflow/status/datazup/dzip-ui/ci.yml?branch=main)
![license](https://img.shields.io/badge/license-MIT%20%2F%20Commercial-blue)

## Features

- 187 Vue 3 components (147 core + 40 pro) across 19 families
- TypeScript strict mode with zero `any` types and full type inference
- Tailwind CSS 4 design token system with light/dark/system theming
- Reka UI headless primitives for accessible interactive components
- WCAG AA accessibility with keyboard navigation and ARIA support
- SSR-safe, ESM-only distribution with tree-shaking support
- 3,400+ tests (unit, contract, accessibility, SSR, E2E)

## Quick Start

**1. Install packages**

```bash
yarn add @dzup-ui/core @dzup-ui/tokens vue@^3.5.0 reka-ui@^2.0.0
```

**2. Import styles**

```css
@import "@dzup-ui/tokens/css";
@import "@dzup-ui/core/styles";
```

**3. Use components**

```vue
<script setup lang="ts">
import { DzButton, DzInput, DzThemeProvider } from '@dzup-ui/core'
import { ref } from 'vue'

const name = ref('')
</script>

<template>
  <DzThemeProvider default-theme="system">
    <DzInput v-model="name" placeholder="Enter your name" />
    <DzButton tone="primary" @click="submit">Submit</DzButton>
  </DzThemeProvider>
</template>
```

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`@dzup-ui/core`](./packages/core) | 0.1.0-alpha.0 | 147 foundational components (buttons, inputs, forms, layout, navigation, overlays, feedback, data, media, typography) |
| [`@dzup-ui/pro`](./packages/pro) | 0.1.0-alpha.0 | 40 enterprise components (Kanban, Gantt, FormBuilder, DashboardBuilder, WorkflowDesigner, and more) |
| [`@dzup-ui/tokens`](./packages/tokens) | 0.1.0-alpha.0 | Design tokens -- CSS custom properties, Tailwind theme, TypeScript definitions |
| [`@dzup-ui/contracts`](./packages/contracts) | 0.1.0-alpha.0 | Canonical public API contract types (props, events, slots) |
| [`@dzup-ui/compat`](./packages/compat) | 0.0.1 | Migration adapters from old dzup-ui to vNext (11 adapters) |
| [`@dzup-ui/codemods`](./packages/codemods) | 0.0.1 | Automated code transforms for migration (5 transforms + CLI) |

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vue 3.5+ with Composition API and `<script setup>` |
| Language | TypeScript 5.6+ (strict mode) |
| Styling | Tailwind CSS 4 with `@theme` directive |
| Variants | tailwind-variants (tv) for type-safe component styling |
| Primitives | Reka UI 2.x for headless interactive components |
| Icons | lucide-vue-next |
| Dates | @internationalized/date |
| Drag and Drop | @vue-dnd-kit/core |
| Positioning | @floating-ui/vue |
| Testing | Vitest + Playwright |
| Bundler | Vite (library mode, ESM-only) |
| Monorepo | Yarn workspaces |

## Core Component Families

Buttons, Cards, Inputs, Forms, Layout, Navigation, Overlays, Feedback, Data, Media, Typography

## Pro Component Families

Builders, Communication, Data Pro, Planning, Workflow, Business, Visualization, Editors

## Documentation

- [Getting Started](./docs/getting-started.md) -- installation, setup, and usage examples
- [Design Tokens](./packages/tokens/) -- available CSS variables and theming
- [Architecture](./docs/recreation_plan/) -- design decisions and component specs
- [Contributing](./CONTRIBUTING.md) -- development workflow and guidelines
- [Migration Guide](./packages/compat/) -- upgrading from dzup-ui to dzip-ui

## Development

```bash
# Install dependencies
yarn install

# Type check
yarn typecheck

# Lint
yarn lint

# Run tests
yarn test

# Build all packages
yarn build

# Start Storybook
yarn storybook
```

## License

- **@dzup-ui/core** and **@dzup-ui/tokens** are licensed under [MIT](./LICENSE).
- **@dzup-ui/pro** is available under a commercial license. Contact us for details.
