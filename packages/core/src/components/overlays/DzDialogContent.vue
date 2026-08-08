<script setup lang="ts">
import type {
  DzDialogContentEmits,
  DzDialogContentProps,
  DzDialogContentSlots,
} from './DzDialog.types.ts'
import { DialogContent, DialogOverlay, DialogPortal, injectDialogRootContext } from 'reka-ui'
/**
 * DzDialogContent -- Content panel for DzDialog compound.
 *
 * Wraps Reka UI DialogPortal + DialogOverlay + DialogContent.
 * Renders portal, overlay backdrop, and content panel as one unit.
 * Size variants via tailwind-variants (ADR-04).
 * Supports open/close transitions via parent DzDialog context.
 *
 * @example
 * ```vue
 * <DzDialogContent size="lg">
 *   <DzDialogTitle>Large dialog</DzDialogTitle>
 *   <DzDialogDescription>Content here</DzDialogDescription>
 * </DzDialogContent>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_DIALOG_KEY } from './DzDialog.types.ts'
import { dialogVariants } from './DzDialog.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzDialogContentProps>(), {
  size: 'md',
  scrollable: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
  portalTo: undefined,
  portalDisabled: false,
  portalDefer: false,
  overlayClass: undefined,
})

const emit = defineEmits<DzDialogContentEmits>()
const slots = defineSlots<DzDialogContentSlots>()

const attrs = useAttrs()

const rootContext = injectDialogRootContext()

/**
 * Accessibility attributes forwarded to Reka's DialogContent.
 *
 * Reka UI auto-wires `aria-labelledby` (from DzDialogTitle) and
 * `aria-describedby` (from DzDialogDescription) onto the content element via the
 * dialog root context. Binding those attributes to `undefined` would strip
 * Reka's generated ids and leave the dialog with no accessible name, so each
 * consumer-supplied override is forwarded ONLY when explicitly provided.
 *
 * Reka 2.9.x does not emit `aria-modal` itself, so we surface it here whenever
 * the dialog is modal (DzDialog `modal` defaults to true).
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

const dialogCtx = inject(DZ_DIALOG_KEY, undefined)
const overlayTransitionName = computed(() => dialogCtx?.overlayTransition.value ?? 'dz-dialog-overlay')
const contentTransitionName = computed(() => dialogCtx?.contentTransition.value ?? 'dz-dialog-content')

const styles = computed(() => dialogVariants({ size: props.size, scrollable: props.scrollable }))
const overlayClasses = computed(() => cn(styles.value.overlay(), props.overlayClass))
const contentClasses = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)
const headerClasses = computed(() => styles.value.header())
const bodyClasses = computed(() => styles.value.body())
const footerClasses = computed(() => styles.value.footer())

const hasHeaderSlot = computed(() => Boolean(slots.header))
const hasFooterSlot = computed(() => Boolean(slots.footer))

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
  <DialogPortal
    :to="portalTo"
    :disabled="portalDisabled"
    :defer="portalDefer"
  >
    <Transition :name="overlayTransitionName">
      <DialogOverlay
        :class="overlayClasses"
        data-dz-dialog-overlay
      />
    </Transition>
    <Transition :name="contentTransitionName">
      <DialogContent
        :id="id"
        :class="contentClasses"
        style="contain: layout style"
        v-bind="{ ...contentAria, ...$attrs, class: undefined }"
        @escape-key-down="handleEscapeKeyDown"
        @pointer-down-outside="handlePointerDownOutside"
        @interact-outside="handleInteractOutside"
        @open-auto-focus="handleOpenAutoFocus"
        @close-auto-focus="handleCloseAutoFocus"
      >
        <template v-if="scrollable">
          <header v-if="hasHeaderSlot" :class="headerClasses">
            <slot name="header" />
          </header>
          <div :class="bodyClasses">
            <slot />
          </div>
          <footer v-if="hasFooterSlot" :class="footerClasses">
            <slot name="footer" />
          </footer>
        </template>
        <slot v-else />
      </DialogContent>
    </Transition>
  </DialogPortal>
</template>
