# @dzup-ui/core

Foundational Vue 3 components for `dzup-ui`.

## What This Package Contains

- components across buttons, inputs, forms, layout, navigation, overlays, feedback, data, media, and typography
- shared interaction utilities for semantic focus and disabled behavior
- token-driven styling built on `@dzup-ui/tokens`

## Interaction Contract

The component library uses semantic interaction roles instead of per-component focus and disabled styling drift:

- `button` for explicit actions
- `control` for navigation, selection, toggles, and interactive surfaces
- `input` for direct text entry
- `input-shell` for composite fields that wrap nested inputs

The implementation details and utility classes are documented in [`src/styles/INTERACTION_CONTRACT.md`](./src/styles/INTERACTION_CONTRACT.md).

## Theming

`@dzup-ui/core` exports three theming primitives from `@dzup-ui/core/providers`:

| Export | Purpose |
|---|---|
| `DzThemeProvider` | Vue component that provides theme context to the tree |
| `themeScript` | Inline JS string to inject in `<head>` for FOUC prevention (ADR-15) |
| `getThemeScript(options)` | Factory for a customised FOUC script |
| `useTheme()` | Composable to read and change the current theme |

### Canonical 3-line setup

**Step 1 — inject the FOUC script in `<head>` before any styles:**

```html
<!-- index.html -->
<head>
  <script>{{ themeScript }}</script>
  <!-- or paste the themeScript string directly — see @dzup-ui/core/providers -->
</head>
```

**Step 2 — wrap your root component in `<DzThemeProvider>`:**

```vue
<!-- App.vue -->
<script setup lang="ts">
import { DzThemeProvider } from '@dzup-ui/core/providers'
</script>

<template>
  <DzThemeProvider default-theme="system">
    <RouterView />
  </DzThemeProvider>
</template>
```

**Step 3 — read or change the theme in any descendant:**

```vue
<script setup lang="ts">
import { useTheme } from '@dzup-ui/core/providers'

const { resolvedTheme, toggleTheme } = useTheme()
</script>

<template>
  <button @click="toggleTheme">
    Now: {{ resolvedTheme }}
  </button>
</template>
```

### DzThemeProvider props

| Prop | Type | Default | Description |
|---|---|---|---|
| `defaultTheme` | `'light' \| 'dark' \| 'system'` | `'system'` | Initial theme when no persisted value exists. SSR always resolves to light; `themeScript` corrects on hydration. |
| `storageKey` | `string` | `'dz-theme'` | localStorage key for persistence |
| `attribute` | `string` | `'data-theme'` | HTML attribute written to `<html>` |
| `disableTransitionOnChange` | `boolean` | `true` | Suppress colour-flash during theme switches |

### useTheme options

```ts
// Default: throws if no DzThemeProvider ancestor
const { resolvedTheme } = useTheme()

// Optional: returns a no-op sentinel instead of throwing (useful in SSR layouts)
const { resolvedTheme } = useTheme({ optional: true })
```

### How dark mode works

Tokens are delivered by `@dzup-ui/tokens/css` as CSS variables under `:root` (light) and `[data-theme="dark"]` (dark). `DzThemeProvider` sets the `data-theme` attribute on `<html>` — that is the entire "engine". No runtime JS variable injection.

See `@dzup-ui/tokens` [README](../tokens/README.md) for the dark-mode resolution order and the `prefers-color-scheme` asymmetry note.

## Vue compatibility, including Vapor mode

`@dzup-ui/core` is a **virtual-DOM** component library. Every component is an
ordinary vDOM SFC and **none of them is compiled in Vapor mode** — nor is that
planned. The declared peer range is stated in the generated block below rather
than here, so it cannot drift from `package.json`.

**That does not stop you using dzup-ui in a Vapor application.** Vue 3.6 ships
`vaporInteropPlugin`, which lets a Vapor component render a vDOM child. Install
it on your app and dzup-ui components work inside Vapor components:

```ts
import { createVaporApp, vaporInteropPlugin } from 'vue'
import App from './App.vue'

createVaporApp(App)
  .use(vaporInteropPlugin) // ← lets Vapor components render vDOM children
  .mount('#app')
```

### What backs this claim

A compatibility statement is worth what its evidence is worth, so this paragraph
is **generated** — from the peer range this package declares, from the version
the forward-compatibility lane pins, and from whether the spec that tests the
claim still exists. Delete the spec and this block says the claim is unbacked
and `yarn validate:readme-facts` fails, rather than the README going on
claiming it.

<!-- facts:vapor:start -->

Backed by [`packages/core/tests/vapor-interop.spec.ts`](../../packages/core/tests/vapor-interop.spec.ts), run by `yarn test:vue-next:vapor`. It mounts a real Vapor application, installs the plugin, renders `DzButton` inside it, and asserts the rendered `<button>` and its `data-tone` attribute. On a Vue without Vapor it reports **unverified by name** rather than passing — an unrun check and a passing check must not look the same.

The forward-compatibility lane pins **`vue@3.6.0-rc.6`** (`rc` channel), which is **not** the version this library is built and tested against — the declared peer range is `vue@^3.5.0`. The lane is advisory until Vue 3.6 is stable.

<!-- facts:vapor:end -->

**Not covered by that run:** Vapor SSR and hydration; the reverse direction (a
vDOM parent rendering a Vapor child); any component other than `DzButton`; and
any Vue 3.6 **stable** release. See
`docs/program-2026-09/reports/N5-03-toolchain-migration-memo.md` §5 for the
trigger that promotes the lane from advisory to blocking.

## Package Entry Points

- `@dzup-ui/core` — all components and composables
- `@dzup-ui/core/providers` — `DzThemeProvider`, `useTheme`, `themeScript`
- `@dzup-ui/core/styles` — component CSS
- `@dzup-ui/core/resolver` — Tailwind resolver

## Repo Docs

See the workspace [README](../../README.md) for installation, package overview, and development commands.
