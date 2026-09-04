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
import { computed, nextTick, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { warnRemovedProps } from '../../utilities/warnRemovedProp.ts'
import { DZ_TABS_KEY } from './DzTabs.types.ts'
import { tabsVariants } from './DzTabs.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzTabsProps>(), {
  orientation: 'horizontal',
  variant: 'line',
  size: 'md',
  tone: 'primary',
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

// `ariaInvalid` was declared and never forwarded to TabsRoot (VERSIONING.md §3).
warnRemovedProps('DzTabs', attrs, {
  ariaInvalid: 'A tab set is not invalid; a field inside a panel is. DzTabTrigger is where an invalid-panel affordance belongs.',
})

function handleClose(value: string): void {
  emit('close', value)
}

const context: DzTabsContext = {
  modelValue: toRef(() => model.value),
  variant: toRef(() => props.variant),
  size: toRef(() => props.size),
  tone: toRef(() => props.tone),
  orientation: toRef(() => props.orientation),
  onClose: handleClose,
}

provide(DZ_TABS_KEY, context)

/**
 * Open (or activate) the item holding `id`, then announce that it is rendered.
 *
 * The renderer contract's C-layouts case: a wizard or tabbed form validates on
 * submit, finds its first invalid field inside a panel that is not currently
 * shown, and calls `focus()` on an element the browser will not focus. This is
 * the half a container can own — the caller pairs it with `useRevealAndFocus`.
 *
 * `revealed` fires after the panel has rendered, not when the model changed.
 */
async function revealItem(id: string): Promise<void> {
  if (model.value !== id)
    model.value = id
  await nextTick()
  emit('revealed', id)
}

defineExpose({ revealItem })

const styles = computed(() =>
  tabsVariants({
    variant: props.variant,
    size: props.size,
    tone: props.tone,
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
    data-state="ready"
    :data-variant="variant"
    :data-tone="tone"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @update:model-value="handleValueChange"
  >
    <slot />
  </TabsRoot>
</template>
