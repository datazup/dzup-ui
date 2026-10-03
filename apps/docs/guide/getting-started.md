---
title: Getting started
description: Install dzup-ui, wire up the design tokens, and render your first component.
---

# Getting started

**dzup-ui** is a contract-first Vue 3 component library styled with Tailwind CSS 4
and a three-tier design-token system.

::: info Where these snippets come from
The Vite stylesheet below is executed from packed packages by
`yarn test:csp:packed`, which checks computed Button/Input styles in Chromium.
The Nuxt configuration below is marked with a `fixture:` comment
and is compared byte for byte against a fixture that CI installs from a packed
tarball and builds — `yarn validate:doc-snippets` fails if this page and that
fixture drift apart. Install documentation that nothing executes drifts, and this
repository has paid that bill twice.
:::

## Install

```bash
yarn add @dzup-ui/core @dzup-ui/tokens vue@^3.5.0 reka-ui@^2.0.0
yarn add -D tailwindcss@^4 @tailwindcss/vite@^4
```

`@dzup-ui/core` depends on `@dzup-ui/tokens` (design tokens) and
`@dzup-ui/contracts` (types only, zero runtime) — that is the whole dependency
graph, and yarn/npm will pull both in for you. Vue and Reka UI are peers.

## Generate the component utilities

Components use Tailwind CSS 4 utility classes backed by design tokens.
`@dzup-ui/core/styles` contains shared base rules; it does **not** contain the
generated utilities. Importing tokens alone leaves components unstyled.
For an existing Vue/Vite app, enable Tailwind's Vite plugin alongside Vue:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
})
```

Create **`src/style.css`** with these imports, then your app's styles:

```css
@import "tailwindcss";
@import "@dzup-ui/tokens/css";
@import "@dzup-ui/core/styles";
@source "../node_modules/@dzup-ui/core/dist";
```

Tailwind excludes `node_modules` from automatic detection. The explicit
`@source` scans the installed Core package, including classes in compiled
components and variants. Its path is relative to this stylesheet; adjust it
if your stylesheet lives elsewhere. Import the stylesheet once at the entry:

```ts
// src/main.ts
import './style.css'
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
injects the FOUC-prevention theme script (ADR-15). It does not generate Tailwind
utilities: configure your Nuxt app's Tailwind 4 integration and scan the installed
Core dist as above, adjusting `@source` relative to your app stylesheet.

## Vite auto-imports

For a plain Vite app, `DzResolver` teaches
[unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components)
which names this library owns. It answers from generated ownership data by exact
name, so a component it does not own resolves to nothing rather than to a guess:

Keep the Vue and Tailwind plugins from the styling setup when adding this plugin.

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
