<script setup lang="ts">
// TODO: implement GovernanceBadge — displays the coordinator pattern
// governing a team run (supervisor / contract_net / blackboard /
// peer_to_peer / council) with an icon and accessible tooltip.
//
// TODO (Contract Spec v1): add GovernanceBadge.types.ts,
// GovernanceBadge.tokens.ts, GovernanceBadge.variants.ts,
// GovernanceBadge.contract.spec.ts, GovernanceBadge.spec.ts and a
// corresponding contracts entry before graduating this from a stub.
//
// NOTE: the prop type mirrors `CoordinatorPattern` from
// `@datazup/dzupagent-orchestration-kit`. Kept as a local string union
// here to avoid pulling a server-only dep into @dzup-ui/core.

type CoordinatorPattern =
  | 'supervisor'
  | 'contract_net'
  | 'blackboard'
  | 'peer_to_peer'
  | 'council'

defineProps<{
  /** Coordinator pattern governing the team run. */
  pattern: CoordinatorPattern
}>()
</script>

<template>
  <span class="governance-badge" data-stub="GovernanceBadge">
    <slot />
  </span>
</template>
