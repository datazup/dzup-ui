# `@dzup-ui/nuxt`

Nuxt 3 module for `@dzup-ui/core` — auto-imports all `Dz*` components and injects the FOUC-prevention theme script.

## Install

```bash
yarn add @dzup-ui/nuxt @dzup-ui/core @dzup-ui/tokens
```

## Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@dzup-ui/nuxt'],
  dzupUi: {
    // Optional: include @dzup-ui-pro/pro components (requires separate install)
    includePro: false,
    // Optional: rename Dz* prefix
    prefix: '',
  },
})
```

That's it. All `Dz*` components are now available globally without explicit imports.

## What the module does

1. Registers all `@dzup-ui/core` components (and optionally `@dzup-ui-pro/pro`) as global Nuxt auto-imports.
2. Injects the `themeScript` from `@dzup-ui/core/providers` into `<head>` before any styles for FOUC prevention (ADR-15). This reads `localStorage` and sets `data-theme` on `<html>` before first paint.

## Theming

Wrap your root layout in `<DzThemeProvider>`:

```vue
<!-- layouts/default.vue -->
<template>
  <DzThemeProvider default-theme="system" :persist="true">
    <slot />
  </DzThemeProvider>
</template>
```

See `@dzup-ui/core` [theming docs](../core/README.md#theming) for full details.
