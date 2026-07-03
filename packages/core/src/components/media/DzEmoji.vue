<script setup lang="ts">
import type { DzEmojiProps } from './DzEmoji.types.ts'
/**
 * DzEmoji — Accessible emoji renderer with consistent sizing.
 *
 * Wraps an emoji glyph so screen readers announce it predictably. Decorative
 * by default (`aria-hidden="true"`); provide `label` to make it meaningful
 * (`role="img"` with an accessible name).
 *
 * @example
 * ```
 * // In your template:
 * // <DzEmoji emoji="🎉" label="Party popper" size="lg" />
 * // <span><DzEmoji emoji="✅" /> Done</span>   // decorative next to text
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { emojiVariants } from './DzEmoji.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzEmojiProps>(), {
  size: 'md',
})

const attrs = useAttrs()

const isDecorative = computed(() => !props.label)

const classes = computed(() =>
  cn(
    emojiVariants({ size: props.size }),
    attrs.class as string | undefined,
  ),
)
</script>

<template>
  <span
    :id="id"
    :class="classes"
    :role="isDecorative ? undefined : 'img'"
    :aria-label="label"
    :aria-hidden="isDecorative ? 'true' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >{{ emoji }}</span>
</template>
