<script setup lang="ts">
import type { CanonicalSize } from '@dzup-ui/contracts'
import type { DzAccordionCompatProps, OldSize } from '../adapter-types.ts'
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
} from '@dzup-ui/core'
/**
 * DzAccordionCompat — backward-compatible wrapper for DzAccordion compound.
 *
 * Maps old dzup-ui single-component accordion API to the new vNext compound API:
 * - `items` prop (array) → rendered as DzAccordionItem + DzAccordionTrigger + DzAccordionContent
 * - `accordion` / `multiple` → maps to `type`: "single" | "multiple"
 * - `expandIcon` → dropped (CSS-controlled in vNext)
 * - `@change` forwarded
 *
 * @deprecated Use DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent from @dzup-ui/core instead.
 */
import { computed, onMounted, useAttrs } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

const model = defineModel<string | string[]>({ default: '' })

const props = withDefaults(defineProps<DzAccordionCompatProps>(), {
  multiple: false,
  accordion: true,
  size: 'medium',
  disabled: false,
})

const emit = defineEmits<{
  change: [value: string | string[]]
}>()

const attrs = useAttrs()

onMounted(() => {
  warnDeprecated('DzAccordionCompat', 'DzAccordion')

  if (import.meta.env?.DEV && props.expandIcon) {
    console.warn(
      '[dzup-ui/compat] DzAccordionCompat: "expandIcon" prop is dropped in vNext. Use CSS to control the expand icon.',
    )
  }
})

/** Map old size values to canonical sizes */
const mappedSize = computed<CanonicalSize>(() => {
  const sizeMap: Record<OldSize, CanonicalSize> = {
    small: 'sm',
    medium: 'md',
    large: 'lg',
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  }
  return sizeMap[props.size ?? 'medium']
})

/** Map accordion/multiple props to new type */
const mappedType = computed<'single' | 'multiple'>(() => {
  if (props.multiple) {
    return 'multiple'
  }
  return 'single'
})

function handleChange(value: string | string[]): void {
  emit('change', value)
}
</script>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<template>
  <DzAccordion
    v-model="model"
    :type="mappedType"
    :size="mappedSize"
    :disabled="disabled"
    collapsible
    v-bind="attrs"
    @change="handleChange"
  >
    <DzAccordionItem
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      :disabled="item.disabled"
    >
      <DzAccordionTrigger>
        <slot name="title" :item="item">
          {{ item.title }}
        </slot>
      </DzAccordionTrigger>
      <DzAccordionContent>
        <slot name="content" :item="item">
          {{ item.content }}
        </slot>
      </DzAccordionContent>
    </DzAccordionItem>
    <slot />
  </DzAccordion>
</template>
