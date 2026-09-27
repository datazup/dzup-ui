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
import { useDzUrlGuard } from '../../composables/provider/useDzUrlPolicy.ts'
import { cn } from '../../utilities/cn.ts'
import { breadcrumbVariants } from './DzBreadcrumb.variants.ts'

defineOptions({
  inheritAttrs: false,
})

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
  return cn(base, disabled, attrs.class as string | undefined, props.ui?.['item-label'])
})

/**
 * The URL policy (ADR-20 §12, TASK-R2-O4).
 *
 * `DzBreadcrumb` declares the `url` boundary and has no sink of its own — this
 * sub-part carries the `href` (finding U4). The guard is named for the file a
 * reader would open, not for the declarer.
 */
const guardUrl = useDzUrlGuard('DzBreadcrumbItem')
const urlDecision = computed(() => guardUrl(props.href))

/**
 * A refused URL falls into the existing non-link branch — the `<span
 * role="link">` this component already renders for the current page and for a
 * disabled crumb. The trail keeps its shape and the label stays readable; what
 * disappears is the navigation.
 */
const isLink = computed(() =>
  urlDecision.value.href !== undefined && !props.current && !props.disabled,
)
</script>

<template>
  <li data-part="item" :class="cn(styles.item(), ui?.item)">
    <a
      v-if="isLink"
      :href="urlDecision.href"
      data-part="item-label"
      :class="linkClasses"
      v-bind="{ ...$attrs, class: undefined }"
    >
      <slot />
    </a>
    <span
      v-else
      data-part="item-label"
      role="link"
      :aria-current="current ? 'page' : undefined"
      :aria-disabled="disabled || undefined"
      :class="linkClasses"
      :data-state="urlDecision.rejected ? 'url-rejected' : undefined"
      :data-disabled="disabled ? '' : undefined"
      v-bind="{ ...$attrs, class: undefined }"
    >
      <slot />
    </span>
  </li>
</template>
