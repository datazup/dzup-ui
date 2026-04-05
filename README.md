# dzip-ui

**Open-source Vue 3 component library — 147 foundational components.**

![npm version](https://img.shields.io/npm/v/@dzip-ui/core?label=%40dzip-ui%2Fcore)
![build status](https://img.shields.io/github/actions/workflow/status/datazup/dzip-ui/ci.yml?branch=main)
![license](https://img.shields.io/badge/license-MIT-green)

> Looking for enterprise components? See [@dzip-ui/pro](https://github.com/datazup/dzip-ui-pro).

## Features

- 147 Vue 3 components across 11 families
- TypeScript strict mode with zero `any` types and full type inference
- Tailwind CSS 4 design token system with light/dark/system theming
- Reka UI headless primitives for accessible interactive components
- WCAG AA accessibility with keyboard navigation and ARIA support
- SSR-safe, ESM-only distribution with tree-shaking support

## Quick Start

**1. Install packages**

```bash
yarn add @dzip-ui/core @dzip-ui/tokens vue@^3.5.0 reka-ui@^2.0.0
```

**2. Import styles**

```css
@import "@dzip-ui/tokens/css";
@import "@dzip-ui/core/styles";
```

**3. Use components**

```vue
<script setup lang="ts">
import { DzButton, DzInput, DzThemeProvider } from '@dzip-ui/core'
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
| [`@dzip-ui/core`](./packages/core) | 0.1.0-alpha.0 | 147 foundational components (buttons, inputs, forms, layout, navigation, overlays, feedback, data, media, typography) |
| [`@dzip-ui/tokens`](./packages/tokens) | 0.1.0-alpha.0 | Design tokens — CSS custom properties, Tailwind theme, TypeScript definitions |
| [`@dzip-ui/contracts`](./packages/contracts) | 0.1.0-alpha.0 | Canonical public API contract types (props, events, slots) |
| [`@dzip-ui/compat`](./packages/compat) | 0.0.1 | Migration adapters from old dzip-ui to vNext |
| [`@dzip-ui/codemods`](./packages/codemods) | 0.0.1 | Automated code transforms for migration (CLI: `dzup-codemod`) |
| [`@dzip-ui/nuxt`](./packages/nuxt) | 0.1.0-alpha.0 | Nuxt 3 module for auto-importing Dz* components |

## Component Families

Buttons · Cards · Inputs · Forms · Layout · Navigation · Overlays · Feedback · Data · Media · Typography

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
| Positioning | @floating-ui/vue |
| Testing | Vitest + Playwright |
| Bundler | Vite (library mode, ESM-only) |
| Monorepo | Yarn 4 workspaces |

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

## Enterprise Components

Need Kanban, Gantt, FormBuilder, DashboardBuilder, WorkflowDesigner, and more?
See **[@dzip-ui/pro](https://github.com/datazup/dzip-ui-pro)** — 40 enterprise components available under a commercial license.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow and guidelines.

## Migration

Upgrading from old `dzip-ui`? See [`@dzip-ui/compat`](./packages/compat) and [`@dzip-ui/codemods`](./packages/codemods).

## License

MIT — see [LICENSE](./LICENSE) for details.
