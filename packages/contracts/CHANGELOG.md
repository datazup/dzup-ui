# @dzup-ui/contracts

## 0.1.0 (2026-08-10)

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

## 0.1.0-alpha.0 (2026-04-06)

### Features

- Initial alpha release of dzup-ui component contracts
- TypeScript interfaces for all public component APIs (ADR-01)
- Canonical variant and size enums shared across core and pro
- `assertNever` runtime helper for exhaustive switch checking
