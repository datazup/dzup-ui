<script setup lang="ts">
import type { DzTabListProps, DzTabListSlots } from './DzTabs.types.ts'
import { TabsList } from 'reka-ui'
/**
 * DzTabList — Container for tab triggers using Reka UI TabsList.
 *
 * Inherits variant/size/orientation from parent DzTabs context (ADR-08).
 *
 * @example
 * ```vue
 * <DzTabList>
 *   <DzTabTrigger value="tab1">Tab 1</DzTabTrigger>
 *   <DzTabTrigger value="tab2">Tab 2</DzTabTrigger>
 * </DzTabList>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABS_KEY } from './DzTabs.types.ts'
import { tabsVariants } from './DzTabs.variants.ts'

withDefaults(defineProps<DzTabListProps>(), {
  loop: true,
})

defineSlots<DzTabListSlots>()

const attrs = useAttrs()
const tabsContext = inject(DZ_TABS_KEY, null)

if (!tabsContext && import.meta.env?.DEV) {
  console.warn('[DzTabList] must be used inside a <DzTabs> parent.')
}

const styles = computed(() =>
  tabsVariants({
    variant: tabsContext?.variant.value ?? 'line',
    size: tabsContext?.size.value ?? 'md',
    orientation: tabsContext?.orientation.value ?? 'horizontal',
  }),
)

const classes = computed(() =>
  cn(styles.value.list(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <TabsList
    :loop="loop"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </TabsList>
</template>
