/**
 * DzMention — type definitions.
 *
 * A textarea/input that surfaces a suggestion dropdown when a configurable
 * trigger character (`@`, `#`, …) is typed. Detects the active trigger and the
 * partial query at the caret, resolves options (sync or async), and inserts the
 * chosen option back into the text at the caret.
 *
 * v-model:value via defineModel<string>() (ADR-16) — the raw text including the
 * inserted trigger tokens.
 *
 * @module @dzup-ui/core/components/forms/DzMention
 */

import type {
  AsyncOptionsEmits,
  AsyncOptionsProps,
  BaseFormControlProps,
  ChangeMetadata,
  InputVariant,
  OpenableEvents,
} from '@dzup-ui/contracts'
import type { DzMentionUi } from './DzMention.anatomy.ts'

// ---------------------------------------------------------------------------
// Option + trigger shapes
// ---------------------------------------------------------------------------

/** A single suggestion option. Extra keys (avatar, email, …) are passed through. */
export interface DzMentionOption {
  /** Text rendered in the menu and inserted after the trigger char */
  label: string
  /** Stable value for the option */
  value: string
  /** Whether the option is unselectable */
  disabled?: boolean
  /** Arbitrary extra data consumed by the #option slot */
  [key: string]: unknown
}

/**
 * Async resolver: given the typed query, returns matching options.
 *
 * Runs on the shared async-options seam (renderer contract C9, TASK-R3-O3):
 * a newer query aborts the older request, so a slow response to `@al` never
 * overwrites the answer to `@ali`, and a rejected promise shows the error row
 * with a retry instead of leaving the previous list on screen. A form renderer
 * that fetches its own options should prefer `optionsState` + `@load-options`.
 */
export type DzMentionOptionResolver = (query: string) => Promise<DzMentionOption[]>

/** A configured trigger: the char that opens the menu and its option source. */
export interface DzMentionTrigger {
  /** The single character that activates this trigger (e.g. `@` or `#`) */
  char: string
  /** Static options, or an async resolver for server-side search */
  options: DzMentionOption[] | DzMentionOptionResolver
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props for the DzMention component.
 *
 * Extends {@link AsyncOptionsProps} (renderer contract C9, TASK-R3-O3): pass
 * `optionsState` and the mention is **host-driven** — every new trigger token
 * emits `load-options` (reason `open`; `search` as the query grows), the host
 * writes the results into the active trigger's `options` array, and the menu
 * shows the shared loading / empty / error row instead of its list. Host-driven
 * options are shown as given; `filter` applies only to static arrays. The
 * `search` event fires just before each request and carries the trigger
 * character, which the request itself does not.
 */
export interface DzMentionProps extends BaseFormControlProps<InputVariant>, AsyncOptionsProps {
  /** Configured triggers — each maps a char to its (sync or async) options */
  triggers: DzMentionTrigger[]
  /** Render a multi-line textarea (default) or a single-line input */
  multiline?: boolean
  /** Filter static options by the typed query (ignored for async resolvers) */
  filter?: boolean
  /** Placeholder text shown when empty */
  placeholder?: string
  /** Visible rows for the textarea (multiline only) */
  rows?: number
  /** Maximum number of characters allowed */
  maxlength?: number
  /** Insert a trailing space after a committed mention */
  insertSpace?: boolean
  /** Allow the active query to contain spaces (default stops at whitespace) */
  allowSpaceInQuery?: boolean
  /** Copy shown while options load (an async resolver, or a host-driven `optionsState="loading"`) */
  loadingText?: string
  /** Copy shown when a resolved, host-driven or filtered query yields no options */
  noResultsText?: string
  /**
   * Per-part class overrides, keyed by the names in `DzMention.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing target — the text control, declared
   * there as `input` — so `ui.root` is the route to the wrapper.
   */
  ui?: DzMentionUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/**
 * Events emitted by DzMention.
 *
 * Inherits `focus` / `blur` / `open` / `close` from {@link OpenableEvents} and
 * `load-options` / `retry-options` from {@link AsyncOptionsEmits} (renderer
 * contract C9).
 * - `change` — the raw text changed
 * - `search` — the active query for a trigger changed (drives async resolution)
 * - `select` — an option was inserted
 */
export interface DzMentionEmits extends OpenableEvents, AsyncOptionsEmits {
  /** Raw text value changed */
  change: [value: string, metadata?: ChangeMetadata]
  /** The active trigger's query changed */
  search: [char: string, query: string]
  /** An option was selected and inserted at the caret */
  select: [char: string, option: DzMentionOption]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzMention */
export interface DzMentionSlots {
  /** Render a rich suggestion row (avatar + name, etc.) */
  option?: (props: {
    option: DzMentionOption
    char: string
    query: string
    active: boolean
    index: number
  }) => unknown
  /** Replace the empty ("no results") state */
  empty?: (props: { char: string, query: string }) => unknown
  /** Replace the loading state shown while an async resolver is pending */
  loading?: (props: { char: string, query: string }) => unknown
}
