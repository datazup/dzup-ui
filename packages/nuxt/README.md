# `@dzup-ui/nuxt`

Nuxt 3 module for `@dzup-ui/core` — auto-imports every component and injects the
FOUC-prevention theme script.

Every configuration snippet below is copied from a fixture under
`packages/nuxt/test/fixtures/`, and `yarn validate:doc-snippets` fails if the two
diverge. The fixtures are installed from packed tarballs and built by
`yarn test:nuxt-fixtures`, so this page cannot advertise a path that does not
build.

## Install

```bash
yarn add @dzup-ui/nuxt @dzup-ui/core @dzup-ui/tokens
```

`reka-ui` and `vue` are peer dependencies of `@dzup-ui/core`. npm 7+ and yarn
install them for you; if you manage peers yourself, add
`vue@^3.5.0 reka-ui@^2.0.0`.

## Core only

<!-- fixture: packages/nuxt/test/fixtures/core-only/nuxt.config.ts -->

```ts
export default defineNuxtConfig({
  modules: ['@dzup-ui/nuxt'],
})
```

That is the whole setup. Every component is now available globally without an
import statement:

<!-- fixture: packages/nuxt/test/fixtures/core-only/app.vue -->

```vue
<template>
  <div>
    <!-- Auto-imported: no import statement anywhere in this fixture. -->
    <DzButton data-testid="core-button">
      Core only
    </DzButton>
  </div>
</template>
```

## Core + Pro

<!-- fixture: packages/nuxt/test/fixtures/core-pro/nuxt.config.ts -->

```ts
export default defineNuxtConfig({
  modules: ['@dzup-ui/nuxt'],
  dzupUi: {
    includePro: true,
  },
})
```

`includePro` additionally registers the components of `@dzup-ui-pro/pro`, which
is commercially licensed and installed separately.

> **`@dzup-ui-pro/pro` is not published yet.** Until it is, `includePro: true`
> registers nothing and tells you so (below).
>
> <!-- retired-name-ok: the migration note has to name the package it replaces. -->
> Until 2026-08-20 this module named the package `@dzup-ui/pro`, which has never
> existed under any publication plan; if you have that name written down
> anywhere, it was never installable.

### When Pro is missing

The build does **not** fail. The module logs one line and continues with Core:

```text
[@dzup-ui/nuxt] includePro is true, but "@dzup-ui-pro/pro" cannot be resolved
from this project. Install it (yarn add @dzup-ui-pro/pro) or set
dzupUi.includePro to false. Continuing with Core components only.
```

A half-configured option should not cost you your application, and a cryptic
bundler resolution error naming a package you never typed is not a diagnosis.
The `pro-missing` fixture asserts both the successful build and the exact
message.

## Renaming the `Dz` prefix

<!-- fixture: packages/nuxt/test/fixtures/custom-prefix/nuxt.config.ts -->

```ts
export default defineNuxtConfig({
  modules: ['@dzup-ui/nuxt'],
  dzupUi: {
    prefix: 'X',
  },
})
```

`<DzButton>` becomes `<XButton>`:

<!-- fixture: packages/nuxt/test/fixtures/custom-prefix/app.vue -->

```vue
<template>
  <div>
    <!-- `prefix: 'X'` renames the tag; the import still names DzButton. -->
    <XButton data-testid="prefixed-button">
      Prefixed
    </XButton>
  </div>
</template>
```

The prefix renames the **tag**, never the ownership: the generated import still
names the real export from the package that owns it. Components whose export
name does not carry the `Dz` prefix are registered unchanged.

## CSS order

The module pushes two stylesheets, in this order:

1. `@dzup-ui/tokens/css` — declares every `--dz-*` custom property;
2. `@dzup-ui/core/styles` — the component styles, which *read* those properties.

The order is not cosmetic. Loading the component styles first paints the first
frame with unresolved variables. Your own CSS comes last, so you can override
without `!important`:

<!-- fixture: packages/nuxt/test/fixtures/css-order/nuxt.config.ts -->

```ts
export default defineNuxtConfig({
  modules: ['@dzup-ui/nuxt'],
  css: ['~/assets/app.css'],
})
```

Both are *declared* package subpaths. Before 2026-08-20 the module pushed
`@dzup-ui/tokens/dist/tokens.css`, a deep path the tokens package does not
export, and every real install failed with
`Missing "./dist/tokens.css" specifier`.

## SSR

Components render on the server with no extra configuration:

<!-- fixture: packages/nuxt/test/fixtures/ssr-hydration/nuxt.config.ts -->

```ts
export default defineNuxtConfig({
  modules: ['@dzup-ui/nuxt'],
  ssr: true,
})
```

The module injects the theme script into `<head>` before any stylesheet
(ADR-15). It reads `localStorage` and sets `data-theme` on `<html>` before first
paint, so a dark-mode reader does not get a white flash on a cold load — the
server cannot know their theme, and this is what closes that gap.

Wrap your layout in `DzThemeProvider` to make the theme reactive:

<!-- fixture: packages/nuxt/test/fixtures/ssr-hydration/app.vue -->

```vue
<script setup lang="ts">
const count = ref(0)
</script>

<template>
  <div>
    <DzThemeProvider>
      <DzButton data-testid="ssr-button" @click="count++">
        Rendered on the server: {{ count }}
      </DzButton>
    </DzThemeProvider>
  </div>
</template>
```

## Options

| Option | Default | Effect |
|---|---|---|
| `includePro` | `false` | also register `@dzup-ui-pro/pro` components |
| `prefix` | `''` | replace the `Dz` tag prefix |

## What the module does

1. Registers every component from the **generated** ownership table in
   `@dzup-ui/core/ownership`. There is no handwritten list — the two that used
   to exist had drifted apart from each other and from both packages.
2. Pushes the token stylesheet, then the component stylesheet.
3. Injects the FOUC-prevention theme script (ADR-15).

## Supported Nuxt versions

`peerDependencies` says `nuxt >=3.0.0`. The fixtures build on **Nuxt 3.21.11**.
On `nuxt@3.14.0` a clean consumer install **cannot build at all**: nitropack
2.13.x nests copies of its own dependencies and Nuxt 3.14's `impound` plugin
refuses every module under `node_modules/nitropack/node_modules/`. That is
reproducible under both npm and yarn with none of this library in the graph, but
it means the declared floor is not evidence-backed. Prefer a current Nuxt 3.
