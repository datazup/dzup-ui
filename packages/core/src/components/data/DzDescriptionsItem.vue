<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type {
  DzDescriptionsItemProps,
  DzDescriptionsItemSlots,
} from './DzDescriptions.types.ts'
/**
 * DzDescriptionsItem — a single label/value pair within DzDescriptions.
 *
 * Renders a `<div>` group wrapping a `<dt>` (label) and `<dd>` (value), which
 * keeps the parent `<dl>` semantics intact while allowing slot-rich values.
 * Inherits size / layout / bordered density from the parent via inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzDescriptionsItem label="Status" :span="2">
 *   <DzBadge tone="success">Active</DzBadge>
 * </DzDescriptionsItem>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_DESCRIPTIONS_KEY } from './DzDescriptions.types.ts'
import { descriptionsVariants } from './DzDescriptions.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzDescriptionsItemProps>(), {
  label: undefined,
  span: 1,
})

defineSlots<DzDescriptionsItemSlots>()

const attrs = useAttrs()
const context = inject(DZ_DESCRIPTIONS_KEY, null)

const resolvedSize = computed(() => context?.size.value ?? 'md')
const resolvedLayout = computed(() => context?.layout.value ?? 'horizontal')
const resolvedBordered = computed(() => context?.bordered.value ?? false)

const styles = computed(() =>
  descriptionsVariants({
    layout: resolvedLayout.value,
    size: resolvedSize.value,
    bordered: resolvedBordered.value,
  }),
)

const groupClasses = computed(() =>
  cn(styles.value.group(), attrs.class as string | undefined),
)

const groupStyle = computed<CSSProperties | undefined>(() => {
  const s = Math.max(1, props.span)
  return s > 1 ? { gridColumn: `span ${s}` } : undefined
})
</script>

<template>
  <div
    :class="groupClasses"
    :style="groupStyle"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <dt :class="styles.term()">
      <slot name="label">
        {{ label }}
      </slot>
    </dt>
    <dd :class="styles.detail()">
      <slot />
    </dd>
  </div>
</template>
