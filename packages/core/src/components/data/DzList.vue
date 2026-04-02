<script setup lang="ts">
import type { DzListContext, DzListEmits, DzListProps, DzListSlots } from './DzList.types.ts'
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
import { cn } from '../../utilities/cn.ts'
import { DZ_LIST_KEY } from './DzList.types.ts'
import { listVariants } from './DzList.variants.ts'

const props = withDefaults(defineProps<DzListProps>(), {
  variant: 'plain',
  size: 'md',
  tone: undefined,
  ordered: false,
  interactive: false,
  loading: false,
})

const emit = defineEmits<DzListEmits>()
defineSlots<DzListSlots>()

const attrs = useAttrs()

const context: DzListContext = {
  size: toRef(() => props.size),
  variant: toRef(() => props.variant),
  interactive: toRef(() => props.interactive),
}

provide(DZ_LIST_KEY, context)

const styles = computed(() =>
  listVariants({
    variant: props.variant,
    size: props.size,
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

<script lang="ts">
export default {
  inheritAttrs: false,
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
    :data-loading="loading ? '' : undefined"
    :data-tone="tone"
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
