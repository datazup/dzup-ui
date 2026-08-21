<script setup lang="ts" generic="T">
import type {
  DzOrderListEmits,
  DzOrderListProps,
  DzOrderListSlots,
  OrderListKey,
  OrderListMove,
} from './DzOrderList.types.ts'
import {
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  GripVertical,
} from 'lucide-vue-next'
/**
 * DzOrderList — reorderable list with drag, control-button, and keyboard reorder.
 *
 * The ordered array is owned by the consumer via `v-model:value` (defineModel,
 * ADR-16); every reorder produces a brand-new array rather than mutating the
 * bound one. Reordering is available three ways:
 *  - pointer drag from each row's grab handle (native HTML drag-and-drop),
 *  - the Move Up / Down / Top / Bottom control buttons,
 *  - keyboard: focus a row, Space to grab, Arrow keys to move, Space to drop
 *    (Escape cancels). Position changes are announced via a polite live region.
 *
 * When `selectable`, multiple rows can be selected and moved together as a group.
 *
 * @example
 * ```vue
 * <DzOrderList v-model:value="tasks" data-key="id" selectable>
 *   <template #item="{ item }">{{ item.label }}</template>
 * </DzOrderList>
 * ```
 */
import { computed, nextTick, ref, useAttrs } from 'vue'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import DzIconButton from '../buttons/DzIconButton.vue'
import { orderListVariants } from './DzOrderList.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** modelValue = the ordered array (never mutated in place) */
const model = defineModel<T[]>('value', { default: () => [] })

const props = withDefaults(defineProps<DzOrderListProps>(), {
  variant: 'bordered',
  size: 'md',
  disabled: false,
  selectable: false,
  showControls: true,
  dragHandle: true,
  controlsPosition: 'start',
  dataKey: undefined,
  moveUpLabel: undefined,
  moveDownLabel: undefined,
  moveTopLabel: undefined,
  moveBottomLabel: undefined,
  // hardcoded-string-ok: never rendered. The prop is documented as "accessible
  // label for each row's drag handle", but the handle is `aria-hidden="true"`
  // — a pointer-only affordance, with the keyboard path exposed through the
  // Move Up/Down controls — so no element carries this string and no assistive
  // technology can reach it. Moving a dead string into the catalog would have
  // translated something nobody renders; giving the handle an accessible name
  // instead is an accessibility decision (TASK-OSS-P5-01), not a codemod.
  dragHandleLabel: 'Drag to reorder',
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
})

const emit = defineEmits<DzOrderListEmits>()
defineSlots<DzOrderListSlots<T>>()
// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzOrderList')
const resolvedMoveUpLabel = computed(() => props.moveUpLabel ?? dzMessages.value.moveUp)
const resolvedMoveDownLabel = computed(() => props.moveDownLabel ?? dzMessages.value.moveDown)
const resolvedMoveTopLabel = computed(() => props.moveTopLabel ?? dzMessages.value.moveTop)
const resolvedMoveBottomLabel = computed(() => props.moveBottomLabel ?? dzMessages.value.moveBottom)

const attrs = useAttrs()

// ── State ──────────────────────────────────────────────────────────────────

/** Roving-tabindex focus position */
const activeIndex = ref(0)
/** Selected stable keys (only meaningful when `selectable`) */
const selectedKeys = ref<Set<OrderListKey>>(new Set())
/** Index of the row grabbed for keyboard reordering, or null */
const grabbedIndex = ref<number | null>(null)
/** Index a keyboard grab started at (for Escape-to-cancel) */
const grabStartIndex = ref<number | null>(null)
/** Index of the row being pointer-dragged, or null */
const draggingIndex = ref<number | null>(null)
/** Insertion index (0..length) for the active pointer drag, or null */
const dropIndex = ref<number | null>(null)
/** Row whose handle armed a pointer drag (HTML5 dnd handle restriction) */
const armedIndex = ref<number | null>(null)
/** Polite live-region message announcing position changes */
const liveMessage = ref('')

/** Per-row element refs for roving focus management */
const itemEls = ref<HTMLElement[]>([])
function setItemEl(el: unknown, index: number): void {
  const node = (el as { $el?: unknown } | null)?.$el ?? el
  if (node instanceof HTMLElement)
    itemEls.value[index] = node
}

// ── Derived ──────────────────────────────────────────────────────────────

const styles = computed(() =>
  orderListVariants({
    variant: props.variant,
    size: props.size,
    interactive: props.selectable,
    disabled: props.disabled,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

/** Resolve a stable key for an item (from `dataKey`, else its index) */
function resolveKey(item: T, index: number): OrderListKey {
  if (props.dataKey && item != null && typeof item === 'object') {
    const value = (item as Record<string, unknown>)[props.dataKey]
    if (typeof value === 'string' || typeof value === 'number')
      return value
  }
  return index
}

function isSelected(item: T, index: number): boolean {
  return props.selectable && selectedKeys.value.has(resolveKey(item, index))
}

/**
 * The indices the controls/keyboard act on: the current selection when one
 * exists, otherwise the single focused row.
 */
function targetIndices(): number[] {
  if (props.selectable && selectedKeys.value.size > 0) {
    return model.value
      .map((item, i) => ({ i, key: resolveKey(item, i) }))
      .filter(({ key }) => selectedKeys.value.has(key))
      .map(({ i }) => i)
  }
  return model.value.length > 0 ? [activeIndex.value] : []
}

const canMoveUp = computed(() => {
  if (props.disabled)
    return false
  const idx = targetIndices()
  return idx.length > 0 && Math.min(...idx) > 0
})

const canMoveDown = computed(() => {
  if (props.disabled)
    return false
  const idx = targetIndices()
  return idx.length > 0 && Math.max(...idx) < model.value.length - 1
})

// ── Announcements ──────────────────────────────────────────────────────────

function announce(message: string): void {
  // Clear first so identical consecutive messages are still announced.
  liveMessage.value = ''
  nextTick(() => {
    liveMessage.value = message
  })
}

function announceMove(toIndex: number): void {
  announce(`Item moved to position ${toIndex + 1} of ${model.value.length}.`)
}

// ── Focus management ────────────────────────────────────────────────────────

function focusItem(index: number): void {
  activeIndex.value = index
  nextTick(() => {
    itemEls.value[index]?.focus()
  })
}

// ── Reorder primitives ──────────────────────────────────────────────────────

/** Swap two array positions in place. */
function swap(arr: T[], a: number, b: number): void {
  const tmp = arr[a] as T
  arr[a] = arr[b] as T
  arr[b] = tmp
}

/** Move a single item and emit `reorder`. */
function reorderSingle(from: number, to: number): void {
  const clampedTo = Math.max(0, Math.min(to, model.value.length - 1))
  if (clampedTo === from)
    return
  const next = [...model.value]
  const moved = next.splice(from, 1)[0] as T
  next.splice(clampedTo, 0, moved)
  model.value = next
  emit('reorder', { from, to: clampedTo })
}

/** Apply a group/single move command from the controls or keyboard. */
function performMove(move: OrderListMove): void {
  if (props.disabled)
    return
  const indices = targetIndices().slice().sort((a, b) => a - b)
  if (indices.length === 0)
    return

  const anchorItem = model.value[activeIndex.value]
  const next = [...model.value]
  // Capture the actual item objects so positions can be recomputed as the
  // working array mutates (handles non-contiguous group selections).
  const selectedItems = indices.map(i => model.value[i] as T)
  const fromIndex = activeIndex.value
  let changed = false

  if (move === 'up') {
    for (const item of selectedItems) {
      const cur = next.indexOf(item)
      if (cur <= 0)
        break
      swap(next, cur - 1, cur)
      changed = true
    }
  }
  else if (move === 'down') {
    for (let i = selectedItems.length - 1; i >= 0; i--) {
      const cur = next.indexOf(selectedItems[i] as T)
      if (cur === -1 || cur >= next.length - 1)
        break
      swap(next, cur + 1, cur)
      changed = true
    }
  }
  else if (move === 'top') {
    for (let i = selectedItems.length - 1; i >= 0; i--) {
      const item = selectedItems[i] as T
      const cur = next.indexOf(item)
      if (cur > 0) {
        next.splice(cur, 1)
        next.unshift(item)
        changed = true
      }
    }
  }
  else if (move === 'bottom') {
    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i] as T
      const cur = next.indexOf(item)
      if (cur !== -1 && cur < next.length - 1) {
        next.splice(cur, 1)
        next.push(item)
        changed = true
      }
    }
  }

  if (!changed)
    return

  model.value = next
  const newAnchorIndex = anchorItem != null ? next.indexOf(anchorItem) : fromIndex
  if (newAnchorIndex !== -1)
    activeIndex.value = newAnchorIndex
  emit('reorder', { from: fromIndex, to: activeIndex.value })
  announceMove(activeIndex.value)
  nextTick(() => itemEls.value[activeIndex.value]?.focus())
}

// ── Selection ────────────────────────────────────────────────────────────

function toggleSelection(item: T, index: number): void {
  if (!props.selectable || props.disabled)
    return
  const key = resolveKey(item, index)
  const next = new Set(selectedKeys.value)
  if (next.has(key))
    next.delete(key)
  else next.add(key)
  selectedKeys.value = next
  emit('selectionChange', [...next])
}

function handleItemClick(item: T, index: number): void {
  activeIndex.value = index
  toggleSelection(item, index)
}

// ── Pointer drag (HTML5 drag-and-drop, handle-initiated) ────────────────────

function armDrag(index: number): void {
  if (!props.disabled && props.dragHandle)
    armedIndex.value = index
}

function handleDragStart(event: DragEvent, index: number): void {
  if (props.disabled || armedIndex.value !== index) {
    event.preventDefault()
    return
  }
  draggingIndex.value = index
  activeIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    // Required for Firefox to start the drag.
    event.dataTransfer.setData('text/plain', String(index))
  }
}

function handleDragOver(event: DragEvent, index: number): void {
  if (draggingIndex.value === null)
    return
  event.preventDefault()
  if (event.dataTransfer)
    event.dataTransfer.dropEffect = 'move'
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const afterHalf = event.clientY - rect.top > rect.height / 2
  dropIndex.value = afterHalf ? index + 1 : index
}

function handleDrop(event: DragEvent): void {
  if (draggingIndex.value === null || dropIndex.value === null) {
    resetDrag()
    return
  }
  event.preventDefault()
  const from = draggingIndex.value
  let to = dropIndex.value
  if (to > from)
    to -= 1
  if (to !== from) {
    reorderSingle(from, to)
    activeIndex.value = to
    announceMove(to)
  }
  resetDrag()
}

function resetDrag(): void {
  draggingIndex.value = null
  dropIndex.value = null
  armedIndex.value = null
}

/** Extra per-row classes for selection / grab / drop-indicator state. */
function itemStateClass(item: T, index: number): string {
  return cn(
    isSelected(item, index) && styles.value.itemSelected(),
    (grabbedIndex.value === index || draggingIndex.value === index) && styles.value.itemGrabbed(),
    draggingIndex.value !== null && dropIndex.value === index && styles.value.dropBefore(),
    draggingIndex.value !== null
    && dropIndex.value === index + 1
    && index === model.value.length - 1
    && styles.value.dropAfter(),
  )
}

// ── Keyboard ────────────────────────────────────────────────────────────────

function moveGrabbed(delta: number): void {
  if (grabbedIndex.value === null)
    return
  const from = grabbedIndex.value
  const to = from + delta
  if (to < 0 || to >= model.value.length)
    return
  reorderSingle(from, to)
  grabbedIndex.value = to
  activeIndex.value = to
  announceMove(to)
  nextTick(() => itemEls.value[to]?.focus())
}

function toggleGrab(index: number): void {
  if (props.disabled)
    return
  if (grabbedIndex.value === null) {
    grabbedIndex.value = index
    grabStartIndex.value = index
    activeIndex.value = index
    announce(
      `Grabbed item at position ${index + 1} of ${model.value.length}. `
      + 'Use the arrow keys to move, space to drop, escape to cancel.',
    )
  }
  else {
    const dropped = grabbedIndex.value
    grabbedIndex.value = null
    grabStartIndex.value = null
    announce(`Dropped at position ${dropped + 1} of ${model.value.length}.`)
  }
}

function cancelGrab(): void {
  if (grabbedIndex.value === null || grabStartIndex.value === null)
    return
  const current = grabbedIndex.value
  const start = grabStartIndex.value
  if (current !== start) {
    reorderSingle(current, start)
    activeIndex.value = start
  }
  grabbedIndex.value = null
  grabStartIndex.value = null
  announce('Reorder cancelled.')
  nextTick(() => itemEls.value[activeIndex.value]?.focus())
}

function handleItemKeydown(event: KeyboardEvent, index: number): void {
  if (props.disabled)
    return
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      if (grabbedIndex.value !== null)
        moveGrabbed(-1)
      else if (index > 0)
        focusItem(index - 1)
      break
    case 'ArrowDown':
      event.preventDefault()
      if (grabbedIndex.value !== null)
        moveGrabbed(1)
      else if (index < model.value.length - 1)
        focusItem(index + 1)
      break
    case 'Home':
      event.preventDefault()
      if (grabbedIndex.value !== null)
        moveGrabbed(-grabbedIndex.value)
      else focusItem(0)
      break
    case 'End':
      event.preventDefault()
      if (grabbedIndex.value !== null)
        moveGrabbed(model.value.length - 1 - grabbedIndex.value)
      else focusItem(model.value.length - 1)
      break
    case ' ':
    case 'Spacebar':
      event.preventDefault()
      toggleGrab(index)
      break
    case 'Enter':
      if (props.selectable) {
        event.preventDefault()
        toggleSelection(model.value[index] as T, index)
      }
      break
    case 'Escape':
      if (grabbedIndex.value !== null) {
        event.preventDefault()
        cancelGrab()
      }
      break
  }
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :data-size="size"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Move controls -->
    <div
      v-if="showControls"
      :class="cn(styles.controls(), controlsPosition === 'end' ? 'order-2' : 'order-0')"
      role="group"
      :aria-label="dzMessages.reorderControls"
    >
      <DzIconButton
        :icon="ChevronsUp"
        :aria-label="resolvedMoveTopLabel"
        :disabled="!canMoveUp"
        variant="ghost"
        tone="neutral"
        :size="size"
        type="button"
        @click="performMove('top')"
      />
      <DzIconButton
        :icon="ChevronUp"
        :aria-label="resolvedMoveUpLabel"
        :disabled="!canMoveUp"
        variant="ghost"
        tone="neutral"
        :size="size"
        type="button"
        @click="performMove('up')"
      />
      <DzIconButton
        :icon="ChevronDown"
        :aria-label="resolvedMoveDownLabel"
        :disabled="!canMoveDown"
        variant="ghost"
        tone="neutral"
        :size="size"
        type="button"
        @click="performMove('down')"
      />
      <DzIconButton
        :icon="ChevronsDown"
        :aria-label="resolvedMoveBottomLabel"
        :disabled="!canMoveDown"
        variant="ghost"
        tone="neutral"
        :size="size"
        type="button"
        @click="performMove('bottom')"
      />
    </div>

    <!-- List -->
    <div :class="controlsPosition === 'end' ? 'order-0 min-w-0 flex-1' : 'order-1 min-w-0 flex-1'">
      <slot name="header" />
      <ul
        :class="styles.list()"
        :role="selectable ? 'listbox' : 'list'"
        :aria-multiselectable="selectable || undefined"
        :ariaLabel="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        @focusin="handleFocus"
        @focusout="handleBlur"
      >
        <li
          v-for="(item, index) in model"
          :key="resolveKey(item, index)"
          :ref="(el) => setItemEl(el, index)"
          :class="cn(styles.item(), itemStateClass(item, index))"
          :role="selectable ? 'option' : 'listitem'"
          :tabindex="index === activeIndex ? 0 : -1"
          :aria-selected="selectable ? isSelected(item, index) : undefined"
          :aria-grabbed="grabbedIndex === index || undefined"
          :data-state="grabbedIndex === index ? 'grabbed' : isSelected(item, index) ? 'selected' : undefined"
          :data-index="index"
          :draggable="!disabled && dragHandle && armedIndex === index"
          @click="handleItemClick(item, index)"
          @keydown="handleItemKeydown($event, index)"
          @dragstart="handleDragStart($event, index)"
          @dragover="handleDragOver($event, index)"
          @drop="handleDrop($event)"
          @dragend="resetDrag"
        >
          <!-- Drag handle -->
          <span
            v-if="dragHandle"
            :class="styles.handle()"
            aria-hidden="true"
            data-dz-order-list-handle
            @pointerdown="armDrag(index)"
            @pointerup="armedIndex = null"
          >
            <GripVertical class="h-4 w-4" />
          </span>

          <span :class="styles.content()">
            <slot
              name="item"
              :item="item"
              :index="index"
              :selected="isSelected(item, index)"
              :grabbed="grabbedIndex === index"
            >
              {{ item }}
            </slot>
          </span>
        </li>

        <li v-if="model.length === 0" :class="styles.empty()">
          <slot name="empty">
            No items
          </slot>
        </li>
      </ul>
    </div>

    <!-- Polite live region: announces position changes to assistive tech -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ liveMessage }}
    </div>
  </div>
</template>
