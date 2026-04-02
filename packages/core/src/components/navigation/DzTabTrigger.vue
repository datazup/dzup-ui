<script setup lang="ts">
import type { DzTabTriggerProps, DzTabTriggerSlots } from './DzTabs.types.ts'
import { TabsTrigger } from 'reka-ui'
/**
 * DzTabTrigger — Individual tab button using Reka UI TabsTrigger.
 *
 * Inherits variant/size from parent DzTabs context (ADR-08).
 *
 * @example
 * ```vue
 * <DzTabTrigger value="settings">Settings</DzTabTrigger>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABS_KEY } from './DzTabs.types.ts'
import { tabsVariants } from './DzTabs.variants.ts'

withDefaults(defineProps<DzTabTriggerProps>(), {
  disabled: false,
})

defineSlots<DzTabTriggerSlots>()

const attrs = useAttrs()
const tabsContext = inject(DZ_TABS_KEY, null)

if (!tabsContext && import.meta.env?.DEV) {
  console.warn('[DzTabTrigger] must be used inside a <DzTabs> parent.')
}

const styles = computed(() =>
  tabsVariants({
    variant: tabsContext?.variant.value ?? 'line',
    size: tabsContext?.size.value ?? 'md',
    orientation: tabsContext?.orientation.value ?? 'horizontal',
  }),
)

const classes = computed(() =>
  cn(styles.value.trigger(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <TabsTrigger
    :value="value"
    :disabled="disabled"
    :class="classes"
    :data-disabled="disabled ? '' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </TabsTrigger>
</template>
