# dzup-ui

<!-- claims:generated:start -->
**Open-source Vue 3 component library — 206 catalog components, including 138 with dedicated Storybook pages.**

> dzup-ui Pro 0.1.0-alpha.0 publishes 78 enterprise components across 8 families. Its built Storybook contains 630 stories; 57 exported components have dedicated documentation pages, while compound parts are documented through their parent.

Counting rules: Core “catalog components” counts every exported `.vue` component, including compound sub-parts; Core and Pro “dedicated documentation pages” count components with their own Storybook docs entry. Pro “published components” counts public exports from the Pro family barrels.
<!-- claims:generated:end -->

<!-- Badges must RENDER (TASK-FREE-11): npm-backed badges (version, downloads,
     bundlephobia) show shields' "not found" placeholder while @dzup-ui/core is
     unpublished — re-add them with the first npm publish. -->
![GitHub stars](https://img.shields.io/github/stars/datazup/dzup-ui?label=stars)
![build status](https://img.shields.io/github/actions/workflow/status/datazup/dzup-ui/ci.yml?branch=main)
![Core Web Vitals](https://img.shields.io/badge/Core%20Web%20Vitals-LCP%3C2.5s%20%C2%B7%20CLS%3C0.1-6366f1)
![license](https://img.shields.io/badge/license-MIT-green)

> Looking for enterprise workflows? **dzup-ui Pro** is commercially licensed and
> uses the same Core token and accessibility contract. The public `/pro` page is
> generated from a safe snapshot of the Pro inventory and Storybook build.

## Features

- A generated Core inventory across 11 component families
- TypeScript strict mode with zero `any` types and full type inference
- Tailwind CSS 4 design token system with light/dark/system theming
- Reka UI headless primitives for accessible interactive components
- WCAG AA accessibility with keyboard navigation and ARIA support
- SSR-safe, ESM-only distribution with tree-shaking support

## Performance

The landing site is held to a performance budget in CI (`landing-perf` job):

- **Core Web Vitals** — Lighthouse CI asserts **LCP < 2.5s** and **CLS < 0.1** on
  every push (desktop preset, median of 3 runs), with advisory warnings on the
  performance/accessibility scores, TBT and FCP. The full report uploads to
  temporary public storage and as a run artifact.
- **Bundle budget** — a gzip payload budget on the first-paint JS/CSS
  (`apps/landing/scripts/check-bundle-budget.ts`) keeps the initial load lean and
  fails the build on a large regression. Vendor code (Vue runtime, icons) is split
  into long-cached chunks (`apps/landing/vite.config.ts`).

See [`apps/landing/lighthouserc.json`](apps/landing/lighthouserc.json) for the
thresholds and the `/compare` page for how dzup-ui lines up against peer libraries.

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
| [`@dzup-ui/core`](./packages/core) | 0.1.0-alpha.0 | Foundational components for buttons, inputs, forms, layout, navigation, overlays, feedback, data, media, and typography |
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
- [`workspace-docs/repos/dzup-ui/docs/adr/ADR-17-token-source-of-truth-and-component-token-ownership.md`](workspace-docs/repos/dzup-ui/docs/adr/ADR-17-token-source-of-truth-and-component-token-ownership.md)
- [`MAPPING_TOKENS.md`](./MAPPING_TOKENS.md) explains how app `DESIGN.md` or generated design-extraction tokens map into dzup-ui primitive, semantic, and component token tiers.
- [`DESIGN_MD_APPLICATION_PROMPT.md`](./DESIGN_MD_APPLICATION_PROMPT.md) provides a reusable LLM prompt for applying an app `DESIGN.md` to a Vue app that already uses dzup-ui.

## Enterprise Components

Need Kanban, Gantt, FormBuilder, DashboardBuilder, WorkflowDesigner, and more?
**dzup-ui Pro** is distributed under a commercial license. The site's `/pro`
page reports the current generated inventory, demonstrates the Core/Pro boundary,
and provides the access path for the integrated Showcase and Pro Storybook.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow and guidelines.

## Migration

Upgrading from old `dzup-ui`? See [`@dzup-ui/compat`](./packages/compat) and [`@dzup-ui/codemods`](./packages/codemods).

These are migration-layer packages, not part of the core design-system foundation.

## License

MIT — see [LICENSE](./LICENSE) for details.
