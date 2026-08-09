---
"@dzup-ui/core": patch
"@dzup-ui/landing": patch
---

Repair form-control semantics in `DzDatePicker`, `DzTimePicker`, and `DzTransfer`.

- `DzDatePicker` now forwards required state to Reka's native form input instead
  of placing an unsupported `aria-required` attribute on a `role="group"`.
- `DzTimePicker` exposes its trigger as a combobox and renders its clear action
  as a sibling control, avoiding nested interactive content while preserving
  focus after clearing.
- `DzTransfer` now owns its options with labelled multiselect listboxes and uses
  keyboard-operable options with a non-interactive visual selection indicator.

The landing catalog's light/dark accessibility audit now certifies every block,
so the two resolved debt exceptions and their unbacked trust-mark fallback are
removed.
