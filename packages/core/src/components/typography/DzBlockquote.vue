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

defineProps<DzBlockquoteProps>()
defineSlots<DzBlockquoteSlots>()

const attrs = useAttrs()

const classes = computed(() =>
  cn(
    blockquoteVariants(),
    attrs.class as string | undefined,
  ),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <blockquote
    :id="id"
    :class="classes"
    :cite="cite"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div>
      <slot />
    </div>
    <footer
      v-if="$slots.footer"
      class="mt-[var(--dz-spacing-2)] text-[length:var(--dz-text-sm)] not-italic text-[var(--dz-muted-foreground)]"
    >
      <slot name="footer" />
    </footer>
  </blockquote>
</template>
