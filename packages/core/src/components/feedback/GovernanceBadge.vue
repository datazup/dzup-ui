<script setup lang="ts">
import type {
  CoordinatorPattern,
  GovernanceBadgeProps,
  GovernanceBadgeSlots,
} from './GovernanceBadge.types.ts'
/**
 * GovernanceBadge — Coordinator pattern pill for team runs.
 *
 * Displays the coordinator pattern governing a team run
 * (supervisor / contract_net / blackboard / peer_to_peer / council)
 * with a pattern-specific color token and accessible label.
 *
 * @example
 * ```vue
 * <GovernanceBadge pattern="supervisor" />
 * <GovernanceBadge pattern="contract_net" size="sm" variant="outline" />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { GOVERNANCE_PATTERN_TOKENS } from './GovernanceBadge.tokens.ts'
import { governanceBadgeVariants } from './GovernanceBadge.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<GovernanceBadgeProps>(), {
  size: 'md',
  variant: 'solid',
})

defineSlots<GovernanceBadgeSlots>()

const attrs = useAttrs()

/** Human-readable labels (Title Case) */
const PATTERN_LABEL_MAP: Readonly<Record<CoordinatorPattern, string>> = Object.freeze({
  supervisor: 'Supervisor',
  contract_net: 'Contract Net',
  blackboard: 'Blackboard',
  peer_to_peer: 'Peer to Peer',
  council: 'Council',
})

const patternLabel = computed(() => PATTERN_LABEL_MAP[props.pattern])
const patternToken = computed(() => GOVERNANCE_PATTERN_TOKENS[props.pattern])

/** Inline style applies the pattern CSS var as background/border color */
const patternStyle = computed(() => ({
  backgroundColor: patternToken.value,
  color: 'var(--dz-primary-foreground)',
  borderColor: patternToken.value,
}))

const classes = computed(() =>
  cn(
    governanceBadgeVariants({ variant: props.variant, size: props.size }),
    attrs.class as string | undefined,
  ),
)
</script>

<template>
  <span
    :class="classes"
    :style="patternStyle"
    :data-pattern="pattern"
    role="img"
    :aria-label="`Coordinator pattern: ${patternLabel}`"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot :pattern="pattern" :label="patternLabel">
      {{ patternLabel }}
    </slot>
  </span>
</template>
