<script setup lang="ts">
import type { CanonicalSize, CanonicalTone, TabsVariant } from '@dzup-ui/contracts'
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
import { useDzDefaults, useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { cn } from '../../utilities/cn.ts'
import { warnRemovedProps } from '../../utilities/warnRemovedProp.ts'
import { DZ_TABS_KEY } from './DzTabs.types.ts'
import { tabsVariants } from './DzTabs.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** Value of the active tab; the default empty string leaves no tab selected. */
const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzTabsProps>(), {
  orientation: 'horizontal',
  variant: undefined,
  size: undefined,
  tone: undefined,
  activationMode: 'automatic',
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzTabsEmits>()

defineSlots<DzTabsSlots>()

// ArrowLeft and ArrowRight follow the writing direction (ADR-20 §4,
// TASK-R5-O3). This component declares `rtl: { keyboard: 'swap-horizontal' }`
// in its anatomy; until now nothing read the context that makes it true.
const dzDirection = useDzDirection()

const attrs = useAttrs()

// `ariaInvalid` was declared and never forwarded to TabsRoot (VERSIONING.md §3).
warnRemovedProps('DzTabs', attrs, {
  ariaInvalid: 'A tab set is not invalid; a field inside a panel is. DzTabTrigger is where an invalid-panel affordance belongs.',
})

function handleClose(value: string): void {
  emit('close', value)
}

/**
 * Application-wide defaults (ADR-20 §6, adopted in TASK-R5-O3).
 *
 * Resolved on the compound root: the tab list, triggers and panels all read
 * these three axes out of the injected context, so resolving once here is what
 * keeps a configured default from reaching the root but not its children. Each
 * axis keeps the literal it carried in `withDefaults` as the last link.
 */
const { resolve } = useDzDefaults()

/** Resolved variant: prop, then provider, then default */
const resolvedVariant = computed(
  () => resolve<TabsVariant>('DzTabs', 'variant', [props.variant]) ?? 'line',
)

/** Resolved size: prop, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzTabs', 'size', [props.size]) ?? 'md',
)

/** Resolved tone: prop, then provider, then default */
const resolvedTone = computed(
  () => resolve<CanonicalTone>('DzTabs', 'tone', [props.tone]) ?? 'primary',
)

const context: DzTabsContext = {
  modelValue: toRef(() => model.value),
  variant: toRef(() => resolvedVariant.value),
  size: toRef(() => resolvedSize.value),
  tone: toRef(() => resolvedTone.value),
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

defineExpose({
  /**
   * Activate the tab whose value is `id` and resolve once its panel has
   * rendered and `revealed` has fired.
   */
  revealItem,
})

const styles = computed(() =>
  tabsVariants({
    variant: resolvedVariant.value,
    size: resolvedSize.value,
    tone: resolvedTone.value,
    orientation: props.orientation,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined, props.ui?.root),
)

function handleValueChange(value: string): void {
  model.value = value
  emit('change', value)
}

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <TabsRoot
    :id="id"
    :dir="dzDirection"
    data-part="root"
    :model-value="model"
    :orientation="orientation"
    :activation-mode="activationMode"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    data-state="ready"
    :data-variant="resolvedVariant"
    :data-tone="resolvedTone"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-tabs'), ...$attrs, class: undefined }"
    @update:model-value="handleValueChange"
  >
    <slot />
  </TabsRoot>
</template>
