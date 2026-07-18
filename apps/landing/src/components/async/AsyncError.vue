<script setup lang="ts">
import { DzAlert, DzButton } from '@dzup-ui/core'

/**
 * AsyncError — the shared `errorComponent` for every lazily-loaded block and
 * template (see `src/lib/lazyComponent.ts`, TASK-FREE-09). Rendered when a
 * chunk fails to load — most commonly a stale chunk URL mid-deploy or a
 * dropped connection — instead of the silent blank space
 * `defineAsyncComponent` leaves by default.
 *
 * Retry is a full reload: `defineAsyncComponent` does not expose its internal
 * retry to the error component, and after a deploy the chunk manifest itself
 * is stale, so a fresh document load is the fix that actually works.
 */
defineProps<{
  /** The load failure, passed through by `defineAsyncComponent`. */
  error?: Error
}>()

function reload(): void {
  window.location.reload()
}
</script>

<template>
  <DzAlert variant="subtle" tone="danger" title="This section failed to load">
    <p class="async-error-body">
      The network request for this content did not complete — this can happen on a
      flaky connection or right after the site is updated. Reloading usually fixes it.
    </p>
    <DzButton variant="outline" tone="danger" size="sm" @click="reload">
      Reload page
    </DzButton>
  </DzAlert>
</template>

<style scoped>
.async-error-body {
  margin: 0 0 12px;
}
</style>
