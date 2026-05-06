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

## Package Entry Points

- `@dzup-ui/core` — all components and composables
- `@dzup-ui/core/providers` — `DzThemeProvider`, `useTheme`, `themeScript`
- `@dzup-ui/core/styles` — component CSS
- `@dzup-ui/core/resolver` — Tailwind resolver

## Repo Docs

See the workspace [README](../../README.md) for installation, package overview, and development commands.
