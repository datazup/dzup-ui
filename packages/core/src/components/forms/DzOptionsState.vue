<script setup lang="ts">
import type { AsyncOptionsState } from '@dzup-ui/contracts'
/**
 * DzOptionsState — the one row a selection control shows instead of its list
 * while options are loading, empty, or failed (renderer contract C9).
 *
 * **Internal.** Not exported from the family barrel and not a public component:
 * it exists so that seven controls render the *same* row rather than seven
 * near-copies of it. The alternative was pasting a `role="status"` block into
 * `DzSelect`, `DzMultiSelect`, `DzCombobox`, `DzListbox`, `DzCascader`,
 * `DzTreeSelect` and `DzTransfer` and hoping the seventh copy still matched the
 * first a year later — which is the failure this whole program is about.
 *
 * `role="status"` with `aria-live="polite"`, because these arrive *after* first
 * paint: a user who opened a panel and is waiting has no other way to learn
 * that the load finished or failed. Polite rather than assertive — it is
 * information, not an interruption.
 *
 * @module @dzup-ui/core/components/forms/DzOptionsState
 */
import { computed, ref } from 'vue'
import { enAsyncOptionsMessages } from '../../i18n/messages.ts'
import { useMessageGroup } from '../../i18n/useMessageGroup.ts'
import { cn } from '../../utilities/cn.ts'
import {
  createRetryKeyboardRoute,
  retryFocusDestination,
  useRetryKeyboardRoute,
  withRetryFocusReturn,
} from './optionsStateFocus.ts'

const props = withDefaults(
  defineProps<{
    /** The resolved state, from `useAsyncOptions`. */
    state: AsyncOptionsState
    /** What the row should say, already resolved against the app catalog. */
    message: string
    /** Whether to render the retry control. */
    canRetry?: boolean
    /** Extra classes for the row, usually the control's `empty` part. */
    rowClass?: string
  }>(),
  { canRetry: false, rowClass: undefined },
)

const emit = defineEmits<{ retry: [] }>()

const dzMessages = useMessageGroup('DzAsyncOptions', enAsyncOptionsMessages)

const rowRef = ref<HTMLElement | null>(null)
const retryRef = ref<HTMLButtonElement | null>(null)

/**
 * C9.4's third part: the keyboard **route** to the retry control (RESIDUAL-06).
 *
 * The row registers itself with its host, which binds the other half of the route to
 * the element that owns this control's focus. From there a bare `ArrowDown` reaches
 * the retry control and `ArrowUp` hands focus back, which is the only reason a
 * keyboard user can operate the control at all — measured: seven routes reached it
 * zero times before this, and the one affordance that recovers a failed option load
 * was a WCAG 2.1.1 failure. Both halves live in `optionsStateFocus.ts`, so there is
 * one definition of the rule rather than one per host; the argument is written there.
 */
const retryRoute = createRetryKeyboardRoute(() => retryRef.value, () => rowRef.value)
const { onRowKeydown, onRowFocusIn } = useRetryKeyboardRoute(retryRoute)

/**
 * The second half of renderer contract C9.4: after the retry control disappears,
 * focus is returned to a stable element instead of being dropped on the body.
 *
 * The destination is where the keyboard route took focus from — this control's own
 * input or trigger — and the row only when nothing came before it. Both are stable,
 * both are named parts, and the ordering is the fix for a defect the route exposed:
 * the row is stable while the retry is *loading* and stops being stable the moment it
 * **succeeds**, because the row unmounts with focus on it. `DzMention` has returned
 * focus to its text control since the seam shipped and was right to;
 * `retryFocusDestination` is that choice generalised, and the reasoning is documented
 * beside it.
 */
const focusDestination = retryFocusDestination(retryRoute)

function handleRetry(): void {
  withRetryFocusReturn(retryRef.value, focusDestination, () => emit('retry'))
}

const rowClasses = computed(() =>
  cn(
    'flex flex-col items-center gap-[var(--dz-spacing-2)]',
    'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-4)]',
    'text-center text-[length:var(--dz-text-sm)] text-[var(--dz-muted-foreground)]',
    // The row becomes the focus destination above, so the destination is visible.
    // Inset, because the ring of a row inside a popper must not overflow the panel.
    'dz-focus-ring-control-inset',
    props.rowClass,
  ),
)

const retryClasses = cn(
  'rounded-[var(--dz-radius-sm)]',
  'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
  'text-[length:var(--dz-text-sm)] text-[var(--dz-primary-muted-foreground)]',
  'underline underline-offset-2',
  'dz-focus-ring-control',
  'hover:bg-[var(--dz-muted)]',
  'transition-colors motion-reduce:transition-none',
)
</script>

<template>
  <div
    ref="rowRef"
    data-part="options-state"
    :data-options-state="state"
    :class="rowClasses"
    role="status"
    aria-live="polite"
    tabindex="-1"
    @focusin="onRowFocusIn"
    @keydown="onRowKeydown"
  >
    <span data-part="options-message">{{ message }}</span>
    <!--
      `@mousedown.prevent` is load-bearing, not tidying (RESIDUAL-04, 2026-09-25).

      `canRetry` is false the moment the state leaves `error`, so this control
      **removes itself as it is pressed** — and a pointer press focuses it first,
      which is what a browser does. The removal then hands focus to
      `document.body`, and every portalled panel that hosts this row is a
      dismissable layer (Reka's `ComboboxContent`), which reads focus arriving on
      `body` as focus leaving the layer and **closes the panel under the user** —
      so the retry the user just asked for is never seen.

      Measured in real chromium: with a focusing press, the panel's `content` part
      is gone from the document, this button is detached, and `activeElement` is
      `BODY`; with a press that does not move focus, the content part is present
      and open and `activeElement` is still the panel's own input. Preventing the
      mousedown default keeps focus where the panel put it, which is also the
      WAI-ARIA combobox rule: the panel's focus owner does not change because a
      control inside the panel was pressed.

      The `click` still fires, so activation is unaffected by this binding —
      including keyboard activation, which never sends a mousedown at all. That is
      why the binding alone was never the whole of C9.4: `handleRetry` above is the
      other half, and it is the half a keyboard user needs (RESIDUAL-05 measured
      `activeElement` landing on the body after both Enter and Space). `DzMention`
      has carried this binding on its own instance of this row since the seam
      shipped, and its contract spec asserts it as clause C9.4 — the other six
      hosts never did, which is the whole argument for putting it here instead.

      NB for the next editor: do not write the attribute-literal forms of the
      anatomy names in this comment. `validate:anatomy-parts` reads the SFC as
      text, so a quoted part or state name inside a comment is indistinguishable
      from an emission and the gate fails with `undeclared-emission` (it did,
      against the first draft of this note).
    -->
    <button
      v-if="canRetry"
      ref="retryRef"
      type="button"
      data-part="options-retry"
      :class="retryClasses"
      @mousedown.prevent
      @click="handleRetry"
    >
      {{ dzMessages.retry }}
    </button>
  </div>
</template>
