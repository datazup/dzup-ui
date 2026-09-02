---
title: Getting started
description: Install dzup-ui, wire up the design tokens, and render your first component.
---

# Getting started

**dzup-ui** is a contract-first Vue 3 component library styled with Tailwind CSS 4
and a three-tier design-token system.

::: info Where these snippets come from
The install instructions on this page are the ones already validated elsewhere in
the repository. The Nuxt configuration below is marked with a `fixture:` comment
and is compared byte for byte against a fixture that CI installs from a packed
tarball and builds — `yarn validate:doc-snippets` fails if this page and that
fixture drift apart. Install documentation that nothing executes drifts, and this
repository has paid that bill twice.
:::

## Install

```bash
yarn add @dzup-ui/core @dzup-ui/tokens
```

`@dzup-ui/core` depends on `@dzup-ui/tokens` (design tokens) and
`@dzup-ui/contracts` (types only, zero runtime) — that is the whole dependency
graph, and yarn/npm will pull both in for you.

## Wire up tokens

Components read CSS variables (`var(--dz-*)`) emitted by the tokens package. Import
the token stylesheet once at your app entry, **before** your own styles:

```ts
// main.ts
import '@dzup-ui/tokens/css'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

## Use a component

```vue
<script setup lang="ts">
import { DzButton } from '@dzup-ui/core'
</script>

<template>
  <DzButton variant="solid" tone="primary" size="md">
    Save changes
  </DzButton>
</template>
```

Every component is a named export of `@dzup-ui/core`; its types come from
`@dzup-ui/contracts`. The per-component pages list the entry points each one is
reachable through.

## Nuxt

`@dzup-ui/nuxt` registers every component as a global auto-import, so templates
need no import statement at all:

```bash
yarn add @dzup-ui/nuxt @dzup-ui/core @dzup-ui/tokens
```

<!-- fixture: packages/nuxt/test/fixtures/core-only/nuxt.config.ts -->

```ts
export default defineNuxtConfig({
  modules: ['@dzup-ui/nuxt'],
})
```

The module also pushes the token stylesheet before the component stylesheet and
injects the FOUC-prevention theme script (ADR-15).

## Vite auto-imports

For a plain Vite app, `DzResolver` teaches
[unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components)
which names this library owns. It answers from generated ownership data by exact
name, so a component it does not own resolves to nothing rather than to a guess:

```ts
// vite.config.ts
import { DzResolver } from '@dzup-ui/core/resolver'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [Components({ resolvers: [DzResolver()] })],
})
```

## Theme switching

Dark mode keys off `[data-theme="dark"]` on an ancestor element. Set it on
`<html>` (or any wrapper) to opt a subtree into dark mode. See
[Design tokens](./tokens) for how the cascade is built.

## Next

- [Browse the components](/components/) — one page per public component, with
  generated API tables.
- [The styling contract](./styling-contract) — what you are allowed to rely on
  when you restyle a component.
- [For AI agents](./agents) — the machine-readable surfaces this library ships.
