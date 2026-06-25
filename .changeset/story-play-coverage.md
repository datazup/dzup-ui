---
'@dzup-ui/core': patch
---

Add Storybook play() interaction assertions to overlay, navigation, and form stories.

- `DzDropdownMenu` — Interactive + Accessibility stories: open/select/dismiss and aria-disabled verification
- `DzContextMenu` — Accessibility story: right-click open, aria-disabled check, Escape dismiss
- `DzDialogParts` — Default + Accessibility stories: portal open/close, aria-modal, aria-labelledby/describedby, focus return on Escape
- `DzTabsParts` — Default + Accessibility stories: tab activation, panel swap, roving tabindex, ArrowRight navigation, disabled trigger aria-disabled
- `DzSwitch` — Interactive + Accessibility stories: click toggle (aria-checked), Space key, Tab focus movement
- `DzCheckboxGroup` — Interactive + Accessibility stories: multi-select, toggle off, Space key, Tab focus independence
- `DzRadioGroup` — Interactive + Accessibility stories: exclusive selection, ArrowDown roving tabindex
