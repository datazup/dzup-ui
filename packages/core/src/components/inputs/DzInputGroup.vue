<script setup lang="ts">
import type { DzInputGroupProps, DzInputGroupSlots } from './DzInputGroup.types.ts'
/**
 * DzInputGroup — Compound wrapper for input + addons.
 *
 * Groups an input element with prefix and/or suffix addon content
 * (text, icons, buttons) in a visually connected layout.
 *
 * @example
 * ```vue
 * <DzInputGroup>
 *   <template #prefix>https://</template>
 *   <DzInput v-model="url" placeholder="example.com" />
 *   <template #suffix>.com</template>
 * </DzInputGroup>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { inputGroupVariants } from './DzInputGroup.variants.ts'

const props = withDefaults(defineProps<DzInputGroupProps>(), {
  size: 'md',
  disabled: false,
})

defineSlots<DzInputGroupSlots>()

const attrs = useAttrs()
const styles = computed(() => inputGroupVariants({ size: props.size }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :data-disabled="disabled ? '' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Prefix addon -->
    <span
      v-if="$slots.prefix"
      :class="cn(styles.addon(), styles.addonPrefix())"
    >
      <slot name="prefix" />
    </span>

    <!-- Input element(s) -->
    <div class="flex-1 [&>*]:rounded-none [&>*:first-child]:rounded-l-[var(--dz-input-radius)] [&>*:last-child]:rounded-r-[var(--dz-input-radius)]">
      <slot />
    </div>

    <!-- Suffix addon -->
    <span
      v-if="$slots.suffix"
      :class="cn(styles.addon(), styles.addonSuffix())"
    >
      <slot name="suffix" />
    </span>
  </div>
</template>
