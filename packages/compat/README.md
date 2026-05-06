# `@dzup-ui/compat`

Migration adapter layer from the old dzup-ui API to vNext (`@dzup-ui/core`).

## Install

```bash
yarn add @dzup-ui/compat
```

Peer dependencies: `vue >= 3.5`, `@dzup-ui/core`, `@dzup-ui/contracts`

## Purpose

`@dzup-ui/compat` re-exports legacy component names and props as thin wrappers around the new `@dzup-ui/core` components, so you can upgrade the library version without rewriting all your templates at once.

```vue
<!-- Old import — still works via compat -->
<script setup>
import { OldButton } from '@dzup-ui/compat'
</script>
```

## Migration path

1. Add `@dzup-ui/compat` as a temporary dependency.
2. Replace old imports with compat shims — no template changes required.
3. Follow the [codemod guide](../codemods/README.md) to automatically migrate to `@dzup-ui/core` imports.
4. Remove `@dzup-ui/compat` once migration is complete.

Compat components are maintained only for the current major version. Breaking changes in the new API are not back-ported.
