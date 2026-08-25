<script setup lang="ts">
import type { DzInputGroupContext, DzInputGroupProps, DzInputGroupSlots } from './DzInputGroup.types.ts'
/**
 * DzInputGroup — Compound wrapper for input + addons.
 *
 * Groups an input element with prefix and/or suffix addon content
 * (text, icons, buttons) in a visually connected layout. The group is the
 * single visual shell (border, radius, focus ring, disabled state) and
 * provides `size` + `disabled` to the child field via inject (ADR-08), so a
 * grouped DzInput renders seamlessly inside it.
 *
 * @example
 * ```vue
 * <DzInputGroup size="lg" disabled>
 *   <template #prefix>https://</template>
 *   <DzInput v-model="url" placeholder="example.com" />
 *   <template #suffix>.com</template>
 * </DzInputGroup>
 * ```
 */
import { computed, provide, toRef, useAttrs, useId } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_INPUT_GROUP_KEY } from './DzInputGroup.types.ts'
import { inputGroupVariants } from './DzInputGroup.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzInputGroupProps>(), {
  size: 'md',
  disabled: false,
})

defineSlots<DzInputGroupSlots>()

const attrs = useAttrs()
const autoId = useId()

/** Resolved element ID — prop overrides auto-generated */
const resolvedId = computed(() => props.id ?? autoId)

/** Cascade size + disabled to the grouped field (ADR-08) */
const context: DzInputGroupContext = {
  size: toRef(() => props.size),
  disabled: toRef(() => props.disabled),
}
provide(DZ_INPUT_GROUP_KEY, context)

const styles = computed(() => inputGroupVariants({ size: props.size }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<template>
  <div
    :id="resolvedId"
    :class="rootClasses"
    role="group"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :aria-invalid="ariaInvalid || undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-state="disabled ? 'disabled' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Prefix addon -->
    <span
      v-if="$slots.prefix"
      :class="cn(styles.addon(), styles.addonPrefix())"
    >
      <slot name="prefix" />
    </span>

    <!-- Field (default slot) — fills the row; grouped fields render seamless -->
    <div :class="styles.field()">
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
