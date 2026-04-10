/**
 * Layout family -- public exports.
 *
 * @module @dzup-ui/core/components/layout
 */

// ── DzAppShell ──
export type {
  DzAppShellProps,
  DzAppShellSlots,
} from './DzAppShell.types.ts'

export { type AppShellVariantProps, appShellVariants } from './DzAppShell.variants.ts'
export { default as DzAppShell } from './DzAppShell.vue'

export type {
  DzAspectRatioProps,
  DzAspectRatioSlots,
} from './DzAspectRatio.types.ts'
// ── DzAspectRatio ──
export { default as DzAspectRatio } from './DzAspectRatio.vue'
export type {
  DzCollapseProps,
  DzCollapseSlots,
} from './DzCollapse.types.ts'
// ── DzCollapse ──
export { default as DzCollapse } from './DzCollapse.vue'
// Types
export type {
  ContainerMaxWidth,
  DzContainerProps,
  DzContainerSlots,
} from './DzContainer.types.ts'
// Variants (for consumer customization)
export { type ContainerVariantProps, containerVariants } from './DzContainer.variants.ts'

// Components
export { default as DzContainer } from './DzContainer.vue'

export type {
  DividerOrientation,
  DzDividerProps,
  DzDividerSlots,
} from './DzDivider.types.ts'

export { type DividerVariantProps, dividerVariants } from './DzDivider.variants.ts'

export { default as DzDivider } from './DzDivider.vue'

export type {
  DzFlexProps,
  DzFlexSlots,
  FlexAlign,
  FlexDirection,
  FlexJustify,
} from './DzFlex.types.ts'

export { type FlexVariantProps, flexVariants } from './DzFlex.variants.ts'

export { default as DzFlex } from './DzFlex.vue'
export type {
  DzGridProps,
  DzGridSlots,
  GridCols,
  LayoutGap,
  ResponsiveCols,
} from './DzGrid.types.ts'
export { type GridVariantProps, gridVariants, responsiveColsMap } from './DzGrid.variants.ts'
export { default as DzGrid } from './DzGrid.vue'

export type {
  DzResizableContext,
  DzResizableEmits,
  DzResizableHandleProps,
  DzResizableHandleSlots,
  DzResizablePanelProps,
  DzResizablePanelSlots,
  DzResizableProps,
  DzResizableSlots,
  ResizableDirection,
} from './DzResizable.types.ts'

export { DZ_RESIZABLE_KEY } from './DzResizable.types.ts'

export { type ResizableVariantProps, resizableVariants } from './DzResizable.variants.ts'

// ── DzResizable (Reka UI Splitter) ──
export { default as DzResizable } from './DzResizable.vue'

export { default as DzResizableHandle } from './DzResizableHandle.vue'

export { default as DzResizablePanel } from './DzResizablePanel.vue'

export type {
  DzScrollAreaProps,
  DzScrollAreaSlots,
  ScrollOrientation,
} from './DzScrollArea.types.ts'

export { type ScrollAreaVariantProps, scrollAreaVariants } from './DzScrollArea.variants.ts'
// ── DzScrollArea ──
export { default as DzScrollArea } from './DzScrollArea.vue'
export type {
  DzSpacerProps,
  DzSpacerSlots,
  SpacerSize,
} from './DzSpacer.types.ts'

export { default as DzSpacer } from './DzSpacer.vue'

export type {
  DzSplitterContext,
  DzSplitterEmits,
  DzSplitterHandleProps,
  DzSplitterHandleSlots,
  DzSplitterPanelProps,
  DzSplitterPanelSlots,
  DzSplitterProps,
  DzSplitterSlots,
  SplitterDirection,
} from './DzSplitter.types.ts'
export { DZ_SPLITTER_KEY } from './DzSplitter.types.ts'

// ── DzSplitter (alias for DzResizable) ──
export { default as DzSplitter } from './DzSplitter.vue'
export { default as DzSplitterHandle } from './DzSplitterHandle.vue'
export { default as DzSplitterPanel } from './DzSplitterPanel.vue'

export type {
  DzStackProps,
  DzStackSlots,
  StackAlign,
  StackDirection,
} from './DzStack.types.ts'

export { default as DzStack } from './DzStack.vue'
