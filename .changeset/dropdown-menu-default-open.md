---
"@dzup-ui/core": patch
---

Fix `DzDropdownMenu`'s `defaultOpen` prop, which was declared but had no effect.

Two defects, both required for an uncontrolled menu to open on mount:

- `defaultOpen` was never forwarded to Reka's `DropdownMenuRoot`.
- `defineModel<boolean | undefined>('open')` declared `open` as a **Boolean** prop
  with no default, so Vue boolean-cast the unbound value to `false`. Reka read that
  as "controlled, and closed", which pinned the menu shut and made `defaultOpen`
  unreachable even once forwarded. The model now declares `default: undefined`, so
  `open` stays undefined until a consumer binds `v-model:open`.

Click-to-open was unaffected (the local `defineModel` fed the new value back), so
this only changes menus that relied on `defaultOpen`, which previously could not
open at all. `DzDropdownMenuProps` doc comments were also corrected — `modal` was
described as "controlled open state".
