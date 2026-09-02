<script setup lang="ts">
import type {
  DzSpeedDialEmits,
  DzSpeedDialItem,
  DzSpeedDialProps,
} from './DzSpeedDial.types.ts'
/**
 * DzSpeedDial — a DzFab that fans out a set of secondary actions.
 *
 * Actions expand in one of four `direction`s, laid out either in a straight
 * line (`type="linear"`) or along an arc (`type="radial"`). Each action is a
 * circular icon button labelled by a DzTooltip. The reveal is staggered with
 * pure CSS transitions. Open state is controlled via `v-model:open` (ADR-16).
 *
 * a11y: the trigger exposes `aria-expanded` / `aria-haspopup="menu"` and
 * `aria-controls`; the actions form a `role="menu"` group with roving focus,
 * arrow-key navigation, and Esc to close (returning focus to the trigger).
 *
 * @example
 * ```vue
 * <DzSpeedDial
 *   v-model:open="open"
 *   aria-label="Quick actions"
 *   :items="[
 *     { icon: PencilIcon, label: 'Edit', onClick: edit },
 *     { icon: ShareIcon, label: 'Share', onClick: share },
 *   ]"
 *   direction="up"
 * />
 * ```
 */
import { Plus, X } from 'lucide-vue-next'
import { computed, nextTick, ref, useAttrs, useId, watch } from 'vue'
import { cn } from '../../utilities/cn.ts'
import DzTooltip from '../overlays/DzTooltip.vue'
import DzTooltipContent from '../overlays/DzTooltipContent.vue'
import DzTooltipTrigger from '../overlays/DzTooltipTrigger.vue'
import DzFab from './DzFab.vue'
import DzIconButton from './DzIconButton.vue'
import {
  SPEED_DIAL_ACTION_PX,
  SPEED_DIAL_GAP_PX,
  SPEED_DIAL_STAGGER_MS,
} from './DzSpeedDial.tokens.ts'
import { speedDialVariants } from './DzSpeedDial.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(defineProps<DzSpeedDialProps>(), {
  direction: 'up',
  type: 'linear',
  size: 'md',
  tone: 'primary',
  variant: 'solid',
  position: 'static',
  icon: undefined,
  closeIcon: undefined,
  openOnHover: false,
  disabled: false,
  radius: 112,
  ui: undefined,
})

const emit = defineEmits<DzSpeedDialEmits>()

const attrs = useAttrs()
const styles = speedDialVariants()
const menuId = useId()

const rootPositionClass = computed(() => {
  switch (props.position) {
    case 'bottom-right':
      return 'fixed bottom-[var(--dz-spacing-6)] right-[var(--dz-spacing-6)] z-40'
    case 'bottom-left':
      return 'fixed bottom-[var(--dz-spacing-6)] left-[var(--dz-spacing-6)] z-40'
    case 'top-right':
      return 'fixed top-[var(--dz-spacing-6)] right-[var(--dz-spacing-6)] z-40'
    case 'top-left':
      return 'fixed top-[var(--dz-spacing-6)] left-[var(--dz-spacing-6)] z-40'
    default:
      return ''
  }
})

const rootClasses = computed(() =>
  cn(styles.root(), rootPositionClass.value, attrs.class as string | undefined, props.ui?.root),
)

/** Per-part class values (ADR-19 §5). */
const listClasses = computed(() => cn(styles.menu(), props.ui?.list))
const itemClasses = computed(() => cn(styles.item(), props.ui?.item))

/** Component instance of the trigger FAB (its `$el` is the <button>). */
const triggerRef = ref<InstanceType<typeof DzFab>>()
/** The menu element — used to query action buttons for focus management. */
const menuEl = ref<HTMLElement>()

const triggerIcon = computed(() => (open.value ? (props.closeIcon ?? X) : (props.icon ?? Plus)))

/** Icon-button size for the actions — one step below the trigger size. */
const actionButtonSize = computed(() => {
  const map: Record<string, 'xs' | 'sm' | 'md' | 'lg' | 'xl'> = {
    xs: 'xs',
    sm: 'xs',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
  }
  return map[props.size] ?? 'sm'
})

const isVertical = computed(() => props.direction === 'up' || props.direction === 'down')

// ---------------------------------------------------------------------------
// Expansion geometry
// ---------------------------------------------------------------------------

/** Unit vector for the linear expansion direction (screen coords, y down). */
function directionUnit(): [number, number] {
  switch (props.direction) {
    case 'up': return [0, -1]
    case 'down': return [0, 1]
    case 'left': return [-1, 0]
    case 'right': return [1, 0]
    default: return [0, -1]
  }
}

/** Center angle (math degrees, 0°=right, CCW positive) for radial layout. */
function directionAngle(): number {
  switch (props.direction) {
    case 'right': return 0
    case 'up': return 90
    case 'left': return 180
    case 'down': return 270
    default: return 90
  }
}

/** Offset (px) of action `i` from the trigger center when open. */
function itemOffset(i: number, count: number): { x: number, y: number } {
  if (props.type === 'radial') {
    const span = 90
    const center = directionAngle()
    const deg = count > 1 ? center - span / 2 + (span / (count - 1)) * i : center
    const rad = (deg * Math.PI) / 180
    return { x: Math.cos(rad) * props.radius, y: -Math.sin(rad) * props.radius }
  }
  const [ux, uy] = directionUnit()
  const step = (SPEED_DIAL_ACTION_PX[props.size] ?? 40) + SPEED_DIAL_GAP_PX
  const d = (i + 1) * step
  return { x: ux * d, y: uy * d }
}

/** Inline style for action `i`, including the staggered reveal delay. */
function itemStyle(i: number): Record<string, string> {
  const count = props.items.length
  const delay = open.value ? i * SPEED_DIAL_STAGGER_MS : (count - 1 - i) * SPEED_DIAL_STAGGER_MS
  if (!open.value) {
    return {
      transform: 'translate(-50%, -50%) scale(0.4)',
      opacity: '0',
      pointerEvents: 'none',
      transitionDelay: `${delay}ms`,
    }
  }
  const { x, y } = itemOffset(i, count)
  return {
    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
    opacity: '1',
    pointerEvents: 'auto',
    transitionDelay: `${delay}ms`,
  }
}

// ---------------------------------------------------------------------------
// Open / close
// ---------------------------------------------------------------------------

function toggle(): void {
  if (props.disabled)
    return
  open.value = !open.value
}

function close(focusTrigger = false): void {
  if (!open.value)
    return
  open.value = false
  if (focusTrigger)
    void nextTick(() => triggerRef.value?.$el?.focus())
}

function onHoverOpen(): void {
  if (props.openOnHover && !props.disabled)
    open.value = true
}

function onHoverClose(): void {
  if (props.openOnHover)
    open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) {
    emit('open')
    void nextTick(() => focusAction(0))
  }
  else {
    emit('close')
  }
})

// ---------------------------------------------------------------------------
// Action activation + keyboard navigation
// ---------------------------------------------------------------------------

function handleItemClick(item: DzSpeedDialItem, index: number, event: MouseEvent): void {
  if (item.disabled)
    return
  item.onClick?.(event)
  emit('itemClick', item, index)
  close(true)
}

/** All non-disabled action buttons, in DOM order. */
function actionButtons(): HTMLButtonElement[] {
  if (!menuEl.value)
    return []
  return Array.from(menuEl.value.querySelectorAll<HTMLButtonElement>('button[data-index]:not([disabled])'))
}

function focusAction(index: number): void {
  const btns = actionButtons()
  if (btns.length === 0)
    return
  const clamped = ((index % btns.length) + btns.length) % btns.length
  btns[clamped]?.focus()
}

function currentActionIndex(): number {
  const btns = actionButtons()
  return btns.findIndex(b => b === document.activeElement)
}

function onMenuKeydown(event: KeyboardEvent): void {
  const nextKey = isVertical.value ? 'ArrowDown' : 'ArrowRight'
  const prevKey = isVertical.value ? 'ArrowUp' : 'ArrowLeft'
  switch (event.key) {
    case nextKey:
      event.preventDefault()
      focusAction(currentActionIndex() + 1)
      break
    case prevKey:
      event.preventDefault()
      focusAction(currentActionIndex() - 1)
      break
    case 'Home':
      event.preventDefault()
      focusAction(0)
      break
    case 'End':
      event.preventDefault()
      focusAction(actionButtons().length - 1)
      break
    default:
      break
  }
}

function onRootKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    close(true)
  }
}
</script>

<template>
  <div
    data-part="root"
    :class="rootClasses"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @keydown="onRootKeydown"
    @mouseenter="onHoverOpen"
    @mouseleave="onHoverClose"
  >
    <!-- Fan-out actions -->
    <div
      :id="menuId"
      ref="menuEl"
      data-part="list"
      :class="listClasses"
      role="menu"
      :aria-orientation="isVertical ? 'vertical' : 'horizontal'"
      :aria-hidden="!open || undefined"
      @keydown="onMenuKeydown"
    >
      <div
        v-for="(item, index) in items"
        :key="item.key ?? index"
        data-part="item"
        :class="itemClasses"
        :style="itemStyle(index)"
      >
        <DzTooltip>
          <DzTooltipTrigger>
            <DzIconButton
              :icon="item.icon"
              :aria-label="item.label"
              :tone="item.tone ?? tone"
              :size="actionButtonSize"
              :disabled="item.disabled"
              :class="styles.action()"
              role="menuitem"
              :data-index="index"
              :tabindex="open ? 0 : -1"
              @click="handleItemClick(item, index, $event)"
            />
          </DzTooltipTrigger>
          <DzTooltipContent :side="isVertical ? 'left' : 'top'">
            {{ item.label }}
          </DzTooltipContent>
        </DzTooltip>
      </div>
    </div>

    <!-- Trigger FAB -->
    <DzFab
      ref="triggerRef"
      :icon="triggerIcon"
      :aria-label="ariaLabel"
      :tone="tone"
      :size="size"
      :variant="variant"
      :disabled="disabled"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-controls="menuId"
      @click="toggle"
    />
  </div>
</template>
