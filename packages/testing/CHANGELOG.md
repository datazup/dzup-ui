# @dzup-ui/testing

## 0.1.0

### Minor Changes

- 573f2ae: Add a shared portal-placement contract and expose it on `DzDialogContent`,
  `DzConfirmDialog`, `DzSheetContent`, `DzPopoverContent`, `DzTooltipContent`,
  `DzDropdownMenuContent`, `DzContextMenuContent`, `DzSelect`, `DzMultiSelect`,
  `DzCombobox`, `DzCommandPalette`, and `DzLightbox`. Dialog content now identifies and
  supports customizing its single owned overlay, while production portal defaults
  remain unchanged.

  Publish `@dzup-ui/testing` with guarded DOM test-environment support so
  consumers can mount real Reka-backed components instead of replacing portals or
  design-system components with stubs.

### Patch Changes

- b357645: Prepare generated count projections before aggregate tests and make shared DOM animation-frame cleanup deterministic. Landing animation demos now release their timers and observers when unmounted.

## 0.1.0-alpha.0 (2026-08-08)

### Features

- Guarded DOM test-environment installer for Reka UI observer, scrolling, and
  pointer-capture requirements
- Optional Vitest setup entry for consumer test suites
