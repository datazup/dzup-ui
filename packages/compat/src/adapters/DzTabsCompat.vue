<script setup lang="ts">
import type { CanonicalSize, TabsVariant } from '@dzup-ui/contracts'
import { DzTabList, DzTabs, DzTabTrigger } from '@dzup-ui/core'
/**
 * DzTabsCompat -- backward-compatible wrapper for DzTabs compound components.
 *
 * Maps old dzup-ui single-component tabs API to the new vNext compound API:
 * - `tabs` prop (array of tab items) -> DzTabList with DzTabTrigger children
 * - `type` prop: "line" -> "line", "card" -> "enclosed", "border-card" -> "enclosed"
 * - `size` values: "small" -> "sm", "medium" -> "md", "large" -> "lg"
 * - `@tab-click` -> `@change`, `@tab-close` -> `@close`
 *
 * @deprecated Use DzTabs, DzTabList, DzTabTrigger, and DzTabContent from @dzup-ui/core instead.
 */
import { computed, onMounted, useAttrs } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

/** Old dzup-ui tab item shape */
interface TabItem {
  /** Display label for the tab */
  label: string
  /** Unique value identifying this tab */
  value: string
  /** Whether this tab trigger is disabled */
  disabled?: boolean
  /** Whether this tab shows a close button */
  closable?: boolean
}

/** Old dzup-ui tab type values */
type OldTabType = 'line' | 'card' | 'border-card'

/** Old dzup-ui size values */
type OldSize = 'small' | 'medium' | 'large' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface DzTabsCompatProps {
  /** Tab items — each rendered as a DzTabTrigger */
  tabs?: TabItem[]
  /** Old `type` prop — maps to `variant` in vNext */
  type?: OldTabType
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Whether all tabs are closable (individual tab closable overrides this) */
  closable?: boolean
}

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzTabsCompatProps>(), {
  type: 'line',
  size: 'medium',
  closable: false,
})

const emit = defineEmits<{
  tabClick: [value: string]
  tabClose: [value: string]
  change: [value: string]
  close: [value: string]
}>()

const attrs = useAttrs()

onMounted(() => {
  warnDeprecated('DzTabsCompat', 'DzTabs')
})

/** Map old type to new variant */
const mappedVariant = computed<TabsVariant>(() => {
  const typeToVariant: Record<OldTabType, TabsVariant> = {
    'line': 'line',
    'card': 'enclosed',
    'border-card': 'enclosed',
  }
  return typeToVariant[props.type ?? 'line']
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

function handleChange(value: string): void {
  emit('change', value)
  emit('tabClick', value)
}

function handleClose(value: string): void {
  emit('close', value)
  emit('tabClose', value)
}
</script>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<template>
  <DzTabs
    v-model="model"
    :variant="mappedVariant"
    :size="mappedSize"
    v-bind="attrs"
    @change="handleChange"
    @close="handleClose"
  >
    <DzTabList v-if="tabs && tabs.length > 0">
      <DzTabTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :disabled="tab.disabled"
        :closable="tab.closable ?? closable"
      >
        <slot name="tab" :tab="tab">
          {{ tab.label }}
        </slot>
      </DzTabTrigger>
    </DzTabList>
    <slot />
  </DzTabs>
</template>
