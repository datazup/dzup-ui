---
"@dzup-ui/contracts": minor
"@dzup-ui/core": minor
"@dzup-ui/testing": minor
---

Add a shared portal-placement contract and expose it on `DzDialogContent`,
`DzConfirmDialog`, `DzSheetContent`, `DzPopoverContent`, `DzTooltipContent`,
`DzDropdownMenuContent`, `DzContextMenuContent`, `DzSelect`, `DzMultiSelect`,
`DzCombobox`, `DzCommandPalette`, and `DzLightbox`. Dialog content now identifies and
supports customizing its single owned overlay, while production portal defaults
remain unchanged.

Publish `@dzup-ui/testing` with guarded DOM test-environment support so
consumers can mount real Reka-backed components instead of replacing portals or
design-system components with stubs.
