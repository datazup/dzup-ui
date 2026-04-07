/**
 * Overlays family -- public exports.
 *
 * @module @dzup-ui/core/components/overlays
 */

export type {
  CommandGroup,
  CommandItem,
  DzCommandPaletteEmits,
  DzCommandPaletteEmptySlots,
  DzCommandPaletteGroupProps,
  DzCommandPaletteGroupSlots,
  DzCommandPaletteInputProps,
  DzCommandPaletteInputSlots,
  DzCommandPaletteItemEmits,
  DzCommandPaletteItemProps,
  DzCommandPaletteItemSlots,
  DzCommandPaletteListSlots,
  DzCommandPaletteProps,
  DzCommandPaletteSlots,
} from './DzCommandPalette.types.ts'
export { type CommandPaletteVariantProps, commandPaletteVariants } from './DzCommandPalette.variants.ts'
// ── DzCommandPalette ──
export { default as DzCommandPalette } from './DzCommandPalette.vue'
export type {
  ContextMenuAlign,
  ContextMenuSide,
  DzContextMenuContentEmits,
  DzContextMenuContentProps,
  DzContextMenuContentSlots,
  DzContextMenuItemEmits,
  DzContextMenuItemProps,
  DzContextMenuItemSlots,
  DzContextMenuProps,
  DzContextMenuSeparatorSlots,
  DzContextMenuSlots,
  DzContextMenuTriggerSlots,
} from './DzContextMenu.types.ts'
export { type ContextMenuVariantProps, contextMenuVariants } from './DzContextMenu.variants.ts'
// ── DzContextMenu (Compound) ──
export { default as DzContextMenu } from './DzContextMenu.vue'
export { default as DzContextMenuContent } from './DzContextMenuContent.vue'

export { default as DzContextMenuItem } from './DzContextMenuItem.vue'
export { default as DzContextMenuSeparator } from './DzContextMenuSeparator.vue'
export { default as DzContextMenuTrigger } from './DzContextMenuTrigger.vue'

// ── Types — DzDialog ──
export type {
  DialogContentSize,
  DzDialogCloseSlots,
  DzDialogContentEmits,
  DzDialogContentProps,
  DzDialogContentSlots,
  DzDialogContext,
  DzDialogDescriptionSlots,
  DzDialogOverlaySlots,
  DzDialogProps,
  DzDialogSlots,
  DzDialogTitleSlots,
  DzDialogTriggerSlots,
} from './DzDialog.types.ts'
// ── Injection keys (runtime exports) ──
export { DZ_DIALOG_KEY } from './DzDialog.types.ts'
// ── Variants (for consumer customization) ──
export { type DialogVariantProps, dialogVariants } from './DzDialog.variants.ts'

// ── DzDialog (Compound) ──
export { default as DzDialog } from './DzDialog.vue'

export { default as DzDialogClose } from './DzDialogClose.vue'

export { default as DzDialogContent } from './DzDialogContent.vue'

export { default as DzDialogDescription } from './DzDialogDescription.vue'

export { default as DzDialogOverlay } from './DzDialogOverlay.vue'
export { default as DzDialogTitle } from './DzDialogTitle.vue'
export { default as DzDialogTrigger } from './DzDialogTrigger.vue'

export type {
  DropdownAlign,
  DropdownSide,
  DzDropdownMenuContentEmits,
  DzDropdownMenuContentProps,
  DzDropdownMenuContentSlots,
  DzDropdownMenuItemEmits,
  DzDropdownMenuItemProps,
  DzDropdownMenuItemSlots,
  DzDropdownMenuProps,
  DzDropdownMenuSeparatorSlots,
  DzDropdownMenuSlots,
  DzDropdownMenuTriggerSlots,
} from './DzDropdownMenu.types.ts'
export { type DropdownMenuVariantProps, dropdownMenuVariants } from './DzDropdownMenu.variants.ts'
// ── DzDropdownMenu (Compound) ──
export { default as DzDropdownMenu } from './DzDropdownMenu.vue'
export { default as DzDropdownMenuContent } from './DzDropdownMenuContent.vue'
export { default as DzDropdownMenuItem } from './DzDropdownMenuItem.vue'
export { default as DzDropdownMenuSeparator } from './DzDropdownMenuSeparator.vue'

export { default as DzDropdownMenuTrigger } from './DzDropdownMenuTrigger.vue'

// ── Types — DzPopover ──
export type {
  DzPopoverContentEmits,
  DzPopoverContentProps,
  DzPopoverContentSlots,
  DzPopoverProps,
  DzPopoverSlots,
  DzPopoverTriggerSlots,
  PopoverAlign,
  PopoverContentSize,
  PopoverSide,
} from './DzPopover.types.ts'

export { type PopoverVariantProps, popoverVariants } from './DzPopover.variants.ts'
// ── DzPopover (Compound) ──
export { default as DzPopover } from './DzPopover.vue'
export { default as DzPopoverContent } from './DzPopoverContent.vue'
export { default as DzPopoverTrigger } from './DzPopoverTrigger.vue'
export type {
  DzSheetCloseSlots,
  DzSheetContentEmits,
  DzSheetContentProps,
  DzSheetContentSlots,
  DzSheetDescriptionSlots,
  DzSheetProps,
  DzSheetSlots,
  DzSheetTitleSlots,
  DzSheetTriggerSlots,
  SheetSide,
} from './DzSheet.types.ts'

export { type SheetVariantProps, sheetVariants } from './DzSheet.variants.ts'

// ── DzSheet (Compound) ──
export { default as DzSheet } from './DzSheet.vue'

export { default as DzSheetClose } from './DzSheetClose.vue'
export { default as DzSheetContent } from './DzSheetContent.vue'
export { default as DzSheetDescription } from './DzSheetDescription.vue'
export { default as DzSheetTitle } from './DzSheetTitle.vue'
export { default as DzSheetTrigger } from './DzSheetTrigger.vue'

// ── Types — DzTooltip ──
export type {
  DzTooltipContentProps,
  DzTooltipContentSlots,
  DzTooltipProps,
  DzTooltipSlots,
  DzTooltipTriggerSlots,
  TooltipAlign,
  TooltipSide,
} from './DzTooltip.types.ts'

export { type TooltipVariantProps, tooltipVariants } from './DzTooltip.variants.ts'

// ── DzTooltip (Compound) ──
export { default as DzTooltip } from './DzTooltip.vue'

export { default as DzTooltipContent } from './DzTooltipContent.vue'

export { default as DzTooltipTrigger } from './DzTooltipTrigger.vue'
