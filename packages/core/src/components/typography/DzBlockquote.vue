<script setup lang="ts">
import type { DzBlockquoteProps, DzBlockquoteSlots } from './DzBlockquote.types.ts'
/**
 * DzBlockquote — Styled blockquote component.
 *
 * Renders a semantically correct `<blockquote>` with left border accent,
 * optional cite attribute, and footer slot for attribution.
 *
 * @example
 * ```vue
 * <DzBlockquote cite="https://example.com">
 *   The only way to do great work is to love what you do.
 *   <template #footer>Steve Jobs</template>
 * </DzBlockquote>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { blockquoteVariants } from './DzBlockquote.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzBlockquoteProps>(), {
  ui: undefined,
})
defineSlots<DzBlockquoteSlots>()

const attrs = useAttrs()

const classes = computed(() =>
  cn(
    blockquoteVariants(),
    attrs.class as string | undefined,
    props.ui?.root,
  ),
)

/** Per-part class values (ADR-19 §5). */
const contentClasses = computed(() => cn(props.ui?.content))
const footerClasses = computed(() => cn(
  'mt-[var(--dz-spacing-2)] text-[length:var(--dz-text-sm)] not-italic '
  + 'text-[var(--dz-muted-foreground)]',
  props.ui?.footer,
))
</script>

<template>
  <blockquote
    :id="id"
    data-part="root"
    :class="classes"
    :cite="cite"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div data-part="content" :class="contentClasses">
      <slot />
    </div>
    <footer
      v-if="$slots.footer"
      data-part="footer"
      :class="footerClasses"
    >
      <slot name="footer" />
    </footer>
  </blockquote>
</template>
