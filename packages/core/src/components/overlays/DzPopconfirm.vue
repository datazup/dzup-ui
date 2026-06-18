<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzPopconfirmEmits, DzPopconfirmProps, DzPopconfirmSlots } from './DzPopconfirm.types.ts'
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useClickOutside } from '../../composables/useClickOutside/index.ts'
import { useEscapeKey } from '../../composables/useEscapeKey/index.ts'
import { useFloating } from '../../composables/useFloating/index.ts'
import { useFocusTrap } from '../../composables/useFocusTrap/index.ts'
import { cn } from '../../utilities/cn.ts'
import DzButton from '../buttons/DzButton.vue'
import DzIcon from '../media/DzIcon.vue'
import { popconfirmTokens } from './DzPopconfirm.tokens.ts'
import { popconfirmVariants } from './DzPopconfirm.variants.ts'
/**
 * DzPopconfirm -- An inline confirmation popover anchored to its trigger.
 *
 * The lightweight alternative to DzConfirmDialog for low-risk destructive
 * actions (e.g. deleting a table row). Built on the shared `useFloating`
 * primitive (ADR-07) so anchoring matches DzPopover/DzTooltip. Open state is
 * controlled via `v-model:open` (ADR-16) with an uncontrolled fallback.
 *
 * Behaviour: opens on trigger click; closes on confirm, cancel, Escape, or an
 * outside click; traps focus while open and focuses the confirm button for fast
 * keyboard confirmation; returns focus to the trigger on close. For async
 * confirmation, drive the `loading` prop from the `@confirm` handler -- while
 * loading the popover stays open and the confirm button shows a spinner.
 *
 * @example
 * ```vue
 * <DzPopconfirm title="Delete this run?" tone="danger" @confirm="remove(row)">
 *   <DzIconButton :icon="Trash" aria-label="Delete" />
 * </DzPopconfirm>
 * ```
 */

const props = withDefaults(defineProps<DzPopconfirmProps>(), {
  description: undefined,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  tone: 'danger',
  icon: undefined,
  placement: 'top',
  loading: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzPopconfirmEmits>()
const slots = defineSlots<DzPopconfirmSlots>()

const open = defineModel<boolean>('open', { default: false })

const styles = computed(() => popconfirmVariants({ tone: props.tone }))

const autoId = useId()
const baseId = computed(() => props.id ?? autoId)
const titleId = computed(() => `${baseId.value}-title`)
const descriptionId = computed(() => `${baseId.value}-description`)

// ── Positioning ──────────────────────────────────────────────────────────────

const { referenceRef, floatingRef, floatingStyles, update } = useFloating({
  placement: () => props.placement,
  offset: popconfirmTokens.offset,
})

// ── Async confirm / loading ──────────────────────────────────────────────────

// True between a confirm click and the moment `loading` clears, so an async
// handler that flips `loading` true keeps the popover open until it settles.
const awaitingConfirm = ref(false)

const confirmButtonRef = ref<InstanceType<typeof DzButton> | null>(null)

// ── Dismissal wiring ──────────────────────────────────────────────────────────

useEscapeKey(() => {
  if (props.loading) return
  cancel()
}, open)

useClickOutside(
  floatingRef,
  (event) => {
    if (props.loading) return
    // The trigger sits outside the floating panel; ignore clicks on it so the
    // toggle handler owns open/close from the trigger (otherwise a closing
    // mousedown would race the reopening click).
    const triggerEl = referenceRef.value
    if (triggerEl && (triggerEl === event.target || triggerEl.contains(event.target as Node)))
      return
    cancel()
  },
  { enabled: open },
)

const { activate, deactivate } = useFocusTrap(floatingRef)

// ── Open / close controls ──────────────────────────────────────────────────────

function focusTrigger(): void {
  const el = referenceRef.value
  if (!el) return
  const focusable = el.querySelector<HTMLElement>(
    'button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
  )
  ;(focusable ?? el).focus?.()
}

function toggle(): void {
  open.value = !open.value
}

function close(): void {
  awaitingConfirm.value = false
  open.value = false
}

function confirm(): void {
  if (props.loading) return
  emit('confirm')
  // Defer the close decision so a synchronous `@confirm` handler can flip
  // `loading` true (async flow). If it does, the watcher below closes once it
  // clears; otherwise we close immediately (synchronous confirm).
  awaitingConfirm.value = true
  nextTick(() => {
    if (!props.loading && awaitingConfirm.value) {
      close()
    }
  })
}

function cancel(): void {
  if (props.loading) return
  emit('cancel')
  close()
}

// Close once an async confirm settles (loading returns to false).
watch(
  () => props.loading,
  (isLoading) => {
    if (!isLoading && awaitingConfirm.value) {
      close()
    }
  },
)

// Drive focus trap, positioning, and focus management from open state.
// Immediate so a component mounted already-open is wired up correctly.
watch(open, async (isOpen, wasOpen) => {
  if (!isOpen) {
    deactivate()
    // Only restore focus on a real open→closed transition, never on the
    // initial closed mount (which would steal focus from the page).
    if (wasOpen) focusTrigger()
    return
  }
  awaitingConfirm.value = false
  await nextTick()
  update()
  activate()
  // Focus the confirm button for fast keyboard confirmation (overrides the
  // focus trap's default first-element focus).
  confirmButtonRef.value?.$el?.focus?.()
}, { immediate: true })

const panelClasses = computed(() => cn(styles.value.panel()))
</script>

<template>
  <span ref="referenceRef" :class="styles.trigger()" @click="toggle">
    <slot />
  </span>

  <Teleport v-if="open" to="body">
    <div
      ref="floatingRef"
      role="alertdialog"
      :aria-labelledby="titleId"
      :aria-describedby="(description || slots.content) ? descriptionId : undefined"
      :class="panelClasses"
      :style="floatingStyles"
      data-testid="dz-popconfirm-panel"
      v-bind="$attrs"
    >
      <slot name="content">
        <div :class="styles.header()">
          <span
            v-if="icon || slots.icon"
            :class="styles.iconWrap()"
            aria-hidden="true"
            data-testid="dz-popconfirm-icon"
          >
            <slot name="icon">
              <DzIcon v-if="icon" :icon="icon" size="sm" />
            </slot>
          </span>
          <div :class="styles.body()">
            <p :id="titleId" :class="styles.title()">
              {{ title }}
            </p>
            <p v-if="description" :id="descriptionId" :class="styles.description()">
              {{ description }}
            </p>
          </div>
        </div>
      </slot>

      <div :class="styles.actions()">
        <DzButton
          variant="ghost"
          tone="neutral"
          size="sm"
          :disabled="loading"
          data-testid="dz-popconfirm-cancel"
          @click="cancel"
        >
          {{ cancelText }}
        </DzButton>
        <DzButton
          ref="confirmButtonRef"
          variant="solid"
          :tone="tone"
          size="sm"
          :loading="loading"
          :disabled="loading"
          data-testid="dz-popconfirm-confirm"
          @click="confirm"
        >
          {{ confirmText }}
        </DzButton>
      </div>
    </div>
  </Teleport>
</template>
