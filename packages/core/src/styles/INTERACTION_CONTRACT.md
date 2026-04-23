# Interaction Contract

`@dzup-ui/core` treats focus and disabled behavior as semantic infrastructure, not per-component styling trivia.

## Rules

- Use `button` semantics for explicit actions.
  - Focus: `dz-focus-ring-button`
  - Persistent selected/pressed emphasis: `dz-button-state-ring`
  - Disabled: `dz-disabled-button`
- Use `control` semantics for navigation, selection, toggles, list rows, menu items, and surface controls.
  - Focus: `dz-focus-ring-control` or `dz-focus-ring-control-inset`
  - Disabled: `dz-disabled-control`
- Use `input` semantics for direct text-entry elements.
  - Focus: `dz-focus-ring-input`
  - Disabled: `dz-disabled-input`
- Use `input-shell` semantics for composite fields that delegate real input to nested primitives.
  - Focus: `dz-focus-within-ring-input`
  - Disabled: `dz-disabled-input-shell`

## Native Field Utilities

Use `dz-native-field-sm` for internal native `input` and `select` markup in places where introducing a full component would be unnecessary, such as table filters or lightweight inspector panels.

Do not restyle raw native controls inline with repeated border/radius/focus class sets in Vue templates. Prefer:

1. a full component like `DzInput`, `DzSelect`, or `DzCombobox` when that surface is part of the public component API
2. `dz-native-field-sm` for internal, local-only filter controls

## Decision Guide

- If the control submits or triggers an action, it is usually a `button`.
- If the control changes selection or navigates state, it is usually a `control`.
- If the control accepts freeform text, it is an `input`.
- If the visible shell wraps hidden or segmented inputs, it is an `input-shell`.

## Why

This keeps token changes centralized, reduces class drift, and prevents nested native inputs from reintroducing browser-default focus chrome inside composite controls.
