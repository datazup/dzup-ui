/**
 * DzVisuallyHidden — Type definitions for the screen-reader-only wrapper.
 *
 * Renders content that is present in the accessibility tree (announced by
 * assistive technology) but not painted on screen. Optionally reveals itself
 * on focus for the skip-link pattern.
 */

/**
 * HTML element the wrapper renders as.
 *
 * Polymorphic so the primitive can wrap either inline content (default `span`)
 * or block content (`div`). Common interactive/structural elements are listed
 * for editor autocompletion; any string tag is accepted.
 */
export type VisuallyHiddenElement
  = | 'span'
    | 'div'
    | 'p'
    | 'label'
    | 'a'
    | 'li'
    | 'output'
  // eslint-disable-next-line @typescript-eslint/ban-types
    | (string & {})

export interface DzVisuallyHiddenProps {
  /** HTML element to render. Defaults to 'span'. */
  as?: VisuallyHiddenElement
  /**
   * When true, the content becomes visible when it (or a focusable descendant)
   * receives keyboard focus — the skip-link pattern. Defaults to false.
   */
  focusable?: boolean
  /** Accessible identifier (e.g. for `aria-labelledby`/`aria-describedby` references). */
  id?: string
}

export interface DzVisuallyHiddenSlots {
  /** The content to hide visually while keeping it in the accessibility tree. */
  default: () => unknown
}
