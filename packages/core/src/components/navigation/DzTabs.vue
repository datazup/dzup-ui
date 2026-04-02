<script setup lang="ts">
import type { DzTabsContext, DzTabsEmits, DzTabsProps, DzTabsSlots } from './DzTabs.types.ts'
import { TabsRoot } from 'reka-ui'
/**
 * DzTabs — Tabbed interface root component using Reka UI (ADR-07).
 *
 * Provides variant, size, and orientation context to child components
 * via provide/inject (ADR-08).
 * v-model via defineModel<string>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzTabs v-model="activeTab" variant="line">
 *   <DzTabList>
 *     <DzTabTrigger value="tab1">Tab 1</DzTabTrigger>
 *     <DzTabTrigger value="tab2">Tab 2</DzTabTrigger>
 *   </DzTabList>
 *   <DzTabContent value="tab1">Content 1</DzTabContent>
 *   <DzTabContent value="tab2">Content 2</DzTabContent>
 * </DzTabs>
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABS_KEY } from './DzTabs.types.ts'
import { tabsVariants } from './DzTabs.variants.ts'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzTabsProps>(), {
  orientation: 'horizontal',
  variant: 'line',
  size: 'md',
  activationMode: 'automatic',
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzTabsEmits>()
defineSlots<DzTabsSlots>()

const attrs = useAttrs()

const context: DzTabsContext = {
  variant: toRef(() => props.variant),
  size: toRef(() => props.size),
  orientation: toRef(() => props.orientation),
}

provide(DZ_TABS_KEY, context)

const styles = computed(() =>
  tabsVariants({
    variant: props.variant,
    size: props.size,
    orientation: props.orientation,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

function handleValueChange(value: string): void {
  model.value = value
  emit('change', value)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <TabsRoot
    :id="id"
    :model-value="model"
    :orientation="orientation"
    :activation-mode="activationMode"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-variant="variant"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @update:model-value="handleValueChange"
  >
    <slot />
  </TabsRoot>
</template>
