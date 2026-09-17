<script setup lang="ts">
import type { DzSheetContentEmits, DzSheetContentProps, DzSheetContentSlots } from './DzSheet.types.ts'
import { DialogContent, DialogOverlay, DialogPortal, injectDialogRootContext } from 'reka-ui'
/**
 * DzSheetContent — Content panel for DzSheet compound.
 *
 * Wraps Reka UI DialogPortal + DialogOverlay + DialogContent
 * with sheet-specific side positioning.
 */
import { computed, useAttrs } from 'vue'
import { useDzPortalTarget } from '../../composables/provider/useDzEnvironment.ts'
import { useDzMotionAttribute } from '../../composables/provider/useDzMotion.ts'
import { cn } from '../../utilities/cn.ts'
import { sheetVariants } from './DzSheet.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzSheetContentProps>(), {
  side: 'right',
  size: 'sm',
  portalTo: undefined,
  portalDisabled: false,
  portalDefer: false,
})

const emit = defineEmits<DzSheetContentEmits>()
defineSlots<DzSheetContentSlots>()
// Portal target: an explicit `portalTo` on this instance, then the application's
// `DzProvider` target, then the portal's own default of `document.body`
// (ADR-20, TASK-OSS-P4-04). Resolution is client-side — this is a string or an
// element handed to the portal, never a DOM query run here.
const dzPortalTarget = useDzPortalTarget()
const resolvedPortalTo = computed(() => props.portalTo ?? dzPortalTarget.value)

const attrs = useAttrs()

const rootContext = injectDialogRootContext()

/**
 * Accessibility attributes forwarded to Reka's DialogContent.
 *
 * Reka UI auto-wires `aria-labelledby` (DzSheetTitle) and `aria-describedby`
 * (DzSheetDescription) via the dialog root context; binding them to `undefined`
 * would strip those ids. Forward consumer overrides ONLY when provided, and
 * surface `aria-modal` here since Reka 2.9.x does not emit it.
 */
const contentAria = computed<Record<string, unknown>>(() => {
  const aria: Record<string, unknown> = {}
  if (props.ariaLabel !== undefined)
    aria['aria-label'] = props.ariaLabel
  if (props.ariaLabelledby !== undefined)
    aria['aria-labelledby'] = props.ariaLabelledby
  if (props.ariaDescribedby !== undefined)
    aria['aria-describedby'] = props.ariaDescribedby
  if (rootContext.modal.value)
    aria['aria-modal'] = 'true'
  return aria
})

const styles = computed(() => sheetVariants({ side: props.side, size: props.size }))
const overlayClasses = computed(() => styles.value.overlay())
const contentClasses = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)

function handleEscapeKeyDown(event: KeyboardEvent): void {
  emit('escapeKeyDown', event)
}

function handlePointerDownOutside(event: Event): void {
  emit('pointerDownOutside', event)
}

function handleInteractOutside(event: Event): void {
  emit('interactOutside', event)
}

// Reduced motion, as the APPLICATION asked for it (ADR-20 §7, TASK-R5-O3).
// The `prefers-reduced-motion` gate in the recipe answers for the OS; this
// answers for a host with its own accessibility setting, which the media
// query cannot see.
const dzMotionAttr = useDzMotionAttribute()
</script>

<template>
  <DialogPortal
    :to="resolvedPortalTo"
    :disabled="portalDisabled"
    :defer="portalDefer"
  >
    <DialogOverlay data-part="overlay" :class="overlayClasses" :data-dz-motion="dzMotionAttr" />
    <DialogContent
      :id="id"
      data-part="content"
      :class="contentClasses"
      :data-dz-motion="dzMotionAttr"
      :data-side="side"
      style="contain: layout style"
      v-bind="{ ...contentAria, ...$attrs, class: undefined }"
      @escape-key-down="handleEscapeKeyDown"
      @pointer-down-outside="handlePointerDownOutside"
      @interact-outside="handleInteractOutside"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
