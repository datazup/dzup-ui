/**
 * DzCodeBlock — type definitions.
 *
 * A code display component with syntax highlighting semantics,
 * line numbers, and optional clipboard copy functionality.
 *
 * @module @dzup-ui/core/components/data/DzCodeBlock
 */

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzCodeBlock component */
export interface DzCodeBlockProps {
  /** Element ID */
  id?: string
  /** Accessible label for the code block */
  ariaLabel?: string
  /** The code content to display */
  code: string
  /** Programming language for semantic markup */
  language?: string
  /** Filename displayed in the header */
  filename?: string
  /** Whether to display line numbers */
  showLineNumbers?: boolean
  /** Maximum height with overflow scroll (CSS value, e.g. '400px') */
  maxHeight?: string
  /** Whether to show the copy-to-clipboard button */
  copyable?: boolean
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzCodeBlock */
export interface DzCodeBlockSlots {
  /** Custom header content */
  header?: (props: { filename?: string, language?: string }) => unknown
  /** Additional action buttons in the header */
  actions?: () => unknown
}
