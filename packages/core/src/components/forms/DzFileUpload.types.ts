/**
 * DzFileUpload — Type definitions for the file upload component.
 *
 * Built from scratch (no Reka UI primitive).
 * v-model via defineModel (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzFileUpload
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

/** Error payload for file validation failures */
export interface FileUploadError {
  /** The file that failed validation */
  file: File
  /** Human-readable reason for the failure */
  reason: string
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzFileUpload component */
export interface DzFileUploadProps extends BaseAccessibilityProps, BaseValidationProps {
  /** Accepted file types (MIME types or extensions, e.g., 'image/*,.pdf') */
  accept?: string
  /** Maximum file size in bytes */
  maxSize?: number
  /** Maximum number of files */
  maxFiles?: number
  /** Allow multiple file selection */
  multiple?: boolean
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Form field name */
  name?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzFileUpload */
export interface DzFileUploadEmits {
  /** Files were uploaded (added to the model) */
  upload: [files: File[]]
  /** A file was removed from the list */
  remove: [file: File]
  /** A file failed validation */
  error: [error: FileUploadError]
  /** Focus gained */
  focus: [event: FocusEvent]
  /** Focus lost */
  blur: [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzFileUpload */
export interface DzFileUploadSlots {
  /** Custom drop zone content */
  'default'?: (props: { isDragOver: boolean }) => unknown
  /** Custom rendering for each file item */
  'file-item'?: (props: { file: File, remove: () => void }) => unknown
}
