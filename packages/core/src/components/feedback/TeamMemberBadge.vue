<script setup lang="ts">
// TODO: implement TeamMemberBadge — small status pill rendering a team
// participant's role + live status (idle/active/completed/failed) with
// a colored dot derived from design tokens.
//
// TODO (Contract Spec v1): add TeamMemberBadge.types.ts,
// TeamMemberBadge.tokens.ts, TeamMemberBadge.variants.ts,
// TeamMemberBadge.contract.spec.ts, TeamMemberBadge.spec.ts and a
// corresponding contracts entry before graduating this from a stub.

defineProps<{
  /** Participant ID within the team run (not the team-definition ID). */
  participantId: string
  /** Participant role label (e.g. "planner", "executor"). */
  role: string
  /** Live participant status from the team runtime. */
  status: 'idle' | 'active' | 'completed' | 'failed'
}>()
</script>

<template>
  <span class="team-member-badge" data-stub="TeamMemberBadge">
    <slot />
  </span>
</template>
