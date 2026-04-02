<script setup lang="ts">
import type { DzBreadcrumbItemProps, DzBreadcrumbItemSlots } from './DzBreadcrumb.types.ts'
/**
 * DzBreadcrumbItem — Individual breadcrumb entry.
 *
 * Renders as an anchor link when `href` is provided, or a span otherwise.
 * Marks current page with aria-current="page".
 *
 * @example
 * ```vue
 * <DzBreadcrumbItem href="/products">Products</DzBreadcrumbItem>
 * <DzBreadcrumbItem current>Current Page</DzBreadcrumbItem>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { breadcrumbVariants } from './DzBreadcrumb.variants.ts'

const props = withDefaults(defineProps<DzBreadcrumbItemProps>(), {
  href: undefined,
  current: false,
  disabled: false,
})

defineSlots<DzBreadcrumbItemSlots>()

const attrs = useAttrs()
const styles = breadcrumbVariants()

const linkClasses = computed(() => {
  const base = props.current ? styles.currentPage() : styles.link()
  const disabled = props.disabled ? styles.disabledLink() : ''
  return cn(base, disabled, attrs.class as string | undefined)
})

const isLink = computed(() => !!props.href && !props.current && !props.disabled)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <li :class="styles.item()">
    <a
      v-if="isLink"
      :href="href"
      :class="linkClasses"
      v-bind="{ ...$attrs, class: undefined }"
    >
      <slot />
    </a>
    <span
      v-else
      role="link"
      :aria-current="current ? 'page' : undefined"
      :aria-disabled="disabled || undefined"
      :class="linkClasses"
      :data-disabled="disabled ? '' : undefined"
      v-bind="{ ...$attrs, class: undefined }"
    >
      <slot />
    </span>
  </li>
</template>
