<script setup lang="ts">
import type {
  DzMeterGroupComputedSegment,
  DzMeterGroupProps,
  DzMeterGroupSegment,
  DzMeterGroupSlotProps,
  DzMeterGroupSlots,
} from './DzMeterGroup.types.ts'
/**
 * DzMeterGroup — Segmented proportional meter with legend.
 *
 * Displays multiple proportional values in a single bar (storage by type,
 * budget allocation, token usage by model) with an optional legend that ties
 * each color to its label for non-color-only meaning.
 *
 * @example
 * ```vue
 * <DzMeterGroup
 *   :values="[
 *     { label: 'Images', value: 30, tone: 'primary' },
 *     { label: 'Docs', value: 20, tone: 'info' },
 *     { label: 'Free', value: 50, tone: 'neutral' },
 *   ]"
 * />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { meterGroupPalette, meterGroupToneColors } from './DzMeterGroup.tokens.ts'
import {
  meterGroupLegendItemVariants,
  meterGroupLegendSwatchVariants,
  meterGroupLegendVariants,
  meterGroupRootVariants,
  meterGroupSegmentVariants,
  meterGroupTrackVariants,
} from './DzMeterGroup.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzMeterGroupProps>(), {
  values: () => [],
  orientation: 'horizontal',
  size: 'md',
  showLegend: true,
})

defineSlots<DzMeterGroupSlots>()

const attrs = useAttrs()

/** Sum of all (non-negative) segment values */
const total = computed(() =>
  props.values.reduce((sum, s) => sum + Math.max(s.value, 0), 0),
)

/** Effective maximum: explicit `max` (when > 0) or the summed total */
const effectiveMax = computed(() => {
  if (props.max != null && props.max > 0)
    return props.max
  return total.value > 0 ? total.value : 1
})

/** Resolve a segment's fill color: explicit color > tone > cycling palette */
function resolveColor(segment: DzMeterGroupSegment, index: number): string {
  const fallback = meterGroupPalette[index % meterGroupPalette.length] ?? 'var(--dz-primary)'
  if (segment.color)
    return segment.color
  if (segment.tone)
    return meterGroupToneColors[segment.tone] ?? fallback
  return fallback
}

/** Segments enriched with computed proportion + resolved color */
const computedSegments = computed<DzMeterGroupComputedSegment[]>(() =>
  props.values.map((segment, index) => {
    const value = Math.max(segment.value, 0)
    const percentage = Math.round((value / effectiveMax.value) * 100)
    return {
      ...segment,
      value,
      percentage,
      resolvedColor: resolveColor(segment, index),
    }
  }),
)

/** Combined fill percentage across all segments (clamped to 100) */
const filledPercentage = computed(() =>
  Math.min(Math.round((total.value / effectiveMax.value) * 100), 100),
)

/** Shared slot props */
const slotProps = computed<DzMeterGroupSlotProps>(() => ({
  segments: computedSegments.value,
  total: total.value,
  max: effectiveMax.value,
  percentage: filledPercentage.value,
}))

/** Root classes (merge consumer class) */
const rootClasses = computed(() =>
  cn(meterGroupRootVariants(), attrs.class as string | undefined),
)

/** Track classes */
const trackClasses = computed(() =>
  meterGroupTrackVariants({ orientation: props.orientation, size: props.size }),
)

/** Inline sizing for a segment along the main axis */
function segmentStyle(segment: DzMeterGroupComputedSegment) {
  const dimension = props.orientation === 'horizontal' ? 'width' : 'height'
  return {
    [dimension]: `${segment.percentage}%`,
    backgroundColor: segment.resolvedColor,
  }
}
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    role="group"
    :aria-label="ariaLabel ?? 'Meter group'"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-orientation="orientation"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Label -->
    <div v-if="$slots.label">
      <slot name="label" v-bind="slotProps" />
    </div>

    <!-- Start content -->
    <slot name="start" v-bind="slotProps" />

    <!-- Track -->
    <div :class="trackClasses">
      <div
        v-for="(segment, index) in computedSegments"
        :key="`${segment.label}-${index}`"
        :class="meterGroupSegmentVariants()"
        :style="segmentStyle(segment)"
        role="meter"
        :aria-label="segment.label"
        :aria-valuenow="segment.value"
        aria-valuemin="0"
        :aria-valuemax="effectiveMax"
        :data-segment-label="segment.label"
      />
    </div>

    <!-- End content -->
    <slot name="end" v-bind="slotProps" />

    <!-- Legend -->
    <template v-if="showLegend">
      <slot name="legend" v-bind="slotProps">
        <ul :class="meterGroupLegendVariants()">
          <li
            v-for="(segment, index) in computedSegments"
            :key="`legend-${segment.label}-${index}`"
            :class="meterGroupLegendItemVariants()"
          >
            <span
              :class="meterGroupLegendSwatchVariants()"
              :style="{ backgroundColor: segment.resolvedColor }"
              aria-hidden="true"
            />
            <span>{{ segment.label }}</span>
            <span class="text-[var(--dz-muted-foreground)]">{{ segment.value }}</span>
          </li>
        </ul>
      </slot>
    </template>
  </div>
</template>
