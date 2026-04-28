<script setup lang="ts">
import type {
  DzRunStatus,
  DzRunStatusBadgeProps,
  DzRunStatusBadgeSlots,
} from './DzRunStatusBadge.types.ts'
/**
 * DzRunStatusBadge — Run-status pill.
 *
 * Wraps DzBadge and maps a canonical run status
 * (PENDING | RUNNING | PAUSED | COMPLETED | FAILED | CANCELLED)
 * to a status CSS variable + accessible label.
 *
 * @example
 * ```vue
 * <DzRunStatusBadge :status="run.status" />
 * <DzRunStatusBadge status="RUNNING" size="sm" />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import DzBadge from './DzBadge.vue'

const props = withDefaults(defineProps<DzRunStatusBadgeProps>(), {
  size: 'md',
})

defineSlots<DzRunStatusBadgeSlots>()

const attrs = useAttrs()

/** Map a run status to its status CSS var (see tokens/semantic/{light,dark}.ts) */
const STATUS_VAR_MAP: Readonly<Record<DzRunStatus, string>> = Object.freeze({
  PENDING: 'var(--dz-status-pending)',
  RUNNING: 'var(--dz-status-running)',
  PAUSED: 'var(--dz-status-paused)',
  COMPLETED: 'var(--dz-status-completed)',
  FAILED: 'var(--dz-status-failed)',
  CANCELLED: 'var(--dz-status-cancelled)',
})

/** Human-readable labels (Title Case) */
const STATUS_LABEL_MAP: Readonly<Record<DzRunStatus, string>> = Object.freeze({
  PENDING: 'Pending',
  RUNNING: 'Running',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
})

const statusColor = computed(() => STATUS_VAR_MAP[props.status])
const statusLabel = computed(() => STATUS_LABEL_MAP[props.status])

/** Inline style applies the status CSS var as background/border color */
const statusStyle = computed(() => ({
  backgroundColor: statusColor.value,
  color: 'var(--dz-primary-foreground)',
  borderColor: statusColor.value,
}))

const consumerClass = computed(() => cn(attrs.class as string | undefined))
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DzBadge
    :size="size"
    variant="solid"
    :class="consumerClass"
    :style="statusStyle"
    :data-status="status"
    role="status"
    :aria-label="`Run status: ${statusLabel}`"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot :status="status" :label="statusLabel">
      {{ statusLabel }}
    </slot>
  </DzBadge>
</template>
