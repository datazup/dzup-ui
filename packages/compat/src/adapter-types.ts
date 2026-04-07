/**
 * Shared props interfaces for compat adapter components.
 *
 * These interfaces are extracted from individual SFC <script setup> blocks so
 * that vite-plugin-dts can generate declaration files without TS4082 errors
 * ("Default export of the module has or is using private name").
 *
 * Each interface matches the exact shape used with `defineProps<T>()` in the
 * corresponding adapter. Support types referenced within those interfaces are
 * also exported here.
 */

import type { DialogContentSize, DzSelectItem } from '@dzip-ui/core'

// ─── DzSelectCompat ───────────────────────────────────────────────────────────

// ─── DzAccordionCompat ────────────────────────────────────────────────────────

/** Old accordion item shape */
export interface OldAccordionItem {
  /** Display title for the accordion trigger */
  title: string
  /** Unique value identifying this item */
  value: string
  /** Whether this item is disabled */
  disabled?: boolean
  /** Content text (used as fallback if no scoped slot) */
  content?: string
}

/** Old dzip-ui size values shared across multiple adapters */
export type OldSize = 'small' | 'medium' | 'large' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface DzAccordionCompatProps {
  /** Accordion items — each rendered as a compound item */
  items?: OldAccordionItem[]
  /** Whether to allow multiple items open (old API) */
  multiple?: boolean
  /** Whether the component behaves as an accordion (old API alias for single mode) */
  accordion?: boolean
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Disabled state */
  disabled?: boolean
  /** Expand icon — dropped in vNext (CSS-controlled) */
  expandIcon?: string
}

// ─── DzAlertCompat ────────────────────────────────────────────────────────────

/** Old dzip-ui alert type values */
export type OldAlertType = 'success' | 'warning' | 'error' | 'info' | 'default'

export interface DzAlertCompatProps {
  /** Old `type` prop — maps to `tone` in vNext */
  type?: OldAlertType
  /** Whether the alert can be dismissed */
  closable?: boolean
  /** Alert title text */
  title?: string
}

// ─── DzButtonCompat ───────────────────────────────────────────────────────────

/** Old dzip-ui button type prop values */
export type OldButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' | 'text' | 'link'

export interface DzButtonCompatProps {
  /** Old `type` prop — maps to variant + tone in vNext */
  type?: OldButtonType
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Disabled state */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
}

// ─── DzCheckboxCompat ─────────────────────────────────────────────────────────

export interface DzCheckboxCompatProps {
  /** Label text — rendered as slot content in the new API */
  label?: string
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Disabled state */
  disabled?: boolean
  /** Indeterminate (mixed) state */
  indeterminate?: boolean
  /** Form field name */
  name?: string
  /** Value for checkbox groups */
  value?: string
}

// ─── DzDialogCompat ───────────────────────────────────────────────────────────

export interface DzDialogCompatProps {
  /** Dialog title text (maps to DzDialogTitle) */
  title?: string
  /** Dialog description text (maps to DzDialogDescription) */
  description?: string
  /** Dialog content size */
  size?: DialogContentSize
  /** Whether the dialog is modal */
  modal?: boolean
  /** Whether to show a close button */
  showClose?: boolean
}

// ─── DzInputCompat ────────────────────────────────────────────────────────────

export interface DzInputCompatProps {
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Placeholder text */
  placeholder?: string
  /** Whether the input shows a clear button */
  clearable?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Read-only state */
  readonly?: boolean
  /** HTML input type */
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search'
  /** Maximum character length */
  maxlength?: number
}

// ─── DzRadioCompat ────────────────────────────────────────────────────────────

/** Old dzip-ui radio option shape */
export interface RadioOption {
  /** Display label for the radio */
  label: string
  /** Value used for selection */
  value: string
  /** Whether this option is disabled */
  disabled?: boolean
}

export interface DzRadioCompatProps {
  /** Radio options — each rendered as a DzRadio child */
  options?: RadioOption[]
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Disabled state propagated to all child radios */
  disabled?: boolean
  /** Form field name */
  name?: string
}

/** Old dzip-ui option shape */
export interface OldSelectOption {
  /** Display text — old API used both `label` and `text` */
  label?: string
  /** Alternative display text key from old API */
  text?: string
  /** Value used for selection */
  value: string
  /** Whether this option is disabled */
  disabled?: boolean
}

export interface DzSelectCompatProps {
  /** Options list — accepts both old and new shapes */
  options?: OldSelectOption[]
  /** New-style items (forwarded directly if provided) */
  items?: DzSelectItem[]
  /** Placeholder text */
  placeholder?: string
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Disabled state */
  disabled?: boolean
  /** Form field name */
  name?: string
}

// ─── DzSwitchCompat ───────────────────────────────────────────────────────────

export interface DzSwitchCompatProps {
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Disabled state */
  disabled?: boolean
  /** Form field name */
  name?: string
  /** Text displayed when switch is active (old API) */
  activeText?: string
  /** Text displayed when switch is inactive (old API) */
  inactiveText?: string
  /** Active color — dropped in vNext (use tokens) */
  activeColor?: string
  /** Inactive color — dropped in vNext (use tokens) */
  inactiveColor?: string
  /** Width — dropped in vNext (CSS-controlled) */
  width?: number
}

// ─── DzTabsCompat ─────────────────────────────────────────────────────────────

/** Old dzip-ui tab item shape */
export interface TabItem {
  /** Display label for the tab */
  label: string
  /** Unique value identifying this tab */
  value: string
  /** Whether this tab trigger is disabled */
  disabled?: boolean
  /** Whether this tab shows a close button */
  closable?: boolean
}

/** Old dzip-ui tab type values */
export type OldTabType = 'line' | 'card' | 'border-card'

export interface DzTabsCompatProps {
  /** Tab items — each rendered as a DzTabTrigger */
  tabs?: TabItem[]
  /** Old `type` prop — maps to `variant` in vNext */
  type?: OldTabType
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Whether all tabs are closable (individual tab closable overrides this) */
  closable?: boolean
}

// ─── DzTooltipCompat ──────────────────────────────────────────────────────────

/** Old placement values */
export type OldPlacement
  = | 'top' | 'top-start' | 'top-end'
    | 'bottom' | 'bottom-start' | 'bottom-end'
    | 'left' | 'left-start' | 'left-end'
    | 'right' | 'right-start' | 'right-end'

/** Old trigger type */
export type OldTriggerType = 'hover' | 'click' | 'focus'

export interface DzTooltipCompatProps {
  /** Tooltip content text */
  content?: string
  /** Placement — maps to side + align in vNext */
  placement?: OldPlacement
  /** Whether the tooltip is disabled */
  disabled?: boolean
  /** Delay before showing (ms) — maps to delayDuration */
  delay?: number
  /** Alias for delay (old API used both) */
  showDelay?: number
  /** Trigger mode — dropped in vNext (hover by default) */
  trigger?: OldTriggerType
}
