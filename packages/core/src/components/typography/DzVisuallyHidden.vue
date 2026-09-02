<script setup lang="ts">
import type { DzVisuallyHiddenProps } from './DzVisuallyHidden.types.ts'
/**
 * DzVisuallyHidden — Screen-reader-only content wrapper.
 *
 * Renders content that stays in the accessibility tree (announced by assistive
 * technology and available to accessible-name computation) but is not painted
 * on screen. Uses the audited clip-rect + 1px technique — NOT `display:none`,
 * which would remove the content from the a11y tree.
 *
 * Set `focusable` for the skip-link pattern: the content reveals itself in
 * place when it (or a focusable descendant) receives keyboard focus.
 *
 * Implementation note: Reka UI ships a `VisuallyHidden` primitive, but its
 * `feature='focusable'` default applies `aria-hidden="true"` (removing content
 * from the accessible-name computation) and it has no reveal-on-focus behavior,
 * so neither of its modes matches this component's contract. The clip technique
 * is therefore implemented directly here.
 *
 * @example
 * ```vue
 * <DzButton><DzIcon name="save" /><DzVisuallyHidden>Save document</DzVisuallyHidden></DzButton>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { visuallyHiddenVariants } from './DzVisuallyHidden.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzVisuallyHiddenProps>(), {
  as: 'span',
  focusable: false,
  ui: undefined,
})

defineSlots<{
  /** The content to hide visually while keeping it in the accessibility tree. */
  default: () => unknown
}>()

const attrs = useAttrs()

const classes = computed(() =>
  cn(
    visuallyHiddenVariants({ focusable: props.focusable }),
    attrs.class as string | undefined,
    props.ui?.root,
  ),
)
</script>

<template>
  <component
    :is="as"
    :id="id"
    data-part="root"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </component>
</template>
