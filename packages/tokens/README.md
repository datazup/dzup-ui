# `@dzup-ui/tokens`

Design tokens for the dzup-ui component library — the single source of truth for all `--dz-*` CSS custom properties.

## Install

```bash
yarn add @dzup-ui/tokens
```

## Usage

### CSS variables (recommended)

```css
/* In your main stylesheet */
@import '@dzup-ui/tokens/css';
```

This emits all `--dz-*` CSS variables under `:root` for light mode and under `[data-theme="dark"]` for dark mode (plus a `prefers-color-scheme: dark` media-query fallback).

### Tailwind integration

```js
// tailwind.config.js
import { dzupTheme } from '@dzup-ui/tokens/tailwind'

export default {
  theme: { extend: dzupTheme },
}
```

### TypeScript token values

```ts
import { tokens } from '@dzup-ui/tokens'
// tokens.colors.primary[500] etc.
```

## Dark mode

Set `data-theme="dark"` on `<html>` to activate the dark-mode token set. Use `<DzThemeProvider>` from `@dzup-ui/core` to manage this automatically. See the [theming guide](../core/README.md#theming) for the full setup.

**Asymmetry note:** Light mode is the only theme explicitly pinned by attribute (`data-theme="light"`). If a user selects dark and then clears localStorage, the `data-theme` attribute disappears and the `prefers-color-scheme: dark` media query takes over — so dark "sticks" to the OS preference. This is intentional.
