<script setup lang="ts">
import type { DzTabContentProps, DzTabContentSlots } from './DzTabs.types.ts'
import { TabsContent } from 'reka-ui'
/**
 * DzTabContent — Tab panel content using Reka UI TabsContent.
 *
 * Inherits variant/size/orientation from parent DzTabs context (ADR-08).
 *
 * @example
 * ```vue
 * <DzTabContent value="settings">
 *   <p>Settings panel content</p>
 * </DzTabContent>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABS_KEY } from './DzTabs.types.ts'
import { tabsVariants } from './DzTabs.variants.ts'

withDefaults(defineProps<DzTabContentProps>(), {
  forceMount: undefined,
})

defineSlots<DzTabContentSlots>()

const attrs = useAttrs()
const tabsContext = inject(DZ_TABS_KEY, null)

const styles = computed(() =>
  tabsVariants({
    variant: tabsContext?.variant.value ?? 'line',
    size: tabsContext?.size.value ?? 'md',
    orientation: tabsContext?.orientation.value ?? 'horizontal',
  }),
)

const classes = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <TabsContent
    :value="value"
    :force-mount="forceMount"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </TabsContent>
</template>
