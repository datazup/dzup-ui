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
  DzFileRef,
  UploadRequest,
} from '@dzup-ui/contracts'

export type { DzFileRef, UploadRequest }

/**
 * What `v-model` holds.
 *
 * `'file'` — the default and the existing behaviour: `File[]`.
 * `'ref'` — `DzFileRef[]`, a JSON-serializable description of each file with no
 * binary in it.
 *
 * A form document is persisted JSON (form spec 03), so a `File` in the model is
 * lost on reload and leaks a live handle into a builder preview. Reference mode
 * is what a schema-driven form binds; the host performs the upload in response
 * to `upload-request` and reports the outcome by updating the ref's `status`.
 */
export type DzFileUploadModelMode = 'file' | 'ref'

/** The model value, in either mode. */
export type DzFileUploadValue = File[] | DzFileRef[]

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
  /**
   * Which value `v-model` holds. Defaults to `'file'`, today's behaviour.
   *
   * @default 'file'
   */
  modelMode?: DzFileUploadModelMode
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
  /**
   * The host should upload this file (reference mode only).
   *
   * The `File` is here and **only** here — never in the model. `ref` is the
   * entry already in the value, with `status: 'pending'`; the host replaces it
   * with `'uploaded'` or `'failed'` when it knows. `signal` aborts if the user
   * removes the file before the upload finishes.
   */
  uploadRequest: [request: UploadRequest]
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
  /**
   * Custom rendering for each file item.
   *
   * `file` is the model entry — a `File` by default, a `DzFileRef` under
   * `model-mode="ref"`. `row` is the same thing normalised, which is what a
   * template usually wants: name, size and upload status from either shape.
   */
  'file-item'?: (props: {
    file: File | DzFileRef
    row: { name: string, size: number, status: DzFileRef['status'], error?: string }
    remove: () => void
  }) => unknown
}
