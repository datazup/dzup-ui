<script setup lang="ts">
import type { DzListItemEmits, DzListItemProps, DzListItemSlots } from './DzList.types.ts'
/**
 * DzListItem — Child item within a DzList compound component.
 *
 * Inherits size, variant, and interactive settings from parent DzList
 * via inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzListItem>Simple item</DzListItem>
 * <DzListItem active tone="primary">
 *   <template #prefix><UserIcon /></template>
 *   Active item
 * </DzListItem>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_LIST_KEY } from './DzList.types.ts'
import { listVariants } from './DzList.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzListItemProps>(), {
  disabled: false,
  active: false,
  tone: undefined,
})

const emit = defineEmits<DzListItemEmits>()
defineSlots<DzListItemSlots>()

const attrs = useAttrs()
const listContext = inject(DZ_LIST_KEY, null)

const styles = computed(() =>
  listVariants({
    variant: listContext?.variant.value ?? 'plain',
    size: listContext?.size.value ?? 'md',
    interactive: listContext?.interactive.value ?? false,
  }),
)

const classes = computed(() =>
  cn(
    styles.value.item(),
    props.active ? 'bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)]' : '',
    'dz-disabled-control',
    attrs.class as string | undefined,
  ),
)

function handleClick(event: MouseEvent): void {
  if (props.disabled)
    return
  if (listContext?.interactive.value) {
    emit('click', event)
  }
}

/**
 * Enter and Space activate an interactive row (RESIDUAL-13, closing
 * RESIDUAL-12 §4 `F9`).
 *
 * `DzListItem.anatomy.ts` has published both rows as APG `button` activation
 * since TASK-R5-O5, and until now an interactive row took `tabindex="0"` and
 * answered only the mouse — a keyboard user could reach the row and not use it,
 * which is an SC 2.1.1 failure rather than a documentation error. RESIDUAL-12
 * measured it and said in terms that *deleting* the two rows would have hidden
 * the defect, so the rows stayed and the behaviour arrived.
 *
 * **It synthesises a click rather than emitting a hand-built event, and that is
 * the decision, not an implementation detail.** `DzListItemEmits` types `click`
 * as a `MouseEvent`, and RESIDUAL-12 recorded that signature as the reason it
 * left this open. Widening it to `MouseEvent | KeyboardEvent` is the obvious
 * alternative and was rejected: a consumer whose handler is typed
 * `(event: MouseEvent) => void` stops compiling, which makes a keyboard fix a
 * breaking change to everybody who never had the bug. Dispatching a real click
 * is what the platform itself does to activate a `<button>`, it keeps the
 * published signature true rather than merely unchanged, and it means a
 * keyboard activation and a pointer activation are the *same* event for every
 * listener — this component's `@click`, and any `onClick` a consumer passed
 * through `$attrs`.
 */
function handleKeydown(event: KeyboardEvent): void {
  if (props.disabled || listContext?.interactive.value !== true)
    return
  if (event.key !== 'Enter' && event.key !== ' ')
    return
  // Space scrolls the page and Enter submits an enclosing form. An activation
  // key does neither.
  event.preventDefault()
  ;(event.currentTarget as HTMLElement | null)?.click()
}

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <li
    :id="id"
    data-part="root"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :aria-selected="active || undefined"
    :aria-disabled="disabled || undefined"
    :data-state="active ? 'active' : undefined"
    :data-tone="tone"
    :data-disabled="disabled ? '' : undefined"
    :tabindex="listContext?.interactive.value ? 0 : undefined"
    role="listitem"
    v-bind="{ ...dzTestId('dz-list-item'), ...$attrs, class: undefined }"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <slot name="prefix" />
    <span data-part="item-label" :class="cn('flex-1', ui?.['item-label'])"><slot /></span>
    <slot name="suffix" />
  </li>
</template>
