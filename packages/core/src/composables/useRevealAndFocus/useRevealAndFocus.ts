/**
 * useRevealAndFocus — reveal a hidden panel, then focus something inside it
 * (TASK-FORM-OSS-04).
 *
 * The failure this exists to stop is specific and common. A wizard or a tabbed
 * form validates on submit, finds the first invalid field, and calls `focus()`
 * on it. The field is in a collapsed accordion panel or an inactive tab, so it
 * is not in the document — or it is `display: none` — and `focus()` does
 * nothing at all. The user is told "please fix the errors" and given no way to
 * reach them.
 *
 * Focusing has to wait for three things, in order:
 *
 *   1. the container to change its active/open item — the caller does that;
 *   2. Vue to render the panel — `nextTick`;
 *   3. the panel's reveal transition to finish, because a browser will not
 *      focus an element inside a node that is still `display: none`, and some
 *      disclosure implementations only drop that at the end of the animation.
 *
 * Step 3 is skipped under `prefers-reduced-motion`, where there is no
 * transition to wait for, and it is bounded by a timeout regardless: a
 * `transitionend` that never fires must not leave the user with no focus at
 * all. Slightly early focus is recoverable; never focusing is not.
 *
 * @module @dzup-ui/core/composables/useRevealAndFocus
 */

import type { Ref } from 'vue'
import { nextTick } from 'vue'

export interface RevealAndFocusOptions {
  /**
   * How long to wait for a reveal transition before focusing anyway.
   *
   * The fallback, not the plan: `transitionend` normally arrives first. A
   * panel whose transition is interrupted — or which never had one — would
   * otherwise never resolve.
   *
   * @default 300
   */
  timeout?: number
  /**
   * Whether the caller prefers reduced motion.
   *
   * Passed in rather than read here so this stays pure and testable, and so a
   * component can use the resolved provider value (ADR-20) instead of querying
   * the media list a second time.
   */
  reducedMotion?: boolean
}

/**
 * Waits for the panel to be revealed, then focuses the first match.
 *
 * Returns the element it focused, or `null` when nothing matched — a caller
 * that gets `null` knows to fall back to a summary rather than assuming focus
 * moved.
 */
export async function revealAndFocus(
  container: Ref<HTMLElement | null | undefined> | HTMLElement | null | undefined,
  targetSelector: string,
  options: RevealAndFocusOptions = {},
): Promise<HTMLElement | null> {
  await nextTick()

  const el = container !== null && container !== undefined && 'value' in (container as Ref)
    ? (container as Ref<HTMLElement | null | undefined>).value
    : (container as HTMLElement | null | undefined)
  if (!el)
    return null

  if (options.reducedMotion !== true)
    await settled(el, options.timeout ?? 300)

  const target = el.querySelector<HTMLElement>(targetSelector)
  if (target === null)
    return null

  target.focus()
  // `focus()` on a node that is still hidden silently does nothing, and the
  // caller has no other way to find out. Reporting what actually holds focus
  // lets a form fall back to its error summary instead of stranding the user.
  return document.activeElement === target ? target : null
}

/**
 * Resolves when the element's reveal transition ends, or when the timeout does.
 *
 * Whichever comes first, and the listener is removed either way.
 */
function settled(el: HTMLElement, timeout: number): Promise<void> {
  return new Promise<void>((resolve) => {
    let done = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const finish = (): void => {
      if (done)
        return
      done = true
      el.removeEventListener('transitionend', finish)
      if (timer !== undefined)
        clearTimeout(timer)
      resolve()
    }
    timer = setTimeout(finish, timeout)
    el.addEventListener('transitionend', finish, { once: true })
  })
}

/**
 * The composable form: binds a container once and reveals into it repeatedly.
 *
 * @example
 * ```ts
 * const panel = ref<HTMLElement | null>(null)
 * const { focusInside } = useRevealAndFocus(panel)
 *
 * async function showFirstError(fieldId: string) {
 *   tabs.value?.revealItem('billing')
 *   const focused = await focusInside(`#${CSS.escape(fieldId)}`)
 *   if (focused === null)
 *     summary.value?.focus()
 * }
 * ```
 */
export function useRevealAndFocus(
  container: Ref<HTMLElement | null | undefined>,
  defaults: RevealAndFocusOptions = {},
): { focusInside: (selector: string, options?: RevealAndFocusOptions) => Promise<HTMLElement | null> } {
  return {
    focusInside: (selector, options) =>
      revealAndFocus(container, selector, { ...defaults, ...options }),
  }
}
