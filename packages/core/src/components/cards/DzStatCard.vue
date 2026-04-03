<script setup lang="ts">
import type { DzStatCardProps, DzStatCardSlots } from './DzStatCard.types.ts'
/**
 * DzStatCard — Statistics display card.
 *
 * Presents a key metric with an icon, value, trend indicator,
 * and description text.
 *
 * @example
 * ```vue
 * <DzStatCard
 *   title="Revenue"
 *   value="$12,450"
 *   trend="up"
 *   trend-value="+12.5%"
 *   description="vs. last month"
 *   :icon="DollarSignIcon"
 * />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { statCardVariants } from './DzStatCard.variants.ts'

const props = withDefaults(defineProps<DzStatCardProps>(), {
  variant: 'elevated',
})

defineSlots<DzStatCardSlots>()

const attrs = useAttrs()
const styles = computed(() =>
  statCardVariants({
    variant: props.variant,
    trendDirection: props.trend ?? undefined,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    data-state="ready"
    :data-variant="variant"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Header: title + icon -->
    <div :class="styles.header()">
      <span :class="styles.title()">{{ title }}</span>
      <slot name="icon">
        <component
          :is="icon"
          v-if="icon"
          class="h-5 w-5"
          :class="styles.icon()"
          aria-hidden="true"
        />
      </slot>
    </div>

    <!-- Value -->
    <div :class="styles.value()">
      <slot name="value">
        {{ value }}
      </slot>
    </div>

    <!-- Trend + description -->
    <div v-if="trendValue || description" :class="styles.description()">
      <slot name="footer">
        <span v-if="trendValue" :class="styles.trend()">
          <!-- Trend arrow -->
          <svg
            v-if="trend === 'up'"
            class="h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          <svg
            v-else-if="trend === 'down'"
            class="h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
          </svg>
          {{ trendValue }}
        </span>
        <span v-if="description"> {{ description }}</span>
      </slot>
    </div>
  </div>
</template>
