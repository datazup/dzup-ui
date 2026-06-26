<script setup lang="ts">
import type { TeamMemberBadgeProps, TeamMemberBadgeSlots } from './TeamMemberBadge.types.ts'
/**
 * TeamMemberBadge — Team participant status pill.
 *
 * Renders a colored dot + role label for a team member with a live status.
 * The dot color is derived from the status via design token CSS variables.
 *
 * @example
 * ```vue
 * <TeamMemberBadge participantId="p-123" role="planner" status="active" />
 * <TeamMemberBadge participantId="p-456" role="executor" status="failed" size="sm" />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { TEAM_MEMBER_STATUS_TOKENS } from './TeamMemberBadge.tokens.ts'
import { teamMemberBadgeVariants } from './TeamMemberBadge.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TeamMemberBadgeProps>(), {
  size: 'md',
})

defineSlots<TeamMemberBadgeSlots>()

const attrs = useAttrs()

/** CSS var token for current status dot color */
const dotColor = computed(() => TEAM_MEMBER_STATUS_TOKENS[props.status])

/** Inline style for the status dot element */
const dotStyle = computed(() => ({
  backgroundColor: dotColor.value,
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: '50%',
  flexShrink: '0',
}))

const rootClass = computed(() =>
  cn(teamMemberBadgeVariants({ size: props.size }), attrs.class as string | undefined),
)
</script>

<template>
  <span
    :class="rootClass"
    :data-status="status"
    :data-participant-id="participantId"
    role="status"
    :aria-label="`${role} – ${status}`"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <span :style="dotStyle" />
    <slot :role="role" :status="status">{{ role }}</slot>
  </span>
</template>
