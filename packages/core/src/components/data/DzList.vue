<script setup lang="ts">
import type { CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import type { DzListContext, DzListEmits, DzListProps, DzListSlots, ListVariant } from './DzList.types.ts'
/**
 * DzList — Compound list root component.
 *
 * Provides size, variant, and interactive context to DzListItem children
 * via provide/inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzList variant="bordered" interactive>
 *   <DzListItem @click="selectItem">Item 1</DzListItem>
 *   <DzListItem>Item 2</DzListItem>
 * </DzList>
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { useDzDefaults } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_LIST_KEY } from './DzList.types.ts'
import { listVariants } from './DzList.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzListProps>(), {
  variant: undefined,
  size: undefined,
  tone: undefined,
  ordered: false,
  interactive: false,
  loading: false,
})

const emit = defineEmits<DzListEmits>()
defineSlots<DzListSlots>()

const attrs = useAttrs()

/**
 * Application-wide defaults (ADR-20 §6, adopted in TASK-R5-O3).
 *
 * Resolution happens on the compound root, which already owns these axes for
 * every item inside it — so the context children inject and the root's own
 * recipe cannot disagree. `tone` had NO literal default and must not acquire
 * one: `resolve` returning `undefined` is the pre-adoption value.
 */
const { resolve } = useDzDefaults()

/** Resolved variant: prop, then provider, then default */
const resolvedVariant = computed(
  () => resolve<ListVariant>('DzList', 'variant', [props.variant]) ?? 'plain',
)

/** Resolved size: prop, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzList', 'size', [props.size]) ?? 'md',
)

/** Resolved tone: prop, then provider — no literal default to fall back to */
const resolvedTone = computed(
  () => resolve<CanonicalTone>('DzList', 'tone', [props.tone]),
)

const context: DzListContext = {
  size: toRef(() => resolvedSize.value),
  variant: toRef(() => resolvedVariant.value),
  interactive: toRef(() => props.interactive),
}

provide(DZ_LIST_KEY, context)

const styles = computed(() =>
  listVariants({
    variant: resolvedVariant.value,
    size: resolvedSize.value,
    interactive: props.interactive,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<template>
  <component
    :is="ordered ? 'ol' : 'ul'"
    :id="id"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :aria-busy="loading || undefined"
    :data-state="loading ? 'loading' : 'ready'"
    :data-loading="loading ? '' : undefined"
    :data-tone="resolvedTone"
    role="list"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <slot />
    <slot v-if="!$slots.default" name="empty" />
  </component>
</template>
