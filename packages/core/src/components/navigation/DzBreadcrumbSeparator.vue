<script setup lang="ts">
import type { DzBreadcrumbSeparatorProps, DzBreadcrumbSeparatorSlots } from './DzBreadcrumb.types.ts'
/**
 * DzBreadcrumbSeparator — Visual separator between breadcrumb items.
 *
 * Defaults to the separator from parent DzBreadcrumb context (ADR-08),
 * but can be overridden via the `separator` prop or the default slot.
 *
 * @example
 * ```vue
 * <DzBreadcrumbSeparator />
 * <DzBreadcrumbSeparator separator=">" />
 * <DzBreadcrumbSeparator>
 *   <ChevronRight />
 * </DzBreadcrumbSeparator>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_BREADCRUMB_KEY } from './DzBreadcrumb.types.ts'
import { breadcrumbVariants } from './DzBreadcrumb.variants.ts'

const props = withDefaults(defineProps<DzBreadcrumbSeparatorProps>(), {
  separator: undefined,
})

defineSlots<DzBreadcrumbSeparatorSlots>()

const attrs = useAttrs()
const breadcrumbContext = inject(DZ_BREADCRUMB_KEY, null)
const styles = breadcrumbVariants()

const resolvedSeparator = computed(
  () => props.separator ?? breadcrumbContext?.separator.value ?? '/',
)

const classes = computed(() =>
  cn(styles.separator(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <li
    role="presentation"
    aria-hidden="true"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot>{{ resolvedSeparator }}</slot>
  </li>
</template>
