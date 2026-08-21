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
import { useDzPortalTarget } from '../../composables/provider/useDzEnvironment.ts'
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
  ui: undefined,
})

const emit = defineEmits<DzDialogContentEmits>()
const slots = defineSlots<DzDialogContentSlots>()
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
/**
 * `overlayClass` predates `ui` and keeps working: it is applied after the
 * recipe and before `ui.overlay`, so a consumer already using it sees no
 * change, and one adopting `ui` gets the last word (ADR-19 §6, dual-emit).
 */
const overlayClasses = computed(() => cn(styles.value.overlay(), props.overlayClass, props.ui?.overlay))
const contentClasses = computed(() =>
  cn(styles.value.content(), props.ui?.content, attrs.class as string | undefined),
)
const headerClasses = computed(() => cn(styles.value.header(), props.ui?.header))
const bodyClasses = computed(() => cn(styles.value.body(), props.ui?.viewport))
const footerClasses = computed(() => cn(styles.value.footer(), props.ui?.footer))

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
    :to="resolvedPortalTo"
    :disabled="portalDisabled"
    :defer="portalDefer"
  >
    <Transition :name="overlayTransitionName">
      <!-- TODO(remove-after: 0.3.0): `data-dz-dialog-overlay` is dual-emitted
           beside `data-part="overlay"` for one minor series (ADR-19 §6).
           Removing it is a breaking change and needs a major changeset. -->
      <DialogOverlay
        data-part="overlay"
        :class="overlayClasses"
        data-dz-dialog-overlay
      />
    </Transition>
    <Transition :name="contentTransitionName">
      <DialogContent
        :id="id"
        data-part="content"
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
          <header v-if="hasHeaderSlot" data-part="header" :class="headerClasses">
            <slot name="header" />
          </header>
          <div data-part="viewport" :class="bodyClasses">
            <slot />
          </div>
          <footer v-if="hasFooterSlot" data-part="footer" :class="footerClasses">
            <slot name="footer" />
          </footer>
        </template>
        <slot v-else />
      </DialogContent>
    </Transition>
  </DialogPortal>
</template>
