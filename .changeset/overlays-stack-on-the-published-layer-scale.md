---
"@dzup-ui/core": patch
---

**Overlays stack on the published `--dz-z-*` layer scale.**

Dialogs, sheets, the command palette, the lightbox, popovers, tooltips, menus, the
select family, the colour/time pickers, the cascader and the toast viewport used
numeric z utilities (`z-50`, `z-[60]`, `z-[100]`) far below the 1000–1080 scale
that `DzBlockUI`, `DzTour` and `DzPopconfirm` already used, so a toast raised over
a full-screen `DzBlockUI` and any overlay opened from a `DzTour` step painted
underneath. Each now resolves through its layer, with the numeric value as the
fallback: dialog and sheet through `--dz-dialog-overlay-z-index` /
`--dz-dialog-z-index` (modal-backdrop 1040 / modal 1050), the command palette and
lightbox on modal-backdrop / modal, every body-portaled anchored surface (popover,
dropdown and context menus, the select family, colour/time picker, cascader) on
`--dz-z-popover` (1060, above a dialog it is opened from), the tooltip on
`--dz-z-tooltip` (1070) and the toast viewport on `--dz-z-toast` (1080). In-flow
menus that are not portaled (`DzMention`, the data-grid column menu) use
`--dz-z-dropdown`.

Consumers who placed their own `fixed` UI between `z-50` and `z-[100]` relative to
these overlays should re-check its stacking; re-theming a `--dz-z-*` layer now
moves the overlays on it.
