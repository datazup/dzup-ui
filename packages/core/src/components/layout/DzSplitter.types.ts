/**
 * DzSplitter — type aliases for the DzResizable family.
 *
 * DzSplitter is a naming alias for DzResizable. Both provide
 * the same resizable panel functionality backed by Reka UI Splitter.
 *
 * @module @dzup-ui/core/components/layout/DzSplitter
 */

export type {
  DzResizableContext as DzSplitterContext,
  DzResizableEmits as DzSplitterEmits,
  DzResizableHandleProps as DzSplitterHandleProps,
  DzResizableHandleSlots as DzSplitterHandleSlots,
  DzResizablePanelProps as DzSplitterPanelProps,
  DzResizablePanelSlots as DzSplitterPanelSlots,
  DzResizableProps as DzSplitterProps,
  DzResizableSlots as DzSplitterSlots,
  ResizableDirection as SplitterDirection,
} from './DzResizable.types.ts'

export { DZ_RESIZABLE_KEY as DZ_SPLITTER_KEY } from './DzResizable.types.ts'
