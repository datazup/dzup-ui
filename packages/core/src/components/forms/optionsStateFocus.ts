/**
 * Renderer contract **C9.4**, second half: give the retry control's focus
 * somewhere to go before it unmounts itself.
 *
 * **Internal**, not exported from the family barrel. It exists for the same reason
 * `DzOptionsState.vue` does — so the rule lives in *one* place instead of once per
 * host — and it is a module rather than a line inside the shared row because the
 * shared row is not, in fact, shared by everybody: `DzSelect` renders its own copy
 * of the async-options row (it has to, because it publishes an `options-state`
 * slot the shared component does not). Two hosts, one definition.
 *
 * ## The defect this closes
 *
 * `useAsyncOptions().canRetry` is `state === 'error'` and nothing else, so pressing
 * the retry control **unmounts the element that was pressed**. When that element
 * owned focus — which is exactly what `Enter` and `Space` mean — the browser hands
 * focus to `document.body`. The user's keyboard position is destroyed: the next
 * `Tab` restarts at the top of the document and no focus ring is visible anywhere.
 * On a panel wrapped in a non-modal dismissable layer, focus arriving on the body
 * can also read as focus *leaving* the layer and close the panel under the user,
 * which is the pointer-path failure RESIDUAL-04 fixed with `@mousedown.prevent`.
 *
 * Measured in real chromium, RESIDUAL-05 (2026-09-25): with the retry focused,
 * `Enter` and `Space` both left `document.activeElement` on the body, on
 * `DzCombobox`, `DzMultiSelect` and `DzSelect`.
 *
 * ## Why a *fallback*, and not simply "focus the row"
 *
 * Two rules, and the order matters:
 *
 * 1. **Only when the retry owned focus.** A pointer press does not — the mousedown
 *    default is prevented, so focus stays on whatever the panel gave it to, usually
 *    the input the user is typing in. Restoring unconditionally would move focus off
 *    that input on every mouse click: one defect traded for another.
 * 2. **Only when nothing else claimed it.** A host that restores focus itself has
 *    already done so by the time the `nextTick` callback runs, because the host's
 *    `retry` listener is invoked synchronously by `emit` and therefore queues its own
 *    callback first. `DzMention` returns focus to the text control the user is
 *    composing a mention in, which is a better destination than the status row and
 *    is asserted by its own contract spec. So this steps in only when focus has
 *    actually been dropped on the body.
 *
 * ## The keyboard *route* — C9.4's third part, added by RESIDUAL-06
 *
 * Returning focus after activation only matters once something can be focused, and
 * RESIDUAL-05 measured that nothing could: the retry control is the only tabbable
 * element in the panel, and seven keyboard routes out of the panel's own input reach
 * it zero times. `Tab` and `Shift+Tab` leave the panel and dismiss it; the
 * arrow / `Home` / `End` / `PageDown` family never leaves the input, because the
 * error state has no options to navigate. The only recovery affordance for a failed
 * option load was therefore unoperable by keyboard — **WCAG 2.1.1, Level A**.
 *
 * The route implemented below is the one the ARIA APG combobox pattern leaves free:
 * **the arrow keys the textbox already owns move into the popup's navigable set,
 * and `Tab` keeps its APG meaning of leaving the combobox.** In the error state the
 * navigable set has exactly one member — the retry control — so `ArrowDown` and
 * `ArrowUp` both land on it, `Enter` / `Space` activate it natively, `ArrowUp` from
 * the row returns to where focus came from, and `withRetryFocusReturn` above puts
 * focus on the row once the control unmounts itself.
 *
 * **Why real DOM focus and not `aria-activedescendant`.** That was the first choice
 * and it is not available: Reka owns the attribute. `ListboxFilter.vue` — which is
 * what a `ComboboxInput` renders — binds `:aria-activedescendant` from
 * `rootContext.highlightedElement`, so a second writer either fights that binding or
 * has to register the retry into the listbox collection as an option. An error row
 * is not an option, and making it one changes its role, its selectability and the
 * filter set: an anatomy and AT re-baseline for a control that is not a choice.
 * Real focus needs none of that, it is the mode Reka's own `ListboxRoot` implements
 * for the same navigation (`highlightedElement.value.focus()` when `focusable`), and
 * `ComboboxInput.handleBlur` explicitly does **not** close the popup when focus
 * moves to something inside the content — which is why the panel survives. That
 * last point is measured, not read: RESIDUAL-05 recorded the retry control holding
 * focus with the panel open and `data-state="open"`, and RESIDUAL-06 §1 drives the
 * keys and records `document.activeElement` at every step.
 *
 * ## The row's own exit — C9.4's fourth part, added by RESIDUAL-07
 *
 * `withRetryFocusReturn` answers *"where does focus go when the **retry control**
 * unmounts"*, and `retryFocusDestination` answers it with the element the keyboard
 * route came from. Neither answers the next question: **where does focus go when the
 * **row** unmounts.** On a portalled host there is nothing to answer — the route
 * always came from the control's input or trigger, which outlives the row — but on an
 * in-canvas host the row can be the whole tab order, and then a keyboard user reaches
 * the retry control by `Tab` wrapping past the end of the document, so
 * `relatedTarget` is `document.body` and is refused. Focus is parked on the row, the
 * retry succeeds, the row unmounts, and focus is on nothing.
 *
 * Measured in real chromium, RESIDUAL-07 (2026-09-25), before this:
 *
 * ```
 * DzListbox   start DIV[viewport] → Tab ×3 host buttons → Tab BODY → Tab retry
 *             Enter → DIV[options-state]   answer arrives → activeElement = BODY
 * DzTransfer  start BODY (nothing tabbable outside the row) → Tab retry
 *             Enter → DIV[options-state]   answer arrives → activeElement = BODY
 * DzMention   start TEXTAREA[input] → Tab retry → … → TEXTAREA[input]   (never lost)
 * ```
 *
 * **The row cannot invent the destination.** The right one is the list the *host* has
 * just rendered in the row's place, and only the host knows which element that is —
 * so the host supplies it (`RetryRowExit`) and `useRetryRowExit` below consumes it in
 * one place, for every host, rather than eight hosts each moving focus themselves.
 * It is resolved **lazily**, after the row has gone and the replacement has rendered,
 * because on `DzTransfer` the destination does not exist yet at activation time: in
 * the error state that control has **zero** tabbable elements outside the row, and the
 * option it should hand focus to is created by the very answer that unmounts the row.
 *
 * @module @dzup-ui/core/components/forms/optionsStateFocus
 */

import type { InjectionKey, ShallowRef } from 'vue'
import { inject, nextTick, onBeforeUnmount, onMounted, onUnmounted, provide, shallowRef } from 'vue'

/**
 * Run a retry activation and make sure focus survives it.
 *
 * @param retry The retry control that is about to unmount, or `null` when a host
 * slot replaced it — in which case that host owns its own focus.
 * @param fallback Resolves the element to focus if focus ends up on the body: the
 * async-options row, which is still mounted after the press because the state
 * becomes `loading` and the host keeps rendering a row rather than the list. It is
 * read *after* the flush, so it resolves to the current element, and it stays inside
 * the panel — which is what keeps a dismissable layer from reading the change as an
 * escape.
 * @param activate The host's own retry handler (emit, re-request).
 */
export function withRetryFocusReturn(
  retry: HTMLElement | null,
  fallback: () => HTMLElement | null,
  activate: () => void,
): void {
  const owned = retry !== null && retry.ownerDocument.activeElement === retry
  activate()
  if (!owned)
    return
  void nextTick(() => {
    const target = fallback()
    if (target === null)
      return
    const doc = target.ownerDocument
    if (doc.activeElement === null || doc.activeElement === doc.body)
      target.focus()
  })
}

/**
 * One control's async-options keyboard route: the two elements it moves focus
 * between, and where focus came from so it can be given back.
 *
 * `returnTo` is mutable on purpose. It is written when the route moves focus into
 * the panel and read when the user asks to come back out, and it is deliberately not
 * a `ref`: nothing renders from it, so making it reactive would only invite a watcher.
 */
export interface RetryKeyboardRoute {
  /** The retry control, or `null` whenever the row is not offering one. */
  readonly retry: () => HTMLElement | null
  /** The async-options row itself, so keys pressed inside it can be told apart. */
  readonly row: () => HTMLElement | null
  /** The element focus was taken from, restored by `ArrowUp` inside the row. */
  returnTo: HTMLElement | null
}

/** Build a route for one async-options row. */
export function createRetryKeyboardRoute(
  retry: () => HTMLElement | null,
  row: () => HTMLElement | null,
): RetryKeyboardRoute {
  return { retry, row, returnTo: null }
}

/**
 * Whether an element is somewhere focus can usefully be given back to.
 *
 * The exclusion that matters is `document.body`. It reads as an element, it is
 * connected, and focusing it is indistinguishable from losing focus — so accepting it
 * would quietly reintroduce the exact defect this module exists to close. It really
 * does turn up: `Tab` wrapping past the end of the document arrives at the next
 * element with `relatedTarget` set to the body, which is how a keyboard user on
 * `DzListbox` reached the retry control in one measured route.
 */
function isReturnTarget(el: EventTarget | null): el is HTMLElement {
  return el instanceof HTMLElement && el.isConnected && el !== el.ownerDocument.body
}

/**
 * Where focus goes once the retry control has unmounted itself — the `fallback`
 * `withRetryFocusReturn` above takes, resolved **after** the flush.
 *
 * Preference order, and the order is the whole point:
 *
 * 1. **Back where the keyboard route took it from** — the control's own input or
 *    trigger. That is the APG resting place for a combobox, it is still mounted when
 *    the options finally arrive, and RESIDUAL-06 measured a fresh defect that this
 *    is the cure for: parking focus on the row works until the load *succeeds*, at
 *    which point the row unmounts with focus on it and drops it on the body — so a
 *    keyboard user who retried successfully could not reach the options they asked
 *    for. Measured, before this rule: `active=BODY` the instant the answer rendered.
 * 2. **Otherwise the row**, which is RESIDUAL-05's rule unchanged, and is what an AT
 *    that focused the retry directly (without the arrow route) still gets.
 *
 * Returning focus to the input does not dismiss the popup. Measured on both Reka
 * comboboxes: `ArrowUp` out of the retry control leaves the content part present and
 * `data-state="open"`. Reka's own `ComboboxContentImpl` has to allow it — focus lives
 * on that input for the panel's whole life in the ordinary case.
 */
export function retryFocusDestination(route: RetryKeyboardRoute): () => HTMLElement | null {
  return () => {
    const back = route.returnTo
    if (isReturnTarget(back))
      return back
    return route.row()
  }
}

/**
 * A host's answer to *"where should focus go when the async-options row leaves?"* —
 * the element the host has rendered in the row's place, or `null` when it has none.
 *
 * Called **after** the row has unmounted and Vue has flushed, so a host may resolve
 * something that did not exist while the row was on screen. That is not an
 * optimisation: `DzTransfer`'s destination is the first option of the list, and the
 * list is created by the same answer that removes the row.
 */
export type RetryRowExit = () => HTMLElement | null

/**
 * Hand focus on from the async-options row when the row itself unmounts — C9.4's
 * fourth part, and the close of `D-RES06-1`.
 *
 * Only when the row **owned** focus, for the same reason `withRetryFocusReturn` only
 * acts when the retry control did: a row that did not have focus has no focus to pass
 * on, and moving it anyway would yank a user out of whatever they were doing. And only
 * when focus was actually **dropped** — checked after the flush, so a host that moves
 * focus itself (`DzMention` returns it to the text control the mention is being
 * composed in) wins, exactly as it does in `withRetryFocusReturn`.
 *
 * The destination order is `retryFocusDestination`'s, unchanged, with the host's exit
 * appended: the row itself resolves to `null` once it has unmounted, so the fallback
 * chain reads *"back where the keyboard came from, else the list the host just
 * rendered, else leave it alone"*. There is no second mechanism and no second answer
 * to the same question.
 *
 * @param route The row's own route — the same object `useRetryKeyboardRoute` holds.
 * @param exit The host's destination, or `null` for a host that supplied none
 * (every portalled host: its route always came from an element that outlives the row).
 */
export function useRetryRowExit(route: RetryKeyboardRoute, exit: RetryRowExit | null): void {
  const destination = retryFocusDestination(route)
  let doc: Document | null = null
  let owned = false

  onBeforeUnmount(() => {
    // Read before the row leaves the document — afterwards `contains` is useless and
    // `ownerDocument` is unreachable, which is the whole reason this hook exists.
    const row = route.row()
    doc = row?.ownerDocument ?? null
    const active = doc?.activeElement ?? null
    owned = row !== null && active !== null && (active === row || row.contains(active))
  })

  onUnmounted(() => {
    const target = doc
    if (!owned || target === null)
      return
    owned = false
    void nextTick(() => {
      if (target.activeElement !== null && target.activeElement !== target.body)
        return
      // `retryFocusDestination` may still hand back the row: a template ref is cleared
      // during unmount, but a detached element is not a destination either way, so the
      // connectedness test decides — not the identity of what came back.
      const first = destination()
      const next = first !== null && first.isConnected ? first : (exit === null ? null : exit())
      if (next !== null && next.isConnected)
        next.focus()
    })
  })
}

/** A bare arrow press — a modified one belongs to the browser or the host. */
function isPlainArrow(event: KeyboardEvent, key: 'ArrowDown' | 'ArrowUp'): boolean {
  return event.key === key && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
}

/**
 * Handle a keydown on the element that owns the control's focus — the combobox
 * input, the filter, the trigger or the popup content, whichever the host focuses.
 *
 * `ArrowDown` / `ArrowUp` move focus onto the retry control, which is the whole of
 * the reachability fix. Both directions land on the same element because the error
 * state's navigable set has exactly one member, and the APG assigns `ArrowUp` the
 * last member of that set.
 *
 * Deliberately not gated on `event.defaultPrevented`: Reka's `ComboboxInput` binds
 * `@keydown.down.up.prevent`, so by the time the event reaches the control's root
 * the default is already prevented on every host that uses it. The gate that
 * matters is `retry()` — it is `null` unless the row is rendering a retry control,
 * which it does only in the `error` state, where these keys are measured no-ops.
 */
export function retryRouteOwnerKeydown(event: KeyboardEvent, route: RetryKeyboardRoute | null): void {
  if (route === null)
    return
  if (!isPlainArrow(event, 'ArrowDown') && !isPlainArrow(event, 'ArrowUp'))
    return
  const retry = route.retry()
  if (retry === null)
    return
  const target = event.target
  if (!isReturnTarget(target) || target === retry)
    return
  // An in-canvas panel puts the row inside the control's own root, so the row's keys
  // bubble through here too. They are the row's business, not the owner's.
  const row = route.row()
  if (row !== null && row.contains(target))
    return
  route.returnTo = target
  event.preventDefault()
  retry.focus()
}

/**
 * Remember where focus came from whenever it arrives inside the row from outside it.
 *
 * The arrow route records this itself, but it is not the only way in: an in-canvas
 * panel puts the row in the control's own tab order, so `Tab` reaches the retry
 * control without any of this module's keys being pressed, and an AT can focus it
 * directly from its own reading cursor. `focusin` bubbles and carries the element
 * losing focus as `relatedTarget`, so one listener on the row covers every route
 * there is — including routes that do not exist yet.
 *
 * Measured, before this: a keyboard user who reached the control by `Tab` on
 * `DzListbox` lost focus to the body the moment the retry succeeded, because nothing
 * had recorded where they came from.
 */
export function retryRouteRowFocusIn(event: FocusEvent, route: RetryKeyboardRoute | null): void {
  if (route === null)
    return
  const from = event.relatedTarget
  if (!isReturnTarget(from))
    return
  const row = route.row()
  if (row !== null && row.contains(from))
    return
  route.returnTo = from
}

/**
 * Handle a keydown inside the async-options row, which is the other half of the
 * route: `ArrowUp` hands focus back to whatever the owner was, so a keyboard user
 * who arrowed into the panel can get back to typing without dismissing it, and
 * `ArrowDown` keeps focus on the retry rather than scrolling the popup.
 *
 * `Tab`, `Shift+Tab` and `Escape` are deliberately untouched. They already mean
 * "leave the combobox" and "close the popup", which is what the APG says they mean,
 * and a control that redefined them would fix 2.1.1 by breaking the pattern.
 */
export function retryRouteRowKeydown(event: KeyboardEvent, route: RetryKeyboardRoute | null): void {
  if (route === null)
    return
  if (isPlainArrow(event, 'ArrowDown')) {
    const retry = route.retry()
    if (retry === null)
      return
    event.preventDefault()
    retry.focus()
    return
  }
  if (!isPlainArrow(event, 'ArrowUp'))
    return
  const back = route.returnTo
  if (!isReturnTarget(back))
    return
  event.preventDefault()
  back.focus()
}

/**
 * What a host offers the row and what the row hands back: the row writes its route
 * into `slot`, and reads the host's `exit` out of the same channel. One key, because
 * they are two halves of one arrangement and a second key would let a host provide
 * half of it.
 */
interface RetryRouteChannel {
  /** Written by the row on mount, read by the host's own `keydown` handler. */
  readonly slot: ShallowRef<RetryKeyboardRoute | null>
  /** Read by the row when it unmounts. `null` for a host that supplied none. */
  readonly exit: RetryRowExit | null
}

/**
 * The row and the focus owner are in different component subtrees — and, whenever
 * the panel is portalled, in different DOM trees — so the two halves of the route
 * are joined through the component tree rather than the DOM. `provide`/`inject`
 * survives a `Teleport`, which a DOM walk does not.
 */
const RETRY_ROUTE_SLOT = Symbol('dz-async-options-retry-route') as InjectionKey<RetryRouteChannel>

/**
 * Host side. Bind the returned handler to the control's root element's `keydown`,
 * and to the popup content's as well when the host moves focus into the popup
 * (`DzSelect`, whose `SelectContent` is a focus-trapped modal layer).
 *
 * @param own A route the host registers itself, for a host that renders its own copy
 * of the row instead of `DzOptionsState` — `DzSelect`, and only `DzSelect`. A
 * component cannot `inject` what it just `provide`d, so it passes the route in.
 * @param exit Where focus goes when the row unmounts (`D-RES06-1`). Only an
 * **in-canvas** host owes one, and only when the row can be the whole of its tab
 * order: `DzListbox` and `DzTransfer` were measured losing focus to the body,
 * `DzMention` was measured never losing it, and on a portalled host the route always
 * came from an input or trigger that outlives the row.
 */
export function provideRetryKeyboardRoute(
  own: RetryKeyboardRoute | null = null,
  exit: RetryRowExit | null = null,
): (event: KeyboardEvent) => void {
  const slot = shallowRef<RetryKeyboardRoute | null>(own)
  provide(RETRY_ROUTE_SLOT, { slot, exit })
  return (event: KeyboardEvent) => retryRouteOwnerKeydown(event, slot.value)
}

/**
 * Row side. Register this row's route with the host that provided a channel, take the
 * host's exit destination from it, and return the handlers to bind on the row's own
 * `keydown` and `focusin`.
 *
 * A host that has not called `provideRetryKeyboardRoute` gets no owner route and
 * supplies no exit, so the row keeps working exactly as before and nothing throws —
 * the rule stays additive, which is what let it be wired one host at a time.
 */
export function useRetryKeyboardRoute(route: RetryKeyboardRoute): {
  onRowKeydown: (event: KeyboardEvent) => void
  onRowFocusIn: (event: FocusEvent) => void
} {
  const channel = inject(RETRY_ROUTE_SLOT, null)
  if (channel !== null) {
    const slot = channel.slot
    onMounted(() => {
      slot.value = route
    })
    onUnmounted(() => {
      if (slot.value === route)
        slot.value = null
    })
  }
  useRetryRowExit(route, channel?.exit ?? null)
  return {
    onRowKeydown: (event: KeyboardEvent) => retryRouteRowKeydown(event, route),
    onRowFocusIn: (event: FocusEvent) => retryRouteRowFocusIn(event, route),
  }
}
