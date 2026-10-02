<script setup lang="ts">
import type {
  DzTransferEmits,
  DzTransferProps,
  DzTransferSlots,
} from './DzTransfer.types.ts'
import { Check } from '@lucide/vue'
/**
 * DzTransfer — Dual-list transfer component.
 *
 * Built from scratch (no Reka UI primitive).
 * v-model via defineModel<string[]>() -- selected keys (ADR-16).
 */
import { computed, ref, toRef, useAttrs, useId } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useAsyncOptions } from '../../composables/useAsyncOptions/index.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useTransfer } from '../../composables/useTransfer/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { focusedIndexIn, ownsItsOwnCaret } from '../../utilities/keyboardTargets.ts'
import DzOptionsState from './DzOptionsState.vue'
import { transferVariants } from './DzTransfer.variants.ts'
import { provideRetryKeyboardRoute } from './optionsStateFocus.ts'

defineOptions({
  inheritAttrs: false,
})

/** modelValue = array of keys currently in the target list */
const model = defineModel<string[]>({ default: () => [] })

const props = withDefaults(defineProps<DzTransferProps>(), {
  optionsState: undefined,
  optionsError: undefined,
  optionsRetryable: undefined,
  target: undefined,
  searchable: false,
  disabled: false,
  size: 'md',
  searchPlaceholder: undefined,
  invalid: false,
  error: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzTransferEmits>()
defineSlots<DzTransferSlots>()

// The async-options rows are one shared group across all seven selection
// controls, so a translator writes them once (renderer contract C9).
const dzAsyncMessages = useComponentMessages('DzAsyncOptions')

/**
 * The async-options seam (renderer contract C9).
 *
 * Inert unless the host passes `optionsState`, so a control with a static
 * option array behaves exactly as it did. Every request supersedes and aborts
 * the last, so a host that fences on the signal never has two in flight.
 */
const {
  row: optionsRow,
  state: resolvedOptionsState,
  canRetry: canRetryOptions,
  announcement: optionsAnnouncement,
  request: requestOptions,
} = useAsyncOptions(
  {
    state: () => props.optionsState,
    error: () => props.optionsError,
    retryable: () => props.optionsRetryable,
    hasOptions: () => props.source.length > 0,
    emit: request => emit('loadOptions', request),
  },
  () => ({
    loading: dzAsyncMessages.value.loading,
    empty: dzAsyncMessages.value.empty,
    error: dzAsyncMessages.value.error,
  }),
)

function handleRetryOptions(): void {
  emit('retryOptions')
  requestOptions('open')
}
// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzTransfer')
const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder ?? dzMessages.value.searchPlaceholder)
const resolvedAriaLabel = computed(() => props.ariaLabel ?? dzMessages.value.ariaLabel)

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const resolvedRequired = computed(
  () => props.required || (fieldContext?.isRequired.value ?? false),
)

/** ID for the error message element (for aria-describedby) */
const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/** Combined aria-describedby from prop + own error element + field context */
const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby)
    parts.push(props.ariaDescribedby)
  if (errorId.value)
    parts.push(errorId.value)
  if (fieldContext?.ariaDescribedby.value)
    parts.push(fieldContext.ariaDescribedby.value)
  return parts.length > 0 ? parts.join(' ') : undefined
})

const styles = computed(() =>
  transferVariants({
    size: props.size,
    disabled: resolvedDisabled.value || undefined,
  }),
)

/** Lists row classes — danger border on each list when invalid */
const groupClasses = computed(() =>
  cn(styles.value.root(), resolvedInvalid.value && '[&_[data-dz-transfer-list]]:border-[var(--dz-danger)]'),
)

/** Outer wrapper carries the consumer class so the error message stacks below */
const wrapperClasses = computed(() =>
  cn('flex flex-col gap-[var(--dz-spacing-1_5)]', attrs.class as string | undefined),
)

const {
  sourceSearch,
  targetSearch,
  sourceSelected,
  targetSelected,
  sourceItems,
  targetItems,
  filteredSourceItems,
  filteredTargetItems,
  toggleSourceItem,
  toggleTargetItem,
  moveToTarget: transferMoveToTarget,
  moveToSource: transferMoveToSource,
} = useTransfer({
  source: toRef(() => props.source),
  modelValue: model,
  searchable: toRef(() => props.searchable),
})

function emitChange(targetKeys: string[]): void {
  const sourceKeys = props.source
    .map(i => i.key)
    .filter(k => !targetKeys.includes(k))
  emit('change', { source: sourceKeys, target: targetKeys })
}

function moveToTarget(): void {
  const newModel = transferMoveToTarget()
  model.value = newModel
  emitChange(newModel)
}

function moveToSource(): void {
  const newModel = transferMoveToSource()
  model.value = newModel
  emitChange(newModel)
}

function isItemDisabled(item: { disabled?: boolean }): boolean {
  return resolvedDisabled.value || !!item.disabled
}

function selectSourceItem(item: Parameters<typeof toggleSourceItem>[0]): void {
  if (resolvedDisabled.value)
    return
  toggleSourceItem(item)
}

function selectTargetItem(item: Parameters<typeof toggleTargetItem>[0]): void {
  if (resolvedDisabled.value)
    return
  toggleTargetItem(item)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
/**
 * Renderer contract C9.4's keyboard **route** (RESIDUAL-06). The async-options row
 * registers itself through the component tree; this binds the owner half to the
 * control's root, so a bare `ArrowDown` from the element that owns this control's
 * focus reaches the retry control the row renders — the only key that can, because
 * `Tab` is the combobox pattern's way out of the popup. One definition of the rule,
 * in `optionsStateFocus.ts`; the argument and the seven measured dead ends are there.
 */
/**
 * Where focus goes when the async-options row **unmounts** (`D-RES06-1`, RESIDUAL-07).
 *
 * This control is the extreme case the shared row could not solve alone: in the error
 * state it has **zero** tabbable elements outside the row, so the row *is* the whole
 * tab order, the very first `Tab` arrives from `document.body`, and the row refuses
 * the body as a place to hand focus back to. Focus was parked on the row, and a
 * **successful** retry unmounted it: measured `document.activeElement = BODY` exactly
 * when the source list appeared.
 *
 * The destination is the first enabled option of the source list — the list this
 * control has just rendered in the row's place. It cannot be resolved any earlier than
 * the row's unmount, because the answer that removes the row is the answer that creates
 * it; that is why the shared row asks for a callback and calls it after the flush.
 * Queried by `role` rather than by anatomy part: `validate:anatomy-parts` reads this
 * file as text and cannot tell an attribute literal in a selector from an emission.
 */
const sourceBodyRef = ref<HTMLElement | null>(null)
function asyncOptionsExit(): HTMLElement | null {
  return sourceBodyRef.value?.querySelector<HTMLElement>('[role="option"]:not([data-disabled])') ?? null
}
const handleAsyncOptionsKeydown = provideRetryKeyboardRoute(null, asyncOptionsExit)

/**
 * APG `listbox` navigation inside one pane (RESIDUAL-13, closing RESIDUAL-12 §4
 * `F6`).
 *
 * **Four rows, not two.** RESIDUAL-12 measured `Home` and `End` as unbacked, and
 * measuring where the *other* two were attributed is what made this the larger
 * repair: `ArrowDown` and `ArrowUp` were resolved to
 * `optionsStateFocus.ts:294`/`:280`, which is `retryRouteOwnerKeydown` — a
 * handler that moves focus onto the **retry control of the async error state**.
 * That is a real behaviour and it is not what the rows say. Both declare *"Move
 * focus to the next / previous option"*, and in a pane with options there was no
 * code that did it. So the citation was true about a file and false about the
 * claim, which is the one failure mode a validator cannot catch for itself. All
 * four keys are now handled here, and the two that already read as backed read as
 * backed for the right reason.
 *
 * The two handlers cannot collide: `retryRouteOwnerKeydown` does nothing unless
 * `route.retry()` returns a control, which happens only in the async **error**
 * state — and in that state a pane renders no options, so this handler returns
 * before it prevents anything.
 *
 * `event.currentTarget` is the pane rather than a template ref, because there are
 * two panes and only the source one has ever needed a ref.
 *
 * **No wrapping.** The APG `listbox` pattern moves to the next option and stops;
 * a ring is the `toolbar`/`menu` behaviour, and `DzToolbar` wraps for exactly that
 * reason.
 */
function onPaneKeydown(event: KeyboardEvent): void {
  const pane = event.currentTarget
  if (!(pane instanceof HTMLElement))
    return
  // Queried by `role` rather than by anatomy part, for the reason
  // `asyncOptionsExit` above already records: `validate:anatomy-parts` reads this
  // file as text and cannot tell a selector from an emission.
  const options = Array.from(pane.querySelectorAll<HTMLElement>('[role="option"]:not([data-disabled])'))
  if (options.length === 0)
    return

  const current = focusedIndexIn(options, event)
  let next: number | null = null
  switch (event.key) {
    case 'ArrowDown':
      next = current + 1
      break
    case 'ArrowUp':
      next = current === -1 ? options.length - 1 : current - 1
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = options.length - 1
      break
    default:
      next = typeAheadIndex(event, options, current)
      break
  }

  if (next === null)
    return
  event.preventDefault()
  options[Math.max(0, Math.min(next, options.length - 1))]?.focus()
}

/**
 * APG `listbox` type-ahead (RESIDUAL-15, closing `D-RES14-2`).
 *
 * The `<character>` row — *"Move focus to the next option whose label starts with
 * that character."* — has been published since TASK-R5-O5 and was `backed` until
 * RESIDUAL-14 by the pane's `searchable` text `<input>`: a field that **filters**
 * the list, which is not moving focus among the options that remain. §2.2.2(d)
 * measured that `onPaneKeydown` handled the four navigation keys "and nothing
 * else; no type-ahead exists anywhere in the component", and it is the second
 * instance of the shape RESIDUAL-13 fixed on `DzOrderList`.
 *
 * Modelled on `DzOrderList.vue`'s `typeAhead` and for the same reasons:
 *
 * - **The label is read from the rendered option, not from the item.** A pane
 *   option's content is `<slot name="item">` with `{{ item.label }}` as the
 *   fallback, so `textContent` is the only thing that matches what a screen
 *   reader announces. Matching `item.label` would work for the default and stop
 *   working for every consumer who filled the slot.
 * - **Search starts after the focused option and wraps**, so repeating a
 *   character cycles through same-initial options instead of sticking on the
 *   first. The *arrow* rows deliberately do not wrap (see above); type-ahead is a
 *   search rather than a step, and APG describes it as cyclic.
 * - **Disabled options are already excluded**, because `options` is queried
 *   `:not([data-disabled])`.
 *
 * It is a **local function, not a shared helper**, and that is a decision rather
 * than duplication. `utilities/keyboardTargets.ts`'s docblock states the rule: a
 * shared helper that names a key hands every importer credit for that key in
 * `validate:anatomy-keyboard`. `keysNamedIn` reads both `/typeahead/i` and
 * `event.key.length === 1` as the `<character>` placeholder, so a shared
 * `typeAhead` would make every component that imported it read as implementing
 * listbox type-ahead. Two ~20-line functions that can be read beside their own
 * `switch` are the cheaper mistake.
 *
 * @returns the option index to move to, or `null` when the key is not a printable
 * character or no label matches — `null` leaves the event alone, which matters
 * because a pane also contains a search field and a scrollable list.
 */
function typeAheadIndex(event: KeyboardEvent, options: readonly HTMLElement[], current: number): number | null {
  const printable = event.key.length === 1 && event.key !== ' '
  if (!printable || event.altKey || event.ctrlKey || event.metaKey)
    return null
  // An option's content is a `<slot name="item">`, so a consumer may have put a
  // field inside one. A character typed into a field is text entry, not a search
  // over the list — the reason `ownsItsOwnCaret` exists. The search `<input>` is
  // a sibling of this listbox rather than a descendant, so it never reaches here.
  if (ownsItsOwnCaret(event.target))
    return null
  const needle = event.key.toLowerCase()
  const from = current === -1 ? options.length - 1 : current
  for (let step = 1; step <= options.length; step++) {
    const candidate = (from + step) % options.length
    const label = options[candidate]?.textContent?.trim().toLowerCase() ?? ''
    if (label.startsWith(needle))
      return candidate
  }
  return null
}
</script>

<template>
  <div
    data-part="root"
    :class="[wrapperClasses, ui?.root]"
    v-bind="{ ...dzTestId('dz-transfer'), ...$attrs, class: undefined }"
    @keydown="handleAsyncOptionsKeydown"
  >
    <div
      :id="resolvedId"
      data-part="control"
      :class="[groupClasses, ui?.control]"
      :data-disabled="resolvedDisabled ? '' : undefined"
      :data-required="resolvedRequired ? '' : undefined"
      :data-state="resolvedDisabled ? 'disabled' : undefined"
      :data-invalid="resolvedInvalid ? '' : undefined"
      :aria-label="resolvedAriaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="resolvedAriaDescribedby"
      :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
      role="group"
      class="[contain:layout_style]"
      @focus.capture="handleFocus"
      @blur.capture="handleBlur"
    >
      <!--
        One row instead of the list while the host is loading, has nothing, or
        failed (renderer contract C9). `optionsRow` is null whenever the control
        is static, so a control with a plain option array renders none of this.
      -->
      <DzOptionsState
        v-if="optionsRow !== null"
        :state="resolvedOptionsState"
        :message="optionsAnnouncement"
        :can-retry="canRetryOptions"
        @retry="handleRetryOptions"
      />
      <!-- Source list -->
      <div data-part="list" :class="[styles.list(), ui?.list]" data-dz-transfer-list>
        <div data-part="header" :class="[styles.listHeader(), ui?.header]">
          <slot name="source-header">
            <span>Source</span>
          </slot>
          <span data-part="hint" :class="[styles.listCount(), ui?.hint]">
            {{ sourceSelected.size }}/{{ sourceItems.length }}
          </span>
        </div>
        <input
          v-if="searchable"
          v-model="sourceSearch"
          type="text"
          data-part="input"
          :class="[styles.searchInput(), ui?.input]"
          :placeholder="resolvedSearchPlaceholder"
          :aria-label="dzMessages.searchSource"
        >
        <div
          ref="sourceBodyRef"
          data-part="body"
          :class="[styles.listBody(), ui?.body]"
          role="listbox"
          :aria-label="dzMessages.sourceItems"
          aria-multiselectable="true"
          :aria-disabled="resolvedDisabled || undefined"
          @keydown="onPaneKeydown"
        >
          <template v-if="filteredSourceItems.length > 0">
            <div
              v-for="item in filteredSourceItems"
              :key="item.key"
              data-part="item"
              :class="[cn(styles.item(), sourceSelected.has(item.key) ? styles.itemSelected() : ''), ui?.item]"
              :data-disabled="isItemDisabled(item) ? '' : undefined"
              role="option"
              :aria-selected="sourceSelected.has(item.key)"
              :aria-disabled="isItemDisabled(item) || undefined"
              :tabindex="isItemDisabled(item) ? -1 : 0"
              @click="selectSourceItem(item)"
              @keydown.enter.prevent="selectSourceItem(item)"
              @keydown.space.prevent="selectSourceItem(item)"
            >
              <slot name="item" :item="item" :selected="sourceSelected.has(item.key)">
                <span
                  data-part="item-indicator"
                  :class="[styles.itemCheckbox(), ui?.['item-indicator']]"
                  :data-checked="sourceSelected.has(item.key)"
                  data-transfer-check
                  aria-hidden="true"
                >
                  <Check v-if="sourceSelected.has(item.key)" class="h-3 w-3" />
                </span>
                <span data-part="item-label" :class="[ui?.['item-label']]">{{ item.label }}</span>
              </slot>
            </div>
          </template>
          <div v-else data-part="empty" :class="[styles.empty(), ui?.empty]">
            No items
          </div>
        </div>
      </div>

      <!-- Transfer actions -->
      <div data-part="group" :class="[styles.actions(), ui?.group]">
        <button
          type="button"
          data-part="action"
          :class="[styles.actionButton(), ui?.action]"
          :disabled="sourceSelected.size === 0 || resolvedDisabled"
          :aria-label="dzMessages.moveToTarget"
          @click="moveToTarget"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            data-part="icon"
            class="h-4 w-4"
            :class="[ui?.icon]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button
          type="button"
          data-part="action"
          :class="[styles.actionButton(), ui?.action]"
          :disabled="targetSelected.size === 0 || resolvedDisabled"
          :aria-label="dzMessages.moveToSource"
          @click="moveToSource"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            data-part="icon"
            class="h-4 w-4"
            :class="[ui?.icon]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <!-- Target list -->
      <div data-part="list" :class="[styles.list(), ui?.list]" data-dz-transfer-list>
        <div data-part="header" :class="[styles.listHeader(), ui?.header]">
          <slot name="target-header">
            <span>Target</span>
          </slot>
          <span data-part="hint" :class="[styles.listCount(), ui?.hint]">
            {{ targetSelected.size }}/{{ targetItems.length }}
          </span>
        </div>
        <input
          v-if="searchable"
          v-model="targetSearch"
          type="text"
          data-part="input"
          :class="[styles.searchInput(), ui?.input]"
          :placeholder="resolvedSearchPlaceholder"
          :aria-label="dzMessages.searchTarget"
        >
        <div
          data-part="body"
          :class="[styles.listBody(), ui?.body]"
          role="listbox"
          :aria-label="dzMessages.targetItems"
          aria-multiselectable="true"
          :aria-disabled="resolvedDisabled || undefined"
          :aria-required="resolvedRequired || undefined"
          @keydown="onPaneKeydown"
        >
          <template v-if="filteredTargetItems.length > 0">
            <div
              v-for="item in filteredTargetItems"
              :key="item.key"
              data-part="item"
              :class="[cn(styles.item(), targetSelected.has(item.key) ? styles.itemSelected() : ''), ui?.item]"
              :data-disabled="isItemDisabled(item) ? '' : undefined"
              role="option"
              :aria-selected="targetSelected.has(item.key)"
              :aria-disabled="isItemDisabled(item) || undefined"
              :tabindex="isItemDisabled(item) ? -1 : 0"
              @click="selectTargetItem(item)"
              @keydown.enter.prevent="selectTargetItem(item)"
              @keydown.space.prevent="selectTargetItem(item)"
            >
              <slot name="item" :item="item" :selected="targetSelected.has(item.key)">
                <span
                  data-part="item-indicator"
                  :class="[styles.itemCheckbox(), ui?.['item-indicator']]"
                  :data-checked="targetSelected.has(item.key)"
                  data-transfer-check
                  aria-hidden="true"
                >
                  <Check v-if="targetSelected.has(item.key)" class="h-3 w-3" />
                </span>
                <span data-part="item-label" :class="[ui?.['item-label']]">{{ item.label }}</span>
              </slot>
            </div>
          </template>
          <div v-else data-part="empty" :class="[styles.empty(), ui?.empty]">
            No items
          </div>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      data-part="error"
      class="text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      :class="[ui?.error]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
