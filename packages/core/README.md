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

## Package Entry Points

- `@dzup-ui/core`
- `@dzup-ui/core/styles`
- `@dzup-ui/core/resolver`

## Repo Docs

See the workspace [README](../../README.md) for installation, package overview, and development commands.
