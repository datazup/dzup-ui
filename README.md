# dzup-ui

**Open-source Vue 3 component library — 147 foundational components.**

![npm version](https://img.shields.io/npm/v/@dzup-ui/core?label=%40dzup-ui%2Fcore)
![build status](https://img.shields.io/github/actions/workflow/status/datazup/dzup-ui/ci.yml?branch=main)
![license](https://img.shields.io/badge/license-MIT-green)

> Looking for enterprise components? See [@dzup-ui/pro](https://github.com/datazup/dzup-ui-pro).

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
| [`@dzup-ui/tokens`](./packages/tokens) | 0.1.0-alpha.0 | Design tokens — CSS custom properties, Tailwind theme, TypeScript definitions |
| [`@dzup-ui/contracts`](./packages/contracts) | 0.1.0-alpha.0 | Canonical public API contract types (props, events, slots) |
| [`@dzup-ui/compat`](./packages/compat) | 0.0.1 | Optional migration adapters from old dzup-ui to vNext |
| [`@dzup-ui/codemods`](./packages/codemods) | 0.0.1 | Optional migration transforms and CLI tooling (`dzup-codemod`) |
| [`@dzup-ui/nuxt`](./packages/nuxt) | 0.1.0-alpha.0 | Optional Nuxt 3 integration module for auto-importing Dz* components |

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

## Design System Architecture

The core library uses semantic interaction contracts instead of per-component focus and disabled styling drift:

- `button` semantics for explicit actions
- `control` semantics for navigation, selection, toggles, and interactive surfaces
- `input` semantics for direct text entry
- `input-shell` semantics for composite fields that wrap nested inputs

The implementation rules and utility classes live in [`packages/core/src/styles/INTERACTION_CONTRACT.md`](./packages/core/src/styles/INTERACTION_CONTRACT.md).

Token ownership follows a hybrid model:

- `@dzup-ui/tokens` is canonical for primitives, semantic tokens, and shared token families
- component-local `*.tokens.ts` files in `core` and `pro` are component adaptation layers built on top of that foundation

Reference:
- [`docs/adr/ADR-17-token-source-of-truth-and-component-token-ownership.md`](./docs/adr/ADR-17-token-source-of-truth-and-component-token-ownership.md)

## Enterprise Components

Need Kanban, Gantt, FormBuilder, DashboardBuilder, WorkflowDesigner, and more?
See **[@dzup-ui/pro](https://github.com/datazup/dzup-ui-pro)** — 40 enterprise components available under a commercial license.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow and guidelines.

## Migration

Upgrading from old `dzup-ui`? See [`@dzup-ui/compat`](./packages/compat) and [`@dzup-ui/codemods`](./packages/codemods).

These are migration-layer packages, not part of the core design-system foundation.

## License

MIT — see [LICENSE](./LICENSE) for details.
