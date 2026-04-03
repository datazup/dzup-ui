<script setup lang="ts">
import type { TooltipAlign, TooltipSide } from '@dzup-ui/core'
import {
  DzTooltip,
  DzTooltipContent,
  DzTooltipTrigger,
} from '@dzup-ui/core'
/**
 * DzTooltipCompat — backward-compatible wrapper for DzTooltip compound.
 *
 * Maps old dzup-ui single-component tooltip API to the new vNext compound API:
 * - `content` prop → DzTooltipContent slot content
 * - `placement` → maps to `side` + `align` props on DzTooltipContent
 * - `delay` / `showDelay` → maps to `delayDuration` on DzTooltip root
 * - `trigger` prop ("hover" | "click" | "focus") → dropped (vNext uses hover by default)
 * - `disabled` → controls whether tooltip renders
 * - Default slot → wraps DzTooltipTrigger
 *
 * @deprecated Use DzTooltip, DzTooltipTrigger, DzTooltipContent from @dzup-ui/core instead.
 */
import { computed, onMounted } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

/** Old placement values */
type OldPlacement
  = | 'top' | 'top-start' | 'top-end'
    | 'bottom' | 'bottom-start' | 'bottom-end'
    | 'left' | 'left-start' | 'left-end'
    | 'right' | 'right-start' | 'right-end'

/** Old trigger type */
type OldTriggerType = 'hover' | 'click' | 'focus'

interface DzTooltipCompatProps {
  /** Tooltip content text */
  content?: string
  /** Placement — maps to side + align in vNext */
  placement?: OldPlacement
  /** Whether the tooltip is disabled */
  disabled?: boolean
  /** Delay before showing (ms) — maps to delayDuration */
  delay?: number
  /** Alias for delay (old API used both) */
  showDelay?: number
  /** Trigger mode — dropped in vNext (hover by default) */
  trigger?: OldTriggerType
}

const props = withDefaults(defineProps<DzTooltipCompatProps>(), {
  placement: 'top',
  disabled: false,
  delay: 200,
})

onMounted(() => {
  warnDeprecated('DzTooltipCompat', 'DzTooltip')

  if (import.meta.env?.DEV && props.trigger) {
    console.warn(
      '[dzup-ui/compat] DzTooltipCompat: "trigger" prop is dropped in vNext. Tooltips use hover by default.',
    )
  }
})

/** Map old placement to side */
const mappedSide = computed<TooltipSide>(() => {
  const placementSideMap: Record<OldPlacement, TooltipSide> = {
    'top': 'top',
    'top-start': 'top',
    'top-end': 'top',
    'bottom': 'bottom',
    'bottom-start': 'bottom',
    'bottom-end': 'bottom',
    'left': 'left',
    'left-start': 'left',
    'left-end': 'left',
    'right': 'right',
    'right-start': 'right',
    'right-end': 'right',
  }
  return placementSideMap[props.placement ?? 'top']
})

/** Map old placement to align */
const mappedAlign = computed<TooltipAlign>(() => {
  const placement = props.placement ?? 'top'
  if (placement.endsWith('-start'))
    return 'start'
  if (placement.endsWith('-end'))
    return 'end'
  return 'center'
})

/** Resolve delay from either delay or showDelay prop */
const mappedDelay = computed<number>(() => {
  return props.showDelay ?? props.delay ?? 200
})
</script>

<template>
  <template v-if="!disabled">
    <DzTooltip :delay-duration="mappedDelay">
      <DzTooltipTrigger>
        <slot />
      </DzTooltipTrigger>
      <DzTooltipContent
        :side="mappedSide"
        :align="mappedAlign"
      >
        <slot name="content">
          {{ content }}
        </slot>
      </DzTooltipContent>
    </DzTooltip>
  </template>
  <template v-else>
    <slot />
  </template>
</template>
