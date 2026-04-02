<script setup lang="ts">
import type { DzBreadcrumbContext, DzBreadcrumbProps, DzBreadcrumbSlots } from './DzBreadcrumb.types.ts'
/**
 * DzBreadcrumb — Accessible breadcrumb navigation wrapper.
 *
 * Built from scratch (not a Reka UI component).
 * Renders a <nav> with aria-label and ordered list semantics.
 * Provides separator context to children (ADR-08).
 *
 * @example
 * ```vue
 * <DzBreadcrumb>
 *   <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
 *   <DzBreadcrumbSeparator />
 *   <DzBreadcrumbItem href="/products">Products</DzBreadcrumbItem>
 *   <DzBreadcrumbSeparator />
 *   <DzBreadcrumbItem current>Widget</DzBreadcrumbItem>
 * </DzBreadcrumb>
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_BREADCRUMB_KEY } from './DzBreadcrumb.types.ts'
import { breadcrumbVariants } from './DzBreadcrumb.variants.ts'

const props = withDefaults(defineProps<DzBreadcrumbProps>(), {
  separator: '/',
  id: undefined,
  ariaLabel: 'Breadcrumb',
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

defineSlots<DzBreadcrumbSlots>()

const attrs = useAttrs()
const styles = breadcrumbVariants()

const context: DzBreadcrumbContext = {
  separator: toRef(() => props.separator),
}

provide(DZ_BREADCRUMB_KEY, context)

const navClasses = computed(() =>
  cn(styles.nav(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <nav
    :id="id"
    :class="navClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <ol :class="styles.list()">
      <slot />
    </ol>
  </nav>
</template>
