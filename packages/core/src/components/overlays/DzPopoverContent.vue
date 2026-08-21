<script setup lang="ts">
import type {
  DzPopoverContentEmits,
  DzPopoverContentProps,
  DzPopoverContentSlots,
} from './DzPopover.types.ts'
import { PopoverArrow, PopoverContent, PopoverPortal } from 'reka-ui'
/**
 * DzPopoverContent -- Content panel for DzPopover compound.
 *
 * Wraps Reka UI PopoverPortal + PopoverContent + optional PopoverArrow.
 * Token-based styling (ADR-04), size variants via tailwind-variants.
 *
 * @example
 * ```vue
 * <DzPopoverContent side="bottom" size="lg">
 *   Rich content here
 * </DzPopoverContent>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useDzPortalTarget } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { popoverVariants } from './DzPopover.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzPopoverContentProps>(), {
  side: 'bottom',
  sideOffset: 4,
  align: 'center',
  arrow: true,
  size: 'md',
  portalTo: undefined,
  portalDisabled: false,
  portalDefer: false,
})

const emit = defineEmits<DzPopoverContentEmits>()
defineSlots<DzPopoverContentSlots>()
// Portal target: an explicit `portalTo` on this instance, then the application's
// `DzProvider` target, then the portal's own default of `document.body`
// (ADR-20, TASK-OSS-P4-04). Resolution is client-side — this is a string or an
// element handed to the portal, never a DOM query run here.
const dzPortalTarget = useDzPortalTarget()
const resolvedPortalTo = computed(() => props.portalTo ?? dzPortalTarget.value)

const attrs = useAttrs()
const styles = computed(() => popoverVariants({ size: props.size }))
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

function handleOpenAutoFocus(event: Event): void {
  emit('openAutoFocus', event)
}

function handleCloseAutoFocus(event: Event): void {
  emit('closeAutoFocus', event)
}
</script>

<template>
  <PopoverPortal
    :to="resolvedPortalTo"
    :disabled="portalDisabled"
    :defer="portalDefer"
  >
    <PopoverContent
      :side="props.side"
      :side-offset="props.sideOffset"
      :align="props.align"
      :class="contentClasses"
      style="contain: layout style"
      v-bind="{ ...$attrs, class: undefined }"
      @escape-key-down="handleEscapeKeyDown"
      @pointer-down-outside="handlePointerDownOutside"
      @interact-outside="handleInteractOutside"
      @open-auto-focus="handleOpenAutoFocus"
      @close-auto-focus="handleCloseAutoFocus"
    >
      <slot />
      <PopoverArrow
        v-if="props.arrow"
        :class="styles.arrow()"
        :width="10"
        :height="5"
      />
    </PopoverContent>
  </PopoverPortal>
</template>
