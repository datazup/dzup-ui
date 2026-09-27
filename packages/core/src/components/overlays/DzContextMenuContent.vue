<script setup lang="ts">
import type {
  DzContextMenuContentEmits,
  DzContextMenuContentProps,
  DzContextMenuContentSlots,
} from './DzContextMenu.types.ts'
import { ContextMenuContent, ContextMenuPortal } from 'reka-ui'
/**
 * DzContextMenuContent — Content panel for DzContextMenu.
 */
import { computed, useAttrs } from 'vue'
import { useDzPortalTarget } from '../../composables/provider/useDzEnvironment.ts'
import { useDzMotionAttribute } from '../../composables/provider/useDzMotion.ts'
import { cn } from '../../utilities/cn.ts'
import { contextMenuVariants } from './DzContextMenu.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzContextMenuContentProps>(), {
  side: 'bottom',
  align: 'start',
  sideOffset: 4,
  portalTo: undefined,
  portalDisabled: false,
  portalDefer: false,
})

const emit = defineEmits<DzContextMenuContentEmits>()
defineSlots<DzContextMenuContentSlots>()
// Portal target: an explicit `portalTo` on this instance, then the application's
// `DzProvider` target, then the portal's own default of `document.body`
// (ADR-20, TASK-OSS-P4-04). Resolution is client-side — this is a string or an
// element handed to the portal, never a DOM query run here.
const dzPortalTarget = useDzPortalTarget()
const resolvedPortalTo = computed(() => props.portalTo ?? dzPortalTarget.value)

const attrs = useAttrs()
const styles = computed(() => contextMenuVariants())

const classes = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)

function handleEscapeKeyDown(event: KeyboardEvent): void {
  emit('escapeKeyDown', event)
}

function handlePointerDownOutside(event: Event): void {
  emit('pointerDownOutside', event)
}

// Reduced motion, as the APPLICATION asked for it (ADR-20 §7, TASK-R5-O3).
// The `prefers-reduced-motion` gate in the recipe answers for the OS; this
// answers for a host with its own accessibility setting, which the media
// query cannot see.
const dzMotionAttr = useDzMotionAttribute()
</script>

<template>
  <ContextMenuPortal
    :to="resolvedPortalTo"
    :disabled="portalDisabled"
    :defer="portalDefer"
  >
    <!--
      N1-O1 defect D11: `:id="id"` with no `id` handed an explicit `undefined`
      to the Reka component, which OVERRODE the content id Reka generates for
      itself. The trigger then advertised `aria-controls=""` and the panel
      carried no id at all -- axe `aria-valid-attr-value`, and an AT user
      following the reference found nothing. Bind it only when there is one.
    -->
    <ContextMenuContent
      :side="side"
      :align="align"
      :side-offset="sideOffset"
      data-part="content"
      :class="classes"
      :data-dz-motion="dzMotionAttr"
      :aria-label="ariaLabel"
      v-bind="{ ...(id === undefined ? {} : { id }), ...$attrs, class: undefined }"
      @escape-key-down="handleEscapeKeyDown"
      @pointer-down-outside="handlePointerDownOutside"
    >
      <slot />
    </ContextMenuContent>
  </ContextMenuPortal>
</template>
